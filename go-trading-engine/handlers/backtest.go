package handlers

import (
	"math"
	"math/rand"
	"time"

	"github.com/gin-gonic/gin"
)

// BacktestRequest 백테스트 요청 구조체
type BacktestRequest struct {
	Symbol    string    `json:"symbol"`
	Model     string    `json:"model"`
	StartDate time.Time `json:"startDate"`
	EndDate   time.Time `json:"endDate"`
}

// BacktestResult 백테스트 결과
type BacktestResult struct {
	Timestamp        string  `json:"timestamp"`
	ActualPrice      float64 `json:"actualPrice"`
	PredictedPrice   float64 `json:"predictedPrice"`
	Profit           float64 `json:"profit"`
	CumulativeProfit float64 `json:"cumulativeProfit"`
	Drawdown         float64 `json:"drawdown"`
	Signal           string  `json:"signal"`
	Confidence       float64 `json:"confidence"`
}

// RunBacktest 백테스트 실행
func RunBacktest(c *gin.Context) {
	var request BacktestRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// 백테스트 결과 생성
	days := int(request.EndDate.Sub(request.StartDate).Hours() / 24)
	results := make([]BacktestResult, 0, days)
	cumProfit := 0.0
	wins := 0
	totalTrades := 0
	maxDrawdown := 0.0
	profits := []float64{}
	losses := []float64{}

	for i := 0; i < days; i++ {
		date := request.StartDate.Add(time.Duration(i) * 24 * time.Hour)

		// 실제로는 과거 데이터를 가져와야 하지만, 시뮬레이션
		actualPrice := 50000 + float64(i)*100 + (rand.Float64()-0.5)*2000
		predictedPrice := actualPrice + (rand.Float64()-0.5)*1000
		profit := (predictedPrice - actualPrice) / actualPrice * 100
		cumProfit += profit

		if profit > 0 {
			wins++
			profits = append(profits, profit)
		} else {
			losses = append(losses, math.Abs(profit))
		}
		totalTrades++

		drawdown := math.Min(cumProfit-math.Max(cumProfit, 0), maxDrawdown)
		if drawdown < maxDrawdown {
			maxDrawdown = drawdown
		}

		signal := "HOLD"
		if predictedPrice > actualPrice*1.01 {
			signal = "BUY"
		} else if predictedPrice < actualPrice*0.99 {
			signal = "SELL"
		}

		results = append(results, BacktestResult{
			Timestamp:        date.Format("2006-01-02"),
			ActualPrice:      actualPrice,
			PredictedPrice:   predictedPrice,
			Profit:           profit,
			CumulativeProfit: cumProfit,
			Drawdown:         drawdown,
			Signal:           signal,
			Confidence:       60 + rand.Float64()*40,
		})
	}

	// 메트릭 계산
	winRate := float64(wins) / float64(totalTrades) * 100

	avgProfit := 0.0
	if len(profits) > 0 {
		for _, p := range profits {
			avgProfit += p
		}
		avgProfit /= float64(len(profits))
	}

	avgLoss := 0.0
	if len(losses) > 0 {
		for _, l := range losses {
			avgLoss += l
		}
		avgLoss /= float64(len(losses))
	}

	profitFactor := 1.0
	if avgLoss > 0 {
		profitFactor = avgProfit / avgLoss
	}

	// 샤프 비율 계산 (간단한 버전)
	sharpeRatio := cumProfit / math.Sqrt(float64(days))

	c.JSON(200, gin.H{
		"results": results,
		"metrics": gin.H{
			"totalTrades":  totalTrades,
			"winRate":      winRate,
			"totalReturn":  cumProfit,
			"maxDrawdown":  maxDrawdown,
			"sharpeRatio":  sharpeRatio,
			"avgProfit":    avgProfit,
			"avgLoss":      avgLoss,
			"profitFactor": profitFactor,
		},
	})
}