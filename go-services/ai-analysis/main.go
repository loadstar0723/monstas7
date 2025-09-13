package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "math"
    "net/http"
    "sync"
    "time"

    "github.com/go-redis/redis/v8"
    "github.com/gorilla/mux"
    "github.com/gorilla/websocket"
)

// AI 분석 서비스 - 실시간 시장 분석 엔진
type AIAnalysisService struct {
    redis       *redis.Client
    wsClients   map[*websocket.Conn]bool
    mu          sync.RWMutex
    analysisData *MarketAnalysis
}

// 시장 종합 분석 데이터
type MarketAnalysis struct {
    Timestamp       time.Time       `json:"timestamp"`
    MarketSentiment string          `json:"market_sentiment"` // 극도의공포/공포/중립/탐욕/극도의탐욕
    TrendDirection  string          `json:"trend_direction"`  // 상승/하락/횡보
    Strength        float64         `json:"strength"`         // 0-100
    Predictions     []Prediction    `json:"predictions"`
    Indicators      TechnicalIndicators `json:"indicators"`
    Opportunities   []TradingOpportunity `json:"opportunities"`
    RiskLevel       string          `json:"risk_level"`       // LOW/MEDIUM/HIGH
    AIConfidence    float64         `json:"ai_confidence"`    // 0-100
}

// 가격 예측
type Prediction struct {
    Symbol      string  `json:"symbol"`
    Current     float64 `json:"current"`
    Predicted1H float64 `json:"predicted_1h"`
    Predicted4H float64 `json:"predicted_4h"`
    Predicted1D float64 `json:"predicted_1d"`
    Confidence  float64 `json:"confidence"`
    Direction   string  `json:"direction"` // UP/DOWN/NEUTRAL
}

// 기술적 지표
type TechnicalIndicators struct {
    RSI        map[string]float64 `json:"rsi"`
    MACD       map[string]MACDData `json:"macd"`
    BollingerBands map[string]BBData `json:"bollinger_bands"`
    Volume     map[string]VolumeData `json:"volume"`
    Support    map[string][]float64 `json:"support_levels"`
    Resistance map[string][]float64 `json:"resistance_levels"`
}

type MACDData struct {
    MACD      float64 `json:"macd"`
    Signal    float64 `json:"signal"`
    Histogram float64 `json:"histogram"`
    Trend     string  `json:"trend"`
}

type BBData struct {
    Upper  float64 `json:"upper"`
    Middle float64 `json:"middle"`
    Lower  float64 `json:"lower"`
    Width  float64 `json:"width"`
}

type VolumeData struct {
    Current24H   float64 `json:"current_24h"`
    Average7D    float64 `json:"average_7d"`
    TrendStrength float64 `json:"trend_strength"`
}

// 거래 기회
type TradingOpportunity struct {
    Type        string  `json:"type"` // BREAKOUT/REVERSAL/MOMENTUM/ARBITRAGE
    Symbol      string  `json:"symbol"`
    Entry       float64 `json:"entry_price"`
    Target      float64 `json:"target_price"`
    StopLoss    float64 `json:"stop_loss"`
    RiskReward  float64 `json:"risk_reward"`
    Confidence  float64 `json:"confidence"`
    TimeFrame   string  `json:"timeframe"`
    Description string  `json:"description"`
}

// 패턴 인식 결과
type PatternRecognition struct {
    Symbol   string    `json:"symbol"`
    Patterns []Pattern `json:"patterns"`
}

type Pattern struct {
    Name       string  `json:"name"` // 헤드앤숄더, 삼각수렴, 이중바닥 등
    Type       string  `json:"type"` // BULLISH/BEARISH
    Strength   float64 `json:"strength"`
    Target     float64 `json:"target"`
    Completion float64 `json:"completion"` // 패턴 완성도 %
}

