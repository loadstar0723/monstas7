'use client'

import { useSidebar } from '@/contexts/SidebarContext'

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar()
  
  // 사이드바가 열릴 때 메인 콘텐츠가 함께 이동
  return (
    <main 
      className="min-h-screen transition-all duration-300"
      style={{ marginLeft: isOpen ? '320px' : '0' }}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </main>
  )
}