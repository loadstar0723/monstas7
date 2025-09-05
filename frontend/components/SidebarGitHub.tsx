'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaHome, FaChartLine, FaRobot, FaBriefcase, FaHistory,
  FaTelegram, FaUsers, FaGraduationCap, FaNewspaper,
  FaUser, FaCog, FaBars, FaTimes, FaSearch, FaStar,
  FaClock, FaChevronDown, FaCrown, FaGem, FaShieldAlt,
  FaSignal, FaWallet, FaChartBar, FaBook, FaBrain,
  FaRocket, FaBitcoin, FaTrophy, FaGlobe, FaLock,
  FaChartPie, FaExchangeAlt, FaBell, FaPlus
} from 'react-icons/fa'
import { BiBot, BiNetworkChart, BiRadar, BiPulse } from 'react-icons/bi'
import { MdAnalytics, MdAutoGraph, MdCandlestickChart } from 'react-icons/md'

interface MenuItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  badgeColor?: string
  tier?: string
}

interface MenuCategory {
  title: string
  icon: React.ElementType
  items: MenuItem[]
}

const menuData: MenuCategory[] = [
  {
    title: '시그널',
    icon: FaSignal,
    items: [
      { label: 'AI 시그널 대시보드', href: '/signals/dashboard', icon: BiRadar, tier: 'FREE' },
      { label: '실시간 시그널', href: '/signals/realtime', icon: BiPulse, tier: 'SILVER' },
      { label: '프리미엄 시그널', href: '/signals/premium', icon: FaCrown, tier: 'GOLD' },
      { label: '시그널 히스토리', href: '/signals/history', icon: FaHistory, tier: 'FREE' }
    ]
  },
  {
    title: '트레이딩',
    icon: FaChartLine,
    items: [
      { label: '실시간 차트', href: '/trading/chart', icon: MdCandlestickChart, tier: 'FREE' },
      { label: '자동매매 봇', href: '/trading/bot', icon: FaRobot, tier: 'PLATINUM' },
      { label: '백테스팅', href: '/trading/backtest', icon: FaHistory, tier: 'GOLD' },
      { label: '거래 시뮬레이터', href: '/trading/simulator', icon: BiBot, tier: 'SILVER' }
    ]
  },
  {
    title: '포트폴리오',
    icon: FaBriefcase,
    items: [
      { label: '내 포트폴리오', href: '/portfolio/my', icon: FaWallet, tier: 'FREE' },
      { label: 'AI 포트폴리오', href: '/portfolio/ai', icon: FaBrain, tier: 'GOLD' },
      { label: '리밸런싱', href: '/portfolio/rebalance', icon: FaExchangeAlt, tier: 'PLATINUM' },
      { label: '수익률 분석', href: '/portfolio/analysis', icon: FaChartPie, tier: 'SILVER' }
    ]
  },
  {
    title: '분석',
    icon: MdAnalytics,
    items: [
      { label: 'AI 시장 분석', href: '/analysis/market', icon: MdAutoGraph, tier: 'FREE' },
      { label: '온체인 분석', href: '/analysis/onchain', icon: BiNetworkChart, tier: 'GOLD' },
      { label: '감정 분석', href: '/analysis/sentiment', icon: FaGlobe, tier: 'SILVER' },
      { label: '기술적 분석', href: '/analysis/technical', icon: FaChartBar, tier: 'FREE' }
    ]
  },
  {
    title: '교육',
    icon: FaGraduationCap,
    items: [
      { label: '트레이딩 가이드', href: '/education/guide', icon: FaBook, tier: 'FREE' },
      { label: '전략 강의', href: '/education/strategy', icon: FaBrain, tier: 'SILVER' },
      { label: '리스크 관리', href: '/education/risk', icon: FaShieldAlt, tier: 'FREE' },
      { label: '마스터 클래스', href: '/education/masterclass', icon: FaTrophy, tier: 'DIAMOND' }
    ]
  }
]

// 구독 티어 정보
const tierInfo = {
  FREE: { label: 'Free', color: 'text-gray-400', bgColor: 'bg-gray-700' },
  SILVER: { label: 'Silver', color: 'text-gray-300', bgColor: 'bg-gray-600' },
  GOLD: { label: 'Gold', color: 'text-yellow-400', bgColor: 'bg-yellow-900' },
  PLATINUM: { label: 'Platinum', color: 'text-purple-400', bgColor: 'bg-purple-900' },
  DIAMOND: { label: 'Diamond', color: 'text-cyan-400', bgColor: 'bg-cyan-900' },
  BLACK: { label: 'Black', color: 'text-white', bgColor: 'bg-black' }
}

