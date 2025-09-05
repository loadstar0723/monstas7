'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

interface MarketAnalysis {
  sentiment: number
  fearGreedIndex: number
  volatility: number
  volume: number
  dominance: number
}

interface PredictionData {
  date: string
  predicted: number
  actual?: number
  confidence: number
}

interface IndicatorData {
  name: string
  value: number
  signal: 'buy' | 'sell' | 'neutral'
}

export default function AnalyticsPage() {
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis>({
    sentiment: 0,
    fearGreedIndex: 0,
    volatility: 0,
    volume: 0,
    dominance: 0
  })
  const [predictions, setPredictions] = useState<PredictionData[]>([])
  const [indicators, setIndicators] = useState<IndicatorData[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // 실제 API 호출 (현재는 시뮬레이션)
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT')
        const ticker = await response.json()
        
        // 시장 분석 데이터 (실제로는 AI 모델에서)
        setMarketAnalysis({
          sentiment: 65 + Math.random() * 20,
          fearGreedIndex: 50 + Math.random() * 30,
          volatility: parseFloat(ticker.priceChangePercent),
          volume: parseFloat(ticker.volume) / 1000000,
          dominance: 45 + Math.random() * 10
        })

        // 가격 예측 데이터 (실제로는 ML 모델에서)
        const currentPrice = parseFloat(ticker.lastPrice)
        const predictionData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() + i)
          return {
            date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            predicted: currentPrice * (1 + (Math.random() - 0.5) * 0.05),
            actual: i === 0 ? currentPrice : undefined,
            confidence: 70 + Math.random() * 20
          }
        })
        setPredictions(predictionData)

        // 기술 지표 분석
        const indicatorData = [
          { name: 'RSI', value: 50 + Math.random() * 30, signal: 'neutral' as const },
          { name: 'MACD', value: Math.random() * 100, signal: 'buy' as const },
          { name: 'Bollinger', value: 60 + Math.random() * 20, signal: 'sell' as const },
          { name: 'MA(20)', value: 45 + Math.random() * 30, signal: 'buy' as const },
          { name: 'Stochastic', value: 40 + Math.random() * 40, signal: 'neutral' as const }
        ]
        setIndicators(indicatorData)
        
        setLoading(false)
      } catch (error) {
        console.error('분석 데이터 로드 실패:', error)
        setLoading(false)
      }
    }

    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [selectedTimeframe])

  const radarData = [
    { subject: '시장 심리', value: marketAnalysis.sentiment, fullMark: 100 },
    { subject: '공포/탐욕', value: marketAnalysis.fearGreedIndex, fullMark: 100 },
    { subject: '변동성', value: Math.abs(marketAnalysis.volatility), fullMark: 20 },
    { subject: '거래량', value: Math.min(marketAnalysis.volume / 10, 100), fullMark: 100 },
    { subject: '지배력', value: marketAnalysis.dominance, fullMark: 100 }
  ]

  const getSentimentText = (value: number) => {
    if (value >= 80) return { text: '매우 긍정적', color: 'text-green-500' }
    if (value >= 60) return { text: '긍정적', color: 'text-green-400' }
    if (value >= 40) return { text: '중립', color: 'text-yellow-500' }
    if (value >= 20) return { text: '부정적', color: 'text-red-400' }
    return { text: '매우 부정적', color: 'text-red-500' }
  }

  const sentiment = getSentimentText(marketAnalysis.sentiment)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">AI 분석</h1>
          <p className="text-gray-400">딥러닝 기반 시장 분석 및 가격 예측</p>
        </div>

        {/* 시장 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6"
          >
            <div className="text-sm text-gray-400 mb-2">시장 심리</div>
            <div className={`text-2xl font-bold ${sentiment.color}`}>
              {sentiment.text}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {marketAnalysis.sentiment.toFixed(1)}/100
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6"
          >
            <div className="text-sm text-gray-400 mb-2">공포/탐욕 지수</div>
            <div className="text-2xl font-bold text-yellow-500">
              {marketAnalysis.fearGreedIndex.toFixed(0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {marketAnalysis.fearGreedIndex >= 50 ? '탐욕' : '공포'}
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6"
          >
            <div className="text-sm text-gray-400 mb-2">변동성</div>
            <div className={`text-2xl font-bold ${Math.abs(marketAnalysis.volatility) > 5 ? 'text-red-500' : 'text-green-500'}`}>
              {Math.abs(marketAnalysis.volatility).toFixed(2)}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {Math.abs(marketAnalysis.volatility) > 5 ? '높음' : '낮음'}
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6"
          >
            <div className="text-sm text-gray-400 mb-2">BTC 지배력</div>
            <div className="text-2xl font-bold text-blue-500">
              {marketAnalysis.dominance.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              시장 점유율
            </div>
          </motion.div>
        </div>

        {/* 분석 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* AI 가격 예측 */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold gradient-text">AI 가격 예측</h3>
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700"
              >
                <option value="1d">1일</option>
                <option value="7d">7일</option>
                <option value="30d">30일</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="예측가"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="실제가"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-gray-400">예측 신뢰도</span>
              <span className="text-purple-500 font-medium">
                {predictions[0]?.confidence.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* 시장 지표 레이더 */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4 gradient-text">시장 종합 분석</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px' }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  stroke="#9CA3AF"
                  style={{ fontSize: '10px' }}
                />
                <Radar 
                  dataKey="value" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 기술 지표 */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 gradient-text">기술 지표 분석</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {indicators.map((indicator) => (
              <motion.div
                key={indicator.name}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/50 rounded-lg p-4 text-center"
              >
                <div className="text-sm text-gray-400 mb-2">{indicator.name}</div>
                <div className="text-2xl font-bold mb-2">
                  {indicator.value.toFixed(1)}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                  indicator.signal === 'buy' 
                    ? 'bg-green-500/20 text-green-400' 
                    : indicator.signal === 'sell'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {indicator.signal === 'buy' ? '매수' : indicator.signal === 'sell' ? '매도' : '중립'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI 인사이트 */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4 gradient-text">AI 인사이트</h3>
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3"
            >
              <span className="text-2xl">🤖</span>
              <div>
                <p className="text-gray-300">
                  현재 시장은 <span className={sentiment.color}>{sentiment.text}</span> 상태이며,
                  변동성이 {Math.abs(marketAnalysis.volatility) > 5 ? '높은' : '낮은'} 편입니다.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start gap-3"
            >
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-gray-300">
                  기술 지표 분석 결과, {indicators.filter(i => i.signal === 'buy').length}개의 매수 신호와
                  {' '}{indicators.filter(i => i.signal === 'sell').length}개의 매도 신호가 감지되었습니다.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-3"
            >
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-gray-300">
                  AI 모델의 7일 가격 예측 신뢰도는 <span className="text-purple-500">{predictions[0]?.confidence.toFixed(1)}%</span>이며,
                  단기 투자보다는 중장기 관점의 접근을 권장합니다.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}