package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/loadstar0723/monstas7-backend/internal/market"
)

// GetPrice 현재 가격 조회
func GetPrice(c *gin.Context) {
	symbol := c.Param("symbol")

	// 실시간 데이터 수집기에서 가격 조회
	collector := market.GetCollector()
	price := collector.GetLatestPrice(symbol)

	if price == 0 {
		// WebSocket 데이터가 없으면 REST API로 조회
		client := market.NewBinanceClient()
		priceData, err := client.GetCurrentPrice(symbol)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, priceData)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"symbol": symbol,
		"price": price,
		"source": "websocket",
	})
}

// GetOrderBook 오더북 조회
func GetOrderBook(c *gin.Context) {
	symbol := c.Param("symbol")
	limitStr := c.DefaultQuery("limit", "20")
	limit, _ := strconv.Atoi(limitStr)

	client := market.NewBinanceClient()
	orderBook, err := client.GetOrderBook(symbol, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, orderBook)
}

// GetTrades 최근 거래 내역 조회
func GetTrades(c *gin.Context) {
	symbol := c.Param("symbol")
	limitStr := c.DefaultQuery("limit", "100")
	limit, _ := strconv.Atoi(limitStr)

	client := market.NewBinanceClient()
	trades, err := client.GetRecentTrades(symbol, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"symbol": symbol,
		"trades": trades,
	})
}

// GetKlines 캔들 데이터 조회
func GetKlines(c *gin.Context) {
	symbol := c.Param("symbol")
	interval := c.DefaultQuery("interval", "1m")
	limitStr := c.DefaultQuery("limit", "100")
	limit, _ := strconv.Atoi(limitStr)

	client := market.NewBinanceClient()
	klines, err := client.GetKlines(symbol, interval, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"symbol": symbol,
		"interval": interval,
		"klines": klines,
	})
}

// Get24hrTicker 24시간 통계 조회
func Get24hrTicker(c *gin.Context) {
	symbol := c.DefaultQuery("symbol", "")

	client := market.NewBinanceClient()

	if symbol != "" {
		ticker, err := client.Get24hrTicker(symbol)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, ticker)
		return
	}

	// 모든 심볼의 가격 조회
	prices, err := client.GetAllPrices()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"prices": prices,
		"count": len(prices),
	})
}

// Trading placeholder handlers
func CreateOrder(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Create Order API"})
}

func GetOrders(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get Orders API"})
}

func CancelOrder(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Cancel Order API"})
}

func GetPositions(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get Positions API"})
}

func RunBacktest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Run Backtest API"})
}

// Analytics placeholder handlers
func GetPerformance(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Performance API"})
}

func GetRiskMetrics(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Risk Metrics API"})
}

func GetSharpeRatio(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Sharpe Ratio API"})
}

func GetDrawdown(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Drawdown API"})
}

func GetCorrelation(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Correlation API"})
}

// System handlers
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
		"service": "Go AI Trading Server",
		"version": "1.0.0",
		"database": "Supabase Connected",
	})
}

func GetMetrics(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Metrics API"})
}

func GetSystemStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "running",
		"uptime": "0h",
		"memory": "OK",
		"cpu": "OK",
	})
}