export default function SidebarGitHub() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [userTier] = useState('PLATINUM') // 현재 사용자 티어
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [recentVisits, setRecentVisits] = useState<string[]>([])

  // 최근 방문 추적
  useEffect(() => {
    if (pathname && pathname !== '/') {
      setRecentVisits(prev => {
        const updated = [pathname, ...prev.filter(p => p !== pathname)].slice(0, 5)
        localStorage.setItem('recentVisits', JSON.stringify(updated))
        return updated
      })
    }
  }, [pathname])

  // 즐겨찾기 로드
  useEffect(() => {
    const saved = localStorage.getItem('favorites')
    if (saved) setFavorites(new Set(JSON.parse(saved)))
    
    const recent = localStorage.getItem('recentVisits')
    if (recent) setRecentVisits(JSON.parse(recent))
  }, [])

  const toggleFavorite = (href: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(href)) {
      newFavorites.delete(href)
    } else {
      newFavorites.add(href)
    }
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(Array.from(newFavorites)))
  }

  // 검색 필터링
  const filteredMenu = menuData.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  return (
    <>
      {/* GitHub 스타일 햄버거 메뉴 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 transition-all"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <FaTimes className="w-5 h-5 text-gray-300" />
            ) : (
              <FaBars className="w-5 h-5 text-gray-300" />
            )}
          </motion.div>
        </AnimatePresence>
      </button>

      {/* 오버레이 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 사이드바 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-80 bg-gray-950 border-r border-gray-800 z-40 overflow-hidden flex flex-col"
          >
            {/* 헤더 */}
            <div className="p-4 border-b border-gray-800">
              <Link href="/" className="flex items-center gap-3 mb-4" onClick={() => setIsOpen(false)}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <FaRocket className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    MONSTA
                  </h1>
                  <p className="text-xs text-gray-500">AI Trading Platform</p>
                </div>
              </Link>

              {/* 검색 */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="text"
                  placeholder="메뉴 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* 사용자 정보 */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">본사 관리자</p>
                    <p className={`text-xs ${tierInfo[userTier].color}`}>
                      {tierInfo[userTier].label} Member
                    </p>
                  </div>
                </div>
                <FaBell className="text-gray-400 hover:text-gray-300 cursor-pointer" />
              </div>
            </div>

            {/* 즐겨찾기 */}
            {favorites.size > 0 && (
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">즐겨찾기</h3>
                <div className="space-y-1">
                  {Array.from(favorites).map(href => {
                    const item = menuData
                      .flatMap(c => c.items)
                      .find(i => i.href === href)
                    if (!item) return null
                    const Icon = item.icon
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all ${
                          pathname === href
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                        }`}
                      >
                        <Icon className="text-xs" />
                        <span className="truncate">{item.label}</span>
                        <FaStar 
                          className="ml-auto text-yellow-500 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault()
                            toggleFavorite(href)
                          }}
                        />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 메뉴 카테고리 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMenu.map((category) => {
                const isActive = activeCategory === category.title
                const CategoryIcon = category.icon
                
                return (
                  <div key={category.title}>
                    <button
                      onClick={() => setActiveCategory(isActive ? null : category.title)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-900 transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">{category.title}</span>
                      </div>
                      <FaChevronDown 
                        className={`text-gray-500 text-xs transition-transform ${
                          isActive ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-1 ml-6 space-y-1 overflow-hidden"
                        >
                          {category.items.map((item) => {
                            const Icon = item.icon
                            const isCurrentPage = pathname === item.href
                            const isFavorite = favorites.has(item.href)
                            
                            return (
                              <div key={item.href} className="flex items-center gap-2">
                                <Link
                                  href={item.href}
                                  onClick={() => setIsOpen(false)}
                                  className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                                    isCurrentPage
                                      ? 'bg-purple-500/20 text-purple-400 border-l-2 border-purple-500'
                                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                                  }`}
                                >
                                  <Icon className="text-xs" />
                                  <span className="flex-1">{item.label}</span>
                                  {item.tier && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${tierInfo[item.tier].bgColor} ${tierInfo[item.tier].color}`}>
                                      {item.tier}
                                    </span>
                                  )}
                                </Link>
                                <button
                                  onClick={() => toggleFavorite(item.href)}
                                  className="p-1 hover:bg-gray-800 rounded"
                                >
                                  <FaStar 
                                    className={`text-xs ${
                                      isFavorite ? 'text-yellow-500' : 'text-gray-600'
                                    }`}
                                  />
                                </button>
                              </div>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* 하단 액션 버튼 */}
            <div className="p-4 border-t border-gray-800">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all">
                <FaPlus className="text-sm" />
                <span>새 시그널</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}