'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaLightbulb, FaChartLine, FaBrain, FaInfoCircle, FaTree } from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

interface DynamicAnalysisProps {
  analysisType: 'overview' | 'tree' | 'shap' | 'importance' | 'voting' | 'oob' | 'pdp'
}

interface AnalysisItem {
  id: string
  title: string
  insight: string
  data?: any[]
  chartType?: 'line' | 'area' | 'bar' | 'radar'
  icon: React.ReactNode
  gradient: string
}

export default function DynamicAnalysis({ analysisType }: DynamicAnalysisProps) {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisItem | null>(null)
  const [analysisIndex, setAnalysisIndex] = useState(0)

  // 분석 타입별 동적 콘텐츠
  const getAnalysisByType = (type: string): AnalysisItem[] => {
    switch (type) {
      case 'overview':
        return [
          {
            id: 'ensemble_power',
            title: '앙상블 학습의 힘',
            insight: 'Random Forest는 여러 트리의 투표를 통해 단일 모델보다 15-20% 더 정확한 예측을 제공합니다. 현재 시장에서 92% 정확도를 달성했습니다.',
            data: Array.from({ length: 10 }, (_, i) => ({
              trees: (i + 1) * 10,
              단일모델: 65 + Math.random() * 5,
              RandomForest: 75 + i * 1.5 + Math.random() * 3
            })),
            chartType: 'line',
            icon: <FaTree />,
            gradient: 'from-green-500/20 to-emerald-500/20'
          },
          {
            id: 'market_condition',
            title: '시장 상황별 성능',
            insight: '변동성이 높은 시장에서 Random Forest의 예측 성능이 더욱 향상됩니다. 각 트리가 다른 패턴을 학습하기 때문입니다.',
            data: [
              { condition: '상승장', 정확도: 88, 수익률: 12 },
              { condition: '하락장', 정확도: 85, 수익률: 15 },
              { condition: '횡보장', 정확도: 82, 수익률: 8 },
              { condition: '고변동성', 정확도: 92, 수익률: 18 }
            ],
            chartType: 'bar',
            icon: <FaChartLine />,
            gradient: 'from-blue-500/20 to-cyan-500/20'
          }
        ]

      case 'tree':
        return [
          {
            id: 'tree_depth',
            title: '최적 트리 깊이 분석',
            insight: '현재 시장에서는 깊이 12-15의 트리가 최적 성능을 보입니다. 너무 깊으면 과적합, 너무 얕으면 과소적합이 발생합니다.',
            data: Array.from({ length: 20 }, (_, i) => ({
              depth: i + 5,
              학습오차: 0.4 - i * 0.015 + Math.random() * 0.01,
              검증오차: 0.35 - i * 0.008 + (i > 12 ? (i - 12) * 0.012 : 0)
            })),
            chartType: 'area',
            icon: <FaTree />,
            gradient: 'from-purple-500/20 to-pink-500/20'
          },
          {
            id: 'split_criteria',
            title: '분할 기준 효과성',
            insight: 'Gini 불순도가 암호화폐 시장에서 더 좋은 성능을 보입니다. 특히 급격한 가격 변동을 예측할 때 유용합니다.',
            data: [
              { feature: 'RSI', gini: 0.85, entropy: 0.78, gain: 0.82 },
              { feature: 'Volume', gini: 0.82, entropy: 0.80, gain: 0.81 },
              { feature: 'MACD', gini: 0.78, entropy: 0.75, gain: 0.76 },
              { feature: 'Whale', gini: 0.88, entropy: 0.83, gain: 0.85 },
              { feature: 'Fear', gini: 0.75, entropy: 0.72, gain: 0.73 }
            ],
            chartType: 'radar',
            icon: <FaBrain />,
            gradient: 'from-indigo-500/20 to-purple-500/20'
          }
        ]

      case 'shap':
        return [
          {
            id: 'feature_interaction',
            title: '특성 상호작용 패턴',
            insight: 'RSI와 거래량이 함께 극단값일 때 가장 강한 예측 신호를 생성합니다. SHAP 값이 0.3 이상으로 매우 강한 영향력을 보입니다.',
            data: [
              { interaction: 'RSI+Volume', impact: 0.32, frequency: 156 },
              { interaction: 'MACD+Whale', impact: 0.28, frequency: 132 },
              { interaction: 'Fear+Volume', impact: 0.25, frequency: 118 },
              { interaction: 'RSI+MACD', impact: 0.22, frequency: 98 }
            ],
            chartType: 'bar',
            icon: <FaBrain />,
            gradient: 'from-blue-500/20 to-cyan-500/20'
          },
          {
            id: 'prediction_confidence',
            title: '예측 신뢰도 분포',
            insight: 'SHAP 분석 결과, 현재 모델은 78%의 예측에서 높은 신뢰도(>0.7)를 보입니다. 이는 안정적인 트레이딩 신호를 의미합니다.',
            data: Array.from({ length: 10 }, (_, i) => ({
              confidence: (i + 1) * 10,
              count: Math.exp(-(Math.pow(i - 7, 2) / 10)) * 100 + Math.random() * 10
            })),
            chartType: 'area',
            icon: <FaLightbulb />,
            gradient: 'from-purple-500/20 to-pink-500/20'
          }
        ]

      case 'importance':
        return [
          {
            id: 'dynamic_importance',
            title: '실시간 중요도 변화',
            insight: '시장 변동성이 높아지면 기술적 지표(RSI, MACD)의 중요도가 증가합니다. 현재 RSI가 15.2%로 가장 중요한 특성입니다.',
            data: Array.from({ length: 12 }, (_, i) => ({
              hour: `${i * 2}:00`,
              RSI: 12 + Math.sin(i / 2) * 3 + Math.random() * 1,
              Volume: 10 + Math.cos(i / 3) * 2 + Math.random() * 1,
              Whale: 8 + Math.sin(i / 4) * 2 + Math.random() * 1
            })),
            chartType: 'line',
            icon: <FaChartLine />,
            gradient: 'from-yellow-500/20 to-orange-500/20'
          },
          {
            id: 'category_dominance',
            title: '카테고리별 지배력',
            insight: '기술적 지표가 전체 예측력의 42%를 차지하며, 온체인 데이터가 28%로 두 번째로 중요합니다.',
            data: [
              { name: '기술적', value: 42, fill: '#3b82f6' },
              { name: '온체인', value: 28, fill: '#8b5cf6' },
              { name: '시장', value: 18, fill: '#10b981' },
              { name: '센티먼트', value: 12, fill: '#f59e0b' }
            ],
            chartType: 'radar',
            icon: <FaTree />,
            gradient: 'from-green-500/20 to-emerald-500/20'
          }
        ]

      case 'voting':
        return [
          {
            id: 'consensus_strength',
            title: '합의 강도 분석',
            insight: '70% 이상의 트리가 동일한 방향으로 투표할 때 예측 성공률이 89%로 상승합니다. 현재 82%의 트리가 상승에 투표했습니다.',
            data: Array.from({ length: 10 }, (_, i) => ({
              consensus: 50 + i * 5,
              성공률: 60 + i * 3 + Math.random() * 2,
              신뢰도: 65 + i * 2.5 + Math.random() * 1.5
            })),
            chartType: 'area',
            icon: <FaTree />,
            gradient: 'from-red-500/20 to-pink-500/20'
          },
          {
            id: 'vote_distribution',
            title: '투표 분포 패턴',
            insight: '대부분의 트리가 60-80% 신뢰도로 투표합니다. 극단적인 투표(<40% 또는 >90%)는 전체의 15%에 불과합니다.',
            data: [
              { range: '0-20%', count: 5, fill: '#ef4444' },
              { range: '20-40%', count: 12, fill: '#f59e0b' },
              { range: '40-60%', count: 28, fill: '#3b82f6' },
              { range: '60-80%', count: 42, fill: '#10b981' },
              { range: '80-100%', count: 13, fill: '#8b5cf6' }
            ],
            chartType: 'bar',
            icon: <FaBrain />,
            gradient: 'from-purple-500/20 to-pink-500/20'
          }
        ]

      case 'oob':
        return [
          {
            id: 'oob_convergence',
            title: 'OOB 오차 수렴 패턴',
            insight: '60개 트리 이후 OOB 오차가 안정화됩니다. 현재 100개 트리로 5.2% 오차를 달성했으며, 추가 트리는 효과가 미미합니다.',
            data: Array.from({ length: 20 }, (_, i) => ({
              trees: (i + 1) * 5,
              oobError: 0.35 * Math.exp(-i / 5) + 0.052 + Math.random() * 0.005,
              trainError: 0.35 * Math.exp(-i / 3) + 0.025 + Math.random() * 0.003
            })),
            chartType: 'line',
            icon: <FaChartLine />,
            gradient: 'from-indigo-500/20 to-purple-500/20'
          },
          {
            id: 'validation_metrics',
            title: '검증 메트릭 비교',
            insight: 'OOB 예측과 실제 검증 세트의 성능이 매우 유사합니다(차이 <2%). 이는 모델이 일반화 능력이 우수함을 의미합니다.',
            data: [
              { metric: 'Accuracy', OOB: 94.8, Validation: 93.2, Test: 92.5 },
              { metric: 'Precision', OOB: 92.3, Validation: 91.1, Test: 90.2 },
              { metric: 'Recall', OOB: 91.5, Validation: 90.8, Test: 89.9 },
              { metric: 'F1-Score', OOB: 91.9, Validation: 90.9, Test: 90.0 }
            ],
            chartType: 'radar',
            icon: <FaLightbulb />,
            gradient: 'from-blue-500/20 to-cyan-500/20'
          }
        ]

      case 'pdp':
        return [
          {
            id: 'critical_thresholds',
            title: '임계값 분석',
            insight: 'RSI 30 이하에서 강한 매수 신호, 70 이상에서 강한 매도 신호가 발생합니다. 거래량은 평균의 2배 이상일 때 예측력이 급증합니다.',
            data: Array.from({ length: 20 }, (_, i) => ({
              rsi: i * 5,
              impact: i < 6 ? 0.2 - i * 0.03 : i > 14 ? -0.2 - (i - 14) * 0.04 : 0.05 * Math.sin((i - 6) * 0.5)
            })),
            chartType: 'area',
            icon: <FaBrain />,
            gradient: 'from-teal-500/20 to-green-500/20'
          },
          {
            id: 'interaction_effects',
            title: '특성 간 상호작용',
            insight: 'RSI와 거래량의 조합이 가장 강한 예측 신호를 생성합니다. 두 특성이 모두 극단값일 때 예측 확신도가 85% 이상입니다.',
            data: [
              { interaction: 'RSI+Volume', strength: 0.85, cases: 245 },
              { interaction: 'MACD+ATR', strength: 0.72, cases: 198 },
              { interaction: 'Whale+Fear', strength: 0.68, cases: 176 },
              { interaction: 'MA20+BB', strength: 0.62, cases: 156 }
            ],
            chartType: 'bar',
            icon: <FaTree />,
            gradient: 'from-purple-500/20 to-pink-500/20'
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
                  stroke={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][index]} 
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
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
                  stroke={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][index]}
                  fill={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][index]}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
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
                  fill={analysis.data[0].fill || ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][index]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'radar':
        const radarKeys = Object.keys(analysis.data[0]).filter(key => key !== 'name' && key !== 'feature' && key !== 'metric')
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={analysis.data}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis 
                dataKey={Object.keys(analysis.data[0])[0]} 
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
              />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px' 
                }} 
              />
              {radarKeys.map((key, index) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][index]}
                  fill={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][index]}
                  fillOpacity={0.3}
                />
              ))}
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <div className={`bg-gradient-to-br ${currentAnalysis.gradient} rounded-xl p-6 border border-white/10`}>
        <div className="flex items-start gap-4">
          <div className="text-3xl text-white/80">
            {currentAnalysis.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">
              {currentAnalysis.title}
            </h3>
            <p className="text-gray-200 mb-4">
              {currentAnalysis.insight}
            </p>
            
            {currentAnalysis.data && (
              <div className="mt-4">
                {renderChart(currentAnalysis)}
              </div>
            )}
          </div>
        </div>

        {/* 인디케이터 */}
        <div className="flex justify-center mt-4 gap-2">
          {analyses.map((_, index) => (
            <button
              key={index}
              onClick={() => setAnalysisIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === analysisIndex
                  ? 'bg-white w-8'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}