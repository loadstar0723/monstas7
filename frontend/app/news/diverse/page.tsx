'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { realNewsService, RealNewsItem } from '@/lib/services/realNewsService'

interface NewsDetailModalProps {
  news: RealNewsItem
  onClose: () => void
}

// ?¥Ïä§ ?ÅÏÑ∏ Î≥¥Í∏∞ Î™®Îã¨
const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ news, onClose }) => {
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
        className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ?¥Î?ÏßÄ ?§Îçî */}
        {news.image && (
          <div className="relative h-64 w-full">
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-full object-cover rounded-t-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
          </div>
        )}

        <div className="p-6">
          {/* ?§Îçî */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white pr-4 leading-tight">
              {news.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Î©îÌ? ?ïÎ≥¥ */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <span className="text-gray-400">
              <span className="text-purple-400">?ì∞</span> {news.source.name}
            </span>
            <span className="text-gray-400">
              <span className="text-blue-400">?ìÖ</span> {new Date(news.publishedAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {news.author && (
              <span className="text-gray-400">
                <span className="text-green-400">?çÔ∏è</span> {news.author}
              </span>
            )}
          </div>

          {/* Í¥Ä??ÏΩîÏù∏ ?úÍ∑∏ */}
          {news.relatedCoins.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm text-gray-500 mb-2">Í¥Ä??ÏΩîÏù∏</h3>
              <div className="flex flex-wrap gap-2">
                {news.relatedCoins.map(coin => (
                  <span
                    key={coin}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30"
                  >
                    {realNewsService.getCoinSymbol(coin)} {coin}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ïπ¥ÌÖåÍ≥†Î¶¨ ?úÍ∑∏ */}
          <div className="mb-6">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
              news.category === 'breaking' ? 'bg-red-600/20 text-red-400 border border-red-500/30' :
              news.category === 'regulatory' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' :
              news.category === 'defi' ? 'bg-green-600/20 text-green-400 border border-green-500/30' :
              news.category === 'exchange' ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30' :
              news.category === 'security' ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30' :
              news.category === 'technical' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' :
              news.category === 'market' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30' :
              'bg-gray-600/20 text-gray-400 border border-gray-500/30'
            }`}>
              {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
            </span>
          </div>

          {/* ?¥Ïö© */}
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 leading-relaxed text-base whitespace-pre-wrap">
              {news.content || news.description}
            </div>
          </div>

          {/* ?°ÏÖò Î≤ÑÌäº */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-800">
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all text-center font-medium"
            >
              ?êÎ¨∏ Î≥¥Í∏∞ ??
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(news.url)
                alert('ÎßÅÌÅ¨Í∞Ä Î≥µÏÇ¨?òÏóà?µÎãà??')
              }}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              ÎßÅÌÅ¨ Î≥µÏÇ¨
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              ?´Í∏∞
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function DiverseCryptoNewsPortal() {
  const [selectedCoin, setSelectedCoin] = useState('ALL')
  const [allNews, setAllNews] = useState<RealNewsItem[]>([])
  const [filteredNews, setFilteredNews] = useState<RealNewsItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'analysis'>('analysis')
  const [selectedNews, setSelectedNews] = useState<RealNewsItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'relevance'>('date')
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // ÏΩîÏù∏ ?¨Î≥º Îß?
  const coinSymbols = realNewsService.getAllCoinSymbols()

  // TOP 50 ÏΩîÏù∏ + ?†Í∑ú/??ÏΩîÏù∏
  const coins = [
    'ALL', 'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC',
    'LINK', 'DOT', 'UNI', 'ATOM', 'LTC', 'ETC', 'ICP', 'FIL', 'APT', 'ARB',
    'OP', 'NEAR', 'VET', 'ALGO', 'FTM', 'GRT', 'SAND', 'MANA', 'AXS', 'THETA',
    'WLD', 'SEI', 'SUI', 'TIA', 'BLUR', 'JTO', 'PYTH', 'JUP', 'STRK', 'PORTAL'
  ]

  const categories = [
    { id: 'all', name: '?ÑÏ≤¥', icon: '?ì∞', color: 'purple' },
    { id: 'breaking', name: '?çÎ≥¥', icon: '?ö®', color: 'red' },
    { id: 'regulatory', name: 'Í∑úÏ†ú', icon: '?ñÔ∏è', color: 'blue' },
    { id: 'defi', name: 'DeFi', icon: '?î∑', color: 'green' },
    { id: 'technical', name: 'Í∏∞Ïà†', icon: '?ìä', color: 'indigo' },
    { id: 'market', name: '?úÏû•', icon: '?ìà', color: 'cyan' },
    { id: 'security', name: 'Î≥¥Ïïà', icon: '?îê', color: 'orange' },
    { id: 'exchange', name: 'Í±∞Îûò??, icon: '?è¶', color: 'yellow' }
  ]

  useEffect(() => {
    loadAllNews()
    const interval = setInterval(loadAllNews, 60000) // 1Î∂ÑÎßà???ÖÎç∞?¥Ìä∏
    // ?¥Îùº?¥Ïñ∏?∏Ïóê?úÎßå ?úÍ∞Ñ ?ÖÎç∞?¥Ìä∏
    setLastUpdate(new Date().toLocaleString('ko-KR'))
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterNews()
  }, [selectedCategory, selectedDate, dateRange, selectedCoin, sortBy, allNews])

  const loadAllNews = async () => {
    setLoading(true)
    setError(null)
    try {
      // ?§Ï†ú ?¥Ïä§ API ?∏Ï∂ú
      const symbols = selectedCoin === 'ALL' ? ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'] : [selectedCoin]
      const news = await realNewsService.fetchRealNews(symbols)

      // ?úÏû• ?∞Ïù¥?∞Ï? Í≤∞Ìï©
      const enrichedNews = await realNewsService.enrichNewsWithMarketData(news)
      setAllNews(enrichedNews)
      setFilteredNews(enrichedNews)
      // ?ÖÎç∞?¥Ìä∏ ?úÍ∞Ñ ?§Ï†ï
      setLastUpdate(new Date().toLocaleString('ko-KR'))
    } catch (error) {
      console.error('?¥Ïä§ Î°úÎî© ?êÎü¨:', error)
      setError('?¥Ïä§Î•?Î∂àÎü¨?§Îäî Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§. ?†Ïãú ???§Ïãú ?úÎèÑ?¥Ï£º?∏Ïöî.')
      setAllNews([])
      setFilteredNews([])
    } finally {
      setLoading(false)
    }
  }

  const filterNews = async () => {
    let filtered = [...allNews]

    // Ïπ¥ÌÖåÍ≥†Î¶¨ ?ÑÌÑ∞
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(news => news.category === selectedCategory)
    }

    // ?†Ïßú ?ÑÌÑ∞ (?®Ïùº ?†Ïßú)
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

    // ?†Ïßú Î≤îÏúÑ ?ÑÌÑ∞
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59, 999)

      filtered = filtered.filter(news => {
        const newsDate = new Date(news.publishedAt)
        return newsDate >= startDate && newsDate <= endDate
      })
    }

    // ÏΩîÏù∏ ?ÑÌÑ∞
    if (selectedCoin !== 'ALL') {
      filtered = filtered.filter(news => news.relatedCoins.includes(selectedCoin))
    }

    // ?ïÎ†¨
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    } else if (sortBy === 'relevance' && selectedCoin !== 'ALL') {
      // Í¥Ä?®ÎèÑ ???ïÎ†¨ (?†ÌÉù??ÏΩîÏù∏???úÎ™©???àÏúºÎ©??∞ÏÑ†)
      filtered.sort((a, b) => {
        const aInTitle = a.title.includes(selectedCoin) ? 1 : 0
        const bInTitle = b.title.includes(selectedCoin) ? 1 : 0
        return bInTitle - aInTitle
      })
    }

    setFilteredNews(filtered)
  }

  // ?§Îäò ?†Ïßú Í∞Ä?∏Ïò§Í∏?
  const today = new Date().toISOString().split('T')[0]

  // ?ºÏ£º?????†Ïßú
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ?§Îçî */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-3">
            ?óûÔ∏??§ÏãúÍ∞??îÌò∏?îÌèê ?¥Ïä§ ?¨ÌÑ∏
          </h1>
          <p className="text-gray-400 text-lg">
            ?§Ï†ú ?¥Ïä§ ?∞Ïù¥????CryptoCompare, Binance, Coinbase ?úÍ≥µ ??{allNews.length}Í∞úÏùò ÏµúÏã† ?¥Ïä§
          </p>
        </motion.div>

        {/* ÏΩîÏù∏ ?†ÌÉù Î≤ÑÌäº??- ?¨Î≥º Ï∂îÍ? */}
        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-3">ÏΩîÏù∏Î≥??¥Ïä§ ?ÑÌÑ∞</h3>
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
                  {coin === 'ALL' ? '?åç' : coinSymbols[coin] || '??}
                </span>
                {coin}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ?ÑÌÑ∞ Ïª®Ìä∏Î°?*/}
        <div className="mb-6 space-y-4">
          {/* Ïπ¥ÌÖåÍ≥†Î¶¨ ?ÑÌÑ∞ */}
          <div>
            <h3 className="text-sm text-gray-400 mb-3">Ïπ¥ÌÖåÍ≥†Î¶¨</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? `bg-${cat.color}-600 text-white shadow-lg`
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                  style={selectedCategory === cat.id ? {
                    backgroundColor: cat.color === 'purple' ? '#9333ea' :
                                   cat.color === 'red' ? '#dc2626' :
                                   cat.color === 'blue' ? '#2563eb' :
                                   cat.color === 'green' ? '#16a34a' :
                                   cat.color === 'indigo' ? '#4f46e5' :
                                   cat.color === 'cyan' ? '#06b6d4' :
                                   cat.color === 'orange' ? '#ea580c' :
                                   cat.color === 'yellow' ? '#ca8a04' : '#6b7280'
                  } : {}}
                >
                  {cat.icon} {cat.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* ?†Ïßú ?ÑÌÑ∞ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ?πÏ†ï ?†Ïßú Í≤Ä??*/}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">?πÏ†ï ?†Ïßú Í≤Ä??/label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setDateRange({ start: '', end: '' }) // ?†Ïßú Î≤îÏúÑ Ï¥àÍ∏∞??
                }}
                max={today}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              />
            </div>

            {/* ?†Ïßú Î≤îÏúÑ Í≤Ä??*/}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">?úÏûë ?†Ïßú</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => {
                  setDateRange({ ...dateRange, start: e.target.value })
                  setSelectedDate('') // ?πÏ†ï ?†Ïßú Ï¥àÍ∏∞??
                }}
                max={today}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Ï¢ÖÎ£å ?†Ïßú</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => {
                  setDateRange({ ...dateRange, end: e.target.value })
                  setSelectedDate('') // ?πÏ†ï ?†Ïßú Ï¥àÍ∏∞??
                }}
                min={dateRange.start}
                max={today}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          {/* Îπ†Î•∏ ?†Ïßú ?†ÌÉù Î≤ÑÌäº */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedDate(today)
                setDateRange({ start: '', end: '' })
              }}
              className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
            >
              ?§Îäò
            </button>
            <button
              onClick={() => {
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)
                setSelectedDate(yesterday.toISOString().split('T')[0])
                setDateRange({ start: '', end: '' })
              }}
              className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
            >
              ?¥Ï†ú
            </button>
            <button
              onClick={() => {
                setDateRange({ start: weekAgoStr, end: today })
                setSelectedDate('')
              }}
              className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
            >
              ÏµúÍ∑º 7??
            </button>
            <button
              onClick={() => {
                const monthAgo = new Date()
                monthAgo.setMonth(monthAgo.getMonth() - 1)
                setDateRange({ start: monthAgo.toISOString().split('T')[0], end: today })
                setSelectedDate('')
              }}
              className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
            >
              ÏµúÍ∑º 30??
            </button>
            <button
              onClick={() => {
                setSelectedDate('')
                setDateRange({ start: '', end: '' })
              }}
              className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              ?†Ïßú Ï¥àÍ∏∞??
            </button>
          </div>

          {/* ?ïÎ†¨ Î∞?Î≥¥Í∏∞ Î™®Îìú */}
          <div className="flex flex-wrap gap-4">
            {/* ?ïÎ†¨ */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">?ïÎ†¨</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-4 py-2 rounded-lg ${
                    sortBy === 'date'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  ?ìÖ ÏµúÏã†??
                </button>
                <button
                  onClick={() => setSortBy('relevance')}
                  className={`px-4 py-2 rounded-lg ${
                    sortBy === 'relevance'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  ?éØ Í¥Ä?®ÎèÑ??
                </button>
              </div>
            </div>

            {/* Î≥¥Í∏∞ Î™®Îìú */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Î≥¥Í∏∞ Î™®Îìú</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('analysis')}
                  className={`px-4 py-2 rounded-lg ${
                    viewMode === 'analysis'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  ?ìä Î∂ÑÏÑù
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  ?ì± Í∑∏Î¶¨??
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg ${
                    viewMode === 'list'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  ?ìã Î¶¨Ïä§??
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ?ÑÏû¨ ?ÑÌÑ∞ ?ÅÌÉú ?úÏãú */}
        {(selectedDate || dateRange.start || selectedCategory !== 'all' || selectedCoin !== 'ALL') && (
          <div className="mb-4 p-3 bg-purple-600/10 rounded-lg border border-purple-500/30">
            <span className="text-sm text-purple-400">
              ?ÑÌÑ∞ ?ÅÏö©Ï§?
              {selectedCoin !== 'ALL' && ` ${coinSymbols[selectedCoin]} ${selectedCoin}`}
              {selectedCategory !== 'all' && ` | ${categories.find(c => c.id === selectedCategory)?.name}`}
              {selectedDate && ` | ${new Date(selectedDate).toLocaleDateString('ko-KR')}`}
              {dateRange.start && dateRange.end && ` | ${new Date(dateRange.start).toLocaleDateString('ko-KR')} ~ ${new Date(dateRange.end).toLocaleDateString('ko-KR')}`}
              {` | ${filteredNews.length}Í∞??¥Ïä§`}
            </span>
          </div>
        )}

        {/* Î°úÎî© ?ÅÌÉú */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">?§Ï†ú ?¥Ïä§ ?∞Ïù¥??Î°úÎî© Ï§?..</p>
          </div>
        )}

        {/* ?êÎü¨ Î©îÏãúÏßÄ */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6"
          >
            <p className="text-red-400">{error}</p>
            <button
              onClick={loadAllNews}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              ?§Ïãú ?úÎèÑ
            </button>
          </motion.div>
        )}

        {/* ?¥Ïä§ Î™©Î°ù */}
        {!loading && filteredNews.length > 0 && (
          <div className={`
            ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' :
              viewMode === 'list' ? 'space-y-4' :
              'space-y-6'}
          `}>
            {viewMode === 'analysis' ? (
              // Î∂ÑÏÑù Î™®Îìú - Ï§ëÏöî ?¥Ïä§ Í∞ïÏ°∞
              <>
                {/* Ï£ºÏöî ?¥Ïä§ */}
                {filteredNews.slice(0, 3).map((news, index) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-gray-800/50 to-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer"
                    onClick={() => setSelectedNews(news)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 hover:text-purple-400 transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {news.description}
                        </p>
                      </div>
                      {news.image && (
                        <img
                          src={news.image}
                          alt=""
                          className="w-20 h-20 object-cover rounded-lg ml-4"
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {news.relatedCoins.slice(0, 3).map(coin => (
                        <span key={coin} className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs">
                          {coinSymbols[coin]} {coin}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{news.source.name}</span>
                      <span>{new Date(news.publishedAt).toLocaleTimeString('ko-KR')}</span>
                    </div>
                  </motion.div>
                ))}

                {/* ?òÎ®∏ÏßÄ ?¥Ïä§ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNews.slice(3).map((news, index) => (
                    <motion.div
                      key={news.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-purple-500 transition-all cursor-pointer"
                      onClick={() => setSelectedNews(news)}
                    >
                      <h3 className="text-white font-semibold mb-2 line-clamp-2">
                        {news.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {news.description}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{news.source.name}</span>
                        <span>{new Date(news.publishedAt).toLocaleTimeString('ko-KR')}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              // Í∑∏Î¶¨??Î¶¨Ïä§??Î™®Îìú
              filteredNews.map((news, index) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-purple-500 transition-all cursor-pointer ${
                    viewMode === 'list' ? 'p-4 flex items-start gap-4' : 'p-4'
                  }`}
                  onClick={() => setSelectedNews(news)}
                >
                  {viewMode === 'list' && news.image && (
                    <img
                      src={news.image}
                      alt=""
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    {/* ?¥Ïä§ Ïπ¥Îìú ?§Îçî */}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        news.category === 'breaking' ? 'bg-red-600/20 text-red-400' :
                        news.category === 'regulatory' ? 'bg-blue-600/20 text-blue-400' :
                        news.category === 'defi' ? 'bg-green-600/20 text-green-400' :
                        news.category === 'exchange' ? 'bg-yellow-600/20 text-yellow-400' :
                        news.category === 'security' ? 'bg-orange-600/20 text-orange-400' :
                        news.category === 'technical' ? 'bg-indigo-600/20 text-indigo-400' :
                        news.category === 'market' ? 'bg-cyan-600/20 text-cyan-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {categories.find(c => c.id === news.category)?.icon} {news.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(news.publishedAt).toLocaleString('ko-KR')}
                      </span>
                    </div>

                    {/* ?úÎ™© */}
                    <h3 className="text-white font-semibold mb-2 line-clamp-2 hover:text-purple-400 transition-colors">
                      {news.title}
                    </h3>

                    {/* ?§Î™Ö */}
                    <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                      {news.description}
                    </p>

                    {/* Í¥Ä??ÏΩîÏù∏ */}
                    {news.relatedCoins.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {news.relatedCoins.slice(0, 5).map(coin => (
                          <span
                            key={coin}
                            className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs"
                          >
                            {coinSymbols[coin] || '??} {coin}
                          </span>
                        ))}
                        {news.relatedCoins.length > 5 && (
                          <span className="px-2 py-1 text-gray-500 text-xs">
                            +{news.relatedCoins.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Ï∂úÏ≤ò Î∞?ÎßÅÌÅ¨ */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        ?ì∞ {news.source.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(news.url, '_blank')
                        }}
                        className="text-purple-400 hover:text-purple-300 text-sm"
                      >
                        ?êÎ¨∏ ??
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* ?¥Ïä§ ?ÜÏùå */}
        {!loading && filteredNews.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">?ì≠</div>
            <p className="text-gray-400 text-lg mb-2">?†ÌÉù??Ï°∞Í±¥??ÎßûÎäî ?¥Ïä§Í∞Ä ?ÜÏäµ?àÎã§.</p>
            <p className="text-gray-500 text-sm">?ÑÌÑ∞Î•?Î≥ÄÍ≤ΩÌïòÍ±∞ÎÇò ?†Ïßú Î≤îÏúÑÎ•?Ï°∞Ï†ï?¥Î≥¥?∏Ïöî.</p>
          </motion.div>
        )}

        {/* ?¥Ïä§ ?ÅÏÑ∏ Î™®Îã¨ */}
        <AnimatePresence>
          {selectedNews && (
            <NewsDetailModal
              news={selectedNews}
              onClose={() => setSelectedNews(null)}
            />
          )}
        </AnimatePresence>

        {/* ?òÎã® ?ïÎ≥¥ */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>?∞Ïù¥???úÍ≥µ: CryptoCompare, Binance, Coinbase</p>
          {lastUpdate && <p className="mt-2">ÎßàÏ?Îß??ÖÎç∞?¥Ìä∏: {lastUpdate}</p>}
        </div>
      </div>
    </div>
  )
}
