package market

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

// BinanceWebSocket Binance WebSocket 클라이언트
type BinanceWebSocket struct {
	conn       *websocket.Conn
	baseURL    string
	symbols    []string
	callbacks  map[string]func(interface{})
	isConnected bool
	reconnectDelay time.Duration
}

// WebSocketMessage WebSocket 메시지 구조체
type WebSocketMessage struct {
	Stream string          `json:"stream"`
	Data   json.RawMessage `json:"data"`
}

// TickerStream 실시간 가격 스트림 데이터
type TickerStream struct {
	EventType  string  `json:"e"`
	EventTime  int64   `json:"E"`
	Symbol     string  `json:"s"`
	Price      string  `json:"c"`
	Volume     string  `json:"v"`
	QuoteVolume string `json:"q"`
	High       string  `json:"h"`
	Low        string  `json:"l"`
	Open       string  `json:"o"`
	PriceChangePercent string `json:"P"`
}

// TradeStream 실시간 거래 스트림 데이터
type TradeStream struct {
	EventType  string  `json:"e"`
	EventTime  int64   `json:"E"`
	Symbol     string  `json:"s"`
	TradeID    int64   `json:"t"`
	Price      string  `json:"p"`
	Quantity   string  `json:"q"`
	BuyerOrderID int64 `json:"b"`
	SellerOrderID int64 `json:"a"`
	TradeTime  int64   `json:"T"`
	IsBuyerMaker bool `json:"m"`
}

// DepthStream 실시간 오더북 스트림 데이터
type DepthStream struct {
	EventType     string     `json:"e"`
	EventTime     int64      `json:"E"`
	Symbol        string     `json:"s"`
	FirstUpdateID int64      `json:"U"`
	FinalUpdateID int64      `json:"u"`
	Bids          [][]string `json:"b"`
	Asks          [][]string `json:"a"`
}

// NewBinanceWebSocket 새 WebSocket 클라이언트 생성
func NewBinanceWebSocket(symbols []string) *BinanceWebSocket {
	return &BinanceWebSocket{
		baseURL:    "wss://stream.binance.com:9443",
		symbols:    symbols,
		callbacks:  make(map[string]func(interface{})),
		reconnectDelay: 5 * time.Second,
	}
}

// Connect WebSocket 연결
func (ws *BinanceWebSocket) Connect() error {
	// 스트림 리스트 생성
	streams := []string{}
	for _, symbol := range ws.symbols {
		symbolLower := strings.ToLower(symbol)
		// 티커 스트림
		streams = append(streams, fmt.Sprintf("%s@ticker", symbolLower))
		// 거래 스트림
		streams = append(streams, fmt.Sprintf("%s@trade", symbolLower))
		// 오더북 스트림
		streams = append(streams, fmt.Sprintf("%s@depth@100ms", symbolLower))
	}

	// WebSocket URL 생성
	url := fmt.Sprintf("%s/stream?streams=%s", ws.baseURL, strings.Join(streams, "/"))

	// WebSocket 연결
	conn, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		return fmt.Errorf("failed to connect to WebSocket: %w", err)
	}

	ws.conn = conn
	ws.isConnected = true

	log.Printf("Connected to Binance WebSocket for symbols: %v", ws.symbols)

	// 메시지 수신 시작
	go ws.receiveMessages()

	// Ping/Pong 처리
	go ws.keepAlive()

	return nil
}

// receiveMessages 메시지 수신 처리
func (ws *BinanceWebSocket) receiveMessages() {
	defer ws.handleDisconnect()

	for {
		if !ws.isConnected {
			break
		}

		var msg WebSocketMessage
		err := ws.conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// 스트림 타입에 따라 처리
		ws.handleMessage(msg)
	}
}

// handleMessage 메시지 처리
func (ws *BinanceWebSocket) handleMessage(msg WebSocketMessage) {
	streamParts := strings.Split(msg.Stream, "@")
	if len(streamParts) < 2 {
		return
	}

	_ = strings.ToUpper(streamParts[0]) // symbol - currently unused but may be needed later
	streamType := streamParts[1]

	switch {
	case streamType == "ticker":
		var ticker TickerStream
		if err := json.Unmarshal(msg.Data, &ticker); err == nil {
			if callback, ok := ws.callbacks["ticker"]; ok {
				callback(ticker)
			}
		}
	case streamType == "trade":
		var trade TradeStream
		if err := json.Unmarshal(msg.Data, &trade); err == nil {
			if callback, ok := ws.callbacks["trade"]; ok {
				callback(trade)
			}
		}
	case strings.HasPrefix(streamType, "depth"):
		var depth DepthStream
		if err := json.Unmarshal(msg.Data, &depth); err == nil {
			if callback, ok := ws.callbacks["depth"]; ok {
				callback(depth)
			}
		}
	}
}

// OnTicker 티커 이벤트 콜백 등록
func (ws *BinanceWebSocket) OnTicker(callback func(interface{})) {
	ws.callbacks["ticker"] = callback
}

// OnTrade 거래 이벤트 콜백 등록
func (ws *BinanceWebSocket) OnTrade(callback func(interface{})) {
	ws.callbacks["trade"] = callback
}

// OnDepth 오더북 이벤트 콜백 등록
func (ws *BinanceWebSocket) OnDepth(callback func(interface{})) {
	ws.callbacks["depth"] = callback
}

// keepAlive Ping/Pong 처리
func (ws *BinanceWebSocket) keepAlive() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			if ws.isConnected {
				if err := ws.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
					log.Printf("Failed to send ping: %v", err)
					ws.handleDisconnect()
					return
				}
			}
		}
	}
}

// handleDisconnect 연결 끊김 처리
func (ws *BinanceWebSocket) handleDisconnect() {
	ws.isConnected = false
	if ws.conn != nil {
		ws.conn.Close()
	}

	log.Println("WebSocket disconnected, attempting to reconnect...")

	// 재연결 시도
	go ws.reconnect()
}

// reconnect 재연결
func (ws *BinanceWebSocket) reconnect() {
	for {
		time.Sleep(ws.reconnectDelay)

		log.Println("Attempting to reconnect to WebSocket...")
		err := ws.Connect()
		if err == nil {
			log.Println("Successfully reconnected to WebSocket")
			return
		}

		log.Printf("Reconnection failed: %v", err)
	}
}

// Close WebSocket 연결 종료
func (ws *BinanceWebSocket) Close() error {
	ws.isConnected = false
	if ws.conn != nil {
		return ws.conn.Close()
	}
	return nil
}

// IsConnected 연결 상태 확인
func (ws *BinanceWebSocket) IsConnected() bool {
	return ws.isConnected
}