'use client'

import { useSidebar } from '@/contexts/SidebarContext'
import ThemeToggle from './ThemeToggle'
import { FaBars } from 'react-icons/fa'

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen } = useSidebar()
  
  // 사이드바가 열릴 때 메인 콘텐츠가 함께 이동
  return (
    <main 
      className="min-h-screen transition-all duration-300 dark:bg-gray-900 bg-gray-50"
      style={{ marginLeft: isOpen ? '320px' : '0' }}
    >
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isOpen && (
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
                aria-label="메뉴 열기"
              >
                <FaBars className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              MONSTA Trading Platform
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </main>
  )
}