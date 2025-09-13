'use client'

import { useSidebar } from '@/contexts/SidebarContext'
import ThemeToggle from './ThemeToggle'

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen } = useSidebar()

  // 사이드바가 열릴 때 메인 콘텐츠가 함께 이동
  return (
    <main 
      className="min-h-screen transition-all duration-300 dark:bg-gray-900 bg-gray-50"
      style={{ marginLeft: isOpen ? '320px' : '0' }}
    >
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 헤더의 햄버거 버튼 제거 - SidebarNew의 보라색 버튼만 사용 */}
          </div>

          <div className="flex items-center gap-4">
            {/* <ThemeToggle /> */}
          </div>
        </div>
      </header>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </main>
  )
}