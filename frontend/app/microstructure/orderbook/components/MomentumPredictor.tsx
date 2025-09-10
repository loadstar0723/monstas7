'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FaRocket, FaExclamationTriangle, FaChartLine, FaBolt } from 'react-icons/fa'
import { useState, useEffect, useMemo } from 'react'

interface OrderbookLevel {
  price: number
  amount: number
  total: number
}

interface MomentumPredictorProps {
  orderbook: {
    bids: OrderbookLevel[]
    asks: OrderbookLevel[]
    lastUpdate?: Date
  }
  historicalData: any[]
  stats: any
  symbol: string
}

interface MomentumData {
  timestamp: number
  momentum: number
  velocity: number
  acceleration: number
  pressure: number
  signal: 'bullish' | 'bearish' | 'neutral'
}

export default function MomentumPredictor({ orderbook, historicalData, stats, symbol }: MomentumPredictorProps) {
  const [timeframe, setTimeframe] = useState('5m')
  const [momentumHistory, setMomentumHistory] = useState<MomentumData[]>([])
  const [predictionConfidence, setPredictionConfidence] = useState(0)

  // 현재 오더북 모멘텀 계산
  const currentMomentum = useMemo(() => {
    if (!orderbook.bids?.length || !orderbook.asks?.length) {
      return {
        value: 0,
        direction: 'neutral' as const,
        strength: 0,
        buyPressure: 0,
        sellPressure: 0
      }
    }

    // 상위 5개 호가의 총 볼륨 계산
    const topBids = orderbook.bids.slice(0, 5)
    const topAsks = orderbook.asks.slice(0, 5)
    
    const bidVolume = topBids.reduce((sum, bid) => sum + bid.amount, 0)
    const askVolume = topAsks.reduce((sum, ask) => sum + ask.amount, 0)
    
    // 가중 평균 가격 계산 (볼륨 가중)
    const bidWeightedPrice = topBids.reduce((sum, bid) => sum + bid.price * bid.amount, 0) / (bidVolume || 1)
    const askWeightedPrice = topAsks.reduce((sum, ask) => sum + ask.price * ask.amount, 0) / (askVolume || 1)
    
    // 모멘텀 값 계산
    const volumeRatio = bidVolume / (askVolume || 1)
    const priceSpread = askWeightedPrice - bidWeightedPrice
    const momentum = (volumeRatio - 1) * 100
    
    // 매수/매도 압력
    const buyPressure = bidVolume / (bidVolume + askVolume) * 100
    const sellPressure = askVolume / (bidVolume + askVolume) * 100
    
    // 방향성 및 강도 판단
    let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    let strength = Math.abs(momentum)
    
    if (momentum > 20) direction = 'bullish'
    else if (momentum < -20) direction = 'bearish'
    
    return {
      value: momentum,
      direction,
      strength: Math.min(strength, 100),
      buyPressure,
      sellPressure,
      volumeRatio,
      priceSpread
    }
  }, [orderbook])

  // 모멘텀 히스토리 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const newData: MomentumData = {
        timestamp: now,
        momentum: currentMomentum.value,
        velocity: 0, // 이전 데이터와 비교해서 계산
        acceleration: 0,
        pressure: currentMomentum.buyPressure - currentMomentum.sellPressure,
        signal: currentMomentum.direction
      }

      setMomentumHistory(prev => {
        // 속도와 가속도 계산
        if (prev.length > 0) {
          const prevData = prev[prev.length - 1]
          const timeDiff = (now - prevData.timestamp) / 1000 // 초 단위
          if (timeDiff > 0) {
            newData.velocity = (newData.momentum - prevData.momentum) / timeDiff
            newData.acceleration = (newData.velocity - prevData.velocity) / timeDiff
          }
        }

        // 예측 신뢰도 계산
        const newHistory = [...prev.slice(-99), newData]
        const recentData = newHistory.slice(-20)
        if (recentData.length >= 10) {
          const consistency = recentData.filter(d => d.signal === currentMomentum.direction).length / recentData.length
          setPredictionConfidence(consistency * 100)
        }

        return newHistory
      })
    }, 1000) // 1초마다 업데이트

    return () => clearInterval(interval)
  }, [currentMomentum.value, currentMomentum.direction, currentMomentum.buyPressure, currentMomentum.sellPressure])

  // 전환점 감지
  const turningPoint = useMemo(() => {
    if (momentumHistory.length < 5) return null

    const recent = momentumHistory.slice(-5)
    const velocities = recent.map(d => d.velocity)
    const accelerations = recent.map(d => d.acceleration)

    // 속도가 0에 가까워지고 가속도가 반대로 바뀔 때
    const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length
    const avgAcceleration = accelerations.reduce((a, b) => a + b, 0) / accelerations.length

    if (Math.abs(avgVelocity) < 5 && Math.abs(avgAcceleration) > 10) {
      return {
        detected: true,
        type: avgAcceleration > 0 ? 'bullish' : 'bearish',
        confidence: Math.min(Math.abs(avgAcceleration) * 5, 100)
      }
    }

    return null
  }, [momentumHistory])

  // 예측 시그널
  const prediction = useMemo(() => {
    if (momentumHistory.length < 10) {
      return { signal: 'neutral', strength: 0, timeframe: '---' }
    }

    const recent = momentumHistory.slice(-10)
    const momentum = recent.map(d => d.momentum)
    const trend = momentum[momentum.length - 1] - momentum[0]
    
    // 트렌드 및 변동성 기반 예측
    const volatility = Math.sqrt(momentum.reduce((sum, m, i) => {
      if (i === 0) return sum
      return sum + Math.pow(m - momentum[i - 1], 2)
    }, 0) / momentum.length)

    let signal: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    let strength = 0
    let timeframe = '5-10분'

    if (trend > 20 && volatility < 10) {
      signal = 'bullish'
      strength = Math.min(trend / 2, 100)
    } else if (trend < -20 && volatility < 10) {
      signal = 'bearish' 
      strength = Math.min(Math.abs(trend) / 2, 100)
    }

    if (volatility > 20) {
      timeframe = '1-3분'
    } else if (volatility < 5) {
      timeframe = '15-30분'
    }

    return { signal, strength, timeframe, volatility, trend }
  }, [momentumHistory])

  const getMomentumColor = (value: number) => {
    if (value > 30) return '#10B981'
    if (value > 10) return '#84CC16'
    if (value < -30) return '#EF4444'
    if (value < -10) return '#F59E0B'
    return '#6B7280'
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaRocket className="text-purple-400" />
        모멘텀 예측 분석
      </h3>

      {/* 타임프레임 선택 */}
      <div className="mb-6">
        <div className="flex gap-2">
          {['1m', '5m', '15m', '30m'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                timeframe === tf
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* 현재 모멘텀 상태 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h4 className="text-gray-300 text-sm mb-3">현재 모멘텀</h4>
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl font-bold" style={{ color: getMomentumColor(currentMomentum.value) }}>
              {currentMomentum.value.toFixed(1)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentMomentum.direction === 'bullish' ? 'bg-green-500/20 text-green-400' :
              currentMomentum.direction === 'bearish' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-600/20 text-gray-400'
            }`}>
              {currentMomentum.direction === 'bullish' ? '상승' :
               currentMomentum.direction === 'bearish' ? '하락' : '중립'}
            </span>
          </div>
          
          {/* 매수/매도 압력 바 */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>매수 압력</span>
                <span>{currentMomentum.buyPressure.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-green-500"
                  animate={{ width: `${currentMomentum.buyPressure}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>매도 압력</span>
                <span>{currentMomentum.sellPressure.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-500"
                  animate={{ width: `${currentMomentum.sellPressure}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 예측 시그널 */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h4 className="text-gray-300 text-sm mb-3">AI 예측 시그널</h4>
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-3 ${
              prediction.signal === 'bullish' ? 'bg-green-500/20 text-green-400' :
              prediction.signal === 'bearish' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-600/20 text-gray-400'
            }`}>
              <FaBolt className="text-lg" />
              <span className="font-bold text-lg">
                {prediction.signal === 'bullish' ? '매수 시그널' :
                 prediction.signal === 'bearish' ? '매도 시그널' :
                 '대기'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">신호 강도</span>
                <p className="font-bold text-white">{prediction.strength.toFixed(0)}%</p>
              </div>
              <div>
                <span className="text-gray-400">예상 시간</span>
                <p className="font-bold text-white">{prediction.timeframe}</p>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-gray-400 text-xs">예측 신뢰도</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-purple-500"
                    animate={{ width: `${predictionConfidence}%` }}
                  />
                </div>
                <span className="text-xs text-gray-300">{predictionConfidence.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 전환점 경고 */}
      {turningPoint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/10 border border-orange-500 rounded-lg p-4 mb-6 flex items-start gap-3"
        >
          <FaExclamationTriangle className="text-orange-500 mt-0.5" />
          <div>
            <p className="text-orange-400 font-semibold">전환점 감지</p>
            <p className="text-gray-300 text-sm mt-1">
              {turningPoint.type === 'bullish' ? '하락에서 상승' : '상승에서 하락'}으로의 전환 가능성 감지
              (신뢰도: {turningPoint.confidence.toFixed(0)}%)
            </p>
          </div>
        </motion.div>
      )}

      {/* 모멘텀 차트 */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <h4 className="text-gray-300 text-sm font-medium mb-3 flex items-center gap-2">
          <FaChartLine />
          모멘텀 히스토리
        </h4>
        <div className="h-48">
          <div className="text-center text-gray-400">
            <div className="animate-pulse bg-gray-700/50 h-full rounded" />
          </div>
        </div>
      </div>

      {/* 트레이딩 팁 */}
      <div className="mt-6 bg-gray-700/30 rounded-lg p-4">
        <p className="text-gray-300 text-sm">
          <strong>💡 트레이딩 팁:</strong> 모멘텀이 극단적인 값을 보일 때는 반대 포지션을 고려하세요. 
          전환점 시그널과 함께 다른 지표들을 확인하여 신뢰도를 높이세요.
        </p>
      </div>
    </div>
  )
}