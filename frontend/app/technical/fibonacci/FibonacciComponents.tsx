'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
  Cell, PieChart, Pie, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Scatter, ScatterChart,
  ComposedChart, Brush, Treemap, Sector, Label
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaChartLine, FaChartBar, FaChartArea, FaExclamationTriangle,
  FaCheckCircle, FaInfoCircle, FaArrowUp, FaArrowDown,
  FaBullseye, FaShieldAlt, FaLock, FaUnlock, FaExpand,
  FaCrosshairs, FaRuler, FaClock, FaLayerGroup, FaChartPie,
  FaTachometerAlt
} from 'react-icons/fa'
import * as FibAnalysis from '@/lib/fibonacciAnalysis'

// ==================== 메인 피보나치 캔들스틱 차트 ====================
export const FibonacciCandlestickChart: React.FC<{
  candleData: any[]
  fibonacciData: FibAnalysis.FibonacciData | null
  currentPrice: number
  selectedSymbol: string
}> = ({ candleData, fibonacciData, currentPrice, selectedSymbol }) => {
  const [hoveredLevel, setHoveredLevel] = useState<FibAnalysis.FibonacciLevel | null>(null)
  
  const chartData = useMemo(() => {
    // 데이터가 없으면 기본 데이터 생성
    if (!candleData || candleData.length === 0) {
      const now = Date.now()
      return Array.from({ length: 50 }, (_, i) => {
        const basePrice = currentPrice || 98000
        const variation = (i % 10) * 50
        const isUp = i % 3 === 0
        return {
          time: new Date(now - (50 - i) * 3600000).toLocaleTimeString(),
          open: basePrice + variation * (isUp ? -1 : 1),
          high: basePrice + variation + 100,
          low: basePrice + variation - 100,
          close: basePrice + variation * (isUp ? 1 : -1),
          volume: 1000000 + (i * 50000),
          color: isUp ? '#16a34a' : '#dc2626'
        }
      })
    }
    
    return candleData.slice(-100).map(candle => ({
      time: typeof candle.time === 'string' 
        ? candle.time 
        : new Date(candle.time).toLocaleTimeString(),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
      color: candle.close >= candle.open ? '#16a34a' : '#dc2626'
    }))
  }, [candleData, currentPrice])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FaChartLine className="text-purple-400" />
          피보나치 레벨 차트
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">현재가:</span>
          <span className="text-lg font-bold text-white">
            ${currentPrice.toLocaleString()}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#9ca3af"
            domain={['dataMin - 100', 'dataMax + 100']}
            tick={{ fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
            labelStyle={{ color: '#9ca3af' }}
          />
          
          {/* 캔들스틱 */}
          <Bar dataKey="high" fill="transparent" />
          <Bar dataKey="low" fill="transparent" />
          <Line type="monotone" dataKey="close" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          
          {/* 피보나치 레벨 */}
          {fibonacciData?.retracements.map((level, idx) => (
            <ReferenceLine
              key={idx}
              y={level.price}
              stroke={level.color}
              strokeDasharray="5 5"
              strokeWidth={hoveredLevel?.price === level.price ? 2 : 1}
              label={{
                value: `${level.label} - $${level.price.toFixed(2)}`,
                position: 'right',
                fill: level.color,
                fontSize: 10
              }}
              onMouseEnter={() => setHoveredLevel(level)}
              onMouseLeave={() => setHoveredLevel(null)}
            />
          ))}
          
          {/* 황금 포켓 영역 */}
          {fibonacciData?.goldenPocket && (
            <ReferenceArea
              y1={fibonacciData.goldenPocket.high}
              y2={fibonacciData.goldenPocket.low}
              fill="#fbbf24"
              fillOpacity={0.1}
              stroke="#fbbf24"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
          
          {/* 현재 가격 라인 */}
          <ReferenceLine
            y={currentPrice}
            stroke="#10b981"
            strokeWidth={2}
            label={{
              value: `현재가`,
              position: 'left',
              fill: '#10b981',
              fontSize: 12
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// ==================== 피보나치 리트레이스먼트 인터랙티브 차트 ====================
export const FibonacciRetracementChart: React.FC<{
  retracements: FibAnalysis.FibonacciLevel[]
  currentPrice: number
  swingHigh: number
  swingLow: number
}> = ({ retracements, currentPrice, swingHigh, swingLow }) => {
  const sortedLevels = useMemo(() => {
    // 데이터가 없으면 기본 피보나치 레벨 생성
    const validHigh = swingHigh > 0 ? swingHigh : (currentPrice || 98000) * 1.05
    const validLow = swingLow > 0 ? swingLow : (currentPrice || 98000) * 0.95
    
    if (!retracements || retracements.length === 0) {
      const defaultRetracements = FibAnalysis.calculateFibonacciRetracements(
        validHigh,
        validLow,
        true
      )
      return [...defaultRetracements].sort((a, b) => b.price - a.price)
    }
    return [...retracements].sort((a, b) => b.price - a.price)
  }, [retracements, swingHigh, swingLow, currentPrice])

  const chartData = sortedLevels.map(level => ({
    name: level.label,
    price: level.price,
    distance: Math.abs((currentPrice || 98000) - level.price),
    color: level.color,
    strength: 100 - (level.level * 100),
    isNearPrice: Math.abs((currentPrice || 98000) - level.price) < ((swingHigh - swingLow) * 0.02)
  }))

  // 동적 Y축 범위 계산
  const allPrices = [...sortedLevels.map(l => l.price), currentPrice || 98000]
  const minPrice = Math.min(...allPrices) * 0.99
  const maxPrice = Math.max(...allPrices) * 1.01

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaRuler className="text-blue-400" />
        되돌림 레벨 분석
      </h3>

      <div className="relative">
        {/* 컴팩트한 2열 그리드 레이아웃 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-2">
            <div className="text-xs text-gray-400 mb-2">지지선 레벨</div>
            {sortedLevels.filter((_, idx) => idx % 2 === 0).map((level) => {
              const distancePercent = Math.abs(((currentPrice || 98000) - level.price) / level.price * 100)
              const isNear = distancePercent < 1
              const isAbove = (currentPrice || 98000) > level.price
              
              return (
                <div key={level.label} className={`p-2 rounded-lg ${isNear ? 'bg-yellow-900/30 border border-yellow-600/50' : 'bg-gray-800/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: level.color }}></div>
                      <span className="text-xs font-bold text-white">{level.label}</span>
                    </div>
                    <span className="text-xs font-mono text-white">
                      ${(level.price / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(5, 100 - distancePercent * 10)}%`,
                        backgroundColor: isNear ? '#fbbf24' : level.color
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="space-y-2">
            <div className="text-xs text-gray-400 mb-2">저항선 레벨</div>
            {sortedLevels.filter((_, idx) => idx % 2 === 1).map((level) => {
              const distancePercent = Math.abs(((currentPrice || 98000) - level.price) / level.price * 100)
              const isNear = distancePercent < 1
              const isAbove = (currentPrice || 98000) > level.price
              
              return (
                <div key={level.label} className={`p-2 rounded-lg ${isNear ? 'bg-yellow-900/30 border border-yellow-600/50' : 'bg-gray-800/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: level.color }}></div>
                      <span className="text-xs font-bold text-white">{level.label}</span>
                    </div>
                    <span className="text-xs font-mono text-white">
                      ${(level.price / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(5, 100 - distancePercent * 10)}%`,
                        backgroundColor: isNear ? '#fbbf24' : level.color
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* 현재 가격 위치 표시기 */}
        <div className="relative h-12 bg-gradient-to-r from-red-900/20 via-yellow-900/20 to-green-900/20 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center">
            {sortedLevels.map((level, idx) => (
              <div 
                key={idx}
                className="absolute h-full w-0.5"
                style={{ 
                  left: `${((level.price - minPrice) / (maxPrice - minPrice)) * 100}%`,
                  backgroundColor: level.color,
                  opacity: 0.5
                }}
              />
            ))}
            <div 
              className="absolute w-3 h-8 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"
              style={{
                left: `${Math.min(95, Math.max(2, ((currentPrice || 98000) - minPrice) / (maxPrice - minPrice) * 100))}%`
              }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-green-400 whitespace-nowrap">
                ${(currentPrice / 1000).toFixed(1)}k
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 text-xs text-gray-500">0%</div>
          <div className="absolute bottom-0 right-0 text-xs text-gray-500">100%</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-green-900/20 rounded-lg">
          <div className="text-sm text-gray-400">스윙 고점</div>
          <div className="text-lg font-bold text-green-400">
            ${(swingHigh || (currentPrice || 98000) * 1.05).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">100%</div>
        </div>
        <div className="text-center p-3 bg-white/10 rounded-lg">
          <div className="text-sm text-gray-400">현재 위치</div>
          <div className="text-lg font-bold text-white">
            ${(currentPrice || 98000).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {(((currentPrice || 98000) - (swingLow || 95000)) / 
              ((swingHigh || 100000) - (swingLow || 95000)) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="text-center p-3 bg-red-900/20 rounded-lg">
          <div className="text-sm text-gray-400">스윙 저점</div>
          <div className="text-lg font-bold text-red-400">
            ${(swingLow || (currentPrice || 98000) * 0.95).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">0%</div>
        </div>
      </div>

      {/* 레벨 설명 */}
      <div className="mt-4 p-3 bg-purple-900/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <FaInfoCircle className="text-purple-400" />
          <span className="text-sm font-bold text-purple-400">주요 레벨 설명</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-400">23.6% - 강한 추세 지속</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">38.2% - 첫 지지/저항</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-400">50% - 중간 지점</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-gray-400">61.8% - 황금 되돌림</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== 피보나치 확장 타겟 차트 ====================
export const FibonacciExtensionChart: React.FC<{
  extensions: FibAnalysis.FibonacciLevel[]
  currentPrice: number
  trend: 'bullish' | 'bearish' | 'neutral'
}> = ({ extensions, currentPrice, trend }) => {
  // 기본 확장 레벨 생성
  const getExtensionData = () => {
    if (extensions && extensions.length > 0) {
      return extensions
    }
    
    const basePrice = currentPrice || 98000
    const extensionLevels = [1.272, 1.618, 2.618, 4.236]
    return extensionLevels.map(level => ({
      level,
      price: basePrice * (1 + (level - 1) * 0.2),
      label: `${(level * 100).toFixed(1)}%`,
      color: level === 1.618 ? '#f97316' : '#9333ea',
      type: 'extension' as const
    }))
  }

  const extensionData = getExtensionData()
  const chartData = extensionData.map(level => ({
    level: level.label,
    target: level.price,
    profit: ((level.price - currentPrice) / currentPrice * 100).toFixed(2),
    distance: Math.abs(level.price - currentPrice),
    color: level.color
  }))

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaExpand className="text-green-400" />
        확장 레벨 목표가
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="level" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, '목표가']}
          />
          <Legend />
          
          <Bar dataKey="target" fill="#10b981" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
            <span className="text-sm text-gray-400">{item.level}</span>
            <span className="text-sm font-bold" style={{ color: item.color }}>
              ${Number(item.target).toFixed(2)}
            </span>
            <span className={`text-sm ${Number(item.profit) > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Number(item.profit) > 0 ? '+' : ''}{item.profit}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ==================== 피보나치 팬 차트 ====================
export const FibonacciFanChart: React.FC<{
  priceHistory: number[]
  fanLines: { x: number; y: number; level: number }[]
}> = ({ priceHistory, fanLines }) => {
  // 데이터가 없으면 기본 데이터 생성
  const getChartData = () => {
    const history = priceHistory && priceHistory.length > 0 
      ? priceHistory 
      : Array.from({ length: 50 }, (_, i) => 98000 + Math.sin(i * 0.2) * 5000)
    
    // 수평 피보나치 레벨 계산
    const maxPrice = Math.max(...history)
    const minPrice = Math.min(...history)
    const range = maxPrice - minPrice
    
    // 고정된 수평선 레벨
    const levels = {
      level0: minPrice,
      level236: minPrice + range * 0.236,
      level382: minPrice + range * 0.382,
      level500: minPrice + range * 0.5,
      level618: minPrice + range * 0.618,
      level786: minPrice + range * 0.786,
      level100: maxPrice
    }
    
    return history.slice(-50).map((price, idx) => ({
      index: idx,
      price: price,
      ...levels
    }))
  }
  
  const chartData = getChartData()
  
  // Y축 동적 범위 계산 - 0%와 100% 레벨에 정확히 맞춤
  const minValue = chartData[0]?.level0 || Math.min(...chartData.map(d => d.price))
  const maxValue = chartData[0]?.level100 || Math.max(...chartData.map(d => d.price))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaCrosshairs className="text-purple-400" />
        피보나치 팬
      </h3>

      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={chartData} margin={{ top: 5, right: 60, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="index" 
            stroke="#9ca3af"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#9ca3af" 
            domain={[minValue, maxValue]}
            tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
            tick={{ fontSize: 10 }}
            ticks={Array.from(new Set([
              minValue, 
              chartData[0]?.level236, 
              chartData[0]?.level382, 
              chartData[0]?.level500, 
              chartData[0]?.level618, 
              chartData[0]?.level786, 
              maxValue
            ].filter(v => v !== undefined)))}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
            formatter={(value: any) => `$${Number(value).toFixed(2)}`}
          />
          
          {/* 가격 라인 */}
          <Line type="monotone" dataKey="price" stroke="#ffffff" strokeWidth={3} dot={false} name="가격" />
          
          {/* 수평 피보나치 레벨 */}
          <ReferenceLine y={chartData[0]?.level0} stroke="#6b7280" strokeDasharray="3 3" strokeWidth={1}>
            <Label value="0%" position="right" fill="#6b7280" />
          </ReferenceLine>
          
          <ReferenceLine y={chartData[0]?.level236} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2}>
            <Label value="23.6%" position="right" fill="#22c55e" />
          </ReferenceLine>
          
          <ReferenceLine y={chartData[0]?.level382} stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={2}>
            <Label value="38.2%" position="right" fill="#3b82f6" />
          </ReferenceLine>
          
          <ReferenceLine y={chartData[0]?.level500} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2}>
            <Label value="50%" position="right" fill="#f59e0b" />
          </ReferenceLine>
          
          <ReferenceLine y={chartData[0]?.level618} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2}>
            <Label value="61.8%" position="right" fill="#ef4444" />
          </ReferenceLine>
          
          <ReferenceLine y={chartData[0]?.level786} stroke="#8b5cf6" strokeDasharray="5 5" strokeWidth={2}>
            <Label value="78.6%" position="right" fill="#8b5cf6" />
          </ReferenceLine>
          
          <ReferenceLine y={chartData[0]?.level100} stroke="#6b7280" strokeDasharray="3 3" strokeWidth={1}>
            <Label value="100%" position="right" fill="#6b7280" />
          </ReferenceLine>
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-5 gap-2">
        <div className="text-center p-2 bg-green-900/20 rounded">
          <div className="text-xs text-green-400">23.6%</div>
          <div className="text-xs font-bold text-white">약한 되돌림</div>
        </div>
        <div className="text-center p-2 bg-blue-900/20 rounded">
          <div className="text-xs text-blue-400">38.2%</div>
          <div className="text-xs font-bold text-white">첫 지지선</div>
        </div>
        <div className="text-center p-2 bg-yellow-900/20 rounded">
          <div className="text-xs text-yellow-400">50%</div>
          <div className="text-xs font-bold text-white">중간선</div>
        </div>
        <div className="text-center p-2 bg-red-900/20 rounded">
          <div className="text-xs text-red-400">61.8%</div>
          <div className="text-xs font-bold text-white">황금비</div>
        </div>
        <div className="text-center p-2 bg-purple-900/20 rounded">
          <div className="text-xs text-purple-400">78.6%</div>
          <div className="text-xs font-bold text-white">강한 저항</div>
        </div>
      </div>
      
      <div className="mt-3 p-3 bg-gray-900/30 rounded-lg">
        <p className="text-xs text-gray-400 text-center">
          피보나치 팬은 시작점에서 방사형으로 퍼지는 지지/저항선으로, 가격의 시간에 따른 움직임을 예측합니다.
        </p>
      </div>
    </motion.div>
  )
}

// ==================== 피보나치 아크 차트 ====================
export const FibonacciArcChart: React.FC<{
  centerPrice: number
  radius: number
  currentPrice: number
}> = ({ centerPrice, radius, currentPrice }) => {
  const arcs = FibAnalysis.calculateFibonacciArcs(50, 50, radius)
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaChartArea className="text-indigo-400" />
        피보나치 아크
      </h3>

      <div className="relative h-[300px] flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* 배경 그리드 */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#374151" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* 피보나치 아크 */}
          {arcs.map((arc, idx) => (
            <g key={idx}>
              <path
                d={`M 50 ${50 + arc.radius} A ${arc.radius} ${arc.radius} 0 0 1 50 ${50 - arc.radius}`}
                fill="none"
                stroke={idx === 0 ? '#3b82f6' : idx === 1 ? '#f59e0b' : '#ef4444'}
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.7"
              />
              <text
                x="50"
                y={50 - arc.radius - 2}
                textAnchor="middle"
                fill={idx === 0 ? '#3b82f6' : idx === 1 ? '#f59e0b' : '#ef4444'}
                fontSize="8"
              >
                {(arc.level * 100).toFixed(1)}%
              </text>
            </g>
          ))}
          
          {/* 중심점 */}
          <circle cx="50" cy="50" r="2" fill="#8b5cf6" />
          
          {/* 현재 가격 포인트 */}
          <circle 
            cx="50" 
            cy={isNaN(50 - ((currentPrice - centerPrice) / radius * 30)) ? 50 : 50 - ((currentPrice - centerPrice) / radius * 30)} 
            r="3" 
            fill="#10b981"
          />
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-blue-900/20 rounded">
          <div className="text-xs text-blue-400">38.2%</div>
          <div className="text-sm font-bold text-white">
            ${(centerPrice + radius * 0.382).toFixed(2)}
          </div>
        </div>
        <div className="text-center p-2 bg-yellow-900/20 rounded">
          <div className="text-xs text-yellow-400">50%</div>
          <div className="text-sm font-bold text-white">
            ${(centerPrice + radius * 0.5).toFixed(2)}
          </div>
        </div>
        <div className="text-center p-2 bg-red-900/20 rounded">
          <div className="text-xs text-red-400">61.8%</div>
          <div className="text-sm font-bold text-white">
            ${(centerPrice + radius * 0.618).toFixed(2)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== 피보나치 시간대 차트 ====================
export const FibonacciTimeZoneChart: React.FC<{
  priceHistory: number[]
  startDate: Date
}> = ({ priceHistory, startDate }) => {
  const timeZones = FibAnalysis.calculateFibonacciTimeZones(startDate, 1)
  
  const chartData = priceHistory.slice(-89).map((price, idx) => ({
    day: idx,
    price: price,
    isZone: FibAnalysis.FIBONACCI_TIME_ZONES.includes(idx)
  }))

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaClock className="text-cyan-400" />
        피보나치 시간대
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="day" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
          />
          
          <Line type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          
          {/* 피보나치 시간대 마커 */}
          {FibAnalysis.FIBONACCI_TIME_ZONES.filter(z => z < 89).map((zone, idx) => (
            <ReferenceLine
              key={idx}
              x={zone}
              stroke="#06b6d4"
              strokeDasharray="5 5"
              label={{
                value: zone.toString(),
                position: 'top',
                fill: '#06b6d4',
                fontSize: 10
              }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-wrap gap-2">
        {FibAnalysis.FIBONACCI_TIME_ZONES.slice(0, 12).map((zone, idx) => (
          <div key={idx} className="px-3 py-1 bg-cyan-900/30 rounded text-cyan-400 text-sm">
            Day {zone}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ==================== 피보나치 클러스터 히트맵 ====================
export const FibonacciClusterHeatmap: React.FC<{
  clusters: FibAnalysis.FibonacciLevel[]
  currentPrice: number
}> = ({ clusters, currentPrice }) => {
  // 기본 클러스터 데이터 생성
  const getHeatmapData = () => {
    if (clusters && clusters.length > 0) {
      return clusters.map((cluster, idx) => ({
        name: `클러스터 ${idx + 1}`,
        price: cluster.price,
        strength: cluster.level * 20,
        distance: Math.abs(currentPrice - cluster.price),
        color: cluster.level >= 4 ? '#dc2626' : cluster.level >= 3 ? '#f59e0b' : '#10b981'
      }))
    }
    
    // 기본 클러스터 생성
    const basePrice = currentPrice || 98000
    return [
      { name: '클러스터 1', price: basePrice * 0.95, strength: 80, distance: basePrice * 0.05, color: '#dc2626' },
      { name: '클러스터 2', price: basePrice * 0.98, strength: 60, distance: basePrice * 0.02, color: '#f59e0b' },
      { name: '클러스터 3', price: basePrice * 1.02, strength: 40, distance: basePrice * 0.02, color: '#10b981' },
      { name: '클러스터 4', price: basePrice * 1.05, strength: 50, distance: basePrice * 0.05, color: '#f59e0b' }
    ]
  }
  
  const heatmapData = getHeatmapData()

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaLayerGroup className="text-pink-400" />
        피보나치 클러스터 히트맵
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          data={heatmapData}
          dataKey="strength"
          aspectRatio={4/3}
          stroke="#fff"
          fill="#8884d8"
        >
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
            formatter={(value: any) => [`강도: ${value}`, '']}
          />
        </Treemap>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {heatmapData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm text-gray-400">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-white">
              ${item.price.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">
              강도: {item.strength.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ==================== 피보나치 나선 차트 (3D 효과) ====================
export const FibonacciSpiralChart: React.FC<{
  centerX?: number
  centerY?: number
  scale?: number
}> = ({ centerX = 200, centerY = 200, scale = 15 }) => {
  const spiralPoints = FibAnalysis.calculateFibonacciSpiral(centerX, centerY, scale, 5)
  
  // 피보나치 사각형 생성
  const fibSquares = useMemo(() => {
    const squares = []
    let a = 1, b = 1
    let x = centerX - 50
    let y = centerY - 50
    
    for (let i = 0; i < 8; i++) {
      const size = a * 10
      squares.push({
        x: x,
        y: y,
        size: size,
        number: a,
        color: `hsl(${i * 45}, 70%, 50%)`
      })
      
      const next = a + b
      a = b
      b = next
      
      // 나선형으로 위치 조정
      if (i % 4 === 0) x -= size
      else if (i % 4 === 1) y -= size
      else if (i % 4 === 2) x += a * 10
      else y += a * 10
    }
    
    return squares
  }, [centerX, centerY])
  
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -180 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ duration: 1 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaChartPie className="text-yellow-400" />
        황금 나선 (Golden Spiral)
      </h3>

      <div className="relative h-[400px] flex items-center justify-center">
        <svg viewBox="0 0 400 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* 배경 */}
          <rect width="400" height="400" fill="#0f172a" />
          
          {/* 그리드 */}
          <defs>
            <pattern id="spiral-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="400" height="400" fill="url(#spiral-grid)" />
          
          {/* 피보나치 사각형 */}
          {fibSquares.map((square, idx) => (
            <g key={idx}>
              <rect
                x={square.x}
                y={square.y}
                width={square.size}
                height={square.size}
                fill="none"
                stroke={square.color}
                strokeWidth="2"
                opacity="0.6"
              />
              <text
                x={square.x + square.size / 2}
                y={square.y + square.size / 2}
                textAnchor="middle"
                fill={square.color}
                fontSize="12"
                opacity="0.8"
              >
                {square.number}
              </text>
            </g>
          ))}
          
          {/* 피보나치 나선 */}
          <path
            d={`M ${spiralPoints[0].x} ${spiralPoints[0].y} ${spiralPoints.map(p => `L ${p.x} ${p.y}`).join(' ')}`}
            fill="none"
            stroke="url(#spiral-gradient)"
            strokeWidth="3"
            opacity="0.9"
          />
          
          {/* 그라디언트 정의 */}
          <defs>
            <linearGradient id="spiral-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="25%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="75%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          
          {/* 중심점 */}
          <circle cx={centerX} cy={centerY} r="5" fill="#fbbf24">
            <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
          </circle>
          
          {/* 황금비율 표시 */}
          <text x="200" y="380" textAnchor="middle" fill="#fbbf24" fontSize="16" fontWeight="bold">
            Φ = 1.618033988...
          </text>
        </svg>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-purple-900/20 rounded">
            <div className="text-xs text-purple-400">피보나치 수열</div>
            <div className="text-xs font-bold text-white">1, 1, 2, 3, 5, 8...</div>
          </div>
          <div className="text-center p-2 bg-yellow-900/20 rounded">
            <div className="text-xs text-yellow-400">황금비율</div>
            <div className="text-xs font-bold text-white">1.618</div>
          </div>
          <div className="text-center p-2 bg-green-900/20 rounded">
            <div className="text-xs text-green-400">자연의 패턴</div>
            <div className="text-xs font-bold text-white">성장 나선</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          피보나치 수열과 황금비율이 만들어내는 완벽한 나선 - 시장의 자연스러운 움직임을 예측
        </p>
      </div>
    </motion.div>
  )
}

// ==================== 피보나치 채널 차트 ====================
export const FibonacciChannelChart: React.FC<{
  priceHistory: number[]
  upperChannel: number[]
  lowerChannel: number[]
  middleChannel: number[]
}> = ({ priceHistory, upperChannel, lowerChannel, middleChannel }) => {
  // 기본 데이터 생성
  const getChartData = () => {
    const history = priceHistory && priceHistory.length > 0
      ? priceHistory
      : Array.from({ length: 50 }, (_, i) => 98000 + Math.sin(i * 0.2) * 1000)
    
    return history.slice(-50).map((price, idx) => ({
      index: idx,
      price: price,
      upper: upperChannel?.[idx] || price * 1.05,
      middle: middleChannel?.[idx] || price,
      lower: lowerChannel?.[idx] || price * 0.95
    }))
  }
  
  const chartData = getChartData()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaChartBar className="text-teal-400" />
        피보나치 채널
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="index" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
            formatter={(value: any) => `$${Number(value).toFixed(2)}`}
          />
          
          <Area 
            type="monotone" 
            dataKey="upper" 
            stroke="#ef4444" 
            fill="#ef4444" 
            fillOpacity={0.1}
            strokeWidth={1}
            strokeDasharray="5 5"
          />
          <Area 
            type="monotone" 
            dataKey="middle" 
            stroke="#f59e0b" 
            fill="#f59e0b" 
            fillOpacity={0.1}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <Area 
            type="monotone" 
            dataKey="lower" 
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.1}
            strokeWidth={1}
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#8b5cf6" 
            strokeWidth={2} 
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-2 bg-red-900/20 rounded">
          <div className="text-xs text-red-400">상단 채널</div>
          <div className="text-sm font-bold text-white">저항선</div>
        </div>
        <div className="text-center p-2 bg-yellow-900/20 rounded">
          <div className="text-xs text-yellow-400">중간 채널</div>
          <div className="text-sm font-bold text-white">중심선</div>
        </div>
        <div className="text-center p-2 bg-green-900/20 rounded">
          <div className="text-xs text-green-400">하단 채널</div>
          <div className="text-sm font-bold text-white">지지선</div>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== 피보나치 스피드 저항선 차트 ====================
export const FibonacciSpeedResistanceChart: React.FC<{
  high: number
  low: number
  periods: number
  currentPrice: number
}> = ({ high, low, periods, currentPrice }) => {
  // 유효한 값 확인 및 기본값 설정
  const validHigh = high || (currentPrice || 98000) * 1.2
  const validLow = low || (currentPrice || 98000) * 0.8
  const validPeriods = periods || 10
  const validPrice = currentPrice || 98000
  
  const speedLines = FibAnalysis.calculateSpeedResistanceLines(validHigh, validLow, validPeriods)
  
  const chartData = speedLines.map(line => ({
    period: `P${line.period}`,
    level1: line.level1,
    level2: line.level2,
    current: validPrice
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaTachometerAlt className="text-orange-400" />
        스피드 저항선
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="period" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
            formatter={(value: any) => `$${Number(value).toFixed(2)}`}
          />
          <Legend />
          
          <Line 
            type="monotone" 
            dataKey="level1" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="1/3 라인"
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="level2" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="2/3 라인"
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="current" 
            stroke="#10b981" 
            strokeWidth={2}
            name="현재가"
            dot={{ fill: '#10b981', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}