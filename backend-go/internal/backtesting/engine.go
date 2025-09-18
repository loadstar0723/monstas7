package backtesting

import (
	"fmt"
	"math"
	"time"
)

// BacktestEngine 백테스팅 엔진
type BacktestEngine struct {
	InitialCapital  float64
	CurrentCapital  float64
	MaxDrawdown     float64
	TotalTrades     int
	WinningTrades   int
	LosingTrades    int
	TotalProfit     float64
	TotalLoss       float64
	Positions       []Position
	TradeHistory    []Trade
	PerformanceData []PerformancePoint
}

// Position 포지션 정보
type Position struct {
	Symbol      string
	Side        string // "LONG" or "SHORT"
	EntryPrice  float64
	EntryTime   time.Time
	Size        float64
	StopLoss    float64
	TakeProfit  float64
	Leverage    float64
}

// Trade 거래 기록
type Trade struct {
	Symbol      string
	Side        string
	EntryPrice  float64
	ExitPrice   float64
	EntryTime   time.Time
	ExitTime    time.Time
	Size        float64
	PnL         float64
	PnLPercent  float64
	Fees        float64
	NetPnL      float64
}

// PerformancePoint 성능 데이터 포인트
type PerformancePoint struct {
	Time       time.Time
	Capital    float64
	Drawdown   float64
	CumReturn  float64
	TradeCount int
}

// BacktestResult 백테스트 결과
type BacktestResult struct {
	TotalReturn     float64            `json:"total_return"`
	AnnualizedReturn float64           `json:"annualized_return"`
	MaxDrawdown     float64            `json:"max_drawdown"`
	SharpeRatio     float64            `json:"sharpe_ratio"`
	WinRate         float64            `json:"win_rate"`
	ProfitFactor    float64            `json:"profit_factor"`
	TotalTrades     int                `json:"total_trades"`
	WinningTrades   int                `json:"winning_trades"`
	LosingTrades    int                `json:"losing_trades"`
	AveragePnL      float64            `json:"average_pnl"`
	AverageWin      float64            `json:"average_win"`
	AverageLoss     float64            `json:"average_loss"`
	MaxConsecutiveWins  int            `json:"max_consecutive_wins"`
	MaxConsecutiveLosses int           `json:"max_consecutive_losses"`
	RecoveryFactor  float64            `json:"recovery_factor"`
	ExpectancyRatio float64            `json:"expectancy_ratio"`
	TradeHistory    []Trade            `json:"trade_history"`
	EquityCurve     []PerformancePoint `json:"equity_curve"`
}

// NewBacktestEngine 새 백테스팅 엔진 생성
func NewBacktestEngine(initialCapital float64) *BacktestEngine {
	return &BacktestEngine{
		InitialCapital:  initialCapital,
		CurrentCapital:  initialCapital,
		MaxDrawdown:     0,
		TotalTrades:     0,
		WinningTrades:   0,
		LosingTrades:    0,
		TotalProfit:     0,
		TotalLoss:       0,
		Positions:       []Position{},
		TradeHistory:    []Trade{},
		PerformanceData: []PerformancePoint{},
	}
}

// RunBacktest 백테스트 실행
func (be *BacktestEngine) RunBacktest(data []MarketData, strategy Strategy) *BacktestResult {
	peakCapital := be.InitialCapital
	consecutiveWins := 0
	consecutiveLosses := 0
	maxConsecutiveWins := 0
	maxConsecutiveLosses := 0

	for i, candle := range data {
		// 전략 신호 생성
		signal := strategy.GenerateSignal(data[:i+1])

		// 포지션 관리
		if signal.Action == "BUY" && len(be.Positions) == 0 {
			be.OpenPosition(candle, signal, "LONG")
		} else if signal.Action == "SELL" && len(be.Positions) > 0 {
			trade := be.ClosePosition(candle, be.Positions[0])

			// 연속 승패 추적
			if trade.PnL > 0 {
				consecutiveWins++
				consecutiveLosses = 0
				if consecutiveWins > maxConsecutiveWins {
					maxConsecutiveWins = consecutiveWins
				}
			} else {
				consecutiveLosses++
				consecutiveWins = 0
				if consecutiveLosses > maxConsecutiveLosses {
					maxConsecutiveLosses = consecutiveLosses
				}
			}
		}

		// 손절/익절 체크
		for _, position := range be.Positions {
			if position.Side == "LONG" {
				if candle.Low <= position.StopLoss || candle.High >= position.TakeProfit {
					be.ClosePosition(candle, position)
				}
			}
		}

		// 최대 낙폭 계산
		if be.CurrentCapital > peakCapital {
			peakCapital = be.CurrentCapital
		}
		drawdown := (peakCapital - be.CurrentCapital) / peakCapital * 100
		if drawdown > be.MaxDrawdown {
			be.MaxDrawdown = drawdown
		}

		// 성능 데이터 기록
		be.PerformanceData = append(be.PerformanceData, PerformancePoint{
			Time:       candle.Time,
			Capital:    be.CurrentCapital,
			Drawdown:   drawdown,
			CumReturn:  ((be.CurrentCapital - be.InitialCapital) / be.InitialCapital) * 100,
			TradeCount: be.TotalTrades,
		})
	}

	// 결과 계산
	return be.CalculateResults(maxConsecutiveWins, maxConsecutiveLosses)
}

