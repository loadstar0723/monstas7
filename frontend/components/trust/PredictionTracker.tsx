'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartLine, FaCheckCircle, FaTimesCircle, FaClock,
  FaBullseye, FaTrophy, FaHistory, FaFilter
} from 'react-icons/fa'
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface Prediction {
  id: string
  timestamp: Date
  asset: string
  type: 'price' | 'signal' | 'trend'
  prediction: {
    direction: 'up' | 'down' | 'neutral'
    targetPrice?: number
    confidence: number
    timeframe: string
  }
  actual?: {
    price: number
    direction: 'up' | 'down' | 'neutral'
  }
  status: 'pending' | 'correct' | 'incorrect' | 'partial'
  score?: number
}

interface PerformanceStats {
  totalPredictions: number
  correctPredictions: number
  accuracy: number
  averageConfidence: number
  profitLoss: number
  bestStreak: number
  currentStreak: number
}

export default function PredictionTracker() {
  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: 'PRED001',
      timestamp: new Date('2024-01-20 09:00:00'),
      asset: 'BTC/USDT',
      type: 'price',
      prediction: {
        direction: 'up',
        targetPrice: 45000,
        confidence: 85,
        timeframe: '24h'
      },
      actual: {
        price: 45500,
        direction: 'up'
      },
      status: 'correct',
      score: 95
    },
    {
      id: 'PRED002',
      timestamp: new Date('2024-01-19 14:00:00'),
      asset: 'ETH/USDT',
      type: 'signal',
      prediction: {
        direction: 'down',
        confidence: 72,
        timeframe: '4h'
      },
      actual: {
        price: 2300,
        direction: 'down'
      },
      status: 'correct',
      score: 88
    },
    {
      id: 'PRED003',
      timestamp: new Date('2024-01-21 10:00:00'),
      asset: 'BTC/USDT',
      type: 'trend',
      prediction: {
        direction: 'up',
        confidence: 90,
        timeframe: '1w'
      },
      status: 'pending'
    }
  ])

  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    totalPredictions: 127,
    correctPredictions: 89,
    accuracy: 70.1,
    averageConfidence: 78.5,
    profitLoss: 15234,
    bestStreak: 12,
    currentStreak: 3
  })

  const [filter, setFilter] = useState({
    asset: 'all',
    type: 'all',
    status: 'all',
    timeframe: '7d'
  })

  const [accuracyHistory, setAccuracyHistory] = useState<any[]>([])

  useEffect(() => {
    // Generate accuracy history data
    const history = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      accuracy: 65 + Math.random() * 20,
      predictions: Math.floor(Math.random() * 10) + 1
    }))
    setAccuracyHistory(history)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <FaCheckCircle className="text-green-400" />
      case 'incorrect':
        return <FaTimesCircle className="text-red-400" />
      case 'partial':
        return <FaBullseye className="text-yellow-400" />
      default:
        return <FaClock className="text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct':
        return 'text-green-400'
      case 'incorrect':
        return 'text-red-400'
      case 'partial':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const filteredPredictions = predictions.filter(pred => {
    if (filter.asset !== 'all' && pred.asset !== filter.asset) return false
    if (filter.type !== 'all' && pred.type !== filter.type) return false
    if (filter.status !== 'all' && pred.status !== filter.status) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">정확도</p>
            <FaChartLine className="text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{performanceStats.accuracy.toFixed(1)}%</p>
          <p className="text-xs text-green-400 mt-1">+2.3% vs 지난주</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">총 예측</p>
            <FaHistory className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{performanceStats.totalPredictions}</p>
          <p className="text-xs text-gray-400 mt-1">
            {performanceStats.correctPredictions} 성공
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">수익률</p>
            <FaTrophy className="text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">
            +${performanceStats.profitLoss.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">이번 달</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">연속 성공</p>
            <FaBullseye className="text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{performanceStats.currentStreak}</p>
          <p className="text-xs text-gray-400 mt-1">
            최고: {performanceStats.bestStreak}
          </p>
        </motion.div>
      </div>

      {/* Accuracy Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-lg font-bold text-white mb-4">정확도 추이</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={accuracyHistory}>
              <defs>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[50, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#accuracyGradient)"
                name="정확도 (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={filter.asset}
          onChange={(e) => setFilter({ ...filter, asset: e.target.value })}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">모든 자산</option>
          <option value="BTC/USDT">BTC/USDT</option>
          <option value="ETH/USDT">ETH/USDT</option>
          <option value="SOL/USDT">SOL/USDT</option>
        </select>

        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">모든 유형</option>
          <option value="price">가격 예측</option>
          <option value="signal">시그널</option>
          <option value="trend">트렌드</option>
        </select>

        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">모든 상태</option>
          <option value="pending">대기중</option>
          <option value="correct">성공</option>
          <option value="incorrect">실패</option>
        </select>
      </div>

      {/* Predictions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaHistory className="text-blue-400" />
          예측 기록
        </h3>

        <div className="space-y-3">
          {filteredPredictions.map((prediction) => (
            <div
              key={prediction.id}
              className="bg-gray-900 rounded-lg p-4 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-semibold">{prediction.asset}</h4>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      {prediction.type === 'price' ? '가격' : prediction.type === 'signal' ? '시그널' : '트렌드'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {prediction.timestamp.toLocaleString('ko-KR')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">예측</p>
                      <p className={`font-semibold ${
                        prediction.prediction.direction === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {prediction.prediction.direction === 'up' ? '상승' : '하락'}
                        {prediction.prediction.targetPrice && ` → $${prediction.prediction.targetPrice.toLocaleString()}`}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400">신뢰도</p>
                      <p className="text-white font-semibold">
                        {prediction.prediction.confidence}%
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400">기간</p>
                      <p className="text-white">
                        {prediction.prediction.timeframe}
                      </p>
                    </div>

                    {prediction.actual && (
                      <div>
                        <p className="text-gray-400">실제</p>
                        <p className={`font-semibold ${
                          prediction.actual.direction === 'up' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ${prediction.actual.price.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center ml-4">
                  <div className="text-2xl mb-1">
                    {getStatusIcon(prediction.status)}
                  </div>
                  <p className={`text-sm font-semibold ${getStatusColor(prediction.status)}`}>
                    {prediction.status === 'correct' ? '성공' :
                     prediction.status === 'incorrect' ? '실패' :
                     prediction.status === 'partial' ? '부분' : '대기중'}
                  </p>
                  {prediction.score && (
                    <p className="text-xs text-gray-400 mt-1">
                      {prediction.score}점
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}