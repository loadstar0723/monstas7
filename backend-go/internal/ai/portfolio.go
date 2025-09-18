package ai

import (
	"math"
	"math/rand"
	"sort"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// PortfolioOptimizer optimizes portfolio allocation
type PortfolioOptimizer struct {
	MaxAssets      int
	RiskLevels     map[string]RiskProfile
	Constraints    OptimizationConstraints
	mu             sync.RWMutex
}

// RiskProfile defines risk parameters
type RiskProfile struct {
	MaxVolatility   float64
	MaxDrawdown     float64
	MinSharpe       float64
	MaxLeverage     float64
	MaxConcentration float64
}

// OptimizationConstraints defines portfolio constraints
type OptimizationConstraints struct {
	MinPosition     float64
	MaxPosition     float64
	MaxAssets       int
	RebalanceFreq   string
	TaxConsideration bool
}

// PortfolioAllocation represents optimized allocation
type PortfolioAllocation struct {
	Assets       map[string]AssetAllocation `json:"assets"`
	TotalValue   float64                     `json:"total_value"`
	ExpectedReturn float64                   `json:"expected_return"`
	RiskMetrics  RiskMetrics                 `json:"risk_metrics"`
	Rebalancing  RebalanceStrategy           `json:"rebalancing"`
	SharpeRatio  float64                     `json:"sharpe_ratio"`
	MaxDrawdown  float64                     `json:"max_drawdown"`
	Volatility   float64                     `json:"volatility"`
}

// AssetAllocation represents individual asset allocation
type AssetAllocation struct {
	Symbol     string  `json:"symbol"`
	Weight     float64 `json:"weight"`
	Amount     float64 `json:"amount"`
	Value      float64 `json:"value"`
	ExpReturn  float64 `json:"expected_return"`
	Risk       float64 `json:"risk"`
	Correlation float64 `json:"correlation"`
}

// RiskMetrics contains portfolio risk metrics
type RiskMetrics struct {
	VaR95       float64 `json:"var_95"`
	CVaR95      float64 `json:"cvar_95"`
	Beta        float64 `json:"beta"`
	Alpha       float64 `json:"alpha"`
	Volatility  float64 `json:"volatility"`
	Skewness    float64 `json:"skewness"`
	Kurtosis    float64 `json:"kurtosis"`
}

// RebalanceStrategy defines rebalancing rules
type RebalanceStrategy struct {
	Frequency   string  `json:"frequency"`
	Threshold   float64 `json:"threshold"`
	NextRebalance time.Time `json:"next_rebalance"`
	EstCost     float64 `json:"estimated_cost"`
}

var portfolioOptimizer *PortfolioOptimizer
var portfolioOnce sync.Once

// GetPortfolioOptimizer returns singleton portfolio optimizer
func GetPortfolioOptimizer() *PortfolioOptimizer {
	portfolioOnce.Do(func() {
		portfolioOptimizer = &PortfolioOptimizer{
			MaxAssets: 20,
			RiskLevels: map[string]RiskProfile{
				"conservative": {
					MaxVolatility:    0.10,
					MaxDrawdown:      0.15,
					MinSharpe:        1.0,
					MaxLeverage:      1.0,
					MaxConcentration: 0.3,
				},
				"moderate": {
					MaxVolatility:    0.20,
					MaxDrawdown:      0.25,
					MinSharpe:        0.8,
					MaxLeverage:      1.5,
					MaxConcentration: 0.4,
				},
				"aggressive": {
					MaxVolatility:    0.35,
					MaxDrawdown:      0.40,
					MinSharpe:        0.6,
					MaxLeverage:      2.0,
					MaxConcentration: 0.5,
				},
			},
			Constraints: OptimizationConstraints{
				MinPosition:     0.01,
				MaxPosition:     0.40,
				MaxAssets:       15,
				RebalanceFreq:   "monthly",
				TaxConsideration: true,
			},
		}
		logrus.Info("Portfolio optimizer initialized")
	})
	return portfolioOptimizer
}

// Optimize generates optimal portfolio allocation
func (po *PortfolioOptimizer) Optimize(assets []string, capital float64, riskLevel string) PortfolioAllocation {
	po.mu.RLock()
	defer po.mu.RUnlock()

	// Get risk profile
	riskProfile, exists := po.RiskLevels[riskLevel]
	if !exists {
		riskProfile = po.RiskLevels["moderate"]
	}

	// Get asset data and calculate expected returns
	assetData := po.getAssetData(assets)

	// Calculate correlation matrix
	correlationMatrix := po.calculateCorrelationMatrix(assetData)

	// Run optimization algorithm (Mean-Variance Optimization)
	weights := po.meanVarianceOptimization(assetData, correlationMatrix, riskProfile)

	// Create allocation
	allocation := po.createAllocation(assets, weights, capital, assetData)

	// Calculate portfolio metrics
	allocation.RiskMetrics = po.calculateRiskMetrics(allocation, correlationMatrix)
	allocation.SharpeRatio = po.calculateSharpeRatio(allocation)
	allocation.MaxDrawdown = po.calculateMaxDrawdown(allocation)
	allocation.Volatility = po.calculateVolatility(allocation, correlationMatrix)

	// Define rebalancing strategy
	allocation.Rebalancing = po.defineRebalanceStrategy(riskLevel)

	return allocation
}

// getAssetData retrieves asset data (simplified)
func (po *PortfolioOptimizer) getAssetData(assets []string) []AssetData {
	data := make([]AssetData, len(assets))

	for i, asset := range assets {
		// In production, this would fetch real market data
		data[i] = AssetData{
			Symbol:         asset,
			ExpectedReturn: 0.05 + rand.Float64()*0.15,
			Volatility:     0.10 + rand.Float64()*0.20,
			Price:          1000 + rand.Float64()*50000,
			MarketCap:      1e9 + rand.Float64()*1e11,
			Volume:         1e6 + rand.Float64()*1e8,
			Beta:           0.5 + rand.Float64()*1.5,
		}
	}

	return data
}

// calculateCorrelationMatrix calculates asset correlations
func (po *PortfolioOptimizer) calculateCorrelationMatrix(assets []AssetData) [][]float64 {
	n := len(assets)
	matrix := make([][]float64, n)

	for i := range matrix {
		matrix[i] = make([]float64, n)
		for j := range matrix[i] {
			if i == j {
				matrix[i][j] = 1.0
			} else {
				// Simplified: random correlation between -0.3 and 0.8
				matrix[i][j] = -0.3 + rand.Float64()*1.1
				if matrix[i][j] > 0.8 {
					matrix[i][j] = 0.8
				}
			}
		}
	}

	return matrix
}

// meanVarianceOptimization performs Markowitz optimization
func (po *PortfolioOptimizer) meanVarianceOptimization(
	assets []AssetData,
	correlation [][]float64,
	riskProfile RiskProfile,
) []float64 {

	n := len(assets)
	weights := make([]float64, n)

	// Sort assets by Sharpe ratio (simplified)
	type AssetScore struct {
		Index int
		Score float64
	}

	scores := make([]AssetScore, n)
	for i, asset := range assets {
		// Simplified Sharpe ratio
		sharpe := (asset.ExpectedReturn - 0.02) / asset.Volatility
		scores[i] = AssetScore{Index: i, Score: sharpe}
	}

	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})

	// Allocate weights based on scores and constraints
	totalWeight := 0.0
	numAssets := min(po.Constraints.MaxAssets, n)

	for i := 0; i < numAssets; i++ {
		idx := scores[i].Index

		// Calculate weight based on score and risk profile
		baseWeight := 1.0 / float64(numAssets)
		scoreAdjustment := scores[i].Score / 10.0

		weight := baseWeight + scoreAdjustment

		// Apply constraints
		weight = math.Max(po.Constraints.MinPosition, weight)
		weight = math.Min(po.Constraints.MaxPosition, weight)
		weight = math.Min(riskProfile.MaxConcentration, weight)

		weights[idx] = weight
		totalWeight += weight
	}

	// Normalize weights to sum to 1
	if totalWeight > 0 {
		for i := range weights {
			weights[i] /= totalWeight
		}
	}

	// Apply risk parity adjustment
	po.applyRiskParity(weights, assets, correlation, riskProfile)

	return weights
}

