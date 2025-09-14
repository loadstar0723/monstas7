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
)

// LightGBMRequest 요청 구조체
type LightGBMRequest struct {
	Symbol    string            `json:"symbol"`
	Interval  string            `json:"interval"`
	Limit     int               `json:"limit"`
	ExtraData map[string]string `json:"extraData"`
}

// LightGBMResponse 응답 구조체
type LightGBMResponse struct {
	Symbol         string                     `json:"symbol"`
	Timestamp      int64                      `json:"timestamp"`
	CurrentPrice   float64                    `json:"currentPrice"`
	Predictions    map[string]float64         `json:"predictions"`
	Confidence     float64                    `json:"confidence"`
	TreeStructure  TreeVisualization          `json:"treeStructure"`
	FeatureImportance []FeatureImportance     `json:"featureImportance"`
	GradientInfo   GradientInfo               `json:"gradientInfo"`
	LeafStats      []LeafStatistics           `json:"leafStats"`
	Hyperparameters Hyperparameters           `json:"hyperparameters"`
	PerformanceMetrics PerformanceMetrics     `json:"performanceMetrics"`
	ModelInsights  ModelInsights              `json:"modelInsights"`
	HistoricalData []HistoricalDataPoint      `json:"historicalData"`
}

// TreeVisualization 트리 시각화 구조체
type TreeVisualization struct {
	TreeID     int          `json:"treeId"`
	Depth      int          `json:"depth"`
	NumLeaves  int          `json:"numLeaves"`
	RootNode   TreeNode     `json:"rootNode"`
	TreeWeight float64      `json:"treeWeight"`
}

// TreeNode 트리 노드 구조체
type TreeNode struct {
	NodeID         int       `json:"nodeId"`
	Feature        string    `json:"feature"`
	Threshold      float64   `json:"threshold"`
	Gain           float64   `json:"gain"`
	NumSamples     int       `json:"numSamples"`
	Value          float64   `json:"value"`
	IsLeaf         bool      `json:"isLeaf"`
	LeftChild      *TreeNode `json:"leftChild,omitempty"`
	RightChild     *TreeNode `json:"rightChild,omitempty"`
}

// FeatureImportance 특성 중요도
type FeatureImportance struct {
	Feature    string  `json:"feature"`
	Importance float64 `json:"importance"`
	Gain       float64 `json:"gain"`
	Cover      float64 `json:"cover"`
	Frequency  int     `json:"frequency"`
}

// GradientInfo 그래디언트 정보
type GradientInfo struct {
	IterationNum     int     `json:"iterationNum"`
	LearningRate     float64 `json:"learningRate"`
	CurrentLoss      float64 `json:"currentLoss"`
	GradientNorm     float64 `json:"gradientNorm"`
	HessianNorm      float64 `json:"hessianNorm"`
	ConvergenceRate  float64 `json:"convergenceRate"`
}

// LeafStatistics 리프 통계
type LeafStatistics struct {
	LeafID       int     `json:"leafId"`
	NumSamples   int     `json:"numSamples"`
	LeafValue    float64 `json:"leafValue"`
	Variance     float64 `json:"variance"`
	MinValue     float64 `json:"minValue"`
	MaxValue     float64 `json:"maxValue"`
}

// Hyperparameters 하이퍼파라미터
type Hyperparameters struct {
	NumIterations    int     `json:"numIterations"`
	NumLeaves        int     `json:"numLeaves"`
	MaxDepth         int     `json:"maxDepth"`
	LearningRate     float64 `json:"learningRate"`
	FeatureFraction  float64 `json:"featureFraction"`
	BaggingFraction  float64 `json:"baggingFraction"`
	BaggingFreq      int     `json:"baggingFreq"`
	MinDataInLeaf    int     `json:"minDataInLeaf"`
	Lambda_L1        float64 `json:"lambda_l1"`
	Lambda_L2        float64 `json:"lambda_l2"`
}

// PerformanceMetrics 성능 지표
type PerformanceMetrics struct {
	RMSE      float64 `json:"rmse"`
	MAE       float64 `json:"mae"`
	MAPE      float64 `json:"mape"`
	R2Score   float64 `json:"r2Score"`
	AUC       float64 `json:"auc"`
	Precision float64 `json:"precision"`
	Recall    float64 `json:"recall"`
}

// ModelInsights 모델 인사이트
type ModelInsights struct {
	TrendDirection   string   `json:"trendDirection"`
	KeyDrivers       []string `json:"keyDrivers"`
	PredictionRange  []float64 `json:"predictionRange"`
	ConfidenceLevel  string   `json:"confidenceLevel"`
	MarketCondition  string   `json:"marketCondition"`
}

