import { useState, useEffect, useMemo } from 'react'

interface OrderLevel {
  price: number
  amount: number
  total: number
  timestamp?: number
  lifespan?: number
  cancelled?: boolean
  suspicious?: boolean
}

interface OrderbookData {
  bids: OrderLevel[]
  asks: OrderLevel[]
  lastUpdateId: number
  spread: number
  spreadPercent: number
  bestBid: number
  bestAsk: number
  timestamp: number
}

interface SpoofingMetrics {
  spoofingScore: number // 0-100
  cancellationRate: number // 취소율
  wallsDetected: number // 감지된 벽 수
  flashOrders: number // 플래시 오더 수
  volumeAnomaly: number // 볼륨 이상도
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  confidence: number // 신뢰도
  patterns: {
    layering: boolean // 레이어링 패턴
    spoofing: boolean // 스푸핑 패턴
    momentum: boolean // 모멘텀 조작
    painting: boolean // 페인팅(워시 트레이딩)
  }
  analysis: {
    bidPressure: number // 매수 압력
    askPressure: number // 매도 압력
    imbalance: number // 불균형도
    depth: number // 시장 깊이
    resilience: number // 복원력
  }
}

interface Settings {
  alertThreshold: number
  cancellationThreshold: number
  wallMinSize: number
  flashTimeWindow: number
  enableSound: boolean
  enableNotifications: boolean
}

export function useSpoofingAnalysis(
  orderbook: OrderbookData | null,
  settings: Settings
): SpoofingMetrics | null {
  const [metrics, setMetrics] = useState<SpoofingMetrics | null>(null)
  
  useEffect(() => {
    if (!orderbook) {
      setMetrics(null)
      return
    }
    
    const analyzedMetrics = analyzeOrderbook(orderbook, settings)
    setMetrics(analyzedMetrics)
  }, [orderbook, settings])
  
  return metrics
}

function analyzeOrderbook(orderbook: OrderbookData, settings: Settings): SpoofingMetrics {
  // 1. 취소율 계산
  const cancellationRate = calculateCancellationRate(orderbook)
  
  // 2. 벽 감지
  const walls = detectWalls(orderbook, settings.wallMinSize)
  
  // 3. 플래시 오더 감지
  const flashOrders = detectFlashOrders(orderbook, settings.flashTimeWindow)
  
  // 4. 볼륨 이상 감지
  const volumeAnomaly = detectVolumeAnomaly(orderbook)
  
  // 5. 패턴 분석
  const patterns = detectPatterns(orderbook, settings)
  
  // 6. 시장 분석
  const analysis = analyzeMarketStructure(orderbook)
  
  // 7. 스푸핑 점수 계산
  const spoofingScore = calculateSpoofingScore({
    cancellationRate,
    wallsDetected: walls.length,
    flashOrders,
    volumeAnomaly,
    patterns,
    analysis
  })
  
  // 8. 리스크 레벨 결정
  const riskLevel = determineRiskLevel(spoofingScore, cancellationRate, volumeAnomaly)
  
  // 9. 신뢰도 계산
  const confidence = calculateConfidence(orderbook, analysis)
  
  return {
    spoofingScore,
    cancellationRate,
    wallsDetected: walls.length,
    flashOrders,
    volumeAnomaly,
    riskLevel,
    confidence,
    patterns,
    analysis
  }
}

// 취소율 계산
function calculateCancellationRate(orderbook: OrderbookData): number {
  let cancelledCount = 0
  let totalCount = 0
  
  // 취소된 주문 수 계산
  const allOrders = [...orderbook.bids, ...orderbook.asks]
  allOrders.forEach(order => {
    totalCount++
    if (order.cancelled) {
      cancelledCount++
    }
  })
  
  if (totalCount === 0) return 0
  return (cancelledCount / totalCount) * 100
}

// 벽 감지
function detectWalls(orderbook: OrderbookData, minSize: number): OrderLevel[] {
  const walls: OrderLevel[] = []
  const avgBidSize = orderbook.bids.reduce((sum, bid) => sum + bid.amount, 0) / orderbook.bids.length
  const avgAskSize = orderbook.asks.reduce((sum, ask) => sum + ask.amount, 0) / orderbook.asks.length
  
  // 매수벽 감지
  orderbook.bids.forEach(bid => {
    if (bid.amount > avgBidSize * 3 && bid.amount > minSize) {
      walls.push(bid)
    }
  })
  
  // 매도벽 감지
  orderbook.asks.forEach(ask => {
    if (ask.amount > avgAskSize * 3 && ask.amount > minSize) {
      walls.push(ask)
    }
  })
  
  return walls
}

// 플래시 오더 감지
function detectFlashOrders(orderbook: OrderbookData, timeWindow: number): number {
  let flashCount = 0
  
  const allOrders = [...orderbook.bids, ...orderbook.asks]
  allOrders.forEach(order => {
    if (order.lifespan && order.lifespan < timeWindow) {
      flashCount++
    }
  })
  
  return flashCount
}

// 볼륨 이상 감지
function detectVolumeAnomaly(orderbook: OrderbookData): number {
  const bidVolume = orderbook.bids.reduce((sum, bid) => sum + bid.total, 0)
  const askVolume = orderbook.asks.reduce((sum, ask) => sum + ask.total, 0)
  const totalVolume = bidVolume + askVolume
  
  if (totalVolume === 0) return 0
  
  // 불균형도 계산
  const imbalance = Math.abs(bidVolume - askVolume) / totalVolume
  
  // 의심스러운 주문 비율
  const suspiciousOrders = [...orderbook.bids, ...orderbook.asks].filter(o => o.suspicious)
  const suspiciousRatio = suspiciousOrders.length / (orderbook.bids.length + orderbook.asks.length)
  
  return (imbalance * 50 + suspiciousRatio * 50)
}

