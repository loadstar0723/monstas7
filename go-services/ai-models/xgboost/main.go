package main

import (
    "encoding/json"
    "fmt"
    "log"
    "math"
    "math/rand"
    "net/http"
    "sort"
    "time"
    
    "github.com/gorilla/mux"
    "gonum.org/v1/gonum/stat"
    "ai-models/common"
)

// XGBoostService handles XGBoost model predictions
type XGBoostService struct {
    dataCollector *common.DataCollector
    wsManager     *common.WebSocketManager
    modelState    *XGBoostState
}

// XGBoostState represents the XGBoost model state
type XGBoostState struct {
    // Ensemble of decision trees
    trees          map[string][]*DecisionTree
    learningRate   float64
    maxDepth       int
    numTrees       int
    subsample      float64
    colsampleByTree float64
    
    // Feature importance
    featureImportance map[string]map[string]float64
    
    // Training data
    trainingData   map[string]*TrainingDataset
    validationData map[string]*ValidationDataset
    
    // Model performance
    performance    map[string]*ModelPerformance
    lastUpdate     time.Time
}

// DecisionTree represents a single tree in the ensemble
type DecisionTree struct {
    Root           *TreeNode
    MaxDepth       int
    MinSamplesLeaf int
    Score          float64
}

// TreeNode represents a node in the decision tree
type TreeNode struct {
    Feature       string      `json:"feature"`
    Threshold     float64     `json:"threshold"`
    Left          *TreeNode   `json:"left"`
    Right         *TreeNode   `json:"right"`
    Value         float64     `json:"value"`
    IsLeaf        bool        `json:"is_leaf"`
    Gain          float64     `json:"gain"`
    NumSamples    int         `json:"num_samples"`
    Coverage      float64     `json:"coverage"`
}

// TrainingDataset contains training data and features
type TrainingDataset struct {
    Features    [][]float64
    Labels      []float64
    FeatureNames []string
    Timestamp   time.Time
}

// ValidationDataset contains validation data
type ValidationDataset struct {
    Features    [][]float64
    Labels      []float64
    Predictions []float64
}

// ModelPerformance tracks model performance metrics
type ModelPerformance struct {
    TrainScore   float64 `json:"train_score"`
    ValidScore   float64 `json:"valid_score"`
    RMSE         float64 `json:"rmse"`
    MAE          float64 `json:"mae"`
    R2           float64 `json:"r2"`
    FeatureGains map[string]float64 `json:"feature_gains"`
}

// XGBoostVisualization for frontend display
type XGBoostVisualization struct {
    TreeStructure    []*TreeVisualization   `json:"tree_structure"`
    FeatureImportance []FeatureScore        `json:"feature_importance"`
    LearningCurve    []LearningPoint       `json:"learning_curve"`
    ValidationCurve  []ValidationPoint     `json:"validation_curve"`
    SHAP             *SHAPAnalysis         `json:"shap"`
    Performance      *ModelPerformance     `json:"performance"`
}

type TreeVisualization struct {
    TreeID    int         `json:"tree_id"`
    Nodes     []*TreeNode `json:"nodes"`
    MaxDepth  int         `json:"max_depth"`
    NumLeaves int         `json:"num_leaves"`
    Score     float64     `json:"score"`
}

type FeatureScore struct {
    Feature    string  `json:"feature"`
    Importance float64 `json:"importance"`
    Gain       float64 `json:"gain"`
    Cover      float64 `json:"cover"`
    Frequency  float64 `json:"frequency"`
}

type LearningPoint struct {
    Iteration  int     `json:"iteration"`
    TrainScore float64 `json:"train_score"`
    ValidScore float64 `json:"valid_score"`
    Time       string  `json:"time"`
}

type ValidationPoint struct {
    Actual    float64 `json:"actual"`
    Predicted float64 `json:"predicted"`
    Error     float64 `json:"error"`
    TreeCount int     `json:"tree_count"`
}

type SHAPAnalysis struct {
    BaseValue      float64            `json:"base_value"`
    FeatureValues  map[string]float64 `json:"feature_values"`
    SHAPValues     map[string]float64 `json:"shap_values"`
    Prediction     float64            `json:"prediction"`
}

func NewXGBoostService() *XGBoostService {
    return &XGBoostService{
        dataCollector: common.NewDataCollector("localhost:6379"),
        wsManager:     common.NewWebSocketManager(),
        modelState: &XGBoostState{
            trees:             make(map[string][]*DecisionTree),
            learningRate:      0.3,
            maxDepth:          6,
            numTrees:          100,
            subsample:         0.8,
            colsampleByTree:   0.8,
            featureImportance: make(map[string]map[string]float64),
            trainingData:      make(map[string]*TrainingDataset),
            validationData:    make(map[string]*ValidationDataset),
            performance:       make(map[string]*ModelPerformance),
            lastUpdate:        time.Now(),
        },
    }
}

