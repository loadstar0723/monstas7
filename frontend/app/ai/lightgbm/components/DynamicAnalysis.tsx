'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaLightbulb, FaChartLine, FaBrain, FaInfoCircle, FaBolt } from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

interface DynamicAnalysisProps {
  analysisType: 'overview' | 'leafwise' | 'memory' | 'parameter' | 'visualization'
}

interface AnalysisItem {
  id: string
  title: string
  insight: string
  data?: any[]
  chartType?: 'line' | 'bar' | 'area' | 'radar'
  recommendation?: string
  impact?: 'high' | 'medium' | 'low'
}

export default function DynamicAnalysis({ analysisType }: DynamicAnalysisProps) {
  const [analysisIndex, setAnalysisIndex] = useState(0)
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisItem | null>(null)

  const getAnalysisByType = (type: string): AnalysisItem[] => {
    switch (type) {
      case 'overview':
        return [
          {
            id: 'lgb-speed',
            title: 'LightGBM 속도 우위',
            insight: 'LightGBM은 히스토그램 기반 알고리즘으로 XGBoost보다 15배 빠른 학습 속도를 보입니다.',
            data: [
              { dataset: '1M rows', lightgbm: 12, xgboost: 180, rf: 420 },
              { dataset: '10M rows', lightgbm: 120, xgboost: 1800, rf: 4200 },
              { dataset: '100M rows', lightgbm: 1200, xgboost: 18000, rf: 'N/A' }
            ],
            chartType: 'bar',
            recommendation: 'GPU 없이도 대용량 데이터셋 처리 가능',
            impact: 'high'
          },
          {
            id: 'lgb-memory',
            title: '메모리 효율성 분석',
            insight: '동일 데이터셋에서 XGBoost 대비 8배 적은 메모리 사용',
            data: [
              { feature: '메모리 사용', value: 92, max: 100 },
              { feature: '학습 속도', value: 95, max: 100 },
              { feature: '예측 정확도', value: 91, max: 100 },
              { feature: '확장성', value: 98, max: 100 },
              { feature: '병렬 처리', value: 90, max: 100 }
            ],
            chartType: 'radar',
            recommendation: '단일 머신에서 10억 행 이상 처리 가능',
            impact: 'high'
          }
        ]

      case 'leafwise':
        return [
          {
            id: 'leaf-efficiency',
            title: 'Leaf-wise 성장 효율성',
            insight: 'Leaf-wise 방식은 Level-wise 대비 70% 적은 노드로 동일 성능 달성',
            data: [
              { nodes: 10, leafwise: 0.82, levelwise: 0.75 },
              { nodes: 20, leafwise: 0.88, levelwise: 0.82 },
              { nodes: 30, leafwise: 0.91, levelwise: 0.85 },
              { nodes: 50, leafwise: 0.93, levelwise: 0.88 },
              { nodes: 100, leafwise: 0.94, levelwise: 0.91 }
            ],
            chartType: 'line',
            recommendation: 'num_leaves를 31로 시작하여 조정',
            impact: 'high'
          },
          {
            id: 'depth-control',
            title: '깊이 제어 전략',
            insight: 'max_depth=-1로 설정하고 num_leaves로 복잡도 제어가 효과적',
            data: [
              { depth: 'Unlimited', accuracy: 92, overfitting: 15 },
              { depth: 'Limited(7)', accuracy: 91, overfitting: 8 },
              { depth: 'Limited(5)', accuracy: 89, overfitting: 5 },
              { depth: 'Limited(3)', accuracy: 85, overfitting: 2 }
            ],
            chartType: 'bar',
            recommendation: 'num_leaves < 2^max_depth 규칙 준수',
            impact: 'medium'
          }
        ]

      case 'memory':
        return [
          {
            id: 'histogram-optimization',
            title: '히스토그램 최적화 효과',
            insight: '255개 빈으로 연속 변수를 이산화하여 메모리 90% 절감',
            data: [
              { method: 'Original', memory: 1000, speed: 1 },
              { method: 'Histogram(255)', memory: 100, speed: 15 },
              { method: 'Histogram(63)', memory: 50, speed: 18 },
              { method: 'Histogram(15)', memory: 25, speed: 20 }
            ],
            chartType: 'bar',
            recommendation: 'max_bin=255가 정확도와 속도의 최적 균형',
            impact: 'high'
          },
          {
            id: 'feature-bundling',
            title: 'EFB 번들링 효과',
            insight: '상호 배타적 특성 번들링으로 특성 수 85% 감소',
            data: Array.from({ length: 10 }, (_, i) => ({
              features: (i + 1) * 100,
              withoutEFB: (i + 1) * 100,
              withEFB: (i + 1) * 15
            })),
            chartType: 'area',
            recommendation: 'enable_bundle=true 유지 (기본값)',
            impact: 'medium'
          }
        ]

      case 'parameter':
        return [
          {
            id: 'learning-curve',
            title: '학습률 최적화',
            insight: '학습률 0.05-0.1 범위에서 최적 성능, n_estimators와 반비례',
            data: [
              { lr: 0.01, iterations: 1000, score: 0.88 },
              { lr: 0.05, iterations: 200, score: 0.91 },
              { lr: 0.1, iterations: 100, score: 0.92 },
              { lr: 0.3, iterations: 33, score: 0.89 }
            ],
            chartType: 'line',
            recommendation: 'learning_rate=0.05, n_estimators=200 추천',
            impact: 'high'
          },
          {
            id: 'regularization',
            title: '규제 파라미터 영향',
            insight: 'lambda_l1과 feature_fraction이 과적합 방지에 가장 효과적',
            data: [
              { param: 'lambda_l1', effect: 35, optimal: 0.1 },
              { param: 'lambda_l2', effect: 25, optimal: 0.1 },
              { param: 'feature_fraction', effect: 30, optimal: 0.8 },
              { param: 'bagging_fraction', effect: 10, optimal: 0.8 }
            ],
            chartType: 'bar',
            recommendation: '암호화폐 데이터는 노이즈가 많아 규제 필수',
            impact: 'medium'
          }
        ]

      case 'visualization':
        return [
          {
            id: 'feature-importance',
            title: '특성 중요도 패턴',
            insight: 'RSI, Volume, MACD 상위 3개 특성이 전체 예측력의 65% 차지',
            data: [
              { feature: 'RSI', importance: 28, cumulative: 28 },
              { feature: 'Volume', importance: 22, cumulative: 50 },
              { feature: 'MACD', importance: 15, cumulative: 65 },
              { feature: 'Price', importance: 12, cumulative: 77 },
              { feature: 'Others', importance: 23, cumulative: 100 }
            ],
            chartType: 'bar',
            recommendation: '상위 특성 중심으로 특성 엔지니어링 집중',
            impact: 'high'
          },
          {
            id: 'prediction-confidence',
            title: '예측 신뢰도 분포',
            insight: '높은 신뢰도 예측(>80%)이 전체의 70%로 안정적',
            data: [
              { confidence: '0-20%', count: 5 },
              { confidence: '20-40%', count: 8 },
              { confidence: '40-60%', count: 17 },
              { confidence: '60-80%', count: 35 },
              { confidence: '80-100%', count: 35 }
            ],
            chartType: 'bar',
            recommendation: '신뢰도 60% 이상에서만 실거래 진행',
            impact: 'medium'
          }
        ]

      default:
        return []
    }
  }

  const analyses = useMemo(() => getAnalysisByType(analysisType), [analysisType])

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalysisIndex((prev) => (prev + 1) % analyses.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [analyses.length])

  useEffect(() => {
    if (analyses.length > 0) {
      setCurrentAnalysis(analyses[analysisIndex])
    }
  }, [analysisIndex, analyses])

  const renderChart = (analysis: AnalysisItem) => {
    if (!analysis.data) return null

    const chartProps = {
      data: analysis.data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    }

    switch (analysis.chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={Object.keys(analysis.data[0])[0]} stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px' 
                }} 
              />
              {Object.keys(analysis.data[0]).slice(1).map((key, index) => (
                <Line 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stroke={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} 
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={Object.keys(analysis.data[0])[0]} stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px' 
                }} 
              />
              {Object.keys(analysis.data[0]).slice(1).map((key, index) => (
                <Bar 
                  key={key}
                  dataKey={key} 
                  fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={Object.keys(analysis.data[0])[0]} stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px' 
                }} 
              />
              {Object.keys(analysis.data[0]).slice(1).map((key, index) => (
                <Area 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stroke={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} 
                  fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} 
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={analysis.data}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey={Object.keys(analysis.data[0])[0]} stroke="#9ca3af" />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Radar 
                dataKey={Object.keys(analysis.data[0])[1]} 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6} 
              />
            </RadarChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  if (!currentAnalysis) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-xl p-6 border border-gray-700/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <FaBrain className="text-2xl text-blue-400" />
        <h3 className="text-xl font-bold text-white">AI 실시간 분석</h3>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentAnalysis.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-blue-400 mb-2">
              {currentAnalysis.title}
            </h4>
            <p className="text-gray-300 mb-4">{currentAnalysis.insight}</p>
            
            {currentAnalysis.data && renderChart(currentAnalysis)}
          </div>

          {currentAnalysis.recommendation && (
            <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <div className="flex items-start gap-2">
                <FaLightbulb className="text-yellow-400 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-blue-400 mb-1">추천 사항</p>
                  <p className="text-sm text-gray-300">{currentAnalysis.recommendation}</p>
                </div>
              </div>
            </div>
          )}

          {currentAnalysis.impact && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-400">영향도:</span>
              <span className={`text-sm font-semibold px-2 py-1 rounded ${
                currentAnalysis.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                currentAnalysis.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {currentAnalysis.impact === 'high' ? '높음' :
                 currentAnalysis.impact === 'medium' ? '중간' : '낮음'}
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 진행 표시기 */}
      <div className="mt-4 flex gap-1">
        {analyses.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index === analysisIndex ? 'bg-blue-500' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}