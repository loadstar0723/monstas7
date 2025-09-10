'use client'

import { useState, useEffect, useRef } from 'react'
import { FaChartLine, FaExpand, FaCompress, FaSync } from 'react-icons/fa'

interface PinBarChartProps {
  symbol: string
  timeframe: string
  currentPrice: number
}

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  isPinBar?: boolean
  pinBarType?: 'bullish' | 'bearish'
}

export default function PinBarChart({ symbol, timeframe, currentPrice }: PinBarChartProps) {
  const [candles, setCandles] = useState<Candle[]>([])
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 핀 바 패턴 감지
  const detectPinBar = (candle: Candle): { isPinBar: boolean; type?: 'bullish' | 'bearish' } => {
    const body = Math.abs(candle.close - candle.open)
    const totalRange = candle.high - candle.low
    
    if (totalRange === 0) return { isPinBar: false }
    
    const upperWick = candle.high - Math.max(candle.open, candle.close)
    const lowerWick = Math.min(candle.open, candle.close) - candle.low
    
    const bodyRatio = (body / totalRange) * 100
    const upperWickRatio = (upperWick / totalRange) * 100
    const lowerWickRatio = (lowerWick / totalRange) * 100
    
    const isPinBar = bodyRatio <= 30
    const isBullishPin = isPinBar && lowerWickRatio >= 60
    const isBearishPin = isPinBar && upperWickRatio >= 60
    
    if (isBullishPin) return { isPinBar: true, type: 'bullish' }
    if (isBearishPin) return { isPinBar: true, type: 'bearish' }
    return { isPinBar: false }
  }

  // 캔들 데이터 로드
  useEffect(() => {
    const loadCandles = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=${timeframe}&limit=100`)
        const data = await response.json()
        
        if (Array.isArray(data)) {
          const formattedCandles: Candle[] = data.map((k: any[]) => {
            const candle = {
              time: k[0],
              open: parseFloat(k[1]),
              high: parseFloat(k[2]),
              low: parseFloat(k[3]),
              close: parseFloat(k[4]),
              volume: parseFloat(k[5])
            }
            
            const pinBarDetection = detectPinBar(candle)
            return {
              ...candle,
              isPinBar: pinBarDetection.isPinBar,
              pinBarType: pinBarDetection.type
            }
          })
          
          setCandles(formattedCandles)
        }
      } catch (error) {
        console.error('캔들 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadCandles()
    const interval = setInterval(loadCandles, 30000) // 30초마다 업데이트
    
    return () => clearInterval(interval)
  }, [symbol, timeframe])

  // 차트 그리기
  useEffect(() => {
    if (!canvasRef.current || candles.length === 0) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Canvas 크기 설정
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    // 배경
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, rect.width, rect.height)
    
    // 가격 범위 계산
    const visibleCandles = candles.slice(
      Math.max(0, candles.length - 50 * zoom + offset),
      candles.length + offset
    )
    
    if (visibleCandles.length === 0) return
    
    const minPrice = Math.min(...visibleCandles.map(c => c.low))
    const maxPrice = Math.max(...visibleCandles.map(c => c.high))
    const priceRange = maxPrice - minPrice
    const padding = 40
    const chartHeight = rect.height - padding * 2
    const chartWidth = rect.width - padding * 2
    const candleWidth = chartWidth / visibleCandles.length
    
    // 가격 그리드
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 0.5
    ctx.setLineDash([5, 5])
    
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(rect.width - padding, y)
      ctx.stroke()
      
      // 가격 레이블
      const price = maxPrice - (priceRange / 5) * i
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(price.toFixed(2), padding - 5, y + 3)
    }
    
    ctx.setLineDash([])
    
    // 캔들스틱 그리기
    visibleCandles.forEach((candle, index) => {
      const x = padding + index * candleWidth + candleWidth / 2
      const openY = padding + ((maxPrice - candle.open) / priceRange) * chartHeight
      const closeY = padding + ((maxPrice - candle.close) / priceRange) * chartHeight
      const highY = padding + ((maxPrice - candle.high) / priceRange) * chartHeight
      const lowY = padding + ((maxPrice - candle.low) / priceRange) * chartHeight
      
      // 핀 바 하이라이트
      if (candle.isPinBar) {
        ctx.fillStyle = candle.pinBarType === 'bullish' 
          ? 'rgba(34, 197, 94, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)'
        ctx.fillRect(x - candleWidth / 2, padding, candleWidth, chartHeight)
        
        // 핀 바 마커
        ctx.fillStyle = candle.pinBarType === 'bullish' ? '#22C55E' : '#EF4444'
        ctx.beginPath()
        ctx.arc(x, candle.pinBarType === 'bullish' ? lowY + 10 : highY - 10, 3, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // 심지
      ctx.strokeStyle = candle.close >= candle.open ? '#22C55E' : '#EF4444'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()
      
      // 몸통
      const bodyHeight = Math.abs(closeY - openY)
      const bodyY = Math.min(openY, closeY)
      const bodyWidth = candleWidth * 0.7
      
      ctx.fillStyle = candle.close >= candle.open ? '#22C55E' : '#EF4444'
      ctx.fillRect(x - bodyWidth / 2, bodyY, bodyWidth, Math.max(1, bodyHeight))
      
      // 현재 캔들 표시
      if (index === visibleCandles.length - 1) {
        ctx.strokeStyle = '#8B5CF6'
        ctx.lineWidth = 2
        ctx.strokeRect(x - bodyWidth / 2 - 2, bodyY - 2, bodyWidth + 4, Math.max(1, bodyHeight) + 4)
      }
    })
    
    // 현재 가격선
    if (currentPrice >= minPrice && currentPrice <= maxPrice) {
      const currentY = padding + ((maxPrice - currentPrice) / priceRange) * chartHeight
      ctx.strokeStyle = '#8B5CF6'
      ctx.lineWidth = 1
      ctx.setLineDash([10, 5])
      ctx.beginPath()
      ctx.moveTo(padding, currentY)
      ctx.lineTo(rect.width - padding, currentY)
      ctx.stroke()
      
      // 가격 레이블
      ctx.fillStyle = '#8B5CF6'
      ctx.fillRect(rect.width - padding, currentY - 10, padding, 20)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(currentPrice.toFixed(2), rect.width - padding / 2, currentY + 3)
    }
    
    // 범례
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`${symbol} - ${timeframe}`, padding, 20)
    
    // 핀 바 수
    const pinBarCount = visibleCandles.filter(c => c.isPinBar).length
    if (pinBarCount > 0) {
      const bullishCount = visibleCandles.filter(c => c.isPinBar && c.pinBarType === 'bullish').length
      const bearishCount = visibleCandles.filter(c => c.isPinBar && c.pinBarType === 'bearish').length
      
      ctx.fillStyle = '#22C55E'
      ctx.fillText(`Bullish: ${bullishCount}`, padding + 150, 20)
      ctx.fillStyle = '#EF4444'
      ctx.fillText(`Bearish: ${bearishCount}`, padding + 230, 20)
    }
    
  }, [candles, currentPrice, zoom, offset])

  // WebSocket 실시간 업데이트
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${timeframe}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.k) {
        const newCandle: Candle = {
          time: data.k.t,
          open: parseFloat(data.k.o),
          high: parseFloat(data.k.h),
          low: parseFloat(data.k.l),
          close: parseFloat(data.k.c),
          volume: parseFloat(data.k.v)
        }
        
        const pinBarDetection = detectPinBar(newCandle)
        newCandle.isPinBar = pinBarDetection.isPinBar
        newCandle.pinBarType = pinBarDetection.type
        
        setCandles(prev => {
          const updated = [...prev]
          if (updated.length > 0 && updated[updated.length - 1].time === newCandle.time) {
            updated[updated.length - 1] = newCandle
          } else if (data.k.x) {
            updated.push(newCandle)
            if (updated.length > 100) updated.shift()
          }
          return updated
        })
      }
    }
    
    return () => ws.close()
  }, [symbol, timeframe])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.1 : -0.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div 
      ref={containerRef}
      className="bg-gray-800/50 rounded-xl border border-gray-700 h-full"
    >
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">📊 핀 바 차트</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(1)}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition text-sm"
            >
              <FaSync className="inline mr-1" /> 리셋
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition text-sm"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>
        
        {/* 줌 컨트롤 */}
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">줌:</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-gray-300 text-sm font-medium">{(zoom * 100).toFixed(0)}%</span>
        </div>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-3"></div>
              <p className="text-gray-400">차트 로딩 중...</p>
            </div>
          </div>
        ) : (
          <div className="relative" onWheel={handleWheel}>
            <canvas
              ref={canvasRef}
              className="w-full h-[400px] cursor-crosshair"
              style={{ imageRendering: 'crisp-edges' }}
            />
            
            {/* 차트 안내 */}
            <div className="absolute bottom-2 left-2 bg-gray-900/80 rounded-lg p-2 text-xs">
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Bullish Pin</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Bearish Pin</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-10 h-0.5 bg-purple-500"></div>
                  <span>현재가</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}