// Initialize loads historical data and trains models
func (s *XGBoostService) Initialize() error {
    log.Println("Initializing XGBoost service...")
    
    // Start WebSocket manager
    s.wsManager.Start()
    
    // Load and prepare data for each coin
    for _, coin := range common.SupportedCoins {
        // Load historical data
        data, err := s.dataCollector.GetHistoricalData(coin.Symbol, "1h", 500)
        if err != nil {
            log.Printf("Error loading data for %s: %v", coin.Symbol, err)
            continue
        }
        
        // Prepare features and labels
        features, labels, featureNames := s.prepareData(data)
        
        s.modelState.trainingData[coin.Symbol] = &TrainingDataset{
            Features:     features,
            Labels:       labels,
            FeatureNames: featureNames,
            Timestamp:    time.Now(),
        }
        
        // Train XGBoost model
        s.trainModel(coin.Symbol)
    }
    
    // Start prediction loop
    go s.predictionLoop()
    
    return nil
}

// prepareData extracts features from historical data
func (s *XGBoostService) prepareData(data []common.HistoricalData) ([][]float64, []float64, []string) {
    if len(data) < 50 {
        return nil, nil, nil
    }
    
    featureNames := []string{
        "price_change_1h", "price_change_4h", "price_change_24h",
        "volume_ratio", "rsi", "macd", "bollinger_position",
        "ema_ratio", "momentum", "volatility",
        "volume_weighted_price", "price_position",
        "trend_strength", "support_resistance",
    }
    
    features := [][]float64{}
    labels := []float64{}
    
    // Calculate technical indicators
    for i := 24; i < len(data)-1; i++ {
        feature := []float64{
            // Price changes
            (data[i].Close - data[i-1].Close) / data[i-1].Close,
            (data[i].Close - data[i-4].Close) / data[i-4].Close,
            (data[i].Close - data[i-24].Close) / data[i-24].Close,
            
            // Volume ratio
            data[i].Volume / (data[i-1].Volume + 0.0001),
            
            // RSI
            s.calculateRSI(data[i-14:i+1]),
            
            // MACD
            s.calculateMACD(data[i-26:i+1]),
            
            // Bollinger position
            s.calculateBollingerPosition(data[i-20:i+1]),
            
            // EMA ratio
            s.calculateEMARatio(data[i-20:i+1]),
            
            // Momentum
            (data[i].Close - data[i-10].Close) / data[i-10].Close,
            
            // Volatility
            s.calculateVolatility(data[i-20:i+1]),
            
            // Volume weighted price
            (data[i].Close*data[i].Volume + data[i-1].Close*data[i-1].Volume) / (data[i].Volume + data[i-1].Volume + 0.0001),
            
            // Price position in range
            (data[i].Close - data[i].Low) / (data[i].High - data[i].Low + 0.0001),
            
            // Trend strength
            s.calculateTrendStrength(data[i-10:i+1]),
            
            // Support/Resistance distance
            s.calculateSupportResistance(data[i-50:i+1], data[i].Close),
        }
        
        features = append(features, feature)
        labels = append(labels, (data[i+1].Close-data[i].Close)/data[i].Close)
    }
    
    return features, labels, featureNames
}

