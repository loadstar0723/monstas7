package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"time"

	"github.com/gorilla/websocket"
)

const (
	BinanceStreamURL = "wss://stream.binance.com:9443"
	BinanceStreamUS  = "wss://stream.binance.us:9443"
)

// BinanceStreamManager manages real-time data streams from Binance
type BinanceStreamManager struct {
	conn         *websocket.Conn
	hub          *Hub
	symbols      []string
	reconnecting bool
	pingTicker   *time.Ticker
}

// BinanceTickerData represents real-time ticker data
type BinanceTickerData struct {
	EventType    string  `json:"e"`
	EventTime    int64   `json:"E"`
	Symbol       string  `json:"s"`
	Price        string  `json:"c"`
	PriceChange  string  `json:"p"`
	PercentChange string `json:"P"`
	Volume       string  `json:"v"`
	QuoteVolume  string  `json:"q"`
	OpenPrice    string  `json:"o"`
	HighPrice    string  `json:"h"`
	LowPrice     string  `json:"l"`
	OpenTime     int64   `json:"O"`
	CloseTime    int64   `json:"C"`
	FirstTradeID int64   `json:"F"`
	LastTradeID  int64   `json:"L"`
	TradeCount   int     `json:"n"`
}

// BinanceKlineData represents kline/candlestick data
type BinanceKlineData struct {
	EventType string `json:"e"`
	EventTime int64  `json:"E"`
	Symbol    string `json:"s"`
	Kline     struct {
		StartTime            int64  `json:"t"`
		CloseTime            int64  `json:"T"`
		Symbol               string `json:"s"`
		Interval             string `json:"i"`
		FirstTradeID         int64  `json:"f"`
		LastTradeID          int64  `json:"L"`
		OpenPrice            string `json:"o"`
		ClosePrice           string `json:"c"`
		HighPrice            string `json:"h"`
		LowPrice             string `json:"l"`
		BaseVolume           string `json:"v"`
		TradeCount           int    `json:"n"`
		IsClosed             bool   `json:"x"`
		QuoteVolume          string `json:"q"`
		TakerBuyBaseVolume   string `json:"V"`
		TakerBuyQuoteVolume  string `json:"Q"`
		IgnoreField          string `json:"B"`
	} `json:"k"`
}

// NewBinanceStreamManager creates a new Binance stream manager
func NewBinanceStreamManager(hub *Hub) *BinanceStreamManager {
	return &BinanceStreamManager{
		hub:     hub,
		symbols: []string{"btcusdt", "ethusdt", "bnbusdt", "solusdt"},
	}
}

// Connect establishes connection to Binance WebSocket
func (bsm *BinanceStreamManager) Connect() error {
	// Build stream URL with multiple streams
	streams := []string{}
	for _, symbol := range bsm.symbols {
		// Add ticker stream
		streams = append(streams, fmt.Sprintf("%s@ticker", symbol))
		// Add kline stream (1m interval)
		streams = append(streams, fmt.Sprintf("%s@kline_1m", symbol))
		// Add trade stream
		streams = append(streams, fmt.Sprintf("%s@trade", symbol))
	}

	// Create combined stream URL
	streamPath := fmt.Sprintf("/ws/%s", streams[0])
	for i := 1; i < len(streams); i++ {
		streamPath += "/" + streams[i]
	}

	u, err := url.Parse(BinanceStreamURL + streamPath)
	if err != nil {
		return err
	}

	// Connect to WebSocket
	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		return err
	}

	bsm.conn = conn
	log.Printf("Connected to Binance WebSocket: %s", u.String())

	// Start ping/pong to keep connection alive
	bsm.startPing()

	// Start reading messages
	go bsm.readMessages()

	return nil
}

// readMessages reads and processes incoming messages
func (bsm *BinanceStreamManager) readMessages() {
	defer func() {
		bsm.conn.Close()
		bsm.stopPing()
		if !bsm.reconnecting {
			bsm.reconnect()
		}
	}()

	for {
		_, message, err := bsm.conn.ReadMessage()
		if err != nil {
			log.Printf("Binance WebSocket read error: %v", err)
			break
		}

		// Parse message
		var data map[string]interface{}
		if err := json.Unmarshal(message, &data); err != nil {
			log.Printf("JSON unmarshal error: %v", err)
			continue
		}

		// Determine message type and process
		if eventType, ok := data["e"].(string); ok {
			switch eventType {
			case "24hrTicker":
				bsm.processTicker(message)
			case "kline":
				bsm.processKline(message)
			case "trade":
				bsm.processTrade(message)
			default:
				// Forward raw message to hub
				bsm.forwardToHub(data)
			}
		}
	}
}

// processTicker processes ticker data
func (bsm *BinanceStreamManager) processTicker(message []byte) {
	var ticker BinanceTickerData
	if err := json.Unmarshal(message, &ticker); err != nil {
		log.Printf("Ticker unmarshal error: %v", err)
		return
	}

	// Create formatted message for clients
	msg := map[string]interface{}{
		"type":   "ticker",
		"symbol": ticker.Symbol,
		"price":  ticker.Price,
		"change": ticker.PriceChange,
		"percent": ticker.PercentChange,
		"volume": ticker.Volume,
		"high":   ticker.HighPrice,
		"low":    ticker.LowPrice,
		"timestamp": ticker.EventTime,
	}

	bsm.forwardToHub(msg)
}

