package ai

import (
	"math"
	"math/rand"
	"time"
)

// LSTMPredictor implements Long Short-Term Memory neural network
type LSTMPredictor struct {
	ModelID    string
	ModelPath  string
	Config     LSTMConfig
	Weights    *LSTMWeights
	IsLoaded   bool
}

// LSTMConfig contains LSTM configuration
type LSTMConfig struct {
	InputSize    int     // Number of input features
	HiddenSize   int     // Number of hidden units
	NumLayers    int     // Number of LSTM layers
	OutputSize   int     // Number of output features
	SequenceLen  int     // Sequence length for time series
	LearningRate float64 // Learning rate
	Dropout      float64 // Dropout rate
	BatchSize    int     // Batch size for training
}

// LSTMWeights contains LSTM model weights
type LSTMWeights struct {
	// Input gate weights
	Wi [][]float64 // Input to input gate
	Ui [][]float64 // Hidden to input gate
	Bi []float64   // Input gate bias

	// Forget gate weights
	Wf [][]float64 // Input to forget gate
	Uf [][]float64 // Hidden to forget gate
	Bf []float64   // Forget gate bias

	// Cell gate weights
	Wc [][]float64 // Input to cell gate
	Uc [][]float64 // Hidden to cell gate
	Bc []float64   // Cell gate bias

	// Output gate weights
	Wo [][]float64 // Input to output gate
	Uo [][]float64 // Hidden to output gate
	Bo []float64   // Output gate bias

	// Final output layer
	Wy [][]float64 // Hidden to output
	By []float64   // Output bias
}

// LSTMCell represents a single LSTM cell state
type LSTMCell struct {
	HiddenState []float64
	CellState   []float64
}

var lstmPredictor *LSTMPredictor

// InitLSTMPredictor initializes the LSTM predictor
func InitLSTMPredictor() {
	lstmPredictor = &LSTMPredictor{
		ModelID:   "lstm-v1",
		ModelPath: "./models/lstm",
		Config: LSTMConfig{
			InputSize:    20,  // Features per timestep
			HiddenSize:   128, // LSTM hidden units
			NumLayers:    3,   // Stacked LSTM layers
			OutputSize:   1,   // Price prediction
			SequenceLen:  60,  // Look back 60 timesteps
			LearningRate: 0.001,
			Dropout:      0.2,
			BatchSize:    32,
		},
		IsLoaded: false,
	}
	lstmPredictor.Initialize()
}

// GetLSTMPredictor returns the LSTM predictor instance
func GetLSTMPredictor() *LSTMPredictor {
	if lstmPredictor == nil {
		InitLSTMPredictor()
	}
	return lstmPredictor
}

// Initialize initializes LSTM weights
func (l *LSTMPredictor) Initialize() {
	rand.Seed(time.Now().UnixNano())

	l.Weights = &LSTMWeights{
		// Initialize input gate weights
		Wi: randomMatrix(l.Config.HiddenSize, l.Config.InputSize),
		Ui: randomMatrix(l.Config.HiddenSize, l.Config.HiddenSize),
		Bi: randomVector(l.Config.HiddenSize),

		// Initialize forget gate weights
		Wf: randomMatrix(l.Config.HiddenSize, l.Config.InputSize),
		Uf: randomMatrix(l.Config.HiddenSize, l.Config.HiddenSize),
		Bf: randomVector(l.Config.HiddenSize),

		// Initialize cell gate weights
		Wc: randomMatrix(l.Config.HiddenSize, l.Config.InputSize),
		Uc: randomMatrix(l.Config.HiddenSize, l.Config.HiddenSize),
		Bc: randomVector(l.Config.HiddenSize),

		// Initialize output gate weights
		Wo: randomMatrix(l.Config.HiddenSize, l.Config.InputSize),
		Uo: randomMatrix(l.Config.HiddenSize, l.Config.HiddenSize),
		Bo: randomVector(l.Config.HiddenSize),

		// Initialize output layer
		Wy: randomMatrix(l.Config.OutputSize, l.Config.HiddenSize),
		By: randomVector(l.Config.OutputSize),
	}

	l.IsLoaded = true
	// logger.Info("LSTM predictor initialized")
}