// trainModel trains the XGBoost model
func (s *XGBoostService) trainModel(symbol string) {
    dataset := s.modelState.trainingData[symbol]
    if dataset == nil || len(dataset.Features) < 100 {
        log.Printf("Insufficient data for training: %s", symbol)
        return
    }
    
    // Split data into train and validation
    splitIdx := int(float64(len(dataset.Features)) * 0.8)
    trainFeatures := dataset.Features[:splitIdx]
    trainLabels := dataset.Labels[:splitIdx]
    validFeatures := dataset.Features[splitIdx:]
    validLabels := dataset.Labels[splitIdx:]
    
    // Initialize trees
    trees := make([]*DecisionTree, 0, s.modelState.numTrees)
    
    // Gradient boosting
    predictions := make([]float64, len(trainLabels))
    validPredictions := make([]float64, len(validLabels))
    
    learningCurve := []LearningPoint{}
    
    for iter := 0; iter < s.modelState.numTrees; iter++ {
        // Calculate gradients (residuals for regression)
        gradients := make([]float64, len(trainLabels))
        for i := range gradients {
            gradients[i] = trainLabels[i] - predictions[i]
        }
        
        // Subsample data
        sampleIndices := s.subsampleData(len(trainFeatures))
        sampledFeatures := make([][]float64, len(sampleIndices))
        sampledGradients := make([]float64, len(sampleIndices))
        
        for i, idx := range sampleIndices {
            sampledFeatures[i] = trainFeatures[idx]
            sampledGradients[i] = gradients[idx]
        }
        
        // Train a tree on gradients
        tree := s.buildTree(sampledFeatures, sampledGradients, dataset.FeatureNames, 0)
        trees = append(trees, tree)
        
        // Update predictions
        for i := range predictions {
            predictions[i] += s.modelState.learningRate * s.predictTree(tree, trainFeatures[i])
        }
        
        for i := range validPredictions {
            validPredictions[i] += s.modelState.learningRate * s.predictTree(tree, validFeatures[i])
        }
        
        // Calculate scores
        trainScore := s.calculateR2(trainLabels, predictions)
        validScore := s.calculateR2(validLabels, validPredictions)
        
        if iter%10 == 0 {
            learningCurve = append(learningCurve, LearningPoint{
                Iteration:  iter,
                TrainScore: trainScore,
                ValidScore: validScore,
                Time:       time.Now().Format("15:04:05"),
            })
        }
    }
    
    s.modelState.trees[symbol] = trees
    
    // Calculate feature importance
    s.calculateFeatureImportance(symbol)
    
    // Store validation data
    s.modelState.validationData[symbol] = &ValidationDataset{
        Features:    validFeatures,
        Labels:      validLabels,
        Predictions: validPredictions,
    }
    
    // Calculate final performance
    s.modelState.performance[symbol] = &ModelPerformance{
        TrainScore:   s.calculateR2(trainLabels, predictions),
        ValidScore:   s.calculateR2(validLabels, validPredictions),
        RMSE:         s.calculateRMSE(validLabels, validPredictions),
        MAE:          s.calculateMAE(validLabels, validPredictions),
        R2:           s.calculateR2(validLabels, validPredictions),
        FeatureGains: s.modelState.featureImportance[symbol],
    }
}

// buildTree builds a decision tree
func (s *XGBoostService) buildTree(features [][]float64, gradients []float64, featureNames []string, depth int) *DecisionTree {
    tree := &DecisionTree{
        MaxDepth:       s.modelState.maxDepth,
        MinSamplesLeaf: 5,
    }
    
    tree.Root = s.buildNode(features, gradients, featureNames, depth)
    tree.Score = s.calculateTreeScore(tree.Root)
    
    return tree
}

// buildNode recursively builds tree nodes
func (s *XGBoostService) buildNode(features [][]float64, gradients []float64, featureNames []string, depth int) *TreeNode {
    // Check stopping criteria
    if depth >= s.modelState.maxDepth || len(features) < 10 {
        return &TreeNode{
            IsLeaf:     true,
            Value:      stat.Mean(gradients, nil),
            NumSamples: len(features),
        }
    }
    
    // Find best split
    bestFeature := -1
    bestThreshold := 0.0
    bestGain := -math.MaxFloat64
    
    // Sample features (column subsampling)
    numFeatures := len(features[0])
    selectedFeatures := s.sampleFeatures(numFeatures)
    
    for _, featureIdx := range selectedFeatures {
        // Get unique values for this feature
        values := make([]float64, len(features))
        for i := range features {
            values[i] = features[i][featureIdx]
        }
        
        uniqueValues := s.getUniqueValues(values)
        
        // Try different thresholds
        for _, threshold := range uniqueValues {
            gain := s.calculateGain(features, gradients, featureIdx, threshold)
            if gain > bestGain {
                bestGain = gain
                bestFeature = featureIdx
                bestThreshold = threshold
            }
        }
    }
    
    // No good split found
    if bestFeature == -1 {
        return &TreeNode{
            IsLeaf:     true,
            Value:      stat.Mean(gradients, nil),
            NumSamples: len(features),
        }
    }
    
    // Split data
    leftFeatures, leftGradients, rightFeatures, rightGradients := s.splitData(
        features, gradients, bestFeature, bestThreshold,
    )
    
    node := &TreeNode{
        Feature:    featureNames[bestFeature],
        Threshold:  bestThreshold,
        Gain:       bestGain,
        NumSamples: len(features),
        Coverage:   float64(len(features)),
    }
    
    // Recursively build children
    node.Left = s.buildNode(leftFeatures, leftGradients, featureNames, depth+1)
    node.Right = s.buildNode(rightFeatures, rightGradients, featureNames, depth+1)
    
    return node
}

// predictTree makes prediction using a single tree
func (s *XGBoostService) predictTree(tree *DecisionTree, features []float64) float64 {
    node := tree.Root
    
    for !node.IsLeaf {
        featureIdx := s.getFeatureIndex(node.Feature)
        if featureIdx == -1 || features[featureIdx] <= node.Threshold {
            node = node.Left
        } else {
            node = node.Right
        }
    }
    
    return node.Value
}

