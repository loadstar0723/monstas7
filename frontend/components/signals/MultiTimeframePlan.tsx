'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaClock, FaCalendarDay, FaCalendarWeek, FaCalendarAlt } from 'react-icons/fa'
import { apiClient } from '../../lib/api'
import WebSocketManager from '../../lib/websocketManager'

interface TimeframePlan {
  timeframe: 'scalp' | 'short' | 'medium' | 'long'
  label: string
  duration: string
  entry: number
  stopLoss: number
  targets: number[]
  strategy: string
  riskLevel: 'low' | 'medium' | 'high'
  confidence: number
}

interface MultiTimeframePlanProps {
  symbol?: string
  userId?: string
}

/**
 * 다중 시간대 트레이딩 플랜 컴포넌트
 * 실제 API와 WebSocket 데이터 기반으로 생성
 */
export default function MultiTimeframePlan({ symbol = 'BTC', userId }: MultiTimeframePlanProps) {
  const [currentPrice, setCurrentPrice] = useState(0)
  const [plans, setPlans] = useState<TimeframePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const wsManager = WebSocketManager.getInstance()
    
    // WebSocket 데이터 구독
    const handleWebSocketData = (data: any) => {
      const symbolData = data.prices.find((p: any) => p.symbol === symbol)
      if (symbolData) {
        setCurrentPrice(symbolData.price)
        // 가격 변동 시 플랜 업데이트
        if (symbolData.price > 0) {
          loadTimeframePlans(symbolData.price)
        }
      }
    }

    wsManager.subscribe(handleWebSocketData)

    return () => {
      wsManager.unsubscribe(handleWebSocketData)
    }
  }, [symbol])

  const loadTimeframePlans = async (price: number) => {
    try {
      setLoading(true)
      const plansData = await apiClient.generateTimeframePlans(symbol, price)
      setPlans(plansData)
      setError(null)
    } catch (err) {
      console.error('Failed to load timeframe plans:', err)
      setError('실시간 데이터를 불러올 수 없습니다. 네트워크를 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-center h-48">
          <div className="animate-pulse text-purple-400">실시간 전략 생성 중...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-red-500/30">
        <div className="text-red-400 text-center">{error}</div>
        <button 
          onClick={() => currentPrice > 0 && loadTimeframePlans(currentPrice)}
          className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-all"
        >
          다시 시도
        </button>
      </div>
    )
  }
  const getTimeframeIcon = (timeframe: string) => {
    switch(timeframe) {
      case 'scalp': return <FaClock className="text-red-400" />
      case 'short': return <FaCalendarDay className="text-yellow-400" />
      case 'medium': return <FaCalendarWeek className="text-blue-400" />
      case 'long': return <FaCalendarAlt className="text-green-400" />
      default: return <FaClock className="text-gray-400" />
    }
  }

  const getTimeframeColor = (timeframe: string) => {
    switch(timeframe) {
      case 'scalp': return 'border-red-500/30 bg-red-900/20'
      case 'short': return 'border-yellow-500/30 bg-yellow-900/20'
      case 'medium': return 'border-blue-500/30 bg-blue-900/20'
      case 'long': return 'border-green-500/30 bg-green-900/20'
      default: return 'border-gray-500/30 bg-gray-900/20'
    }
  }

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getRiskLabel = (risk: string) => {
    switch(risk) {
      case 'low': return '낮음'
      case 'medium': return '보통'
      case 'high': return '높음'
      default: return '알 수 없음'
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/30">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <FaClock className="text-purple-400 text-2xl" />
        <h3 className="text-xl font-bold text-white">다중 시간대 전략</h3>
      </div>

      {/* 현재가 표시 */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">현재가</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">${currentPrice.toLocaleString()}</div>
            <div className="text-xs text-gray-500">{symbol}/USDT</div>
          </div>
        </div>
      </div>

      {/* 시간대별 플랜 */}
      <div className="space-y-4">
        {plans.map((plan, index) => {
          const entryDiff = ((plan.entry - currentPrice) / currentPrice * 100).toFixed(2)
          const stopLossDiff = ((plan.stopLoss - currentPrice) / currentPrice * 100).toFixed(2)
          const primaryTargetDiff = ((plan.targets[0] - plan.entry) / plan.entry * 100).toFixed(2)
          const riskReward = ((plan.targets[0] - plan.entry) / Math.abs(plan.entry - plan.stopLoss)).toFixed(2)

          return (
            <motion.div
              key={plan.timeframe}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-lg p-5 border ${getTimeframeColor(plan.timeframe)}`}
            >
              {/* 시간대 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTimeframeIcon(plan.timeframe)}
                  <div>
                    <h4 className="font-bold text-white">{plan.label}</h4>
                    <p className="text-xs text-gray-400">{plan.duration}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${getRiskColor(plan.riskLevel)}`}>
                    리스크: {getRiskLabel(plan.riskLevel)}
                  </div>
                  <div className="text-xs text-gray-400">R:R = 1:{riskReward}</div>
                </div>
              </div>

              {/* 가격 정보 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="bg-gray-800/50 rounded p-2">
                  <div className="text-xs text-gray-400 mb-1">진입가</div>
                  <div className="text-sm font-bold text-white">${plan.entry.toLocaleString()}</div>
                  <div className={`text-xs ${Number(entryDiff) < 0 ? 'text-green-400' : 'text-gray-400'}`}>
                    {Number(entryDiff) < 0 ? '▼' : '▲'} {Math.abs(Number(entryDiff))}%
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded p-2">
                  <div className="text-xs text-gray-400 mb-1">손절가</div>
                  <div className="text-sm font-bold text-red-400">${plan.stopLoss.toLocaleString()}</div>
                  <div className="text-xs text-red-400">
                    ▼ {Math.abs(Number(stopLossDiff))}%
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded p-2">
                  <div className="text-xs text-gray-400 mb-1">1차 목표</div>
                  <div className="text-sm font-bold text-green-400">${plan.targets[0].toLocaleString()}</div>
                  <div className="text-xs text-green-400">
                    ▲ +{primaryTargetDiff}%
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded p-2">
                  <div className="text-xs text-gray-400 mb-1">최종 목표</div>
                  <div className="text-sm font-bold text-blue-400">
                    ${plan.targets[plan.targets.length - 1].toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-400">
                    ▲ +{((plan.targets[plan.targets.length - 1] - plan.entry) / plan.entry * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* 전략 설명 */}
              <div className="bg-gray-800/30 rounded p-3">
                <p className="text-xs text-gray-300 leading-relaxed">
                  {plan.strategy}
                </p>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-2 mt-3">
                <button className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium transition-all">
                  상세 보기
                </button>
                <button className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium transition-all">
                  이 전략 선택
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 추천 전략 */}
      <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 animate-pulse" />
          <div>
            <h4 className="text-sm font-bold text-purple-400 mb-2">AI 추천</h4>
            <p className="text-xs text-gray-300">
              현재 시장 상황을 고려할 때, <span className="text-white font-bold">중기 전략</span>이 
              가장 적합합니다. 리스크 대비 수익률이 균형적이며, 시장 변동성에 대한 대응 시간이 충분합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}