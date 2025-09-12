'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface Coin {
  symbol: string
  name: string
  color: string
  initialPrice: number
}

interface MarketData {
  price: number
  zScore: number
  rsi: number
  upperBand: number
  lowerBand: number
  sma20: number
  sma50: number
  sma200: number
}

interface TradingSignalsProps {
  coin?: Coin | null
  marketData: MarketData | null
  priceHistory?: any[]
  loading?: boolean
}

interface Signal {
  type: 'BUY' | 'SELL' | 'HOLD'
  strength: number
  reason: string
  entry: number
  target: number
  stopLoss: number
  riskReward: number
}

export default function TradingSignals({ coin, marketData, priceHistory, loading }: TradingSignalsProps) {
  const [signal, setSignal] = useState<Signal | null>(null)
  const [signalHistory, setSignalHistory] = useState<any[]>([])

  useEffect(() => {
    if (!marketData) return

    // 신호 분석
    let type: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
    let strength = 0
    let reason = ''
    
    // 매수 신호 조건
    if (marketData.zScore < -2 && marketData.rsi < 30) {
      type = 'BUY'
      strength = 90
      reason = '강한 과매도 + Z-Score 극단'
    } else if (marketData.price < marketData.lowerBand && marketData.rsi < 40) {
      type = 'BUY'
      strength = 75
      reason = '볼린저 하단 이탈 + RSI 과매도'
    } else if (marketData.zScore < -1 && marketData.price < marketData.sma20) {
      type = 'BUY'
      strength = 60
      reason = 'Z-Score 음수 + 20일선 하회'
    }
    // 매도 신호 조건
    else if (marketData.zScore > 2 && marketData.rsi > 70) {
      type = 'SELL'
      strength = 90
      reason = '강한 과매수 + Z-Score 극단'
    } else if (marketData.price > marketData.upperBand && marketData.rsi > 60) {
      type = 'SELL'
      strength = 75
      reason = '볼린저 상단 이탈 + RSI 과매수'
    } else if (marketData.zScore > 1 && marketData.price > marketData.sma20 * 1.05) {
      type = 'SELL'
      strength = 60
      reason = 'Z-Score 양수 + 20일선 5% 이상'
    }
    // 홀드
    else {
      type = 'HOLD'
      strength = 50
      reason = '평균회귀 대기'
    }

    // 목표가 및 손절선 계산
    const entry = marketData.price
    const target = type === 'BUY' 
      ? marketData.sma20 
      : type === 'SELL' 
      ? marketData.sma20 
      : entry
    const stopLoss = type === 'BUY'
      ? entry * 0.97
      : type === 'SELL'
      ? entry * 1.03
      : entry
    const riskReward = Math.abs((target - entry) / (entry - stopLoss))

    const newSignal = { type, strength, reason, entry, target, stopLoss, riskReward }
    setSignal(newSignal)

    // 신호 히스토리 업데이트
    if (type !== 'HOLD') {
      setSignalHistory(prev => [...prev.slice(-9), {
        time: new Date().toLocaleTimeString('ko-KR'),
        ...newSignal
      }])
    }
  }, [marketData])

  if (!signal) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-gray-700 rounded"></div>
      </div>
    )
  }

  const signalColor = signal.type === 'BUY' ? 'green' : signal.type === 'SELL' ? 'red' : 'yellow'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">트레이딩 시그널</h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">신호 강도</span>
          <div className="w-32 bg-gray-700 rounded-full h-2">
            <motion.div 
              className={`h-2 rounded-full bg-gradient-to-r ${
                signal.type === 'BUY' ? 'from-green-500 to-green-400' :
                signal.type === 'SELL' ? 'from-red-500 to-red-400' :
                'from-yellow-500 to-yellow-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${signal.strength}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className={`text-${signalColor}-400 font-bold`}>{signal.strength}%</span>
        </div>
      </div>

      {/* 메인 신호 */}
      <div className={`bg-gradient-to-r ${
        signal.type === 'BUY' ? 'from-green-900/30 to-green-800/30 border-green-700/50' :
        signal.type === 'SELL' ? 'from-red-900/30 to-red-800/30 border-red-700/50' :
        'from-yellow-900/30 to-yellow-800/30 border-yellow-700/50'
      } rounded-xl p-6 border mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`text-4xl font-bold text-${signalColor}-400`}>
              {signal.type === 'BUY' ? '↑' : signal.type === 'SELL' ? '↓' : '→'}
            </div>
            <div>
              <div className={`text-2xl font-bold text-${signalColor}-400`}>
                {signal.type === 'BUY' ? '매수' : signal.type === 'SELL' ? '매도' : '대기'}
              </div>
              <div className="text-sm text-gray-400">{signal.reason}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">진입가</div>
            <div className="text-white font-bold">
              ${safeFixed(signal.entry, 2)}
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">목표가</div>
            <div className="text-green-400 font-bold">
              ${safeFixed(signal.target, 2)}
            </div>
            <div className="text-xs text-gray-500">
              {((signal.target - signal.entry) / signal.entry * 100).toFixed(2)}%
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">손절가</div>
            <div className="text-red-400 font-bold">
              ${safeFixed(signal.stopLoss, 2)}
            </div>
            <div className="text-xs text-gray-500">
              {((signal.stopLoss - signal.entry) / signal.entry * 100).toFixed(2)}%
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">손익비</div>
            <div className={`font-bold ${
              signal.riskReward >= 2 ? 'text-green-400' :
              signal.riskReward >= 1 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              1:{safeFixed(signal.riskReward, 1)}
            </div>
          </div>
        </div>
      </div>

      {/* 포지션 크기 계산기 */}
      <div className="bg-black/30 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-3">권장 포지션 크기</h4>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="text-center">
            <div className="text-gray-500">안정적</div>
            <div className="text-white font-bold">자본의 5%</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">표준</div>
            <div className="text-yellow-400 font-bold">자본의 10%</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">공격적</div>
            <div className="text-orange-400 font-bold">자본의 15%</div>
          </div>
        </div>
      </div>

      {/* 신호 히스토리 */}
      {signalHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">최근 신호 히스토리</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {signalHistory.map((hist, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-black/20 rounded px-2 py-1">
                <span className="text-gray-500">{hist.time}</span>
                <span className={`font-medium text-${
                  hist.type === 'BUY' ? 'green' : 'red'
                }-400`}>
                  {hist.type}
                </span>
                <span className="text-gray-400">{hist.strength}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}