// 30+ 기술적 지표 완전 구현 라이브러리

// ==================== 이동평균 지표 ====================

// 1. 단순이동평균 (SMA) - 배열 반환
export const calculateSMA = (data: number[], period: number): number[] => {
  const result = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(data[i]) // 초기값은 현재 가격
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      result.push(sum / period)
    }
  }
  return result
}

// 2. 지수이동평균 (EMA) - 배열 반환
export const calculateEMA = (data: number[], period: number): number[] => {
  if (data.length === 0) return []
  const k = 2 / (period + 1)
  const result = [data[0]]
  
  for (let i = 1; i < data.length; i++) {
    const ema = data[i] * k + result[i - 1] * (1 - k)
    result.push(ema)
  }
  return result
}

// 3. 가중이동평균 (WMA)
export const calculateWMA = (data: number[], period: number): number => {
  if (data.length < period) return 0
  const weights = Array.from({length: period}, (_, i) => i + 1)
  const weightSum = weights.reduce((a, b) => a + b, 0)
  const values = data.slice(-period)
  
  let weightedSum = 0
  for (let i = 0; i < period; i++) {
    weightedSum += values[i] * weights[i]
  }
  
  return weightedSum / weightSum
}

// 4. VWAP (거래량 가중 평균 가격)
export const calculateVWAP = (prices: number[], volumes: number[]): number => {
  if (prices.length === 0 || volumes.length === 0) return 0
  
  let priceVolumeSum = 0
  let volumeSum = 0
  
  for (let i = 0; i < prices.length; i++) {
    priceVolumeSum += prices[i] * volumes[i]
    volumeSum += volumes[i]
  }
  
  return volumeSum > 0 ? priceVolumeSum / volumeSum : 0
}

// ==================== 모멘텀 지표 ====================

// 5. RSI (상대강도지수)
export const calculateRSI = (data: number[], period: number = 14): number => {
  if (data.length < period + 1) return 50
  
  const changes = []
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1])
  }
  
  const gains = changes.map(c => c > 0 ? c : 0)
  const losses = changes.map(c => c < 0 ? Math.abs(c) : 0)
  
  const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period
  
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

// 6. MACD (이동평균수렴확산)
export const calculateMACD = (data: number[]) => {
  const ema12 = calculateEMA(data, 12)
  const ema26 = calculateEMA(data, 26)
  const macdLine = ema12 - ema26
  
  // Signal line은 MACD의 9일 EMA
  const macdHistory = []
  for (let i = 26; i < data.length; i++) {
    const ema12Temp = calculateEMA(data.slice(0, i + 1), 12)
    const ema26Temp = calculateEMA(data.slice(0, i + 1), 26)
    macdHistory.push(ema12Temp - ema26Temp)
  }
  
  const signal = calculateEMA(macdHistory, 9)
  const histogram = macdLine - signal
  
  return { macdLine, signal, histogram }
}

// 7. 스토캐스틱 (Stochastic Oscillator)
export const calculateStochastic = (high: number[], low: number[], close: number[], period: number = 14) => {
  if (high.length < period) return { k: 50, d: 50 }
  
  const highestHigh = Math.max(...high.slice(-period))
  const lowestLow = Math.min(...low.slice(-period))
  const currentClose = close.length > 0 ? close[close.length - 1] : 0
  
  const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100
  
  // %D는 %K의 3일 이동평균
  const kValues = []
  for (let i = period; i <= close.length; i++) {
    const hh = Math.max(...high.slice(i - period, i))
    const ll = Math.min(...low.slice(i - period, i))
    const cc = close[i - 1]
    kValues.push(((cc - ll) / (hh - ll)) * 100)
  }
  
  const d = calculateSMA(kValues.slice(-3), 3)
  
  return { k: isNaN(k) ? 50 : k, d: isNaN(d) ? 50 : d }
}

// 8. CCI (상품채널지수)
export const calculateCCI = (high: number[], low: number[], close: number[], period: number = 20): number => {
  if (high.length < period) return 0
  
  const typicalPrices = []
  for (let i = 0; i < high.length; i++) {
    typicalPrices.push((high[i] + low[i] + close[i]) / 3)
  }
  
  const sma = calculateSMA(typicalPrices, period)
  const meanDeviation = typicalPrices.slice(-period).reduce((sum, price) => {
    return sum + Math.abs(price - sma)
  }, 0) / period
  
  const currentTP = typicalPrices[typicalPrices.length - 1]
  return meanDeviation === 0 ? 0 : (currentTP - sma) / (0.015 * meanDeviation)
}

