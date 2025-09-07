'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { motion } from 'framer-motion'
import { config } from '@/lib/config'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0,
    rootMargin: '50px',
    freezeOnceVisible: true
  })

  // 우선순위가 높은 이미지는 바로 로드
  if (priority) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        quality={quality}
        priority
        placeholder={placeholder}
        blurDataURL={blurDataURL}
      />
    )
  }

  return (
    <div ref={ref as any} className={`relative ${className}`}>
      {/* 스켈레톤 로더 */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse rounded" />
      )}

      {/* 에러 상태 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">이미지 로드 실패</p>
          </div>
        </div>
      )}

      {/* 실제 이미지 */}
      {isVisible && !hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: config.decimals.value3 }}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            quality={quality}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
          />
        </motion.div>
      )}
    </div>
  )
}