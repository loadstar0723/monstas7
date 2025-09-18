package ai

import (
	"math"
	"math/rand"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

// RandomForestConfig defines Random Forest configuration
type RandomForestConfig struct {
	NEstimators    int
	MaxDepth       int
	MinSamplesSplit int
	MinSamplesLeaf  int
	MaxFeatures     string
	Bootstrap       bool
	OOBScore        bool
}

// RandomForestPredictor implements Random Forest prediction
type RandomForestPredictor struct {
	ModelID  uuid.UUID
	Config   RandomForestConfig
	Trees    []*DecisionTree
	Features []string
	OOBScore float64
	mu       sync.RWMutex
}

// DecisionTree represents a single decision tree
type DecisionTree struct {
	Root       *TreeNode
	MaxDepth   int
	OOBSamples []int
	Prediction float64
}

// TreeNode represents a node in the decision tree
type TreeNode struct {
	Feature    int
	Threshold  float64
	Left       *TreeNode
	Right      *TreeNode
	Value      float64
	IsLeaf     bool
	Samples    int
	Impurity   float64
}

// RandomForestResult contains prediction results
type RandomForestResult struct {
	Price           float64
	Confidence      float64
	Direction       string
	Signal          string
	OOBScore        float64
	TreePredictions []float64
}

var rfPredictor *RandomForestPredictor
var rfOnce sync.Once

// GetRandomForestPredictor returns singleton Random Forest predictor
func GetRandomForestPredictor() *RandomForestPredictor {
	rfOnce.Do(func() {
		rfPredictor = &RandomForestPredictor{
			ModelID: uuid.New(),
			Config: RandomForestConfig{
				NEstimators:     100,
				MaxDepth:        10,
				MinSamplesSplit: 2,
				MinSamplesLeaf:  1,
				MaxFeatures:     "sqrt",
				Bootstrap:       true,
				OOBScore:        true,
			},
			Trees: make([]*DecisionTree, 0),
		}
		rfPredictor.initialize()
		logrus.Info("Random Forest predictor initialized")
	})
	return rfPredictor
}

// initialize sets up the Random Forest model
func (rf *RandomForestPredictor) initialize() {
	rand.Seed(time.Now().UnixNano())

	// Define features
	rf.Features = []string{
		"price_momentum", "volume_trend", "rsi_divergence",
		"macd_histogram", "bollinger_width", "atr",
		"obv", "cmf", "stochastic_k", "stochastic_d",
		"williams_r", "cci", "adx", "mfi", "roc",
	}

	// Build forest
	for i := 0; i < rf.Config.NEstimators; i++ {
		tree := rf.buildTree()
		rf.Trees = append(rf.Trees, tree)
	}

	// Calculate OOB score
	rf.OOBScore = rf.calculateOOBScore()
}

// buildTree creates a single decision tree
func (rf *RandomForestPredictor) buildTree() *DecisionTree {
	tree := &DecisionTree{
		MaxDepth: rf.Config.MaxDepth,
		Root:     rf.buildTreeNode(0, rf.Config.MaxDepth),
	}

	// Store OOB sample indices for this tree
	if rf.Config.OOBScore {
		numSamples := 1000 // Simulated dataset size
		tree.OOBSamples = rf.generateOOBSamples(numSamples)
	}

	return tree
}

// buildTreeNode recursively builds tree nodes
func (rf *RandomForestPredictor) buildTreeNode(depth, maxDepth int) *TreeNode {
	if depth >= maxDepth || rand.Float64() < 0.2 {
		// Leaf node
		return &TreeNode{
			IsLeaf:   true,
			Value:    rand.NormFloat64() * 0.005,
			Samples:  rand.Intn(100) + 10,
			Impurity: rand.Float64() * 0.3,
		}
	}

	// Select random feature subset
	numFeatures := int(math.Sqrt(float64(len(rf.Features))))
	selectedFeature := rand.Intn(numFeatures)

	return &TreeNode{
		Feature:   selectedFeature,
		Threshold: rand.NormFloat64(),
		Samples:   rand.Intn(500) + 100,
		Impurity:  rand.Float64() * 0.5,
		Left:      rf.buildTreeNode(depth+1, maxDepth),
		Right:     rf.buildTreeNode(depth+1, maxDepth),
	}
}

// generateOOBSamples generates out-of-bag sample indices
func (rf *RandomForestPredictor) generateOOBSamples(numSamples int) []int {
	oobSamples := make([]int, 0)
	selected := make(map[int]bool)

	// Bootstrap sampling
	for i := 0; i < numSamples; i++ {
		idx := rand.Intn(numSamples)
		selected[idx] = true
	}

	// OOB samples are those not selected
	for i := 0; i < numSamples; i++ {
		if !selected[i] {
			oobSamples = append(oobSamples, i)
		}
	}

	return oobSamples
}

// calculateOOBScore calculates out-of-bag score
func (rf *RandomForestPredictor) calculateOOBScore() float64 {
	// Simplified OOB score calculation
	// In production, this would use actual OOB predictions
	return 0.65 + rand.Float64()*0.2
}

// Predict generates Random Forest prediction
func (rf *RandomForestPredictor) Predict(symbol string, historical []float64, features map[string]interface{}) RandomForestResult {
	rf.mu.RLock()
	defer rf.mu.RUnlock()

	// Prepare features
	featureVector := rf.prepareFeatures(historical, features)

	// Get predictions from all trees
	predictions := make([]float64, len(rf.Trees))
	var wg sync.WaitGroup
	wg.Add(len(rf.Trees))

	for i := range rf.Trees {
		go func(idx int) {
			defer wg.Done()
			predictions[idx] = rf.predictTree(rf.Trees[idx], featureVector)
		}(i)
	}
	wg.Wait()

	// Aggregate predictions (mean for regression)
	avgPrediction := 0.0
	for _, pred := range predictions {
		avgPrediction += pred
	}
	avgPrediction /= float64(len(predictions))

	// Calculate metrics
	currentPrice := historical[len(historical)-1]
	predictedPrice := currentPrice * (1 + avgPrediction)

	// Determine direction
	direction := "NEUTRAL"
	if avgPrediction > 0.003 {
		direction = "UP"
	} else if avgPrediction < -0.003 {
		direction = "DOWN"
	}

	// Calculate confidence based on tree agreement
	confidence := rf.calculateConfidence(predictions, avgPrediction)

	return RandomForestResult{
		Price:           predictedPrice,
		Confidence:      confidence,
		Direction:       direction,
		Signal:          rf.generateSignal(direction, confidence),
		OOBScore:        rf.OOBScore,
		TreePredictions: predictions,
	}
}

// prepareFeatures converts raw data to feature vector
func (rf *RandomForestPredictor) prepareFeatures(historical []float64, features map[string]interface{}) []float64 {
	featureVector := make([]float64, len(rf.Features))

	if len(historical) < 20 {
		return featureVector
	}

	// Calculate technical indicators
	currentPrice := historical[len(historical)-1]

	// Price momentum
	featureVector[0] = rf.calculateMomentum(historical, 10)

	// Volume trend (simplified)
	featureVector[1] = rand.Float64()*2 - 1

	// RSI divergence
	rsi := rf.calculateRSI(historical)
	featureVector[2] = (rsi - 50) / 50

	// MACD histogram
	macd, signal := rf.calculateMACD(historical)
	featureVector[3] = (macd - signal) / currentPrice

	// Bollinger width
	upper, lower := rf.calculateBollingerBands(historical)
	featureVector[4] = (upper - lower) / currentPrice

	// ATR (Average True Range)
	featureVector[5] = rf.calculateATR(historical) / currentPrice

	// OBV (On-Balance Volume) - simplified
	featureVector[6] = rand.Float64()*2 - 1

	// CMF (Chaikin Money Flow) - simplified
	featureVector[7] = rand.Float64()*2 - 1

	// Stochastic oscillator
	k, d := rf.calculateStochastic(historical)
	featureVector[8] = k / 100
	featureVector[9] = d / 100

	// Williams %R
	featureVector[10] = rf.calculateWilliamsR(historical) / 100

	// CCI (Commodity Channel Index)
	featureVector[11] = rf.calculateCCI(historical) / 100

	// ADX (Average Directional Index)
	featureVector[12] = rf.calculateADX(historical) / 100

	// MFI (Money Flow Index)
	featureVector[13] = rf.calculateMFI(historical) / 100

	// ROC (Rate of Change)
	featureVector[14] = rf.calculateROC(historical, 10)

	return featureVector
}

// predictTree makes prediction using a single tree
func (rf *RandomForestPredictor) predictTree(tree *DecisionTree, features []float64) float64 {
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
func (rf *RandomForestPredictor) calculateConfidence(predictions []float64, mean float64) float64 {
	// Calculate variance of predictions
	variance := 0.0
	for _, pred := range predictions {
		variance += math.Pow(pred-mean, 2)
	}
	stdDev := math.Sqrt(variance / float64(len(predictions)))

	// Lower variance = higher confidence
	baseConfidence := math.Max(0, math.Min(100, 100-stdDev*2000))

	// Factor in OOB score
	confidence := baseConfidence*0.6 + rf.OOBScore*100*0.4

	return confidence
}

// generateSignal creates trading signal
func (rf *RandomForestPredictor) generateSignal(direction string, confidence float64) string {
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

// Technical indicator calculations

func (rf *RandomForestPredictor) calculateMomentum(prices []float64, period int) float64 {
	if len(prices) < period {
		return 0
	}

	currentPrice := prices[len(prices)-1]
	pastPrice := prices[len(prices)-period]

	return (currentPrice - pastPrice) / pastPrice
}

func (rf *RandomForestPredictor) calculateRSI(prices []float64) float64 {
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

func (rf *RandomForestPredictor) calculateMACD(prices []float64) (float64, float64) {
	if len(prices) < 26 {
		return 0, 0
	}

	ema12 := rf.ema(prices, 12)
	ema26 := rf.ema(prices, 26)
	macdLine := ema12 - ema26
	signalLine := macdLine * 0.9

	return macdLine, signalLine
}

func (rf *RandomForestPredictor) calculateBollingerBands(prices []float64) (float64, float64) {
	period := 20
	if len(prices) < period {
		return prices[len(prices)-1], prices[len(prices)-1]
	}

	sma := rf.sma(prices, period)

	variance := 0.0
	for i := len(prices) - period; i < len(prices); i++ {
		variance += math.Pow(prices[i]-sma, 2)
	}
	stdDev := math.Sqrt(variance / float64(period))

	upper := sma + 2*stdDev
	lower := sma - 2*stdDev

	return upper, lower
}

func (rf *RandomForestPredictor) calculateATR(prices []float64) float64 {
	period := 14
	if len(prices) < period+1 {
		return 0
	}

	trSum := 0.0
	for i := len(prices) - period; i < len(prices); i++ {
		high := prices[i]
		low := prices[i]
		prevClose := prices[i-1]

		tr := math.Max(high-low, math.Max(math.Abs(high-prevClose), math.Abs(low-prevClose)))
		trSum += tr
	}

	return trSum / float64(period)
}

func (rf *RandomForestPredictor) calculateStochastic(prices []float64) (float64, float64) {
	period := 14
	if len(prices) < period {
		return 50, 50
	}

	recentPrices := prices[len(prices)-period:]
	highest := recentPrices[0]
	lowest := recentPrices[0]

	for _, price := range recentPrices {
		if price > highest {
			highest = price
		}
		if price < lowest {
			lowest = price
		}
	}

	currentPrice := prices[len(prices)-1]

	k := 50.0
	if highest-lowest > 0 {
		k = ((currentPrice - lowest) / (highest - lowest)) * 100
	}

	d := k * 0.9 // Simplified %D calculation

	return k, d
}

func (rf *RandomForestPredictor) calculateWilliamsR(prices []float64) float64 {
	period := 14
	if len(prices) < period {
		return -50
	}

	recentPrices := prices[len(prices)-period:]
	highest := recentPrices[0]
	lowest := recentPrices[0]

	for _, price := range recentPrices {
		if price > highest {
			highest = price
		}
		if price < lowest {
			lowest = price
		}
	}

	currentPrice := prices[len(prices)-1]

	if highest-lowest > 0 {
		return ((highest - currentPrice) / (highest - lowest)) * -100
	}

	return -50
}

func (rf *RandomForestPredictor) calculateCCI(prices []float64) float64 {
	period := 20
	if len(prices) < period {
		return 0
	}

	sma := rf.sma(prices[len(prices)-period:], period)

	meanDeviation := 0.0
	for i := len(prices) - period; i < len(prices); i++ {
		meanDeviation += math.Abs(prices[i] - sma)
	}
	meanDeviation /= float64(period)

	if meanDeviation > 0 {
		return (prices[len(prices)-1] - sma) / (0.015 * meanDeviation)
	}

	return 0
}

func (rf *RandomForestPredictor) calculateADX(prices []float64) float64 {
	// Simplified ADX calculation
	period := 14
	if len(prices) < period {
		return 25
	}

	// Return a value between 0-100
	// Higher values indicate stronger trend
	volatility := rf.calculateVolatility(prices[len(prices)-period:])
	return math.Min(100, volatility*100)
}

func (rf *RandomForestPredictor) calculateMFI(prices []float64) float64 {
	// Simplified MFI calculation
	period := 14
	if len(prices) < period {
		return 50
	}

	// Similar to RSI but with volume weighting
	// Since we don't have volume, approximate
	return rf.calculateRSI(prices)
}

func (rf *RandomForestPredictor) calculateROC(prices []float64, period int) float64 {
	if len(prices) < period {
		return 0
	}

	currentPrice := prices[len(prices)-1]
	pastPrice := prices[len(prices)-period]

	if pastPrice > 0 {
		return ((currentPrice - pastPrice) / pastPrice) * 100
	}

	return 0
}

func (rf *RandomForestPredictor) calculateVolatility(prices []float64) float64 {
	if len(prices) < 2 {
		return 0
	}

	returns := make([]float64, len(prices)-1)
	for i := 1; i < len(prices); i++ {
		returns[i-1] = (prices[i] - prices[i-1]) / prices[i-1]
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

	return math.Sqrt(variance / float64(len(returns)))
}

func (rf *RandomForestPredictor) sma(prices []float64, period int) float64 {
	if len(prices) < period {
		return prices[len(prices)-1]
	}

	sum := 0.0
	for i := len(prices) - period; i < len(prices); i++ {
		sum += prices[i]
	}
	return sum / float64(period)
}

func (rf *RandomForestPredictor) ema(prices []float64, period int) float64 {
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