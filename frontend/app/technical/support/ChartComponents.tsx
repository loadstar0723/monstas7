'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
  Cell, PieChart, Pie, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Scatter, ScatterChart,
  ComposedChart, Brush
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaChartLine, FaChartBar, FaChartArea, FaExclamationTriangle,
  FaCheckCircle, FaInfoCircle, FaArrowUp, FaArrowDown,
  FaBullseye, FaShieldAlt, FaLock, FaUnlock
} from 'react-icons/fa'
import { Candle, SupportResistanceLevel, VolumeProfile, FibonacciLevel } from '@/lib/supportResistance'

// ==================== 메인 캔들스틱 차트 with S/R 레벨 ====================
export const SupportResistanceCandlestickChart: React.FC<{
  candles: Candle[]
  levels: SupportResistanceLevel[]
  currentPrice: number
  selectedSymbol: string
}> = ({ candles, levels, currentPrice, selectedSymbol }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [hoveredLevel, setHoveredLevel] = useState<SupportResistanceLevel | null>(null)

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    return candles.slice(-100).map(candle => ({
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
  }, [candles])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FaChartLine className="text-purple-400" />
          실시간 차트 & 지지/저항 레벨
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">현재가:</span>
          <span className="text-lg font-bold text-white">
            ${currentPrice.toLocaleString()}
          </span>
        </div>
      </div>

      <div ref={chartRef} className="relative">
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
              formatter={(value: any) => `$${Number(value).toLocaleString()}`}
            />
            
            {/* 캔들스틱 바 */}
            <Bar dataKey="high" fill="#16a34a" opacity={0} />
            <Bar dataKey="low" fill="#dc2626" opacity={0} />
            
            {/* OHLC 라인 */}
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#a855f7" 
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
            
            {/* 볼륨 바 */}
            <Bar 
              dataKey="volume" 
              fill="#6366f1" 
              opacity={0.3}
              yAxisId="volume"
            />
            
            {/* 지지/저항 레벨 */}
            {levels.map((level, index) => (
              <ReferenceLine
                key={index}
                y={level.price}
                stroke={level.type === 'support' ? '#16a34a' : '#dc2626'}
                strokeDasharray="5 5"
                strokeWidth={level.strength / 50}
                label={{
                  value: `${level.type === 'support' ? 'S' : 'R'}: $${level.price.toLocaleString()}`,
                  position: 'left',
                  fill: level.type === 'support' ? '#16a34a' : '#dc2626',
                  fontSize: 10
                }}
              />
            ))}
            
            {/* 현재가 라인 */}
            <ReferenceLine
              y={currentPrice}
              stroke="#fbbf24"
              strokeWidth={2}
              label={{
                value: 'Current',
                position: 'right',
                fill: '#fbbf24',
                fontSize: 12
              }}
            />
            
            <YAxis yAxisId="volume" orientation="right" stroke="#9ca3af" />
          </ComposedChart>
        </ResponsiveContainer>

        {/* 레벨 정보 오버레이 */}
        {hoveredLevel && (
          <div className="absolute top-4 right-4 bg-gray-900/90 p-3 rounded-lg border border-gray-600">
            <p className="text-white font-semibold">{hoveredLevel.description}</p>
            <p className="text-sm text-gray-400">강도: {hoveredLevel.strength.toFixed(0)}%</p>
            <p className="text-sm text-gray-400">터치: {hoveredLevel.touches}회</p>
            <p className="text-sm text-gray-400">돌파 확률: {hoveredLevel.breakoutProbability.toFixed(0)}%</p>
          </div>
        )}
      </div>

      {/* 레벨 범례 */}
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green-500"></div>
          <span className="text-sm text-gray-400">지지선</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500"></div>
          <span className="text-sm text-gray-400">저항선</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-yellow-500"></div>
          <span className="text-sm text-gray-400">현재가</span>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== 볼륨 프로파일 히트맵 ====================
export const VolumeProfileHeatmap: React.FC<{
  volumeProfile: VolumeProfile[]
  currentPrice: number
}> = ({ volumeProfile, currentPrice }) => {
  const maxVolume = Math.max(...volumeProfile.map(vp => vp.volume))
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaChartBar className="text-blue-400" />
        볼륨 프로파일 히트맵
      </h3>

      <div className="space-y-2">
        {volumeProfile.slice(0, 30).map((vp, index) => {
          const intensity = vp.volume / maxVolume
          const isNearPrice = Math.abs(vp.price - currentPrice) / currentPrice < 0.01
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div className="w-20 text-right">
                <span className="text-xs text-gray-400">
                  ${vp.price.toFixed(2)}
                </span>
              </div>
              <div className="flex-1 relative h-6">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${intensity * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.02 }}
                  className={`h-full rounded ${
                    vp.type === 'POC' ? 'bg-yellow-500' :
                    vp.type === 'VAH' ? 'bg-blue-500' :
                    vp.type === 'VAL' ? 'bg-green-500' :
                    vp.type === 'HVN' ? 'bg-purple-500' :
                    'bg-gray-600'
                  }`}
                  style={{ opacity: 0.3 + intensity * 0.7 }}
                />
                {isNearPrice && (
                  <div className="absolute inset-0 border-2 border-yellow-400 rounded animate-pulse" />
                )}
              </div>
              <div className="w-16">
                <span className="text-xs text-gray-500">
                  {vp.type}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-400">POC (최대 거래량)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-400">VAH (상단 밸류)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-400">VAL (하단 밸류)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span className="text-gray-400">HVN (고거래)</span>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== 레벨 강도 게이지 차트 ====================
export const LevelStrengthGauge: React.FC<{
  levels: SupportResistanceLevel[]
}> = ({ levels }) => {
  const topLevels = levels.slice(0, 5)
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaShieldAlt className="text-green-400" />
        레벨 강도 분석
      </h3>

      <div className="space-y-4">
        {topLevels.map((level, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900/50 p-4 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {level.type === 'support' ? (
                  <FaArrowUp className="text-green-400" />
                ) : (
                  <FaArrowDown className="text-red-400" />
                )}
                <span className="text-white font-semibold">
                  ${level.price.toLocaleString()}
                </span>
              </div>
              <span className={`text-sm px-2 py-1 rounded ${
                level.strength >= 80 ? 'bg-green-500/20 text-green-400' :
                level.strength >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                level.strength >= 40 ? 'bg-orange-500/20 text-orange-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {level.strength.toFixed(0)}% 강도
              </span>
            </div>

            {/* 강도 바 */}
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${level.strength}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                className={`h-full ${
                  level.strength >= 80 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                  level.strength >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                  level.strength >= 40 ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
                  'bg-gradient-to-r from-red-500 to-red-400'
                }`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500">터치</span>
                <p className="text-white font-semibold">{level.touches}회</p>
              </div>
              <div>
                <span className="text-gray-500">볼륨</span>
                <p className="text-white font-semibold">{level.volumeConfirmation.toFixed(0)}%</p>
              </div>
              <div>
                <span className="text-gray-500">돌파확률</span>
                <p className={`font-semibold ${
                  level.breakoutProbability >= 70 ? 'text-red-400' :
                  level.breakoutProbability >= 50 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {level.breakoutProbability.toFixed(0)}%
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ==================== 피보나치 레벨 차트 ====================
export const FibonacciLevelsChart: React.FC<{
  fibLevels: FibonacciLevel[]
  currentPrice: number
  priceHistory: number[]
}> = ({ fibLevels, currentPrice, priceHistory }) => {
  const chartData = priceHistory.slice(-50).map((price, index) => ({
    index,
    price,
    ...fibLevels.reduce((acc, fib) => ({
      ...acc,
      [`fib_${fib.label}`]: fib.price
    }), {})
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaBullseye className="text-yellow-400" />
        피보나치 리트레이스먼트
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="index" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" domain={['dataMin - 100', 'dataMax + 100']} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
            formatter={(value: any) => `$${Number(value).toLocaleString()}`}
          />
          
          {/* 가격 라인 */}
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#a855f7" 
            strokeWidth={2}
            dot={false}
          />
          
          {/* 피보나치 레벨 */}
          {fibLevels.filter(f => f.isStrong).map((fib, index) => (
            <ReferenceLine
              key={index}
              y={fib.price}
              stroke={
                fib.label === '0%' || fib.label === '100%' ? '#ef4444' :
                fib.label === '50%' ? '#eab308' :
                fib.label === '61.8%' || fib.label === '38.2%' ? '#10b981' :
                '#6b7280'
              }
              strokeDasharray="5 5"
              label={{
                value: `${fib.label}: $${fib.price.toFixed(2)}`,
                position: 'left',
                fill: '#9ca3af',
                fontSize: 10
              }}
            />
          ))}
          
          {/* 현재가 */}
          <ReferenceLine
            y={currentPrice}
            stroke="#fbbf24"
            strokeWidth={2}
            label={{
              value: 'Current',
              position: 'right',
              fill: '#fbbf24'
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {fibLevels.filter(f => f.isStrong).map((fib, index) => (
          <div 
            key={index}
            className={`p-2 rounded-lg ${
              Math.abs(fib.price - currentPrice) / currentPrice < 0.02
                ? 'bg-yellow-500/20 border border-yellow-500'
                : 'bg-gray-700/50'
            }`}
          >
            <p className="text-xs text-gray-400">{fib.label}</p>
            <p className="text-sm font-semibold text-white">
              ${fib.price.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ==================== 브레이크아웃 확률 차트 ====================
export const BreakoutProbabilityChart: React.FC<{
  levels: SupportResistanceLevel[]
}> = ({ levels }) => {
  const chartData = levels.slice(0, 8).map(level => ({
    price: `$${level.price.toFixed(0)}`,
    probability: level.breakoutProbability,
    strength: 100 - level.strength, // 강도가 낮을수록 돌파 쉬움
    type: level.type
  }))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaUnlock className="text-orange-400" />
        브레이크아웃 확률 분석
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="price" stroke="#9ca3af" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
          <Radar
            name="돌파 확률"
            dataKey="probability"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.6}
          />
          <Radar
            name="취약도"
            dataKey="strength"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.3}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
            formatter={(value: any) => `${value}%`}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/30">
          <p className="text-orange-400 text-sm font-semibold">높은 돌파 가능성</p>
          <p className="text-white text-lg font-bold">
            {levels.filter(l => l.breakoutProbability >= 70).length}개 레벨
          </p>
        </div>
        <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
          <p className="text-green-400 text-sm font-semibold">강한 방어 레벨</p>
          <p className="text-white text-lg font-bold">
            {levels.filter(l => l.breakoutProbability < 30).length}개 레벨
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== 실시간 레벨 접근 알림 ====================
export const RealTimeLevelAlerts: React.FC<{
  currentPrice: number
  levels: SupportResistanceLevel[]
}> = ({ currentPrice, levels }) => {
  const [alerts, setAlerts] = useState<Array<{
    level: SupportResistanceLevel
    distance: number
    percentage: number
    status: 'approaching' | 'testing' | 'broken'
  }>>([])

  useEffect(() => {
    const nearbyLevels = levels.filter(level => {
      const distance = Math.abs(level.price - currentPrice)
      const percentage = (distance / currentPrice) * 100
      return percentage < 2 // 2% 이내 레벨
    })

    const newAlerts = nearbyLevels.map(level => {
      const distance = level.price - currentPrice
      const percentage = (Math.abs(distance) / currentPrice) * 100
      let status: 'approaching' | 'testing' | 'broken'
      
      if (percentage < 0.1) status = 'testing'
      else if (percentage < 0.5) status = 'approaching'
      else status = 'approaching'
      
      // 레벨 돌파 체크
      if (level.type === 'resistance' && currentPrice > level.price) status = 'broken'
      if (level.type === 'support' && currentPrice < level.price) status = 'broken'
      
      return { level, distance, percentage, status }
    })

    setAlerts(newAlerts.sort((a, b) => a.percentage - b.percentage))
  }, [currentPrice, levels])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaExclamationTriangle className="text-yellow-400" />
        실시간 레벨 알림
      </h3>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FaInfoCircle className="text-4xl mx-auto mb-2 opacity-50" />
            <p>현재 가격 근처에 중요 레벨이 없습니다</p>
          </div>
        ) : (
          alerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${
                alert.status === 'testing' 
                  ? 'bg-yellow-500/10 border-yellow-500 animate-pulse' :
                alert.status === 'broken'
                  ? 'bg-purple-500/10 border-purple-500' :
                  'bg-blue-500/10 border-blue-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {alert.status === 'testing' ? (
                    <FaExclamationTriangle className="text-yellow-400" />
                  ) : alert.status === 'broken' ? (
                    <FaCheckCircle className="text-purple-400" />
                  ) : (
                    <FaInfoCircle className="text-blue-400" />
                  )}
                  <div>
                    <p className="text-white font-semibold">
                      {alert.level.type === 'support' ? '지지선' : '저항선'} 
                      {' '}${alert.level.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      {alert.status === 'testing' ? '테스트 중' :
                       alert.status === 'broken' ? '돌파됨' :
                       '접근 중'} ({alert.percentage.toFixed(2)}% 거리)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">강도</p>
                  <p className="text-white font-bold">{alert.level.strength.toFixed(0)}%</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

// ==================== 클러스터 히트맵 ====================
export const ClusterHeatmap: React.FC<{
  clusters: Array<{ price: number; count: number; sources: string[] }>
}> = ({ clusters }) => {
  const maxCount = Math.max(...clusters.map(c => c.count))
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaLock className="text-red-400" />
        레벨 클러스터 (합류점)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clusters.slice(0, 6).map((cluster, index) => {
          const intensity = cluster.count / maxCount
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative p-4 rounded-lg overflow-hidden"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(239, 68, 68, ${intensity * 0.3}) 0%, 
                  rgba(168, 85, 247, ${intensity * 0.3}) 100%)`
              }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-lg">
                    ${cluster.price.toFixed(2)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    cluster.count >= 4 ? 'bg-red-500 text-white' :
                    cluster.count >= 3 ? 'bg-orange-500 text-white' :
                    'bg-yellow-500 text-black'
                  }`}>
                    {cluster.count}개 합류
                  </span>
                </div>
                <div className="space-y-1">
                  {cluster.sources.map((source, i) => (
                    <p key={i} className="text-xs text-gray-300">
                      • {source}
                    </p>
                  ))}
                </div>
              </div>
              
              {/* 배경 효과 */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle at center, 
                    rgba(239, 68, 68, ${intensity}) 0%, 
                    transparent 70%)`
                }}
              />
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
        <p className="text-yellow-400 text-sm">
          💡 클러스터 레벨은 여러 지표가 합류하는 강력한 지지/저항 지점입니다
        </p>
      </div>
    </motion.div>
  )
}

// ==================== 트레이딩 전략 카드 ====================
export const TradingStrategyCard: React.FC<{
  strategy: any
  currentPrice: number
}> = ({ strategy, currentPrice }) => {
  const riskAmount = Math.abs(currentPrice - strategy.stopLoss)
  const rewardAmount = Math.abs(strategy.takeProfit - currentPrice)
  const riskPercent = (riskAmount / currentPrice) * 100
  const rewardPercent = (rewardAmount / currentPrice) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaChartLine className="text-purple-400" />
        실시간 트레이딩 전략
      </h3>

      <div className="space-y-4">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <p className="text-gray-400 text-sm mb-1">전략</p>
          <p className="text-white font-semibold text-lg">{strategy.entryStrategy}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">진입가</p>
            <p className="text-white font-bold">${strategy.entryPrice.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">포지션 크기</p>
            <p className="text-white font-bold">{strategy.positionSize}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/30">
            <p className="text-red-400 text-sm mb-1">손절가 (Stop Loss)</p>
            <p className="text-white font-bold">${strategy.stopLoss.toLocaleString()}</p>
            <p className="text-red-400 text-xs">-{riskPercent.toFixed(2)}%</p>
          </div>
          <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
            <p className="text-green-400 text-sm mb-1">목표가 (Take Profit)</p>
            <p className="text-white font-bold">${strategy.takeProfit.toLocaleString()}</p>
            <p className="text-green-400 text-xs">+{rewardPercent.toFixed(2)}%</p>
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Risk/Reward 비율</span>
            <span className={`font-bold text-lg ${
              strategy.riskRewardRatio >= 2 ? 'text-green-400' :
              strategy.riskRewardRatio >= 1.5 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              1:{strategy.riskRewardRatio.toFixed(2)}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full flex">
              <div 
                className="bg-red-500"
                style={{ width: `${100 / (1 + strategy.riskRewardRatio)}%` }}
              />
              <div 
                className="bg-green-500"
                style={{ width: `${(strategy.riskRewardRatio * 100) / (1 + strategy.riskRewardRatio)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
          <p className="text-blue-400 text-sm mb-1">권장 레버리지</p>
          <p className="text-white font-bold">{strategy.recommendedLeverage}</p>
        </div>
      </div>
    </motion.div>
  )
}