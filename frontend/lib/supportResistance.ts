// 지지/저항 레벨 계산 라이브러리
// 모든 계산은 실제 데이터 기반, 하드코딩 없음

// ==================== 타입 정의 ====================
export interface Candle {
  time: string | Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface SupportResistanceLevel {
  price: number
  type: 'support' | 'resistance' | 'both'
  strength: number  // 0-100
  touches: number
  volumeConfirmation: number
  lastTested: Date | null
  breakoutProbability: number
  description: string
}

export interface VolumeProfile {
  price: number
  volume: number
  type: 'HVN' | 'LVN' | 'POC' | 'VAH' | 'VAL'
  percentOfTotal: number
}

export interface FibonacciLevel {
  level: number
  price: number
  label: string
  isStrong: boolean
}

// ==================== 메인 S/R 계산 ====================

// 동적 지지/저항 레벨 탐지
export const detectSupportResistanceLevels = (
  candles: Candle[],
  minTouches: number = 2,
  tolerance: number = 0.02
): SupportResistanceLevel[] => {
  if (candles.length < 10) return [] // 최소 10개만 있어도 계산 가능
  
  const levels: SupportResistanceLevel[] = []
  const pricePoints: Map<number, number> = new Map()
  
  // 1. 스윙 하이/로우 찾기
  const swingHighsLows = findSwingPoints(candles)
  
  // 2. 가격대별 터치 횟수 계산
  swingHighsLows.forEach(point => {
    const roundedPrice = Math.round(point.price / (point.price * tolerance)) * (point.price * tolerance)
    pricePoints.set(roundedPrice, (pricePoints.get(roundedPrice) || 0) + 1)
  })
  
  // 3. 볼륨 가중치 적용
  const volumeWeightedLevels = applyVolumeWeight(candles, Array.from(pricePoints.keys()))
  
  // 4. 레벨 생성 및 강도 계산
  volumeWeightedLevels.forEach(({ price, volumeWeight }) => {
    const touches = pricePoints.get(price) || 0
    if (touches >= minTouches) {
      const strength = calculateLevelStrength(price, touches, volumeWeight, candles)
      const type = determineLevelType(price, candles[candles.length - 1].close)
      const lastTested = findLastTestedDate(price, candles, tolerance)
      const breakoutProb = calculateBreakoutProbability(price, candles, strength)
      
      levels.push({
        price,
        type,
        strength,
        touches,
        volumeConfirmation: volumeWeight,
        lastTested,
        breakoutProbability: breakoutProb,
        description: generateLevelDescription(price, type, strength, touches)
      })
    }
  })
  
  // 5. 강도순으로 정렬하고 상위 레벨만 반환
  return levels
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 10)
}

// 스윙 포인트 찾기
const findSwingPoints = (candles: Candle[]): Array<{ price: number; type: 'high' | 'low'; index: number }> => {
  const points: Array<{ price: number; type: 'high' | 'low'; index: number }> = []
  const lookback = Math.min(5, Math.floor(candles.length / 4)) // 데이터가 적을 때도 작동
  
  for (let i = lookback; i < candles.length - lookback; i++) {
    const current = candles[i]
    let isSwingHigh = true
    let isSwingLow = true
    
    // 스윙 하이 체크
    for (let j = 1; j <= lookback; j++) {
      if (candles[i - j].high >= current.high || candles[i + j].high >= current.high) {
        isSwingHigh = false
        break
      }
    }
    
    // 스윙 로우 체크
    for (let j = 1; j <= lookback; j++) {
      if (candles[i - j].low <= current.low || candles[i + j].low <= current.low) {
        isSwingLow = false
        break
      }
    }
    
    if (isSwingHigh) {
      points.push({ price: current.high, type: 'high', index: i })
    }
    if (isSwingLow) {
      points.push({ price: current.low, type: 'low', index: i })
    }
  }
  
  return points
}

