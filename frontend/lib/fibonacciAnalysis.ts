// 피보나치 분석 라이브러리 - 실제 데이터 기반 계산만 수행

export interface FibonacciLevel {
  level: number
  price: number
  label: string
  color: string
  type: 'retracement' | 'extension' | 'cluster'
}

export interface FibonacciData {
  retracements: FibonacciLevel[]
  extensions: FibonacciLevel[]
  clusters: FibonacciLevel[]
  goldenPocket: { high: number; low: number }
  currentPosition: string
  trend: 'bullish' | 'bearish' | 'neutral'
  confidence: number
}

export interface TimeFrame {
  period: string
  high: number
  low: number
  time: Date
}

// 피보나치 수열 생성
export const generateFibonacciSequence = (n: number): number[] => {
  const sequence = [0, 1]
  for (let i = 2; i < n; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2])
  }
  return sequence
}

// 황금비율 계산
export const GOLDEN_RATIO = 1.618033988749895
export const INVERSE_GOLDEN_RATIO = 0.618033988749895

// 기본 피보나치 레벨
export const FIBONACCI_RETRACEMENT_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
export const FIBONACCI_EXTENSION_LEVELS = [1, 1.272, 1.618, 2.618, 4.236]
export const FIBONACCI_TIME_ZONES = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]

// 피보나치 되돌림 계산
export const calculateFibonacciRetracements = (
  high: number,
  low: number,
  isUptrend: boolean = true
): FibonacciLevel[] => {
  const diff = high - low
  
  const levels = FIBONACCI_RETRACEMENT_LEVELS.map(level => {
    const price = isUptrend 
      ? high - (diff * level)  // 상승 추세에서 하락 되돌림
      : low + (diff * level)   // 하락 추세에서 상승 되돌림
    
    return {
      level,
      price,
      label: `${(level * 100).toFixed(1)}%`,
      color: getColorForLevel(level),
      type: 'retracement' as const
    }
  })
  
  return levels
}

// 피보나치 확장 계산
export const calculateFibonacciExtensions = (
  swing1: number,
  swing2: number,
  swing3: number,
  isUptrend: boolean = true
): FibonacciLevel[] => {
  const impulseRange = Math.abs(swing2 - swing1)
  
  const extensions = FIBONACCI_EXTENSION_LEVELS.map(level => {
    const extensionValue = impulseRange * level
    const price = isUptrend
      ? swing3 + extensionValue
      : swing3 - extensionValue
    
    return {
      level,
      price,
      label: `${(level * 100).toFixed(1)}%`,
      color: getColorForExtension(level),
      type: 'extension' as const
    }
  })
  
  return extensions
}

// 피보나치 팬 계산
export const calculateFibonacciFan = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  dataPoints: number
): { x: number; y: number; level: number }[] => {
  const xDiff = endX - startX
  const yDiff = endY - startY
  const fanLines = []
  
  for (const level of [0.382, 0.5, 0.618]) {
    const points = []
    for (let i = 0; i <= dataPoints; i++) {
      const x = startX + (xDiff * i / dataPoints)
      const y = startY + (yDiff * level * i / dataPoints)
      points.push({ x, y, level })
    }
    fanLines.push(...points)
  }
  
  return fanLines
}

// 피보나치 아크 계산
export const calculateFibonacciArcs = (
  centerX: number,
  centerY: number,
  radius: number
): { level: number; radius: number; startAngle: number; endAngle: number }[] => {
  return [0.382, 0.5, 0.618].map(level => ({
    level,
    radius: radius * level,
    startAngle: 0,
    endAngle: 180
  }))
}

// 피보나치 시간대 계산
export const calculateFibonacciTimeZones = (
  startDate: Date,
  intervalDays: number = 1
): Date[] => {
  return FIBONACCI_TIME_ZONES.map(zone => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + (zone * intervalDays))
    return date
  })
}

// 피보나치 클러스터 찾기
export const findFibonacciClusters = (
  levels: FibonacciLevel[],
  tolerance: number = 0.02
): FibonacciLevel[] => {
  const clusters: FibonacciLevel[] = []
  const grouped: Map<number, FibonacciLevel[]> = new Map()
  
  // 비슷한 가격대의 레벨들을 그룹화
  levels.forEach(level => {
    let added = false
    grouped.forEach((group, key) => {
      if (Math.abs(key - level.price) / key < tolerance) {
        group.push(level)
        added = true
      }
    })
    
    if (!added) {
      grouped.set(level.price, [level])
    }
  })
  
  // 2개 이상 겹치는 레벨을 클러스터로 정의
  grouped.forEach((group, key) => {
    if (group.length >= 2) {
      const avgPrice = group.reduce((sum, l) => sum + l.price, 0) / group.length
      clusters.push({
        level: group.length,
        price: avgPrice,
        label: `Cluster (${group.length})`,
        color: '#ff00ff',
        type: 'cluster'
      })
    }
  })
  
  return clusters
}

