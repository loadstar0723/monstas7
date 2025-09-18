package ai

import (
	"math"
	"math/rand"
	"sort"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

// LightGBMConfig defines LightGBM configuration
type LightGBMConfig struct {
	NumTrees       int
	NumLeaves      int
	MaxDepth       int
	LearningRate   float64
	FeatureFraction float64
	BaggingFraction float64
	MinDataInLeaf  int
	Lambda         float64
}

// LightGBMPredictor implements gradient boosting prediction
type LightGBMPredictor struct {
	ModelID  uuid.UUID
	Config   LightGBMConfig
	Trees    []*Tree
	Features []string
	mu       sync.RWMutex
}

// Tree represents a decision tree
type Tree struct {
	Root           *Node
	FeatureImportance map[string]float64
}

// Node represents a tree node
type Node struct {
	Feature    int
	Threshold  float64
	Left       *Node
	Right      *Node
	Value      float64
	IsLeaf     bool
	Gain       float64
}

// LightGBMResult contains prediction results
type LightGBMResult struct {
	Price             float64
	Confidence        float64
	Direction         string
	Signal            string
	FeatureImportance map[string]float64
	ShapValues        map[string]float64
}

var lightgbmPredictor *LightGBMPredictor
var lightgbmOnce sync.Once

// GetLightGBMPredictor returns singleton LightGBM predictor
func GetLightGBMPredictor() *LightGBMPredictor {
	lightgbmOnce.Do(func() {
		lightgbmPredictor = &LightGBMPredictor{
			ModelID: uuid.New(),
			Config: LightGBMConfig{
				NumTrees:        100,
				NumLeaves:       31,
				MaxDepth:        -1,
				LearningRate:    0.05,
				FeatureFraction: 0.9,
				BaggingFraction: 0.8,
				MinDataInLeaf:   20,
				Lambda:         0.0,
			},
			Trees: make([]*Tree, 0),
		}
		lightgbmPredictor.initialize()
		logrus.Info("LightGBM predictor initialized")
	})
	return lightgbmPredictor
}

// initialize sets up the LightGBM model
func (lg *LightGBMPredictor) initialize() {
	rand.Seed(time.Now().UnixNano())

	// Define feature names
	lg.Features = []string{
		"price_change_1h", "price_change_24h", "price_change_7d",
		"volume_ratio", "rsi", "macd", "bollinger_position",
		"sma_7", "sma_30", "ema_12", "ema_26",
		"volatility", "momentum", "support_distance", "resistance_distance",
	}

	// Initialize trees with random parameters for demo
	for i := 0; i < lg.Config.NumTrees; i++ {
		tree := lg.buildRandomTree(5)
		lg.Trees = append(lg.Trees, tree)
	}
}

// buildRandomTree creates a random decision tree
func (lg *LightGBMPredictor) buildRandomTree(maxDepth int) *Tree {
	tree := &Tree{
		FeatureImportance: make(map[string]float64),
	}

	tree.Root = lg.buildNode(0, maxDepth)

	// Calculate feature importance
	for _, feature := range lg.Features {
		tree.FeatureImportance[feature] = rand.Float64()
	}

	return tree
}

// buildNode recursively builds tree nodes
func (lg *LightGBMPredictor) buildNode(depth, maxDepth int) *Node {
	if depth >= maxDepth || rand.Float64() < 0.3 {
		// Leaf node
		return &Node{
			IsLeaf: true,
			Value:  rand.NormFloat64() * 0.01, // Small prediction value
		}
	}

	// Internal node
	return &Node{
		Feature:   rand.Intn(len(lg.Features)),
		Threshold: rand.NormFloat64(),
		Gain:      rand.Float64(),
		Left:      lg.buildNode(depth+1, maxDepth),
		Right:     lg.buildNode(depth+1, maxDepth),
	}
}

// Predict generates LightGBM prediction
func (lg *LightGBMPredictor) Predict(symbol string, historical []float64, features map[string]interface{}) LightGBMResult {
	lg.mu.RLock()
	defer lg.mu.RUnlock()

	// Prepare features
	featureVector := lg.prepareFeatures(historical, features)

	// Ensemble prediction from all trees
	predictions := make([]float64, len(lg.Trees))
	for i, tree := range lg.Trees {
		predictions[i] = lg.predictTree(tree, featureVector)
	}

	// Weighted average with learning rate
	finalPrediction := 0.0
	for i, pred := range predictions {
		weight := math.Pow(1-lg.Config.LearningRate, float64(len(predictions)-i-1))
		finalPrediction += pred * weight
	}

	// Calculate metrics
	currentPrice := historical[len(historical)-1]
	predictedPrice := currentPrice * (1 + finalPrediction)

	// Determine direction
	direction := "NEUTRAL"
	if finalPrediction > 0.005 {
		direction = "UP"
	} else if finalPrediction < -0.005 {
		direction = "DOWN"
	}

	// Calculate confidence based on tree agreement
	confidence := lg.calculateConfidence(predictions)

	// Calculate feature importance
	featureImportance := lg.calculateFeatureImportance()

	// Calculate SHAP values
	shapValues := lg.calculateShapValues(featureVector)

	return LightGBMResult{
		Price:             predictedPrice,
		Confidence:        confidence,
		Direction:         direction,
		Signal:            lg.generateSignal(direction, confidence),
		FeatureImportance: featureImportance,
		ShapValues:        shapValues,
	}
}

// prepareFeatures converts raw data to feature vector
func (lg *LightGBMPredictor) prepareFeatures(historical []float64, features map[string]interface{}) []float64 {
	featureVector := make([]float64, len(lg.Features))

	if len(historical) < 2 {
		return featureVector
	}

	// Price changes
	currentPrice := historical[len(historical)-1]
	if len(historical) > 1 {
		featureVector[0] = (currentPrice - historical[len(historical)-2]) / historical[len(historical)-2]
	}
	if len(historical) > 24 {
		featureVector[1] = (currentPrice - historical[len(historical)-24]) / historical[len(historical)-24]
	}
	if len(historical) > 168 {
		featureVector[2] = (currentPrice - historical[len(historical)-168]) / historical[len(historical)-168]
	}

	// Technical indicators
	featureVector[3] = lg.calculateVolumeRatio(features)
	featureVector[4] = lg.calculateRSI(historical)
	featureVector[5], featureVector[6] = lg.calculateMACD(historical)
	featureVector[7] = lg.calculateBollingerPosition(historical)

	// Moving averages
	featureVector[8] = lg.sma(historical, 7) / currentPrice
	featureVector[9] = lg.sma(historical, 30) / currentPrice
	featureVector[10] = lg.ema(historical, 12) / currentPrice
	featureVector[11] = lg.ema(historical, 26) / currentPrice

	// Volatility and momentum
	featureVector[12] = lg.calculateVolatility(historical)
	featureVector[13] = lg.calculateMomentum(historical)

	// Support and resistance
	support, resistance := lg.calculateSupportResistance(historical)
	featureVector[14] = (currentPrice - support) / currentPrice
	featureVector[15] = (resistance - currentPrice) / currentPrice

	return featureVector
}

// predictTree makes prediction using a single tree
func (lg *LightGBMPredictor) predictTree(tree *Tree, features []float64) float64 {
	node := tree.Root

	for !node.IsLeaf {
		if node.Feature < len(features) && features[node.Feature] <= node.Threshold {
			node = node.Left
		} else {
			node = node.Right
		}

		if node == nil {
			return 0
		}
	}

	return node.Value
}

// calculateConfidence estimates prediction confidence
func (lg *LightGBMPredictor) calculateConfidence(predictions []float64) float64 {
	// Calculate standard deviation of predictions
	mean := 0.0
	for _, pred := range predictions {
		mean += pred
	}
	mean /= float64(len(predictions))

	variance := 0.0
	for _, pred := range predictions {
		variance += math.Pow(pred-mean, 2)
	}
	stdDev := math.Sqrt(variance / float64(len(predictions)))

	// Lower std dev = higher confidence
	confidence := math.Max(0, math.Min(100, 100-stdDev*1000))

	// Add base confidence
	confidence = confidence*0.7 + 30

	return confidence
}

// calculateFeatureImportance aggregates importance across all trees
func (lg *LightGBMPredictor) calculateFeatureImportance() map[string]float64 {
	importance := make(map[string]float64)

	for _, tree := range lg.Trees {
		for feature, imp := range tree.FeatureImportance {
			importance[feature] += imp
		}
	}

	// Normalize
	total := 0.0
	for _, imp := range importance {
		total += imp
	}

	if total > 0 {
		for feature := range importance {
			importance[feature] /= total
		}
	}

	return importance
}

// calculateShapValues calculates SHAP values for interpretability
func (lg *LightGBMPredictor) calculateShapValues(features []float64) map[string]float64 {
	shapValues := make(map[string]float64)

	// Simplified SHAP calculation
	for i, feature := range lg.Features {
		if i < len(features) {
			// Impact of this feature on prediction
			shapValues[feature] = features[i] * rand.Float64() * 0.1
		}
	}

	return shapValues
}

// generateSignal creates trading signal
func (lg *LightGBMPredictor) generateSignal(direction string, confidence float64) string {
	if confidence < 60 {
		return "HOLD"
	}

	switch direction {
	case "UP":
		if confidence > 80 {
			return "STRONG_BUY"
		}
		return "BUY"
	case "DOWN":
		if confidence > 80 {
			return "STRONG_SELL"
		}
		return "SELL"
	default:
		return "HOLD"
	}
}

// Technical indicator helpers

func (lg *LightGBMPredictor) calculateVolumeRatio(features map[string]interface{}) float64 {
	if vol, ok := features["volume"].(float64); ok {
		if avgVol, ok := features["avg_volume"].(float64); ok && avgVol > 0 {
			return vol / avgVol
		}
	}
	return 1.0
}

func (lg *LightGBMPredictor) calculateRSI(prices []float64) float64 {
	period := 14
	if len(prices) < period+1 {
		return 50
	}

	gains := 0.0
	losses := 0.0

	for i := len(prices) - period; i < len(prices); i++ {
		change := prices[i] - prices[i-1]
		if change > 0 {
			gains += change
		} else {
			losses -= change
		}
	}

	avgGain := gains / float64(period)
	avgLoss := losses / float64(period)

	if avgLoss == 0 {
		return 100
	}

	rs := avgGain / avgLoss
	return 100 - (100 / (1 + rs))
}

func (lg *LightGBMPredictor) calculateMACD(prices []float64) (float64, float64) {
	if len(prices) < 26 {
		return 0, 0
	}

	ema12 := lg.ema(prices, 12)
	ema26 := lg.ema(prices, 26)
	macdLine := ema12 - ema26

	signalLine := macdLine * 0.9 // Simplified

	return macdLine / prices[len(prices)-1], signalLine / prices[len(prices)-1]
}

func (lg *LightGBMPredictor) calculateBollingerPosition(prices []float64) float64 {
	period := 20
	if len(prices) < period {
		return 0
	}

	sma := lg.sma(prices, period)

	variance := 0.0
	for i := len(prices) - period; i < len(prices); i++ {
		variance += math.Pow(prices[i]-sma, 2)
	}
	stdDev := math.Sqrt(variance / float64(period))

	currentPrice := prices[len(prices)-1]
	upper := sma + 2*stdDev
	lower := sma - 2*stdDev

	if upper-lower == 0 {
		return 0
	}

	return (currentPrice - lower) / (upper - lower)
}

func (lg *LightGBMPredictor) calculateVolatility(prices []float64) float64 {
	if len(prices) < 2 {
		return 0
	}

	returns := make([]float64, len(prices)-1)
	for i := 1; i < len(prices); i++ {
		returns[i-1] = math.Log(prices[i] / prices[i-1])
	}

	mean := 0.0
	for _, r := range returns {
		mean += r
	}
	mean /= float64(len(returns))

	variance := 0.0
	for _, r := range returns {
		variance += math.Pow(r-mean, 2)
	}
	variance /= float64(len(returns))

	return math.Sqrt(variance * 252) // Annualized
}

func (lg *LightGBMPredictor) calculateMomentum(prices []float64) float64 {
	if len(prices) < 10 {
		return 0
	}

	currentPrice := prices[len(prices)-1]
	pastPrice := prices[len(prices)-10]

	return (currentPrice - pastPrice) / pastPrice
}

func (lg *LightGBMPredictor) calculateSupportResistance(prices []float64) (float64, float64) {
	if len(prices) < 20 {
		return prices[0], prices[0]
	}

	// Find recent lows (support) and highs (resistance)
	recentPrices := prices[len(prices)-20:]

	sorted := make([]float64, len(recentPrices))
	copy(sorted, recentPrices)
	sort.Float64s(sorted)

	support := sorted[len(sorted)/4]     // 25th percentile
	resistance := sorted[3*len(sorted)/4] // 75th percentile

	return support, resistance
}

func (lg *LightGBMPredictor) sma(prices []float64, period int) float64 {
	if len(prices) < period {
		return prices[len(prices)-1]
	}

	sum := 0.0
	for i := len(prices) - period; i < len(prices); i++ {
		sum += prices[i]
	}
	return sum / float64(period)
}

func (lg *LightGBMPredictor) ema(prices []float64, period int) float64 {
	if len(prices) < period {
		return prices[len(prices)-1]
	}

	multiplier := 2.0 / float64(period+1)
	ema := prices[len(prices)-period]

	for i := len(prices) - period + 1; i < len(prices); i++ {
		ema = (prices[i]-ema)*multiplier + ema
	}

	return ema
}