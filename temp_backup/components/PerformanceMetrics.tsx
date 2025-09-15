'use client'

import React, { useState, useEffect } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ReferenceLine, ComposedChart
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaChartLine, FaPercentage, FaChartBar, FaTrophy,
  FaArrowUp, FaArrowDown, FaClock, FaCheckCircle,
  FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa'
import CountUp from 'react-countup'

interface MetricCardProps {
  title: string
  value: number
  unit: string
  icon: React.ReactNode
  trend?: number
  description: string
  color: string
}

function MetricCard({ title, value, unit, icon, trend, description, color }: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
          {icon}
        </div>
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <FaInfoCircle />
        </button>
      </div>

      <h4 className="text-gray-400 text-sm mb-2">{title}</h4>
      <div className="flex items-baseline gap-2 mb-2">
        <CountUp
          end={value}
          decimals={unit === '%' ? 1 : 2}
          duration={2}
          className="text-3xl font-bold text-white"
        />
        <span className="text-gray-400">{unit}</span>
      </div>

      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
          <span>{Math.abs(trend).toFixed(1)}%</span>
        </div>
      )}

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-gray-900 rounded-lg shadow-xl z-10"
          >
            <p className="text-sm text-gray-300">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function PerformanceMetrics() {
  const [timeframe, setTimeframe] = useState('1D')
  const [selectedMetric, setSelectedMetric] = useState('all')

  // 성능 메트릭 데이터
  const metrics = {
    directionalAccuracy: 85.3,
    mape: 2.1,
    sharpeRatio: 2.45,
    maxDrawdown: -8.2,
    winRate: 68.5,
    profitFactor: 2.31,
    calmarRatio: 3.12,
    sortinoRatio: 3.87
  }

  // 시계열 성능 데이터
  const performanceHistory = [
    { date: '2024-01-01', accuracy: 82.5, sharpe: 2.1, drawdown: -5.2 },
    { date: '2024-01-02', accuracy: 83.2, sharpe: 2.2, drawdown: -6.1 },
    { date: '2024-01-03', accuracy: 84.1, sharpe: 2.3, drawdown: -7.5 },
    { date: '2024-01-04', accuracy: 83.8, sharpe: 2.25, drawdown: -6.8 },
    { date: '2024-01-05', accuracy: 85.3, sharpe: 2.45, drawdown: -8.2 },
  ]

  // 예측 정확도 분포
  const accuracyDistribution = [
    { range: '0-20%', count: 2, color: '#ef4444' },
    { range: '20-40%', count: 5, color: '#f59e0b' },
    { range: '40-60%', count: 12, color: '#eab308' },
    { range: '60-80%', count: 35, color: '#10b981' },
    { range: '80-100%', count: 46, color: '#3b82f6' },
  ]

  // 레이더 차트 데이터
  const radarData = [
    { metric: '방향성 정확도', value: 85, fullMark: 100 },
    { metric: '수익률', value: 78, fullMark: 100 },
    { metric: '안정성', value: 82, fullMark: 100 },
    { metric: '일관성', value: 75, fullMark: 100 },
    { metric: '리스크 관리', value: 88, fullMark: 100 },
    { metric: '효율성', value: 79, fullMark: 100 },
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaChartBar className="text-purple-500" />
            고급 성능 메트릭
          </h3>
          <p className="text-gray-400 mt-1">실시간 모델 성능 추적 및 분석</p>
        </div>
        
        {/* 타임프레임 선택 */}
        <div className="flex gap-2 bg-gray-800/50 rounded-lg p-1">
          {['1H', '1D', '1W', '1M', '3M'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeframe === tf
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* 주요 메트릭 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="방향성 정확도"
          value={metrics.directionalAccuracy}
          unit="%"
          icon={<FaCheckCircle className="text-green-400 text-xl" />}
          trend={2.3}
          description="가격 방향(상승/하락) 예측의 정확도입니다. 85% 이상이면 매우 우수한 성능입니다."
          color="bg-green-600"
        />
        
        <MetricCard
          title="MAPE"
          value={metrics.mape}
          unit="%"
          icon={<FaPercentage className="text-blue-400 text-xl" />}
          trend={-0.5}
          description="평균 절대 백분율 오차입니다. 낮을수록 예측이 정확합니다."
          color="bg-blue-600"
        />
        
        <MetricCard
          title="Sharpe Ratio"
          value={metrics.sharpeRatio}
          unit=""
          icon={<FaTrophy className="text-yellow-400 text-xl" />}
          trend={0.8}
          description="위험 대비 수익률입니다. 2 이상이면 매우 우수한 전략입니다."
          color="bg-yellow-600"
        />
        
        <MetricCard
          title="최대 낙폭"
          value={Math.abs(metrics.maxDrawdown)}
          unit="%"
          icon={<FaExclamationTriangle className="text-red-400 text-xl" />}
          trend={-1.2}
          description="역사적 최고점 대비 최대 손실률입니다. 낮을수록 안정적입니다."
          color="bg-red-600"
        />
      </div>

      {/* 성능 추이 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 정확도 추이 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-purple-500" />
            정확도 추이
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performanceHistory}>
              <defs>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[80, 90]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#accuracyGradient)"
              />
              <ReferenceLine y={85} stroke="#10b981" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 정확도 분포 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartBar className="text-purple-500" />
            예측 정확도 분포
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={accuracyDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {accuracyDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 종합 성능 레이더 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartBar className="text-purple-500" />
          종합 성능 지표
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar
                name="성능"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* 추가 메트릭 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-400">Win Rate</span>
              <span className="text-white font-bold">{metrics.winRate}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-400">Profit Factor</span>
              <span className="text-white font-bold">{metrics.profitFactor}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-400">Calmar Ratio</span>
              <span className="text-white font-bold">{metrics.calmarRatio}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-400">Sortino Ratio</span>
              <span className="text-white font-bold">{metrics.sortinoRatio}</span>
            </div>
            
            <div className="mt-4 p-4 bg-purple-600/20 rounded-lg border border-purple-500/50">
              <p className="text-sm text-purple-300">
                <strong>성능 평가:</strong> 현재 모델은 매우 우수한 성능을 보이고 있습니다. 
                특히 방향성 정확도와 리스크 관리 측면에서 뛰어난 결과를 나타내고 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 업데이트 시간 */}
      <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
        <FaClock />
        <span>마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
      </div>
    </div>
  )
}