'use client'

import { useState, useEffect } from 'react'
import { FaBullseye, FaShieldAlt, FaTrophy } from 'react-icons/fa'

interface TradingSignalsProps {
  symbol: string
  currentPrice: number
}

export default function TradingSignals({ symbol, currentPrice }: TradingSignalsProps) {
  const [signal, setSignal] = useState({
    direction: 'NEUTRAL' as 'LONG' | 'SHORT' | 'NEUTRAL',
    confidence: 0,
    entry: 0,
    stopLoss: 0,
    target1: 0,
    target2: 0,
    target3: 0,
    riskReward: 0,
    leverage: 1
  })

  useEffect(() => {
    generateSignals()
    const interval = setInterval(generateSignals, 30000)
    return () => clearInterval(interval)
  }, [symbol, currentPrice])

  const generateSignals = async () => {
    try {
      const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=15m&limit=20`)
      const klines = await response.json()
      
      if (Array.isArray(klines) && klines.length > 0) {
        const prices = klines.map((k: any) => parseFloat(k[4]))
        const volumes = klines.map((k: any) => parseFloat(k[5]))
        
        // 간단한 추세 분석
        const sma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / 5
        const sma10 = prices.slice(-10).reduce((a, b) => a + b, 0) / 10
        const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length
        const recentVolume = volumes[volumes.length - 1]
        
        let direction: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL'
        let confidence = 50
        
        if (currentPrice > sma5 && sma5 > sma10 && recentVolume > avgVolume) {
          direction = 'LONG'
          confidence = Math.min(85, 60 + (recentVolume / avgVolume) * 10)
        } else if (currentPrice < sma5 && sma5 < sma10 && recentVolume > avgVolume) {
          direction = 'SHORT'
          confidence = Math.min(85, 60 + (recentVolume / avgVolume) * 10)
        }
        
        // 진입가, 손절가, 목표가 계산
        const atr = calculateATR(klines)
        const entry = currentPrice
        const stopLoss = direction === 'LONG' ? 
          entry - (atr * 2) : 
          entry + (atr * 2)
        const target1 = direction === 'LONG' ? 
          entry + (atr * 2) : 
          entry - (atr * 2)
        const target2 = direction === 'LONG' ? 
          entry + (atr * 3) : 
          entry - (atr * 3)
        const target3 = direction === 'LONG' ? 
          entry + (atr * 5) : 
          entry - (atr * 5)
        
        const risk = Math.abs(entry - stopLoss)
        const reward = Math.abs(target2 - entry)
        const riskReward = reward / risk
        
        // 레버리지 추천
        let leverage = 1
        if (confidence > 70) leverage = 3
        else if (confidence > 60) leverage = 2
        
        setSignal({
          direction,
          confidence,
          entry,
          stopLoss,
          target1,
          target2,
          target3,
          riskReward,
          leverage
        })
      }
    } catch (error) {
      console.error('시그널 생성 실패:', error)
    }
  }

  const calculateATR = (klines: any[]) => {
    const trs = klines.slice(1).map((k: any, i: number) => {
      const high = parseFloat(k[2])
      const low = parseFloat(k[3])
      const prevClose = parseFloat(klines[i][4])
      return Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose))
    })
    return trs.reduce((a, b) => a + b, 0) / trs.length
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">🎯 트레이딩 시그널</h3>
        
        <div className={`p-4 rounded-lg ${
          signal.direction === 'LONG' ? 'bg-green-900/30 border border-green-500/30' :
          signal.direction === 'SHORT' ? 'bg-red-900/30 border border-red-500/30' :
          'bg-gray-900/30 border border-gray-500/30'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaBullseye className={
                signal.direction === 'LONG' ? 'text-green-400' :
                signal.direction === 'SHORT' ? 'text-red-400' :
                'text-gray-400'
              } />
              <span className={`text-xl font-bold ${
                signal.direction === 'LONG' ? 'text-green-400' :
                signal.direction === 'SHORT' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {signal.direction}
              </span>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">신뢰도</p>
              <p className={`font-bold ${
                signal.confidence > 70 ? 'text-green-400' :
                signal.confidence > 50 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {signal.confidence}%
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900/50 rounded p-2">
              <p className="text-gray-400 text-xs mb-1">진입가</p>
              <p className="text-white font-medium">${signal.entry.toFixed(2)}</p>
            </div>
            <div className="bg-red-900/50 rounded p-2">
              <p className="text-gray-400 text-xs mb-1">손절가</p>
              <p className="text-red-400 font-medium">${signal.stopLoss.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-gray-400 text-sm mb-2">목표가</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">TP1</span>
              <span className="text-green-400 font-medium">${signal.target1.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">TP2</span>
              <span className="text-green-400 font-medium">${signal.target2.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">TP3</span>
              <span className="text-green-400 font-medium">${signal.target3.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-900/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaTrophy className="text-purple-400 text-sm" />
              <p className="text-purple-400 text-xs">R:R 비율</p>
            </div>
            <p className="text-white font-bold">1:{signal.riskReward.toFixed(1)}</p>
          </div>
          <div className="bg-blue-900/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaShieldAlt className="text-blue-400 text-sm" />
              <p className="text-blue-400 text-xs">권장 레버리지</p>
            </div>
            <p className="text-white font-bold">{signal.leverage}x</p>
          </div>
        </div>
      </div>
    </div>
  )
}