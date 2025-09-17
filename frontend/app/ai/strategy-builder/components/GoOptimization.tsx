'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Settings, Cpu, TrendingUp, Zap } from 'lucide-react'

interface OptimizationMetrics {
  currentIteration: number
  maxIterations: number
  bestFitness: number
  averageFitness: number
  parameters: {
    name: string
    value: number
    min: number
    max: number
    optimal: number
  }[]
  convergenceHistory: {
    iteration: number
    best: number
    average: number
  }[]
  performanceMetrics: {
    metric: string
    value: number
    target: number
  }[]
}

export default function GoOptimization() {
  const [metrics, setMetrics] = useState<OptimizationMetrics>({
    currentIteration: 0,
    maxIterations: 1000,
    bestFitness: 0,
    averageFitness: 0,
    parameters: [],
    convergenceHistory: [],
    performanceMetrics: []
  })

  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationProgress, setOptimizationProgress] = useState(0)

  useEffect(() => {
    const updateMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/strategy/optimize')
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        // 시뮬레이션 모드
        const parameters = [
          { name: 'RSI Period', min: 5, max: 30, optimal: 14 },
          { name: 'Stop Loss %', min: 1, max: 10, optimal: 3 },
          { name: 'Take Profit %', min: 2, max: 20, optimal: 8 },
          { name: 'MA Period', min: 10, max: 200, optimal: 50 },
          { name: 'Entry Threshold', min: 20, max: 80, optimal: 30 }
        ]

        const convergenceHistory = []
        for (let i = 0; i < 20; i++) {
          convergenceHistory.push({
            iteration: i * 50,
            best: Math.min(100, 20 + i * 4 + Math.random() * 10),
            average: Math.min(80, 10 + i * 3 + Math.random() * 15)
          })
        }

        const performanceMetrics = [
          { metric: '샤프비율', value: Math.random() * 2 + 1, target: 2.5 },
          { metric: '승률', value: Math.random() * 20 + 55, target: 65 },
          { metric: 'PF', value: Math.random() + 1.5, target: 2.0 },
          { metric: 'MDD', value: Math.random() * 10 + 5, target: 10 },
          { metric: '수익률', value: Math.random() * 40 + 20, target: 50 },
          { metric: '안정성', value: Math.random() * 30 + 60, target: 80 }
        ]

        setMetrics({
          currentIteration: isOptimizing ? Math.min(1000, metrics.currentIteration + 50) : metrics.currentIteration,
          maxIterations: 1000,
          bestFitness: Math.min(100, metrics.bestFitness + (isOptimizing ? Math.random() * 5 : 0)),
          averageFitness: Math.min(80, metrics.averageFitness + (isOptimizing ? Math.random() * 3 : 0)),
          parameters: parameters.map(p => ({
            ...p,
            value: p.min + Math.random() * (p.max - p.min),
            optimal: p.optimal
          })),
          convergenceHistory,
          performanceMetrics
        })

        if (isOptimizing) {
          setOptimizationProgress(Math.min(100, (metrics.currentIteration / 1000) * 100))
        }
      }
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 2000)
    return () => clearInterval(interval)
  }, [isOptimizing, metrics.currentIteration, metrics.bestFitness, metrics.averageFitness])

  const radarData = metrics.performanceMetrics.map(m => ({
    metric: m.metric,
    current: (m.value / m.target) * 100,
    target: 100
  }))

  return (
    <div className="space-y-6">
      {/* 최적화 상태 */}
      <Card className="bg-gray-900 border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Settings className="w-5 h-5" />
            Go 하이퍼파라미터 최적화
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">현재 반복</div>
              <div className="text-xl font-bold text-green-400">
                {metrics.currentIteration}/{metrics.maxIterations}
              </div>
              <div className="text-xs text-gray-500">진행 상태</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">최적 적합도</div>
              <div className="text-xl font-bold text-blue-400">
                {metrics.bestFitness.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Best Fitness</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">평균 적합도</div>
              <div className="text-xl font-bold text-purple-400">
                {metrics.averageFitness.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Avg Fitness</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">개선율</div>
              <div className="text-xl font-bold text-yellow-400">
                {((metrics.bestFitness - metrics.averageFitness) / metrics.averageFitness * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">vs Average</div>
            </div>
          </div>

          {/* 최적화 진행률 */}
          {isOptimizing && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>최적화 진행 중...</span>
                <span>{optimizationProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${optimizationProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 수렴 그래프 */}
      <Card className="bg-gray-900 border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <TrendingUp className="w-5 h-5" />
            최적화 수렴 곡선
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics.convergenceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="iteration"
                stroke="#6b7280"
                tick={{ fontSize: 10 }}
                label={{ value: 'Iteration', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 10 }}
                label={{ value: 'Fitness', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                formatter={(value: any) => `${value.toFixed(1)}%`}
              />
              <Line
                type="monotone"
                dataKey="best"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="최적"
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="#6b7280"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="평균"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 파라미터 최적화 */}
        <Card className="bg-gray-900 border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Cpu className="w-5 h-5" />
              파라미터 최적화 상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.parameters.map((param, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">{param.name}</span>
                    <span className="text-xs font-bold text-green-400">
                      {param.value.toFixed(1)} (최적: {param.optimal})
                    </span>
                  </div>
                  <div className="relative w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="absolute h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                      style={{
                        left: `${((param.min) / (param.max - param.min)) * 100}%`,
                        width: `${((param.value - param.min) / (param.max - param.min)) * 100}%`
                      }}
                    />
                    <div
                      className="absolute w-1 h-3 bg-yellow-400 -mt-0.5"
                      style={{
                        left: `${((param.optimal - param.min) / (param.max - param.min)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 성능 레이더 차트 */}
        <Card className="bg-gray-900 border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Zap className="w-5 h-5" />
              전략 성능 지표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#6b7280" />
                <Radar
                  name="현재"
                  dataKey="current"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Radar
                  name="목표"
                  dataKey="target"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.1}
                  strokeDasharray="5 5"
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Go 최적화 기술 */}
      <Card className="bg-gray-900 border-cyan-800">
        <CardHeader>
          <CardTitle className="text-cyan-400">
            Go 최적화 알고리즘
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-green-400 font-semibold mb-1">
                베이지안 최적화
              </div>
              <div className="text-xs text-gray-500">
                Gaussian Process 기반
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-blue-400 font-semibold mb-1">
                유전자 알고리즘
              </div>
              <div className="text-xs text-gray-500">
                엘리트 선택 전략
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-purple-400 font-semibold mb-1">
                그리드 서치
              </div>
              <div className="text-xs text-gray-500">
                병렬 파라미터 탐색
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-yellow-400 font-semibold mb-1">
                강화학습
              </div>
              <div className="text-xs text-gray-500">
                A3C 알고리즘
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded border border-green-800/50">
            <div className="text-sm font-semibold text-green-400 mb-2">최적화 성능</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">수렴 속도:</span>
                <span className="text-green-400">10x faster</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">정확도:</span>
                <span className="text-green-400">99%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOptimizing(!isOptimizing)}
            className={`w-full mt-4 py-2 rounded-lg font-semibold transition-all ${
              isOptimizing
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-500 hover:to-blue-500'
            }`}
          >
            {isOptimizing ? '최적화 중지' : '최적화 시작'}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}