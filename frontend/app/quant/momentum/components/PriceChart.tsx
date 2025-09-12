'use client'

import { useEffect, useRef, useState } from 'react'
import { MomentumData } from '../MomentumModule'

interface PriceChartProps {
  symbol: string
  priceHistory: any[]
  currentPrice: number
  momentumData?: MomentumData | null
}

export default function PriceChart({ symbol, priceHistory, currentPrice, momentumData }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rsiCanvasRef = useRef<HTMLCanvasElement>(null)
  const macdCanvasRef = useRef<HTMLCanvasElement>(null)
  const [timeframe, setTimeframe] = useState('1H')
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle')
  const [showIndicators, setShowIndicators] = useState(true)

  // 메인 가격 차트 그리기
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
      ctx.fillText(price.toFixed(2), 5, y + 3)
    }

    // 캔들 차트 그리기
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
    ctx.fillText(currentPrice.toFixed(2), rect.width - padding + 8, currentY + 3)

  }, [priceHistory, currentPrice, chartType])

  // RSI 차트 그리기
  useEffect(() => {
    if (!rsiCanvasRef.current || !showIndicators || priceHistory.length === 0) return

    const canvas = rsiCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // 배경
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, rect.width, rect.height)

    const padding = 60
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2

    // RSI 레벨 라인 그리기
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])

    // 70 라인 (과매수)
    const y70 = padding + (30 / 100) * chartHeight
    ctx.beginPath()
    ctx.moveTo(padding, y70)
    ctx.lineTo(rect.width - padding, y70)
    ctx.stroke()
    ctx.fillStyle = '#ef4444'
    ctx.font = '10px monospace'
    ctx.fillText('70', 5, y70 + 3)

    // 50 라인 (중립)
    const y50 = padding + (50 / 100) * chartHeight
    ctx.beginPath()
    ctx.moveTo(padding, y50)
    ctx.lineTo(rect.width - padding, y50)
    ctx.stroke()
    ctx.fillStyle = '#9ca3af'
    ctx.fillText('50', 5, y50 + 3)

    // 30 라인 (과매도)
    const y30 = padding + (70 / 100) * chartHeight
    ctx.beginPath()
    ctx.moveTo(padding, y30)
    ctx.lineTo(rect.width - padding, y30)
    ctx.stroke()
    ctx.fillStyle = '#10b981'
    ctx.fillText('30', 5, y30 + 3)
    
    ctx.setLineDash([])

    // RSI 값 그리기 (실제 계산된 값이 있다면)
    if (momentumData?.rsi) {
      const rsiY = padding + ((100 - momentumData.rsi) / 100) * chartHeight
      
      // RSI 라인
      ctx.strokeStyle = '#a855f7'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(padding, rsiY)
      ctx.lineTo(rect.width - padding, rsiY)
      ctx.stroke()
      
      // RSI 값 표시
      ctx.fillStyle = '#a855f7'
      ctx.fillRect(rect.width - padding + 5, rsiY - 10, 40, 20)
      ctx.fillStyle = '#ffffff'
      ctx.font = '11px monospace'
      ctx.fillText(momentumData.rsi.toFixed(1), rect.width - padding + 8, rsiY + 3)
    }

  }, [momentumData, showIndicators, priceHistory])

  // MACD 차트 그리기
  useEffect(() => {
    if (!macdCanvasRef.current || !showIndicators || priceHistory.length === 0) return

    const canvas = macdCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // 배경
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, rect.width, rect.height)

    const padding = 60
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2

    // 0 라인
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    const y0 = padding + chartHeight / 2
    ctx.beginPath()
    ctx.moveTo(padding, y0)
    ctx.lineTo(rect.width - padding, y0)
    ctx.stroke()

    // MACD 히스토그램 그리기
    if (momentumData?.macd) {
      const barWidth = chartWidth / priceHistory.length
      const maxValue = Math.max(Math.abs(momentumData.macd.histogram), 1)
      
      // 히스토그램
      if (momentumData.macd.histogram !== 0) {
        const height = Math.abs(momentumData.macd.histogram) / maxValue * (chartHeight / 2)
        const isPositive = momentumData.macd.histogram > 0
        
        ctx.fillStyle = isPositive ? '#10b98180' : '#ef444480'
        
        for (let i = 0; i < priceHistory.length; i++) {
          const x = padding + i * barWidth
          const barHeight = height * (i / priceHistory.length) // 그라데이션 효과
          
          if (isPositive) {
            ctx.fillRect(x, y0 - barHeight, barWidth * 0.8, barHeight)
          } else {
            ctx.fillRect(x, y0, barWidth * 0.8, barHeight)
          }
        }
      }
      
      // MACD 값 표시
      ctx.fillStyle = '#9ca3af'
      ctx.font = '10px monospace'
      ctx.fillText(`MACD: ${momentumData.macd.macd.toFixed(2)}`, padding, 15)
      ctx.fillText(`Signal: ${momentumData.macd.signal.toFixed(2)}`, padding + 100, 15)
      ctx.fillText(`Histogram: ${momentumData.macd.histogram.toFixed(2)}`, padding + 220, 15)
    }

  }, [momentumData, showIndicators, priceHistory])

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">모멘텀 차트</h2>
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
              캔들
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
          {/* 지표 토글 */}
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showIndicators
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            지표
          </button>
        </div>
      </div>

      {/* 차트 캔버스 */}
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

      {/* RSI 차트 */}
      {showIndicators && (
        <div className="mt-4 space-y-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div className="absolute top-2 left-2 text-xs text-gray-400 font-medium">RSI (14)</div>
            <canvas
              ref={rsiCanvasRef}
              className="w-full"
              style={{ height: '120px' }}
            />
          </div>

          {/* MACD 차트 */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div className="absolute top-2 left-2 text-xs text-gray-400 font-medium">MACD</div>
            <canvas
              ref={macdCanvasRef}
              className="w-full"
              style={{ height: '120px' }}
            />
          </div>
        </div>
      )}

      {/* 모멘텀 시그널 요약 */}
      {momentumData && (
        <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">모멘텀 시그널</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-500">RSI 신호:</span>
              <span className={`ml-2 font-medium ${
                momentumData.rsi > 70 ? 'text-red-400' : 
                momentumData.rsi < 30 ? 'text-green-400' : 'text-gray-300'
              }`}>
                {momentumData.rsi > 70 ? '과매수 ⚠️' : 
                 momentumData.rsi < 30 ? '과매도 ✅' : '중립'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">MACD:</span>
              <span className={`ml-2 font-medium ${
                momentumData.macd?.histogram > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {momentumData.macd?.histogram > 0 ? '상승 📈' : '하락 📉'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">추세 강도:</span>
              <span className="ml-2 font-medium text-purple-400">
                {momentumData.momentumScore}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">종합 판단:</span>
              <span className={`ml-2 font-medium ${
                momentumData.trend === 'strong_bullish' ? 'text-green-400' :
                momentumData.trend === 'bullish' ? 'text-green-300' :
                momentumData.trend === 'strong_bearish' ? 'text-red-400' :
                momentumData.trend === 'bearish' ? 'text-red-300' : 'text-gray-300'
              }`}>
                {momentumData.trend === 'strong_bullish' ? '강한 상승' :
                 momentumData.trend === 'bullish' ? '상승' :
                 momentumData.trend === 'strong_bearish' ? '강한 하락' :
                 momentumData.trend === 'bearish' ? '하락' : '중립'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}