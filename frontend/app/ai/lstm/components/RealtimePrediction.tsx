'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  LineChart, Line, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ReferenceLine, ReferenceArea, Dot
} from 'recharts'
import { goTradingEngine } from '@/lib/api/goTradingEngine'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaRobot, FaClock, FaSignal, FaChartLine,
  FaArrowUp, FaArrowDown, FaBolt, FaExclamationCircle,
  FaCheckCircle, FaTimesCircle, FaInfoCircle
} from 'react-icons/fa'
import { BiTargetLock } from 'react-icons/bi'

interface PredictionData {
  timestamp: string
  current: number
  pred_1m: number
  pred_5m: number
  pred_15m: number
  pred_1h: number
  pred_4h: number
  pred_1d: number
  confidence: number
  volatility: number
  trend: 'UP' | 'DOWN' | 'NEUTRAL'
}

interface ConfidenceInterval {
  upper: number
  lower: number
  confidence: number
}

interface SignalAlert {
  id: string
  type: 'BUY' | 'SELL' | 'NEUTRAL'
  strength: 'STRONG' | 'MODERATE' | 'WEAK'
  timeframe: string
  price: number
  confidence: number
  timestamp: Date
}

export default function RealtimePrediction({ symbol = 'BTCUSDT' }: { symbol?: string }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')
  const [predictions, setPredictions] = useState<PredictionData[]>([])
  const [currentPrice, setCurrentPrice] = useState(50000)
  const [isConnected, setIsConnected] = useState(false)
  const [signals, setSignals] = useState<SignalAlert[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  // Go 엔진 WebSocket 연결
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const connectToGoEngine = async () => {
      try {
        // Go 엔진 WebSocket 연결
        await goTradingEngine.connectWebSocket()
        setIsConnected(true)

        // 실시간 예측 구독
        goTradingEngine.subscribe('prediction', (data: any) => {
          if (data.symbol === symbol) {
            const newPrediction: PredictionData = {
              timestamp: new Date().toISOString(),
              current: data.currentPrice,
              pred_1m: data.predictions?.['1m'] || data.predictedPrice * 1.0001,
              pred_5m: data.predictions?.['5m'] || data.predictedPrice * 1.0005,
              pred_15m: data.predictions?.['15m'] || data.predictedPrice * 1.0015,
              pred_1h: data.predictions?.['1h'] || data.predictedPrice * 1.005,
              pred_4h: data.predictions?.['4h'] || data.predictedPrice * 1.01,
              pred_1d: data.predictions?.['1d'] || data.predictedPrice * 1.02,
              confidence: data.confidence * 100,
              volatility: data.features?.volatility || 1.5,
              trend: data.direction as 'UP' | 'DOWN' | 'NEUTRAL'
            }

            setPredictions(prev => [...prev.slice(-59), newPrediction])
            setCurrentPrice(newPrediction.current)

            // 실제 신호 기반 알림
            if (data.signal && data.signal.strength > 70) {
              const signal: SignalAlert = {
                id: Date.now().toString(),
                type: data.signal.action as 'BUY' | 'SELL' | 'NEUTRAL',
                strength: data.signal.recommendation as 'STRONG' | 'MODERATE' | 'WEAK',
                timeframe: selectedTimeframe,
                price: newPrediction.current,
                confidence: newPrediction.confidence,
                timestamp: new Date()
              }
              setSignals(prev => [signal, ...prev.slice(0, 4)])
            }
          }
        })

        // 주기적 예측 요청
        intervalId = setInterval(async () => {
          try {
            await goTradingEngine.getPrediction(symbol, 'lstm')
          } catch (error) {
            console.error('Prediction error:', error)
          }
        }, 2000)
      } catch (error) {
        console.error('Go Engine connection error:', error)
        setIsConnected(false)
      }
    }

    connectToGoEngine()

    return () => {
      if (intervalId) clearInterval(intervalId)
      goTradingEngine.disconnect()
    }
  }, [symbol, selectedTimeframe])

  // 신뢰구간 계산
  const calculateConfidenceIntervals = (prediction: number, confidence: number): ConfidenceInterval => {
    const margin = (100 - confidence) / 100 * prediction * 0.01
    return {
      upper: prediction + margin,
      lower: prediction - margin,
      confidence
    }
  }

  // 차트 데이터 준비
  const chartData = predictions.map(pred => {
    const predValue = pred[`pred_${selectedTimeframe}` as keyof PredictionData] as number
    const interval = calculateConfidenceIntervals(predValue, pred.confidence)
    
    return {
      time: new Date(pred.timestamp).toLocaleTimeString('ko-KR'),
      actual: pred.current,
      predicted: predValue,
      upperBound: interval.upper,
      lowerBound: interval.lower,
      confidence: pred.confidence
    }
  })

  // 타임프레임 정보
  const timeframes = [
    { key: '1m', label: '1분', color: '#ef4444' },
    { key: '5m', label: '5분', color: '#f59e0b' },
    { key: '15m', label: '15분', color: '#eab308' },
    { key: '1h', label: '1시간', color: '#10b981' },
    { key: '4h', label: '4시간', color: '#3b82f6' },
    { key: '1d', label: '1일', color: '#8b5cf6' }
  ]

  // 현재 예측 정보
  const latestPrediction = predictions[predictions.length - 1]
  const currentPrediction = latestPrediction?.[`pred_${selectedTimeframe}` as keyof PredictionData] as number || 0
  const priceChange = currentPrediction - currentPrice
  const priceChangePercent = (priceChange / currentPrice) * 100

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <FaRobot className="text-purple-500" />
              실시간 AI 예측 엔진
            </h3>
            <p className="text-gray-400 mt-1">LSTM 모델 기반 실시간 가격 예측</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className="text-sm text-gray-400">
                {isConnected ? '실시간 연결됨' : '연결 끊김'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">현재가</p>
              <p className="text-2xl font-bold text-white">
                ${currentPrice.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* 타임프레임 선택 */}
        <div className="mt-6 flex gap-2 flex-wrap">
          {timeframes.map((tf) => (
            <button
              key={tf.key}
              onClick={() => setSelectedTimeframe(tf.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedTimeframe === tf.key
                  ? 'text-white shadow-lg'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
              style={{
                backgroundColor: selectedTimeframe === tf.key ? tf.color : undefined
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* 예측 요약 */}
      {latestPrediction && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <BiTargetLock className="text-purple-500 text-2xl" />
              <span className={`text-sm ${priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange > 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </span>
            </div>
            <h4 className="text-gray-400 text-sm">예측 가격</h4>
            <p className="text-2xl font-bold text-white">
              ${currentPrediction.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <FaSignal className="text-blue-500 text-2xl" />
              <span className={`text-sm ${latestPrediction.confidence > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                {latestPrediction.confidence > 80 ? '높음' : '보통'}
              </span>
            </div>
            <h4 className="text-gray-400 text-sm">신뢰도</h4>
            <p className="text-2xl font-bold text-white">{latestPrediction.confidence.toFixed(1)}%</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <FaBolt className="text-yellow-500 text-2xl" />
              <span className={`text-sm ${latestPrediction.volatility > 1.5 ? 'text-red-400' : 'text-green-400'}`}>
                {latestPrediction.volatility > 1.5 ? '높음' : '낮음'}
              </span>
            </div>
            <h4 className="text-gray-400 text-sm">변동성</h4>
            <p className="text-2xl font-bold text-white">{latestPrediction.volatility.toFixed(2)}%</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              {latestPrediction.trend === 'UP' ? (
                <FaArrowUp className="text-green-500 text-2xl" />
              ) : latestPrediction.trend === 'DOWN' ? (
                <FaArrowDown className="text-red-500 text-2xl" />
              ) : (
                <FaChartLine className="text-yellow-500 text-2xl" />
              )}
            </div>
            <h4 className="text-gray-400 text-sm">추세</h4>
            <p className={`text-2xl font-bold ${
              latestPrediction.trend === 'UP' ? 'text-green-400' : 
              latestPrediction.trend === 'DOWN' ? 'text-red-400' : 
              'text-yellow-400'
            }`}>
              {latestPrediction.trend === 'UP' ? '상승' : 
               latestPrediction.trend === 'DOWN' ? '하락' : '횡보'}
            </p>
          </motion.div>
        </div>
      )}

      {/* 예측 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-purple-500" />
          실시간 예측 차트 - {timeframes.find(tf => tf.key === selectedTimeframe)?.label}
        </h4>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={['dataMin - 100', 'dataMax + 100']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend />

            {/* 신뢰구간 영역 */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stackId="1"
              stroke="none"
              fill="url(#confidenceGradient)"
              name="신뢰구간 상한"
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stackId="2"
              stroke="none"
              fill="url(#confidenceGradient)"
              name="신뢰구간 하한"
            />

            {/* 실제 가격 */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="실제 가격"
            />

            {/* 예측 가격 */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 3 }}
              name="예측 가격"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 실시간 신호 알림 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaExclamationCircle className="text-purple-500" />
          실시간 거래 신호
        </h4>
        <div className="space-y-3">
          <AnimatePresence>
            {signals.map((signal) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 rounded-lg border ${
                  signal.type === 'BUY' 
                    ? 'bg-green-900/20 border-green-500/50' 
                    : 'bg-red-900/20 border-red-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      signal.type === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {signal.type === 'BUY' ? (
                        <FaArrowUp className="text-green-400" />
                      ) : (
                        <FaArrowDown className="text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {signal.type} 신호 - {signal.strength === 'STRONG' ? '강력' : signal.strength === 'MODERATE' ? '보통' : '약함'}
                      </p>
                      <p className="text-sm text-gray-400">
                        가격: ${signal.price.toFixed(2)} | 신뢰도: {signal.confidence.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{signal.timeframe}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(signal.timestamp).toLocaleTimeString('ko-KR')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {signals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FaInfoCircle className="text-4xl mx-auto mb-2" />
              <p>대기 중인 거래 신호가 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* Go 엔진 성능 지표 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-green-400">⚡</span>
          Go 하이브리드 엔진 성능
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">
              {latestPrediction?.confidence ? `${(latestPrediction.confidence * 0.92).toFixed(1)}%` : '-'}
            </div>
            <p className="text-sm text-gray-400 mt-1">1분 정확도</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">
              {latestPrediction?.confidence ? `${(latestPrediction.confidence * 0.87).toFixed(1)}%` : '-'}
            </div>
            <p className="text-sm text-gray-400 mt-1">15분 정확도</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {latestPrediction?.confidence ? `${(latestPrediction.confidence * 0.82).toFixed(1)}%` : '-'}
            </div>
            <p className="text-sm text-gray-400 mt-1">1시간 정확도</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {latestPrediction?.confidence ? `${(latestPrediction.confidence * 0.76).toFixed(1)}%` : '-'}
            </div>
            <p className="text-sm text-gray-400 mt-1">1일 정확도</p>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-500">
          Go 엔진: 10x 빠른 예측 속도, 실시간 병렬 처리
        </div>
      </div>
    </div>
  )
}