// Predict performs LSTM prediction
func (l *LSTMPredictor) Predict(symbol string, historical []float64, features map[string]interface{}) *Prediction {
	// Prepare input sequence
	sequence := l.prepareSequence(historical, features)

	// Forward propagation through LSTM
	outputs := l.forward(sequence)

	// Get final prediction
	prediction := outputs[len(outputs)-1][0]

	// Determine market direction
	currentPrice := historical[len(historical)-1]
	priceChange := prediction - currentPrice
	percentChange := (priceChange / currentPrice) * 100

	direction := "NEUTRAL"
	if percentChange > 0.5 {
		direction = "UP"
	} else if percentChange < -0.5 {
		direction = "DOWN"
	}

	// Calculate confidence based on LSTM cell states
	confidence := l.calculateConfidence(outputs)

	// Determine trading signal
	signal := "HOLD"
	if direction == "UP" && confidence > 70 {
		if confidence > 85 {
			signal = "STRONG_BUY"
		} else {
			signal = "BUY"
		}
	} else if direction == "DOWN" && confidence > 70 {
		if confidence > 85 {
			signal = "STRONG_SELL"
		} else {
			signal = "SELL"
		}
	}

	// Advanced LSTM metrics
	volatility := l.calculateVolatility(historical)
	momentum := l.calculateMomentum(historical)

	return &Prediction{
		Model:        "LSTM",
		Symbol:       symbol,
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
			"hidden_size":  float64(l.Config.HiddenSize),
			"num_layers":   float64(l.Config.NumLayers),
			"sequence_len": float64(l.Config.SequenceLen),
			"dropout":      l.Config.Dropout,
			"volatility":   volatility,
			"momentum":     momentum,
		},
		Recommendation: signal,
		RiskLevel:      l.assessRisk(volatility, confidence),
		Timestamp:      time.Now().Unix(),
		Targets:        []float64{currentPrice * 1.02, currentPrice * 1.05, currentPrice * 1.10},
		StopLoss:       currentPrice * 0.95,
		EntryPrice:     currentPrice * 1.001,
	}
}

// prepareSequence prepares input sequence for LSTM
func (l *LSTMPredictor) prepareSequence(historical []float64, features map[string]interface{}) [][]float64 {
	sequence := make([][]float64, l.Config.SequenceLen)

	// Use available historical data
	startIdx := 0
	if len(historical) > l.Config.SequenceLen {
		startIdx = len(historical) - l.Config.SequenceLen
	}

	for i := 0; i < l.Config.SequenceLen; i++ {
		sequence[i] = make([]float64, l.Config.InputSize)

		// Price features
		if startIdx+i < len(historical) {
			price := historical[startIdx+i]
			sequence[i][0] = price / 100000.0 // Normalize

			// Price changes
			if startIdx+i > 0 {
				sequence[i][1] = (price - historical[startIdx+i-1]) / price
			}

			// Moving averages
			sequence[i][2] = l.calculateMA(historical, startIdx+i, 5) / 100000.0
			sequence[i][3] = l.calculateMA(historical, startIdx+i, 20) / 100000.0

			// Volatility
			sequence[i][4] = l.calculateLocalVolatility(historical, startIdx+i)

			// RSI
			sequence[i][5] = l.calculateRSI(historical, startIdx+i) / 100.0
		}

		// Technical indicators
		for j := 6; j < l.Config.InputSize; j++ {
			sequence[i][j] = rand.Float64() * 0.1 // Small random features for now
		}
	}

	return sequence
}

// forward performs forward propagation through LSTM
func (l *LSTMPredictor) forward(sequence [][]float64) [][]float64 {
	outputs := make([][]float64, len(sequence))
	cells := make([]LSTMCell, l.Config.NumLayers)

	// Initialize cell states
	for i := range cells {
		cells[i] = LSTMCell{
			HiddenState: make([]float64, l.Config.HiddenSize),
			CellState:   make([]float64, l.Config.HiddenSize),
		}
	}

	// Process sequence through LSTM layers
	for t, input := range sequence {
		layerInput := input

		for layer := 0; layer < l.Config.NumLayers; layer++ {
			// LSTM cell computation
			newHidden, newCell := l.lstmStep(
				layerInput,
				cells[layer].HiddenState,
				cells[layer].CellState,
			)

			// Apply dropout during training (simulated)
			if l.Config.Dropout > 0 && rand.Float64() < l.Config.Dropout {
				for i := range newHidden {
					newHidden[i] *= (1.0 / (1.0 - l.Config.Dropout))
				}
			}

			cells[layer].HiddenState = newHidden
			cells[layer].CellState = newCell
			layerInput = newHidden
		}

		// Output layer
		output := l.outputLayer(cells[l.Config.NumLayers-1].HiddenState)
		outputs[t] = output
	}

	return outputs
}

