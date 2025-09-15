'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBrain, FaTwitter, FaReddit, FaNewspaper, FaChartLine, FaExclamationTriangle } from 'react-icons/fa'
import { GiArtificialIntelligence } from 'react-icons/gi'
import { SiDiscord, SiTelegram } from 'react-icons/si'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, PieChart, Pie, ComposedChart
} from 'recharts'
import WordCloud from 'react-d3-cloud'

interface SentimentData {
  timestamp: number
  overall: number // -100 to 100
  sources: {
    twitter: number
    reddit: number
    news: number
    telegram: number
    discord: number
  }
  volume: {
    mentions: number
    posts: number
    articles: number
  }
  topics: {
    keyword: string
    sentiment: number
    frequency: number
  }[]
  emotions: {
    fear: number
    greed: number
    joy: number
    anger: number
    surprise: number
  }
}

interface InfluencerSentiment {
  name: string
  handle: string
  followers: number
  sentiment: number
  influence: number // 0-100
  recentPosts: {
    text: string
    sentiment: number
    engagement: number
    timestamp: number
  }[]
}

interface TrendingTopic {
  topic: string
  sentiment: number
  momentum: number // 변화율
  volume: number
  sources: string[]
}

interface SentimentAlert {
  id: string
  type: 'surge' | 'crash' | 'fud' | 'fomo' | 'manipulation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: number
  metrics: {
    sentimentChange: number
    volumeSpike: number
    sourceConsensus: number
  }
}

interface Props {
  symbol: string
  onSentimentAlert?: (alert: SentimentAlert) => void
  includeInfluencers?: boolean
  languages?: string[]
}