// 9. Williams %R
export const calculateWilliamsR = (high: number[], low: number[], close: number[], period: number = 14): number => {
  if (high.length < period) return -50
  
  const highestHigh = Math.max(...high.slice(-period))
  const lowestLow = Math.min(...low.slice(-period))
  const currentClose = close.length > 0 ? close[close.length - 1] : 0
  
  return ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100
}

// 10. ROC (변화율)
export const calculateROC = (data: number[], period: number = 12): number => {
  if (data.length < period + 1) return 0
  
  const current = data[data.length - 1]
  const previous = data[data.length - period - 1]
  
  return ((current - previous) / previous) * 100
}

// ==================== 변동성 지표 ====================

// 11. 볼린저 밴드 (Bollinger Bands)
export const calculateBollingerBands = (data: number[], period: number = 20, stdDev: number = 2) => {
  const sma = calculateSMA(data, period)
  const values = data.slice(-period)
  
  const squaredDiffs = values.map(value => Math.pow(value - sma, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period
  const standardDeviation = Math.sqrt(variance)
  
  return {
    upper: sma + (standardDeviation * stdDev),
    middle: sma,
    lower: sma - (standardDeviation * stdDev),
    bandwidth: (standardDeviation * stdDev * 2) / sma * 100
  }
}

// 12. ATR (평균 진정 범위)
export const calculateATR = (high: number[], low: number[], close: number[], period: number = 14): number => {
  if (high.length < period + 1) return 0
  
  const trueRanges = []
  for (let i = 1; i < high.length; i++) {
    const highLow = high[i] - low[i]
    const highClose = Math.abs(high[i] - close[i - 1])
    const lowClose = Math.abs(low[i] - close[i - 1])
    trueRanges.push(Math.max(highLow, highClose, lowClose))
  }
  
  return calculateSMA(trueRanges.slice(-period), period)
}

// 13. 켈트너 채널 (Keltner Channels)
export const calculateKeltnerChannels = (high: number[], low: number[], close: number[], period: number = 20, multiplier: number = 2) => {
  const ema = calculateEMA(close, period)
  const atr = calculateATR(high, low, close, period)
  
  return {
    upper: ema + (atr * multiplier),
    middle: ema,
    lower: ema - (atr * multiplier)
  }
}

// 14. 돈치안 채널 (Donchian Channels)
export const calculateDonchianChannels = (high: number[], low: number[], period: number = 20) => {
  if (high.length < period) return { upper: 0, middle: 0, lower: 0 }
  
  const upper = Math.max(...high.slice(-period))
  const lower = Math.min(...low.slice(-period))
  const middle = (upper + lower) / 2
  
  return { upper, middle, lower }
}

// ==================== 거래량 지표 ====================

// 15. OBV (누적거래량)
export const calculateOBV = (close: number[], volume: number[]): number => {
  if (close.length < 2) return 0
  
  let obv = 0
  for (let i = 1; i < close.length; i++) {
    if (close[i] > close[i - 1]) {
      obv += volume[i]
    } else if (close[i] < close[i - 1]) {
      obv -= volume[i]
    }
  }
  
  return obv
}

// 16. CMF (차이킨 머니 플로우)
export const calculateCMF = (high: number[], low: number[], close: number[], volume: number[], period: number = 20): number => {
  if (high.length < period) return 0
  
  let mfvSum = 0
  let volumeSum = 0
  
  for (let i = high.length - period; i < high.length; i++) {
    const mfMultiplier = ((close[i] - low[i]) - (high[i] - close[i])) / (high[i] - low[i])
    const mfVolume = mfMultiplier * volume[i]
    mfvSum += mfVolume
    volumeSum += volume[i]
  }
  
  return volumeSum === 0 ? 0 : mfvSum / volumeSum
}

// 17. MFI (자금흐름지수)
export const calculateMFI = (high: number[], low: number[], close: number[], volume: number[], period: number = 14): number => {
  if (high.length < period + 1) return 50
  
  const typicalPrices = []
  const moneyFlows = []
  
  for (let i = 0; i < high.length; i++) {
    const tp = (high[i] + low[i] + close[i]) / 3
    typicalPrices.push(tp)
    moneyFlows.push(tp * volume[i])
  }
  
  let positiveMF = 0
  let negativeMF = 0
  
  for (let i = high.length - period; i < high.length; i++) {
    if (typicalPrices[i] > typicalPrices[i - 1]) {
      positiveMF += moneyFlows[i]
    } else {
      negativeMF += moneyFlows[i]
    }
  }
  
  const moneyRatio = positiveMF / negativeMF
  return 100 - (100 / (1 + moneyRatio))
}

// 18. A/D Line (누적/분산선)
export const calculateADLine = (high: number[], low: number[], close: number[], volume: number[]): number => {
  let adLine = 0
  
  for (let i = 0; i < high.length; i++) {
    const mfMultiplier = ((close[i] - low[i]) - (high[i] - close[i])) / (high[i] - low[i])
    const mfVolume = mfMultiplier * volume[i]
    adLine += mfVolume
  }
  
  return adLine
}

// ==================== 트렌드 지표 ====================

// 19. ADX (평균방향지수)
export const calculateADX = (high: number[], low: number[], close: number[], period: number = 14): number => {
  if (high.length < period * 2) return 0
  
  const plusDM = []
  const minusDM = []
  const tr = []
  
  for (let i = 1; i < high.length; i++) {
    const highDiff = high[i] - high[i - 1]
    const lowDiff = low[i - 1] - low[i]
    
    plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0)
    minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0)
    
    const highLow = high[i] - low[i]
    const highClose = Math.abs(high[i] - close[i - 1])
    const lowClose = Math.abs(low[i] - close[i - 1])
    tr.push(Math.max(highLow, highClose, lowClose))
  }
  
  const atr = calculateSMA(tr.slice(-period), period)
  const plusDI = (calculateSMA(plusDM.slice(-period), period) / atr) * 100
  const minusDI = (calculateSMA(minusDM.slice(-period), period) / atr) * 100
  
  const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100
  
  return dx
}

