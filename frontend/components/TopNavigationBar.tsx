'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaChartLine, FaSignal, FaBrain, FaWallet, FaBook,
  FaSearch, FaBell, FaUser, FaChevronDown, FaCrown
} from 'react-icons/fa'
import { MdAutoGraph } from 'react-icons/md'
import { config } from '@/lib/config'

interface MegaMenuItem {
  title: string
  href: string
  description: string
  icon: React.ElementType
  tier?: string
}

interface MenuSection {
  title: string
  items: MegaMenuItem[]
}

export default function TopNavigationBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  const megaMenus: Record<string, MenuSection[]> = {
    시그널: [
      {
        title: 'AI 시그널',
        items: [
          { title: '대시보드', href: '/signals/dashboard', description: '실시간 AI 시그널 모니터링', icon: MdAutoGraph },
          { title: '실시간 시그널', href: '/signals/realtime', description: '최신 거래 시그널', icon: FaSignal, tier: 'SILVER' },
          { title: '프리미엄 시그널', href: '/signals/premium', description: 'VIP 전용 고급 시그널', icon: FaCrown, tier: 'GOLD' },
        ]
      },
      {
        title: '분석',
        items: [
          { title: '시그널 히스토리', href: '/signals/history', description: '과거 시그널 성과 분석', icon: FaBook },
          { title: '성과 리포트', href: '/signals/report', description: '수익률 분석 리포트', icon: FaChartLine },
        ]
      }
    ],
    트레이딩: [
      {
        title: '차트 & 분석',
        items: [
          { title: '실시간 차트', href: '/trading/chart', description: 'TradingView 프로 차트', icon: FaChartLine },
          { title: '기술적 분석', href: '/trading/technical', description: '고급 차트 패턴 분석', icon: MdAutoGraph },
        ]
      },
      {
        title: '자동화',
        items: [
          { title: '자동매매 봇', href: '/trading/bot', description: 'AI 기반 자동 트레이딩', icon: FaBrain, tier: 'PLATINUM' },
          { title: '백테스팅', href: '/trading/backtest', description: '전략 과거 데이터 검증', icon: FaBook, tier: 'GOLD' },
        ]
      }
    ],
    포트폴리오: [
      {
        title: '관리',
        items: [
          { title: '내 포트폴리오', href: '/portfolio/my', description: '자산 현황 및 관리', icon: FaWallet },
          { title: 'AI 포트폴리오', href: '/portfolio/ai', description: 'AI 추천 포트폴리오', icon: FaBrain, tier: 'GOLD' },
        ]
      }
    ]
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MONSTA
            </span>
          </Link>

          {/* Main Menu */}
          <nav className="hidden md:flex items-center gap-1">
            {Object.keys(megaMenus).map(menu => (
              <div key={menu} className="relative">
                <button
                  onMouseEnter={() => setActiveMenu(menu)}
                  onMouseLeave={() => setActiveMenu(null)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    activeMenu === menu
                      ? 'bg-gray-800 text-purple-400'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  {menu}
                  <FaChevronDown className="text-xs" />
                </button>

                {/* Mega Menu Dropdown */}
                <AnimatePresence>
                  {activeMenu === menu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onMouseEnter={() => setActiveMenu(menu)}
                      onMouseLeave={() => setActiveMenu(null)}
                      className="absolute top-full left-0 mt-2 w-[600px] bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6"
                    >
                      <div className="grid grid-cols-2 gap-6">
                        {megaMenus[menu].map(section => (
                          <div key={section.title}>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                              {section.title}
                            </h3>
                            <div className="space-y-2">
                              {section.items.map(item => {
                                const Icon = item.icon
                                return (
                                  <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block p-3 rounded-lg hover:bg-gray-800 transition-all group"
                                  >
                                    <div className="flex items-start gap-3">
                                      <Icon className="text-purple-400 mt-1" />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-300 group-hover:text-purple-400">
                                            {item.title}
                                          </span>
                                          {item.tier && (
                                            <span className="text-xs px-1.5 py-config.decimals.value5 bg-purple-900/50 text-purple-400 rounded">
                                              {item.tier}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {item.description}
                                        </p>
                                      </div>
                                    </div>
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-all"
              >
                <FaSearch />
              </button>
              
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="absolute right-0 top-0 overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="검색..."
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                      autoFocus
                      onBlur={() => setSearchOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-all">
              <FaBell />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Profile */}
            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-all">
              <FaUser />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}