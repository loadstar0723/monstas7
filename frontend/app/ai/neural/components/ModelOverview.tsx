'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaBrain, FaNetworkWired, FaRobot, FaChartLine, 
  FaLayerGroup, FaMicrochip, FaBolt, FaCube
} from 'react-icons/fa'
import { 
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, Legend, Area, AreaChart
} from 'recharts'

interface ModelOverviewProps {
  symbol: string
}

export default function ModelOverview({ symbol }: ModelOverviewProps) {
  const [selectedModel, setSelectedModel] = useState<'mlp' | 'cnn' | 'rnn' | 'transformer'>('transformer')

  // 모델 아키텍처 비교
  const modelComparison = [
    { feature: '정확도', MLP: 82, CNN: 88, RNN: 91, Transformer: 95 },
    { feature: '학습속도', MLP: 95, CNN: 85, RNN: 70, Transformer: 60 },
    { feature: '메모리효율', MLP: 90, CNN: 75, RNN: 65, Transformer: 50 },
    { feature: '장기의존성', MLP: 20, CNN: 40, RNN: 75, Transformer: 95 },
    { feature: '병렬처리', MLP: 90, CNN: 85, RNN: 30, Transformer: 95 },
    { feature: '해석가능성', MLP: 85, CNN: 70, RNN: 60, Transformer: 50 }
  ]

  // 신경망 유형별 성능
  const performanceData = [
    { type: 'MLP', accuracy: 82, parameters: 50000, training: 2 },
    { type: 'CNN', accuracy: 88, parameters: 200000, training: 8 },
    { type: 'RNN', accuracy: 91, parameters: 150000, training: 12 },
    { type: 'LSTM', accuracy: 93, parameters: 300000, training: 15 },
    { type: 'GRU', accuracy: 92, parameters: 250000, training: 14 },
    { type: 'Transformer', accuracy: 95, parameters: 500000, training: 20 }
  ]

  // 활성화 함수 비교
  const activationFunctions = [
    { x: -3, sigmoid: 0.05, tanh: -0.995, relu: 0, leaky_relu: -0.3 },
    { x: -2, sigmoid: 0.12, tanh: -0.964, relu: 0, leaky_relu: -0.2 },
    { x: -1, sigmoid: 0.27, tanh: -0.762, relu: 0, leaky_relu: -0.1 },
    { x: 0, sigmoid: 0.5, tanh: 0, relu: 0, leaky_relu: 0 },
    { x: 1, sigmoid: 0.73, tanh: 0.762, relu: 1, leaky_relu: 1 },
    { x: 2, sigmoid: 0.88, tanh: 0.964, relu: 2, leaky_relu: 2 },
    { x: 3, sigmoid: 0.95, tanh: 0.995, relu: 3, leaky_relu: 3 }
  ]

  // 모델 정보
  const modelInfo = {
    mlp: {
      name: 'Multi-Layer Perceptron',
      description: '가장 기본적인 피드포워드 신경망',
      layers: [784, 256, 128, 64, 10],
      icon: <FaLayerGroup className="text-blue-400" />
    },
    cnn: {
      name: 'Convolutional Neural Network',
      description: '이미지 패턴 인식에 특화된 신경망',
      layers: ['Conv2D', 'MaxPool', 'Conv2D', 'MaxPool', 'Dense'],
      icon: <FaCube className="text-green-400" />
    },
    rnn: {
      name: 'Recurrent Neural Network',
      description: '시계열 데이터 처리에 최적화된 신경망',
      layers: ['Embedding', 'LSTM', 'LSTM', 'Dense'],
      icon: <FaNetworkWired className="text-purple-400" />
    },
    transformer: {
      name: 'Transformer Architecture',
      description: 'Attention 메커니즘 기반 최신 아키텍처',
      layers: ['Embedding', 'Encoder', 'Decoder', 'Linear'],
      icon: <FaRobot className="text-yellow-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaBrain className="text-indigo-400" />
          신경망 모델 개요
        </h2>
        <p className="text-gray-300">
          딥러닝 기반 고성능 예측 모델의 종합적인 분석
        </p>
      </div>

      {/* 모델 선택 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(modelInfo).map(([key, info]) => (
          <motion.button
            key={key}
            onClick={() => setSelectedModel(key as any)}
            className={`p-4 rounded-xl backdrop-blur-sm transition-all ${
              selectedModel === key
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl">{info.icon}</div>
              <span className="text-sm font-medium">{key.toUpperCase()}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* 선택된 모델 정보 */}
      <motion.div
        key={selectedModel}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center gap-3 mb-4">
          {modelInfo[selectedModel].icon}
          <h3 className="text-xl font-bold text-white">
            {modelInfo[selectedModel].name}
          </h3>
        </div>
        <p className="text-gray-300 mb-4">{modelInfo[selectedModel].description}</p>
        
        {/* 레이어 구조 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">레이어 구조</h4>
          <div className="flex items-center gap-2 flex-wrap">
            {modelInfo[selectedModel].layers.map((layer, index) => (
              <React.Fragment key={index}>
                <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm">
                  {layer}
                </div>
                {index < modelInfo[selectedModel].layers.length - 1 && (
                  <FaBolt className="text-yellow-400 text-xs" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 모델 비교 레이더 차트 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4">모델 성능 비교</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={modelComparison}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="feature" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar name="MLP" dataKey="MLP" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="CNN" dataKey="CNN" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="RNN" dataKey="RNN" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              <Radar name="Transformer" dataKey="Transformer" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 성능 vs 복잡도 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4">정확도 vs 파라미터 수</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="type" stroke="#9ca3af" />
              <YAxis yAxisId="left" orientation="left" stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar yAxisId="left" dataKey="accuracy" fill="#10b981" name="정확도 (%)">
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.type === 'Transformer' ? '#f59e0b' :
                    entry.type === 'LSTM' || entry.type === 'GRU' ? '#8b5cf6' :
                    entry.type === 'CNN' ? '#10b981' : '#3b82f6'
                  } />
                ))}
              </Bar>
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="parameters" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="파라미터 수"
              />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 활성화 함수 시각화 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4">활성화 함수 비교</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={activationFunctions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="x" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[-1.5, 3.5]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any) => value.toFixed(3)}
            />
            <Line type="monotone" dataKey="sigmoid" stroke="#3b82f6" strokeWidth={2} dot={false} name="Sigmoid" />
            <Line type="monotone" dataKey="tanh" stroke="#10b981" strokeWidth={2} dot={false} name="Tanh" />
            <Line type="monotone" dataKey="relu" stroke="#f59e0b" strokeWidth={2} dot={false} name="ReLU" />
            <Line type="monotone" dataKey="leaky_relu" stroke="#ef4444" strokeWidth={2} dot={false} name="Leaky ReLU" />
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 핵심 특징 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-xl p-6 border border-blue-500/30"
        >
          <FaMicrochip className="text-3xl text-blue-400 mb-3" />
          <h4 className="text-lg font-semibold text-white mb-2">GPU 가속</h4>
          <p className="text-sm text-gray-300">
            CUDA/cuDNN 최적화로 100배 빠른 학습 속도
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30"
        >
          <FaChartLine className="text-3xl text-purple-400 mb-3" />
          <h4 className="text-lg font-semibold text-white mb-2">자동 미분</h4>
          <p className="text-sm text-gray-300">
            Autograd 시스템으로 복잡한 그래디언트 자동 계산
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/30"
        >
          <FaNetworkWired className="text-3xl text-green-400 mb-3" />
          <h4 className="text-lg font-semibold text-white mb-2">전이 학습</h4>
          <p className="text-sm text-gray-300">
            사전 학습된 모델 활용으로 빠른 수렴과 높은 정확도
          </p>
        </motion.div>
      </div>
    </div>
  )
}