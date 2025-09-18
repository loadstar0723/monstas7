package ai

import (
	"encoding/json"
	"math"
	"sync"
	"time"
)

// ARIMAModel represents an ARIMA(p,d,q) model for time series prediction
type ARIMAModel struct {
	P              int       // Autoregressive order
	D              int       // Degree of differencing
	Q              int       // Moving average order
	ARCoefficients []float64 // AR coefficients
	MACoefficients []float64 // MA coefficients
	Intercept      float64
	Residuals      []float64
	FittedValues   []float64
	mu             sync.RWMutex
}

// ARIMAConfig holds configuration for ARIMA model
type ARIMAConfig struct {
	P                int     // AR order
	D                int     // Differencing order
	Q                int     // MA order
	SeasonalP        int     // Seasonal AR order
	SeasonalD        int     // Seasonal differencing
	SeasonalQ        int     // Seasonal MA order
	SeasonalPeriod   int     // Seasonal period (e.g., 24 for hourly data with daily seasonality)
	ConfidenceLevel  float64 // Confidence level for prediction intervals
}

// NewARIMAModel creates a new ARIMA model
func NewARIMAModel() *ARIMAModel {
	return &ARIMAModel{
		P:              2,  // AR(2)
		D:              1,  // First differencing
		Q:              2,  // MA(2)
		ARCoefficients: []float64{0.6, 0.3},  // Initial AR coefficients
		MACoefficients: []float64{0.4, 0.2},  // Initial MA coefficients
		Intercept:      0.0001,
		Residuals:      make([]float64, 0),
		FittedValues:   make([]float64, 0),
	}
}

// Predict generates time series predictions using ARIMA
func (arima *ARIMAModel) Predict(prices []float64, volumes []float64) (*Prediction, error) {
	arima.mu.Lock()
	defer arima.mu.Unlock()

	if len(prices) < 100 {
		return nil, ErrInsufficientData
	}

	// Apply differencing
	diffPrices := arima.difference(prices, arima.D)

	// Fit ARIMA model
	arima.fit(diffPrices)

	currentPrice := prices[len(prices)-1]

	// Generate forecasts
	forecasts := arima.forecast(diffPrices, 24) // 24 steps ahead

	// Convert differenced forecasts back to price levels
	predictions := arima.inverseDifference(prices, forecasts)

	// Calculate prediction intervals
	intervals := arima.calculatePredictionIntervals(forecasts)

	// Analyze seasonality
	seasonalStrength := arima.analyzeSeasonality(prices)

	// Calculate trend
	trend := arima.calculateTrend(prices)

	// Assess model performance
	aic := arima.calculateAIC(diffPrices)
	bic := arima.calculateBIC(diffPrices)

	// Generate confidence based on model metrics
	confidence := arima.calculateConfidence(aic, bic, seasonalStrength)

	// Create predictions for different time horizons
	pred1h := predictions[0]
	pred4h := predictions[3]
	pred24h := predictions[23]

	// Risk assessment
	volatility := calculateVolatility(prices[len(prices)-20:])
	riskLevel := arima.assessRisk(volatility, confidence)

	// Generate trading signals
	priceChange := (pred24h - currentPrice) / currentPrice * 100
	recommendation := arima.generateRecommendation(priceChange, trend, confidence)

	return &Prediction{
		Model:        "ARIMA",
		Symbol:       "BTCUSDT",
		CurrentPrice: currentPrice,
		Predictions: map[string]PricePoint{
			"1h": {
				Price:      pred1h,
				Confidence: confidence * (1 - 0.05*1), // Confidence decreases with time
				Timestamp:  time.Now().Add(1 * time.Hour).Unix(),
			},
			"4h": {
				Price:      pred4h,
				Confidence: confidence * (1 - 0.05*4),
				Timestamp:  time.Now().Add(4 * time.Hour).Unix(),
			},
			"24h": {
				Price:      pred24h,
				Confidence: confidence * (1 - 0.05*24),
				Timestamp:  time.Now().Add(24 * time.Hour).Unix(),
			},
		},
		Confidence: confidence,
		Factors: map[string]float64{
			"ar_order":           float64(arima.P),
			"differencing":       float64(arima.D),
			"ma_order":           float64(arima.Q),
			"aic":                aic,
			"bic":                bic,
			"seasonality":        seasonalStrength,
			"trend":              trend,
			"volatility":         volatility,
			"prediction_interval": intervals[0], // Width of prediction interval
		},
		Recommendation: recommendation,
		RiskLevel:      riskLevel,
		Timestamp:      time.Now().Unix(),
		Targets: []float64{
			currentPrice * 1.01,  // 1% target
			currentPrice * 1.03,  // 3% target
			currentPrice * 1.05,  // 5% target
		},
		StopLoss:   currentPrice * 0.97, // 3% stop loss
		EntryPrice: currentPrice * 1.001,
	}, nil
}

