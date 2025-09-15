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
  analysisType: 'overview' | 'architecture' | 'training' | 'attention' | 'prediction'
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
            id: 'nn-evolution',
            title: '신경망 진화 단계',
            insight: '단순 퍼셉트론에서 Transformer까지, 각 세대별 혁신이 트레이딩 성능을 획기적으로 향상시켰습니다.',
            data: [
              { generation: 'Perceptron', accuracy: 60, complexity: 10 },
              { generation: 'MLP', accuracy: 75, complexity: 50 },
              { generation: 'CNN', accuracy: 85, complexity: 200 },
              { generation: 'RNN/LSTM', accuracy: 90, complexity: 500 },
              { generation: 'Transformer', accuracy: 95, complexity: 1000 }
            ],
            chartType: 'line',
            recommendation: 'Transformer 기반 모델이 현재 최고 성능 제공',
            impact: 'high'
          },
          {
            id: 'market-adaptability',
            title: '시장 적응성 분석',
            insight: '신경망은 다양한 시장 조건에서 일관된 성능을 보입니다.',
            data: [
              { condition: '상승장', performance: 92, traditional: 85 },
              { condition: '하락장', performance: 89, traditional: 70 },
              { condition: '횡보장', performance: 85, traditional: 60 },
              { condition: '고변동성', performance: 87, traditional: 65 },
              { condition: '저변동성', performance: 90, traditional: 80 }
            ],
            chartType: 'bar',
            recommendation: '모든 시장 조건에서 전통 모델 대비 우수한 성능',
            impact: 'high'
          }
        ]

      case 'architecture':
        return [
          {
            id: 'layer-analysis',
            title: '레이어별 정보 처리',
            insight: '깊은 레이어일수록 더 추상적이고 복잡한 패턴을 학습합니다.',
            data: [
              { layer: 'Input', abstraction: 10, features: 100 },
              { layer: 'Hidden1', abstraction: 30, features: 80 },
              { layer: 'Hidden2', abstraction: 50, features: 60 },
              { layer: 'Hidden3', abstraction: 70, features: 40 },
              { layer: 'Output', abstraction: 90, features: 20 }
            ],
            chartType: 'area',
            recommendation: '3-5개 은닉층이 트레이딩 데이터에 최적',
            impact: 'medium'
          },
          {
            id: 'activation-impact',
            title: '활성화 함수 영향',
            insight: 'ReLU 계열 활성화 함수가 그래디언트 소실 문제를 해결하여 학습 속도 개선',
            data: [
              { function: 'Sigmoid', speed: 60, stability: 90 },
              { function: 'Tanh', speed: 70, stability: 85 },
              { function: 'ReLU', speed: 90, stability: 80 },
              { function: 'LeakyReLU', speed: 92, stability: 85 },
              { function: 'GELU', speed: 95, stability: 88 }
            ],
            chartType: 'radar',
            recommendation: 'GELU 또는 LeakyReLU 사용 권장',
            impact: 'medium'
          }
        ]

      case 'training':
        return [
          {
            id: 'convergence-speed',
            title: '수렴 속도 최적화',
            insight: '적응적 학습률과 모멘텀이 수렴 속도를 3배 향상시킵니다.',
            data: [
              { epoch: 10, standard: 0.8, optimized: 0.5 },
              { epoch: 20, standard: 0.6, optimized: 0.3 },
              { epoch: 30, standard: 0.5, optimized: 0.2 },
              { epoch: 40, standard: 0.4, optimized: 0.15 },
              { epoch: 50, standard: 0.35, optimized: 0.1 }
            ],
            chartType: 'line',
            recommendation: 'Adam optimizer with learning rate scheduling',
            impact: 'high'
          },
          {
            id: 'regularization-effect',
            title: '규제 기법 효과',
            insight: 'Dropout과 L2 규제가 과적합을 효과적으로 방지합니다.',
            data: [
              { technique: 'No Reg', trainAcc: 98, valAcc: 82 },
              { technique: 'L2', trainAcc: 95, valAcc: 89 },
              { technique: 'Dropout', trainAcc: 93, valAcc: 91 },
              { technique: 'L2+Dropout', trainAcc: 92, valAcc: 90 },
              { technique: 'BatchNorm', trainAcc: 94, valAcc: 92 }
            ],
            chartType: 'bar',
            recommendation: 'BatchNorm + Dropout 0.3 조합 추천',
            impact: 'high'
          }
        ]

      case 'attention':
        return [
          {
            id: 'attention-patterns',
            title: 'Attention 패턴 분석',
            insight: '가격 급등/급락 시점에 attention이 집중되어 중요 신호 포착',
            data: [
              { token: 'Price', self: 0.8, context: 0.6 },
              { token: 'Volume', self: 0.7, context: 0.8 },
              { token: 'News', self: 0.5, context: 0.9 },
              { token: 'Technical', self: 0.9, context: 0.7 },
              { token: 'Sentiment', self: 0.6, context: 0.85 }
            ],
            chartType: 'radar',
            recommendation: '뉴스와 거래량의 상호작용에 주목',
            impact: 'high'
          },
          {
            id: 'multihead-contribution',
            title: 'Multi-Head 기여도',
            insight: '8개 attention head가 각각 다른 패턴을 전문적으로 학습',
            data: [
              { head: 'Head1', local: 80, global: 20, contribution: 15 },
              { head: 'Head2', local: 60, global: 40, contribution: 12 },
              { head: 'Head3', local: 40, global: 60, contribution: 18 },
              { head: 'Head4', local: 20, global: 80, contribution: 20 },
              { head: 'Head5-8', local: 50, global: 50, contribution: 35 }
            ],
            chartType: 'bar',
            recommendation: '최소 8개 head 사용으로 다양한 패턴 포착',
            impact: 'medium'
          }
        ]

      case 'prediction':
        return [
          {
            id: 'confidence-calibration',
            title: '신뢰도 보정 분석',
            insight: '모델의 예측 신뢰도가 실제 정확도와 높은 상관관계를 보입니다.',
            data: [
              { confidence: '0-20%', predicted: 15, actual: 18 },
              { confidence: '20-40%', predicted: 30, actual: 32 },
              { confidence: '40-60%', predicted: 50, actual: 48 },
              { confidence: '60-80%', predicted: 70, actual: 72 },
              { confidence: '80-100%', predicted: 90, actual: 88 }
            ],
            chartType: 'line',
            recommendation: '신뢰도 70% 이상에서 실거래 진행',
            impact: 'high'
          },
          {
            id: 'timeframe-accuracy',
            title: '시간대별 예측 정확도',
            insight: '단기 예측일수록 높은 정확도, 장기로 갈수록 불확실성 증가',
            data: [
              { timeframe: '1H', accuracy: 92, samples: 10000 },
              { timeframe: '4H', accuracy: 87, samples: 8000 },
              { timeframe: '1D', accuracy: 82, samples: 5000 },
              { timeframe: '1W', accuracy: 75, samples: 2000 },
              { timeframe: '1M', accuracy: 68, samples: 1000 }
            ],
            chartType: 'area',
            recommendation: '4시간 이내 예측에 집중하여 높은 수익률 달성',
            impact: 'high'
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
        <FaBrain className="text-2xl text-indigo-400" />
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
            <h4 className="text-lg font-semibold text-indigo-400 mb-2">
              {currentAnalysis.title}
            </h4>
            <p className="text-gray-300 mb-4">{currentAnalysis.insight}</p>
            
            {currentAnalysis.data && renderChart(currentAnalysis)}
          </div>

          {currentAnalysis.recommendation && (
            <div className="mt-4 p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/30">
              <div className="flex items-start gap-2">
                <FaLightbulb className="text-yellow-400 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-indigo-400 mb-1">추천 사항</p>
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
              index === analysisIndex ? 'bg-indigo-500' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}