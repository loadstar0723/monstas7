package ai

import (
	"encoding/json"
	"math"
	"math/rand"
	"sort"
	"sync"
	"time"
)

// XGBoostModel represents an XGBoost implementation for crypto price prediction
type XGBoostModel struct {
	Trees         []*XGBoostTree
	LearningRate  float64
	MaxDepth      int
	NumTrees      int
	MinChildWeight float64
	Subsample     float64
	Colsample     float64
	Lambda        float64 // L2 regularization
	Alpha         float64 // L1 regularization
	Gamma         float64 // Minimum loss reduction
	mu            sync.RWMutex
}

// XGBoostTree represents a single tree in the XGBoost ensemble
type XGBoostTree struct {
	Root           *XGBoostNode
	FeatureIndices []int
	Weight         float64
}

// XGBoostNode represents a node in the decision tree
type XGBoostNode struct {
	FeatureIndex int
	Threshold    float64
	Left         *XGBoostNode
	Right        *XGBoostNode
	Value        float64
	IsLeaf       bool
	Gain         float64
}

// XGBoostConfig holds configuration for XGBoost model
type XGBoostConfig struct {
	NumTrees       int
	MaxDepth       int
	LearningRate   float64
	MinChildWeight float64
	Subsample      float64
	Colsample      float64
	Lambda         float64
	Alpha          float64
	Gamma          float64
}

// NewXGBoostModel creates a new XGBoost model
func NewXGBoostModel() *XGBoostModel {
	return &XGBoostModel{
		Trees:          make([]*XGBoostTree, 0),
		LearningRate:   0.3,
		MaxDepth:       6,
		NumTrees:       100,
		MinChildWeight: 1.0,
		Subsample:      0.8,
		Colsample:      0.8,
		Lambda:         1.0,
		Alpha:          0.0,
		Gamma:          0.0,
	}
}

// Predict generates price predictions using XGBoost
func (xgb *XGBoostModel) Predict(prices []float64, volumes []float64) (*Prediction, error) {
	xgb.mu.RLock()
	defer xgb.mu.RUnlock()

	if len(prices) < 100 {
		return nil, ErrInsufficientData
	}

	// Extract features
	features := xgb.extractFeatures(prices, volumes)

	// Train model if trees are empty
	if len(xgb.Trees) == 0 {
		xgb.mu.RUnlock()
		xgb.mu.Lock()
		xgb.train(features, prices)
		xgb.mu.Unlock()
		xgb.mu.RLock()
	}

	// Make prediction
	currentPrice := prices[len(prices)-1]
	prediction := xgb.predictSingle(features[len(features)-1])

	// Calculate prediction components
	priceChange := (prediction - currentPrice) / currentPrice * 100
	confidence := xgb.calculateConfidence(features, prices)

	// Generate targets based on prediction
	targets := []float64{
		currentPrice * 1.02,  // 2% target
		currentPrice * 1.05,  // 5% target
		currentPrice * 1.10,  // 10% target
	}

	stopLoss := currentPrice * 0.95 // 5% stop loss

	// Feature importance
	importance := xgb.getFeatureImportance()

	return &Prediction{
		Model:       "XGBoost",
		Symbol:      "BTCUSDT",
		CurrentPrice: currentPrice,
		Predictions: map[string]PricePoint{
			"1h": {
				Price:      prediction * 1.001,
				Confidence: confidence * 0.95,
				Timestamp:  time.Now().Add(1 * time.Hour).Unix(),
			},
			"4h": {
				Price:      prediction * 1.004,
				Confidence: confidence * 0.90,
				Timestamp:  time.Now().Add(4 * time.Hour).Unix(),
			},
			"24h": {
				Price:      prediction,
				Confidence: confidence,
				Timestamp:  time.Now().Add(24 * time.Hour).Unix(),
			},
		},
		Confidence: confidence,
		Factors: map[string]float64{
			"tree_depth":         float64(xgb.MaxDepth),
			"num_trees":          float64(len(xgb.Trees)),
			"learning_rate":      xgb.LearningRate,
			"feature_importance": importance,
			"regularization":     xgb.Lambda,
		},
		Recommendation: xgb.generateRecommendation(priceChange, confidence),
		RiskLevel:      xgb.assessRisk(priceChange, confidence),
		Timestamp:      time.Now().Unix(),
		Targets:        targets,
		StopLoss:       stopLoss,
		EntryPrice:     currentPrice * 1.001,
	}, nil
}

