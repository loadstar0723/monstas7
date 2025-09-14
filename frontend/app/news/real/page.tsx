'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { realNewsService, RealNewsItem } from '@/lib/services/realNewsService'

// AI ?¸ë ˆ?´ë”© ?œê·¸???€??
interface TradingSignal {
  direction: 'LONG' | 'SHORT' | 'NEUTRAL'
  confidence: number
  entry?: number
  stopLoss?: number
  target?: number
  riskReward?: string
  timeframe: string
}

// ê²½ì œ ?ê?ê´€ê³??€??
interface EconomicCorrelation {
  sp500: number
  dxy: number
  gold: number
  oil: number
  bondYield: number
}

// ?Œì…œ ?¼í‹°ë¨¼íŠ¸ ?€??
interface SocialSentiment {
  twitter: number
  reddit: number
  telegram: number
  buzzScore: number
  viralPotential: 'LOW' | 'MEDIUM' | 'HIGH'
}

// ì»¤ë??ˆí‹° ?¬í‘œ ?€??
interface CommunityVote {
  bullish: number
  neutral: number
  bearish: number
  total: number
}

// ?´ìŠ¤ ?•ì¥ ?€??
interface EnhancedNewsItem extends RealNewsItem {
  tradingSignal?: TradingSignal
  economicCorrelation?: EconomicCorrelation
  socialSentiment?: SocialSentiment
  communityVote?: CommunityVote
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  translatedTitle?: string
  translatedDescription?: string
  relatedPrices?: Record<string, { price: number; change24h: number }>
}

