'use client'

import React, { useMemo } from 'react'
import { Maximize2, Minimize2, Target, AlertCircle } from 'lucide-react'

interface BollingerDynamicAnalysisProps {
  bollingerBands: {
    upper: number
    middle: number
    lower: number
    bandwidth: number
  }
  price: number
  historicalBands: Array<{
    upper: number
    middle: number
    lower: number
    bandwidth: number
  }>
  historicalPrices: number[]
}

export default function BollingerDynamicAnalysis({ 
  bollingerBands, 
  price,
  historicalBands,
  historicalPrices
}: BollingerDynamicAnalysisProps) {
  
  const analysis = useMemo(() => {
    // bollingerBands가 없을 때 기본값 사용
    const defaultBandwidth = 0.04 // 4% 기본 밴드폭
    const bands = bollingerBands || { 
      upper: price * 1.02, 
      middle: price, 
      lower: price * 0.98,
      bandwidth: defaultBandwidth
    }
    
    // %B 계산 (현재 가격의 밴드 내 위치)
    const calculatePercentB = () => {
      const range = bands.upper - bands.lower
      if (range === 0) return 0.5
      return (price - bands.lower) / range
    }
    
    const percentB = calculatePercentB()
    
    // 밴드 위치 판단
    const getBandPosition = () => {
      if (price > bands.upper) {
        return { 
          position: '상단 밴드 돌파', 
          color: 'text-red-400', 
          signal: 'OVERBOUGHT',
          description: '과매수 구간, 조정 가능성'
        }
      }
      if (price < bands.lower) {
        return { 
          position: '하단 밴드 이탈', 
          color: 'text-green-400', 
          signal: 'OVERSOLD',
          description: '과매도 구간, 반등 가능성'
        }
      }
      if (price > bands.middle) {
        return { 
          position: '중간선 상회', 
          color: 'text-blue-400', 
          signal: 'BULLISH',
          description: '상승 추세 유지'
        }
      }
      return { 
        position: '중간선 하회', 
        color: 'text-orange-400', 
        signal: 'BEARISH',
        description: '하락 압력 존재'
      }
    }
    
    const position = getBandPosition()
    
    // 스퀴즈 감지
    const detectSqueeze = () => {
      if (!historicalBands || historicalBands.length < 20) return null
      
      const recentBandwidths = historicalBands.slice(-20).map(b => b.bandwidth)
      const avgBandwidth = recentBandwidths.reduce((a, b) => a + b, 0) / recentBandwidths.length
      const minBandwidth = Math.min(...recentBandwidths)
      
      // 현재 밴드폭이 평균의 50% 이하면 스퀴즈
      if (bands.bandwidth < avgBandwidth * 0.5) {
        return {
          type: 'tight',
          message: '🔥 볼린저 스퀴즈 발생! 큰 변동성 임박',
          strength: (1 - bands.bandwidth / avgBandwidth) * 100
        }
      }
      
      // 밴드폭이 확대되고 있으면
      if (bands.bandwidth > avgBandwidth * 1.5) {
        return {
          type: 'expansion',
          message: '📈 밴드 확장 중! 추세 진행',
          strength: (bands.bandwidth / avgBandwidth - 1) * 100
        }
      }
      
      // 스퀴즈 후 확장 시작
      if (bands.bandwidth > minBandwidth * 1.3 && 
          bands.bandwidth < avgBandwidth * 0.8) {
        return {
          type: 'breakout',
          message: '⚡ 스퀴즈 해제! 방향성 주목',
          strength: 50
        }
      }
      
      return null
    }
    
    const squeeze = detectSqueeze()
    
    // 밴드 터치 통계
    const analyzeBandTouches = () => {
      if (!historicalPrices || !historicalBands || 
          historicalPrices.length < 100 || historicalBands.length < 100) return null
      
      let upperTouches = 0
      let lowerTouches = 0
      let upperBounces = []
      let lowerBounces = []
      
      for (let i = 0; i < Math.min(historicalPrices.length, historicalBands.length) - 10; i++) {
        // 상단 터치
        if (historicalPrices[i] >= historicalBands[i].upper) {
          upperTouches++
          // 터치 후 10캔들 뒤 수익률
          const returnRate = ((historicalPrices[i + 10] - historicalPrices[i]) / historicalPrices[i]) * 100
          upperBounces.push(returnRate)
        }
        
        // 하단 터치
        if (historicalPrices[i] <= historicalBands[i].lower) {
          lowerTouches++
          const returnRate = ((historicalPrices[i + 10] - historicalPrices[i]) / historicalPrices[i]) * 100
          lowerBounces.push(returnRate)
        }
      }
      
      return {
        upperTouches,
        lowerTouches,
        upperAvgReturn: upperBounces.length > 0 ? 
          (upperBounces.reduce((a, b) => a + b, 0) / upperBounces.length).toFixed(2) : 0,
        lowerAvgReturn: lowerBounces.length > 0 ?
          (lowerBounces.reduce((a, b) => a + b, 0) / lowerBounces.length).toFixed(2) : 0,
        upperSuccessRate: upperBounces.length > 0 ?
          (upperBounces.filter(r => r < 0).length / upperBounces.length * 100).toFixed(1) : 0,
        lowerSuccessRate: lowerBounces.length > 0 ?
          (lowerBounces.filter(r => r > 0).length / lowerBounces.length * 100).toFixed(1) : 0
      }
    }
    
    const bandStats = analyzeBandTouches()
    
    // 트레이딩 제안
    const getTradingSuggestion = () => {
      // 스퀴즈 상황
      if (squeeze?.type === 'tight') {
        return {
          action: '진입 준비',
          reason: squeeze.message,
          strategy: '스퀴즈 돌파 대기',
          entry: `상단 돌파: ${bands.upper.toFixed(2)} / 하단 돌파: ${bands.lower.toFixed(2)}`,
          target: '밴드폭의 2배 이동',
          stopLoss: '중간선 회귀',
          confidence: 75
        }
      }
      
      // 하단 밴드 이탈
      if (price < bands.lower) {
        return {
          action: '역추세 매수',
          reason: '하단 밴드 이탈, 과매도 상태',
          strategy: '평균 회귀 전략',
          entry: `현재가: ${price.toFixed(2)} USDT`,
          target: `중간선: ${bands.middle.toFixed(2)} USDT`,
          stopLoss: `${(price * 0.97).toFixed(2)} USDT (-3%)`,
          confidence: bandStats ? parseInt(bandStats.lowerSuccessRate) : 70
        }
      }
      
      // 상단 밴드 돌파
      if (price > bands.upper) {
        return {
          action: '부분 익절',
          reason: '상단 밴드 돌파, 과매수 상태',
          strategy: '단기 조정 대비',
          entry: '매도 포지션',
          target: `중간선: ${bands.middle.toFixed(2)} USDT`,
          stopLoss: `${(price * 1.03).toFixed(2)} USDT (+3%)`,
          confidence: bandStats ? parseInt(bandStats.upperSuccessRate) : 65
        }
      }
      
      // 스퀴즈 해제
      if (squeeze?.type === 'breakout') {
        return {
          action: '추세 추종',
          reason: squeeze.message,
          strategy: '돌파 방향 추종',
          entry: `현재가: ${price.toFixed(2)} USDT`,
          target: price > bands.middle ? 
            `상단: ${bands.upper.toFixed(2)} USDT` :
            `하단: ${bands.lower.toFixed(2)} USDT`,
          stopLoss: `중간선: ${bands.middle.toFixed(2)} USDT`,
          confidence: 60
        }
      }
      
      // 중립 구간
      return {
        action: '관망',
        reason: '밴드 내 안정적 움직임',
        strategy: '추가 신호 대기',
        entry: '진입 대기',
        target: '설정 없음',
        stopLoss: '포지션 없음',
        confidence: 50
      }
    }
    
    const suggestion = getTradingSuggestion()
    
    // 주요 레벨
    const keyLevels = {
      resistance: bands.upper,
      support: bands.lower,
      pivot: bands.middle,
      currentDistance: {
        toUpper: ((bands.upper - price) / price * 100).toFixed(2),
        toLower: ((price - bands.lower) / price * 100).toFixed(2),
        toMiddle: ((bands.middle - price) / price * 100).toFixed(2)
      }
    }
    
    return {
      bands,
      percentB,
      position,
      squeeze,
      bandStats,
      suggestion,
      keyLevels
    }
  }, [bollingerBands, price, historicalBands, historicalPrices])

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          🎯 볼린저밴드 실시간 분석
          {analysis.squeeze?.type === 'tight' ? 
            <Minimize2 className="w-4 h-4 text-yellow-400 animate-pulse" /> : 
            <Maximize2 className="w-4 h-4 text-blue-400" />
          }
        </h3>
        <div className="text-right">
          <div className="text-xs text-gray-400">%B</div>
          <div className={`text-xl font-bold ${
            analysis.percentB > 1 ? 'text-red-400' :
            analysis.percentB < 0 ? 'text-green-400' :
            'text-gray-300'
          }`}>
            {(analysis.percentB * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* 현재 위치 */}
        <div className="bg-gray-800/50 rounded p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">현재 위치</span>
            <span className={`text-sm font-bold ${analysis.position.color}`}>
              {analysis.position.position}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {analysis.position.description}
          </div>
        </div>

        {/* 밴드 레벨 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-red-900/20 rounded p-2">
            <div className="text-xs text-gray-400">상단</div>
            <div className="text-sm font-bold text-red-400">
              {(analysis.bands?.upper || 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {analysis.keyLevels.currentDistance.toUpper}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">중간</div>
            <div className="text-sm font-bold text-yellow-400">
              {(analysis.bands?.middle || 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {analysis.keyLevels.currentDistance.toMiddle}%
            </div>
          </div>
          <div className="bg-green-900/20 rounded p-2">
            <div className="text-xs text-gray-400">하단</div>
            <div className="text-sm font-bold text-green-400">
              {(analysis.bands?.lower || 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {analysis.keyLevels.currentDistance.toLower}%
            </div>
          </div>
        </div>

        {/* 스퀴즈 알림 */}
        {analysis.squeeze && (
          <div className={`bg-${
            analysis.squeeze.type === 'tight' ? 'yellow' :
            analysis.squeeze.type === 'breakout' ? 'purple' :
            'blue'
          }-900/20 border border-${
            analysis.squeeze.type === 'tight' ? 'yellow' :
            analysis.squeeze.type === 'breakout' ? 'purple' :
            'blue'
          }-500/30 rounded p-3`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-white">
                {analysis.squeeze.message}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-400">
              강도: {analysis.squeeze.strength.toFixed(0)}%
            </div>
          </div>
        )}

        {/* 밴드 터치 통계 */}
        {analysis.bandStats && (
          <div className="bg-indigo-900/20 border border-indigo-500/30 rounded p-3">
            <div className="text-sm text-indigo-400 mb-2">과거 패턴 통계</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="text-gray-400">상단 터치</div>
                <div className="text-gray-300">• 횟수: {analysis.bandStats.upperTouches}회</div>
                <div className="text-gray-300">• 평균 수익: {analysis.bandStats.upperAvgReturn}%</div>
                <div className="text-gray-300">• 성공률: {analysis.bandStats.upperSuccessRate}%</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400">하단 터치</div>
                <div className="text-gray-300">• 횟수: {analysis.bandStats.lowerTouches}회</div>
                <div className="text-gray-300">• 평균 수익: {analysis.bandStats.lowerAvgReturn}%</div>
                <div className="text-gray-300">• 성공률: {analysis.bandStats.lowerSuccessRate}%</div>
              </div>
            </div>
          </div>
        )}

        {/* 트레이딩 제안 */}
        <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded p-3">
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
              <Target className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">
                {analysis.suggestion.action}
              </span>
            </div>
            
            <div className="text-xs text-gray-400 space-y-1">
              <div>• 근거: {analysis.suggestion.reason}</div>
              <div>• 전략: {analysis.suggestion.strategy}</div>
              <div>• 진입: {analysis.suggestion.entry}</div>
              <div>• 목표: {analysis.suggestion.target}</div>
              <div>• 손절: {analysis.suggestion.stopLoss}</div>
            </div>
          </div>
        </div>

        {/* 밴드폭 표시 */}
        <div className="bg-gray-800/50 rounded p-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">밴드폭</span>
            <span className="text-xs text-gray-300">
              {((analysis.bands?.bandwidth || 0.04) * 100).toFixed(2)}%
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                analysis.squeeze?.type === 'tight' ? 'bg-yellow-500 animate-pulse' :
                analysis.squeeze?.type === 'expansion' ? 'bg-blue-500' :
                'bg-gray-500'
              }`}
              style={{ width: `${Math.min(100, (analysis.bands?.bandwidth || 0.04) * 500)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}