// applyRiskParity adjusts weights for equal risk contribution
func (po *PortfolioOptimizer) applyRiskParity(
	weights []float64,
	assets []AssetData,
	correlation [][]float64,
	riskProfile RiskProfile,
) {
	// Calculate marginal risk contributions
	n := len(weights)

	for iteration := 0; iteration < 10; iteration++ {
		riskContributions := make([]float64, n)
		portfolioRisk := 0.0

		// Calculate portfolio risk
		for i := 0; i < n; i++ {
			for j := 0; j < n; j++ {
				portfolioRisk += weights[i] * weights[j] *
					assets[i].Volatility * assets[j].Volatility *
					correlation[i][j]
			}
		}
		portfolioRisk = math.Sqrt(portfolioRisk)

		if portfolioRisk == 0 {
			break
		}

		// Calculate risk contributions
		for i := 0; i < n; i++ {
			marginalRisk := 0.0
			for j := 0; j < n; j++ {
				marginalRisk += weights[j] * assets[i].Volatility *
					assets[j].Volatility * correlation[i][j]
			}
			riskContributions[i] = weights[i] * marginalRisk / portfolioRisk
		}

		// Adjust weights towards equal risk contribution
		targetContribution := 1.0 / float64(n)
		for i := 0; i < n; i++ {
			if weights[i] > 0 {
				adjustment := targetContribution / (riskContributions[i] + 0.0001)
				weights[i] *= math.Pow(adjustment, 0.2) // Gradual adjustment
			}
		}

		// Re-normalize
		sum := 0.0
		for _, w := range weights {
			sum += w
		}
		if sum > 0 {
			for i := range weights {
				weights[i] /= sum
			}
		}
	}
}

