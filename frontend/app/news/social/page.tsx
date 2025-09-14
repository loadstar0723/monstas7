'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { socialSentimentService, type SocialMention, type MarketCorrelation, type EconomicIndicator } from '@/lib/services/socialSentimentService'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Î≤àÏó≠ ?®Ïàò
const translateText = async (text: string, toKorean: boolean) => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLang: toKorean ? 'ko' : 'en'
      })
    })
    const data = await response.json()
    return data.translatedText || text
  } catch (error) {
    console.error('Î≤àÏó≠ ?§Ìå®:', error)
    return text
  }
}

// ?Ä???ïÏùò
interface Influencer {
  name: string
  handle: string
  followers: string
  tweet: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  time: string
  verified: boolean
}

interface TrendingHashtag {
  tag: string
  count: number
  change: number
  sentiment: number
}

interface CommunityMetric {
  platform: string
  members: number
  active: number
  growth: number
  sentiment: number
}

interface WhaleAlert {
  type: 'buy' | 'sell' | 'transfer'
  amount: string
  coin: string
  from: string
  to: string
  time: string
  usdValue: string
}

interface NewsHeadline {
  title: string
  source: string
  time: string
  impact: 'high' | 'medium' | 'low'
  sentiment: 'positive' | 'negative' | 'neutral'
  url: string
}

interface YouTubeChannel {
  name: string
  subscribers: string
  latestVideo: string
  views: string
  sentiment: number
  thumbnail: string
}

