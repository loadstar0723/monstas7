'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  LineChart, BarChart, RadarChart, PieChart, AreaChart, ScatterChart,
  ComposedChart, Treemap,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Line, Bar, Area, Scatter, Pie, Cell, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, AlertTriangle, Zap, Heart,
  Brain, Users, MessageCircle, Twitter, Globe, Activity,
  BarChart3, PieChart as PieChartIcon, Loader2, RefreshCw,
  Smile, Frown, Meh, ThumbsUp, ThumbsDown, TrendingUpIcon
} from 'lucide-react'
import { sentimentService, type SentimentData, type SocialMetrics, type EmotionBreakdown } from '@/lib/services/sentimentAnalysis'
import { cn } from '@/lib/utils'

const MAJOR_COINS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC']

const SENTIMENT_COLORS = {
  'extreme_fear': '#FF0000',
  'fear': '#FF6B6B',
  'neutral': '#FFD93D',
  'greed': '#6BCF7F',
  'extreme_greed': '#00FF00',
  'positive': '#10B981',
  'negative': '#EF4444',
  'improving': '#3B82F6',
  'declining': '#F59E0B'
}

export default function SentimentAnalysisPage() {
  const [selectedCoin, setSelectedCoin] = useState('BTC')
  const [sentimentData, setSentimentData] = useState<Record<string, SentimentData>>({})
  const [socialMetrics, setSocialMetrics] = useState<SocialMetrics | null>(null)
  const [emotionBreakdown, setEmotionBreakdown] = useState<EmotionBreakdown | null>(null)
  const [fearGreedIndex, setFearGreedIndex] = useState<{ value: number; label: string } | null>(null)
  const [sentimentTrends, setSentimentTrends] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [activeTab, setActiveTab] = useState('overview')
  const [mounted, setMounted] = useState(false)

  // ?¥Îùº?¥Ïñ∏??ÎßàÏö¥???ïÏù∏
  useEffect(() => {
    setMounted(true)
  }, [])

  // ?§ÏãúÍ∞?Í∞êÏÑ± ?∞Ïù¥???§Ìä∏Î¶¨Î∞ç
  useEffect(() => {
    let cleanup: (() => void) | null = null

    const startStreaming = async () => {
      setIsLoading(true)

      cleanup = await sentimentService.streamSentiment(
        MAJOR_COINS,
        (data: SentimentData) => {
          setSentimentData(prev => ({
            ...prev,
            [data.coin]: data
          }))
          setLastUpdate(new Date())
        }
      )

      // Ï¥àÍ∏∞ ?∞Ïù¥??Î°úÎìú
      await loadInitialData()
      setIsLoading(false)
    }

    startStreaming()

    // 30Ï¥àÎßà???åÏÖú Î©îÌä∏Î¶??ÖÎç∞?¥Ìä∏
    const interval = setInterval(() => {
      loadSocialMetrics()
      loadFearGreedIndex()
    }, 30000)

    return () => {
      if (cleanup) cleanup()
      clearInterval(interval)
      sentimentService.closeAll()
    }
  }, [])

  // ?†ÌÉù??ÏΩîÏù∏ Î≥ÄÍ≤????ÅÏÑ∏ ?∞Ïù¥??Î°úÎìú
  useEffect(() => {
    if (selectedCoin) {
      loadCoinDetails(selectedCoin)
    }
  }, [selectedCoin])

  const loadInitialData = async () => {
    await Promise.all([
      loadFearGreedIndex(),
      loadSocialMetrics(),
      loadSentimentTrends()
    ])
  }

  const loadCoinDetails = async (coin: string) => {
    const [social, emotion, trends] = await Promise.all([
      sentimentService.getSocialMetrics(coin),
      sentimentService.getEmotionBreakdown(coin),
      sentimentService.getSentimentTrends(coin, 24)
    ])

    setSocialMetrics(social)
    setEmotionBreakdown(emotion)
    setSentimentTrends(trends)
  }

  const loadSocialMetrics = async () => {
    const metrics = await sentimentService.getSocialMetrics(selectedCoin)
    setSocialMetrics(metrics)
  }

  const loadFearGreedIndex = async () => {
    const index = await sentimentService.getFearGreedIndex()
    setFearGreedIndex(index)
  }

  const loadSentimentTrends = async () => {
    const trends = await sentimentService.getSentimentTrends(selectedCoin)
    setSentimentTrends(trends)
  }

  const getSentimentColor = (value: number) => {
    if (value >= 50) return SENTIMENT_COLORS.extreme_greed
    if (value >= 25) return SENTIMENT_COLORS.greed
    if (value >= -25) return SENTIMENT_COLORS.neutral
    if (value >= -50) return SENTIMENT_COLORS.fear
    return SENTIMENT_COLORS.extreme_fear
  }

  const getSentimentEmoji = (value: number) => {
    if (value >= 50) return '?òÑ'
    if (value >= 25) return '?ôÇ'
    if (value >= -25) return '?òê'
    if (value >= -50) return '?òü'
    return '?ò±'
  }

  const getSentimentLabel = (value: number) => {
    if (value >= 50) return 'Í∑πÎèÑ???ôÍ?'
    if (value >= 25) return '?ôÍ?'
    if (value >= -25) return 'Ï§ëÎ¶Ω'
    if (value >= -50) return 'ÎπÑÍ?'
    return 'Í∑πÎèÑ??ÎπÑÍ?'
  }

  // Í∞êÏ†ï ?∞Ïù¥?∞Î? Ï∞®Ìä∏?©ÏúºÎ°?Î≥Ä??  const emotionChartData = emotionBreakdown ? [
    { emotion: 'Í≥µÌè¨', value: emotionBreakdown.fear, color: '#FF4444' },
    { emotion: '?êÏöï', value: emotionBreakdown.greed, color: '#44FF44' },
    { emotion: 'Í∏∞ÏÅ®', value: emotionBreakdown.joy, color: '#FFD700' },
    { emotion: '?†Î¢∞', value: emotionBreakdown.trust, color: '#4169E1' },
    { emotion: 'Í∏∞Î?', value: emotionBreakdown.anticipation, color: '#FF69B4' },
    { emotion: '?Ä??, value: emotionBreakdown.surprise, color: '#FFA500' },
    { emotion: '?¨Ìîî', value: emotionBreakdown.sadness, color: '#708090' },
    { emotion: '?êÏò§', value: emotionBreakdown.disgust, color: '#8B4513' },
    { emotion: 'Î∂ÑÎÖ∏', value: emotionBreakdown.anger, color: '#DC143C' }
  ] : []

  // ?åÏÖú Î©îÌä∏Î¶??àÏù¥??Ï∞®Ìä∏ ?∞Ïù¥??  const socialRadarData = socialMetrics ? [
    { metric: 'Twitter ?∏Í∏â', value: Math.min(100, socialMetrics.twitter.mentions / 100) },
    { metric: 'Reddit ?úÎèô', value: Math.min(100, socialMetrics.reddit.activeUsers / 100) },
    { metric: 'Telegram ?±Ïû•', value: Math.min(100, socialMetrics.telegram.growth + 50) },
    { metric: '?∏ÌîåÎ£®Ïñ∏???êÏàò', value: socialMetrics.twitter.influencerScore },
    { metric: 'Ïª§Î??àÌã∞ Í∞êÏÑ±', value: (socialMetrics.reddit.sentiment + 100) / 2 }
  ] : []

  // ÏΩîÏù∏Î≥?Í∞êÏÑ± ?àÌä∏Îß??∞Ïù¥??  const heatmapData = MAJOR_COINS.map(coin => {
    const data = sentimentData[coin]
    return {
      coin,
      overall: data?.overall || 0,
      news: data?.news || 0,
      social: data?.social || 0,
      technical: data?.technical || 0,
      onchain: data?.onchain || 0
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ?§Îçî ?πÏÖò */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ?é≠ Í∞êÏÑ± Î∂ÑÏÑù ?Ä?úÎ≥¥??          </h1>
          <p className="text-gray-400 text-lg">
            ?§ÏãúÍ∞??úÏû• Í∞êÏÑ± ¬∑ ?åÏÖú ÎØ∏Îîî??Î∂ÑÏÑù ¬∑ AI Í∞êÏ†ï ?∏Ïãù
          </p>

          {/* ÎßàÏ?Îß??ÖÎç∞?¥Ìä∏ */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
            <span>?§ÏãúÍ∞??ÖÎç∞?¥Ìä∏: {mounted ? lastUpdate.toLocaleTimeString('ko-KR') : 'Î°úÎî©Ï§?..'}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.location.reload()}
              className="ml-2"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Fear & Greed Index */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                Í≥µÌè¨ & ?êÏöï ÏßÄ??              </h2>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {fearGreedIndex?.label || 'Î°úÎî©Ï§?..'}
              </Badge>
            </div>

            {fearGreedIndex && (
              <div className="space-y-4">
                <div className="relative">
                  <Progress
                    value={fearGreedIndex.value}
                    className="h-8"
                    style={{
                      background: `linear-gradient(to right,
                        ${SENTIMENT_COLORS.extreme_fear} 0%,
                        ${SENTIMENT_COLORS.fear} 25%,
                        ${SENTIMENT_COLORS.neutral} 50%,
                        ${SENTIMENT_COLORS.greed} 75%,
                        ${SENTIMENT_COLORS.extreme_greed} 100%)`
                    }}
                  />
                  <div
                    className="absolute top-0 h-full w-1 bg-white shadow-lg"
                    style={{ left: `${fearGreedIndex.value}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                    {fearGreedIndex.value}
                  </div>
                </div>

                <div className="grid grid-cols-5 text-xs text-gray-400">
                  <span>Í∑πÎèÑ??Í≥µÌè¨</span>
                  <span className="text-center">Í≥µÌè¨</span>
                  <span className="text-center">Ï§ëÎ¶Ω</span>
                  <span className="text-center">?êÏöï</span>
                  <span className="text-right">Í∑πÎèÑ???êÏöï</span>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ÏΩîÏù∏ ?†ÌÉù Î≤ÑÌäº */}
        <div className="flex gap-2 flex-wrap justify-center">
          {MAJOR_COINS.map(coin => {
            const data = sentimentData[coin]
            return (
              <motion.button
                key={coin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCoin(coin)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  "border backdrop-blur-sm",
                  selectedCoin === coin
                    ? "bg-purple-600 border-purple-400 text-white"
                    : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{coin}</span>
                  {data && (
                    <>
                      <span className="text-2xl">{getSentimentEmoji(data.overall)}</span>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: getSentimentColor(data.overall),
                          color: getSentimentColor(data.overall)
                        }}
                      >
                        {data.overall > 0 ? '+' : ''}{data.overall}
                      </Badge>
                    </>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Î©îÏù∏ ??Ïª®ÌÖêÏ∏?*/}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full bg-gray-800/50">
            <TabsTrigger value="overview">Ï¢ÖÌï©</TabsTrigger>
            <TabsTrigger value="social">?åÏÖú</TabsTrigger>
            <TabsTrigger value="emotion">Í∞êÏ†ï</TabsTrigger>
            <TabsTrigger value="trends">Ï∂îÏÑ∏</TabsTrigger>
            <TabsTrigger value="heatmap">?àÌä∏Îß?/TabsTrigger>
          </TabsList>

          {/* Ï¢ÖÌï© ??*/}
          <TabsContent value="overview" className="space-y-4">
            {sentimentData[selectedCoin] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    {selectedCoin} Ï¢ÖÌï© Í∞êÏÑ± Î∂ÑÏÑù
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries({
                      'Ï¢ÖÌï©': sentimentData[selectedCoin].overall,
                      '?¥Ïä§': sentimentData[selectedCoin].news,
                      '?åÏÖú': sentimentData[selectedCoin].social,
                      'Í∏∞Ïà†??: sentimentData[selectedCoin].technical,
                      '?®Ï≤¥??: sentimentData[selectedCoin].onchain
                    }).map(([label, value]) => (
                      <div key={label} className="text-center p-4 bg-gray-900/50 rounded-lg">
                        <div className="text-3xl mb-2">{getSentimentEmoji(value)}</div>
                        <div className="text-sm text-gray-400 mb-1">{label}</div>
                        <div
                          className="text-2xl font-bold"
                          style={{ color: getSentimentColor(value) }}
                        >
                          {value > 0 ? '+' : ''}{value}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getSentimentLabel(value)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ?†Î¢∞??Î∞?Ï∂îÏÑ∏ */}
                  <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm text-gray-400">?†Î¢∞?? </span>
                        <span className="font-bold text-purple-400">
                          {sentimentData[selectedCoin].confidence}%
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Ï∂îÏÑ∏: </span>
                        <Badge
                          variant={
                            sentimentData[selectedCoin].trend === 'improving' ? 'default' :
                            sentimentData[selectedCoin].trend === 'declining' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {sentimentData[selectedCoin].trend === 'improving' ? 'Í∞úÏÑ†Ï§??ìà' :
                           sentimentData[selectedCoin].trend === 'declining' ? '?òÎùΩÏ§??ìâ' :
                           '?àÏ†ï ?°Ô∏è'}
                        </Badge>
                      </div>
                    </div>

                    <Badge className="animate-pulse bg-purple-600">
                      ?§ÏãúÍ∞?Î∂ÑÏÑùÏ§?                    </Badge>
                  </div>
                </Card>

                {/* Í∞êÏÑ± Ï∂îÏÑ∏ Ï∞®Ìä∏ */}
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                  <h3 className="text-xl font-bold mb-4">24?úÍ∞Ñ Í∞êÏÑ± Ï∂îÏÑ∏</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={sentimentTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" domain={[-100, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #6B7280' }}
                        labelStyle={{ color: '#D1D5DB' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#8B5CF6"
                        fill="url(#sentimentGradient)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* ?åÏÖú ÎØ∏Îîî????*/}
          <TabsContent value="social" className="space-y-4">
            {socialMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Twitter Î©îÌä∏Î¶?*/}
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-blue-500/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Twitter className="w-5 h-5 text-blue-400" />
                    Twitter Î∂ÑÏÑù
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">?∏Í∏â ?üÏàò</span>
                      <span className="font-bold text-blue-400">
                        {socialMetrics.twitter.mentions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Í∞êÏÑ± ?êÏàò</span>
                      <span
                        className="font-bold"
                        style={{ color: getSentimentColor(socialMetrics.twitter.sentiment) }}
                      >
                        {socialMetrics.twitter.sentiment > 0 ? '+' : ''}
                        {socialMetrics.twitter.sentiment.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">?∏ÌîåÎ£®Ïñ∏???êÏàò</span>
                      <span className="font-bold text-purple-400">
                        {socialMetrics.twitter.influencerScore.toFixed(1)}/100
                      </span>
                    </div>
                    {socialMetrics.twitter.trendingRank && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">?∏Î†å???úÏúÑ</span>
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                          #{socialMetrics.twitter.trendingRank}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Reddit Î©îÌä∏Î¶?*/}
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-orange-500/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-orange-400" />
                    Reddit Î∂ÑÏÑù
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Í≤åÏãúÎ¨???/span>
                      <span className="font-bold text-orange-400">
                        {socialMetrics.reddit.posts.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">?ìÍ? ??/span>
                      <span className="font-bold text-orange-400">
                        {socialMetrics.reddit.comments.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">?úÏÑ± ?¨Ïö©??/span>
                      <span className="font-bold text-green-400">
                        {socialMetrics.reddit.activeUsers.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Í∞êÏÑ± ?êÏàò</span>
                      <span
                        className="font-bold"
                        style={{ color: getSentimentColor(socialMetrics.reddit.sentiment) }}
                      >
                        {socialMetrics.reddit.sentiment > 0 ? '+' : ''}
                        {socialMetrics.reddit.sentiment.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* ?åÏÖú ?àÏù¥??Ï∞®Ìä∏ */}
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20 md:col-span-2">
                  <h3 className="text-xl font-bold mb-4">?åÏÖú ÎØ∏Îîî??Ï¢ÖÌï© ÏßÄ??/h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={socialRadarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                      <PolarRadiusAxis stroke="#9CA3AF" domain={[0, 100]} />
                      <Radar
                        name="?åÏÖú ÏßÄ??
                        dataKey="value"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.6}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #6B7280' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Í∞êÏ†ï Î∂ÑÏÑù ??*/}
          <TabsContent value="emotion" className="space-y-4">
            {emotionBreakdown && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Í∞êÏ†ï ?åÏù¥ Ï∞®Ìä∏ */}
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                  <h3 className="text-xl font-bold mb-4">Í∞êÏ†ï Î∂ÑÌè¨</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={emotionChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ emotion, value }) => `${emotion} ${value.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {emotionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                {/* Í∞êÏ†ï ÎßâÎ? Ï∞®Ìä∏ */}
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                  <h3 className="text-xl font-bold mb-4">Í∞êÏ†ï Í∞ïÎèÑ</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={emotionChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="emotion" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #6B7280' }}
                      />
                      <Bar dataKey="value" fill="#8B5CF6">
                        {emotionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Í∞êÏ†ï ÏßÄ??Ïπ¥Îìú */}
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20 md:col-span-2">
                  <h3 className="text-xl font-bold mb-4">Ï£ºÏöî Í∞êÏ†ï ÏßÄ??/h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {[
                      { label: 'Í≥µÌè¨', value: emotionBreakdown.fear, emoji: '?ò®' },
                      { label: '?êÏöï', value: emotionBreakdown.greed, emoji: '?§ë' },
                      { label: 'Í∏∞ÏÅ®', value: emotionBreakdown.joy, emoji: '?òä' },
                      { label: '?†Î¢∞', value: emotionBreakdown.trust, emoji: '?§ù' },
                      { label: 'Í∏∞Î?', value: emotionBreakdown.anticipation, emoji: '?éØ' },
                      { label: '?Ä??, value: emotionBreakdown.surprise, emoji: '?ò≤' }
                    ].map((emotion) => (
                      <div key={emotion.label} className="text-center p-3 bg-gray-900/50 rounded-lg">
                        <div className="text-2xl mb-1">{emotion.emoji}</div>
                        <div className="text-sm text-gray-400">{emotion.label}</div>
                        <div className="text-xl font-bold text-purple-400">
                          {emotion.value.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Ï∂îÏÑ∏ Î∂ÑÏÑù ??*/}
          <TabsContent value="trends" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                <h3 className="text-xl font-bold mb-4">Í∞êÏÑ± Ï∂îÏÑ∏ Î∂ÑÏÑù</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={sentimentTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis yAxisId="left" stroke="#9CA3AF" domain={[-100, 100]} />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #6B7280' }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="value"
                      name="Í∞êÏÑ± ?êÏàò"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="volume"
                      name="Í±∞Îûò??
                      fill="#10B981"
                      opacity={0.5}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="momentum"
                      name="Î™®Î©ò?Ä"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>

              {/* Ï∂îÏÑ∏ ?µÍ≥Ñ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gray-800/50 backdrop-blur-sm border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">24?úÍ∞Ñ ÏµúÍ≥†</p>
                      <p className="text-2xl font-bold text-green-400">
                        +{Math.max(...sentimentTrends.map(t => t.value)).toFixed(1)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                </Card>

                <Card className="p-4 bg-gray-800/50 backdrop-blur-sm border-red-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">24?úÍ∞Ñ ÏµúÏ?</p>
                      <p className="text-2xl font-bold text-red-400">
                        {Math.min(...sentimentTrends.map(t => t.value)).toFixed(1)}
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-400" />
                  </div>
                </Card>

                <Card className="p-4 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">?âÍ∑† Í∞êÏÑ±</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {(sentimentTrends.reduce((a, b) => a + b.value, 0) / sentimentTrends.length).toFixed(1)}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-purple-400" />
                  </div>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          {/* ?àÌä∏Îß???*/}
          <TabsContent value="heatmap" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                <h3 className="text-xl font-bold mb-4">ÏΩîÏù∏Î≥?Í∞êÏÑ± ?àÌä∏Îß?/h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-2 text-gray-400">ÏΩîÏù∏</th>
                        <th className="text-center p-2 text-gray-400">Ï¢ÖÌï©</th>
                        <th className="text-center p-2 text-gray-400">?¥Ïä§</th>
                        <th className="text-center p-2 text-gray-400">?åÏÖú</th>
                        <th className="text-center p-2 text-gray-400">Í∏∞Ïà†??/th>
                        <th className="text-center p-2 text-gray-400">?®Ï≤¥??/th>
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapData.map((coin) => (
                        <tr key={coin.coin} className="border-b border-gray-800 hover:bg-gray-800/30">
                          <td className="p-2 font-medium">{coin.coin}</td>
                          {['overall', 'news', 'social', 'technical', 'onchain'].map((metric) => {
                            const value = coin[metric as keyof typeof coin] as number
                            return (
                              <td
                                key={metric}
                                className="p-2 text-center font-bold"
                                style={{
                                  backgroundColor: `rgba(139, 92, 246, ${Math.abs(value) / 100})`,
                                  color: Math.abs(value) > 50 ? 'white' : 'inherit'
                                }}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  {value > 0 ? <TrendingUp className="w-3 h-3" /> :
                                   value < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                                  {value}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ?àÌä∏Îß?Î≤îÎ? */}
                <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500"></div>
                    <span className="text-gray-400">Í∑πÎèÑ??ÎπÑÍ? (-100)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500"></div>
                    <span className="text-gray-400">Ï§ëÎ¶Ω (0)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500"></div>
                    <span className="text-gray-400">Í∑πÎèÑ???ôÍ? (+100)</span>
                  </div>
                </div>
              </Card>

              {/* ?∏Î¶¨Îß?Ï∞®Ìä∏ */}
              <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                <h3 className="text-xl font-bold mb-4">Í∞êÏÑ± Í∞ïÎèÑ ?∏Î¶¨Îß?/h3>
                <ResponsiveContainer width="100%" height={400}>
                  <Treemap
                    data={heatmapData.map(coin => ({
                      name: coin.coin,
                      size: Math.abs(coin.overall),
                      value: coin.overall
                    }))}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill={(entry: any) => getSentimentColor(entry.value)}
                  />
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* ?∏Î†à?¥Îî© ?ÑÎûµ ?úÏïà */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm border-purple-500/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              AI ?∏Î†à?¥Îî© ?ÑÎûµ ?úÏïà
            </h3>

            {sentimentData[selectedCoin] && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium mb-2 text-purple-400">?®Í∏∞ ?ÑÎûµ (1-24?úÍ∞Ñ)</h4>
                    <p className="text-sm text-gray-300">
                      {sentimentData[selectedCoin].overall > 25
                        ? "??Î°??¨Ï???Í∂åÏû• - Í∏çÏ†ï??Í∞êÏÑ±???∞ÏÑ∏?©Îãà??"
                        : sentimentData[selectedCoin].overall < -25
                        ? "?†Ô∏è ???¨Ï???Í≥†Î†§ - Î∂Ä?ïÏ†Å Í∞êÏÑ±??Í∞êÏ??©Îãà??"
                        : "?∏Ô∏è Í¥ÄÎß?Í∂åÏû• - Î™ÖÌôï??Î∞©Ìñ•?±Ïù¥ ?ÜÏäµ?àÎã§."}
                    </p>
                    <div className="mt-2 text-xs text-gray-400">
                      Í∂åÏû• ?àÎ≤ÑÎ¶¨Ï?: {Math.max(1, Math.min(3, 4 - Math.abs(sentimentData[selectedCoin].overall) / 25))}x
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium mb-2 text-purple-400">Ï§ëÏû•Í∏??ÑÎûµ (1Ï£?)</h4>
                    <p className="text-sm text-gray-300">
                      {sentimentData[selectedCoin].trend === 'improving'
                        ? "?ìà ?ÅÎ¶Ω??Îß§Ïàò Í∂åÏû• - Í∞êÏÑ±??Í∞úÏÑ†?òÍ≥† ?àÏäµ?àÎã§."
                        : sentimentData[selectedCoin].trend === 'declining'
                        ? "?ìâ ?¨Ï???Ï∂ïÏÜå Í∂åÏû• - Í∞êÏÑ±???ÖÌôî?òÍ≥† ?àÏäµ?àÎã§."
                        : "?°Ô∏è ?ÑÏû¨ ?¨Ï????†Ï? - ?àÏ†ï?ÅÏù∏ ?ÅÌÉú?ÖÎãà??"}
                    </p>
                    <div className="mt-2 text-xs text-gray-400">
                      ?êÎ≥∏ Î∞∞Î∂Ñ: ?ÑÏ≤¥ ?êÎ≥∏??{Math.min(20, Math.max(5, sentimentData[selectedCoin].confidence / 5))}%
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium">Î¶¨Ïä§???àÎ≤®</span>
                    </div>
                    <Badge
                      variant={
                        Math.abs(sentimentData[selectedCoin].overall) > 50 ? 'destructive' :
                        Math.abs(sentimentData[selectedCoin].overall) > 25 ? 'default' :
                        'secondary'
                      }
                    >
                      {Math.abs(sentimentData[selectedCoin].overall) > 50 ? '?íÏùå' :
                       Math.abs(sentimentData[selectedCoin].overall) > 25 ? 'Ï§ëÍ∞Ñ' :
                       '??ùå'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    * ???úÏïà?Ä AI Î∂ÑÏÑù??Í∏∞Î∞ò?òÎ©∞, ?¨Ïûê Ï°∞Ïñ∏???ÑÎãô?àÎã§. ??ÉÅ Î≥∏Ïù∏???êÎã®?ºÎ°ú ?¨Ïûê?òÏÑ∏??
                  </p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ?∏ÌÑ∞ ?ïÎ≥¥ */}
        <div className="text-center text-sm text-gray-500 pb-4">
          <p>?∞Ïù¥???úÍ≥µ: Binance, CryptoCompare, Alternative.me</p>
          <p>Í∞êÏÑ± Î∂ÑÏÑù ?îÏßÑ: MONSTA AI v2.0</p>
        </div>
      </div>
    </div>
  )
}
