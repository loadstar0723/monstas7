'use client'

import { useState, useEffect } from 'react'
import { FaBell, FaArrowUp, FaArrowDown, FaChartLine, FaClock } from 'react-icons/fa'

interface PinBarSignalsProps {
  symbol: string
  timeframe: string
  currentPrice: number
}

export default function PinBarSignals({ symbol, timeframe, currentPrice }: PinBarSignalsProps) {
  const [signals, setSignals] = useState<any[]>([])
  const [activeSignal, setActiveSignal] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSignals = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=${timeframe}&limit=50`)
        const data = await response.json()
        
        // 시그널 생성 로직
        const newSignals = []
        if (Array.isArray(data) && data.length > 0) {
          const latestCandle = data[data.length - 1]
          const open = parseFloat(latestCandle[1])
          const high = parseFloat(latestCandle[2])
          const low = parseFloat(latestCandle[3])
          const close = parseFloat(latestCandle[4])
          
          // 간단한 핀 바 시그널 감지
          const body = Math.abs(close - open)
          const range = high - low
          const bodyRatio = range > 0 ? (body / range) * 100 : 0
          
          if (bodyRatio <= 30) {
            const upperWick = high - Math.max(open, close)
            const lowerWick = Math.min(open, close) - low
            const upperRatio = range > 0 ? (upperWick / range) * 100 : 0
            const lowerRatio = range > 0 ? (lowerWick / range) * 100 : 0
            
            if (lowerRatio >= 60) {
              newSignals.push({
                type: 'bullish',
                price: close,
                time: new Date().toLocaleTimeString('ko-KR'),
                strength: Math.min(100, lowerRatio * 1.2),
                action: 'BUY',
                stopLoss: low - (range * 0.1),
                takeProfit: close + (range * 2)
              })
            } else if (upperRatio >= 60) {
              newSignals.push({
                type: 'bearish',
                price: close,
                time: new Date().toLocaleTimeString('ko-KR'),
                strength: Math.min(100, upperRatio * 1.2),
                action: 'SELL',
                stopLoss: high + (range * 0.1),
                takeProfit: close - (range * 2)
              })
            }
          }
        }
        
        setSignals(newSignals)
        if (newSignals.length > 0) {
          setActiveSignal(newSignals[0])
        }
      } catch (error) {
        console.error('시그널 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadSignals()
    const interval = setInterval(loadSignals, 30000)
    return () => clearInterval(interval)
  }, [symbol, timeframe])

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-3"></div>
          <p className="text-gray-400">시그널 분석 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">🔔 핀 바 트레이딩 시그널</h3>
        
        {activeSignal ? (
          <div className={`rounded-lg p-4 ${
            activeSignal.type === 'bullish' 
              ? 'bg-green-900/30 border border-green-500/50' 
              : 'bg-red-900/30 border border-red-500/50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {activeSignal.type === 'bullish' ? (
                  <FaArrowUp className="text-green-400 text-xl" />
                ) : (
                  <FaArrowDown className="text-red-400 text-xl" />
                )}
                <span className={`text-xl font-bold ${
                  activeSignal.type === 'bullish' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {activeSignal.action} 시그널
                </span>
              </div>
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <FaClock className="text-xs" />
                {activeSignal.time}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-900/50 rounded-lg p-2">
                <p className="text-gray-400 text-xs mb-1">진입가</p>
                <p className="text-white font-bold">${activeSignal.price.toFixed(2)}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-2">
                <p className="text-gray-400 text-xs mb-1">손절가</p>
                <p className="text-red-400 font-bold">${activeSignal.stopLoss.toFixed(2)}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-2">
                <p className="text-gray-400 text-xs mb-1">목표가</p>
                <p className="text-green-400 font-bold">${activeSignal.takeProfit.toFixed(2)}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-2">
                <p className="text-gray-400 text-xs mb-1">신호 강도</p>
                <p className="text-purple-400 font-bold">{activeSignal.strength.toFixed(0)}%</p>
              </div>
            </div>
            
            <div className="mt-3 bg-gray-900/50 rounded-lg p-2">
              <p className="text-gray-400 text-xs mb-1">리스크/수익 비율</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full" style={{width: '66%'}}></div>
                </div>
                <span className="text-white text-sm font-medium">1:2</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-lg p-6 text-center">
            <FaBell className="text-gray-500 text-3xl mx-auto mb-3" />
            <p className="text-gray-400">현재 활성 시그널이 없습니다</p>
            <p className="text-gray-500 text-sm mt-1">핀 바 패턴 형성 시 자동으로 시그널이 생성됩니다</p>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h4 className="text-sm font-bold text-gray-400 mb-3">시그널 대기열</h4>
        {signals.length > 0 ? (
          <div className="space-y-2">
            {signals.map((signal, index) => (
              <div 
                key={index}
                className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 hover:border-purple-500/50 transition cursor-pointer"
                onClick={() => setActiveSignal(signal)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {signal.type === 'bullish' ? (
                      <FaArrowUp className="text-green-400 text-sm" />
                    ) : (
                      <FaArrowDown className="text-red-400 text-sm" />
                    )}
                    <span className={`text-sm font-medium ${
                      signal.type === 'bullish' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {signal.action}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">{signal.time}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center text-sm">대기 중인 시그널이 없습니다</p>
        )}
      </div>
    </div>
  )
}