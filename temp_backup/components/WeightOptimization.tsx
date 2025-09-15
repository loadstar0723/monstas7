'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaWeightHanging, FaCogs, FaChartLine, FaSync,
  FaCheckCircle, FaExclamationTriangle, FaRocket, FaBalanceScale
} from 'react-icons/fa'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, ComposedChart, Area
} from 'recharts'

interface WeightOptimizationProps {
  symbol: string
}

export default function WeightOptimization({ symbol }: WeightOptimizationProps) {
  const [optimizationMode, setOptimizationMode] = useState('performance')

  // 현재 가중치
  const currentWeights = [
    { model: 'Transformer', weight: 18.5, optimal: 19.2, color: '#ef4444' },
    { model: 'DeepAR', weight: 16.2, optimal: 17.1, color: '#f59e0b' },
    { model: 'XGBoost', weight: 13.8, optimal: 13.5, color: '#8b5cf6' },
    { model: 'LightGBM', weight: 12.5, optimal: 11.8, color: '#ec4899' },
    { model: 'LSTM', weight: 11.3, optimal: 11.7, color: '#3b82f6' },
    { model: 'Neural Net', weight: 9.8, optimal: 9.5, color: '#6366f1' },
    { model: 'GRU', weight: 7.5, optimal: 7.8, color: '#10b981' },
    { model: 'Random Forest', weight: 5.2, optimal: 5.3, color: '#14b8a6' },
    { model: 'CNN', weight: 3.1, optimal: 2.9, color: '#84cc16' },
    { model: 'Prophet', weight: 1.6, optimal: 1.0, color: '#f97316' },
    { model: 'ARIMA', weight: 0.5, optimal: 0.2, color: '#06b6d4' }
  ]

  // 가중치 조정 히스토리
  const weightHistory = [
    { time: '6시간 전', transformer: 17.2, deepar: 15.8, xgboost: 14.2, others: 52.8 },
    { time: '5시간 전', transformer: 17.5, deepar: 16.0, xgboost: 14.0, others: 52.5 },
    { time: '4시간 전', transformer: 17.8, deepar: 16.1, xgboost: 13.9, others: 52.2 },
    { time: '3시간 전', transformer: 18.0, deepar: 16.2, xgboost: 13.8, others: 52.0 },
    { time: '2시간 전', transformer: 18.3, deepar: 16.2, xgboost: 13.8, others: 51.7 },
    { time: '1시간 전', transformer: 18.5, deepar: 16.2, xgboost: 13.8, others: 51.5 },
    { time: '현재', transformer: 18.5, deepar: 16.2, xgboost: 13.8, others: 51.5 }
  ]

  // 최적화 시나리오
  const optimizationScenarios = [
    {
      name: '성능 우선',
      id: 'performance',
      description: '최고 정확도를 위한 가중치 최적화',
      expectedAccuracy: 93.2,
      expectedSpeed: 0.35,
      riskLevel: 'low'
    },
    {
      name: '속도 우선',
      id: 'speed',
      description: '빠른 처리를 위한 가중치 최적화',
      expectedAccuracy: 91.5,
      expectedSpeed: 0.18,
      riskLevel: 'medium'
    },
    {
      name: '균형',
      id: 'balanced',
      description: '성능과 속도의 균형잡힌 최적화',
      expectedAccuracy: 92.4,
      expectedSpeed: 0.25,
      riskLevel: 'low'
    },
    {
      name: '안정성',
      id: 'stability',
      description: '예측 변동성 최소화',
      expectedAccuracy: 92.0,
      expectedSpeed: 0.28,
      riskLevel: 'very-low'
    }
  ]

  // 최적화 메트릭
  const optimizationMetrics = [
    { metric: '예상 정확도', current: 92.7, optimized: 93.2, unit: '%' },
    { metric: '처리 속도', current: 0.30, optimized: 0.35, unit: '초' },
    { metric: '안정성 점수', current: 94.5, optimized: 96.2, unit: '점' },
    { metric: '리스크 수준', current: 3.2, optimized: 2.8, unit: '점' }
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <FaWeightHanging className="text-purple-400" />
          가중치 최적화
        </h3>
        <p className="text-gray-400">
          {symbol} - 실시간 성능 기반 동적 가중치 조정
        </p>
      </div>

      {/* 최적화 모드 선택 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {optimizationScenarios.map((scenario) => (
          <motion.button
            key={scenario.id}
            onClick={() => setOptimizationMode(scenario.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 rounded-xl border transition-all ${
              optimizationMode === scenario.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400'
                : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
            }`}
          >
            <h4 className="text-lg font-bold text-white mb-1">{scenario.name}</h4>
            <p className="text-sm text-gray-300 mb-3">{scenario.description}</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">정확도:</span>
                <span className="text-white">{scenario.expectedAccuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">속도:</span>
                <span className="text-white">{scenario.expectedSpeed}초</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">리스크:</span>
                <span className={`${
                  scenario.riskLevel === 'very-low' ? 'text-green-400' :
                  scenario.riskLevel === 'low' ? 'text-blue-400' :
                  'text-yellow-400'
                }`}>
                  {scenario.riskLevel}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* 현재 vs 최적 가중치 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4">현재 vs 최적 가중치</h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={currentWeights}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="model" angle={-45} textAnchor="end" height={80} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="weight" name="현재 가중치" fill="#8b5cf6" opacity={0.8} />
            <Bar dataKey="optimal" name="최적 가중치" fill="#10b981" opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 가중치 파이 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-xl font-bold text-white mb-4">현재 가중치 분포</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={currentWeights.slice(0, 5)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ model, weight }) => `${model}: ${weight}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="weight"
              >
                {currentWeights.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 가중치 변화 추이 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-xl font-bold text-white mb-4">가중치 변화 추이</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightHistory}>
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
              <Legend />
              <Line type="monotone" dataKey="transformer" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="deepar" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="xgboost" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="others" stroke="#6b7280" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 최적화 결과 예측 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaRocket className="text-purple-400" />
          최적화 결과 예측
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {optimizationMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">{metric.metric}</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold text-white">
                  {metric.current}{metric.unit}
                </span>
                <span className="text-gray-400">→</span>
                <span className="text-xl font-bold text-green-400">
                  {metric.optimized}{metric.unit}
                </span>
              </div>
              <div className="text-sm text-green-400">
                {metric.optimized > metric.current ? '+' : ''}
                {((metric.optimized - metric.current) / metric.current * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 최적화 컨트롤 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold text-white flex items-center gap-2">
            <FaCogs className="text-purple-400" />
            가중치 최적화 실행
          </h4>
          <div className="flex items-center gap-2">
            <FaBalanceScale className="text-yellow-400" />
            <span className="text-yellow-400">자동 균형 조정 활성화</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-purple-400 font-semibold mb-3">최적화 옵션</h5>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" defaultChecked className="text-purple-400" />
                실시간 성능 모니터링
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" defaultChecked className="text-purple-400" />
                점진적 가중치 조정
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="text-purple-400" />
                급격한 변화 방지
              </label>
            </div>
          </div>

          <div>
            <h5 className="text-pink-400 font-semibold mb-3">조정 임계값</h5>
            <div className="space-y-3">
              <div>
                <label className="text-gray-300 text-sm">성능 차이 임계값</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  defaultValue="5"
                  className="w-full mt-1"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm">조정 속도</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  defaultValue="7"
                  className="w-full mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <button className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2">
          <FaSync />
          가중치 최적화 적용
        </button>
      </div>
    </div>
  )
}