// OpenPosition 포지션 열기
func (be *BacktestEngine) OpenPosition(candle MarketData, signal Signal, side string) {
	position := Position{
		Symbol:     candle.Symbol,
		Side:       side,
		EntryPrice: candle.Close,
		EntryTime:  candle.Time,
		Size:       be.CurrentCapital * signal.PositionSize,
		StopLoss:   signal.StopLoss,
		TakeProfit: signal.TakeProfit,
		Leverage:   signal.Leverage,
	}

	be.Positions = append(be.Positions, position)
}

// ClosePosition 포지션 닫기
func (be *BacktestEngine) ClosePosition(candle MarketData, position Position) Trade {
	exitPrice := candle.Close

	// PnL 계산
	var pnl float64
	if position.Side == "LONG" {
		pnl = (exitPrice - position.EntryPrice) / position.EntryPrice * position.Size * position.Leverage
	} else {
		pnl = (position.EntryPrice - exitPrice) / position.EntryPrice * position.Size * position.Leverage
	}

	// 수수료 계산 (0.1%)
	fees := position.Size * 0.001 * 2 // 진입 + 청산
	netPnL := pnl - fees

	// 자본 업데이트
	be.CurrentCapital += netPnL

	// 거래 기록
	trade := Trade{
		Symbol:     position.Symbol,
		Side:       position.Side,
		EntryPrice: position.EntryPrice,
		ExitPrice:  exitPrice,
		EntryTime:  position.EntryTime,
		ExitTime:   candle.Time,
		Size:       position.Size,
		PnL:        pnl,
		PnLPercent: (pnl / position.Size) * 100,
		Fees:       fees,
		NetPnL:     netPnL,
	}

	be.TradeHistory = append(be.TradeHistory, trade)
	be.TotalTrades++

	if netPnL > 0 {
		be.WinningTrades++
		be.TotalProfit += netPnL
	} else {
		be.LosingTrades++
		be.TotalLoss += math.Abs(netPnL)
	}

	// 포지션 제거
	newPositions := []Position{}
	for _, p := range be.Positions {
		if p != position {
			newPositions = append(newPositions, p)
		}
	}
	be.Positions = newPositions

	return trade
}

