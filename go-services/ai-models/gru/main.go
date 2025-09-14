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

// GRUService handles GRU model predictions
type GRUService struct {
    dataCollector *common.DataCollector
    wsManager     *common.WebSocketManager
    modelState    *GRUState
}

// GRUState represents the GRU model state
type GRUState struct {
    // Hidden states for each coin
    hiddenStates     map[string][]float64
    gateStates       map[string]*GRUGateStates
    sequenceData     map[string][]common.MarketData
    attentionWeights map[string][]float64
    lastUpdate       time.Time
}

// GRUGateStates represents GRU gate activations
type GRUGateStates struct {
    ResetGate      []float64 `json:"reset_gate"`
    UpdateGate     []float64 `json:"update_gate"`
    CandidateState []float64 `json:"candidate_state"`
    FinalState     []float64 `json:"final_state"`
}

// GRUVisualization for frontend display
type GRUVisualization struct {
    HiddenStateFlow    [][]float64            `json:"hidden_state_flow"`
    GateActivations    map[string][]float64   `json:"gate_activations"`
    AttentionMap       [][]float64            `json:"attention_map"`
    StateTransitions   []StateTransition      `json:"state_transitions"`
    InformationFlow    []InformationFlowPoint `json:"information_flow"`
}

type StateTransition struct {
    Time      string  `json:"time"`
    Current   float64 `json:"current"`
    Next      float64 `json:"next"`
    UpdateAmt float64 `json:"update_amt"`
    ResetAmt  float64 `json:"reset_amt"`
}

type InformationFlowPoint struct {
    Time       string  `json:"time"`
    Input      float64 `json:"input"`
    Retained   float64 `json:"retained"`
    New        float64 `json:"new"`
    Output     float64 `json:"output"`
}

func NewGRUService() *GRUService {
    return &GRUService{
        dataCollector: common.NewDataCollector("localhost:6379"),
        wsManager:     common.NewWebSocketManager(),
        modelState: &GRUState{
            hiddenStates:     make(map[string][]float64),
            gateStates:       make(map[string]*GRUGateStates),
            sequenceData:     make(map[string][]common.MarketData),
            attentionWeights: make(map[string][]float64),
            lastUpdate:       time.Now(),
        },
    }
}

// Initialize loads historical data for all coins
func (s *GRUService) Initialize() error {
    log.Println("Initializing GRU service...")
    
    // Start WebSocket manager
    s.wsManager.Start()
    
    // Load historical data for each coin
    for _, coin := range common.SupportedCoins {
        data, err := s.dataCollector.GetHistoricalData(coin.Symbol, "1h", 168) // 1 week of hourly data
        if err != nil {
            log.Printf("Error loading data for %s: %v", coin.Symbol, err)
            continue
        }
        
        s.modelState.sequenceData[coin.Symbol] = data
        
        // Initialize GRU states
        s.initializeGRUStates(coin.Symbol, len(data))
    }
    
    // Start prediction loop
    go s.predictionLoop()
    
    return nil
}

func (s *GRUService) initializeGRUStates(symbol string, sequenceLength int) {
    // Initialize with small random values
    s.modelState.hiddenStates[symbol] = make([]float64, 128) // 128 hidden units
    
    for i := range s.modelState.hiddenStates[symbol] {
        s.modelState.hiddenStates[symbol][i] = rand.Float64() * 0.1
    }
    
    // Initialize gate states
    s.modelState.gateStates[symbol] = &GRUGateStates{
        ResetGate:      make([]float64, sequenceLength),
        UpdateGate:     make([]float64, sequenceLength),
        CandidateState: make([]float64, sequenceLength),
        FinalState:     make([]float64, sequenceLength),
    }
    
    // Initialize attention weights
    s.modelState.attentionWeights[symbol] = make([]float64, sequenceLength)
}

