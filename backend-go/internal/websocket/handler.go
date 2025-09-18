package websocket

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins in development
		// TODO: Restrict in production
		return true
	},
}

// Hub maintains active client connections
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

// GetGlobalHub returns the global WebSocket hub instance
func GetGlobalHub() *Hub {
	return hub
}

// Client represents a WebSocket client
type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan []byte
	id       string
	symbols  map[string]bool
	mu       sync.RWMutex
}

// Message represents a WebSocket message
type Message struct {
	Type   string          `json:"type"`
	Symbol string          `json:"symbol,omitempty"`
	Data   json.RawMessage `json:"data,omitempty"`
}

// Global hub instance
var hub = &Hub{
	clients:    make(map[*Client]bool),
	broadcast:  make(chan []byte, 256),
	register:   make(chan *Client),
	unregister: make(chan *Client),
}

func init() {
	// Start the hub
	go hub.run()
}

// run starts the hub
func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			logrus.Infof("Client %s connected", client.id)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				h.mu.Unlock()
				logrus.Infof("Client %s disconnected", client.id)
			} else {
				h.mu.Unlock()
			}

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					// Client's send channel is full, close it
					delete(h.clients, client)
					close(client.send)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// HandleWebSocket handles WebSocket connections
func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logrus.Errorf("Failed to upgrade connection: %v", err)
		return
	}

	client := &Client{
		hub:     hub,
		conn:    conn,
		send:    make(chan []byte, 256),
		id:      fmt.Sprintf("%d", time.Now().UnixNano()),
		symbols: make(map[string]bool),
	}

	client.hub.register <- client

	// Start goroutines for reading and writing
	go client.writePump()
	go client.readPump()
}

// readPump reads messages from the WebSocket connection
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, messageBytes, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logrus.Errorf("WebSocket error: %v", err)
			}
			break
		}

		var msg Message
		if err := json.Unmarshal(messageBytes, &msg); err != nil {
			logrus.Errorf("Failed to unmarshal message: %v", err)
			continue
		}

		c.handleMessage(&msg)
	}
}

// writePump writes messages to the WebSocket connection
func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current WebSocket message
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// handleMessage processes incoming messages
func (c *Client) handleMessage(msg *Message) {
	switch msg.Type {
	case "subscribe":
		c.subscribe(msg.Symbol)
	case "unsubscribe":
		c.unsubscribe(msg.Symbol)
	case "ping":
		c.sendPong()
	default:
		logrus.Warnf("Unknown message type: %s", msg.Type)
	}
}

// subscribe adds a symbol to the client's subscription list
func (c *Client) subscribe(symbol string) {
	c.mu.Lock()
	c.symbols[symbol] = true
	c.mu.Unlock()

	// Send confirmation
	response := map[string]interface{}{
		"type":   "subscribed",
		"symbol": symbol,
		"status": "success",
	}
	c.sendJSON(response)

	// Start sending market data for this symbol
	go c.streamMarketData(symbol)
}

// unsubscribe removes a symbol from the client's subscription list
func (c *Client) unsubscribe(symbol string) {
	c.mu.Lock()
	delete(c.symbols, symbol)
	c.mu.Unlock()

	// Send confirmation
	response := map[string]interface{}{
		"type":   "unsubscribed",
		"symbol": symbol,
		"status": "success",
	}
	c.sendJSON(response)
}

// sendPong sends a pong message
func (c *Client) sendPong() {
	response := map[string]interface{}{
		"type": "pong",
		"time": time.Now().Unix(),
	}
	c.sendJSON(response)
}

// sendJSON sends a JSON message to the client
func (c *Client) sendJSON(data interface{}) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		logrus.Errorf("Failed to marshal JSON: %v", err)
		return
	}

	select {
	case c.send <- jsonData:
	default:
		// Client's send channel is full
		logrus.Warn("Client send channel is full")
	}
}

