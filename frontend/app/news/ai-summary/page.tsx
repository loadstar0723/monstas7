'use client'

import { useState, useEffect } from 'react'
import { translateToKorean, translateNewsBody } from '@/lib/translateService'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  FaRobot, FaBrain, FaChartLine, FaLightbulb, FaShieldAlt,
  FaExclamationTriangle, FaTrophy, FaSync, FaExpand, FaCompress,
  FaLanguage, FaDownload, FaShare, FaBookmark, FaFilter
} from 'react-icons/fa'
import { newsDataService } from '@/lib/services/newsDataService'
import { explainableAI, XAIAnalysis } from '@/lib/services/explainableAI'
import { binanceWS } from '@/lib/services/enhancedWebSocketManager'
import { translationService } from '@/lib/services/translationService'
import EnhancedNewsCard from '@/components/news/EnhancedNewsCard'
import EnhancedCoinSelector from '@/components/news/EnhancedCoinSelector'
import NewsModuleWrapper from '../components/NewsModuleWrapper'

// Recharts 컴포?�트??- ?�적 import
import {
  LineChart, BarChart, RadarChart, PieChart, AreaChart, ScatterChart,
  ComposedChart, Treemap, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Line, Bar, Area, Scatter, Pie, Cell, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

// ?�트�?컴포?�트
const HeatMap = ({ data, title }: { data: any[], title: string }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <div className="grid grid-cols-7 gap-1">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="aspect-square rounded flex items-center justify-center text-xs"
            style={{
              backgroundColor: `rgba(147, 51, 234, ${item.value / 100})`,
              color: item.value > 50 ? 'white' : 'gray'
            }}
          >
            {item.value}
          </div>
        ))}
      </div>
    </div>
  )
}

