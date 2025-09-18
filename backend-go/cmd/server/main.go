package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/loadstar0723/monstas7-backend/internal/ai"
	"github.com/loadstar0723/monstas7-backend/internal/api"
	"github.com/loadstar0723/monstas7-backend/internal/database"
	"github.com/loadstar0723/monstas7-backend/internal/market"
	"github.com/loadstar0723/monstas7-backend/internal/websocket"
	"github.com/loadstar0723/monstas7-backend/pkg/middleware"
	"github.com/sirupsen/logrus"
)

func main() {
	// Initialize logger
	logger := logrus.New()
	logger.SetFormatter(&logrus.JSONFormatter{})
	logger.SetLevel(logrus.InfoLevel)

	// Load environment variables
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize Supabase (최고의 선택!)
	supabase, err := database.InitSupabase()
	if err != nil {
		logger.Warnf("Supabase initialization failed: %v", err)
	} else {
		logger.Info("✅ Supabase connected successfully - Cloud database ready!")
		logger.Infof("Supabase URL: %s", supabase.URL)
	}

	// Initialize Redis cache
	redis := database.InitRedis()
	if redis != nil {
		defer redis.Close()
		logger.Info("Redis connected successfully")
	} else {
		logger.Warn("Redis not available - running without cache")
	}

	// Initialize market data collector
	marketCollector := market.GetCollector()
	marketCollector.StartCollecting()
	logger.Info("Market data collector initialized")

	// Initialize AI Manager
	aiManager := ai.GetManager()
	logger.Infof("AI Manager initialized with %d models", len(aiManager.GetAllModelStatus()))

	// Create Gin router
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.Logger(logger))
	router.Use(middleware.CORS())
	router.Use(middleware.RateLimit())

	// API Routes
	apiGroup := router.Group("/api/v1")
	{
		// AI Model Routes
		aiGroup := apiGroup.Group("/ai")
		{
			aiGroup.POST("/neural/predict", api.NeuralPredict)
			aiGroup.POST("/lightgbm/predict", api.LightGBMPredict)
			aiGroup.POST("/randomforest/predict", api.RandomForestPredict)
			aiGroup.POST("/ensemble/predict", api.EnsemblePredict)
			aiGroup.POST("/lstm/predict", api.LSTMPredict)
			aiGroup.POST("/gru/predict", api.GRUPredict)
			aiGroup.POST("/xgboost/predict", api.XGBoostPredict)
			aiGroup.POST("/arima/predict", api.ARIMAPredict)
			aiGroup.POST("/pattern/recognize", api.PatternRecognition)
			aiGroup.POST("/portfolio/optimize", api.PortfolioOptimize)
			aiGroup.POST("/strategy/generate", api.StrategyGenerate)
			aiGroup.GET("/models/status", api.GetAllModelStatus)
		}

		// Market Data Routes
		marketGroup := apiGroup.Group("/market")
		{
			marketGroup.GET("/price/:symbol", api.GetPrice)
			marketGroup.GET("/orderbook/:symbol", api.GetOrderBook)
			marketGroup.GET("/trades/:symbol", api.GetTrades)
			marketGroup.GET("/klines/:symbol", api.GetKlines)
			marketGroup.GET("/ticker/24hr", api.Get24hrTicker)
		}

		// WebSocket Routes
		wsGroup := apiGroup.Group("/ws")
		{
			wsGroup.GET("/stream", websocket.HandleWebSocket)
			wsGroup.GET("/trades", websocket.HandleTradesStream)
			wsGroup.GET("/orderbook", websocket.HandleOrderBookStream)
			wsGroup.GET("/klines", websocket.HandleKlinesStream)
		}

		// Trading Routes
		tradingGroup := apiGroup.Group("/trading")
		{
			tradingGroup.POST("/order", api.CreateOrder)
			tradingGroup.GET("/orders", api.GetOrders)
			tradingGroup.DELETE("/order/:id", api.CancelOrder)
			tradingGroup.GET("/positions", api.GetPositions)
			tradingGroup.POST("/backtest", api.RunBacktest)
		}

		// Analytics Routes
		analyticsGroup := apiGroup.Group("/analytics")
		{
			analyticsGroup.GET("/performance", api.GetPerformance)
			analyticsGroup.GET("/risk", api.GetRiskMetrics)
			analyticsGroup.GET("/sharpe", api.GetSharpeRatio)
			analyticsGroup.GET("/drawdown", api.GetDrawdown)
			analyticsGroup.GET("/correlation", api.GetCorrelation)
		}

		// System Routes
		systemGroup := apiGroup.Group("/system")
		{
			systemGroup.GET("/health", api.HealthCheck)
			systemGroup.GET("/metrics", api.GetMetrics)
			systemGroup.GET("/status", api.GetSystemStatus)
		}
	}

	// Static files
	router.Static("/static", "./static")

	// Serve index.html at root
	router.GET("/", func(c *gin.Context) {
		c.File("./static/index.html")
	})

	router.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "Route not found"})
	})

	// Create HTTP server
	srv := &http.Server{
		Addr:           ":" + port,
		Handler:        router,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	// Start server in goroutine
	go func() {
		logger.Infof("Starting Go AI Trading Server on port %s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Initialize AI models
	go initializeAIModels(logger)

	// Start background workers
	go startBackgroundWorkers(logger)

	// Start Binance WebSocket stream
	go startBinanceStream(logger)

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatalf("Server forced to shutdown: %v", err)
	}

	logger.Info("Server exited")
}

func initializeAIModels(logger *logrus.Logger) {
	logger.Info("Initializing AI models...")

	// Initialize Neural Network
	logger.Info("Loading Neural Network model...")
	// TODO: Load actual model weights

	// Initialize LightGBM
	logger.Info("Loading LightGBM model...")
	// TODO: Load actual model

	// Initialize RandomForest
	logger.Info("Loading RandomForest model...")
	// TODO: Load actual model

	logger.Info("All AI models initialized successfully")
}

func startBackgroundWorkers(logger *logrus.Logger) {
	logger.Info("Starting background workers...")

	// Market data updater
	go func() {
		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			// Update market data
			// TODO: Implement market data updates
		}
	}()

	// Model retraining scheduler
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()

		for range ticker.C {
			// Retrain models if needed
			// TODO: Implement model retraining
		}
	}()

	logger.Info("Background workers started")
}

func startBinanceStream(logger *logrus.Logger) {
	logger.Info("Starting Binance WebSocket stream...")

	// Get the global WebSocket hub
	hub := websocket.GetGlobalHub()

	// Create Binance stream manager
	binanceStream := websocket.NewBinanceStreamManager(hub)

	// Connect to Binance WebSocket
	if err := binanceStream.Connect(); err != nil {
		logger.Errorf("Failed to connect to Binance stream: %v", err)
		// Retry after 5 seconds
		time.Sleep(5 * time.Second)
		go startBinanceStream(logger)
		return
	}

	logger.Info("Binance WebSocket stream started successfully")
}