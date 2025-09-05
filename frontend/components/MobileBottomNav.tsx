'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaHome, 
  FaChartLine, 
  FaRobot, 
  FaWallet, 
  FaBars,
  FaTimes,
  FaUserCircle,
  FaCog,
  FaQuestionCircle
} from 'react-icons/fa'

interface NavItem {
  icon: React.ReactNode
  label: string
  path: string
  color: string
}

export default function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const mainNavItems: NavItem[] = [
    { icon: <FaHome className="w-5 h-5" />, label: '홈', path: '/', color: 'purple' },
    { icon: <FaChartLine className="w-5 h-5" />, label: '차트', path: '/market/charts', color: 'blue' },
    { icon: <FaRobot className="w-5 h-5" />, label: 'AI', path: '/ai/predictions', color: 'green' },
    { icon: <FaWallet className="w-5 h-5" />, label: '지갑', path: '/wallet/portfolio', color: 'yellow' },
  ]

  const moreMenuItems: NavItem[] = [
    { icon: <FaUserCircle className="w-6 h-6" />, label: '프로필', path: '/profile', color: 'indigo' },
    { icon: <FaCog className="w-6 h-6" />, label: '설정', path: '/settings', color: 'gray' },
    { icon: <FaQuestionCircle className="w-6 h-6" />, label: '도움말', path: '/help', color: 'pink' },
  ]

  // 스크롤 시 하단 네비 숨기기/보이기
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // 아래로 스크롤 시 숨기기
        setIsVisible(false)
      } else {
        // 위로 스크롤 시 보이기
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleNavClick = (path: string) => {
    router.push(path)
    setShowMoreMenu(false)
  }

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors: Record<string, { active: string; inactive: string }> = {
      purple: { 
        active: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30', 
        inactive: 'text-gray-500 dark:text-gray-400' 
      },
      blue: { 
        active: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30', 
        inactive: 'text-gray-500 dark:text-gray-400' 
      },
      green: { 
        active: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30', 
        inactive: 'text-gray-500 dark:text-gray-400' 
      },
      yellow: { 
        active: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30', 
        inactive: 'text-gray-500 dark:text-gray-400' 
      },
      indigo: { 
        active: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30', 
        inactive: 'text-gray-500 dark:text-gray-400' 
      },
      gray: { 
        active: 'text-gray-700 bg-gray-200 dark:text-gray-300 dark:bg-gray-700', 
        inactive: 'text-gray-500 dark:text-gray-400' 
      },
      pink: { 
        active: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30', 
        inactive: 'text-gray-500 dark:text-gray-400' 
      },
    }
    
    return isActive ? colors[color].active : colors[color].inactive
  }

  // 모바일에서만 표시
  if (typeof window !== 'undefined' && window.innerWidth > 768) {
    return null
  }

  return (
    <>
      {/* 더보기 메뉴 오버레이 */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowMoreMenu(false)}
          />
        )}
      </AnimatePresence>

      {/* 더보기 메뉴 */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl z-50 p-4 md:hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">더보기</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {moreMenuItems.map((item) => {
                const isActive = pathname === item.path
                return (
                  <motion.button
                    key={item.path}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNavClick(item.path)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                      isActive 
                        ? getColorClasses(item.color, true)
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item.icon}
                    <span className="text-xs font-medium">{item.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 네비게이션 바 */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 md:hidden"
      >
        {/* Safe area padding for iOS */}
        <div className="pb-safe">
          <div className="grid grid-cols-5 h-16">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <motion.button
                  key={item.path}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNavClick(item.path)}
                  className="flex flex-col items-center justify-center gap-1 relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600"
                    />
                  )}
                  
                  <div className={`p-1 rounded-lg transition-all ${
                    isActive ? getColorClasses(item.color, true) : ''
                  }`}>
                    {item.icon}
                  </div>
                  
                  <span className={`text-xs font-medium transition-colors ${
                    getColorClasses(item.color, isActive)
                  }`}>
                    {item.label}
                  </span>
                </motion.button>
              )
            })}
            
            {/* 더보기 버튼 */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="flex flex-col items-center justify-center gap-1"
            >
              <div className={`p-1 rounded-lg transition-all ${
                showMoreMenu 
                  ? 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' 
                  : ''
              }`}>
                <FaBars className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium transition-colors ${
                showMoreMenu 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                더보기
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 하단 네비 공간 확보 */}
      <div className="h-16 md:hidden" />
    </>
  )
}