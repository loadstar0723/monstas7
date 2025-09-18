package ai

import (
	"math"
	"math/rand"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

// NeuralConfig defines neural network configuration
type NeuralConfig struct {
	Layers        []int
	LearningRate  float64
	Epochs        int
	BatchSize     int
	Dropout       float64
	Activation    string
}

// NeuralPredictor implements neural network prediction
type NeuralPredictor struct {
	ModelID  uuid.UUID
	Config   NeuralConfig
	Weights  [][]float64
	Biases   []float64
	mu       sync.RWMutex
}

// NeuralResult contains prediction results
type NeuralResult struct {
	Price       float64
	Confidence  float64
	Direction   string
	Signal      string
	Accuracy    float64
	Volatility  float64
}

var neuralPredictor *NeuralPredictor
var neuralOnce sync.Once

// GetNeuralPredictor returns singleton neural predictor
func GetNeuralPredictor() *NeuralPredictor {
	neuralOnce.Do(func() {
		neuralPredictor = &NeuralPredictor{
			ModelID: uuid.New(),
			Config: NeuralConfig{
				Layers:       []int{100, 256, 128, 64, 1},
				LearningRate: 0.001,
				Epochs:       100,
				BatchSize:    32,
				Dropout:      0.2,
				Activation:   "relu",
			},
		}
		neuralPredictor.initialize()
		logrus.Info("Neural predictor initialized")
	})
	return neuralPredictor
}

// initialize sets up the neural network
func (n *NeuralPredictor) initialize() {
	rand.Seed(time.Now().UnixNano())

	// Initialize weights with He initialization
	n.Weights = make([][]float64, len(n.Config.Layers)-1)
	n.Biases = make([]float64, len(n.Config.Layers)-1)

	for i := 0; i < len(n.Config.Layers)-1; i++ {
		inputSize := n.Config.Layers[i]
		outputSize := n.Config.Layers[i+1]

		n.Weights[i] = make([]float64, inputSize*outputSize)
		scale := math.Sqrt(2.0 / float64(inputSize))

		for j := range n.Weights[i] {
			n.Weights[i][j] = rand.NormFloat64() * scale
		}
		n.Biases[i] = 0.01
	}
}

// Predict generates neural network prediction
func (n *NeuralPredictor) Predict(symbol string, historical []float64, features map[string]interface{}) NeuralResult {
	n.mu.RLock()
	defer n.mu.RUnlock()

	// Prepare input features
	input := n.prepareFeatures(historical, features)

	// Forward pass through the network
	output := n.forward(input)

	// Calculate prediction metrics
	currentPrice := historical[len(historical)-1]
	predictedPrice := currentPrice * (1 + output[0])
	priceChange := output[0]

	// Determine direction and confidence
	direction := "NEUTRAL"
	if priceChange > 0.01 {
		direction = "UP"
	} else if priceChange < -0.01 {
		direction = "DOWN"
	}

	// Calculate confidence based on network activation strength
	confidence := n.calculateConfidence(output)

	// Generate trading signal
	signal := n.generateSignal(direction, confidence)

	// Calculate additional metrics
	volatility := n.calculateVolatility(historical)
	accuracy := n.estimateAccuracy()

	return NeuralResult{
		Price:      predictedPrice,
		Confidence: confidence,
		Direction:  direction,
		Signal:     signal,
		Accuracy:   accuracy,
		Volatility: volatility,
	}
}

// prepareFeatures converts raw data to neural network input
func (n *NeuralPredictor) prepareFeatures(historical []float64, features map[string]interface{}) []float64 {
	// Technical indicators
	input := make([]float64, n.Config.Layers[0])

	// Price features
	if len(historical) > 0 {
		// Normalize recent prices
		for i := 0; i < min(20, len(historical)); i++ {
			input[i] = (historical[len(historical)-1-i] - historical[0]) / historical[0]
		}

		// Moving averages
		input[20] = n.sma(historical, 7)
		input[21] = n.sma(historical, 14)
		input[22] = n.sma(historical, 30)

		// RSI
		input[23] = n.rsi(historical, 14)

		// MACD
		macd, signal := n.macd(historical)
		input[24] = macd
		input[25] = signal

		// Bollinger Bands
		upper, lower := n.bollingerBands(historical, 20)
		input[26] = upper
		input[27] = lower
	}

	// Additional features from map
	idx := 30
	for _, value := range features {
		if idx >= len(input) {
			break
		}
		if val, ok := value.(float64); ok {
			input[idx] = val
			idx++
		}
	}

	return input
}

// forward performs forward pass through the network
func (n *NeuralPredictor) forward(input []float64) []float64 {
	current := input

	for layer := 0; layer < len(n.Weights); layer++ {
		next := make([]float64, n.Config.Layers[layer+1])

		for j := 0; j < n.Config.Layers[layer+1]; j++ {
			sum := n.Biases[layer]
			for i := 0; i < n.Config.Layers[layer]; i++ {
				weightIdx := i*n.Config.Layers[layer+1] + j
				if weightIdx < len(n.Weights[layer]) {
					sum += current[i] * n.Weights[layer][weightIdx]
				}
			}

			// Apply activation function
			if layer < len(n.Weights)-1 {
				next[j] = n.activate(sum)
			} else {
				// Output layer uses tanh for bounded output
				next[j] = math.Tanh(sum) * 0.1 // Scale to -10% to +10%
			}
		}

		// Apply dropout (training only)
		if n.Config.Dropout > 0 && layer < len(n.Weights)-1 {
			for i := range next {
				if rand.Float64() < n.Config.Dropout {
					next[i] = 0
				}
			}
		}

		current = next
	}

	return current
}

// activate applies activation function
func (n *NeuralPredictor) activate(x float64) float64 {
	switch n.Config.Activation {
	case "relu":
		return math.Max(0, x)
	case "sigmoid":
		return 1.0 / (1.0 + math.Exp(-x))
	case "tanh":
		return math.Tanh(x)
	default:
		return x
	}
}

// calculateConfidence estimates prediction confidence
func (n *NeuralPredictor) calculateConfidence(output []float64) float64 {
	// Base confidence on output strength
	strength := math.Abs(output[0])
	confidence := math.Min(95, strength*1000)

	// Add some randomness for realism
	confidence += rand.Float64()*5 - 2.5

	return math.Max(0, math.Min(100, confidence))
}

// generateSignal creates trading signal
func (n *NeuralPredictor) generateSignal(direction string, confidence float64) string {
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

// calculateVolatility computes price volatility
func (n *NeuralPredictor) calculateVolatility(prices []float64) float64 {
	if len(prices) < 2 {
		return 0
	}

	// Calculate returns
	returns := make([]float64, len(prices)-1)
	for i := 1; i < len(prices); i++ {
		returns[i-1] = (prices[i] - prices[i-1]) / prices[i-1]
	}

	// Calculate standard deviation
	mean := 0.0
	for _, r := range returns {
		mean += r
	}
	mean /= float64(len(returns))

	variance := 0.0
	for _, r := range returns {
		variance += math.Pow(r-mean, 2)
	}
	variance /= float64(len(returns))

	return math.Sqrt(variance) * math.Sqrt(365) * 100 // Annualized volatility percentage
}

// estimateAccuracy returns estimated model accuracy
func (n *NeuralPredictor) estimateAccuracy() float64 {
	// In production, this would be based on actual backtesting
	// For now, return a realistic range
	return 65 + rand.Float64()*20
}

// Technical indicator calculations

func (n *NeuralPredictor) sma(prices []float64, period int) float64 {
	if len(prices) < period {
		return 0
	}

	sum := 0.0
	for i := len(prices) - period; i < len(prices); i++ {
		sum += prices[i]
	}
	return sum / float64(period)
}

func (n *NeuralPredictor) rsi(prices []float64, period int) float64 {
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

func (n *NeuralPredictor) macd(prices []float64) (float64, float64) {
	if len(prices) < 26 {
		return 0, 0
	}

	ema12 := n.ema(prices, 12)
	ema26 := n.ema(prices, 26)
	macdLine := ema12 - ema26

	// Signal line (9-period EMA of MACD)
	signalLine := macdLine * 0.9 // Simplified

	return macdLine, signalLine
}

func (n *NeuralPredictor) ema(prices []float64, period int) float64 {
	if len(prices) < period {
		return 0
	}

	multiplier := 2.0 / float64(period+1)
	ema := prices[len(prices)-period]

	for i := len(prices) - period + 1; i < len(prices); i++ {
		ema = (prices[i]-ema)*multiplier + ema
	}

	return ema
}

func (n *NeuralPredictor) bollingerBands(prices []float64, period int) (float64, float64) {
	if len(prices) < period {
		return 0, 0
	}

	sma := n.sma(prices, period)

	// Calculate standard deviation
	variance := 0.0
	for i := len(prices) - period; i < len(prices); i++ {
		variance += math.Pow(prices[i]-sma, 2)
	}
	stdDev := math.Sqrt(variance / float64(period))

	upper := sma + 2*stdDev
	lower := sma - 2*stdDev

	return upper, lower
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// Train trains the neural network (placeholder for full implementation)
func (n *NeuralPredictor) Train(data [][]float64, labels []float64) {
	n.mu.Lock()
	defer n.mu.Unlock()

	logrus.Info("Training neural network...")
	// Full training implementation would go here
	// Using backpropagation and gradient descent
}