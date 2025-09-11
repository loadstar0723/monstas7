// 실제 백테스트 엔진 - 모든 데이터는 실제 API에서 가져옴

export interface BacktestParameters {
  symbol: string
  startDate: Date
  endDate: Date
  initialCapital: number
  leverage: number
  tradingFee: number
  slippage: number
  strategy: BacktestStrategy
}

export interface BacktestStrategy {
  name: string
  type: 'momentum' | 'meanReversion' | 'breakout' | 'arbitrage' | 'grid' | 'dca'
  parameters: StrategyParameters
  indicators: string[]
  riskManagement: RiskManagement
}

export interface StrategyParameters {
  entryRules: EntryRule[]
  exitRules: ExitRule[]
  positionSizing: PositionSizing
  timeframe: string
}

export interface EntryRule {
  indicator: string
  condition: 'above' | 'below' | 'cross_up' | 'cross_down' | 'equals'
  value: number | string
  weight: number
}

export interface ExitRule {
  type: 'stop_loss' | 'take_profit' | 'trailing_stop' | 'time_based' | 'indicator_based'
  value: number
  indicator?: string
  condition?: string
}

export interface PositionSizing {
  method: 'fixed' | 'kelly' | 'risk_parity' | 'volatility_adjusted'
  maxPositionSize: number
  maxRiskPerTrade: number
}

export interface RiskManagement {
  maxDrawdown: number
  maxConsecutiveLosses: number
  maxDailyLoss: number
  maxPositions: number
  correlationLimit: number
}

export interface BacktestResult {
  trades: Trade[]
  metrics: PerformanceMetrics
  equityCurve: EquityPoint[]
  drawdownCurve: number[]
  signals: Signal[]
  summary: BacktestSummary
}

export interface Trade {
  id: string
  timestamp: number
  type: 'buy' | 'sell'
  price: number
  quantity: number
  value: number
  fee: number
  slippage: number
  pnl: number
  pnlPercent: number
  runningPnl: number
  equity: number
  indicators: Record<string, number>
  signal: string
}

export interface PerformanceMetrics {
  totalReturn: number
  annualizedReturn: number
  sharpeRatio: number
  sortinoRatio: number
  calmarRatio: number
  maxDrawdown: number
  maxDrawdownDuration: number
  winRate: number
  profitFactor: number
  averageWin: number
  averageLoss: number
  expectancy: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  averageHoldTime: number
  bestTrade: Trade
  worstTrade: Trade
  consecutiveWins: number
  consecutiveLosses: number
  recoveryFactor: number
  ulcerIndex: number
  kellyPercentage: number
}

export interface EquityPoint {
  timestamp: number
  equity: number
  drawdown: number
  returns: number
}

export interface Signal {
  timestamp: number
  type: 'entry' | 'exit' | 'hold'
  direction: 'long' | 'short'
  strength: number
  indicators: Record<string, number>
  reasoning: string[]
}

export interface BacktestSummary {
  strategy: string
  period: string
  totalDays: number
  exposure: number
  riskAdjustedReturn: number
  benchmarkComparison: number
  recommendation: string
  improvements: string[]
}

export class BacktestEngine {
  private historicalData: any[] = []
  private parameters: BacktestParameters
  private results: BacktestResult
  private equity: number
  private positions: Map<string, any> = new Map()
  private trades: Trade[] = []
  private signals: Signal[] = []

  constructor(parameters: BacktestParameters) {
    this.parameters = parameters
    this.equity = parameters.initialCapital
    this.results = this.initializeResults()
  }