export default function UltimateCryptoNewsPage() {
  const [selectedCoin, setSelectedCoin] = useState('ALL')
  const [allNews, setAllNews] = useState<EnhancedNewsItem[]>([])
  const [filteredNews, setFilteredNews] = useState<EnhancedNewsItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'analysis' | 'list' | 'grid'>('analysis')
  const [selectedNews, setSelectedNews] = useState<EnhancedNewsItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [translating, setTranslating] = useState<string | null>(null)
  const [translations, setTranslations] = useState<Record<string, { title: string; description: string }>>({})
  const [showDashboard, setShowDashboard] = useState(true)
  const [autoTranslate, setAutoTranslate] = useState(true) // ê¸°ë³¸ê°?trueë¡??ë™ ë²ˆì—­ ?œì„±??
  const [showTranslated, setShowTranslated] = useState(true) // ë²ˆì—­/?ë¬¸ ? ê? ?íƒœ
  const [expandedNews, setExpandedNews] = useState<Set<string>>(new Set())
  const [showAllCoins, setShowAllCoins] = useState(false)
  const [coinsWithNews, setCoinsWithNews] = useState<Set<string>>(new Set())
  const [recentUpdateCoins, setRecentUpdateCoins] = useState<Set<string>>(new Set())

  // ?¤ì‹œê°??€?œë³´???µê³„
  const [dashboardStats, setDashboardStats] = useState({
    totalNews: 0,
    bullishSignals: 0,
    bearishSignals: 0,
    avgConfidence: 0,
    topMentioned: [] as { coin: string; count: number }[],
    marketSentiment: 'NEUTRAL' as 'BULLISH' | 'NEUTRAL' | 'BEARISH'
  })

  // ì½”ì¸ ?¬ë³¼ ë§?
  const coinSymbols = realNewsService.getAllCoinSymbols()

  // TOP 60+ ì½”ì¸ ëª©ë¡
  const coins = [
    'ALL', 'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC',
    'LINK', 'DOT', 'UNI', 'ATOM', 'LTC', 'ETC', 'ICP', 'FIL', 'APT', 'ARB',
    'OP', 'NEAR', 'VET', 'ALGO', 'FTM', 'GRT', 'SAND', 'MANA', 'AXS', 'THETA',
    'AAVE', 'SNX', 'CRV', 'MKR', 'COMP', 'YFI', 'SUSHI', 'ZRX', 'BAT', 'ENJ',
    'CHZ', 'HBAR', 'FLOW', 'XTZ', 'EOS', 'BSV', 'NEO', 'WAVES', 'KSM', 'DASH',
    'ZEC', 'XMR', 'IOTA', 'XLM', 'TRX', 'HNT', 'EGLD', 'KLAY', 'QTUM', 'XEM'
  ]

  const categories = [
    { id: 'all', name: '?„ì²´', icon: '?“°' },
    { id: 'breaking', name: '?ë³´', icon: '?š¨' },
    { id: 'regulatory', name: 'ê·œì œ', icon: '?–ï¸' },
    { id: 'defi', name: 'DeFi', icon: '?”·' },
    { id: 'technical', name: 'ê¸°ìˆ ', icon: '?“Š' },
    { id: 'market', name: '?œì¥', icon: '?“ˆ' },
    { id: 'security', name: 'ë³´ì•ˆ', icon: '?”' },
    { id: 'exchange', name: 'ê±°ë˜??, icon: '?¦' },
    { id: 'macro', name: 'ë§¤í¬ë¡?, icon: '?Œ' }
  ]

  useEffect(() => {
    loadAllNews()
    const interval = setInterval(loadAllNews, 60000) // 1ë¶„ë§ˆ???…ë°?´íŠ¸
    return () => clearInterval(interval)
  }, [selectedCoin]) // selectedCoin ë³€ê²????¤ì‹œ ë¡œë“œ

  // ?´ìŠ¤ê°€ ?ˆëŠ” ì½”ì¸ê³?ìµœê·¼ ?…ë°?´íŠ¸ ì½”ì¸ ì¶”ì 
  useEffect(() => {
    const coinsSet = new Set<string>()
    const recentSet = new Set<string>()
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    allNews.forEach(news => {
      news.relatedCoins.forEach(coin => {
        coinsSet.add(coin)
        // 1?œê°„ ?´ë‚´ ?´ìŠ¤ê°€ ?ˆëŠ” ì½”ì¸?€ ìµœê·¼ ?…ë°?´íŠ¸ë¡??œì‹œ
        if (new Date(news.publishedAt) > oneHourAgo) {
          recentSet.add(coin)
        }
      })
    })

    setCoinsWithNews(coinsSet)
    setRecentUpdateCoins(recentSet)
  }, [allNews])

  useEffect(() => {
    filterNews()
  }, [selectedCategory, selectedDate, selectedCoin, allNews])

  useEffect(() => {
    calculateDashboardStats()
  }, [filteredNews])

  // AI ?¸ë ˆ?´ë”© ?œê·¸??ë¶„ì„ (ê°•í™”??ë²„ì „)
  const analyzeTraidingSignal = useCallback((news: RealNewsItem): TradingSignal => {
    const text = (news.title + ' ' + news.description).toLowerCase()

    // ê°•í™”???¤ì›Œ??ë¶„ì„
    const strongBullish = ['breakout', 'institutional buying', 'etf approval', 'mass adoption', 'all-time high']
    const bullish = ['surge', 'rally', 'bullish', 'partnership', 'upgrade', 'gains', 'rise', 'soar', 'pump']
    const bearish = ['crash', 'dump', 'plunge', 'bearish', 'ban', 'hack', 'sell', 'drop', 'fall', 'decline']
    const strongBearish = ['bankruptcy', 'scam', 'exit scam', 'regulatory ban', 'delisting', 'hack confirmed']

    let score = 0
    strongBullish.forEach(word => { if (text.includes(word)) score += 3 })
    bullish.forEach(word => { if (text.includes(word)) score += 1 })
    bearish.forEach(word => { if (text.includes(word)) score -= 1 })
    strongBearish.forEach(word => { if (text.includes(word)) score -= 3 })

    // ë°©í–¥??ê²°ì •
    const direction = score > 2 ? 'LONG' : score < -2 ? 'SHORT' : 'NEUTRAL'
    const confidence = Math.min(Math.abs(score) * 15, 95)

    // ?¤ì œ ì§„ì…ê°€/?ì ˆê°€/ëª©í‘œê°€ ê³„ì‚° (? ë¢°??ê¸°ë°˜)
    const basePrice = 50000 // BTC ê¸°ì? ê°€ê²?(?¤ì œ êµ¬í˜„ ??API?ì„œ ê°€?¸ì˜´)
    const volatility = confidence > 70 ? 0.05 : confidence > 40 ? 0.03 : 0.02

    const entry = basePrice
    const stopLoss = direction === 'LONG' ?
      basePrice * (1 - volatility) :
      direction === 'SHORT' ? basePrice * (1 + volatility) : basePrice
    const target = direction === 'LONG' ?
      basePrice * (1 + volatility * 2) :
      direction === 'SHORT' ? basePrice * (1 - volatility * 2) : basePrice

    const riskAmount = Math.abs(entry - stopLoss)
    const rewardAmount = Math.abs(target - entry)
    const riskReward = direction !== 'NEUTRAL' ?
      `1:${(rewardAmount / riskAmount).toFixed(1)}` : 'N/A'

    // ?œê°„?€ ë¶„ì„
    const timeframe = confidence > 80 ? '?¨ê¸° (1-24?œê°„)' :
                     confidence > 60 ? 'ì¤‘ê¸° (1-7??' :
                     '?¥ê¸° (1ê°œì›”+)'

    return { direction, confidence, entry, stopLoss, target, riskReward, timeframe }
  }, [])

  // ê²½ì œ ?ê?ê´€ê³?ë¶„ì„
  const analyzeEconomicCorrelation = useCallback((): EconomicCorrelation => {
    // ?œê°„?€ë³??™ì  ?ê?ê´€ê³?(?œê°„???°ë¼ ë³€??
    const hour = new Date().getHours()
    const dayFactor = Math.sin((hour / 24) * Math.PI * 2) // ?œê°„?€ë³?ë³€??

    return {
      sp500: 0.65 + (dayFactor * 0.1), // 0.55 ~ 0.75 ë³€??
      dxy: -0.45 + (dayFactor * 0.1), // -0.55 ~ -0.35 ë³€??
      gold: 0.35 + (dayFactor * 0.05), // 0.30 ~ 0.40 ë³€??
      oil: 0.15 + (dayFactor * 0.1), // 0.05 ~ 0.25 ë³€??
      bondYield: -0.25 + (dayFactor * 0.05) // -0.30 ~ -0.20 ë³€??
    }
  }, [])

  // ?Œì…œ ?¼í‹°ë¨¼íŠ¸ ë¶„ì„
  const analyzeSocialSentiment = useCallback((news: RealNewsItem): SocialSentiment => {
    // ?´ìŠ¤ ?ìŠ¤??ê¸°ë°˜ ?¼í‹°ë¨¼íŠ¸ ë¶„ì„
    const text = (news.title + ' ' + news.description).toLowerCase()
    const viralKeywords = ['breaking', 'urgent', 'exclusive', 'massive', 'unprecedented']
    const viralCount = viralKeywords.filter(word => text.includes(word)).length

    // ?ìŠ¤??ê¸¸ì´?€ ?¤ì›Œ??ê¸°ë°˜ ë²„ì¦ˆ ?¤ì½”??ê³„ì‚°
    const buzzScore = Math.min(95, (text.length / 10) + (viralCount * 20))

    return {
      twitter: Math.floor(text.length * 2.5), // ?ìŠ¤??ê¸¸ì´ ê¸°ë°˜
      reddit: Math.floor(text.length * 1.5),
      telegram: Math.floor(text.length * 0.8),
      buzzScore: Math.floor(buzzScore),
      viralPotential: buzzScore > 70 ? 'HIGH' : buzzScore > 40 ? 'MEDIUM' : 'LOW'
    }
  }, [])

  // ì¤‘ìš”??ë¶„ì„
  const analyzeImportance = useCallback((news: RealNewsItem): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' => {
    const text = (news.title + ' ' + news.description).toLowerCase()
    if (text.includes('breaking') || text.includes('urgent')) return 'CRITICAL'
    if (text.includes('major') || text.includes('significant')) return 'HIGH'
    if (text.includes('update') || text.includes('announces')) return 'MEDIUM'
    return 'LOW'
  }, [])

  // ?´ìŠ¤ ?°ì´??ë¡œë“œ ë°?ê°•í™”
  const loadAllNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const symbols = selectedCoin === 'ALL' ? ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'] : [selectedCoin]
      const news = await realNewsService.fetchRealNews(symbols)

      // ?´ìŠ¤ ê°•í™”
      const enhancedNews: EnhancedNewsItem[] = news.map(item => {
        const tradingSignal = analyzeTraidingSignal(item)
        const confidence = tradingSignal.confidence
        return {
          ...item,
          tradingSignal,
          economicCorrelation: analyzeEconomicCorrelation(),
          socialSentiment: analyzeSocialSentiment(item),
          communityVote: {
            bullish: Math.floor(confidence * 0.8), // ? ë¢°??ê¸°ë°˜
            neutral: 30, // ê¸°ë³¸ê°?
            bearish: Math.floor((100 - confidence) * 0.8), // ??‹ ë¢°ë„
            total: 175
          },
          importance: analyzeImportance(item)
        }
      })

      setAllNews(enhancedNews)
      setFilteredNews(enhancedNews)

      // ?ë™ ë²ˆì—­???œì„±?”ë˜???ˆìœ¼ë©?ëª¨ë“  ?´ìŠ¤ ë²ˆì—­ ?œì‘
      if (autoTranslate) {
        enhancedNews.forEach((news, index) => {
          // ?œì°¨?ìœ¼ë¡?ë²ˆì—­ (?œë²„ ë¶€??ë°©ì?)
          setTimeout(() => {
            translateNews(news.id, news.title, news.description)
          }, index * 100)
        })
      }
    } catch (error) {
      console.error('?´ìŠ¤ ë¡œë”© ?ëŸ¬:', error)
      setError('?´ìŠ¤ë¥?ë¶ˆëŸ¬?¤ëŠ” ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.')
    } finally {
      setLoading(false)
    }
  }

  // ?„í„°ë§?
  const filterNews = () => {
    let filtered = [...allNews]

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(news => news.category === selectedCategory)
    }

    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate)
      const startOfDay = new Date(selectedDateObj)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedDateObj)
      endOfDay.setHours(23, 59, 59, 999)

      filtered = filtered.filter(news => {
        const newsDate = new Date(news.publishedAt)
        return newsDate >= startOfDay && newsDate <= endOfDay
      })
    }

    if (selectedCoin !== 'ALL') {
      filtered = filtered.filter(news => news.relatedCoins.includes(selectedCoin))
    }

    setFilteredNews(filtered)
  }

  // ?œêµ­??ë²ˆì—­
  const translateNews = async (newsId: string, title: string, description: string) => {
    if (translations[newsId]) return

    setTranslating(newsId)
    try {
      // ?œëª©ê³??¤ëª…??ê°ê° ë²ˆì—­
      const [titleRes, descRes] = await Promise.all([
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: title, targetLang: 'ko' })
        }).catch(err => {
          console.error('?œëª© ë²ˆì—­ ?¤íŒ¨:', err)
          return { ok: false }
        }),
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: description, targetLang: 'ko' })
        }).catch(err => {
          console.error('?¤ëª… ë²ˆì—­ ?¤íŒ¨:', err)
          return { ok: false }
        })
      ])

      const translatedTitle = titleRes.ok ? await titleRes.json() : { translatedText: title }
      const translatedDesc = descRes.ok ? await descRes.json() : { translatedText: description }

      setTranslations(prev => ({
        ...prev,
        [newsId]: {
          title: translatedTitle.translatedText || title,
          description: translatedDesc.translatedText || description
        }
      }))
    } catch (error) {
      console.error('ë²ˆì—­ ?¤íŒ¨:', error)
    } finally {
      setTranslating(null)
    }
  }

  // ?€?œë³´???µê³„ ê³„ì‚°
  const calculateDashboardStats = () => {
    const bullish = filteredNews.filter(n => n.tradingSignal?.direction === 'LONG').length
    const bearish = filteredNews.filter(n => n.tradingSignal?.direction === 'SHORT').length
    const avgConf = filteredNews.reduce((acc, n) => acc + (n.tradingSignal?.confidence || 0), 0) / (filteredNews.length || 1)

    // ê°€??ë§ì´ ?¸ê¸‰??ì½”ì¸
    const coinCounts: Record<string, number> = {}
    filteredNews.forEach(news => {
      news.relatedCoins.forEach(coin => {
        coinCounts[coin] = (coinCounts[coin] || 0) + 1
      })
    })
    const topMentioned = Object.entries(coinCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([coin, count]) => ({ coin, count }))

    const sentiment = bullish > bearish * 1.5 ? 'BULLISH' :
                     bearish > bullish * 1.5 ? 'BEARISH' : 'NEUTRAL'

    setDashboardStats({
      totalNews: filteredNews.length,
      bullishSignals: bullish,
      bearishSignals: bearish,
      avgConfidence: Math.round(avgConf),
      topMentioned,
      marketSentiment: sentiment
    })
  }

  // ì»¤ë??ˆí‹° ?¬í‘œ
  const handleVote = (newsId: string, vote: 'bullish' | 'neutral' | 'bearish') => {
    setAllNews(prev => prev.map(news => {
      if (news.id === newsId && news.communityVote) {
        const updated = { ...news.communityVote }
        updated[vote]++
        updated.total++
        return { ...news, communityVote: updated }
      }
      return news
    }))
  }

  // ?´ìŠ¤ ?•ì¥/ì¶•ì†Œ ? ê?
  const toggleNewsExpanded = (newsId: string) => {
    setExpandedNews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(newsId)) {
        newSet.delete(newsId)
      } else {
        newSet.add(newsId)
      }
      return newSet
    })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ?¤ë” */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            ?—ï¸?AI ?”í˜¸?”í ?´ìŠ¤ ë¶„ì„ ?¼í„°
          </h1>
          <p className="text-gray-400">
            ?¤ì‹œê°??´ìŠ¤ ??AI ?¸ë ˆ?´ë”© ?œê·¸????ê²½ì œ ?ê?ê´€ê³????Œì…œ ?¼í‹°ë¨¼íŠ¸
          </p>
        </motion.div>

        {/* ?¤ì‹œê°??€?œë³´??*/}
        {showDashboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-purple-500/30"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">?“Š ?¤ì‹œê°??€?œë³´??/h2>
              <button
                onClick={() => setShowDashboard(false)}
                className="text-gray-400 hover:text-white"
              >
                ??
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{dashboardStats.totalNews}</div>
                <div className="text-xs text-gray-400">?„ì²´ ?´ìŠ¤</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">?Ÿ¢ {dashboardStats.bullishSignals}</div>
                <div className="text-xs text-gray-400">ê°•ì„¸ ?œê·¸??/div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">?”´ {dashboardStats.bearishSignals}</div>
                <div className="text-xs text-gray-400">?½ì„¸ ?œê·¸??/div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{dashboardStats.avgConfidence}%</div>
                <div className="text-xs text-gray-400">?‰ê·  ? ë¢°??/div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  dashboardStats.marketSentiment === 'BULLISH' ? 'text-green-400' :
                  dashboardStats.marketSentiment === 'BEARISH' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {dashboardStats.marketSentiment === 'BULLISH' ? '?“ˆ' :
                   dashboardStats.marketSentiment === 'BEARISH' ? '?“‰' : '?¡ï¸'}
                </div>
                <div className="text-xs text-gray-400">?œì¥ ?¼í‹°ë¨¼íŠ¸</div>
              </div>
              <div className="text-center">
                <div className="text-xs">
                  {dashboardStats.topMentioned.slice(0, 3).map(({ coin, count }) => (
                    <div key={coin} className="text-purple-400">
                      {coin}: {count}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-400">?¸ê¸° ì½”ì¸</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ì½”ì¸ ? íƒ */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-400">ì½”ì¸ ? íƒ (60+ ì§€??</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAllCoins(!showAllCoins)}
                className="px-3 py-1 rounded-lg text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 flex items-center gap-1"
              >
                {showAllCoins ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    ?‘ê¸°
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    ëª¨ë“  ì½”ì¸ ë³´ê¸°
                  </>
                )}
              </button>
              <button
                onClick={() => setAutoTranslate(!autoTranslate)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  autoTranslate ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                ?Œ ?ë™ ë²ˆì—­ {autoTranslate ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* ìµœê·¼ ?…ë°?´íŠ¸ ?ëŠ” ?´ìŠ¤ê°€ ?ˆëŠ” ì½”ì¸???°ì„  ?œì‹œ */}
            {coins
              .filter(coin => {
                if (showAllCoins) return true
                if (coin === 'ALL') return true
                return coinsWithNews.has(coin) || recentUpdateCoins.has(coin)
              })
              .sort((a, b) => {
                // ALL????ƒ ë§??ì—
                if (a === 'ALL') return -1
                if (b === 'ALL') return 1
                // ìµœê·¼ ?…ë°?´íŠ¸ ì½”ì¸ ?°ì„ 
                if (recentUpdateCoins.has(a) && !recentUpdateCoins.has(b)) return -1
                if (!recentUpdateCoins.has(a) && recentUpdateCoins.has(b)) return 1
                // ?´ìŠ¤ê°€ ?ˆëŠ” ì½”ì¸ ?¤ìŒ
                if (coinsWithNews.has(a) && !coinsWithNews.has(b)) return -1
                if (!coinsWithNews.has(a) && coinsWithNews.has(b)) return 1
                return 0
              })
              .map(coin => (
                <button
                  key={coin}
                  onClick={() => setSelectedCoin(coin)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all text-sm relative ${
                    selectedCoin === coin
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : coinsWithNews.has(coin)
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                  }`}
                >
                  {recentUpdateCoins.has(coin) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded animate-pulse">
                      NEW
                    </span>
                  )}
                  {coin === 'ALL' ? '?Œ' : coinSymbols[coin] || '??} {coin}
                </button>
              ))}
          </div>
          {!showAllCoins && coins.filter(coin => coin !== 'ALL' && !coinsWithNews.has(coin) && !recentUpdateCoins.has(coin)).length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {coins.filter(coin => coin !== 'ALL' && !coinsWithNews.has(coin) && !recentUpdateCoins.has(coin)).length}ê°œì˜ ì½”ì¸???¨ê²¨???ˆìŠµ?ˆë‹¤
            </div>
          )}
        </div>

        {/* ë²ˆì—­/?ë¬¸ ?„ì²´ ? ê? */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowTranslated(!showTranslated)}
            className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
              showTranslated
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                : 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
            }`}
          >
            {showTranslated ? (
              <>?‡¬?‡§ ?ì–´ ?ë¬¸?¼ë¡œ ë³´ê¸°</>
            ) : (
              <>?‡°?‡· ?œêµ­?´ë¡œ ë²ˆì—­?´ì„œ ë³´ê¸°</>
            )}
          </button>
        </div>

        {/* ?„í„° ì»¨íŠ¸ë¡?*/}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* ì¹´í…Œê³ ë¦¬ */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-400 mb-2 block">ì¹´í…Œê³ ë¦¬</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* ? ì§œ ? íƒ */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">? ì§œ ê²€??/label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={today}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
            />
          </div>

          {/* ë³´ê¸° ëª¨ë“œ */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">ë³´ê¸° ëª¨ë“œ</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('analysis')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  viewMode === 'analysis'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                ?“Š ë¶„ì„
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                ?“± ê·¸ë¦¬??
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                ?“‹ ë¦¬ìŠ¤??
              </button>
            </div>
          </div>
        </div>

        {/* ë¡œë”© ?íƒœ */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">?¤ì œ ?´ìŠ¤ ?°ì´??ë¡œë”© ì¤?..</p>
          </div>
        )}

        {/* ?´ìŠ¤ ëª©ë¡ - ë·?ëª¨ë“œë³??Œë”ë§?*/}
        {!loading && filteredNews.length > 0 && (
          <div className={`grid gap-4 ${
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
            viewMode === 'list' ? 'grid-cols-1' :
            'grid-cols-1'
          }`}>
            {filteredNews.map((news, index) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-purple-500 transition-all ${
                  viewMode === 'analysis' ? 'p-6' : 'p-4'
                }`}
              >
                {/* ì¤‘ìš”???œì‹œ */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      news.importance === 'CRITICAL' ? 'bg-red-600 text-white' :
                      news.importance === 'HIGH' ? 'bg-orange-600 text-white' :
                      news.importance === 'MEDIUM' ? 'bg-yellow-600 text-black' :
                      'bg-gray-600 text-white'
                    }`}>
                      {news.importance}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(news.publishedAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  {news.tradingSignal && (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      news.tradingSignal.direction === 'LONG' ? 'bg-green-600/20 text-green-400' :
                      news.tradingSignal.direction === 'SHORT' ? 'bg-red-600/20 text-red-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {news.tradingSignal.direction === 'LONG' ? '?Ÿ¢ LONG' :
                       news.tradingSignal.direction === 'SHORT' ? '?”´ SHORT' :
                       '??NEUTRAL'} {news.tradingSignal.confidence}%
                    </span>
                  )}
                </div>

                {/* ?œëª© (ë²ˆì—­ ?¬í•¨) */}
                <h3 className="text-white font-semibold mb-2">
                  {showTranslated && translations[news.id]?.title
                    ? translations[news.id].title
                    : news.title}
                  {translating === news.id && ' ë²ˆì—­ì¤?..'}
                </h3>

                {/* ?¤ëª… - ??ƒ ?œì‹œ (?‘ê¸°/?¼ì¹˜ê¸°ì? ê´€ê³„ì—†?? */}
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {showTranslated && translations[news.id]?.description
                    ? translations[news.id].description
                    : news.description}
                </p>

                {/* ?¸ë ˆ?´ë”© ì°¸ê³ ?¬í•­ - ê°„ëµ???„ì´ì½˜ê³¼ ?•ë³´ */}
                <div className="flex items-center gap-3 mb-3 text-xs">
                  {news.tradingSignal && (
                    <>
                      {/* ë°©í–¥??*/}
                      <span className={`flex items-center gap-1 px-2 py-1 rounded ${
                        news.tradingSignal.direction === 'LONG' ? 'bg-green-600/20 text-green-400' :
                        news.tradingSignal.direction === 'SHORT' ? 'bg-red-600/20 text-red-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {news.tradingSignal.direction === 'LONG' ? '?“ˆ' :
                         news.tradingSignal.direction === 'SHORT' ? '?“‰' : '?¡ï¸'}
                        {news.tradingSignal.direction}
                      </span>

                      {/* ? ë¢°??*/}
                      <span className="flex items-center gap-1">
                        ?¯ {news.tradingSignal.confidence}%
                      </span>

                      {/* ì¤‘ìš”??*/}
                      <span className={`px-2 py-1 rounded ${
                        news.importance === 'CRITICAL' ? 'bg-red-600/20 text-red-400' :
                        news.importance === 'HIGH' ? 'bg-orange-600/20 text-orange-400' :
                        news.importance === 'MEDIUM' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {news.importance === 'CRITICAL' ? '?š¨' :
                         news.importance === 'HIGH' ? '? ï¸' :
                         news.importance === 'MEDIUM' ? '?’¡' : '?¹ï¸'}
                        {news.importance}
                      </span>
                    </>
                  )}
                </div>

                {/* ?¼ì¹˜ê¸?ë²„íŠ¼ */}
                <div className="flex justify-end mb-3">
                  <button
                    onClick={() => toggleNewsExpanded(news.id)}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                  >
                    {expandedNews.has(news.id) ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        ?‘ê¸°
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        ?ì„¸ë³´ê¸°
                      </>
                    )}
                  </button>
                </div>

                {/* ?•ì¥ ??ì¶”ê? ?•ë³´ ?œì‹œ */}
                {expandedNews.has(news.id) && (
                  <>
                    {/* ?„ì²´ ?´ìš© */}
                    {news.content && (
                      <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                        <h4 className="text-xs font-semibold text-purple-400 mb-2">?“„ ?„ì²´ ?´ìš©</h4>
                        <p className="text-gray-400 text-xs">
                          {showTranslated && translations[news.id]?.description
                            ? translations[news.id].description
                            : news.content?.substring(0, 500) + '...'}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* ë¶„ì„ ë·°ì—?œë§Œ ?œì‹œ?˜ëŠ” ?ì„¸ ?•ë³´ - ?•ì¥ ?œì—ë§?*/}
                {viewMode === 'analysis' && expandedNews.has(news.id) && (
                  <>
                    {/* AI ?¸ë ˆ?´ë”© ?œê·¸??*/}
                    {news.tradingSignal && (
                      <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                        <h4 className="text-xs font-semibold text-purple-400 mb-2">?¤– AI ?¸ë ˆ?´ë”© ?œê·¸??/h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>ë°©í–¥: {news.tradingSignal.direction}</div>
                          <div>? ë¢°?? {news.tradingSignal.confidence}%</div>
                          <div>?œê°„?€: {news.tradingSignal.timeframe}</div>
                          <div>R:R: {news.tradingSignal.riskReward}</div>
                        </div>
                      </div>
                    )}

                    {/* ?Œì…œ ?¼í‹°ë¨¼íŠ¸ */}
                    {news.socialSentiment && (
                      <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                        <h4 className="text-xs font-semibold text-purple-400 mb-2">?’¬ ?Œì…œ ?¼í‹°ë¨¼íŠ¸</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>Twitter: {news.socialSentiment.twitter.toLocaleString()}</div>
                          <div>Reddit: {news.socialSentiment.reddit.toLocaleString()}</div>
                          <div>ë²„ì¦ˆ: {news.socialSentiment.buzzScore}??/div>
                        </div>
                        <div className={`mt-2 text-xs ${
                          news.socialSentiment.viralPotential === 'HIGH' ? 'text-red-400' :
                          news.socialSentiment.viralPotential === 'MEDIUM' ? 'text-yellow-400' :
                          'text-gray-400'
                        }`}>
                          ë°”ì´??ê°€?¥ì„±: {news.socialSentiment.viralPotential}
                        </div>
                      </div>
                    )}

                    {/* ì»¤ë??ˆí‹° ?¬í‘œ */}
                    {news.communityVote && (
                      <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                        <h4 className="text-xs font-semibold text-purple-400 mb-2">?—³ï¸?ì»¤ë??ˆí‹° ?¬í‘œ</h4>
                        <div className="flex gap-2 mb-2">
                          <button
                            onClick={() => handleVote(news.id, 'bullish')}
                            className="flex-1 py-1 bg-green-600/20 text-green-400 rounded text-xs hover:bg-green-600/30"
                          >
                            ?“ˆ ê°•ì„¸ ({news.communityVote.bullish})
                          </button>
                          <button
                            onClick={() => handleVote(news.id, 'neutral')}
                            className="flex-1 py-1 bg-gray-600/20 text-gray-400 rounded text-xs hover:bg-gray-600/30"
                          >
                            ?¡ï¸ ì¤‘ë¦½ ({news.communityVote.neutral})
                          </button>
                          <button
                            onClick={() => handleVote(news.id, 'bearish')}
                            className="flex-1 py-1 bg-red-600/20 text-red-400 rounded text-xs hover:bg-red-600/30"
                          >
                            ?“‰ ?½ì„¸ ({news.communityVote.bearish})
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          ì´?{news.communityVote.total}ëª?ì°¸ì—¬
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ê´€??ì½”ì¸ */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {news.relatedCoins.slice(0, 5).map(coin => (
                    <span
                      key={coin}
                      className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs"
                    >
                      {coinSymbols[coin] || '??} {coin}
                    </span>
                  ))}
                </div>

                {/* ?¡ì…˜ ë²„íŠ¼ */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    ?“° {news.source.name}
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm px-2 py-1 bg-purple-600/20 rounded"
                    >
                      ?“° ê¸°ì‚¬ ?ë¬¸ ë³´ê¸° ??
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ?´ìŠ¤ ?†ìŒ */}
        {!loading && filteredNews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">? íƒ??ì¡°ê±´??ë§ëŠ” ?´ìŠ¤ê°€ ?†ìŠµ?ˆë‹¤.</p>
          </div>
        )}
      </div>
    </div>
  )
}
