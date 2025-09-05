'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FaHome, FaChartLine, FaRobot, FaBriefcase, FaHistory,
  FaTelegram, FaUsers, FaGraduationCap, FaNewspaper,
  FaUser, FaCog, FaBars, FaTimes, FaGlobe, FaChartPie,
  FaBrain, FaRocket, FaShieldAlt, FaWallet, FaGamepad,
  FaBook, FaUserTie, FaHandshake, FaStore, FaChartBar,
  FaCoins, FaExchangeAlt, FaMicrochip, FaLock, FaCrown,
  FaDna, FaAtom, FaFlask, FaLightbulb, FaNetworkWired,
  FaDatabase, FaServer, FaCloud, FaFingerprint, FaMagic,
  FaGem, FaDollarSign, FaBitcoin, FaEthereum, FaChartArea,
  FaBalanceScale, FaTrophy, FaMedal, FaAward, FaStar, FaKey
} from 'react-icons/fa'
import { 
  BiBot, BiAnalyse, BiTrendingUp, BiCoinStack, BiData,
  BiNetworkChart, BiPulse, BiRadar, BiTargetLock, BiGrid
} from 'react-icons/bi'
import { 
  MdAutoGraph, MdAutorenew, MdSwapHoriz, MdTimeline,
  MdShowChart, MdCandlestickChart, MdStackedLineChart,
  MdMultilineChart, MdSignalCellularAlt, MdSpeed
} from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'

// 사용자 역할 정의
type UserRole = '본사' | '총판' | '대리점' | '구독자' | '게스트'

// 구독 등급 정의
type SubscriptionTier = 'Free' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Black'

// 메뉴 카테고리 정의
type MenuCategory = 'trading' | 'ai' | 'automation' | 'market' | 'community' | 'business' | 'system'

// 메뉴 아이템 타입
interface MenuItem {
  icon: any
  label: string
  path: string
  badge?: string
  category: MenuCategory
  minRole?: UserRole[]
  minTier?: SubscriptionTier
  isNew?: boolean
  isPremium?: boolean
  isHot?: boolean
  description?: string
}

