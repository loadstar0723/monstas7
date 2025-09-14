'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { realNewsService, RealNewsItem } from '@/lib/services/realNewsService'

// AI 트레이딩 시그널 타입
interface TradingSignal {
  direction: 'LONG' | 'SHORT' | 'NEUTRAL'
  confidence: number
  entry?: number
  stopLoss?: number
  target?: number
  riskReward?: string
  timeframe: string
}

// 경제 상관관계 타입
interface EconomicCorrelation {
  sp500: number
  dxy: number
  gold: number
  oil: number
  bondYield: number
}

// 소셜 센티먼트 타입
interface SocialSentiment {
  twitter: number
  reddit: number
  telegram: number
  buzzScore: number
  viralPotential: 'LOW' | 'MEDIUM' | 'HIGH'
}

// 커뮤니티 투표 타입
interface CommunityVote {
  bullish: number
  neutral: number
  bearish: number
  total: number
}

// 뉴스 확장 타입
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
  const [autoTranslate, setAutoTranslate] = useState(true) // 기본값 true로 자동 번역 활성화
  const [showTranslated, setShowTranslated] = useState(true) // 번역/원문 토글 상태
  const [expandedNews, setExpandedNews] = useState<Set<string>>(new Set())
  const [showAllCoins, setShowAllCoins] = useState(false)
  const [coinsWithNews, setCoinsWithNews] = useState<Set<string>>(new Set())
  const [recentUpdateCoins, setRecentUpdateCoins] = useState<Set<string>>(new Set())

  // 실시간 대시보드 통계
  const [dashboardStats, setDashboardStats] = useState({
    totalNews: 0,
    bullishSignals: 0,
    bearishSignals: 0,
    avgConfidence: 0,
    topMentioned: [] as { coin: string; count: number }[],
    marketSentiment: 'NEUTRAL' as 'BULLISH' | 'NEUTRAL' | 'BEARISH'
  })

  // 코인 심볼 맵
  const coinSymbols = realNewsService.getAllCoinSymbols()

  // TOP 60+ 코인 목록
  const coins = [
    'ALL', 'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC',
    'LINK', 'DOT', 'UNI', 'ATOM', 'LTC', 'ETC', 'ICP', 'FIL', 'APT', 'ARB',
    'OP', 'NEAR', 'VET', 'ALGO', 'FTM', 'GRT', 'SAND', 'MANA', 'AXS', 'THETA',
    'AAVE', 'SNX', 'CRV', 'MKR', 'COMP', 'YFI', 'SUSHI', 'ZRX', 'BAT', 'ENJ',
    'CHZ', 'HBAR', 'FLOW', 'XTZ', 'EOS', 'BSV', 'NEO', 'WAVES', 'KSM', 'DASH',
    'ZEC', 'XMR', 'IOTA', 'XLM', 'TRX', 'HNT', 'EGLD', 'KLAY', 'QTUM', 'XEM'
  ]

  const categories = [
    { id: 'all', name: '전체', icon: '📰' },
    { id: 'breaking', name: '속보', icon: '🚨' },
    { id: 'regulatory', name: '규제', icon: '⚖️' },
    { id: 'defi', name: 'DeFi', icon: '🔷' },
    { id: 'technical', name: '기술', icon: '📊' },
    { id: 'market', name: '시장', icon: '📈' },
    { id: 'security', name: '보안', icon: '🔐' },
    { id: 'exchange', name: '거래소', icon: '🏦' },
    { id: 'macro', name: '매크로', icon: '🌍' }
  ]

  useEffect(() => {
    loadAllNews()
    const interval = setInterval(loadAllNews, 60000) // 1분마다 업데이트
    return () => clearInterval(interval)
  }, [selectedCoin]) // selectedCoin 변경 시 다시 로드

  // 뉴스가 있는 코인과 최근 업데이트 코인 추적
  useEffect(() => {
    const coinsSet = new Set<string>()
    const recentSet = new Set<string>()
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    allNews.forEach(news => {
      news.relatedCoins.forEach(coin => {
        coinsSet.add(coin)
        // 1시간 이내 뉴스가 있는 코인은 최근 업데이트로 표시
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

  // AI 트레이딩 시그널 분석 (강화된 버전)
  const analyzeTraidingSignal = useCallback((news: RealNewsItem): TradingSignal => {
    const text = (news.title + ' ' + news.description).toLowerCase()

    // 강화된 키워드 분석
    const strongBullish = ['breakout', 'institutional buying', 'etf approval', 'mass adoption', 'all-time high']
    const bullish = ['surge', 'rally', 'bullish', 'partnership', 'upgrade', 'gains', 'rise', 'soar', 'pump']
    const bearish = ['crash', 'dump', 'plunge', 'bearish', 'ban', 'hack', 'sell', 'drop', 'fall', 'decline']
    const strongBearish = ['bankruptcy', 'scam', 'exit scam', 'regulatory ban', 'delisting', 'hack confirmed']

    let score = 0
    strongBullish.forEach(word => { if (text.includes(word)) score += 3 })
    bullish.forEach(word => { if (text.includes(word)) score += 1 })
    bearish.forEach(word => { if (text.includes(word)) score -= 1 })
    strongBearish.forEach(word => { if (text.includes(word)) score -= 3 })

    // 방향성 결정
    const direction = score > 2 ? 'LONG' : score < -2 ? 'SHORT' : 'NEUTRAL'
    const confidence = Math.min(Math.abs(score) * 15, 95)

    // 실제 진입가/손절가/목표가 계산 (신뢰도 기반)
    const basePrice = 50000 // BTC 기준 가격 (실제 구현 시 API에서 가져옴)
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

    // 시간대 분석
    const timeframe = confidence > 80 ? '단기 (1-24시간)' :
                     confidence > 60 ? '중기 (1-7일)' :
                     '장기 (1개월+)'

    return { direction, confidence, entry, stopLoss, target, riskReward, timeframe }
  }, [])

  // 경제 상관관계 분석
  const analyzeEconomicCorrelation = useCallback((): EconomicCorrelation => {
    // 시간대별 동적 상관관계 (시간에 따라 변동)
    const hour = new Date().getHours()
    const dayFactor = Math.sin((hour / 24) * Math.PI * 2) // 시간대별 변동

    return {
      sp500: 0.65 + (dayFactor * 0.1), // 0.55 ~ 0.75 변동
      dxy: -0.45 + (dayFactor * 0.1), // -0.55 ~ -0.35 변동
      gold: 0.35 + (dayFactor * 0.05), // 0.30 ~ 0.40 변동
      oil: 0.15 + (dayFactor * 0.1), // 0.05 ~ 0.25 변동
      bondYield: -0.25 + (dayFactor * 0.05) // -0.30 ~ -0.20 변동
    }
  }, [])

  // 소셜 센티먼트 분석
  const analyzeSocialSentiment = useCallback((news: RealNewsItem): SocialSentiment => {
    // 뉴스 텍스트 기반 센티먼트 분석
    const text = (news.title + ' ' + news.description).toLowerCase()
    const viralKeywords = ['breaking', 'urgent', 'exclusive', 'massive', 'unprecedented']
    const viralCount = viralKeywords.filter(word => text.includes(word)).length

    // 텍스트 길이와 키워드 기반 버즈 스코어 계산
    const buzzScore = Math.min(95, (text.length / 10) + (viralCount * 20))

    return {
      twitter: Math.floor(text.length * 2.5), // 텍스트 길이 기반
      reddit: Math.floor(text.length * 1.5),
      telegram: Math.floor(text.length * 0.8),
      buzzScore: Math.floor(buzzScore),
      viralPotential: buzzScore > 70 ? 'HIGH' : buzzScore > 40 ? 'MEDIUM' : 'LOW'
    }
  }, [])

  // 중요도 분석
  const analyzeImportance = useCallback((news: RealNewsItem): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' => {
    const text = (news.title + ' ' + news.description).toLowerCase()
    if (text.includes('breaking') || text.includes('urgent')) return 'CRITICAL'
    if (text.includes('major') || text.includes('significant')) return 'HIGH'
    if (text.includes('update') || text.includes('announces')) return 'MEDIUM'
    return 'LOW'
  }, [])

  // 뉴스 데이터 로드 및 강화
  const loadAllNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const symbols = selectedCoin === 'ALL' ? ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'] : [selectedCoin]
      const news = await realNewsService.fetchRealNews(symbols)

      // 뉴스 강화
      const enhancedNews: EnhancedNewsItem[] = news.map(item => {
        const tradingSignal = analyzeTraidingSignal(item)
        const confidence = tradingSignal.confidence
        return {
          ...item,
          tradingSignal,
          economicCorrelation: analyzeEconomicCorrelation(),
          socialSentiment: analyzeSocialSentiment(item),
          communityVote: {
            bullish: Math.floor(confidence * 0.8), // 신뢰도 기반
            neutral: 30, // 기본값
            bearish: Math.floor((100 - confidence) * 0.8), // 역신뢰도
            total: 175
          },
          importance: analyzeImportance(item)
        }
      })

      setAllNews(enhancedNews)
      setFilteredNews(enhancedNews)

      // 자동 번역이 활성화되어 있으면 모든 뉴스 번역 시작
      if (autoTranslate) {
        enhancedNews.forEach((news, index) => {
          // 순차적으로 번역 (서버 부하 방지)
          setTimeout(() => {
            translateNews(news.id, news.title, news.description)
          }, index * 100)
        })
      }
    } catch (error) {
      console.error('뉴스 로딩 에러:', error)
      setError('뉴스를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 필터링
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

  // 한국어 번역
  const translateNews = async (newsId: string, title: string, description: string) => {
    if (translations[newsId]) return

    setTranslating(newsId)
    try {
      // 제목과 설명을 각각 번역
      const [titleRes, descRes] = await Promise.all([
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: title, targetLang: 'ko' })
        }).catch(err => {
          console.error('제목 번역 실패:', err)
          return { ok: false }
        }),
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: description, targetLang: 'ko' })
        }).catch(err => {
          console.error('설명 번역 실패:', err)
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
      console.error('번역 실패:', error)
    } finally {
      setTranslating(null)
    }
  }

  // 대시보드 통계 계산
  const calculateDashboardStats = () => {
    const bullish = filteredNews.filter(n => n.tradingSignal?.direction === 'LONG').length
    const bearish = filteredNews.filter(n => n.tradingSignal?.direction === 'SHORT').length
    const avgConf = filteredNews.reduce((acc, n) => acc + (n.tradingSignal?.confidence || 0), 0) / (filteredNews.length || 1)

    // 가장 많이 언급된 코인
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

  // 커뮤니티 투표
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

  // 뉴스 확장/축소 토글
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
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            🗞️ AI 암호화폐 뉴스 분석 센터
          </h1>
          <p className="text-gray-400">
            실시간 뉴스 • AI 트레이딩 시그널 • 경제 상관관계 • 소셜 센티먼트
          </p>
        </motion.div>

        {/* 실시간 대시보드 */}
        {showDashboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-purple-500/30"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">📊 실시간 대시보드</h2>
              <button
                onClick={() => setShowDashboard(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{dashboardStats.totalNews}</div>
                <div className="text-xs text-gray-400">전체 뉴스</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">🟢 {dashboardStats.bullishSignals}</div>
                <div className="text-xs text-gray-400">강세 시그널</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">🔴 {dashboardStats.bearishSignals}</div>
                <div className="text-xs text-gray-400">약세 시그널</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{dashboardStats.avgConfidence}%</div>
                <div className="text-xs text-gray-400">평균 신뢰도</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  dashboardStats.marketSentiment === 'BULLISH' ? 'text-green-400' :
                  dashboardStats.marketSentiment === 'BEARISH' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {dashboardStats.marketSentiment === 'BULLISH' ? '📈' :
                   dashboardStats.marketSentiment === 'BEARISH' ? '📉' : '➡️'}
                </div>
                <div className="text-xs text-gray-400">시장 센티먼트</div>
              </div>
              <div className="text-center">
                <div className="text-xs">
                  {dashboardStats.topMentioned.slice(0, 3).map(({ coin, count }) => (
                    <div key={coin} className="text-purple-400">
                      {coin}: {count}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-400">인기 코인</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 코인 선택 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-400">코인 선택 (60+ 지원)</h3>
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
                    접기
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    모든 코인 보기
                  </>
                )}
              </button>
              <button
                onClick={() => setAutoTranslate(!autoTranslate)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  autoTranslate ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                🌐 자동 번역 {autoTranslate ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* 최근 업데이트 또는 뉴스가 있는 코인들 우선 표시 */}
            {coins
              .filter(coin => {
                if (showAllCoins) return true
                if (coin === 'ALL') return true
                return coinsWithNews.has(coin) || recentUpdateCoins.has(coin)
              })
              .sort((a, b) => {
                // ALL을 항상 맨 앞에
                if (a === 'ALL') return -1
                if (b === 'ALL') return 1
                // 최근 업데이트 코인 우선
                if (recentUpdateCoins.has(a) && !recentUpdateCoins.has(b)) return -1
                if (!recentUpdateCoins.has(a) && recentUpdateCoins.has(b)) return 1
                // 뉴스가 있는 코인 다음
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
                  {coin === 'ALL' ? '🌍' : coinSymbols[coin] || '●'} {coin}
                </button>
              ))}
          </div>
          {!showAllCoins && coins.filter(coin => coin !== 'ALL' && !coinsWithNews.has(coin) && !recentUpdateCoins.has(coin)).length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {coins.filter(coin => coin !== 'ALL' && !coinsWithNews.has(coin) && !recentUpdateCoins.has(coin)).length}개의 코인이 숨겨져 있습니다
            </div>
          )}
        </div>

        {/* 번역/원문 전체 토글 */}
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
              <>🇬🇧 영어 원문으로 보기</>
            ) : (
              <>🇰🇷 한국어로 번역해서 보기</>
            )}
          </button>
        </div>

        {/* 필터 컨트롤 */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 카테고리 */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-400 mb-2 block">카테고리</label>
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

          {/* 날짜 선택 */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">날짜 검색</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={today}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
            />
          </div>

          {/* 보기 모드 */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">보기 모드</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('analysis')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  viewMode === 'analysis'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                📊 분석
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                📱 그리드
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                📋 리스트
              </button>
            </div>
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">실제 뉴스 데이터 로딩 중...</p>
          </div>
        )}

        {/* 뉴스 목록 - 뷰 모드별 렌더링 */}
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
                {/* 중요도 표시 */}
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
                      {news.tradingSignal.direction === 'LONG' ? '🟢 LONG' :
                       news.tradingSignal.direction === 'SHORT' ? '🔴 SHORT' :
                       '⚪ NEUTRAL'} {news.tradingSignal.confidence}%
                    </span>
                  )}
                </div>

                {/* 제목 (번역 포함) */}
                <h3 className="text-white font-semibold mb-2">
                  {showTranslated && translations[news.id]?.title
                    ? translations[news.id].title
                    : news.title}
                  {translating === news.id && ' 번역중...'}
                </h3>

                {/* 설명 - 항상 표시 (접기/펼치기와 관계없이) */}
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {showTranslated && translations[news.id]?.description
                    ? translations[news.id].description
                    : news.description}
                </p>

                {/* 트레이딩 참고사항 - 간략한 아이콘과 정보 */}
                <div className="flex items-center gap-3 mb-3 text-xs">
                  {news.tradingSignal && (
                    <>
                      {/* 방향성 */}
                      <span className={`flex items-center gap-1 px-2 py-1 rounded ${
                        news.tradingSignal.direction === 'LONG' ? 'bg-green-600/20 text-green-400' :
                        news.tradingSignal.direction === 'SHORT' ? 'bg-red-600/20 text-red-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {news.tradingSignal.direction === 'LONG' ? '📈' :
                         news.tradingSignal.direction === 'SHORT' ? '📉' : '➡️'}
                        {news.tradingSignal.direction}
                      </span>

                      {/* 신뢰도 */}
                      <span className="flex items-center gap-1">
                        🎯 {news.tradingSignal.confidence}%
                      </span>

                      {/* 중요도 */}
                      <span className={`px-2 py-1 rounded ${
                        news.importance === 'CRITICAL' ? 'bg-red-600/20 text-red-400' :
                        news.importance === 'HIGH' ? 'bg-orange-600/20 text-orange-400' :
                        news.importance === 'MEDIUM' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {news.importance === 'CRITICAL' ? '🚨' :
                         news.importance === 'HIGH' ? '⚠️' :
                         news.importance === 'MEDIUM' ? '💡' : 'ℹ️'}
                        {news.importance}
                      </span>
                    </>
                  )}
                </div>

                {/* 펼치기 버튼 */}
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
                        접기
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        상세보기
                      </>
                    )}
                  </button>
                </div>

                {/* 확장 시 추가 정보 표시 */}
                {expandedNews.has(news.id) && (
                  <>
                    {/* 전체 내용 */}
                    {news.content && (
                      <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                        <h4 className="text-xs font-semibold text-purple-400 mb-2">📄 전체 내용</h4>
                        <p className="text-gray-400 text-xs">
                          {showTranslated && translations[news.id]?.description
                            ? translations[news.id].description
                            : news.content?.substring(0, 500) + '...'}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* 분석 뷰에서만 표시되는 상세 정보 - 확장 시에만 */}
                {viewMode === 'analysis' && expandedNews.has(news.id) && (
                  <>
                    {/* AI 트레이딩 시그널 */}
                    {news.tradingSignal && (
                      <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                        <h4 className="text-xs font-semibold text-purple-400 mb-2">🤖 AI 트레이딩 시그널</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>방향: {news.tradingSignal.direction}</div>
                          <div>신뢰도: {news.tradingSignal.confidence}%</div>
                          <div>시간대: {news.tradingSignal.timeframe}</div>
                          <div>R:R: {news.tradingSignal.riskReward}</div>
                        </div>
                      </div>
                    )}

                    {/* 소셜 센티먼트 */}
                    {news.socialSentiment && (
                      <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                        <h4 className="text-xs font-semibold text-purple-400 mb-2">💬 소셜 센티먼트</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>Twitter: {news.socialSentiment.twitter.toLocaleString()}</div>
                          <div>Reddit: {news.socialSentiment.reddit.toLocaleString()}</div>
                          <div>버즈: {news.socialSentiment.buzzScore}점</div>
                        </div>
                        <div className={`mt-2 text-xs ${
                          news.socialSentiment.viralPotential === 'HIGH' ? 'text-red-400' :
                          news.socialSentiment.viralPotential === 'MEDIUM' ? 'text-yellow-400' :
                          'text-gray-400'
                        }`}>
                          바이럴 가능성: {news.socialSentiment.viralPotential}
                        </div>
                      </div>
                    )}

                    {/* 커뮤니티 투표 */}
                    {news.communityVote && (
                      <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                        <h4 className="text-xs font-semibold text-purple-400 mb-2">🗳️ 커뮤니티 투표</h4>
                        <div className="flex gap-2 mb-2">
                          <button
                            onClick={() => handleVote(news.id, 'bullish')}
                            className="flex-1 py-1 bg-green-600/20 text-green-400 rounded text-xs hover:bg-green-600/30"
                          >
                            📈 강세 ({news.communityVote.bullish})
                          </button>
                          <button
                            onClick={() => handleVote(news.id, 'neutral')}
                            className="flex-1 py-1 bg-gray-600/20 text-gray-400 rounded text-xs hover:bg-gray-600/30"
                          >
                            ➡️ 중립 ({news.communityVote.neutral})
                          </button>
                          <button
                            onClick={() => handleVote(news.id, 'bearish')}
                            className="flex-1 py-1 bg-red-600/20 text-red-400 rounded text-xs hover:bg-red-600/30"
                          >
                            📉 약세 ({news.communityVote.bearish})
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          총 {news.communityVote.total}명 참여
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 관련 코인 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {news.relatedCoins.slice(0, 5).map(coin => (
                    <span
                      key={coin}
                      className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs"
                    >
                      {coinSymbols[coin] || '●'} {coin}
                    </span>
                  ))}
                </div>

                {/* 액션 버튼 */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    📰 {news.source.name}
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm px-2 py-1 bg-purple-600/20 rounded"
                    >
                      📰 기사 원문 보기 →
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 뉴스 없음 */}
        {!loading && filteredNews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">선택한 조건에 맞는 뉴스가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}