// 볼륨 가중치 적용
const applyVolumeWeight = (
  candles: Candle[],
  priceLevels: number[]
): Array<{ price: number; volumeWeight: number }> => {
  return priceLevels.map(price => {
    let totalVolume = 0
    let touchCount = 0
    
    candles.forEach(candle => {
      const tolerance = price * 0.01 // 1% 허용 범위
      if (
        (candle.high >= price - tolerance && candle.high <= price + tolerance) ||
        (candle.low >= price - tolerance && candle.low <= price + tolerance) ||
        (candle.open >= price - tolerance && candle.open <= price + tolerance) ||
        (candle.close >= price - tolerance && candle.close <= price + tolerance)
      ) {
        totalVolume += candle.volume
        touchCount++
      }
    })
    
    const avgVolume = touchCount > 0 ? totalVolume / touchCount : 0
    const overallAvgVolume = candles.reduce((sum, c) => sum + c.volume, 0) / candles.length
    const volumeWeight = overallAvgVolume > 0 ? (avgVolume / overallAvgVolume) * 100 : 0
    
    return { price, volumeWeight: Math.min(100, volumeWeight) }
  })
}

// 레벨 강도 계산
const calculateLevelStrength = (
  price: number,
  touches: number,
  volumeWeight: number,
  candles: Candle[]
): number => {
  // 다양한 요소를 고려한 강도 계산
  const touchScore = Math.min(touches * 10, 40) // 최대 40점
  const volumeScore = volumeWeight * 0.3 // 최대 30점
  const recentScore = calculateRecentScore(price, candles) // 최대 20점
  const bounceScore = calculateBounceScore(price, candles) // 최대 10점
  
  return Math.min(100, touchScore + volumeScore + recentScore + bounceScore)
}

// 최근 터치 점수 계산
const calculateRecentScore = (price: number, candles: Candle[]): number => {
  const recentCandles = candles.slice(-50) // 최근 50개 캔들
  let recentTouches = 0
  const tolerance = price * 0.01
  
  recentCandles.forEach(candle => {
    if (
      Math.abs(candle.high - price) <= tolerance ||
      Math.abs(candle.low - price) <= tolerance
    ) {
      recentTouches++
    }
  })
  
  return Math.min(20, recentTouches * 4)
}

// 바운스 점수 계산
const calculateBounceScore = (price: number, candles: Candle[]): number => {
  let bounces = 0
  const tolerance = price * 0.01
  
  for (let i = 1; i < candles.length - 1; i++) {
    const prev = candles[i - 1]
    const curr = candles[i]
    const next = candles[i + 1]
    
    // 지지선에서 바운스
    if (
      Math.abs(curr.low - price) <= tolerance &&
      prev.close > curr.low &&
      next.close > curr.low
    ) {
      bounces++
    }
    
    // 저항선에서 바운스
    if (
      Math.abs(curr.high - price) <= tolerance &&
      prev.close < curr.high &&
      next.close < curr.high
    ) {
      bounces++
    }
  }
  
  return Math.min(10, bounces * 2)
}

// 레벨 타입 결정
const determineLevelType = (
  levelPrice: number,
  currentPrice: number
): 'support' | 'resistance' | 'both' => {
  const diff = (levelPrice - currentPrice) / currentPrice
  if (Math.abs(diff) < 0.005) return 'both'
  return levelPrice > currentPrice ? 'resistance' : 'support'
}

// 마지막 테스트 날짜 찾기
const findLastTestedDate = (
  price: number,
  candles: Candle[],
  tolerance: number
): Date | null => {
  for (let i = candles.length - 1; i >= 0; i--) {
    const candle = candles[i]
    const range = price * tolerance
    
    if (
      (candle.high >= price - range && candle.high <= price + range) ||
      (candle.low >= price - range && candle.low <= price + range)
    ) {
      return new Date(candle.time)
    }
  }
  return null
}

// 브레이크아웃 확률 계산
const calculateBreakoutProbability = (
  price: number,
  candles: Candle[],
  strength: number
): number => {
  const currentPrice = candles[candles.length - 1].close
  const distance = Math.abs(price - currentPrice) / currentPrice
  const momentum = calculateMomentum(candles)
  const volumeTrend = calculateVolumeTrend(candles)
  
  // 거리가 가까울수록, 모멘텀이 강할수록, 볼륨이 증가할수록 확률 증가
  let probability = 50 // 기본 확률
  
  // 거리 요소 (가까울수록 높음)
  if (distance < 0.01) probability += 20
  else if (distance < 0.02) probability += 10
  else if (distance < 0.05) probability += 5
  
  // 모멘텀 요소
  probability += momentum * 0.2
  
  // 볼륨 트렌드 요소
  probability += volumeTrend * 0.1
  
  // 강도가 낮을수록 돌파 확률 증가
  probability += (100 - strength) * 0.2
  
  return Math.min(100, Math.max(0, probability))
}

