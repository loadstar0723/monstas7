'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaPlay, FaPause, FaRedo, FaChartLine, FaBrain,
  FaCogs, FaGraduationCap, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ReferenceLine, ComposedChart
} from 'recharts'
import CountUp from 'react-countup'

interface TrainingVisualizationProps {
  symbol: string
}

export default function TrainingVisualization({ symbol }: TrainingVisualizationProps) {
  const [isTraining, setIsTraining] = useState(false)
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [trainingHistory, setTrainingHistory] = useState<any[]>([])
  const [learningRate, setLearningRate] = useState(0.001)
  const [batchSize, setBatchSize] = useState(32)
  const [optimizer, setOptimizer] = useState<'adam' | 'sgd' | 'rmsprop'>('adam')

  // 훈련 시뮬레이션
  useEffect(() => {
    if (isTraining && currentEpoch < 100) {
      const timer = setTimeout(() => {
        // 손실과 정확도 계산 (시뮬레이션)
        const baseLoss = 2.5 * Math.exp(-currentEpoch * 0.05)
        const noise = (Math.random() - 0.5) * 0.1
        const trainLoss = Math.max(0.1, baseLoss + noise)
        const valLoss = Math.max(0.15, baseLoss * 1.1 + noise * 1.5)
        
        const trainAcc = Math.min(0.99, 1 - trainLoss / 3)
        const valAcc = Math.min(0.95, 1 - valLoss / 3)

        const newHistory = [...trainingHistory, {
          epoch: currentEpoch + 1,
          trainLoss,
          valLoss,
          trainAcc: trainAcc * 100,
          valAcc: valAcc * 100,
          learningRate: learningRate * Math.pow(0.95, Math.floor(currentEpoch / 10)),
          time: (currentEpoch + 1) * 2.5
        }]

        setTrainingHistory(newHistory)
        setCurrentEpoch(prev => prev + 1)
      }, 100)

      return () => clearTimeout(timer)
    } else if (currentEpoch >= 100) {
      setIsTraining(false)
    }
  }, [isTraining, currentEpoch, trainingHistory, learningRate])

  // 그래디언트 플로우 데이터
  const gradientFlow = [
    { layer: 'Output', gradient: 0.8, norm: 1.2 },
    { layer: 'Dense3', gradient: 0.6, norm: 0.9 },
    { layer: 'Dense2', gradient: 0.4, norm: 0.7 },
    { layer: 'Dense1', gradient: 0.3, norm: 0.5 },
    { layer: 'Input', gradient: 0.1, norm: 0.3 }
  ]

  // 최적화 알고리즘 비교
  const optimizerComparison = [
    { epoch: 10, Adam: 0.8, SGD: 1.2, RMSprop: 0.9 },
    { epoch: 20, Adam: 0.5, SGD: 0.9, RMSprop: 0.6 },
    { epoch: 30, Adam: 0.3, SGD: 0.7, RMSprop: 0.4 },
    { epoch: 40, Adam: 0.2, SGD: 0.5, RMSprop: 0.3 },
    { epoch: 50, Adam: 0.15, SGD: 0.4, RMSprop: 0.25 }
  ]

  const toggleTraining = () => {
    if (isTraining) {
      setIsTraining(false)
    } else {
      if (currentEpoch >= 100) {
        resetTraining()
      }
      setIsTraining(true)
    }
  }

  const resetTraining = () => {
    setIsTraining(false)
    setCurrentEpoch(0)
    setTrainingHistory([])
  }

  // 현재 성능 지표
  const currentMetrics = trainingHistory[trainingHistory.length - 1] || {
    trainLoss: 0,
    valLoss: 0,
    trainAcc: 0,
    valAcc: 0
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaGraduationCap className="text-green-400" />
          신경망 학습 과정 시각화
        </h2>
        <p className="text-gray-300">
          실시간 학습 진행 상황과 성능 지표를 모니터링하세요
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 훈련 설정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaCogs className="text-blue-400" />
              훈련 설정
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">학습률</label>
                <input
                  type="number"
                  value={learningRate}
                  onChange={(e) => {
                    if (e && e.target && e.target.value) {
                      setLearningRate(parseFloat(e.target.value))
                    }
                  }}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                  step="0.0001"
                  disabled={isTraining}
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">배치 크기</label>
                <select
                  value={batchSize}
                  onChange={(e) => {
                    if (e && e.target && e.target.value) {
                      setBatchSize(parseInt(e.target.value))
                    }
                  }}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                  disabled={isTraining}
                >
                  <option value={16}>16</option>
                  <option value={32}>32</option>
                  <option value={64}>64</option>
                  <option value={128}>128</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">최적화 알고리즘</label>
              <select
                value={optimizer}
                onChange={(e) => {
                  if (e && e.target && e.target.value) {
                    setOptimizer(e.target.value as any)
                  }
                }}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                disabled={isTraining}
              >
                <option value="adam">Adam</option>
                <option value="sgd">SGD</option>
                <option value="rmsprop">RMSprop</option>
              </select>
            </div>
          </div>

          {/* 훈련 상태 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaChartLine className="text-green-400" />
              훈련 상태
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-sm text-gray-400 mb-1">에포크</div>
                <div className="text-2xl font-bold text-white">
                  <CountUp end={currentEpoch} duration={0.5} /> / 100
                </div>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-sm text-gray-400 mb-1">진행률</div>
                <div className="text-2xl font-bold text-green-400">
                  <CountUp end={currentEpoch} duration={0.5} suffix="%" />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleTraining}
                className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  isTraining
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                    : 'bg-green-500/20 text-green-400 border border-green-500/50'
                }`}
              >
                {isTraining ? <FaPause /> : <FaPlay />}
                {isTraining ? '일시정지' : currentEpoch > 0 ? '재개' : '학습 시작'}
              </button>
              <button
                onClick={resetTraining}
                className="px-4 py-2 rounded-lg bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-600/50 flex items-center gap-2"
              >
                <FaRedo />
                리셋
              </button>
            </div>
          </div>
        </div>

        {/* 프로그레스 바 */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>학습 진행도</span>
            <span>{currentEpoch}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentEpoch}%` }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 성능 메트릭 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
        >
          <div className="text-sm text-gray-400 mb-1">훈련 손실</div>
          <div className="text-2xl font-bold text-blue-400">
            <CountUp
              end={currentMetrics.trainLoss}
              decimals={4}
              duration={0.5}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
        >
          <div className="text-sm text-gray-400 mb-1">검증 손실</div>
          <div className="text-2xl font-bold text-purple-400">
            <CountUp
              end={currentMetrics.valLoss}
              decimals={4}
              duration={0.5}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
        >
          <div className="text-sm text-gray-400 mb-1">훈련 정확도</div>
          <div className="text-2xl font-bold text-green-400">
            <CountUp
              end={currentMetrics.trainAcc}
              decimals={2}
              duration={0.5}
              suffix="%"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
        >
          <div className="text-sm text-gray-400 mb-1">검증 정확도</div>
          <div className="text-2xl font-bold text-yellow-400">
            <CountUp
              end={currentMetrics.valAcc}
              decimals={2}
              duration={0.5}
              suffix="%"
            />
          </div>
        </motion.div>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 손실 곡선 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4">손실 곡선</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trainingHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="epoch" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => value.toFixed(4)}
              />
              <Line
                type="monotone"
                dataKey="trainLoss"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="훈련 손실"
              />
              <Line
                type="monotone"
                dataKey="valLoss"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                name="검증 손실"
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 정확도 곡선 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4">정확도 곡선</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trainingHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="epoch" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => `${value.toFixed(2)}%`}
              />
              <Area
                type="monotone"
                dataKey="trainAcc"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
                name="훈련 정확도"
              />
              <Area
                type="monotone"
                dataKey="valAcc"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.3}
                strokeWidth={2}
                name="검증 정확도"
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 그래디언트 플로우 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4">그래디언트 플로우</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={gradientFlow} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis dataKey="layer" type="category" stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="gradient" fill="#3b82f6" name="그래디언트 크기" />
            <Bar dataKey="norm" fill="#10b981" name="노름" />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 학습 팁 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/30"
        >
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FaCheckCircle className="text-green-400" />
            최적화 팁
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• 학습률은 보통 0.001에서 시작하여 점진적으로 감소</li>
            <li>• 배치 크기가 클수록 안정적이지만 메모리 사용량 증가</li>
            <li>• Adam 옵티마이저는 대부분의 경우 좋은 성능 제공</li>
            <li>• 조기 종료(Early Stopping)로 과적합 방지</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl p-6 border border-yellow-500/30"
        >
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-400" />
            주의사항
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• 검증 손실이 증가하면 과적합 신호</li>
            <li>• 그래디언트 소실/폭발 주의</li>
            <li>• 학습이 너무 느리면 학습률 조정 필요</li>
            <li>• 규제(Regularization) 기법 적용 고려</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}