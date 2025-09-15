'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartLine, FaFan, FaInfoCircle, FaChartArea,
  FaArrowUp, FaArrowDown, FaExclamationTriangle
} from 'react-icons/fa'
import { 
  AreaChart, Area, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Dot
} from 'recharts'

interface FanChartProps {
  symbol: string
}

export default function FanChart({ symbol }: FanChartProps) {
  const [forecastData, setForecastData] = useState<any[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '1w' | '1m'>('1w')
  const [confidenceLevel, setConfidenceLevel] = useState(95)
  
  // Fan Chart 데이터 생성
  useEffect(() => {
    const generateFanChartData = () => {
      const basePrice = symbol === 'BTCUSDT' ? 50000 : symbol === 'ETHUSDT' ? 3500 : 700
      const historicalDays = 30
      const forecastDays = selectedTimeframe === '1d' ? 1 : selectedTimeframe === '1w' ? 7 : 30
      const data = []
      
      // 과거 데이터
      for (let i = -historicalDays; i <= 0; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        
        data.push({
          date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
          day: i,
          actual: basePrice + Math.sin(i / 5) * 1000 + Math.random() * 500,
          forecast: null,
          lower50: null,
          upper50: null,
          lower80: null,
          upper80: null,
          lower95: null,
          upper95: null
        })
      }
      
      // 예측 데이터 - Fan 형태로 퍼지는 불확실성
      for (let i = 1; i <= forecastDays; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        
        const trendComponent = basePrice + i * 50
        const uncertaintyGrowth = Math.sqrt(i) * 200
        
        const forecast = trendComponent + Math.sin(i / 5) * 500
        
        data.push({
          date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
          day: i,
          actual: null,
          forecast,
          lower50: forecast - uncertaintyGrowth * 0.67,
          upper50: forecast + uncertaintyGrowth * 0.67,
          lower80: forecast - uncertaintyGrowth * 1.28,
          upper80: forecast + uncertaintyGrowth * 1.28,
          lower95: forecast - uncertaintyGrowth * 1.96,
          upper95: forecast + uncertaintyGrowth * 1.96
        })
      }
      
      return data
    }
    
    setForecastData(generateFanChartData())
  }, [symbol, selectedTimeframe])

  // 예측 통계
  const forecastStats = {
    finalPrice: forecastData[forecastData.length - 1]?.forecast || 0,
    priceChange: forecastData[forecastData.length - 1]?.forecast - (forecastData.find(d => d.day === 0)?.actual || 0),
    uncertainty: forecastData[forecastData.length - 1]?.upper95 - forecastData[forecastData.length - 1]?.lower95 || 0,
    confidence: confidenceLevel
  }

  const timeframes = [
    { id: '1d', label: '1일', icon: FaChartLine },
    { id: '1w', label: '1주', icon: FaChartArea },
    { id: '1m', label: '1개월', icon: FaFan }
  ]

  const confidenceLevels = [
    { value: 50, color: '#10b981', label: '50%' },
    { value: 80, color: '#3b82f6', label: '80%' },
    { value: 95, color: '#8b5cf6', label: '95%' }
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaFan className="text-blue-400" />
          Fan Chart - 불확실성 시각화
        </h2>
        <p className="text-gray-300">
          시간이 지날수록 증가하는 예측 불확실성을 부채꼴 모양으로 시각화합니다
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
        {/* 시간대 선택 */}
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setSelectedTimeframe(tf.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedTimeframe === tf.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/50'
              }`}
            >
              <tf.icon />
              <span>{tf.label}</span>
            </button>
          ))}
        </div>

        {/* 신뢰구간 선택 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400">신뢰구간:</span>
          <select
            value={confidenceLevel}
            onChange={(e) => {
              if (e && e.target && e.target.value) {
                setConfidenceLevel(Number(e.target.value))
              }
            }}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            {confidenceLevels.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fan Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <ResponsiveContainer width="100%" height={500}>
          <AreaChart data={forecastData}>
            <defs>
              {/* 그라데이션 정의 */}
              <linearGradient id="area95" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="area80" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="area50" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any) => value ? `$${value.toFixed(0)}` : 'N/A'}
            />
            
            {/* 95% 신뢰구간 */}
            {confidenceLevel >= 95 && (
              <>
                <Area
                  type="monotone"
                  dataKey="upper95"
                  stackId="1"
                  stroke="none"
                  fill="url(#area95)"
                />
                <Area
                  type="monotone"
                  dataKey="lower95"
                  stackId="2"
                  stroke="none"
                  fill="url(#area95)"
                />
              </>
            )}
            
            {/* 80% 신뢰구간 */}
            {confidenceLevel >= 80 && (
              <>
                <Area
                  type="monotone"
                  dataKey="upper80"
                  stackId="3"
                  stroke="none"
                  fill="url(#area80)"
                />
                <Area
                  type="monotone"
                  dataKey="lower80"
                  stackId="4"
                  stroke="none"
                  fill="url(#area80)"
                />
              </>
            )}
            
            {/* 50% 신뢰구간 */}
            {confidenceLevel >= 50 && (
              <>
                <Area
                  type="monotone"
                  dataKey="upper50"
                  stackId="5"
                  stroke="none"
                  fill="url(#area50)"
                />
                <Area
                  type="monotone"
                  dataKey="lower50"
                  stackId="6"
                  stroke="none"
                  fill="url(#area50)"
                />
              </>
            )}
            
            {/* 실제 가격 */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={false}
              name="실제 가격"
            />
            
            {/* 예측 중앙값 */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#fff"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="예측값"
            />
            
            {/* 현재 시점 표시 */}
            <ReferenceLine x={forecastData.find(d => d.day === 0)?.date} stroke="#ef4444" strokeDasharray="3 3" />
          </AreaChart>
        </ResponsiveContainer>
        
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500"></div>
            <span className="text-gray-400">실제 가격</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-white" style={{ backgroundImage: 'repeating-linear-gradient(90deg, white 0, white 5px, transparent 5px, transparent 10px)' }}></div>
            <span className="text-gray-400">예측값</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-b from-purple-500/30 to-purple-500/10"></div>
            <span className="text-gray-400">불확실성 범위</span>
          </div>
        </div>
      </motion.div>

      {/* 예측 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center"
        >
          <FaChartLine className="text-3xl text-blue-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white">
            ${forecastStats.finalPrice.toFixed(0)}
          </div>
          <div className="text-sm text-gray-400 mt-1">예측 가격</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center"
        >
          {forecastStats.priceChange > 0 ? (
            <FaArrowUp className="text-3xl text-green-400 mx-auto mb-3" />
          ) : (
            <FaArrowDown className="text-3xl text-red-400 mx-auto mb-3" />
          )}
          <div className={`text-2xl font-bold ${forecastStats.priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {forecastStats.priceChange > 0 ? '+' : ''}{((forecastStats.priceChange / (forecastData.find(d => d.day === 0)?.actual || 1)) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400 mt-1">예상 변동률</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center"
        >
          <FaExclamationTriangle className="text-3xl text-yellow-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white">
            ±${(forecastStats.uncertainty / 2).toFixed(0)}
          </div>
          <div className="text-sm text-gray-400 mt-1">불확실성 범위</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center"
        >
          <FaInfoCircle className="text-3xl text-purple-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white">
            {forecastStats.confidence}%
          </div>
          <div className="text-sm text-gray-400 mt-1">신뢰수준</div>
        </motion.div>
      </div>

      {/* Fan Chart 설명 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaInfoCircle className="text-blue-400" />
          Fan Chart 해석 가이드
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-2">불확실성의 증가</h4>
            <p className="text-gray-400 text-sm">
              시간이 지날수록 예측의 불확실성이 증가하여 부채꼴 모양으로 퍼지게 됩니다. 
              이는 미래로 갈수록 예측이 어려워짐을 시각적으로 표현합니다.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">신뢰구간의 의미</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• 50% 구간: 실제 가격이 이 범위에 있을 확률 50%</li>
              <li>• 80% 구간: 실제 가격이 이 범위에 있을 확률 80%</li>
              <li>• 95% 구간: 실제 가격이 이 범위에 있을 확률 95%</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">색상의 강도</h4>
            <p className="text-gray-400 text-sm">
              진한 색상일수록 해당 가격대에 있을 확률이 높고, 
              연한 색상일수록 확률이 낮지만 가능성은 있음을 의미합니다.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">활용 방법</h4>
            <p className="text-gray-400 text-sm">
              리스크 관리를 위해 최악의 시나리오(하한선)와 최상의 시나리오(상한선)를 
              모두 고려하여 투자 전략을 수립하세요.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}