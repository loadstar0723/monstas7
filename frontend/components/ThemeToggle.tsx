'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { FaMoon, FaSun } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { config } from '@/lib/config'

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: config.decimals.value95 }}
      aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDarkMode ? 0 : 180 }}
        transition={{ duration: config.decimals.value3 }}
      >
        {isDarkMode ? (
          <FaSun className="w-5 h-5 text-yellow-400" />
        ) : (
          <FaMoon className="w-5 h-5 text-purple-600" />
        )}
      </motion.div>
    </motion.button>
  )
}