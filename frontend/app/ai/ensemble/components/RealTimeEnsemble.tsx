'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaSyncAlt, FaBroadcastTower, FaChartLine, FaClock,
  FaCheckCircle, FaExclamationTriangle, FaRocket, FaHeartbeat
} from 'react-icons/fa'
import { BiPulse } from 'react-icons/bi'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, ComposedChart
} from 'recharts'

interface RealTimeEnsembleProps {
  symbol: string
  timeframe: string
}

export default function RealTimeEnsemble({ symbol, timeframe }: RealTimeEnsembleProps) {
  const [isLive, setIsLive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [realtimeData, setRealtimeData] = useState<any[]>([])

  // 실시간 예측 데이터 시뮬레이션
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      const currentPrice = 52000 + Math.random() * 500
      const newPrediction = {
        time: new Date().toLocaleTimeString(),
        currentPrice,
        ensemblePrediction: currentPrice + (Math.random() - 0.5) * 200,
        confidence: 85 + Math.random() * 10,
        modelAgreement: 75 + Math.random() * 20,
        signalStrength: Math.random() * 100
      }

      setRealtimeData(prev => [...prev.slice(-19), newPrediction])
      setLastUpdate(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [isLive])

  // 실시간 모델 상태
  const modelStatus = [
    { model: 'Transformer', status: 'active', latency: 23, accuracy: 91.3 },
    { model: 'DeepAR', status: 'active', latency: 31, accuracy: 90.2 },
    { model: 'XGBoost', status: 'active', latency: 15, accuracy: 89.7 },
    { model: 'LightGBM', status: 'active', latency: 12, accuracy: 88.9 },
    { model: 'LSTM', status: 'active', latency: 28, accuracy: 88.5 },
    { model: 'Neural Net', status: 'warning', latency: 45, accuracy: 87.8 },
    { model: 'GRU', status: 'active', latency: 26, accuracy: 87.2 },
    { model: 'Random Forest', status: 'active', latency: 18, accuracy: 86.4 },
    { model: 'CNN', status: 'active', latency: 22, accuracy: 85.8 },
    { model: 'Prophet', status: 'active', latency: 19, accuracy: 83.7 },
    { model: 'ARIMA', status: 'inactive', latency: 0, accuracy: 82.3 }
  ]

  const activeModels = modelStatus.filter(m => m.status === 'active').length
  const avgLatency = modelStatus
    .filter(m => m.status === 'active')
    .reduce((sum, m) => sum + m.latency, 0) / activeModels

  // 실시간 성능 지표
  const performanceMetrics = [
    { metric: '예측 정확도', value: 92.7, trend: 'up', change: '+0.3%' },
    { metric: '응답 시간', value: 0.28, trend: 'stable', change: '±0ms' },
    { metric: '신호 일치도', value: 87.5, trend: 'up', change: '+2.1%' },
    { metric: '시스템 부하', value: 68, trend: 'down', change: '-5%' }
  ]

  // 최근 예측 신호
  const recentSignals = [
    { time: '10:32:45', signal: 'LONG', confidence: 88, profit: '+1.2%' },
    { time: '10:31:20', signal: 'HOLD', confidence: 72, profit: '0.0%' },
    { time: '10:30:15', signal: 'LONG', confidence: 91, profit: '+2.1%' },
    { time: '10:29:30', signal: 'SHORT', confidence: 85, profit: '+0.8%' },
    { time: '10:28:45', signal: 'LONG', confidence: 93, profit: '+1.5%' }
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaBroadcastTower className="text-cyan-400" />
          실시간 앙상블 예측
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BiPulse className={`text-2xl ${isLive ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
            <span className={`${isLive ? 'text-green-400' : 'text-gray-400'}`}>
              {isLive ? 'LIVE' : 'PAUSED'}
            </span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded-lg transition-all ${
              isLive 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            }`}
          >
            {isLive ? '일시정지' : '재개'}
          </button>
        </div>
      </div>

      {/* 실시간 상태 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">활성 모델</span>
            <FaCheckCircle className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{activeModels}/11</div>
          <div className="text-xs text-gray-400 mt-1">모든 모델 정상</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">평균 지연시간</span>
            <FaClock className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{avgLatency.toFixed(0)}ms</div>
          <div className="text-xs text-gray-400 mt-1">매우 빠름</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">마지막 업데이트</span>
            <FaSyncAlt className="text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white">{lastUpdate.toLocaleTimeString()}</div>
          <div className="text-xs text-gray-400 mt-1">실시간 갱신</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">현재 신호</span>
            <FaRocket className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400">LONG</div>
          <div className="text-xs text-gray-400 mt-1">신뢰도 92%</div>
        </motion.div>
      </div>

      {/* 실시간 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4">실시간 예측 추이</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={realtimeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis yAxisId="left" stroke="#9ca3af" />
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="currentPrice"
              stroke="#60a5fa"
              strokeWidth={2}
              name="현재가"
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ensemblePrediction"
              stroke="#a78bfa"
              strokeWidth={3}
              name="앙상블 예측"
              dot={false}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="confidence"
              fill="#10b981"
              stroke="#10b981"
              fillOpacity={0.3}
              name="신뢰도"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 모델 상태 모니터 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-xl font-bold text-white mb-4">모델 상태 모니터</h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {modelStatus.map((model, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    model.status === 'active' ? 'bg-green-400' :
                    model.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <span className="text-white font-medium">{model.model}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm">{model.latency}ms</span>
                  <span className="text-sm text-gray-300">{model.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 성능 지표 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-xl font-bold text-white mb-4">실시간 성능 지표</h4>
          <div className="space-y-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300">{metric.metric}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-white">
                    {metric.metric === '응답 시간' ? `${metric.value}초` : `${metric.value}%`}
                  </span>
                  <span className={`text-sm ${
                    metric.trend === 'up' ? 'text-green-400' :
                    metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 최근 신호 기록 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4">최근 예측 신호</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-400">시간</th>
                <th className="text-center py-2 text-gray-400">신호</th>
                <th className="text-center py-2 text-gray-400">신뢰도</th>
                <th className="text-right py-2 text-gray-400">결과</th>
              </tr>
            </thead>
            <tbody>
              {recentSignals.map((signal, index) => (
                <tr key={index} className="border-b border-gray-700/50">
                  <td className="py-3 text-white">{signal.time}</td>
                  <td className="py-3 text-center">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      signal.signal === 'LONG' ? 'bg-green-500/20 text-green-400' :
                      signal.signal === 'SHORT' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {signal.signal}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`text-sm ${
                      signal.confidence >= 90 ? 'text-green-400' :
                      signal.confidence >= 80 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {signal.confidence}%
                    </span>
                  </td>
                  <td className={`py-3 text-right font-medium ${
                    signal.profit.startsWith('+') ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {signal.profit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 실시간 알림 */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl p-6 border border-cyan-500/30">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaHeartbeat className="text-cyan-400" />
          실시간 알림
        </h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-400 mt-1" />
            <div>
              <p className="text-white font-semibold">강한 매수 신호 감지</p>
              <p className="text-gray-400 text-sm">모든 모델이 상승 예측에 동의 (신뢰도 92%)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-yellow-400 mt-1" />
            <div>
              <p className="text-white font-semibold">Neural Net 모델 지연</p>
              <p className="text-gray-400 text-sm">응답 시간 45ms로 증가, 모니터링 중</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}