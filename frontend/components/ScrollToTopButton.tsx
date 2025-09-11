'use client'

import React, { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)

  // 스크롤 위치 감지
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  // 맨 위로 스크롤
  const scrollToTop = () => {
    setIsScrolling(true)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    
    // 애니메이션 후 상태 리셋
    setTimeout(() => {
      setIsScrolling(false)
    }, 500)
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-20 right-4 md:bottom-8 md:right-8
        z-50 p-3 md:p-4
        bg-gradient-to-r from-purple-600 to-purple-700
        hover:from-purple-700 hover:to-purple-800
        text-white rounded-full
        shadow-lg shadow-purple-500/25
        transition-all duration-300 ease-in-out
        transform hover:scale-110
        ${isScrolling ? 'animate-bounce' : 'animate-pulse'}
        group
      `}
      aria-label="맨 위로 이동"
    >
      <div className="relative">
        <ChevronUp 
          className={`
            w-5 h-5 md:w-6 md:h-6
            transition-transform duration-300
            group-hover:-translate-y-1
          `}
        />
        
        {/* 모바일에서 툴팁 */}
        <div className="
          absolute bottom-full right-0 mb-2
          px-2 py-1 text-xs
          bg-gray-900 text-white rounded
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none
          whitespace-nowrap
        ">
          맨 위로
        </div>
      </div>
      
      {/* 리플 효과 */}
      <div className="absolute inset-0 rounded-full">
        <div className="
          absolute inset-0 rounded-full
          bg-white opacity-0 group-hover:opacity-20
          transition-opacity duration-300
        " />
      </div>
    </button>
  )
}