// 20. Parabolic SAR
export const calculateParabolicSAR = (high: number[], low: number[], af: number = 0.02, maxAf: number = 0.2): number => {
  if (high.length < 2) return 0
  
  let isUpTrend = true
  let sar = low[0]
  let ep = high[0]
  let currentAf = af
  
  for (let i = 1; i < high.length; i++) {
    if (isUpTrend) {
      sar = sar + currentAf * (ep - sar)
      
      if (high[i] > ep) {
        ep = high[i]
        currentAf = Math.min(currentAf + af, maxAf)
      }
      
      if (sar > low[i]) {
        isUpTrend = false
        sar = ep
        ep = low[i]
        currentAf = af
      }
    } else {
      sar = sar + currentAf * (ep - sar)
      
      if (low[i] < ep) {
        ep = low[i]
        currentAf = Math.min(currentAf + af, maxAf)
      }
      
      if (sar < high[i]) {
        isUpTrend = true
        sar = ep
        ep = high[i]
        currentAf = af
      }
    }
  }
  
  return sar
}

// 21. Ichimoku Cloud
export const calculateIchimoku = (high: number[], low: number[], close: number[]) => {
  // 배열이 비어있거나 undefined인 경우 기본값 반환
  if (!high || !low || !close || high.length === 0 || low.length === 0 || close.length === 0) {
    return { tenkan: 0, kijun: 0, senkouA: 0, senkouB: 0, chikou: 0 }
  }
  
  const calculateMidpoint = (highs: number[], lows: number[], period: number) => {
    if (highs.length < period) return 0
    const periodHigh = Math.max(...highs.slice(-period))
    const periodLow = Math.min(...lows.slice(-period))
    return (periodHigh + periodLow) / 2
  }
  
  const tenkan = calculateMidpoint(high, low, 9)    // 전환선
  const kijun = calculateMidpoint(high, low, 26)    // 기준선
  const senkouA = (tenkan + kijun) / 2              // 선행스팬 A
  const senkouB = calculateMidpoint(high, low, 52)  // 선행스팬 B
  const chikou = close.length > 0 ? close[close.length - 1] : 0  // 후행스팬
  
  return { tenkan, kijun, senkouA, senkouB, chikou }
}