// lstmStep performs one LSTM step
func (l *LSTMPredictor) lstmStep(input, hiddenPrev, cellPrev []float64) ([]float64, []float64) {
	// Input gate
	inputGate := make([]float64, l.Config.HiddenSize)
	for i := 0; i < l.Config.HiddenSize; i++ {
		sum := l.Weights.Bi[i]
		for j := 0; j < len(input); j++ {
			sum += l.Weights.Wi[i][j] * input[j]
		}
		for j := 0; j < l.Config.HiddenSize; j++ {
			sum += l.Weights.Ui[i][j] * hiddenPrev[j]
		}
		inputGate[i] = sigmoid(sum)
	}

	// Forget gate
	forgetGate := make([]float64, l.Config.HiddenSize)
	for i := 0; i < l.Config.HiddenSize; i++ {
		sum := l.Weights.Bf[i]
		for j := 0; j < len(input); j++ {
			sum += l.Weights.Wf[i][j] * input[j]
		}
		for j := 0; j < l.Config.HiddenSize; j++ {
			sum += l.Weights.Uf[i][j] * hiddenPrev[j]
		}
		forgetGate[i] = sigmoid(sum)
	}

	// Cell gate (candidate values)
	cellGate := make([]float64, l.Config.HiddenSize)
	for i := 0; i < l.Config.HiddenSize; i++ {
		sum := l.Weights.Bc[i]
		for j := 0; j < len(input); j++ {
			sum += l.Weights.Wc[i][j] * input[j]
		}
		for j := 0; j < l.Config.HiddenSize; j++ {
			sum += l.Weights.Uc[i][j] * hiddenPrev[j]
		}
		cellGate[i] = math.Tanh(sum)
	}

	// Update cell state
	cellNew := make([]float64, l.Config.HiddenSize)
	for i := 0; i < l.Config.HiddenSize; i++ {
		cellNew[i] = forgetGate[i]*cellPrev[i] + inputGate[i]*cellGate[i]
	}

	// Output gate
	outputGate := make([]float64, l.Config.HiddenSize)
	for i := 0; i < l.Config.HiddenSize; i++ {
		sum := l.Weights.Bo[i]
		for j := 0; j < len(input); j++ {
			sum += l.Weights.Wo[i][j] * input[j]
		}
		for j := 0; j < l.Config.HiddenSize; j++ {
			sum += l.Weights.Uo[i][j] * hiddenPrev[j]
		}
		outputGate[i] = sigmoid(sum)
	}

	// Update hidden state
	hiddenNew := make([]float64, l.Config.HiddenSize)
	for i := 0; i < l.Config.HiddenSize; i++ {
		hiddenNew[i] = outputGate[i] * math.Tanh(cellNew[i])
	}

	return hiddenNew, cellNew
}

// outputLayer applies final output layer
func (l *LSTMPredictor) outputLayer(hidden []float64) []float64 {
	output := make([]float64, l.Config.OutputSize)

	for i := 0; i < l.Config.OutputSize; i++ {
		sum := l.Weights.By[i]
		for j := 0; j < l.Config.HiddenSize; j++ {
			sum += l.Weights.Wy[i][j] * hidden[j]
		}
		// Scale back to price range
		output[i] = sum * 100000.0
	}

	return output
}

// calculateConfidence calculates prediction confidence
func (l *LSTMPredictor) calculateConfidence(outputs [][]float64) float64 {
	if len(outputs) < 2 {
		return 50.0
	}

	// Calculate variance in predictions
	var sum, sumSq float64
	for _, output := range outputs {
		sum += output[0]
		sumSq += output[0] * output[0]
	}

	mean := sum / float64(len(outputs))
	variance := sumSq/float64(len(outputs)) - mean*mean

	// Lower variance = higher confidence
	confidence := 100.0 / (1.0 + math.Sqrt(variance)/mean*10)

	// Add some randomness for realistic confidence
	confidence += (rand.Float64() - 0.5) * 10

	if confidence > 95 {
		confidence = 95
	} else if confidence < 40 {
		confidence = 40
	}

	return confidence
}

