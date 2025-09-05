'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { FaSearch, FaTimes, FaChartLine, FaWallet, FaRobot, FaCog, FaHistory } from 'react-icons/fa'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const searchItems = [
  { icon: <FaChartLine />, title: '실시간 차트', path: '/market/charts', category: '시장' },
  { icon: <FaChartLine />, title: '고급 차트', path: '/market/advanced-charts', category: '시장' },
  { icon: <FaWallet />, title: '포트폴리오', path: '/wallet/portfolio', category: '지갑' },
  { icon: <FaWallet />, title: '거래 내역', path: '/wallet/transactions', category: '지갑' },
  { icon: <FaRobot />, title: 'AI 예측', path: '/ai/predictions', category: 'AI' },
  { icon: <FaRobot />, title: 'AI 시그널', path: '/ai/signals', category: 'AI' },
  { icon: <FaCog />, title: '계정 설정', path: '/settings/account', category: '설정' },
  { icon: <FaCog />, title: '보안 설정', path: '/settings/security', category: '설정' },
]

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredItems, setFilteredItems] = useState(searchItems)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus()
      // 최근 검색어 로드
      const saved = localStorage.getItem('monsta_recent_searches')
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    }
  }, [isOpen])

  useEffect(() => {
    const filtered = searchItems.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredItems(filtered)
    setSelectedIndex(0)
  }, [searchQuery])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % filteredItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredItems[selectedIndex]) {
        handleNavigate(filteredItems[selectedIndex].path)
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleNavigate = (path: string) => {
    // 최근 검색어 저장
    if (searchQuery) {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('monsta_recent_searches', JSON.stringify(updated))
    }
    
    router.push(path)
    onClose()
    setSearchQuery('')
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('monsta_recent_searches')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* 검색 입력 */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="검색어를 입력하세요..."
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* 검색 결과 */}
              <div className="max-h-96 overflow-y-auto">
                {searchQuery === '' && recentSearches.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        최근 검색
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        모두 지우기
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(search)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <FaHistory className="w-3 h-3" />
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredItems.length > 0 ? (
                  <div className="p-2">
                    {filteredItems.map((item, index) => (
                      <button
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full px-4 py-3 flex items-center gap-3 rounded-lg transition-colors ${
                          index === selectedIndex
                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="text-gray-400">{item.icon}</div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.category}
                          </div>
                        </div>
                        {index === selectedIndex && (
                          <div className="text-xs text-gray-400">Enter ↵</div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    검색 결과가 없습니다
                  </div>
                )}
              </div>

              {/* 단축키 안내 */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>↑↓ 이동</span>
                <span>Enter 선택</span>
                <span>ESC 닫기</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}