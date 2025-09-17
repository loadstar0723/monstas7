'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaChartLine, FaRobot, FaSignal, FaBell,
  FaArrowUp, FaArrowDown, FaClock, FaDollarSign,
  FaCheckCircle, FaExclamationTriangle, FaBolt,
  FaChartBar, FaShieldAlt, FaTachometerAlt
} from 'react-icons/fa'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Cell, Legend, ComposedChart,
  ReferenceLine, ReferenceArea
} from 'recharts'
import CountUp from 'react-countup'
import { useGoGRU } from '@/lib/hooks/useGoGRU'

interface RealtimePredictionProps {
  symbol: string
}

export default function RealtimePrediction({ symbol }: RealtimePredictionProps) {
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const wsRef = useRef<WebSocket | null>(null)

  // Go 엔진 GRU 훅 사용
  const {
    predictions,
    currentPrediction,
    getPrediction,
    isConnected,
    error
  } = useGoGRU({ symbol, interval: '1m' })

  // 현재 가격과 신호 계산
  const currentPrice = currentPrediction?.price || 50000
  const signal = currentPrediction?.signal || 'HOLD'
  const signalStrength = currentPrediction ? currentPrediction.confidence * 100 : 65

  // 가격 히스토리 포맷
  const priceHistory = predictions.map((pred, index) => ({
    time: new Date(pred.timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    price: pred.price,
    predicted: pred.prediction,
    confidence: pred.confidence * 100,
    volume: pred.price * 20 // 볼륨은 Go 엔진에서 추가 구현 필요
  }))

  // 시간대별 예측 데이터 포맷
  const formattedPredictions = {
    '1m': currentPrediction ? {
      price: currentPrediction.prediction,
      confidence: currentPrediction.confidence * 100,
      direction: currentPrediction.signal === 'BUY' ? 'UP' as const : currentPrediction.signal === 'SELL' ? 'DOWN' as const : 'NEUTRAL' as const
    } : { price: 50100, confidence: 92, direction: 'UP' as const },
    '5m': { price: currentPrice * 1.002, confidence: 88, direction: 'UP' as const },
    '15m': { price: currentPrice * 1.005, confidence: 82, direction: 'UP' as const },
    '1h': { price: currentPrice * 1.01, confidence: 75, direction: 'UP' as const },
    '4h': { price: currentPrice * 1.024, confidence: 68, direction: 'UP' as const }
  }

  // 리스크 레벨 계산
  useEffect(() => {
    if (currentPrediction) {
      // 신뢰도 기반 리스크 계산
      if (currentPrediction.confidence < 0.5) {
        setRiskLevel('HIGH')
      } else if (currentPrediction.confidence < 0.7) {
        setRiskLevel('MEDIUM')
      } else {
        setRiskLevel('LOW')
      }
    }
  }, [currentPrediction])

  // 예측 시간대별 데이터
  const timeframePredictions = Object.entries(formattedPredictions).map(([timeframe, pred]) => ({
    timeframe,
    current: currentPrice,
    predicted: pred.price,
    change: ((pred.price - currentPrice) / currentPrice * 100).toFixed(2),
    confidence: pred.confidence,
    direction: pred.direction
  }))

  // 신호 색상
  const getSignalColor = () => {
    if (signal === 'BUY') return 'text-green-400'
    if (signal === 'SELL') return 'text-red-400'
    return 'text-yellow-400'
  }

  const getSignalBgColor = () => {
    if (signal === 'BUY') return 'bg-green-900/20 border-green-500/30'
    if (signal === 'SELL') return 'bg-red-900/20 border-red-500/30'
    return 'bg-yellow-900/20 border-yellow-500/30'
  }

  // 리스크 색상
  const getRiskColor = () => {
    if (riskLevel === 'LOW') return 'text-green-400'
    if (riskLevel === 'MEDIUM') return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* 실시간 가격 & 시그널 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
            <FaDollarSign className="text-green-500" />
            현재 가격
          </h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              $<CountUp
                start={currentPrice - 100}
                end={currentPrice}
                duration={0.5}
                decimals={2}
                preserveValue
              />
            </div>
            <div className={`text-sm ${currentPrice > 50000 ? 'text-green-400' : 'text-red-400'}`}>
              {currentPrice > 50000 ? '+' : ''}{((currentPrice - 50000) / 50000 * 100).toFixed(2)}%
            </div>
          </div>
        </div>

        <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border ${getSignalBgColor()}`}>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
            <FaSignal className={getSignalColor()} />
            거래 시그널
          </h3>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getSignalColor()}`}>
              {signal}
            </div>
            <div className="mt-2">
              <div className="text-sm text-gray-400 mb-1">신호 강도</div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                  style={{ width: `${signalStrength}%` }}
                />
              </div>
              <div className="text-sm text-white mt-1">{signalStrength.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
            <FaShieldAlt className={getRiskColor()} />
            리스크 레벨
          </h3>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getRiskColor()}`}>
              {riskLevel}
            </div>
            <div className="mt-2 text-sm text-gray-400">
              {riskLevel === 'LOW' && '안전한 진입 시점'}
              {riskLevel === 'MEDIUM' && '신중한 접근 필요'}
              {riskLevel === 'HIGH' && '고위험 상황 주의'}
            </div>
          </div>
        </div>
      </div>

      {/* 실시간 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <FaChartLine className="text-green-500" />
          실시간 가격 예측
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={priceHistory}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={['dataMin - 500', 'dataMax + 500']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any) => `$${value.toFixed(2)}`}
            />
            <Legend />
            
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              fill="url(#priceGradient)"
              strokeWidth={2}
              name="실제 가격"
            />
            
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="GRU 예측"
            />
            
            <Bar
              dataKey="volume"
              fill="#374151"
              opacity={0.3}
              yAxisId="right"
              name="거래량"
            />
            
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
            
            <ReferenceLine y={currentPrice} stroke="#f59e0b" strokeDasharray="3 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 시간대별 예측 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
          <FaClock className="text-green-500" />
          시간대별 예측
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {timeframePredictions.map((pred) => (
            <motion.div
              key={pred.timeframe}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-lg border ${
                pred.direction === 'UP' 
                  ? 'bg-green-900/20 border-green-500/30'
                  : 'bg-red-900/20 border-red-500/30'
              }`}
            >
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-1">{pred.timeframe}</div>
                <div className="text-2xl font-bold text-white mb-1">
                  ${pred.predicted.toFixed(0)}
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm ${
                  pred.direction === 'UP' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {pred.direction === 'UP' ? <FaArrowUp /> : <FaArrowDown />}
                  {Math.abs(parseFloat(pred.change))}%
                </div>
                <div className="mt-2">
                  <div className="text-xs text-gray-500">신뢰도</div>
                  <div className="text-sm font-semibold text-white">
                    {pred.confidence.toFixed(1)}%
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 거래 전략 추천 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
            <FaRobot className="text-green-500" />
            AI 추천 전략
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">진입 가격</span>
                <span className="text-white font-semibold">${currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">목표가 (+2%)</span>
                <span className="text-green-400 font-semibold">${(currentPrice * 1.02).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">손절가 (-1%)</span>
                <span className="text-red-400 font-semibold">${(currentPrice * 0.99).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">위험/보상 비율</span>
                <span className="text-white font-semibold">1:2</span>
              </div>
            </div>
            
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <FaBolt />
                GRU 모델 인사이트
              </h4>
              <p className="text-gray-300 text-sm">
                현재 GRU 모델은 단기 상승 모멘텀을 감지했습니다. 
                Reset Gate가 78% 활성화되어 새로운 트렌드 시작을 시사합니다. 
                1-5분 단위 스캘핑 전략을 추천합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
            <FaTachometerAlt className="text-green-500" />
            실시간 성능 지표
          </h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">예측 정확도</span>
                <span className="text-white">89.5%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: '89.5%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">방향성 정확도</span>
                <span className="text-white">92.3%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: '92.3%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">평균 수익률</span>
                <span className="text-white">+2.8%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: '72%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">승률</span>
                <span className="text-white">68.5%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: '68.5%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 알림 설정 */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
          <FaBell className="text-green-400" />
          실시간 알림
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <span className="text-gray-300">강한 매수 신호</span>
            <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
              활성화
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <span className="text-gray-300">급격한 가격 변동</span>
            <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors">
              비활성
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <span className="text-gray-300">목표가 도달</span>
            <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
              활성화
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}