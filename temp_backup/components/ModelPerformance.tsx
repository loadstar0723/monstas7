'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartBar, FaTrophy, FaExclamationTriangle, FaCheckCircle,
  FaArrowUp, FaArrowDown, FaClock, FaMedal
} from 'react-icons/fa'
import { 
  BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, ComposedChart, Area
} from 'recharts'

interface ModelPerformanceProps {
  symbol: string
}

export default function ModelPerformance({ symbol }: ModelPerformanceProps) {
  const [timeRange, setTimeRange] = useState('7d')

  // 모델별 성능 데이터
  const modelPerformance = [
    { model: 'Transformer', accuracy: 91.3, precision: 89.2, recall: 93.1, f1Score: 91.1, avgTime: 0.23 },
    { model: 'DeepAR', accuracy: 90.2, precision: 88.5, recall: 91.8, f1Score: 90.1, avgTime: 0.31 },
    { model: 'XGBoost', accuracy: 89.7, precision: 87.9, recall: 91.2, f1Score: 89.5, avgTime: 0.15 },
    { model: 'LightGBM', accuracy: 88.9, precision: 86.8, recall: 90.7, f1Score: 88.7, avgTime: 0.12 },
    { model: 'LSTM', accuracy: 88.5, precision: 86.3, recall: 90.4, f1Score: 88.3, avgTime: 0.28 },
    { model: 'Neural Net', accuracy: 87.8, precision: 85.7, recall: 89.6, f1Score: 87.6, avgTime: 0.25 },
    { model: 'GRU', accuracy: 87.2, precision: 85.1, recall: 89.0, f1Score: 87.0, avgTime: 0.26 },
    { model: 'Random Forest', accuracy: 86.4, precision: 84.5, recall: 88.1, f1Score: 86.3, avgTime: 0.18 },
    { model: 'CNN', accuracy: 85.8, precision: 83.9, recall: 87.5, f1Score: 85.7, avgTime: 0.22 },
    { model: 'Prophet', accuracy: 83.7, precision: 82.1, recall: 85.2, f1Score: 83.6, avgTime: 0.19 },
    { model: 'ARIMA', accuracy: 82.3, precision: 80.8, recall: 83.7, f1Score: 82.2, avgTime: 0.14 }
  ]

  // 시간별 성능 추이
  const performanceTrend = [
    { time: '1일전', ensemble: 90.5, best: 88.2, average: 85.3 },
    { time: '2일전', ensemble: 91.2, best: 89.1, average: 86.0 },
    { time: '3일전', ensemble: 90.8, best: 88.5, average: 85.5 },
    { time: '4일전', ensemble: 92.1, best: 90.3, average: 87.2 },
    { time: '5일전', ensemble: 91.7, best: 89.8, average: 86.8 },
    { time: '6일전', ensemble: 92.5, best: 90.7, average: 87.5 },
    { time: '7일전', ensemble: 92.7, best: 91.0, average: 87.8 }
  ]

  // 레이더 차트 데이터
  const radarData = [
    { metric: '정확도', ensemble: 92.7, bestModel: 91.3, fullMark: 100 },
    { metric: '정밀도', ensemble: 90.8, bestModel: 89.2, fullMark: 100 },
    { metric: '재현율', ensemble: 94.2, bestModel: 93.1, fullMark: 100 },
    { metric: '안정성', ensemble: 95.5, bestModel: 88.3, fullMark: 100 },
    { metric: '속도', ensemble: 85.0, bestModel: 92.0, fullMark: 100 },
    { metric: '적응성', ensemble: 93.2, bestModel: 85.5, fullMark: 100 }
  ]

  // 모델별 기여도
  const modelContribution = [
    { model: 'Transformer', contribution: 18.5, trend: 'up' },
    { model: 'DeepAR', contribution: 16.2, trend: 'up' },
    { model: 'XGBoost', contribution: 13.8, trend: 'stable' },
    { model: 'LightGBM', contribution: 12.5, trend: 'down' },
    { model: 'LSTM', contribution: 11.3, trend: 'stable' },
    { model: 'Others', contribution: 27.7, trend: 'stable' }
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">
          모델 성능 분석
        </h3>
        <p className="text-gray-400">
          {symbol} - 개별 모델과 앙상블의 실시간 성능 비교
        </p>
      </div>

      {/* 시간 범위 선택 */}
      <div className="flex justify-center gap-2">
        {['24h', '7d', '30d', '90d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg transition-all ${
              timeRange === range
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* 종합 성능 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">앙상블 정확도</span>
            <FaTrophy className="text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400">92.7%</div>
          <div className="text-sm text-green-400 mt-1 flex items-center gap-1">
            <FaArrowUp /> +1.4% vs 최고 모델
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">평균 처리시간</span>
            <FaClock className="text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">0.3초</div>
          <div className="text-sm text-gray-400 mt-1">실시간 가능</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">안정성 점수</span>
            <FaCheckCircle className="text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">95.5</div>
          <div className="text-sm text-gray-400 mt-1">매우 안정적</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">예측 신뢰도</span>
            <FaMedal className="text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400">94.8%</div>
          <div className="text-sm text-gray-400 mt-1">높은 확신도</div>
        </motion.div>
      </div>

      {/* 모델별 성능 순위 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4">모델별 성능 순위</h4>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={modelPerformance}>
            <defs>
              <linearGradient id="colorAccuracy" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8}/>
                <stop offset="50%" stopColor="#a78bfa" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8}/>
              </linearGradient>
              <linearGradient id="colorPrecision" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f87171" stopOpacity={0.6}/>
                <stop offset="100%" stopColor="#fb923c" stopOpacity={0.6}/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="model" 
              angle={-45} 
              textAnchor="end" 
              height={80} 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              stroke="#9ca3af"
              domain={[75, 95]}
              ticks={[75, 80, 85, 90, 95]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                border: '1px solid #374151',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}
              labelStyle={{ color: '#fff', fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            
            {/* 배경 영역 */}
            <Area
              type="monotone"
              dataKey="accuracy"
              stroke="none"
              fill="url(#colorAccuracy)"
              fillOpacity={0.1}
              name="정확도 영역"
            />
            
            {/* 메인 정확도 라인 */}
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="url(#colorAccuracy)"
              strokeWidth={4}
              filter="url(#glow)"
              name="정확도"
              dot={{ r: 6, fill: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 8, fill: '#fbbf24' }}
              animationDuration={2000}
              animationEasing="ease-out"
            />
            
            {/* 정밀도 라인 */}
            <Line
              type="monotone"
              dataKey="precision"
              stroke="url(#colorPrecision)"
              strokeWidth={3}
              strokeDasharray="5 5"
              name="정밀도"
              dot={{ r: 4, fill: '#fff', strokeWidth: 1 }}
              animationDuration={2500}
              animationEasing="ease-out"
            />
            
            {/* F1 Score 포인트 */}
            <Bar
              dataKey="f1Score"
              fill="#10b981"
              opacity={0.3}
              name="F1 Score"
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* 추가적인 인터랙티브 성능 지표 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              91.3%
            </div>
            <p className="text-gray-400 text-sm mt-1">최고 정확도</p>
            <p className="text-xs text-gray-500">Transformer</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              87.2%
            </div>
            <p className="text-gray-400 text-sm mt-1">평균 정확도</p>
            <p className="text-xs text-gray-500">11개 모델</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              +9.0%
            </div>
            <p className="text-gray-400 text-sm mt-1">성능 격차</p>
            <p className="text-xs text-gray-500">최고 vs 최저</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 성능 추이 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-xl font-bold text-white mb-4">성능 추이 비교</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[80, 95]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="ensemble" stroke="#a78bfa" strokeWidth={3} name="앙상블" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="best" stroke="#60a5fa" strokeWidth={2} name="최고 모델" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="average" stroke="#6b7280" strokeWidth={2} name="평균" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 레이더 차트 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-xl font-bold text-white mb-4">종합 성능 비교</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar name="앙상블" dataKey="ensemble" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.6} />
              <Radar name="최고 모델" dataKey="bestModel" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.4} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 모델 기여도 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4">앙상블 내 모델 기여도</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {modelContribution.map((item, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400">{item.model}</p>
              <p className="text-2xl font-bold text-white my-2">{item.contribution}%</p>
              <div className={`flex items-center justify-center gap-1 text-sm ${
                item.trend === 'up' ? 'text-green-400' :
                item.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {item.trend === 'up' && <FaArrowUp />}
                {item.trend === 'down' && <FaArrowDown />}
                {item.trend === 'stable' && '―'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 성능 알림 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-400" />
          성능 최적화 제안
        </h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-400 mt-1" />
            <div>
              <p className="text-white font-semibold">Transformer 모델 가중치 증가</p>
              <p className="text-gray-400 text-sm">최근 7일간 가장 높은 정확도 유지</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-400 mt-1" />
            <div>
              <p className="text-white font-semibold">LightGBM 가중치 감소 고려</p>
              <p className="text-gray-400 text-sm">최근 성능 하락 추세 관찰됨</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}