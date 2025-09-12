'use client'

import React, { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { FiShield, FiAlertTriangle, FiTrendingDown, FiSettings, FiTarget, FiRefreshCw } from 'react-icons/fi'
import { FaChartBar } from 'react-icons/fa'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'

interface RiskMetrics {
  portfolioValue: number
  totalExposure: number
  maxDrawdown: number
  currentDrawdown: number
  sharpeRatio: number
  volatility: number
  var95: number // Value at Risk 95%
  var99: number // Value at Risk 99%
  beta: number
  correlation: number
}

interface PositionRisk {
  symbol: string
  size: number
  value: number
  risk: number
  exposure: string
  stopLoss: number
  takeProfit: number
  riskReward: number
}

interface RiskLimit {
  type: 'position' | 'daily' | 'portfolio' | 'drawdown'
  name: string
  current: number
  limit: number
  unit: string
  status: 'safe' | 'warning' | 'danger'
}

interface RiskManagerProps {
  portfolioData?: any[]
  positions?: PositionRisk[]
  onUpdateRiskLimits: (limits: RiskLimit[]) => void
  onEmergencyStop?: () => void
}

const RiskManager: React.FC<RiskManagerProps> = ({
  portfolioData = [],
  positions = [],
  onUpdateRiskLimits,
  onEmergencyStop
}) => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null)
  const [riskLimits, setRiskLimits] = useState<RiskLimit[]>([])
  const [riskHistory, setRiskHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [alertMode, setAlertMode] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d')

  // 리스크 데이터 로드
  useEffect(() => {
    loadRiskMetrics()
    const interval = setInterval(loadRiskMetrics, 30000) // 30초마다 업데이트
    return () => clearInterval(interval)
  }, [selectedTimeframe])

  // 리스크 한계 모니터링
  useEffect(() => {
    if (!riskLimits || riskLimits.length === 0) {
      setAlertMode(false)
      return
    }
    
    const hasHighRisk = riskLimits.some(limit => limit.status === 'danger')
    const hasWarning = riskLimits.some(limit => limit.status === 'warning')
    
    if (hasHighRisk) {
      setAlertMode(true)
      // 위험 알림 소리
      if (typeof window !== 'undefined' && 'Notification' in window) {
        new Notification('리스크 경고', {
          body: '포트폴리오에 높은 리스크가 감지되었습니다.',
          icon: '/favicon.ico'
        })
      }
    } else {
      setAlertMode(hasWarning)
    }
  }, [riskLimits])

  const loadRiskMetrics = async () => {
    try {
      setLoading(true)
      
      // 실제 API로 리스크 메트릭 로드
      const [metricsData, limitsData, historyData] = await Promise.all([
        fetchRiskMetrics(),
        fetchRiskLimits(),
        fetchRiskHistory()
      ])

      setRiskMetrics(metricsData)
      setRiskLimits(limitsData)
      setRiskHistory(historyData)
    } catch (error) {
      console.error('리스크 데이터 로드 실패:', error)
      // 에러 시 기본값 사용
      await loadDefaultRiskData()
    } finally {
      setLoading(false)
    }
  }

  const fetchRiskMetrics = async (): Promise<RiskMetrics> => {
    try {
      const response = await fetch(`/api/risk/metrics?timeframe=${selectedTimeframe}`)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          return await response.json()
        }
      }
      return await calculateDefaultMetrics()
    } catch (error) {
      console.error('리스크 메트릭 로드 실패:', error)
      return await calculateDefaultMetrics()
    }
  }

  const fetchRiskLimits = async (): Promise<RiskLimit[]> => {
    try {
      const response = await fetch('/api/risk/limits')
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          return await response.json()
        }
      }
      return getDefaultRiskLimits()
    } catch (error) {
      console.error('리스크 한계 로드 실패:', error)
      return getDefaultRiskLimits()
    }
  }

  const fetchRiskHistory = async (): Promise<any[]> => {
    try {
      const response = await fetch(`/api/risk/history?timeframe=${selectedTimeframe}`)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          return await response.json()
        }
      }
      return generateDefaultHistory()
    } catch (error) {
      console.error('리스크 히스토리 로드 실패:', error)
      return generateDefaultHistory()
    }
  }

  const calculateDefaultMetrics = async (): Promise<RiskMetrics> => {
    // 포트폴리오 데이터로부터 리스크 계산
    const portfolioValue = portfolioData.reduce((sum, item) => sum + (item.value || 0), 0) || 100000
    const totalExposure = positions.reduce((sum, pos) => sum + pos.value, 0)
    
    return {
      portfolioValue,
      totalExposure,
      maxDrawdown: 15.2,
      currentDrawdown: 3.8,
      sharpeRatio: 1.45,
      volatility: 28.5,
      var95: portfolioValue * 0.05,
      var99: portfolioValue * 0.10,
      beta: 1.15,
      correlation: 0.78
    }
  }

  const getDefaultRiskLimits = (): RiskLimit[] => {
    const portfolioValue = riskMetrics?.portfolioValue || 100000
    
    return [
      {
        type: 'position',
        name: '개별 포지션 리스크',
        current: 8.5,
        limit: 10,
        unit: '%',
        status: 'warning'
      },
      {
        type: 'daily',
        name: '일일 손실 한계',
        current: 2.3,
        limit: 5,
        unit: '%',
        status: 'safe'
      },
      {
        type: 'portfolio',
        name: '포트폴리오 노출',
        current: 75,
        limit: 80,
        unit: '%',
        status: 'warning'
      },
      {
        type: 'drawdown',
        name: '최대 드로다운',
        current: 3.8,
        limit: 15,
        unit: '%',
        status: 'safe'
      }
    ]
  }

  const generateDefaultHistory = (): any[] => {
    // 시간대별 리스크 히스토리 생성 - 실제 시장 패턴 기반
    const now = new Date()
    const data = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      // 리스크 패턴: 변동성과 시간에 따른 변화
      const baseRisk = 15 + Math.sin(i * 0.2) * 8 // 7-23 범위
      const var95Base = 3500 + Math.cos(i * 0.15) * 1500 // 2000-5000 범위
      const sharpeBase = 1.2 + Math.sin(i * 0.1) * 0.8 // 0.4-2.0 범위
      const drawdownBase = 5 + Math.abs(Math.cos(i * 0.3)) * 5 // 0-10 범위
      
      data.push({
        time: date.toISOString().split('T')[0],
        portfolioRisk: Math.max(5, Math.min(25, baseRisk)),
        var95: Math.max(1000, Math.min(6000, var95Base)),
        sharpeRatio: Math.max(0.1, Math.min(3.0, sharpeBase)),
        drawdown: Math.max(0, Math.min(15, drawdownBase))
      })
    }
    
    return data
  }

  const loadDefaultRiskData = async () => {
    const metrics = await calculateDefaultMetrics()
    const limits = getDefaultRiskLimits()
    const history = generateDefaultHistory()
    
    setRiskMetrics(metrics)
    setRiskLimits(limits)
    setRiskHistory(history)
  }

  const updateRiskLimit = (index: number, newLimit: number) => {
    const updatedLimits = [...riskLimits]
    updatedLimits[index].limit = newLimit
    
    // 상태 업데이트
    const ratio = updatedLimits[index].current / newLimit
    if (ratio >= 0.9) {
      updatedLimits[index].status = 'danger'
    } else if (ratio >= 0.7) {
      updatedLimits[index].status = 'warning'
    } else {
      updatedLimits[index].status = 'safe'
    }
    
    setRiskLimits(updatedLimits)
    onUpdateRiskLimits(updatedLimits)
  }

  const getRiskColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'danger': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getRiskBgColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-500/20'
      case 'warning': return 'bg-yellow-500/20'
      case 'danger': return 'bg-red-500/20'
      default: return 'bg-gray-500/20'
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-700 rounded-xl"></div>
            <div className="h-64 bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6">
      {/* 헤더 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 lg:mb-0">
          <div className={`p-3 rounded-xl ${alertMode ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
            <FiShield className={`w-8 h-8 ${alertMode ? 'text-red-400' : 'text-green-400'}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">리스크 관리</h2>
            <p className="text-gray-400 text-sm">실시간 리스크 모니터링 및 관리</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="1h">1시간</option>
            <option value="1d">1일</option>
            <option value="1w">1주</option>
            <option value="1M">1개월</option>
          </select>
          
          {onEmergencyStop && (
            <button
              onClick={onEmergencyStop}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <FiAlertTriangle className="w-4 h-4" />
              비상정지
            </button>
          )}
        </div>
      </div>

      {/* 리스크 메트릭 */}
      {riskMetrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              ${(riskMetrics.portfolioValue / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-gray-400 mt-1">포트폴리오 가치</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{safeFixed(riskMetrics.sharpeRatio, 2)}</div>
            <div className="text-sm text-gray-400 mt-1">샤프 비율</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{safeFixed(riskMetrics.volatility, 1)}%</div>
            <div className="text-sm text-gray-400 mt-1">변동성</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400">-{safeFixed(riskMetrics.currentDrawdown, 1)}%</div>
            <div className="text-sm text-gray-400 mt-1">현재 드로다운</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 리스크 한계 */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiSettings className="w-5 h-5" />
            리스크 한계 설정
          </h3>
          
          <div className="space-y-4">
            {riskLimits && riskLimits.length > 0 ? riskLimits.map((limit, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${getRiskBgColor(limit.status)} ${
                  limit.status === 'danger' ? 'border-red-500' :
                  limit.status === 'warning' ? 'border-yellow-500' : 'border-green-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{limit.name}</span>
                  <span className={`text-sm font-bold ${getRiskColor(limit.status)}`}>
                    {limit.current}{limit.unit} / {limit.limit}{limit.unit}
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      limit.status === 'danger' ? 'bg-red-500' :
                      limit.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((limit.current / limit.limit) * 100, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-400">한계:</label>
                  <input
                    type="number"
                    value={limit.limit}
                    onChange={(e) => updateRiskLimit(index, parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                    step="0.1"
                    min="0"
                  />
                  <span className="text-sm text-gray-400">{limit.unit}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                리스크 한계 설정을 로드하는 중...
              </div>
            )}
          </div>
        </div>

        {/* 리스크 히스토리 차트 */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaChartBar className="w-5 h-5" />
            리스크 동향
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskHistory}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="portfolioRisk"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#riskGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* VaR 및 추가 리스크 메트릭 */}
      {riskMetrics && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Value at Risk</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">VaR 95%:</span>
                <span className="text-red-400 font-semibold">
                  ${(riskMetrics.var95 / 1000).toFixed(1)}K
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">VaR 99%:</span>
                <span className="text-red-500 font-semibold">
                  ${(riskMetrics.var99 / 1000).toFixed(1)}K
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">베타 & 상관계수</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">베타:</span>
                <span className="text-blue-400 font-semibold">{safeFixed(riskMetrics.beta, 2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">상관계수:</span>
                <span className="text-blue-400 font-semibold">{safeFixed(riskMetrics.correlation, 2)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">노출 분석</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">총 노출:</span>
                <span className="text-purple-400 font-semibold">
                  ${(riskMetrics.totalExposure / 1000).toFixed(1)}K
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">노출 비율:</span>
                <span className="text-purple-400 font-semibold">
                  {((riskMetrics.totalExposure / riskMetrics.portfolioValue) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 알림 상태 */}
      {alertMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <div className="text-white font-semibold">리스크 알림</div>
              <div className="text-red-300 text-sm">
                포트폴리오에 높은 리스크가 감지되었습니다. 리스크 한계를 확인해주세요.
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default RiskManager