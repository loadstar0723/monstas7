'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FaHome, FaChartLine, FaRobot, FaBriefcase, FaHistory,
  FaTelegram, FaUsers, FaGraduationCap, FaNewspaper,
  FaUser, FaCog, FaBars, FaTimes, FaGlobe
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { icon: FaHome, label: '홈', path: '/', badge: null },
  { icon: FaChartLine, label: '실시간 트레이딩', path: '/trading', badge: 'LIVE' },
  { icon: FaRobot, label: 'AI 분석', path: '/ai-analysis', badge: '11 Models' },
  { icon: FaBriefcase, label: '포트폴리오', path: '/portfolio', badge: null },
  { icon: FaHistory, label: '백테스팅', path: '/backtesting', badge: null },
  { icon: FaTelegram, label: '텔레그램 봇', path: '/telegram', badge: 'HOT' },
  { icon: FaUsers, label: '소셜 트레이딩', path: '/social', badge: 'NEW' },
  { icon: FaGraduationCap, label: '교육센터', path: '/education', badge: null },
  { icon: FaNewspaper, label: '뉴스 & 분석', path: '/news', badge: null },
]

const bottomMenuItems = [
  { icon: FaUser, label: '프로필', path: '/profile' },
  { icon: FaCog, label: '설정', path: '/settings' },
  { icon: FaGlobe, label: '언어', path: '#language' },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => setIsOpen(!isOpen)

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
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              
              return (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <AnimatePresence>
                      {(isOpen || isHovered) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex-1 flex items-center justify-between"
                        >
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <span className={`
                              px-2 py-0.5 text-xs rounded-full font-bold
                              ${item.badge === 'LIVE' ? 'bg-red-500 text-white animate-pulse' :
                                item.badge === 'HOT' ? 'bg-orange-500 text-white' :
                                item.badge === 'NEW' ? 'bg-green-500 text-white' :
                                'bg-gray-700 text-gray-300'}
                            `}>
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.li>
              )
            })}
          </ul>

          {/* Divider */}
          <div className="my-6 border-t border-gray-800"></div>

          {/* Bottom Menu */}
          <ul className="space-y-2">
            {bottomMenuItems.map((item, index) => {
              const Icon = item.icon
              
              return (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (menuItems.length + index) * 0.05 }}
                >
                  <Link
                    href={item.path}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                  >
                    <Icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <AnimatePresence>
                      {(isOpen || isHovered) && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="font-medium"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.li>
              )
            })}
          </ul>
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
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">사용자</p>
                    <p className="text-gray-400 text-xs">Free Plan</p>
                  </div>
                </div>
                
                {/* Upgrade Button */}
                <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg">
                  ⚡ 프로 업그레이드
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isOpen && !isHovered && (
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto"></div>
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