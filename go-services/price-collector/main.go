package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"
    "github.com/go-redis/redis/v8"
)

var ctx = context.Background()

type BinancePrice struct {
    Symbol string `json:"symbol"`
    Price  string `json:"price"`
}

type PriceService struct {
    redis  *redis.Client
    client *http.Client
}

func NewPriceService() *PriceService {
    rdb := redis.NewClient(&redis.Options{
        Addr: "localhost:6379",
        DB:   0,
    })

    return &PriceService{
        redis: rdb,
        client: &http.Client{
            Timeout: 10 * time.Second,
        },
    }
}

func (ps *PriceService) FetchPrices() error {
    symbols := []string{"BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"}
    
    for _, symbol := range symbols {
        url := fmt.Sprintf("https://api.binance.com/api/v3/ticker/price?symbol=%s", symbol)
        
        resp, err := ps.client.Get(url)
        if err != nil {
            log.Printf("Error fetching %s: %v", symbol, err)
            continue
        }
        defer resp.Body.Close()

        var price BinancePrice
        if err := json.NewDecoder(resp.Body).Decode(&price); err != nil {
            log.Printf("Error decoding %s: %v", symbol, err)
            continue
        }

        // Redis에 저장
        key := fmt.Sprintf("price:%s", symbol)
        ps.redis.Set(ctx, key, price.Price, 5*time.Second)
        
        // 가격 히스토리 저장
        historyKey := fmt.Sprintf("history:%s", symbol)
        ps.redis.LPush(ctx, historyKey, fmt.Sprintf("%s:%d", price.Price, time.Now().Unix()))
        ps.redis.LTrim(ctx, historyKey, 0, 1000) // 최근 1000개만 유지
        
        log.Printf("%s: %s", symbol, price.Price)
    }
    
    return nil
}

func (ps *PriceService) StartCollector() {
    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            go ps.FetchPrices()
        }
    }
}

func main() {
    service := NewPriceService()
    
    // API 서버 시작
    go func() {
        http.HandleFunc("/api/prices", func(w http.ResponseWriter, r *http.Request) {
            symbols := []string{"BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"}
            prices := make(map[string]string)
            
            for _, symbol := range symbols {
                key := fmt.Sprintf("price:%s", symbol)
                price, _ := service.redis.Get(ctx, key).Result()
                prices[symbol] = price
            }
            
            w.Header().Set("Content-Type", "application/json")
            json.NewEncoder(w).Encode(prices)
        })
        
        log.Println("Price API server starting on :8081")
        http.ListenAndServe(":8081", nil)
    }()

    // 가격 수집 시작
    log.Println("Starting price collector...")
    service.StartCollector()
}