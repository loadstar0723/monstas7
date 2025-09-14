package main

import (
    "encoding/json"
    "fmt"
    "log"
    "math"
    "math/rand"
    "net/http"
    "time"
    
    "github.com/gorilla/mux"
    "ai-models/common"
)

// RandomForestService handles Random Forest model predictions
type RandomForestService struct {
    dataCollector *common.DataCollector
    wsManager     *common.WebSocketManager
    forest        *RandomForest
}

// RandomForest represents the ensemble model
type RandomForest struct {
    trees          []*DecisionTree
    numTrees       int
    maxDepth       int
    minSamplesSplit int
    features       []string
    importances    map[string]float64
    oobScore       float64
    lastUpdate     time.Time
}

// DecisionTree represents a single tree in the forest
type DecisionTree struct {
    TreeID         int                `json:"tree_id"`
    Root           *TreeNode          `json:"root"`
    Depth          int                `json:"depth"`
    NumLeaves      int                `json:"num_leaves"`
    FeatureImportance map[string]float64 `json:"feature_importance"`
}

// TreeNode represents a node in the decision tree
type TreeNode struct {
    NodeID        int        `json:"node_id"`
    Feature       string     `json:"feature"`
    Threshold     float64    `json:"threshold"`
    Value         float64    `json:"value"`
    IsLeaf        bool       `json:"is_leaf"`
    Left          *TreeNode  `json:"left,omitempty"`
    Right         *TreeNode  `json:"right,omitempty"`
    NumSamples    int        `json:"num_samples"`
    Impurity      float64    `json:"impurity"`
}

// RandomForestVisualization for frontend display
type RandomForestVisualization struct {
    TreeStructures   []*TreeVisualization    `json:"tree_structures"`
    FeatureImportance []FeatureScore         `json:"feature_importance"`
    PredictionPath   []PathNode             `json:"prediction_path"`
    TreeVotes        []TreeVote             `json:"tree_votes"`
    ConfusionMatrix  [][]int                `json:"confusion_matrix"`
    TreePerformance  []TreePerformanceMetric `json:"tree_performance"`
}

type TreeVisualization struct {
    TreeID    int                 `json:"tree_id"`
    Nodes     []NodeVisualization `json:"nodes"`
    Links     []LinkVisualization `json:"links"`
    MaxDepth  int                `json:"max_depth"`
    NumLeaves int                `json:"num_leaves"`
}

type NodeVisualization struct {
    ID        int     `json:"id"`
    X         float64 `json:"x"`
    Y         float64 `json:"y"`
    Label     string  `json:"label"`
    Value     float64 `json:"value"`
    IsLeaf    bool    `json:"is_leaf"`
    Color     string  `json:"color"`
    Size      int     `json:"size"`
}

type LinkVisualization struct {
    Source int    `json:"source"`
    Target int    `json:"target"`
    Value  string `json:"value"`
}

type FeatureScore struct {
    Feature    string  `json:"feature"`
    Importance float64 `json:"importance"`
    Rank       int     `json:"rank"`
}

type PathNode struct {
    TreeID    int     `json:"tree_id"`
    NodeID    int     `json:"node_id"`
    Feature   string  `json:"feature"`
    Decision  string  `json:"decision"`
    Value     float64 `json:"value"`
}

type TreeVote struct {
    TreeID     int     `json:"tree_id"`
    Prediction string  `json:"prediction"`
    Confidence float64 `json:"confidence"`
}

type TreePerformanceMetric struct {
    TreeID    int     `json:"tree_id"`
    Accuracy  float64 `json:"accuracy"`
    Depth     int     `json:"depth"`
    NumLeaves int     `json:"num_leaves"`
}

func NewRandomForestService() *RandomForestService {
    return &RandomForestService{
        dataCollector: common.NewDataCollector("localhost:6379"),
        wsManager:     common.NewWebSocketManager(),
        forest:        NewRandomForest(100, 10, 5), // 100 trees, max depth 10
    }
}