  private initializeResults(): BacktestResult {
    return {
      trades: [],
      metrics: this.initializeMetrics(),
      equityCurve: [],
      drawdownCurve: [],
      signals: [],
      summary: {
        strategy: this.parameters.strategy.name,
        period: '',
        totalDays: 0,
        exposure: 0,
        riskAdjustedReturn: 0,
        benchmarkComparison: 0,
        recommendation: '',
        improvements: []
      }
    }
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      totalReturn: 0,
      annualizedReturn: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      maxDrawdown: 0,
      maxDrawdownDuration: 0,
      winRate: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      expectancy: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      averageHoldTime: 0,
      bestTrade: {} as Trade,
      worstTrade: {} as Trade,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      recoveryFactor: 0,
      ulcerIndex: 0,
      kellyPercentage: 0
    }
  }

  // 실제 데이터 로드 (Binance API)
  async loadHistoricalData(): Promise<void> {
    try {
      const response = await fetch(`/api/binance/historical?symbol=${this.parameters.symbol}&timeframe=all`)
      const data = await response.json()
      
      if (data.success && data.data) {
        // 시간대별 데이터 병합 및 정렬
        const allData = []
        
        // 각 타임프레임별 데이터 처리
        for (const [timeframe, candles] of Object.entries(data.data)) {
          if (Array.isArray(candles)) {
            allData.push(...candles)
          }
        }
        
        // 시간순 정렬 및 중복 제거
        this.historicalData = allData
          .sort((a, b) => a.time - b.time)
          .filter((item, index, self) => 
            index === self.findIndex((t) => t.time === item.time)
          )
          .filter(item => {
            const timestamp = new Date(item.time)
            return timestamp >= this.parameters.startDate && timestamp <= this.parameters.endDate
          })
      }
    } catch (error) {
      console.error('Failed to load historical data:', error)
      throw new Error('백테스트 데이터 로드 실패')
    }
  }

  // 실제 지표 계산
  private calculateIndicators(data: any[], index: number): Record<string, number> {
    const indicators: Record<string, number> = {}
    
    if (index < 20) return indicators
    
    const closes = data.slice(Math.max(0, index - 100), index + 1).map(d => d.close)
    const highs = data.slice(Math.max(0, index - 100), index + 1).map(d => d.high)
    const lows = data.slice(Math.max(0, index - 100), index + 1).map(d => d.low)
    const volumes = data.slice(Math.max(0, index - 100), index + 1).map(d => d.volume)
    
    // RSI 계산
    if (this.parameters.strategy.indicators.includes('RSI')) {
      indicators.rsi = this.calculateRSI(closes, 14)
    }
    
    // MACD 계산
    if (this.parameters.strategy.indicators.includes('MACD')) {
      const macd = this.calculateMACD(closes)
      indicators.macd = macd.macd
      indicators.macdSignal = macd.signal
      indicators.macdHistogram = macd.histogram
    }
    
    // 볼린저 밴드 계산
    if (this.parameters.strategy.indicators.includes('BB')) {
      const bb = this.calculateBollingerBands(closes, 20, 2)
      indicators.bbUpper = bb.upper
      indicators.bbMiddle = bb.middle
      indicators.bbLower = bb.lower
      indicators.bbWidth = bb.width
    }
    
    // 이동평균 계산
    if (this.parameters.strategy.indicators.includes('MA')) {
      indicators.sma20 = this.calculateSMA(closes, 20)
      indicators.sma50 = this.calculateSMA(closes, 50)
      indicators.ema12 = this.calculateEMA(closes, 12)
      indicators.ema26 = this.calculateEMA(closes, 26)
    }
    
    // ATR 계산
    if (this.parameters.strategy.indicators.includes('ATR')) {
      indicators.atr = this.calculateATR(highs, lows, closes, 14)
    }
    
    // 스토캐스틱 계산
    if (this.parameters.strategy.indicators.includes('STOCH')) {
      const stoch = this.calculateStochastic(highs, lows, closes, 14, 3, 3)
      indicators.stochK = stoch.k
      indicators.stochD = stoch.d
    }
    
    // ADX 계산
    if (this.parameters.strategy.indicators.includes('ADX')) {
      indicators.adx = this.calculateADX(highs, lows, closes, 14)
    }
    
    // MFI 계산
    if (this.parameters.strategy.indicators.includes('MFI')) {
      indicators.mfi = this.calculateMFI(highs, lows, closes, volumes, 14)
    }
    
    return indicators
  }

  // 진입 신호 체크
  private checkEntrySignal(indicators: Record<string, number>, price: number): boolean {
    const { entryRules } = this.parameters.strategy.parameters
    let totalWeight = 0
    let metWeight = 0
    
    for (const rule of entryRules) {
      totalWeight += rule.weight
      
      switch (rule.condition) {
        case 'above':
          if (indicators[rule.indicator] > Number(rule.value)) {
            metWeight += rule.weight
          }
          break
        case 'below':
          if (indicators[rule.indicator] < Number(rule.value)) {
            metWeight += rule.weight
          }
          break
        case 'cross_up':
          // 크로스업 로직 구현
          break
        case 'cross_down':
          // 크로스다운 로직 구현
          break
      }
    }
    
    return totalWeight > 0 && (metWeight / totalWeight) >= 0.6
  }

  // 청산 신호 체크
  private checkExitSignal(position: any, currentPrice: number, indicators: Record<string, number>): boolean {
    const { exitRules } = this.parameters.strategy.parameters
    
    for (const rule of exitRules) {
      switch (rule.type) {
        case 'stop_loss':
          const lossPercent = (position.entryPrice - currentPrice) / position.entryPrice
          if (lossPercent >= rule.value) return true
          break
          
        case 'take_profit':
          const profitPercent = (currentPrice - position.entryPrice) / position.entryPrice
          if (profitPercent >= rule.value) return true
          break
          
        case 'trailing_stop':
          // 트레일링 스톱 로직
          break
          
        case 'indicator_based':
          if (rule.indicator && indicators[rule.indicator]) {
            // 지표 기반 청산 로직
          }
          break
      }
    }
    
    return false
  }

  // 백테스트 실행
  async run(): Promise<BacktestResult> {
    await this.loadHistoricalData()
    
    if (this.historicalData.length === 0) {
      throw new Error('백테스트 데이터가 없습니다')
    }
    
    let maxEquity = this.equity
    let currentPosition: any = null
    
    for (let i = 100; i < this.historicalData.length; i++) {
      const current = this.historicalData[i]
      const indicators = this.calculateIndicators(this.historicalData, i)
      
      // 포지션이 없을 때 진입 신호 체크
      if (!currentPosition) {
        if (this.checkEntrySignal(indicators, current.close)) {
          const positionSize = this.calculatePositionSize(current.close)
          const fee = positionSize * this.parameters.tradingFee
          const slippage = current.close * this.parameters.slippage
          
          currentPosition = {
            entryPrice: current.close + slippage,
            entryTime: current.time,
            quantity: positionSize / (current.close + slippage),
            value: positionSize,
            maxPrice: current.close
          }
          
          this.equity -= fee
          
          this.trades.push({
            id: `trade_${this.trades.length + 1}`,
            timestamp: current.time,
            type: 'buy',
            price: current.close + slippage,
            quantity: currentPosition.quantity,
            value: positionSize,
            fee: fee,
            slippage: slippage,
            pnl: 0,
            pnlPercent: 0,
            runningPnl: 0,
            equity: this.equity,
            indicators: indicators,
            signal: 'ENTRY'
          })
        }
      }
      // 포지션이 있을 때 청산 신호 체크
      else {
        currentPosition.maxPrice = Math.max(currentPosition.maxPrice, current.high)
        
        if (this.checkExitSignal(currentPosition, current.close, indicators)) {
          const exitValue = currentPosition.quantity * current.close
          const fee = exitValue * this.parameters.tradingFee
          const slippage = current.close * this.parameters.slippage
          const pnl = exitValue - currentPosition.value - fee
          const pnlPercent = pnl / currentPosition.value
          
          this.equity += exitValue - fee
          
          this.trades.push({
            id: `trade_${this.trades.length + 1}`,
            timestamp: current.time,
            type: 'sell',
            price: current.close - slippage,
            quantity: currentPosition.quantity,
            value: exitValue,
            fee: fee,
            slippage: slippage,
            pnl: pnl,
            pnlPercent: pnlPercent,
            runningPnl: this.equity - this.parameters.initialCapital,
            equity: this.equity,
            indicators: indicators,
            signal: 'EXIT'
          })
          
          currentPosition = null
        }
      }
      
      // 에쿼티 커브 업데이트
      const drawdown = maxEquity > 0 ? (maxEquity - this.equity) / maxEquity : 0
      maxEquity = Math.max(maxEquity, this.equity)
      
      this.results.equityCurve.push({
        timestamp: current.time,
        equity: this.equity,
        drawdown: drawdown,
        returns: (this.equity - this.parameters.initialCapital) / this.parameters.initialCapital
      })
    }
    
    // 최종 메트릭 계산
    this.calculateFinalMetrics()
    
    return this.results
  }

  // 포지션 크기 계산
  private calculatePositionSize(price: number): number {
    const { positionSizing, riskManagement } = this.parameters.strategy.parameters
    
    switch (positionSizing.method) {
      case 'fixed':
        return Math.min(
          this.equity * positionSizing.maxPositionSize,
          this.equity * riskManagement.maxRiskPerTrade
        )
        
      case 'kelly':
        const kellyF = this.calculateKellyPercentage()
        return this.equity * Math.min(kellyF, positionSizing.maxPositionSize)
        
      case 'volatility_adjusted':
        // ATR 기반 포지션 사이징
        return this.equity * positionSizing.maxPositionSize
        
      default:
        return this.equity * 0.1
    }
  }

  // 켈리 비율 계산
  private calculateKellyPercentage(): number {
    if (this.trades.length < 10) return 0.02
    
    const wins = this.trades.filter(t => t.pnl > 0)
    const losses = this.trades.filter(t => t.pnl < 0)
    
    if (wins.length === 0 || losses.length === 0) return 0.02
    
    const winRate = wins.length / this.trades.length
    const avgWin = wins.reduce((sum, t) => sum + t.pnlPercent, 0) / wins.length
    const avgLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnlPercent, 0) / losses.length)
    
    const kelly = (winRate * avgWin - (1 - winRate) * avgLoss) / avgWin
    
    return Math.max(0.01, Math.min(0.25, kelly))
  }

  // 최종 메트릭 계산
  private calculateFinalMetrics(): void {
    const metrics = this.results.metrics
    const trades = this.trades.filter(t => t.type === 'sell')
    
    if (trades.length === 0) return
    
    // 기본 메트릭
    metrics.totalTrades = trades.length
    metrics.winningTrades = trades.filter(t => t.pnl > 0).length
    metrics.losingTrades = trades.filter(t => t.pnl < 0).length
    metrics.winRate = metrics.winningTrades / metrics.totalTrades
    
    // 수익률 계산
    metrics.totalReturn = (this.equity - this.parameters.initialCapital) / this.parameters.initialCapital
    const days = (this.parameters.endDate.getTime() - this.parameters.startDate.getTime()) / (1000 * 60 * 60 * 24)
    metrics.annualizedReturn = Math.pow(1 + metrics.totalReturn, 365 / days) - 1
    
    // 평균 손익
    if (metrics.winningTrades > 0) {
      metrics.averageWin = trades
        .filter(t => t.pnl > 0)
        .reduce((sum, t) => sum + t.pnl, 0) / metrics.winningTrades
    }
    
    if (metrics.losingTrades > 0) {
      metrics.averageLoss = trades
        .filter(t => t.pnl < 0)
        .reduce((sum, t) => sum + Math.abs(t.pnl), 0) / metrics.losingTrades
    }
    
    // Profit Factor
    const totalWins = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0)
    const totalLosses = Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0))
    metrics.profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins
    
    // Expectancy
    metrics.expectancy = (metrics.winRate * metrics.averageWin) - ((1 - metrics.winRate) * metrics.averageLoss)
    
    // Max Drawdown
    let maxEquity = this.parameters.initialCapital
    let maxDrawdown = 0
    
    for (const point of this.results.equityCurve) {
      maxEquity = Math.max(maxEquity, point.equity)
      const drawdown = (maxEquity - point.equity) / maxEquity
      maxDrawdown = Math.max(maxDrawdown, drawdown)
    }
    metrics.maxDrawdown = maxDrawdown
    
    // Sharpe Ratio
    const returns = this.results.equityCurve.map(p => p.returns)
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
    metrics.sharpeRatio = stdDev > 0 ? (metrics.annualizedReturn - 0.02) / (stdDev * Math.sqrt(252)) : 0
    
    // Sortino Ratio
    const negativeReturns = returns.filter(r => r < 0)
    const downStdDev = Math.sqrt(negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length)
    metrics.sortinoRatio = downStdDev > 0 ? (metrics.annualizedReturn - 0.02) / (downStdDev * Math.sqrt(252)) : 0
    
    // Calmar Ratio
    metrics.calmarRatio = metrics.maxDrawdown > 0 ? metrics.annualizedReturn / metrics.maxDrawdown : 0
    
    // Best & Worst Trade
    metrics.bestTrade = trades.reduce((best, trade) => 
      trade.pnlPercent > (best?.pnlPercent || -Infinity) ? trade : best
    )
    metrics.worstTrade = trades.reduce((worst, trade) => 
      trade.pnlPercent < (worst?.pnlPercent || Infinity) ? trade : worst
    )
    
    // 연속 승/패 계산
    let currentWinStreak = 0
    let currentLossStreak = 0
    let maxWinStreak = 0
    let maxLossStreak = 0
    
    for (const trade of trades) {
      if (trade.pnl > 0) {
        currentWinStreak++
        currentLossStreak = 0
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
      } else {
        currentLossStreak++
        currentWinStreak = 0
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak)
      }
    }
    
    metrics.consecutiveWins = maxWinStreak
    metrics.consecutiveLosses = maxLossStreak
    
    // Recovery Factor
    const totalProfit = this.equity - this.parameters.initialCapital
    metrics.recoveryFactor = metrics.maxDrawdown > 0 ? totalProfit / (metrics.maxDrawdown * this.parameters.initialCapital) : 0
    
    // Kelly Percentage
    metrics.kellyPercentage = this.calculateKellyPercentage()
    
    // Summary 업데이트
    this.results.summary = {
      strategy: this.parameters.strategy.name,
      period: `${this.parameters.startDate.toISOString().split('T')[0]} ~ ${this.parameters.endDate.toISOString().split('T')[0]}`,
      totalDays: days,
      exposure: trades.length > 0 ? trades.reduce((sum, t) => sum + (t.value / this.parameters.initialCapital), 0) / trades.length : 0,
      riskAdjustedReturn: metrics.sharpeRatio,
      benchmarkComparison: 0,
      recommendation: this.generateRecommendation(metrics),
      improvements: this.generateImprovements(metrics)
    }
  }

  // 추천 생성
  private generateRecommendation(metrics: PerformanceMetrics): string {
    if (metrics.sharpeRatio > 2 && metrics.winRate > 0.6) {
      return '우수한 전략 - 실전 적용 권장'
    } else if (metrics.sharpeRatio > 1 && metrics.winRate > 0.5) {
      return '양호한 전략 - 파라미터 최적화 후 적용'
    } else if (metrics.profitFactor > 1.5) {
      return '수익성 있음 - 리스크 관리 강화 필요'
    } else {
      return '개선 필요 - 전략 재검토 권장'
    }
  }

  // 개선사항 생성
  private generateImprovements(metrics: PerformanceMetrics): string[] {
    const improvements = []
    
    if (metrics.winRate < 0.5) {
      improvements.push('진입 신호 정확도 개선 필요')
    }
    if (metrics.maxDrawdown > 0.2) {
      improvements.push('최대 낙폭 관리 강화 (손절 타이트하게)')
    }
    if (metrics.consecutiveLosses > 5) {
      improvements.push('연속 손실 방지 로직 추가')
    }
    if (metrics.sharpeRatio < 1) {
      improvements.push('변동성 대비 수익률 개선')
    }
    if (metrics.profitFactor < 1.5) {
      improvements.push('승률 또는 손익비 개선')
    }
    
    return improvements
  }

  // 기술적 지표 계산 함수들
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50
    
    let gains = 0
    let losses = 0
    
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) gains += change
      else losses += Math.abs(change)
    }
    
    const avgGain = gains / period
    const avgLoss = losses / period
    
    if (avgLoss === 0) return 100
    
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  private calculateMACD(prices: number[]): { macd: number, signal: number, histogram: number } {
    const ema12 = this.calculateEMA(prices, 12)
    const ema26 = this.calculateEMA(prices, 26)
    const macd = ema12 - ema26
    const signal = this.calculateEMA([macd], 9)
    
    return {
      macd,
      signal,
      histogram: macd - signal
    }
  }

  private calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
    const sma = this.calculateSMA(prices, period)
    const variance = prices.slice(-period).reduce((sum, price) => {
      return sum + Math.pow(price - sma, 2)
    }, 0) / period
    const standardDeviation = Math.sqrt(variance)
    
    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev),
      width: (standardDeviation * stdDev * 2) / sma
    }
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1]
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0)
    return sum / period
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0
    if (prices.length < period) return this.calculateSMA(prices, prices.length)
    
    const multiplier = 2 / (period + 1)
    let ema = this.calculateSMA(prices.slice(0, period), period)
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema
    }
    
    return ema
  }

  private calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
    if (highs.length < period + 1) return 0
    
    const trueRanges = []
    for (let i = 1; i < highs.length; i++) {
      const highLow = highs[i] - lows[i]
      const highClose = Math.abs(highs[i] - closes[i - 1])
      const lowClose = Math.abs(lows[i] - closes[i - 1])
      trueRanges.push(Math.max(highLow, highClose, lowClose))
    }
    
    return this.calculateSMA(trueRanges, period)
  }

  private calculateStochastic(highs: number[], lows: number[], closes: number[], period: number = 14, smoothK: number = 3, smoothD: number = 3) {
    const highestHigh = Math.max(...highs.slice(-period))
    const lowestLow = Math.min(...lows.slice(-period))
    const currentClose = closes[closes.length - 1]
    
    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100
    const d = this.calculateSMA([k], smoothD)
    
    return { k, d }
  }

  private calculateADX(highs: number[], lows: number[], closes: number[], period: number = 14): number {
    if (highs.length < period + 1) return 0
    
    const plusDM = []
    const minusDM = []
    const tr = []
    
    for (let i = 1; i < highs.length; i++) {
      const highDiff = highs[i] - highs[i - 1]
      const lowDiff = lows[i - 1] - lows[i]
      
      plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0)
      minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0)
      
      const highLow = highs[i] - lows[i]
      const highClose = Math.abs(highs[i] - closes[i - 1])
      const lowClose = Math.abs(lows[i] - closes[i - 1])
      tr.push(Math.max(highLow, highClose, lowClose))
    }
    
    const atr = this.calculateSMA(tr, period)
    const plusDI = (this.calculateSMA(plusDM, period) / atr) * 100
    const minusDI = (this.calculateSMA(minusDM, period) / atr) * 100
    
    const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100
    
    return dx
  }

  private calculateMFI(highs: number[], lows: number[], closes: number[], volumes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 50
    
    const typicalPrices = []
    const moneyFlows = []
    
    for (let i = 0; i < closes.length; i++) {
      const tp = (highs[i] + lows[i] + closes[i]) / 3
      typicalPrices.push(tp)
      moneyFlows.push(tp * volumes[i])
    }
    
    let positiveMF = 0
    let negativeMF = 0
    
    for (let i = closes.length - period; i < closes.length; i++) {
      if (typicalPrices[i] > typicalPrices[i - 1]) {
        positiveMF += moneyFlows[i]
      } else {
        negativeMF += moneyFlows[i]
      }
    }
    
    if (negativeMF === 0) return 100
    
    const moneyRatio = positiveMF / negativeMF
    return 100 - (100 / (1 + moneyRatio))
  }
}