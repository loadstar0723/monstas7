'use client'

import { useEffect, useRef, useState } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface PriceChartProps {
  symbol: string
  priceHistory: any[]
  currentPrice: number
}

export default function PriceChart({ symbol, priceHistory, currentPrice }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [timeframe, setTimeframe] = useState('1H')
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle')

  useEffect(() => {
    if (!canvasRef.current || priceHistory.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas 크기 설정
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // 배경 그리기
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // 차트 그리기
    const padding = 60
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2

    if (priceHistory.length === 0) return

    // 가격 범위 계산
    const prices = priceHistory.map(d => [d.high, d.low, d.close]).flat()
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice

    // Y축 그리드 및 레이블
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    ctx.font = '11px monospace'
    ctx.fillStyle = '#9ca3af'

    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      const price = maxPrice - (priceRange / 5) * i
      
      // 그리드 라인
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(rect.width - padding, y)
      ctx.stroke()
      
      // 가격 레이블
      ctx.fillText(safePrice(price, 2), 5, y + 3)
    }

    // 캤들 차트 그리기
    const candleWidth = Math.max(2, (chartWidth / priceHistory.length) * 0.8)
    const candleSpacing = chartWidth / priceHistory.length

    priceHistory.forEach((candle, index) => {
      const x = padding + index * candleSpacing + candleSpacing / 2
      
      const highY = padding + ((maxPrice - candle.high) / priceRange) * chartHeight
      const lowY = padding + ((maxPrice - candle.low) / priceRange) * chartHeight
      const openY = padding + ((maxPrice - candle.open) / priceRange) * chartHeight
      const closeY = padding + ((maxPrice - candle.close) / priceRange) * chartHeight
      
      const isGreen = candle.close >= candle.open
      
      // 심지 그리기
      ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()
      
      // 몸통 그리기
      if (chartType === 'candle') {
        ctx.fillStyle = isGreen ? '#10b981' : '#ef4444'
        const bodyTop = Math.min(openY, closeY)
        const bodyHeight = Math.abs(closeY - openY)
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight || 1)
      }
    })

    // 현재 가격 라인
    const currentY = padding + ((maxPrice - currentPrice) / priceRange) * chartHeight
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(padding, currentY)
    ctx.lineTo(rect.width - padding, currentY)
    ctx.stroke()
    ctx.setLineDash([])

    // 현재 가격 레이블
    ctx.fillStyle = '#a855f7'
    ctx.fillRect(rect.width - padding + 5, currentY - 10, 50, 20)
    ctx.fillStyle = '#ffffff'
    ctx.font = '11px monospace'
    ctx.fillText(safePrice(currentPrice, 2), rect.width - padding + 8, currentY + 3)

  }, [priceHistory, currentPrice, chartType])

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">가격 차트</h2>
        <div className="flex gap-2">
          {/* 타임프레임 선택 */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {['1H', '4H', '1D', '1W'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          {/* 차트 타입 */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setChartType('candle')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === 'candle'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              캤들
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              라인
            </button>
          </div>
        </div>
      </div>

      {/* 차트 캤버스 */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: '400px' }}
        />
        
        {/* 차트 로딩 */}
        {priceHistory.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">차트 데이터 로딩 중...</p>
            </div>
          </div>
        )}
      </div>

      {/* 차트 설명 */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-gray-500 text-xs">최고가 (24H)</p>
          <p className="text-white font-semibold">
            ${priceHistory.length > 0 ? Math.max(...priceHistory.map(d => d.high)).toFixed(2) : '-'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs">최저가 (24H)</p>
          <p className="text-white font-semibold">
            ${priceHistory.length > 0 ? Math.min(...priceHistory.map(d => d.low)).toFixed(2) : '-'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs">거래량</p>
          <p className="text-white font-semibold">
            {priceHistory.length > 0 ? (priceHistory[priceHistory.length - 1].volume / 1000000).toFixed(2) + 'M' : '-'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs">캤들 수</p>
          <p className="text-white font-semibold">{priceHistory.length}</p>
        </div>
      </div>
    </div>
  )
}