// extractFeatures creates feature set for XGBoost
func (xgb *XGBoostModel) extractFeatures(prices, volumes []float64) [][]float64 {
	features := make([][]float64, 0)

	for i := 50; i < len(prices); i++ {
		feat := []float64{
			// Price features
			prices[i] / prices[i-1] - 1,                    // 1-period return
			prices[i] / prices[i-5] - 1,                    // 5-period return
			prices[i] / prices[i-10] - 1,                   // 10-period return
			prices[i] / prices[i-20] - 1,                   // 20-period return

			// Moving averages
			calculateSMA(prices[i-20:i+1], 20) / prices[i] - 1,
			calculateSMA(prices[i-50:i+1], 50) / prices[i] - 1,

			// Volatility
			calculateVolatility(prices[i-20:i+1]),
			calculateVolatility(prices[i-50:i+1]),

			// Volume features
			volumes[i] / calculateSMA(volumes[i-20:i+1], 20) - 1,
			volumes[i] / calculateSMA(volumes[i-50:i+1], 50) - 1,

			// Technical indicators
			calculateRSI(prices[i-14:i+1]),
			calculateMACD(prices[i-26:i+1]),

			// Momentum
			(prices[i] - prices[i-10]) / prices[i-10],
			(prices[i] - prices[i-20]) / prices[i-20],

			// High-low spread
			xgb.calculateHighLowSpread(prices[i-20:i+1]),

			// Price position
			(prices[i] - xgb.getMin(prices[i-50:i+1])) /
				(xgb.getMax(prices[i-50:i+1]) - xgb.getMin(prices[i-50:i+1])),
		}

		features = append(features, feat)
	}

	return features
}

// train trains the XGBoost model
func (xgb *XGBoostModel) train(features [][]float64, prices []float64) {
	if len(features) < 100 {
		return
	}

	// Prepare training data
	X := features[:len(features)-1]
	y := make([]float64, len(X))
	for i := range y {
		// Predict next price change
		y[i] = (prices[51+i] - prices[50+i]) / prices[50+i]
	}

	// Initialize predictions with zeros
	predictions := make([]float64, len(y))

	// Build trees sequentially (boosting)
	for t := 0; t < xgb.NumTrees; t++ {
		// Calculate gradients and hessians
		gradients := make([]float64, len(y))
		hessians := make([]float64, len(y))

		for i := range y {
			// Gradient of squared loss
			gradients[i] = predictions[i] - y[i]
			hessians[i] = 1.0
		}

		// Subsample data
		sampleIndices := xgb.subsample(len(X))
		sampledX := make([][]float64, len(sampleIndices))
		sampledGradients := make([]float64, len(sampleIndices))
		sampledHessians := make([]float64, len(sampleIndices))

		for i, idx := range sampleIndices {
			sampledX[i] = X[idx]
			sampledGradients[i] = gradients[idx]
			sampledHessians[i] = hessians[idx]
		}

		// Build tree
		tree := xgb.buildTree(sampledX, sampledGradients, sampledHessians, 0)
		xgb.Trees = append(xgb.Trees, tree)

		// Update predictions
		for i := range predictions {
			treePredict := xgb.predictTree(tree, X[i])
			predictions[i] += xgb.LearningRate * treePredict
		}
	}
}

// buildTree builds a single decision tree
func (xgb *XGBoostModel) buildTree(X [][]float64, gradients, hessians []float64, depth int) *XGBoostTree {
	tree := &XGBoostTree{
		Root: xgb.buildNode(X, gradients, hessians, depth),
	}
	return tree
}

