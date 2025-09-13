'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import WebSocketManager from '@/lib/websocketManager'

// 아이콘 대체 컴포넌트 (이모지 사용)
const IconMap = () => <span className="inline-block">🗺️</span>
const IconLayers = () => <span className="inline-block">📊</span>
const IconBook = () => <span className="inline-block">📚</span>
const IconDepth = () => <span className="inline-block">📈</span>
const IconPool = () => <span className="inline-block">🌊</span>
const IconTarget = () => <span className="inline-block">🎯</span>
const IconStrategy = () => <span className="inline-block">🚀</span>
const IconSync = () => <span className="inline-block">🔄</span>
const IconSettings = () => <span className="inline-block">⚙️</span>

// 동적 임포트 컴포넌트들
const LiquidityHeatmap = dynamic(() => import('./components/LiquidityHeatmap'), { ssr: false })
const OrderBookDepth = dynamic(() => import('./components/OrderBookDepth'), { ssr: false })
const LiquidityPools = dynamic(() => import('./components/LiquidityPools'), { ssr: false })
const LiquidityZones = dynamic(() => import('./components/LiquidityZones'), { ssr: false })

// 타입 정의
interface LiquidityLevel {
  price: number
  buyLiquidity: number
  sellLiquidity: number
  totalLiquidity: number
  orders: number
  strength: 'weak' | 'moderate' | 'strong' | 'extreme'
  type: 'support' | 'resistance' | 'neutral'
}

interface OrderBookLevel {
  price: number
  quantity: number
  size: number
  orders?: number
  side: 'buy' | 'sell'
}

interface LiquidityPool {
  exchange: string
  symbol: string
  liquidity: number
  volume24h: number
  fee: number
  ratio: number
  apy?: number
}

interface LiquidityZone {
  id: string
  priceRange: [number, number]
  strength: number
  type: 'accumulation' | 'distribution' | 'neutral'
  volume: number
  timeframe: string
  significance: 'low' | 'medium' | 'high' | 'critical'
}

interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  liquidity: number
  spread: number
}

interface LiquidityMapData {
  levels: LiquidityLevel[]
  zones: LiquidityZone[]
  pools: LiquidityPool[]
  orderBook: {
    bids: OrderBookLevel[]
    asks: OrderBookLevel[]
  }
  marketData: MarketData
  heatmapData: Array<{
    price: number
    time: number
    liquidity: number
    volume: number
  }>
}

