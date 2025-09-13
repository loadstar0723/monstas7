package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"
    "github.com/gorilla/mux"
    "github.com/gorilla/websocket"
)

// AI 신호 구조체
type AISignal struct {
    Symbol     string  `json:"symbol"`
    Action     string  `json:"action"` // BUY, SELL, HOLD
    Confidence float64 `json:"confidence"`
    Price      float64 `json:"price"`
    StopLoss   float64 `json:"stop_loss"`
    TakeProfit float64 `json:"take_profit"`
    Timestamp  int64   `json:"timestamp"`
}

// 트레이딩 엔진
type TradingEngine struct {
    signals      chan AISignal
    positions    map[string]*Position
    performance  *PerformanceTracker
    riskManager  *RiskManager
}

// 포지션 관리
type Position struct {
    Symbol     string
    EntryPrice float64
    Quantity   float64
    Side       string
    StopLoss   float64
    TakeProfit float64
    EntryTime  time.Time
}

// 리스크 관리
type RiskManager struct {
    MaxPositionSize  float64
    MaxDrawdown      float64
    DailyLossLimit   float64
    CurrentExposure  float64
}

func NewTradingEngine() *TradingEngine {
    return &TradingEngine{
        signals:     make(chan AISignal, 1000),
        positions:   make(map[string]*Position),
        performance: NewPerformanceTracker(),
        riskManager: &RiskManager{
            MaxPositionSize: 0.1,  // 전체 자본의 10%
            MaxDrawdown:     0.2,  // 20% 최대 손실
            DailyLossLimit:  0.05, // 일일 5% 손실 제한
        },
    }
}

// AI 신호 처리
func (te *TradingEngine) ProcessSignals() {
    for signal := range te.signals {
        // 리스크 체크
        if !te.riskManager.CanTrade(signal) {
            log.Printf("Risk limit reached for %s", signal.Symbol)
            continue
        }

        // 신뢰도 체크
        if signal.Confidence < 0.7 {
            log.Printf("Low confidence signal ignored: %.2f", signal.Confidence)
            continue
        }

        // 주문 실행
        te.ExecuteTrade(signal)
    }
}

// 거래 실행
func (te *TradingEngine) ExecuteTrade(signal AISignal) error {
    // 포지션 크기 계산
    positionSize := te.CalculatePositionSize(signal)
    
    // Binance API 호출 (실제 거래)
    order := BinanceOrder{
        Symbol:   signal.Symbol,
        Side:     signal.Action,
        Type:     "LIMIT",
        Quantity: positionSize,
        Price:    signal.Price,
    }

    // 주문 전송
    response, err := te.SendOrder(order)
    if err != nil {
        return err
    }

    // 포지션 기록
    te.positions[signal.Symbol] = &Position{
        Symbol:     signal.Symbol,
        EntryPrice: signal.Price,
        Quantity:   positionSize,
        Side:       signal.Action,
        StopLoss:   signal.StopLoss,
        TakeProfit: signal.TakeProfit,
        EntryTime:  time.Now(),
    }

    log.Printf("Trade executed: %+v", response)
    return nil
}

// Python AI 서버로부터 신호 수신
func (te *TradingEngine) HandleAISignal(w http.ResponseWriter, r *http.Request) {
    var signal AISignal
    if err := json.NewDecoder(r.Body).Decode(&signal); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // 신호를 처리 채널로 전송
    te.signals <- signal

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "signal received",
        "symbol": signal.Symbol,
    })
}

// 실시간 성과 추적
type PerformanceTracker struct {
    TotalTrades     int
    WinningTrades   int
    LosingTrades    int
    TotalProfit     float64
    MaxDrawdown     float64
    SharpeRatio     float64
    WinRate         float64
}

func (pt *PerformanceTracker) UpdateMetrics(trade TradeResult) {
    pt.TotalTrades++
    if trade.Profit > 0 {
        pt.WinningTrades++
    } else {
        pt.LosingTrades++
    }
    pt.TotalProfit += trade.Profit
    pt.WinRate = float64(pt.WinningTrades) / float64(pt.TotalTrades)
}

// WebSocket으로 실시간 상태 전송
func (te *TradingEngine) StreamStatus(w http.ResponseWriter, r *http.Request) {
    upgrader := websocket.Upgrader{
        CheckOrigin: func(r *http.Request) bool { return true },
    }
    
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        return
    }
    defer conn.Close()

    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            status := map[string]interface{}{
                "positions":    te.positions,
                "performance":  te.performance,
                "riskMetrics": te.riskManager,
                "timestamp":   time.Now().Unix(),
            }
            
            if err := conn.WriteJSON(status); err != nil {
                return
            }
        }
    }
}

func main() {
    engine := NewTradingEngine()
    
    // 신호 처리 고루틴
    go engine.ProcessSignals()

    r := mux.NewRouter()
    
    // AI 신호 수신 엔드포인트
    r.HandleFunc("/api/ai-signal", engine.HandleAISignal).Methods("POST")
    
    // 실시간 상태 스트리밍
    r.HandleFunc("/ws/status", engine.StreamStatus)
    
    // 성과 API
    r.HandleFunc("/api/performance", func(w http.ResponseWriter, r *http.Request) {
        json.NewEncoder(w).Encode(engine.performance)
    }).Methods("GET")
    
    // 포지션 API
    r.HandleFunc("/api/positions", func(w http.ResponseWriter, r *http.Request) {
        json.NewEncoder(w).Encode(engine.positions)
    }).Methods("GET")

    log.Println("AI Trading Engine starting on :8082")
    if err := http.ListenAndServe(":8082", r); err != nil {
        log.Fatal("Server error:", err)
    }
}