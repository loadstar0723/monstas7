'use client'

import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react'

interface ADXDynamicAnalysisProps {
  adx: number
  plusDI: number
  minusDI: number
  historicalADX?: number[]
  currentPrice: number
}

export default function ADXDynamicAnalysis({ 
  adx, 
  plusDI, 
  minusDI, 
  historicalADX = [], 
  currentPrice 
}: ADXDynamicAnalysisProps) {
  // 안전한 숫자 변환
  const safeADX = typeof adx === 'number' ? adx : 0
  const safePlusDI = typeof plusDI === 'number' ? plusDI : 0
  const safeMinusDI = typeof minusDI === 'number' ? minusDI : 0
  
  const analysis = useMemo(() => {
    // currentPrice 기본값 설정
    const price = currentPrice || 0;
    
    // ADX 추세 강도 분석
    const getTrendStrength = () => {
      if (safeADX >= 50) return { label: '극강 추세', color: 'text-purple-400', score: 5 }
      if (safeADX >= 40) return { label: '매우 강한 추세', color: 'text-blue-400', score: 4 }
      if (safeADX >= 25) return { label: '강한 추세', color: 'text-green-400', score: 3 }
      if (safeADX >= 20) return { label: '보통 추세', color: 'text-yellow-400', score: 2 }
      return { label: '약한 추세', color: 'text-gray-400', score: 1 }
    }
    
    // DI 크로스오버 감지
    const detectCrossover = () => {
      if (historicalADX.length < 2) return null
      
      const prevPlusDI = historicalADX[historicalADX.length - 2]
      const prevMinusDI = historicalADX[historicalADX.length - 1]
      
      // 상승 크로스 (+DI가 -DI를 상향 돌파)
      if (prevPlusDI <= prevMinusDI && safePlusDI > safeMinusDI) {
        return { 
          type: 'bullish', 
          message: '상승 크로스 발생! 매수 신호',
          action: '롱 포지션 진입 고려'
        }
      }
      
      // 하락 크로스 (-DI가 +DI를 상향 돌파)
      if (prevMinusDI <= prevPlusDI && safeMinusDI > safePlusDI) {
        return { 
          type: 'bearish', 
          message: '하락 크로스 발생! 매도 신호',
          action: '숏 포지션 진입 고려'
        }
      }
      
      return null
    }
    
    // 추세 방향 판단
    const getTrendDirection = () => {
      const diDiff = safePlusDI - safeMinusDI
      
      if (diDiff > 15) return { direction: '강한 상승', color: 'text-green-400', score: 2 }
      if (diDiff > 5) return { direction: '상승', color: 'text-green-300', score: 1 }
      if (diDiff > -5) return { direction: '중립', color: 'text-gray-400', score: 0 }
      if (diDiff > -15) return { direction: '하락', color: 'text-red-300', score: -1 }
      return { direction: '강한 하락', color: 'text-red-400', score: -2 }
    }
    
    // ADX 모멘텀 분석
    const getADXMomentum = () => {
      if (historicalADX.length < 5) return { status: '계산 중', trend: 'neutral' }
      
      const recent = historicalADX.slice(-5)
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length
      
      if (safeADX > avg * 1.1) return { status: '상승 중', trend: 'increasing' }
      if (safeADX < avg * 0.9) return { status: '하락 중', trend: 'decreasing' }
      return { status: '안정', trend: 'stable' }
    }
    
    // 트레이딩 제안
    const getTradingSuggestion = () => {
      const strength = getTrendStrength()
      const direction = getTrendDirection()
      const crossover = detectCrossover()
      const momentum = getADXMomentum()
      
      // 크로스오버 신호가 있을 때
      if (crossover) {
        if (crossover.type === 'bullish' && safeADX > 25) {
          return {
            action: '즉시 매수',
            reason: crossover.message,
            entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
            target: `목표가: ${(currentPrice * 1.05).toFixed(2)} USDT (+5%)`,
            stopLoss: `손절가: ${(currentPrice * 0.97).toFixed(2)} USDT (-3%)`,
            confidence: 85
          }
        }
        
        if (crossover.type === 'bearish' && adx > 25) {
          return {
            action: '즉시 매도',
            reason: crossover.message,
            entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
            target: `목표가: ${(currentPrice * 0.95).toFixed(2)} USDT (-5%)`,
            stopLoss: `손절가: ${(currentPrice * 1.03).toFixed(2)} USDT (+3%)`,
            confidence: 80
          }
        }
      }
      
      // 강한 추세 + 방향성 일치
      if (strength.score >= 3 && direction.score > 0) {
        return {
          action: '추세 추종 매수',
          reason: `${strength.label} + ${direction.direction} 추세`,
          entry: `진입가: ${price.toFixed(2)} USDT`,
          target: `목표가: ${(price * 1.08).toFixed(2)} USDT (+8%)`,
          stopLoss: `손절가: ${(price * 0.96).toFixed(2)} USDT (-4%)`,
          confidence: 70
        }
      }
      
      if (strength.score >= 3 && direction.score < 0) {
        return {
          action: '추세 추종 매도',
          reason: `${strength.label} + ${direction.direction} 추세`,
          entry: `진입가: ${price.toFixed(2)} USDT`,
          target: `목표가: ${(price * 0.92).toFixed(2)} USDT (-8%)`,
          stopLoss: `손절가: ${(price * 1.04).toFixed(2)} USDT (+4%)`,
          confidence: 70
        }
      }
      
      // 약한 추세 - 관망
      if (strength.score <= 2) {
        return {
          action: '관망',
          reason: `${strength.label} - 추세 약함`,
          entry: '진입 대기',
          target: 'ADX > 25 대기',
          stopLoss: '포지션 없음',
          confidence: 30
        }
      }
      
      return {
        action: '중립',
        reason: '명확한 신호 없음',
        entry: '진입 대기',
        target: '추가 신호 필요',
        stopLoss: '포지션 없음',
        confidence: 50
      }
    }
    
    const trendStrength = getTrendStrength()
    const trendDirection = getTrendDirection()
    const crossover = detectCrossover()
    const adxMomentum = getADXMomentum()
    const suggestion = getTradingSuggestion()
    
    return {
      trendStrength,
      trendDirection,
      crossover,
      adxMomentum,
      suggestion
    }
  }, [adx, plusDI, minusDI, historicalADX, currentPrice])

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📊 ADX/DMI 실시간 분석
          <Activity className="w-4 h-4 text-purple-400" />
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">추세 강도</div>
            <div className={`text-lg font-bold ${analysis.trendStrength.color}`}>
              {safeADX.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* 현재 값 표시 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">ADX</div>
            <div className={`text-sm font-bold ${analysis.trendStrength.color}`}>
              {safeADX.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {analysis.trendStrength.label}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">+DI</div>
            <div className="text-sm font-bold text-green-400">
              {safePlusDI.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              상승 강도
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">-DI</div>
            <div className="text-sm font-bold text-red-400">
              {safeMinusDI.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              하락 강도
            </div>
          </div>
        </div>

        {/* 크로스오버 알림 */}
        {analysis.crossover && (
          <div className={`bg-${
            analysis.crossover.type === 'bullish' ? 'green' : 'red'
          }-900/20 border border-${
            analysis.crossover.type === 'bullish' ? 'green' : 'red'
          }-500/30 rounded p-3`}>
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${
                analysis.crossover.type === 'bullish' ? 'text-green-400' : 'text-red-400'
              }`} />
              <span className="text-sm font-bold text-white">
                {analysis.crossover.message}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {analysis.crossover.action}
            </div>
          </div>
        )}

        {/* 추세 분석 */}
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-2">추세 상태</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">강도:</span>
              <span className={`ml-2 font-bold ${analysis.trendStrength.color}`}>
                {analysis.trendStrength.label}
              </span>
            </div>
            <div>
              <span className="text-gray-500">방향:</span>
              <span className={`ml-2 font-bold ${analysis.trendDirection.color}`}>
                {analysis.trendDirection.direction}
              </span>
            </div>
            <div>
              <span className="text-gray-500">ADX 추세:</span>
              <span className={`ml-2 font-bold ${
                analysis.adxMomentum.trend === 'increasing' ? 'text-green-400' :
                analysis.adxMomentum.trend === 'decreasing' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {analysis.adxMomentum.status}
              </span>
            </div>
            <div>
              <span className="text-gray-500">DI 차이:</span>
              <span className={`ml-2 font-bold ${
                safePlusDI > safeMinusDI ? 'text-green-400' : 'text-red-400'
              }`}>
                {Math.abs(safePlusDI - safeMinusDI).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* ADX 레벨 가이드 */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
          <div className="text-sm text-blue-400 mb-1">ADX 레벨 가이드</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• 0-20: 추세 없음 (횡보장)</div>
            <div>• 20-25: 약한 추세 시작</div>
            <div>• 25-40: 강한 추세</div>
            <div>• 40-50: 매우 강한 추세</div>
            <div>• 50+: 극강 추세 (과열 주의)</div>
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
            </div>
          </div>
        </div>

        {/* DI 시그널 해석 */}
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-2">DI 시그널 해석</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div className="flex items-center gap-2">
              {safePlusDI > safeMinusDI ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>+DI &gt; -DI: 상승 추세 우세</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span>-DI &gt; +DI: 하락 추세 우세</span>
                </>
              )}
            </div>
            <div>• DI 차이: {Math.abs(safePlusDI - safeMinusDI).toFixed(1)} (
              {Math.abs(safePlusDI - safeMinusDI) > 15 ? '강한 신호' :
               Math.abs(safePlusDI - safeMinusDI) > 5 ? '보통 신호' : '약한 신호'}
            )</div>
            <div>• ADX 레벨: {safeADX.toFixed(1)} (
              {safeADX > 25 ? '진입 가능' : '관망 권장'}
            )</div>
          </div>
        </div>
      </div>
    </div>
  )
}