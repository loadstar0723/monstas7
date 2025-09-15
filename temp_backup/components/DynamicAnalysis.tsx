'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaLightbulb, FaChartLine, FaBrain, FaInfoCircle, FaRocket } from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

interface DynamicAnalysisProps {
  analysisType: 'overview' | 'boosting' | 'interaction' | 'tuning' | 'validation' | 'comparison' | 'shap'
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
            id: 'xgb-power',
            title: 'XGBoost의 강력한 성능',
            insight: 'XGBoost는 현재 92.5%의 예측 정확도를 보이며, 이는 업계 최고 수준입니다.',
            data: [
              { metric: '정확도', value: 92.5 },
              { metric: '속도', value: 85 },
              { metric: '효율성', value: 88 },
              { metric: '확장성', value: 90 }
            ],
            chartType: 'radar',
            recommendation: 'GPU 가속을 활용하면 학습 속도를 3배 향상시킬 수 있습니다.',
            impact: 'high'
          },
          {
            id: 'gradient-boosting',
            title: '그래디언트 부스팅의 원리',
            insight: '각 트리가 이전 트리의 오류를 보정하며 점진적으로 성능을 개선합니다.',
            data: [
              { tree: 1, error: 0.35, cumulative: 0.65 },
              { tree: 5, error: 0.20, cumulative: 0.80 },
              { tree: 10, error: 0.10, cumulative: 0.90 },
              { tree: 15, error: 0.075, cumulative: 0.925 }
            ],
            chartType: 'line',
            recommendation: '트리 개수를 100-200개로 설정하면 최적의 균형을 얻을 수 있습니다.',
            impact: 'medium'
          }
        ]

      case 'boosting':
        return [
          {
            id: 'boosting-efficiency',
            title: '부스팅 효율성 분석',
            insight: '초기 10개 트리에서 대부분의 성능 향상이 발생하며, 이후 개선폭이 감소합니다.',
            data: [
              { stage: '1-10 Trees', improvement: 45, efficiency: 95 },
              { stage: '11-30 Trees', improvement: 25, efficiency: 70 },
              { stage: '31-50 Trees', improvement: 15, efficiency: 40 },
              { stage: '51-100 Trees', improvement: 10, efficiency: 20 }
            ],
            chartType: 'bar',
            recommendation: 'Early Stopping을 50 라운드로 설정하여 과적합을 방지하세요.',
            impact: 'high'
          },
          {
            id: 'residual-pattern',
            title: '잔차 패턴 분석',
            insight: '부스팅이 진행될수록 잔차가 감소하며 노이즈에 가까워집니다.',
            data: Array.from({ length: 20 }, (_, i) => ({
              iteration: i + 1,
              residual: Math.exp(-i * 0.2) * 0.5,
              noise: 0.05
            })),
            chartType: 'area',
            recommendation: '잔차가 노이즈 수준에 도달하면 학습을 중단하는 것이 좋습니다.',
            impact: 'medium'
          }
        ]

      case 'interaction':
        return [
          {
            id: 'feature-synergy',
            title: '특성 시너지 효과',
            insight: 'RSI와 Volume의 상호작용이 예측력을 15% 향상시킵니다.',
            data: [
              { feature: 'RSI×Volume', synergy: 15, alone: 8 },
              { feature: 'MACD×Price', synergy: 12, alone: 7 },
              { feature: 'MA×Volatility', synergy: 10, alone: 6 },
              { feature: 'BB×ATR', synergy: 8, alone: 5 }
            ],
            chartType: 'bar',
            recommendation: '상호작용이 강한 특성 쌍을 위한 교차 특성을 생성하세요.',
            impact: 'high'
          },
          {
            id: 'nonlinear-patterns',
            title: '비선형 패턴 감지',
            insight: 'XGBoost가 특성 간 복잡한 비선형 관계를 효과적으로 포착합니다.',
            data: Array.from({ length: 50 }, (_, i) => ({
              x: i,
              linear: i * 0.5,
              nonlinear: Math.sin(i * 0.2) * 20 + i * 0.3
            })),
            chartType: 'line',
            recommendation: '다항식 특성보다 트리 깊이를 늘려 비선형성을 포착하세요.',
            impact: 'medium'
          }
        ]

      case 'tuning':
        return [
          {
            id: 'param-sensitivity',
            title: '파라미터 민감도 분석',
            insight: 'learning_rate와 max_depth가 성능에 가장 큰 영향을 미칩니다.',
            data: [
              { param: 'learning_rate', impact: 35, optimal: 0.1 },
              { param: 'max_depth', impact: 30, optimal: 6 },
              { param: 'subsample', impact: 20, optimal: 0.8 },
              { param: 'colsample', impact: 15, optimal: 0.8 }
            ],
            chartType: 'bar',
            recommendation: '학습률을 0.1로 시작하여 점진적으로 조정하세요.',
            impact: 'high'
          },
          {
            id: 'optimization-path',
            title: '최적화 경로',
            insight: '베이지안 최적화가 Grid Search보다 5배 빠르게 최적값을 찾습니다.',
            data: [
              { method: 'Random', iterations: 100, best: 0.85 },
              { method: 'Grid', iterations: 50, best: 0.88 },
              { method: 'Bayesian', iterations: 20, best: 0.92 }
            ],
            chartType: 'bar',
            recommendation: 'Optuna나 Hyperopt를 사용한 베이지안 최적화를 추천합니다.',
            impact: 'high'
          }
        ]

      case 'validation':
        return [
          {
            id: 'cv-stability',
            title: '교차 검증 안정성',
            insight: '5-Fold CV에서 표준편차 0.012로 매우 안정적인 성능을 보입니다.',
            data: [
              { fold: 1, accuracy: 0.923, mean: 0.925 },
              { fold: 2, accuracy: 0.928, mean: 0.925 },
              { fold: 3, accuracy: 0.921, mean: 0.925 },
              { fold: 4, accuracy: 0.927, mean: 0.925 },
              { fold: 5, accuracy: 0.926, mean: 0.925 }
            ],
            chartType: 'line',
            recommendation: '모델이 안정적이므로 5-Fold로 충분합니다.',
            impact: 'medium'
          },
          {
            id: 'generalization-gap',
            title: '일반화 성능',
            insight: '훈련-검증 성능 차이가 2%로 우수한 일반화 능력을 보입니다.',
            data: [
              { set: 'Train', performance: 94.5 },
              { set: 'Validation', performance: 92.5 },
              { set: 'Test', performance: 92.0 }
            ],
            chartType: 'bar',
            recommendation: '현재 규제 수준이 적절하므로 유지하세요.',
            impact: 'low'
          }
        ]

      case 'comparison':
        return [
          {
            id: 'model-tradeoff',
            title: '모델 트레이드오프',
            insight: 'XGBoost가 정확도-속도 균형에서 최적의 위치를 차지합니다.',
            data: [
              { model: 'XGBoost', accuracy: 92.5, speed: 85, efficiency: 88 },
              { model: 'LightGBM', accuracy: 91.8, speed: 95, efficiency: 92 },
              { model: 'RandomForest', accuracy: 88.3, speed: 70, efficiency: 65 },
              { model: 'CatBoost', accuracy: 90.5, speed: 75, efficiency: 80 }
            ],
            chartType: 'radar',
            recommendation: '대용량 데이터는 LightGBM, 최고 정확도는 XGBoost를 선택하세요.',
            impact: 'high'
          },
          {
            id: 'use-case-fit',
            title: '사용 사례별 적합도',
            insight: '실시간 트레이딩에는 XGBoost가 최적의 선택입니다.',
            data: [
              { useCase: '실시간 예측', xgboost: 95, others: 80 },
              { useCase: '배치 처리', xgboost: 90, others: 85 },
              { useCase: '해석 가능성', xgboost: 85, others: 88 },
              { useCase: '메모리 효율', xgboost: 80, others: 90 }
            ],
            chartType: 'bar',
            recommendation: '실시간 트레이딩 시스템에 XGBoost를 우선 적용하세요.',
            impact: 'high'
          }
        ]

      case 'shap':
        return [
          {
            id: 'feature-impact',
            title: '특성 영향력 분석',
            insight: 'RSI가 예측에 가장 큰 영향을 미치며, 평균 SHAP 값이 0.35입니다.',
            data: [
              { feature: 'RSI', shap: 0.35, frequency: 95 },
              { feature: 'Volume', shap: 0.28, frequency: 90 },
              { feature: 'MACD', shap: 0.22, frequency: 85 },
              { feature: 'Price', shap: 0.15, frequency: 80 }
            ],
            chartType: 'bar',
            recommendation: 'RSI 계산 주기를 최적화하여 신호 품질을 개선하세요.',
            impact: 'high'
          },
          {
            id: 'decision-path',
            title: '의사결정 경로',
            insight: '모델이 RSI > 70일 때 강한 매도 신호를 생성합니다.',
            data: [
              { condition: 'RSI<30', decision: -0.8, confidence: 0.9 },
              { condition: '30≤RSI<50', decision: -0.2, confidence: 0.7 },
              { condition: '50≤RSI<70', decision: 0.2, confidence: 0.7 },
              { condition: 'RSI≥70', decision: 0.8, confidence: 0.9 }
            ],
            chartType: 'line',
            recommendation: '극단적 RSI 값에서 포지션 크기를 조정하세요.',
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
                  stroke={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index]} 
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
                  fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index]} 
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
                  stroke={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index]} 
                  fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index]} 
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
                stroke="#10b981" 
                fill="#10b981" 
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
        <FaBrain className="text-2xl text-green-400" />
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
            <h4 className="text-lg font-semibold text-green-400 mb-2">
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
              index === analysisIndex ? 'bg-green-500' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}