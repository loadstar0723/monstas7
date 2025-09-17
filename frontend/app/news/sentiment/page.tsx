'use client'

import { useState, useEffect, useCallback } from 'react'
import { translateToKorean, translateNewsBody } from '@/lib/translateService'
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
import NewsModuleWrapper from '../components/NewsModuleWrapper'

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

export default function SentimentNewsModule() {
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

  // 라언??마운??인
  useEffect(() => {
    setMounted(true)
  }, [])

  // 시�?감성 데이??트리밍
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

      // 초기 데이??로드
      await loadInitialData()
      setIsLoading(false)
    }

    startStreaming()

    // 30초마??소셜 메트�?데트
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

  // 택??코인 변�???세 데이??로드
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
    if (value >= 50) return '��'
    if (value >= 25) return '��'
    if (value >= -25) return '��'
    if (value >= -50) return '��'
    return '��'
  }

  const getSentimentLabel = (value: number) => {
    if (value >= 50) return '극도?�?'
    if (value >= 25) return '��?'
    if (value >= -25) return '중립'
    if (value >= -50) return '비�?'
    return '극도??비�?'
  }

  // 감정 데이��? 차트으�?변??  const emotionChartData = emotionBreakdown ? [
    { emotion: '공포', value: emotionBreakdown.fear, color: '#FF4444' },
    { emotion: '욕', value: emotionBreakdown.greed, color: '#44FF44' },
    { emotion: '기쁨', value: emotionBreakdown.joy, color: '#FFD700' },
    { emotion: '뢰', value: emotionBreakdown.trust, color: '#4169E1' },
    { emotion: '기�?', value: emotionBreakdown.anticipation, color: '#FF69B4' },
    { emotion: '??, value: emotionBreakdown.surprise, color: '#FFA500' },
    { emotion: '픔', value: emotionBreakdown.sadness, color: '#708090' },
    { emotion: '오', value: emotionBreakdown.disgust, color: '#8B4513' },
    { emotion: '분노', value: emotionBreakdown.anger, color: '#DC143C' }
  ] : []

  // 소셜 메트�?데이??차트 데이??  const socialRadarData = socialMetrics ? [
    { metric: 'Twitter 급', value: Math.min(100, socialMetrics.twitter.mentions / 100) },
    { metric: 'Reddit 동', value: Math.min(100, socialMetrics.reddit.activeUsers / 100) },
    { metric: 'Telegram 시장', value: Math.min(100, socialMetrics.telegram.growth + 50) },
    { metric: '플루언??수', value: socialMetrics.twitter.influencerScore },
    { metric: '커�?티 감성', value: (socialMetrics.reddit.sentiment + 100) / 2 }
  ] : []

  // 코인�?감성 트�?데이??  const heatmapData = MAJOR_COINS.map(coin => {
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
        {/* 더 션 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{translateToKorean("�� 감성 분석 보??")}</h1>
          <p className="text-gray-400 text-lg">{translateNewsBody("시�?시장 감성 · 소셜 미디??분석 · AI 감정 식")}</p>

          {/* 마�?데트 */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
            <span>시�?데트: {mounted ? lastUpdate.toLocaleTimeString('ko-KR') : '로딩�?..'}</span>
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
                공포 & 욕 지??              </h2>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {fearGreedIndex?.label || '로딩�?..'}
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
                  <span>극도??공포</span>
                  <span className="text-center">공포</span>
                  <span className="text-center">중립</span>
                  <span className="text-center">욕</span>
                  <span className="text-right">극도??욕</span>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* 코인 택 버튼 */}
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

        {/* 메인 ??컨텐�?*/}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full bg-gray-800/50">
            <TabsTrigger value="overview">종합</TabsTrigger>
            <TabsTrigger value="social">소셜</TabsTrigger>
            <TabsTrigger value="emotion">감정</TabsTrigger>
            <TabsTrigger value="trends">추세</TabsTrigger>
            <TabsTrigger value="heatmap">트�?/TabsTrigger>
          </TabsList>

          {/* 종합 ??*/}
          <TabsContent value="overview" className="space-y-4">
            {sentimentData[selectedCoin] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    {selectedCoin} 종합 감성 분석
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries({
                      '종합': sentimentData[selectedCoin].overall,
                      '스': sentimentData[selectedCoin].news,
                      '소셜': sentimentData[selectedCoin].social,
                      '기술??: sentimentData[selectedCoin].technical,
                      '전체??: sentimentData[selectedCoin].onchain
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

                  {/* 뢰??추세 */}
                  <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm text-gray-400">뢰?? </span>
                        <span className="font-bold text-purple-400">
                          {sentimentData[selectedCoin].confidence}%
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">추세: </span>
                        <Badge
                          variant={
                            sentimentData[selectedCoin].trend === 'improving' ? 'default' :
                            sentimentData[selectedCoin].trend === 'declining' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {sentimentData[selectedCoin].trend === 'improving' ? '개선��' :
                           sentimentData[selectedCoin].trend === 'declining' ? '락��' :
                           '정 ️'}
                        </Badge>
                      </div>
                    </div>

                    <Badge className="animate-pulse bg-purple-600">
                      시�?분석�?                    </Badge>
                  </div>
                </Card>

                {/* 감성 추세 차트 */}
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                  <h3 className="text-xl font-bold mb-4">{translateToKorean("24간 감성 추세")}</h3>
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

          {/* 소셜 미디????*/}
          <TabsContent value="social" className="space-y-4">
            {socialMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Twitter 메트�?*/}
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-blue-500/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Twitter className="w-5 h-5 text-blue-400" />
                    Twitter 분석
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">급 수</span>
                      <span className="font-bold text-blue-400">
                        {socialMetrics.twitter.mentions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">감성 수</span>
                      <span
                        className="font-bold"
                        style={{ color: getSentimentColor(socialMetrics.twitter.sentiment) }}
                      >
                        {socialMetrics.twitter.sentiment > 0 ? '+' : ''}
                        {socialMetrics.twitter.sentiment.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">플루언??수</span>
                      <span className="font-bold text-purple-400">
                        {socialMetrics.twitter.influencerScore.toFixed(1)}/100
                      </span>
                    </div>
                    {socialMetrics.twitter.trendingRank && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">렌??위</span>
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                          #{socialMetrics.twitter.trendingRank}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Reddit 메트�?*/}
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-orange-500/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-orange-400" />
                    Reddit 분석
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">게시�???/span>
                      <span className="font-bold text-orange-400">
                        {socialMetrics.reddit.posts.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">��? ??/span>
                      <span className="font-bold text-orange-400">
                        {socialMetrics.reddit.comments.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">성 용??/span>
                      <span className="font-bold text-green-400">
                        {socialMetrics.reddit.activeUsers.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">감성 수</span>
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

                {/* 소셜 데이??차트 */}
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20 md:col-span-2">
                  <h3 className="text-xl font-bold mb-4">소셜 미디??종합 지??/h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={socialRadarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                      <PolarRadiusAxis stroke="#9CA3AF" domain={[0, 100]} />
                      <Radar
                        name="소셜 지??
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

          {/* 감정 분석 ??*/}
          <TabsContent value="emotion" className="space-y-4">
            {emotionBreakdown && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* 감정 데이 차트 */}
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                  <h3 className="text-xl font-bold mb-4">{translateToKorean("감정 분포")}</h3>
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

                {/* 감정 막�? 차트 */}
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                  <h3 className="text-xl font-bold mb-4">{translateToKorean("감정 강도")}</h3>
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

                {/* 감정 지??카드 */}
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20 md:col-span-2">
                  <h3 className="text-xl font-bold mb-4">주요 감정 지??/h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {[
                      { label: '공포', value: emotionBreakdown.fear, emoji: '��' },
                      { label: '욕', value: emotionBreakdown.greed, emoji: '��' },
                      { label: '기쁨', value: emotionBreakdown.joy, emoji: '��' },
                      { label: '뢰', value: emotionBreakdown.trust, emoji: '��' },
                      { label: '기�?', value: emotionBreakdown.anticipation, emoji: '��' },
                      { label: '??, value: emotionBreakdown.surprise, emoji: '��' }
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

          {/* 추세 분석 ??*/}
          <TabsContent value="trends" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                <h3 className="text-xl font-bold mb-4">{translateToKorean("감성 추세 분석")}</h3>
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
                      name="감성 수"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="volume"
                      name="거래??
                      fill="#10B981"
                      opacity={0.5}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="momentum"
                      name="모멘"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>

              {/* 추세 계 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gray-800/50 backdrop-blur-sm border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{translateNewsBody("24간 최고")}</p>
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
                      <p className="text-sm text-gray-400">{translateNewsBody("24간 최�?")}</p>
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
                      <p className="text-sm text-gray-400">{translateNewsBody("균 감성")}</p>
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

          {/* 트�???*/}
          <TabsContent value="heatmap" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                <h3 className="text-xl font-bold mb-4">코인�?감성 트�?/h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-2 text-gray-400">코인</th>
                        <th className="text-center p-2 text-gray-400">종합</th>
                        <th className="text-center p-2 text-gray-400">스</th>
                        <th className="text-center p-2 text-gray-400">소셜</th>
                        <th className="text-center p-2 text-gray-400">기술??/th>
                        <th className="text-center p-2 text-gray-400">전체??/th>
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

                {/* 트�?범�? */}
                <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500"></div>
                    <span className="text-gray-400">극도??비�? (-100)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500"></div>
                    <span className="text-gray-400">중립 (0)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500"></div>
                    <span className="text-gray-400">극도?�? (+100)</span>
                  </div>
                </div>
              </Card>

              {/* 리�?차트 */}
              <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                <h3 className="text-xl font-bold mb-4">감성 강도 리�?/h3>
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

        {/* 레딩 략 안 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm border-purple-500/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              AI 레딩 략 안
            </h3>

            {sentimentData[selectedCoin] && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium mb-2 text-purple-400">기 략 (1-24간)</h4>
                    <p className="text-sm text-gray-300">
                      {sentimentData[selectedCoin].overall > 25
                        ? "?�???권장 - 긍정??감성??세니??"
                        : sentimentData[selectedCoin].overall < -25
                        ? "️ ?�???고려 - 부적 감성??감�?니??"
                        : "️ 관�?권장 - 명확??방향데이 습다."}
                    </p>
                    <div className="mt-2 text-xs text-gray-400">
                      권장 버리�?: {Math.max(1, Math.min(3, 4 - Math.abs(sentimentData[selectedCoin].overall) / 25))}x
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium mb-2 text-purple-400">중장�?략 (1�?)</h4>
                    <p className="text-sm text-gray-300">
                      {sentimentData[selectedCoin].trend === 'improving'
                        ? "�� 립??매수 권장 - 감성??개선고 습다."
                        : sentimentData[selectedCoin].trend === 'declining'
                        ? "�� ��???축소 권장 - 감성??화고 습다."
                        : "️ 재 ��??�? - 정인 태니??"}
                    </p>
                    <div className="mt-2 text-xs text-gray-400">
                      본 배분: 전체 본??{Math.min(20, Math.max(5, sentimentData[selectedCoin].confidence / 5))}%
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium">리스??벨</span>
                    </div>
                    <Badge
                      variant={
                        Math.abs(sentimentData[selectedCoin].overall) > 50 ? 'destructive' :
                        Math.abs(sentimentData[selectedCoin].overall) > 25 ? 'default' :
                        'secondary'
                      }
                    >
                      {Math.abs(sentimentData[selectedCoin].overall) > 50 ? '음' :
                       Math.abs(sentimentData[selectedCoin].overall) > 25 ? '중간' :
                       '�'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{translateNewsBody("* ??안 AI 분석??기반며, 자 조언??닙다. � 본인??단로 자세??")}</p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* 터 보 */}
        <div className="text-center text-sm text-gray-500 pb-4">
          <p>{translateNewsBody("데이??공: Binance, CryptoCompare, Alternative.me")}</p>
          <p>{translateNewsBody("감성 분석 진: MONSTA AI v2.0")}</p>
        </div>
      </div>
    </div>
      </NewsModuleWrapper>
  )}
