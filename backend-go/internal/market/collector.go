package market

import (
	"fmt"
	"log"
	"sync"
	"time"
)

// DataCollector collects market data from various sources
type DataCollector struct {
	binanceClient *BinanceClient
	binanceWS     *BinanceWebSocket
	data          map[string]interface{}
	priceData     map[string]float64
	volumeData    map[string]float64
	mu            sync.RWMutex
	symbols       []string
}

var collector *DataCollector
var once sync.Once

// GetCollector returns the singleton collector instance
func GetCollector() *DataCollector {
	once.Do(func() {
		symbols := []string{"BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "ADAUSDT"}
		collector = &DataCollector{
			binanceClient: NewBinanceClient(),
			binanceWS:     NewBinanceWebSocket(symbols),
			data:          make(map[string]interface{}),
			priceData:     make(map[string]float64),
			volumeData:    make(map[string]float64),
			symbols:       symbols,
		}
	})
	return collector
}

// StartCollecting starts collecting market data
func (c *DataCollector) StartCollecting() {
	// WebSocket 연결 시작
	go c.startWebSocket()

	// REST API 폴백 (WebSocket이 실패할 경우를 대비)
	go func() {
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			// Collect data from Binance REST API
			c.collectBinanceData()
		}
	}()
}

// startWebSocket WebSocket 연결 및 이벤트 처리
func (c *DataCollector) startWebSocket() {
	// WebSocket 콜백 등록
	c.binanceWS.OnTicker(func(data interface{}) {
		if ticker, ok := data.(TickerStream); ok {
			c.mu.Lock()
			c.priceData[ticker.Symbol] = parseFloat(ticker.Price)
			c.volumeData[ticker.Symbol] = parseFloat(ticker.Volume)
			c.mu.Unlock()

			log.Printf("WebSocket Price Update - %s: %s", ticker.Symbol, ticker.Price)
		}
	})

	// WebSocket 연결
	if err := c.binanceWS.Connect(); err != nil {
		log.Printf("Failed to connect WebSocket: %v", err)
	}
}

func (c *DataCollector) collectBinanceData() {
	for _, symbol := range c.symbols {
		price, err := c.binanceClient.GetCurrentPrice(symbol)
		if err == nil {
			c.mu.Lock()
			c.data[symbol] = price
			if price != nil {
				c.priceData[symbol] = price.Price
			}
			c.mu.Unlock()
		}
	}
}

// GetLatestData returns the latest collected data
func (c *DataCollector) GetLatestData(symbol string) interface{} {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.data[symbol]
}

// GetLatestPrice 최신 가격 조회
func (c *DataCollector) GetLatestPrice(symbol string) float64 {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.priceData[symbol]
}

// GetLatestVolume 최신 거래량 조회
func (c *DataCollector) GetLatestVolume(symbol string) float64 {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.volumeData[symbol]
}

// GetAllPrices 모든 심볼의 가격 조회
func (c *DataCollector) GetAllPrices() map[string]float64 {
	c.mu.RLock()
	defer c.mu.RUnlock()

	prices := make(map[string]float64)
	for k, v := range c.priceData {
		prices[k] = v
	}
	return prices
}

// parseFloat 문자열을 float64로 변환
func parseFloat(s string) float64 {
	var f float64
	fmt.Sscanf(s, "%f", &f)
	return f
}