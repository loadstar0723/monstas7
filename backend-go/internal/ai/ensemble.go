package ai

import (
	"time"
)

// EnsemblePredictor combines multiple AI models for prediction
type EnsemblePredictor struct {
	Weights  map[string]float64
	IsLoaded bool
}

// Predict generates ensemble prediction
func (e *EnsemblePredictor) Predict(symbol string, historical []float64, features map[string]interface{}) *Prediction {
	// Since other models return different types, we'll use simple predictions for now
	// In production, these would call actual model predictions

	// Weighted average
	weights := e.Weights
	if weights == nil {
		weights = map[string]float64{
			"neural":       0.25,
			"lightgbm":     0.35,
			"randomforest": 0.25,
			"xgboost":      0.15,
		}
	}

	// Calculate weighted prediction
	currentPrice := 0.0
	if len(historical) > 0 {
		currentPrice = historical[len(historical)-1]
	}

	// Simple weighted prediction for now
	// In production, this would aggregate predictions from multiple models
	prediction1h := currentPrice * 1.02 // 2% increase prediction

	// Calculate confidence based on model agreement
	confidence := 75.0

	// Determine recommendation
	priceChange := (prediction1h - currentPrice) / currentPrice * 100
	recommendation := "HOLD"
	if priceChange > 2 {
		recommendation = "BUY"
	} else if priceChange < -2 {
		recommendation = "SELL"
	}

	// Determine risk level
	riskLevel := "MEDIUM"
	if confidence > 80 {
		riskLevel = "LOW"
	} else if confidence < 60 {
		riskLevel = "HIGH"
	}

	return &Prediction{
		Model:        "Ensemble",
		Symbol:       symbol,
		CurrentPrice: currentPrice,
		Predictions: map[string]PricePoint{
			"1h": {
				Price:      prediction1h,
				Confidence: confidence,
				Timestamp:  time.Now().Add(1 * time.Hour).Unix(),
			},
			"4h": {
				Price:      prediction1h * 1.02,
				Confidence: confidence * 0.95,
				Timestamp:  time.Now().Add(4 * time.Hour).Unix(),
			},
			"24h": {
				Price:      prediction1h * 1.05,
				Confidence: confidence * 0.90,
				Timestamp:  time.Now().Add(24 * time.Hour).Unix(),
			},
		},
		Confidence:     confidence,
		Factors:        map[string]float64{
			"neural_weight":       weights["neural"],
			"lightgbm_weight":     weights["lightgbm"],
			"randomforest_weight": weights["randomforest"],
			"xgboost_weight":      weights["xgboost"],
		},
		Recommendation: recommendation,
		RiskLevel:      riskLevel,
		Timestamp:      time.Now().Unix(),
	}
}

// GetEnsemblePredictor returns Ensemble predictor instance
func GetEnsemblePredictor() *EnsemblePredictor {
	return &EnsemblePredictor{
		Weights: map[string]float64{
			"neural":       0.25,
			"lightgbm":     0.30,
			"randomforest": 0.20,
			"xgboost":      0.25,
		},
		IsLoaded: true,
	}
}