// 패턴 감지
function detectPatterns(orderbook: OrderbookData, settings: Settings): any {
  const patterns = {
    layering: false,
    spoofing: false,
    momentum: false,
    painting: false
  }
  
  // 레이어링: 여러 가격대에 걸친 대량 주문
  const bidLayers = detectLayering(orderbook.bids)
  const askLayers = detectLayering(orderbook.asks)
  patterns.layering = bidLayers || askLayers
  
  // 스푸핑: 빠른 취소를 동반한 대량 주문
  const cancellationRate = calculateCancellationRate(orderbook)
  patterns.spoofing = cancellationRate > settings.cancellationThreshold
  
  // 모멘텀 조작: 한쪽 방향으로의 압력
  const bidPressure = orderbook.bids.reduce((sum, bid) => sum + bid.total, 0)
  const askPressure = orderbook.asks.reduce((sum, ask) => sum + ask.total, 0)
  const pressureRatio = bidPressure / (askPressure || 1)
  patterns.momentum = pressureRatio > 2 || pressureRatio < 0.5
  
  // 페인팅: 작은 거래로 가격 조작
  const smallOrders = [...orderbook.bids, ...orderbook.asks].filter(o => o.amount < 0.01)
  patterns.painting = smallOrders.length > 10
  
  return patterns
}

// 레이어링 감지
function detectLayering(orders: OrderLevel[]): boolean {
  if (orders.length < 5) return false
  
  const avgSize = orders.reduce((sum, o) => sum + o.amount, 0) / orders.length
  const largeOrders = orders.filter(o => o.amount > avgSize * 2)
  
  // 연속된 가격대에 대량 주문이 있는지 확인
  if (largeOrders.length >= 3) {
    const prices = largeOrders.map(o => o.price).sort((a, b) => a - b)
    for (let i = 0; i < prices.length - 2; i++) {
      const gap1 = prices[i + 1] - prices[i]
      const gap2 = prices[i + 2] - prices[i + 1]
      if (Math.abs(gap1 - gap2) < gap1 * 0.2) {
        return true // 일정한 간격으로 배치된 대량 주문
      }
    }
  }
  
  return false
}

// 시장 구조 분석
function analyzeMarketStructure(orderbook: OrderbookData): any {
  const bidVolume = orderbook.bids.reduce((sum, bid) => sum + bid.total, 0)
  const askVolume = orderbook.asks.reduce((sum, ask) => sum + ask.total, 0)
  const totalVolume = bidVolume + askVolume
  
  return {
    bidPressure: totalVolume > 0 ? (bidVolume / totalVolume) * 100 : 50,
    askPressure: totalVolume > 0 ? (askVolume / totalVolume) * 100 : 50,
    imbalance: totalVolume > 0 ? Math.abs(bidVolume - askVolume) / totalVolume * 100 : 0,
    depth: orderbook.bids.length + orderbook.asks.length,
    resilience: calculateResilience(orderbook)
  }
}

// 복원력 계산 (시장이 충격을 흡수하는 능력)
function calculateResilience(orderbook: OrderbookData): number {
  const topBids = orderbook.bids.slice(0, 5)
  const topAsks = orderbook.asks.slice(0, 5)
  
  const bidDepth = topBids.reduce((sum, bid) => sum + bid.total, 0)
  const askDepth = topAsks.reduce((sum, ask) => sum + ask.total, 0)
  
  const avgDepth = (bidDepth + askDepth) / 2
  const spread = orderbook.spread
  
  // 깊이가 크고 스프레드가 작을수록 복원력이 높음
  const resilience = avgDepth / (spread || 1)
  return Math.min(100, resilience)
}

// 스푸핑 점수 계산
function calculateSpoofingScore(data: any): number {
  let score = 0
  
  // 취소율 기여도 (30%)
  score += Math.min(30, data.cancellationRate * 0.3)
  
  // 벽 감지 기여도 (20%)
  score += Math.min(20, data.wallsDetected * 5)
  
  // 플래시 오더 기여도 (20%)
  score += Math.min(20, data.flashOrders * 2)
  
  // 볼륨 이상도 기여도 (15%)
  score += Math.min(15, data.volumeAnomaly * 0.15)
  
  // 패턴 기여도 (15%)
  const patternCount = Object.values(data.patterns).filter(Boolean).length
  score += patternCount * 3.75
  
  return Math.min(100, score)
}

// 리스크 레벨 결정
function determineRiskLevel(
  spoofingScore: number,
  cancellationRate: number,
  volumeAnomaly: number
): 'low' | 'medium' | 'high' | 'critical' {
  if (spoofingScore >= 80 || cancellationRate >= 80) {
    return 'critical'
  } else if (spoofingScore >= 60 || cancellationRate >= 60 || volumeAnomaly >= 70) {
    return 'high'
  } else if (spoofingScore >= 40 || cancellationRate >= 40) {
    return 'medium'
  }
  return 'low'
}

// 신뢰도 계산
function calculateConfidence(orderbook: OrderbookData, analysis: any): number {
  let confidence = 50 // 기본 신뢰도
  
  // 데이터 품질
  if (orderbook.bids.length >= 10 && orderbook.asks.length >= 10) {
    confidence += 20
  }
  
  // 시장 깊이
  if (analysis.depth >= 20) {
    confidence += 15
  }
  
  // 복원력
  if (analysis.resilience >= 50) {
    confidence += 15
  }
  
  return Math.min(100, confidence)
}