// 카테고리별 색상 테마
const categoryThemes = {
  trading: { color: 'from-blue-600 to-cyan-600', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
  ai: { color: 'from-purple-600 to-pink-600', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' },
  automation: { color: 'from-green-600 to-emerald-600', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30' },
  market: { color: 'from-yellow-600 to-orange-600', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' },
  community: { color: 'from-indigo-600 to-blue-600', bgColor: 'bg-indigo-500/20', borderColor: 'border-indigo-500/30' },
  business: { color: 'from-red-600 to-pink-600', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30' },
  system: { color: 'from-gray-600 to-slate-600', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30' }
}

// 종합 메뉴 구조
const menuStructure: { [key in MenuCategory]: { title: string, items: MenuItem[] } } = {
  trading: {
    title: '🎯 트레이딩',
    items: [
      { icon: FaHome, label: '대시보드', path: '/', category: 'trading' },
      { icon: FaChartLine, label: '실시간 트레이딩', path: '/trading', badge: 'LIVE', category: 'trading', isHot: true },
      { icon: MdCandlestickChart, label: '스캘핑 트레이딩', path: '/scalping', category: 'trading', minTier: 'Gold', isPremium: true },
      { icon: FaExchangeAlt, label: '스윙 트레이딩', path: '/swing', category: 'trading', minTier: 'Silver' },
      { icon: MdShowChart, label: '선물 거래', path: '/futures', category: 'trading', minTier: 'Platinum', badge: 'PRO' },
      { icon: BiCoinStack, label: '현물 거래', path: '/spot', category: 'trading' },
      { icon: FaBalanceScale, label: '차익거래', path: '/arbitrage', category: 'trading', minTier: 'Diamond', badge: '고급' },
      { icon: MdSwapHoriz, label: 'P2P 거래', path: '/p2p', category: 'trading', minRole: ['본사', '총판'] },
    ]
  },
  ai: {
    title: '🤖 AI 분석',
    items: [
      { icon: FaRobot, label: 'AI 매매 신호', path: '/analytics', badge: 'AI', category: 'ai', isHot: true },
      { icon: FaBrain, label: 'AI 예측 모델', path: '/ai-prediction', category: 'ai', minTier: 'Gold', isPremium: true },
      { icon: BiAnalyse, label: '패턴 분석', path: '/pattern-analysis', category: 'ai' },
      { icon: BiRadar, label: '시장 스캐너', path: '/market-scanner', category: 'ai', minTier: 'Silver' },
      { icon: FaDna, label: '유전자 알고리즘', path: '/genetic-algo', category: 'ai', minTier: 'Diamond', badge: '최첨단' },
      { icon: FaAtom, label: '퀀텀 AI', path: '/quantum-ai', category: 'ai', minTier: 'Black', badge: '독점' },
      { icon: MdAutoGraph, label: '딥러닝 차트', path: '/deeplearning', category: 'ai', minTier: 'Platinum' },
      { icon: BiPulse, label: '센티멘트 분석', path: '/sentiment', category: 'ai' },
    ]
  },
  automation: {
    title: '⚡ 자동화',
    items: [
      { icon: FaTelegram, label: '자동매매 봇', path: '/autobot', badge: 'HOT', category: 'automation', isHot: true },
      { icon: BiBot, label: '그리드 봇', path: '/gridbot', category: 'automation', minTier: 'Silver' },
      { icon: MdAutorenew, label: 'DCA 봇', path: '/dcabot', category: 'automation' },
      { icon: FaRocket, label: '스나이퍼 봇', path: '/sniper', category: 'automation', minTier: 'Platinum', badge: '극속' },
      { icon: FaMicrochip, label: 'MEV 봇', path: '/mev', category: 'automation', minTier: 'Diamond', minRole: ['본사'] },
      { icon: FaHistory, label: '백테스팅', path: '/backtesting', category: 'automation' },
      { icon: BiTargetLock, label: '전략 빌더', path: '/strategy-builder', category: 'automation', minTier: 'Gold' },
      { icon: FaFlask, label: '전략 테스터', path: '/strategy-tester', category: 'automation' },
    ]
  },
  market: {
    title: '📊 마켓 정보',
    items: [
      { icon: FaBriefcase, label: '포트폴리오', path: '/portfolio', category: 'market' },
      { icon: FaWallet, label: '자산 관리', path: '/assets', category: 'market' },
      { icon: FaGraduationCap, label: '마켓 리서치', path: '/research', category: 'market' },
      { icon: FaNewspaper, label: '뉴스 & 시그널', path: '/news', category: 'market' },
      { icon: MdTimeline, label: '경제 캘린더', path: '/calendar', category: 'market' },
      { icon: FaChartArea, label: '히트맵', path: '/heatmap', category: 'market' },
      { icon: BiData, label: '온체인 분석', path: '/onchain', category: 'market', minTier: 'Gold', badge: 'PRO' },
      { icon: FaCoins, label: 'ICO/IDO 정보', path: '/ico', category: 'market', minRole: ['본사', '총판'] },
    ]
  },
  community: {
    title: '👥 커뮤니티',
    items: [
      { icon: FaUsers, label: '소셜 트레이딩', path: '/social', badge: 'NEW', category: 'community', isNew: true },
      { icon: FaTrophy, label: '트레이딩 대회', path: '/competition', category: 'community' },
      { icon: FaMedal, label: '리더보드', path: '/leaderboard', category: 'community' },
      { icon: FaBook, label: '교육 센터', path: '/education', category: 'community' },
      { icon: FaHandshake, label: '시그널 마켓', path: '/signal-market', category: 'community', minTier: 'Silver' },
      { icon: BiNetworkChart, label: 'Copy Trading', path: '/copy-trading', category: 'community', minTier: 'Gold', badge: '인기' },
      { icon: FaAward, label: 'VIP 라운지', path: '/vip', category: 'community', minTier: 'Diamond', badge: 'VIP' },
      { icon: FaStar, label: '명예의 전당', path: '/hall-of-fame', category: 'community' },
    ]
  },
  business: {
    title: '💼 비즈니스',
    items: [
      { icon: FaStore, label: '총판 관리', path: '/distributor', category: 'business', minRole: ['본사', '총판'] },
      { icon: FaUserTie, label: '대리점 관리', path: '/agency', category: 'business', minRole: ['본사', '총판', '대리점'] },
      { icon: FaChartBar, label: '수익 분석', path: '/revenue', category: 'business', minRole: ['본사', '총판', '대리점'] },
      { icon: FaDollarSign, label: '정산 관리', path: '/settlement', category: 'business', minRole: ['본사'] },
      { icon: FaGem, label: '구독 관리', path: '/subscription', category: 'business' },
      { icon: FaCrown, label: '프리미엄 혜택', path: '/premium', category: 'business', minTier: 'Gold' },
      { icon: FaBitcoin, label: '코인 결제', path: '/crypto-payment', category: 'business' },
      { icon: FaEthereum, label: 'DeFi 연동', path: '/defi', category: 'business', minTier: 'Platinum', badge: 'DeFi' },
    ]
  },
  system: {
    title: '⚙️ 시스템',
    items: [
      { icon: FaUser, label: '프로필', path: '/profile', category: 'system' },
      { icon: FaCog, label: '설정', path: '/settings', category: 'system' },
      { icon: FaShieldAlt, label: '보안 설정', path: '/security', category: 'system' },
      { icon: FaKey, label: 'API 관리', path: '/api-keys', category: 'system' },
      { icon: FaDatabase, label: '데이터 백업', path: '/backup', category: 'system', minTier: 'Silver' },
      { icon: FaServer, label: '서버 상태', path: '/status', category: 'system' },
      { icon: FaCloud, label: '클라우드 동기화', path: '/sync', category: 'system', minTier: 'Gold' },
      { icon: FaGlobe, label: '언어 설정', path: '/language', category: 'system' },
    ]
  }
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<MenuCategory[]>(['trading'])
  const pathname = usePathname()
  
  // 임시 사용자 정보 (나중에 실제 인증 시스템과 연동)
  const [currentUser] = useState({
    role: '본사' as UserRole,
    tier: 'Black' as SubscriptionTier,
    name: '관리자'
  })

  const toggleSidebar = () => setIsOpen(!isOpen)
  
  const toggleCategory = (category: MenuCategory) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }
  
  // 역할 기반 접근 권한 확인
  const hasRoleAccess = (minRole?: UserRole[]) => {
    if (!minRole) return true
    return minRole.includes(currentUser.role)
  }
  
  // 구독 등급 기반 접근 권한 확인
  const hasTierAccess = (minTier?: SubscriptionTier) => {
    if (!minTier) return true
    const tiers: SubscriptionTier[] = ['Free', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Black']
    const currentTierIndex = tiers.indexOf(currentUser.tier)
    const requiredTierIndex = tiers.indexOf(minTier)
    return currentTierIndex >= requiredTierIndex
  }
  
  // 메뉴 아이템 필터링
  const filterMenuItems = (items: MenuItem[]) => {
    return items.filter(item => 
      hasRoleAccess(item.minRole) && hasTierAccess(item.minTier)
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg text-white"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`
          fixed left-0 top-0 h-screen z-40
          bg-gradient-to-b from-gray-900 via-gray-900 to-black
          border-r border-gray-800
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-20'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <AnimatePresence>
              {(isOpen || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col"
                >
                  <span className="text-white font-bold text-xl">MONSTA</span>
                  <span className="text-gray-400 text-xs">Quantum AI Trading</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block absolute -right-3 top-9 w-6 h-6 bg-gray-800 rounded-full border border-gray-700 text-white text-xs hover:bg-gray-700 transition-colors"
        >
          {isOpen ? '◀' : '▶'}
        </button>

        {/* Main Menu */}
        <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="space-y-3">
            {Object.entries(menuStructure).map(([category, section]) => {
              const theme = categoryThemes[category as MenuCategory]
              const isExpanded = expandedCategories.includes(category as MenuCategory)
              const filteredItems = filterMenuItems(section.items)
              
              if (filteredItems.length === 0) return null
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-1"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category as MenuCategory)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all
                      ${theme.bgColor} ${theme.borderColor} border
                      hover:brightness-110 group
                    `}
                  >
                    <AnimatePresence>
                      {(isOpen || isHovered) && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm font-bold text-white"
                        >
                          {section.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-gray-400 group-hover:text-white"
                    >
                      ▼
                    </motion.span>
                  </button>
                  
                  {/* Category Items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-1 pl-2"
                      >
                        {filteredItems.map((item, index) => {
                          const Icon = item.icon
                          const isActive = pathname === item.path
                          const isLocked = !hasTierAccess(item.minTier)
                          
                          return (
                            <motion.li
                              key={item.path}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.02 }}
                            >
                              <Link
                                href={isLocked ? '#' : item.path}
                                className={`
                                  flex items-center gap-3 px-3 py-2 rounded-lg
                                  transition-all duration-200 relative group
                                  ${isActive 
                                    ? `bg-gradient-to-r ${theme.color} text-white shadow-lg` 
                                    : isLocked
                                    ? 'text-gray-600 hover:text-gray-500 bg-gray-900/50 cursor-not-allowed'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                  }
                                `}
                                onClick={isLocked ? (e) => e.preventDefault() : undefined}
                              >
                                <div className="relative">
                                  <Icon size={18} className="flex-shrink-0" />
                                  {isLocked && (
                                    <FaLock size={10} className="absolute -bottom-1 -right-1 text-yellow-500" />
                                  )}
                                </div>
                                <AnimatePresence>
                                  {(isOpen || isHovered) && (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      className="flex-1 flex items-center justify-between"
                                    >
                                      <span className={`font-medium text-sm ${
                                        isLocked ? 'opacity-50' : ''
                                      }`}>
                                        {item.label}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {item.minTier && !hasTierAccess(item.minTier) && (
                                          <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full font-bold">
                                            {item.minTier}
                                          </span>
                                        )}
                                        {item.badge && (
                                          <span className={`
                                            px-1.5 py-0.5 text-xs rounded-full font-bold
                                            ${item.badge === 'LIVE' ? 'bg-red-500 text-white animate-pulse' :
                                              item.badge === 'HOT' || item.isHot ? 'bg-orange-500 text-white' :
                                              item.badge === 'NEW' || item.isNew ? 'bg-green-500 text-white' :
                                              item.badge === 'PRO' ? 'bg-purple-500 text-white' :
                                              item.badge === 'VIP' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' :
                                              item.badge === 'DeFi' ? 'bg-blue-500 text-white' :
                                              item.badge === '독점' ? 'bg-black text-yellow-400 border border-yellow-400' :
                                              item.badge === '최첨단' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                                              item.badge === '극속' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' :
                                              item.badge === '고급' ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white' :
                                              item.badge === '인기' ? 'bg-pink-500 text-white' :
                                              'bg-gray-700 text-gray-300'}
                                          `}>
                                            {item.badge}
                                          </span>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </Link>
                            </motion.li>
                          )
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </nav>

        {/* User Info & Subscription */}
        <div className="p-4 border-t border-gray-800">
          <AnimatePresence>
            {(isOpen || isHovered) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {/* User Status */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                      currentUser.tier === 'Black' ? 'from-black to-gray-800 border-2 border-yellow-400' :
                      currentUser.tier === 'Diamond' ? 'from-cyan-400 to-blue-500' :
                      currentUser.tier === 'Platinum' ? 'from-gray-300 to-gray-500' :
                      currentUser.tier === 'Gold' ? 'from-yellow-400 to-yellow-600' :
                      currentUser.tier === 'Silver' ? 'from-gray-400 to-gray-600' :
                      'from-green-400 to-blue-500'
                    }`}>
                      <FaCrown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium">{currentUser.name}</p>
                      <span className="px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded font-bold">
                        {currentUser.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-bold ${
                        currentUser.tier === 'Black' ? 'text-yellow-400' :
                        currentUser.tier === 'Diamond' ? 'text-cyan-400' :
                        currentUser.tier === 'Platinum' ? 'text-gray-300' :
                        currentUser.tier === 'Gold' ? 'text-yellow-500' :
                        currentUser.tier === 'Silver' ? 'text-gray-400' :
                        'text-green-400'
                      }`}>
                        {currentUser.tier} {currentUser.tier === 'Black' ? '∞' : 'Plan'}
                      </p>
                      {currentUser.tier === 'Black' && (
                        <span className="text-xs text-yellow-400">무제한</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Role & Tier Info */}
                <div className="text-xs space-y-1 p-2 bg-gray-800/50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-500">접근 권한:</span>
                    <span className="text-gray-400">{currentUser.role} 레벨</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">구독 등급:</span>
                    <span className="text-gray-400">{currentUser.tier}</span>
                  </div>
                </div>
                
                {/* Upgrade Button (Black 등급이 아닌 경우만) */}
                {currentUser.tier !== 'Black' && (
                  <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg">
                    ⚡ 업그레이드
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isOpen && !isHovered && (
            <div className="relative">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br mx-auto ${
                currentUser.tier === 'Black' ? 'from-black to-gray-800 border-2 border-yellow-400' :
                currentUser.tier === 'Diamond' ? 'from-cyan-400 to-blue-500' :
                currentUser.tier === 'Platinum' ? 'from-gray-300 to-gray-500' :
                currentUser.tier === 'Gold' ? 'from-yellow-400 to-yellow-600' :
                currentUser.tier === 'Silver' ? 'from-gray-400 to-gray-600' :
                'from-green-400 to-blue-500'
              }`}>
                <FaCrown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs" />
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="lg:hidden fixed inset-0 bg-black z-30"
          />
        )}
      </AnimatePresence>
    </>
  )
}