// 황금 포켓 계산 (61.8% - 65% 영역)
export const calculateGoldenPocket = (high: number, low: number, isUptrend: boolean = true): { high: number; low: number } => {
  const diff = high - low
  
  if (isUptrend) {
    return {
      high: high - (diff * 0.618),
      low: high - (diff * 0.65)
    }
  } else {
    return {
      high: low + (diff * 0.65),
      low: low + (diff * 0.618)
    }
  }
}

// 현재 가격 위치 분석
export const analyzePricePosition = (
  currentPrice: number,
  retracements: FibonacciLevel[]
): string => {
  const sorted = [...retracements].sort((a, b) => a.price - b.price)
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (currentPrice >= sorted[i].price && currentPrice <= sorted[i + 1].price) {
      return `Between ${sorted[i].label} and ${sorted[i + 1].label}`
    }
  }
  
  if (currentPrice < sorted[0].price) {
    return `Below ${sorted[0].label}`
  }
  
  return `Above ${sorted[sorted.length - 1].label}`
}

// 피보나치 기반 지지/저항 강도 계산
export const calculateFibonacciStrength = (
  price: number,
  historicalTouches: number[],
  volumeAtLevel: number,
  timeHeld: number
): number => {
  const touchScore = Math.min(historicalTouches.length * 10, 40)
  const volumeScore = Math.min(Math.log10(volumeAtLevel) * 10, 30)
  const timeScore = Math.min(timeHeld / 24, 30) // hours to score
  
  return touchScore + volumeScore + timeScore
}

// 피보나치 프로젝션
export const projectFibonacciTargets = (
  entryPrice: number,
  stopLoss: number,
  riskRewardRatios: number[] = [1.618, 2.618, 4.236]
): number[] => {
  const risk = Math.abs(entryPrice - stopLoss)
  const isLong = entryPrice > stopLoss
  
  return riskRewardRatios.map(ratio => 
    isLong ? entryPrice + (risk * ratio) : entryPrice - (risk * ratio)
  )
}

// 피보나치 스피드 저항선
export const calculateSpeedResistanceLines = (
  high: number,
  low: number,
  periods: number
): { period: number; level1: number; level2: number }[] => {
  const range = high - low
  const lines = []
  
  for (let i = 1; i <= periods; i++) {
    lines.push({
      period: i,
      level1: low + (range * 0.333 * i / periods),
      level2: low + (range * 0.667 * i / periods)
    })
  }
  
  return lines
}

// 피보나치 나선 좌표 계산
export const calculateFibonacciSpiral = (
  centerX: number,
  centerY: number,
  scale: number = 10,
  rotations: number = 3
): { x: number; y: number; radius: number }[] => {
  const points = []
  const steps = rotations * 360
  
  for (let i = 0; i <= steps; i++) {
    const angle = (i * Math.PI) / 180
    const radius = scale * Math.pow(GOLDEN_RATIO, angle / (2 * Math.PI))
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    points.push({ x, y, radius })
  }
  
  return points
}

// 레벨별 색상 지정
const getColorForLevel = (level: number): string => {
  if (level === 0 || level === 1) return '#6b7280' // 회색
  if (level === 0.236) return '#3b82f6' // 파란색
  if (level === 0.382) return '#10b981' // 초록색
  if (level === 0.5) return '#f59e0b' // 주황색
  if (level === 0.618) return '#ef4444' // 빨간색 (황금비율)
  if (level === 0.786) return '#8b5cf6' // 보라색
  return '#6b7280'
}

const getColorForExtension = (level: number): string => {
  if (level === 1.272) return '#22c55e' // 밝은 초록
  if (level === 1.618) return '#f97316' // 주황색 (황금비율)
  if (level === 2.618) return '#dc2626' // 빨간색
  if (level === 4.236) return '#9333ea' // 보라색
  return '#6b7280'
}