// ?�드 ?�라?�드 컴포?�트
const WordCloud = ({ words }: { words: { word: string; frequency: number; sentiment: number }[] }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <h3 className="text-lg font-bold mb-3">{translateToKorean("?�� ?�워???�라?�드")}</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {words.map((item, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="px-3 py-1 rounded-full"
            style={{
              fontSize: `${12 + item.frequency * 2}px`,
              backgroundColor: item.sentiment > 0 ? 'rgba(34, 197, 94, 0.2)' :
                            item.sentiment < 0 ? 'rgba(239, 68, 68, 0.2)' :
                            'rgba(156, 163, 175, 0.2)',
              color: item.sentiment > 0 ? '#22c55e' :
                     item.sentiment < 0 ? '#ef4444' :
                     '#9ca3af'
            }}
          >
            {item.word}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

// ?��?관�?매트�?��
const CorrelationMatrix = ({ data }: { data: any[][] }) => {
  const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP']

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <h3 className="text-lg font-bold mb-3">?�� 코인 ?��?관�?/h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2"></th>
              {coins.map(coin => (
                <th key={coin} className="p-2 text-xs">{coin}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coins.map((coin, i) => (
              <tr key={coin}>
                <td className="p-2 text-xs font-semibold">{coin}</td>
                {coins.map((_, j) => {
                  const value = i === j ? 1 : 0.6 + Math.random() * 0.3
                  return (
                    <td
                      key={j}
                      className="p-2 text-center text-xs"
                      style={{
                        backgroundColor: `rgba(147, 51, 234, ${value})`,
                        color: value > 0.5 ? 'white' : 'gray'
                      }}
                    >
                      {value.toFixed(2)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ?�이 차트 ?�이??const pieData = [
  { name: '긍정', value: 45, fill: '#22c55e' },
  { name: '부??, value: 25, fill: '#ef4444' },
  { name: '중립', value: 30, fill: '#9ca3af' }
]

// ?�이??차트 ?�이??const radarData = [
  { subject: '기술', A: 85, fullMark: 100 },
  { subject: '규제', A: 65, fullMark: 100 },
  { subject: '기�?', A: 78, fullMark: 100 },
  { subject: '?�셜', A: 72, fullMark: 100 },
  { subject: '?�장', A: 88, fullMark: 100 },
  { subject: '?�체??, A: 80, fullMark: 100 }
]

export default function AISummaryModule() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [newsData, setNewsData] = useState<any[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<XAIAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [showKorean, setShowKorean] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']))
  const [priceData, setPriceData] = useState<any[]>([])
  const [volumeData, setVolumeData] = useState<any[]>([])
  const [sentimentData, setSentimentData] = useState<any[]>([])

  // ?�스 ?�이??로드
  useEffect(() => {
    loadNewsAndAnalysis()
  }, [selectedSymbol])

  // WebSocket ?�시�?가�?  useEffect(() => {
    binanceWS.connect().then(() => {
      binanceWS.subscribeToSymbol(selectedSymbol, ['ticker', 'trade'])
    })

    binanceWS.on('ticker', (data) => {
      if (data.symbol === selectedSymbol) {
        updatePriceChart(data.price)
      }
    })

    return () => {
      binanceWS.unsubscribeFromSymbol(selectedSymbol)
    }
  }, [selectedSymbol])

  const loadNewsAndAnalysis = async () => {
    setIsLoading(true)
    try {
      // ?�스 ?�이??로드
      const news = await newsDataService.getNews([selectedSymbol.replace('USDT', '')])
      setNewsData(news)

      // AI 분석 ?�행
      const analysis = await explainableAI.analyzeNews(news, selectedSymbol)
      setAiAnalysis(analysis)

      // 차트 ?�이???�성
      generateChartData(analysis)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePriceChart = (price: number) => {
    setPriceData(prev => {
      const newData = [...prev, {
        time: new Date().toLocaleTimeString(),
        price,
        ma7: prev.length > 7 ? prev.slice(-7).reduce((a, b) => a + b.price, 0) / 7 : price,
        ma25: prev.length > 25 ? prev.slice(-25).reduce((a, b) => a + b.price, 0) / 25 : price
      }]
      return newData.slice(-100) // 최근 100개만 ?��?
    })
  }

  const generateChartData = (analysis: XAIAnalysis) => {
    // 가�?차트 ?�이??    const prices = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      price: 50000 + Math.random() * 5000,
      ma7: 51000 + Math.random() * 2000,
      ma25: 50500 + Math.random() * 1500
    }))
    setPriceData(prices)

    // 거래???�이??    const volumes = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      volume: Math.random() * 1000000,
      buy: Math.random() * 600000,
      sell: Math.random() * 400000
    }))
    setVolumeData(volumes)

    // 감성 ?�이??    const sentiments = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
      positive: Math.random() * 60 + 20,
      negative: Math.random() * 30 + 10,
      neutral: Math.random() * 40 + 20
    }))
    setSentimentData(sentiments)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <FaSync className="text-4xl text-purple-500" />
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto p-4">
        {/* ?�더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaBrain className="text-3xl text-purple-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{translateToKorean("AI ?�스 종합 분석")}</h1>
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-bold"
              >
                XAI v2.0
              </motion.span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKorean(!showKorean)}
                className={`p-2 rounded-lg ${showKorean ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700/50 text-gray-400'}`}
              >
                <FaLanguage />
              </button>
              <button className="p-2 bg-gray-700/50 rounded-lg text-gray-400 hover:text-white">
                <FaDownload />
              </button>
              <button className="p-2 bg-gray-700/50 rounded-lg text-gray-400 hover:text-white">
                <FaShare />
              </button>
            </div>
          </div>

          {/* 코인 ?�택�?*/}
          <EnhancedCoinSelector
            selectedSymbol={selectedSymbol}
            onSymbolChange={setSelectedSymbol}
            showPriceInfo={true}
          />
        </motion.div>

        {/* AI 분석 개요 */}
        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FaRobot className="text-purple-400" />
                  AI ?�측 결과
                </h2>
                <button
                  onClick={() => toggleSection('overview')}
                  className="text-gray-400 hover:text-white"
                >
                  {expandedSections.has('overview') ? <FaCompress /> : <FaExpand />}
                </button>
              </div>

              <AnimatePresence>
                {expandedSections.has('overview') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* ?�측 방향 */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">?�측 방향</div>
                        <div className={`text-3xl font-bold ${
                          aiAnalysis.prediction.sentiment === 'bullish' ? 'text-green-400' :
                          aiAnalysis.prediction.sentiment === 'bearish' ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {aiAnalysis.prediction.sentiment === 'bullish' ? '?�� ?�승' :
                           aiAnalysis.prediction.sentiment === 'bearish' ? '?�� ?�락' :
                           '?�️ ?�보'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {aiAnalysis.prediction.timeframe === 'short' ? '?�기 (1-3??' :
                           aiAnalysis.prediction.timeframe === 'medium' ? '중기 (1-2�?' :
                           '?�기 (1개월+)'}
                        </div>
                      </div>

                      {/* ?�뢰??*/}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">?�뢰??/div>
                        <div className="text-3xl font-bold text-purple-400">
                          {aiAnalysis.prediction.confidence}%
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full mt-2">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${aiAnalysis.prediction.confidence}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {explainableAI.generateConfidenceExplanation(aiAnalysis.prediction.confidence)}
                        </div>
                      </div>

                      {/* 가�??�향 */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">?�상 가�??�향</div>
                        <div className={`text-3xl font-bold ${
                          aiAnalysis.prediction.priceImpact > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {aiAnalysis.prediction.priceImpact > 0 ? '+' : ''}{aiAnalysis.prediction.priceImpact.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          리스???�벨: {aiAnalysis.riskAssessment.level === 'low' ? '?�� ??��' :
                                      aiAnalysis.riskAssessment.level === 'medium' ? '?�� 중간' :
                                      aiAnalysis.riskAssessment.level === 'high' ? '?�� ?�음' :
                                      '?�� 극도'}
                        </div>
                      </div>
                    </div>

                    {/* ?�레?�딩 ?�략 */}
                    <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-purple-400">{translateToKorean("?�� AI ?�레?�딩 ?�략")}</h3>
                      {(() => {
                        const strategy = explainableAI.generateTradingStrategy(aiAnalysis)
                        return (
    <NewsModuleWrapper moduleName="AISummaryModule">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="text-center">
                              <div className="text-xs text-gray-400">?�션</div>
                              <div className="font-semibold text-white">{strategy.action}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">진입가</div>
                              <div className="text-yellow-400">{strategy.entry}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">?�절가</div>
                              <div className="text-red-400">{strategy.stopLoss}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">목표가</div>
                              <div className="text-green-400">{strategy.takeProfit}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">?�버리�?</div>
                              <div className="text-purple-400">{strategy.leverage}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">?�본 배분</div>
                              <div className="text-blue-400">{strategy.allocation}</div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* 차트 ?�션 - 15가지 차트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* 1. 가�?차트 */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">{translateToKorean("?�� 가�?추이")}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} />
                <Line type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="ma7" stroke="#ec4899" strokeWidth={1} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 2. 거래??차트 */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">{translateToKorean("?�� 거래??분석")}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} />
                <Bar dataKey="buy" stackId="a" fill="#22c55e" />
                <Bar dataKey="sell" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 3. 감성 분석 차트 */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">?�� 감성 ?�렌??/h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} />
                <Area type="monotone" dataKey="positive" stackId="1" stroke="#22c55e" fill="#22c55e" />
                <Area type="monotone" dataKey="neutral" stackId="1" stroke="#9ca3af" fill="#9ca3af" />
                <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 4. ?�이 차트 - 감성 비율 */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">{translateToKorean("?�� 감성 비율")}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name} ${entry.value}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 5. ?�이??차트 - ?�각??분석 */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">{translateToKorean("?�� ?�각??분석")}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                <PolarRadiusAxis stroke="#9ca3af" />
                <Radar name="?�수" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 6. ?�드 ?�라?�드 */}
          {aiAnalysis && <WordCloud words={aiAnalysis.keywords.slice(0, 15)} />}

          {/* 7. ?�트�?*/}
          <HeatMap
            data={Array.from({ length: 35 }, (_, i) => ({
              value: Math.floor(Math.random() * 100)
            }))}
            title="?�� ?�동 ?�트�?
          />

          {/* 8. ?��?관�?매트�?�� */}
          <CorrelationMatrix data={[]} />

          {/* 9. ?�점??차트 - 가�?vs 거래??*/}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">{translateToKorean("?�� 가�?거래??분포")}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="price" stroke="#9ca3af" />
                <YAxis dataKey="volume" stroke="#9ca3af" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1f2937' }} />
                <Scatter name="Data" data={priceData.map(p => ({ price: p.price, volume: Math.random() * 1000000 }))} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ?�향 ?�인 분석 */}
        {aiAnalysis && (
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-bold mb-4">{translateToKorean("?�� 주요 ?�향 ?�인")}</h3>
            <div className="space-y-3">
              {aiAnalysis.factors.map((factor, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-700/50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{factor.name}</span>
                    <span className={`text-lg font-bold ${
                      factor.impact > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {factor.impact > 0 ? '+' : ''}{factor.impact}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">{factor.explanation}</div>
                  <div className="w-full h-2 bg-gray-600 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        factor.impact > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.abs(factor.impact)}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ?�스 카드 ?�션 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{translateToKorean("?�� 최신 ?�스")}</h2>
          {newsData.slice(0, 10).map((news, idx) => (
            <EnhancedNewsCard
              key={news.id}
              news={news}
              expanded={false}
            />
          ))}
        </div>
      </div>
    </div>
      </NewsModuleWrapper>
  )