export default function AISentimentAnalysis({
  symbol,
  onSentimentAlert,
  includeInfluencers = true,
  languages = ['en', 'ko', 'ja', 'zh']
}: Props) {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null)
  const [historicalSentiment, setHistoricalSentiment] = useState<any[]>([])
  const [influencers, setInfluencers] = useState<InfluencerSentiment[]>([])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [alerts, setAlerts] = useState<SentimentAlert[]>([])
  const [wordCloudData, setWordCloudData] = useState<any[]>([])
  const [selectedSource, setSelectedSource] = useState<'all' | 'twitter' | 'reddit' | 'news'>('all')
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')
  
  const wsRef = useRef<WebSocket | null>(null)
  const analysisInterval = useRef<NodeJS.Timeout | null>(null)

  // 실시간 감성 데이터 수집
  useEffect(() => {
    // 실제로는 Twitter API, Reddit API, News API 등을 사용
    // 여기서는 시뮬레이션
    const collectSentimentData = async () => {
      try {
        // API 호출 시뮬레이션
        const sentiment = await generateMockSentimentData(symbol)
        setSentimentData(sentiment)
        
        // 히스토리컬 데이터
        const historical = generateHistoricalSentiment(timeRange)
        setHistoricalSentiment(historical)
        
        // 인플루언서 분석
        if (includeInfluencers) {
          const influencerData = await analyzeInfluencers(symbol)
          setInfluencers(influencerData)
        }
        
        // 트렌딩 토픽
        const topics = analyzeTrendingTopics(sentiment)
        setTrendingTopics(topics)
        
        // 워드 클라우드 데이터
        const cloudData = generateWordCloudData(sentiment.topics)
        setWordCloudData(cloudData)
        
        // 알림 체크
        checkSentimentAlerts(sentiment, historical)
      } catch (error) {
        console.error('Error collecting sentiment data:', error)
      }
    }

    collectSentimentData()
    analysisInterval.current = setInterval(collectSentimentData, 30000) // 30초마다

    return () => {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current)
      }
    }
  }, [symbol, timeRange, includeInfluencers])

  // 모의 감성 데이터 생성
  const generateMockSentimentData = async (symbol: string): Promise<SentimentData> => {
    // 기본 감성 점수 (시장 상황에 따라 조정)
    const baseScore = Math.random() * 100 - 50 // -50 to 50
    const volatility = Math.random() * 20
    
    return {
      timestamp: Date.now(),
      overall: baseScore + (Math.random() - 0.5) * volatility,
      sources: {
        twitter: baseScore + (Math.random() - 0.5) * 30,
        reddit: baseScore + (Math.random() - 0.5) * 25,
        news: baseScore + (Math.random() - 0.5) * 20,
        telegram: baseScore + (Math.random() - 0.5) * 35,
        discord: baseScore + (Math.random() - 0.5) * 40
      },
      volume: {
        mentions: Math.floor(Math.random() * 50000) + 10000,
        posts: Math.floor(Math.random() * 5000) + 1000,
        articles: Math.floor(Math.random() * 500) + 50
      },
      topics: [
        { keyword: symbol, sentiment: baseScore, frequency: 100 },
        { keyword: 'bullish', sentiment: 80, frequency: Math.random() * 80 + 20 },
        { keyword: 'bearish', sentiment: -70, frequency: Math.random() * 60 + 10 },
        { keyword: 'moon', sentiment: 90, frequency: Math.random() * 50 + 10 },
        { keyword: 'crash', sentiment: -90, frequency: Math.random() * 40 + 5 },
        { keyword: 'hodl', sentiment: 60, frequency: Math.random() * 70 + 20 },
        { keyword: 'dump', sentiment: -80, frequency: Math.random() * 30 + 5 },
        { keyword: 'pump', sentiment: 85, frequency: Math.random() * 40 + 10 },
        { keyword: 'support', sentiment: 40, frequency: Math.random() * 35 + 15 },
        { keyword: 'resistance', sentiment: -20, frequency: Math.random() * 30 + 10 }
      ],
      emotions: {
        fear: Math.random() * 40 + 10,
        greed: Math.random() * 40 + 20,
        joy: Math.random() * 30 + 10,
        anger: Math.random() * 20 + 5,
        surprise: Math.random() * 25 + 5
      }
    }
  }

  // 히스토리컬 감성 데이터 생성
  const generateHistoricalSentiment = (timeRange: string) => {
    const periods = timeRange === '1h' ? 60 : timeRange === '24h' ? 24 : 168 // 7d
    const interval = timeRange === '1h' ? 'minute' : 'hour'
    const data = []
    
    for (let i = 0; i < periods; i++) {
      const baseScore = Math.sin(i / 10) * 30 + (Math.random() - 0.5) * 20
      data.push({
        time: timeRange === '1h' 
          ? `${i}m ago`
          : timeRange === '24h'
          ? `${i}h ago`
          : `${Math.floor(i / 24)}d ${i % 24}h`,
        overall: baseScore,
        twitter: baseScore + (Math.random() - 0.5) * 15,
        reddit: baseScore + (Math.random() - 0.5) * 12,
        news: baseScore + (Math.random() - 0.5) * 10,
        volume: Math.random() * 10000 + 5000
      })
    }
    
    return data.reverse()
  }

  // 인플루언서 분석
  const analyzeInfluencers = async (symbol: string): Promise<InfluencerSentiment[]> => {
    // 실제로는 Twitter API 등을 사용
    const mockInfluencers = [
      {
        name: 'Crypto Whale',
        handle: '@cryptowhale',
        followers: 500000,
        sentiment: 75,
        influence: 90
      },
      {
        name: 'Bitcoin Maximalist',
        handle: '@btcmaxi',
        followers: 300000,
        sentiment: 85,
        influence: 75
      },
      {
        name: 'DeFi Degen',
        handle: '@defidegen',
        followers: 150000,
        sentiment: -20,
        influence: 60
      },
      {
        name: 'Altcoin Daily',
        handle: '@altcoindaily',
        followers: 1000000,
        sentiment: 60,
        influence: 95
      },
      {
        name: 'Crypto Analyst',
        handle: '@cryptoanalyst',
        followers: 250000,
        sentiment: 40,
        influence: 70
      }
    ]
    
    return mockInfluencers.map(influencer => ({
      ...influencer,
      recentPosts: [
        {
          text: `${symbol} looking strong! Key support holding well. 🚀`,
          sentiment: 80,
          engagement: Math.floor(Math.random() * 10000) + 1000,
          timestamp: Date.now() - Math.random() * 3600000
        },
        {
          text: `Market structure on ${symbol} remains bullish despite the FUD`,
          sentiment: 60,
          engagement: Math.floor(Math.random() * 8000) + 500,
          timestamp: Date.now() - Math.random() * 7200000
        }
      ]
    }))
  }

  // 트렌딩 토픽 분석
  const analyzeTrendingTopics = (sentiment: SentimentData): TrendingTopic[] => {
    return sentiment.topics
      .filter(topic => topic.frequency > 30)
      .map(topic => ({
        topic: topic.keyword,
        sentiment: topic.sentiment,
        momentum: (Math.random() - 0.5) * 100,
        volume: topic.frequency * 100,
        sources: ['twitter', 'reddit', 'telegram'].filter(() => Math.random() > 0.5)
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5)
  }

  // 워드 클라우드 데이터 생성
  const generateWordCloudData = (topics: any[]) => {
    return topics.map(topic => ({
      text: topic.keyword,
      value: topic.frequency,
      sentiment: topic.sentiment
    }))
  }

  // 감성 알림 체크
  const checkSentimentAlerts = (current: SentimentData, historical: any[]) => {
    const newAlerts: SentimentAlert[] = []
    
    // 급격한 감성 변화 감지
    if (historical.length > 0) {
      const recentAvg = historical.slice(-5).reduce((sum, d) => sum + d.overall, 0) / 5
      const change = current.overall - recentAvg
      
      if (Math.abs(change) > 30) {
        newAlerts.push({
          id: `${Date.now()}-surge`,
          type: change > 0 ? 'fomo' : 'fud',
          severity: Math.abs(change) > 50 ? 'critical' : 'high',
          message: `급격한 감성 ${change > 0 ? '상승' : '하락'}: ${change.toFixed(1)}포인트`,
          timestamp: Date.now(),
          metrics: {
            sentimentChange: change,
            volumeSpike: current.volume.mentions / 20000,
            sourceConsensus: calculateSourceConsensus(current.sources)
          }
        })
      }
    }
    
    // 조작 의심 패턴
    const sourceValues = Object.values(current.sources)
    const sourceVariance = calculateVariance(sourceValues)
    if (sourceVariance < 5 && current.volume.mentions > 40000) {
      newAlerts.push({
        id: `${Date.now()}-manipulation`,
        type: 'manipulation',
        severity: 'medium',
        message: '비정상적 감성 일치 패턴 감지 - 조작 가능성',
        timestamp: Date.now(),
        metrics: {
          sentimentChange: 0,
          volumeSpike: current.volume.mentions / 20000,
          sourceConsensus: 95
        }
      })
    }
    
    setAlerts(prev => [...newAlerts, ...prev.slice(0, 10)])
    
    // 콜백 실행
    if (onSentimentAlert && newAlerts.length > 0) {
      newAlerts.forEach(alert => onSentimentAlert(alert))
    }
  }

  // 소스 일치도 계산
  const calculateSourceConsensus = (sources: any): number => {
    const values = Object.values(sources) as number[]
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const variance = calculateVariance(values)
    return Math.max(0, 100 - variance)
  }

  // 분산 계산
  const calculateVariance = (values: number[]): number => {
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  // 감성 색상 결정
  const getSentimentColor = (sentiment: number): string => {
    if (sentiment > 50) return '#10B981' // 녹색
    if (sentiment > 20) return '#84CC16' // 연녹색
    if (sentiment > -20) return '#F59E0B' // 노란색
    if (sentiment > -50) return '#F97316' // 주황색
    return '#EF4444' // 빨간색
  }

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-lg border border-blue-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <GiArtificialIntelligence className="text-blue-400" />
            AI 감성 분석
          </h3>
          <div className="flex items-center gap-4">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as any)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            >
              <option value="all">전체 소스</option>
              <option value="twitter">Twitter</option>
              <option value="reddit">Reddit</option>
              <option value="news">뉴스</option>
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            >
              <option value="1h">1시간</option>
              <option value="24h">24시간</option>
              <option value="7d">7일</option>
            </select>
          </div>
        </div>

        {/* 종합 감성 점수 */}
        {sentimentData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/50 rounded-lg p-4 text-center"
            >
              <div className="text-gray-400 text-sm mb-2">종합 감성 점수</div>
              <div 
                className="text-5xl font-bold mb-2"
                style={{ color: getSentimentColor(sentimentData.overall) }}
              >
                {sentimentData.overall.toFixed(0)}
              </div>
              <div className="text-sm text-gray-400">
                {sentimentData.overall > 50 ? '매우 긍정적' :
                 sentimentData.overall > 20 ? '긍정적' :
                 sentimentData.overall > -20 ? '중립' :
                 sentimentData.overall > -50 ? '부정적' :
                 '매우 부정적'}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/50 rounded-lg p-4"
            >
              <div className="text-gray-400 text-sm mb-2">언급량</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-300">총 언급</span>
                  <span className="text-white font-bold">
                    {sentimentData.volume.mentions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">게시물</span>
                  <span className="text-white">
                    {sentimentData.volume.posts.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">기사</span>
                  <span className="text-white">
                    {sentimentData.volume.articles}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/50 rounded-lg p-4"
            >
              <div className="text-gray-400 text-sm mb-2">감정 분포</div>
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-300">공포</span>
                    <span className="text-white">{sentimentData.emotions.fear.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">탐욕</span>
                    <span className="text-white">{sentimentData.emotions.greed.toFixed(0)}%</span>
                  </div>
                </div>
                <ResponsiveContainer width={100} height={80}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Fear', value: sentimentData.emotions.fear },
                        { name: 'Greed', value: sentimentData.emotions.greed },
                        { name: 'Other', value: 100 - sentimentData.emotions.fear - sentimentData.emotions.greed }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={35}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      <Cell fill="#EF4444" />
                      <Cell fill="#10B981" />
                      <Cell fill="#6B7280" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* 실시간 알림 */}
      <AnimatePresence>
        {alerts.slice(0, 3).map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`p-4 rounded-lg border flex items-center gap-3 ${
              alert.severity === 'critical' ? 'bg-red-900/30 border-red-500' :
              alert.severity === 'high' ? 'bg-orange-900/30 border-orange-500' :
              alert.severity === 'medium' ? 'bg-yellow-900/30 border-yellow-500' :
              'bg-blue-900/30 border-blue-500'
            }`}
          >
            <FaExclamationTriangle className={`text-xl ${
              alert.severity === 'critical' ? 'text-red-500' :
              alert.severity === 'high' ? 'text-orange-500' :
              alert.severity === 'medium' ? 'text-yellow-500' :
              'text-blue-500'
            }`} />
            <div className="flex-1">
              <div className="text-white font-semibold">{alert.message}</div>
              <div className="text-sm text-gray-400">
                {new Date(alert.timestamp).toLocaleTimeString()} | 
                변화: {alert.metrics.sentimentChange.toFixed(1)} | 
                볼륨: {alert.metrics.volumeSpike.toFixed(1)}x
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 소스별 감성 차트 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4">플랫폼별 감성 추이</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historicalSentiment}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" domain={[-100, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Legend />
            
            {(selectedSource === 'all' || selectedSource === 'twitter') && (
              <Line
                type="monotone"
                dataKey="twitter"
                stroke="#1DA1F2"
                strokeWidth={2}
                dot={false}
                name="Twitter"
              />
            )}
            {(selectedSource === 'all' || selectedSource === 'reddit') && (
              <Line
                type="monotone"
                dataKey="reddit"
                stroke="#FF4500"
                strokeWidth={2}
                dot={false}
                name="Reddit"
              />
            )}
            {(selectedSource === 'all' || selectedSource === 'news') && (
              <Line
                type="monotone"
                dataKey="news"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                name="News"
              />
            )}
            {selectedSource === 'all' && (
              <Line
                type="monotone"
                dataKey="overall"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={false}
                name="종합"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 워드 클라우드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaBrain className="text-purple-400" />
            키워드 클라우드
          </h4>
          <div className="h-[300px] flex items-center justify-center">
            <WordCloud
              data={wordCloudData}
              width={400}
              height={300}
              font="sans-serif"
              fontWeight="bold"
              fontSize={(word) => Math.log2(word.value) * 10}
              fill={(d, i) => getSentimentColor(d.sentiment)}
              rotate={() => 0}
              padding={5}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-yellow-400" />
            트렌딩 토픽
          </h4>
          <div className="space-y-2">
            {trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.topic}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">#{topic.topic}</span>
                  <div className="flex items-center gap-2">
                    {topic.sources.includes('twitter') && <FaTwitter className="text-blue-400 text-sm" />}
                    {topic.sources.includes('reddit') && <FaReddit className="text-orange-500 text-sm" />}
                    {topic.sources.includes('telegram') && <SiTelegram className="text-blue-500 text-sm" />}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">감성:</span>
                    <span 
                      className="font-semibold"
                      style={{ color: getSentimentColor(topic.sentiment) }}
                    >
                      {topic.sentiment.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">모멘텀:</span>
                    <span className={`font-semibold ${
                      topic.momentum > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {topic.momentum > 0 ? '+' : ''}{topic.momentum.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-gray-400">
                    {(topic.volume / 1000).toFixed(1)}k
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 인플루언서 분석 */}
      {includeInfluencers && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaTwitter className="text-blue-400" />
            주요 인플루언서 감성
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {influencers.map((influencer) => (
              <motion.div
                key={influencer.handle}
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-semibold">{influencer.name}</div>
                    <div className="text-gray-400 text-sm">{influencer.handle}</div>
                  </div>
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: getSentimentColor(influencer.sentiment) }}
                  >
                    {influencer.sentiment}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="text-gray-400">팔로워</span>
                  <span className="text-white">{(influencer.followers / 1000).toFixed(0)}K</span>
                  <span className="text-gray-400">영향력</span>
                  <span className="text-purple-400 font-semibold">{influencer.influence}%</span>
                </div>
                
                <div className="space-y-2">
                  {influencer.recentPosts.slice(0, 1).map((post, i) => (
                    <div key={i} className="p-2 bg-gray-800/50 rounded text-xs">
                      <p className="text-gray-300 line-clamp-2">{post.text}</p>
                      <div className="flex items-center justify-between mt-1 text-gray-500">
                        <span>👍 {post.engagement.toLocaleString()}</span>
                        <span>{new Date(post.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 감정 레이더 차트 */}
      {sentimentData && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4">감정 분석 레이더</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[
              { emotion: '공포', value: sentimentData.emotions.fear },
              { emotion: '탐욕', value: sentimentData.emotions.greed },
              { emotion: '기쁨', value: sentimentData.emotions.joy },
              { emotion: '분노', value: sentimentData.emotions.anger },
              { emotion: '놀람', value: sentimentData.emotions.surprise }
            ]}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="emotion" stroke="#9CA3AF" />
              <PolarRadiusAxis domain={[0, 50]} stroke="#9CA3AF" />
              <Radar
                name="감정 강도"
                dataKey="value"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}