func NewAIAnalysisService() *AIAnalysisService {
    ctx := context.Background()
    
    // Redis 연결
    rdb := redis.NewClient(&redis.Options{
        Addr: "localhost:6379",
    })
    
    // 연결 테스트
    if err := rdb.Ping(ctx).Err(); err != nil {
        log.Printf("Redis connection failed, using in-memory mode: %v", err)
        rdb = nil
    }
    
    return &AIAnalysisService{
        redis:     rdb,
        wsClients: make(map[*websocket.Conn]bool),
        analysisData: &MarketAnalysis{
            Timestamp: time.Now(),
            MarketSentiment: "중립",
            TrendDirection: "횡보",
            Strength: 50.0,
            RiskLevel: "MEDIUM",
            AIConfidence: 75.0,
        },
    }
}

// 실시간 분석 엔진 시작
func (s *AIAnalysisService) StartAnalysisEngine() {
    go func() {
        ticker := time.NewTicker(5 * time.Second)
        defer ticker.Stop()
        
        for {
            select {
            case <-ticker.C:
                s.performAnalysis()
            }
        }
    }()
}

// AI 분석 수행
func (s *AIAnalysisService) performAnalysis() {
    analysis := &MarketAnalysis{
        Timestamp: time.Now(),
    }
    
    // 1. 시장 센티먼트 분석
    analysis.MarketSentiment = s.analyzeMarketSentiment()
    
    // 2. 트렌드 분석
    analysis.TrendDirection, analysis.Strength = s.analyzeTrend()
    
    // 3. 가격 예측
    analysis.Predictions = s.generatePredictions()
    
    // 4. 기술적 지표 계산
    analysis.Indicators = s.calculateIndicators()
    
    // 5. 거래 기회 찾기
    analysis.Opportunities = s.findTradingOpportunities()
    
    // 6. 리스크 평가
    analysis.RiskLevel = s.assessRisk()
    
    // 7. AI 신뢰도 계산
    analysis.AIConfidence = s.calculateConfidence()
    
    // 분석 결과 저장
    s.mu.Lock()
    s.analysisData = analysis
    s.mu.Unlock()
    
    // WebSocket으로 브로드캐스트
    s.broadcastAnalysis(analysis)
    
    // Redis에 저장
    if s.redis != nil {
        s.saveToRedis(analysis)
    }
}

// 시장 센티먼트 분석
func (s *AIAnalysisService) analyzeMarketSentiment() string {
    // 실제로는 여러 지표를 종합해서 계산
    // Fear & Greed Index, 소셜 미디어, 뉴스 등
    
    // 시뮬레이션을 위한 동적 값
    indicators := []float64{
        s.getFearGreedIndex(),
        s.getSocialSentiment(),
        s.getVolumeIndicator(),
        s.getVolatilityIndex(),
    }
    
    avgSentiment := 0.0
    for _, v := range indicators {
        avgSentiment += v
    }
    avgSentiment /= float64(len(indicators))
    
    switch {
    case avgSentiment < 20:
        return "극도의 공포"
    case avgSentiment < 40:
        return "공포"
    case avgSentiment < 60:
        return "중립"
    case avgSentiment < 80:
        return "탐욕"
    default:
        return "극도의 탐욕"
    }
}

// 트렌드 분석
func (s *AIAnalysisService) analyzeTrend() (string, float64) {
    // 실제 가격 데이터 기반 트렌드 분석
    // MA, EMA 크로스오버, 모멘텀 등 계산
    
    // 시뮬레이션
    trendScore := s.getTrendScore()
    
    var direction string
    if trendScore > 60 {
        direction = "강한 상승"
    } else if trendScore > 40 {
        direction = "상승"
    } else if trendScore > -40 {
        direction = "횡보"
    } else if trendScore > -60 {
        direction = "하락"
    } else {
        direction = "강한 하락"
    }
    
    strength := math.Abs(trendScore)
    return direction, strength
}