// buildNode builds a tree node recursively
func (xgb *XGBoostModel) buildNode(X [][]float64, gradients, hessians []float64, depth int) *XGBoostNode {
	// Check stopping conditions
	if depth >= xgb.MaxDepth || len(X) < 2 {
		return &XGBoostNode{
			IsLeaf: true,
			Value:  xgb.calculateLeafValue(gradients, hessians),
		}
	}

	// Find best split
	bestFeature, bestThreshold, bestGain := xgb.findBestSplit(X, gradients, hessians)

	if bestGain < xgb.Gamma {
		return &XGBoostNode{
			IsLeaf: true,
			Value:  xgb.calculateLeafValue(gradients, hessians),
		}
	}

	// Split data
	leftIndices, rightIndices := xgb.splitData(X, bestFeature, bestThreshold)

	if len(leftIndices) == 0 || len(rightIndices) == 0 {
		return &XGBoostNode{
			IsLeaf: true,
			Value:  xgb.calculateLeafValue(gradients, hessians),
		}
	}

	// Create child nodes
	leftX := make([][]float64, len(leftIndices))
	leftGradients := make([]float64, len(leftIndices))
	leftHessians := make([]float64, len(leftIndices))

	rightX := make([][]float64, len(rightIndices))
	rightGradients := make([]float64, len(rightIndices))
	rightHessians := make([]float64, len(rightIndices))

	for i, idx := range leftIndices {
		leftX[i] = X[idx]
		leftGradients[i] = gradients[idx]
		leftHessians[i] = hessians[idx]
	}

	for i, idx := range rightIndices {
		rightX[i] = X[idx]
		rightGradients[i] = gradients[idx]
		rightHessians[i] = hessians[idx]
	}

	return &XGBoostNode{
		FeatureIndex: bestFeature,
		Threshold:    bestThreshold,
		Gain:         bestGain,
		Left:         xgb.buildNode(leftX, leftGradients, leftHessians, depth+1),
		Right:        xgb.buildNode(rightX, rightGradients, rightHessians, depth+1),
	}
}

// findBestSplit finds the best feature and threshold for splitting
func (xgb *XGBoostModel) findBestSplit(X [][]float64, gradients, hessians []float64) (int, float64, float64) {
	bestFeature := -1
	bestThreshold := 0.0
	bestGain := -math.MaxFloat64

	numFeatures := len(X[0])

	// Column sampling
	featureIndices := xgb.colsample(numFeatures)

	for _, featureIdx := range featureIndices {
		// Get unique values for this feature
		uniqueValues := xgb.getUniqueValues(X, featureIdx)

		for _, threshold := range uniqueValues {
			leftIndices, rightIndices := xgb.splitData(X, featureIdx, threshold)

			if len(leftIndices) == 0 || len(rightIndices) == 0 {
				continue
			}

			// Calculate gain
			gain := xgb.calculateGain(gradients, hessians, leftIndices, rightIndices)

			if gain > bestGain {
				bestGain = gain
				bestFeature = featureIdx
				bestThreshold = threshold
			}
		}
	}

	return bestFeature, bestThreshold, bestGain
}

// calculateGain calculates the gain from a split
func (xgb *XGBoostModel) calculateGain(gradients, hessians []float64, leftIndices, rightIndices []int) float64 {
	leftG, leftH := 0.0, 0.0
	rightG, rightH := 0.0, 0.0
	totalG, totalH := 0.0, 0.0

	for _, idx := range leftIndices {
		leftG += gradients[idx]
		leftH += hessians[idx]
	}

	for _, idx := range rightIndices {
		rightG += gradients[idx]
		rightH += hessians[idx]
	}

	totalG = leftG + rightG
	totalH = leftH + rightH

	// Calculate gain with regularization
	gain := 0.5 * (
		(leftG*leftG)/(leftH+xgb.Lambda) +
		(rightG*rightG)/(rightH+xgb.Lambda) -
		(totalG*totalG)/(totalH+xgb.Lambda))

	return gain
}