// CalculateResults 최종 결과 계산
func (be *BacktestEngine) CalculateResults(maxWins, maxLosses int) *BacktestResult {
	if be.TotalTrades == 0 {
		return &BacktestResult{}
	}

	// 기본 메트릭
	totalReturn := ((be.CurrentCapital - be.InitialCapital) / be.InitialCapital) * 100
	winRate := float64(be.WinningTrades) / float64(be.TotalTrades) * 100

	// Profit Factor
	profitFactor := 0.0
	if be.TotalLoss > 0 {
		profitFactor = be.TotalProfit / be.TotalLoss
	}

	// 평균 수익/손실
	averagePnL := (be.TotalProfit - be.TotalLoss) / float64(be.TotalTrades)
	averageWin := 0.0
	if be.WinningTrades > 0 {
		averageWin = be.TotalProfit / float64(be.WinningTrades)
	}
	averageLoss := 0.0
	if be.LosingTrades > 0 {
		averageLoss = be.TotalLoss / float64(be.LosingTrades)
	}

	// Sharpe Ratio 계산 (간단한 버전)
	returns := []float64{}
	for i := 1; i < len(be.PerformanceData); i++ {
		dailyReturn := (be.PerformanceData[i].Capital - be.PerformanceData[i-1].Capital) /
		              be.PerformanceData[i-1].Capital
		returns = append(returns, dailyReturn)
	}
	sharpeRatio := calculateSharpeRatio(returns)

	// Expectancy Ratio
	expectancyRatio := (winRate/100 * averageWin) - ((100-winRate)/100 * averageLoss)

	// Recovery Factor
	recoveryFactor := 0.0
	if be.MaxDrawdown > 0 {
		recoveryFactor = totalReturn / be.MaxDrawdown
	}

	// 연간 수익률 (거래 기간 기준)
	if len(be.PerformanceData) > 1 {
		days := be.PerformanceData[len(be.PerformanceData)-1].Time.Sub(be.PerformanceData[0].Time).Hours() / 24
		if days > 0 {
			annualizedReturn := totalReturn * (365 / days)

			return &BacktestResult{
				TotalReturn:          totalReturn,
				AnnualizedReturn:     annualizedReturn,
				MaxDrawdown:          be.MaxDrawdown,
				SharpeRatio:          sharpeRatio,
				WinRate:              winRate,
				ProfitFactor:         profitFactor,
				TotalTrades:          be.TotalTrades,
				WinningTrades:        be.WinningTrades,
				LosingTrades:         be.LosingTrades,
				AveragePnL:           averagePnL,
				AverageWin:           averageWin,
				AverageLoss:          averageLoss,
				MaxConsecutiveWins:   maxWins,
				MaxConsecutiveLosses: maxLosses,
				RecoveryFactor:       recoveryFactor,
				ExpectancyRatio:      expectancyRatio,
				TradeHistory:         be.TradeHistory,
				EquityCurve:          be.PerformanceData,
			}
		}
	}

	return &BacktestResult{
		TotalReturn:          totalReturn,
		MaxDrawdown:          be.MaxDrawdown,
		SharpeRatio:          sharpeRatio,
		WinRate:              winRate,
		ProfitFactor:         profitFactor,
		TotalTrades:          be.TotalTrades,
		WinningTrades:        be.WinningTrades,
		LosingTrades:         be.LosingTrades,
		AveragePnL:           averagePnL,
		AverageWin:           averageWin,
		AverageLoss:          averageLoss,
		MaxConsecutiveWins:   maxWins,
		MaxConsecutiveLosses: maxLosses,
		RecoveryFactor:       recoveryFactor,
		ExpectancyRatio:      expectancyRatio,
		TradeHistory:         be.TradeHistory,
		EquityCurve:          be.PerformanceData,
	}
}

// calculateSharpeRatio Sharpe Ratio 계산
func calculateSharpeRatio(returns []float64) float64 {
	if len(returns) == 0 {
		return 0
	}

	// 평균 수익률
	sum := 0.0
	for _, r := range returns {
		sum += r
	}
	mean := sum / float64(len(returns))

	// 표준편차
	variance := 0.0
	for _, r := range returns {
		variance += math.Pow(r-mean, 2)
	}
	stdDev := math.Sqrt(variance / float64(len(returns)))

	if stdDev == 0 {
		return 0
	}

	// 연간화된 Sharpe Ratio (일일 수익률 기준, 무위험 이자율 0 가정)
	return (mean / stdDev) * math.Sqrt(252)
}

// MarketData 시장 데이터
type MarketData struct {
	Symbol string
	Time   time.Time
	Open   float64
	High   float64
	Low    float64
	Close  float64
	Volume float64
}

// Signal 거래 신호
type Signal struct {
	Action       string  // "BUY", "SELL", "HOLD"
	Confidence   float64
	StopLoss     float64
	TakeProfit   float64
	PositionSize float64 // 자본 대비 비율 (0-1)
	Leverage     float64
}

// Strategy 전략 인터페이스
type Strategy interface {
	GenerateSignal(data []MarketData) Signal
}

