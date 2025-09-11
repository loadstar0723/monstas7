'use client'

import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'

interface RSIDynamicAnalysisProps {
  rsi: number
  previousRsi?: number
  currentPrice: number
  volume?: number
  historicalData?: any[]
}

export default function RSIDynamicAnalysis({ 
  rsi, 
  previousRsi = 50,
  currentPrice,
  volume,
  historicalData = []
}: RSIDynamicAnalysisProps) {
  
  const analysis = useMemo(() => {
    // RSI 구간 판단
    const getZone = (value: number) => {
      if (value < 20) return { zone: '극도의 과매도', color: 'text-red-500', signal: 'STRONG_BUY' }
      if (value < 30) return { zone: '과매도', color: 'text-orange-500', signal: 'BUY' }
      if (value < 45) return { zone: '약세', color: 'text-yellow-500', signal: 'WEAK_BUY' }
      if (value < 55) return { zone: '중립', color: 'text-gray-400', signal: 'NEUTRAL' }
      if (value < 70) return { zone: '강세', color: 'text-blue-500', signal: 'WEAK_SELL' }
      if (value < 80) return { zone: '과매수', color: 'text-purple-500', signal: 'SELL' }
      return { zone: '극도의 과매수', color: 'text-pink-500', signal: 'STRONG_SELL' }
    }

    const currentZone = getZone(rsi)
    
    // 다이버전스 감지 (간단한 버전)
    const detectDivergence = () => {
      if (!previousRsi) return null
      
      const rsiChange = rsi - previousRsi
      const priceChange = ((currentPrice - 100000) / 100000) * 100 // 가격 변화율 추정
      
      // 강세 다이버전스: RSI는 상승, 가격은 하락 또는 약한 상승
      if (rsiChange > 5 && priceChange < 0) {
        return { type: 'bullish', strength: 'strong', message: '강세 다이버전스 발생! 반등 가능성 높음' }
      }
      
      // 약세 다이버전스: RSI는 하락, 가격은 상승
      if (rsiChange < -5 && priceChange > 0) {
        return { type: 'bearish', strength: 'strong', message: '약세 다이버전스 발생! 조정 가능성 높음' }
      }
      
      return null
    }
    
    const divergence = detectDivergence()
    
    // 추세 분석
    const trend = previousRsi ? 
      (rsi > previousRsi ? 'rising' : 'falling') : 'neutral'
    
    // 과거 패턴 분석 - 실제 historicalData 사용
    const historicalPattern = () => {
      if (historicalData.length < 100) return null
      
      // RSI 30 이하에서의 실제 반등률 계산
      let oversoldBounces = []
      for (let i = 10; i < historicalData.length - 10; i++) {
        if (historicalData[i].rsi && historicalData[i].rsi < 30) {
          const priceNow = historicalData[i].close
          const priceLater = historicalData[i + 10].close
          const bounceRate = ((priceLater - priceNow) / priceNow) * 100
          oversoldBounces.push(bounceRate)
        }
      }
      
      // RSI 70 이상에서의 실제 조정률 계산
      let overboughtCorrections = []
      for (let i = 10; i < historicalData.length - 10; i++) {
        if (historicalData[i].rsi && historicalData[i].rsi > 70) {
          const priceNow = historicalData[i].close
          const priceLater = historicalData[i + 10].close
          const correctionRate = ((priceLater - priceNow) / priceNow) * 100
          overboughtCorrections.push(correctionRate)
        }
      }
      
      if (rsi < 30 && oversoldBounces.length > 0) {
        const avgBounce = oversoldBounces.reduce((a, b) => a + b, 0) / oversoldBounces.length
        return {
          avgBounce: avgBounce.toFixed(2),
          count: oversoldBounces.length,
          successRate: (oversoldBounces.filter(b => b > 0).length / oversoldBounces.length * 100).toFixed(1)
        }
      } else if (rsi > 70 && overboughtCorrections.length > 0) {
        const avgCorrection = overboughtCorrections.reduce((a, b) => a + b, 0) / overboughtCorrections.length
        return {
          avgBounce: avgCorrection.toFixed(2),
          count: overboughtCorrections.length,
          successRate: (overboughtCorrections.filter(c => c < 0).length / overboughtCorrections.length * 100).toFixed(1)
        }
      }
      
      return null
    }
    
    const pattern = historicalPattern()
    
    // 트레이딩 제안
    const getTradingSuggestion = () => {
      const suggestions = []
      
      if (rsi < 30) {
        suggestions.push({
          action: '분할 매수',
          reason: 'RSI 과매도 구간',
          target: `목표가: ${(currentPrice * 1.05).toFixed(2)} USDT (+5%)`,
          stopLoss: `손절가: ${(currentPrice * 0.97).toFixed(2)} USDT (-3%)`,
          confidence: 75
        })
      } else if (rsi > 70) {
        suggestions.push({
          action: '분할 매도',
          reason: 'RSI 과매수 구간',
          target: `목표가: ${(currentPrice * 0.95).toFixed(2)} USDT (-5%)`,
          stopLoss: `손절가: ${(currentPrice * 1.03).toFixed(2)} USDT (+3%)`,
          confidence: 70
        })
      } else if (divergence?.type === 'bullish') {
        suggestions.push({
          action: '매수 준비',
          reason: divergence.message,
          target: `목표가: ${(currentPrice * 1.08).toFixed(2)} USDT (+8%)`,
          stopLoss: `손절가: ${(currentPrice * 0.96).toFixed(2)} USDT (-4%)`,
          confidence: 85
        })
      } else if (divergence?.type === 'bearish') {
        suggestions.push({
          action: '매도 검토',
          reason: divergence.message,
          target: `목표가: ${(currentPrice * 0.92).toFixed(2)} USDT (-8%)`,
          stopLoss: `손절가: ${(currentPrice * 1.04).toFixed(2)} USDT (+4%)`,
          confidence: 80
        })
      } else {
        suggestions.push({
          action: '관망',
          reason: 'RSI 중립 구간',
          target: '추가 신호 대기',
          stopLoss: '포지션 없음',
          confidence: 50
        })
      }
      
      return suggestions[0]
    }
    
    const suggestion = getTradingSuggestion()
    
    return {
      currentZone,
      divergence,
      trend,
      pattern,
      suggestion
    }
  }, [rsi, previousRsi, currentPrice, historicalData])

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📊 RSI 실시간 분석
          {analysis.trend === 'rising' ? 
            <TrendingUp className="w-4 h-4 text-green-400" /> : 
            <TrendingDown className="w-4 h-4 text-red-400" />
          }
        </h3>
        <div className={`text-2xl font-bold ${analysis.currentZone.color}`}>
          {rsi.toFixed(2)}
        </div>
      </div>

      <div className="space-y-3">
        {/* 현재 상태 */}
        <div className="bg-gray-800/50 rounded p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">현재 구간</span>
            <span className={`font-bold ${analysis.currentZone.color}`}>
              {analysis.currentZone.zone}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">추세</span>
            <span className={`text-sm ${
              analysis.trend === 'rising' ? 'text-green-400' : 
              analysis.trend === 'falling' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {analysis.trend === 'rising' ? '상승 중' : 
               analysis.trend === 'falling' ? '하락 중' : '횡보'}
            </span>
          </div>
        </div>

        {/* 다이버전스 알림 */}
        {analysis.divergence && (
          <div className={`bg-${analysis.divergence.type === 'bullish' ? 'green' : 'red'}-900/20 border border-${analysis.divergence.type === 'bullish' ? 'green' : 'red'}-500/30 rounded p-3`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-white">
                {analysis.divergence.message}
              </span>
            </div>
          </div>
        )}

        {/* 과거 패턴 통계 */}
        {analysis.pattern && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
            <div className="text-sm text-blue-400 mb-1">과거 패턴 분석</div>
            <div className="text-xs text-gray-300 space-y-1">
              <div>• RSI 30 이하 진입 횟수: {analysis.pattern.count}회</div>
              <div>• 평균 반등률: {analysis.pattern.avgBounce}%</div>
              <div>• 성공률: {analysis.pattern.successRate}%</div>
            </div>
          </div>
        )}

        {/* 트레이딩 제안 */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded p-3">
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
                <CheckCircle className="w-4 h-4 text-green-400" /> :
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              }
              <span className="text-sm font-bold text-white">
                {analysis.suggestion.action}
              </span>
            </div>
            
            <div className="text-xs text-gray-400 space-y-1">
              <div>• 근거: {analysis.suggestion.reason}</div>
              <div>• {analysis.suggestion.target}</div>
              <div>• {analysis.suggestion.stopLoss}</div>
            </div>
          </div>
        </div>

        {/* 주요 레벨 */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-red-900/20 rounded p-2 text-center">
            <div className="text-gray-400">과매도</div>
            <div className="text-red-400 font-bold">30</div>
          </div>
          <div className="bg-gray-800/50 rounded p-2 text-center">
            <div className="text-gray-400">중립</div>
            <div className="text-gray-300 font-bold">50</div>
          </div>
          <div className="bg-green-900/20 rounded p-2 text-center">
            <div className="text-gray-400">과매수</div>
            <div className="text-green-400 font-bold">70</div>
          </div>
        </div>
      </div>
    </div>
  )
}