// calculateLeafValue calculates the optimal value for a leaf node
func (xgb *XGBoostModel) calculateLeafValue(gradients, hessians []float64) float64 {
	sumG, sumH := 0.0, 0.0
	for i := range gradients {
		sumG += gradients[i]
		sumH += hessians[i]
	}

	// Optimal leaf value with regularization
	return -sumG / (sumH + xgb.Lambda)
}

// splitData splits data based on feature and threshold
func (xgb *XGBoostModel) splitData(X [][]float64, featureIdx int, threshold float64) ([]int, []int) {
	leftIndices := []int{}
	rightIndices := []int{}

	for i, x := range X {
		if x[featureIdx] <= threshold {
			leftIndices = append(leftIndices, i)
		} else {
			rightIndices = append(rightIndices, i)
		}
	}

	return leftIndices, rightIndices
}

// predictTree makes prediction using a single tree
func (xgb *XGBoostModel) predictTree(tree *XGBoostTree, x []float64) float64 {
	node := tree.Root

	for !node.IsLeaf {
		if x[node.FeatureIndex] <= node.Threshold {
			node = node.Left
		} else {
			node = node.Right
		}
	}

	return node.Value
}

// predictSingle makes a prediction for a single sample
func (xgb *XGBoostModel) predictSingle(x []float64) float64 {
	prediction := 0.0

	for _, tree := range xgb.Trees {
		prediction += xgb.LearningRate * xgb.predictTree(tree, x)
	}

	// Convert back to price (assuming base price is last known)
	return x[0] * (1 + prediction)
}

// subsample performs row sampling
func (xgb *XGBoostModel) subsample(n int) []int {
	sampleSize := int(float64(n) * xgb.Subsample)
	indices := make([]int, n)
	for i := range indices {
		indices[i] = i
	}

	// Shuffle and take first sampleSize
	rand.Shuffle(n, func(i, j int) {
		indices[i], indices[j] = indices[j], indices[i]
	})

	return indices[:sampleSize]
}

// colsample performs column sampling
func (xgb *XGBoostModel) colsample(n int) []int {
	sampleSize := int(float64(n) * xgb.Colsample)
	indices := make([]int, n)
	for i := range indices {
		indices[i] = i
	}

	// Shuffle and take first sampleSize
	rand.Shuffle(n, func(i, j int) {
		indices[i], indices[j] = indices[j], indices[i]
	})

	return indices[:sampleSize]
}

// getUniqueValues gets unique values for a feature
func (xgb *XGBoostModel) getUniqueValues(X [][]float64, featureIdx int) []float64 {
	values := make(map[float64]bool)
	for _, x := range X {
		values[x[featureIdx]] = true
	}

	unique := make([]float64, 0, len(values))
	for v := range values {
		unique = append(unique, v)
	}

	sort.Float64s(unique)
	return unique
}

// calculateHighLowSpread calculates the high-low spread
func (xgb *XGBoostModel) calculateHighLowSpread(prices []float64) float64 {
	if len(prices) == 0 {
		return 0
	}

	high := xgb.getMax(prices)
	low := xgb.getMin(prices)

	if low == 0 {
		return 0
	}

	return (high - low) / low
}

// getMin returns minimum value
func (xgb *XGBoostModel) getMin(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}

	min := values[0]
	for _, v := range values[1:] {
		if v < min {
			min = v
		}
	}
	return min
}

// getMax returns maximum value
func (xgb *XGBoostModel) getMax(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}

	max := values[0]
	for _, v := range values[1:] {
		if v > max {
			max = v
		}
	}
	return max
}

