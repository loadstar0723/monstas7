package common

import (
    "time"
)

// Prediction represents a price prediction
type Prediction struct {
    Symbol       string    `json:"symbol"`
    Current      float64   `json:"current"`
    Predicted1H  float64   `json:"predicted_1h"`
    Predicted4H  float64   `json:"predicted_4h"`
    Predicted1D  float64   `json:"predicted_1d"`
    Predicted1W  float64   `json:"predicted_1w"`
    Confidence   float64   `json:"confidence"`
    Direction    string    `json:"direction"` // UP/DOWN/NEUTRAL
    Timestamp    time.Time `json:"timestamp"`
}

// ModelMetrics represents model performance metrics
type ModelMetrics struct {
    Accuracy      float64 `json:"accuracy"`
    Precision     float64 `json:"precision"`
    Recall        float64 `json:"recall"`
    F1Score       float64 `json:"f1_score"`
    MAE           float64 `json:"mae"`           // Mean Absolute Error
    RMSE          float64 `json:"rmse"`          // Root Mean Square Error
    SharpeRatio   float64 `json:"sharpe_ratio"`
    LastUpdated   time.Time `json:"last_updated"`
}

// TradingSignal represents a trading signal from the model
type TradingSignal struct {
    Symbol        string    `json:"symbol"`
    Action        string    `json:"action"`        // BUY/SELL/HOLD
    Confidence    float64   `json:"confidence"`
    EntryPrice    float64   `json:"entry_price"`
    TargetPrice   float64   `json:"target_price"`
    StopLoss      float64   `json:"stop_loss"`
    RiskReward    float64   `json:"risk_reward"`
    TimeFrame     string    `json:"timeframe"`
    Strategy      string    `json:"strategy"`
    Timestamp     time.Time `json:"timestamp"`
}

// MarketData represents historical market data
type MarketData struct {
    Symbol    string    `json:"symbol"`
    Open      float64   `json:"open"`
    High      float64   `json:"high"`
    Low       float64   `json:"low"`
    Close     float64   `json:"close"`
    Volume    float64   `json:"volume"`
    Timestamp time.Time `json:"timestamp"`
}

// ModelVisualization represents data for model-specific visualizations
type ModelVisualization struct {
    Type      string                 `json:"type"`
    Data      interface{}            `json:"data"`
    Config    map[string]interface{} `json:"config"`
    Timestamp time.Time              `json:"timestamp"`
}

// AIModelInterface defines the interface for all AI models
type AIModelInterface interface {
    // Predict generates predictions for a symbol
    Predict(symbol string) (*Prediction, error)
    
    // GetSignal generates trading signals
    GetSignal(symbol string) (*TradingSignal, error)
    
    // GetMetrics returns model performance metrics
    GetMetrics() (*ModelMetrics, error)
    
    // GetVisualization returns model-specific visualization data
    GetVisualization(vizType string) (*ModelVisualization, error)
    
    // Train trains the model with new data
    Train(data []MarketData) error
    
    // UpdateModel updates model parameters
    UpdateModel(params map[string]interface{}) error
}

// WebSocketMessage represents a WebSocket message
type WebSocketMessage struct {
    Type      string      `json:"type"`
    Symbol    string      `json:"symbol"`
    Data      interface{} `json:"data"`
    Timestamp time.Time   `json:"timestamp"`
}

// CoinInfo represents cryptocurrency information
type CoinInfo struct {
    Symbol    string  `json:"symbol"`
    Name      string  `json:"name"`
    Price     float64 `json:"price"`
    Change24h float64 `json:"change_24h"`
    Volume24h float64 `json:"volume_24h"`
    MarketCap float64 `json:"market_cap"`
}

// Supported cryptocurrencies
var SupportedCoins = []CoinInfo{
    {Symbol: "BTCUSDT", Name: "Bitcoin"},
    {Symbol: "ETHUSDT", Name: "Ethereum"},
    {Symbol: "BNBUSDT", Name: "BNB"},
    {Symbol: "SOLUSDT", Name: "Solana"},
    {Symbol: "XRPUSDT", Name: "XRP"},
    {Symbol: "ADAUSDT", Name: "Cardano"},
    {Symbol: "DOGEUSDT", Name: "Dogecoin"},
    {Symbol: "AVAXUSDT", Name: "Avalanche"},
    {Symbol: "MATICUSDT", Name: "Polygon"},
    {Symbol: "DOTUSDT", Name: "Polkadot"},
}