// 22. SuperTrend
export const calculateSuperTrend = (high: number[], low: number[], close: number[], period: number = 10, multiplier: number = 3): number => {
  const atr = calculateATR(high, low, close, period)
  const hl2 = high.length > 0 && low.length > 0 ? (high[high.length - 1] + low[low.length - 1]) / 2 : 0
  
  const upperBand = hl2 + (multiplier * atr)
  const lowerBand = hl2 - (multiplier * atr)
  
  const currentClose = close.length > 0 ? close[close.length - 1] : 0
  
  // 단순화된 SuperTrend 로직
  if (currentClose <= upperBand) {
    return lowerBand
  } else {
    return upperBand
  }
}

// ==================== 피보나치 지표 ====================

// 23. 피보나치 되돌림 (Fibonacci Retracement)
export const calculateFibonacciLevels = (high: number[], low: number[]) => {
  const maxHigh = Math.max(...high)
  const minLow = Math.min(...low)
  const diff = maxHigh - minLow
  
  return {
    level_0: minLow,
    level_236: minLow + (diff * 0.236),
    level_382: minLow + (diff * 0.382),
    level_500: minLow + (diff * 0.500),
    level_618: minLow + (diff * 0.618),
    level_786: minLow + (diff * 0.786),
    level_1000: maxHigh
  }
}

// ==================== 기타 지표 ====================

// 24. Pivot Points
export const calculatePivotPoints = (high: number, low: number, close: number) => {
  const pivot = (high + low + close) / 3
  const r1 = (2 * pivot) - low
  const r2 = pivot + (high - low)
  const r3 = high + 2 * (pivot - low)
  const s1 = (2 * pivot) - high
  const s2 = pivot - (high - low)
  const s3 = low - 2 * (high - pivot)
  
  return { pivot, r1, r2, r3, s1, s2, s3 }
}

// 25. VWMA (거래량 가중 이동평균)
export const calculateVWMA = (close: number[], volume: number[], period: number): number => {
  if (close.length < period) return 0
  
  let priceVolumeSum = 0
  let volumeSum = 0
  
  for (let i = close.length - period; i < close.length; i++) {
    priceVolumeSum += close[i] * volume[i]
    volumeSum += volume[i]
  }
  
  return volumeSum > 0 ? priceVolumeSum / volumeSum : 0
}

// 26. HMA (Hull Moving Average)
export const calculateHMA = (data: number[], period: number): number => {
  const halfPeriod = Math.floor(period / 2)
  const sqrtPeriod = Math.floor(Math.sqrt(period))
  
  const wma1 = calculateWMA(data, halfPeriod)
  const wma2 = calculateWMA(data, period)
  
  const hmaRaw = 2 * wma1 - wma2
  
  // 단순화된 HMA 계산
  return hmaRaw
}

// 27. TRIX
export const calculateTRIX = (data: number[], period: number = 14): number => {
  const ema1 = calculateEMA(data, period)
  const ema2 = calculateEMA([ema1], period)
  const ema3 = calculateEMA([ema2], period)
  
  // Rate of change of triple smoothed EMA
  return ema3 > 0 ? ((ema3 - ema2) / ema3) * 10000 : 0
}

// 28. Choppiness Index
export const calculateChoppiness = (high: number[], low: number[], close: number[], period: number = 14): number => {
  if (high.length < period) return 50
  
  const atr = calculateATR(high, low, close, period)
  const highestHigh = Math.max(...high.slice(-period))
  const lowestLow = Math.min(...low.slice(-period))
  const range = highestHigh - lowestLow
  
  const sumTR = atr * period
  const choppiness = 100 * Math.log10(sumTR / range) / Math.log10(period)
  
  return choppiness
}

