'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaCogs, FaPlay, FaPause, FaRedo, FaChartLine,
  FaMagic, FaBolt, FaAdjust, FaChartBar, FaLightbulb
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  ScatterChart, Scatter, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts'
import CountUp from 'react-countup'

interface HyperparameterTuningProps {
  symbol: string
}

interface Parameter {
  name: string
  displayName: string
  value: number
  min: number
  max: number
  step: number
  description: string
  effect: string
}

interface PerformanceMetric {
  iteration: number
  accuracy: number
  loss: number
  overfitting: number
  trainingTime: number
  parameters: Record<string, number>
}

export default function HyperparameterTuning({ symbol }: HyperparameterTuningProps) {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [currentIteration, setCurrentIteration] = useState(0)
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetric[]>([])
  const [bestPerformance, setBestPerformance] = useState<PerformanceMetric | null>(null)
  
  // 하이퍼파라미터 정의
  const [parameters, setParameters] = useState<Parameter[]>([
    {
      name: 'learning_rate',
      displayName: '학습률',
      value: 0.3,
      min: 0.01,
      max: 0.5,
      step: 0.01,
      description: '각 트리의 기여도 조절',
      effect: '낮으면 과적합 방지, 높으면 빠른 학습'
    },
    {
      name: 'max_depth',
      displayName: '최대 깊이',
      value: 6,
      min: 3,
      max: 15,
      step: 1,
      description: '트리의 최대 깊이 제한',
      effect: '깊으면 복잡한 패턴, 얕으면 단순한 모델'
    },
    {
      name: 'n_estimators',
      displayName: '트리 개수',
      value: 100,
      min: 50,
      max: 500,
      step: 10,
      description: '부스팅 라운드 수',
      effect: '많으면 정확도 상승, 학습 시간 증가'
    },
    {
      name: 'subsample',
      displayName: '샘플링 비율',
      value: 0.8,
      min: 0.5,
      max: 1.0,
      step: 0.05,
      description: '각 트리에 사용할 샘플 비율',
      effect: '낮으면 과적합 방지, 높으면 전체 데이터 활용'
    },
    {
      name: 'colsample_bytree',
      displayName: '특성 샘플링',
      value: 0.8,
      min: 0.3,
      max: 1.0,
      step: 0.05,
      description: '각 트리에 사용할 특성 비율',
      effect: '다양성 증가로 과적합 방지'
    },
    {
      name: 'gamma',
      displayName: '분할 임계값',
      value: 0.1,
      min: 0,
      max: 5,
      step: 0.1,
      description: '노드 분할 최소 손실 감소',
      effect: '높으면 보수적 분할, 과적합 방지'
    }
  ])

  // 파라미터 업데이트
  const updateParameter = (name: string, value: number) => {
    setParameters(prev => prev.map(p => 
      p.name === name ? { ...p, value } : p
    ))
  }

  // 성능 시뮬레이션
  const simulatePerformance = () => {
    const lrParam = parameters.find(p => p.name === 'learning_rate')
    const depthParam = parameters.find(p => p.name === 'max_depth')
    const treesParam = parameters.find(p => p.name === 'n_estimators')
    
    const lr = lrParam ? lrParam.value : 0.1
    const depth = depthParam ? depthParam.value : 6
    const trees = treesParam ? treesParam.value : 100
    
    const baseAccuracy = 0.7
    const accuracyBoost = (lr * 0.3) + (depth * 0.02) + (trees * 0.0005)
    const randomNoise = (Math.random() - 0.5) * 0.05
    
    const accuracy = Math.min(0.95, baseAccuracy + accuracyBoost + randomNoise)
    const loss = 1 - accuracy + (Math.random() * 0.05)
    const overfitting = depth > 10 ? (depth - 10) * 0.03 : 0
    const trainingTime = trees * 0.01 + depth * 0.5

    return {
      iteration: currentIteration + 1,
      accuracy,
      loss,
      overfitting,
      trainingTime,
      parameters: Object.fromEntries(parameters.map(p => [p.name, p.value]))
    }
  }

  // 최적화 실행
  useEffect(() => {
    if (isOptimizing && currentIteration < 50) {
      const timer = setTimeout(() => {
        const performance = simulatePerformance()
        setPerformanceHistory(prev => [...prev, performance])
        
        if (!bestPerformance || performance.accuracy > bestPerformance.accuracy) {
          setBestPerformance(performance)
        }
        
        setCurrentIteration(prev => prev + 1)
      }, 100)
      
      return () => clearTimeout(timer)
    } else if (currentIteration >= 50) {
      setIsOptimizing(false)
    }
  }, [isOptimizing, currentIteration])

  // 자동 튜닝 (베이지안 최적화 시뮬레이션)
  const autoTune = () => {
    parameters.forEach(param => {
      const randomAdjustment = (Math.random() - 0.5) * (param.max - param.min) * 0.2
      const newValue = Math.max(param.min, Math.min(param.max, param.value + randomAdjustment))
      updateParameter(param.name, newValue)
    })
  }

  // 최적화 토글
  const toggleOptimization = () => {
    if (isOptimizing) {
      setIsOptimizing(false)
    } else {
      setIsOptimizing(true)
      if (currentIteration >= 50) {
        resetOptimization()
      }
    }
  }

  // 리셋
  const resetOptimization = () => {
    setIsOptimizing(false)
    setCurrentIteration(0)
    setPerformanceHistory([])
    setBestPerformance(null)
  }

  // 레이더 차트 데이터
  const radarData = useMemo(() => {
    return parameters.map(param => ({
      parameter: param.displayName,
      현재값: ((param.value - param.min) / (param.max - param.min)) * 100,
      최적값: bestPerformance 
        ? ((bestPerformance.parameters[param.name] - param.min) / (param.max - param.min)) * 100 
        : 50
    }))
  }, [parameters, bestPerformance])

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaCogs className="text-blue-400" />
          하이퍼파라미터 튜닝
        </h2>
        <p className="text-gray-300">
          XGBoost 모델의 성능을 최적화하기 위한 실시간 파라미터 조정
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">최적화 컨트롤</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={autoTune}
              className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30 flex items-center gap-2"
            >
              <FaMagic />
              자동 튜닝
            </button>
            <button
              onClick={toggleOptimization}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                isOptimizing
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-green-500/20 text-green-400 border border-green-500/50'
              } hover:opacity-80`}
            >
              {isOptimizing ? <FaPause /> : <FaPlay />}
              {isOptimizing ? '정지' : '최적화 시작'}
            </button>
            <button
              onClick={resetOptimization}
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
              <CountUp end={currentIteration} duration={0.5} /> / 50
            </div>
            <div className="text-sm text-gray-400">반복 횟수</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">
              <CountUp 
                end={bestPerformance?.accuracy || 0} 
                decimals={2} 
                duration={0.5} 
                suffix="%"
                formattingFn={(value) => (value * 100).toFixed(2)}
              />
            </div>
            <div className="text-sm text-gray-400">최고 정확도</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-1">
              <CountUp 
                end={bestPerformance?.loss || 1} 
                decimals={3} 
                duration={0.5} 
              />
            </div>
            <div className="text-sm text-gray-400">최소 손실</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              <CountUp 
                end={bestPerformance?.trainingTime || 0} 
                decimals={1} 
                duration={0.5} 
                suffix="s"
              />
            </div>
            <div className="text-sm text-gray-400">학습 시간</div>
          </div>
        </div>

        {/* 프로그레스 바 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">최적화 진행도</span>
            <span className="text-white text-sm font-semibold">
              {((currentIteration / 50) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentIteration / 50) * 100}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>
      </div>

      {/* 파라미터 조정 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">파라미터 조정</h3>
          <div className="space-y-4">
            {parameters.map((param) => (
              <div key={param.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">{param.displayName}</span>
                    <span className="text-gray-400 text-sm ml-2">
                      ({param.min} - {param.max})
                    </span>
                  </div>
                  <span className="text-blue-400 font-mono font-bold">
                    {param.value.toFixed(param.step < 1 ? 2 : 0)}
                  </span>
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={param.value}
                  onChange={(e) => updateParameter(param.name, parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-400">{param.description}</p>
                <p className="text-xs text-yellow-400">{param.effect}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 성능 메트릭 차트 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">성능 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="iteration" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => value.toFixed(3)}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="정확도"
              />
              <Line
                type="monotone"
                dataKey="loss"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="손실"
              />
              <Line
                type="monotone"
                dataKey="overfitting"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="과적합도"
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 파라미터 비교 레이더 차트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaChartBar className="text-purple-400" />
          파라미터 균형 분석
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="parameter" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar
                name="현재 설정"
                dataKey="현재값"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Radar
                name="최적 설정"
                dataKey="최적값"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.4}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">최적화 인사이트</h4>
            
            {bestPerformance && (
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h5 className="text-green-400 font-semibold mb-2">최적 파라미터 세트</h5>
                <div className="space-y-1 text-sm">
                  {Object.entries(bestPerformance.parameters).map(([key, value]) => {
                    const param = parameters.find(p => p.name === key)
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400">{param?.displayName}:</span>
                        <span className="text-white font-mono">
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-500/30">
              <h5 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <FaLightbulb />
                튜닝 팁
              </h5>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 학습률을 낮추면 안정적이지만 느린 학습</li>
                <li>• 트리 깊이가 깊을수록 복잡한 패턴 학습</li>
                <li>• 샘플링 비율로 과적합 조절 가능</li>
                <li>• Grid Search보다 베이지안 최적화 추천</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 최적화 완료 메시지 */}
      {currentIteration >= 50 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-8 border border-green-500/50 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">최적화 완료!</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">
                {(bestPerformance?.accuracy * 100).toFixed(2)}%
              </div>
              <div className="text-gray-300">최종 정확도</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {((1 - bestPerformance?.accuracy) * 100).toFixed(1)}%
              </div>
              <div className="text-gray-300">성능 개선</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {currentIteration}회
              </div>
              <div className="text-gray-300">최적화 반복</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}