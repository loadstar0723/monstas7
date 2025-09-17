package handlers

import (
	"math/rand"
	"time"

	"github.com/gin-gonic/gin"
)

// DynamicAnalysisRequest 동적 분석 요청
type DynamicAnalysisRequest struct {
	Symbol string `json:"symbol"`
	Type   string `json:"type"`
}

// GetDynamicAnalysis 동적 분석 제공
func GetDynamicAnalysis(c *gin.Context) {
	analysisType := c.Param("type")

	var request DynamicAnalysisRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	response := gin.H{
		"type":       analysisType,
		"symbol":     request.Symbol,
		"timestamp":  time.Now(),
		"confidence": 70 + rand.Float64()*30,
	}

	switch analysisType {
	case "architecture":
		// LSTM 아키텍처 분석
		response["gates"] = gin.H{
			"forget":    75 + rand.Float64()*10,
			"input":     70 + rand.Float64()*15,
			"output":    80 + rand.Float64()*10,
			"candidate": 65 + rand.Float64()*20,
		}
		response["memory"] = gin.H{
			"usage":     60 + rand.Float64()*30,
			"capacity":  100,
			"available": 40 - rand.Float64()*10,
		}

	case "performance":
		// 성능 메트릭
		response["metrics"] = gin.H{
			"accuracy":    75 + rand.Float64()*20,
			"precision":   70 + rand.Float64()*20,
			"recall":      72 + rand.Float64()*18,
			"f1Score":     71 + rand.Float64()*19,
			"maxDrawdown": -5 - rand.Float64()*10,
		}

	case "backtesting":
		// 백테스팅 메트릭
		response["metrics"] = gin.H{
			"winRate":     55 + rand.Float64()*20,
			"sharpeRatio": 1.5 + rand.Float64()*1.5,
			"totalReturn": 10 + rand.Float64()*30,
			"maxDrawdown": -5 - rand.Float64()*15,
		}

	case "realtime":
		// 실시간 신호
		actions := []string{"BUY", "SELL", "NEUTRAL"}
		response["signal"] = gin.H{
			"action":   actions[rand.Intn(3)],
			"strength": 40 + rand.Float64()*60,
		}
		response["volatility"] = 0.5 + rand.Float64()*3
	}

	// 시장 분석 추가
	trends := []string{"UP", "DOWN", "NEUTRAL"}
	response["market"] = gin.H{
		"trend":      trends[rand.Intn(3)],
		"strength":   50 + rand.Float64()*50,
		"volatility": 1 + rand.Float64()*2,
		"support":    49000 + rand.Float64()*1000,
		"resistance": 51000 + rand.Float64()*1000,
		"rsi":        30 + rand.Float64()*40,
		"macd":       -100 + rand.Float64()*200,
	}

	c.JSON(200, response)
}