// predictionLoop runs predictions every minute
func (s *GRUService) predictionLoop() {
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

// generatePrediction creates GRU predictions
func (s *GRUService) generatePrediction(symbol string) (*common.Prediction, error) {
    // Get current price
    currentPrice, err := s.dataCollector.GetCurrentPrice(symbol)
    if err != nil {
        return nil, err
    }
    
    // Get sequence data
    sequence := s.modelState.sequenceData[symbol]
    if len(sequence) < 50 {
        return nil, fmt.Errorf("insufficient data for prediction")
    }
    
    // Simulate GRU forward pass
    hiddenState := s.modelState.hiddenStates[symbol]
    
    // Process sequence through GRU
    for i, data := range sequence[len(sequence)-50:] {
        // Normalize input
        x := (data.Close - currentPrice) / currentPrice
        
        // GRU gates (simplified simulation)
        reset := sigmoid(x * 0.6 + rand.Float64()*0.1)
        update := sigmoid(x * 0.7 + rand.Float64()*0.1)
        
        // Reset gate application
        for j := range hiddenState {
            hiddenState[j] = hiddenState[j] * reset
        }
        
        // Candidate state
        candidate := tanh(x * 0.8 + average(hiddenState)*0.2 + rand.Float64()*0.1)
        
        // Update gate application
        for j := range hiddenState {
            hiddenState[j] = (1-update)*hiddenState[j] + update*candidate
        }
        
        // Store gate activations
        if gates := s.modelState.gateStates[symbol]; gates != nil && i < len(gates.ResetGate) {
            gates.ResetGate[i] = reset
            gates.UpdateGate[i] = update
            gates.CandidateState[i] = candidate
            gates.FinalState[i] = average(hiddenState)
        }
        
        // Update attention weights
        if i < len(s.modelState.attentionWeights[symbol]) {
            s.modelState.attentionWeights[symbol][i] = update * reset
        }
    }
    
    // Generate predictions based on hidden state
    avgHidden := average(hiddenState)
    trend := tanh(avgHidden)
    momentum := s.calculateMomentum(sequence)
    
    // Calculate predictions with GRU-specific adjustments
    pred1H := currentPrice * (1 + trend*0.006 + momentum*0.001 + rand.Float64()*0.002 - 0.001)
    pred4H := currentPrice * (1 + trend*0.018 + momentum*0.003 + rand.Float64()*0.005 - 0.0025)
    pred1D := currentPrice * (1 + trend*0.035 + momentum*0.005 + rand.Float64()*0.01 - 0.005)
    pred1W := currentPrice * (1 + trend*0.09 + momentum*0.01 + rand.Float64()*0.02 - 0.01)
    
    // Calculate confidence based on gate consistency
    confidence := s.calculateConfidence(s.modelState.gateStates[symbol])
    
    // Determine direction with momentum consideration
    direction := "NEUTRAL"
    if pred1D > currentPrice*1.01 && momentum > 0 {
        direction = "UP"
    } else if pred1D < currentPrice*0.99 && momentum < 0 {
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

// calculateMomentum calculates price momentum
func (s *GRUService) calculateMomentum(sequence []common.MarketData) float64 {
    if len(sequence) < 10 {
        return 0
    }
    
    recent := sequence[len(sequence)-10:]
    momentum := 0.0
    
    for i := 1; i < len(recent); i++ {
        change := (recent[i].Close - recent[i-1].Close) / recent[i-1].Close
        momentum += change * float64(i) / float64(len(recent))
    }
    
    return momentum
}

// calculateConfidence based on gate consistency
func (s *GRUService) calculateConfidence(gates *GRUGateStates) float64 {
    if gates == nil {
        return 65.0
    }
    
    // Calculate gate stability
    resetVar := variance(gates.ResetGate)
    updateVar := variance(gates.UpdateGate)
    
    // Lower variance = higher confidence
    stability := 1.0 - (resetVar+updateVar)/2.0
    confidence := 60.0 + stability*30.0 + rand.Float64()*10.0 - 5.0
    
    return math.Min(math.Max(confidence, 50), 90)
}

// generateTradingSignal creates trading signals based on predictions
func (s *GRUService) generateTradingSignal(symbol string, pred *common.Prediction) *common.TradingSignal {
    action := "HOLD"
    confidence := pred.Confidence
    
    // Signal generation logic with attention weights
    priceChange := (pred.Predicted1D - pred.Current) / pred.Current
    attentionScore := average(s.modelState.attentionWeights[symbol])
    
    if priceChange > 0.025 && confidence > 75 && attentionScore > 0.6 {
        action = "BUY"
    } else if priceChange < -0.025 && confidence > 75 && attentionScore > 0.6 {
        action = "SELL"
    }
    
    // Calculate entry, target, and stop loss
    entryPrice := pred.Current
    var targetPrice, stopLoss float64
    
    if action == "BUY" {
        targetPrice = entryPrice * 1.035 // 3.5% profit target
        stopLoss = entryPrice * 0.975    // 2.5% stop loss
    } else if action == "SELL" {
        targetPrice = entryPrice * 0.965
        stopLoss = entryPrice * 1.025
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
        Strategy:    "GRU Attention Pattern",
        Timestamp:   time.Now(),
    }
}

// calculateMetrics calculates model performance metrics
func (s *GRUService) calculateMetrics() *common.ModelMetrics {
    // Simulate metrics (in production, these would be calculated from actual predictions)
    return &common.ModelMetrics{
        Accuracy:    77.2 + rand.Float64()*5,
        Precision:   74.8 + rand.Float64()*5,
        Recall:      79.5 + rand.Float64()*5,
        F1Score:     77.0 + rand.Float64()*5,
        MAE:         0.013 + rand.Float64()*0.005,
        RMSE:        0.019 + rand.Float64()*0.005,
        SharpeRatio: 1.55 + rand.Float64()*0.3,
        LastUpdated: time.Now(),
    }
}

// API Handlers
func (s *GRUService) handlePrediction(w http.ResponseWriter, r *http.Request) {
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

func (s *GRUService) handleVisualization(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    symbol := vars["symbol"]
    
    viz := s.generateVisualization(symbol)
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(viz)
}

func (s *GRUService) generateVisualization(symbol string) *GRUVisualization {
    hiddenState := s.modelState.hiddenStates[symbol]
    gates := s.modelState.gateStates[symbol]
    sequence := s.modelState.sequenceData[symbol]
    attention := s.modelState.attentionWeights[symbol]
    
    // Create hidden state flow (time x features)
    flowMap := make([][]float64, 20) // Last 20 time steps
    for i := range flowMap {
        flowMap[i] = make([]float64, 20) // First 20 features
        for j := range flowMap[i] {
            if j < len(hiddenState) {
                // Simulate evolution of hidden states
                flowMap[i][j] = math.Tanh(hiddenState[j] * float64(i+1) * 0.05)
            }
        }
    }
    
    // Gate activations
    gateActivations := make(map[string][]float64)
    if gates != nil {
        gateActivations["reset"] = gates.ResetGate
        gateActivations["update"] = gates.UpdateGate
        gateActivations["candidate"] = gates.CandidateState
        gateActivations["final"] = gates.FinalState
    }
    
    // Attention map (sequence x sequence)
    attentionMap := make([][]float64, 20)
    for i := range attentionMap {
        attentionMap[i] = make([]float64, 20)
        for j := range attentionMap[i] {
            if i < len(attention) && j < len(attention) {
                // Simulate attention scores
                attentionMap[i][j] = math.Abs(float64(i-j))/20.0 + rand.Float64()*0.3
            }
        }
    }
    
    // State transitions
    transitions := make([]StateTransition, 0)
    for i := 0; i < 50 && i < len(sequence); i++ {
        idx := len(sequence) - 50 + i
        if idx >= 0 && gates != nil && i < len(gates.UpdateGate) {
            transitions = append(transitions, StateTransition{
                Time:      sequence[idx].Timestamp.Format("15:04"),
                Current:   sequence[idx].Close,
                Next:      sequence[idx].Close * (1 + rand.Float64()*0.01 - 0.005),
                UpdateAmt: gates.UpdateGate[i],
                ResetAmt:  gates.ResetGate[i],
            })
        }
    }
    
    // Information flow over time
    infoFlow := make([]InformationFlowPoint, 0)
    for i := 0; i < 50 && i < len(sequence); i++ {
        idx := len(sequence) - 50 + i
        if idx >= 0 && gates != nil && i < len(gates.UpdateGate) {
            infoFlow = append(infoFlow, InformationFlowPoint{
                Time:     sequence[idx].Timestamp.Format("15:04"),
                Input:    sequence[idx].Volume / 1000000, // Volume in millions
                Retained: (1 - gates.UpdateGate[i]) * 100,
                New:      gates.UpdateGate[i] * 100,
                Output:   average(hiddenState) * 100,
            })
        }
    }
    
    return &GRUVisualization{
        HiddenStateFlow:  flowMap,
        GateActivations:  gateActivations,
        AttentionMap:     attentionMap,
        StateTransitions: transitions,
        InformationFlow:  infoFlow,
    }
}

func (s *GRUService) handleMetrics(w http.ResponseWriter, r *http.Request) {
    metrics := s.calculateMetrics()
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(metrics)
}

func (s *GRUService) handleAllPredictions(w http.ResponseWriter, r *http.Request) {
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

// Helper functions
func sigmoid(x float64) float64 {
    return 1.0 / (1.0 + math.Exp(-x))
}

func tanh(x float64) float64 {
    return math.Tanh(x)
}

func average(slice []float64) float64 {
    if len(slice) == 0 {
        return 0
    }
    sum := 0.0
    for _, v := range slice {
        sum += v
    }
    return sum / float64(len(slice))
}

func variance(slice []float64) float64 {
    if len(slice) == 0 {
        return 0
    }
    avg := average(slice)
    var sum float64
    for _, v := range slice {
        sum += (v - avg) * (v - avg)
    }
    return sum / float64(len(slice))
}

func main() {
    service := NewGRUService()
    
    // Initialize service
    if err := service.Initialize(); err != nil {
        log.Fatal("Failed to initialize GRU service:", err)
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
    
    log.Println("GRU Service starting on :8091")
    if err := http.ListenAndServe(":8091", r); err != nil {
        log.Fatal("Server error:", err)
    }
}