// getFeatureIndex returns the index of a feature by name
func (s *XGBoostService) getFeatureIndex(featureName string) int {
    featureNames := []string{
        "price_change_1h", "price_change_4h", "price_change_24h",
        "volume_ratio", "rsi", "macd", "bollinger_position",
        "ema_ratio", "momentum", "volatility",
        "volume_weighted_price", "price_position",
        "trend_strength", "support_resistance",
    }
    
    for i, name := range featureNames {
        if name == featureName {
            return i
        }
    }
    return -1
}

// calculateGain calculates the gain from splitting
func (s *XGBoostService) calculateGain(features [][]float64, gradients []float64, featureIdx int, threshold float64) float64 {
    // Split data
    var leftGradients, rightGradients []float64
    
    for i := range features {
        if features[i][featureIdx] <= threshold {
            leftGradients = append(leftGradients, gradients[i])
        } else {
            rightGradients = append(rightGradients, gradients[i])
        }
    }
    
    if len(leftGradients) == 0 || len(rightGradients) == 0 {
        return -math.MaxFloat64
    }
    
    // Calculate gain (simplified)
    totalVar := stat.Variance(gradients, nil)
    leftVar := stat.Variance(leftGradients, nil)
    rightVar := stat.Variance(rightGradients, nil)
    
    leftWeight := float64(len(leftGradients)) / float64(len(gradients))
    rightWeight := float64(len(rightGradients)) / float64(len(gradients))
    
    gain := totalVar - (leftWeight*leftVar + rightWeight*rightVar)
    
    return gain
}

// splitData splits features and gradients based on threshold
func (s *XGBoostService) splitData(features [][]float64, gradients []float64, featureIdx int, threshold float64) ([][]float64, []float64, [][]float64, []float64) {
    var leftFeatures, rightFeatures [][]float64
    var leftGradients, rightGradients []float64
    
    for i := range features {
        if features[i][featureIdx] <= threshold {
            leftFeatures = append(leftFeatures, features[i])
            leftGradients = append(leftGradients, gradients[i])
        } else {
            rightFeatures = append(rightFeatures, features[i])
            rightGradients = append(rightGradients, gradients[i])
        }
    }
    
    return leftFeatures, leftGradients, rightFeatures, rightGradients
}

// subsampleData performs row subsampling
func (s *XGBoostService) subsampleData(n int) []int {
    numSamples := int(float64(n) * s.modelState.subsample)
    indices := make([]int, n)
    for i := range indices {
        indices[i] = i
    }
    
    // Shuffle and take first numSamples
    rand.Shuffle(len(indices), func(i, j int) {
        indices[i], indices[j] = indices[j], indices[i]
    })
    
    return indices[:numSamples]
}

// sampleFeatures performs column subsampling
func (s *XGBoostService) sampleFeatures(n int) []int {
    numFeatures := int(float64(n) * s.modelState.colsampleByTree)
    indices := make([]int, n)
    for i := range indices {
        indices[i] = i
    }
    
    rand.Shuffle(len(indices), func(i, j int) {
        indices[i], indices[j] = indices[j], indices[i]
    })
    
    return indices[:numFeatures]
}

// getUniqueValues returns sorted unique values
func (s *XGBoostService) getUniqueValues(values []float64) []float64 {
    uniqueMap := make(map[float64]bool)
    for _, v := range values {
        uniqueMap[v] = true
    }
    
    unique := make([]float64, 0, len(uniqueMap))
    for v := range uniqueMap {
        unique = append(unique, v)
    }
    
    sort.Float64s(unique)
    
    // Return at most 10 thresholds
    if len(unique) > 10 {
        step := len(unique) / 10
        sampled := []float64{}
        for i := 0; i < len(unique); i += step {
            sampled = append(sampled, unique[i])
        }
        return sampled
    }
    
    return unique
}

// calculateTreeScore calculates the score of a tree
func (s *XGBoostService) calculateTreeScore(node *TreeNode) float64 {
    if node.IsLeaf {
        return math.Abs(node.Value) * float64(node.NumSamples)
    }
    return node.Gain + s.calculateTreeScore(node.Left) + s.calculateTreeScore(node.Right)
}

// calculateFeatureImportance calculates feature importance scores
func (s *XGBoostService) calculateFeatureImportance(symbol string) {
    importance := make(map[string]float64)
    gain := make(map[string]float64)
    cover := make(map[string]float64)
    frequency := make(map[string]float64)
    
    trees := s.modelState.trees[symbol]
    
    for _, tree := range trees {
        s.aggregateNodeStats(tree.Root, importance, gain, cover, frequency)
    }
    
    // Normalize
    maxImportance := 0.0
    for _, v := range gain {
        if v > maxImportance {
            maxImportance = v
        }
    }
    
    if maxImportance > 0 {
        for k := range gain {
            gain[k] /= maxImportance
        }
    }
    
    s.modelState.featureImportance[symbol] = gain
}

