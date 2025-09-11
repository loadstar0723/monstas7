'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true) // 기본값: 다크모드
  const [mounted, setMounted] = useState(false)

  // localStorage에서 테마 설정 불러오기
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('monsta_theme')
        if (savedTheme) {
          setIsDarkMode(savedTheme === 'dark')
        } else {
          // 시스템 설정 확인
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          setIsDarkMode(prefersDark)
        }
      } catch (error) {
        console.error('Theme initialization error:', error)
      }
    }
  }, [])

  // 테마 변경 시 DOM과 localStorage 업데이트
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      try {
        if (isDarkMode) {
          document.documentElement.classList.add('dark')
          localStorage.setItem('monsta_theme', 'dark')
        } else {
          document.documentElement.classList.remove('dark')
          localStorage.setItem('monsta_theme', 'light')
        }
      } catch (error) {
        console.error('Theme update error:', error)
      }
    }
  }, [isDarkMode, mounted])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}