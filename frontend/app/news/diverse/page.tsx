'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { realNewsService, RealNewsItem } from '@/lib/services/realNewsService'

interface NewsDetailModalProps {
  news: RealNewsItem
  onClose: () => void
}

// 뉴스 상세 보기 모달
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
        {/* 이미지 헤더 */}
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
          {/* 헤더 */}
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

          {/* 메타 정보 */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <span className="text-gray-400">
              <span className="text-purple-400">📰</span> {news.source.name}
            </span>
            <span className="text-gray-400">
              <span className="text-blue-400">📅</span> {new Date(news.publishedAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {news.author && (
              <span className="text-gray-400">
                <span className="text-green-400">✍️</span> {news.author}
              </span>
            )}
          </div>

          {/* 관련 코인 태그 */}
          {news.relatedCoins.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm text-gray-500 mb-2">관련 코인</h3>
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

          {/* 카테고리 태그 */}
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

          {/* 내용 */}
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 leading-relaxed text-base whitespace-pre-wrap">
              {news.content || news.description}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-800">
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all text-center font-medium"
            >
              원문 보기 →
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(news.url)
                alert('링크가 복사되었습니다!')
              }}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              링크 복사
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              닫기
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

  // 코인 심볼 맵
  const coinSymbols = realNewsService.getAllCoinSymbols()

  // TOP 50 코인 + 신규/핫 코인
  const coins = [
    'ALL', 'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC',
    'LINK', 'DOT', 'UNI', 'ATOM', 'LTC', 'ETC', 'ICP', 'FIL', 'APT', 'ARB',
    'OP', 'NEAR', 'VET', 'ALGO', 'FTM', 'GRT', 'SAND', 'MANA', 'AXS', 'THETA',
    'WLD', 'SEI', 'SUI', 'TIA', 'BLUR', 'JTO', 'PYTH', 'JUP', 'STRK', 'PORTAL'
  ]

  const categories = [
    { id: 'all', name: '전체', icon: '📰', color: 'purple' },
    { id: 'breaking', name: '속보', icon: '🚨', color: 'red' },
    { id: 'regulatory', name: '규제', icon: '⚖️', color: 'blue' },
    { id: 'defi', name: 'DeFi', icon: '🔷', color: 'green' },
    { id: 'technical', name: '기술', icon: '📊', color: 'indigo' },
    { id: 'market', name: '시장', icon: '📈', color: 'cyan' },
    { id: 'security', name: '보안', icon: '🔐', color: 'orange' },
    { id: 'exchange', name: '거래소', icon: '🏦', color: 'yellow' }
  ]

  useEffect(() => {
    loadAllNews()
    const interval = setInterval(loadAllNews, 60000) // 1분마다 업데이트
    // 클라이언트에서만 시간 업데이트
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
      // 실제 뉴스 API 호출
      const symbols = selectedCoin === 'ALL' ? ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'] : [selectedCoin]
      const news = await realNewsService.fetchRealNews(symbols)

      // 시장 데이터와 결합
      const enrichedNews = await realNewsService.enrichNewsWithMarketData(news)
      setAllNews(enrichedNews)
      setFilteredNews(enrichedNews)
      // 업데이트 시간 설정
      setLastUpdate(new Date().toLocaleString('ko-KR'))
    } catch (error) {
      console.error('뉴스 로딩 에러:', error)
      setError('뉴스를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setAllNews([])
      setFilteredNews([])
    } finally {
      setLoading(false)
    }
  }

  const filterNews = async () => {
    let filtered = [...allNews]

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(news => news.category === selectedCategory)
    }

    // 날짜 필터 (단일 날짜)
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

    // 날짜 범위 필터
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

    // 코인 필터
    if (selectedCoin !== 'ALL') {
      filtered = filtered.filter(news => news.relatedCoins.includes(selectedCoin))
    }

    // 정렬
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    } else if (sortBy === 'relevance' && selectedCoin !== 'ALL') {
      // 관련도 순 정렬 (선택한 코인이 제목에 있으면 우선)
      filtered.sort((a, b) => {
        const aInTitle = a.title.includes(selectedCoin) ? 1 : 0
        const bInTitle = b.title.includes(selectedCoin) ? 1 : 0
        return bInTitle - aInTitle
      })
    }

    setFilteredNews(filtered)
  }

  // 오늘 날짜 가져오기
  const today = new Date().toISOString().split('T')[0]

  // 일주일 전 날짜
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-3">
            🗞️ 실시간 암호화폐 뉴스 포털
          </h1>
          <p className="text-gray-400 text-lg">
            실제 뉴스 데이터 • CryptoCompare, Binance, Coinbase 제공 • {allNews.length}개의 최신 뉴스
          </p>
        </motion.div>

        {/* 코인 선택 버튼들 - 심볼 추가 */}
        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-3">코인별 뉴스 필터</h3>
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
                  {coin === 'ALL' ? '🌍' : coinSymbols[coin] || '●'}
                </span>
                {coin}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 필터 컨트롤 */}
        <div className="mb-6 space-y-4">
          {/* 카테고리 필터 */}
          <div>
            <h3 className="text-sm text-gray-400 mb-3">카테고리</h3>
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

          {/* 날짜 필터 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 특정 날짜 검색 */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">특정 날짜 검색</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setDateRange({ start: '', end: '' }) // 날짜 범위 초기화
                }}
                max={today}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              />
            </div>

            {/* 날짜 범위 검색 */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">시작 날짜</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => {
                  setDateRange({ ...dateRange, start: e.target.value })
                  setSelectedDate('') // 특정 날짜 초기화
                }}
                max={today}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">종료 날짜</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => {
                  setDateRange({ ...dateRange, end: e.target.value })
                  setSelectedDate('') // 특정 날짜 초기화
                }}
                min={dateRange.start}
                max={today}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          {/* 빠른 날짜 선택 버튼 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedDate(today)
                setDateRange({ start: '', end: '' })
              }}
              className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
            >
              오늘
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
              어제
            </button>
            <button
              onClick={() => {
                setDateRange({ start: weekAgoStr, end: today })
                setSelectedDate('')
              }}
              className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
            >
              최근 7일
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
              최근 30일
            </button>
            <button
              onClick={() => {
                setSelectedDate('')
                setDateRange({ start: '', end: '' })
              }}
              className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              날짜 초기화
            </button>
          </div>

          {/* 정렬 및 보기 모드 */}
          <div className="flex flex-wrap gap-4">
            {/* 정렬 */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">정렬</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-4 py-2 rounded-lg ${
                    sortBy === 'date'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  📅 최신순
                </button>
                <button
                  onClick={() => setSortBy('relevance')}
                  className={`px-4 py-2 rounded-lg ${
                    sortBy === 'relevance'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  🎯 관련도순
                </button>
              </div>
            </div>

            {/* 보기 모드 */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">보기 모드</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('analysis')}
                  className={`px-4 py-2 rounded-lg ${
                    viewMode === 'analysis'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  📊 분석
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  📱 그리드
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg ${
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
        </div>

        {/* 현재 필터 상태 표시 */}
        {(selectedDate || dateRange.start || selectedCategory !== 'all' || selectedCoin !== 'ALL') && (
          <div className="mb-4 p-3 bg-purple-600/10 rounded-lg border border-purple-500/30">
            <span className="text-sm text-purple-400">
              필터 적용중:
              {selectedCoin !== 'ALL' && ` ${coinSymbols[selectedCoin]} ${selectedCoin}`}
              {selectedCategory !== 'all' && ` | ${categories.find(c => c.id === selectedCategory)?.name}`}
              {selectedDate && ` | ${new Date(selectedDate).toLocaleDateString('ko-KR')}`}
              {dateRange.start && dateRange.end && ` | ${new Date(dateRange.start).toLocaleDateString('ko-KR')} ~ ${new Date(dateRange.end).toLocaleDateString('ko-KR')}`}
              {` | ${filteredNews.length}개 뉴스`}
            </span>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">실제 뉴스 데이터 로딩 중...</p>
          </div>
        )}

        {/* 에러 메시지 */}
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
              다시 시도
            </button>
          </motion.div>
        )}

        {/* 뉴스 목록 */}
        {!loading && filteredNews.length > 0 && (
          <div className={`
            ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' :
              viewMode === 'list' ? 'space-y-4' :
              'space-y-6'}
          `}>
            {viewMode === 'analysis' ? (
              // 분석 모드 - 중요 뉴스 강조
              <>
                {/* 주요 뉴스 */}
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

                {/* 나머지 뉴스 */}
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
              // 그리드/리스트 모드
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
                    {/* 뉴스 카드 헤더 */}
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

                    {/* 제목 */}
                    <h3 className="text-white font-semibold mb-2 line-clamp-2 hover:text-purple-400 transition-colors">
                      {news.title}
                    </h3>

                    {/* 설명 */}
                    <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                      {news.description}
                    </p>

                    {/* 관련 코인 */}
                    {news.relatedCoins.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {news.relatedCoins.slice(0, 5).map(coin => (
                          <span
                            key={coin}
                            className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs"
                          >
                            {coinSymbols[coin] || '●'} {coin}
                          </span>
                        ))}
                        {news.relatedCoins.length > 5 && (
                          <span className="px-2 py-1 text-gray-500 text-xs">
                            +{news.relatedCoins.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 출처 및 링크 */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        📰 {news.source.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(news.url, '_blank')
                        }}
                        className="text-purple-400 hover:text-purple-300 text-sm"
                      >
                        원문 →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* 뉴스 없음 */}
        {!loading && filteredNews.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-400 text-lg mb-2">선택한 조건에 맞는 뉴스가 없습니다.</p>
            <p className="text-gray-500 text-sm">필터를 변경하거나 날짜 범위를 조정해보세요.</p>
          </motion.div>
        )}

        {/* 뉴스 상세 모달 */}
        <AnimatePresence>
          {selectedNews && (
            <NewsDetailModal
              news={selectedNews}
              onClose={() => setSelectedNews(null)}
            />
          )}
        </AnimatePresence>

        {/* 하단 정보 */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>데이터 제공: CryptoCompare, Binance, Coinbase</p>
          {lastUpdate && <p className="mt-2">마지막 업데이트: {lastUpdate}</p>}
        </div>
      </div>
    </div>
  )
}