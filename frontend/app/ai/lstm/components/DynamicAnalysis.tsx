'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaChartLine, FaBrain, FaExclamationCircle, FaCheckCircle,
  FaArrowUp, FaArrowDown, FaClock, FaSignal, FaLightbulb,
  FaShieldAlt, FaDollarSign, FaChartBar, FaInfoCircle
} from 'react-icons/fa'
import { BiAnalyse, BiTrendingUp, BiTrendingDown } from 'react-icons/bi'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, RadialBarChart, RadialBar, Legend
} from 'recharts'

interface AnalysisProps {
  type: 'architecture' | 'performance' | 'backtesting' | 'realtime'
  data?: any
}

export default function DynamicAnalysis({ type, data }: AnalysisProps) {
  const [currentInsight, setCurrentInsight] = useState(0)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // 분석 타입별 인사이트
  const insights = {
    architecture: [
      {
        title: "게이트 활성화 패턴",
        description: "현재 Forget Gate가 78% 활성화되어 있어 이전 정보를 선택적으로 유지하고 있습니다.",
        severity: "info",
        recommendation: "단기 변동성이 높은 시장에서 효과적인 패턴입니다."
      },
      {
        title: "메모리 셀 포화도",
        description: "메모리 셀 사용률이 65%로 최적 범위에 있습니다.",
        severity: "success",
        recommendation: "현재 설정이 적절하며 추가 조정이 필요하지 않습니다."
      },
      {
        title: "정보 흐름 최적화",
        description: "Input Gate와 Output Gate 간 균형이 잘 맞춰져 있습니다.",
        severity: "success",
        recommendation: "현재 아키텍처가 효율적으로 작동하고 있습니다."
      }
    ],
    performance: [
      {
        title: "예측 정확도 추세",
        description: "최근 24시간 동안 예측 정확도가 3.2% 상승했습니다.",
        severity: "success",
        recommendation: "모델이 현재 시장 패턴을 잘 학습하고 있습니다."
      },
      {
        title: "리스크 지표 경고",
        description: "최대 낙폭이 -8.2%로 임계값에 근접했습니다.",
        severity: "warning",
        recommendation: "포지션 크기를 줄이고 손절선을 타이트하게 설정하세요."
      },
      {
        title: "Sharpe Ratio 개선",
        description: "위험 대비 수익률이 2.45로 매우 우수한 수준입니다.",
        severity: "success",
        recommendation: "현재 전략을 유지하되 과도한 레버리지는 피하세요."
      }
    ],
    backtesting: [
      {
        title: "시장 상황별 성과",
        description: "상승장에서 72.5%, 하락장에서 61.2%의 승률을 기록했습니다.",
        severity: "info",
        recommendation: "하락장 전략을 보완하여 전천후 성과를 개선하세요."
      },
      {
        title: "최적 포지션 크기",
        description: "백테스트 결과 자본의 3-5%가 최적 포지션 크기로 나타났습니다.",
        severity: "success",
        recommendation: "Kelly Criterion에 따라 포지션 크기를 조정하세요."
      },
      {
        title: "연속 손실 패턴",
        description: "최대 4회 연속 손실이 발생했으며, 평균 복구 기간은 2.3일입니다.",
        severity: "warning",
        recommendation: "연속 손실 시 거래량을 줄이는 규칙을 적용하세요."
      }
    ],
    realtime: [
      {
        title: "실시간 신호 강도",
        description: "현재 BUY 신호가 강하게 나타나고 있습니다 (신뢰도 87%).",
        severity: "success",
        recommendation: "단기 상승 모멘텀이 강하므로 진입을 고려하세요."
      },
      {
        title: "변동성 급증 감지",
        description: "향후 4시간 내 변동성이 150% 증가할 것으로 예상됩니다.",
        severity: "warning",
        recommendation: "포지션 크기를 줄이고 양방향 헤지를 고려하세요."
      },
      {
        title: "지지/저항 근접",
        description: "주요 저항선까지 2.3% 남았습니다.",
        severity: "info",
        recommendation: "부분 익절을 준비하고 추세 전환에 대비하세요."
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

  // 동적 데이터 시뮬레이션
  useEffect(() => {
    const generateDynamicData = () => {
      switch (type) {
        case 'architecture':
          return {
            gateActivity: [
              { time: '10:00', forget: 65, input: 78, output: 82 },
              { time: '10:30', forget: 70, input: 75, output: 80 },
              { time: '11:00', forget: 68, input: 82, output: 78 },
              { time: '11:30', forget: 72, input: 80, output: 85 },
              { time: '12:00', forget: 78, input: 76, output: 83 }
            ],
            memoryUsage: [
              { name: '사용중', value: 65, fill: '#8b5cf6' },
              { name: '여유', value: 35, fill: '#374151' }
            ]
          }
        case 'performance':
          return {
            metrics: [
              { metric: '정확도', current: 85.3, target: 90, fill: '#10b981' },
              { metric: 'Sharpe', current: 2.45, target: 3, fill: '#3b82f6' },
              { metric: '승률', current: 68.5, target: 75, fill: '#f59e0b' }
            ],
            trend: Array.from({ length: 24 }, (_, i) => ({
              hour: `${i}:00`,
              accuracy: 80 + Math.random() * 10,
              profit: -5 + Math.random() * 15
            }))
          }
        case 'backtesting':
          return {
            monthlyReturns: [
              { month: 'Jan', return: 12.5, drawdown: -3.2 },
              { month: 'Feb', return: 8.3, drawdown: -5.1 },
              { month: 'Mar', return: 15.7, drawdown: -2.8 },
              { month: 'Apr', return: -2.4, drawdown: -8.2 },
              { month: 'May', return: 18.9, drawdown: -4.5 }
            ],
            winLossRatio: [
              { name: '승리', value: 234, fill: '#10b981' },
              { name: '패배', value: 108, fill: '#ef4444' }
            ]
          }
        case 'realtime':
          return {
            predictions: Array.from({ length: 20 }, (_, i) => ({
              time: new Date(Date.now() - (20 - i) * 60000).toLocaleTimeString(),
              price: 50000 + Math.random() * 2000,
              predicted: 50000 + Math.random() * 2000 + 500,
              confidence: 70 + Math.random() * 20
            })),
            signals: [
              { type: 'BUY', strength: 87, time: '2분 전' },
              { type: 'HOLD', strength: 65, time: '15분 전' },
              { type: 'SELL', strength: 45, time: '28분 전' }
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
          <BiAnalyse className="text-purple-500" />
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
                  ? 'bg-purple-500 w-8' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 타입별 동적 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {type === 'architecture' && analysisData && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">게이트 활성화 추이</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analysisData.gateActivity}>
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
                  <Line type="monotone" dataKey="forget" stroke="#ef4444" name="Forget Gate" />
                  <Line type="monotone" dataKey="input" stroke="#10b981" name="Input Gate" />
                  <Line type="monotone" dataKey="output" stroke="#f59e0b" name="Output Gate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">메모리 사용률</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analysisData.memoryUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analysisData.memoryUsage.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                <p className="text-2xl font-bold text-white">65%</p>
                <p className="text-sm text-gray-400">메모리 사용중</p>
              </div>
            </div>
          </>
        )}

        {type === 'performance' && analysisData && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">실시간 성능 지표</h4>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={analysisData.metrics}>
                  <RadialBar dataKey="current" fill="#8884d8" background />
                  <Legend />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">24시간 추이</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analysisData.trend}>
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#accuracyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {type === 'backtesting' && analysisData && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">월별 수익률</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analysisData.monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="return" fill="#10b981" />
                  <Bar dataKey="drawdown" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">승/패 비율</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analysisData.winLossRatio}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {analysisData.winLossRatio.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {type === 'realtime' && analysisData && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">예측 vs 실제</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analysisData.predictions}>
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
                  <Line type="monotone" dataKey="price" stroke="#10b981" name="실제 가격" />
                  <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" name="예측 가격" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">최근 신호</h4>
              <div className="space-y-3">
                {analysisData.signals.map((signal: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      signal.type === 'BUY' 
                        ? 'bg-green-900/20 border border-green-500/50'
                        : signal.type === 'SELL'
                        ? 'bg-red-900/20 border border-red-500/50'
                        : 'bg-gray-900/20 border border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {signal.type === 'BUY' ? (
                        <FaArrowUp className="text-green-400" />
                      ) : signal.type === 'SELL' ? (
                        <FaArrowDown className="text-red-400" />
                      ) : (
                        <FaSignal className="text-gray-400" />
                      )}
                      <span className="font-semibold text-white">{signal.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{signal.time}</p>
                      <p className="text-sm font-semibold text-white">{signal.strength}%</p>
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
          <p className="text-sm text-gray-400">리스크 레벨</p>
          <p className="text-lg font-bold text-white">중간</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <FaDollarSign className="text-green-400 text-xl mx-auto mb-1" />
          <p className="text-sm text-gray-400">예상 수익</p>
          <p className="text-lg font-bold text-white">+2.8%</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <FaChartBar className="text-purple-400 text-xl mx-auto mb-1" />
          <p className="text-sm text-gray-400">신뢰도</p>
          <p className="text-lg font-bold text-white">87%</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <FaClock className="text-yellow-400 text-xl mx-auto mb-1" />
          <p className="text-sm text-gray-400">다음 업데이트</p>
          <p className="text-lg font-bold text-white">45초</p>
        </div>
      </div>
    </div>
  )
}