// OptimizeStrategy 전략 최적화
func (be *BacktestEngine) OptimizeStrategy(data []MarketData, paramRanges map[string][]float64) map[string]float64 {
	bestParams := make(map[string]float64)
	bestScore := -math.MaxFloat64

	// 그리드 서치로 최적 파라미터 찾기
	for paramName, values := range paramRanges {
		for _, value := range values {
			// 파라미터로 백테스트 실행
			tempEngine := NewBacktestEngine(be.InitialCapital)
			strategy := NewParameterizedStrategy(paramName, value)
			result := tempEngine.RunBacktest(data, strategy)

			// 스코어 계산 (Sharpe Ratio * Win Rate)
			score := result.SharpeRatio * (result.WinRate / 100)

			if score > bestScore {
				bestScore = score
				bestParams[paramName] = value
			}
		}
	}

	return bestParams
}

// ParameterizedStrategy 파라미터화된 전략
type ParameterizedStrategy struct {
	ParamName  string
	ParamValue float64
}

// NewParameterizedStrategy 새 파라미터화된 전략 생성
func NewParameterizedStrategy(paramName string, paramValue float64) *ParameterizedStrategy {
	return &ParameterizedStrategy{
		ParamName:  paramName,
		ParamValue: paramValue,
	}
}

// GenerateSignal 신호 생성 (파라미터 기반)
func (ps *ParameterizedStrategy) GenerateSignal(data []MarketData) Signal {
	// 간단한 이동평균 크로스오버 전략 예시
	if len(data) < int(ps.ParamValue) {
		return Signal{Action: "HOLD"}
	}

	// 단기 이동평균
	shortMA := calculateMA(data[len(data)-20:], 20)
	// 장기 이동평균 (파라미터 사용)
	longMA := calculateMA(data[len(data)-int(ps.ParamValue):], int(ps.ParamValue))

	lastPrice := data[len(data)-1].Close

	if shortMA > longMA*1.01 { // 골든 크로스
		return Signal{
			Action:       "BUY",
			Confidence:   0.75,
			StopLoss:     lastPrice * 0.97,
			TakeProfit:   lastPrice * 1.05,
			PositionSize: 0.1,
			Leverage:     2.0,
		}
	} else if shortMA < longMA*0.99 { // 데드 크로스
		return Signal{
			Action:     "SELL",
			Confidence: 0.75,
		}
	}

	return Signal{Action: "HOLD"}
}

// calculateMA 이동평균 계산
func calculateMA(data []MarketData, period int) float64 {
	if len(data) < period {
		return 0
	}

	sum := 0.0
	for i := len(data) - period; i < len(data); i++ {
		sum += data[i].Close
	}

	return sum / float64(period)
}

// MonteCarloSimulation 몬테카를로 시뮬레이션
func (be *BacktestEngine) MonteCarloSimulation(iterations int) []float64 {
	results := make([]float64, iterations)

	for i := 0; i < iterations; i++ {
		// 거래 순서를 랜덤하게 섞어서 시뮬레이션
		shuffledTrades := shuffleTrades(be.TradeHistory)
		simulatedCapital := be.InitialCapital

		for _, trade := range shuffledTrades {
			simulatedCapital += trade.NetPnL
		}

		results[i] = ((simulatedCapital - be.InitialCapital) / be.InitialCapital) * 100
	}

	return results
}

// shuffleTrades 거래 순서 섞기
func shuffleTrades(trades []Trade) []Trade {
	shuffled := make([]Trade, len(trades))
	copy(shuffled, trades)

	// Fisher-Yates shuffle
	for i := len(shuffled) - 1; i > 0; i-- {
		j := int(time.Now().UnixNano()) % (i + 1)
		shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
	}

	return shuffled
}

// WalkForwardAnalysis Walk-Forward 분석
func (be *BacktestEngine) WalkForwardAnalysis(data []MarketData, windowSize, stepSize int) []BacktestResult {
	results := []BacktestResult{}

	for i := 0; i <= len(data)-windowSize; i += stepSize {
		// 훈련 데이터 (80%)
		trainSize := int(float64(windowSize) * 0.8)
		trainData := data[i : i+trainSize]

		// 테스트 데이터 (20%)
		testData := data[i+trainSize : i+windowSize]

		// 훈련 데이터로 최적화
		paramRanges := map[string][]float64{
			"ma_period": {20, 30, 40, 50, 60},
		}
		bestParams := be.OptimizeStrategy(trainData, paramRanges)

		// 테스트 데이터로 검증
		testEngine := NewBacktestEngine(be.InitialCapital)
		strategy := NewParameterizedStrategy("ma_period", bestParams["ma_period"])
		result := testEngine.RunBacktest(testData, strategy)

		results = append(results, *result)
	}

	return results
}