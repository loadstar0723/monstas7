'use client'

import { useState, useEffect } from 'react'
import { translateToKorean, translateNewsBody } from '@/lib/translateService'
import { motion, AnimatePresence } from 'framer-motion'
import { realNewsService, RealNewsItem } from '@/lib/services/realNewsService'
import { aiAnalysisService, TradingSignal, MarketSentiment } from '@/lib/services/aiAnalysisService'
import { translationService } from '@/lib/services/translationService'
import TradingSignalComponent from '@/components/news/TradingSignal'
import NewsModuleWrapper from '../components/NewsModuleWrapper'

interface EnhancedNewsItem extends RealNewsItem {
  tradingSignal?: TradingSignal
  translatedTitle?: string
  translatedDescription?: string
  isTranslated?: boolean
  currentPrice?: number
}

interface NewsDetailModalProps {
  news: EnhancedNewsItem
  onClose: () => void
}

// ?�스 ?�세 모달 (번역 기능 ?�함)
const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ news, onClose }) => {
  const [showTranslation, setShowTranslation] = useState(false)
  const [translatedContent, setTranslatedContent] = useState<string>('')
  const [translating, setTranslating] = useState(false)

  const handleTranslate = async () => {
    if (translatedContent) {
      setShowTranslation(!showTranslation)
      return
    }

    setTranslating(true)
    try {
      const translated = await translationService.translateWithClaude(
        news.content || news.description,
        'ko'
      )
      setTranslatedContent(translated)
      setShowTranslation(true)
    } catch (error) {
      console.error('Translation error:', error)
    } finally {
      setTranslating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* ?�더 */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {showTranslation && news.translatedTitle ? news.translatedTitle : news.title}
              </h2>
              {news.tradingSignal && (
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-lg font-bold ${
                    news.tradingSignal.direction === 'long' ? 'bg-green-500/20 text-green-400' :
                    news.tradingSignal.direction === 'short' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {news.tradingSignal.direction === 'long' ? '?�� 매수' :
                     news.tradingSignal.direction === 'short' ? '?�� 매도' : '?�️ 중립'}
                  </span>
                  <span className="text-gray-400">
                    ?�뢰?? <span className="text-white font-bold">{news.tradingSignal.confidence}%</span>
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 메�? ?�보 */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <span className="text-gray-400">?�� {news.source.name}</span>
            <span className="text-gray-400">
              ?�� {new Date(news.publishedAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {news.author && <span className="text-gray-400">?�️ {news.author}</span>}
          </div>

          {/* 번역 ?��? 버튼 */}
          <div className="mb-4">
            <button
              onClick={handleTranslate}
              disabled={translating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {translating ? '번역 �?..' : showTranslation ? '?�문 보기' : '?�� ?�국?�로 번역'}
            </button>
          </div>

          {/* ?�레?�딩 ?�그???�션 */}
          {news.tradingSignal && news.currentPrice && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">{translateToKorean("?�� AI ?�레?�딩 분석")}</h3>
              <TradingSignalComponent
                newsId={news.id}
                newsTitle={translateToKorean(news.title)}
                newsCategory={news.category}
                currentPrice={news.currentPrice}
                symbol={news.relatedCoins[0] || 'BTC'}
              />
            </div>
          )}

          {/* ?�용 */}
          <div className="prose prose-invert max-w-none mb-6">
            <div className="text-gray-300 leading-relaxed text-base whitespace-pre-wrap">
              {showTranslation && translatedContent
                ? translatedContent
                : (news.content || news.description)}
            </div>
          </div>

          {/* 관??코인 */}
          {news.relatedCoins.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm text-gray-500 mb-2">{translateToKorean("관??코인")}</h3>
              <div className="flex flex-wrap gap-2">
                {news.relatedCoins.map(coin => (
                  <span
                    key={coin}
                    className="px-3 py-1.5 bg-purple-600/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30"
                  >
                    {realNewsService.getCoinSymbol(coin)} {coin}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ?�션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-800">
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all text-center font-medium"
            >
              ?�문 보기 ??
            </a>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              ?�기
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function UltimateNewsModule() {
  const [selectedCoin, setSelectedCoin] = useState('ALL')
  const [allNews, setAllNews] = useState<EnhancedNewsItem[]>([])
  const [filteredNews, setFilteredNews] = useState<EnhancedNewsItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'ai' | 'list' | 'grid'>('ai')
  const [selectedNews, setSelectedNews] = useState<EnhancedNewsItem | null>(null)
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment | null>(null)
  const [autoTranslate, setAutoTranslate] = useState(true)
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({})

  // 코인 ?�볼 �?
  const coinSymbols = realNewsService.getAllCoinSymbols()

  // TOP 코인 목록
  const coins = [
    'ALL', 'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC',
    'LINK', 'DOT', 'UNI', 'ATOM', 'LTC', 'ETC', 'ICP', 'FIL', 'APT', 'ARB',
    'OP', 'NEAR', 'VET', 'ALGO', 'FTM', 'GRT', 'SAND', 'MANA', 'AXS', 'THETA'
  ]

  const categories = [
    { id: 'all', name: '전체', icon: '📰', color: 'purple' },
    { id: 'breaking', name: '속보', icon: '🚨', color: 'red' },
    { id: 'regulatory', name: '규제', icon: '⚖️', color: 'blue' },
    { id: 'defi', name: 'DeFi', icon: '🏦', color: 'green' },
    { id: 'technical', name: '기술', icon: '⚙️', color: 'indigo' },
    { id: 'market', name: '시장', icon: '📈', color: 'cyan' },
    { id: 'security', name: '보안', icon: '🔒', color: 'orange' },
    { id: 'exchange', name: '거래소', icon: '💱', color: 'yellow' }
  ]

  useEffect(() => {
    loadAllNews()
    loadPrices()
    const interval = setInterval(() => {
      loadAllNews()
      loadPrices()
    }, 60000) // 1분마???�데?�트
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterNews()
  }, [selectedCategory, selectedDate, selectedCoin, allNews])

  const loadPrices = async () => {
    try {
      // 주요 코인 가�?가?�오�?
      const symbols = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP']
      const prices: Record<string, number> = {}

      for (const symbol of symbols) {
        const response = await fetch(`/api/binance/ticker/24hr?symbol=${symbol}USDT`)
        if (response.ok) {
          const data = await response.json()
          prices[symbol] = parseFloat(data.lastPrice)
        }
      }

      setCurrentPrices(prices)
    } catch (error) {
      console.error('Price loading error:', error)
    }
  }

  const loadAllNews = async () => {
    setLoading(true)
    try {
      // ?�제 ?�스 API ?�출
      const symbols = selectedCoin === 'ALL' ? ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'] : [selectedCoin]
      const news = await realNewsService.fetchRealNews(symbols)

      // ?�장 ?�이?��? 결합
      const enrichedNews = await realNewsService.enrichNewsWithMarketData(news)

      // AI ?�레?�딩 ?�그???�성 (?�위 10개만)
      const newsWithSignals: EnhancedNewsItem[] = []
      for (let i = 0; i < Math.min(10, enrichedNews.length); i++) {
        const item = enrichedNews[i]
        const mainCoin = item.relatedCoins[0] || 'BTC'
        const price = currentPrices[mainCoin] || 50000

        try {
          const signal = await aiAnalysisService.generateTradingSignal(item, price)
          newsWithSignals.push({
            ...item,
            tradingSignal: signal,
            currentPrice: price
          })
        } catch (error) {
          newsWithSignals.push(item)
        }
      }

      // ?�머지 ?�스 추�?
      newsWithSignals.push(...enrichedNews.slice(10))

      // ?�동 번역 (?�요??
      if (autoTranslate) {
        for (const item of newsWithSignals.slice(0, 5)) {
          try {
            const translated = await translationService.translateNews({
              title: item.title,
              description: item.description
            })
            item.translatedTitle = translated.title
            item.translatedDescription = translated.description
            item.isTranslated = translated.isTranslated
          } catch (error) {
            console.error('Translation error:', error)
          }
        }
      }

      // ?�장 ?�티먼트 분석
      const sentiment = await aiAnalysisService.analyzeMarketSentiment(enrichedNews.slice(0, 20))
      setMarketSentiment(sentiment)

      setAllNews(newsWithSignals)
      setFilteredNews(newsWithSignals)
    } catch (error) {
      console.error('?�스 로딩 ?�러:', error)
      setAllNews([])
      setFilteredNews([])
    } finally {
      setLoading(false)
    }
  }

  const filterNews = async () => {
    let filtered = [...allNews]

    // 카테고리 ?�터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(news => news.category === selectedCategory)
    }

    // ?�짜 ?�터
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

    // 코인 ?�터
    if (selectedCoin !== 'ALL') {
      filtered = filtered.filter(news => news.relatedCoins.includes(selectedCoin))
    }

    setFilteredNews(filtered)
  }

  const getFearGreedColor = (value: number) => {
    if (value < 20) return 'text-red-500'
    if (value < 40) return 'text-orange-500'
    if (value < 60) return 'text-yellow-500'
    if (value < 80) return 'text-green-500'
    return 'text-green-400'
  }

  const getFearGreedLabel = (value: number) => {
    if (value < 20) return '극도??공포'
    if (value < 40) return '공포'
    if (value < 60) return '중립'
    if (value < 80) return '?�욕'
    return '극도???�욕'
  }

  // ?�늘 ?�짜
  const today = new Date().toISOString().split('T')[0]

  return (
    <NewsModuleWrapper moduleName="UltimateNewsModule">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ?�더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-3">{translateToKorean("?? Ultimate ?�호?�폐 ?�스 ?�털")}</h1>
          <p className="text-gray-400 text-lg">
            AI ?�레?�딩 ?�그?????�시�?번역 ???�셜 ?�티먼트 ??{allNews.length}개의 최신 ?�스
          </p>
        </motion.div>

        {/* ?�장 ?�티먼트 ?�?�보??*/}
        {marketSentiment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-6 bg-gradient-to-br from-gray-800/50 to-purple-900/20 rounded-xl border border-purple-500/30"
          >
            <h2 className="text-xl font-bold text-white mb-4">{translateToKorean("?�� ?�장 ?�티먼트 분석")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{marketSentiment.bullish.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">?�� 강세</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">{marketSentiment.bearish.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">?�� ?�세</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400">{marketSentiment.neutral.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">?�️ 중립</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getFearGreedColor(marketSentiment.fearGreedIndex)}`}>
                  {marketSentiment.fearGreedIndex.toFixed(0)}
                </div>
                <div className="text-sm text-gray-400">?�� 공포/?�욕</div>
                <div className="text-xs text-gray-500">{getFearGreedLabel(marketSentiment.fearGreedIndex)}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{marketSentiment.volatilityScore.toFixed(1)}</div>
                <div className="text-sm text-gray-400">??변?�성</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 코인 ?�택 버튼 */}
        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-3">{translateToKorean("코인�??�스 ?�터")}</h3>
          <div className="flex flex-wrap gap-2">
            {coins.map(coin => (
              <motion.button
                key={coin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCoin(coin)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCoin === coin
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-1">
                  {coin === 'ALL' ? '📰' : coinSymbols[coin] || '💰'}
                </span>
                {coin}
                {currentPrices[coin] && (
                  <span className="ml-2 text-xs opacity-70">
                    ${currentPrices[coin].toLocaleString()}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ?�터 컨트�?*/}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 카테고리 ?�터 */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 4).map(cat => (
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

          {/* 보기 모드 & 자동 번역 */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">설정</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('ai')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'ai'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                ?�� AI
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                ?�� 그리??
              </button>
              <button
                onClick={() => setAutoTranslate(!autoTranslate)}
                className={`px-4 py-2 rounded-lg ${
                  autoTranslate
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                ?�� ?�동번역
              </button>
            </div>
          </div>
        </div>

        {/* 로딩 ?�태 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">{translateNewsBody("AI 분석 �??�시�??�이??로딩 �?..")}</p>
          </div>
        )}

        {/* ?�스 목록 - AI �?*/}
        {!loading && viewMode === 'ai' && filteredNews.length > 0 && (
          <div className="space-y-6">
            {filteredNews.slice(0, 10).map((news, index) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-800/50 to-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer"
                onClick={() => setSelectedNews(news)}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* ?�스 ?�용 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                          news.category === 'breaking' ? 'bg-red-600/20 text-red-400' :
                          news.category === 'regulatory' ? 'bg-blue-600/20 text-blue-400' :
                          'bg-gray-600/20 text-gray-400'
                        }`}>
                          {categories.find(c => c.id === news.category)?.icon} {news.category}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-2 hover:text-purple-400 transition-colors">
                          {news.isTranslated && news.translatedTitle ? news.translatedTitle : news.title}
                        </h3>
                        {news.isTranslated && (
                          <span className="text-xs text-green-400">✓ 번역됨</span>
                        )}
                      </div>
                      {news.image && (
                        <img
                          src={news.image}
                          alt=""
                          className="w-24 h-24 object-cover rounded-lg ml-4"
                        />
                      )}
                    </div>
                    <p className="text-gray-400 mb-3 line-clamp-2">
                      {news.isTranslated && news.translatedDescription
                        ? news.translatedDescription
                        : news.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {news.relatedCoins.slice(0, 3).map(coin => (
                        <span key={coin} className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs">
                          {coinSymbols[coin]} {coin}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{news.source.name}</span>
                      <span>{new Date(news.publishedAt).toLocaleString('ko-KR')}</span>
                    </div>
                  </div>

                  {/* AI ?�레?�딩 ?�그??*/}
                  {news.tradingSignal && (
                    <div className="lg:w-96">
                      <TradingSignalComponent
                        newsId={news.id}
                        newsTitle={translateToKorean(news.title)}
                        newsCategory={news.category}
                        currentPrice={news.currentPrice || currentPrices[news.relatedCoins[0]] || 50000}
                        symbol={news.relatedCoins[0] || 'BTC'}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ?�스 목록 - 그리??�?*/}
        {!loading && viewMode === 'grid' && filteredNews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNews.map((news, index) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-purple-500 transition-all cursor-pointer"
                onClick={() => setSelectedNews(news)}
              >
                {/* ?�레?�딩 ?�그??배�? */}
                {news.tradingSignal && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      news.tradingSignal.direction === 'long' ? 'bg-green-500/20 text-green-400' :
                      news.tradingSignal.direction === 'short' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {news.tradingSignal.direction === 'long' ? '?��' :
                       news.tradingSignal.direction === 'short' ? '?��' : '?�️'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {news.tradingSignal.confidence}%
                    </span>
                  </div>
                )}

                <h3 className="text-white font-semibold mb-2 line-clamp-2">
                  {news.isTranslated && news.translatedTitle ? news.translatedTitle : news.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {news.isTranslated && news.translatedDescription
                    ? news.translatedDescription
                    : news.description}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{news.source.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(news.url, '_blank')
                    }}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    ?�문 ??
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ?�스 ?�음 */}
        {!loading && filteredNews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">?��</div>
            <p className="text-gray-400 text-lg">{translateNewsBody("?�택??조건??맞는 ?�스가 ?�습?�다.")}</p>
          </div>
        )}

        {/* ?�스 ?�세 모달 */}
        <AnimatePresence>
          {selectedNews && (
            <NewsDetailModal
              news={selectedNews}
              onClose={() => setSelectedNews(null)}
            />
          )}
        </AnimatePresence>

        {/* ?�단 ?�보 */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>{translateNewsBody("이 AI 트레이딩 시그널은 Claude API 번역 및 실시간 센티먼트 분석")}</p>
          <p className="mt-2">{translateNewsBody("데이터 제공: CryptoCompare, Binance, Coinbase")}</p>
        </div>
      </div>
    </div>
      </NewsModuleWrapper>
  )
}