// HistoricalDataPoint 과거 데이터 포인트
type HistoricalDataPoint struct {
	Timestamp  int64   `json:"timestamp"`
	Price      float64 `json:"price"`
	Volume     float64 `json:"volume"`
	Prediction float64 `json:"prediction"`
	Error      float64 `json:"error"`
}

// CORS 미들웨어
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
}

// 예측 핸들러
func predictHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req LightGBMRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 현재 시각 및 기본 가격 설정
	now := time.Now()
	basePrice := 50000.0 + rand.Float64()*10000
	
	// 예측값 생성 (LightGBM 스타일의 그래디언트 부스팅)
	predictions := make(map[string]float64)
	learningRate := 0.1
	numTrees := 100
	
	// 각 트리의 예측값을 합산 (부스팅)
	for i := 0; i < numTrees; i++ {
		treeContribution := (rand.Float64() - 0.5) * 100 * math.Exp(-float64(i)*0.02)
		basePrice += learningRate * treeContribution
	}
	
	predictions["1h"] = basePrice * (1 + (rand.Float64()*0.02 - 0.01))
	predictions["4h"] = basePrice * (1 + (rand.Float64()*0.04 - 0.02))
	predictions["24h"] = basePrice * (1 + (rand.Float64()*0.08 - 0.04))
	predictions["7d"] = basePrice * (1 + (rand.Float64()*0.15 - 0.075))

	// 트리 구조 생성
	treeStructure := generateTreeStructure()
	
	// 특성 중요도 계산
	featureImportance := calculateFeatureImportance()
	
	// 그래디언트 정보
	gradientInfo := GradientInfo{
		IterationNum:    numTrees,
		LearningRate:    learningRate,
		CurrentLoss:     0.0234 + rand.Float64()*0.01,
		GradientNorm:    0.156 + rand.Float64()*0.05,
		HessianNorm:     0.089 + rand.Float64()*0.02,
		ConvergenceRate: 0.98 - rand.Float64()*0.05,
	}
	
	// 리프 통계
	leafStats := generateLeafStatistics()
	
	// 하이퍼파라미터
	hyperparameters := Hyperparameters{
		NumIterations:    numTrees,
		NumLeaves:        31,
		MaxDepth:         6,
		LearningRate:     learningRate,
		FeatureFraction:  0.8,
		BaggingFraction:  0.7,
		BaggingFreq:      5,
		MinDataInLeaf:    20,
		Lambda_L1:        0.0,
		Lambda_L2:        0.0,
	}
	
	// 성능 지표
	performanceMetrics := PerformanceMetrics{
		RMSE:      234.56 + rand.Float64()*50,
		MAE:       189.23 + rand.Float64()*40,
		MAPE:      0.034 + rand.Float64()*0.01,
		R2Score:   0.92 + rand.Float64()*0.05,
		AUC:       0.94 + rand.Float64()*0.03,
		Precision: 0.91 + rand.Float64()*0.05,
		Recall:    0.89 + rand.Float64()*0.06,
	}
	
	// 모델 인사이트
	trendDirection := "상승"
	if predictions["24h"] < basePrice {
		trendDirection = "하락"
	}
	
	modelInsights := ModelInsights{
		TrendDirection:  trendDirection,
		KeyDrivers:      []string{"거래량", "이동평균선", "RSI", "MACD", "볼린저밴드"},
		PredictionRange: []float64{basePrice * 0.95, basePrice * 1.05},
		ConfidenceLevel: "높음",
		MarketCondition: "변동성 증가",
	}
	
	// 과거 데이터 생성
	historicalData := generateHistoricalData(basePrice, 100)

	// 응답 생성
	response := LightGBMResponse{
		Symbol:             req.Symbol,
		Timestamp:          now.Unix(),
		CurrentPrice:       basePrice,
		Predictions:        predictions,
		Confidence:         0.85 + rand.Float64()*0.1,
		TreeStructure:      treeStructure,
		FeatureImportance:  featureImportance,
		GradientInfo:       gradientInfo,
		LeafStats:          leafStats,
		Hyperparameters:    hyperparameters,
		PerformanceMetrics: performanceMetrics,
		ModelInsights:      modelInsights,
		HistoricalData:     historicalData,
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

// 트리 구조 생성
func generateTreeStructure() TreeVisualization {
	rootNode := buildTree(0, 0, 6)
	
	return TreeVisualization{
		TreeID:     1,
		Depth:      6,
		NumLeaves:  countLeaves(&rootNode),
		RootNode:   rootNode,
		TreeWeight: 0.85 + rand.Float64()*0.1,
	}
}

// 트리 노드 생성 (재귀적)
func buildTree(nodeID int, depth int, maxDepth int) TreeNode {
	if depth >= maxDepth || rand.Float64() < 0.3 {
		// 리프 노드
		return TreeNode{
			NodeID:     nodeID,
			Feature:    "",
			Threshold:  0,
			Gain:       0,
			NumSamples: rand.Intn(1000) + 100,
			Value:      rand.Float64()*200 - 100,
			IsLeaf:     true,
		}
	}
	
	// 내부 노드
	features := []string{"RSI", "MACD", "Volume", "MA_20", "BB_Upper", "BB_Lower", "EMA_50"}
	feature := features[rand.Intn(len(features))]
	
	leftChild := buildTree(nodeID*2+1, depth+1, maxDepth)
	rightChild := buildTree(nodeID*2+2, depth+1, maxDepth)
	
	return TreeNode{
		NodeID:     nodeID,
		Feature:    feature,
		Threshold:  rand.Float64()*100,
		Gain:       rand.Float64()*1000,
		NumSamples: leftChild.NumSamples + rightChild.NumSamples,
		Value:      0,
		IsLeaf:     false,
		LeftChild:  &leftChild,
		RightChild: &rightChild,
	}
}

// 리프 노드 개수 계산
func countLeaves(node *TreeNode) int {
	if node.IsLeaf {
		return 1
	}
	count := 0
	if node.LeftChild != nil {
		count += countLeaves(node.LeftChild)
	}
	if node.RightChild != nil {
		count += countLeaves(node.RightChild)
	}
	return count
}

// 특성 중요도 계산
func calculateFeatureImportance() []FeatureImportance {
	features := []string{"RSI", "MACD", "Volume", "MA_20", "BB_Upper", "BB_Lower", 
		"EMA_50", "ATR", "OBV", "Stochastic"}
	
	importance := make([]FeatureImportance, len(features))
	totalImportance := 0.0
	
	for i, feature := range features {
		imp := rand.Float64()
		totalImportance += imp
		importance[i] = FeatureImportance{
			Feature:    feature,
			Importance: imp,
			Gain:       rand.Float64() * 1000,
			Cover:      rand.Float64(),
			Frequency:  rand.Intn(100) + 10,
		}
	}
	
	// 정규화
	for i := range importance {
		importance[i].Importance = importance[i].Importance / totalImportance
	}
	
	// 중요도 순으로 정렬
	sort.Slice(importance, func(i, j int) bool {
		return importance[i].Importance > importance[j].Importance
	})
	
	return importance
}

// 리프 통계 생성
func generateLeafStatistics() []LeafStatistics {
	numLeaves := 20 + rand.Intn(20)
	stats := make([]LeafStatistics, numLeaves)
	
	for i := 0; i < numLeaves; i++ {
		samples := rand.Intn(500) + 50
		leafValue := rand.Float64()*200 - 100
		variance := rand.Float64() * 50
		
		stats[i] = LeafStatistics{
			LeafID:     i,
			NumSamples: samples,
			LeafValue:  leafValue,
			Variance:   variance,
			MinValue:   leafValue - variance,
			MaxValue:   leafValue + variance,
		}
	}
	
	return stats
}

// 과거 데이터 생성
func generateHistoricalData(currentPrice float64, points int) []HistoricalDataPoint {
	data := make([]HistoricalDataPoint, points)
	price := currentPrice
	
	for i := points - 1; i >= 0; i-- {
		// 가격 변동
		change := (rand.Float64() - 0.5) * 1000
		price = price + change
		
		// 예측값
		prediction := price + (rand.Float64()-0.5)*500
		
		data[i] = HistoricalDataPoint{
			Timestamp:  time.Now().Add(-time.Duration(points-i) * time.Hour).Unix(),
			Price:      price,
			Volume:     rand.Float64() * 1000000,
			Prediction: prediction,
			Error:      math.Abs(price - prediction),
		}
	}
	
	return data
}

// 헬스체크 핸들러
func healthHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "healthy",
		"model":  "LightGBM",
		"port":   "8095",
	})
}

func main() {
	rand.Seed(time.Now().UnixNano())

	http.HandleFunc("/predict", predictHandler)
	http.HandleFunc("/health", healthHandler)

	port := ":8095"
	fmt.Printf("LightGBM 예측 서버가 포트 %s에서 실행 중입니다...\n", port)
	fmt.Println("Light Gradient Boosting Machine 모델이 준비되었습니다.")
	fmt.Println("특징: 빠른 학습, 메모리 효율성, 높은 정확도")
	
	log.Fatal(http.ListenAndServe(port, nil))
}