// 모멘텀 계산
const calculateMomentum = (candles: Candle[]): number => {
  if (candles.length < 10) return 0
  
  const recent = candles.slice(-10)
  const changes = recent.map((c, i) => 
    i > 0 ? (c.close - recent[i - 1].close) / recent[i - 1].close : 0
  )
  
  const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length
  return avgChange * 1000 // 퍼센트로 변환
}

// 볼륨 트렌드 계산
const calculateVolumeTrend = (candles: Candle[]): number => {
  if (candles.length < 20) return 0
  
  const recent = candles.slice(-10)
  const older = candles.slice(-20, -10)
  
  const recentAvg = recent.reduce((sum, c) => sum + c.volume, 0) / recent.length
  const olderAvg = older.reduce((sum, c) => sum + c.volume, 0) / older.length
  
  if (olderAvg === 0) return 0
  return ((recentAvg - olderAvg) / olderAvg) * 100
}

// 레벨 설명 생성
const generateLevelDescription = (
  price: number,
  type: 'support' | 'resistance' | 'both',
  strength: number,
  touches: number
): string => {
  let desc = ''
  
  if (strength >= 80) desc = '매우 강력한 '
  else if (strength >= 60) desc = '강한 '
  else if (strength >= 40) desc = '중간 '
  else desc = '약한 '
  
  desc += type === 'both' ? '지지/저항' : (type === 'support' ? '지지' : '저항')
  desc += ` 레벨 (${touches}회 터치)`
  
  return desc
}

// ==================== 볼륨 프로파일 ====================

export const calculateVolumeProfile = (
  candles: Candle[],
  bins: number = 50
): VolumeProfile[] => {
  if (candles.length === 0) return []
  
  // 가격 범위 계산
  const minPrice = Math.min(...candles.map(c => c.low))
  const maxPrice = Math.max(...candles.map(c => c.high))
  const priceRange = maxPrice - minPrice
  const binSize = priceRange / bins
  
  // 각 빈별 볼륨 집계
  const volumeByBin: Map<number, number> = new Map()
  
  candles.forEach(candle => {
    const binIndex = Math.floor((candle.close - minPrice) / binSize)
    const binPrice = minPrice + (binIndex * binSize) + (binSize / 2)
    volumeByBin.set(binPrice, (volumeByBin.get(binPrice) || 0) + candle.volume)
  })
  
  // 총 볼륨 계산
  const totalVolume = Array.from(volumeByBin.values()).reduce((sum, v) => sum + v, 0)
  
  // POC (Point of Control) 찾기
  let maxVolume = 0
  let pocPrice = 0
  volumeByBin.forEach((volume, price) => {
    if (volume > maxVolume) {
      maxVolume = volume
      pocPrice = price
    }
  })
  
  // Value Area 계산 (70% 볼륨)
  const sortedBins = Array.from(volumeByBin.entries()).sort((a, b) => b[1] - a[1])
  let accumulatedVolume = 0
  const valueAreaBins: number[] = []
  
  for (const [price, volume] of sortedBins) {
    accumulatedVolume += volume
    valueAreaBins.push(price)
    if (accumulatedVolume >= totalVolume * 0.7) break
  }
  
  const vahPrice = Math.max(...valueAreaBins)
  const valPrice = Math.min(...valueAreaBins)
  
  // 프로파일 생성
  const profile: VolumeProfile[] = []
  
  volumeByBin.forEach((volume, price) => {
    let type: 'HVN' | 'LVN' | 'POC' | 'VAH' | 'VAL'
    
    if (price === pocPrice) type = 'POC'
    else if (Math.abs(price - vahPrice) < binSize) type = 'VAH'
    else if (Math.abs(price - valPrice) < binSize) type = 'VAL'
    else if (volume > totalVolume / bins * 1.5) type = 'HVN'
    else type = 'LVN'
    
    profile.push({
      price,
      volume,
      type,
      percentOfTotal: (volume / totalVolume) * 100
    })
  })
  
  return profile.sort((a, b) => a.price - b.price)
}