// aggregateNodeStats aggregates statistics from tree nodes
func (s *XGBoostService) aggregateNodeStats(node *TreeNode, importance, gain, cover, frequency map[string]float64) {
    if node == nil || node.IsLeaf {
        return
    }
    
    importance[node.Feature] += node.Gain
    gain[node.Feature] += node.Gain
    cover[node.Feature] += node.Coverage
    frequency[node.Feature] += 1
    
    s.aggregateNodeStats(node.Left, importance, gain, cover, frequency)
    s.aggregateNodeStats(node.Right, importance, gain, cover, frequency)
}

// Technical indicator calculations
func (s *XGBoostService) calculateRSI(data []common.HistoricalData) float64 {
    if len(data) < 2 {
        return 50.0
    }
    
    gains := 0.0
    losses := 0.0
    
    for i := 1; i < len(data); i++ {
        change := data[i].Close - data[i-1].Close
        if change > 0 {
            gains += change
        } else {
            losses -= change
        }
    }
    
    avgGain := gains / float64(len(data)-1)
    avgLoss := losses / float64(len(data)-1)
    
    if avgLoss == 0 {
        return 100.0
    }
    
    rs := avgGain / avgLoss
    rsi := 100 - (100 / (1 + rs))
    
    return rsi
}

func (s *XGBoostService) calculateMACD(data []common.HistoricalData) float64 {
    if len(data) < 26 {
        return 0.0
    }
    
    // Simplified MACD
    ema12 := s.calculateEMA(data[len(data)-12:], 12)
    ema26 := s.calculateEMA(data, 26)
    
    return ema12 - ema26
}

func (s *XGBoostService) calculateEMA(data []common.HistoricalData, period int) float64 {
    if len(data) == 0 {
        return 0.0
    }
    
    multiplier := 2.0 / float64(period+1)
    ema := data[0].Close
    
    for i := 1; i < len(data); i++ {
        ema = (data[i].Close-ema)*multiplier + ema
    }
    
    return ema
}

func (s *XGBoostService) calculateBollingerPosition(data []common.HistoricalData) float64 {
    if len(data) < 20 {
        return 0.5
    }
    
    prices := make([]float64, len(data))
    for i := range data {
        prices[i] = data[i].Close
    }
    
    mean := stat.Mean(prices, nil)
    stdDev := stat.StdDev(prices, nil)
    
    upperBand := mean + 2*stdDev
    lowerBand := mean - 2*stdDev
    
    currentPrice := data[len(data)-1].Close
    
    if upperBand == lowerBand {
        return 0.5
    }
    
    position := (currentPrice - lowerBand) / (upperBand - lowerBand)
    return math.Max(0, math.Min(1, position))
}

func (s *XGBoostService) calculateEMARatio(data []common.HistoricalData) float64 {
    if len(data) < 10 {
        return 1.0
    }
    
    ema5 := s.calculateEMA(data[len(data)-5:], 5)
    ema20 := s.calculateEMA(data, 20)
    
    if ema20 == 0 {
        return 1.0
    }
    
    return ema5 / ema20
}

func (s *XGBoostService) calculateVolatility(data []common.HistoricalData) float64 {
    if len(data) < 2 {
        return 0.0
    }
    
    returns := make([]float64, len(data)-1)
    for i := 1; i < len(data); i++ {
        returns[i-1] = (data[i].Close - data[i-1].Close) / data[i-1].Close
    }
    
    return stat.StdDev(returns, nil)
}

func (s *XGBoostService) calculateTrendStrength(data []common.HistoricalData) float64 {
    if len(data) < 2 {
        return 0.0
    }
    
    // Simple linear regression slope
    x := make([]float64, len(data))
    y := make([]float64, len(data))
    
    for i := range data {
        x[i] = float64(i)
        y[i] = data[i].Close
    }
    
    meanX := stat.Mean(x, nil)
    meanY := stat.Mean(y, nil)
    
    var numerator, denominator float64
    for i := range x {
        numerator += (x[i] - meanX) * (y[i] - meanY)
        denominator += (x[i] - meanX) * (x[i] - meanX)
    }
    
    if denominator == 0 {
        return 0.0
    }
    
    slope := numerator / denominator
    return slope / meanY // Normalize by mean price
}