// 29. Ultimate Oscillator
export const calculateUltimateOscillator = (high: number[], low: number[], close: number[]): number => {
  if (high.length < 28) return 50
  
  const bp = []  // Buying Pressure
  const tr = []  // True Range
  
  for (let i = 1; i < high.length; i++) {
    const buyingPressure = close[i] - Math.min(low[i], close[i - 1])
    bp.push(buyingPressure)
    
    const highLow = high[i] - low[i]
    const highClose = Math.abs(high[i] - close[i - 1])
    const lowClose = Math.abs(low[i] - close[i - 1])
    tr.push(Math.max(highLow, highClose, lowClose))
  }
  
  const avg7 = calculateSMA(bp.slice(-7), 7) / calculateSMA(tr.slice(-7), 7)
  const avg14 = calculateSMA(bp.slice(-14), 14) / calculateSMA(tr.slice(-14), 14)
  const avg28 = calculateSMA(bp.slice(-28), 28) / calculateSMA(tr.slice(-28), 28)
  
  return 100 * ((avg7 * 4) + (avg14 * 2) + avg28) / 7
}

// 30. Aroon Indicator
export const calculateAroon = (high: number[], low: number[], period: number = 25): { up: number, down: number } => {
  if (high.length < period) return { up: 50, down: 50 }
  
  const recentHighs = high.slice(-period)
  const recentLows = low.slice(-period)
  
  const highestIndex = recentHighs.indexOf(Math.max(...recentHighs))
  const lowestIndex = recentLows.indexOf(Math.min(...recentLows))
  
  const aroonUp = ((period - (period - 1 - highestIndex)) / period) * 100
  const aroonDown = ((period - (period - 1 - lowestIndex)) / period) * 100
  
  return { up: aroonUp, down: aroonDown }
}

// 31. DMI (Directional Movement Index)
export const calculateDMI = (high: number[], low: number[], close: number[], period: number = 14) => {
  if (high.length < period + 1) return { plusDI: 0, minusDI: 0, adx: 0 }
  
  const plusDM = []
  const minusDM = []
  const tr = []
  
  for (let i = 1; i < high.length; i++) {
    const highDiff = high[i] - high[i - 1]
    const lowDiff = low[i - 1] - low[i]
    
    plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0)
    minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0)
    
    const highLow = high[i] - low[i]
    const highClose = Math.abs(high[i] - close[i - 1])
    const lowClose = Math.abs(low[i] - close[i - 1])
    tr.push(Math.max(highLow, highClose, lowClose))
  }
  
  const atr = calculateSMA(tr.slice(-period), period)
  const plusDI = (calculateSMA(plusDM.slice(-period), period) / atr) * 100
  const minusDI = (calculateSMA(minusDM.slice(-period), period) / atr) * 100
  
  const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100
  const adx = calculateSMA([dx], period)
  
  return { plusDI, minusDI, adx }
}

// 32. Standard Deviation
export const calculateStandardDeviation = (data: number[], period: number = 20): number => {
  if (data.length < period) return 0
  
  const values = data.slice(-period)
  const mean = calculateSMA(values, period)
  
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period
  
  return Math.sqrt(variance)
}

// ==================== 지표 해석 및 시그널 생성 ====================

export interface IndicatorSignal {
  indicator: string
  value: number
  signal: 'BUY' | 'SELL' | 'NEUTRAL'
  strength: number  // 0-100
  interpretation: string
  strategy: string
}

export const interpretRSI = (rsi: number): IndicatorSignal => {
  let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL'
  let strength = 50
  let interpretation = ''
  let strategy = ''
  
  if (rsi > 70) {
    signal = 'SELL'
    strength = Math.min(100, (rsi - 70) * 3.33)
    interpretation = `RSI ${rsi.toFixed(1)}로 과매수 구간입니다. 하락 전환 가능성이 높습니다.`
    strategy = '분할 매도를 시작하거나 숏 포지션 진입을 고려하세요. 손절선: RSI 80 이상'
  } else if (rsi < 30) {
    signal = 'BUY'
    strength = Math.min(100, (30 - rsi) * 3.33)
    interpretation = `RSI ${rsi.toFixed(1)}로 과매도 구간입니다. 반등 가능성이 높습니다.`
    strategy = '분할 매수를 시작하거나 롱 포지션 진입을 고려하세요. 손절선: RSI 20 이하'
  } else if (rsi > 50 && rsi < 60) {
    signal = 'BUY'
    strength = 60
    interpretation = `RSI ${rsi.toFixed(1)}로 상승 모멘텀이 형성되고 있습니다.`
    strategy = '추세 추종 매수 전략을 사용하세요. 목표가: RSI 70'
  } else if (rsi > 40 && rsi < 50) {
    signal = 'SELL'
    strength = 40
    interpretation = `RSI ${rsi.toFixed(1)}로 하락 압력이 있습니다.`
    strategy = '보수적 접근이 필요합니다. 지지선 확인 후 진입하세요.'
  } else {
    interpretation = `RSI ${rsi.toFixed(1)}로 중립 구간입니다.`
    strategy = '방향성이 확정될 때까지 관망하세요.'
  }
  
  return { indicator: 'RSI', value: rsi, signal, strength, interpretation, strategy }
}

