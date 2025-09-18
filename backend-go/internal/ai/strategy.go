package ai

import (
	"fmt"
	"math/rand"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// StrategyBuilder builds and optimizes trading strategies
type StrategyBuilder struct {
	Strategies map[string]StrategyTemplate
	Indicators []Indicator
	Rules      []Rule
	mu         sync.RWMutex
}

// StrategyTemplate defines a strategy template
type StrategyTemplate struct {
	Name        string
	Type        string
	Description string
	Indicators  []string
	Rules       []RuleSet
	RiskParams  RiskParameters
	Backtest    BacktestConfig
}

// Strategy represents a generated trading strategy
type Strategy struct {
	Name            string                 `json:"name"`
	Description     string                 `json:"description"`
	Type            string                 `json:"type"`
	Rules           []TradingRule          `json:"rules"`
	Parameters      map[string]interface{} `json:"parameters"`
	ParametersJSON  string                 `json:"parameters_json"`
	RiskManagement  RiskManagement         `json:"risk_management"`
	BacktestResults BacktestResult         `json:"backtest_results"`
}

// TradingRule defines a trading rule
type TradingRule struct {
	Name      string                 `json:"name"`
	Type      string                 `json:"type"`
	Condition string                 `json:"condition"`
	Action    string                 `json:"action"`
	Params    map[string]interface{} `json:"params"`
}

// RiskManagement defines risk management rules
type RiskManagement struct {
	StopLoss       float64 `json:"stop_loss"`
	TakeProfit     float64 `json:"take_profit"`
	MaxPosition    float64 `json:"max_position"`
	MaxDrawdown    float64 `json:"max_drawdown"`
	RiskPerTrade   float64 `json:"risk_per_trade"`
	TrailingStop   bool    `json:"trailing_stop"`
	TrailingPercent float64 `json:"trailing_percent"`
}

// BacktestResult contains backtesting results
type BacktestResult struct {
	TotalReturn    float64                `json:"total_return"`
	AnnualReturn   float64                `json:"annual_return"`
	SharpeRatio    float64                `json:"sharpe_ratio"`
	MaxDrawdown    float64                `json:"max_drawdown"`
	WinRate        float64                `json:"win_rate"`
	ProfitFactor   float64                `json:"profit_factor"`
	TotalTrades    int                    `json:"total_trades"`
	WinningTrades  int                    `json:"winning_trades"`
	LosingTrades   int                    `json:"losing_trades"`
	AvgWin         float64                `json:"avg_win"`
	AvgLoss        float64                `json:"avg_loss"`
	Metrics        map[string]interface{} `json:"metrics"`
}

// Indicator represents a technical indicator
type Indicator struct {
	Name       string
	Type       string
	Parameters map[string]float64
}

// Rule represents a trading rule
type Rule struct {
	Name      string
	Indicator string
	Operator  string
	Value     float64
	Action    string
}

// RuleSet represents a set of rules
type RuleSet struct {
	Entry      []Rule
	Exit       []Rule
	RiskMgmt   []Rule
}

// RiskParameters defines risk parameters
type RiskParameters struct {
	MaxRisk        float64
	MaxLeverage    float64
	StopLossType   string
	TakeProfitType string
}

// BacktestConfig defines backtesting configuration
type BacktestConfig struct {
	StartDate      time.Time
	EndDate        time.Time
	InitialCapital float64
	Commission     float64
	Slippage       float64
}

var strategyBuilder *StrategyBuilder
var strategyOnce sync.Once

// GetStrategyBuilder returns singleton strategy builder
func GetStrategyBuilder() *StrategyBuilder {
	strategyOnce.Do(func() {
		strategyBuilder = &StrategyBuilder{
			Strategies: make(map[string]StrategyTemplate),
			Indicators: make([]Indicator, 0),
			Rules:      make([]Rule, 0),
		}
		strategyBuilder.initialize()
		logrus.Info("Strategy builder initialized")
	})
	return strategyBuilder
}

// initialize sets up strategy templates
func (sb *StrategyBuilder) initialize() {
	// Define strategy templates
	sb.Strategies["momentum"] = StrategyTemplate{
		Name:        "Momentum Strategy",
		Type:        "MOMENTUM",
		Description: "Trades based on price momentum and trend strength",
		Indicators:  []string{"RSI", "MACD", "ADX"},
		RiskParams: RiskParameters{
			MaxRisk:        0.02,
			MaxLeverage:    2.0,
			StopLossType:   "ATR",
			TakeProfitType: "FIXED",
		},
	}

	sb.Strategies["mean_reversion"] = StrategyTemplate{
		Name:        "Mean Reversion Strategy",
		Type:        "MEAN_REVERSION",
		Description: "Trades based on price deviation from mean",
		Indicators:  []string{"BB", "RSI", "STOCH"},
		RiskParams: RiskParameters{
			MaxRisk:        0.015,
			MaxLeverage:    1.5,
			StopLossType:   "PERCENTAGE",
			TakeProfitType: "DYNAMIC",
		},
	}

	sb.Strategies["breakout"] = StrategyTemplate{
		Name:        "Breakout Strategy",
		Type:        "BREAKOUT",
		Description: "Trades on price breakouts from consolidation",
		Indicators:  []string{"ATR", "VOLUME", "DONCHIAN"},
		RiskParams: RiskParameters{
			MaxRisk:        0.025,
			MaxLeverage:    3.0,
			StopLossType:   "SWING",
			TakeProfitType: "TRAILING",
		},
	}

	sb.Strategies["scalping"] = StrategyTemplate{
		Name:        "Scalping Strategy",
		Type:        "SCALPING",
		Description: "High-frequency short-term trades",
		Indicators:  []string{"EMA", "VWAP", "ORDERFLOW"},
		RiskParams: RiskParameters{
			MaxRisk:        0.005,
			MaxLeverage:    5.0,
			StopLossType:   "TIGHT",
			TakeProfitType: "QUICK",
		},
	}

	sb.Strategies["arbitrage"] = StrategyTemplate{
		Name:        "Arbitrage Strategy",
		Type:        "ARBITRAGE",
		Description: "Exploits price differences across markets",
		Indicators:  []string{"SPREAD", "CORRELATION", "COINTEGRATION"},
		RiskParams: RiskParameters{
			MaxRisk:        0.01,
			MaxLeverage:    10.0,
			StopLossType:   "TIME",
			TakeProfitType: "TARGET",
		},
	}

	// Define indicators
	sb.Indicators = []Indicator{
		{Name: "RSI", Type: "MOMENTUM", Parameters: map[string]float64{"period": 14}},
		{Name: "MACD", Type: "TREND", Parameters: map[string]float64{"fast": 12, "slow": 26, "signal": 9}},
		{Name: "BB", Type: "VOLATILITY", Parameters: map[string]float64{"period": 20, "std": 2}},
		{Name: "EMA", Type: "TREND", Parameters: map[string]float64{"period": 9}},
		{Name: "ATR", Type: "VOLATILITY", Parameters: map[string]float64{"period": 14}},
		{Name: "ADX", Type: "TREND", Parameters: map[string]float64{"period": 14}},
		{Name: "STOCH", Type: "MOMENTUM", Parameters: map[string]float64{"k": 14, "d": 3}},
		{Name: "VWAP", Type: "VOLUME", Parameters: map[string]float64{}},
	}
}

// Build generates a trading strategy
func (sb *StrategyBuilder) Build(symbol string, parameters map[string]interface{}) Strategy {
	sb.mu.RLock()
	defer sb.mu.RUnlock()

	// Determine strategy type
	strategyType := "momentum"
	if typeParam, ok := parameters["type"].(string); ok {
		strategyType = typeParam
	}

	// Get template
	template, exists := sb.Strategies[strategyType]
	if !exists {
		template = sb.Strategies["momentum"]
	}

	// Generate strategy
	strategy := Strategy{
		Name:        fmt.Sprintf("%s_%s_%d", template.Name, symbol, time.Now().Unix()),
		Description: template.Description,
		Type:        template.Type,
		Parameters:  parameters,
	}

	// Generate trading rules
	strategy.Rules = sb.generateRules(template, parameters)

	// Set risk management
	strategy.RiskManagement = sb.generateRiskManagement(template.RiskParams, parameters)

	// Run backtest
	strategy.BacktestResults = sb.runBacktest(strategy, symbol)

	return strategy
}

// generateRules creates trading rules from template
func (sb *StrategyBuilder) generateRules(template StrategyTemplate, params map[string]interface{}) []TradingRule {
	rules := []TradingRule{}

	// Entry rules
	for _, indicator := range template.Indicators {
		rule := TradingRule{
			Name: fmt.Sprintf("%s_Entry", indicator),
			Type: "ENTRY",
			Params: map[string]interface{}{
				"indicator": indicator,
			},
		}

		switch indicator {
		case "RSI":
			rule.Condition = "RSI < 30"
			rule.Action = "BUY"
			rule.Params["threshold"] = 30.0

		case "MACD":
			rule.Condition = "MACD_LINE > SIGNAL_LINE"
			rule.Action = "BUY"

		case "BB":
			rule.Condition = "PRICE < LOWER_BAND"
			rule.Action = "BUY"
			rule.Params["std_dev"] = 2.0

		case "ADX":
			rule.Condition = "ADX > 25"
			rule.Action = "TREND_FOLLOW"
			rule.Params["threshold"] = 25.0

		case "EMA":
			rule.Condition = "PRICE > EMA_9"
			rule.Action = "BUY"
			rule.Params["period"] = 9

		case "STOCH":
			rule.Condition = "K < 20 AND D < 20"
			rule.Action = "BUY"
			rule.Params["oversold"] = 20.0
		}

		rules = append(rules, rule)
	}

	// Exit rules
	exitRule := TradingRule{
		Name:      "Exit_Rule",
		Type:      "EXIT",
		Condition: "PROFIT_TARGET OR STOP_LOSS",
		Action:    "CLOSE",
		Params: map[string]interface{}{
			"profit_target": 0.03,
			"stop_loss":     0.01,
		},
	}
	rules = append(rules, exitRule)

	// Position sizing rule
	sizeRule := TradingRule{
		Name:      "Position_Size",
		Type:      "POSITION",
		Condition: "KELLY_CRITERION",
		Action:    "CALCULATE_SIZE",
		Params: map[string]interface{}{
			"max_risk":     0.02,
			"kelly_factor": 0.25,
		},
	}
	rules = append(rules, sizeRule)

	return rules
}

// generateRiskManagement creates risk management rules
func (sb *StrategyBuilder) generateRiskManagement(riskParams RiskParameters, params map[string]interface{}) RiskManagement {
	rm := RiskManagement{
		StopLoss:     0.02,
		TakeProfit:   0.05,
		MaxPosition:  0.1,
		MaxDrawdown:  0.15,
		RiskPerTrade: riskParams.MaxRisk,
		TrailingStop: false,
	}

	// Adjust based on strategy type
	switch riskParams.StopLossType {
	case "ATR":
		rm.StopLoss = 0.015
		rm.TrailingStop = true
		rm.TrailingPercent = 0.01

	case "PERCENTAGE":
		rm.StopLoss = 0.02

	case "SWING":
		rm.StopLoss = 0.025

	case "TIGHT":
		rm.StopLoss = 0.005
		rm.TakeProfit = 0.01

	case "TIME":
		rm.StopLoss = 0.01
	}

	// Override with custom params
	if stopLoss, ok := params["stop_loss"].(float64); ok {
		rm.StopLoss = stopLoss
	}

	if takeProfit, ok := params["take_profit"].(float64); ok {
		rm.TakeProfit = takeProfit
	}

	if maxPosition, ok := params["max_position"].(float64); ok {
		rm.MaxPosition = maxPosition
	}

	return rm
}

// runBacktest performs strategy backtesting
func (sb *StrategyBuilder) runBacktest(strategy Strategy, symbol string) BacktestResult {
	// Simplified backtest simulation
	// In production, this would use historical data

	numTrades := 100 + rand.Intn(200)
	winRate := 0.45 + rand.Float64()*0.3
	winningTrades := int(float64(numTrades) * winRate)
	losingTrades := numTrades - winningTrades

	avgWin := 0.02 + rand.Float64()*0.03
	avgLoss := 0.01 + rand.Float64()*0.015

	totalWin := float64(winningTrades) * avgWin
	totalLoss := float64(losingTrades) * avgLoss
	totalReturn := totalWin - totalLoss

	profitFactor := 1.0
	if totalLoss > 0 {
		profitFactor = totalWin / totalLoss
	}

	// Calculate Sharpe ratio (simplified)
	annualReturn := totalReturn * 12 // Assume monthly
	volatility := 0.15 + rand.Float64()*0.1
	sharpeRatio := 0.0
	if volatility > 0 {
		sharpeRatio = (annualReturn - 0.02) / volatility
	}

	// Calculate max drawdown
	maxDrawdown := volatility * 2

	return BacktestResult{
		TotalReturn:   totalReturn,
		AnnualReturn:  annualReturn,
		SharpeRatio:   sharpeRatio,
		MaxDrawdown:   maxDrawdown,
		WinRate:       winRate,
		ProfitFactor:  profitFactor,
		TotalTrades:   numTrades,
		WinningTrades: winningTrades,
		LosingTrades:  losingTrades,
		AvgWin:        avgWin,
		AvgLoss:       avgLoss,
		Metrics: map[string]interface{}{
			"calmar_ratio":   annualReturn / maxDrawdown,
			"sortino_ratio":  sharpeRatio * 1.2,
			"recovery_factor": totalReturn / maxDrawdown,
			"expectancy":     (winRate * avgWin) - ((1 - winRate) * avgLoss),
			"r_squared":      0.7 + rand.Float64()*0.25,
			"beta":           0.8 + rand.Float64()*0.4,
			"alpha":          annualReturn - (0.08 * (0.8 + rand.Float64()*0.4)),
		},
	}
}

// OptimizeStrategy optimizes strategy parameters
func (sb *StrategyBuilder) OptimizeStrategy(strategy Strategy, historicalData []float64) Strategy {
	sb.mu.Lock()
	defer sb.mu.Unlock()

	// Genetic algorithm or grid search optimization
	// Simplified for demonstration

	bestParams := strategy.Parameters
	bestScore := sb.evaluateStrategy(strategy, historicalData)

	// Try different parameter combinations
	for i := 0; i < 100; i++ {
		// Mutate parameters
		newParams := sb.mutateParameters(strategy.Parameters)

		// Create new strategy with mutated parameters
		newStrategy := strategy
		newStrategy.Parameters = newParams

		// Evaluate
		score := sb.evaluateStrategy(newStrategy, historicalData)

		if score > bestScore {
			bestScore = score
			bestParams = newParams
		}
	}

	// Return optimized strategy
	strategy.Parameters = bestParams
	strategy.BacktestResults = sb.runBacktest(strategy, "OPTIMIZED")

	return strategy
}

// evaluateStrategy scores a strategy
func (sb *StrategyBuilder) evaluateStrategy(strategy Strategy, data []float64) float64 {
	// Simplified scoring based on backtest metrics
	result := strategy.BacktestResults

	score := result.SharpeRatio*0.3 +
		result.WinRate*0.2 +
		result.ProfitFactor*0.2 +
		(1-result.MaxDrawdown)*0.3

	return score
}

// mutateParameters creates variations of parameters
func (sb *StrategyBuilder) mutateParameters(params map[string]interface{}) map[string]interface{} {
	newParams := make(map[string]interface{})

	for key, value := range params {
		switch v := value.(type) {
		case float64:
			// Add random variation
			variation := 1.0 + (rand.Float64()-0.5)*0.2 // ±10%
			newParams[key] = v * variation

		case int:
			// Add random variation
			variation := rand.Intn(5) - 2 // ±2
			newParams[key] = v + variation

		default:
			newParams[key] = value
		}
	}

	return newParams
}