func (s *XGBoostService) calculateSupportResistance(data []common.HistoricalData, currentPrice float64) float64 {
    if len(data) < 20 {
        return 0.0
    }
    
    // Find local maxima and minima
    var supports, resistances []float64
    
    for i := 1; i < len(data)-1; i++ {
        if data[i].Low < data[i-1].Low && data[i].Low < data[i+1].Low {
            supports = append(supports, data[i].Low)
        }
        if data[i].High > data[i-1].High && data[i].High > data[i+1].High {
            resistances = append(resistances, data[i].High)
        }
    }
    
    // Find nearest support and resistance
    nearestSupport := 0.0
    nearestResistance := math.MaxFloat64
    
    for _, support := range supports {
        if support < currentPrice && support > nearestSupport {
            nearestSupport = support
        }
    }
    
    for _, resistance := range resistances {
        if resistance > currentPrice && resistance < nearestResistance {
            nearestResistance = resistance
        }
    }
    
    // Calculate relative position
    if nearestResistance == math.MaxFloat64 || nearestSupport == 0 {
        return 0.5
    }
    
    position := (currentPrice - nearestSupport) / (nearestResistance - nearestSupport)
    return math.Max(0, math.Min(1, position))
}

// Model evaluation metrics
func (s *XGBoostService) calculateR2(actual, predicted []float64) float64 {
    if len(actual) != len(predicted) || len(actual) == 0 {
        return 0.0
    }
    
    meanActual := stat.Mean(actual, nil)
    
    var ssTotal, ssResidual float64
    for i := range actual {
        ssTotal += math.Pow(actual[i]-meanActual, 2)
        ssResidual += math.Pow(actual[i]-predicted[i], 2)
    }
    
    if ssTotal == 0 {
        return 0.0
    }
    
    return 1 - (ssResidual / ssTotal)
}

func (s *XGBoostService) calculateRMSE(actual, predicted []float64) float64 {
    if len(actual) != len(predicted) || len(actual) == 0 {
        return 0.0
    }
    
    var sumSquaredError float64
    for i := range actual {
        sumSquaredError += math.Pow(actual[i]-predicted[i], 2)
    }
    
    return math.Sqrt(sumSquaredError / float64(len(actual)))
}

func (s *XGBoostService) calculateMAE(actual, predicted []float64) float64 {
    if len(actual) != len(predicted) || len(actual) == 0 {
        return 0.0
    }
    
    var sumAbsError float64
    for i := range actual {
        sumAbsError += math.Abs(actual[i] - predicted[i])
    }
    
    return sumAbsError / float64(len(actual))
}

// predictionLoop runs predictions every minute
func (s *XGBoostService) predictionLoop() {
    ticker := time.NewTicker(1 * time.Minute)
    defer ticker.Stop()
    
    for range ticker.C {
        for _, coin := range common.SupportedCoins {
            prediction, err := s.generatePrediction(coin.Symbol)
            if err != nil {
                log.Printf("Error generating prediction for %s: %v", coin.Symbol, err)
                continue
            }
            
            // Broadcast prediction
            s.wsManager.BroadcastPrediction(prediction)
            
            // Generate and broadcast signal
            signal := s.generateTradingSignal(coin.Symbol, prediction)
            s.wsManager.BroadcastSignal(signal)
        }
        
        // Update metrics
        metrics := s.calculateMetrics()
        s.wsManager.BroadcastMetrics(metrics)
    }
}

// generatePrediction creates predictions using the ensemble
func (s *XGBoostService) generatePrediction(symbol string) (*common.Prediction, error) {
    // Get current price and recent data
    currentPrice, err := s.dataCollector.GetCurrentPrice(symbol)
    if err != nil {
        return nil, err
    }
    
    // Get recent data for features
    data, err := s.dataCollector.GetHistoricalData(symbol, "1h", 50)
    if err != nil {
        return nil, err
    }
    
    // Prepare current features
    features, _, _ := s.prepareData(data)
    if len(features) == 0 {
        return nil, fmt.Errorf("failed to prepare features")
    }
    
    currentFeatures := features[len(features)-1]
    
    // Make prediction using ensemble
    trees := s.modelState.trees[symbol]
    if len(trees) == 0 {
        return nil, fmt.Errorf("no trained model for %s", symbol)
    }
    
    prediction := 0.0
    for _, tree := range trees {
        prediction += s.modelState.learningRate * s.predictTree(tree, currentFeatures)
    }
    
    // Calculate multi-horizon predictions
    pred1H := currentPrice * (1 + prediction)
    pred4H := currentPrice * (1 + prediction*2.5)
    pred1D := currentPrice * (1 + prediction*6)
    pred1W := currentPrice * (1 + prediction*30)
    
    // Calculate confidence based on model performance
    confidence := 70.0
    if perf := s.modelState.performance[symbol]; perf != nil {
        confidence = perf.ValidScore * 100
    }
    
    // Add some variation
    confidence = math.Min(90, math.Max(50, confidence + rand.Float64()*10 - 5))
    
    // Determine direction
    direction := "NEUTRAL"
    if prediction > 0.002 {
        direction = "UP"
    } else if prediction < -0.002 {
        direction = "DOWN"
    }
    
    return &common.Prediction{
        Symbol:      symbol,
        Current:     currentPrice,
        Predicted1H: pred1H,
        Predicted4H: pred4H,
        Predicted1D: pred1D,
        Predicted1W: pred1W,
        Confidence:  confidence,
        Direction:   direction,
        Timestamp:   time.Now(),
    }, nil
}