// streamMarketData streams market data for a symbol
func (c *Client) streamMarketData(symbol string) {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		c.mu.RLock()
		subscribed := c.symbols[symbol]
		c.mu.RUnlock()

		if !subscribed {
			break
		}

		// TODO: Get real market data
		data := map[string]interface{}{
			"type":   "marketData",
			"symbol": symbol,
			"data": map[string]interface{}{
				"price":     42000.50,
				"volume":    123456.78,
				"change24h": 2.5,
				"timestamp": time.Now().Unix(),
			},
		}

		c.sendJSON(data)
	}
}

// BroadcastMarketData broadcasts market data to all connected clients
func BroadcastMarketData(symbol string, data interface{}) {
	message := map[string]interface{}{
		"type":   "marketData",
		"symbol": symbol,
		"data":   data,
	}

	jsonData, err := json.Marshal(message)
	if err != nil {
		logrus.Errorf("Failed to marshal market data: %v", err)
		return
	}

	hub.broadcast <- jsonData
}

// BroadcastPrediction broadcasts AI prediction to all connected clients
func BroadcastPrediction(model, symbol string, prediction interface{}) {
	message := map[string]interface{}{
		"type":  "prediction",
		"model": model,
		"symbol": symbol,
		"data":   prediction,
	}

	jsonData, err := json.Marshal(message)
	if err != nil {
		logrus.Errorf("Failed to marshal prediction: %v", err)
		return
	}

	hub.broadcast <- jsonData
}

// HandleTradesStream handles trades WebSocket stream
func HandleTradesStream(c *gin.Context) {
	symbol := c.Query("symbol")
	if symbol == "" {
		c.JSON(400, gin.H{"error": "symbol is required"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logrus.Errorf("Failed to upgrade connection: %v", err)
		return
	}
	defer conn.Close()

	// Stream trades for the symbol
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for range ticker.C {
		// TODO: Get real trades data
		trade := map[string]interface{}{
			"symbol":    symbol,
			"price":     42000.50,
			"quantity":  0.5,
			"side":      "BUY",
			"timestamp": time.Now().Unix(),
		}

		if err := conn.WriteJSON(trade); err != nil {
			logrus.Errorf("Failed to write trade: %v", err)
			break
		}
	}
}

// HandleOrderBookStream handles order book WebSocket stream
func HandleOrderBookStream(c *gin.Context) {
	symbol := c.Query("symbol")
	if symbol == "" {
		c.JSON(400, gin.H{"error": "symbol is required"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logrus.Errorf("Failed to upgrade connection: %v", err)
		return
	}
	defer conn.Close()

	// Stream order book for the symbol
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		// TODO: Get real order book data
		orderBook := map[string]interface{}{
			"symbol": symbol,
			"bids": [][]float64{
				{41900, 0.5},
				{41850, 1.2},
				{41800, 2.3},
			},
			"asks": [][]float64{
				{42100, 0.8},
				{42150, 1.5},
				{42200, 2.1},
			},
			"timestamp": time.Now().Unix(),
		}

		if err := conn.WriteJSON(orderBook); err != nil {
			logrus.Errorf("Failed to write order book: %v", err)
			break
		}
	}
}

// HandleKlinesStream handles klines/candlestick WebSocket stream
func HandleKlinesStream(c *gin.Context) {
	symbol := c.Query("symbol")
	interval := c.Query("interval")

	if symbol == "" {
		c.JSON(400, gin.H{"error": "symbol is required"})
		return
	}

	if interval == "" {
		interval = "1m"
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logrus.Errorf("Failed to upgrade connection: %v", err)
		return
	}
	defer conn.Close()

	// Stream klines for the symbol
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		// TODO: Get real kline data
		kline := map[string]interface{}{
			"symbol":   symbol,
			"interval": interval,
			"open":     42000,
			"high":     42100,
			"low":      41900,
			"close":    42050,
			"volume":   123.45,
			"timestamp": time.Now().Unix(),
		}

		if err := conn.WriteJSON(kline); err != nil {
			logrus.Errorf("Failed to write kline: %v", err)
			break
		}
	}
}