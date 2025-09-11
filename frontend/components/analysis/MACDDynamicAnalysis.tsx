'use client'

import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'

interface MACDDynamicAnalysisProps {
  macd: {
    macdLine: number
    signal: number
    histogram: number
  }
  historicalMACD: Array<{
    macdLine: number
    signal: number
    histogram: number
  }>
  currentPrice: number
}

export default function MACDDynamicAnalysis({ 
  macd, 
  historicalMACD, 
  currentPrice 
}: MACDDynamicAnalysisProps) {
  
  const analysis = useMemo(() => {
    // 크로스오버 감지
    const detectCrossover = () => {
      if (!historicalMACD || historicalMACD.length < 2 || !macd) return null
      
      const prev = historicalMACD[historicalMACD.length - 1]
      const curr = macd
      
      // 골든 크로스 (MACD가 시그널선 상향 돌파)
      if (prev?.macdLine <= prev?.signal && curr?.macdLine > curr?.signal) {
        return { 
          type: 'golden', 
          message: '골든크로스 발생! 강한 매수 신호',
          strength: Math.abs(curr.macdLine - curr.signal)
        }
      }
      
      // 데드 크로스 (MACD가 시그널선 하향 돌파)
      if (prev?.macdLine >= prev?.signal && curr?.macdLine < curr?.signal) {
        return { 
          type: 'death', 
          message: '데드크로스 발생! 매도 신호',
          strength: Math.abs(curr.macdLine - curr.signal)
        }
      }
      
      // 크로스 임박 체크
      const gap = Math.abs(curr?.macdLine - curr?.signal)
      const avgGap = (historicalMACD && historicalMACD.length > 0) ? 
        historicalMACD.slice(-10).reduce((sum, m) => 
          sum + Math.abs(m?.macdLine - m?.signal), 0) / 10 : 1
      
      if (gap < avgGap * 0.3) {
        if (curr?.macdLine < curr?.signal && curr?.histogram > prev?.histogram) {
          return { 
            type: 'approaching_golden', 
            message: '골든크로스 임박 (3-5 캔들 내)',
            strength: gap
          }
        }
        if (curr?.macdLine > curr?.signal && curr?.histogram < prev?.histogram) {
          return { 
            type: 'approaching_death', 
            message: '데드크로스 임박 (3-5 캔들 내)',
            strength: gap
          }
        }
      }
      
      return null
    }
    
    const crossover = detectCrossover()
    
    // 히스토그램 분석
    const analyzeHistogram = () => {
      if (!historicalMACD || historicalMACD.length < 10 || !macd) return { trend: 'neutral', momentum: 'stable' }
      
      const recent = historicalMACD.slice(-10).map(m => m?.histogram || 0)
      const current = macd?.histogram || 0
      
      // 추세 판단
      let increasingCount = 0
      for (let i = 1; i < recent.length; i++) {
        if (recent[i] > recent[i-1]) increasingCount++
      }
      
      const trend = increasingCount > 6 ? 'expanding' : 
                   increasingCount < 4 ? 'contracting' : 'stable'
      
      // 모멘텀 강도
      const avgHistogram = recent.reduce((a, b) => a + b, 0) / recent.length
      const momentum = Math.abs(current) > Math.abs(avgHistogram) * 1.5 ? 'strong' :
                      Math.abs(current) < Math.abs(avgHistogram) * 0.5 ? 'weak' : 'moderate'
      
      return { trend, momentum }
    }
    
    const histogram = analyzeHistogram()
    
    // 신호 강도 계산
    const calculateSignalStrength = () => {
      const histogramStrength = Math.min(100, Math.abs(macd?.histogram || 0) * 10)
      const crossoverBonus = crossover?.type === 'golden' || crossover?.type === 'death' ? 30 : 0
      const momentumBonus = histogram.momentum === 'strong' ? 20 : 
                           histogram.momentum === 'weak' ? -10 : 0
      
      return Math.max(0, Math.min(100, histogramStrength + crossoverBonus + momentumBonus))
    }
    
    const signalStrength = calculateSignalStrength()
    
    // 트레이딩 제안
    const getTradingSuggestion = () => {
      // 실제 MACD 값 기반 동적 계산
      const macdStrength = Math.abs(macd?.macdLine || 0)
      const signalStrength = Math.abs(macd?.signal || 0)
      const histogramStrength = Math.abs(macd?.histogram || 0)
      
      // 평균 히스토그램 계산
      const avgHistogram = historicalMACD.length > 0 
        ? historicalMACD.slice(-20).reduce((sum, m) => sum + Math.abs(m?.histogram || 0), 0) / 20
        : 0.1
      
      // 변동성 기반 목표가/손절가 계산
      const recentPrices = historicalMACD.slice(-20).map(() => currentPrice)
      const priceVolatility = historicalMACD.length > 10
        ? Math.sqrt(historicalMACD.slice(-10).reduce((sum, _, i) => {
            const change = i > 0 ? Math.abs(recentPrices[i] - recentPrices[i-1]) / recentPrices[i-1] : 0
            return sum + change * change
          }, 0) / 10) || 0.02
        : 0.02
      
      // 동적 신뢰도 계산 함수
      const calculateConfidence = (baseScore: number) => {
        const histogramRatio = avgHistogram > 0 ? histogramStrength / avgHistogram : 1
        const momentumBonus = histogram.momentum === 'strong' ? 15 : 
                             histogram.momentum === 'weak' ? -10 : 0
        const trendBonus = histogram.trend === 'expanding' ? 10 : 
                          histogram.trend === 'contracting' ? -5 : 0
        const crossoverBonus = crossover ? 20 : 0
        
        return Math.min(95, Math.max(10, baseScore + momentumBonus + trendBonus + crossoverBonus))
      }
      
      // 동적 타겟/손절 계산
      const calculateTargetStop = (direction: 'long' | 'short', confidence: number) => {
        const riskRewardRatio = confidence > 70 ? 2.5 : confidence > 50 ? 2 : 1.5
        const stopDistance = currentPrice * (priceVolatility * 2)
        const targetDistance = stopDistance * riskRewardRatio
        
        if (direction === 'long') {
          return {
            target: currentPrice + targetDistance,
            stopLoss: currentPrice - stopDistance,
            targetPercent: (targetDistance / currentPrice) * 100,
            stopPercent: (stopDistance / currentPrice) * 100
          }
        } else {
          return {
            target: currentPrice - targetDistance,
            stopLoss: currentPrice + stopDistance,
            targetPercent: (targetDistance / currentPrice) * 100,
            stopPercent: (stopDistance / currentPrice) * 100
          }
        }
      }
      
      // 시간 프레임 계산 (히스토그램 변화율 기반)
      const getTimeframe = () => {
        const changeRate = historicalMACD.length > 5
          ? Math.abs((macd?.histogram || 0) - (historicalMACD[historicalMACD.length - 5]?.histogram || 0))
          : 0
        
        if (changeRate > avgHistogram * 0.5) return '1-2일'
        if (changeRate > avgHistogram * 0.2) return '2-3일'
        if (changeRate > avgHistogram * 0.1) return '3-5일'
        return '5-7일'
      }
      
      if (crossover?.type === 'golden') {
        const confidence = calculateConfidence(70)
        const { target, stopLoss, targetPercent, stopPercent } = calculateTargetStop('long', confidence)
        return {
          action: '즉시 매수',
          reason: crossover.message,
          entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
          target: `목표가: ${target.toFixed(2)} USDT (+${targetPercent.toFixed(1)}%)`,
          stopLoss: `손절가: ${stopLoss.toFixed(2)} USDT (-${stopPercent.toFixed(1)}%)`,
          timeframe: getTimeframe(),
          confidence
        }
      }
      
      if (crossover?.type === 'death') {
        const confidence = calculateConfidence(65)
        const { target, stopLoss, targetPercent, stopPercent } = calculateTargetStop('short', confidence)
        return {
          action: '즉시 매도',
          reason: crossover.message,
          entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
          target: `목표가: ${target.toFixed(2)} USDT (-${targetPercent.toFixed(1)}%)`,
          stopLoss: `손절가: ${stopLoss.toFixed(2)} USDT (+${stopPercent.toFixed(1)}%)`,
          timeframe: getTimeframe(),
          confidence
        }
      }
      
      if (crossover?.type === 'approaching_golden') {
        const confidence = calculateConfidence(55)
        const { target, stopLoss, targetPercent, stopPercent } = calculateTargetStop('long', confidence)
        const entryPrice = currentPrice * (1 - priceVolatility * 0.5)
        return {
          action: '매수 준비',
          reason: crossover.message,
          entry: `예상 진입가: ${entryPrice.toFixed(2)} USDT`,
          target: `목표가: ${target.toFixed(2)} USDT (+${targetPercent.toFixed(1)}%)`,
          stopLoss: `손절가: ${stopLoss.toFixed(2)} USDT (-${stopPercent.toFixed(1)}%)`,
          timeframe: getTimeframe(),
          confidence
        }
      }
      
      if (crossover?.type === 'approaching_death') {
        const confidence = calculateConfidence(50)
        const { target, stopLoss, targetPercent, stopPercent } = calculateTargetStop('short', confidence)
        const entryPrice = currentPrice * (1 + priceVolatility * 0.5)
        return {
          action: '매도 준비',
          reason: crossover.message,
          entry: `예상 진입가: ${entryPrice.toFixed(2)} USDT`,
          target: `목표가: ${target.toFixed(2)} USDT (-${targetPercent.toFixed(1)}%)`,
          stopLoss: `손절가: ${stopLoss.toFixed(2)} USDT (+${stopPercent.toFixed(1)}%)`,
          timeframe: getTimeframe(),
          confidence
        }
      }
      
      // 히스토그램 기반 제안
      if (macd?.histogram > 0 && histogram.trend === 'expanding') {
        const confidence = calculateConfidence(45)
        const { target, stopLoss, targetPercent, stopPercent } = calculateTargetStop('long', confidence)
        return {
          action: '추세 추종 매수',
          reason: '히스토그램 확대 중, 상승 모멘텀 강화',
          entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
          target: `목표가: ${target.toFixed(2)} USDT (+${targetPercent.toFixed(1)}%)`,
          stopLoss: `손절가: ${stopLoss.toFixed(2)} USDT (-${stopPercent.toFixed(1)}%)`,
          timeframe: getTimeframe(),
          confidence
        }
      }
      
      if (macd?.histogram < 0 && histogram.trend === 'contracting') {
        const confidence = calculateConfidence(30)
        return {
          action: '반등 대기',
          reason: '히스토그램 축소 중, 반전 가능성',
          entry: '진입 대기',
          target: '추가 신호 필요',
          stopLoss: '포지션 없음',
          timeframe: '관망',
          confidence
        }
      }
      
      const neutralConfidence = calculateConfidence(35)
      return {
        action: '중립 관망',
        reason: '명확한 신호 없음',
        entry: '진입 대기',
        target: '추가 신호 필요',
        stopLoss: '포지션 없음',
        timeframe: '관망',
        confidence: neutralConfidence
      }
    }
    
    const suggestion = getTradingSuggestion()
    
    // 현재 상태 설명
    const getStatusDescription = () => {
      const position = (macd?.macdLine || 0) > (macd?.signal || 0) ? '시그널선 상회' : '시그널선 하회'
      const histogramStatus = (macd?.histogram || 0) > 0 ? '양의 히스토그램' : '음의 히스토그램'
      const trend = (macd?.histogram || 0) > 0 && histogram.trend === 'expanding' ? '상승 강화' :
                   (macd?.histogram || 0) < 0 && histogram.trend === 'expanding' ? '하락 강화' :
                   histogram.trend === 'contracting' ? '모멘텀 약화' : '횡보'
      
      return { position, histogramStatus, trend }
    }
    
    const status = getStatusDescription()
    
    return {
      crossover,
      histogram,
      signalStrength,
      suggestion,
      status
    }
  }, [macd, historicalMACD, currentPrice])

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📈 MACD 실시간 분석
          <Activity className="w-4 h-4 text-blue-400" />
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">신호 강도</div>
            <div className={`text-lg font-bold ${
              analysis.signalStrength > 70 ? 'text-green-400' :
              analysis.signalStrength > 40 ? 'text-yellow-400' :
              'text-gray-400'
            }`}>
              {analysis.signalStrength.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* 현재 값 표시 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MACD선</div>
            <div className={`text-sm font-bold ${(macd?.macdLine || 0) > 0 ? 'text-blue-400' : 'text-orange-400'}`}>
              {(macd?.macdLine || 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">시그널선</div>
            <div className="text-sm font-bold text-yellow-400">
              {(macd?.signal || 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">히스토그램</div>
            <div className={`text-sm font-bold ${(macd?.histogram || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(macd?.histogram || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* 크로스오버 알림 */}
        {analysis.crossover && (
          <div className={`bg-${
            analysis.crossover.type === 'golden' ? 'green' : 
            analysis.crossover.type === 'death' ? 'red' : 'yellow'
          }-900/20 border border-${
            analysis.crossover.type === 'golden' ? 'green' : 
            analysis.crossover.type === 'death' ? 'red' : 'yellow'
          }-500/30 rounded p-3`}>
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${
                analysis.crossover.type === 'golden' ? 'text-green-400' :
                analysis.crossover.type === 'death' ? 'text-red-400' :
                'text-yellow-400'
              }`} />
              <span className="text-sm font-bold text-white">
                {analysis.crossover.message}
              </span>
            </div>
          </div>
        )}

        {/* 현재 상태 */}
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-2">현재 상태</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">포지션:</span>
              <span className="text-gray-300">{analysis.status.position}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">히스토그램:</span>
              <span className={(macd?.histogram || 0) > 0 ? 'text-green-400' : 'text-red-400'}>
                {analysis.status.histogramStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">모멘텀:</span>
              <span className={`${
                analysis.histogram.momentum === 'strong' ? 'text-yellow-400' :
                analysis.histogram.momentum === 'weak' ? 'text-gray-400' :
                'text-gray-300'
              }`}>
                {analysis.histogram.momentum === 'strong' ? '강함' :
                 analysis.histogram.momentum === 'weak' ? '약함' : '보통'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">추세:</span>
              <span className="text-gray-300">{analysis.status.trend}</span>
            </div>
          </div>
        </div>

        {/* 히스토그램 분석 */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
          <div className="text-sm text-blue-400 mb-1">히스토그램 분석</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• 추세: {
              analysis.histogram.trend === 'expanding' ? '확대 중 (모멘텀 강화)' :
              analysis.histogram.trend === 'contracting' ? '축소 중 (모멘텀 약화)' :
              '안정적'
            }</div>
            <div>• 방향: {(macd?.histogram || 0) > 0 ? '상승 우세' : '하락 우세'}</div>
            <div>• 변화율: {
              (historicalMACD && historicalMACD.length > 0 && macd) ? 
              (((macd?.histogram || 0) - (historicalMACD[historicalMACD.length - 1]?.histogram || 0)) > 0 ? '+' : '') +
              (((macd?.histogram || 0) - (historicalMACD[historicalMACD.length - 1]?.histogram || 0)).toFixed(3)) : 
              '계산 중'
            }</div>
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
              <div>• 예상 기간: {analysis.suggestion.timeframe}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}