// 종합 피보나치 분석
export const performComprehensiveFibonacciAnalysis = (
  high: number,
  low: number,
  currentPrice: number,
  swing3?: number,
  historicalData?: { high: number; low: number }[]
): FibonacciData => {
  const isUptrend = currentPrice > (high + low) / 2
  
  // 되돌림 레벨 계산
  const retracements = calculateFibonacciRetracements(high, low, isUptrend)
  
  // 확장 레벨 계산 (swing3가 제공된 경우)
  const extensions = swing3 
    ? calculateFibonacciExtensions(low, high, swing3, isUptrend)
    : []
  
  // 클러스터 찾기 (과거 데이터가 있는 경우)
  let clusters: FibonacciLevel[] = []
  if (historicalData && historicalData.length > 0) {
    const allLevels: FibonacciLevel[] = []
    historicalData.forEach(data => {
      allLevels.push(...calculateFibonacciRetracements(data.high, data.low, isUptrend))
    })
    clusters = findFibonacciClusters(allLevels)
  }
  
  // 황금 포켓 계산
  const goldenPocket = calculateGoldenPocket(high, low, isUptrend)
  
  // 현재 위치 분석
  const currentPosition = analyzePricePosition(currentPrice, retracements)
  
  // 트렌드 판단
  const trend = isUptrend ? 'bullish' : currentPrice < low * 1.1 ? 'bearish' : 'neutral'
  
  // 신뢰도 계산 (실제 데이터 기반)
  const priceRange = high - low
  const volatility = priceRange / low
  const confidence = Math.min(100, 50 + (volatility * 100))
  
  return {
    retracements,
    extensions,
    clusters,
    goldenPocket,
    currentPosition,
    trend,
    confidence
  }
}

// 트레이딩 전략 제안
export interface FibonacciTradingStrategy {
  entry: number[]
  stopLoss: number
  targets: number[]
  riskReward: number
  strategy: string
  confidence: number
}

export const generateFibonacciTradingStrategy = (
  fibData: FibonacciData,
  currentPrice: number,
  riskPercentage: number = 2
): FibonacciTradingStrategy => {
  const { retracements, extensions, goldenPocket, trend } = fibData
  
  let entry: number[] = []
  let stopLoss: number = 0
  let targets: number[] = []
  let strategy: string = ''
  
  if (trend === 'bullish') {
    // 상승 추세 - 되돌림에서 매수
    entry = [
      retracements.find(r => r.level === 0.382)?.price || 0,
      retracements.find(r => r.level === 0.5)?.price || 0,
      retracements.find(r => r.level === 0.618)?.price || 0
    ].filter(p => p > 0 && p < currentPrice)
    
    stopLoss = retracements.find(r => r.level === 0.786)?.price || 
               (entry[entry.length - 1] * 0.95)
    
    targets = extensions.slice(0, 3).map(e => e.price)
    strategy = '상승 추세 되돌림 매수 전략'
  } else if (trend === 'bearish') {
    // 하락 추세 - 반등에서 매도
    entry = [
      retracements.find(r => r.level === 0.382)?.price || 0,
      retracements.find(r => r.level === 0.5)?.price || 0,
      retracements.find(r => r.level === 0.618)?.price || 0
    ].filter(p => p > 0 && p > currentPrice)
    
    stopLoss = retracements.find(r => r.level === 0.786)?.price || 
               (entry[0] * 1.05)
    
    targets = extensions.slice(0, 3).map(e => e.price)
    strategy = '하락 추세 반등 매도 전략'
  } else {
    // 중립 - 황금 포켓 활용
    entry = [(goldenPocket.high + goldenPocket.low) / 2]
    stopLoss = trend === 'bullish' ? goldenPocket.low * 0.98 : goldenPocket.high * 1.02
    targets = [
      currentPrice * 1.05,
      currentPrice * 1.1,
      currentPrice * 1.15
    ]
    strategy = '황금 포켓 중심 거래 전략'
  }
  
  const avgEntry = entry.reduce((a, b) => a + b, 0) / entry.length
  const riskAmount = Math.abs(avgEntry - stopLoss)
  const avgTarget = targets[1] || targets[0]
  const rewardAmount = Math.abs(avgTarget - avgEntry)
  const riskReward = rewardAmount / riskAmount
  
  return {
    entry: entry.filter(e => e > 0),
    stopLoss,
    targets: targets.filter(t => t > 0),
    riskReward,
    strategy,
    confidence: fibData.confidence
  }
}