'use client'

import { MomentumData, CoinData } from '../MomentumModule'
import { useEffect, useState } from 'react'

interface SignalGeneratorProps {
  momentumData: MomentumData | null
  coinData: CoinData | null
}

interface Signal {
  type: 'buy' | 'sell' | 'hold'
  strength: 'strong' | 'medium' | 'weak'
  reason: string
  confidence: number
}

export default function SignalGenerator({ momentumData, coinData }: SignalGeneratorProps) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [mainSignal, setMainSignal] = useState<Signal | null>(null)

  useEffect(() => {
    if (!momentumData || !coinData) return

    const newSignals: Signal[] = []

    // RSI 신호
    if (momentumData.rsi < 30) {
      newSignals.push({
        type: 'buy',
        strength: momentumData.rsi < 20 ? 'strong' : 'medium',
        reason: 'RSI 과매도 구간',
        confidence: momentumData.rsi < 20 ? 85 : 70
      })
    } else if (momentumData.rsi > 70) {
      newSignals.push({
        type: 'sell',
        strength: momentumData.rsi > 80 ? 'strong' : 'medium',
        reason: 'RSI 과매수 구간',
        confidence: momentumData.rsi > 80 ? 85 : 70
      })
    }

    // MACD 신호
    if (momentumData.macd.histogram > 0 && momentumData.macd.macd > momentumData.macd.signal) {
      newSignals.push({
        type: 'buy',
        strength: 'medium',
        reason: 'MACD 골든 크로스',
        confidence: 75
      })
    } else if (momentumData.macd.histogram < 0 && momentumData.macd.macd < momentumData.macd.signal) {
      newSignals.push({
        type: 'sell',
        strength: 'medium',
        reason: 'MACD 데드 크로스',
        confidence: 75
      })
    }

    // Stochastic 신호
    if (momentumData.stochastic.k < 20 && momentumData.stochastic.d < 20) {
      newSignals.push({
        type: 'buy',
        strength: 'medium',
        reason: 'Stochastic 과매도',
        confidence: 65
      })
    } else if (momentumData.stochastic.k > 80 && momentumData.stochastic.d > 80) {
      newSignals.push({
        type: 'sell',
        strength: 'medium',
        reason: 'Stochastic 과매수',
        confidence: 65
      })
    }

    // 모멘텀 스코어 기반 신호
    if (momentumData.momentumScore > 75) {
      newSignals.push({
        type: 'buy',
        strength: 'strong',
        reason: '강한 상승 모멘텀',
        confidence: 80
      })
    } else if (momentumData.momentumScore < 25) {
      newSignals.push({
        type: 'sell',
        strength: 'strong',
        reason: '강한 하락 모멘텀',
        confidence: 80
      })
    }

    setSignals(newSignals)

    // 메인 신호 결정 (가장 높은 신뢰도)
    if (newSignals.length > 0) {
      const sorted = newSignals.sort((a, b) => b.confidence - a.confidence)
      setMainSignal(sorted[0])
    } else {
      setMainSignal({
        type: 'hold',
        strength: 'weak',
        reason: '명확한 신호 없음',
        confidence: 50
      })
    }
  }, [momentumData, coinData])

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-green-400'
      case 'sell': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getSignalBg = (type: string) => {
    switch (type) {
      case 'buy': return 'bg-green-900/20 border-green-800/30'
      case 'sell': return 'bg-red-900/20 border-red-800/30'
      default: return 'bg-yellow-900/20 border-yellow-800/30'
    }
  }

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy': return '🟢'
      case 'sell': return '🔴'
      default: return '⚪'
    }
  }

  const getActionText = (type: string, strength: string) => {
    if (type === 'buy') {
      return strength === 'strong' ? '적극 매수' : strength === 'medium' ? '매수 고려' : '소량 매수'
    } else if (type === 'sell') {
      return strength === 'strong' ? '적극 매도' : strength === 'medium' ? '매도 고려' : '부분 매도'
    }
    return '관망'
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6">트레이딩 신호</h2>

      {/* 메인 신호 */}
      {mainSignal && (
        <div className={`mb-6 p-4 rounded-lg border ${getSignalBg(mainSignal.type)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getSignalIcon(mainSignal.type)}</span>
              <div>
                <h3 className={`text-lg font-bold ${getSignalColor(mainSignal.type)}`}>
                  {getActionText(mainSignal.type, mainSignal.strength)}
                </h3>
                <p className="text-sm text-gray-400">{mainSignal.reason}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">신뢰도</p>
              <p className="text-2xl font-bold text-white">{mainSignal.confidence}%</p>
            </div>
          </div>
          
          {/* 신뢰도 바 */}
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                mainSignal.type === 'buy' ? 'bg-green-500' :
                mainSignal.type === 'sell' ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${mainSignal.confidence}%` }}
            />
          </div>
        </div>
      )}

      {/* 모든 신호 목록 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400">활성 신호 ({signals.length})</h3>
        {signals.length > 0 ? (
          signals.map((signal, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{getSignalIcon(signal.type)}</span>
                <div>
                  <p className={`text-sm font-medium ${getSignalColor(signal.type)}`}>
                    {signal.type === 'buy' ? '매수' : signal.type === 'sell' ? '매도' : '홀드'}
                  </p>
                  <p className="text-xs text-gray-500">{signal.reason}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">강도</p>
                  <p className="text-sm font-medium text-white">
                    {signal.strength === 'strong' ? '강함' : 
                     signal.strength === 'medium' ? '보통' : '약함'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">신뢰도</p>
                  <p className="text-sm font-bold text-white">{signal.confidence}%</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <p className="text-gray-400">현재 활성화된 신호가 없습니다</p>
          </div>
        )}
      </div>

      {/* 신호 요약 */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-green-900/20 rounded-lg p-3 text-center border border-green-800/30">
          <p className="text-xs text-green-400 mb-1">매수 신호</p>
          <p className="text-2xl font-bold text-white">
            {signals.filter(s => s.type === 'buy').length}
          </p>
        </div>
        <div className="bg-red-900/20 rounded-lg p-3 text-center border border-red-800/30">
          <p className="text-xs text-red-400 mb-1">매도 신호</p>
          <p className="text-2xl font-bold text-white">
            {signals.filter(s => s.type === 'sell').length}
          </p>
        </div>
        <div className="bg-yellow-900/20 rounded-lg p-3 text-center border border-yellow-800/30">
          <p className="text-xs text-yellow-400 mb-1">평균 신뢰도</p>
          <p className="text-2xl font-bold text-white">
            {signals.length > 0 
              ? Math.round(signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length)
              : 0}%
          </p>
        </div>
      </div>
    </div>
  )
}