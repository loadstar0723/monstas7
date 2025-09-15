'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaTree, FaPlay, FaPause, FaRedo, FaRocket,
  FaChartLine, FaMinus, FaPlus, FaLightbulb
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, ComposedChart, Legend
} from 'recharts'
import CountUp from 'react-countup'

interface BoostingAnimationProps {
  symbol: string
}

interface TreeStep {
  id: number
  prediction: number
  residual: number
  cumulative: number
  weight: number
  error: number
}

export default function BoostingAnimation({ symbol }: BoostingAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [trees, setTrees] = useState<TreeStep[]>([])
  const [showResiduals, setShowResiduals] = useState(true)
  const [speed, setSpeed] = useState(1000) // 애니메이션 속도

  const targetValue = 0.85 // 목표값
  const maxTrees = 10

  // 트리 단계 생성
  const generateTreeStep = (prevTrees: TreeStep[]): TreeStep => {
    const id = prevTrees.length
    const prevCumulative = id > 0 ? prevTrees[id - 1].cumulative : 0
    const residual = targetValue - prevCumulative
    const learningRate = 0.3
    const weight = learningRate
    const prediction = residual * weight + (Math.random() - 0.5) * 0.05
    const cumulative = prevCumulative + prediction
    const error = Math.abs(targetValue - cumulative)

    return {
      id,
      prediction,
      residual,
      cumulative,
      weight,
      error
    }
  }

  // 애니메이션 시작/정지
  const toggleAnimation = () => {
    if (isAnimating) {
      setIsAnimating(false)
    } else {
      setIsAnimating(true)
      if (trees.length >= maxTrees) {
        resetAnimation()
      }
    }
  }

  // 애니메이션 리셋
  const resetAnimation = () => {
    setIsAnimating(false)
    setCurrentStep(0)
    setTrees([])
  }

  // 애니메이션 효과
  useEffect(() => {
    if (isAnimating && trees.length < maxTrees) {
      const timer = setTimeout(() => {
        const newTree = generateTreeStep(trees)
        setTrees(prev => [...prev, newTree])
        setCurrentStep(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    } else if (trees.length >= maxTrees) {
      setIsAnimating(false)
    }
  }, [isAnimating, trees, speed])

  // 차트 데이터 준비
  const chartData = trees.map((tree, index) => ({
    step: `Tree ${index + 1}`,
    예측값: tree.cumulative,
    목표값: targetValue,
    개별예측: tree.prediction,
    잘차: tree.residual,
    오차: tree.error
  }))

  // 현재 성능 지표
  const currentPerformance = trees.length > 0 ? {
    prediction: trees[trees.length - 1].cumulative,
    error: trees[trees.length - 1].error,
    improvement: trees.length > 1 
      ? ((trees[trees.length - 2].error - trees[trees.length - 1].error) / trees[trees.length - 2].error * 100)
      : 0
  } : {
    prediction: 0,
    error: targetValue,
    improvement: 0
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaRocket className="text-green-400" />
          부스팅 과정 시각화
        </h2>
        <p className="text-gray-300">
          XGBoost가 순차적으로 트리를 추가하며 예측을 개선하는 과정을 확인하세요
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">부스팅 시뮬레이션</h3>
          <div className="flex items-center gap-4">
            {/* 속도 조절 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">속도:</span>
              <input
                type="range"
                min="500"
                max="2000"
                step="100"
                value={speed}
                onChange={(e) => {
              if (e && e.target && e.target.value) {
                setSpeed(Number(e.target.value))
              }
            }}
                className="w-24"
              />
              <span className="text-sm text-white">{(2500 - speed) / 1000}x</span>
            </div>
            
            {/* 버튼들 */}
            <button
              onClick={toggleAnimation}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                isAnimating
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-green-500/20 text-green-400 border border-green-500/50'
              } hover:opacity-80`}
            >
              {isAnimating ? <FaPause /> : <FaPlay />}
              {isAnimating ? '일시정지' : '시작'}
            </button>
            <button
              onClick={resetAnimation}
              className="px-4 py-2 rounded-lg bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-600/50 flex items-center gap-2"
            >
              <FaRedo />
              리셋
            </button>
          </div>
        </div>

        {/* 진행 상태 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              <CountUp end={trees.length} duration={0.5} /> / {maxTrees}
            </div>
            <div className="text-sm text-gray-400">트리 개수</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">
              <CountUp 
                end={currentPerformance.prediction} 
                decimals={3} 
                duration={0.5} 
              />
            </div>
            <div className="text-sm text-gray-400">현재 예측값</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-1">
              <CountUp 
                end={currentPerformance.error} 
                decimals={4} 
                duration={0.5} 
              />
            </div>
            <div className="text-sm text-gray-400">오차</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              <CountUp 
                end={currentPerformance.improvement} 
                decimals={1} 
                duration={0.5} 
                suffix="%"
              />
            </div>
            <div className="text-sm text-gray-400">개선률</div>
          </div>
        </div>

        {/* 프로그레스 바 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">학습 진행도</span>
            <span className="text-white text-sm font-semibold">
              {((trees.length / maxTrees) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(trees.length / maxTrees) * 100}%` }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 트리 시각화 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 개별 트리 예측 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">개별 트리 기여도</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {trees.map((tree, index) => (
                <motion.div
                  key={tree.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FaTree className="text-green-400" />
                    <span className="text-white font-medium">Tree {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-400">예측:</div>
                      <div className={`font-mono ${
                        tree.prediction > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {tree.prediction > 0 ? '+' : ''}{tree.prediction.toFixed(4)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">가중치:</div>
                      <div className="text-blue-400 font-mono">{tree.weight.toFixed(2)}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 누적 예측 차트 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">누적 예측 개선</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="step" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => value.toFixed(4)}
              />
              <ReferenceLine y={targetValue} stroke="#f59e0b" strokeDasharray="5 5" label="목표" />
              
              <Area
                type="monotone"
                dataKey="예측값"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              
              {showResiduals && (
                <Bar dataKey="잘차" fill="#ef4444" opacity={0.6} />
              )}
              
              <Line
                type="monotone"
                dataKey="오차"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
                yAxisId="right"
              />
              
              <Legend />
            </ComposedChart>
          </ResponsiveContainer>
          
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowResiduals(!showResiduals)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                showResiduals
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
              }`}
            >
              잔차 {showResiduals ? '숨기기' : '표시'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* 부스팅 과정 설명 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          부스팅 학습 과정
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-green-400">1</span>
            </div>
            <h4 className="text-green-400 font-semibold mb-1">잔차 계산</h4>
            <p className="text-sm text-gray-300">
              목표값과 현재 예측값의 차이를 계산
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-blue-400">2</span>
            </div>
            <h4 className="text-blue-400 font-semibold mb-1">새 트리 학습</h4>
            <p className="text-sm text-gray-300">
              잔차를 예측하는 새로운 트리를 학습
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-purple-400">3</span>
            </div>
            <h4 className="text-purple-400 font-semibold mb-1">예측 업데이트</h4>
            <p className="text-sm text-gray-300">
              학습률을 고려하여 예측값을 업데이트
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-yellow-400">4</span>
            </div>
            <h4 className="text-yellow-400 font-semibold mb-1">반복</h4>
            <p className="text-sm text-gray-300">
              목표 성능에 도달할 때까지 반복
            </p>
          </div>
        </div>
      </motion.div>

      {/* 성능 개선 효과 */}
      {trees.length >= maxTrees && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-8 border border-green-500/50 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">학습 완료!</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">
                {((1 - currentPerformance.error / targetValue) * 100).toFixed(1)}%
              </div>
              <div className="text-gray-300">정확도 달성</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {trees.length}
              </div>
              <div className="text-gray-300">사용된 트리</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {(currentPerformance.error * 1000).toFixed(1)}ms
              </div>
              <div className="text-gray-300">평균 오차</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}