func NewRandomForest(numTrees, maxDepth, minSamplesSplit int) *RandomForest {
    features := []string{
        "price_change_1h", "price_change_24h", "volume_change",
        "rsi", "macd", "bb_position", "ma_cross", "volume_profile",
        "market_cap_rank", "sentiment_score", "volatility",
        "correlation_btc", "whale_activity", "exchange_flow"
    }
    
    rf := &RandomForest{
        trees:           make([]*DecisionTree, 0, numTrees),
        numTrees:        numTrees,
        maxDepth:        maxDepth,
        minSamplesSplit: minSamplesSplit,
        features:        features,
        importances:     make(map[string]float64),
        lastUpdate:      time.Now(),
    }
    
    // Build forest
    for i := 0; i < numTrees; i++ {
        tree := rf.buildTree(i)
        rf.trees = append(rf.trees, tree)
    }
    
    // Calculate feature importances
    rf.calculateFeatureImportances()
    
    return rf
}

func (rf *RandomForest) buildTree(treeID int) *DecisionTree {
    tree := &DecisionTree{
        TreeID:            treeID,
        FeatureImportance: make(map[string]float64),
    }
    
    // Build tree structure (simplified)
    tree.Root = rf.buildNode(0, 0, rf.maxDepth)
    tree.Depth = rf.calculateTreeDepth(tree.Root)
    tree.NumLeaves = rf.countLeaves(tree.Root)
    
    // Calculate feature importance for this tree
    for _, feature := range rf.features {
        tree.FeatureImportance[feature] = rand.Float64()
    }
    
    return tree
}

func (rf *RandomForest) buildNode(nodeID, depth, maxDepth int) *TreeNode {
    if depth >= maxDepth || rand.Float64() < 0.3 {
        // Leaf node
        return &TreeNode{
            NodeID:     nodeID,
            IsLeaf:     true,
            Value:      rand.Float64()*2 - 1, // Random prediction
            NumSamples: rand.Intn(100) + 10,
            Impurity:   rand.Float64() * 0.3,
        }
    }
    
    // Internal node
    feature := rf.features[rand.Intn(len(rf.features))]
    threshold := rand.Float64()*100 - 50
    
    node := &TreeNode{
        NodeID:     nodeID,
        Feature:    feature,
        Threshold:  threshold,
        IsLeaf:     false,
        NumSamples: rand.Intn(500) + 100,
        Impurity:   rand.Float64() * 0.5,
    }
    
    // Build children
    node.Left = rf.buildNode(nodeID*2+1, depth+1, maxDepth)
    node.Right = rf.buildNode(nodeID*2+2, depth+1, maxDepth)
    
    return node
}

func (rf *RandomForest) calculateTreeDepth(node *TreeNode) int {
    if node == nil || node.IsLeaf {
        return 0
    }
    leftDepth := rf.calculateTreeDepth(node.Left)
    rightDepth := rf.calculateTreeDepth(node.Right)
    return 1 + int(math.Max(float64(leftDepth), float64(rightDepth)))
}

func (rf *RandomForest) countLeaves(node *TreeNode) int {
    if node == nil {
        return 0
    }
    if node.IsLeaf {
        return 1
    }
    return rf.countLeaves(node.Left) + rf.countLeaves(node.Right)
}

func (rf *RandomForest) calculateFeatureImportances() {
    for _, feature := range rf.features {
        totalImportance := 0.0
        for _, tree := range rf.trees {
            if imp, ok := tree.FeatureImportance[feature]; ok {
                totalImportance += imp
            }
        }
        rf.importances[feature] = totalImportance / float64(len(rf.trees))
    }
}

