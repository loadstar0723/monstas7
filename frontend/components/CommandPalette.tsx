'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaSearch, FaRocket, FaChartLine, FaBrain, FaWallet,
  FaCrown, FaGem, FaShieldAlt, FaHistory, FaTrophy,
  FaArrowRight, FaKeyboard, FaStar, FaClock, FaBolt,
  FaFire, FaTags, FaUser, FaCog, FaSignOutAlt
} from 'react-icons/fa'
import { BiCommand } from 'react-icons/bi'
import { MdAutoGraph, MdCandlestickChart } from 'react-icons/md'
import { config } from '@/lib/config'

interface Command {
  id: string
  title: string
  description?: string
  icon: React.ElementType
  action: () => void
  category: string
  tier?: string
  shortcut?: string
  keywords?: string[]
  isRecent?: boolean
  isFavorite?: boolean
}

const tierColors = {
  FREE: 'text-gray-400',
  SILVER: 'text-gray-300',
  GOLD: 'text-yellow-400',
  PLATINUM: 'text-purple-400',
  DIAMOND: 'text-cyan-400',
  BLACK: 'text-white'
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentCommands, setRecentCommands] = useState<string[]>([])
  const [favoriteCommands, setFavoriteCommands] = useState<Set<string>>(new Set())
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // 모든 명령어
  const allCommands: Command[] = [
    // 시그널
    {
      id: 'signal-dashboard',
      title: 'AI 시그널 대시보드',
      description: '실시간 AI 시그널 확인',
      icon: MdAutoGraph,
      action: () => router.push('/signals/dashboard'),
      category: '시그널',
      tier: 'FREE',
      shortcut: '⌘+S',
      keywords: ['signal', 'ai', 'dashboard', '시그널', '대시보드']
    },
    {
      id: 'signal-realtime',
      title: '실시간 시그널',
      description: '최신 거래 시그널',
      icon: FaBolt,
      action: () => router.push('/signals/realtime'),
      category: '시그널',
      tier: 'SILVER',
      keywords: ['realtime', 'live', '실시간']
    },
    {
      id: 'signal-premium',
      title: '프리미엄 시그널',
      description: 'VIP 전용 시그널',
      icon: FaCrown,
      action: () => router.push('/signals/premium'),
      category: '시그널',
      tier: 'GOLD',
      keywords: ['premium', 'vip', '프리미엄']
    },
    
    // 트레이딩
    {
      id: 'trading-chart',
      title: '실시간 차트',
      description: 'TradingView 차트',
      icon: MdCandlestickChart,
      action: () => router.push('/trading/chart'),
      category: '트레이딩',
      tier: 'FREE',
      shortcut: '⌘+C',
      keywords: ['chart', 'trading', '차트', '트레이딩']
    },
    {
      id: 'trading-bot',
      title: '자동매매 봇',
      description: 'AI 자동 트레이딩',
      icon: FaBrain,
      action: () => router.push('/trading/bot'),
      category: '트레이딩',
      tier: 'PLATINUM',
      keywords: ['bot', 'auto', '자동', '봇']
    },
    
    // 포트폴리오
    {
      id: 'portfolio-my',
      title: '내 포트폴리오',
      description: '자산 현황 확인',
      icon: FaWallet,
      action: () => router.push('/portfolio/my'),
      category: '포트폴리오',
      tier: 'FREE',
      shortcut: '⌘+P',
      keywords: ['portfolio', 'wallet', '포트폴리오', '지갑']
    },
    
    // 액션
    {
      id: 'action-new-signal',
      title: '새 시그널 생성',
      description: '시그널 만들기',
      icon: FaRocket,
      action: () => console.log('Create signal'),
      category: '액션',
      shortcut: '⌘+N',
      keywords: ['new', 'create', '생성', '만들기']
    },
    {
      id: 'action-settings',
      title: '설정',
      description: '계정 및 알림 설정',
      icon: FaCog,
      action: () => router.push('/settings'),
      category: '설정',
      shortcut: '⌘+,',
      keywords: ['settings', 'config', '설정']
    },
    {
      id: 'action-logout',
      title: '로그아웃',
      icon: FaSignOutAlt,
      action: () => console.log('Logout'),
      category: '설정',
      keywords: ['logout', 'signout', '로그아웃']
    }
  ]

  // 명령어 필터링
  const filteredCommands = allCommands.filter(cmd => {
    const query = searchQuery.toLowerCase()
    return (
      cmd.title.toLowerCase().includes(query) ||
      cmd.description?.toLowerCase().includes(query) ||
      cmd.keywords?.some(k => k.toLowerCase().includes(query)) ||
      cmd.category.toLowerCase().includes(query)
    )
  })

  // 카테고리별 그룹화
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, Command[]>)

  // 최근 사용 및 즐겨찾기 추가
  const enhancedGroups = {
    ...(recentCommands.length > 0 && {
      '최근 사용': recentCommands
        .map(id => allCommands.find(c => c.id === id))
        .filter(Boolean)
        .slice(0, 3) as Command[]
    }),
    ...(favoriteCommands.size > 0 && {
      '즐겨찾기': Array.from(favoriteCommands)
        .map(id => allCommands.find(c => c.id === id))
        .filter(Boolean) as Command[]
    }),
    ...groupedCommands
  }

  // 전체 명령어 리스트 (플랫하게)
  const flatCommands = Object.values(enhancedGroups).flat()

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K 또는 Ctrl+K로 열기
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      
      // ESC로 닫기
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
      
      // 열려있을 때 네비게이션
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex(prev => (prev + 1) % flatCommands.length)
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex(prev => (prev - 1 + flatCommands.length) % flatCommands.length)
        }
        if (e.key === 'Enter' && flatCommands[selectedIndex]) {
          e.preventDefault()
          executeCommand(flatCommands[selectedIndex])
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, flatCommands])

  // 팔레트 열릴 때 포커스
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSelectedIndex(0)
      setSearchQuery('')
    }
  }, [isOpen])

  // 명령어 실행
  const executeCommand = (cmd: Command) => {
    cmd.action()
    setIsOpen(false)
    
    // 최근 사용 기록
    setRecentCommands(prev => {
      const updated = [cmd.id, ...prev.filter(id => id !== cmd.id)].slice(0, 10)
      localStorage.setItem('recentCommands', JSON.stringify(updated))
      return updated
    })
  }

  // 즐겨찾기 토글
  const toggleFavorite = (cmdId: string) => {
    const newFavorites = new Set(favoriteCommands)
    if (newFavorites.has(cmdId)) {
      newFavorites.delete(cmdId)
    } else {
      newFavorites.add(cmdId)
    }
    setFavoriteCommands(newFavorites)
    localStorage.setItem('favoriteCommands', JSON.stringify(Array.from(newFavorites)))
  }

  // 로컬스토리지에서 로드
  useEffect(() => {
    const recent = localStorage.getItem('recentCommands')
    if (recent) setRecentCommands(JSON.parse(recent))
    
    const favorites = localStorage.getItem('favoriteCommands')
    if (favorites) setFavoriteCommands(new Set(JSON.parse(favorites)))
  }, [])

  return (
    <>
      {/* 트리거 버튼 (화면 하단 중앙) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-full flex items-center gap-3 transition-all shadow-2xl group"
      >
        <BiCommand className="text-purple-400 text-lg" />
        <span className="text-gray-300">Command Palette</span>
        <kbd className="px-2 py-config.decimals.value5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-500">
          ⌘K
        </kbd>
      </button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* 팔레트 */}
            <motion.div
              initial={{ opacity: 0, scale: config.decimals.value95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: config.decimals.value95, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* 검색 입력 */}
              <div className="relative border-b border-gray-800">
                <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="무엇을 찾고 계신가요?"
                  className="w-full pl-14 pr-6 py-5 bg-transparent text-lg text-gray-100 placeholder-gray-500 focus:outline-none"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-500">↑↓</kbd>
                  <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-500">Enter</kbd>
                  <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-500">ESC</kbd>
                </div>
              </div>
              
              {/* 명령어 리스트 */}
              <div className="max-h-96 overflow-y-auto">
                {Object.entries(enhancedGroups).map(([category, commands], groupIndex) => (
                  <div key={category}>
                    {/* 카테고리 헤더 */}
                    <div className="px-4 py-2 bg-gray-950/50">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase">{category}</h3>
                    </div>
                    
                    {/* 명령어들 */}
                    {commands.map((cmd, cmdIndex) => {
                      const globalIndex = Object.values(enhancedGroups)
                        .slice(0, groupIndex)
                        .flat().length + cmdIndex
                      const isSelected = selectedIndex === globalIndex
                      const Icon = cmd.icon
                      const isFavorite = favoriteCommands.has(cmd.id)
                      
                      return (
                        <div
                          key={cmd.id}
                          className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-all ${
                            isSelected ? 'bg-purple-500/20' : 'hover:bg-gray-800/50'
                          }`}
                          onClick={() => executeCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                        >
                          <Icon className={`text-lg ${
                            isSelected ? 'text-purple-400' : 'text-gray-500'
                          }`} />
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${
                                isSelected ? 'text-gray-100' : 'text-gray-300'
                              }`}>
                                {cmd.title}
                              </span>
                              {cmd.tier && (
                                <span className={`text-xs ${tierColors[cmd.tier]}`}>
                                  {cmd.tier}
                                </span>
                              )}
                            </div>
                            {cmd.description && (
                              <p className="text-xs text-gray-500 mt-config.decimals.value5">{cmd.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {cmd.shortcut && (
                              <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-500">
                                {cmd.shortcut}
                              </kbd>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(cmd.id)
                              }}
                              className="p-1 hover:bg-gray-700 rounded"
                            >
                              <FaStar className={`text-sm ${
                                isFavorite ? 'text-yellow-500' : 'text-gray-600'
                              }`} />
                            </button>
                            {isSelected && (
                              <FaArrowRight className="text-purple-400" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
                
                {filteredCommands.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-500">검색 결과가 없습니다</p>
                    <p className="text-sm text-gray-600 mt-2">다른 키워드로 검색해보세요</p>
                  </div>
                )}
              </div>
              
              {/* 하단 도움말 */}
              <div className="px-4 py-3 bg-gray-950/50 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>↑↓ 선택</span>
                  <span>Enter 실행</span>
                  <span>⌘+K 열기</span>
                  <span>ESC 닫기</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaFire className="text-orange-500" />
                  <span>AI 추천 활성화</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}