'use client'

import { useState } from 'react'
import CommandPalette from '@/components/CommandPalette'
import SidebarGitHub from '@/components/SidebarGitHub'
import FloatingActionMenu from '@/components/FloatingActionMenu'
import TopNavigationBar from '@/components/TopNavigationBar'
import DockMenu from '@/components/DockMenu'
import SpotlightSearch from '@/components/SpotlightSearch'
import BottomSheet from '@/components/BottomSheet'
import TabBar from '@/components/TabBar'

export default function UIShowcase() {
  const [activeUI, setActiveUI] = useState<string>('command')

  const uiOptions = [
    { id: 'command', name: 'Command Palette', desc: 'VS Code/Raycast 스타일' },
    { id: 'github', name: 'GitHub Sidebar', desc: 'GitHub 버튼형 사이드바' },
    { id: 'floating', name: 'Floating Action', desc: 'Telegram 플로팅 메뉴' },
    { id: 'topnav', name: 'Top Navigation', desc: 'Vercel/Linear 상단바' },
    { id: 'dock', name: 'Dock Menu', desc: 'macOS 독 스타일' },
    { id: 'spotlight', name: 'Spotlight Search', desc: 'macOS Spotlight' },
    { id: 'bottomsheet', name: 'Bottom Sheet', desc: 'Instagram 하단 시트' },
    { id: 'tabbar', name: 'Tab Bar', desc: 'iOS 탭바 스타일' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">
      {/* 선택 패널 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            MONSTA UI 쇼케이스
          </h1>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {uiOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setActiveUI(option.id)}
                className={`p-3 rounded-lg border transition-all text-center ${
                  activeUI === option.id
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="font-medium text-sm">{option.name}</div>
                <div className="text-xs opacity-70 mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="pt-40 min-h-screen relative">
        {/* 데모 콘텐츠 */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
                <div className="h-32 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">샘플 카드 {i}</h3>
                <p className="text-sm text-gray-500">
                  UI 스타일을 테스트하기 위한 샘플 콘텐츠입니다.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* UI 컴포넌트들 */}
        {activeUI === 'command' && <CommandPalette />}
        {activeUI === 'github' && <SidebarGitHub />}
        {activeUI === 'floating' && <FloatingActionMenu />}
        {activeUI === 'topnav' && <TopNavigationBar />}
        {activeUI === 'dock' && <DockMenu />}
        {activeUI === 'spotlight' && <SpotlightSearch />}
        {activeUI === 'bottomsheet' && <BottomSheet />}
        {activeUI === 'tabbar' && <TabBar />}
      </div>
    </div>
  )
}