'use client'

import { useState, useEffect, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaLayerGroup, FaSearchPlus, FaSearchMinus, FaSyncAlt, FaExclamationCircle } from 'react-icons/fa'
import { BINANCE_CONFIG } from '@/lib/binanceConfig'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface Props {
  selectedCoin: CoinInfo
}

interface DepthLevel {
  price: number
  quantity: number
  total: number
  type: 'bid' | 'ask'
}

export default function MarketDepthAnalyzer({ selectedCoin }: Props) {
  const [depthData, setDepthData] = useState<DepthLevel[]>([])
  const [marketInsights, setMarketInsights] = useState({
    buyWalls: [] as { price: number; size: number }[],
    sellWalls: [] as { price: number; size: number }[],
    imbalance: 0,
    support: 0,
    resistance: 0
  })
  const [zoom, setZoom] = useState(1)
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    loadDepthData()
    connectWebSocket()

    return () => {
      if (wsRef.current) wsRef.current.close()
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [selectedCoin.fullSymbol])

  useEffect(() => {
    if (depthData.length > 0) {
      draw3DDepth()
    }
  }, [depthData, zoom])

  const connectWebSocket = () => {
    if (wsRef.current) wsRef.current.close()

    const wsUrl = `${BINANCE_CONFIG.WS_BASE}/${selectedCoin.fullSymbol.toLowerCase()}@depth@100ms`
    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      updateDepthData(data)
    }
  }

  const loadDepthData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/binance/depth?symbol=${selectedCoin.fullSymbol}&limit=100`)
      const data = await response.json()
      
      const processedData = processOrderBook(data)
      setDepthData(processedData)
      analyzeMarketStructure(processedData)
      setLoading(false)
    } catch (error) {
      console.error('시장 심도 데이터 로드 실패:', error)
      setLoading(false)
    }
  }

  const processOrderBook = (data: any): DepthLevel[] => {
    // 데이터 검증
    if (!data || !data.bids || !data.asks || 
        !Array.isArray(data.bids) || !Array.isArray(data.asks) ||
        data.bids.length === 0 || data.asks.length === 0) {
      console.warn('오더북 데이터가 비어있습니다')
      return []
    }
    
    const midPrice = (parseFloat(data.bids[0][0]) + parseFloat(data.asks[0][0])) / 2
    const priceRange = midPrice * 0.05 // ±5% 범위
    
    const levels: DepthLevel[] = []
    let bidTotal = 0
    let askTotal = 0

    // 매수 호가 처리
    data.bids.forEach((bid: any) => {
      if (!bid || !Array.isArray(bid) || bid.length < 2) return
      
      const price = parseFloat(bid[0])
      const quantity = parseFloat(bid[1])
      if (price > midPrice - priceRange) {
        bidTotal += quantity
        levels.push({
          price,
          quantity,
          total: bidTotal,
          type: 'bid'
        })
      }
    })

    // 매도 호가 처리
    data.asks.forEach((ask: any) => {
      if (!ask || !Array.isArray(ask) || ask.length < 2) return
      
      const price = parseFloat(ask[0])
      const quantity = parseFloat(ask[1])
      if (price < midPrice + priceRange) {
        askTotal += quantity
        levels.push({
          price,
          quantity,
          total: askTotal,
          type: 'ask'
        })
      }
    })

    return levels.sort((a, b) => a.price - b.price)
  }

  const updateDepthData = (wsData: any) => {
    // WebSocket 데이터로 실시간 업데이트
    const processedData = processOrderBook({
      bids: wsData.b,
      asks: wsData.a
    })
    setDepthData(processedData)
    analyzeMarketStructure(processedData)
  }

  const analyzeMarketStructure = (data: DepthLevel[]) => {
    if (!data || data.length === 0) {
      setMarketInsights({
        buyWalls: [],
        sellWalls: [],
        imbalance: 0,
        support: 0,
        resistance: 0
      })
      return
    }
    
    const bids = data.filter(d => d.type === 'bid')
    const asks = data.filter(d => d.type === 'ask')
    
    if (bids.length === 0 || asks.length === 0) {
      setMarketInsights({
        buyWalls: [],
        sellWalls: [],
        imbalance: 0,
        support: 0,
        resistance: 0
      })
      return
    }
    
    // 대규모 매수/매도 벽 찾기
    const avgBidSize = bids.reduce((sum, b) => sum + b.quantity, 0) / bids.length
    const avgAskSize = asks.reduce((sum, a) => sum + a.quantity, 0) / asks.length
    
    const buyWalls = bids
      .filter(b => b.quantity > avgBidSize * 3)
      .map(b => ({ price: b.price, size: b.quantity }))
      .slice(0, 3)
    
    const sellWalls = asks
      .filter(a => a.quantity > avgAskSize * 3)
      .map(a => ({ price: a.price, size: a.quantity }))
      .slice(0, 3)
    
    // 불균형도 계산
    const totalBidVolume = bids.reduce((sum, b) => sum + b.quantity, 0)
    const totalAskVolume = asks.reduce((sum, a) => sum + a.quantity, 0)
    const imbalance = ((totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume)) * 100
    
    // 지지/저항선
    const support = buyWalls[0]?.price || bids[bids.length - 1]?.price || 0
    const resistance = sellWalls[0]?.price || asks[0]?.price || 0
    
    setMarketInsights({
      buyWalls,
      sellWalls,
      imbalance,
      support,
      resistance
    })
  }

  const draw3DDepth = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Canvas 크기 설정
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    
    // 배경 지우기
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    if (!depthData || depthData.length === 0) {
      // 데이터가 없을 때 안내 메시지
      ctx.fillStyle = '#6B7280'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('시장 깊이 데이터를 기다리는 중...', canvas.width / 2, canvas.height / 2)
      return
    }
    
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    
    // 가격 범위 계산
    const minPrice = Math.min(...depthData.map(d => d.price))
    const maxPrice = Math.max(...depthData.map(d => d.price))
    const priceRange = maxPrice - minPrice
    
    // 수량 범위 계산
    const maxQuantity = Math.max(...depthData.map(d => d.quantity))
    
    // 3D 효과를 위한 변수
    const perspective = 300
    const rotationY = Date.now() * 0.0001
    
    // 그리드 그리기
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 0.5
    
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // 심도 레벨 그리기
    depthData.forEach((level, index) => {
      const x = ((level.price - minPrice) / priceRange) * width * 0.8 + width * 0.1
      const barHeight = (level.quantity / maxQuantity) * height * 0.6 * zoom
      const z = index * 2
      
      // 3D 변환
      const scaleFactor = perspective / (perspective + z)
      const offsetX = (x - centerX) * scaleFactor + centerX
      const offsetY = height - barHeight * scaleFactor
      
      // 색상 설정
      if (level.type === 'bid') {
        const opacity = 0.7 - z * 0.002
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`
        ctx.strokeStyle = `rgba(16, 185, 129, ${opacity + 0.2})`
      } else {
        const opacity = 0.7 - z * 0.002
        ctx.fillStyle = `rgba(239, 68, 68, ${opacity})`
        ctx.strokeStyle = `rgba(239, 68, 68, ${opacity + 0.2})`
      }
      
      // 막대 그리기
      ctx.beginPath()
      ctx.rect(
        offsetX - 2 * scaleFactor,
        offsetY,
        4 * scaleFactor,
        barHeight * scaleFactor
      )
      ctx.fill()
      ctx.stroke()
      
      // 대규모 주문 표시
      if (marketInsights.buyWalls.find(w => w.price === level.price) ||
          marketInsights.sellWalls.find(w => w.price === level.price)) {
        ctx.beginPath()
        ctx.arc(offsetX, offsetY - 10, 5 * scaleFactor, 0, Math.PI * 2)
        ctx.fillStyle = '#F59E0B'
        ctx.fill()
      }
    })
    
    // 애니메이션 계속
    animationRef.current = requestAnimationFrame(() => draw3DDepth())
  }

  const formatPrice = (price: number) => {
    if (price >= 10000) return safePrice(price, 0)
    if (price >= 100) return safePrice(price, 2)
    return safePrice(price, 4)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
    return safeFixed(volume, 2)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
            <FaLayerGroup className={`text-xl ${selectedCoin.color}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">시장 심도 분석</h2>
            <p className="text-gray-400">{selectedCoin.name} 시장 깊이 3D 시각화</p>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">시장 심도 데이터 로듩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaLayerGroup className={`text-lg sm:text-xl ${selectedCoin.color}`} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">시장 심도 분석</h2>
          <p className="text-sm sm:text-base text-gray-400">{selectedCoin.name} 시장 깊이 3D 시각화</p>
        </div>
      </div>
      
      {/* 3D 시각화 캔버스 - 모바일 높이 조정 */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-white">3D 심도 시각화</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="축소"
            >
              <FaSearchMinus className="text-gray-300" />
            </button>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="확대"
            >
              <FaSearchPlus className="text-gray-300" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="리셋"
            >
              <FaSyncAlt className="text-gray-300" />
            </button>
          </div>
        </div>
        
        <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '300px' }}>
          <canvas 
            ref={canvasRef}
            className="w-full h-full"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div className="absolute bottom-2 left-2 text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded" />
                매수
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded" />
                매도
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded" />
                대규모 주문
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 시장 구조 분석 - 모바일 2열 그리드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">주문 불균형</p>
          <p className={`text-lg sm:text-2xl font-bold ${
            marketInsights.imbalance > 10 ? 'text-green-400' : 
            marketInsights.imbalance < -10 ? 'text-red-400' : 'text-white'
          }`}>
            {safeFixed(marketInsights.imbalance, 1)}%
          </p>
          <p className="text-xs text-gray-400">
            {marketInsights.imbalance > 10 ? '매수 우세' : 
             marketInsights.imbalance < -10 ? '매도 우세' : '균형'}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">지지선</p>
          <p className="text-lg sm:text-2xl font-bold text-green-400">
            ${formatPrice(marketInsights.support)}
          </p>
          <p className="text-xs text-gray-400">강한 매수 영역</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">저항선</p>
          <p className="text-lg sm:text-2xl font-bold text-red-400">
            ${formatPrice(marketInsights.resistance)}
          </p>
          <p className="text-xs text-gray-400">강한 매도 영역</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">대규모 주문</p>
          <p className="text-lg sm:text-2xl font-bold text-purple-400">
            {marketInsights.buyWalls.length + marketInsights.sellWalls.length}
          </p>
          <p className="text-xs text-gray-400">감지된 벽</p>
        </div>
      </div>

      {/* 대규모 주문 목록 - 모바일 스크롤 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 매수 벽 */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-green-400 mb-3">대규모 매수 벽</h3>
          <div className="space-y-2">
            {marketInsights.buyWalls.length > 0 ? (
              marketInsights.buyWalls.map((wall, index) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">${formatPrice(wall.price)}</span>
                    <span className="text-green-400">{formatVolume(wall.size)} {selectedCoin.symbol}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (wall.size / Math.max(...marketInsights.buyWalls.map(w => w.size))) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">감지된 대규모 매수 주문이 없습니다</p>
            )}
          </div>
        </div>

        {/* 매도 벽 */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-red-400 mb-3">대규모 매도 벽</h3>
          <div className="space-y-2">
            {marketInsights.sellWalls.length > 0 ? (
              marketInsights.sellWalls.map((wall, index) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">${formatPrice(wall.price)}</span>
                    <span className="text-red-400">{formatVolume(wall.size)} {selectedCoin.symbol}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-400 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (wall.size / Math.max(...marketInsights.sellWalls.map(w => w.size))) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">감지된 대규모 매도 주문이 없습니다</p>
            )}
          </div>
        </div>
      </div>

      {/* 마켓 메이킹 인사이트 - 모바일 최적화 */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 sm:p-6 border border-purple-600/30">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <FaExclamationCircle className="text-purple-400" />
          시장 심도 기반 전략
        </h3>
        <div className="space-y-2 text-xs sm:text-sm text-gray-300">
          <p>• 현재 주문 불균형: <span className={`font-semibold ${
            marketInsights.imbalance > 10 ? 'text-green-400' : 
            marketInsights.imbalance < -10 ? 'text-red-400' : 'text-white'
          }`}>{safeFixed(marketInsights.imbalance, 1)}%</span> {marketInsights.imbalance > 0 ? '매수' : '매도'} 쪽으로 편향</p>
          
          {marketInsights.buyWalls.length > 0 && (
            <p>• 주의: <span className="text-yellow-400">${formatPrice(marketInsights.buyWalls[0].price)}</span> 부근에 강한 매수 벽 존재</p>
          )}
          
          {marketInsights.sellWalls.length > 0 && (
            <p>• 주의: <span className="text-yellow-400">${formatPrice(marketInsights.sellWalls[0].price)}</span> 부근에 강한 매도 벽 존재</p>
          )}
          
          <p>• 권장 전략: {Math.abs(marketInsights.imbalance) > 20 ? 
            '불균형이 심하므로 주문 크기를 줄이고 스프레드를 넓힐 것' :
            '현재 수준에서 정상적인 마켓 메이킹 가능'
          }</p>
          
          <p>• 포지션 방향: {marketInsights.imbalance > 10 ? 
            '매도 포지션을 늘려 균형 맞추기' : 
            marketInsights.imbalance < -10 ?
            '매수 포지션을 늘려 균형 맞추기' :
            '양쪽 균형 유지'
          }</p>
        </div>
      </div>
    </div>
  )
}