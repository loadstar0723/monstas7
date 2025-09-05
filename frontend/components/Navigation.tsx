'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: '대시보드', icon: '🏠' },
    { href: '/trading', label: '트레이딩', icon: '📈' },
    { href: '/portfolio', label: '포트폴리오', icon: '💼' },
    { href: '/analytics', label: 'AI 분석', icon: '🤖' },
  ]

  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="text-xl font-bold gradient-text">MONSTA</span>
          </Link>

          {/* 네비게이션 메뉴 */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      px-4 py-2 rounded-lg flex items-center gap-2 transition-all
                      ${isActive 
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                        : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-purple-600/10 rounded-lg"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30
                        }}
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* 실시간 상태 표시 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-600/20 to-green-600/10 border border-green-500/30">
              <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="text-sm font-medium text-green-400">실시간</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}