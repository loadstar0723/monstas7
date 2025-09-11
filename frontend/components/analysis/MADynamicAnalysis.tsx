'use client'

import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Zap, ArrowUp, ArrowDown } from 'lucide-react'

interface MADynamicAnalysisProps {
  ma5: number
  ma20: number
  ma50: number
  ma200: number
  ema12: number
  ema26: number
  currentPrice: number
  historicalData?: any[]
}

export default function MADynamicAnalysis({ 
  ma5, 
  ma20, 
  ma50, 
  ma200,
  ema12,
  ema26,
  currentPrice,
  historicalData = []
}: MADynamicAnalysisProps) {
  
  const analysis = useMemo(() => {
    const price = currentPrice || 0
    
    // MA 정렬 분석 (Perfect Order)
    const checkMAAlignment = () => {
      const mas = [
        { period: 5, value: ma5 || price },
        { period: 20, value: ma20 || price },
        { period: 50, value: ma50 || price },
        { period: 200, value: ma200 || price }
      ]
      
      // 상승 정렬 체크 (MA5 > MA20 > MA50 > MA200)
      const isBullishAlignment = mas[0].value > mas[1].value && 
                                 mas[1].value > mas[2].value && 
                                 mas[2].value > mas[3].value
      
      // 하락 정렬 체크 (MA5 < MA20 < MA50 < MA200)
      const isBearishAlignment = mas[0].value < mas[1].value && 
                                 mas[1].value < mas[2].value && 
                                 mas[2].value < mas[3].value
      
      if (isBullishAlignment) {
        return { 
          type: 'bullish', 
          label: '완벽한 상승 정렬', 
          color: 'text-green-500',
          score: 100
        }
      }
      if (isBearishAlignment) {
        return { 
          type: 'bearish', 
          label: '완벽한 하락 정렬', 
          color: 'text-red-500',
          score: -100
        }
      }
      
      // 부분 정렬 체크
      const bullishCount = 
        (mas[0].value > mas[1].value ? 1 : 0) +
        (mas[1].value > mas[2].value ? 1 : 0) +
        (mas[2].value > mas[3].value ? 1 : 0)
      
      if (bullishCount >= 2) {
        return { 
          type: 'partial-bullish', 
          label: '부분 상승 정렬', 
          color: 'text-blue-400',
          score: 50
        }
      }
      if (bullishCount <= 1) {
        return { 
          type: 'partial-bearish', 
          label: '부분 하락 정렬', 
          color: 'text-orange-400',
          score: -50
        }
      }
      
      return { 
        type: 'neutral', 
        label: '중립 상태', 
        color: 'text-gray-400',
        score: 0
      }
    }
    
    // 골든/데드 크로스 감지
    const checkCrossover = () => {
      const signals = []
      
      // 단기 골든크로스 (MA5 > MA20)
      if (ma5 > ma20 && historicalData.length > 1) {
        const prevMA5 = historicalData[historicalData.length - 2]?.ma5 || ma5
        const prevMA20 = historicalData[historicalData.length - 2]?.ma20 || ma20
        if (prevMA5 <= prevMA20) {
          signals.push({ type: 'golden', period: '단기', strength: 'strong' })
        }
      }
      
      // 중기 골든크로스 (MA20 > MA50)
      if (ma20 > ma50 && historicalData.length > 1) {
        const prevMA20 = historicalData[historicalData.length - 2]?.ma20 || ma20
        const prevMA50 = historicalData[historicalData.length - 2]?.ma50 || ma50
        if (prevMA20 <= prevMA50) {
          signals.push({ type: 'golden', period: '중기', strength: 'strong' })
        }
      }
      
      // 장기 골든크로스 (MA50 > MA200)
      if (ma50 > ma200 && historicalData.length > 1) {
        const prevMA50 = historicalData[historicalData.length - 2]?.ma50 || ma50
        const prevMA200 = historicalData[historicalData.length - 2]?.ma200 || ma200
        if (prevMA50 <= prevMA200) {
          signals.push({ type: 'golden', period: '장기', strength: 'very-strong' })
        }
      }
      
      return signals
    }
    
    // 지지/저항 분석
    const analyzeSupportResistance = () => {
      const levels = []
      
      // MA20을 기준으로 지지/저항 판단
      if (Math.abs(price - ma20) / price < 0.01) {
        levels.push({ 
          level: ma20, 
          type: price > ma20 ? 'support' : 'resistance',
          period: 'MA20',
          strength: 'medium'
        })
      }
      
      // MA50을 기준으로 지지/저항 판단
      if (Math.abs(price - ma50) / price < 0.02) {
        levels.push({ 
          level: ma50, 
          type: price > ma50 ? 'support' : 'resistance',
          period: 'MA50',
          strength: 'strong'
        })
      }
      
      // MA200을 기준으로 지지/저항 판단
      if (Math.abs(price - ma200) / price < 0.03) {
        levels.push({ 
          level: ma200, 
          type: price > ma200 ? 'support' : 'resistance',
          period: 'MA200',
          strength: 'very-strong'
        })
      }
      
      return levels
    }
    
    // EMA 분석
    const analyzeEMA = () => {
      const ema12Val = ema12 || price
      const ema26Val = ema26 || price
      const emaDiff = ema12Val - ema26Val
      const emaPercent = ema26Val > 0 ? (emaDiff / ema26Val) * 100 : 0
      
      if (emaPercent > 2) {
        return { 
          trend: '강한 상승', 
          color: 'text-green-500',
          score: 80
        }
      }
      if (emaPercent > 0) {
        return { 
          trend: '상승', 
          color: 'text-green-400',
          score: 40
        }
      }
      if (emaPercent > -2) {
        return { 
          trend: '하락', 
          color: 'text-orange-400',
          score: -40
        }
      }
      return { 
        trend: '강한 하락', 
        color: 'text-red-500',
        score: -80
      }
    }
    
    // 트레이딩 권장사항
    const getTradingRecommendation = () => {
      const alignment = checkMAAlignment()
      const ema = analyzeEMA()
      const supportResistance = analyzeSupportResistance()
      const totalScore = alignment.score + ema.score
      
      if (totalScore > 120) {
        return {
          action: '적극 매수',
          reason: '완벽한 상승 정렬 + EMA 상승',
          entry: `진입가: ${price.toFixed(2)} USDT`,
          target: `목표가: ${(price * 1.05).toFixed(2)} USDT (+5%)`,
          stopLoss: `손절가: ${(ma20 || price * 0.98).toFixed(2)} USDT`,
          confidence: 85
        }
      }
      
      if (totalScore > 60) {
        return {
          action: '매수 고려',
          reason: '부분 상승 정렬',
          entry: `진입가: ${price.toFixed(2)} USDT`,
          target: `목표가: ${(price * 1.03).toFixed(2)} USDT (+3%)`,
          stopLoss: `손절가: ${(ma5 || price * 0.97).toFixed(2)} USDT`,
          confidence: 60
        }
      }
      
      if (totalScore < -120) {
        return {
          action: '적극 매도',
          reason: '완벽한 하락 정렬 + EMA 하락',
          entry: `진입가: ${price.toFixed(2)} USDT`,
          target: `목표가: ${(price * 0.95).toFixed(2)} USDT (-5%)`,
          stopLoss: `손절가: ${(ma20 || price * 1.02).toFixed(2)} USDT`,
          confidence: 85
        }
      }
      
      if (totalScore < -60) {
        return {
          action: '매도 고려',
          reason: '부분 하락 정렬',
          entry: `진입가: ${price.toFixed(2)} USDT`,
          target: `목표가: ${(price * 0.97).toFixed(2)} USDT (-3%)`,
          stopLoss: `손절가: ${(ma5 || price * 1.03).toFixed(2)} USDT`,
          confidence: 60
        }
      }
      
      return {
        action: '관망',
        reason: '명확한 추세 없음',
        entry: '-',
        target: '-',
        stopLoss: '-',
        confidence: 30
      }
    }
    
    const alignment = checkMAAlignment()
    const crossovers = checkCrossover()
    const supportResistance = analyzeSupportResistance()
    const ema = analyzeEMA()
    const recommendation = getTradingRecommendation()
    
    return {
      alignment,
      crossovers,
      supportResistance,
      ema,
      recommendation
    }
  }, [ma5, ma20, ma50, ma200, ema12, ema26, currentPrice, historicalData])
  
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📊 이동평균선 실시간 분석
          <Activity className="w-4 h-4 text-purple-400" />
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">MA 정렬</div>
            <div className={`text-sm font-bold ${analysis.alignment.color}`}>
              {analysis.alignment.label}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* MA 값 표시 */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MA5</div>
            <div className={`text-sm font-bold ${currentPrice > ma5 ? 'text-green-400' : 'text-red-400'}`}>
              {(ma5 || 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MA20</div>
            <div className={`text-sm font-bold ${currentPrice > ma20 ? 'text-green-400' : 'text-red-400'}`}>
              {(ma20 || 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MA50</div>
            <div className={`text-sm font-bold ${currentPrice > ma50 ? 'text-green-400' : 'text-red-400'}`}>
              {(ma50 || 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MA200</div>
            <div className={`text-sm font-bold ${currentPrice > ma200 ? 'text-green-400' : 'text-red-400'}`}>
              {(ma200 || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* EMA 분석 */}
        <div className="bg-gray-800/30 rounded p-3">
          <div className="text-sm text-gray-400 mb-2">EMA 분석</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-gray-500">EMA12:</span>
              <span className="text-sm text-white ml-2">{(ema12 || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500">EMA26:</span>
              <span className="text-sm text-white ml-2">{(ema26 || 0).toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">EMA 추세:</span>
            <span className={`text-sm font-bold ml-2 ${analysis.ema.color}`}>
              {analysis.ema.trend}
            </span>
          </div>
        </div>

        {/* 크로스오버 신호 */}
        {analysis.crossovers.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
            <div className="text-sm text-yellow-400 mb-2">크로스오버 감지</div>
            {analysis.crossovers.map((signal, i) => (
              <div key={i} className="text-xs text-gray-300 flex items-center gap-2">
                {signal.type === 'golden' ? (
                  <ArrowUp className="w-3 h-3 text-green-400" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-red-400" />
                )}
                <span>{signal.period} {signal.type === 'golden' ? '골든크로스' : '데드크로스'}</span>
              </div>
            ))}
          </div>
        )}

        {/* 지지/저항 레벨 */}
        {analysis.supportResistance.length > 0 && (
          <div className="bg-gray-800/30 rounded p-3">
            <div className="text-sm text-gray-400 mb-2">주요 지지/저항</div>
            {analysis.supportResistance.map((level, i) => (
              <div key={i} className="text-xs text-gray-300 flex justify-between">
                <span>{level.period}</span>
                <span className={level.type === 'support' ? 'text-green-400' : 'text-red-400'}>
                  {level.level.toFixed(2)} ({level.type === 'support' ? '지지' : '저항'})
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 트레이딩 권장사항 */}
        <div className={`bg-gradient-to-r ${
          analysis.recommendation.confidence > 70 ? 'from-green-900/30' :
          analysis.recommendation.confidence > 40 ? 'from-yellow-900/30' :
          'from-gray-900/30'
        } to-transparent rounded p-3 border ${
          analysis.recommendation.confidence > 70 ? 'border-green-500/30' :
          analysis.recommendation.confidence > 40 ? 'border-yellow-500/30' :
          'border-gray-500/30'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {analysis.recommendation.confidence > 70 ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                 analysis.recommendation.confidence > 40 ? <AlertTriangle className="w-4 h-4 text-yellow-400" /> :
                 <AlertTriangle className="w-4 h-4 text-gray-400" />}
                {analysis.recommendation.action}
              </div>
              <div className="text-xs text-gray-300 mt-1">
                {analysis.recommendation.reason}
              </div>
              <div className="text-xs text-gray-400 mt-2 space-y-1">
                <div>{analysis.recommendation.entry}</div>
                <div>{analysis.recommendation.target}</div>
                <div>{analysis.recommendation.stopLoss}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">신뢰도</div>
              <div className={`text-lg font-bold ${
                analysis.recommendation.confidence > 70 ? 'text-green-400' :
                analysis.recommendation.confidence > 40 ? 'text-yellow-400' :
                'text-gray-400'
              }`}>
                {analysis.recommendation.confidence}%
              </div>
            </div>
          </div>
        </div>

        {/* MA 활용법 */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
          <div className="text-sm text-purple-400 mb-1">MA/EMA 활용법</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• 완벽한 정렬: 강한 추세 → 추세 추종</div>
            <div>• 골든크로스: 상승 전환 → 매수 신호</div>
            <div>• 데드크로스: 하락 전환 → 매도 신호</div>
            <div>• MA 지지: 가격이 MA 위 → 상승 지속</div>
            <div>• MA 저항: 가격이 MA 아래 → 하락 지속</div>
            <div>• EMA가 MA보다 빠른 반응</div>
          </div>
        </div>
      </div>
    </div>
  )
}