export const interpretMACD = (macd: { macdLine: number, signal: number, histogram: number }): IndicatorSignal => {
  let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL'
  let strength = 50
  let interpretation = ''
  let strategy = ''
  
  if (macd.histogram > 0 && macd.macdLine > macd.signal) {
    signal = 'BUY'
    strength = Math.min(100, 50 + Math.abs(macd.histogram) * 10)
    interpretation = `MACD가 시그널선을 상향 돌파했습니다. 상승 모멘텀이 강합니다.`
    strategy = '롱 포지션 진입 적기입니다. 히스토그램이 감소하기 시작하면 익절하세요.'
  } else if (macd.histogram < 0 && macd.macdLine < macd.signal) {
    signal = 'SELL'
    strength = Math.min(100, 50 + Math.abs(macd.histogram) * 10)
    interpretation = `MACD가 시그널선을 하향 돌파했습니다. 하락 모멘텀이 강합니다.`
    strategy = '숏 포지션 진입을 고려하세요. 히스토그램이 증가하기 시작하면 익절하세요.'
  } else if (macd.histogram > 0 && macd.histogram < 0.5) {
    signal = 'NEUTRAL'
    strength = 40
    interpretation = `MACD 히스토그램이 약화되고 있습니다. 추세 전환 가능성이 있습니다.`
    strategy = '포지션을 줄이고 추세 전환을 대비하세요.'
  } else {
    interpretation = `MACD가 중립 상태입니다.`
    strategy = '명확한 시그널을 기다리세요.'
  }
  
  return { indicator: 'MACD', value: macd.histogram, signal, strength, interpretation, strategy }
}

export const interpretBollingerBands = (price: number, bands: { upper: number, middle: number, lower: number, bandwidth: number }): IndicatorSignal => {
  let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL'
  let strength = 50
  let interpretation = ''
  let strategy = ''
  
  const position = (price - bands.lower) / (bands.upper - bands.lower)
  
  if (price > bands.upper) {
    signal = 'SELL'
    strength = Math.min(100, 70 + (price - bands.upper) / bands.upper * 100)
    interpretation = `가격이 상단 밴드를 돌파했습니다. 과매수 상태입니다.`
    strategy = '매도 포지션을 고려하세요. 중간선까지 하락 가능성이 높습니다.'
  } else if (price < bands.lower) {
    signal = 'BUY'
    strength = Math.min(100, 70 + (bands.lower - price) / bands.lower * 100)
    interpretation = `가격이 하단 밴드를 돌파했습니다. 과매도 상태입니다.`
    strategy = '매수 포지션을 고려하세요. 중간선까지 반등 가능성이 높습니다.'
  } else if (bands.bandwidth < 5) {
    signal = 'NEUTRAL'
    strength = 30
    interpretation = `밴드폭이 좁아졌습니다. 변동성 확대가 임박했습니다.`
    strategy = '브레이크아웃을 대비하세요. 양방향 주문을 설정하세요.'
  } else if (position > 0.8) {
    signal = 'SELL'
    strength = 60
    interpretation = `가격이 상단 밴드 근처입니다. 저항을 받을 가능성이 높습니다.`
    strategy = '일부 익절을 고려하세요.'
  } else if (position < 0.2) {
    signal = 'BUY'
    strength = 60
    interpretation = `가격이 하단 밴드 근처입니다. 지지를 받을 가능성이 높습니다.`
    strategy = '분할 매수를 고려하세요.'
  } else {
    interpretation = `가격이 밴드 중간 영역에 있습니다.`
    strategy = '추세를 확인하고 따라가세요.'
  }
  
  return { indicator: 'Bollinger Bands', value: position * 100, signal, strength, interpretation, strategy }
}

