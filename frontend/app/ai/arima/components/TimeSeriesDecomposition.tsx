'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaWaveSquare, FaChartLine, FaClock, FaChartArea,
  FaArrowUp, FaArrowDown, FaBalanceScale
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Brush, Cell
} from 'recharts'

interface TimeSeriesDecompositionProps {
  symbol: string
}

export default function TimeSeriesDecomposition({ symbol }: TimeSeriesDecompositionProps) {
  const [decompositionData, setDecompositionData] = useState<any[]>([])
  const [selectedComponent, setSelectedComponent] = useState<'all' | 'trend' | 'seasonal' | 'residual'>('all')
  
  // 시계열 분해 데이터 생성
  useEffect(() => {
    const generateDecompositionData = () => {
      const basePrice = symbol === 'BTCUSDT' ? 50000 : symbol === 'ETHUSDT' ? 3500 : 700
      const data = []
      
      for (let i = 0; i < 200; i++) {
        const time = new Date(Date.now() - (200 - i) * 3600000).toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
        
        // 트렌드 성분: 장기적인 상승/하락 추세
        const trend = basePrice + (i - 100) * 50 + Math.sin(i / 50) * 1000
        
        // 계절성 성분: 24시간 주기의 패턴
        const seasonal = Math.sin(i * Math.PI / 12) * 500 + Math.cos(i * Math.PI / 6) * 300
        
        // 잔차 성분: 랜덤 노이즈
        const residual = (Math.random() - 0.5) * 200
        
        // 원본 시계열 = 트렌드 + 계절성 + 잔차
        const original = trend + seasonal + residual
        
        data.push({
          time,
          index: i,
          original,
          trend,
          seasonal,
          residual
        })
      }
      
      return data
    }
    
    setDecompositionData(generateDecompositionData())
  }, [symbol])

  // 컴포넌트별 통계
  const componentStats = {
    trend: {
      strength: 0.82,
      direction: 'up',
      change: '+2.3%',
      description: '강한 상승 트렌드'
    },
    seasonal: {
      strength: 0.65,
      period: '24시간',
      amplitude: '±1.5%',
      description: '일간 주기성 감지'
    },
    residual: {
      variance: 0.18,
      normality: 0.92,
      autocorrelation: 0.05,
      description: '정규분포에 가까운 노이즈'
    }
  }

  const components = [
    { id: 'all', label: '전체 보기', icon: FaChartArea },
    { id: 'trend', label: '트렌드', icon: FaChartLine },
    { id: 'seasonal', label: '계절성', icon: FaClock },
    { id: 'residual', label: '잔차', icon: FaBalanceScale }
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaWaveSquare className="text-blue-400" />
          시계열 분해 (STL Decomposition)
        </h2>
        <p className="text-gray-300">
          복잡한 시계열 데이터를 트렌드, 계절성, 잔차로 분해하여 각 패턴을 명확하게 파악합니다
        </p>
      </div>

      {/* 컴포넌트 선택 */}
      <div className="flex justify-center gap-2 mb-6">
        {components.map((comp) => (
          <button
            key={comp.id}
            onClick={() => setSelectedComponent(comp.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              selectedComponent === comp.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/50'
            }`}
          >
            <comp.icon />
            <span>{comp.label}</span>
          </button>
        ))}
      </div>

      {/* 분해 차트 */}
      <div className="space-y-4">
        {/* 원본 시계열 */}
        {(selectedComponent === 'all' || selectedComponent === 'trend') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-bold text-white mb-4">원본 시계열</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={decompositionData}>
                <defs>
                  <linearGradient id="originalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="original"
                  stroke="#8b5cf6"
                  fill="url(#originalGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* 트렌드 성분 */}
        {(selectedComponent === 'all' || selectedComponent === 'trend') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">트렌드 성분</h3>
              <div className="flex items-center gap-2">
                <FaArrowUp className="text-green-400" />
                <span className="text-green-400 font-semibold">{componentStats.trend.change}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={decompositionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* 계절성 성분 */}
        {(selectedComponent === 'all' || selectedComponent === 'seasonal') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">계절성 성분</h3>
              <div className="flex items-center gap-2">
                <FaClock className="text-yellow-400" />
                <span className="text-yellow-400 font-semibold">{componentStats.seasonal.period}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={decompositionData}>
                <defs>
                  <linearGradient id="seasonalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="seasonal"
                  stroke="#f59e0b"
                  fill="url(#seasonalGradient)"
                  strokeWidth={2}
                />
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* 잔차 성분 */}
        {(selectedComponent === 'all' || selectedComponent === 'residual') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">잔차 성분</h3>
              <div className="flex items-center gap-2">
                <FaBalanceScale className="text-blue-400" />
                <span className="text-blue-400 font-semibold">σ² = {componentStats.residual.variance}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={decompositionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="residual" fill="#ef4444" opacity={0.7}>
                  {decompositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.residual > 0 ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-green-900/20 to-gray-900 rounded-xl p-6 border border-green-500/30"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-green-400" />
            트렌드 분석
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">강도</span>
              <span className="text-white font-semibold">{(componentStats.trend.strength * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">방향</span>
              <span className="text-green-400 font-semibold">상승</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">변화율</span>
              <span className="text-white font-semibold">{componentStats.trend.change}</span>
            </div>
            <p className="text-sm text-gray-300 mt-3 pt-3 border-t border-gray-700">
              {componentStats.trend.description}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-900/20 to-gray-900 rounded-xl p-6 border border-yellow-500/30"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaClock className="text-yellow-400" />
            계절성 분석
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">강도</span>
              <span className="text-white font-semibold">{(componentStats.seasonal.strength * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">주기</span>
              <span className="text-yellow-400 font-semibold">{componentStats.seasonal.period}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">진폭</span>
              <span className="text-white font-semibold">{componentStats.seasonal.amplitude}</span>
            </div>
            <p className="text-sm text-gray-300 mt-3 pt-3 border-t border-gray-700">
              {componentStats.seasonal.description}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-900/20 to-gray-900 rounded-xl p-6 border border-blue-500/30"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaBalanceScale className="text-blue-400" />
            잔차 분석
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">분산</span>
              <span className="text-white font-semibold">{componentStats.residual.variance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">정규성</span>
              <span className="text-blue-400 font-semibold">{(componentStats.residual.normality * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">자기상관</span>
              <span className="text-white font-semibold">{componentStats.residual.autocorrelation}</span>
            </div>
            <p className="text-sm text-gray-300 mt-3 pt-3 border-t border-gray-700">
              {componentStats.residual.description}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}