package ai

import (
	"math"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// Pattern represents a trading pattern
type Pattern struct {
	Name       string    `json:"name"`
	Type       string    `json:"type"`
	Direction  string    `json:"direction"`
	Strength   float64   `json:"strength"`
	Confidence float64   `json:"confidence"`
	StartIdx   int       `json:"start_idx"`
	EndIdx     int       `json:"end_idx"`
	Timestamp  time.Time `json:"timestamp"`
}

// PatternRecognizer identifies chart patterns
type PatternRecognizer struct {
	Patterns []PatternDefinition
	mu       sync.RWMutex
}

// PatternDefinition defines a pattern to recognize
type PatternDefinition struct {
	Name        string
	Type        string
	MinCandles  int
	MaxCandles  int
	Validator   func(candles []Candle) (bool, float64)
}

// Candle represents OHLCV data
type Candle struct {
	Open      float64   `json:"open"`
	High      float64   `json:"high"`
	Low       float64   `json:"low"`
	Close     float64   `json:"close"`
	Volume    float64   `json:"volume"`
	Timestamp time.Time `json:"timestamp"`
}

var patternRecognizer *PatternRecognizer
var patternOnce sync.Once

// GetPatternRecognizer returns singleton pattern recognizer
func GetPatternRecognizer() *PatternRecognizer {
	patternOnce.Do(func() {
		patternRecognizer = &PatternRecognizer{}
		patternRecognizer.initialize()
		logrus.Info("Pattern recognizer initialized")
	})
	return patternRecognizer
}

// initialize sets up pattern definitions
func (pr *PatternRecognizer) initialize() {
	pr.Patterns = []PatternDefinition{
		{
			Name:       "Head and Shoulders",
			Type:       "reversal",
			MinCandles: 15,
			MaxCandles: 50,
			Validator:  pr.validateHeadAndShoulders,
		},
		{
			Name:       "Double Top",
			Type:       "reversal",
			MinCandles: 10,
			MaxCandles: 30,
			Validator:  pr.validateDoubleTop,
		},
		{
			Name:       "Double Bottom",
			Type:       "reversal",
			MinCandles: 10,
			MaxCandles: 30,
			Validator:  pr.validateDoubleBottom,
		},
		{
			Name:       "Triangle",
			Type:       "continuation",
			MinCandles: 10,
			MaxCandles: 40,
			Validator:  pr.validateTriangle,
		},
		{
			Name:       "Flag",
			Type:       "continuation",
			MinCandles: 5,
			MaxCandles: 15,
			Validator:  pr.validateFlag,
		},
		{
			Name:       "Wedge",
			Type:       "reversal",
			MinCandles: 10,
			MaxCandles: 30,
			Validator:  pr.validateWedge,
		},
		{
			Name:       "Channel",
			Type:       "continuation",
			MinCandles: 10,
			MaxCandles: 50,
			Validator:  pr.validateChannel,
		},
		{
			Name:       "Cup and Handle",
			Type:       "continuation",
			MinCandles: 20,
			MaxCandles: 60,
			Validator:  pr.validateCupAndHandle,
		},
		{
			Name:       "Hammer",
			Type:       "reversal",
			MinCandles: 1,
			MaxCandles: 1,
			Validator:  pr.validateHammer,
		},
		{
			Name:       "Doji",
			Type:       "indecision",
			MinCandles: 1,
			MaxCandles: 1,
			Validator:  pr.validateDoji,
		},
		{
			Name:       "Engulfing",
			Type:       "reversal",
			MinCandles: 2,
			MaxCandles: 2,
			Validator:  pr.validateEngulfing,
		},
		{
			Name:       "Three White Soldiers",
			Type:       "continuation",
			MinCandles: 3,
			MaxCandles: 3,
			Validator:  pr.validateThreeWhiteSoldiers,
		},
	}
}

// Recognize identifies patterns in candle data
func (pr *PatternRecognizer) Recognize(symbol string, candles []Candle) []Pattern {
	pr.mu.RLock()
	defer pr.mu.RUnlock()

	var patterns []Pattern

	// Check for each pattern type
	for _, patternDef := range pr.Patterns {
		// Scan through candle windows
		for i := 0; i <= len(candles)-patternDef.MinCandles; i++ {
			for length := patternDef.MinCandles; length <= patternDef.MaxCandles && i+length <= len(candles); length++ {
				window := candles[i : i+length]

				if valid, strength := patternDef.Validator(window); valid {
					pattern := Pattern{
						Name:       patternDef.Name,
						Type:       patternDef.Type,
						Direction:  pr.determineDirection(window),
						Strength:   strength,
						Confidence: strength * 100,
						StartIdx:   i,
						EndIdx:     i + length - 1,
						Timestamp:  time.Now(),
					}
					patterns = append(patterns, pattern)
				}
			}
		}
	}

	return patterns
}

// Pattern validation functions

func (pr *PatternRecognizer) validateHeadAndShoulders(candles []Candle) (bool, float64) {
	if len(candles) < 15 {
		return false, 0
	}

	// Find potential peaks
	peaks := pr.findPeaks(candles)
	if len(peaks) < 3 {
		return false, 0
	}

	// Check for head and shoulders formation
	leftShoulder := peaks[0]
	head := peaks[1]
	rightShoulder := peaks[2]

	// Head should be higher than shoulders
	if candles[head].High > candles[leftShoulder].High &&
		candles[head].High > candles[rightShoulder].High &&
		math.Abs(candles[leftShoulder].High-candles[rightShoulder].High)/candles[head].High < 0.05 {

		strength := 0.8
		return true, strength
	}

	return false, 0
}

func (pr *PatternRecognizer) validateDoubleTop(candles []Candle) (bool, float64) {
	if len(candles) < 10 {
		return false, 0
	}

	peaks := pr.findPeaks(candles)
	if len(peaks) < 2 {
		return false, 0
	}

	// Check if two peaks are at similar levels
	peak1 := candles[peaks[0]].High
	peak2 := candles[peaks[1]].High

	if math.Abs(peak1-peak2)/peak1 < 0.03 {
		strength := 0.75
		return true, strength
	}

	return false, 0
}

func (pr *PatternRecognizer) validateDoubleBottom(candles []Candle) (bool, float64) {
	if len(candles) < 10 {
		return false, 0
	}

	troughs := pr.findTroughs(candles)
	if len(troughs) < 2 {
		return false, 0
	}

	// Check if two troughs are at similar levels
	trough1 := candles[troughs[0]].Low
	trough2 := candles[troughs[1]].Low

	if math.Abs(trough1-trough2)/trough1 < 0.03 {
		strength := 0.75
		return true, strength
	}

	return false, 0
}

func (pr *PatternRecognizer) validateTriangle(candles []Candle) (bool, float64) {
	if len(candles) < 10 {
		return false, 0
	}

	// Check for converging highs and lows
	highs := make([]float64, len(candles))
	lows := make([]float64, len(candles))

	for i, candle := range candles {
		highs[i] = candle.High
		lows[i] = candle.Low
	}

	// Calculate trend lines
	highTrend := pr.calculateTrend(highs)
	lowTrend := pr.calculateTrend(lows)

	// Check if trends are converging
	if math.Abs(highTrend+lowTrend) < 0.01 {
		strength := 0.7
		return true, strength
	}

	return false, 0
}

func (pr *PatternRecognizer) validateFlag(candles []Candle) (bool, float64) {
	if len(candles) < 5 {
		return false, 0
	}

	// Check for parallel channel after sharp move
	// Simplified validation
	firstHalf := candles[:len(candles)/2]
	secondHalf := candles[len(candles)/2:]

	firstAvg := pr.averagePrice(firstHalf)
	secondAvg := pr.averagePrice(secondHalf)

	if math.Abs(firstAvg-secondAvg)/firstAvg < 0.02 {
		strength := 0.65
		return true, strength
	}

	return false, 0
}

func (pr *PatternRecognizer) validateWedge(candles []Candle) (bool, float64) {
	if len(candles) < 10 {
		return false, 0
	}

	// Similar to triangle but with both lines sloping in same direction
	highs := make([]float64, len(candles))
	lows := make([]float64, len(candles))

	for i, candle := range candles {
		highs[i] = candle.High
		lows[i] = candle.Low
	}

	highTrend := pr.calculateTrend(highs)
	lowTrend := pr.calculateTrend(lows)

	// Both trends in same direction and converging
	if highTrend*lowTrend > 0 && math.Abs(highTrend-lowTrend) > 0.001 {
		strength := 0.7
		return true, strength
	}

	return false, 0
}

func (pr *PatternRecognizer) validateChannel(candles []Candle) (bool, float64) {
	if len(candles) < 10 {
		return false, 0
	}

	// Check for parallel support and resistance lines
	highs := make([]float64, len(candles))
	lows := make([]float64, len(candles))

	for i, candle := range candles {
		highs[i] = candle.High
		lows[i] = candle.Low
	}

	highTrend := pr.calculateTrend(highs)
	lowTrend := pr.calculateTrend(lows)

	// Trends should be parallel
	if math.Abs(highTrend-lowTrend) < 0.001 {
		strength := 0.6
		return true, strength
	}

	return false, 0
}

func (pr *PatternRecognizer) validateCupAndHandle(candles []Candle) (bool, float64) {
	if len(candles) < 20 {
		return false, 0
	}

	// Find U-shaped pattern followed by small consolidation
	cupEnd := len(candles) * 3 / 4
	cup := candles[:cupEnd]
	handle := candles[cupEnd:]

	// Check for U-shape in cup
	midpoint := len(cup) / 2
	leftRim := pr.averagePrice(cup[:5])
	bottom := pr.averagePrice(cup[midpoint-2 : midpoint+2])
	rightRim := pr.averagePrice(cup[len(cup)-5:])

	if bottom < leftRim*0.9 && bottom < rightRim*0.9 &&
		math.Abs(leftRim-rightRim)/leftRim < 0.05 {

		// Check handle is small consolidation
		handleRange := pr.priceRange(handle)
		cupRange := pr.priceRange(cup)

		if handleRange < cupRange*0.3 {
			strength := 0.75
			return true, strength
		}
	}

	return false, 0
}

func (pr *PatternRecognizer) validateHammer(candles []Candle) (bool, float64) {
	if len(candles) != 1 {
		return false, 0
	}

	candle := candles[0]
	body := math.Abs(candle.Close - candle.Open)
	lowerShadow := math.Min(candle.Open, candle.Close) - candle.Low
	upperShadow := candle.High - math.Max(candle.Open, candle.Close)

	// Long lower shadow, small body, little to no upper shadow
	if lowerShadow > body*2 && upperShadow < body*0.5 {
		strength := 0.7
		return true, strength
	}

	return false, 0
}

func (pr *PatternRecognizer) validateDoji(candles []Candle) (bool, float64) {
	if len(candles) != 1 {
		return false, 0
	}

	candle := candles[0]
	body := math.Abs(candle.Close - candle.Open)
	totalRange := candle.High - candle.Low

	// Very small body relative to total range
	if totalRange > 0 && body/totalRange < 0.1 {
		strength := 0.6
		return true, strength
	}

	return false, 0
}

func (pr *PatternRecognizer) validateEngulfing(candles []Candle) (bool, float64) {
	if len(candles) != 2 {
		return false, 0
	}

	prev := candles[0]
	curr := candles[1]

	// Bullish engulfing
	if prev.Close < prev.Open && // Previous is bearish
		curr.Close > curr.Open && // Current is bullish
		curr.Open < prev.Close && // Opens below previous close
		curr.Close > prev.Open { // Closes above previous open

		strength := 0.75
		return true, strength
	}

	// Bearish engulfing
	if prev.Close > prev.Open && // Previous is bullish
		curr.Close < curr.Open && // Current is bearish
		curr.Open > prev.Close && // Opens above previous close
		curr.Close < prev.Open { // Closes below previous open

		strength := 0.75
		return true, strength
	}

	return false, 0
}

func (pr *PatternRecognizer) validateThreeWhiteSoldiers(candles []Candle) (bool, float64) {
	if len(candles) != 3 {
		return false, 0
	}

	// Three consecutive bullish candles with higher closes
	for i := 0; i < 3; i++ {
		if candles[i].Close <= candles[i].Open {
			return false, 0
		}

		if i > 0 && candles[i].Close <= candles[i-1].Close {
			return false, 0
		}
	}

	strength := 0.8
	return true, strength
}

// Helper functions

func (pr *PatternRecognizer) findPeaks(candles []Candle) []int {
	var peaks []int

	for i := 1; i < len(candles)-1; i++ {
		if candles[i].High > candles[i-1].High && candles[i].High > candles[i+1].High {
			peaks = append(peaks, i)
		}
	}

	return peaks
}

func (pr *PatternRecognizer) findTroughs(candles []Candle) []int {
	var troughs []int

	for i := 1; i < len(candles)-1; i++ {
		if candles[i].Low < candles[i-1].Low && candles[i].Low < candles[i+1].Low {
			troughs = append(troughs, i)
		}
	}

	return troughs
}

func (pr *PatternRecognizer) calculateTrend(prices []float64) float64 {
	// Simple linear regression slope
	n := float64(len(prices))
	sumX := 0.0
	sumY := 0.0
	sumXY := 0.0
	sumX2 := 0.0

	for i, price := range prices {
		x := float64(i)
		sumX += x
		sumY += price
		sumXY += x * price
		sumX2 += x * x
	}

	slope := (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX)
	return slope
}

func (pr *PatternRecognizer) averagePrice(candles []Candle) float64 {
	sum := 0.0
	for _, candle := range candles {
		sum += (candle.High + candle.Low + candle.Close) / 3
	}
	return sum / float64(len(candles))
}

func (pr *PatternRecognizer) priceRange(candles []Candle) float64 {
	if len(candles) == 0 {
		return 0
	}

	highest := candles[0].High
	lowest := candles[0].Low

	for _, candle := range candles {
		if candle.High > highest {
			highest = candle.High
		}
		if candle.Low < lowest {
			lowest = candle.Low
		}
	}

	return highest - lowest
}

func (pr *PatternRecognizer) determineDirection(candles []Candle) string {
	if len(candles) < 2 {
		return "NEUTRAL"
	}

	firstPrice := candles[0].Close
	lastPrice := candles[len(candles)-1].Close

	change := (lastPrice - firstPrice) / firstPrice

	if change > 0.01 {
		return "BULLISH"
	} else if change < -0.01 {
		return "BEARISH"
	}

	return "NEUTRAL"
}