// difference applies differencing to the time series
func (arima *ARIMAModel) difference(data []float64, d int) []float64 {
	result := make([]float64, len(data))
	copy(result, data)

	for i := 0; i < d; i++ {
		temp := make([]float64, len(result)-1)
		for j := 1; j < len(result); j++ {
			temp[j-1] = result[j] - result[j-1]
		}
		result = temp
	}

	return result
}

// inverseDifference reverses the differencing operation
func (arima *ARIMAModel) inverseDifference(original []float64, differenced []float64) []float64 {
	result := make([]float64, len(differenced))
	lastValue := original[len(original)-1]

	for i, diff := range differenced {
		lastValue += diff
		result[i] = lastValue
	}

	return result
}

// fit fits the ARIMA model to the data
func (arima *ARIMAModel) fit(data []float64) {
	if len(data) < arima.P+arima.Q {
		return
	}

	// Simple parameter estimation using Yule-Walker equations for AR
	// and least squares for MA (simplified version)

	// Estimate AR coefficients
	arima.estimateARCoefficients(data)

	// Calculate residuals
	arima.calculateResiduals(data)

	// Estimate MA coefficients
	arima.estimateMACoefficients()

	// Calculate fitted values
	arima.calculateFittedValues(data)
}

// estimateARCoefficients estimates AR coefficients using Yule-Walker
func (arima *ARIMAModel) estimateARCoefficients(data []float64) {
	n := len(data)
	if n < arima.P*2 {
		return
	}

	// Calculate autocorrelations
	acf := arima.calculateACF(data, arima.P)

	// Solve Yule-Walker equations (simplified)
	// For AR(2): φ1 = r1(1-r2)/(1-r1²), φ2 = (r2-r1²)/(1-r1²)
	if arima.P == 2 && len(acf) > 2 {
		r1, r2 := acf[1], acf[2]
		denominator := 1 - r1*r1
		if denominator != 0 {
			arima.ARCoefficients[0] = r1 * (1 - r2) / denominator
			arima.ARCoefficients[1] = (r2 - r1*r1) / denominator
		}
	}

	// Ensure stability (coefficients sum < 1)
	sum := 0.0
	for i := range arima.ARCoefficients {
		sum += math.Abs(arima.ARCoefficients[i])
	}
	if sum >= 1 {
		for i := range arima.ARCoefficients {
			arima.ARCoefficients[i] *= 0.9 / sum
		}
	}
}

// estimateMACoefficients estimates MA coefficients
func (arima *ARIMAModel) estimateMACoefficients() {
	if len(arima.Residuals) < arima.Q*2 {
		return
	}

	// Simple estimation based on residual autocorrelations
	acf := arima.calculateACF(arima.Residuals, arima.Q)

	for i := 0; i < arima.Q && i < len(acf)-1; i++ {
		arima.MACoefficients[i] = -acf[i+1] * 0.8 // Damping factor for stability
	}
}

// calculateACF calculates autocorrelation function
func (arima *ARIMAModel) calculateACF(data []float64, maxLag int) []float64 {
	n := len(data)
	if n == 0 {
		return []float64{}
	}

	mean := 0.0
	for _, v := range data {
		mean += v
	}
	mean /= float64(n)

	// Calculate variance
	variance := 0.0
	for _, v := range data {
		diff := v - mean
		variance += diff * diff
	}
	variance /= float64(n)

	if variance == 0 {
		return make([]float64, maxLag+1)
	}

	// Calculate autocorrelations
	acf := make([]float64, maxLag+1)
	acf[0] = 1.0 // Lag 0 is always 1

	for lag := 1; lag <= maxLag && lag < n; lag++ {
		covariance := 0.0
		for i := lag; i < n; i++ {
			covariance += (data[i] - mean) * (data[i-lag] - mean)
		}
		covariance /= float64(n - lag)
		acf[lag] = covariance / variance
	}

	return acf
}

// calculateResiduals calculates model residuals
func (arima *ARIMAModel) calculateResiduals(data []float64) {
	n := len(data)
	arima.Residuals = make([]float64, n)

	for i := arima.P; i < n; i++ {
		// AR part
		arPrediction := arima.Intercept
		for j := 0; j < arima.P && j < len(arima.ARCoefficients); j++ {
			if i-j-1 >= 0 {
				arPrediction += arima.ARCoefficients[j] * data[i-j-1]
			}
		}

		arima.Residuals[i] = data[i] - arPrediction
	}
}