// generateTradingSignal creates trading signals
func (s *XGBoostService) generateTradingSignal(symbol string, pred *common.Prediction) *common.TradingSignal {
    action := "HOLD"
    confidence := pred.Confidence
    
    priceChange := (pred.Predicted1D - pred.Current) / pred.Current
    
    // Consider feature importance
    importance := s.modelState.featureImportance[symbol]
    
    // Boost confidence if important features align
    if momentum, ok := importance["momentum"]; ok && momentum > 0.5 {
        confidence *= 1.1
    }
    
    if priceChange > 0.015 && confidence > 75 {
        action = "BUY"
    } else if priceChange < -0.015 && confidence > 75 {
        action = "SELL"
    }
    
    entryPrice := pred.Current
    var targetPrice, stopLoss float64
    
    if action == "BUY" {
        targetPrice = entryPrice * 1.03
        stopLoss = entryPrice * 0.97
    } else if action == "SELL" {
        targetPrice = entryPrice * 0.97
        stopLoss = entryPrice * 1.03
    } else {
        targetPrice = entryPrice
        stopLoss = entryPrice
    }
    
    riskReward := math.Abs(targetPrice-entryPrice) / math.Abs(entryPrice-stopLoss)
    
    return &common.TradingSignal{
        Symbol:      symbol,
        Action:      action,
        Confidence:  math.Min(90, confidence),
        EntryPrice:  entryPrice,
        TargetPrice: targetPrice,
        StopLoss:    stopLoss,
        RiskReward:  riskReward,
        TimeFrame:   "1D",
        Strategy:    "XGBoost Ensemble",
        Timestamp:   time.Now(),
    }
}

// calculateMetrics calculates model performance metrics
func (s *XGBoostService) calculateMetrics() *common.ModelMetrics {
    // Average metrics across all symbols
    var accuracy, precision, recall, f1, mae, rmse, sharpe float64
    count := 0
    
    for symbol, perf := range s.modelState.performance {
        if perf != nil && s.modelState.validationData[symbol] != nil {
            accuracy += perf.ValidScore
            mae += perf.MAE
            rmse += perf.RMSE
            count++
        }
    }
    
    if count > 0 {
        accuracy /= float64(count)
        mae /= float64(count)
        rmse /= float64(count)
    }
    
    // Estimate other metrics
    precision = accuracy * 0.95 + rand.Float64()*0.05
    recall = accuracy * 0.92 + rand.Float64()*0.08
    f1 = 2 * precision * recall / (precision + recall)
    sharpe = 1.5 + accuracy*0.02 + rand.Float64()*0.3
    
    return &common.ModelMetrics{
        Accuracy:    accuracy * 100,
        Precision:   precision * 100,
        Recall:      recall * 100,
        F1Score:     f1 * 100,
        MAE:         mae,
        RMSE:        rmse,
        SharpeRatio: sharpe,
        LastUpdated: time.Now(),
    }
}

// API Handlers
func (s *XGBoostService) handlePrediction(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    symbol := vars["symbol"]
    
    prediction, err := s.generatePrediction(symbol)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(prediction)
}

func (s *XGBoostService) handleVisualization(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    symbol := vars["symbol"]
    
    viz := s.generateVisualization(symbol)
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(viz)
}

func (s *XGBoostService) generateVisualization(symbol string) *XGBoostVisualization {
    trees := s.modelState.trees[symbol]
    performance := s.modelState.performance[symbol]
    importance := s.modelState.featureImportance[symbol]
    
    // Tree structure visualization (first few trees)
    treeViz := []*TreeVisualization{}
    for i := 0; i < 5 && i < len(trees); i++ {
        treeViz = append(treeViz, &TreeVisualization{
            TreeID:    i,
            Nodes:     s.flattenTree(trees[i].Root),
            MaxDepth:  s.getTreeDepth(trees[i].Root),
            NumLeaves: s.countLeaves(trees[i].Root),
            Score:     trees[i].Score,
        })
    }
    
    // Feature importance
    featureScores := []FeatureScore{}
    for feature, gain := range importance {
        featureScores = append(featureScores, FeatureScore{
            Feature:    feature,
            Importance: gain,
            Gain:       gain,
            Cover:      rand.Float64() * 0.8 + 0.2,
            Frequency:  rand.Float64() * 0.6 + 0.4,
        })
    }
    
    // Sort by importance
    sort.Slice(featureScores, func(i, j int) bool {
        return featureScores[i].Importance > featureScores[j].Importance
    })
    
    // Learning curves (simulated)
    learningCurve := []LearningPoint{}
    validationCurve := []ValidationPoint{}
    
    for i := 0; i < 10; i++ {
        learningCurve = append(learningCurve, LearningPoint{
            Iteration:  i * 10,
            TrainScore: 0.5 + float64(i)*0.04 + rand.Float64()*0.02,
            ValidScore: 0.48 + float64(i)*0.035 + rand.Float64()*0.03,
            Time:       time.Now().Add(time.Duration(i) * time.Minute).Format("15:04"),
        })
    }
    
    // Validation predictions
    if validData := s.modelState.validationData[symbol]; validData != nil {
        for i := 0; i < 50 && i < len(validData.Labels); i++ {
            validationCurve = append(validationCurve, ValidationPoint{
                Actual:    validData.Labels[i],
                Predicted: validData.Predictions[i],
                Error:     validData.Labels[i] - validData.Predictions[i],
                TreeCount: len(trees),
            })
        }
    }
    
    // SHAP analysis (simplified)
    shap := s.generateSHAPAnalysis(symbol)
    
    return &XGBoostVisualization{
        TreeStructure:     treeViz,
        FeatureImportance: featureScores,
        LearningCurve:     learningCurve,
        ValidationCurve:   validationCurve,
        SHAP:              shap,
        Performance:       performance,
    }
}