// createAllocation creates the portfolio allocation structure
func (po *PortfolioOptimizer) createAllocation(
	assets []string,
	weights []float64,
	capital float64,
	assetData []AssetData,
) PortfolioAllocation {

	allocation := PortfolioAllocation{
		Assets:         make(map[string]AssetAllocation),
		TotalValue:     capital,
		ExpectedReturn: 0,
	}

	for i, asset := range assets {
		if weights[i] > 0 {
			value := capital * weights[i]
			amount := value / assetData[i].Price

			allocation.Assets[asset] = AssetAllocation{
				Symbol:      asset,
				Weight:      weights[i],
				Amount:      amount,
				Value:       value,
				ExpReturn:   assetData[i].ExpectedReturn,
				Risk:        assetData[i].Volatility,
				Correlation: 0, // Will be calculated with portfolio
			}

			allocation.ExpectedReturn += weights[i] * assetData[i].ExpectedReturn
		}
	}

	return allocation
}

// calculateRiskMetrics calculates comprehensive risk metrics
func (po *PortfolioOptimizer) calculateRiskMetrics(
	allocation PortfolioAllocation,
	correlation [][]float64,
) RiskMetrics {

	// Simplified risk metric calculations
	return RiskMetrics{
		VaR95:      allocation.TotalValue * 0.05,  // 5% VaR
		CVaR95:     allocation.TotalValue * 0.075, // Conditional VaR
		Beta:       0.8 + rand.Float64()*0.4,
		Alpha:      -0.02 + rand.Float64()*0.06,
		Volatility: 0.10 + rand.Float64()*0.15,
		Skewness:   -0.5 + rand.Float64(),
		Kurtosis:   2.5 + rand.Float64()*2,
	}
}

// calculateSharpeRatio calculates the Sharpe ratio
func (po *PortfolioOptimizer) calculateSharpeRatio(allocation PortfolioAllocation) float64 {
	riskFreeRate := 0.02 // 2% risk-free rate
	excessReturn := allocation.ExpectedReturn - riskFreeRate

	if allocation.Volatility > 0 {
		return excessReturn / allocation.Volatility
	}

	return 0
}

// calculateMaxDrawdown calculates maximum drawdown
func (po *PortfolioOptimizer) calculateMaxDrawdown(allocation PortfolioAllocation) float64 {
	// Simplified: based on volatility and time
	// In production, would use historical simulation
	return allocation.Volatility * 2.5
}

// calculateVolatility calculates portfolio volatility
func (po *PortfolioOptimizer) calculateVolatility(
	allocation PortfolioAllocation,
	correlation [][]float64,
) float64 {

	variance := 0.0
	weights := make([]float64, 0)
	vols := make([]float64, 0)

	for _, asset := range allocation.Assets {
		weights = append(weights, asset.Weight)
		vols = append(vols, asset.Risk)
	}

	// Portfolio variance calculation
	for i := range weights {
		for j := range weights {
			if i < len(correlation) && j < len(correlation[i]) {
				variance += weights[i] * weights[j] * vols[i] * vols[j] * correlation[i][j]
			}
		}
	}

	return math.Sqrt(variance)
}

// defineRebalanceStrategy defines the rebalancing strategy
func (po *PortfolioOptimizer) defineRebalanceStrategy(riskLevel string) RebalanceStrategy {
	frequency := "monthly"
	threshold := 0.05

	switch riskLevel {
	case "conservative":
		frequency = "quarterly"
		threshold = 0.10
	case "aggressive":
		frequency = "weekly"
		threshold = 0.03
	}

	nextRebalance := time.Now()
	switch frequency {
	case "weekly":
		nextRebalance = nextRebalance.AddDate(0, 0, 7)
	case "monthly":
		nextRebalance = nextRebalance.AddDate(0, 1, 0)
	case "quarterly":
		nextRebalance = nextRebalance.AddDate(0, 3, 0)
	}

	return RebalanceStrategy{
		Frequency:     frequency,
		Threshold:     threshold,
		NextRebalance: nextRebalance,
		EstCost:       10 + rand.Float64()*50, // Estimated transaction cost
	}
}

// AssetData represents asset information
type AssetData struct {
	Symbol         string
	ExpectedReturn float64
	Volatility     float64
	Price          float64
	MarketCap      float64
	Volume         float64
	Beta           float64
}

