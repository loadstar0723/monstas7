'use client'

import { useEffect, useState } from 'react'
import { FaChartLine, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa'
import { motion } from 'framer-motion'

interface StrategyRecommendation {
  action: 'BUY' | 'SELL' | 'HOLD' | 'AVOID'
  confidence: number
  reasons: string[]
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'
  suggestedEntry?: number
  suggestedStop?: number
  suggestedTarget?: number
}

interface TradingStrategyProps {
  spoofingScore: number
  wallData: any
  flashOrderData: any
  volumeData: any
  currentPrice: number
  symbol: string
}

export default function TradingStrategy({ 
  spoofingScore, 
  wallData, 
  flashOrderData, 
  volumeData, 
  currentPrice,
  symbol 
}: TradingStrategyProps) {
  const [recommendation, setRecommendation] = useState<StrategyRecommendation>({
    action: 'HOLD',
    confidence: 50,
    reasons: [],
    riskLevel: 'MEDIUM'
  })
  
  const [alerts, setAlerts] = useState<string[]>([])

  // 전략 분석 및 추천
  useEffect(() => {
    analyzeAndRecommend()
  }, [spoofingScore, wallData, flashOrderData, volumeData, currentPrice])

  const analyzeAndRecommend = () => {
    const newAlerts: string[] = []
    const reasons: string[] = []
    let action: 'BUY' | 'SELL' | 'HOLD' | 'AVOID' = 'HOLD'
    let confidence = 50
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 'MEDIUM'

    // 스푸핑 점수 분석
    if (spoofingScore > 80) {
      newAlerts.push('🚨 매우 높은 스푸핑 활동 감지')
      reasons.push('시장 조작 가능성 매우 높음')
      action = 'AVOID'
      confidence = 90
      riskLevel = 'EXTREME'
    } else if (spoofingScore > 60) {
      newAlerts.push('⚠️ 높은 스푸핑 활동')
      reasons.push('시장 조작 위험 존재')
      riskLevel = 'HIGH'
      confidence = Math.max(confidence - 20, 0)
    } else if (spoofingScore > 40) {
      reasons.push('중간 수준의 스푸핑 활동')
      riskLevel = 'MEDIUM'
    } else {
      reasons.push('낮은 스푸핑 활동')
      confidence = Math.min(confidence + 10, 100)
      riskLevel = 'LOW'
    }

    // 벽 데이터 분석
    if (wallData?.totalWalls > 5) {
      if (wallData.bidWalls > wallData.askWalls * 2) {
        reasons.push('강한 매수 벽 형성')
        if (action !== 'AVOID') action = 'BUY'
        confidence = Math.min(confidence + 15, 100)
      } else if (wallData.askWalls > wallData.bidWalls * 2) {
        reasons.push('강한 매도 벽 형성')
        if (action !== 'AVOID') action = 'SELL'
        confidence = Math.min(confidence + 15, 100)
      }
    }

    // 플래시 오더 분석
    if (flashOrderData?.flashRate > 20) {
      newAlerts.push('⚡ 높은 플래시 오더 빈도')
      reasons.push('빠른 주문 취소 패턴 감지')
      confidence = Math.max(confidence - 15, 0)
      if (riskLevel === 'LOW') riskLevel = 'MEDIUM'
    }

    // 거래량 조작 분석
    if (volumeData?.manipulationScore > 70) {
      newAlerts.push('📊 거래량 조작 의심')
      reasons.push('비정상적 거래량 패턴')
      if (action !== 'AVOID') action = 'HOLD'
      confidence = Math.max(confidence - 25, 0)
      riskLevel = 'HIGH'
    }

    // 종합 판단
    if (action === 'AVOID') {
      reasons.unshift('거래 회피 권장')
    } else if (confidence < 30) {
      action = 'HOLD'
      reasons.unshift('신뢰도 부족으로 대기 권장')
    }

    // 진입가, 손절가, 목표가 계산
    let suggestedEntry = undefined
    let suggestedStop = undefined
    let suggestedTarget = undefined

    if (action === 'BUY' && currentPrice > 0) {
      suggestedEntry = currentPrice * 1.001 // 0.1% 위
      suggestedStop = currentPrice * 0.98 // 2% 손절
      suggestedTarget = currentPrice * 1.05 // 5% 목표
    } else if (action === 'SELL' && currentPrice > 0) {
      suggestedEntry = currentPrice * 0.999 // 0.1% 아래
      suggestedStop = currentPrice * 1.02 // 2% 손절
      suggestedTarget = currentPrice * 0.95 // 5% 목표
    }

    setRecommendation({
      action,
      confidence,
      reasons,
      riskLevel,
      suggestedEntry,
      suggestedStop,
      suggestedTarget
    })
    
    setAlerts(newAlerts)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-500'
      case 'SELL': return 'text-red-500'
      case 'HOLD': return 'text-yellow-500'
      case 'AVOID': return 'text-purple-500'
      default: return 'text-gray-500'
    }
  }

  const getActionBg = (action: string) => {
    switch (action) {
      case 'BUY': return 'bg-green-900/30 border-green-700'
      case 'SELL': return 'bg-red-900/30 border-red-700'
      case 'HOLD': return 'bg-yellow-900/30 border-yellow-700'
      case 'AVOID': return 'bg-purple-900/30 border-purple-700'
      default: return 'bg-gray-900/30 border-gray-700'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-500'
      case 'MEDIUM': return 'text-yellow-500'
      case 'HIGH': return 'text-orange-500'
      case 'EXTREME': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaChartLine className="text-blue-400" />
          <h3 className="text-lg font-bold text-white">AI 트레이딩 전략</h3>
        </div>
        <span className="text-sm text-gray-400">{symbol}</span>
      </div>

      {/* 알림 */}
      {alerts.length > 0 && (
        <div className="space-y-2 mb-4">
          {alerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-2 bg-red-900/30 border border-red-700 rounded-lg text-xs text-red-400"
            >
              {alert}
            </motion.div>
          ))}
        </div>
      )}

      {/* 추천 액션 */}
      <div className={`p-4 rounded-lg border ${getActionBg(recommendation.action)} mb-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">추천 액션:</span>
            <span className={`text-2xl font-bold ${getActionColor(recommendation.action)}`}>
              {recommendation.action}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">신뢰도</div>
            <div className="text-lg font-bold text-white">{recommendation.confidence}%</div>
          </div>
        </div>

        {/* 신뢰도 바 */}
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
          <div 
            className={`h-full transition-all ${
              recommendation.confidence > 70 ? 'bg-green-500' :
              recommendation.confidence > 40 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${recommendation.confidence}%` }}
          />
        </div>

        {/* 리스크 레벨 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">리스크 수준:</span>
          <span className={`text-sm font-bold ${getRiskColor(recommendation.riskLevel)}`}>
            {recommendation.riskLevel}
          </span>
        </div>

        {/* 가격 제안 */}
        {(recommendation.action === 'BUY' || recommendation.action === 'SELL') && 
         recommendation.suggestedEntry && (
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-600">
            <div className="text-center">
              <div className="text-xs text-gray-400">진입가</div>
              <div className="text-sm font-bold text-white">
                ${recommendation.suggestedEntry.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">손절가</div>
              <div className="text-sm font-bold text-red-400">
                ${recommendation.suggestedStop?.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">목표가</div>
              <div className="text-sm font-bold text-green-400">
                ${recommendation.suggestedTarget?.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 분석 근거 */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-300 mb-2">분석 근거</div>
        {recommendation.reasons.map((reason, index) => (
          <div key={index} className="flex items-start gap-2">
            {index === 0 ? (
              <FaExclamationTriangle className="text-yellow-400 text-xs mt-0.5" />
            ) : (
              <FaInfoCircle className="text-blue-400 text-xs mt-0.5" />
            )}
            <span className="text-xs text-gray-400">{reason}</span>
          </div>
        ))}
      </div>

      {/* 전략 요약 */}
      <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-gray-400">스푸핑 점수:</span>
            <span className={`ml-1 font-bold ${
              spoofingScore > 60 ? 'text-red-400' : 
              spoofingScore > 30 ? 'text-yellow-400' : 
              'text-green-400'
            }`}>
              {spoofingScore}%
            </span>
          </div>
          <div>
            <span className="text-gray-400">벽 감지:</span>
            <span className="ml-1 font-bold text-white">
              {wallData?.totalWalls || 0}개
            </span>
          </div>
          <div>
            <span className="text-gray-400">플래시 오더:</span>
            <span className="ml-1 font-bold text-white">
              {flashOrderData?.flashRate || 0}/분
            </span>
          </div>
          <div>
            <span className="text-gray-400">거래량 조작:</span>
            <span className={`ml-1 font-bold ${
              volumeData?.manipulationScore > 50 ? 'text-red-400' : 'text-green-400'
            }`}>
              {volumeData?.manipulationScore || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* 경고 메시지 */}
      {recommendation.action === 'AVOID' && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
          <div className="flex items-start gap-2">
            <FaTimesCircle className="text-red-400 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-red-400">
                거래 회피 권장
              </div>
              <div className="text-xs text-gray-400 mt-1">
                현재 시장 상황이 매우 불안정하며 조작 가능성이 높습니다.
                안전을 위해 거래를 피하는 것을 강력히 권장합니다.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 성공 메시지 */}
      {recommendation.action === 'BUY' && recommendation.confidence > 70 && (
        <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">
          <div className="flex items-start gap-2">
            <FaCheckCircle className="text-green-400 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-green-400">
                매수 기회 포착
              </div>
              <div className="text-xs text-gray-400 mt-1">
                현재 시장 상황이 매수에 유리합니다.
                제안된 진입가와 손절가를 참고하여 거래하세요.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}