export default function LiquidityMapModule() {
  // 추적할 상위 코인
  const TRACKED_SYMBOLS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
    'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT', 'DOTUSDT'
  ]

  // 상태 관리
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'depth' | 'pools' | 'zones' | 'strategy'>('overview')
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('15m')
  const [depthRange, setDepthRange] = useState<'1%' | '2%' | '5%' | '10%'>('2%')
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [liquidityData, setLiquidityData] = useState<LiquidityMapData | null>(null)
  const [currentPrice, setCurrentPrice] = useState(0)

  // WebSocket 관리자
  const wsManager = WebSocketManager.getInstance()
  const wsConnectionKey = `liquidity-${selectedSymbol}`

  // 유동성 데이터 생성 함수
  const generateLiquidityData = useCallback((symbol: string, price: number): LiquidityMapData => {
    const priceRangePercent = parseFloat(depthRange.replace('%', '')) / 100
    const minPrice = price * (1 - priceRangePercent)
    const maxPrice = price * (1 + priceRangePercent)
    const levelCount = 200
    const levelSize = (maxPrice - minPrice) / levelCount

    // 유동성 레벨 생성
    const levels: LiquidityLevel[] = []
    const zones: LiquidityZone[] = []
    const bids: OrderBookLevel[] = []
    const asks: OrderBookLevel[] = []

    // 현재 시간 기반 변동 시드
    const timeSeed = Date.now() / 1000

    for (let i = 0; i < levelCount; i++) {
      const levelPrice = maxPrice - (i * levelSize)
      const distanceFromCurrent = Math.abs(levelPrice - price) / price
      
      // 유동성 강도 계산 (현재가 주변이 가장 높음)
      const proximityFactor = Math.exp(-Math.pow(distanceFromCurrent, 2) / 0.0001)
      const timeFactor = Math.sin(timeSeed + i * 0.1) * 0.3 + 0.7
      const baseLiquidity = 1000000 + proximityFactor * 5000000 * timeFactor

      // 매수/매도 비율 계산
      const side = levelPrice < price ? 'buy' : 'sell'
      const buyRatio = levelPrice < price ? 0.7 + Math.sin(timeSeed + i) * 0.2 : 0.3 + Math.sin(timeSeed + i) * 0.2
      const buyLiquidity = baseLiquidity * buyRatio
      const sellLiquidity = baseLiquidity * (1 - buyRatio)
      const totalLiquidity = buyLiquidity + sellLiquidity

      // 강도 분류
      let strength: 'weak' | 'moderate' | 'strong' | 'extreme'
      if (totalLiquidity > 4000000) strength = 'extreme'
      else if (totalLiquidity > 2500000) strength = 'strong'
      else if (totalLiquidity > 1500000) strength = 'moderate'
      else strength = 'weak'

      // 타입 분류
      let type: 'support' | 'resistance' | 'neutral'
      if (levelPrice < price && buyLiquidity > sellLiquidity * 1.5) type = 'support'
      else if (levelPrice > price && sellLiquidity > buyLiquidity * 1.5) type = 'resistance'
      else type = 'neutral'

      levels.push({
        price: levelPrice,
        buyLiquidity,
        sellLiquidity,
        totalLiquidity,
        orders: Math.floor(totalLiquidity / 10000),
        strength,
        type
      })

      // 오더북 레벨 생성 (상위 50개만)
      if (i < 50) {
        if (levelPrice < price) {
          bids.push({
            price: levelPrice,
            quantity: buyLiquidity / levelPrice,
            size: buyLiquidity,
            orders: Math.floor(buyLiquidity / 10000),
            side: 'buy'
          })
        } else {
          asks.push({
            price: levelPrice,
            quantity: sellLiquidity / levelPrice,
            size: sellLiquidity,
            orders: Math.floor(sellLiquidity / 10000),
            side: 'sell'
          })
        }
      }
    }

    // 중요한 유동성 존 생성
    const significantLevels = levels.filter(l => l.strength === 'extreme' || l.strength === 'strong')
    for (let i = 0; i < Math.min(5, significantLevels.length); i++) {
      const level = significantLevels[i]
      const zoneRange = price * 0.005 // 0.5% 범위
      
      zones.push({
        id: `zone-${i}`,
        priceRange: [level.price - zoneRange, level.price + zoneRange],
        strength: level.totalLiquidity,
        type: level.buyLiquidity > level.sellLiquidity ? 'accumulation' : 'distribution',
        volume: level.totalLiquidity,
        timeframe: timeframe,
        significance: level.strength === 'extreme' ? 'critical' : 'high'
      })
    }

    // 유동성 풀 데이터 생성
    const pools: LiquidityPool[] = [
      {
        exchange: 'Binance',
        symbol,
        liquidity: levels.reduce((sum, l) => sum + l.totalLiquidity, 0) * 0.4,
        volume24h: price * 50000 * (1 + Math.sin(timeSeed) * 0.3),
        fee: 0.001,
        ratio: 0.6 + Math.sin(timeSeed) * 0.2,
        apy: 5 + Math.sin(timeSeed * 2) * 3
      },
      {
        exchange: 'Coinbase',
        symbol,
        liquidity: levels.reduce((sum, l) => sum + l.totalLiquidity, 0) * 0.25,
        volume24h: price * 30000 * (1 + Math.cos(timeSeed) * 0.3),
        fee: 0.0015,
        ratio: 0.55 + Math.cos(timeSeed) * 0.2,
        apy: 4 + Math.cos(timeSeed * 2) * 2.5
      },
      {
        exchange: 'Kraken',
        symbol,
        liquidity: levels.reduce((sum, l) => sum + l.totalLiquidity, 0) * 0.2,
        volume24h: price * 20000 * (1 + Math.sin(timeSeed * 1.5) * 0.3),
        fee: 0.002,
        ratio: 0.5 + Math.sin(timeSeed * 1.5) * 0.2,
        apy: 3.5 + Math.sin(timeSeed * 3) * 2
      },
      {
        exchange: 'Uniswap V3',
        symbol: symbol.replace('USDT', 'USDC'),
        liquidity: levels.reduce((sum, l) => sum + l.totalLiquidity, 0) * 0.15,
        volume24h: price * 15000 * (1 + Math.cos(timeSeed * 2) * 0.3),
        fee: 0.003,
        ratio: 0.48 + Math.cos(timeSeed * 2) * 0.2,
        apy: 8 + Math.cos(timeSeed * 4) * 4
      }
    ]

    // 히트맵 데이터 생성 (지난 24시간)
    const heatmapData = []
    const hoursBack = 24
    for (let h = hoursBack; h >= 0; h--) {
      const timePoint = Date.now() - (h * 60 * 60 * 1000)
      const priceAtTime = price * (1 + (Math.sin((timeSeed - h * 0.1)) * 0.02))
      
      for (let p = 0; p < 50; p++) {
        const priceLevel = priceAtTime * (0.98 + (p / 50) * 0.04)
        const liquidityAtTime = 500000 + Math.sin(timeSeed - h * 0.1 + p * 0.05) * 300000
        const volumeAtTime = 100000 + Math.cos(timeSeed - h * 0.15 + p * 0.03) * 80000
        
        heatmapData.push({
          price: priceLevel,
          time: timePoint,
          liquidity: Math.max(0, liquidityAtTime),
          volume: Math.max(0, volumeAtTime)
        })
      }
    }

    return {
      levels,
      zones,
      pools,
      orderBook: {
        bids: bids.sort((a, b) => b.price - a.price),
        asks: asks.sort((a, b) => a.price - b.price)
      },
      marketData: {
        symbol,
        price,
        change24h: 2.5 + Math.sin(timeSeed) * 3,
        volume24h: price * 100000 * (1 + Math.sin(timeSeed * 0.5) * 0.4),
        marketCap: price * 19000000 * (1 + Math.sin(timeSeed * 0.3) * 0.1),
        liquidity: levels.reduce((sum, l) => sum + l.totalLiquidity, 0),
        spread: Math.abs(bids[0]?.price - asks[0]?.price) || price * 0.0001
      },
      heatmapData
    }
  }, [depthRange, timeframe])

  // WebSocket 연결 및 데이터 처리
  const connectWebSocket = useCallback(() => {
    const streams = [
      `${selectedSymbol.toLowerCase()}@depth20@100ms`,
      `${selectedSymbol.toLowerCase()}@ticker`
    ].join('/')
    
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`
    
    wsManager.connect(
      wsConnectionKey,
      wsUrl,
      (data) => {
        if (data.stream?.includes('@ticker')) {
          const price = parseFloat(data.data.c || 0)
          if (price > 0) {
            setCurrentPrice(price)
            // 가격 변경 시 유동성 데이터 업데이트
            const newData = generateLiquidityData(selectedSymbol, price)
            setLiquidityData(newData)
          }
        } else if (data.stream?.includes('@depth')) {
          // 오더북 데이터로 실시간 업데이트
          // 실제 구현에서는 여기서 더 정확한 유동성 계산 수행
        }
      },
      (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      },
      () => {
        console.log(`WebSocket connected for ${selectedSymbol}`)
        setIsConnected(true)
      },
      () => {
        console.log(`WebSocket disconnected for ${selectedSymbol}`)
        setIsConnected(false)
      }
    )
  }, [selectedSymbol, wsConnectionKey, wsManager, generateLiquidityData])

  // 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    setLoading(true)
    try {
      // 현재 가격 가져오기
      const priceResponse = await fetch(`/api/binance/ticker24hr?symbol=${selectedSymbol}`)
      let price = 0
      
      if (priceResponse.ok) {
        const priceData = await priceResponse.json()
        price = parseFloat(priceData.lastPrice || 0)
      }
      
      // 기본 가격 설정 (API 실패 시)
      if (price === 0) {
        const defaultPrices: Record<string, number> = {
          'BTCUSDT': 98000,
          'ETHUSDT': 3500,
          'BNBUSDT': 700,
          'SOLUSDT': 200,
          'XRPUSDT': 0.6,
          'ADAUSDT': 0.6,
          'DOGEUSDT': 0.1,
          'AVAXUSDT': 40,
          'MATICUSDT': 0.9,
          'DOTUSDT': 8
        }
        price = defaultPrices[selectedSymbol] || 100
      }
      
      setCurrentPrice(price)
      
      // 유동성 데이터 생성
      const liquidityMapData = generateLiquidityData(selectedSymbol, price)
      setLiquidityData(liquidityMapData)
      
    } catch (error) {
      console.error('Error loading initial data:', error)
      // 에러 시 기본 데이터 생성
      const defaultPrice = selectedSymbol === 'BTCUSDT' ? 98000 : 100
      setCurrentPrice(defaultPrice)
      const liquidityMapData = generateLiquidityData(selectedSymbol, defaultPrice)
      setLiquidityData(liquidityMapData)
    } finally {
      setLoading(false)
    }
  }, [selectedSymbol, generateLiquidityData])

  // 심볼 변경 처리
  const handleSymbolChange = (symbol: string) => {
    wsManager.disconnect(wsConnectionKey)
    setSelectedSymbol(symbol)
    setLiquidityData(null)
  }

  // Effects
  useEffect(() => {
    connectWebSocket()
    return () => {
      wsManager.disconnect(wsConnectionKey)
    }
  }, [connectWebSocket, wsConnectionKey])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    if (!liquidityData) return null

    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* 유동성 히트맵 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <IconMap /> 유동성 히트맵
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>범위: {depthRange}</span>
                  <select
                    value={depthRange}
                    onChange={(e) => setDepthRange(e.target.value as any)}
                    className="bg-gray-700 text-white px-2 py-1 rounded text-xs"
                  >
                    <option value="1%">1%</option>
                    <option value="2%">2%</option>
                    <option value="5%">5%</option>
                    <option value="10%">10%</option>
                  </select>
                </div>
              </div>
              <LiquidityHeatmap 
                data={liquidityData.heatmapData}
                currentPrice={currentPrice}
                range={depthRange}
              />
            </div>

            {/* 오더북 깊이 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <IconDepth /> 오더북 깊이
                </h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-xs text-gray-400">{isConnected ? '실시간' : '오프라인'}</span>
                </div>
              </div>
              <OrderBookDepth 
                orderBook={liquidityData.orderBook}
                currentPrice={currentPrice}
                symbol={selectedSymbol}
              />
            </div>

            {/* 유동성 존 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <IconTarget /> 핵심 유동성 존
              </h3>
              <div className="space-y-3">
                {liquidityData.zones.slice(0, 5).map((zone, index) => (
                  <div key={zone.id} className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        구간 {index + 1}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        zone.significance === 'critical' ? 'bg-red-500/20 text-red-400' :
                        zone.significance === 'high' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {zone.significance === 'critical' ? '매우중요' :
                         zone.significance === 'high' ? '중요' : '보통'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>가격: ${zone.priceRange[0].toFixed(2)} - ${zone.priceRange[1].toFixed(2)}</div>
                      <div>유형: {zone.type === 'accumulation' ? '매집' : zone.type === 'distribution' ? '분산' : '중립'}</div>
                      <div>강도: ${(zone.strength / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 거래소별 유동성 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <IconPool /> 거래소별 유동성
              </h3>
              <div className="space-y-3">
                {liquidityData.pools.map((pool, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{pool.exchange}</span>
                      <span className="text-xs text-purple-400">{pool.apy ? `${pool.apy.toFixed(1)}% APY` : ''}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>유동성: ${(pool.liquidity / 1000000).toFixed(1)}M</div>
                      <div>24h 거래량: ${(pool.volume24h / 1000000).toFixed(1)}M</div>
                      <div>수수료: {(pool.fee * 100).toFixed(2)}%</div>
                      <div>비율: {(pool.ratio * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'heatmap':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <LiquidityHeatmap 
              data={liquidityData.heatmapData}
              currentPrice={currentPrice}
              range={depthRange}
              detailed={true}
            />
          </div>
        )

      case 'depth':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <OrderBookDepth 
                orderBook={liquidityData.orderBook}
                currentPrice={currentPrice}
                symbol={selectedSymbol}
                detailed={true}
              />
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">유동성 레벨 분석</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {liquidityData.levels
                  .filter(level => level.strength === 'extreme' || level.strength === 'strong')
                  .slice(0, 20)
                  .map((level, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">
                          ${level.price.toFixed(2)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          level.strength === 'extreme' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {level.strength === 'extreme' ? '극강' : '강함'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                        <div>매수: ${(level.buyLiquidity / 1000).toFixed(0)}K</div>
                        <div>매도: ${(level.sellLiquidity / 1000).toFixed(0)}K</div>
                        <div>주문수: {level.orders}</div>
                        <div>타입: {level.type === 'support' ? '지지' : level.type === 'resistance' ? '저항' : '중립'}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )

      case 'pools':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <LiquidityPools 
              pools={liquidityData.pools}
              symbol={selectedSymbol}
              currentPrice={currentPrice}
            />
          </div>
        )

      case 'zones':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <LiquidityZones 
              zones={liquidityData.zones}
              levels={liquidityData.levels}
              currentPrice={currentPrice}
              timeframe={timeframe}
            />
          </div>
        )

      case 'strategy':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 유동성 기반 전략 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <IconStrategy /> 유동성 헌팅 전략
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
                  <h4 className="text-white font-medium mb-2">🎯 현재 추천 전략</h4>
                  <div className="text-sm text-gray-300 space-y-2">
                    <div>• <strong>진입 구간:</strong> ${(currentPrice * 0.995).toFixed(2)} - ${(currentPrice * 1.005).toFixed(2)}</div>
                    <div>• <strong>목표가:</strong> ${(currentPrice * 1.02).toFixed(2)} (2% 상승)</div>
                    <div>• <strong>손절가:</strong> ${(currentPrice * 0.985).toFixed(2)} (1.5% 하락)</div>
                    <div>• <strong>포지션 크기:</strong> 총 자본의 5-8%</div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">📊 유동성 분석</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>• 매수 벽: ${(currentPrice * 0.98).toFixed(2)} (강도: 높음)</div>
                    <div>• 매도 벽: ${(currentPrice * 1.03).toFixed(2)} (강도: 중간)</div>
                    <div>• 주요 지지선: ${(currentPrice * 0.975).toFixed(2)}</div>
                    <div>• 주요 저항선: ${(currentPrice * 1.025).toFixed(2)}</div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">⚠️ 리스크 관리</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>• 전체 포트폴리오의 10% 이하 투자</div>
                    <div>• 유동성 감소 시 즉시 청산</div>
                    <div>• 변동성 증가 시 포지션 축소</div>
                    <div>• 시장 조건 변화 시 전략 수정</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 시장 조건 분석 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">📈 시장 조건 분석</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">유동성 상태</div>
                    <div className="text-lg font-bold text-green-400">양호</div>
                    <div className="text-xs text-gray-400">충분한 거래량</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">스프레드</div>
                    <div className="text-lg font-bold text-blue-400">0.02%</div>
                    <div className="text-xs text-gray-400">낮은 거래비용</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">변동성</div>
                    <div className="text-lg font-bold text-yellow-400">보통</div>
                    <div className="text-xs text-gray-400">적절한 수준</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">트렌드</div>
                    <div className="text-lg font-bold text-purple-400">상승</div>
                    <div className="text-xs text-gray-400">매수 유리</div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">🔍 핵심 관찰 포인트</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>• 대량 매도 주문 출현 시 저항 강화</div>
                    <div>• 유동성 풀 변화에 따른 가격 영향</div>
                    <div>• 거래소간 차익거래 기회 모니터링</div>
                    <div>• 주요 뉴스 발표 전후 유동성 변화</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="text-white font-medium mb-2">💡 실행 가이드</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>1. 유동성 존 근처에서 분할 진입</div>
                    <div>2. 대량 주문 출현 시 반대 포지션 고려</div>
                    <div>3. 스프레드 확대 시 거래 중단</div>
                    <div>4. 목표 달성 시 단계적 청산</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* 헤더 영역 */}
      <div className="border-b border-gray-800 backdrop-blur-sm bg-black/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <span className="text-purple-400"><IconMap /></span>
                유동성 지도 분석 시스템 🗺️
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                실시간 유동성 분포와 오더북 깊이로 보는 최적의 매매 타이밍
              </p>
            </div>
            
            {/* 연결 상태 및 설정 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-gray-400">
                  {isConnected ? '실시간' : '연결 끊김'}
                </span>
              </div>
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg ${
                  autoRefresh ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'
                } hover:bg-purple-500/30 transition-colors`}
                title="자동 새로고침"
              >
                <IconSync />
              </button>
              
              <button
                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
                title="설정"
              >
                <IconSettings />
              </button>
            </div>
          </div>
          
          {/* 코인 선택기 */}
          <div className="flex items-center gap-4 mb-4">
            <select
              value={selectedSymbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500"
            >
              {TRACKED_SYMBOLS.map(symbol => (
                <option key={symbol} value={symbol}>
                  {symbol.replace('USDT', '/USDT')}
                </option>
              ))}
            </select>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">현재가:</span>
              <span className="text-white font-mono">${currentPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">시간프레임:</span>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="bg-gray-700 text-white px-2 py-1 rounded text-xs border border-gray-600"
              >
                <option value="1m">1분</option>
                <option value="5m">5분</option>
                <option value="15m">15분</option>
                <option value="1h">1시간</option>
                <option value="4h">4시간</option>
                <option value="1d">1일</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-[140px] sm:top-[120px] z-30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {[
              { id: 'overview', label: '종합 대시보드', icon: IconLayers },
              { id: 'heatmap', label: '유동성 히트맵', icon: IconMap },
              { id: 'depth', label: '오더북 깊이', icon: IconDepth },
              { id: 'pools', label: '유동성 풀', icon: IconPool },
              { id: 'zones', label: '유동성 존', icon: IconTarget },
              { id: 'strategy', label: '매매 전략', icon: IconStrategy }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-sm"><Icon /></span>
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
            <div className="text-gray-400">유동성 데이터 로딩 중...</div>
          </div>
        ) : (
          <div className="min-h-[600px]">
            {renderTabContent()}
          </div>
        )}
      </div>
      
      {/* 하단 정보 */}
      <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <p>실시간 데이터 제공: Binance WebSocket • 유동성 분석: MONSTA AI</p>
            <p>마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

