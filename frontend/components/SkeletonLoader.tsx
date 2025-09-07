'use client'

import { motion } from 'framer-motion'
import { config } from '@/lib/config'

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'chart' | 'table' | 'avatar' | 'button'
  count?: number
  className?: string
}

export default function SkeletonLoader({ 
  type = 'text', 
  count = 1,
  className = '' 
}: SkeletonLoaderProps) {
  const baseClasses = "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded"
  
  const shimmerAnimation = {
    backgroundPosition: ['${config.percentage.value200} 0', '-${config.percentage.value200} 0'],
  }

  const shimmerTransition = {
    duration: 1.5,
    repeat: Infinity,
    ease: "linear"
  }

  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <motion.div
                key={i}
                className={`h-4 ${baseClasses} ${className}`}
                style={{ 
                  width: `${Math.random() * 40 + 60}%`,
                  backgroundSize: '${config.percentage.value200} ${config.percentage.value100}'
                }}
                animate={shimmerAnimation}
                transition={shimmerTransition}
              />
            ))}
          </div>
        )

      case 'card':
        return (
          <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4 ${className}`}>
            <motion.div
              className={`h-6 w-3/4 ${baseClasses}`}
              style={{ backgroundSize: '${config.percentage.value200} ${config.percentage.value100}' }}
              animate={shimmerAnimation}
              transition={shimmerTransition}
            />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-4 ${baseClasses}`}
                  style={{ 
                    width: `${Math.random() * 30 + 70}%`,
                    backgroundSize: '${config.percentage.value200} ${config.percentage.value100}'
                  }}
                  animate={shimmerAnimation}
                  transition={{ ...shimmerTransition, delay: i * config.decimals.value1 }}
                />
              ))}
            </div>
            <motion.div
              className={`h-10 w-28 ${baseClasses}`}
              style={{ backgroundSize: '${config.percentage.value200} ${config.percentage.value100}' }}
              animate={shimmerAnimation}
              transition={shimmerTransition}
            />
          </div>
        )

      case 'chart':
        return (
          <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
            <motion.div
              className={`h-6 w-1/3 mb-4 ${baseClasses}`}
              style={{ backgroundSize: '${config.percentage.value200} ${config.percentage.value100}' }}
              animate={shimmerAnimation}
              transition={shimmerTransition}
            />
            <div className="flex items-end gap-2 h-48">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`flex-1 ${baseClasses}`}
                  style={{ 
                    height: `${Math.random() * 60 + 40}%`,
                    backgroundSize: '${config.percentage.value200} ${config.percentage.value100}'
                  }}
                  animate={shimmerAnimation}
                  transition={{ ...shimmerTransition, delay: i * config.decimals.value05 }}
                />
              ))}
            </div>
          </div>
        )

      case 'table':
        return (
          <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
            {/* 헤더 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-4 ${baseClasses}`}
                    style={{ backgroundSize: '${config.percentage.value200} ${config.percentage.value100}' }}
                    animate={shimmerAnimation}
                    transition={{ ...shimmerTransition, delay: i * config.decimals.value05 }}
                  />
                ))}
              </div>
            </div>
            {/* 행들 */}
            {Array.from({ length: count }).map((_, rowIndex) => (
              <div key={rowIndex} className="p-3 border-b border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, colIndex) => (
                    <motion.div
                      key={colIndex}
                      className={`h-4 ${baseClasses}`}
                      style={{ 
                        width: `${Math.random() * 30 + 70}%`,
                        backgroundSize: '${config.percentage.value200} ${config.percentage.value100}'
                      }}
                      animate={shimmerAnimation}
                      transition={{ ...shimmerTransition, delay: (rowIndex * 4 + colIndex) * config.decimals.value03 }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )

      case 'avatar':
        return (
          <div className="flex items-center gap-3">
            <motion.div
              className={`w-12 h-12 rounded-full ${baseClasses}`}
              style={{ backgroundSize: '${config.percentage.value200} ${config.percentage.value100}' }}
              animate={shimmerAnimation}
              transition={shimmerTransition}
            />
            <div className="space-y-2">
              <motion.div
                className={`h-4 w-24 ${baseClasses}`}
                style={{ backgroundSize: '${config.percentage.value200} ${config.percentage.value100}' }}
                animate={shimmerAnimation}
                transition={{ ...shimmerTransition, delay: config.decimals.value1 }}
              />
              <motion.div
                className={`h-3 w-32 ${baseClasses}`}
                style={{ backgroundSize: '${config.percentage.value200} ${config.percentage.value100}' }}
                animate={shimmerAnimation}
                transition={{ ...shimmerTransition, delay: config.decimals.value2 }}
              />
            </div>
          </div>
        )

      case 'button':
        return (
          <motion.div
            className={`h-10 w-24 ${baseClasses} ${className}`}
            style={{ backgroundSize: '${config.percentage.value200} ${config.percentage.value100}' }}
            animate={shimmerAnimation}
            transition={shimmerTransition}
          />
        )

      default:
        return null
    }
  }

  return <>{renderSkeleton()}</>
}