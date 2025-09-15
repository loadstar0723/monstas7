'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaCogs, FaPlay, FaPause, FaRedo, FaMagic,
  FaChartLine, FaLightbulb, FaBolt, FaAdjust
} from 'react-icons/fa'
import { 
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import CountUp from 'react-countup'

interface ParameterOptimizationProps {
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
  impact: 'high' | 'medium' | 'low'
  category: 'core' | 'regularization' | 'efficiency'
}

export default function ParameterOptimization({ symbol }: ParameterOptimizationProps) {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [currentIteration, setCurrentIteration] = useState(0)
  const [bestScore, setBestScore] = useState(0.85)
  const [searchMethod, setSearchMethod] = useState<'grid' | 'random' | 'bayesian'>('bayesian')
  
  // LightGBM 특화 파라미터
  const [parameters, setParameters] = useState<Parameter[]>([
    // 핵심 파라미터
    {
      name: 'num_leaves',
      displayName: '리프 수',
      value: 31,
      min: 10,
      max: 200,
      step: 1,
      description: '트리의 복잡도 제어 (2^max_depth 보다 작게)',
      impact: 'high',
      category: 'core'
    },
    {
      name: 'learning_rate',
      displayName: '학습률',
      value: 0.1,
      min: 0.01,
      max: 0.3,
      step: 0.01,
      description: '부스팅 스텝의 축소 비율',
      impact: 'high',
      category: 'core'
    },
    {
      name: 'max_depth',
      displayName: '최대 깊이',
      value: -1,
      min: -1,
      max: 20,
      step: 1,
      description: '트리 깊이 제한 (-1: 무제한)',
      impact: 'medium',
      category: 'core'
    },
    {
      name: 'min_data_in_leaf',
      displayName: '리프 최소 데이터',
      value: 20,
      min: 5,
      max: 100,
      step: 5,
      description: '리프 노드의 최소 샘플 수',
      impact: 'medium',
      category: 'core'
    },
    // 규제 파라미터
    {
      name: 'lambda_l1',
      displayName: 'L1 규제',
      value: 0,
      min: 0,
      max: 10,
      step: 0.1,
      description: 'L1 정규화 계수',
      impact: 'medium',
      category: 'regularization'
    },
    {
      name: 'lambda_l2',
      displayName: 'L2 규제',
      value: 0,
      min: 0,
      max: 10,
      step: 0.1,
      description: 'L2 정규화 계수',
      impact: 'medium',
      category: 'regularization'
    },
    {
      name: 'feature_fraction',
      displayName: '특성 샘플링',
      value: 0.8,
      min: 0.4,
      max: 1.0,
      step: 0.05,
      description: '각 트리에 사용할 특성 비율',
      impact: 'medium',
      category: 'regularization'
    },
    {
      name: 'bagging_fraction',
      displayName: '데이터 샘플링',
      value: 0.8,
      min: 0.4,
      max: 1.0,
      step: 0.05,
      description: '각 반복에서 사용할 데이터 비율',
      impact: 'low',
      category: 'regularization'
    },
    // 효율성 파라미터
    {
      name: 'max_bin',
      displayName: '최대 빈 수',
      value: 255,
      min: 10,
      max: 255,
      step: 5,
      description: '히스토그램 빈의 최대 개수',
      impact: 'low',
      category: 'efficiency'
    }
  ])

  // 파라미터 업데이트
  const updateParameter = (name: string, value: number) => {
    setParameters(prev => prev.map(p => 
      p.name === name ? { ...p, value } : p
    ))
  }

  // 최적화 시뮬레이션
  const [optimizationHistory, setOptimizationHistory] = useState<any[]>([])

  useEffect(() => {
    if (isOptimizing && currentIteration < 50) {
      const timer = setTimeout(() => {
        // 성능 시뮬레이션
        const numLeavesParam = parameters.find(p => p.name === 'num_leaves')
        const learningRateParam = parameters.find(p => p.name === 'learning_rate')
        const numLeaves = numLeavesParam ? numLeavesParam.value : 31
        const learningRate = learningRateParam ? learningRateParam.value : 0.1
        
        const score = 0.85 + 
          (numLeaves / 200) * 0.05 + 
          (1 - learningRate) * 0.05 + 
          (Math.random() - 0.5) * 0.02

        setOptimizationHistory(prev => [...prev, {
          iteration: currentIteration + 1,
          score: Math.min(0.95, Math.max(0.8, score)),
          params: Object.fromEntries(parameters.map(p => [p.name, p.value]))
        }])

        if (score > bestScore) {
          setBestScore(score)
        }

        // 베이지안 최적화 시뮬레이션
        if (searchMethod === 'bayesian') {
          parameters.forEach(param => {
            const adjustment = (Math.random() - 0.5) * (param.max - param.min) * 0.1
            const newValue = Math.max(param.min, Math.min(param.max, param.value + adjustment))
            updateParameter(param.name, newValue)
          })
        }

        setCurrentIteration(prev => prev + 1)
      }, 200)

      return () => clearTimeout(timer)
    } else if (currentIteration >= 50) {
      setIsOptimizing(false)
    }
  }, [isOptimizing, currentIteration, searchMethod, parameters, bestScore])

  // 파라미터 중요도
  const parameterImportance = [
    { param: 'num_leaves', importance: 35, optimal: 31 },
    { param: 'learning_rate', importance: 30, optimal: 0.1 },
    { param: 'min_data_in_leaf', importance: 15, optimal: 20 },
    { param: 'feature_fraction', importance: 10, optimal: 0.8 },
    { param: 'lambda_l1', importance: 5, optimal: 0 },
    { param: 'lambda_l2', importance: 5, optimal: 0 }
  ]

  // 레이더 차트 데이터
  const radarData = parameters.filter(p => p.impact === 'high' || p.impact === 'medium').map(param => ({
    parameter: param.displayName,
    current: ((param.value - param.min) / (param.max - param.min)) * 100,
    optimal: 75 // 시뮬레이션된 최적값
  }))

  const toggleOptimization = () => {
    if (isOptimizing) {
      setIsOptimizing(false)
    } else {
      if (currentIteration >= 50) {
        resetOptimization()
      }
      setIsOptimizing(true)
    }
  }

  const resetOptimization = () => {
    setIsOptimizing(false)
    setCurrentIteration(0)
    setOptimizationHistory([])
    setBestScore(0.85)
  }

  // 자동 튜닝
  const autoTune = () => {
    // LightGBM 권장 설정
    updateParameter('num_leaves', 31)
    updateParameter('learning_rate', 0.05)
    updateParameter('feature_fraction', 0.9)
    updateParameter('bagging_fraction', 0.8)
    updateParameter('min_data_in_leaf', 20)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaCogs className="text-purple-400" />
          LightGBM 파라미터 최적화
        </h2>
        <p className="text-gray-300">
          베이지안 최적화로 최적의 하이퍼파라미터를 찾아냅니다
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">최적화 컨트롤</h3>
          <div className="flex items-center gap-4">
            {/* 검색 방법 선택 */}
            <select
              value={searchMethod}
              onChange={(e) => {
                if (e && e.target && e.target.value) {
                  setSearchMethod(e.target.value as any)
                }
              }}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
              disabled={isOptimizing}
            >
              <option value="grid">Grid Search</option>
              <option value="random">Random Search</option>
              <option value="bayesian">베이지안 최적화</option>
            </select>

            {/* 버튼들 */}
            <button
              onClick={autoTune}
              className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30 flex items-center gap-2"
            >
              <FaMagic />
              자동 설정
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
                end={bestScore * 100} 
                decimals={2} 
                duration={0.5} 
                suffix="%"
              />
            </div>
            <div className="text-sm text-gray-400">최고 점수</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              <CountUp 
                end={parameters.length} 
                duration={0.5} 
              />
            </div>
            <div className="text-sm text-gray-400">파라미터 수</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {searchMethod === 'bayesian' ? '베이지안' : searchMethod === 'grid' ? '그리드' : '랜덤'}
            </div>
            <div className="text-sm text-gray-400">검색 방법</div>
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
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        </div>
      </div>

      {/* 파라미터 조정 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 핵심 파라미터 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaBolt className="text-yellow-400" />
            핵심 파라미터
          </h3>
          <div className="space-y-4">
            {parameters.filter(p => p.category === 'core').map((param) => (
              <div key={param.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">{param.displayName}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      param.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                      param.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {param.impact === 'high' ? '높음' : param.impact === 'medium' ? '중간' : '낮음'}
                    </span>
                  </div>
                  <span className="text-blue-400 font-mono font-bold">
                    {param.value}
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
                  disabled={isOptimizing}
                />
                <p className="text-xs text-gray-400">{param.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 규제 파라미터 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaAdjust className="text-green-400" />
            규제 파라미터
          </h3>
          <div className="space-y-4">
            {parameters.filter(p => p.category === 'regularization').map((param) => (
              <div key={param.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{param.displayName}</span>
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
                  disabled={isOptimizing}
                />
                <p className="text-xs text-gray-400">{param.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 최적화 추이 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">최적화 추이</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={optimizationHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="iteration" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0.8, 0.95]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => `${(value * 100).toFixed(2)}%`}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="검증 점수"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 파라미터 중요도 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-400" />
          파라미터 중요도 분석
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={parameterImportance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="param" type="category" stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => `${value}%`}
              />
              <Bar dataKey="importance" fill="#3b82f6" name="중요도">
                {parameterImportance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.importance > 20 ? '#ef4444' :
                    entry.importance > 10 ? '#f59e0b' : '#10b981'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="parameter" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar
                name="현재 설정"
                dataKey="current"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Radar
                name="권장 설정"
                dataKey="optimal"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.4}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 최적화 팁 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          LightGBM 최적화 팁
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-purple-400 font-semibold mb-3">파라미터 설정 가이드</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>num_leaves는 2^max_depth보다 작게 설정하여 과적합 방지</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>학습률을 낮추고 n_estimators를 늘려 안정적 학습</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>min_data_in_leaf로 리프 노드의 최소 크기 제어</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>lambda_l1/l2로 복잡도 페널티 적용</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-pink-400 font-semibold mb-3">성능 최적화 전략</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                <span>베이지안 최적화로 효율적인 하이퍼파라미터 탐색</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                <span>early_stopping으로 과적합 방지 및 학습 시간 단축</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                <span>categorical_feature 명시로 범주형 변수 처리 최적화</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                <span>dart mode로 dropout 적용하여 일반화 성능 향상</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}