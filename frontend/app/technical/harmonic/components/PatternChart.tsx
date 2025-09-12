'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Scatter, ScatterChart, Cell, ReferenceLine, ReferenceArea
} from 'recharts'
import { FaChartLine, FaExpand, FaCompress } from 'react-icons/fa'
import type { HarmonicPattern } from '@/lib/harmonicPatterns'

interface PatternChartProps {
  historicalData: any[]
  detectedPatterns: HarmonicPattern[]
  currentPrice: number
  selectedSymbol: string
  activePattern?: HarmonicPattern | null
}

export default function PatternChart({
  historicalData,
  detectedPatterns,
  currentPrice,
  selectedSymbol,
  activePattern
}: PatternChartProps) {
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick')
  const [showPatternOverlay, setShowPatternOverlay] = useState(true)
  const [showFibonacciLevels, setShowFibonacciLevels] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // 차트 데이터 준비
  const chartData = historicalData.slice(-100).map((item, index) => ({
    index,
    time: new Date(item.time).toLocaleTimeString(),
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volume,
    price: item.close,
    priceMA20: calculateMA(historicalData, index, 20),
    priceMA50: calculateMA(historicalData, index, 50)
  }))

  // 이동평균 계산
  function calculateMA(data: any[], currentIndex: number, period: number) {
    if (currentIndex < period - 1) return null
    const startIndex = Math.max(0, currentIndex - period + 1)
    const slice = data.slice(startIndex, currentIndex + 1)
    const sum = slice.reduce((acc: number, item: any) => acc + item.close, 0)
    return sum / slice.length
  }

  // 피보나치 레벨 계산
  const fibonacciLevels = activePattern ? [
    { level: '0%', price: activePattern.points.X.price },
    { level: '23.6%', price: activePattern.points.X.price + (activePattern.points.D.price - activePattern.points.X.price) * 0.236 },
    { level: '38.2%', price: activePattern.points.X.price + (activePattern.points.D.price - activePattern.points.X.price) * 0.382 },
    { level: '50%', price: activePattern.points.X.price + (activePattern.points.D.price - activePattern.points.X.price) * 0.5 },
    { level: '61.8%', price: activePattern.points.X.price + (activePattern.points.D.price - activePattern.points.X.price) * 0.618 },
    { level: '78.6%', price: activePattern.points.X.price + (activePattern.points.D.price - activePattern.points.X.price) * 0.786 },
    { level: '100%', price: activePattern.points.D.price }
  ] : []

  // 전체화면 토글
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      chartContainerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // 전체화면 변경 이벤트 리스너
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 border border-purple-500/50 rounded-lg p-3">
          <p className="text-white font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Open:</span>
              <span className="text-white">${payload[0]?.payload?.open?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">High:</span>
              <span className="text-green-400">${payload[0]?.payload?.high?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Low:</span>
              <span className="text-red-400">${payload[0]?.payload?.low?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Close:</span>
              <span className="text-white">${payload[0]?.payload?.close?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Volume:</span>
              <span className="text-purple-400">{(payload[0]?.payload?.volume / 1000000).toFixed(2)}M</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // 캔들스틱 렌더링 (SVG 기반)
  const renderCandlestick = () => {
    if (chartData.length === 0) return null
    
    const minPrice = Math.min(...chartData.map(d => d.low))
    const maxPrice = Math.max(...chartData.map(d => d.high))
    const priceRange = maxPrice - minPrice
    const chartHeight = 400
    const chartWidth = 800 // Fixed width for proper text rendering
    
    // 반응형 폰트 크기 설정
    const fontSize = isMobile ? 16 : 12
    const labelFontSize = isMobile ? 14 : 11
    const rectWidth = isMobile ? 55 : 45
    const rectHeight = isMobile ? 24 : 20
    
    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
        {chartData.map((candle, index) => {
          const x = (index / chartData.length) * chartWidth
          const width = chartWidth / chartData.length * 0.8
          
          const highY = ((maxPrice - candle.high) / priceRange) * chartHeight
          const lowY = ((maxPrice - candle.low) / priceRange) * chartHeight
          const openY = ((maxPrice - candle.open) / priceRange) * chartHeight
          const closeY = ((maxPrice - candle.close) / priceRange) * chartHeight
          
          const isGreen = candle.close >= candle.open
          const bodyTop = Math.min(openY, closeY)
          const bodyHeight = Math.abs(closeY - openY)
          
          return (
            <g key={index}>
              {/* Wick */}
              <line
                x1={x + width / 2}
                y1={highY}
                x2={x + width / 2}
                y2={lowY}
                stroke={isGreen ? '#10b981' : '#ef4444'}
                strokeWidth="1"
              />
              {/* Body */}
              <rect
                x={x}
                y={bodyTop}
                width={width}
                height={bodyHeight || 1}
                fill={isGreen ? '#10b981' : '#ef4444'}
                fillOpacity={isGreen ? 0.8 : 0.8}
              />
            </g>
          )
        })}
        
        {/* Pattern Overlay */}
        {showPatternOverlay && activePattern && (
          <g>
            <polyline
              points={`
                ${(activePattern.points.X.index / historicalData.length) * chartWidth},${((maxPrice - activePattern.points.X.price) / priceRange) * chartHeight}
                ${(activePattern.points.A.index / historicalData.length) * chartWidth},${((maxPrice - activePattern.points.A.price) / priceRange) * chartHeight}
                ${(activePattern.points.B.index / historicalData.length) * chartWidth},${((maxPrice - activePattern.points.B.price) / priceRange) * chartHeight}
                ${(activePattern.points.C.index / historicalData.length) * chartWidth},${((maxPrice - activePattern.points.C.price) / priceRange) * chartHeight}
                ${(activePattern.points.D.index / historicalData.length) * chartWidth},${((maxPrice - activePattern.points.D.price) / priceRange) * chartHeight}
              `}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            {/* Pattern Points */}
            {Object.entries(activePattern.points).map(([key, point]) => (
              <g key={key}>
                <circle
                  cx={(point.index / historicalData.length) * chartWidth}
                  cy={((maxPrice - point.price) / priceRange) * chartHeight}
                  r="4"
                  fill="#a855f7"
                />
                <text
                  x={(point.index / historicalData.length) * chartWidth}
                  y={((maxPrice - point.price) / priceRange) * chartHeight - 10}
                  fill="white"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {key}
                </text>
              </g>
            ))}
          </g>
        )}
        
        {/* Fibonacci Levels */}
        {showFibonacciLevels && fibonacciLevels.map((fib, index) => {
          const yPos = ((maxPrice - fib.price) / priceRange) * chartHeight
          return (
            <g key={index}>
              <line
                x1="0"
                y1={yPos}
                x2={chartWidth}
                y2={yPos}
                stroke="#fbbf24"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.5"
              />
              <rect
                x={chartWidth - (rectWidth + 5)}
                y={yPos - (rectHeight / 2)}
                width={rectWidth}
                height={rectHeight}
                fill="#1f2937"
                opacity="0.9"
                rx="2"
              />
              <text
                x={chartWidth - (rectWidth / 2 + 5)}
                y={yPos + (fontSize / 3)}
                fill="#fbbf24"
                fontSize={fontSize}
                textAnchor="middle"
                fontFamily="monospace"
                fontWeight={isMobile ? "600" : "500"}
              >
                {fib.level}
              </text>
              <text
                x={15}
                y={yPos + (labelFontSize / 3)}
                fill="#fbbf24"
                fontSize={labelFontSize}
                textAnchor="start"
                fontFamily="monospace"
                opacity="0.8"
                fontWeight={isMobile ? "500" : "400"}
              >
                ${fib.price.toFixed(2)}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  return (
    <div className="space-y-4">
      {/* 차트 컨트롤 */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('candlestick')}
            className={`px-3 py-1 rounded ${chartType === 'candlestick' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            캔들스틱
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded ${chartType === 'line' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            라인
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 rounded ${chartType === 'area' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            영역
          </button>
        </div>
        
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={showPatternOverlay}
              onChange={(e) => setShowPatternOverlay(e.target.checked)}
              className="rounded"
            />
            패턴 표시
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={showFibonacciLevels}
              onChange={(e) => setShowFibonacciLevels(e.target.checked)}
              className="rounded"
            />
            피보나치 레벨
          </label>
        </div>
        
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
        >
          {isFullscreen ? <FaCompress className="text-white" /> : <FaExpand className="text-white" />}
        </button>
      </div>

      {/* 메인 차트 */}
      <motion.div
        ref={chartContainerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gray-800/30 rounded-xl p-4 border border-gray-700 ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}
      >
        {chartType === 'candlestick' ? (
          <div className="h-[400px]">
            {renderCandlestick()}
          </div>
        ) : chartType === 'line' ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} domain={['dataMin - 100', 'dataMax + 100']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#a855f7" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="priceMA20" stroke="#3b82f6" strokeWidth={1} dot={false} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="priceMA50" stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="5 5" />
              
              {/* Pattern Points */}
              {showPatternOverlay && activePattern && (
                <>
                  <ReferenceLine x={activePattern.points.X.index} stroke="#a855f7" label="X" />
                  <ReferenceLine x={activePattern.points.A.index} stroke="#a855f7" label="A" />
                  <ReferenceLine x={activePattern.points.B.index} stroke="#a855f7" label="B" />
                  <ReferenceLine x={activePattern.points.C.index} stroke="#a855f7" label="C" />
                  <ReferenceLine x={activePattern.points.D.index} stroke="#a855f7" label="D" />
                </>
              )}
              
              {/* Fibonacci Levels */}
              {showFibonacciLevels && fibonacciLevels.map((fib, index) => (
                <ReferenceLine key={index} y={fib.price} stroke="#fbbf24" strokeDasharray="3 3" label={fib.level} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} domain={['dataMin - 100', 'dataMax + 100']} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="price" stroke="#a855f7" fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* 추가 차트들 - 그리드 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 볼륨 차트 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-2">거래량 분석</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="volume" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 패턴 신뢰도 레이더 차트 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-2">패턴 강도 분석</h4>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={[
              { metric: 'XAB 정확도', value: activePattern ? Math.round(100 - Math.abs(activePattern.ratios.XAB - 0.618) * 100) : 0 },
              { metric: 'ABC 정확도', value: activePattern ? Math.round(100 - Math.abs(activePattern.ratios.ABC - 0.5) * 100) : 0 },
              { metric: 'BCD 정확도', value: activePattern ? Math.round(100 - Math.abs(activePattern.ratios.BCD - 1.618) * 100) : 0 },
              { metric: 'XAD 정확도', value: activePattern ? Math.round(100 - Math.abs(activePattern.ratios.XAD - 0.786) * 100) : 0 },
              { metric: 'PRZ 강도', value: activePattern?.prz.strength || 0 },
              { metric: '완성도', value: activePattern?.completion || 0 }
            ]}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis stroke="#9ca3af" domain={[0, 100]} />
              <Radar name="패턴 강도" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* PRZ 히트맵 */}
      {activePattern && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-2">PRZ (Potential Reversal Zone)</h4>
          <div className="relative h-20 bg-gradient-to-r from-green-600 via-yellow-600 to-red-600 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <span className="text-white text-sm font-semibold">${activePattern.prz.low.toFixed(2)}</span>
              <div className="text-center">
                <div className="text-white text-lg font-bold">PRZ</div>
                <div className="text-white text-xs">강도: {activePattern.prz.strength.toFixed(1)}%</div>
              </div>
              <span className="text-white text-sm font-semibold">${activePattern.prz.high.toFixed(2)}</span>
            </div>
            <div 
              className="absolute top-0 bottom-0 bg-purple-500/50 border-l-2 border-r-2 border-white"
              style={{
                left: `${((currentPrice - activePattern.prz.low) / (activePattern.prz.high - activePattern.prz.low)) * 100}%`,
                width: '2px'
              }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                ${currentPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}