// 가격 예측 생성
func (s *AIAnalysisService) generatePredictions() []Prediction {
    symbols := []string{"BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"}
    predictions := make([]Prediction, 0)
    
    for _, symbol := range symbols {
        current := s.getCurrentPrice(symbol)
        
        pred := Prediction{
            Symbol:      symbol,
            Current:     current,
            Predicted1H: current * (1 + s.getPredictionChange(1)),
            Predicted4H: current * (1 + s.getPredictionChange(4)),
            Predicted1D: current * (1 + s.getPredictionChange(24)),
            Confidence:  65 + (math.Sin(float64(time.Now().Unix())) * 20),
        }
        
        if pred.Predicted1D > pred.Current {
            pred.Direction = "UP"
        } else if pred.Predicted1D < pred.Current {
            pred.Direction = "DOWN"
        } else {
            pred.Direction = "NEUTRAL"
        }
        
        predictions = append(predictions, pred)
    }
    
    return predictions
}

// 기술적 지표 계산
func (s *AIAnalysisService) calculateIndicators() TechnicalIndicators {
    symbols := []string{"BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"}
    
    indicators := TechnicalIndicators{
        RSI:            make(map[string]float64),
        MACD:           make(map[string]MACDData),
        BollingerBands: make(map[string]BBData),
        Volume:         make(map[string]VolumeData),
        Support:        make(map[string][]float64),
        Resistance:     make(map[string][]float64),
    }
    
    for _, symbol := range symbols {
        // RSI 계산
        indicators.RSI[symbol] = s.calculateRSI(symbol)
        
        // MACD 계산
        indicators.MACD[symbol] = s.calculateMACD(symbol)
        
        // 볼린저 밴드
        indicators.BollingerBands[symbol] = s.calculateBB(symbol)
        
        // 거래량 분석
        indicators.Volume[symbol] = s.analyzeVolume(symbol)
        
        // 지지/저항선
        indicators.Support[symbol] = s.findSupportLevels(symbol)
        indicators.Resistance[symbol] = s.findResistanceLevels(symbol)
    }
    
    return indicators
}

// 거래 기회 찾기
func (s *AIAnalysisService) findTradingOpportunities() []TradingOpportunity {
    opportunities := []TradingOpportunity{}
    
    // 돌파 매매 기회
    breakout := TradingOpportunity{
        Type:        "BREAKOUT",
        Symbol:      "BTCUSDT",
        Entry:       98500,
        Target:      102000,
        StopLoss:    97000,
        RiskReward:  2.33,
        Confidence:  78.5,
        TimeFrame:   "4H",
        Description: "주요 저항선 돌파 시도 중. 거래량 증가 확인",
    }
    opportunities = append(opportunities, breakout)
    
    // 반전 매매 기회
    reversal := TradingOpportunity{
        Type:        "REVERSAL",
        Symbol:      "ETHUSDT",
        Entry:       3450,
        Target:      3650,
        StopLoss:    3380,
        RiskReward:  2.86,
        Confidence:  72.3,
        TimeFrame:   "1D",
        Description: "이중 바닥 패턴 완성. RSI 과매도 구간 이탈",
    }
    opportunities = append(opportunities, reversal)
    
    return opportunities
}

// 리스크 평가
func (s *AIAnalysisService) assessRisk() string {
    // 변동성, 거래량, 시장 센티먼트 등을 종합
    volatility := s.getVolatilityIndex()
    
    switch {
    case volatility < 30:
        return "LOW"
    case volatility < 70:
        return "MEDIUM"
    default:
        return "HIGH"
    }
}

// AI 신뢰도 계산
func (s *AIAnalysisService) calculateConfidence() float64 {
    // 데이터 품질, 모델 일치도, 백테스트 결과 등을 종합
    baseConfidence := 70.0
    dataQuality := 15.0
    modelAgreement := 10.0
    
    return baseConfidence + dataQuality + modelAgreement
}

