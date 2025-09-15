'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaChartLine, FaBrain, FaPlay, FaClock, FaCheckCircle,
  FaExclamationTriangle, FaRocket, FaBolt, FaChartBar, FaLightbulb
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ErrorBar, Legend, Scatter
} from 'recharts'
import CountUp from 'react-countup'

interface PredictionInterfaceProps {
  symbol: string
}

export default function PredictionInterface({ symbol }: PredictionInterfaceProps) {
  const [isPredicting, setIsPredicting] = useState(false)
  const [predictionData, setPredictionData] = useState<any[]>([])
  const [currentPrice, setCurrentPrice] = useState(48500)
  const [confidence, setConfidence] = useState(0)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')

  // 과거 가격 데이터 생성
  const generateHistoricalData = () => {
    const data = []
    const now = Date.now()
    for (let i = 100; i >= 0; i--) {
      const time = new Date(now - i * 3600000)
      const price = currentPrice + (Math.random() - 0.5) * 1000 - (i * 10)
      data.push({
        time: time.toLocaleTimeString(),
        price: Math.max(0, price),
        volume: Math.random() * 1000000,
        type: 'historical'
      })
    }
    return data
  }

  const [historicalData, setHistoricalData] = useState(generateHistoricalData())

  // 예측 시뮬레이션
  const runPrediction = () => {
    setIsPredicting(true)
    setConfidence(0)
    setPredictionData([])

    // 신경망 예측 시뮬레이션
    setTimeout(() => {
      const predictions = []
      const lastPrice = historicalData[historicalData.length - 1].price
      const trend = Math.random() > 0.5 ? 1 : -1
      const volatility = 500

      for (let i = 1; i <= 24; i++) {
        const basePrice = lastPrice + (trend * i * 50) + (Math.random() - 0.5) * volatility
        const uncertainty = i * 20 // 시간이 지날수록 불확실성 증가
        
        predictions.push({
          time: `+${i}h`,
          price: basePrice,
          upperBound: basePrice + uncertainty,
          lowerBound: basePrice - uncertainty,
          confidence: Math.max(50, 95 - i * 2),
          type: 'prediction'
        })
      }

      setPredictionData(predictions)
      setConfidence(85 + Math.random() * 10)
      setIsPredicting(false)
    }, 2000)
  }

  // 예측 메트릭
  const predictionMetrics = {
    direction: predictionData.length > 0 && predictionData[predictionData.length - 1].price > currentPrice ? 'up' : 'down',
    targetPrice: predictionData.length > 0 ? predictionData[predictionData.length - 1].price : currentPrice,
    maxPrice: predictionData.length > 0 ? Math.max(...predictionData.map(d => d.upperBound)) : currentPrice,
    minPrice: predictionData.length > 0 ? Math.min(...predictionData.map(d => d.lowerBound)) : currentPrice,
    avgConfidence: predictionData.length > 0 ? predictionData.reduce((sum, d) => sum + d.confidence, 0) / predictionData.length : 0
  }

  // 시간대별 예측 정확도
  const accuracyByTimeframe = [
    { timeframe: '1시간', accuracy: 92, samples: 10000 },
    { timeframe: '4시간', accuracy: 87, samples: 8500 },
    { timeframe: '1일', accuracy: 82, samples: 5000 },
    { timeframe: '1주', accuracy: 75, samples: 2000 }
  ]

  // 특성 중요도
  const featureImportance = [
    { feature: '가격 모멘텀', importance: 28, contribution: '+15%' },
    { feature: '거래량 패턴', importance: 22, contribution: '+12%' },
    { feature: '기술 지표', importance: 18, contribution: '+8%' },
    { feature: '시장 센티먼트', importance: 15, contribution: '+5%' },
    { feature: '온체인 데이터', importance: 10, contribution: '+3%' },
    { feature: '뉴스 감성', importance: 7, contribution: '+2%' }
  ]

  // 차트에 표시할 통합 데이터
  const combinedData = [...historicalData, ...predictionData]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaChartLine className="text-cyan-400" />
          AI 가격 예측 인터페이스
        </h2>
        <p className="text-gray-300">
          신경망 모델을 활용한 실시간 가격 예측과 신뢰구간 분석
        </p>
      </div>

      {/* 예측 컨트롤 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-white">예측 설정</h3>
            <select
              value={selectedTimeframe}
              onChange={(e) => {
                if (e && e.target && e.target.value) {
                  setSelectedTimeframe(e.target.value)
                }
              }}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="1h">1시간</option>
              <option value="4h">4시간</option>
              <option value="1d">1일</option>
              <option value="1w">1주</option>
            </select>
          </div>

          <button
            onClick={runPrediction}
            disabled={isPredicting}
            className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
              isPredicting
                ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
            }`}
          >
            {isPredicting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                예측 중...
              </>
            ) : (
              <>
                <FaPlay />
                예측 실행
              </>
            )}
          </button>
        </div>

        {confidence > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <FaBrain className="text-purple-400" />
              <span className="text-gray-400">모델 신뢰도:</span>
              <span className="text-2xl font-bold text-white">
                <CountUp end={confidence} decimals={1} duration={1} suffix="%" />
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${
              confidence > 80 ? 'bg-green-500/20 text-green-400' :
              confidence > 60 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {confidence > 80 ? '높은 신뢰도' : confidence > 60 ? '중간 신뢰도' : '낮은 신뢰도'}
            </div>
          </motion.div>
        )}
      </div>

      {/* 예측 결과 요약 */}
      {predictionData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <FaRocket className={predictionMetrics.direction === 'up' ? 'text-green-400' : 'text-red-400'} />
              <span className="text-sm text-gray-400">예측 방향</span>
            </div>
            <div className={`text-2xl font-bold ${
              predictionMetrics.direction === 'up' ? 'text-green-400' : 'text-red-400'
            }`}>
              {predictionMetrics.direction === 'up' ? '상승' : '하락'}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <FaChartBar className="text-blue-400" />
              <span className="text-sm text-gray-400">목표 가격</span>
            </div>
            <div className="text-2xl font-bold text-white">
              $<CountUp end={predictionMetrics.targetPrice} decimals={0} duration={1} separator="," />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <FaExclamationTriangle className="text-yellow-400" />
              <span className="text-sm text-gray-400">변동 범위</span>
            </div>
            <div className="text-sm text-white">
              <div>상한: $<CountUp end={predictionMetrics.maxPrice} decimals={0} separator="," /></div>
              <div>하한: $<CountUp end={predictionMetrics.minPrice} decimals={0} separator="," /></div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <FaCheckCircle className="text-green-400" />
              <span className="text-sm text-gray-400">평균 신뢰도</span>
            </div>
            <div className="text-2xl font-bold text-white">
              <CountUp end={predictionMetrics.avgConfidence} decimals={1} duration={1} suffix="%" />
            </div>
          </div>
        </motion.div>
      )}

      {/* 예측 차트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4">가격 예측 차트</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={['dataMin - 500', 'dataMax + 500']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any, name: any) => {
                if (name === 'price') return [`$${value.toFixed(0)}`, '가격']
                if (name === 'upperBound') return [`$${value.toFixed(0)}`, '상한']
                if (name === 'lowerBound') return [`$${value.toFixed(0)}`, '하한']
                return [value, name]
              }}
            />
            
            {/* 과거 가격 */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="가격"
            />
            
            {/* 예측 범위 */}
            {predictionData.length > 0 && (
              <>
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.1}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
              </>
            )}
            
            {/* 현재 시점 표시 */}
            <ReferenceLine
              x={historicalData[historicalData.length - 1]?.time}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              label={{ value: "현재", position: "top" }}
            />
            
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 예측 정확도 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4">시간대별 예측 정확도</h3>
          <div className="space-y-3">
            {accuracyByTimeframe.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.timeframe}</span>
                  <span className="text-white font-semibold">{item.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.accuracy}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`h-2 rounded-full ${
                      item.accuracy > 85 ? 'bg-green-500' :
                      item.accuracy > 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {item.samples.toLocaleString()} 샘플 기준
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4">예측 특성 중요도</h3>
          <div className="space-y-3">
            {featureImportance.map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-blue-400' :
                    index === 1 ? 'bg-green-400' :
                    index === 2 ? 'bg-yellow-400' :
                    index === 3 ? 'bg-purple-400' :
                    index === 4 ? 'bg-pink-400' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm text-gray-300">{feature.feature}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${feature.importance}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">{feature.contribution}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 예측 팁 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl p-6 border border-cyan-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-cyan-400" />
          AI 예측 활용 팁
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-cyan-400 font-semibold mb-3">신뢰도 해석</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>80% 이상: 강한 신호, 포지션 진입 고려</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>60-80%: 중간 신호, 추가 확인 필요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>60% 미만: 약한 신호, 관망 권장</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-blue-400 font-semibold mb-3">리스크 관리</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>예측 범위를 손절/익절 기준으로 활용</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>시간이 지날수록 불확실성 증가 고려</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>다른 지표와 교차 검증 필수</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}