// 공통 타입 정의
export interface CoinSymbol {
  symbol: string
  name: string
  icon: JSX.Element
  initialPrice: number
}

export interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  high24h?: number
  low24h?: number
  marketCap?: number
}

export interface ChartData {
  time: string
  value: number
  volume?: number
  open?: number
  high?: number
  low?: number
  close?: number
}

export interface WebSocketMessage {
  stream?: string
  data?: any
  e?: string  // event type
  s?: string  // symbol
  p?: string  // price
  q?: string  // quantity
  k?: any     // kline data
}

export interface TechnicalIndicator {
  name: string
  value: number | { [key: string]: number }
  signal?: 'buy' | 'sell' | 'neutral'
  strength?: number
}

export interface TabConfig {
  id: string
  label: string
  icon: JSX.Element
  description: string
}

// SMC (Smart Money Concepts) 타입
export interface SMCData {
  orderBlocks: Array<{
    type: 'bullish' | 'bearish'
    price: number
    volume: number
    timestamp: number
  }>
  fairValueGaps: Array<{
    high: number
    low: number
    timestamp: number
  }>
  liquidityPools: Array<{
    price: number
    size: number
    side: 'buy' | 'sell'
  }>
  structureBreaks: Array<{
    type: 'BOS' | 'CHoCH'
    price: number
    timestamp: number
  }>
}

// CVD (Cumulative Volume Delta) 타입
export interface CVDData {
  timestamp: number
  cvd: number
  buyVolume: number
  sellVolume: number
  delta: number
  cumulativeDelta: number
}

// OFI (Order Flow Imbalance) 타입
export interface OFIData {
  timestamp: number
  bidImbalance: number
  askImbalance: number
  totalImbalance: number
  flowDirection: 'bullish' | 'bearish' | 'neutral'
  strength: number
}

// Volume Analysis 타입
export interface VolumeAnalysisData {
  volumeProfile: Array<{
    price: number
    volume: number
    buyVolume: number
    sellVolume: number
  }>
  poc: number  // Point of Control
  vah: number  // Value Area High
  val: number  // Value Area Low
  vpvr: Array<{
    price: number
    volume: number
  }>
}

// Liquidity Map 타입
export interface LiquidityData {
  bidLiquidity: Array<{
    price: number
    size: number
    orders: number
  }>
  askLiquidity: Array<{
    price: number
    size: number
    orders: number
  }>
  liquidityHeatmap: Array<{
    price: number
    liquidity: number
    intensity: number
  }>
  imbalanceZones: Array<{
    price: number
    imbalance: number
  }>
}

// Liquidation 타입
export interface LiquidationData {
  timestamp: number
  symbol: string
  side: 'long' | 'short'
  price: number
  quantity: number
  value: number
  type?: 'cascade' | 'single'
}

// 차트 설정 타입
export interface ChartConfig {
  height?: number
  showVolume?: boolean
  showGrid?: boolean
  theme?: 'dark' | 'light'
  colors?: {
    up: string
    down: string
    volume: string
    grid: string
  }
}

// 페이지 설정 타입
export interface PageConfig {
  title: string
  description: string
  tabs: TabConfig[]
  defaultTab: string
  refreshInterval?: number
}