// WebSocket 핸들러
func (s *AIAnalysisService) handleWebSocket(w http.ResponseWriter, r *http.Request) {
    upgrader := websocket.Upgrader{
        CheckOrigin: func(r *http.Request) bool { return true },
    }
    
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Printf("WebSocket upgrade failed: %v", err)
        return
    }
    defer conn.Close()
    
    // 클라이언트 추가
    s.mu.Lock()
    s.wsClients[conn] = true
    s.mu.Unlock()
    
    // 초기 데이터 전송
    s.mu.RLock()
    initialData := s.analysisData
    s.mu.RUnlock()
    
    if err := conn.WriteJSON(initialData); err != nil {
        log.Printf("Failed to send initial data: %v", err)
    }
    
    // 연결 유지
    for {
        _, _, err := conn.ReadMessage()
        if err != nil {
            s.mu.Lock()
            delete(s.wsClients, conn)
            s.mu.Unlock()
            break
        }
    }
}

// 브로드캐스트
func (s *AIAnalysisService) broadcastAnalysis(analysis *MarketAnalysis) {
    s.mu.RLock()
    defer s.mu.RUnlock()
    
    for client := range s.wsClients {
        if err := client.WriteJSON(analysis); err != nil {
            client.Close()
            delete(s.wsClients, client)
        }
    }
}

// Helper 함수들
func (s *AIAnalysisService) getFearGreedIndex() float64 {
    // 실제로는 Alternative.me API 호출
    return 45 + math.Sin(float64(time.Now().Unix()/100))*20
}

func (s *AIAnalysisService) getSocialSentiment() float64 {
    // 실제로는 Twitter/Reddit API 분석
    return 55 + math.Cos(float64(time.Now().Unix()/150))*15
}

func (s *AIAnalysisService) getVolumeIndicator() float64 {
    // 실제로는 거래량 데이터 분석
    return 50 + math.Sin(float64(time.Now().Unix()/200))*25
}

func (s *AIAnalysisService) getVolatilityIndex() float64 {
    // 실제로는 가격 변동성 계산
    return 40 + math.Abs(math.Sin(float64(time.Now().Unix()/300))*30)
}

func (s *AIAnalysisService) getTrendScore() float64 {
    // 실제로는 MA, EMA 등 기술적 지표 종합
    return math.Sin(float64(time.Now().Unix()/500)) * 100
}

func (s *AIAnalysisService) getCurrentPrice(symbol string) float64 {
    // 실제로는 Redis나 Binance API에서 가져옴
    prices := map[string]float64{
        "BTCUSDT": 98000,
        "ETHUSDT": 3500,
        "BNBUSDT": 700,
        "SOLUSDT": 240,
    }
    return prices[symbol]
}

func (s *AIAnalysisService) getPredictionChange(hours int) float64 {
    // 실제로는 AI 모델 예측
    base := math.Sin(float64(time.Now().Unix()+int64(hours*100))) * 0.02
    return base * float64(hours) / 24
}

func (s *AIAnalysisService) calculateRSI(symbol string) float64 {
    // 실제 RSI 계산 로직
    return 30 + math.Sin(float64(time.Now().Unix()))*40
}

func (s *AIAnalysisService) calculateMACD(symbol string) MACDData {
    // 실제 MACD 계산
    macd := math.Sin(float64(time.Now().Unix()/100)) * 5
    signal := math.Sin(float64(time.Now().Unix()/110)) * 5
    
    trend := "NEUTRAL"
    if macd > signal {
        trend = "BULLISH"
    } else if macd < signal {
        trend = "BEARISH"
    }
    
    return MACDData{
        MACD:      macd,
        Signal:    signal,
        Histogram: macd - signal,
        Trend:     trend,
    }
}

func (s *AIAnalysisService) calculateBB(symbol string) BBData {
    middle := s.getCurrentPrice(symbol)
    width := middle * 0.02
    
    return BBData{
        Upper:  middle + width,
        Middle: middle,
        Lower:  middle - width,
        Width:  width * 2,
    }
}