// calculateFittedValues calculates fitted values
func (arima *ARIMAModel) calculateFittedValues(data []float64) {
	n := len(data)
	arima.FittedValues = make([]float64, n)

	for i := 0; i < n; i++ {
		fitted := arima.Intercept

		// AR part
		for j := 0; j < arima.P && j < len(arima.ARCoefficients); j++ {
			if i-j-1 >= 0 {
				fitted += arima.ARCoefficients[j] * data[i-j-1]
			}
		}

		// MA part
		for j := 0; j < arima.Q && j < len(arima.MACoefficients); j++ {
			if i-j-1 >= 0 && i-j-1 < len(arima.Residuals) {
				fitted += arima.MACoefficients[j] * arima.Residuals[i-j-1]
			}
		}

		arima.FittedValues[i] = fitted
	}
}

// forecast generates future predictions
func (arima *ARIMAModel) forecast(data []float64, steps int) []float64 {
	forecasts := make([]float64, steps)
	n := len(data)

	// Extend data with forecasts
	extendedData := make([]float64, n+steps)
	copy(extendedData, data)

	// Generate forecasts iteratively
	for h := 0; h < steps; h++ {
		forecast := arima.Intercept

		// AR part
		for i := 0; i < arima.P && i < len(arima.ARCoefficients); i++ {
			if n+h-i-1 >= 0 {
				forecast += arima.ARCoefficients[i] * extendedData[n+h-i-1]
			}
		}

		// MA part (using residuals for in-sample, 0 for out-of-sample)
		for i := 0; i < arima.Q && i < len(arima.MACoefficients); i++ {
			if n+h-i-1 < len(arima.Residuals) && n+h-i-1 >= 0 {
				forecast += arima.MACoefficients[i] * arima.Residuals[n+h-i-1]
			}
		}

		forecasts[h] = forecast
		extendedData[n+h] = forecast
	}

	return forecasts
}

// calculatePredictionIntervals calculates prediction intervals
func (arima *ARIMAModel) calculatePredictionIntervals(forecasts []float64) []float64 {
	intervals := make([]float64, len(forecasts))

	// Calculate residual standard deviation
	residualStd := 0.0
	if len(arima.Residuals) > 0 {
		for _, r := range arima.Residuals {
			residualStd += r * r
		}
		residualStd = math.Sqrt(residualStd / float64(len(arima.Residuals)))
	} else {
		residualStd = 0.01 // Default value
	}

	// Prediction intervals widen as we forecast further
	for i := range intervals {
		intervals[i] = 1.96 * residualStd * math.Sqrt(float64(i+1)) // 95% confidence interval
	}

	return intervals
}

// analyzeSeasonality analyzes seasonal patterns
func (arima *ARIMAModel) analyzeSeasonality(prices []float64) float64 {
	if len(prices) < 48 { // Need at least 48 hours of data
		return 0
	}

	// Simple seasonality measure using variance ratio
	// Compare variance of seasonal differences to overall variance

	period := 24 // Daily seasonality for hourly data
	seasonalDiff := make([]float64, 0)

	for i := period; i < len(prices); i++ {
		seasonalDiff = append(seasonalDiff, prices[i]-prices[i-period])
	}

	if len(seasonalDiff) == 0 {
		return 0
	}

	// Calculate variance of seasonal differences
	meanDiff := 0.0
	for _, d := range seasonalDiff {
		meanDiff += d
	}
	meanDiff /= float64(len(seasonalDiff))

	varDiff := 0.0
	for _, d := range seasonalDiff {
		varDiff += (d - meanDiff) * (d - meanDiff)
	}
	varDiff /= float64(len(seasonalDiff))

	// Calculate overall variance
	overallVar := calculateVolatility(prices) * calculateVolatility(prices)

	if overallVar == 0 {
		return 0
	}

	// Seasonality strength (0 to 1)
	seasonality := 1 - (varDiff / overallVar)
	if seasonality < 0 {
		seasonality = 0
	}
	if seasonality > 1 {
		seasonality = 1
	}

	return seasonality
}

