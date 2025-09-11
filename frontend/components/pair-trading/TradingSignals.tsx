'use client'

import { useState, useEffect, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'

interface TradingSignalsProps {
  pair: { coin1: string; coin2: string }
  strategy: string
  timeframe: string
}

interface Signal {
  type: 'LONG' | 'SHORT' | 'CLOSE' | 'HOLD'
  strength: number
  confidence: number
  reason: string
  timestamp: Date
}

export default function TradingSignals({ pair, strategy, timeframe }: TradingSignalsProps) {
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null)
  const [signalHistory, setSignalHistory] = useState<Signal[]>([])
  const [metrics, setMetrics] = useState({
    zScore: 0,
    spread: 0,
    correlation: 0,
    volatility: 0
  })
  const [loading, setLoading] = useState(true)
  const [autoExecute, setAutoExecute] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [realtimePrice1, setRealtimePrice1] = useState(0)
  const [realtimePrice2, setRealtimePrice2] = useState(0)
  const ws1Ref = useRef<WebSocket | null>(null)
  const ws2Ref = useRef<WebSocket | null>(null)

  useEffect(() => {
    const generateSignals = async () => {
      setLoading(true)
      try {
        // 두 코인의 가격 데이터 가져오기
        const [response1, response2] = await Promise.all([
          fetch(`/api/binance/klines?symbol=${pair.coin1}&interval=${timeframe}&limit=100`),
          fetch(`/api/binance/klines?symbol=${pair.coin2}&interval=${timeframe}&limit=100`)
        ])

        const data1 = await response1.json()
        const data2 = await response2.json()

        if (data1.data && data2.data) {
          // 메트릭 계산
          const prices1 = data1.data.map((k: any[]) => parseFloat(k[4]))
          const prices2 = data2.data.map((k: any[]) => parseFloat(k[4]))
          
          const spread = prices1[prices1.length - 1] / prices2[prices2.length - 1]
          const spreads = prices1.map((p1, i) => p1 / prices2[i])
          const mean = spreads.reduce((a, b) => a + b, 0) / spreads.length
          const stdDev = Math.sqrt(spreads.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / spreads.length)
          const zScore = (spread - mean) / stdDev
          
          // 변동성 계산
          const returns1 = prices1.slice(1).map((p, i) => (p - prices1[i]) / prices1[i])
          const volatility = Math.sqrt(returns1.reduce((sq, r) => sq + r * r, 0) / returns1.length) * Math.sqrt(252)
          
          // 상관관계 계산 (간단한 버전)
          const correlation = calculateCorrelation(prices1, prices2)

          setMetrics({
            zScore,
            spread,
            correlation,
            volatility
          })

          // 신호 생성 로직
          const signal = generateSignal(strategy, zScore, correlation, volatility)
          setCurrentSignal(signal)
          
          // 신호 히스토리 업데이트
          setSignalHistory(prev => [...prev.slice(-9), signal])
        }

        setLoading(false)
      } catch (error) {
        console.error('신호 생성 실패:', error)
        setLoading(false)
      }
    }

    generateSignals()
    const interval = setInterval(generateSignals, 30000) // 30초마다 업데이트
    
    // WebSocket 연결 설정
    if (typeof window !== 'undefined') {
      // 첫 번째 코인 WebSocket
      const ws1 = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.coin1.toLowerCase()}@ticker`)
      ws1.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setRealtimePrice1(parseFloat(data.c))
      }
      ws1Ref.current = ws1
      
      // 두 번째 코인 WebSocket
      const ws2 = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.coin2.toLowerCase()}@ticker`)
      ws2.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setRealtimePrice2(parseFloat(data.c))
      }
      ws2Ref.current = ws2
    }
    
    return () => {
      clearInterval(interval)
      if (ws1Ref.current) ws1Ref.current.close()
      if (ws2Ref.current) ws2Ref.current.close()
    }
  }, [pair, strategy, timeframe])

  const calculateCorrelation = (prices1: number[], prices2: number[]) => {
    const n = Math.min(prices1.length, prices2.length)
    const mean1 = prices1.reduce((a, b) => a + b, 0) / n
    const mean2 = prices2.reduce((a, b) => a + b, 0) / n
    
    let numerator = 0
    let denom1 = 0
    let denom2 = 0
    
    for (let i = 0; i < n; i++) {
      const d1 = prices1[i] - mean1
      const d2 = prices2[i] - mean2
      numerator += d1 * d2
      denom1 += d1 * d1
      denom2 += d2 * d2
    }
    
    return numerator / Math.sqrt(denom1 * denom2)
  }

  const generateSignal = (strategy: string, zScore: number, correlation: number, volatility: number): Signal => {
    let type: 'LONG' | 'SHORT' | 'CLOSE' | 'HOLD' = 'HOLD'
    let strength = 0
    let confidence = 0
    let reason = ''

    if (strategy === 'mean-reversion') {
      if (zScore > 2) {
        type = 'SHORT'
        strength = Math.min(100, Math.abs(zScore) * 30)
        confidence = correlation > 0.7 ? 80 : 60
        reason = `Z-Score ${safeFixed(zScore, 2)} > 2 (과매수 상태)`
      } else if (zScore < -2) {
        type = 'LONG'
        strength = Math.min(100, Math.abs(zScore) * 30)
        confidence = correlation > 0.7 ? 80 : 60
        reason = `Z-Score ${safeFixed(zScore, 2)} < -2 (과매도 상태)`
      } else if (Math.abs(zScore) < 0.5) {
        type = 'CLOSE'
        strength = 50
        confidence = 70
        reason = `Z-Score ${safeFixed(zScore, 2)} 중립 구간 진입`
      } else {
        type = 'HOLD'
        strength = 20
        confidence = 50
        reason = '신호 대기 중'
      }
    } else if (strategy === 'cointegration') {
      // 공적분 전략 로직
      if (correlation > 0.8 && Math.abs(zScore) > 1.5) {
        type = zScore > 0 ? 'SHORT' : 'LONG'
        strength = 70
        confidence = 75
        reason = `공적분 페어 ${zScore > 0 ? '과매수' : '과매도'}`
      }
    }

    return {
      type,
      strength,
      confidence,
      reason,
      timestamp: new Date()
    }
  }

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'LONG': return 'text-green-400 bg-green-900/30'
      case 'SHORT': return 'text-red-400 bg-red-900/30'
      case 'CLOSE': return 'text-yellow-400 bg-yellow-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }

  const getStrengthBar = (strength: number) => {
    const bars = Math.ceil(strength / 20)
    return '█'.repeat(bars) + '░'.repeat(5 - bars)
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-purple-400">⚡</span>
          트레이딩 시그널
        </h3>
        <div className="flex items-center gap-3 text-xs">
          {realtimePrice1 > 0 && realtimePrice2 > 0 && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400">실시간</span>
              <span className="text-gray-400">
                {pair.coin1}: ${safeFixed(realtimePrice1, 2)} | {pair.coin2}: ${safeFixed(realtimePrice2, 2)}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* 현재 시그널 */}
          {currentSignal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mb-6 p-4 rounded-lg border ${
                currentSignal.type === 'LONG' ? 'border-green-500 bg-green-900/20' :
                currentSignal.type === 'SHORT' ? 'border-red-500 bg-red-900/20' :
                currentSignal.type === 'CLOSE' ? 'border-yellow-500 bg-yellow-900/20' :
                'border-gray-600 bg-gray-900/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-bold ${
                    currentSignal.type === 'LONG' ? 'text-green-400' :
                    currentSignal.type === 'SHORT' ? 'text-red-400' :
                    currentSignal.type === 'CLOSE' ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>
                    {currentSignal.type}
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">신호 강도</div>
                    <div className="text-sm font-mono text-white">
                      {getStrengthBar(currentSignal.strength)} {currentSignal.strength}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">신뢰도</div>
                  <div className="text-2xl font-bold text-white">{currentSignal.confidence}%</div>
                </div>
              </div>
              <div className="text-sm text-gray-300">{currentSignal.reason}</div>
              <div className="text-xs text-gray-500 mt-2">
                {currentSignal.timestamp.toLocaleTimeString()}
              </div>
            </motion.div>
          )}

          {/* 메트릭 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Z-Score</div>
              <div className={`text-lg font-bold ${
                Math.abs(metrics.zScore) > 2 ? 'text-yellow-400' :
                Math.abs(metrics.zScore) > 3 ? 'text-red-400' :
                'text-green-400'
              }`}>
                {safeFixed(metrics.zScore, 3)}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">스프레드</div>
              <div className="text-lg font-bold text-white">{safeFixed(metrics.spread, 4)}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">상관관계</div>
              <div className={`text-lg font-bold ${
                metrics.correlation > 0.7 ? 'text-green-400' :
                metrics.correlation > 0.4 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {safeFixed(metrics.correlation, 3)}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">변동성</div>
              <div className="text-lg font-bold text-purple-400">
                {(metrics.volatility * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* 시그널 히스토리 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">최근 시그널</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {signalHistory.map((signal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-2 rounded ${getSignalColor(signal.type)}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{signal.type}</span>
                    <span className="text-xs opacity-75">{signal.reason}</span>
                  </div>
                  <span className="text-xs">{signal.timestamp.toLocaleTimeString()}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button 
              onClick={() => setAutoExecute(!autoExecute)}
              className={`${
                autoExecute ? 'bg-green-600' : 'bg-gray-700'
              } hover:opacity-90 text-white px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2`}
            >
              {autoExecute && <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />}
              {autoExecute ? '자동 실행 중' : '자동 실행 설정'}
            </button>
            <button 
              onClick={() => setNotifications(!notifications)}
              className={`${
                notifications ? 'bg-blue-600' : 'bg-gray-700'
              } hover:opacity-90 text-white px-4 py-3 rounded-lg font-semibold transition-all`}
            >
              {notifications ? '🔔 알림 켜짐' : '🔕 알림 꺼짐'}
            </button>
          </div>
          
          {/* 실시간 신호 알림 */}
          {notifications && currentSignal && currentSignal.type !== 'HOLD' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-purple-900/30 border border-purple-500/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="animate-pulse text-purple-400">🔔</span>
                <span className="text-sm text-purple-300">
                  새로운 {currentSignal.type} 시그널이 감지되었습니다!
                </span>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}