func (s *AIAnalysisService) analyzeVolume(symbol string) VolumeData {
    return VolumeData{
        Current24H:    1000000 + math.Sin(float64(time.Now().Unix()))*200000,
        Average7D:     900000,
        TrendStrength: 65,
    }
}

func (s *AIAnalysisService) findSupportLevels(symbol string) []float64 {
    current := s.getCurrentPrice(symbol)
    return []float64{
        current * 0.95,
        current * 0.92,
        current * 0.88,
    }
}

func (s *AIAnalysisService) findResistanceLevels(symbol string) []float64 {
    current := s.getCurrentPrice(symbol)
    return []float64{
        current * 1.02,
        current * 1.05,
        current * 1.10,
    }
}

func (s *AIAnalysisService) saveToRedis(analysis *MarketAnalysis) {
    ctx := context.Background()
    data, _ := json.Marshal(analysis)
    
    // 현재 분석 저장
    s.redis.Set(ctx, "ai:analysis:current", data, 0)
    
    // 히스토리 저장 (최근 100개)
    s.redis.LPush(ctx, "ai:analysis:history", data)
    s.redis.LTrim(ctx, "ai:analysis:history", 0, 99)
}

// API 핸들러들
func (s *AIAnalysisService) getCurrentAnalysis(w http.ResponseWriter, r *http.Request) {
    s.mu.RLock()
    data := s.analysisData
    s.mu.RUnlock()
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(data)
}

func (s *AIAnalysisService) getPredictions(w http.ResponseWriter, r *http.Request) {
    s.mu.RLock()
    predictions := s.analysisData.Predictions
    s.mu.RUnlock()
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(predictions)
}

func (s *AIAnalysisService) getOpportunities(w http.ResponseWriter, r *http.Request) {
    s.mu.RLock()
    opportunities := s.analysisData.Opportunities
    s.mu.RUnlock()
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(opportunities)
}

func (s *AIAnalysisService) getIndicators(w http.ResponseWriter, r *http.Request) {
    s.mu.RLock()
    indicators := s.analysisData.Indicators
    s.mu.RUnlock()
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(indicators)
}

// 패턴 인식 API
func (s *AIAnalysisService) recognizePatterns(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    symbol := vars["symbol"]
    
    patterns := s.findChartPatterns(symbol)
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(PatternRecognition{
        Symbol:   symbol,
        Patterns: patterns,
    })
}

func (s *AIAnalysisService) findChartPatterns(symbol string) []Pattern {
    // 실제로는 캔들 데이터 분석
    return []Pattern{
        {
            Name:       "헤드앤숄더",
            Type:       "BEARISH",
            Strength:   75.5,
            Target:     s.getCurrentPrice(symbol) * 0.95,
            Completion: 85,
        },
        {
            Name:       "상승 삼각형",
            Type:       "BULLISH",
            Strength:   68.2,
            Target:     s.getCurrentPrice(symbol) * 1.08,
            Completion: 70,
        },
    }
}

func main() {
    service := NewAIAnalysisService()
    
    // 분석 엔진 시작
    service.StartAnalysisEngine()
    
    // 라우터 설정
    r := mux.NewRouter()
    
    // WebSocket 엔드포인트
    r.HandleFunc("/ws/analysis", service.handleWebSocket)
    
    // REST API 엔드포인트
    r.HandleFunc("/api/analysis/current", service.getCurrentAnalysis).Methods("GET")
    r.HandleFunc("/api/analysis/predictions", service.getPredictions).Methods("GET")
    r.HandleFunc("/api/analysis/opportunities", service.getOpportunities).Methods("GET")
    r.HandleFunc("/api/analysis/indicators", service.getIndicators).Methods("GET")
    r.HandleFunc("/api/analysis/patterns/{symbol}", service.recognizePatterns).Methods("GET")
    
    // CORS 미들웨어
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
    
    fmt.Println("AI Analysis Service starting on :8083")
    log.Fatal(http.ListenAndServe(":8083", r))
}