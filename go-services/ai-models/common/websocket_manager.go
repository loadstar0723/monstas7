package common

import (
    "log"
    "net/http"
    "sync"
    "time"
    
    "github.com/gorilla/websocket"
)

// WebSocketManager manages WebSocket connections and broadcasts
type WebSocketManager struct {
    clients    map[*websocket.Conn]bool
    broadcast  chan WebSocketMessage
    register   chan *websocket.Conn
    unregister chan *websocket.Conn
    mu         sync.RWMutex
}

// NewWebSocketManager creates a new WebSocket manager
func NewWebSocketManager() *WebSocketManager {
    return &WebSocketManager{
        clients:    make(map[*websocket.Conn]bool),
        broadcast:  make(chan WebSocketMessage, 100),
        register:   make(chan *websocket.Conn),
        unregister: make(chan *websocket.Conn),
    }
}

// Start starts the WebSocket manager
func (m *WebSocketManager) Start() {
    go m.run()
}

func (m *WebSocketManager) run() {
    for {
        select {
        case client := <-m.register:
            m.mu.Lock()
            m.clients[client] = true
            m.mu.Unlock()
            log.Printf("Client connected. Total clients: %d", len(m.clients))
            
        case client := <-m.unregister:
            m.mu.Lock()
            if _, ok := m.clients[client]; ok {
                delete(m.clients, client)
                client.Close()
            }
            m.mu.Unlock()
            log.Printf("Client disconnected. Total clients: %d", len(m.clients))
            
        case message := <-m.broadcast:
            m.mu.RLock()
            for client := range m.clients {
                if err := client.WriteJSON(message); err != nil {
                    log.Printf("Error broadcasting to client: %v", err)
                    client.Close()
                    delete(m.clients, client)
                }
            }
            m.mu.RUnlock()
        }
    }
}

// HandleWebSocket handles WebSocket connections
func (m *WebSocketManager) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
    upgrader := websocket.Upgrader{
        CheckOrigin: func(r *http.Request) bool { return true },
    }
    
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Printf("WebSocket upgrade failed: %v", err)
        return
    }
    
    m.register <- conn
    
    // Send initial connection message
    conn.WriteJSON(WebSocketMessage{
        Type:      "connection",
        Data:      "connected",
        Timestamp: time.Now(),
    })
    
    // Keep connection alive and handle incoming messages
    go m.handleClient(conn)
}

func (m *WebSocketManager) handleClient(conn *websocket.Conn) {
    defer func() {
        m.unregister <- conn
        conn.Close()
    }()
    
    // Set read/write deadlines
    conn.SetReadDeadline(time.Now().Add(60 * time.Second))
    conn.SetPongHandler(func(string) error {
        conn.SetReadDeadline(time.Now().Add(60 * time.Second))
        return nil
    })
    
    // Send ping messages
    ticker := time.NewTicker(30 * time.Second)
    defer ticker.Stop()
    
    go func() {
        for {
            select {
            case <-ticker.C:
                if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
                    return
                }
            }
        }
    }()
    
    // Read messages from client
    for {
        var msg map[string]interface{}
        if err := conn.ReadJSON(&msg); err != nil {
            if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
                log.Printf("WebSocket error: %v", err)
            }
            break
        }
        
        // Handle client messages (e.g., subscribe to specific symbols)
        if msgType, ok := msg["type"].(string); ok {
            switch msgType {
            case "subscribe":
                if symbol, ok := msg["symbol"].(string); ok {
                    log.Printf("Client subscribed to %s", symbol)
                    // TODO: Implement symbol-specific subscriptions
                }
            }
        }
    }
}

// Broadcast sends a message to all connected clients
func (m *WebSocketManager) Broadcast(msgType string, symbol string, data interface{}) {
    select {
    case m.broadcast <- WebSocketMessage{
        Type:      msgType,
        Symbol:    symbol,
        Data:      data,
        Timestamp: time.Now(),
    }:
    default:
        log.Println("Broadcast channel full, dropping message")
    }
}

// BroadcastPrediction broadcasts prediction data
func (m *WebSocketManager) BroadcastPrediction(prediction *Prediction) {
    m.Broadcast("prediction", prediction.Symbol, prediction)
}

// BroadcastSignal broadcasts trading signal
func (m *WebSocketManager) BroadcastSignal(signal *TradingSignal) {
    m.Broadcast("signal", signal.Symbol, signal)
}

// BroadcastMetrics broadcasts model metrics
func (m *WebSocketManager) BroadcastMetrics(metrics *ModelMetrics) {
    m.Broadcast("metrics", "", metrics)
}

// BroadcastVisualization broadcasts visualization data
func (m *WebSocketManager) BroadcastVisualization(viz *ModelVisualization) {
    m.Broadcast("visualization", "", viz)
}

// GetClientCount returns the number of connected clients
func (m *WebSocketManager) GetClientCount() int {
    m.mu.RLock()
    defer m.mu.RUnlock()
    return len(m.clients)
}