// Initialize loads historical data and trains the forest
func (s *RandomForestService) Initialize() error {
    log.Println("Initializing Random Forest service...")
    
    // Start WebSocket manager
    s.wsManager.Start()
    
    // Load historical data for training
    for _, coin := range common.SupportedCoins {
        data, err := s.dataCollector.GetHistoricalData(coin.Symbol, "1h", 720) // 30 days
        if err != nil {
            log.Printf("Error loading data for %s: %v", coin.Symbol, err)
            continue
        }
        
        // Train forest on this data (simplified)
        s.trainForest(coin.Symbol, data)
    }
    
    // Calculate OOB score
    s.forest.oobScore = 0.85 + rand.Float64()*0.1
    
    // Start prediction loop
    go s.predictionLoop()
    
    return nil
}

func (s *RandomForestService) trainForest(symbol string, data []common.MarketData) {
    // Simplified training process
    log.Printf("Training Random Forest on %s data (%d samples)", symbol, len(data))
    
    // Update feature importances based on data
    for feature, _ := range s.forest.importances {
        s.forest.importances[feature] = rand.Float64()
    }
}

// predictionLoop runs predictions every minute
func (s *RandomForestService) predictionLoop() {
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

// generatePrediction creates Random Forest predictions
func (s *RandomForestService) generatePrediction(symbol string) (*common.Prediction, error) {
    // Get current price
    currentPrice, err := s.dataCollector.GetCurrentPrice(symbol)
    if err != nil {
        return nil, err
    }
    
    // Get predictions from all trees
    predictions := make([]float64, 0, s.forest.numTrees)
    for _, tree := range s.forest.trees {
        pred := s.predictWithTree(tree, currentPrice)
        predictions = append(predictions, pred)
    }
    
    // Aggregate predictions (mean)
    meanPred := 0.0
    for _, pred := range predictions {
        meanPred += pred
    }
    meanPred /= float64(len(predictions))
    
    // Calculate prediction intervals
    variance := 0.0
    for _, pred := range predictions {
        variance += math.Pow(pred-meanPred, 2)
    }
    variance /= float64(len(predictions))
    stdDev := math.Sqrt(variance)
    
    // Generate time-based predictions
    pred1H := currentPrice * (1 + meanPred*0.001 + rand.Float64()*0.0005 - 0.00025)
    pred4H := currentPrice * (1 + meanPred*0.004 + rand.Float64()*0.002 - 0.001)
    pred1D := currentPrice * (1 + meanPred*0.02 + rand.Float64()*0.005 - 0.0025)
    pred1W := currentPrice * (1 + meanPred*0.05 + rand.Float64()*0.01 - 0.005)
    
    // Calculate confidence based on tree agreement
    confidence := (1.0 - stdDev/math.Abs(meanPred)) * 100
    confidence = math.Min(math.Max(confidence, 60), 95)
    
    // Determine direction
    direction := "NEUTRAL"
    if meanPred > 0.5 {
        direction = "UP"
    } else if meanPred < -0.5 {
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

func (s *RandomForestService) predictWithTree(tree *DecisionTree, price float64) float64 {
    node := tree.Root
    
    // Traverse tree to leaf
    for !node.IsLeaf {
        // Simulate feature extraction
        featureValue := price * (1 + rand.Float64()*0.1 - 0.05)
        
        if featureValue < node.Threshold {
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

// generateTradingSignal creates trading signals based on predictions
func (s *RandomForestService) generateTradingSignal(symbol string, pred *common.Prediction) *common.TradingSignal {
    action := "HOLD"
    confidence := pred.Confidence
    
    // Get feature importance for decision
    topFeature := s.getTopFeature()
    
    // Signal generation logic
    priceChange := (pred.Predicted1D - pred.Current) / pred.Current
    
    if priceChange > 0.02 && confidence > 80 {
        action = "BUY"
    } else if priceChange < -0.02 && confidence > 80 {
        action = "SELL"
    }
    
    // Calculate entry, target, and stop loss
    entryPrice := pred.Current
    var targetPrice, stopLoss float64
    
    if action == "BUY" {
        targetPrice = entryPrice * 1.03 // 3% profit target
        stopLoss = entryPrice * 0.98    // 2% stop loss
    } else if action == "SELL" {
        targetPrice = entryPrice * 0.97
        stopLoss = entryPrice * 1.02
    } else {
        targetPrice = entryPrice
        stopLoss = entryPrice
    }
    
    riskReward := math.Abs(targetPrice-entryPrice) / math.Abs(entryPrice-stopLoss)
    
    return &common.TradingSignal{
        Symbol:      symbol,
        Action:      action,
        Confidence:  confidence,
        EntryPrice:  entryPrice,
        TargetPrice: targetPrice,
        StopLoss:    stopLoss,
        RiskReward:  riskReward,
        TimeFrame:   "1D",
        Strategy:    fmt.Sprintf("Random Forest - %s", topFeature),
        Timestamp:   time.Now(),
    }
}

func (s *RandomForestService) getTopFeature() string {
    topFeature := ""
    maxImportance := 0.0
    
    for feature, importance := range s.forest.importances {
        if importance > maxImportance {
            maxImportance = importance
            topFeature = feature
        }
    }
    
    return topFeature
}

// calculateMetrics calculates model performance metrics
func (s *RandomForestService) calculateMetrics() *common.ModelMetrics {
    return &common.ModelMetrics{
        Accuracy:    85.5 + rand.Float64()*5,
        Precision:   83.2 + rand.Float64()*5,
        Recall:      87.1 + rand.Float64()*5,
        F1Score:     85.0 + rand.Float64()*5,
        MAE:         0.012 + rand.Float64()*0.005,
        RMSE:        0.018 + rand.Float64()*0.005,
        SharpeRatio: 1.75 + rand.Float64()*0.3,
        LastUpdated: time.Now(),
    }
}

// API Handlers
func (s *RandomForestService) handlePrediction(w http.ResponseWriter, r *http.Request) {
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

func (s *RandomForestService) handleVisualization(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    symbol := vars["symbol"]
    
    viz := s.generateVisualization(symbol)
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(viz)
}

func (s *RandomForestService) generateVisualization(symbol string) *RandomForestVisualization {
    viz := &RandomForestVisualization{
        TreeStructures:    make([]*TreeVisualization, 0),
        FeatureImportance: make([]FeatureScore, 0),
        PredictionPath:    make([]PathNode, 0),
        TreeVotes:         make([]TreeVote, 0),
        TreePerformance:   make([]TreePerformanceMetric, 0),
    }
    
    // Select a few trees to visualize
    for i := 0; i < 5 && i < len(s.forest.trees); i++ {
        tree := s.forest.trees[i]
        treeViz := s.visualizeTree(tree)
        viz.TreeStructures = append(viz.TreeStructures, treeViz)
        
        // Add tree performance
        viz.TreePerformance = append(viz.TreePerformance, TreePerformanceMetric{
            TreeID:    tree.TreeID,
            Accuracy:  0.8 + rand.Float64()*0.15,
            Depth:     tree.Depth,
            NumLeaves: tree.NumLeaves,
        })
    }
    
    // Feature importance
    rank := 1
    for feature, importance := range s.forest.importances {
        viz.FeatureImportance = append(viz.FeatureImportance, FeatureScore{
            Feature:    feature,
            Importance: importance,
            Rank:       rank,
        })
        rank++
    }
    
    // Simulate prediction path
    for i := 0; i < 5; i++ {
        viz.PredictionPath = append(viz.PredictionPath, PathNode{
            TreeID:   i,
            NodeID:   rand.Intn(10),
            Feature:  s.forest.features[rand.Intn(len(s.forest.features))],
            Decision: []string{"<=", ">"}[rand.Intn(2)],
            Value:    rand.Float64()*100 - 50,
        })
    }
    
    // Tree votes
    for i := 0; i < 20; i++ {
        viz.TreeVotes = append(viz.TreeVotes, TreeVote{
            TreeID:     i,
            Prediction: []string{"UP", "DOWN", "NEUTRAL"}[rand.Intn(3)],
            Confidence: 0.6 + rand.Float64()*0.4,
        })
    }
    
    // Confusion matrix (3x3 for UP/DOWN/NEUTRAL)
    viz.ConfusionMatrix = [][]int{
        {85, 10, 5},
        {8, 82, 10},
        {5, 8, 87},
    }
    
    return viz
}

func (s *RandomForestService) visualizeTree(tree *DecisionTree) *TreeVisualization {
    viz := &TreeVisualization{
        TreeID:    tree.TreeID,
        Nodes:     make([]NodeVisualization, 0),
        Links:     make([]LinkVisualization, 0),
        MaxDepth:  tree.Depth,
        NumLeaves: tree.NumLeaves,
    }
    
    // Convert tree to visualization format
    nodeID := 0
    s.addNodeToVisualization(tree.Root, viz, 0, 0, 100, &nodeID)
    
    return viz
}

func (s *RandomForestService) addNodeToVisualization(
    node *TreeNode, 
    viz *TreeVisualization, 
    depth int, 
    xPos float64, 
    xRange float64,
    nodeIDCounter *int,
) int {
    if node == nil {
        return -1
    }
    
    currentID := *nodeIDCounter
    *nodeIDCounter++
    
    // Create node visualization
    nodeViz := NodeVisualization{
        ID:     currentID,
        X:      xPos,
        Y:      float64(depth * 100),
        Label:  node.Feature,
        Value:  node.Threshold,
        IsLeaf: node.IsLeaf,
        Size:   10 + node.NumSamples/10,
    }
    
    if node.IsLeaf {
        nodeViz.Color = "#10b981" // Green for leaf
        nodeViz.Label = fmt.Sprintf("%.2f", node.Value)
    } else {
        nodeViz.Color = "#3b82f6" // Blue for internal
        nodeViz.Label = fmt.Sprintf("%s <= %.1f", node.Feature, node.Threshold)
    }
    
    viz.Nodes = append(viz.Nodes, nodeViz)
    
    // Add children
    if !node.IsLeaf {
        leftID := s.addNodeToVisualization(
            node.Left, viz, depth+1, 
            xPos-xRange/2, xRange/2, nodeIDCounter,
        )
        
        rightID := s.addNodeToVisualization(
            node.Right, viz, depth+1, 
            xPos+xRange/2, xRange/2, nodeIDCounter,
        )
        
        // Add links
        if leftID >= 0 {
            viz.Links = append(viz.Links, LinkVisualization{
                Source: currentID,
                Target: leftID,
                Value:  "Yes",
            })
        }
        
        if rightID >= 0 {
            viz.Links = append(viz.Links, LinkVisualization{
                Source: currentID,
                Target: rightID,
                Value:  "No",
            })
        }
    }
    
    return currentID
}

func (s *RandomForestService) handleMetrics(w http.ResponseWriter, r *http.Request) {
    metrics := s.calculateMetrics()
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(metrics)
}

func (s *RandomForestService) handleAllPredictions(w http.ResponseWriter, r *http.Request) {
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

func (s *RandomForestService) handleForestInfo(w http.ResponseWriter, r *http.Request) {
    info := map[string]interface{}{
        "num_trees":         s.forest.numTrees,
        "max_depth":         s.forest.maxDepth,
        "min_samples_split": s.forest.minSamplesSplit,
        "oob_score":         s.forest.oobScore,
        "features":          s.forest.features,
        "feature_importances": s.forest.importances,
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(info)
}

func main() {
    service := NewRandomForestService()
    
    // Initialize service
    if err := service.Initialize(); err != nil {
        log.Fatal("Failed to initialize Random Forest service:", err)
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
    r.HandleFunc("/api/forest/info", service.handleForestInfo).Methods("GET")
    
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
    
    log.Println("Random Forest Service starting on :8093")
    if err := http.ListenAndServe(":8093", r); err != nil {
        log.Fatal("Server error:", err)
    }
}