// processKline processes kline/candlestick data
func (bsm *BinanceStreamManager) processKline(message []byte) {
	var kline BinanceKlineData
	if err := json.Unmarshal(message, &kline); err != nil {
		log.Printf("Kline unmarshal error: %v", err)
		return
	}

	// Only send closed candles for analysis
	if !kline.Kline.IsClosed {
		return
	}

	// Create formatted message for clients
	msg := map[string]interface{}{
		"type":      "kline",
		"symbol":    kline.Symbol,
		"interval":  kline.Kline.Interval,
		"open":      kline.Kline.OpenPrice,
		"high":      kline.Kline.HighPrice,
		"low":       kline.Kline.LowPrice,
		"close":     kline.Kline.ClosePrice,
		"volume":    kline.Kline.BaseVolume,
		"timestamp": kline.Kline.CloseTime,
		"trades":    kline.Kline.TradeCount,
	}

	bsm.forwardToHub(msg)
}

// processTrade processes trade data
func (bsm *BinanceStreamManager) processTrade(message []byte) {
	var trade map[string]interface{}
	if err := json.Unmarshal(message, &trade); err != nil {
		log.Printf("Trade unmarshal error: %v", err)
		return
	}

	// Create formatted message for clients
	msg := map[string]interface{}{
		"type":      "trade",
		"symbol":    trade["s"],
		"price":     trade["p"],
		"quantity":  trade["q"],
		"timestamp": trade["T"],
		"isBuyer":   trade["m"],
	}

	bsm.forwardToHub(msg)
}

// forwardToHub sends message to all connected clients
func (bsm *BinanceStreamManager) forwardToHub(data interface{}) {
	message, err := json.Marshal(data)
	if err != nil {
		log.Printf("Marshal error: %v", err)
		return
	}

	// Send to all clients through hub
	if bsm.hub != nil {
		select {
		case bsm.hub.broadcast <- message:
		default:
			log.Println("Hub broadcast channel full")
		}
	}
}

// startPing starts periodic ping to keep connection alive
func (bsm *BinanceStreamManager) startPing() {
	bsm.pingTicker = time.NewTicker(30 * time.Second)
	go func() {
		for range bsm.pingTicker.C {
			if err := bsm.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Printf("Ping error: %v", err)
				return
			}
		}
	}()
}

// stopPing stops the ping ticker
func (bsm *BinanceStreamManager) stopPing() {
	if bsm.pingTicker != nil {
		bsm.pingTicker.Stop()
	}
}

// reconnect attempts to reconnect to Binance WebSocket
func (bsm *BinanceStreamManager) reconnect() {
	bsm.reconnecting = true
	defer func() { bsm.reconnecting = false }()

	for i := 1; i <= 5; i++ {
		log.Printf("Reconnection attempt %d/5", i)
		time.Sleep(time.Duration(i*2) * time.Second)

		if err := bsm.Connect(); err != nil {
			log.Printf("Reconnection failed: %v", err)
			continue
		}

		log.Println("Successfully reconnected to Binance")
		return
	}

	log.Println("Failed to reconnect after 5 attempts")
}

// SubscribeToSymbol adds a symbol to the subscription list
func (bsm *BinanceStreamManager) SubscribeToSymbol(symbol string) {
	// Convert to lowercase for Binance
	symbol = fmt.Sprintf("%s", symbol)

	// Check if already subscribed
	for _, s := range bsm.symbols {
		if s == symbol {
			return
		}
	}

	bsm.symbols = append(bsm.symbols, symbol)

	// If connected, subscribe to new symbol
	if bsm.conn != nil {
		subscribeMsg := map[string]interface{}{
			"method": "SUBSCRIBE",
			"params": []string{
				fmt.Sprintf("%s@ticker", symbol),
				fmt.Sprintf("%s@kline_1m", symbol),
				fmt.Sprintf("%s@trade", symbol),
			},
			"id": time.Now().Unix(),
		}

		if err := bsm.conn.WriteJSON(subscribeMsg); err != nil {
			log.Printf("Subscribe error: %v", err)
		}
	}
}

// UnsubscribeFromSymbol removes a symbol from the subscription list
func (bsm *BinanceStreamManager) UnsubscribeFromSymbol(symbol string) {
	// Convert to lowercase for Binance
	symbol = fmt.Sprintf("%s", symbol)

	// Remove from symbols list
	for i, s := range bsm.symbols {
		if s == symbol {
			bsm.symbols = append(bsm.symbols[:i], bsm.symbols[i+1:]...)
			break
		}
	}

	// If connected, unsubscribe from symbol
	if bsm.conn != nil {
		unsubscribeMsg := map[string]interface{}{
			"method": "UNSUBSCRIBE",
			"params": []string{
				fmt.Sprintf("%s@ticker", symbol),
				fmt.Sprintf("%s@kline_1m", symbol),
				fmt.Sprintf("%s@trade", symbol),
			},
			"id": time.Now().Unix(),
		}

		if err := bsm.conn.WriteJSON(unsubscribeMsg); err != nil {
			log.Printf("Unsubscribe error: %v", err)
		}
	}
}

// Close closes the WebSocket connection
func (bsm *BinanceStreamManager) Close() error {
	bsm.stopPing()
	if bsm.conn != nil {
		return bsm.conn.Close()
	}
	return nil
}