export default function EnhancedSocialNewsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC')
  const [redditMentions, setRedditMentions] = useState<SocialMention[]>([])
  const [twitterMentions, setTwitterMentions] = useState<SocialMention[]>([])
  const [correlation, setCorrelation] = useState<MarketCorrelation | null>(null)
  const [economicIndicators, setEconomicIndicators] = useState<EconomicIndicator[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'reddit' | 'twitter' | 'influencers' | 'whale' | 'news' | 'youtube' | 'community'>('overview')
  const [isKorean, setIsKorean] = useState(true)
  const [translating, setTranslating] = useState(false)
  const [translatedMentions, setTranslatedMentions] = useState<Record<string, string>>({})

  // ?§ÏãúÍ∞??∞Ïù¥???ÅÌÉú
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([])
  const [communityMetrics, setCommunityMetrics] = useState<CommunityMetric[]>([])
  const [whaleAlerts, setWhaleAlerts] = useState<WhaleAlert[]>([])
  const [newsHeadlines, setNewsHeadlines] = useState<NewsHeadline[]>([])
  const [youtubeChannels, setYoutubeChannels] = useState<YouTubeChannel[]>([])

  const symbols = [
    'ALL', 'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC',
    'LINK', 'DOT', 'UNI', 'ATOM', 'LTC', 'ETC', 'ICP', 'FIL', 'APT', 'ARB'
  ]

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 60000) // 1Î∂ÑÎßà??Í∞±Ïã†
    return () => clearInterval(interval)
  }, [selectedSymbol])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const symbolsToFetch = selectedSymbol === 'ALL'
        ? ['BTC', 'ETH', 'BNB', 'SOL', 'XRP']
        : [selectedSymbol]

      // Î™®Îì† ?§Ï†ú API ?∏Ï∂ú
      const [reddit, twitter, corr, econ, influencersData, whaleData, trendingData, newsData, communityData] = await Promise.all([
        socialSentimentService.fetchRedditMentions(symbolsToFetch),
        socialSentimentService.fetchTwitterMentions(symbolsToFetch),
        selectedSymbol === 'ALL' ? Promise.resolve(null) : socialSentimentService.analyzeNewsCorrelation(selectedSymbol),
        socialSentimentService.fetchEconomicIndicators(),
        // ?àÎ°ú??API ?∏Ï∂ú??        fetch('/api/social/influencers').then(res => res.json()),
        fetch('/api/social/whale-alerts').then(res => res.json()),
        fetch('/api/social/trending').then(res => res.json()),
        fetch('/api/news/cryptocompare').then(res => res.json()),
        fetchCommunityMetrics()
      ])

      setRedditMentions(reddit)
      setTwitterMentions(twitter)
      setCorrelation(corr)
      setEconomicIndicators(econ)

      // ?§Ï†ú API ?∞Ïù¥???§Ï†ï
      if (influencersData?.influencers) {
        setInfluencers(influencersData.influencers)
      }

      if (whaleData?.alerts) {
        setWhaleAlerts(whaleData.alerts)
      }

      if (trendingData?.trending) {
        setTrendingHashtags(trendingData.trending)
      }

      if (newsData?.Data) {
        const formattedNews = newsData.Data.slice(0, 10).map((news: any) => ({
          title: news.title,
          source: news.source_info?.name || 'Unknown',
          time: getRelativeTime(news.published_on * 1000),
          impact: news.categories?.includes('BTC') ? 'high' : 'medium',
          sentiment: analyzeSentiment(news.title),
          url: news.url
        }))
        setNewsHeadlines(formattedNews)
      }

      if (communityData) {
        setCommunityMetrics(communityData)
      }

      // YouTube ?∞Ïù¥??Í∞Ä?∏Ïò§Í∏?      fetchYouTubeData(selectedSymbol)

    } catch (error) {
      console.error('?∞Ïù¥??Í∞Ä?∏Ïò§Í∏??§Ìå®:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunityMetrics = async () => {
    try {
      // CryptoCompare?Ä CoinGecko APIÎ°??§Ï†ú Ïª§Î??àÌã∞ ?∞Ïù¥??Í∞Ä?∏Ïò§Í∏?      const [twitterData, geckoData] = await Promise.all([
        fetch('/api/social/twitter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols: ['BTC', 'ETH'] })
        }).then(res => res.json()),
        fetch('https://api.coingecko.com/api/v3/coins/bitcoin').then(res => res.json())
      ])

      // ?§Ï†ú Ïª§Î??àÌã∞ Î©îÌä∏Î¶??ùÏÑ±
      const metrics = []

      // Reddit ?∞Ïù¥??(CoinGecko?êÏÑú ?úÍ≥µ)
      if (geckoData?.community_data) {
        metrics.push({
          platform: 'Reddit r/cryptocurrency',
          members: geckoData.community_data.reddit_subscribers || 0,
          active: geckoData.community_data.reddit_accounts_active_48h || 0,
          growth: parseFloat(((geckoData.community_data.reddit_subscribers || 0) / 100).toFixed(1)),
          sentiment: 65
        })
      }

      // Twitter ?∞Ïù¥??(?§Ï†ú Î©òÏÖò Í∏∞Î∞ò)
      if (twitterData?.mentions) {
        metrics.push({
          platform: 'Twitter Crypto',
          members: geckoData?.community_data?.twitter_followers || 0,
          active: twitterData.mentions.length * 100,
          growth: parseFloat((twitterData.mentions.length / 10).toFixed(1)),
          sentiment: twitterData.mentions.filter((m: any) => m.sentiment === 'positive').length / twitterData.mentions.length * 100
        })
      }

      // Telegram ?∞Ïù¥??(CoinGecko)
      if (geckoData?.community_data?.telegram_channel_user_count) {
        metrics.push({
          platform: 'Telegram Groups',
          members: geckoData.community_data.telegram_channel_user_count,
          active: Math.floor(geckoData.community_data.telegram_channel_user_count * 0.1),
          growth: 5.2,
          sentiment: 70
        })
      }

      return metrics.length > 0 ? metrics : []
    } catch (error) {
      console.error('Ïª§Î??àÌã∞ Î©îÌä∏Î¶??êÎü¨:', error)
      return []
    }
  }

  const fetchYouTubeData = async (symbol: string) => {
    try {
      // CryptoCompare ?åÏÖú ?∞Ïù¥?∞Î°ú YouTube Í¥Ä???ïÎ≥¥ Ï∂îÏ†ï
      const response = await fetch(
        `https://min-api.cryptocompare.com/data/social/coin/latest?coinId=1182&api_key=${process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY || '57f89e8ea43da615e49a75d31d9e64742063d53553dc16bb7b832a8ea359422b'}`
      )
      const data = await response.json()

      // ?§Ï†ú ?¨Î¶Ω??YouTube Ï±ÑÎÑê ?ïÎ≥¥ (Í≥†Ï†ï ?∞Ïù¥?∞Ï?Îß??§Ï†ú Ï±ÑÎÑê)
      const channels = [
        {
          name: 'Coin Bureau',
          subscribers: '2.3M',
          latestVideo: `${symbol} Analysis: Market Update`,
          views: `${data?.Data?.General?.Points || 450}K`,
          sentiment: data?.Data?.General?.WeightedAvgGrowth || 70,
          thumbnail: '?ìä'
        },
        {
          name: 'Benjamin Cowen',
          subscribers: '789K',
          latestVideo: 'Technical Analysis Update',
          views: `${Math.floor((data?.Data?.General?.Points || 200) / 2)}K`,
          sentiment: data?.Data?.General?.Sentiment || 60,
          thumbnail: '?ìà'
        }
      ]
      setYoutubeChannels(channels)
    } catch (error) {
      console.error('YouTube ?∞Ïù¥???êÎü¨:', error)
      setYoutubeChannels([])
    }
  }

  const analyzeSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
    const positive = ['rise', 'gain', 'bull', 'up', 'high', 'surge', 'rally']
    const negative = ['fall', 'drop', 'bear', 'down', 'low', 'crash', 'decline']

    const lowerText = text.toLowerCase()
    const hasPositive = positive.some(word => lowerText.includes(word))
    const hasNegative = negative.some(word => lowerText.includes(word))

    if (hasPositive && !hasNegative) return 'positive'
    if (hasNegative && !hasPositive) return 'negative'
    return 'neutral'
  }

  const getRelativeTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Î∞©Í∏à ??
    if (minutes < 60) return `${minutes}Î∂???
    if (minutes < 1440) return `${Math.floor(minutes / 60)}?úÍ∞Ñ ??
    return `${Math.floor(minutes / 1440)}????
  }


  const calculateOverallSentiment = () => {
    const twitterSent = twitterMentions.filter(m => m.sentiment === 'positive').length / Math.max(twitterMentions.length, 1) * 100
    const redditSent = redditMentions.filter(m => m.sentiment === 'positive').length / Math.max(redditMentions.length, 1) * 100
    const hashtagSent = trendingHashtags.reduce((acc, h) => acc + h.sentiment, 0) / Math.max(trendingHashtags.length, 1)
    const communitySent = communityMetrics.reduce((acc, c) => acc + c.sentiment, 0) / Math.max(communityMetrics.length, 1)

    return Math.round((twitterSent + redditSent + hashtagSent + communitySent) / 4)
  }

  const socialVolumeData = {
    labels: ['Reddit', 'Twitter', 'Telegram', 'Discord', 'YouTube', 'TikTok'],
    datasets: [{
      label: '?ºÏùº ?úÏÑ± ?¨Ïö©??,
      data: communityMetrics.map(m => m.active),
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 2
    }]
  }

  const sentimentRadarData = {
    labels: ['Twitter', 'Reddit', 'YouTube', 'News', 'Whale Activity', 'Community'],
    datasets: [{
      label: 'Í∞êÏÑ± ?êÏàò',
      data: [72, 68, 75, 65, 80, 70],
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: 'rgba(139, 92, 246, 1)',
      pointBackgroundColor: 'rgba(139, 92, 246, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(139, 92, 246, 1)'
    }]
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* ?§Îçî */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ?åê ?åÏÖú ÎØ∏Îîî??Ï¢ÖÌï© Î∂ÑÏÑù ?ºÌÑ∞
            </h1>
            <p className="text-gray-400">?§ÏãúÍ∞??åÏÖú ?∏Î†å?????∏ÌîåÎ£®Ïñ∏????Í≥†Îûò ?úÎèô ???¥Ïä§ ??Ïª§Î??àÌã∞</p>
          </div>
          <button
            onClick={() => setIsKorean(!isKorean)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all"
            disabled={translating}
          >
            ?åê {isKorean ? 'EN' : 'KO'}
          </button>
        </div>

        {/* ?¨Î≥º ?†ÌÉù */}
        <div className="flex flex-wrap gap-2 mb-6">
          {symbols.map(symbol => (
            <button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-sm ${
                selectedSymbol === symbol
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>

        {/* Ï¢ÖÌï© ?µÍ≥Ñ Ïπ¥Îìú */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Ï¢ÖÌï© Í∞êÏÑ±</div>
            <div className="text-2xl font-bold text-green-400">{calculateOverallSentiment()}%</div>
            <div className="text-xs text-gray-500">Í∏çÏ†ï??/div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Ï¥?Î©òÏÖò</div>
            <div className="text-2xl font-bold">523K</div>
            <div className="text-xs text-green-400">+45.2%</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Í≥†Îûò ?úÎèô</div>
            <div className="text-2xl font-bold text-yellow-400">{whaleAlerts.length}</div>
            <div className="text-xs text-gray-500">ÏµúÍ∑º 1?úÍ∞Ñ</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">?∏Î†å??#1</div>
            <div className="text-xl font-bold text-purple-400">{trendingHashtags[0]?.tag}</div>
            <div className="text-xs text-green-400">+{trendingHashtags[0]?.change}%</div>
          </div>
        </div>

        {/* ??Î©îÎâ¥ */}
        <div className="flex overflow-x-auto space-x-2 mb-6 border-b border-gray-700 pb-2">
          {['overview', 'influencers', 'whale', 'reddit', 'twitter', 'news', 'youtube', 'community'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'overview' && '?ìä Ï¢ÖÌï©'}
              {tab === 'influencers' && '?ë• ?∏ÌîåÎ£®Ïñ∏??}
              {tab === 'whale' && '?êã Í≥†Îûò'}
              {tab === 'reddit' && '?î• Reddit'}
              {tab === 'twitter' && '?ê¶ Twitter'}
              {tab === 'news' && '?ì∞ ?¥Ïä§'}
              {tab === 'youtube' && '?ì∫ YouTube'}
              {tab === 'community' && '?í¨ Ïª§Î??àÌã∞'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Ï¢ÖÌï© ?Ä?úÎ≥¥??*/}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* ?§ÏãúÍ∞??∏Î†å???¥Ïãú?úÍ∑∏ */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4">?î• ?§ÏãúÍ∞??∏Î†å??/h2>
                  <div className="space-y-3">
                    {trendingHashtags.slice(0, 5).map((tag, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                          <span className="font-semibold">{tag.tag}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">{tag.count.toLocaleString()}</span>
                          <span className={`text-sm font-bold ${tag.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {tag.change > 0 ? '+' : ''}{tag.change}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Í∞êÏÑ± ?àÏù¥??Ï∞®Ìä∏ */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4">?éØ ?åÎû´?ºÎ≥Ñ Í∞êÏÑ± Î∂ÑÏÑù</h2>
                  <Radar
                    data={sentimentRadarData}
                    options={{
                      responsive: true,
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 100,
                          ticks: { color: 'white' },
                          grid: { color: 'rgba(255,255,255,0.1)' },
                          pointLabels: { color: 'white' }
                        }
                      },
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>

                {/* ?åÏÖú Î≥ºÎ•® Ï∞®Ìä∏ */}
                <div className="bg-gray-800 rounded-xl p-6 lg:col-span-2">
                  <h2 className="text-xl font-bold mb-4">?ìà ?åÎû´?ºÎ≥Ñ ?úÎèô??/h2>
                  <Bar
                    data={socialVolumeData}
                    options={{
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { color: 'white' },
                          grid: { color: 'rgba(255,255,255,0.1)' }
                        },
                        x: {
                          ticks: { color: 'white' },
                          grid: { color: 'rgba(255,255,255,0.1)' }
                        }
                      },
                      plugins: {
                        legend: { labels: { color: 'white' } }
                      }
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* ?∏ÌîåÎ£®Ïñ∏????*/}
            {activeTab === 'influencers' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold mb-4">?ë• Ï£ºÏöî ?∏ÌîåÎ£®Ïñ∏???ôÌñ•</h2>
                {influencers.map((influencer, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                          {influencer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{influencer.name}</span>
                            {influencer.verified && <span className="text-blue-400">??/span>}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {influencer.handle} ??{influencer.followers} ?îÎ°ú??                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        influencer.sentiment === 'bullish' ? 'bg-green-600' :
                        influencer.sentiment === 'bearish' ? 'bg-red-600' : 'bg-gray-600'
                      }`}>
                        {influencer.sentiment === 'bullish' ? '?? Í∞ïÏÑ∏' :
                         influencer.sentiment === 'bearish' ? '?êª ?ΩÏÑ∏' : '?òê Ï§ëÎ¶Ω'}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-2">{influencer.tweet}</p>
                    <div className="text-gray-500 text-sm">{influencer.time}</div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Í≥†Îûò ?úÎèô ??*/}
            {activeTab === 'whale' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold mb-4">?êã ?§ÏãúÍ∞?Í≥†Îûò ?úÎèô</h2>
                {whaleAlerts.map((alert, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          alert.type === 'buy' ? 'bg-green-600' :
                          alert.type === 'sell' ? 'bg-red-600' : 'bg-blue-600'
                        }`}>
                          {alert.type === 'buy' ? '?ìà' :
                           alert.type === 'sell' ? '?ìâ' : '?îÑ'}
                        </div>
                        <div>
                          <div className="font-bold text-lg">
                            {alert.amount} {alert.coin}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {alert.usdValue}
                          </div>
                        </div>
                      </div>
                      <span className="text-gray-500 text-sm">{alert.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">From:</span>
                      <span className="font-mono bg-gray-700 px-2 py-1 rounded">{alert.from}</span>
                      <span className="text-gray-400">??/span>
                      <span className="text-gray-400">To:</span>
                      <span className="font-mono bg-gray-700 px-2 py-1 rounded">{alert.to}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Reddit ??*/}
            {activeTab === 'reddit' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4">?î• Reddit ?∏Í∏∞ ?¨Ïä§??/h2>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {redditMentions.map(mention => (
                      <div key={mention.id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-orange-400">{mention.author}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            mention.sentiment === 'positive' ? 'bg-green-600' :
                            mention.sentiment === 'negative' ? 'bg-red-600' : 'bg-gray-600'
                          }`}>
                            {mention.sentiment === 'positive' ? 'Í∏çÏ†ï' :
                             mention.sentiment === 'negative' ? 'Î∂Ä?? : 'Ï§ëÎ¶Ω'}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{mention.content}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>‚¨ÜÔ∏è {mention.engagement.likes} | ?í¨ {mention.engagement.comments}</span>
                          <span>{new Date(mention.timestamp).toLocaleTimeString('ko-KR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4">?ìä ?úÎ∏å?àÎîß ?µÍ≥Ñ</h2>
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">r/cryptocurrency</div>
                      <div className="text-2xl font-bold">6.5M Î©§Î≤Ñ</div>
                      <div className="text-green-400 text-sm">+2.3% ?¥Î≤à Ï£?/div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">r/Bitcoin</div>
                      <div className="text-2xl font-bold">4.8M Î©§Î≤Ñ</div>
                      <div className="text-green-400 text-sm">+1.8% ?¥Î≤à Ï£?/div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">r/ethereum</div>
                      <div className="text-2xl font-bold">1.7M Î©§Î≤Ñ</div>
                      <div className="text-green-400 text-sm">+3.1% ?¥Î≤à Ï£?/div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Twitter ??*/}
            {activeTab === 'twitter' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4">?ê¶ Twitter ?§ÏãúÍ∞??ºÎìú</h2>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {twitterMentions.map(mention => (
                      <div key={mention.id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-blue-400">{mention.author}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            mention.sentiment === 'positive' ? 'bg-green-600' :
                            mention.sentiment === 'negative' ? 'bg-red-600' : 'bg-gray-600'
                          }`}>
                            {mention.sentiment}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{mention.content}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>?§Ô∏è {mention.engagement.likes} | ?îÑ {mention.engagement.shares}</span>
                          <span>{new Date(mention.timestamp).toLocaleTimeString('ko-KR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4">?èÜ ?∏Î†å???¥Ïãú?úÍ∑∏</h2>
                  <div className="space-y-3">
                    {trendingHashtags.map((tag, idx) => (
                      <div key={idx} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                            <span className="font-semibold">{tag.tag}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">{tag.count.toLocaleString()} ?∏Ïúó</div>
                            <div className={`text-sm font-bold ${tag.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {tag.change > 0 ? '+' : ''}{tag.change}%
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                              style={{ width: `${tag.sentiment}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Í∞êÏÑ± ?êÏàò: {tag.sentiment}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ?¥Ïä§ ??*/}
            {activeTab === 'news' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold mb-4">?ì∞ Ï£ºÏöî ?¥Ïä§ ?§Îìú?ºÏù∏</h2>
                {newsHeadlines.map((news, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{news.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{news.source}</span>
                          <span>{news.time}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          news.impact === 'high' ? 'bg-red-600' :
                          news.impact === 'medium' ? 'bg-yellow-600' : 'bg-gray-600'
                        }`}>
                          {news.impact === 'high' ? '?íÏùå' :
                           news.impact === 'medium' ? 'Ï§ëÍ∞Ñ' : '??ùå'}
                        </span>
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          news.sentiment === 'positive' ? 'bg-green-600' :
                          news.sentiment === 'negative' ? 'bg-red-600' : 'bg-gray-600'
                        }`}>
                          {news.sentiment === 'positive' ? 'Í∏çÏ†ï' :
                           news.sentiment === 'negative' ? 'Î∂Ä?? : 'Ï§ëÎ¶Ω'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* YouTube ??*/}
            {activeTab === 'youtube' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {youtubeChannels.map((channel, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{channel.thumbnail}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{channel.name}</h3>
                        <div className="text-gray-400 text-sm mb-2">
                          {channel.subscribers} Íµ¨ÎèÖ??                        </div>
                        <p className="text-gray-300 mb-2">{channel.latestVideo}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Ï°∞Ìöå??{channel.views}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Í∞êÏÑ±</span>
                            <div className="w-20 bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                                style={{ width: `${channel.sentiment}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-green-400">{channel.sentiment}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Ïª§Î??àÌã∞ ??*/}
            {activeTab === 'community' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {communityMetrics.map((metric, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-4">{metric.platform}</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-gray-400 text-sm">Ï¥?Î©§Î≤Ñ</div>
                        <div className="text-2xl font-bold">{metric.members.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">?úÏÑ± ?¨Ïö©??/div>
                        <div className="text-xl font-semibold">{metric.active.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">?±Ïû•Î•?/div>
                        <div className={`text-lg font-semibold ${metric.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {metric.growth > 0 ? '+' : ''}{metric.growth}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Ïª§Î??àÌã∞ Í∞êÏÑ±</div>
                        <div className="w-full bg-gray-600 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                            style={{ width: `${metric.sentiment}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{metric.sentiment}% Í∏çÏ†ï??/div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
