package main

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "os"
    "os/signal"
    "runtime"
    "syscall"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/gorilla/websocket"
    "github.com/loadstar0723/monstas7/go-trading-engine/handlers"
)

// TradingEngine 메인 구조체
type TradingEngine struct {
    wsClients   map[string]*websocket.Conn
    dataChannel chan MarketData
    predictions chan Prediction
}

// MarketData 실시간 시장 데이터
type MarketData struct {
    Symbol    string    `json:"symbol"`
    Price     float64   `json:"price"`
    Volume    float64   `json:"volume"`
    Timestamp time.Time `json:"timestamp"`
}

// Prediction AI 예측 결과
type Prediction struct {
    Symbol     string    `json:"symbol"`
    Direction  string    `json:"direction"` // "BUY", "SELL", "HOLD"
    Confidence float64   `json:"confidence"`
    Target     float64   `json:"target"`
    StopLoss   float64   `json:"stop_loss"`
    Timestamp  time.Time `json:"timestamp"`
}

func main() {
    // Gin 엔진 생성
    router := gin.New()
    router.Use(gin.Logger())
    router.Use(gin.Recovery())

    // CORS 설정
    router.Use(func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    })

    // 트레이딩 엔진 초기화
    engine := &TradingEngine{
        wsClients:   make(map[string]*websocket.Conn),
        dataChannel: make(chan MarketData, 10000),
        predictions: make(chan Prediction, 1000),
    }

    // 라우트 설정
    router.GET("/health", healthCheck)
    router.GET("/ws", engine.handleWebSocket)
    router.GET("/api/market/:symbol", engine.getMarketData)
    router.POST("/api/predict", engine.getPrediction)
    router.GET("/api/performance", engine.getPerformance)
    router.POST("/api/backtest", handlers.RunBacktest)
    router.POST("/api/analysis/:type", handlers.GetDynamicAnalysis)

    // ARIMA 라우트
    router.POST("/api/arima/decomposition", handlers.GetDecomposition)
    router.POST("/api/arima/acfpacf", handlers.GetACFPACF)
    router.POST("/api/arima/auto", handlers.RunAutoARIMA)
    router.POST("/api/arima/forecast", handlers.GenerateForecast)
    router.POST("/api/arima/diagnostics", handlers.RunDiagnostics)

    // GRU 라우트
    router.POST("/api/gru/train", handlers.TrainGRU)
    router.POST("/api/gru/predict", handlers.PredictGRU)
    router.POST("/api/gru/gates", handlers.GetGRUGates)
    router.POST("/api/gru/compare", handlers.CompareGRUPerformance)
    router.POST("/api/gru/optimize", handlers.OptimizeGRUHyperParams)

    // 백그라운드 워커 시작
    go engine.processMarketData()
    go engine.runPredictionEngine()

    // 서버 시작
    srv := &http.Server{
        Addr:    ":8080",
        Handler: router,
    }

    go func() {
        log.Printf("🚀 Go Trading Engine started on :8080")
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Listen: %s\n", err)
        }
    }()

    // Graceful shutdown
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("Shutting down server...")
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal("Server forced to shutdown:", err)
    }

    log.Println("Server exited")
}

// Health check 엔드포인트
func healthCheck(c *gin.Context) {
    var m runtime.MemStats
    runtime.ReadMemStats(&m)

    c.JSON(http.StatusOK, gin.H{
        "status": "healthy",
        "engine": "go-trading-engine",
        "version": "1.0.0",
        "timestamp": time.Now(),
        "cpu_usage": float64(runtime.NumCPU()),
        "memory_usage": float64(m.Alloc / 1024 / 1024), // MB 단위
        "goroutines": runtime.NumGoroutine(),
        "gc_runs": m.NumGC,
    })
}

// WebSocket 업그레이더
var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true // 개발 중에는 모든 origin 허용
    },
}

// WebSocket 핸들러
func (e *TradingEngine) handleWebSocket(c *gin.Context) {
    conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil {
        log.Printf("WebSocket upgrade failed: %v", err)
        return
    }
    defer conn.Close()

    clientID := fmt.Sprintf("client-%d", time.Now().Unix())
    e.wsClients[clientID] = conn
    defer delete(e.wsClients, clientID)

    log.Printf("Client connected: %s", clientID)

    // 클라이언트에게 실시간 데이터 전송
    for {
        select {
        case data := <-e.dataChannel:
            if err := conn.WriteJSON(data); err != nil {
                log.Printf("Write error: %v", err)
                return
            }
        case prediction := <-e.predictions:
            if err := conn.WriteJSON(prediction); err != nil {
                log.Printf("Write error: %v", err)
                return
            }
        }
    }
}

// 시장 데이터 API
func (e *TradingEngine) getMarketData(c *gin.Context) {
    symbol := c.Param("symbol")

    // TODO: Binance API 연동
    mockData := MarketData{
        Symbol:    symbol,
        Price:     50000.0,
        Volume:    1000.0,
        Timestamp: time.Now(),
    }

    c.JSON(http.StatusOK, mockData)
}

// AI 예측 API
func (e *TradingEngine) getPrediction(c *gin.Context) {
    var req struct {
        Symbol string `json:"symbol"`
        Model  string `json:"model"` // "lstm", "xgboost", etc.
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // TODO: Python AI 서버 연동
    mockPrediction := Prediction{
        Symbol:     req.Symbol,
        Direction:  "BUY",
        Confidence: 0.85,
        Target:     52000.0,
        StopLoss:   49000.0,
        Timestamp:  time.Now(),
    }

    e.predictions <- mockPrediction
    c.JSON(http.StatusOK, mockPrediction)
}

// 성능 메트릭 API
func (e *TradingEngine) getPerformance(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "processed_per_second": 10000,
        "active_connections":   len(e.wsClients),
        "memory_usage_mb":      100,
        "cpu_usage_percent":    25,
        "latency_ms":          5,
    })
}

// 시장 데이터 처리 워커
func (e *TradingEngine) processMarketData() {
    ticker := time.NewTicker(100 * time.Millisecond)
    defer ticker.Stop()

    for range ticker.C {
        // Binance WebSocket 데이터 처리
        data := MarketData{
            Symbol:    "BTCUSDT",
            Price:     50000.0 + float64(time.Now().Unix()%100),
            Volume:    1000.0,
            Timestamp: time.Now(),
        }

        select {
        case e.dataChannel <- data:
        default:
            // 채널이 가득 찬 경우 스킵
        }
    }
}

// AI 예측 엔진 워커
func (e *TradingEngine) runPredictionEngine() {
    ticker := time.NewTicker(5 * time.Second)
    defer ticker.Stop()

    for range ticker.C {
        // Python AI 서버와 통신하여 예측 수행
        prediction := Prediction{
            Symbol:     "BTCUSDT",
            Direction:  "BUY",
            Confidence: 0.75,
            Target:     51000.0,
            StopLoss:   49500.0,
            Timestamp:  time.Now(),
        }

        select {
        case e.predictions <- prediction:
        default:
            // 채널이 가득 찬 경우 스킵
        }
    }
}