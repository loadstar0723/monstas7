'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = '로딩 중...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
    xl: 'w-3 h-3'
  }

  const Spinner = () => (
    <div className="flex flex-col items-center gap-4">
      {/* 메인 스피너 */}
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} relative`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          {/* 외부 원 */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-600/20 dark:border-purple-400/20" />
          
          {/* 회전하는 그라디언트 */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-600 border-r-pink-600 dark:border-t-purple-400 dark:border-r-pink-400" />
          
          {/* 중앙 점 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* 궤도 점들 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`absolute ${dotSizes[size]} bg-purple-600 dark:bg-purple-400 rounded-full`}
              animate={{
                x: [0, 30, 0, -30, 0],
                y: [0, -30, 0, 30, 0],
                opacity: [1, 0.5, 1, 0.5, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4
              }}
            />
          ))}
        </div>
      </div>

      {/* 텍스트 */}
      {text && (
        <motion.p
          className="text-sm font-medium text-gray-600 dark:text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm"
      >
        <Spinner />
      </motion.div>
    )
  }

  return <Spinner />
}