// 종합 시그널 생성 함수
export const generateComprehensiveSignals = (
  price: number,
  high: number[],
  low: number[],
  close: number[],
  volume: number[]
): IndicatorSignal[] => {
  const signals: IndicatorSignal[] = []
  
  // RSI 시그널
  const rsi = calculateRSI(close)
  signals.push(interpretRSI(rsi))
  
  // MACD 시그널
  const macd = calculateMACD(close)
  signals.push(interpretMACD(macd))
  
  // 볼린저 밴드 시그널
  const bb = calculateBollingerBands(close)
  signals.push(interpretBollingerBands(price, bb))
  
  // 스토캐스틱 시그널
  const stoch = calculateStochastic(high, low, close)
  const stochSignal: IndicatorSignal = {
    indicator: 'Stochastic',
    value: stoch.k,
    signal: stoch.k > 80 ? 'SELL' : stoch.k < 20 ? 'BUY' : 'NEUTRAL',
    strength: stoch.k > 80 || stoch.k < 20 ? 70 : 30,
    interpretation: stoch.k > 80 ? '과매수 구간' : stoch.k < 20 ? '과매도 구간' : '중립 구간',
    strategy: stoch.k > 80 ? '매도 준비' : stoch.k < 20 ? '매수 준비' : '관망'
  }
  signals.push(stochSignal)
  
  // CCI 시그널
  const cci = calculateCCI(high, low, close)
  const cciSignal: IndicatorSignal = {
    indicator: 'CCI',
    value: cci,
    signal: cci > 100 ? 'SELL' : cci < -100 ? 'BUY' : 'NEUTRAL',
    strength: Math.abs(cci) > 100 ? 65 : 35,
    interpretation: cci > 100 ? '과매수' : cci < -100 ? '과매도' : '정상 범위',
    strategy: cci > 100 ? '숏 포지션' : cci < -100 ? '롱 포지션' : '추세 추종'
  }
  signals.push(cciSignal)
  
  return signals
}

// 백테스팅 결과 계산
export interface BacktestResult {
  totalTrades: number
  winRate: number
  avgProfit: number
  maxDrawdown: number
  sharpeRatio: number
  profitFactor: number
}

export const calculateBacktest = (
  prices: number[],
  signals: Array<{ type: 'BUY' | 'SELL', price: number, time: number }>
): BacktestResult => {
  let trades = 0
  let wins = 0
  let totalProfit = 0
  let maxDrawdown = 0
  let currentDrawdown = 0
  let profits: number[] = []
  
  for (let i = 0; i < signals.length - 1; i++) {
    if (signals[i].type === 'BUY' && signals[i + 1].type === 'SELL') {
      trades++
      const profit = (signals[i + 1].price - signals[i].price) / signals[i].price
      profits.push(profit)
      totalProfit += profit
      
      if (profit > 0) wins++
      
      currentDrawdown = Math.min(0, currentDrawdown + profit)
      maxDrawdown = Math.min(maxDrawdown, currentDrawdown)
    }
  }
  
  const avgProfit = trades > 0 ? totalProfit / trades : 0
  const winRate = trades > 0 ? (wins / trades) * 100 : 0
  
  // Sharpe Ratio 계산 (연간화)
  const avgReturn = avgProfit * 252  // 일일 수익률을 연간화
  const stdDev = calculateStandardDeviation(profits, profits.length)
  const sharpeRatio = stdDev > 0 ? avgReturn / (stdDev * Math.sqrt(252)) : 0
  
  // Profit Factor 계산
  const gains = profits.filter(p => p > 0).reduce((a, b) => a + b, 0)
  const losses = Math.abs(profits.filter(p => p < 0).reduce((a, b) => a + b, 0))
  const profitFactor = losses > 0 ? gains / losses : gains > 0 ? 999 : 0
  
  return {
    totalTrades: trades,
    winRate,
    avgProfit: avgProfit * 100,
    maxDrawdown: maxDrawdown * 100,
    sharpeRatio,
    profitFactor
  }
}