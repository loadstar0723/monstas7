'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCog, FaRobot, FaChartBar, FaBrain } from 'react-icons/fa'
import { 
  ScatterChart, Scatter, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ZAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

interface OptimizationParam {
  name: string
  min: number
  max: number
  step: number
  current: number
  optimal?: number
}

interface OptimizationResult {
  params: Record<string, number>
  performance: {
    sharpeRatio: number
    totalReturn: number
    maxDrawdown: number
    winRate: number
  }
  score: number
}

interface Props {
  strategy: any
}

export default function StrategyOptimizer({ strategy }: Props) {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationMethod, setOptimizationMethod] = useState<'grid' | 'random' | 'genetic' | 'bayesian'>('genetic')
  const [iterations, setIterations] = useState(100)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<OptimizationResult[]>([])
  const [bestResult, setBestResult] = useState<OptimizationResult | null>(null)
  const [parameters, setParameters] = useState<OptimizationParam[]>([
    { name: 'RSI Period', min: 5, max: 50, step: 1, current: 14 },
    { name: 'RSI Overbought', min: 60, max: 90, step: 5, current: 70 },
    { name: 'RSI Oversold', min: 10, max: 40, step: 5, current: 30 },
    { name: 'Stop Loss %', min: 1, max: 10, step: 0.5, current: 3 },
    { name: 'Take Profit %', min: 2, max: 20, step: 1, current: 8 }
  ])
  const [selectedMetric, setSelectedMetric] = useState<'sharpe' | 'return' | 'winRate' | 'custom'>('sharpe')

  // 최적화 실행
  const runOptimization = async () => {
    if (!strategy) {
      alert('전략을 먼저 생성해주세요.')
      return
    }

    setIsOptimizing(true)
    setProgress(0)
    setResults([])
    setBestResult(null)

    // 시뮬레이션된 최적화 프로세스
    const optimizationResults: OptimizationResult[] = []
    let bestScore = -Infinity
    let bestParams: OptimizationResult | null = null

    for (let i = 0; i < iterations; i++) {
      // 파라미터 생성 (최적화 방법에 따라 다름)
      const params: Record<string, number> = {}
      
      if (optimizationMethod === 'genetic') {
        // 유전 알고리즘 시뮬레이션
        parameters.forEach(param => {
          if (i === 0) {
            params[param.name] = param.current
          } else {
            // 이전 최고 결과 주변에서 변형
            const base = bestParams ? bestParams.params[param.name] : param.current
            const mutation = (Math.random() - 0.5) * (param.max - param.min) * 0.2
            params[param.name] = Math.max(param.min, Math.min(param.max, base + mutation))
          }
        })
      } else if (optimizationMethod === 'random') {
        // 랜덤 서치
        parameters.forEach(param => {
          params[param.name] = param.min + Math.random() * (param.max - param.min)
        })
      } else if (optimizationMethod === 'bayesian') {
        // 베이지안 최적화 시뮬레이션
        parameters.forEach(param => {
          // 가우시안 프로세스 시뮬레이션
          const mean = (param.max + param.min) / 2
          const std = (param.max - param.min) / 6
          params[param.name] = Math.max(param.min, Math.min(param.max, 
            mean + (Math.random() - 0.5) * 2 * std
          ))
        })
      } else {
        // 그리드 서치
        const gridSize = Math.floor(Math.pow(iterations, 1 / parameters.length))
        parameters.forEach((param, idx) => {
          const step = (param.max - param.min) / gridSize
          params[param.name] = param.min + (i % gridSize) * step
        })
      }

      // 성능 시뮬레이션
      const performance = {
        sharpeRatio: 0.5 + Math.random() * 2,
        totalReturn: -20 + Math.random() * 100,
        maxDrawdown: -(5 + Math.random() * 25),
        winRate: 30 + Math.random() * 40
      }

      // 점수 계산
      let score = 0
      switch (selectedMetric) {
        case 'sharpe':
          score = performance.sharpeRatio
          break
        case 'return':
          score = performance.totalReturn
          break
        case 'winRate':
          score = performance.winRate
          break
        case 'custom':
          // 커스텀 점수 함수
          score = performance.sharpeRatio * 0.4 + 
                  (performance.totalReturn / 100) * 0.3 + 
                  (performance.winRate / 100) * 0.2 - 
                  Math.abs(performance.maxDrawdown / 100) * 0.1
          break
      }

      const result: OptimizationResult = {
        params,
        performance,
        score
      }

      optimizationResults.push(result)

      // 최고 결과 업데이트
      if (score > bestScore) {
        bestScore = score
        bestParams = result
      }

      // 진행률 업데이트
      setProgress(((i + 1) / iterations) * 100)
      
      // UI 업데이트를 위한 지연
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    setResults(optimizationResults)
    setBestResult(bestParams)

    // 최적 파라미터 업데이트
    if (bestParams) {
      setParameters(prev => prev.map(param => ({
        ...param,
        optimal: bestParams.params[param.name]
      })))
    }

    setIsOptimizing(false)
  }

  // 3D 산점도 색상
  const getScatterColor = (score: number, maxScore: number) => {
    const ratio = score / maxScore
    if (ratio > 0.8) return '#10B981'
    if (ratio > 0.6) return '#3B82F6'
    if (ratio > 0.4) return '#F59E0B'
    return '#EF4444'
  }

  return (
    <div className="space-y-6">
      {/* 최적화 설정 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">최적화 설정</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">최적화 방법</label>
            <select
              value={optimizationMethod}
              onChange={(e) => setOptimizationMethod(e.target.value as any)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
            >
              <option value="genetic">유전 알고리즘</option>
              <option value="bayesian">베이지안 최적화</option>
              <option value="random">랜덤 서치</option>
              <option value="grid">그리드 서치</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">반복 횟수</label>
            <input
              type="number"
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              min={10}
              max={1000}
              step={10}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">최적화 목표</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
            >
              <option value="sharpe">샤프 비율</option>
              <option value="return">총 수익률</option>
              <option value="winRate">승률</option>
              <option value="custom">커스텀 (복합)</option>
            </select>
          </div>
        </div>

        <button
          onClick={runOptimization}
          disabled={isOptimizing}
          className={`${
            isOptimizing 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white px-4 py-2 rounded-lg flex items-center gap-2`}
        >
          <FaRobot className={isOptimizing ? 'animate-spin' : ''} />
          {isOptimizing ? '최적화 진행중...' : 'AI 최적화 시작'}
        </button>

        {/* 진행률 표시 */}
        {isOptimizing && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
              <span>{optimizationMethod === 'genetic' ? '유전 알고리즘' : 
                     optimizationMethod === 'bayesian' ? '베이지안 최적화' :
                     optimizationMethod === 'random' ? '랜덤 서치' : '그리드 서치'} 진행중...</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 파라미터 범위 설정 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">파라미터 범위</h3>
        <div className="space-y-4">
          {parameters.map((param, index) => (
            <div key={param.name} className="grid grid-cols-5 gap-4 items-center">
              <div className="text-white">{param.name}</div>
              <input
                type="number"
                value={param.min}
                onChange={(e) => {
                  const newParams = [...parameters]
                  newParams[index].min = Number(e.target.value)
                  setParameters(newParams)
                }}
                className="bg-gray-700 text-white px-3 py-2 rounded"
                placeholder="최소"
              />
              <input
                type="number"
                value={param.max}
                onChange={(e) => {
                  const newParams = [...parameters]
                  newParams[index].max = Number(e.target.value)
                  setParameters(newParams)
                }}
                className="bg-gray-700 text-white px-3 py-2 rounded"
                placeholder="최대"
              />
              <div className="text-center">
                <div className="text-gray-400 text-xs">현재</div>
                <div className="text-white font-semibold">{param.current.toFixed(1)}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-xs">최적</div>
                <div className="text-green-400 font-semibold">
                  {param.optimal ? param.optimal.toFixed(1) : '-'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 최적화 결과 */}
      {results.length > 0 && (
        <>
          {/* 최고 결과 */}
          {bestResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-500/50"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaBrain className="text-purple-400" />
                최적화 결과
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-400 text-sm">샤프 비율</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {bestResult.performance.sharpeRatio.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-400 text-sm">총 수익률</div>
                  <div className={`text-2xl font-bold ${
                    bestResult.performance.totalReturn > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {bestResult.performance.totalReturn > 0 ? '+' : ''}
                    {bestResult.performance.totalReturn.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-400 text-sm">최대 손실</div>
                  <div className="text-2xl font-bold text-red-400">
                    {bestResult.performance.maxDrawdown.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-400 text-sm">승률</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {bestResult.performance.winRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 최적화 분포 차트 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">파라미터 분포</h4>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="sharpeRatio" 
                  name="샤프 비율" 
                  stroke="#9CA3AF"
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis 
                  dataKey="totalReturn" 
                  name="수익률" 
                  stroke="#9CA3AF"
                  domain={['dataMin', 'dataMax']}
                />
                <ZAxis 
                  dataKey="winRate" 
                  range={[50, 400]} 
                  name="승률"
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                />
                <Scatter 
                  name="결과" 
                  data={results.map(r => ({
                    ...r.performance,
                    score: r.score
                  }))}
                  fill="#8884d8"
                >
                  {results.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getScatterColor(
                        entry.score, 
                        Math.max(...results.map(r => r.score))
                      )} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* 수렴 차트 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">최적화 수렴</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={results.map((r, i) => ({
                iteration: i + 1,
                score: r.score,
                best: results.slice(0, i + 1).reduce((max, curr) => 
                  curr.score > max ? curr.score : max, -Infinity
                )
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="iteration" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8B5CF6" 
                  strokeWidth={1}
                  dot={false}
                  name="현재 점수"
                />
                <Line 
                  type="monotone" 
                  dataKey="best" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={false}
                  name="최고 점수"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}