// calculateTrend calculates trend strength and direction
func (arima *ARIMAModel) calculateTrend(prices []float64) float64 {
	if len(prices) < 20 {
		return 0
	}

	// Simple linear trend using least squares
	n := len(prices)
	sumX, sumY, sumXY, sumX2 := 0.0, 0.0, 0.0, 0.0

	for i := 0; i < n; i++ {
		x := float64(i)
		y := prices[i]
		sumX += x
		sumY += y
		sumXY += x * y
		sumX2 += x * x
	}

	// Calculate slope
	denominator := float64(n)*sumX2 - sumX*sumX
	if denominator == 0 {
		return 0
	}

	slope := (float64(n)*sumXY - sumX*sumY) / denominator

	// Normalize trend by average price
	avgPrice := sumY / float64(n)
	if avgPrice == 0 {
		return 0
	}

	trend := slope / avgPrice * 100 // Trend as percentage

	return trend
}

// calculateAIC calculates Akaike Information Criterion
func (arima *ARIMAModel) calculateAIC(data []float64) float64 {
	n := float64(len(data))
	if n == 0 {
		return 0
	}

	// Calculate sum of squared residuals
	sse := 0.0
	for _, r := range arima.Residuals {
		sse += r * r
	}

	// Number of parameters
	k := float64(arima.P + arima.Q + 1) // AR + MA + intercept

	// AIC = n*ln(SSE/n) + 2*k
	aic := n*math.Log(sse/n) + 2*k

	return aic
}

// calculateBIC calculates Bayesian Information Criterion
func (arima *ARIMAModel) calculateBIC(data []float64) float64 {
	n := float64(len(data))
	if n == 0 {
		return 0
	}

	// Calculate sum of squared residuals
	sse := 0.0
	for _, r := range arima.Residuals {
		sse += r * r
	}

	// Number of parameters
	k := float64(arima.P + arima.Q + 1)

	// BIC = n*ln(SSE/n) + k*ln(n)
	bic := n*math.Log(sse/n) + k*math.Log(n)

	return bic
}

// calculateConfidence calculates model confidence
func (arima *ARIMAModel) calculateConfidence(aic, bic, seasonality float64) float64 {
	// Base confidence on model fit metrics
	// Lower AIC/BIC is better
	baseConfidence := 0.7

	// Adjust based on AIC (normalized)
	aicFactor := 1.0 / (1.0 + math.Abs(aic)/1000.0)

	// Adjust based on seasonality strength
	seasonalityFactor := 0.5 + seasonality*0.5

	confidence := baseConfidence * aicFactor * seasonalityFactor

	// Ensure confidence is between 0.4 and 0.95
	if confidence > 0.95 {
		confidence = 0.95
	}
	if confidence < 0.4 {
		confidence = 0.4
	}

	return confidence
}

// generateRecommendation generates trading recommendation
func (arima *ARIMAModel) generateRecommendation(priceChange, trend, confidence float64) string {
	if confidence < 0.6 {
		return "HOLD - Low model confidence"
	}

	// Combine price change and trend for decision
	signal := priceChange*0.6 + trend*0.4

	if signal > 2 && confidence > 0.75 {
		return "STRONG BUY - ARIMA forecasts significant upward movement"
	} else if signal > 0.5 {
		return "BUY - Positive forecast with moderate confidence"
	} else if signal < -2 && confidence > 0.75 {
		return "STRONG SELL - ARIMA forecasts significant downward movement"
	} else if signal < -0.5 {
		return "SELL - Negative forecast with moderate confidence"
	}

	return "HOLD - No clear directional signal from time series"
}

// assessRisk assesses risk level
func (arima *ARIMAModel) assessRisk(volatility, confidence float64) string {
	// Risk based on volatility and model uncertainty
	risk := volatility * (1 - confidence)

	if risk > 0.05 {
		return "HIGH"
	} else if risk > 0.02 {
		return "MEDIUM"
	}
	return "LOW"
}

// ToJSON converts model to JSON
func (arima *ARIMAModel) ToJSON() ([]byte, error) {
	return json.Marshal(struct {
		Model          string    `json:"model"`
		P              int       `json:"p"`
		D              int       `json:"d"`
		Q              int       `json:"q"`
		ARCoefficients []float64 `json:"ar_coefficients"`
		MACoefficients []float64 `json:"ma_coefficients"`
		Intercept      float64   `json:"intercept"`
		ResidualCount  int       `json:"residual_count"`
	}{
		Model:          "ARIMA",
		P:              arima.P,
		D:              arima.D,
		Q:              arima.Q,
		ARCoefficients: arima.ARCoefficients,
		MACoefficients: arima.MACoefficients,
		Intercept:      arima.Intercept,
		ResidualCount:  len(arima.Residuals),
	})
}
// GetARIMAPredictor returns ARIMA predictor instance
func GetARIMAPredictor() *ARIMAModel {
	return &ARIMAModel{
		P:        2,
		D:        1,
		Q:        2,
	}
}
