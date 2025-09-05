'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  FaPlus, FaTimes, FaChartLine, FaBrain, FaWallet,
  FaSignal, FaRocket, FaBell, FaCog
} from 'react-icons/fa'

interface MenuOption {
  icon: React.ElementType
  label: string
  color: string
  action: () => void
}

export default function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const menuOptions: MenuOption[] = [
    {
      icon: FaSignal,
      label: 'AI 시그널',
      color: 'from-blue-500 to-blue-600',
      action: () => router.push('/signals/dashboard')
    },
    {
      icon: FaChartLine,
      label: '차트',
      color: 'from-green-500 to-green-600',
      action: () => router.push('/trading/chart')
    },
    {
      icon: FaBrain,
      label: '자동매매',
      color: 'from-purple-500 to-purple-600',
      action: () => router.push('/trading/bot')
    },
    {
      icon: FaWallet,
      label: '포트폴리오',
      color: 'from-orange-500 to-orange-600',
      action: () => router.push('/portfolio/my')
    },
    {
      icon: FaBell,
      label: '알림',
      color: 'from-red-500 to-red-600',
      action: () => console.log('Notifications')
    },
    {
      icon: FaCog,
      label: '설정',
      color: 'from-gray-500 to-gray-600',
      action: () => router.push('/settings')
    }
  ]

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* 메뉴 옵션들 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {menuOptions.map((option, index) => {
              const Icon = option.icon
              const angle = (Math.PI / 2) * (index / (menuOptions.length - 1))
              const radius = 80
              const x = -Math.cos(angle) * radius
              const y = -Math.sin(angle) * radius

              return (
                <motion.button
                  key={index}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    scale: 1,
                    x: x,
                    y: y,
                    transition: {
                      type: "spring",
                      stiffness: 350,
                      damping: 20,
                      delay: index * 0.05
                    }
                  }}
                  exit={{ 
                    scale: 0,
                    x: 0,
                    y: 0,
                    transition: {
                      duration: 0.2,
                      delay: (menuOptions.length - index) * 0.03
                    }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    option.action()
                    setIsOpen(false)
                  }}
                  className="absolute bottom-0 right-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg group"
                  style={{
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  }}
                >
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                    <Icon className="text-white text-lg" />
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute right-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {option.label}
                  </div>
                </motion.button>
              )
            })}
          </>
        )}
      </AnimatePresence>

      {/* 메인 버튼 */}
      <motion.button
        animate={{ rotate: isOpen ? 135 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl z-10"
      >
        <FaPlus className="text-white text-xl" />
        
        {/* 펄스 효과 */}
        {!isOpen && (
          <motion.div
            animate={{
              scale: [1, 1.5, 1.5, 1, 1],
              opacity: [1, 0.5, 0, 0, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
          />
        )}
      </motion.button>
    </div>
  )
}