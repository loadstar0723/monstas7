'use client'

import { useState, useEffect } from 'react'
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

// Recharts Ïª¥Ìè¨?åÌä∏??- ?ïÏ†Å import
import {
  LineChart, BarChart, RadarChart, PieChart, AreaChart, ScatterChart,
  ComposedChart, Treemap, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Line, Bar, Area, Scatter, Pie, Cell, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

// ?àÌä∏Îß?Ïª¥Ìè¨?åÌä∏
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

// ?åÎìú ?¥Îùº?∞Îìú Ïª¥Ìè¨?åÌä∏
const WordCloud = ({ words }: { words: { word: string; frequency: number; sentiment: number }[] }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <h3 className="text-lg font-bold mb-3">?ìä ?§Ïõå???¥Îùº?∞Îìú</h3>
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

// ?ÅÍ?Í¥ÄÍ≥?Îß§Ìä∏Î¶?ä§
const CorrelationMatrix = ({ data }: { data: any[][] }) => {
  const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP']

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <h3 className="text-lg font-bold mb-3">?îó ÏΩîÏù∏ ?ÅÍ?Í¥ÄÍ≥?/h3>
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

// ?åÏù¥ Ï∞®Ìä∏ ?∞Ïù¥??const pieData = [
  { name: 'Í∏çÏ†ï', value: 45, fill: '#22c55e' },
  { name: 'Î∂Ä??, value: 25, fill: '#ef4444' },
  { name: 'Ï§ëÎ¶Ω', value: 30, fill: '#9ca3af' }
]

// ?àÏù¥??Ï∞®Ìä∏ ?∞Ïù¥??const radarData = [
  { subject: 'Í∏∞Ïà†', A: 85, fullMark: 100 },
  { subject: 'Í∑úÏ†ú', A: 65, fullMark: 100 },
  { subject: 'Í∏∞Í?', A: 78, fullMark: 100 },
  { subject: '?åÏÖú', A: 72, fullMark: 100 },
  { subject: '?úÏû•', A: 88, fullMark: 100 },
  { subject: '?®Ï≤¥??, A: 80, fullMark: 100 }
]

export default function AISummaryPage() {
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

  // ?¥Ïä§ ?∞Ïù¥??Î°úÎìú
  useEffect(() => {
    loadNewsAndAnalysis()
  }, [selectedSymbol])

  // WebSocket ?§ÏãúÍ∞?Í∞ÄÍ≤?  useEffect(() => {
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
      // ?¥Ïä§ ?∞Ïù¥??Î°úÎìú
      const news = await newsDataService.getNews([selectedSymbol.replace('USDT', '')])
      setNewsData(news)

      // AI Î∂ÑÏÑù ?§Ìñâ
      const analysis = await explainableAI.analyzeNews(news, selectedSymbol)
      setAiAnalysis(analysis)

      // Ï∞®Ìä∏ ?∞Ïù¥???ùÏÑ±
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
      return newData.slice(-100) // ÏµúÍ∑º 100Í∞úÎßå ?†Ï?
    })
  }

  const generateChartData = (analysis: XAIAnalysis) => {
    // Í∞ÄÍ≤?Ï∞®Ìä∏ ?∞Ïù¥??    const prices = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      price: 50000 + Math.random() * 5000,
      ma7: 51000 + Math.random() * 2000,
      ma25: 50500 + Math.random() * 1500
    }))
    setPriceData(prices)

    // Í±∞Îûò???∞Ïù¥??    const volumes = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      volume: Math.random() * 1000000,
      buy: Math.random() * 600000,
      sell: Math.random() * 400000
    }))
    setVolumeData(volumes)

    // Í∞êÏÑ± ?∞Ïù¥??    const sentiments = Array.from({ length: 7 }, (_, i) => ({
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
        {/* ?§Îçî */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaBrain className="text-3xl text-purple-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI ?¥Ïä§ Ï¢ÖÌï© Î∂ÑÏÑù
              </h1>
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

          {/* ÏΩîÏù∏ ?†ÌÉùÍ∏?*/}
          <EnhancedCoinSelector
            selectedSymbol={selectedSymbol}
            onSymbolChange={setSelectedSymbol}
            showPriceInfo={true}
          />
        </motion.div>

        {/* AI Î∂ÑÏÑù Í∞úÏöî */}
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
                  AI ?àÏ∏° Í≤∞Í≥º
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
                      {/* ?àÏ∏° Î∞©Ìñ• */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">?àÏ∏° Î∞©Ìñ•</div>
                        <div className={`text-3xl font-bold ${
                          aiAnalysis.prediction.sentiment === 'bullish' ? 'text-green-400' :
                          aiAnalysis.prediction.sentiment === 'bearish' ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {aiAnalysis.prediction.sentiment === 'bullish' ? '?ìà ?ÅÏäπ' :
                           aiAnalysis.prediction.sentiment === 'bearish' ? '?ìâ ?òÎùΩ' :
                           '?°Ô∏è ?°Î≥¥'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {aiAnalysis.prediction.timeframe === 'short' ? '?®Í∏∞ (1-3??' :
                           aiAnalysis.prediction.timeframe === 'medium' ? 'Ï§ëÍ∏∞ (1-2Ï£?' :
                           '?•Í∏∞ (1Í∞úÏõî+)'}
                        </div>
                      </div>

                      {/* ?†Î¢∞??*/}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">?†Î¢∞??/div>
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

                      {/* Í∞ÄÍ≤??ÅÌñ• */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">?àÏÉÅ Í∞ÄÍ≤??ÅÌñ•</div>
                        <div className={`text-3xl font-bold ${
                          aiAnalysis.prediction.priceImpact > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {aiAnalysis.prediction.priceImpact > 0 ? '+' : ''}{aiAnalysis.prediction.priceImpact.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Î¶¨Ïä§???àÎ≤®: {aiAnalysis.riskAssessment.level === 'low' ? '?ü¢ ??ùå' :
                                      aiAnalysis.riskAssessment.level === 'medium' ? '?ü° Ï§ëÍ∞Ñ' :
                                      aiAnalysis.riskAssessment.level === 'high' ? '?ü† ?íÏùå' :
                                      '?î¥ Í∑πÎèÑ'}
                        </div>
                      </div>
                    </div>

                    {/* ?∏Î†à?¥Îî© ?ÑÎûµ */}
                    <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-purple-400">?í° AI ?∏Î†à?¥Îî© ?ÑÎûµ</h3>
                      {(() => {
                        const strategy = explainableAI.generateTradingStrategy(aiAnalysis)
                        return (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="text-center">
                              <div className="text-xs text-gray-400">?°ÏÖò</div>
                              <div className="font-semibold text-white">{strategy.action}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">ÏßÑÏûÖÍ∞Ä</div>
                              <div className="text-yellow-400">{strategy.entry}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">?êÏ†àÍ∞Ä</div>
                              <div className="text-red-400">{strategy.stopLoss}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">Î™©ÌëúÍ∞Ä</div>
                              <div className="text-green-400">{strategy.takeProfit}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">?àÎ≤ÑÎ¶¨Ï?</div>
                              <div className="text-purple-400">{strategy.leverage}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">?êÎ≥∏ Î∞∞Î∂Ñ</div>
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

        {/* Ï∞®Ìä∏ ?πÏÖò - 15Í∞ÄÏßÄ Ï∞®Ìä∏ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* 1. Í∞ÄÍ≤?Ï∞®Ìä∏ */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">?ìà Í∞ÄÍ≤?Ï∂îÏù¥</h3>
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

          {/* 2. Í±∞Îûò??Ï∞®Ìä∏ */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">?ìä Í±∞Îûò??Î∂ÑÏÑù</h3>
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

          {/* 3. Í∞êÏÑ± Î∂ÑÏÑù Ï∞®Ìä∏ */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">?òä Í∞êÏÑ± ?∏Î†å??/h3>
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

          {/* 4. ?åÏù¥ Ï∞®Ìä∏ - Í∞êÏÑ± ÎπÑÏú® */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">?•ß Í∞êÏÑ± ÎπÑÏú®</h3>
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

          {/* 5. ?àÏù¥??Ï∞®Ìä∏ - ?§Í∞Å??Î∂ÑÏÑù */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">?éØ ?§Í∞Å??Î∂ÑÏÑù</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                <PolarRadiusAxis stroke="#9ca3af" />
                <Radar name="?êÏàò" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 6. ?åÎìú ?¥Îùº?∞Îìú */}
          {aiAnalysis && <WordCloud words={aiAnalysis.keywords.slice(0, 15)} />}

          {/* 7. ?àÌä∏Îß?*/}
          <HeatMap
            data={Array.from({ length: 35 }, (_, i) => ({
              value: Math.floor(Math.random() * 100)
            }))}
            title="?î• ?úÎèô ?àÌä∏Îß?
          />

          {/* 8. ?ÅÍ?Í¥ÄÍ≥?Îß§Ìä∏Î¶?ä§ */}
          <CorrelationMatrix data={[]} />

          {/* 9. ?∞Ï†ê??Ï∞®Ìä∏ - Í∞ÄÍ≤?vs Í±∞Îûò??*/}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">?îµ Í∞ÄÍ≤?Í±∞Îûò??Î∂ÑÌè¨</h3>
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

        {/* ?ÅÌñ• ?îÏù∏ Î∂ÑÏÑù */}
        {aiAnalysis && (
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-bold mb-4">?éØ Ï£ºÏöî ?ÅÌñ• ?îÏù∏</h3>
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

        {/* ?¥Ïä§ Ïπ¥Îìú ?πÏÖò */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">?ì∞ ÏµúÏã† ?¥Ïä§</h2>
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
  )
}
