'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FaRocket, FaChartLine, FaCogs, FaDatabase,
  FaBolt, FaChartBar, FaCheckCircle, FaSync
} from 'react-icons/fa'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { useGoXGBoost } from '@/lib/hooks/useGoXGBoost'

interface GoXGBoostDashboardProps {
  symbol: string
}

export default function GoXGBoostDashboard({ symbol }: GoXGBoostDashboardProps) {
  const [activeTab, setActiveTab] = useState<'predict' | 'feature' | 'performance'>('predict')

  // Go 엔진 XGBoost 훅 사용
  const {
    prediction,
    featureImportance,
    performance,
    isTraining,
    isConnected,
    error,
    trainModel,
    getPrediction
  } = useGoXGBoost({ symbol })

  // 실시간 예측 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTraining) {
        getPrediction()
      }
    }, 5000) // 5초마다 업데이트

    return () => clearInterval(interval)
  }, [getPrediction, isTraining])

  const tabs = [
    { id: 'predict', label: '실시간 예측', icon: FaChartLine },
    { id: 'feature', label: '특성 중요도', icon: FaChartBar },
    { id: 'performance', label: '성능 메트릭', icon: FaBolt }
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-2">
          Go 하이브리드 XGBoost 엔진
        </h2>
        <p className="text-gray-400">
          실시간 병렬 부스팅 • 고성능 Feature Engineering • GPU 가속 지원
        </p>
      </motion.div>

      {/* 연결 상태 */}
      <div className="bg-gray-900/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">
              Go 엔진: {isConnected ? '연결됨' : '연결 중...'}
            </span>
          </div>
          <button
            onClick={trainModel}
            disabled={isTraining}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-300
              ${isTraining
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg hover:shadow-green-500/20'
              }
            `}
          >
            {isTraining ? (
              <>
                <FaSync className="inline-block mr-2 animate-spin" />
                학습 중...
              </>
            ) : (
              <>
                <FaRocket className="inline-block mr-2" />
                모델 학습
              </>
            )}
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 bg-gray-900/30 p-1 rounded-lg">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                font-medium transition-all duration-300
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }
              `}
            >
              <Icon className="text-lg" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 컨텐츠 영역 */}
      <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 min-h-[400px]">
        {activeTab === 'predict' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">실시간 예측</h3>

            {prediction && (
              <>
                {/* 예측 결과 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">예측 가격</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${prediction.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      변화율: {prediction.changePercent.toFixed(2)}%
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">신뢰도</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                        style={{ width: `${prediction.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">신호</p>
                    <p className={`text-2xl font-bold ${
                      prediction.signal === 'BUY' ? 'text-green-400' :
                      prediction.signal === 'SELL' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {prediction.signal}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      강도: {(prediction.strength * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* 예측 차트 */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prediction.history || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="predicted" stroke="#10B981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'feature' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">특성 중요도 분석</h3>

            {featureImportance && featureImportance.length > 0 && (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureImportance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="feature" stroke="#9CA3AF" angle={-45} textAnchor="end" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Bar dataKey="importance" fill="url(#gradient)" />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">모델 성능 메트릭</h3>

            {performance && (
              <>
                {/* 성능 지표 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">정확도</p>
                    <p className="text-xl font-bold text-green-400">
                      {(performance.accuracy * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">정밀도</p>
                    <p className="text-xl font-bold text-blue-400">
                      {(performance.precision * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">재현율</p>
                    <p className="text-xl font-bold text-purple-400">
                      {(performance.recall * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">F1 Score</p>
                    <p className="text-xl font-bold text-yellow-400">
                      {performance.f1Score.toFixed(3)}
                    </p>
                  </div>
                </div>

                {/* 레이더 차트 */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { metric: '정확도', value: performance.accuracy * 100 },
                      { metric: '정밀도', value: performance.precision * 100 },
                      { metric: '재현율', value: performance.recall * 100 },
                      { metric: 'F1 Score', value: performance.f1Score * 100 },
                      { metric: '속도', value: 85 }
                    ]}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
                      <Radar name="성능" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}