'use client'

import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Zap, BarChart3 } from 'lucide-react'

interface VWAPDynamicAnalysisProps {
  vwap: {
    vwap: number
    upperBand: number
    lowerBand: number
  }
  currentPrice: number
  volume?: number
}

export default function VWAPDynamicAnalysis({ 
  vwap, 
  currentPrice,
  volume = 1000000
}: VWAPDynamicAnalysisProps) {
  
  const analysis = useMemo(() => {
    // VWAP 대비 가격 위치 분석
    const getPricePosition = () => {
      const vwapValue = vwap?.vwap || currentPrice
      const upperBand = vwap?.upperBand || currentPrice * 1.01
      const lowerBand = vwap?.lowerBand || currentPrice * 0.99
      const deviation = ((currentPrice - vwapValue) / vwapValue) * 100
      
      if (currentPrice > upperBand) {
        return { 
          position: '상단 밴드 위', 
          color: 'text-red-400', 
          signal: '과매수 - 매도 고려',
          strength: 'extreme_overbought',
          deviation: deviation.toFixed(2)
        }
      } else if (currentPrice > vwapValue && currentPrice <= upperBand) {
        return { 
          position: 'VWAP 위', 
          color: 'text-green-400', 
          signal: '상승 추세 - 매수 우세',
          strength: 'bullish',
          deviation: deviation.toFixed(2)
        }
      } else if (currentPrice < lowerBand) {
        return { 
          position: '하단 밴드 아래', 
          color: 'text-green-500', 
          signal: '과매도 - 매수 고려',
          strength: 'extreme_oversold',
          deviation: deviation.toFixed(2)
        }
      } else if (currentPrice < vwapValue && currentPrice >= lowerBand) {
        return { 
          position: 'VWAP 아래', 
          color: 'text-red-300', 
          signal: '하락 추세 - 매도 우세',
          strength: 'bearish',
          deviation: deviation.toFixed(2)
        }
      } else {
        return { 
          position: 'VWAP 근처', 
          color: 'text-yellow-400', 
          signal: '균형 상태',
          strength: 'neutral',
          deviation: deviation.toFixed(2)
        }
      }
    }
    
    // 밴드 폭 분석
    const getBandwidth = () => {
      const vwapValue = vwap?.vwap || currentPrice
      const upperBand = vwap?.upperBand || currentPrice * 1.01
      const lowerBand = vwap?.lowerBand || currentPrice * 0.99
      const bandwidth = upperBand - lowerBand
      const bandwidthPercent = (bandwidth / vwapValue) * 100
      
      if (bandwidthPercent > 1) {
        return { 
          width: '넓음', 
          volatility: '높은 변동성',
          percent: bandwidthPercent.toFixed(2)
        }
      } else if (bandwidthPercent > 0.5) {
        return { 
          width: '보통', 
          volatility: '중간 변동성',
          percent: bandwidthPercent.toFixed(2)
        }
      } else {
        return { 
          width: '좁음', 
          volatility: '낮은 변동성',
          percent: bandwidthPercent.toFixed(2)
        }
      }
    }
    
    // 거래량 가중 분석 - 실제 데이터 기반
    const getVolumeAnalysis = () => {
      // BTC 기준 평균 거래량 대비 계산 (실제 시장 데이터 기반)
      const btcDailyAvgVolume = 100000 // BTC 일일 평균 거래량 기준
      const volumeRatio = volume / btcDailyAvgVolume
      
      // 동적 임계값 계산 (현재 가격 대비)
      const volumeValue = volume * currentPrice // 거래 금액
      const significantVolumeThreshold = currentPrice * 1000 // 가격 * 1000 = 유의미한 거래량
      
      if (volumeRatio > 2 || volumeValue > significantVolumeThreshold * 2) {
        return { 
          level: '매우 높음', 
          reliability: '높은 신뢰도',
          color: 'text-purple-400',
          percentage: Math.min((volumeRatio * 100), 200).toFixed(1) // 최대 200%
        }
      } else if (volumeRatio > 1 || volumeValue > significantVolumeThreshold) {
        return { 
          level: '높음', 
          reliability: '양호한 신뢰도',
          color: 'text-blue-400',
          percentage: (volumeRatio * 100).toFixed(1)
        }
      } else if (volumeRatio > 0.5 || volumeValue > significantVolumeThreshold * 0.5) {
        return { 
          level: '보통', 
          reliability: '보통 신뢰도',
          color: 'text-yellow-400',
          percentage: (volumeRatio * 100).toFixed(1)
        }
      } else {
        return { 
          level: '낮음', 
          reliability: '낮은 신뢰도',
          color: 'text-gray-400',
          percentage: (volumeRatio * 100).toFixed(1)
        }
      }
    }
    
    // 트레이딩 제안 - 실제 데이터 기반 계산
    const getTradingSuggestion = () => {
      const position = getPricePosition()
      const bandwidth = getBandwidth()
      const volumeAnalysis = getVolumeAnalysis()
      
      // 실제 편차와 밴드 폭을 기반으로 신뢰도 계산
      const calculateConfidence = (baseConfidence: number) => {
        const vwapValue = vwap?.vwap || currentPrice
        const deviation = Math.abs(((currentPrice - vwapValue) / vwapValue) * 100)
        const bandwidthPercent = parseFloat(bandwidth.percent)
        
        // 편차가 클수록 신호 강도 증가
        const deviationScore = Math.min(deviation * 5, 30) // 최대 30점
        
        // 밴드 폭이 적절할 때 신뢰도 증가
        const bandwidthScore = bandwidthPercent > 1 && bandwidthPercent < 5 ? 20 : 
                               bandwidthPercent >= 5 ? 10 : 5
        
        // 거래량에 따른 가중치
        const volumeScore = volumeAnalysis.level === '매우 높음' ? 20 :
                           volumeAnalysis.level === '높음' ? 15 :
                           volumeAnalysis.level === '보통' ? 10 : 5
        
        return Math.min(Math.max(baseConfidence + deviationScore + bandwidthScore + volumeScore, 10), 95)
      }
      
      // 실제 가격 대비 목표가 계산
      const calculateTarget = (direction: 'up' | 'down') => {
        const vwapValue = vwap?.vwap || currentPrice
        const upperBand = vwap?.upperBand || currentPrice * 1.02
        const lowerBand = vwap?.lowerBand || currentPrice * 0.98
        const bandWidth = upperBand - lowerBand
        
        if (direction === 'up') {
          // 상승 목표: VWAP + (밴드폭 * 0.618) 피보나치
          return vwapValue + (bandWidth * 0.618)
        } else {
          // 하락 목표: VWAP - (밴드폭 * 0.618)
          return vwapValue - (bandWidth * 0.618)
        }
      }
      
      // 상단 밴드 돌파 - 과매수
      if (position.strength === 'extreme_overbought') {
        const target = vwap.vwap
        const stopLoss = currentPrice * 1.02 // 2% 위
        const confidence = calculateConfidence(45)
        
        return {
          action: '숏 포지션 고려',
          reason: `VWAP 상단 밴드 ${Math.abs(((currentPrice - vwap.upperBand) / vwap.upperBand) * 100).toFixed(1)}% 돌파`,
          entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
          target: `목표가: ${target.toFixed(2)} USDT (VWAP 회귀)`,
          stopLoss: `손절가: ${stopLoss.toFixed(2)} USDT (+2%)`,
          confidence: confidence,
          strategy: 'Mean Reversion (평균 회귀)'
        }
      }
      
      // 하단 밴드 돌파 - 과매도
      if (position.strength === 'extreme_oversold') {
        const target = vwap.vwap
        const stopLoss = currentPrice * 0.98 // 2% 아래
        const confidence = calculateConfidence(45)
        
        return {
          action: '롱 포지션 고려',
          reason: `VWAP 하단 밴드 ${Math.abs(((vwap.lowerBand - currentPrice) / vwap.lowerBand) * 100).toFixed(1)}% 돌파`,
          entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
          target: `목표가: ${target.toFixed(2)} USDT (VWAP 회귀)`,
          stopLoss: `손절가: ${stopLoss.toFixed(2)} USDT (-2%)`,
          confidence: confidence,
          strategy: 'Mean Reversion (평균 회귀)'
        }
      }
      
      // VWAP 위 - 상승 추세
      if (position.strength === 'bullish' && volumeAnalysis.level !== '낮음') {
        const target = calculateTarget('up')
        const stopLoss = vwap.vwap * 0.995 // VWAP 아래 0.5%
        const confidence = calculateConfidence(35)
        
        return {
          action: '추세 추종 매수',
          reason: `VWAP 위 ${position.deviation}% + ${volumeAnalysis.level} 거래량`,
          entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
          target: `목표가: ${target.toFixed(2)} USDT (+${((target - currentPrice) / currentPrice * 100).toFixed(1)}%)`,
          stopLoss: `손절가: ${stopLoss.toFixed(2)} USDT (VWAP)`,
          confidence: confidence,
          strategy: 'Trend Following (추세 추종)'
        }
      }
      
      // VWAP 아래 - 하락 추세
      if (position.strength === 'bearish' && volumeAnalysis.level !== '낮음') {
        const target = calculateTarget('down')
        const stopLoss = vwap.vwap * 1.005 // VWAP 위 0.5%
        const confidence = calculateConfidence(30)
        
        return {
          action: '추세 추종 매도',
          reason: `VWAP 아래 ${Math.abs(parseFloat(position.deviation))}% + ${volumeAnalysis.level} 거래량`,
          entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
          target: `목표가: ${target.toFixed(2)} USDT (${((target - currentPrice) / currentPrice * 100).toFixed(1)}%)`,
          stopLoss: `손절가: ${stopLoss.toFixed(2)} USDT (VWAP)`,
          confidence: confidence,
          strategy: 'Trend Following (추세 추종)'
        }
      }
      
      // 중립 - VWAP 근처
      const deviation = Math.abs(parseFloat(position.deviation))
      const confidence = calculateConfidence(15)
      
      return {
        action: '관망',
        reason: `VWAP 근처 (편차 ${deviation.toFixed(2)}%) - 방향성 불분명`,
        entry: `진입 대기 (${currentPrice.toFixed(2)} USDT)`,
        target: `상단: ${vwap.upperBand.toFixed(2)} / 하단: ${vwap.lowerBand.toFixed(2)}`,
        stopLoss: '포지션 없음',
        confidence: confidence,
        strategy: 'Wait & See (밴드 돌파 대기)'
      }
    }
    
    const pricePosition = getPricePosition()
    const bandwidth = getBandwidth()
    const volumeAnalysis = getVolumeAnalysis()
    const suggestion = getTradingSuggestion()
    
    return {
      pricePosition,
      bandwidth,
      volumeAnalysis,
      suggestion
    }
  }, [vwap, currentPrice, volume])

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📊 VWAP 실시간 분석
          <BarChart3 className="w-4 h-4 text-purple-400" />
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">편차</div>
            <div className={`text-sm font-bold ${analysis.pricePosition.color}`}>
              {analysis.pricePosition.deviation}%
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* 현재 값 표시 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">VWAP</div>
            <div className="text-sm font-bold text-purple-400">
              {(vwap?.vwap || 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">상단 밴드</div>
            <div className="text-sm font-bold text-red-400">
              {(vwap?.upperBand || 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">하단 밴드</div>
            <div className="text-sm font-bold text-green-400">
              {(vwap?.lowerBand || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* 가격 위치 분석 */}
        <div className="bg-gray-800/50 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">가격 위치</span>
            <span className={`text-sm font-bold ${analysis.pricePosition.color}`}>
              {analysis.pricePosition.position}
            </span>
          </div>
          <div className="text-xs text-gray-300">
            • 현재가: {currentPrice.toFixed(2)} USDT<br />
            • VWAP 대비: {analysis.pricePosition.deviation}% 편차<br />
            • 신호: {analysis.pricePosition.signal}
          </div>
        </div>

        {/* 과매수/과매도 알림 */}
        {(analysis.pricePosition.strength === 'extreme_overbought' || 
          analysis.pricePosition.strength === 'extreme_oversold') && (
          <div className={`bg-${
            analysis.pricePosition.strength === 'extreme_overbought' ? 'red' : 'green'
          }-900/20 border border-${
            analysis.pricePosition.strength === 'extreme_overbought' ? 'red' : 'green'
          }-500/30 rounded p-3`}>
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${
                analysis.pricePosition.strength === 'extreme_overbought' ? 
                'text-red-400' : 'text-green-400'
              }`} />
              <span className="text-sm font-bold text-white">
                {analysis.pricePosition.strength === 'extreme_overbought' ? 
                 '과매수 신호!' : '과매도 신호!'}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              밴드 돌파 - 평균 회귀 전략 고려
            </div>
          </div>
        )}

        {/* 밴드 폭 & 변동성 */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
          <div className="text-sm text-blue-400 mb-1">변동성 분석</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• 밴드 폭: {analysis.bandwidth.width} ({analysis.bandwidth.percent}%)</div>
            <div>• 변동성: {analysis.bandwidth.volatility}</div>
            <div className="flex items-center gap-2">
              <span>• 거래량:</span>
              <span className={analysis.volumeAnalysis.color}>
                {analysis.volumeAnalysis.level}
              </span>
            </div>
            <div>• 신뢰도: {analysis.volumeAnalysis.reliability}</div>
          </div>
        </div>

        {/* VWAP 트레이딩 가이드 */}
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-2">VWAP 활용법</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• 기관 매매 기준선 (Institutional Benchmark)</div>
            <div>• VWAP 위: 매수 우세 (Bullish)</div>
            <div>• VWAP 아래: 매도 우세 (Bearish)</div>
            <div>• 밴드 돌파: 평균 회귀 기회</div>
            <div>• 높은 거래량: 신호 신뢰도 상승</div>
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
              <div>• 전략: {analysis.suggestion.strategy}</div>
              <div>• 근거: {analysis.suggestion.reason}</div>
              <div>• {analysis.suggestion.entry}</div>
              <div>• {analysis.suggestion.target}</div>
              <div>• {analysis.suggestion.stopLoss}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}