package common

import (
    "context"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
    "time"
    "github.com/go-redis/redis/v8"
    "log"
)

// DataCollector handles real-time data collection from various sources
type DataCollector struct {
    redisClient *redis.Client
    httpClient  *http.Client
    ctx         context.Context
}

// NewDataCollector creates a new data collector instance
func NewDataCollector(redisAddr string) *DataCollector {
    rdb := redis.NewClient(&redis.Options{
        Addr: redisAddr,
    })
    
    return &DataCollector{
        redisClient: rdb,
        httpClient: &http.Client{
            Timeout: 10 * time.Second,
        },
        ctx: context.Background(),
    }
}

// GetHistoricalData fetches historical kline data from Binance
func (dc *DataCollector) GetHistoricalData(symbol string, interval string, limit int) ([]MarketData, error) {
    url := fmt.Sprintf("https://api.binance.com/api/v3/klines?symbol=%s&interval=%s&limit=%d", 
        symbol, interval, limit)
    
    resp, err := dc.httpClient.Get(url)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("API error: %d", resp.StatusCode)
    }
    
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }
    
    var klines [][]interface{}
    if err := json.Unmarshal(body, &klines); err != nil {
        return nil, err
    }
    
    marketData := make([]MarketData, len(klines))
    for i, kline := range klines {
        // Kline format: [openTime, open, high, low, close, volume, closeTime, ...]
        openTime := int64(kline[0].(float64))
        open := parseFloat(kline[1].(string))
        high := parseFloat(kline[2].(string))
        low := parseFloat(kline[3].(string))
        close := parseFloat(kline[4].(string))
        volume := parseFloat(kline[5].(string))
        
        marketData[i] = MarketData{
            Symbol:    symbol,
            Open:      open,
            High:      high,
            Low:       low,
            Close:     close,
            Volume:    volume,
            Timestamp: time.Unix(openTime/1000, 0),
        }
    }
    
    return marketData, nil
}

// GetCurrentPrice fetches the current price for a symbol
func (dc *DataCollector) GetCurrentPrice(symbol string) (float64, error) {
    // Check Redis cache first
    cacheKey := fmt.Sprintf("price:%s", symbol)
    cached, err := dc.redisClient.Get(dc.ctx, cacheKey).Result()
    if err == nil {
        return parseFloat(cached), nil
    }
    
    // Fetch from Binance API
    url := fmt.Sprintf("https://api.binance.com/api/v3/ticker/price?symbol=%s", symbol)
    resp, err := dc.httpClient.Get(url)
    if err != nil {
        return 0, err
    }
    defer resp.Body.Close()
    
    var ticker struct {
        Symbol string `json:"symbol"`
        Price  string `json:"price"`
    }
    
    if err := json.NewDecoder(resp.Body).Decode(&ticker); err != nil {
        return 0, err
    }
    
    price := parseFloat(ticker.Price)
    
    // Cache for 5 seconds
    dc.redisClient.Set(dc.ctx, cacheKey, ticker.Price, 5*time.Second)
    
    return price, nil
}

// Get24hrStats fetches 24hr statistics for a symbol
func (dc *DataCollector) Get24hrStats(symbol string) (*CoinInfo, error) {
    url := fmt.Sprintf("https://api.binance.com/api/v3/ticker/24hr?symbol=%s", symbol)
    
    resp, err := dc.httpClient.Get(url)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    var ticker struct {
        Symbol             string `json:"symbol"`
        LastPrice          string `json:"lastPrice"`
        PriceChangePercent string `json:"priceChangePercent"`
        QuoteVolume        string `json:"quoteVolume"`
        Count              int    `json:"count"`
    }
    
    if err := json.NewDecoder(resp.Body).Decode(&ticker); err != nil {
        return nil, err
    }
    
    // Find coin name
    coinName := ""
    for _, coin := range SupportedCoins {
        if coin.Symbol == symbol {
            coinName = coin.Name
            break
        }
    }
    
    return &CoinInfo{
        Symbol:    symbol,
        Name:      coinName,
        Price:     parseFloat(ticker.LastPrice),
        Change24h: parseFloat(ticker.PriceChangePercent),
        Volume24h: parseFloat(ticker.QuoteVolume),
    }, nil
}

// GetFearGreedIndex fetches the Fear & Greed Index
func (dc *DataCollector) GetFearGreedIndex() (float64, string, error) {
    // Check cache first
    cacheKey := "fear_greed_index"
    cached, err := dc.redisClient.Get(dc.ctx, cacheKey).Result()
    if err == nil {
        var data struct {
            Value float64 `json:"value"`
            Text  string  `json:"text"`
        }
        if err := json.Unmarshal([]byte(cached), &data); err == nil {
            return data.Value, data.Text, nil
        }
    }
    
    url := "https://api.alternative.me/fng/?limit=1"
    resp, err := dc.httpClient.Get(url)
    if err != nil {
        return 50, "Neutral", nil // Default value
    }
    defer resp.Body.Close()
    
    var response struct {
        Data []struct {
            Value               string `json:"value"`
            ValueClassification string `json:"value_classification"`
        } `json:"data"`
    }
    
    if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
        return 50, "Neutral", nil
    }
    
    if len(response.Data) == 0 {
        return 50, "Neutral", nil
    }
    
    value := parseFloat(response.Data[0].Value)
    text := response.Data[0].ValueClassification
    
    // Cache for 1 hour
    cacheData, _ := json.Marshal(map[string]interface{}{
        "value": value,
        "text":  text,
    })
    dc.redisClient.Set(dc.ctx, cacheKey, cacheData, time.Hour)
    
    return value, text, nil
}

// StreamPrices streams real-time prices for multiple symbols
func (dc *DataCollector) StreamPrices(symbols []string, callback func(symbol string, price float64)) {
    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()
    
    for range ticker.C {
        for _, symbol := range symbols {
            price, err := dc.GetCurrentPrice(symbol)
            if err != nil {
                log.Printf("Error fetching price for %s: %v", symbol, err)
                continue
            }
            callback(symbol, price)
        }
    }
}

// parseFloat safely parses a string to float64
func parseFloat(s string) float64 {
    var f float64
    fmt.Sscanf(s, "%f", &f)
    return f
}