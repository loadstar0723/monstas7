'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FaExpand, FaCompress, FaEye, FaChartBar } from 'react-icons/fa'

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

interface SpoofingHeatmapProps {
  orderbook: OrderbookData | null
  symbol: string
}

export default function SpoofingHeatmap({ orderbook, symbol }: SpoofingHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hoveredOrder, setHoveredOrder] = useState<OrderLevel | null>(null)
  const animationRef = useRef<number>()
  
  // 히트맵 렌더링
  useEffect(() => {
    if (!canvasRef.current || !orderbook) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 캔버스 크기 설정
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    const width = rect.width
    const height = rect.height
    
    // 배경 그리기
    ctx.fillStyle = '#111111'
    ctx.fillRect(0, 0, width, height)
    
    // 중간선 (현재 가격)
    const midY = height / 2
    ctx.strokeStyle = '#666666'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(0, midY)
    ctx.lineTo(width, midY)
    ctx.stroke()
    ctx.setLineDash([])
    
    // 현재 가격 표시
    const currentPrice = (orderbook.bestBid + orderbook.bestAsk) / 2
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 14px monospace'
    ctx.fillText(`$${currentPrice.toFixed(2)}`, 10, midY - 5)
    
    // 매수 주문 렌더링 (아래쪽)
    renderOrders(ctx, orderbook.bids, width, height, midY, height, 'bid')
    
    // 매도 주문 렌더링 (위쪽)
    renderOrders(ctx, orderbook.asks, width, height, 0, midY, 'ask')
    
    // 스푸핑 의심 주문 하이라이트
    highlightSuspiciousOrders(ctx, orderbook, width, height, midY)
    
  }, [orderbook, viewMode])
  
  // 주문 렌더링
  const renderOrders = (
    ctx: CanvasRenderingContext2D,
    orders: OrderLevel[],
    width: number,
    height: number,
    startY: number,
    endY: number,
    type: 'bid' | 'ask'
  ) => {
    if (!orders || orders.length === 0) return
    
    const maxAmount = Math.max(...orders.map(o => o.amount))
    const blockHeight = Math.abs(endY - startY) / orders.length
    const isAsk = type === 'ask'
    
    orders.forEach((order, index) => {
      const y = isAsk 
        ? startY + index * blockHeight
        : startY + index * blockHeight
      
      const intensity = order.amount / maxAmount
      const barWidth = width * intensity
      
      // 색상 결정 (스푸핑 의심 여부에 따라)
      let color: string
      if (order.suspicious) {
        // 스푸핑 의심 - 빨간색 계열
        const alpha = 0.3 + intensity * 0.7
        color = `rgba(255, 0, 0, ${alpha})`
      } else if (order.lifespan && order.lifespan < 1000) {
        // 플래시 오더 - 노란색 계열
        const alpha = 0.3 + intensity * 0.7
        color = `rgba(255, 255, 0, ${alpha})`
      } else {
        // 정상 주문
        if (type === 'bid') {
          const green = Math.floor(100 + intensity * 155)
          color = `rgba(0, ${green}, 0, ${0.3 + intensity * 0.7})`
        } else {
          const red = Math.floor(100 + intensity * 155)
          color = `rgba(${red}, 0, 0, ${0.3 + intensity * 0.7})`
        }
      }
      
      // 바 그리기
      ctx.fillStyle = color
      ctx.fillRect(0, y, barWidth, blockHeight - 1)
      
      // 가격 텍스트
      if (intensity > 0.3) {
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '10px monospace'
        ctx.fillText(`$${order.price.toFixed(2)}`, 5, y + blockHeight/2 + 3)
        
        // 수량 텍스트
        ctx.fillStyle = '#AAAAAA'
        ctx.fillText(`${order.amount.toFixed(4)}`, barWidth - 60, y + blockHeight/2 + 3)
      }
      
      // 취소된 주문 표시
      if (order.cancelled) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, y + blockHeight/2)
        ctx.lineTo(barWidth, y + blockHeight/2)
        ctx.stroke()
      }
    })
  }
  
  // 의심스러운 주문 하이라이트
  const highlightSuspiciousOrders = (
    ctx: CanvasRenderingContext2D,
    orderbook: OrderbookData,
    width: number,
    height: number,
    midY: number
  ) => {
    const allOrders = [...orderbook.bids, ...orderbook.asks]
    const suspiciousOrders = allOrders.filter(o => o.suspicious || (o.lifespan && o.lifespan < 1000))
    
    if (suspiciousOrders.length === 0) return
    
    // 경고 아이콘 그리기
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText('⚠️', width - 40, 30)
    
    // 스푸핑 감지 텍스트
    ctx.fillStyle = 'rgba(255, 255, 0, 0.9)'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(`스푸핑 의심: ${suspiciousOrders.length}개`, width - 150, 50)
  }
  
  // 마우스 이동 핸들러
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !orderbook) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const midY = rect.height / 2
    
    // 마우스 위치에 해당하는 주문 찾기
    const blockHeight = rect.height / 2 / Math.max(orderbook.bids.length, orderbook.asks.length)
    
    if (y < midY) {
      // 매도 영역
      const index = Math.floor(y / blockHeight)
      if (index < orderbook.asks.length) {
        setHoveredOrder(orderbook.asks[index])
      }
    } else {
      // 매수 영역
      const index = Math.floor((y - midY) / blockHeight)
      if (index < orderbook.bids.length) {
        setHoveredOrder(orderbook.bids[index])
      }
    }
  }
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <FaChartBar className="text-purple-400" />
          <h3 className="text-lg font-bold text-white">스푸핑 히트맵</h3>
          <span className="text-sm text-gray-400">{symbol}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === '2D' ? '3D' : '2D')}
            className="px-3 py-1 bg-gray-700 rounded text-sm text-gray-300 hover:bg-gray-600"
          >
            {viewMode}
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-white"
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>
      
      {/* 히트맵 캔버스 */}
      <div className={`relative ${isFullscreen ? 'h-[600px]' : 'h-[400px]'}`}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredOrder(null)}
        />
        
        {/* 호버 정보 */}
        {hoveredOrder && (
          <div className="absolute top-4 left-4 bg-black/90 rounded-lg p-3 text-sm">
            <div className="text-white font-semibold">
              가격: ${hoveredOrder.price.toFixed(2)}
            </div>
            <div className="text-gray-300">
              수량: {hoveredOrder.amount.toFixed(4)}
            </div>
            <div className="text-gray-300">
              총액: ${hoveredOrder.total.toFixed(2)}
            </div>
            {hoveredOrder.lifespan && (
              <div className="text-yellow-400">
                생존시간: {hoveredOrder.lifespan}ms
              </div>
            )}
            {hoveredOrder.suspicious && (
              <div className="text-red-400 font-semibold">
                ⚠️ 스푸핑 의심
              </div>
            )}
          </div>
        )}
        
        {/* 범례 */}
        <div className="absolute bottom-4 right-4 bg-black/80 rounded-lg p-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-300">정상 매수</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-300">정상 매도</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-300">플래시 오더</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded animate-pulse"></div>
              <span className="text-gray-300">스푸핑 의심</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 통계 */}
      <div className="grid grid-cols-4 gap-4 p-4 border-t border-gray-700">
        <div className="text-center">
          <div className="text-xs text-gray-400">스프레드</div>
          <div className="text-sm font-semibold text-white">
            ${orderbook?.spread.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400">스프레드 %</div>
          <div className="text-sm font-semibold text-white">
            {orderbook?.spreadPercent.toFixed(3) || '0.000'}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400">최우선 매수</div>
          <div className="text-sm font-semibold text-green-400">
            ${orderbook?.bestBid.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400">최우선 매도</div>
          <div className="text-sm font-semibold text-red-400">
            ${orderbook?.bestAsk.toFixed(2) || '0.00'}
          </div>
        </div>
      </div>
    </div>
  )
}