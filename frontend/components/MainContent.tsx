'use client'

import { useSidebar } from '@/contexts/SidebarContext'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen } = useSidebar()
  const pathname = usePathname()

  // 뉴스 페이지인지 확인
  const isNewsPage = pathname?.includes('/news/')

  // 사이드바가 열릴 때 메인 콘텐츠가 함께 이동
  return (
    <main
      className={`min-h-screen transition-all duration-300 bg-gray-900 dark:bg-gray-900`}
      style={{ marginLeft: isOpen ? '320px' : '0' }}
    >
      {/* 헤더 - 모든 페이지에서 번역 제외 */}
      <header className="sticky top-0 z-40 bg-gray-900 dark:bg-gray-900 border-b border-gray-800 notranslate">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 헤더의 햄버거 버튼 제거 - SidebarNew의 보라색 버튼만 사용 */}
          </div>

          <div className="flex items-center gap-4">
            {/* <ThemeToggle /> */}
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8 text-white">
        {children}
      </div>
    </main>
  )
}