// ==================== 피보나치 레벨 ====================

export const calculateFibonacciLevels = (
  high: number,
  low: number,
  isUptrend: boolean = true
): FibonacciLevel[] => {
  const range = high - low
  const levels = [
    { ratio: 0, label: '0%', isStrong: true },
    { ratio: 0.236, label: '23.6%', isStrong: false },
    { ratio: 0.382, label: '38.2%', isStrong: true },
    { ratio: 0.5, label: '50%', isStrong: true },
    { ratio: 0.618, label: '61.8%', isStrong: true },
    { ratio: 0.786, label: '78.6%', isStrong: false },
    { ratio: 1, label: '100%', isStrong: true },
    { ratio: 1.272, label: '127.2%', isStrong: false },
    { ratio: 1.618, label: '161.8%', isStrong: true },
    { ratio: 2.618, label: '261.8%', isStrong: false }
  ]
  
  return levels.map(({ ratio, label, isStrong }) => ({
    level: ratio,
    price: isUptrend ? low + (range * ratio) : high - (range * ratio),
    label,
    isStrong
  }))
}

// ==================== 피벗 포인트 ====================

export const calculatePivotPoints = (candle: Candle) => {
  const pivot = (candle.high + candle.low + candle.close) / 3
  const range = candle.high - candle.low
  
  return {
    pivot,
    r1: (2 * pivot) - candle.low,
    r2: pivot + range,
    r3: pivot + (2 * range),
    s1: (2 * pivot) - candle.high,
    s2: pivot - range,
    s3: pivot - (2 * range),
    camarilla: {
      r4: candle.close + (range * 1.1 / 2),
      r3: candle.close + (range * 1.1 / 4),
      r2: candle.close + (range * 1.1 / 6),
      r1: candle.close + (range * 1.1 / 12),
      s1: candle.close - (range * 1.1 / 12),
      s2: candle.close - (range * 1.1 / 6),
      s3: candle.close - (range * 1.1 / 4),
      s4: candle.close - (range * 1.1 / 2)
    },
    woodie: {
      pivot: (candle.high + candle.low + (2 * candle.close)) / 4,
      r1: (2 * pivot) - candle.low,
      r2: pivot + candle.high - candle.low,
      s1: (2 * pivot) - candle.high,
      s2: pivot - candle.high + candle.low
    }
  }
}

// ==================== 심리적 레벨 ====================

export const findPsychologicalLevels = (
  currentPrice: number,
  range: number = 0.2
): number[] => {
  const levels: number[] = []
  const minPrice = currentPrice * (1 - range)
  const maxPrice = currentPrice * (1 + range)
  
  // Round numbers 찾기
  const magnitude = Math.floor(Math.log10(currentPrice))
  const step = Math.pow(10, magnitude - 1)
  
  for (let price = Math.floor(minPrice / step) * step; price <= maxPrice; price += step) {
    if (price >= minPrice && price <= maxPrice) {
      levels.push(price)
    }
  }
  
  // 50, 100, 500, 1000 단위 추가
  const specialSteps = [50, 100, 500, 1000, 5000, 10000]
  specialSteps.forEach(step => {
    for (let price = Math.floor(minPrice / step) * step; price <= maxPrice; price += step) {
      if (price >= minPrice && price <= maxPrice && !levels.includes(price)) {
        levels.push(price)
      }
    }
  })
  
  return levels.sort((a, b) => a - b)
}

// ==================== 클러스터 분석 ====================