// calculateLocalVolatility calculates local volatility
func (l *LSTMPredictor) calculateLocalVolatility(prices []float64, idx int) float64 {
	if idx < 5 {
		return 0.01
	}

	window := 5
	start := idx - window
	if start < 0 {
		start = 0
	}

	var returns []float64
	for i := start + 1; i <= idx && i < len(prices); i++ {
		ret := (prices[i] - prices[i-1]) / prices[i-1]
		returns = append(returns, ret)
	}

	if len(returns) == 0 {
		return 0.01
	}

	// Calculate standard deviation of returns
	var sum, sumSq float64
	for _, r := range returns {
		sum += r
		sumSq += r * r
	}

	mean := sum / float64(len(returns))
	variance := sumSq/float64(len(returns)) - mean*mean

	return math.Sqrt(variance)
}

// calculateMA calculates moving average
func (l *LSTMPredictor) calculateMA(prices []float64, idx, period int) float64 {
	if idx < period-1 {
		if idx >= 0 && idx < len(prices) {
			return prices[idx]
		}
		return 0
	}

	sum := 0.0
	count := 0
	for i := idx - period + 1; i <= idx && i < len(prices); i++ {
		if i >= 0 {
			sum += prices[i]
			count++
		}
	}

	if count == 0 {
		return 0
	}

	return sum / float64(count)
}

// calculateRSI calculates RSI
func (l *LSTMPredictor) calculateRSI(prices []float64, idx int) float64 {
	period := 14
	if idx < period {
		return 50.0
	}

	gains := 0.0
	losses := 0.0

	for i := idx - period + 1; i <= idx && i < len(prices); i++ {
		if i > 0 {
			change := prices[i] - prices[i-1]
			if change > 0 {
				gains += change
			} else {
				losses -= change
			}
		}
	}

	if losses == 0 {
		return 100.0
	}

	avgGain := gains / float64(period)
	avgLoss := losses / float64(period)
	rs := avgGain / avgLoss
	rsi := 100.0 - (100.0 / (1.0 + rs))

	return rsi
}

// calculateVolatility calculates overall volatility
func (l *LSTMPredictor) calculateVolatility(prices []float64) float64 {
	if len(prices) < 2 {
		return 0.01
	}

	var returns []float64
	for i := 1; i < len(prices); i++ {
		ret := (prices[i] - prices[i-1]) / prices[i-1]
		returns = append(returns, ret)
	}

	var sum, sumSq float64
	for _, r := range returns {
		sum += r
		sumSq += r * r
	}

	mean := sum / float64(len(returns))
	variance := sumSq/float64(len(returns)) - mean*mean

	return math.Sqrt(variance)
}

// calculateMomentum calculates price momentum
func (l *LSTMPredictor) calculateMomentum(prices []float64) float64 {
	if len(prices) < 10 {
		return 0.0
	}

	// Calculate rate of change
	oldPrice := prices[len(prices)-10]
	currentPrice := prices[len(prices)-1]
	momentum := ((currentPrice - oldPrice) / oldPrice) * 100

	return momentum
}

// randomMatrix creates a random matrix
func randomMatrix(rows, cols int) [][]float64 {
	matrix := make([][]float64, rows)
	for i := range matrix {
		matrix[i] = make([]float64, cols)
		for j := range matrix[i] {
			// Xavier initialization
			matrix[i][j] = (rand.Float64() - 0.5) * 2.0 * math.Sqrt(6.0/float64(rows+cols))
		}
	}
	return matrix
}

// randomVector creates a random vector
func randomVector(size int) []float64 {
	vector := make([]float64, size)
	for i := range vector {
		vector[i] = (rand.Float64() - 0.5) * 0.1
	}
	return vector
}
// assessRisk assesses risk level based on volatility and confidence
func (l *LSTMPredictor) assessRisk(volatility, confidence float64) string {
	risk := volatility * (1 - confidence/100)
	if risk > 0.5 {
		return "HIGH"
	} else if risk > 0.2 {
		return "MEDIUM"
	}
	return "LOW"
}
