// 풋프린트 차트 관련 타입 정의

export interface FootprintCell {
  price: number
  time: string
  buyVolume: number
  sellVolume: number
  delta: number // buyVolume - sellVolume
  totalVolume: number
  imbalance: number // delta / totalVolume
  poc: boolean // Point of Control 여부
}

export interface MarketProfile {
  price: number
  volume: number
  tpo: number // Time Price Opportunity
  valueArea: boolean // 70% 거래 집중 구역
  poc: boolean // Point of Control
}

export interface OrderFlowData {
  timestamp: number
  price: number
  size: number
  side: 'buy' | 'sell'
  aggressor: boolean // 공격적 주문 여부
  exchange: string
}

export interface DeltaData {
  time: string
  cumulativeDelta: number
  delta: number
  price: number
  divergence: boolean // 가격과 델타의 다이버전스
}

export interface VolumeProfile {
  priceLevel: number
  buyVolume: number
  sellVolume: number
  totalVolume: number
  percentOfTotal: number
}

export interface WhaleOrder {
  id: string
  timestamp: number
  symbol: string
  price: number
  quantity: number
  value: number
  side: 'buy' | 'sell'
  exchange: string
  impact: 'low' | 'medium' | 'high'
}

export interface FootprintAnalysis {
  symbol: string
  timeframe: string
  pocPrice: number // Point of Control 가격
  valueAreaHigh: number
  valueAreaLow: number
  totalVolume: number
  buyVolume: number
  sellVolume: number
  netDelta: number
  largestDelta: number
  imbalances: Array<{
    price: number
    imbalance: number
    type: 'buy' | 'sell'
  }>
  supportLevels: number[]
  resistanceLevels: number[]
}

export interface TradingSignal {
  type: 'buy' | 'sell' | 'neutral'
  confidence: number
  reason: string
  entry: number
  stopLoss: number
  targets: number[]
  riskRewardRatio: number
}

export interface MarketMetrics {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  whaleActivity: 'low' | 'medium' | 'high'
  orderFlowSentiment: 'bullish' | 'bearish' | 'neutral'
  institutionalFlow: number
  retailFlow: number
}

// 시간대별 데이터 타입
export interface TimeframeData {
  '1m': FootprintCell[]
  '5m': FootprintCell[]
  '15m': FootprintCell[]
  '30m': FootprintCell[]
  '1h': FootprintCell[]
  '4h': FootprintCell[]
  '1d': FootprintCell[]
}

// 교육 컨텐츠 타입
export interface EducationalContent {
  id: string
  title: string
  content: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: 'concept' | 'analysis' | 'strategy' | 'example'
  mediaUrl?: string
}