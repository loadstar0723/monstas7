'use client'

import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Zap, DollarSign } from 'lucide-react'

interface MARibbonDynamicAnalysisProps {
  ma: {
    ma5?: number
    ma10?: number
    ma20?: number
    ma50?: number
    ma100?: number
    ma200?: number
  }
  currentPrice: number
  priceHistory?: number[]
}

export default function MARibbonDynamicAnalysis({ 
  ma, 
  currentPrice,
  priceHistory = []
}: MARibbonDynamicAnalysisProps) {
  
  const analysis = useMemo(() => {
    // MA 리본 정렬 상태 분석
    const getRibbonAlignment = () => {
      const mas = [
        { period: 5, value: ma?.ma5 || currentPrice },
        { period: 10, value: ma?.ma10 || currentPrice },
        { period: 20, value: ma?.ma20 || currentPrice },
        { period: 50, value: ma?.ma50 || currentPrice },
        { period: 100, value: ma?.ma100 || currentPrice },
        { period: 200, value: ma?.ma200 || currentPrice }
      ]
      
      // 정배열 체크 (짧은 MA > 긴 MA)
      let bullishCount = 0
      for (let i = 0; i < mas.length - 1; i++) {
        if (mas[i].value > mas[i + 1].value) {
          bullishCount++
        }
      }
      
      const alignmentScore = (bullishCount / (mas.length - 1)) * 100
      
      if (alignmentScore >= 80) return { 
        type: '완벽한 정배열', 
        color: 'text-green-400', 
        strength: 5,
        signal: '강력한 상승 추세'
      }
      if (alignmentScore >= 60) return { 
        type: '부분 정배열', 
        color: 'text-green-300', 
        strength: 4,
        signal: '상승 추세 진행'
      }
      if (alignmentScore >= 40) return { 
        type: '중립', 
        color: 'text-gray-400', 
        strength: 3,
        signal: '방향성 불분명'
      }
      if (alignmentScore >= 20) return { 
        type: '부분 역배열', 
        color: 'text-red-300', 
        strength: 2,
        signal: '하락 추세 시작'
      }
      return { 
        type: '완벽한 역배열', 
        color: 'text-red-400', 
        strength: 1,
        signal: '강력한 하락 추세'
      }
    }
    
    // MA 간격 분석 (리본 확산/수렴)
    const getRibbonSpread = () => {
      const spread5_20 = Math.abs((ma?.ma5 || currentPrice) - (ma?.ma20 || currentPrice))
      const spread20_50 = Math.abs((ma?.ma20 || currentPrice) - (ma?.ma50 || currentPrice))
      const spread50_200 = Math.abs((ma?.ma50 || currentPrice) - (ma?.ma200 || currentPrice))
      
      const avgSpread = (spread5_20 + spread20_50 + spread50_200) / 3
      const spreadPercent = (avgSpread / currentPrice) * 100
      
      if (spreadPercent > 5) return { 
        status: '강한 확산', 
        trend: 'expanding',
        meaning: '추세 강화 중'
      }
      if (spreadPercent > 2) return { 
        status: '보통 확산', 
        trend: 'normal',
        meaning: '안정적 추세'
      }
      return { 
        status: '수렴', 
        trend: 'converging',
        meaning: '추세 약화 또는 전환 임박'
      }
    }
    
    // 가격 vs MA 위치 분석
    const getPricePosition = () => {
      let aboveCount = 0
      const mas = [ma?.ma5, ma?.ma10, ma?.ma20, ma?.ma50, ma?.ma100, ma?.ma200]
      
      mas.forEach(maValue => {
        if (currentPrice > (maValue || currentPrice)) {
          aboveCount++
        }
      })
      
      const positionScore = (aboveCount / mas.length) * 100
      
      if (positionScore >= 80) return { 
        position: 'MA 리본 위', 
        strength: '매우 강세',
        color: 'text-green-400'
      }
      if (positionScore >= 50) return { 
        position: 'MA 리본 중간', 
        strength: '중립',
        color: 'text-yellow-400'
      }
      return { 
        position: 'MA 리본 아래', 
        strength: '약세',
        color: 'text-red-400'
      }
    }
    
    // 골든/데드 크로스 감지
    const detectCrossover = () => {
      const ma50 = ma?.ma50 || currentPrice
      const ma200 = ma?.ma200 || currentPrice
      const ma20 = ma?.ma20 || currentPrice
      
      // 최근 크로스오버 시뮬레이션
      const recentCross = Math.abs(ma50 - ma200) < (currentPrice * 0.01)
      
      if (recentCross && ma50 > ma200) {
        return { 
          type: 'golden', 
          message: '골든 크로스 발생!',
          action: '강력한 매수 신호'
        }
      }
      
      if (recentCross && ma50 < ma200) {
        return { 
          type: 'death', 
          message: '데드 크로스 발생!',
          action: '강력한 매도 신호'
        }
      }
      
      // 단기 크로스
      if (Math.abs(ma20 - ma50) < (currentPrice * 0.005)) {
        if (ma20 > ma50) {
          return { 
            type: 'short-bullish', 
            message: '단기 상승 크로스',
            action: '단기 매수 기회'
          }
        } else {
          return { 
            type: 'short-bearish', 
            message: '단기 하락 크로스',
            action: '단기 매도 신호'
          }
        }
      }
      
      return null
    }
    
    // 트레이딩 제안
    const getTradingSuggestion = () => {
      const alignment = getRibbonAlignment()
      const spread = getRibbonSpread()
      const position = getPricePosition()
      const crossover = detectCrossover()
      
      // 크로스오버 우선
      if (crossover) {
        if (crossover.type === 'golden') {
          return {
            action: '적극 매수',
            reason: crossover.message,
            entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
            target: `목표가: ${(currentPrice * 1.10).toFixed(2)} USDT (+10%)`,
            stopLoss: `손절가: ${(currentPrice * 0.95).toFixed(2)} USDT (-5%)`,
            confidence: 90,
            leverage: '3-5x 권장'
          }
        }
        
        if (crossover.type === 'death') {
          return {
            action: '즉시 매도',
            reason: crossover.message,
            entry: `청산가: ${currentPrice.toFixed(2)} USDT`,
            target: `목표가: ${(currentPrice * 0.90).toFixed(2)} USDT (-10%)`,
            stopLoss: `손절가: ${(currentPrice * 1.05).toFixed(2)} USDT (+5%)`,
            confidence: 85,
            leverage: '헤지 포지션'
          }
        }
      }
      
      // 정배열 + 가격 위치
      if (alignment.strength >= 4 && position.strength === '매우 강세') {
        return {
          action: '추세 추종 매수',
          reason: `${alignment.type} + ${position.position}`,
          entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
          target: `목표가: ${(currentPrice * 1.06).toFixed(2)} USDT (+6%)`,
          stopLoss: `손절가: ${(ma?.ma20 || currentPrice * 0.98).toFixed(2)} USDT (MA20)`,  
          confidence: 75,
          leverage: '2-3x 권장'
        }
      }
      
      // 역배열 + 가격 아래
      if (alignment.strength <= 2 && position.strength === '약세') {
        return {
          action: '숏 포지션',
          reason: `${alignment.type} + ${position.position}`,
          entry: `진입가: ${currentPrice.toFixed(2)} USDT`,
          target: `목표가: ${(currentPrice * 0.94).toFixed(2)} USDT (-6%)`,
          stopLoss: `손절가: ${(ma?.ma20 || currentPrice * 1.02).toFixed(2)} USDT (MA20)`,  
          confidence: 70,
          leverage: '1-2x 권장'
        }
      }
      
      // 수렴 구간
      if (spread.trend === 'converging') {
        return {
          action: '관망',
          reason: 'MA 리본 수렴 - 방향성 대기',
          entry: '진입 대기',
          target: '돌파 방향 확인 필요',
          stopLoss: '포지션 없음',
          confidence: 40,
          leverage: '포지션 정리'
        }
      }
      
      return {
        action: '중립',
        reason: '명확한 신호 없음',
        entry: '추가 확인 필요',
        target: '방향성 불분명',
        stopLoss: '리스크 관리',
        confidence: 50,
        leverage: '1x 이하'
      }
    }
    
    const ribbonAlignment = getRibbonAlignment()
    const ribbonSpread = getRibbonSpread()
    const pricePosition = getPricePosition()
    const crossover = detectCrossover()
    const suggestion = getTradingSuggestion()
    
    return {
      ribbonAlignment,
      ribbonSpread,
      pricePosition,
      crossover,
      suggestion
    }
  }, [ma, currentPrice])

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📈 MA 리본 실시간 분석
          <Activity className="w-4 h-4 text-purple-400" />
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">리본 상태</div>
            <div className={`text-sm font-bold ${analysis.ribbonAlignment.color}`}>
              {analysis.ribbonAlignment.type}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* 현재 MA 값 표시 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MA5/MA20</div>
            <div className={`text-sm font-bold ${
              (ma?.ma5 || 0) > (ma?.ma20 || 0) ? 'text-green-400' : 'text-red-400'
            }`}>
              {ma?.ma5?.toFixed(0)}/{ma?.ma20?.toFixed(0)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MA20/MA50</div>
            <div className={`text-sm font-bold ${
              (ma?.ma20 || 0) > (ma?.ma50 || 0) ? 'text-green-400' : 'text-red-400'
            }`}>
              {ma?.ma20?.toFixed(0)}/{ma?.ma50?.toFixed(0)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MA50/MA200</div>
            <div className={`text-sm font-bold ${
              (ma?.ma50 || 0) > (ma?.ma200 || 0) ? 'text-green-400' : 'text-red-400'
            }`}>
              {ma?.ma50?.toFixed(0)}/{ma?.ma200?.toFixed(0)}
            </div>
          </div>
        </div>

        {/* 크로스오버 알림 */}
        {analysis.crossover && (
          <div className={`bg-${
            analysis.crossover.type.includes('golden') || analysis.crossover.type.includes('bullish') 
              ? 'green' : 'red'
          }-900/20 border border-${
            analysis.crossover.type.includes('golden') || analysis.crossover.type.includes('bullish')
              ? 'green' : 'red'
          }-500/30 rounded p-3`}>
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${
                analysis.crossover.type.includes('golden') || analysis.crossover.type.includes('bullish')
                  ? 'text-green-400' : 'text-red-400'
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

        {/* 리본 상태 분석 */}
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-2">리본 상태</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">정렬:</span>
              <span className={`ml-2 font-bold ${analysis.ribbonAlignment.color}`}>
                {analysis.ribbonAlignment.type}
              </span>
            </div>
            <div>
              <span className="text-gray-500">신호:</span>
              <span className="ml-2 font-bold text-white">
                {analysis.ribbonAlignment.signal}
              </span>
            </div>
            <div>
              <span className="text-gray-500">확산:</span>
              <span className={`ml-2 font-bold ${
                analysis.ribbonSpread.trend === 'expanding' ? 'text-green-400' :
                analysis.ribbonSpread.trend === 'converging' ? 'text-yellow-400' :
                'text-gray-400'
              }`}>
                {analysis.ribbonSpread.status}
              </span>
            </div>
            <div>
              <span className="text-gray-500">가격 위치:</span>
              <span className={`ml-2 font-bold ${analysis.pricePosition.color}`}>
                {analysis.pricePosition.position}
              </span>
            </div>
          </div>
        </div>

        {/* MA 리본 가이드 */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
          <div className="text-sm text-blue-400 mb-1">MA 리본 해석</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• 정배열: 단기MA &gt; 장기MA (상승추세)</div>
            <div>• 역배열: 단기MA &lt; 장기MA (하락추세)</div>
            <div>• 리본 확산: 추세 강화</div>
            <div>• 리본 수렴: 추세 약화 또는 전환</div>
            <div>• 골든크로스: MA50 &gt; MA200 돌파</div>
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

        {/* MA별 지지/저항 레벨 */}
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-2">주요 지지/저항</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div className="flex items-center justify-between">
              <span>MA20 (1차 지지)</span>
              <span className="font-bold text-yellow-400">
                {ma?.ma20?.toFixed(2)} USDT
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>MA50 (2차 지지)</span>
              <span className="font-bold text-orange-400">
                {ma?.ma50?.toFixed(2)} USDT
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>MA200 (주요 지지)</span>
              <span className="font-bold text-red-400">
                {ma?.ma200?.toFixed(2)} USDT
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}