'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaChartLine, FaBrain, FaExclamationCircle, FaCheckCircle,
  FaArrowUp, FaArrowDown, FaClock, FaSignal, FaLightbulb,
  FaShieldAlt, FaDollarSign, FaChartBar, FaInfoCircle,
  FaCogs, FaExchangeAlt, FaRocket, FaTachometerAlt
} from 'react-icons/fa'
import { BiAnalyse, BiTrendingUp, BiTrendingDown } from 'react-icons/bi'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, RadialBarChart, RadialBar, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

interface AnalysisProps {
  type: 'gates' | 'comparison' | 'hyperparameter' | 'realtime' | 'training'
  data?: any
}

export default function DynamicAnalysis({ type, data }: AnalysisProps) {
  const [currentInsight, setCurrentInsight] = useState(0)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // 분석 타입별 인사이트
  const insights = {
    gates: [
      {
        title: "Reset Gate 최적화 상태",
        description: "현재 Reset Gate가 32% 활성화로 이전 정보를 적절히 보존하고 있습니다.",
        severity: "success",
        recommendation: "안정적인 트렌드 상황에서 최적의 게이트 활성화 패턴입니다."
      },
      {
        title: "Update Gate 효율성",
        description: "Update Gate가 78%로 새로운 정보를 적극 반영 중입니다.",
        severity: "info",
        recommendation: "변동성이 높은 시장에서 빠른 적응이 가능한 상태입니다."
      },
      {
        title: "게이트 균형 분석",
        description: "Reset과 Update Gate의 균형이 이상적인 범위를 벗어났습니다.",
        severity: "warning",
        recommendation: "하이퍼파라미터 재조정으로 게이트 균형을 맞춰주세요."
      }
    ],
    comparison: [
      {
        title: "GRU 속도 우위",
        description: "LSTM 대비 2.1배 빠른 학습 속도를 보이고 있습니다.",
        severity: "success",
        recommendation: "실시간 트레이딩에 최적화된 상태입니다."
      },
      {
        title: "메모리 효율성",
        description: "33% 적은 메모리로 LSTM과 유사한 성능 달성 중입니다.",
        severity: "success",
        recommendation: "리소스 제한 환경에서도 안정적 운영이 가능합니다."
      },
      {
        title: "장기 예측 한계",
        description: "1일 이상 장기 예측에서 LSTM 대비 5% 낮은 정확도입니다.",
        severity: "info",
        recommendation: "단기 예측 위주의 전략을 권장합니다."
      }
    ],
    hyperparameter: [
      {
        title: "학습률 최적화 완료",
        description: "베이지안 최적화로 최적 학습률 0.0015를 발견했습니다.",
        severity: "success",
        recommendation: "현재 설정으로 학습을 진행하세요."
      },
      {
        title: "은닉 유닛 조정 필요",
        description: "현재 128개 유닛으로는 복잡한 패턴 학습에 한계가 있습니다.",
        severity: "warning",
        recommendation: "256개로 증가시켜 성능 향상을 도모하세요."
      },
      {
        title: "과적합 위험 감지",
        description: "드롭아웃 비율이 낮아 과적합 위험이 있습니다.",
        severity: "warning",
        recommendation: "드롭아웃을 0.3으로 증가시키세요."
      }
    ],
    realtime: [
      {
        title: "강한 상승 신호",
        description: "GRU 모델이 87% 신뢰도로 상승 예측 중입니다.",
        severity: "success",
        recommendation: "롱 포지션 진입을 고려하세요."
      },
      {
        title: "변동성 증가 예상",
        description: "향후 1시간 내 변동성이 35% 증가할 것으로 예측됩니다.",
        severity: "warning",
        recommendation: "포지션 크기를 줄이고 리스크 관리에 집중하세요."
      },
      {
        title: "모델 신뢰도 우수",
        description: "최근 24시간 예측 정확도가 91.2%를 기록했습니다.",
        severity: "success",
        recommendation: "현재 모델 시그널을 신뢰할 수 있습니다."
      }
    ],
    training: [
      {
        title: "학습 수렴 진행중",
        description: "손실 함수가 안정적으로 감소하고 있습니다.",
        severity: "success",
        recommendation: "현재 학습률을 유지하며 계속 진행하세요."
      },
      {
        title: "검증 손실 증가",
        description: "학습 손실과 검증 손실의 격차가 벌어지고 있습니다.",
        severity: "warning",
        recommendation: "조기 종료(Early Stopping)를 고려하세요."
      },
      {
        title: "최적 에폭 도달",
        description: "150 에폭에서 최고 성능을 달성했습니다.",
        severity: "info",
        recommendation: "현재 모델을 저장하고 배포 준비를 하세요."
      }
    ]
  }

  // 인사이트 로테이션
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights[type].length)
    }, 5000)
    return () => clearInterval(interval)
  }, [type])

  // 동적 데이터 생성
  useEffect(() => {
    const generateDynamicData = () => {
      switch (type) {
        case 'gates':
          return {
            gateActivity: Array.from({ length: 20 }, (_, i) => ({
              time: `${i}:00`,
              reset: 20 + Math.sin(i / 3) * 20 + Math.cos(i / 5) * 20,  // 결정론적 변동
              update: 50 + Math.cos(i / 4) * 20 + Math.sin(i / 6) * 20,  // 다른 주기 패턴
              efficiency: 60 + Math.sin(i / 5) * 15 + Math.cos(i / 7) * 15  // 효율성 패턴
            })),
            gateBalance: [
              { name: 'Reset Gate', value: 35, fill: '#ef4444' },
              { name: 'Update Gate', value: 65, fill: '#3b82f6' }
            ]
          }
        case 'comparison':
          return {
            speedComparison: [
              { metric: '학습 시간', GRU: 45, LSTM: 90 },
              { metric: '추론 시간', GRU: 0.3, LSTM: 0.5 },
              { metric: '메모리 사용', GRU: 67, LSTM: 100 },
              { metric: '정확도', GRU: 89, LSTM: 91 }
            ],
            efficiency: Array.from({ length: 24 }, (_, i) => ({
              hour: `${i}:00`,
              GRU: 85 + Math.sin(i / 4) * 5 + Math.cos(i / 6) * 5,  // GRU 효율성 패턴
              LSTM: 80 + Math.cos(i / 4) * 5 + Math.sin(i / 6) * 5  // LSTM 효율성 패턴
            }))
          }
        case 'hyperparameter':
          return {
            optimization: Array.from({ length: 30 }, (_, i) => ({
              trial: i + 1,
              accuracy: 70 + Math.sin(i / 5) * 10 + Math.cos(i / 7) * 10,  // 정확도 패턴
              loss: 0.5 - i * 0.01 + Math.sin(i * 0.7) * 0.025 + Math.cos(i * 0.9) * 0.025  // 손실 패턴
            })),
            paramImportance: [
              { param: '학습률', importance: 95, optimal: 88 },
              { param: '은닉유닛', importance: 85, optimal: 75 },
              { param: '드롭아웃', importance: 70, optimal: 82 },
              { param: '배치크기', importance: 60, optimal: 70 }
            ]
          }
        case 'realtime':
          return {
            predictions: Array.from({ length: 60 }, (_, i) => ({
              time: new Date(Date.now() - (60 - i) * 1000).toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              actual: 50000 + Math.sin(i / 10) * 1000 + Math.sin(i * 1.3) * 250 + Math.cos(i * 1.7) * 250,  // 실제값
              predicted: 50000 + Math.sin(i / 10) * 1000 + Math.sin(i * 1.1) * 350 + Math.cos(i * 1.5) * 350,  // 예측값
              confidence: 75 + Math.sin(i / 7) * 10 + Math.cos(i / 9) * 10  // 신뢰도
            })),
            signals: [
              { signal: 'BUY', strength: 87, count: 45 },
              { signal: 'HOLD', strength: 65, count: 30 },
              { signal: 'SELL', strength: 45, count: 25 }
            ]
          }
        case 'training':
          return {
            trainingProgress: Array.from({ length: 50 }, (_, i) => ({
              epoch: i * 4,
              trainLoss: 0.5 * Math.exp(-i * 0.05) + Math.sin(i * 2.3) * 0.01 + Math.cos(i * 2.7) * 0.01,  // 훈련 손실
              valLoss: 0.5 * Math.exp(-i * 0.04) + Math.sin(i * 2.1) * 0.015 + Math.cos(i * 2.5) * 0.015  // 검증 손실
            })),
            metrics: [
              { metric: '정확도', value: 89.5, target: 90, status: 'good' },
              { metric: '정밀도', value: 87.3, target: 85, status: 'excellent' },
              { metric: '재현율', value: 85.2, target: 85, status: 'good' },
              { metric: 'F1 Score', value: 86.2, target: 87, status: 'fair' }
            ]
          }
        default:
          return null
      }
    }

    setAnalysisData(generateDynamicData())
  }, [type])

  // 심각도에 따른 색상
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-400 bg-green-400/20 border-green-400/50'
      case 'warning': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/50'
      case 'error': return 'text-red-400 bg-red-400/20 border-red-400/50'
      default: return 'text-blue-400 bg-blue-400/20 border-blue-400/50'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <FaCheckCircle />
      case 'warning': return <FaExclamationCircle />
      case 'error': return <FaExclamationCircle />
      default: return <FaInfoCircle />
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <BiAnalyse className="text-green-500" />
          실시간 동적 분석
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FaClock />
          <span>마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}</span>
        </div>
      </div>

      {/* 주요 인사이트 캐러셀 */}
      <div className="mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentInsight}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg border ${getSeverityColor(insights[type][currentInsight].severity)}`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl mt-1">
                {getSeverityIcon(insights[type][currentInsight].severity)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">
                  {insights[type][currentInsight].title}
                </h4>
                <p className="text-gray-300 text-sm mb-2">
                  {insights[type][currentInsight].description}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <FaLightbulb className="text-yellow-400" />
                  <span className="text-gray-400">
                    권장사항: {insights[type][currentInsight].recommendation}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 인사이트 인디케이터 */}
        <div className="flex justify-center gap-2 mt-4">
          {insights[type].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentInsight(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentInsight 
                  ? 'bg-green-500 w-8' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 타입별 동적 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {type === 'gates' && analysisData && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">게이트 활동 추이</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analysisData.gateActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="reset" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="update" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">게이트 밸런스</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analysisData.gateBalance}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analysisData.gateBalance.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center">
                <p className="text-sm text-gray-400">Reset/Update 비율</p>
                <p className="text-lg font-bold text-white">35:65</p>
              </div>
            </div>
          </>
        )}

        {type === 'comparison' && analysisData && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">성능 비교</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analysisData.speedComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="metric" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="GRU" fill="#10b981" />
                  <Bar dataKey="LSTM" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">24시간 효율성</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analysisData.efficiency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="GRU" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="LSTM" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {type === 'hyperparameter' && analysisData && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">최적화 진행</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analysisData.optimization}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="trial" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} yAxisId="right" />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">파라미터 중요도</h4>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={analysisData.paramImportance}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="param" stroke="#9ca3af" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                  <Radar name="중요도" dataKey="importance" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Radar name="최적화" dataKey="optimal" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {type === 'realtime' && analysisData && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">예측 vs 실제</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analysisData.predictions.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={['dataMin - 500', 'dataMax + 500']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">신호 분포</h4>
              <div className="space-y-3">
                {analysisData.signals.map((signal: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`text-lg ${
                        signal.signal === 'BUY' ? 'text-green-400' :
                        signal.signal === 'SELL' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {signal.signal === 'BUY' ? <FaArrowUp /> :
                         signal.signal === 'SELL' ? <FaArrowDown /> :
                         <FaSignal />}
                      </div>
                      <span className="text-white font-medium">{signal.signal}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">강도</p>
                        <p className="text-lg font-bold text-white">{signal.strength}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">횟수</p>
                        <p className="text-lg font-bold text-white">{signal.count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {type === 'training' && analysisData && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">학습 손실 추이</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analysisData.trainingProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="epoch" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="trainLoss" stroke="#10b981" strokeWidth={2} name="학습 손실" />
                  <Line type="monotone" dataKey="valLoss" stroke="#f59e0b" strokeWidth={2} name="검증 손실" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">성능 메트릭</h4>
              <div className="space-y-3">
                {analysisData.metrics.map((metric: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{metric.metric}</span>
                      <span className={`font-semibold ${
                        metric.status === 'excellent' ? 'text-green-400' :
                        metric.status === 'good' ? 'text-blue-400' :
                        'text-yellow-400'
                      }`}>
                        {metric.value}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          metric.status === 'excellent' ? 'bg-green-500' :
                          metric.status === 'good' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 추가 분석 메트릭 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <FaShieldAlt className="text-blue-400 text-xl mx-auto mb-1" />
          <p className="text-sm text-gray-400">안정성</p>
          <p className="text-lg font-bold text-white">높음</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <FaTachometerAlt className="text-green-400 text-xl mx-auto mb-1" />
          <p className="text-sm text-gray-400">성능</p>
          <p className="text-lg font-bold text-white">89.5%</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <FaRocket className="text-purple-400 text-xl mx-auto mb-1" />
          <p className="text-sm text-gray-400">효율성</p>
          <p className="text-lg font-bold text-white">우수</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <FaClock className="text-yellow-400 text-xl mx-auto mb-1" />
          <p className="text-sm text-gray-400">업데이트</p>
          <p className="text-lg font-bold text-white">1초</p>
        </div>
      </div>
    </div>
  )
}