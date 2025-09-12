'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaTachometerAlt, FaChartLine, FaSyncAlt } from 'react-icons/fa'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface Props {
  selectedCoin: CoinInfo
}

interface RiskMetric {
  name: string
  value: number
  status: 'safe' | 'warning' | 'danger'
  description: string
}

export default function RiskDashboard({ selectedCoin }: Props) {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([])
  const [overallRisk, setOverallRisk] = useState<{ score: number; level: string; color: string }>({
    score: 0,
    level: '안전',
    color: 'text-green-400'
  })
  const [riskHistory, setRiskHistory] = useState<{ time: string; risk: number }[]>([])
  const [alerts, setAlerts] = useState<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }[]>([])

  useEffect(() => {
    calculateRiskMetrics()
    const interval = setInterval(updateRiskMetrics, 5000)
    return () => clearInterval(interval)
  }, [selectedCoin.symbol])

  const calculateRiskMetrics = () => {
    // 리스크 지표 계산
    const metrics: RiskMetric[] = [
      {
        name: '재고 리스크',
        value: 35 + ((Date.now() % 1000) / 1000) * 30,
        status: 'safe',
        description: '포지션 편향도와 가격 변동 노출도'
      },
      {
        name: '가격 변동성',
        value: 45 + ((Date.now() % 1000) / 1000) * 25,
        status: 'warning',
        description: '최근 24시간 가격 변동성'
      },
      {
        name: '유동성 리스크',
        value: 20 + ((Date.now() % 1000) / 1000) * 20,
        status: 'safe',
        description: '시장 유동성 부족 리스크'
      },
      {
        name: '경쟁 리스크',
        value: 55 + ((Date.now() % 1000) / 1000) * 20,
        status: 'warning',
        description: '다른 마켓 메이커와의 경쟁'
      },
      {
        name: '시스템 리스크',
        value: 15 + ((Date.now() % 1000) / 1000) * 15,
        status: 'safe',
        description: '기술적 오류 및 연결 문제'
      },
      {
        name: '규제 리스크',
        value: 25 + ((Date.now() % 1000) / 1000) * 25,
        status: 'safe',
        description: '규제 변경 및 제한 가능성'
      }
    ]

    // 상태 업데이트
    metrics.forEach(metric => {
      if (metric.value < 30) metric.status = 'safe'
      else if (metric.value < 60) metric.status = 'warning'
      else metric.status = 'danger'
    })

    setRiskMetrics(metrics)

    // 전체 리스크 점수 계산
    const avgRisk = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
    let level = '안전'
    let color = 'text-green-400'
    
    if (avgRisk > 70) {
      level = '위험'
      color = 'text-red-400'
    } else if (avgRisk > 50) {
      level = '경고'
      color = 'text-yellow-400'
    } else if (avgRisk > 30) {
      level = '주의'
      color = 'text-blue-400'
    }

    setOverallRisk({ score: avgRisk, level, color })

    // 리스크 히스토리
    const history = []
    for (let i = 23; i >= 0; i--) {
      const time = new Date(Date.now() - i * 3600000)
      history.push({
        time: time.getHours() + '시',
        risk: 30 + ((Date.now() % 1000) / 1000) * 40 + (i < 12 ? 0 : 10)
      })
    }
    setRiskHistory(history)

    // 알림 생성
    const newAlerts = []
    if (metrics.find(m => m.name === '재고 리스크' && m.value > 60)) {
      newAlerts.push({
        type: '재고 경고',
        message: '포지션이 한쪽으로 과도하게 편향되어 있습니다',
        severity: 'high' as const
      })
    }
    if (metrics.find(m => m.name === '가격 변동성' && m.value > 70)) {
      newAlerts.push({
        type: '변동성 경고',
        message: '높은 변동성으로 인해 리스크가 증가했습니다',
        severity: 'medium' as const
      })
    }
    setAlerts(newAlerts)
  }

  const updateRiskMetrics = () => {
    setRiskMetrics(prev => prev.map(metric => ({
      ...metric,
      value: Math.max(0, Math.min(100, metric.value + (((Date.now() % 1000) / 1000) - 0.5) * 10))
    })))
  }

  const radarData = riskMetrics.map(metric => ({
    subject: metric.name,
    A: metric.value,
    fullMark: 100
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'danger': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-600/20'
      case 'warning': return 'bg-yellow-600/20'
      case 'danger': return 'bg-red-600/20'
      default: return 'bg-gray-600/20'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaShieldAlt className={`text-lg sm:text-xl ${selectedCoin.color}`} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">리스크 관리</h2>
          <p className="text-sm sm:text-base text-gray-400">{selectedCoin.name} 리스크 대시보드</p>
        </div>
      </div>
      
      {/* 종합 리스크 점수 - 모바일 최적화 */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">종합 리스크 수준</h3>
            <div className="flex items-center gap-3">
              <FaTachometerAlt className={`text-2xl sm:text-3xl ${overallRisk.color}`} />
              <div>
                <p className={`text-2xl sm:text-3xl font-bold ${overallRisk.color}`}>
                  {safeFixed(overallRisk.score, 0)}
                </p>
                <p className="text-sm sm:text-base text-gray-400">{overallRisk.level}</p>
              </div>
            </div>
          </div>
          
          {/* 리스크 미터 - 모바일에서 세로 배치 */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
            <div className="text-center">
              <div className="w-full h-16 sm:h-20 bg-green-600/20 rounded flex items-end justify-center pb-1">
                <div 
                  className="w-4 bg-green-400 rounded-t"
                  style={{ height: `${overallRisk.score < 30 ? 100 : 0}%` }}
                />
              </div>
              <p className="text-gray-400 mt-1">안전</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 sm:h-20 bg-blue-600/20 rounded flex items-end justify-center pb-1">
                <div 
                  className="w-4 bg-blue-400 rounded-t"
                  style={{ height: `${overallRisk.score >= 30 && overallRisk.score < 50 ? 100 : 0}%` }}
                />
              </div>
              <p className="text-gray-400 mt-1">주의</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 sm:h-20 bg-yellow-600/20 rounded flex items-end justify-center pb-1">
                <div 
                  className="w-4 bg-yellow-400 rounded-t"
                  style={{ height: `${overallRisk.score >= 50 && overallRisk.score < 70 ? 100 : 0}%` }}
                />
              </div>
              <p className="text-gray-400 mt-1">경고</p>
            </div>
            <div className="text-center hidden sm:block">
              <div className="w-full h-20 bg-orange-600/20 rounded flex items-end justify-center pb-1">
                <div 
                  className="w-4 bg-orange-400 rounded-t"
                  style={{ height: `${overallRisk.score >= 70 && overallRisk.score < 85 ? 100 : 0}%` }}
                />
              </div>
              <p className="text-gray-400 mt-1">높음</p>
            </div>
            <div className="text-center hidden sm:block">
              <div className="w-full h-20 bg-red-600/20 rounded flex items-end justify-center pb-1">
                <div 
                  className="w-4 bg-red-400 rounded-t"
                  style={{ height: `${overallRisk.score >= 85 ? 100 : 0}%` }}
                />
              </div>
              <p className="text-gray-400 mt-1">위험</p>
            </div>
          </div>
        </div>
      </div>

      {/* 알림 - 모바일 반응형 */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div key={index} className={`rounded-lg p-3 sm:p-4 border ${
              alert.severity === 'high' ? 'bg-red-600/20 border-red-600/30' :
              alert.severity === 'medium' ? 'bg-yellow-600/20 border-yellow-600/30' :
              'bg-blue-600/20 border-blue-600/30'
            }`}>
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className={`mt-0.5 flex-shrink-0 ${
                  alert.severity === 'high' ? 'text-red-400' :
                  alert.severity === 'medium' ? 'text-yellow-400' :
                  'text-blue-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{alert.type}</p>
                  <p className="text-xs sm:text-sm text-gray-300">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 리스크 지표 - 모바일 1열 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 레이더 차트 */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">리스크 분포</h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                <Radar 
                  name="리스크" 
                  dataKey="A" 
                  stroke="#A78BFA" 
                  fill="#A78BFA" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 리스크 히스토리 */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-purple-400" />
            24시간 리스크 추이
          </h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: '#E5E7EB' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="risk" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 개별 리스크 지표 - 모바일 2열 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {riskMetrics.map((metric) => (
          <div key={metric.name} className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm sm:text-base font-medium text-white">{metric.name}</h4>
              <span className={`text-xs px-2 py-0.5 rounded ${getStatusBg(metric.status)} ${getStatusColor(metric.status)}`}>
                {safeFixed(metric.value, 0)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
              <div 
                className={`h-1.5 rounded-full transition-all ${
                  metric.status === 'safe' ? 'bg-green-400' :
                  metric.status === 'warning' ? 'bg-yellow-400' :
                  'bg-red-400'
                }`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* 리스크 관리 전략 - 모바일 최적화 */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 sm:p-6 border border-purple-600/30">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3">리스크 관리 전략</h3>
        <div className="space-y-2 text-xs sm:text-sm text-gray-300">
          {overallRisk.score > 70 && (
            <>
              <p className="text-red-400 font-semibold">⚠ 높은 리스크 상태 - 즐시 조치 필요</p>
              <p>• 주문 크기를 50% 축소하고 포지션 축소</p>
              <p>• 스프레드를 넓혀 리스크 분산</p>
              <p>• 손절선을 엄격히 적용 (1-2%)</p>
            </>
          )}
          {overallRisk.score > 50 && overallRisk.score <= 70 && (
            <>
              <p className="text-yellow-400 font-semibold">⚠ 중간 리스크 - 주의 필요</p>
              <p>• 포지션 크기를 모니터링하고 필요시 조정</p>
              <p>• 변동성이 높은 시간대 회피</p>
              <p>• 재고 편향을 중립으로 유지</p>
            </>
          )}
          {overallRisk.score <= 50 && (
            <>
              <p className="text-green-400 font-semibold">✔ 낮은 리스크 - 전략 유지</p>
              <p>• 현재 리스크 수준이 양호함</p>
              <p>• 현재 전략을 유지하며 지속적 모니터링</p>
              <p>• 점진적 포지션 확대 가능</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}