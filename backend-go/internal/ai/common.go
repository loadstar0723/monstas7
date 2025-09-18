package ai

import (
	"errors"
	"math"
)

// Common errors
var (
	ErrInsufficientData = errors.New("insufficient data for prediction")
	ErrModelNotTrained  = errors.New("model is not trained")
	ErrInvalidInput     = errors.New("invalid input data")
)

// Prediction represents a unified prediction result for all AI models
type Prediction struct {
	Model          string                 `json:"model"`
	Symbol         string                 `json:"symbol"`
	CurrentPrice   float64                `json:"current_price"`
	Predictions    map[string]PricePoint  `json:"predictions"`
	Confidence     float64                `json:"confidence"`
	Factors        map[string]float64     `json:"factors"`
	Recommendation string                 `json:"recommendation"`
	RiskLevel      string                 `json:"risk_level"`
	Timestamp      int64                  `json:"timestamp"`
	Targets        []float64              `json:"targets,omitempty"`
	StopLoss       float64                `json:"stop_loss,omitempty"`
	EntryPrice     float64                `json:"entry_price,omitempty"`
}

// PricePoint represents a predicted price at a specific time
type PricePoint struct {
	Price      float64 `json:"price"`
	Confidence float64 `json:"confidence"`
	Timestamp  int64   `json:"timestamp"`
}

// Common helper functions

// calculateSMA calculates Simple Moving Average
func calculateSMA(prices []float64, period int) float64 {
	if len(prices) < period {
		return 0
	}

	sum := 0.0
	for i := len(prices) - period; i < len(prices); i++ {
		sum += prices[i]
	}
	return sum / float64(period)
}

// calculateEMA calculates Exponential Moving Average
func calculateEMA(prices []float64, period int) float64 {
	if len(prices) < period {
		return 0
	}

	multiplier := 2.0 / float64(period+1)
	ema := calculateSMA(prices[:period], period)

	for i := period; i < len(prices); i++ {
		ema = (prices[i]-ema)*multiplier + ema
	}

	return ema
}

// calculateRSI calculates Relative Strength Index
func calculateRSI(prices []float64) float64 {
	if len(prices) < 15 {
		return 50
	}

	gains := 0.0
	losses := 0.0

	for i := 1; i < len(prices); i++ {
		change := prices[i] - prices[i-1]
		if change > 0 {
			gains += change
		} else {
			losses += -change
		}
	}

	avgGain := gains / float64(len(prices)-1)
	avgLoss := losses / float64(len(prices)-1)

	if avgLoss == 0 {
		return 100
	}

	rs := avgGain / avgLoss
	rsi := 100 - (100 / (1 + rs))

	return rsi
}

// calculateMACD calculates MACD indicator
func calculateMACD(prices []float64) float64 {
	if len(prices) < 26 {
		return 0
	}

	ema12 := calculateEMA(prices, 12)
	ema26 := calculateEMA(prices, 26)

	return ema12 - ema26
}

// calculateVolatility calculates price volatility (standard deviation)
func calculateVolatility(prices []float64) float64 {
	if len(prices) < 2 {
		return 0
	}

	// Calculate returns
	returns := make([]float64, len(prices)-1)
	for i := 1; i < len(prices); i++ {
		returns[i-1] = (prices[i] - prices[i-1]) / prices[i-1]
	}

	// Calculate mean return
	mean := 0.0
	for _, r := range returns {
		mean += r
	}
	mean /= float64(len(returns))

	// Calculate variance
	variance := 0.0
	for _, r := range returns {
		diff := r - mean
		variance += diff * diff
	}
	variance /= float64(len(returns))

	// Return standard deviation
	return math.Sqrt(variance)
}

// calculateBollingerBands calculates Bollinger Bands
func calculateBollingerBands(prices []float64, period int, numStdDev float64) (upper, middle, lower float64) {
	if len(prices) < period {
		return 0, 0, 0
	}

	middle = calculateSMA(prices[len(prices)-period:], period)

	// Calculate standard deviation
	variance := 0.0
	for i := len(prices) - period; i < len(prices); i++ {
		diff := prices[i] - middle
		variance += diff * diff
	}
	stdDev := math.Sqrt(variance / float64(period))

	upper = middle + numStdDev*stdDev
	lower = middle - numStdDev*stdDev

	return upper, middle, lower
}

// calculateStochastic calculates Stochastic oscillator
func calculateStochastic(high, low, close []float64, period int) float64 {
	if len(high) < period || len(low) < period || len(close) < period {
		return 50
	}

	// Find highest high and lowest low in period
	highestHigh := high[len(high)-period]
	lowestLow := low[len(low)-period]

	for i := len(high) - period + 1; i < len(high); i++ {
		if high[i] > highestHigh {
			highestHigh = high[i]
		}
		if low[i] < lowestLow {
			lowestLow = low[i]
		}
	}

	// Calculate %K
	currentClose := close[len(close)-1]
	if highestHigh == lowestLow {
		return 50
	}

	k := ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100
	return k
}

// normalizeData normalizes data to [0, 1] range
func normalizeData(data []float64) []float64 {
	if len(data) == 0 {
		return data
	}

	min, max := data[0], data[0]
	for _, v := range data {
		if v < min {
			min = v
		}
		if v > max {
			max = v
		}
	}

	if max == min {
		normalized := make([]float64, len(data))
		for i := range normalized {
			normalized[i] = 0.5
		}
		return normalized
	}

	normalized := make([]float64, len(data))
	for i, v := range data {
		normalized[i] = (v - min) / (max - min)
	}

	return normalized
}

// sigmoid activation function
func sigmoid(x float64) float64 {
	return 1.0 / (1.0 + math.Exp(-x))
}

// tanh activation function
func tanh(x float64) float64 {
	return math.Tanh(x)
}

// relu activation function
func relu(x float64) float64 {
	if x < 0 {
		return 0
	}
	return x
}