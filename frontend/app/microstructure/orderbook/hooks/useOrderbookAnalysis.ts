import { useState, useEffect, useMemo } from 'react'

interface OrderbookLevel {
  price: number
  amount: number
  total: number
}

interface OrderbookData {
  bids: OrderbookLevel[]
  asks: OrderbookLevel[]
  lastUpdateId: number
  spread: number
  spreadPercent: number
  bestBid: number
  bestAsk: number
}

interface OrderbookStats {
  bidVolume: number
  askVolume: number
  imbalance: number
  pressure: number
  momentum: 'bullish' | 'bearish' | 'neutral'
  largestBid: OrderbookLevel | null
  largestAsk: OrderbookLevel | null
  wallsDetected: {
    bidWalls: OrderbookLevel[]
    askWalls: OrderbookLevel[]
  }
  liquidityScore: number
  executionRisk: 'low' | 'medium' | 'high'
}

// 벽(Wall) 감지를 위한 임계값
const WALL_THRESHOLD = 2.5 // 평균 대비 2.5배 이상
const LARGE_ORDER_THRESHOLD = 5000 // $5,000 이상

export function useOrderbookAnalysis(orderbook: OrderbookData | null) {
  const [stats, setStats] = useState<OrderbookStats | null>(null)

  const analysis = useMemo(() => {
    if (!orderbook || !orderbook.bids.length || !orderbook.asks.length) {
      return null
    }

    // 전체 볼륨 계산
    const bidVolume = orderbook.bids.reduce((sum, bid) => sum + bid.total, 0)
    const askVolume = orderbook.asks.reduce((sum, ask) => sum + ask.total, 0)
    const totalVolume = bidVolume + askVolume

    // 불균형 지수 계산 (-100 ~ 100)
    // 양수: 매수 우세, 음수: 매도 우세
    const imbalance = totalVolume > 0 
      ? ((bidVolume - askVolume) / totalVolume) * 100 
      : 0

    // 압력 지표 계산 (0 ~ 100)
    // 상위 5개 레벨의 볼륨 비중으로 계산
    const topBidVolume = orderbook.bids.slice(0, 5).reduce((sum, bid) => sum + bid.total, 0)
    const topAskVolume = orderbook.asks.slice(0, 5).reduce((sum, ask) => sum + ask.total, 0)
    const topTotalVolume = topBidVolume + topAskVolume
    const pressure = topTotalVolume > 0 
      ? (topBidVolume / topTotalVolume) * 100 
      : 50

    // 모멘텀 판단
    let momentum: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (imbalance > 20) momentum = 'bullish'
    else if (imbalance < -20) momentum = 'bearish'

    // 가장 큰 주문 찾기
    const largestBid = [...orderbook.bids].sort((a, b) => b.total - a.total)[0] || null
    const largestAsk = [...orderbook.asks].sort((a, b) => b.total - a.total)[0] || null

    // 벽(Wall) 감지
    const avgBidAmount = orderbook.bids.reduce((sum, bid) => sum + bid.amount, 0) / orderbook.bids.length
    const avgAskAmount = orderbook.asks.reduce((sum, ask) => sum + ask.amount, 0) / orderbook.asks.length

    const bidWalls = orderbook.bids.filter(bid => 
      bid.amount > avgBidAmount * WALL_THRESHOLD || bid.total > LARGE_ORDER_THRESHOLD
    )
    const askWalls = orderbook.asks.filter(ask => 
      ask.amount > avgAskAmount * WALL_THRESHOLD || ask.total > LARGE_ORDER_THRESHOLD
    )

    // 유동성 점수 계산 (0 ~ 100)
    // 스프레드가 낮고, 주문량이 많을수록 높은 점수
    const spreadScore = Math.max(0, 100 - (orderbook.spreadPercent * 100))
    const depthScore = Math.min(100, (totalVolume / 100000) * 100) // $100k 기준
    const liquidityScore = (spreadScore * 0.4 + depthScore * 0.6)

    // 실행 리스크 평가
    let executionRisk: 'low' | 'medium' | 'high' = 'low'
    if (orderbook.spreadPercent > 0.2 || liquidityScore < 30) {
      executionRisk = 'high'
    } else if (orderbook.spreadPercent > 0.1 || liquidityScore < 50) {
      executionRisk = 'medium'
    }

    return {
      bidVolume,
      askVolume,
      imbalance: Math.round(imbalance),
      pressure: Math.round(pressure),
      momentum,
      largestBid,
      largestAsk,
      wallsDetected: {
        bidWalls,
        askWalls
      },
      liquidityScore: Math.round(liquidityScore),
      executionRisk
    }
  }, [orderbook])

  useEffect(() => {
    setStats(analysis)
  }, [analysis])

  return stats
}