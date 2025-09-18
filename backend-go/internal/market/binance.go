package market

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"
)

// BinanceClient Binance API 클라이언트
type BinanceClient struct {
	baseURL string
	client  *http.Client
}

// NewBinanceClient 새 Binance 클라이언트 생성
func NewBinanceClient() *BinanceClient {
	return &BinanceClient{
		baseURL: "https://api.binance.com",
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// Kline 캔들스틱 데이터
type Kline struct {
	OpenTime     int64   `json:"openTime"`
	Open         float64 `json:"open"`
	High         float64 `json:"high"`
	Low          float64 `json:"low"`
	Close        float64 `json:"close"`
	Volume       float64 `json:"volume"`
	CloseTime    int64   `json:"closeTime"`
	QuoteVolume  float64 `json:"quoteAssetVolume"`
	TradeCount   int     `json:"count"`
}

// TickerPrice 현재 가격 정보
type TickerPrice struct {
	Symbol string  `json:"symbol"`
	Price  float64 `json:"price,string"`
}

// Ticker24hr 24시간 통계
type Ticker24hr struct {
	Symbol             string  `json:"symbol"`
	PriceChange        float64 `json:"priceChange,string"`
	PriceChangePercent float64 `json:"priceChangePercent,string"`
	WeightedAvgPrice   float64 `json:"weightedAvgPrice,string"`
	PrevClosePrice     float64 `json:"prevClosePrice,string"`
	LastPrice          float64 `json:"lastPrice,string"`
	BidPrice           float64 `json:"bidPrice,string"`
	AskPrice           float64 `json:"askPrice,string"`
	OpenPrice          float64 `json:"openPrice,string"`
	HighPrice          float64 `json:"highPrice,string"`
	LowPrice           float64 `json:"lowPrice,string"`
	Volume             float64 `json:"volume,string"`
	QuoteVolume        float64 `json:"quoteVolume,string"`
	OpenTime           int64   `json:"openTime"`
	CloseTime          int64   `json:"closeTime"`
	Count              int     `json:"count"`
}

// GetCurrentPrice 현재 가격 조회
func (c *BinanceClient) GetCurrentPrice(symbol string) (*TickerPrice, error) {
	url := fmt.Sprintf("%s/api/v3/ticker/price?symbol=%s", c.baseURL, symbol)

	resp, err := c.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to get price: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	var ticker TickerPrice
	if err := json.NewDecoder(resp.Body).Decode(&ticker); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &ticker, nil
}

// Get24hrTicker 24시간 통계 조회
func (c *BinanceClient) Get24hrTicker(symbol string) (*Ticker24hr, error) {
	url := fmt.Sprintf("%s/api/v3/ticker/24hr?symbol=%s", c.baseURL, symbol)

	resp, err := c.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to get 24hr ticker: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	var ticker Ticker24hr
	if err := json.NewDecoder(resp.Body).Decode(&ticker); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &ticker, nil
}

// GetKlines 캔들스틱 데이터 조회
func (c *BinanceClient) GetKlines(symbol, interval string, limit int) ([]Kline, error) {
	url := fmt.Sprintf("%s/api/v3/klines?symbol=%s&interval=%s&limit=%d",
		c.baseURL, symbol, interval, limit)

	resp, err := c.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to get klines: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}

	var rawKlines [][]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&rawKlines); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	klines := make([]Kline, 0, len(rawKlines))
	for _, raw := range rawKlines {
		if len(raw) < 11 {
			continue
		}

		kline := Kline{
			OpenTime:    int64(raw[0].(float64)),
			CloseTime:   int64(raw[6].(float64)),
			TradeCount:  int(raw[8].(float64)),
		}

		// Parse string values to float64
		if open, err := strconv.ParseFloat(raw[1].(string), 64); err == nil {
			kline.Open = open
		}
		if high, err := strconv.ParseFloat(raw[2].(string), 64); err == nil {
			kline.High = high
		}
		if low, err := strconv.ParseFloat(raw[3].(string), 64); err == nil {
			kline.Low = low
		}
		if close, err := strconv.ParseFloat(raw[4].(string), 64); err == nil {
			kline.Close = close
		}
		if volume, err := strconv.ParseFloat(raw[5].(string), 64); err == nil {
			kline.Volume = volume
		}
		if quoteVolume, err := strconv.ParseFloat(raw[7].(string), 64); err == nil {
			kline.QuoteVolume = quoteVolume
		}

		klines = append(klines, kline)
	}

	return klines, nil
}

// GetOrderBook 오더북 조회
func (c *BinanceClient) GetOrderBook(symbol string, limit int) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/api/v3/depth?symbol=%s&limit=%d", c.baseURL, symbol, limit)

	resp, err := c.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to get order book: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	var orderBook map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&orderBook); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return orderBook, nil
}

// GetRecentTrades 최근 거래 내역 조회
func (c *BinanceClient) GetRecentTrades(symbol string, limit int) ([]map[string]interface{}, error) {
	url := fmt.Sprintf("%s/api/v3/trades?symbol=%s&limit=%d", c.baseURL, symbol, limit)

	resp, err := c.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent trades: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	var trades []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&trades); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return trades, nil
}