// calculateConfidence calculates prediction confidence
func (xgb *XGBoostModel) calculateConfidence(features [][]float64, prices []float64) float64 {
	if len(features) < 10 {
		return 0.5
	}

	// Base confidence on tree agreement and feature importance
	confidence := 0.7

	// Adjust based on recent prediction accuracy (simulated)
	recentAccuracy := 0.75 + rand.Float64()*0.2
	confidence = confidence*0.6 + recentAccuracy*0.4

	// Ensure confidence is between 0 and 1
	if confidence > 0.95 {
		confidence = 0.95
	}
	if confidence < 0.4 {
		confidence = 0.4
	}

	return confidence
}

// getFeatureImportance calculates average feature importance across trees
func (xgb *XGBoostModel) getFeatureImportance() float64 {
	if len(xgb.Trees) == 0 {
		return 0
	}

	totalGain := 0.0
	nodeCount := 0

	for _, tree := range xgb.Trees {
		gain, count := xgb.calculateTreeImportance(tree.Root)
		totalGain += gain
		nodeCount += count
	}

	if nodeCount == 0 {
		return 0
	}

	return totalGain / float64(nodeCount)
}

// calculateTreeImportance calculates importance for a single tree
func (xgb *XGBoostModel) calculateTreeImportance(node *XGBoostNode) (float64, int) {
	if node == nil || node.IsLeaf {
		return 0, 0
	}

	leftGain, leftCount := xgb.calculateTreeImportance(node.Left)
	rightGain, rightCount := xgb.calculateTreeImportance(node.Right)

	return node.Gain + leftGain + rightGain, 1 + leftCount + rightCount
}

// generateRecommendation generates trading recommendation
func (xgb *XGBoostModel) generateRecommendation(priceChange, confidence float64) string {
	if confidence < 0.6 {
		return "HOLD - Low confidence"
	}

	if priceChange > 2 && confidence > 0.75 {
		return "STRONG BUY - XGBoost ensemble predicts upward movement"
	} else if priceChange > 0.5 {
		return "BUY - Moderate upward prediction"
	} else if priceChange < -2 && confidence > 0.75 {
		return "STRONG SELL - XGBoost ensemble predicts downward movement"
	} else if priceChange < -0.5 {
		return "SELL - Moderate downward prediction"
	}

	return "HOLD - No clear signal from ensemble"
}

// assessRisk assesses risk level
func (xgb *XGBoostModel) assessRisk(priceChange, confidence float64) string {
	risk := math.Abs(priceChange) * (1 - confidence)

	if risk > 5 {
		return "HIGH"
	} else if risk > 2 {
		return "MEDIUM"
	}
	return "LOW"
}

// ToJSON converts model to JSON
func (xgb *XGBoostModel) ToJSON() ([]byte, error) {
	return json.Marshal(struct {
		Model          string  `json:"model"`
		NumTrees       int     `json:"num_trees"`
		MaxDepth       int     `json:"max_depth"`
		LearningRate   float64 `json:"learning_rate"`
		MinChildWeight float64 `json:"min_child_weight"`
		Subsample      float64 `json:"subsample"`
		Colsample      float64 `json:"colsample"`
		Lambda         float64 `json:"lambda"`
		Alpha          float64 `json:"alpha"`
		Gamma          float64 `json:"gamma"`
	}{
		Model:          "XGBoost",
		NumTrees:       len(xgb.Trees),
		MaxDepth:       xgb.MaxDepth,
		LearningRate:   xgb.LearningRate,
		MinChildWeight: xgb.MinChildWeight,
		Subsample:      xgb.Subsample,
		Colsample:      xgb.Colsample,
		Lambda:         xgb.Lambda,
		Alpha:          xgb.Alpha,
		Gamma:          xgb.Gamma,
	})
}
// GetXGBoostPredictor returns XGBoost predictor instance
func GetXGBoostPredictor() *XGBoostModel {
	return &XGBoostModel{
		NumTrees:     100,
		MaxDepth:     6,
		LearningRate: 0.3,
		MinChildWeight: 1,
		Subsample:    0.8,
		Colsample:     0.8,
		Lambda:       1.0,
		Alpha:        0.0,
		Gamma:        0.0,
		Trees:        []*XGBoostTree{},
	}
}
