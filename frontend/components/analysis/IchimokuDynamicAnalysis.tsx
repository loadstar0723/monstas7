'use client'

import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Zap, Cloud } from 'lucide-react'

interface IchimokuDynamicAnalysisProps {
  ichimoku: {
    tenkan: number
    kijun: number
    senkouA: number
    senkouB: number
    chikou: number
  }
  currentPrice: number
  priceHistory?: number[]
}

export default function IchimokuDynamicAnalysis({ 
  ichimoku, 
  currentPrice,
  priceHistory = []
}: IchimokuDynamicAnalysisProps) {
  
  const analysis = useMemo(() => {
    // 구름대 위치 분석
    const getCloudPosition = () => {
      const senkouA = ichimoku?.senkouA || currentPrice
      const senkouB = ichimoku?.senkouB || currentPrice
      const cloudTop = Math.max(senkouA, senkouB)
      const cloudBottom = Math.min(senkouA, senkouB)
      
      if (currentPrice > cloudTop) {
        return { 
          position: '구름 위', 
          color: 'text-green-400', 
          strength: 'strong',
          signal: '강한 상승 추세'
        }
      } else if (currentPrice < cloudBottom) {
        return { 
          position: '구름 아래', 
          color: 'text-red-400', 
          strength: 'weak',
          signal: '강한 하락 추세'
        }
      } else {
        return { 
          position: '구름 내부', 
          color: 'text-yellow-400', 
          strength: 'neutral',
          signal: '횡보/저항 구간'
        }
      }
    }
    
    // 전환선/기준선 크로스 분석
    const getTKCross = () => {
      const diff = (ichimoku?.tenkan || currentPrice) - (ichimoku?.kijun || currentPrice)
      
      if (Math.abs(diff) < currentPrice * 0.001) {
        return { 
          type: 'cross', 
          message: '전환선/기준선 크로스 임박!',
          action: '포지션 진입 준비'
        }
      }
      
      if (diff > 0) {
        if (diff > currentPrice * 0.01) {
          return { 
            type: 'bullish_strong', 
            message: '전환선 > 기준선 (강한 상승)',
            action: '롱 포지션 유지'
          }
        }
        return { 
          type: 'bullish', 
          message: '전환선 > 기준선 (상승)',
          action: '상승 추세 진행'
        }
      } else {
        if (diff < -currentPrice * 0.01) {
          return { 
            type: 'bearish_strong', 
            message: '전환선 < 기준선 (강한 하락)',
            action: '숏 포지션 고려'
          }
        }
        return { 
          type: 'bearish', 
          message: '전환선 < 기준선 (하락)',
          action: '하락 추세 진행'
        }
      }
    }
    
    // 구름대 색상 (미래 전망)
    const getCloudColor = () => {
      if ((ichimoku?.senkouA || currentPrice) > (ichimoku?.senkouB || currentPrice)) {
        return { 
          color: '양운 (녹색)', 
          forecast: '상승 전망',
          style: 'text-green-400'
        }
      } else {
        return { 
          color: '음운 (적색)', 
          forecast: '하락 전망',
          style: 'text-red-400'
        }
      }
    }
    
    // 후행스팬 분석
    const getChikouAnalysis = () => {
      if ((ichimoku?.chikou || currentPrice) > currentPrice) {
        return { 
          position: '가격 위', 
          signal: '강세 확인',
          color: 'text-green-400'
        }
      } else if ((ichimoku?.chikou || currentPrice) < currentPrice) {
        return { 
          position: '가격 아래', 
          signal: '약세 확인',
          color: 'text-red-400'
        }
      } else {
        return { 
          position: '가격 근접', 
          signal: '중립',
          color: 'text-yellow-400'
        }
      }
    }
    
    // 종합 신호 강도
    const getSignalStrength = () => {
      let score = 0
      const cloudPos = getCloudPosition()
      const tkCross = getTKCross()
      const cloudColor = getCloudColor()
      const chikou = getChikouAnalysis()
      
      // 구름대 위치 점수
      if (cloudPos.strength === 'strong' && cloudPos.position === '구름 위') score += 30
      else if (cloudPos.strength === 'weak') score -= 30
      
      // 전환선/기준선 점수
      if (tkCross.type.includes('bullish')) score += 20
      else if (tkCross.type.includes('bearish')) score -= 20
      
      // 구름 색상 점수
      if (cloudColor.forecast === '상승 전망') score += 15
      else score -= 15
      
      // 후행스팬 점수
      if (chikou.signal === '강세 확인') score += 15
      else if (chikou.signal === '약세 확인') score -= 15
      
      return score
    }
    
    // 트레이딩 제안
    const getTradingSuggestion = () => {
      const score = getSignalStrength()
      const cloudPos = getCloudPosition()
      const tkCross = getTKCross()
      
      if (score > 50) {
        return {
          action: '적극 매수',
          reason: '모든 신호 일치 - 강한 상승',
          entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
          target: `목표가: ${(currentPrice * 1.08).toFixed(2)} USDT (+8%)`,
          stopLoss: `손절가: ${Math.min(ichimoku?.kijun || currentPrice, ichimoku?.senkouB || currentPrice).toFixed(2)} USDT`,
          confidence: 85,
          leverage: '3-5x 권장'
        }
      } else if (score > 20) {
        return {
          action: '매수 고려',
          reason: `${cloudPos.signal} + ${tkCross.message}`,
          entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
          target: `목표가: ${(currentPrice * 1.05).toFixed(2)} USDT (+5%)`,
          stopLoss: `손절가: ${(ichimoku?.kijun || currentPrice).toFixed(2)} USDT (기준선)`,
          confidence: 65,
          leverage: '2-3x 권장'
        }
      } else if (score < -50) {
        return {
          action: '적극 매도',
          reason: '모든 신호 일치 - 강한 하락',
          entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
          target: `목표가: ${(currentPrice * 0.92).toFixed(2)} USDT (-8%)`,
          stopLoss: `손절가: ${Math.max(ichimoku?.kijun || currentPrice, ichimoku?.senkouA || currentPrice).toFixed(2)} USDT`,
          confidence: 80,
          leverage: '숏 포지션 3x'
        }
      } else if (score < -20) {
        return {
          action: '매도 고려',
          reason: `${cloudPos.signal} + ${tkCross.message}`,
          entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
          target: `목표가: ${(currentPrice * 0.95).toFixed(2)} USDT (-5%)`,
          stopLoss: `손절가: ${(ichimoku?.kijun || currentPrice).toFixed(2)} USDT (기준선)`,
          confidence: 60,
          leverage: '숏 1-2x'
        }
      } else {
        return {
          action: '관망',
          reason: '신호 혼재 - 방향성 불분명',
          entry: '진입 대기',
          target: '구름 돌파 확인 필요',
          stopLoss: '포지션 없음',
          confidence: 40,
          leverage: '대기'
        }
      }
    }
    
    const cloudPosition = getCloudPosition()
    const tkCross = getTKCross()
    const cloudColor = getCloudColor()
    const chikouAnalysis = getChikouAnalysis()
    const signalStrength = getSignalStrength()
    const suggestion = getTradingSuggestion()
    
    return {
      cloudPosition,
      tkCross,
      cloudColor,
      chikouAnalysis,
      signalStrength,
      suggestion
    }
  }, [ichimoku, currentPrice])

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          ⛩️ 일목균형표 실시간 분석
          <Cloud className="w-4 h-4 text-blue-400" />
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">신호 강도</div>
            <div className={`text-sm font-bold ${
              analysis.signalStrength > 30 ? 'text-green-400' :
              analysis.signalStrength < -30 ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {analysis.signalStrength > 0 ? '+' : ''}{analysis.signalStrength}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* 현재 값 표시 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">전환선/기준선</div>
            <div className="text-sm font-bold text-white">
              {(ichimoku?.tenkan || 0).toFixed(0)}/{(ichimoku?.kijun || 0).toFixed(0)}
            </div>
            <div className={`text-xs mt-1 ${
              (ichimoku?.tenkan || 0) > (ichimoku?.kijun || 0) ? 'text-green-400' : 'text-red-400'
            }`}>
              {(ichimoku?.tenkan || 0) > (ichimoku?.kijun || 0) ? '▲ 상승' : '▼ 하락'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">선행스팬 A/B</div>
            <div className="text-sm font-bold text-white">
              {(ichimoku?.senkouA || 0).toFixed(0)}/{(ichimoku?.senkouB || 0).toFixed(0)}
            </div>
            <div className={`text-xs mt-1 ${analysis.cloudColor.style}`}>
              {analysis.cloudColor.color}
            </div>
          </div>
        </div>

        {/* 구름대 위치 분석 */}
        <div className="bg-gray-800/50 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">구름대 위치</span>
            <span className={`text-sm font-bold ${analysis.cloudPosition.color}`}>
              {analysis.cloudPosition.position}
            </span>
          </div>
          <div className="text-xs text-gray-300">
            • 현재가: {currentPrice.toFixed(2)} USDT<br />
            • 구름 상단: {Math.max(ichimoku?.senkouA || currentPrice, ichimoku?.senkouB || currentPrice).toFixed(2)} USDT<br />
            • 구름 하단: {Math.min(ichimoku?.senkouA || currentPrice, ichimoku?.senkouB || currentPrice).toFixed(2)} USDT
          </div>
        </div>

        {/* 전환선/기준선 크로스 알림 */}
        {analysis.tkCross.type === 'cross' && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-white">
                {analysis.tkCross.message}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {analysis.tkCross.action}
            </div>
          </div>
        )}

        {/* 일목균형표 신호 해석 */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
          <div className="text-sm text-blue-400 mb-1">신호 해석</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div className="flex items-center gap-2">
              {analysis.cloudPosition.strength === 'strong' ? (
                <CheckCircle className="w-3 h-3 text-green-400" />
              ) : analysis.cloudPosition.strength === 'weak' ? (
                <AlertTriangle className="w-3 h-3 text-red-400" />
              ) : (
                <Activity className="w-3 h-3 text-yellow-400" />
              )}
              <span>{analysis.cloudPosition.signal}</span>
            </div>
            <div>• 전환/기준: {analysis.tkCross.message}</div>
            <div>• 미래 전망: {analysis.cloudColor.forecast}</div>
            <div>• 후행스팬: {analysis.chikouAnalysis.signal}</div>
          </div>
        </div>

        {/* 트레이딩 제안 */}
        <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-white">트레이딩 제안</span>
            <div className="flex items-center gap-1">
              <div className="text-xs text-gray-400">신뢰도</div>
              <div className={`text-sm font-bold ${
                analysis.suggestion.confidence > 70 ? 'text-green-400' :
                analysis.suggestion.confidence > 50 ? 'text-yellow-400' :
                'text-gray-400'
              }`}>
                {analysis.suggestion.confidence}%
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {analysis.suggestion.confidence > 70 ? 
                <TrendingUp className="w-4 h-4 text-green-400" /> :
                analysis.suggestion.confidence < 50 ?
                <TrendingDown className="w-4 h-4 text-red-400" /> :
                <Activity className="w-4 h-4 text-yellow-400" />
              }
              <span className="text-sm font-bold text-white">
                {analysis.suggestion.action}
              </span>
            </div>
            
            <div className="text-xs text-gray-400 space-y-1">
              <div>• 근거: {analysis.suggestion.reason}</div>
              <div>• {analysis.suggestion.entry}</div>
              <div>• {analysis.suggestion.target}</div>
              <div>• {analysis.suggestion.stopLoss}</div>
              <div>• 레버리지: {analysis.suggestion.leverage}</div>
            </div>
          </div>
        </div>

        {/* 일목균형표 레벨 */}
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-2">주요 레벨</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div className="flex justify-between">
              <span>전환선 (9일)</span>
              <span className="font-bold text-cyan-400">{(ichimoku?.tenkan || 0).toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between">
              <span>기준선 (26일)</span>
              <span className="font-bold text-orange-400">{(ichimoku?.kijun || 0).toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between">
              <span>후행스팬</span>
              <span className="font-bold text-purple-400">{(ichimoku?.chikou || 0).toFixed(2)} USDT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}