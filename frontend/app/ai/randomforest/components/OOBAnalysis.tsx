'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartLine, FaDatabase, FaCheckCircle, FaExclamationTriangle,
  FaInfoCircle, FaBalanceScale, FaTachometerAlt, FaLeaf
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, BarChart, Bar, RadialBarChart,
  RadialBar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts'

interface OOBAnalysisProps {
  symbol: string
}

export default function OOBAnalysis({ symbol }: OOBAnalysisProps) {
  const [selectedMetric, setSelectedMetric] = useState<'error' | 'accuracy' | 'precision'>('error')
  const [treeRange, setTreeRange] = useState([0, 100])

  // OOB 오차 진행 데이터 생성
  const generateOOBData = () => {
    const data = []
    let currentError = 0.35
    let currentAccuracy = 0.65
    
    for (let i = 1; i <= 100; i++) {
      // 트리가 늘어날수록 오차는 감소하고 정확도는 증가
      currentError *= 0.995 - Math.random() * 0.01
      currentError = Math.max(currentError, 0.05) // 최소 오차 5%
      currentAccuracy = 1 - currentError
      
      data.push({
        trees: i,
        oobError: currentError,
        accuracy: currentAccuracy,
        precision: currentAccuracy + (Math.random() - 0.5) * 0.02,
        recall: currentAccuracy + (Math.random() - 0.5) * 0.03,
        f1Score: currentAccuracy + (Math.random() - 0.5) * 0.01,
        trainingError: currentError * 0.5 + Math.random() * 0.02
      })
    }
    
    return data
  }

  const oobData = generateOOBData()
  const filteredData = oobData.slice(treeRange[0], treeRange[1])

  // 현재 성능 메트릭
  const currentMetrics = oobData[oobData.length - 1]

  // 특성별 OOB 중요도
  const featureOOBImportance = [
    { feature: 'RSI', importance: 0.142, oobDecrease: 0.089 },
    { feature: '거래량', importance: 0.128, oobDecrease: 0.076 },
    { feature: 'MACD', importance: 0.115, oobDecrease: 0.068 },
    { feature: '고래 활동', importance: 0.098, oobDecrease: 0.058 },
    { feature: 'MA20', importance: 0.087, oobDecrease: 0.051 },
    { feature: 'ATR', importance: 0.076, oobDecrease: 0.044 },
    { feature: 'Fear & Greed', importance: 0.065, oobDecrease: 0.038 },
    { feature: '네트워크 활성도', importance: 0.054, oobDecrease: 0.032 }
  ]

  // 혼동 행렬 데이터
  const confusionMatrix = {
    truePositive: 652,
    falsePositive: 48,
    falseNegative: 62,
    trueNegative: 238
  }

  const totalSamples = Object.values(confusionMatrix).reduce((a, b) => a + b, 0)

  // RadialBar 데이터
  const performanceRadialData = [
    {
      name: 'OOB Error',
      value: (currentMetrics.oobError * 100).toFixed(1),
      fill: '#ef4444',
      max: 100
    },
    {
      name: 'Accuracy',
      value: (currentMetrics.accuracy * 100).toFixed(1),
      fill: '#10b981',
      max: 100
    },
    {
      name: 'Precision',
      value: (currentMetrics.precision * 100).toFixed(1),
      fill: '#3b82f6',
      max: 100
    }
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaDatabase className="text-blue-400" />
          Out-of-Bag (OOB) 분석
        </h2>
        <p className="text-gray-300">
          부트스트랩 샘플링에서 제외된 데이터로 모델 성능을 검증하는 Random Forest의 고유한 평가 방법
        </p>
      </div>

      {/* OOB 개념 설명 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaInfoCircle className="text-blue-400" />
          OOB 평가의 원리
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">부트스트랩 샘플링</h4>
            <p className="text-gray-300">
              각 트리는 전체 데이터의 약 63.2%만 사용하여 학습됩니다. 
              나머지 36.8%가 OOB 샘플이 됩니다.
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-purple-400 font-semibold mb-2">자동 검증</h4>
            <p className="text-gray-300">
              각 샘플은 자신을 학습하지 않은 트리들로만 평가되어 
              별도의 검증 세트 없이도 신뢰할 수 있는 성능 평가가 가능합니다.
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">과적합 방지</h4>
            <p className="text-gray-300">
              OOB 오차가 증가하기 시작하면 과적합의 신호이므로 
              트리 개수나 깊이를 조정해야 합니다.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 성능 메트릭 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center"
        >
          <FaChartLine className="text-3xl text-red-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-white">
            {(currentMetrics.oobError * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400 mt-1">OOB Error</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center"
        >
          <FaCheckCircle className="text-3xl text-green-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-white">
            {(currentMetrics.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400 mt-1">Accuracy</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center"
        >
          <FaTachometerAlt className="text-3xl text-blue-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-white">
            {(currentMetrics.precision * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400 mt-1">Precision</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center"
        >
          <FaBalanceScale className="text-3xl text-purple-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-white">
            {(currentMetrics.f1Score * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400 mt-1">F1 Score</div>
        </motion.div>
      </div>

      {/* OOB 오차 추이 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">OOB 오차 수렴 과정</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMetric('error')}
              className={`px-3 py-1 rounded text-sm ${
                selectedMetric === 'error' ? 'bg-red-600 text-white' : 'text-gray-400'
              }`}
            >
              Error
            </button>
            <button
              onClick={() => setSelectedMetric('accuracy')}
              className={`px-3 py-1 rounded text-sm ${
                selectedMetric === 'accuracy' ? 'bg-green-600 text-white' : 'text-gray-400'
              }`}
            >
              Accuracy
            </button>
            <button
              onClick={() => setSelectedMetric('precision')}
              className={`px-3 py-1 rounded text-sm ${
                selectedMetric === 'precision' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
            >
              Precision
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="trees" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[0, 1]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any) => (value * 100).toFixed(1) + '%'}
            />
            
            {selectedMetric === 'error' && (
              <>
                <Line
                  type="monotone"
                  dataKey="oobError"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="OOB Error"
                />
                <Line
                  type="monotone"
                  dataKey="trainingError"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Training Error"
                />
              </>
            )}
            
            {selectedMetric === 'accuracy' && (
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="Accuracy"
              />
            )}
            
            {selectedMetric === 'precision' && (
              <>
                <Line
                  type="monotone"
                  dataKey="precision"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Precision"
                />
                <Line
                  type="monotone"
                  dataKey="recall"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  name="Recall"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* 트리 범위 슬라이더 */}
        <div className="mt-4 px-4">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>트리 범위</span>
            <span>{treeRange[0]} - {treeRange[1]} 트리</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={treeRange[1]}
            onChange={(e) => {
                if (e && e.target && e.target.value) {
                  setTreeRange([0, Number(e.target.value)])
                }
              }}
            className="w-full"
          />
        </div>
      </motion.div>

      {/* 혼동 행렬 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">혼동 행렬 (Confusion Matrix)</h3>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div></div>
            <div className="text-gray-400 font-semibold">예측: UP</div>
            <div className="text-gray-400 font-semibold">예측: DOWN</div>
            
            <div className="text-gray-400 font-semibold text-right pr-2">실제: UP</div>
            <div className="bg-green-900/50 rounded p-4 border border-green-500/50">
              <div className="text-2xl font-bold text-green-400">{confusionMatrix.truePositive}</div>
              <div className="text-xs text-gray-400 mt-1">True Positive</div>
            </div>
            <div className="bg-red-900/50 rounded p-4 border border-red-500/50">
              <div className="text-2xl font-bold text-red-400">{confusionMatrix.falseNegative}</div>
              <div className="text-xs text-gray-400 mt-1">False Negative</div>
            </div>
            
            <div className="text-gray-400 font-semibold text-right pr-2">실제: DOWN</div>
            <div className="bg-yellow-900/50 rounded p-4 border border-yellow-500/50">
              <div className="text-2xl font-bold text-yellow-400">{confusionMatrix.falsePositive}</div>
              <div className="text-xs text-gray-400 mt-1">False Positive</div>
            </div>
            <div className="bg-blue-900/50 rounded p-4 border border-blue-500/50">
              <div className="text-2xl font-bold text-blue-400">{confusionMatrix.trueNegative}</div>
              <div className="text-xs text-gray-400 mt-1">True Negative</div>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">전체 샘플 수:</span>
              <span className="text-white font-semibold">{totalSamples}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">정확도:</span>
              <span className="text-green-400 font-semibold">
                {((confusionMatrix.truePositive + confusionMatrix.trueNegative) / totalSamples * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* 성능 RadialBar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">성능 지표</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="20%" 
              outerRadius="90%" 
              data={performanceRadialData}
              startAngle={180}
              endAngle={0}
            >
              <PolarGrid stroke="#374151" />
              <RadialBar
                minAngle={15}
                background={{ fill: '#374151' }}
                clockWise
                dataKey="value"
                cornerRadius={10}
              />
              <Legend 
                iconSize={18}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 특성별 OOB 중요도 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLeaf className="text-green-400" />
          특성별 OOB 중요도 감소
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={featureOOBImportance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="feature" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any) => (value * 100).toFixed(1) + '%'}
            />
            <Bar dataKey="importance" fill="#3b82f6" name="기본 중요도" />
            <Bar dataKey="oobDecrease" fill="#10b981" name="OOB 감소 기여도" />
          </BarChart>
        </ResponsiveContainer>
        
        <p className="text-gray-400 text-sm mt-4">
          각 특성을 무작위로 섞었을 때 OOB 오차가 얼마나 증가하는지를 측정하여 
          실제 예측에 중요한 특성을 파악할 수 있습니다.
        </p>
      </motion.div>

      {/* OOB 활용 가이드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-400" />
          OOB 분석 활용 팁
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>OOB 오차가 더 이상 감소하지 않으면 트리 추가를 중단</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Training Error와 OOB Error의 차이가 크면 과적합 의심</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>OOB 중요도가 낮은 특성은 제거하여 모델 단순화</span>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>별도의 검증 세트 없이도 신뢰할 수 있는 성능 평가</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>실시간으로 모델 성능을 모니터링하며 학습 가능</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>특성 중요도와 함께 고려하여 최적 특성 선택</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}