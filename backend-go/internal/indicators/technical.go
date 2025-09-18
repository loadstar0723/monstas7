package indicators

import (
	"math"
)

// CalculateRSI calculates the Relative Strength Index
func CalculateRSI(prices []float64, period int) float64 {
	if len(prices) < period+1 {
		return 50.0 // 중립값 반환
	}

	gains := make([]float64, 0)
	losses := make([]float64, 0)

	// 가격 변화 계산
	for i := 1; i < len(prices); i++ {
		change := prices[i] - prices[i-1]
		if change > 0 {
			gains = append(gains, change)
			losses = append(losses, 0)
		} else {
			gains = append(gains, 0)
			losses = append(losses, math.Abs(change))
		}
	}

	// 첫 번째 평균 계산
	avgGain := 0.0
	avgLoss := 0.0
	for i := 0; i < period && i < len(gains); i++ {
		avgGain += gains[i]
		avgLoss += losses[i]
	}
	avgGain /= float64(period)
	avgLoss /= float64(period)

	// Wilder's smoothing method
	for i := period; i < len(gains); i++ {
		avgGain = (avgGain*float64(period-1) + gains[i]) / float64(period)
		avgLoss = (avgLoss*float64(period-1) + losses[i]) / float64(period)
	}

	if avgLoss == 0 {
		return 100.0
	}

	rs := avgGain / avgLoss
	rsi := 100.0 - (100.0 / (1.0 + rs))

	return rsi
}

// CalculateMACD calculates the MACD indicator
func CalculateMACD(prices []float64, fastPeriod, slowPeriod, signalPeriod int) (macd, signal, histogram float64) {
	if len(prices) < slowPeriod {
		return 0, 0, 0
	}

	// EMA 계산
	fastEMA := calculateEMA(prices, fastPeriod)
	slowEMA := calculateEMA(prices, slowPeriod)

	// MACD line
	macd = fastEMA - slowEMA

	// Signal line (9-day EMA of MACD)
	macdValues := make([]float64, 0)
	for i := slowPeriod - 1; i < len(prices); i++ {
		fast := calculateEMAAtIndex(prices[:i+1], fastPeriod)
		slow := calculateEMAAtIndex(prices[:i+1], slowPeriod)
		macdValues = append(macdValues, fast-slow)
	}

	if len(macdValues) >= signalPeriod {
		signal = calculateEMA(macdValues, signalPeriod)
	}

	// Histogram
	histogram = macd - signal

	return macd, signal, histogram
}

// CalculateBollingerBands calculates the Bollinger Bands
func CalculateBollingerBands(prices []float64, period int, stdDevMultiplier float64) (upper, middle, lower float64) {
	if len(prices) < period {
		return 0, 0, 0
	}

	// SMA 계산 (중간 밴드)
	sum := 0.0
	for i := len(prices) - period; i < len(prices); i++ {
		sum += prices[i]
	}
	middle = sum / float64(period)

	// 표준편차 계산
	variance := 0.0
	for i := len(prices) - period; i < len(prices); i++ {
		variance += math.Pow(prices[i]-middle, 2)
	}
	stdDev := math.Sqrt(variance / float64(period))

	// Upper and Lower bands
	upper = middle + (stdDevMultiplier * stdDev)
	lower = middle - (stdDevMultiplier * stdDev)

	return upper, middle, lower
}

// CalculateSMA calculates Simple Moving Average
func CalculateSMA(prices []float64, period int) float64 {
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
	ema := calculateSMAAtIndex(prices[:period], period)

	for i := period; i < len(prices); i++ {
		ema = ((prices[i] - ema) * multiplier) + ema
	}

	return ema
}

// calculateEMAAtIndex calculates EMA at specific index
func calculateEMAAtIndex(prices []float64, period int) float64 {
	if len(prices) < period {
		return 0
	}

	multiplier := 2.0 / float64(period+1)
	ema := calculateSMAAtIndex(prices[:period], period)

	for i := period; i < len(prices); i++ {
		ema = ((prices[i] - ema) * multiplier) + ema
	}

	return ema
}

// calculateSMAAtIndex calculates SMA at specific index
func calculateSMAAtIndex(prices []float64, period int) float64 {
	if len(prices) < period {
		return 0
	}

	sum := 0.0
	for i := 0; i < period; i++ {
		sum += prices[i]
	}
	return sum / float64(period)
}

// CalculateVolume calculates volume-based indicators
func CalculateVolume(volumes []float64, period int) float64 {
	if len(volumes) < period {
		return 0
	}

	sum := 0.0
	for i := len(volumes) - period; i < len(volumes); i++ {
		sum += volumes[i]
	}
	return sum / float64(period)
}

// TechnicalAnalysis performs complete technical analysis
type TechnicalAnalysis struct {
	RSI        float64
	MACD       float64
	MACDSignal float64
	MACDHist   float64
	BB_Upper   float64
	BB_Middle  float64
	BB_Lower   float64
	SMA20      float64
	SMA50      float64
	EMA12      float64
	EMA26      float64
	Volume     float64
}

// AnalyzeTechnicals performs comprehensive technical analysis on price data
func AnalyzeTechnicals(prices []float64, volumes []float64) *TechnicalAnalysis {
	analysis := &TechnicalAnalysis{}

	if len(prices) > 14 {
		analysis.RSI = CalculateRSI(prices, 14)
	}

	if len(prices) > 26 {
		analysis.MACD, analysis.MACDSignal, analysis.MACDHist = CalculateMACD(prices, 12, 26, 9)
		analysis.BB_Upper, analysis.BB_Middle, analysis.BB_Lower = CalculateBollingerBands(prices, 20, 2.0)
	}

	if len(prices) > 20 {
		analysis.SMA20 = CalculateSMA(prices, 20)
	}

	if len(prices) > 50 {
		analysis.SMA50 = CalculateSMA(prices, 50)
	}

	if len(prices) > 12 {
		analysis.EMA12 = calculateEMA(prices, 12)
	}

	if len(prices) > 26 {
		analysis.EMA26 = calculateEMA(prices, 26)
	}

	if len(volumes) > 20 {
		analysis.Volume = CalculateVolume(volumes, 20)
	}

	return analysis
}