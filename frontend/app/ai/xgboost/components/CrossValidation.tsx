'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaCheckCircle, FaTimesCircle, FaPlay, FaRedo,
  FaChartBar, FaLayerGroup, FaInfoCircle, FaAward
} from 'react-icons/fa'
import { 
  BarChart, Bar, LineChart, Line, BoxPlot,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ReferenceLine, ComposedChart
} from 'recharts'
import CountUp from 'react-countup'

interface CrossValidationProps {
  symbol: string
}

interface FoldResult {
  fold: number
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  trainSize: number
  testSize: number
  status: 'pending' | 'training' | 'completed'
}

interface MetricDistribution {
  metric: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
  mean: number
  std: number
}

export default function CrossValidation({ symbol }: CrossValidationProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentFold, setCurrentFold] = useState(0)
  const [foldResults, setFoldResults] = useState<FoldResult[]>([])
  const [kValue, setKValue] = useState(5) // K-Fold의 K값
  const [showDetails, setShowDetails] = useState(true)
  
  const totalSamples = 10000 // 전체 샘플 수

  // 초기 Fold 설정
  useEffect(() => {
    const initialFolds: FoldResult[] = []
    const testSize = Math.floor(totalSamples / kValue)
    
    for (let i = 0; i < kValue; i++) {
      initialFolds.push({
        fold: i + 1,
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        trainSize: totalSamples - testSize,
        testSize: testSize,
        status: 'pending'
      })
    }
    
    setFoldResults(initialFolds)
  }, [kValue])

  // 교차 검증 실행
  useEffect(() => {
    if (isRunning && currentFold < kValue) {
      const timer = setTimeout(() => {
        // 현재 fold를 training 상태로 변경
        setFoldResults(prev => prev.map((fold, idx) => 
          idx === currentFold ? { ...fold, status: 'training' as const } : fold
        ))

        // 1초 후 결과 생성
        setTimeout(() => {
          const accuracy = 0.85 + Math.random() * 0.1
          const precision = accuracy + (Math.random() - 0.5) * 0.05
          const recall = accuracy + (Math.random() - 0.5) * 0.05
          const f1Score = 2 * (precision * recall) / (precision + recall)

          setFoldResults(prev => prev.map((fold, idx) => 
            idx === currentFold 
              ? { 
                  ...fold, 
                  accuracy, 
                  precision, 
                  recall, 
                  f1Score,
                  status: 'completed' as const 
                } 
              : fold
          ))
          
          setCurrentFold(prev => prev + 1)
        }, 1000)
      }, 500)

      return () => clearTimeout(timer)
    } else if (currentFold >= kValue) {
      setIsRunning(false)
    }
  }, [isRunning, currentFold, kValue])

  // 통계 계산
  const calculateStatistics = (): MetricDistribution[] => {
    const completedFolds = foldResults.filter(f => f.status === 'completed')
    if (completedFolds.length === 0) return []

    const metrics = ['accuracy', 'precision', 'recall', 'f1Score'] as const
    
    return metrics.map(metric => {
      const values = completedFolds.map(f => f[metric]).sort((a, b) => a - b)
      const n = values.length
      
      const mean = values.reduce((a, b) => a + b, 0) / n
      const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n)
      
      return {
        metric: metric === 'f1Score' ? 'F1 Score' : metric.charAt(0).toUpperCase() + metric.slice(1),
        min: values[0],
        q1: values[Math.floor(n * 0.25)],
        median: values[Math.floor(n * 0.5)],
        q3: values[Math.floor(n * 0.75)],
        max: values[n - 1],
        mean,
        std
      }
    })
  }

  const statistics = calculateStatistics()

  // CV 실행/리셋
  const toggleCV = () => {
    if (isRunning) {
      setIsRunning(false)
    } else {
      if (currentFold >= kValue) {
        resetCV()
      }
      setIsRunning(true)
    }
  }

  const resetCV = () => {
    setIsRunning(false)
    setCurrentFold(0)
    setFoldResults(prev => prev.map(fold => ({
      ...fold,
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      status: 'pending' as const
    })))
  }

  // 폴드 시각화 데이터
  const foldVisualization = () => {
    const segmentSize = 100 / kValue
    return Array.from({ length: kValue }, (_, i) => ({
      fold: i + 1,
      start: i * segmentSize,
      size: segmentSize,
      isTest: i === currentFold,
      status: foldResults[i]?.status || 'pending'
    }))
  }

  // 평균 성능
  const avgPerformance = () => {
    const completed = foldResults.filter(f => f.status === 'completed')
    if (completed.length === 0) return null
    
    return {
      accuracy: completed.reduce((a, b) => a + b.accuracy, 0) / completed.length,
      precision: completed.reduce((a, b) => a + b.precision, 0) / completed.length,
      recall: completed.reduce((a, b) => a + b.recall, 0) / completed.length,
      f1Score: completed.reduce((a, b) => a + b.f1Score, 0) / completed.length
    }
  }

  const avg = avgPerformance()

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaLayerGroup className="text-orange-400" />
          K-Fold 교차 검증
        </h2>
        <p className="text-gray-300">
          데이터를 K개의 폴드로 나누어 모델의 일반화 성능을 검증합니다
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">교차 검증 설정</h3>
          <div className="flex items-center gap-4">
            {/* K값 선택 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">K =</span>
              <select
                value={kValue}
                onChange={(e) => {
                  setKValue(Number(e.target.value))
                  resetCV()
                }}
                disabled={isRunning}
                className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value={3}>3-Fold</option>
                <option value={5}>5-Fold</option>
                <option value={10}>10-Fold</option>
              </select>
            </div>
            
            {/* 버튼들 */}
            <button
              onClick={toggleCV}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                isRunning
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-green-500/20 text-green-400 border border-green-500/50'
              } hover:opacity-80`}
            >
              <FaPlay />
              {isRunning ? '중지' : '시작'}
            </button>
            <button
              onClick={resetCV}
              disabled={isRunning}
              className="px-4 py-2 rounded-lg bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-600/50 flex items-center gap-2 disabled:opacity-50"
            >
              <FaRedo />
              리셋
            </button>
          </div>
        </div>

        {/* K-Fold 시각화 */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">데이터 분할 시각화</h4>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <svg width="100%" height="80" viewBox="0 0 1000 80">
              {foldVisualization().map((fold, index) => (
                <g key={fold.fold}>
                  <rect
                    x={fold.start * 10}
                    y="20"
                    width={fold.size * 10 - 2}
                    height="40"
                    fill={
                      fold.status === 'completed' ? '#10b981' :
                      fold.status === 'training' ? '#f59e0b' :
                      fold.isTest ? '#3b82f6' : '#374151'
                    }
                    stroke="#1f2937"
                    strokeWidth="2"
                    className={fold.status === 'training' ? 'animate-pulse' : ''}
                  />
                  <text
                    x={fold.start * 10 + fold.size * 5}
                    y="45"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {fold.fold}
                  </text>
                </g>
              ))}
              
              {/* 범례 */}
              <g transform="translate(20, 70)">
                <rect x="0" y="0" width="15" height="10" fill="#374151" />
                <text x="20" y="8" fill="#9ca3af" fontSize="12">대기</text>
                
                <rect x="100" y="0" width="15" height="10" fill="#f59e0b" />
                <text x="120" y="8" fill="#9ca3af" fontSize="12">학습 중</text>
                
                <rect x="200" y="0" width="15" height="10" fill="#10b981" />
                <text x="220" y="8" fill="#9ca3af" fontSize="12">완료</text>
                
                <rect x="300" y="0" width="15" height="10" fill="#3b82f6" />
                <text x="320" y="8" fill="#9ca3af" fontSize="12">테스트 폴드</text>
              </g>
            </svg>
          </div>
        </div>

        {/* 진행 상태 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              <CountUp end={currentFold} duration={0.5} /> / {kValue}
            </div>
            <div className="text-sm text-gray-400">완료된 폴드</div>
          </div>
          
          {avg && (
            <>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">
                  <CountUp 
                    end={avg.accuracy * 100} 
                    decimals={2} 
                    duration={0.5} 
                    suffix="%"
                  />
                </div>
                <div className="text-sm text-gray-400">평균 정확도</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  <CountUp 
                    end={avg.f1Score * 100} 
                    decimals={2} 
                    duration={0.5} 
                    suffix="%"
                  />
                </div>
                <div className="text-sm text-gray-400">평균 F1 Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  <CountUp 
                    end={statistics[0]?.std * 100 || 0} 
                    decimals={3} 
                    duration={0.5} 
                    suffix="%"
                  />
                </div>
                <div className="text-sm text-gray-400">표준편차</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 폴드별 결과 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 개별 폴드 결과 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">폴드별 성능</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {foldResults.map((fold, index) => (
                <motion.div
                  key={fold.fold}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-3 rounded-lg ${
                    fold.status === 'completed' ? 'bg-gray-700/30' :
                    fold.status === 'training' ? 'bg-yellow-900/20 animate-pulse' :
                    'bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {fold.status === 'completed' ? (
                        <FaCheckCircle className="text-green-400" />
                      ) : fold.status === 'training' ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400" />
                      ) : (
                        <FaTimesCircle className="text-gray-500" />
                      )}
                      <span className="text-white font-medium">Fold {fold.fold}</span>
                    </div>
                    
                    {fold.status === 'completed' && (
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-green-400 font-bold">
                            {(fold.accuracy * 100).toFixed(2)}%
                          </div>
                          <div className="text-gray-500 text-xs">정확도</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-400 font-bold">
                            {(fold.precision * 100).toFixed(2)}%
                          </div>
                          <div className="text-gray-500 text-xs">정밀도</div>
                        </div>
                        <div className="text-center">
                          <div className="text-purple-400 font-bold">
                            {(fold.recall * 100).toFixed(2)}%
                          </div>
                          <div className="text-gray-500 text-xs">재현율</div>
                        </div>
                        <div className="text-center">
                          <div className="text-yellow-400 font-bold">
                            {(fold.f1Score * 100).toFixed(2)}%
                          </div>
                          <div className="text-gray-500 text-xs">F1</div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 성능 분포 차트 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">성능 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={foldResults.filter(f => f.status === 'completed')}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="fold" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0.7, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => `${(value * 100).toFixed(2)}%`}
              />
              <Bar dataKey="accuracy" fill="#10b981" name="정확도" />
              <Bar dataKey="precision" fill="#3b82f6" name="정밀도" />
              <Bar dataKey="recall" fill="#8b5cf6" name="재현율" />
              <Bar dataKey="f1Score" fill="#f59e0b" name="F1 Score" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 통계 분석 */}
      {statistics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaChartBar className="text-blue-400" />
            통계 분석
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 font-medium py-2">지표</th>
                  <th className="text-center text-gray-400 font-medium py-2">최소값</th>
                  <th className="text-center text-gray-400 font-medium py-2">Q1</th>
                  <th className="text-center text-gray-400 font-medium py-2">중앙값</th>
                  <th className="text-center text-gray-400 font-medium py-2">Q3</th>
                  <th className="text-center text-gray-400 font-medium py-2">최대값</th>
                  <th className="text-center text-gray-400 font-medium py-2">평균</th>
                  <th className="text-center text-gray-400 font-medium py-2">표준편차</th>
                </tr>
              </thead>
              <tbody>
                {statistics.map((stat, index) => (
                  <tr key={stat.metric} className="border-b border-gray-700/50">
                    <td className="py-3 font-medium text-white">{stat.metric}</td>
                    <td className="text-center text-red-400">{(stat.min * 100).toFixed(2)}%</td>
                    <td className="text-center text-orange-400">{(stat.q1 * 100).toFixed(2)}%</td>
                    <td className="text-center text-yellow-400">{(stat.median * 100).toFixed(2)}%</td>
                    <td className="text-center text-green-400">{(stat.q3 * 100).toFixed(2)}%</td>
                    <td className="text-center text-blue-400">{(stat.max * 100).toFixed(2)}%</td>
                    <td className="text-center text-purple-400 font-bold">{(stat.mean * 100).toFixed(2)}%</td>
                    <td className="text-center text-gray-400">{(stat.std * 100).toFixed(3)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* CV 완료 메시지 */}
      {currentFold >= kValue && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-8 border border-green-500/50"
        >
          <h3 className="text-2xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
            <FaAward className="text-yellow-400" />
            교차 검증 완료!
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-3">검증 결과 요약</h4>
              <p className="text-gray-300 mb-2">
                {kValue}-Fold 교차 검증을 통해 모델의 일반화 성능을 검증했습니다.
              </p>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 평균 정확도: <span className="text-green-400 font-bold">{(avg?.accuracy * 100).toFixed(2)}%</span></li>
                <li>• 표준편차: <span className="text-yellow-400 font-bold">{(statistics[0]?.std * 100).toFixed(3)}%</span></li>
                <li>• 최고 성능: <span className="text-blue-400 font-bold">{(Math.max(...foldResults.map(f => f.accuracy)) * 100).toFixed(2)}%</span></li>
                <li>• 최저 성능: <span className="text-red-400 font-bold">{(Math.min(...foldResults.filter(f => f.accuracy > 0).map(f => f.accuracy)) * 100).toFixed(2)}%</span></li>
              </ul>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                <FaInfoCircle />
                신뢰도 평가
              </h4>
              <p className="text-gray-300 mb-2">
                낮은 표준편차는 모델이 다양한 데이터에서 일관된 성능을 보임을 의미합니다.
              </p>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400">모델 안정성</span>
                  <span className={`font-bold ${
                    statistics[0]?.std < 0.01 ? 'text-green-400' :
                    statistics[0]?.std < 0.02 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {statistics[0]?.std < 0.01 ? '매우 안정' :
                     statistics[0]?.std < 0.02 ? '안정' : '불안정'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      statistics[0]?.std < 0.01 ? 'bg-green-500' :
                      statistics[0]?.std < 0.02 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.max(10, 100 - statistics[0]?.std * 1000)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}