'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ShortcutConfig {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
}

interface KeyboardShortcutsProps {
  onSearchOpen?: () => void
  onThemeToggle?: () => void
}

export default function KeyboardShortcuts({ 
  onSearchOpen, 
  onThemeToggle 
}: KeyboardShortcutsProps) {
  const router = useRouter()

  useEffect(() => {
    const shortcuts: ShortcutConfig[] = [
      // 검색
      {
        key: 'k',
        ctrlKey: true,
        action: () => onSearchOpen?.(),
        description: '검색 열기'
      },
      {
        key: '/',
        action: () => onSearchOpen?.(),
        description: '검색 열기'
      },
      // 네비게이션
      {
        key: 'd',
        altKey: true,
        action: () => router.push('/dashboard'),
        description: '대시보드'
      },
      {
        key: 'c',
        altKey: true,
        action: () => router.push('/market/charts'),
        description: '차트'
      },
      {
        key: 'w',
        altKey: true,
        action: () => router.push('/wallet/portfolio'),
        description: '지갑'
      },
      {
        key: 'a',
        altKey: true,
        action: () => router.push('/ai/predictions'),
        description: 'AI 예측'
      },
      // 테마
      {
        key: 't',
        ctrlKey: true,
        shiftKey: true,
        action: () => onThemeToggle?.(),
        description: '테마 전환'
      },
      // 설정
      {
        key: ',',
        ctrlKey: true,
        action: () => router.push('/settings'),
        description: '설정'
      },
    ]

    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에서는 단축키 비활성화
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey
        const altMatch = shortcut.altKey ? e.altKey : !e.altKey
        
        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          e.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, onSearchOpen, onThemeToggle])

  return null
}

// 단축키 도움말 컴포넌트
export function ShortcutHelp() {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: '검색' },
    { keys: ['/'], description: '빠른 검색' },
    { keys: ['Alt', 'D'], description: '대시보드' },
    { keys: ['Alt', 'C'], description: '차트' },
    { keys: ['Alt', 'W'], description: '지갑' },
    { keys: ['Alt', 'A'], description: 'AI 예측' },
    { keys: ['Ctrl', 'Shift', 'T'], description: '테마 전환' },
    { keys: ['Ctrl', ','], description: '설정' },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
        키보드 단축키
      </h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, i) => (
                <span key={i}>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 dark:text-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                    {key}
                  </kbd>
                  {i < shortcut.keys.length - 1 && (
                    <span className="mx-1 text-gray-400">+</span>
                  )}
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {shortcut.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}