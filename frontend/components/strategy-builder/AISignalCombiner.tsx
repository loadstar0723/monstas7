'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaRobot, FaBrain, FaChartBar, FaBalanceScale,
  FaPlay, FaStop, FaCog, FaInfoCircle
} from 'react-icons/fa'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Cell
} from 'recharts'

interface AIModel {
  id: string
  name: string
  type: 'lstm' | 'gru' | 'xgboost' | 'randomforest' | 'ensemble'
  accuracy: number
  confidence: number
  weight: number
  signal: 'buy' | 'sell' | 'hold'
  strength: number
  description: string
}

interface SignalCombination {
  id: string
  name: string
  models: string[]
  rule: 'majority' | 'weighted' | 'unanimous' | 'custom'
  threshold: number
  performance: {
    winRate: number
    sharpeRatio: number
    maxDrawdown: number
  }
}

export default function AISignalCombiner() {
  const [models, setModels] = useState<AIModel[]>([
    {
      id: 'lstm1',
      name: 'LSTM Price Predictor',
      type: 'lstm',
      accuracy: 78.5,
      confidence: 85,
      weight: 0.25,
      signal: 'buy',
      strength: 0.82,
      description: '가격 패턴 기반 LSTM 모델'
    },
    {
      id: 'gru1',
      name: 'GRU Trend Analyzer',
      type: 'gru',
      accuracy: 81.2,
      confidence: 79,
      weight: 0.20,
      signal: 'buy',
      strength: 0.75,
      description: '트렌드 분석 특화 GRU 모델'
    },
    {
      id: 'xgb1',
      name: 'XGBoost Multi-Factor',
      type: 'xgboost',
      accuracy: 83.7,
      confidence: 88,
      weight: 0.30,
      signal: 'hold',
      strength: 0.45,
      description: '다중 팩터 기반 XGBoost'
    },
    {
      id: 'rf1',
      name: 'Random Forest Ensemble',
      type: 'randomforest',
      accuracy: 79.9,
      confidence: 82,
      weight: 0.25,
      signal: 'buy',
      strength: 0.68,
      description: '랜덤 포레스트 앙상블'
    }
  ])

  const [selectedModels, setSelectedModels] = useState<string[]>(['lstm1', 'gru1', 'xgb1'])
  const [combinationRule, setCombinationRule] = useState<'majority' | 'weighted' | 'unanimous' | 'custom'>('weighted')
  const [signalThreshold, setSignalThreshold] = useState(0.6)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const calculateCombinedSignal = () => {
    const selected = models.filter(m => selectedModels.includes(m.id))
    
    if (combinationRule === 'weighted') {
      const totalWeight = selected.reduce((sum, m) => sum + m.weight, 0)
      const weightedStrength = selected.reduce((sum, m) => {
        const signalValue = m.signal === 'buy' ? m.strength : 
                          m.signal === 'sell' ? -m.strength : 0
        return sum + (signalValue * m.weight)
      }, 0) / totalWeight
      
      if (Math.abs(weightedStrength) < signalThreshold) return 'hold'
      return weightedStrength > 0 ? 'buy' : 'sell'
    }
    
    if (combinationRule === 'majority') {
      const votes = { buy: 0, sell: 0, hold: 0 }
      selected.forEach(m => votes[m.signal]++)
      
      const maxVotes = Math.max(votes.buy, votes.sell, votes.hold)
      if (votes.buy === maxVotes && votes.buy / selected.length >= signalThreshold) return 'buy'
      if (votes.sell === maxVotes && votes.sell / selected.length >= signalThreshold) return 'sell'
      return 'hold'
    }
    
    if (combinationRule === 'unanimous') {
      const signals = selected.map(m => m.signal)
      if (signals.every(s => s === 'buy')) return 'buy'
      if (signals.every(s => s === 'sell')) return 'sell'
      return 'hold'
    }
    
    return 'hold'
  }

  const combinedSignal = calculateCombinedSignal()

  const performanceData = [
    { metric: '정확도', value: 82, benchmark: 75 },
    { metric: '일관성', value: 88, benchmark: 80 },
    { metric: '신뢰도', value: 85, benchmark: 70 },
    { metric: '수익성', value: 78, benchmark: 65 },
    { metric: '리스크', value: 92, benchmark: 85 }
  ]

  const signalHistory = Array.from({ length: 30 }, (_, i) => ({
    time: i,
    individual: 50 + Math.sin(i / 3) * 20 + Math.random() * 10,
    combined: 50 + Math.sin(i / 3) * 15 + Math.random() * 5
  }))

  const modelPerformance = models.map(m => ({
    name: m.name.split(' ')[0],
    accuracy: m.accuracy,
    confidence: m.confidence
  }))

  const handleOptimizeWeights = () => {
    setIsOptimizing(true)
    // 실제로는 최적화 알고리즘 실행
    setTimeout(() => {
      setIsOptimizing(false)
      alert('가중치 최적화가 완료되었습니다!')
    }, 2000)
  }

  const toggleModelSelection = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">AI 모델 선택</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map(model => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-gray-800 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                selectedModels.includes(model.id)
                  ? 'border-blue-500 bg-gray-800/80'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => toggleModelSelection(model.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <FaRobot className="text-blue-400" />
                    {model.name}
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">{model.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedModels.includes(model.id)}
                  onChange={() => {}}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-400">정확도</p>
                  <p className="text-white font-semibold">{model.accuracy}%</p>
                </div>
                <div>
                  <p className="text-gray-400">신뢰도</p>
                  <p className="text-white font-semibold">{model.confidence}%</p>
                </div>
                <div>
                  <p className="text-gray-400">시그널</p>
                  <p className={`font-semibold ${
                    model.signal === 'buy' ? 'text-green-400' :
                    model.signal === 'sell' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {model.signal.toUpperCase()}
                  </p>
                </div>
              </div>

              {selectedModels.includes(model.id) && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <label className="text-sm text-gray-400">가중치</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={model.weight * 100}
                      onChange={(e) => {
                        const newWeight = parseFloat(e.target.value) / 100
                        setModels(prev => prev.map(m => 
                          m.id === model.id ? { ...m, weight: newWeight } : m
                        ))
                      }}
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-white w-12 text-right">{(model.weight * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Combination Rules */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">시그널 결합 규칙</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {(['majority', 'weighted', 'unanimous', 'custom'] as const).map(rule => (
            <button
              key={rule}
              onClick={() => setCombinationRule(rule)}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                combinationRule === rule
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {rule === 'majority' ? '다수결' :
               rule === 'weighted' ? '가중평균' :
               rule === 'unanimous' ? '만장일치' : '사용자정의'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              시그널 임계값 (Threshold)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={signalThreshold * 100}
                onChange={(e) => setSignalThreshold(Number(e.target.value) / 100)}
                className="flex-1"
              />
              <span className="text-white w-12">{(signalThreshold * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">결합 시그널</p>
              <p className={`text-2xl font-bold ${
                combinedSignal === 'buy' ? 'text-green-400' :
                combinedSignal === 'sell' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {combinedSignal.toUpperCase()}
              </p>
            </div>
            <button
              onClick={handleOptimizeWeights}
              disabled={isOptimizing}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {isOptimizing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  최적화 중...
                </>
              ) : (
                <>
                  <FaBalanceScale />
                  가중치 최적화
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">성능 비교</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
              <Radar
                name="결합 모델"
                dataKey="value"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
              <Radar
                name="벤치마크"
                dataKey="benchmark"
                stroke="#6B7280"
                fill="#6B7280"
                fillOpacity={0.1}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Signal History */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">시그널 히스토리</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={signalHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Line
                type="monotone"
                dataKey="individual"
                stroke="#6B7280"
                strokeWidth={1}
                dot={false}
                name="개별 모델"
              />
              <Line
                type="monotone"
                dataKey="combined"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                name="결합 시그널"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Performance */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">모델별 성능</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={modelPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Bar dataKey="accuracy" fill="#3B82F6" name="정확도" />
            <Bar dataKey="confidence" fill="#10B981" name="신뢰도" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <p className="text-blue-400 text-sm flex items-start gap-2">
          <FaInfoCircle className="mt-0.5 flex-shrink-0" />
          AI 시그널 결합은 여러 모델의 예측을 종합하여 더 안정적이고 신뢰할 수 있는 거래 신호를 생성합니다.
          각 모델의 강점을 활용하고 약점을 보완하여 전체적인 성능을 향상시킵니다.
        </p>
      </div>
    </div>
  )
}