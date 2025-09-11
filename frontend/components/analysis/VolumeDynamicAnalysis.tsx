'use client'

import React, { useMemo } from 'react'
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface VolumeDynamicAnalysisProps {
  volume: number
  obv: number
  mfi: number
  cmf: number
  historicalVolumes: number[]
  historicalOBV: number[]
  historicalPrices: number[]
  price: number
}

export default function VolumeDynamicAnalysis({ 
  volume,
  obv,
  mfi,
  cmf,
  historicalVolumes,
  historicalOBV,
  historicalPrices,
  price
}: VolumeDynamicAnalysisProps) {
  
  const analysis = useMemo(() => {
    // 거래량 분석
    const analyzeVolume = () => {
      if (!historicalVolumes || historicalVolumes.length < 20) return { trend: 'neutral', strength: 'normal' }
      
      const avgVolume20 = historicalVolumes.slice(-20).reduce((a, b) => a + b, 0) / 20
      const avgVolume50 = historicalVolumes.length >= 50 ?
        historicalVolumes.slice(-50).reduce((a, b) => a + b, 0) / 50 : avgVolume20
      
      const volumeRatio = volume / avgVolume20
      
      // 거래량 급증/급감 감지
      const volumeStatus = 
        volumeRatio > 3 ? { level: '폭발적 증가', signal: 'EXTREME_HIGH', color: 'text-red-400' } :
        volumeRatio > 2 ? { level: '대량 거래', signal: 'VERY_HIGH', color: 'text-orange-400' } :
        volumeRatio > 1.5 ? { level: '거래 활발', signal: 'HIGH', color: 'text-yellow-400' } :
        volumeRatio > 0.8 ? { level: '평균 수준', signal: 'NORMAL', color: 'text-gray-400' } :
        volumeRatio > 0.5 ? { level: '거래 감소', signal: 'LOW', color: 'text-blue-400' } :
        { level: '거래 침체', signal: 'VERY_LOW', color: 'text-purple-400' }
      
      // 거래량 추세
      const volumeTrend = avgVolume20 > avgVolume50 ? 'increasing' : 'decreasing'
      
      return {
        ratio: volumeRatio,
        status: volumeStatus,
        trend: volumeTrend,
        avg20: avgVolume20,
        avg50: avgVolume50
      }
    }
    
    const volumeAnalysis = analyzeVolume()
    
    // OBV 다이버전스 감지
    const detectOBVDivergence = () => {
      if (historicalOBV.length < 20 || historicalPrices.length < 20) return null
      
      const recentOBV = historicalOBV.slice(-20)
      const recentPrices = historicalPrices.slice(-20)
      
      // OBV 추세
      const obvTrend = obv > recentOBV[0] ? 'rising' : 'falling'
      const priceTrend = price > recentPrices[0] ? 'rising' : 'falling'
      
      // 다이버전스 감지
      if (priceTrend === 'falling' && obvTrend === 'rising') {
        return {
          type: 'bullish',
          message: '강세 다이버전스! OBV 상승 중 - 축적 진행',
          strength: 'strong'
        }
      }
      
      if (priceTrend === 'rising' && obvTrend === 'falling') {
        return {
          type: 'bearish',
          message: '약세 다이버전스! OBV 하락 중 - 분산 진행',
          strength: 'strong'
        }
      }
      
      // OBV 선행
      const obvChange = ((obv - recentOBV[0]) / Math.abs(recentOBV[0])) * 100
      const priceChange = ((price - recentPrices[0]) / recentPrices[0]) * 100
      
      if (Math.abs(obvChange) > Math.abs(priceChange) * 1.5) {
        return {
          type: obvChange > 0 ? 'bullish_leading' : 'bearish_leading',
          message: obvChange > 0 ? 
            'OBV 선행 상승 - 가격 상승 예상' : 
            'OBV 선행 하락 - 가격 하락 예상',
          strength: 'moderate'
        }
      }
      
      return null
    }
    
    const obvDivergence = detectOBVDivergence()
    
    // MFI 분석 (자금 흐름)
    const analyzeMFI = () => {
      const mfiZone = 
        mfi > 80 ? { zone: '과매수', signal: 'OVERBOUGHT', color: 'text-red-400' } :
        mfi > 70 ? { zone: '매도 구간', signal: 'SELL_ZONE', color: 'text-orange-400' } :
        mfi > 50 ? { zone: '강세', signal: 'BULLISH', color: 'text-green-400' } :
        mfi > 30 ? { zone: '약세', signal: 'BEARISH', color: 'text-yellow-400' } :
        mfi > 20 ? { zone: '매수 구간', signal: 'BUY_ZONE', color: 'text-blue-400' } :
        { zone: '과매도', signal: 'OVERSOLD', color: 'text-purple-400' }
      
      return mfiZone
    }
    
    const mfiAnalysis = analyzeMFI()
    
    // CMF 분석 (차이킨 머니 플로우)
    const analyzeCMF = () => {
      const cmfSignal = 
        cmf > 0.25 ? { signal: '강한 매수압력', strength: 'very_strong', color: 'text-green-500' } :
        cmf > 0.05 ? { signal: '매수 우세', strength: 'strong', color: 'text-green-400' } :
        cmf > -0.05 ? { signal: '중립', strength: 'neutral', color: 'text-gray-400' } :
        cmf > -0.25 ? { signal: '매도 우세', strength: 'strong', color: 'text-red-400' } :
        { signal: '강한 매도압력', strength: 'very_strong', color: 'text-red-500' }
      
      return cmfSignal
    }
    
    const cmfAnalysis = analyzeCMF()
    
    // 거래량 가격 분석 (VPA)
    const analyzeVolumePrice = () => {
      if (historicalVolumes.length < 5 || historicalPrices.length < 5) return null
      
      const recentVolumes = historicalVolumes.slice(-5)
      const recentPrices = historicalPrices.slice(-5)
      
      const avgRecentVolume = recentVolumes.reduce((a, b) => a + b, 0) / 5
      const priceUp = price > recentPrices[0]
      const volumeUp = volume > avgRecentVolume
      
      // VSA (Volume Spread Analysis) 패턴
      if (priceUp && volumeUp) {
        return { pattern: '상승 + 거래량 증가', signal: '강세 지속', confidence: 80 }
      }
      if (priceUp && !volumeUp) {
        return { pattern: '상승 + 거래량 감소', signal: '상승 약화', confidence: 60 }
      }
      if (!priceUp && volumeUp) {
        return { pattern: '하락 + 거래량 증가', signal: '매도 압력', confidence: 75 }
      }
      if (!priceUp && !volumeUp) {
        return { pattern: '하락 + 거래량 감소', signal: '바닥 근처', confidence: 65 }
      }
      
      return null
    }
    
    const vpa = analyzeVolumePrice()
    
    // 트레이딩 제안
    const getTradingSuggestion = () => {
      // OBV 다이버전스 우선
      if (obvDivergence?.type === 'bullish') {
        return {
          action: '축적 구간 매수',
          reason: obvDivergence.message,
          indicators: `MFI: ${mfi.toFixed(1)}, CMF: ${cmf.toFixed(3)}`,
          entry: `현재가: ${price.toFixed(2)} USDT`,
          target: `+5-8% (${(price * 1.06).toFixed(2)} USDT)`,
          stopLoss: `${(price * 0.97).toFixed(2)} USDT (-3%)`,
          confidence: 75
        }
      }
      
      if (obvDivergence?.type === 'bearish') {
        return {
          action: '분산 구간 매도',
          reason: obvDivergence.message,
          indicators: `MFI: ${mfi.toFixed(1)}, CMF: ${cmf.toFixed(3)}`,
          entry: '포지션 정리',
          target: `-5-8% (${(price * 0.94).toFixed(2)} USDT)`,
          stopLoss: `${(price * 1.03).toFixed(2)} USDT (+3%)`,
          confidence: 70
        }
      }
      
      // MFI 극단값
      if (mfi < 20 && cmf > 0) {
        return {
          action: '과매도 매수',
          reason: 'MFI 과매도 + 긍정적 자금흐름',
          indicators: `거래량 비율: ${volumeAnalysis.ratio.toFixed(2)}x`,
          entry: `현재가: ${price.toFixed(2)} USDT`,
          target: `중단기 +10% (${(price * 1.1).toFixed(2)} USDT)`,
          stopLoss: `${(price * 0.95).toFixed(2)} USDT (-5%)`,
          confidence: 80
        }
      }
      
      if (mfi > 80 && cmf < 0) {
        return {
          action: '과매수 매도',
          reason: 'MFI 과매수 + 부정적 자금흐름',
          indicators: `거래량 비율: ${volumeAnalysis.ratio.toFixed(2)}x`,
          entry: '단계적 익절',
          target: `조정 -5-10%`,
          stopLoss: `${(price * 1.05).toFixed(2)} USDT (+5%)`,
          confidence: 75
        }
      }
      
      // 거래량 급증
      if (volumeAnalysis.status.signal === 'EXTREME_HIGH') {
        return {
          action: '변동성 대비',
          reason: `거래량 ${volumeAnalysis.ratio.toFixed(1)}배 급증`,
          indicators: vpa ? vpa.signal : '패턴 분석 중',
          entry: '관망 또는 분할 진입',
          target: '단기 ±5-10%',
          stopLoss: '타이트한 손절 설정',
          confidence: vpa ? vpa.confidence : 60
        }
      }
      
      return {
        action: '중립 관망',
        reason: '명확한 거래량 신호 없음',
        indicators: `정상 거래량 (${volumeAnalysis.ratio.toFixed(2)}x)`,
        entry: '추가 신호 대기',
        target: '설정 없음',
        stopLoss: '포지션 없음',
        confidence: 50
      }
    }
    
    const suggestion = getTradingSuggestion()
    
    return {
      volumeAnalysis,
      obvDivergence,
      mfiAnalysis,
      cmfAnalysis,
      vpa,
      suggestion
    }
  }, [volume, obv, mfi, cmf, historicalVolumes, historicalOBV, historicalPrices, price])

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📊 거래량 실시간 분석
          <BarChart3 className="w-4 h-4 text-purple-400" />
        </h3>
        <div className={`text-lg font-bold ${analysis.volumeAnalysis.status.color}`}>
          {analysis.volumeAnalysis.status.level}
        </div>
      </div>

      <div className="space-y-3">
        {/* 거래량 상태 */}
        <div className="bg-gray-800/50 rounded p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">거래량 비율</span>
            <span className={`text-lg font-bold ${analysis.volumeAnalysis.status.color}`}>
              {analysis.volumeAnalysis.ratio.toFixed(2)}x
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                analysis.volumeAnalysis.ratio > 2 ? 'bg-red-500' :
                analysis.volumeAnalysis.ratio > 1.5 ? 'bg-orange-500' :
                analysis.volumeAnalysis.ratio > 1 ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}
              style={{ width: `${Math.min(100, analysis.volumeAnalysis.ratio * 33)}%` }}
            />
          </div>
        </div>

        {/* 4대 지표 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">OBV 추세</div>
            <div className="flex items-center gap-1">
              {obv > 0 ? 
                <TrendingUp className="w-3 h-3 text-green-400" /> :
                <TrendingDown className="w-3 h-3 text-red-400" />
              }
              <span className="text-sm font-bold text-gray-300">
                {obv > 0 ? '상승' : '하락'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MFI</div>
            <div className={`text-sm font-bold ${analysis.mfiAnalysis.color}`}>
              {mfi.toFixed(1)} ({analysis.mfiAnalysis.zone})
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">CMF</div>
            <div className={`text-sm font-bold ${analysis.cmfAnalysis.color}`}>
              {cmf.toFixed(3)}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">자금흐름</div>
            <div className={`text-sm font-bold ${analysis.cmfAnalysis.color}`}>
              {analysis.cmfAnalysis.signal}
            </div>
          </div>
        </div>

        {/* OBV 다이버전스 알림 */}
        {analysis.obvDivergence && (
          <div className={`bg-${
            analysis.obvDivergence.type.includes('bullish') ? 'green' : 'red'
          }-900/20 border border-${
            analysis.obvDivergence.type.includes('bullish') ? 'green' : 'red'
          }-500/30 rounded p-3`}>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-white">
                {analysis.obvDivergence.message}
              </span>
            </div>
          </div>
        )}

        {/* 거래량-가격 분석 */}
        {analysis.vpa && (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
            <div className="text-sm text-purple-400 mb-1">거래량-가격 패턴</div>
            <div className="text-xs text-gray-300 space-y-1">
              <div>• 패턴: {analysis.vpa.pattern}</div>
              <div>• 신호: {analysis.vpa.signal}</div>
              <div>• 신뢰도: {analysis.vpa.confidence}%</div>
            </div>
          </div>
        )}

        {/* 거래량 통계 */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
          <div className="text-sm text-blue-400 mb-1">거래량 통계</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
            <div>• 20일 평균: {(analysis.volumeAnalysis.avg20 / 1000000).toFixed(2)}M</div>
            <div>• 50일 평균: {(analysis.volumeAnalysis.avg50 / 1000000).toFixed(2)}M</div>
            <div>• 현재: {(volume / 1000000).toFixed(2)}M</div>
            <div>• 추세: {analysis.volumeAnalysis.trend === 'increasing' ? '증가' : '감소'}</div>
          </div>
        </div>

        {/* 트레이딩 제안 */}
        <div className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 rounded p-3">
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
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-white">
                {analysis.suggestion.action}
              </span>
            </div>
            
            <div className="text-xs text-gray-400 space-y-1">
              <div>• 근거: {analysis.suggestion.reason}</div>
              <div>• 지표: {analysis.suggestion.indicators}</div>
              <div>• 진입: {analysis.suggestion.entry}</div>
              <div>• 목표: {analysis.suggestion.target}</div>
              <div>• 손절: {analysis.suggestion.stopLoss}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}