export const findSupportResistanceClusters = (
  levels: SupportResistanceLevel[],
  fibLevels: FibonacciLevel[],
  pivotPoints: any,
  tolerance: number = 0.01
): Array<{ price: number; count: number; sources: string[] }> => {
  const clusters: Map<number, { count: number; sources: Set<string> }> = new Map()
  
  // S/R 레벨 추가
  levels.forEach(level => {
    const rounded = Math.round(level.price / (level.price * tolerance)) * (level.price * tolerance)
    if (!clusters.has(rounded)) {
      clusters.set(rounded, { count: 0, sources: new Set() })
    }
    const cluster = clusters.get(rounded)!
    cluster.count++
    cluster.sources.add(`S/R (강도: ${level.strength.toFixed(0)}%)`)
  })
  
  // 피보나치 레벨 추가
  fibLevels.forEach(fib => {
    const rounded = Math.round(fib.price / (fib.price * tolerance)) * (fib.price * tolerance)
    if (!clusters.has(rounded)) {
      clusters.set(rounded, { count: 0, sources: new Set() })
    }
    const cluster = clusters.get(rounded)!
    cluster.count++
    cluster.sources.add(`Fib ${fib.label}`)
  })
  
  // 피벗 포인트 추가
  Object.entries(pivotPoints).forEach(([key, value]) => {
    if (typeof value === 'number') {
      const rounded = Math.round(value / (value * tolerance)) * (value * tolerance)
      if (!clusters.has(rounded)) {
        clusters.set(rounded, { count: 0, sources: new Set() })
      }
      const cluster = clusters.get(rounded)!
      cluster.count++
      cluster.sources.add(`Pivot ${key.toUpperCase()}`)
    }
  })
  
  // 결과 변환
  return Array.from(clusters.entries())
    .map(([price, data]) => ({
      price,
      count: data.count,
      sources: Array.from(data.sources)
    }))
    .filter(cluster => cluster.count >= 2) // 최소 2개 이상 겹치는 경우만
    .sort((a, b) => b.count - a.count)
}

// ==================== 트레이딩 전략 생성 ====================

export const generateTradingStrategy = (
  currentPrice: number,
  levels: SupportResistanceLevel[],
  trend: 'bullish' | 'bearish' | 'neutral'
) => {
  // 가장 가까운 지지/저항 찾기
  const nearestSupport = levels
    .filter(l => l.type === 'support' && l.price < currentPrice)
    .sort((a, b) => b.price - a.price)[0]
    
  const nearestResistance = levels
    .filter(l => l.type === 'resistance' && l.price > currentPrice)
    .sort((a, b) => a.price - b.price)[0]
  
  // 진입 전략
  let entryStrategy = ''
  let stopLoss = 0
  let takeProfit = 0
  let riskRewardRatio = 0
  
  if (trend === 'bullish' && nearestSupport) {
    entryStrategy = '지지선 근처에서 매수 진입'
    stopLoss = nearestSupport.price * 0.99 // 지지선 1% 아래
    takeProfit = nearestResistance ? nearestResistance.price : currentPrice * 1.05
    riskRewardRatio = (takeProfit - currentPrice) / (currentPrice - stopLoss)
  } else if (trend === 'bearish' && nearestResistance) {
    entryStrategy = '저항선 근처에서 매도 진입'
    stopLoss = nearestResistance.price * 1.01 // 저항선 1% 위
    takeProfit = nearestSupport ? nearestSupport.price : currentPrice * 0.95
    riskRewardRatio = (currentPrice - takeProfit) / (stopLoss - currentPrice)
  } else {
    entryStrategy = '중립 - 관망 권장'
    stopLoss = currentPrice * 0.97
    takeProfit = currentPrice * 1.03
    riskRewardRatio = 1
  }
  
  return {
    entryStrategy,
    entryPrice: currentPrice,
    stopLoss,
    takeProfit,
    riskRewardRatio,
    positionSize: calculatePositionSize(currentPrice, stopLoss),
    recommendedLeverage: calculateRecommendedLeverage(riskRewardRatio, trend)
  }
}

// 포지션 크기 계산
const calculatePositionSize = (entryPrice: number, stopLoss: number): string => {
  const riskPercentage = Math.abs(entryPrice - stopLoss) / entryPrice
  if (riskPercentage < 0.01) return '총 자본의 5-10%'
  else if (riskPercentage < 0.02) return '총 자본의 3-5%'
  else if (riskPercentage < 0.03) return '총 자본의 2-3%'
  else return '총 자본의 1-2%'
}

// 권장 레버리지 계산
const calculateRecommendedLeverage = (
  riskRewardRatio: number,
  trend: 'bullish' | 'bearish' | 'neutral'
): string => {
  if (trend === 'neutral') return '레버리지 사용 비권장'
  if (riskRewardRatio >= 3) return '3-5x'
  else if (riskRewardRatio >= 2) return '2-3x'
  else if (riskRewardRatio >= 1.5) return '1-2x'
  else return '레버리지 사용 비권장'
}