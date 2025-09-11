'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { safeFixed, safePrice } from '@/lib/safeFormat'
import { motion, AnimatePresence } from 'framer-motion'
import { FaExpand, FaCompress, FaPlay, FaPause, FaCrosshairs, FaDrawPolygon } from 'react-icons/fa'
import { config } from '@/lib/config'
import type { PatternResult, CandleData } from '../../lib/patternDetection'

// 기존 PatternData는 종료 데이터를 위해 유지
interface PatternData {
  id: string
  type: string
  name: string
  startTime: number
  endTime: number
  startPrice: number
  endPrice: number
  targetPrice: number
  stopLoss: number
  confidence: number
  points?: { time: number, price: number }[]
}

interface MainPatternChartProps {
  candleData: CandleData[]
  patterns?: PatternResult[]
  legacyPatterns?: PatternData[]
  symbol: string
  currentPrice?: number
  timeframe?: string
  onPatternClick?: (pattern: PatternResult | PatternData) => void
}

export default function MainPatternChart({
  candleData = [],
  patterns = [],
  legacyPatterns = [],
  symbol,
  currentPrice = 0,
  timeframe = '1h',
  onPatternClick
}: MainPatternChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showPatternOverlay, setShowPatternOverlay] = useState(true)
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null)
  const [hoveredPattern, setHoveredPattern] = useState<PatternResult | PatternData | null>(null)
  
  // 차트 설정
  const chartConfig = {
    padding: { top: 40, right: 60, bottom: 40, left: 10 },
    candleWidth: 8,
    candleSpacing: 2,
    gridLines: 10,
    volumeHeightRatio: 0.2
  }

  // 가격 범위 계산
  const priceRange = useMemo(() => {
    if (!candleData.length) return { min: 0, max: 0 }
    
    const highs = candleData.map(c => c.high)
    const lows = candleData.map(c => c.low)
    const max = Math.max(...highs)
    const min = Math.min(...lows)
    const padding = (max - min) * 0.1
    
    return { 
      min: min - padding, 
      max: max + padding 
    }
  }, [candleData])

  // 볼륨 범위 계산
  const volumeRange = useMemo(() => {
    if (!candleData.length) return { min: 0, max: 0 }
    
    const volumes = candleData.map(c => c.volume)
    return { 
      min: 0, 
      max: Math.max(...volumes) * 1.1 
    }
  }, [candleData])

  // 캔들 색상 결정
  const getCandleColor = (candle: CandleData) => {
    if (candle.close >= candle.open) {
      return { body: '#10B981', wick: '#10B981' } // 초록색 (상승)
    }
    return { body: '#EF4444', wick: '#EF4444' } // 빨간색 (하락)
  }

  // 패턴 색상 결정
  const getPatternColor = (pattern: PatternData) => {
    const colors: Record<string, string> = {
      headAndShoulders: 'rgba(239, 68, 68, 0.3)',
      doubleTop: 'rgba(245, 158, 11, 0.3)',
      doubleBottom: 'rgba(34, 197, 94, 0.3)',
      triangle: 'rgba(59, 130, 246, 0.3)',
      wedge: 'rgba(139, 92, 246, 0.3)',
      flag: 'rgba(236, 72, 153, 0.3)',
      cup: 'rgba(14, 165, 233, 0.3)',
      default: 'rgba(156, 163, 175, 0.3)'
    }
    return colors[pattern.type] || colors.default
  }

  // 캔들스틱 그리기
  const drawCandle = (ctx: CanvasRenderingContext2D, candle: CandleData, x: number, width: number, chartHeight: number, priceScale: number) => {
    const colors = getCandleColor(candle)
    
    // 심지 그리기
    const highY = chartConfig.padding.top + (priceRange.max - candle.high) * priceScale
    const lowY = chartConfig.padding.top + (priceRange.max - candle.low) * priceScale
    
    ctx.strokeStyle = colors.wick
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x + width / 2, highY)
    ctx.lineTo(x + width / 2, lowY)
    ctx.stroke()
    
    // 몸통 그리기
    const openY = chartConfig.padding.top + (priceRange.max - candle.open) * priceScale
    const closeY = chartConfig.padding.top + (priceRange.max - candle.close) * priceScale
    const bodyTop = Math.min(openY, closeY)
    const bodyHeight = Math.abs(closeY - openY) || 1
    
    ctx.fillStyle = colors.body
    ctx.fillRect(x, bodyTop, width, bodyHeight)
  }

  // 볼륨 바 그리기
  const drawVolume = (ctx: CanvasRenderingContext2D, candle: CandleData, x: number, width: number, volumeHeight: number, volumeY: number, volumeScale: number) => {
    const height = candle.volume * volumeScale
    const y = volumeY + volumeHeight - height
    
    ctx.fillStyle = candle.close >= candle.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
    ctx.fillRect(x, y, width, height)
  }

  // 새로운 패턴 시스템 그리기
  const drawPatternResult = (ctx: CanvasRenderingContext2D, pattern: PatternResult, candleData: CandleData[], canvas: HTMLCanvasElement, chartWidth: number, mainChartHeight: number, priceScale: number) => {
    if (!pattern.keyPoints || pattern.keyPoints.length < 2) return
    
    const color = pattern.direction === 'bullish' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
    const strokeColor = pattern.direction === 'bullish' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
    
    ctx.fillStyle = color
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2
    
    // 주요 포인트 연결
    ctx.beginPath()
    pattern.keyPoints.forEach((point, index) => {
      if (point.index < 0 || point.index >= candleData.length) return
      
      const candle = candleData[point.index]
      const x = chartConfig.padding.left + point.index * (chartConfig.candleWidth + chartConfig.candleSpacing) + chartConfig.candleWidth / 2
      const y = chartConfig.padding.top + (priceRange.max - point.price) * priceScale
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      
      // 포인트 마커 그리기
      ctx.fillStyle = strokeColor
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
      
      // 포인트 레이블
      ctx.fillStyle = 'white'
      ctx.font = '10px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(point.label, x, y - 10)
    })
    ctx.stroke()
    
    // 패턴 영역 강조
    const startX = chartConfig.padding.left + pattern.startIndex * (chartConfig.candleWidth + chartConfig.candleSpacing)
    const endX = chartConfig.padding.left + pattern.endIndex * (chartConfig.candleWidth + chartConfig.candleSpacing) + chartConfig.candleWidth
    const width = endX - startX
    
    ctx.fillStyle = color.replace('0.3', '0.1')
    ctx.fillRect(startX, chartConfig.padding.top, width, mainChartHeight)
    
    // 패턴 이름과 신뢰도
    const centerX = (startX + endX) / 2
    ctx.fillStyle = 'white'
    ctx.font = 'bold 12px Inter'
    ctx.textAlign = 'center'
    ctx.fillText(`${pattern.name} (${pattern.confidence.toFixed(1)}%)`, centerX, chartConfig.padding.top - 5)
    
    // 목표가와 손절가 표시
    if (pattern.targetPrice) {
      const targetY = chartConfig.padding.top + (priceRange.max - pattern.targetPrice) * priceScale
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)'
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(endX, targetY)
      ctx.lineTo(canvas.width - chartConfig.padding.right, targetY)
      ctx.stroke()
      
      ctx.fillStyle = 'rgba(34, 197, 94, 0.8)'
      ctx.font = '10px Inter'
      ctx.textAlign = 'left'
      ctx.fillText(`목표: $${safePrice(pattern.targetPrice, 2)}`, endX + 5, targetY - 2)
    }
    
    if (pattern.stopLoss) {
      const stopY = chartConfig.padding.top + (priceRange.max - pattern.stopLoss) * priceScale
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(endX, stopY)
      ctx.lineTo(canvas.width - chartConfig.padding.right, stopY)
      ctx.stroke()
      
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'
      ctx.font = '10px Inter'
      ctx.textAlign = 'left'
      ctx.fillText(`손절: $${safePrice(pattern.stopLoss, 2)}`, endX + 5, stopY + 10)
    }
    
    ctx.setLineDash([])
  }
  
  // 기존 패턴 그리기 (호환성 유지)
  const drawPattern = (ctx: CanvasRenderingContext2D, pattern: PatternData, candleData: CandleData[], chartWidth: number, chartHeight: number, priceScale: number) => {
    if (!pattern.points || pattern.points.length < 2) return
    
    // 패턴 영역 채우기
    ctx.fillStyle = getPatternColor(pattern)
    ctx.strokeStyle = getPatternColor(pattern).replace('0.3', '0.8')
    ctx.lineWidth = 2
    
    ctx.beginPath()
    pattern.points.forEach((point, index) => {
      const candleIndex = candleData.findIndex(c => c.time >= point.time)
      if (candleIndex === -1) return
      
      const x = chartConfig.padding.left + candleIndex * (chartConfig.candleWidth + chartConfig.candleSpacing) + chartConfig.candleWidth / 2
      const y = chartConfig.padding.top + (priceRange.max - point.price) * priceScale
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // 패턴 이름과 신뢰도 표시
    if (pattern.points.length > 0) {
      const lastPoint = pattern.points[pattern.points.length - 1]
      const candleIndex = candleData.findIndex(c => c.time >= lastPoint.time)
      if (candleIndex !== -1) {
        const x = chartConfig.padding.left + candleIndex * (chartConfig.candleWidth + chartConfig.candleSpacing)
        const y = chartConfig.padding.top + (priceRange.max - lastPoint.price) * priceScale
        
        ctx.fillStyle = 'white'
        ctx.font = 'bold 12px Inter'
        ctx.fillText(`${pattern.name} (${pattern.confidence}%)`, x + 10, y - 10)
      }
    }
  }

  // 차트 렌더링
  const renderChart = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 캔버스 크기 설정
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    
    // 배경 클리어
    ctx.fillStyle = 'rgba(17, 24, 39, 0.95)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 데이터가 없을 때 로딩 메시지 표시
    if (!candleData.length) {
      ctx.fillStyle = 'rgba(156, 163, 175, 0.5)'
      ctx.font = '14px Inter'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('차트 데이터 로딩 중...', canvas.width / 2, canvas.height / 2)
      return
    }
    
    // 차트 영역 계산
    const chartWidth = canvas.width - chartConfig.padding.left - chartConfig.padding.right
    const chartHeight = canvas.height - chartConfig.padding.top - chartConfig.padding.bottom
    const mainChartHeight = chartHeight * (1 - chartConfig.volumeHeightRatio)
    const volumeChartHeight = chartHeight * chartConfig.volumeHeightRatio
    const volumeChartY = chartConfig.padding.top + mainChartHeight + 20
    
    // 스케일 계산
    const priceScale = mainChartHeight / (priceRange.max - priceRange.min)
    const volumeScale = volumeChartHeight / volumeRange.max
    
    // 그리드 그리기
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    
    for (let i = 0; i <= chartConfig.gridLines; i++) {
      const y = chartConfig.padding.top + (mainChartHeight / chartConfig.gridLines) * i
      ctx.beginPath()
      ctx.moveTo(chartConfig.padding.left, y)
      ctx.lineTo(canvas.width - chartConfig.padding.right, y)
      ctx.stroke()
      
      // 가격 레이블
      const price = priceRange.max - ((priceRange.max - priceRange.min) / chartConfig.gridLines) * i
      ctx.fillStyle = 'rgba(156, 163, 175, 0.8)'
      ctx.font = '11px Inter'
      ctx.textAlign = 'right'
      ctx.fillText(safePrice(price, 2), canvas.width - chartConfig.padding.right + 40, y + 4)
    }
    ctx.setLineDash([])
    
    // 캔들과 볼륨 그리기
    const candleWidth = chartConfig.candleWidth
    const totalCandleWidth = candleWidth + chartConfig.candleSpacing
    const visibleCandles = Math.floor(chartWidth / totalCandleWidth)
    const startIndex = Math.max(0, candleData.length - visibleCandles)
    
    candleData.slice(startIndex).forEach((candle, index) => {
      const x = chartConfig.padding.left + index * totalCandleWidth
      
      // 캔들스틱 그리기
      drawCandle(ctx, candle, x, candleWidth, mainChartHeight, priceScale)
      
      // 볼륨 바 그리기
      drawVolume(ctx, candle, x, candleWidth, volumeChartHeight, volumeChartY, volumeScale)
    })
    
    // 패턴 오버레이 그리기
    if (showPatternOverlay) {
      // 새로운 패턴 시스템 그리기
      if (patterns.length > 0) {
        patterns.forEach(pattern => {
          drawPatternResult(ctx, pattern, candleData, canvas, chartWidth, mainChartHeight, priceScale)
        })
      }
      
      // 기존 패턴 그리기 (호환성)
      if (legacyPatterns.length > 0) {
        legacyPatterns.forEach(pattern => {
          drawPattern(ctx, pattern, candleData.slice(startIndex), chartWidth, mainChartHeight, priceScale)
        })
      }
    }
    
    // 현재 가격선 그리기
    const currentPriceY = chartConfig.padding.top + (priceRange.max - currentPrice) * priceScale
    ctx.strokeStyle = 'rgba(139, 92, 246, 1)'
    ctx.lineWidth = 2
    ctx.setLineDash([10, 5])
    ctx.beginPath()
    ctx.moveTo(chartConfig.padding.left, currentPriceY)
    ctx.lineTo(canvas.width - chartConfig.padding.right, currentPriceY)
    ctx.stroke()
    ctx.setLineDash([])
    
    // 현재 가격 레이블
    ctx.fillStyle = 'rgba(139, 92, 246, 1)'
    ctx.fillRect(canvas.width - chartConfig.padding.right + 5, currentPriceY - 12, 50, 24)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 12px Inter'
    ctx.textAlign = 'left'
    ctx.fillText(safePrice(currentPrice, 2), canvas.width - chartConfig.padding.right + 8, currentPriceY + 4)
    
    // 타이틀
    ctx.fillStyle = 'white'
    ctx.font = 'bold 16px Inter'
    ctx.textAlign = 'left'
    ctx.fillText(`${symbol.replace('USDT', '')} / USDT - ${timeframe}`, 20, 30)
  }

  // 애니메이션 루프
  useEffect(() => {
    const animate = () => {
      if (!isPaused) {
        renderChart()
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [candleData, patterns, legacyPatterns, currentPrice, showPatternOverlay, isPaused])

  // 리사이즈 이벤트
  useEffect(() => {
    const handleResize = () => {
      renderChart()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 전체화면 토글
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
    <div ref={containerRef} className="relative w-full h-full">
      {/* 컨트롤 버튼 */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPatternOverlay(!showPatternOverlay)}
          className={`p-2 rounded-lg ${
            showPatternOverlay ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
          } hover:opacity-80 transition-all`}
          title="패턴 오버레이"
        >
          <FaDrawPolygon />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPaused(!isPaused)}
          className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-all"
          title={isPaused ? "재생" : "일시정지"}
        >
          {isPaused ? <FaPlay /> : <FaPause />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleFullscreen}
          className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-all"
          title={isFullscreen ? "전체화면 종료" : "전체화면"}
        >
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </motion.button>
      </div>

      {/* 캔버스 */}
      <canvas 
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
      />

      {/* 호버 정보 */}
      {hoveredCandle && (
        <div className="absolute top-12 left-4 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs">
          <div className="text-gray-400 mb-1">시간: {new Date(hoveredCandle.time).toLocaleString()}</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>시가: <span className="text-white">${safePrice(hoveredCandle.open)}</span></div>
            <div>고가: <span className="text-white">${safePrice(hoveredCandle.high)}</span></div>
            <div>종가: <span className="text-white">${safePrice(hoveredCandle.close)}</span></div>
            <div>저가: <span className="text-white">${safePrice(hoveredCandle.low)}</span></div>
            <div className="col-span-2">거래량: <span className="text-white">{safeFixed(hoveredCandle.volume, 2)}</span></div>
          </div>
        </div>
      )}

      {/* 패턴 정보 */}
      {hoveredPattern && (
        <div className="absolute bottom-4 left-4 bg-gray-900 border border-purple-500 rounded-lg p-3 text-xs max-w-xs">
          <div className="text-purple-400 font-bold mb-1">{hoveredPattern.name}</div>
          <div className="space-y-1">
            <div>신뢰도: <span className="text-white font-bold">{hoveredPattern.confidence.toFixed(1)}%</span></div>
            {hoveredPattern.targetPrice && <div>목표가: <span className="text-green-400">${safePrice(hoveredPattern.targetPrice)}</span></div>}
            {hoveredPattern.stopLoss && <div>손절가: <span className="text-red-400">${safePrice(hoveredPattern.stopLoss)}</span></div>}
            {'direction' in hoveredPattern && <div>방향: <span className={hoveredPattern.direction === 'bullish' ? 'text-green-400' : 'text-red-400'}>{hoveredPattern.direction === 'bullish' ? '상승' : '하락'}</span></div>}
          </div>
        </div>
      )}
    </div>
  )
}