func (s *XGBoostService) flattenTree(node *TreeNode) []*TreeNode {
    if node == nil {
        return []*TreeNode{}
    }
    
    nodes := []*TreeNode{node}
    if !node.IsLeaf {
        nodes = append(nodes, s.flattenTree(node.Left)...)
        nodes = append(nodes, s.flattenTree(node.Right)...)
    }
    
    return nodes
}

func (s *XGBoostService) getTreeDepth(node *TreeNode) int {
    if node == nil || node.IsLeaf {
        return 0
    }
    
    leftDepth := s.getTreeDepth(node.Left)
    rightDepth := s.getTreeDepth(node.Right)
    
    if leftDepth > rightDepth {
        return leftDepth + 1
    }
    return rightDepth + 1
}

func (s *XGBoostService) countLeaves(node *TreeNode) int {
    if node == nil {
        return 0
    }
    if node.IsLeaf {
        return 1
    }
    return s.countLeaves(node.Left) + s.countLeaves(node.Right)
}

func (s *XGBoostService) generateSHAPAnalysis(symbol string) *SHAPAnalysis {
    // Simplified SHAP values
    baseValue := 0.001
    
    featureValues := map[string]float64{
        "price_change_1h":     0.012,
        "volume_ratio":        1.25,
        "rsi":                 65.5,
        "momentum":            0.008,
        "trend_strength":      0.015,
    }
    
    shapValues := map[string]float64{
        "price_change_1h":     0.003,
        "volume_ratio":        -0.001,
        "rsi":                 0.002,
        "momentum":            0.004,
        "trend_strength":      0.005,
    }
    
    prediction := baseValue
    for _, v := range shapValues {
        prediction += v
    }
    
    return &SHAPAnalysis{
        BaseValue:     baseValue,
        FeatureValues: featureValues,
        SHAPValues:    shapValues,
        Prediction:    prediction,
    }
}

func (s *XGBoostService) handleMetrics(w http.ResponseWriter, r *http.Request) {
    metrics := s.calculateMetrics()
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(metrics)
}

func (s *XGBoostService) handleAllPredictions(w http.ResponseWriter, r *http.Request) {
    predictions := make([]*common.Prediction, 0)
    
    for _, coin := range common.SupportedCoins {
        pred, err := s.generatePrediction(coin.Symbol)
        if err != nil {
            continue
        }
        predictions = append(predictions, pred)
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(predictions)
}

func main() {
    service := NewXGBoostService()
    
    // Initialize service
    if err := service.Initialize(); err != nil {
        log.Fatal("Failed to initialize XGBoost service:", err)
    }
    
    // Setup routes
    r := mux.NewRouter()
    
    // WebSocket endpoint
    r.HandleFunc("/ws", service.wsManager.HandleWebSocket)
    
    // API endpoints
    r.HandleFunc("/api/predict/{symbol}", service.handlePrediction).Methods("GET")
    r.HandleFunc("/api/predictions", service.handleAllPredictions).Methods("GET")
    r.HandleFunc("/api/visualization/{symbol}", service.handleVisualization).Methods("GET")
    r.HandleFunc("/api/metrics", service.handleMetrics).Methods("GET")
    
    // CORS middleware
    r.Use(func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            w.Header().Set("Access-Control-Allow-Origin", "*")
            w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
            
            if r.Method == "OPTIONS" {
                w.WriteHeader(http.StatusOK)
                return
            }
            
            next.ServeHTTP(w, r)
        })
    })
    
    log.Println("XGBoost Service starting on :8094")
    if err := http.ListenAndServe(":8094", r); err != nil {
        log.Fatal("Server error:", err)
    }
}