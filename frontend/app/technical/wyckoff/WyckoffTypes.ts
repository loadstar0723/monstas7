// 와이코프 분석을 위한 타입 정의

// 와이코프 사이클 단계
export enum WyckoffPhase {
  Accumulation = 'accumulation',
  Markup = 'markup',
  Distribution = 'distribution',
  Markdown = 'markdown',
  Unknown = 'unknown'
}

// 와이코프 이벤트 타입
export enum WyckoffEvent {
  PS = 'PS',    // Preliminary Support
  SC = 'SC',    // Selling Climax
  AR = 'AR',    // Automatic Rally
  ST = 'ST',    // Secondary Test
  Spring = 'Spring',
  LPS = 'LPS',  // Last Point of Support
  SOS = 'SOS',  // Sign of Strength
  UTAD = 'UTAD', // Upthrust After Distribution
  LPSY = 'LPSY', // Last Point of Supply
  SOW = 'SOW'   // Sign of Weakness
}

// 코인 정보 타입
export interface CoinInfo {
  symbol: string
  name: string
  icon: React.ReactNode
  initialPrice: number
}

// OHLCV 데이터 타입
export interface OHLCVData {
  time: string | number
  timestamp?: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// 와이코프 이벤트 마커
export interface WyckoffMarker {
  time: string | number
  event: WyckoffEvent
  price: number
  description: string
  confidence: number
}

// 와이코프 분석 결과
export interface WyckoffAnalysis {
  phase: WyckoffPhase
  phaseConfidence: number
  phaseProgress: number // 0-100%
  events: WyckoffMarker[]
  keyLevels: {
    resistance: number[]
    support: number[]
    currentRange: {
      high: number
      low: number
    }
  }
  volumeAnalysis: {
    trend: 'increasing' | 'decreasing' | 'stable'
    effortVsResult: 'aligned' | 'divergent'
    smartMoneyFlow: 'accumulating' | 'distributing' | 'neutral'
  }
  tradingStrategy: {
    bias: 'bullish' | 'bearish' | 'neutral'
    entryPoints: number[]
    stopLoss: number
    targets: number[]
    riskRewardRatio: number
    positionSize: string
  }
  nextPhasesPrediction: {
    phase: WyckoffPhase
    probability: number
    timeframe: string
  }[]
}

// 볼륨 프로파일 데이터
export interface VolumeProfile {
  price: number
  volume: number
  buyVolume: number
  sellVolume: number
  isPOC?: boolean // Point of Control
  isVAH?: boolean // Value Area High
  isVAL?: boolean // Value Area Low
}

// 지표 데이터
export interface WyckoffIndicators {
  compositeOperator: number // -100 to 100
  volumeTrend: number
  priceStrength: number
  marketPhase: number // 0-3 (각 단계를 숫자로)
  effortVsResult: number // -100 to 100 (음수: 다이버전스, 양수: 일치)
}

// 차트 설정
export interface ChartConfig {
  showEvents: boolean
  showVolume: boolean
  showVolumeProfile: boolean
  showSupportResistance: boolean
  showPhaseBoundaries: boolean
  timeframe: '1h' | '4h' | '1d' | '1w'
}

// API 응답 타입
export interface HistoricalDataResponse {
  data: OHLCVData[]
  ticker?: {
    symbol: string
    lastPrice: number
    priceChangePercent: number
    volume24h: number
  }
}

// 실시간 업데이트 데이터
export interface RealtimeUpdate {
  symbol: string
  price: number
  volume: number
  timestamp: number
  trades: {
    price: number
    quantity: number
    isBuyerMaker: boolean
    time: number
  }[]
}