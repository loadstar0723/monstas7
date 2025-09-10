'use client'

import { useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FaExpand, FaCompress, FaInfoCircle } from 'react-icons/fa'
import { config } from '@/lib/config'

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

interface OrderbookHeatmapProps {
  orderbook: OrderbookData | null
  viewMode: '2D' | '3D'
  showAnimation: boolean
  symbol: string
  currentPrice: number
}

export default function OrderbookHeatmap({
  orderbook,
  viewMode,
  showAnimation,
  symbol,
  currentPrice
}: OrderbookHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()

  // 색상 함수 - 볼륨에 따른 색상 강도
  const getColor = (volume: number, type: 'bid' | 'ask', maxVolume: number) => {
    const intensity = Math.min(volume / maxVolume, 1) // 0 ~ 1
    const opacity = 0.3 + (intensity * 0.7) // 0.3 ~ 1.0
    
    if (type === 'bid') {
      // 매수 - 초록색
      const r = Math.round(16 * (1 - intensity))
      const g = Math.round(185 + (70 * intensity)) // 185 ~ 255
      const b = Math.round(16)
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    } else {
      // 매도 - 빨간색
      const r = Math.round(239 + (16 * intensity)) // 239 ~ 255
      const g = Math.round(68 * (1 - intensity))
      const b = Math.round(68 * (1 - intensity))
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
  }

  // 2D 히트맵 렌더링
  const render2DHeatmap = useMemo(() => {
    return (canvas: HTMLCanvasElement, orderbook: OrderbookData) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 캔버스 크기 설정
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      // 배경 클리어
      ctx.fillStyle = 'rgba(17, 24, 39, 0.9)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 최대 볼륨 계산
      const allLevels = [...orderbook.bids, ...orderbook.asks]
      const maxVolume = Math.max(...allLevels.map(level => level.total))

      // 중간선 위치
      const midY = canvas.height / 2
      const levelHeight = Math.min(25, canvas.height / 40) // 레벨당 높이

      // 매도 주문 렌더링 (위쪽)
      orderbook.asks.slice(0, 20).reverse().forEach((ask, index) => {
        const y = midY - (index + 1) * levelHeight
        const width = (ask.total / maxVolume) * canvas.width * 0.8
        const x = (canvas.width - width) / 2

        // 배경 바
        ctx.fillStyle = getColor(ask.total, 'ask', maxVolume)
        ctx.fillRect(x, y, width, levelHeight - 2)

        // 테두리
        if (ask.total > maxVolume * 0.5) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'
          ctx.lineWidth = 2
          ctx.strokeRect(x, y, width, levelHeight - 2)
        }

        // 텍스트
        ctx.fillStyle = 'white'
        ctx.font = '10px Inter'
        ctx.textAlign = 'left'
        ctx.fillText(`$${ask.price.toFixed(2)}`, x + 5, y + levelHeight / 2 + 3)
        
        ctx.textAlign = 'right'
        ctx.fillText(`${ask.amount.toFixed(4)}`, x + width - 5, y + levelHeight / 2 + 3)
      })

      // 중간 가격선
      ctx.strokeStyle = 'rgba(139, 92, 246, 1)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, midY)
      ctx.lineTo(canvas.width, midY)
      ctx.stroke()

      // 현재 가격 표시
      ctx.fillStyle = 'rgba(139, 92, 246, 1)'
      ctx.fillRect(canvas.width / 2 - 60, midY - 15, 120, 30)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 14px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(`$${currentPrice.toFixed(2)}`, canvas.width / 2, midY + 5)

      // 매수 주문 렌더링 (아래쪽)
      orderbook.bids.slice(0, 20).forEach((bid, index) => {
        const y = midY + index * levelHeight + 2
        const width = (bid.total / maxVolume) * canvas.width * 0.8
        const x = (canvas.width - width) / 2

        // 배경 바
        ctx.fillStyle = getColor(bid.total, 'bid', maxVolume)
        ctx.fillRect(x, y, width, levelHeight - 2)

        // 테두리
        if (bid.total > maxVolume * 0.5) {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)'
          ctx.lineWidth = 2
          ctx.strokeRect(x, y, width, levelHeight - 2)
        }

        // 텍스트
        ctx.fillStyle = 'white'
        ctx.font = '10px Inter'
        ctx.textAlign = 'left'
        ctx.fillText(`$${bid.price.toFixed(2)}`, x + 5, y + levelHeight / 2 + 3)
        
        ctx.textAlign = 'right'
        ctx.fillText(`${bid.amount.toFixed(4)}`, x + width - 5, y + levelHeight / 2 + 3)
      })

      // 스프레드 표시
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '11px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(`Spread: $${orderbook.spread.toFixed(2)} (${orderbook.spreadPercent.toFixed(3)}%)`, 
                   canvas.width / 2, canvas.height - 10)
    }
  }, [currentPrice])

  // 애니메이션 프레임
  useEffect(() => {
    if (!canvasRef.current || !orderbook) return

    const canvas = canvasRef.current
    
    const animate = () => {
      render2DHeatmap(canvas, orderbook)
      
      if (showAnimation) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [orderbook, showAnimation, render2DHeatmap])

  // 리사이즈 처리
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && orderbook) {
        render2DHeatmap(canvasRef.current, orderbook)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [orderbook, render2DHeatmap])

  if (!orderbook) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">오더북 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            오더북 히트맵
            <span className="text-sm text-gray-400">({viewMode})</span>
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-400">매수</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-400">매도</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[600px] bg-gray-900/50"
          style={{ imageRendering: 'crisp-edges' }}
        />
        
        {viewMode === '3D' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center">
              <FaInfoCircle className="text-4xl text-purple-500 mx-auto mb-4" />
              <p className="text-white text-lg font-semibold">3D 뷰는 준비 중입니다</p>
              <p className="text-gray-400 text-sm mt-2">더욱 강력한 시각화 기능이 곧 제공됩니다</p>
            </div>
          </div>
        )}

        {/* 모바일 터치 힌트 */}
        <div className="absolute bottom-4 left-4 right-4 text-center text-xs text-gray-500 sm:hidden">
          핀치 줌으로 확대/축소 가능
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="p-4 bg-gray-800/30 border-t border-gray-700">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">매수 총량</span>
            <p className="text-green-400 font-semibold">
              {orderbook.bids.reduce((sum, bid) => sum + bid.amount, 0).toFixed(4)}
            </p>
          </div>
          <div>
            <span className="text-gray-400">매도 총량</span>
            <p className="text-red-400 font-semibold">
              {orderbook.asks.reduce((sum, ask) => sum + ask.amount, 0).toFixed(4)}
            </p>
          </div>
          <div>
            <span className="text-gray-400">최고 매수가</span>
            <p className="text-white font-semibold">${orderbook.bestBid.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-gray-400">최저 매도가</span>
            <p className="text-white font-semibold">${orderbook.bestAsk.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}