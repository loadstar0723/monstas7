'use client'

import { MomentumData } from '../MomentumModule'
import { useEffect, useState } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface TrendStrengthProps {
  momentumData: MomentumData | null
  priceHistory: any[]
}

export default function TrendStrength({ momentumData, priceHistory }: TrendStrengthProps) {
  const [ema20, setEma20] = useState(0)
  const [ema50, setEma50] = useState(0)
  const [ema200, setEma200] = useState(0)
  const [adx, setAdx] = useState(0)
  const [trendDirection, setTrendDirection] = useState<'up' | 'down' | 'sideways'>('sideways')

  useEffect(() => {
    if (priceHistory.length < 20) return

    // EMA 계산
    const calculateEMA = (data: number[], period: number): number => {
      if (data.length < period) return data[data.length - 1]
      const multiplier = 2 / (period + 1)
      let ema = data.slice(0, period).reduce((a, b) => a + b) / period
      for (let i = period; i < data.length; i++) {
        ema = (data[i] - ema) * multiplier + ema
      }
      return ema
    }

    const closes = priceHistory.map(d => d.close)
    
    if (closes.length >= 20) {
      setEma20(calculateEMA(closes, 20))
    }
    if (closes.length >= 50) {
      setEma50(calculateEMA(closes, 50))
    }
    if (closes.length >= 200) {
      setEma200(calculateEMA(closes, 200))
    }

    // ADX 간단 계산 (정확도보다 트렌드 강도 표시에 중점)
    const calculateSimpleADX = () => {
      if (priceHistory.length < 14) return 0
      
      const highs = priceHistory.slice(-14).map(d => d.high)
      const lows = priceHistory.slice(-14).map(d => d.low)
      const closes = priceHistory.slice(-14).map(d => d.close)
      
      let plusDM = 0
      let minusDM = 0
      let tr = 0
      
      for (let i = 1; i < 14; i++) {
        const highDiff = highs[i] - highs[i - 1]
        const lowDiff = lows[i - 1] - lows[i]
        
        if (highDiff > lowDiff && highDiff > 0) plusDM += highDiff
        if (lowDiff > highDiff && lowDiff > 0) minusDM += lowDiff
        
        const trueRange = Math.max(
          highs[i] - lows[i],
          Math.abs(highs[i] - closes[i - 1]),
          Math.abs(lows[i] - closes[i - 1])
        )
        tr += trueRange
      }
      
      const plusDI = (plusDM / tr) * 100
      const minusDI = (minusDM / tr) * 100
      const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100
      
      return dx
    }

    setAdx(calculateSimpleADX())

    // 트렌드 방향 결정
    const currentPrice = priceHistory[priceHistory.length - 1]?.close
    if (currentPrice > ema20 && ema20 > ema50) {
      setTrendDirection('up')
    } else if (currentPrice < ema20 && ema20 < ema50) {
      setTrendDirection('down')
    } else {
      setTrendDirection('sideways')
    }
  }, [priceHistory])

  const getTrendStrengthText = (adx: number) => {
    if (adx > 50) return '매우 강한 추세'
    if (adx > 25) return '강한 추세'
    if (adx > 15) return '약한 추세'
    return '추세 없음'
  }

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6">추세 강도 분석</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 추세 방향 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">추세 방향</h3>
          <div className="flex items-center gap-3">
            <div className={`text-4xl ${getTrendColor(trendDirection)}`}>
              {trendDirection === 'up' ? '⬆️' : trendDirection === 'down' ? '⬇️' : '➡️'}
            </div>
            <div>
              <p className={`text-lg font-bold ${getTrendColor(trendDirection)}`}>
                {trendDirection === 'up' ? '상승 추세' : trendDirection === 'down' ? '하락 추세' : '횡보'}
              </p>
              <p className="text-xs text-gray-500">
                모멘텀: {momentumData?.trend === 'strong_bullish' ? '매우 강함' :
                        momentumData?.trend === 'bullish' ? '강함' :
                        momentumData?.trend === 'bearish' ? '약함' :
                        momentumData?.trend === 'strong_bearish' ? '매우 약함' : '중립'}
              </p>
            </div>
          </div>
        </div>

        {/* ADX 지표 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">ADX (추세 강도)</h3>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-2xl font-bold text-white">{safeFixed(adx, 1)}</span>
            <span className="text-gray-500 text-sm mb-1">/100</span>
          </div>
          <p className={`text-sm ${adx > 25 ? 'text-green-400' : 'text-yellow-400'}`}>
            {getTrendStrengthText(adx)}
          </p>
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                adx > 50 ? 'bg-purple-500' :
                adx > 25 ? 'bg-blue-500' :
                adx > 15 ? 'bg-yellow-500' : 'bg-gray-500'
              }`}
              style={{ width: `${adx}%` }}
            />
          </div>
        </div>

        {/* 이동평균 상태 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">이동평균 (EMA)</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">EMA 20</span>
              <span className="text-sm font-semibold text-white">
                ${safeFixed(ema20, 2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">EMA 50</span>
              <span className="text-sm font-semibold text-white">
                ${safeFixed(ema50, 2)}
              </span>
            </div>
            {priceHistory.length >= 200 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">EMA 200</span>
                <span className="text-sm font-semibold text-white">
                  ${safeFixed(ema200, 2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 추세 신호 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/30">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">골든/데드 크로스</h4>
          <p className="text-sm text-gray-300">
            {ema20 > ema50 ? '🟢 골든 크로스 - 상승 신호' : 
             ema20 < ema50 ? '🔴 데드 크로스 - 하락 신호' : '⚪ 크로스 대기'}
          </p>
        </div>
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/30">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">추세 전략</h4>
          <p className="text-sm text-gray-300">
            {adx > 25 && trendDirection === 'up' ? '📈 추세 추종 매수' :
             adx > 25 && trendDirection === 'down' ? '📉 추세 추종 매도' :
             adx < 15 ? '⚠️ 박스권 - 단타 전략' : '🔄 관망'}
          </p>
        </div>
      </div>
    </div>
  )
}