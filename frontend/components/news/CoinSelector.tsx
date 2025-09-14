'use client'

import { useState, useEffect } from 'react'

interface CoinSelectorProps {
  coins: string[]
  selectedCoin: string
  onSelectCoin: (coin: string) => void
  coinSymbols?: Record<string, string>
  newsData?: any[] // 뉴스 데이터를 받아서 어떤 코인에 뉴스가 있는지 확인
  autoTranslate?: boolean
  onToggleAutoTranslate?: () => void
}

export default function CoinSelector({
  coins,
  selectedCoin,
  onSelectCoin,
  coinSymbols = {},
  newsData = [],
  autoTranslate = false,
  onToggleAutoTranslate
}: CoinSelectorProps) {
  const [showAllCoins, setShowAllCoins] = useState(false)
  const [coinsWithNews, setCoinsWithNews] = useState<Set<string>>(new Set())
  const [recentUpdateCoins, setRecentUpdateCoins] = useState<Set<string>>(new Set())

  // 뉴스가 있는 코인과 최근 업데이트 코인 추적
  useEffect(() => {
    const coinsSet = new Set<string>()
    const recentSet = new Set<string>()
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    newsData.forEach(news => {
      // relatedCoins가 있는 경우
      if (news.relatedCoins) {
        news.relatedCoins.forEach((coin: string) => {
          coinsSet.add(coin)
          // 1시간 이내 뉴스가 있는 코인은 최근 업데이트로 표시
          if (new Date(news.publishedAt || news.published_at || news.createdAt) > oneHourAgo) {
            recentSet.add(coin)
          }
        })
      }
      // categories나 tags에서 코인 정보 추출
      if (news.categories) {
        news.categories.forEach((cat: string) => {
          const upperCat = cat.toUpperCase()
          if (coins.includes(upperCat)) {
            coinsSet.add(upperCat)
            if (new Date(news.publishedAt || news.published_at || news.createdAt) > oneHourAgo) {
              recentSet.add(upperCat)
            }
          }
        })
      }
      // title이나 description에서 코인 언급 확인
      const text = `${news.title || ''} ${news.description || ''}`.toUpperCase()
      coins.forEach(coin => {
        if (coin !== 'ALL' && text.includes(coin)) {
          coinsSet.add(coin)
          if (new Date(news.publishedAt || news.published_at || news.createdAt) > oneHourAgo) {
            recentSet.add(coin)
          }
        }
      })
    })

    setCoinsWithNews(coinsSet)
    setRecentUpdateCoins(recentSet)
  }, [newsData, coins])

  // 코인 정렬
  const sortedCoins = coins
    .filter(coin => {
      if (showAllCoins) return true
      if (coin === 'ALL') return true
      return coinsWithNews.has(coin) || recentUpdateCoins.has(coin)
    })
    .sort((a, b) => {
      // ALL을 항상 맨 앞에
      if (a === 'ALL') return -1
      if (b === 'ALL') return 1
      // 최근 업데이트 코인 우선
      if (recentUpdateCoins.has(a) && !recentUpdateCoins.has(b)) return -1
      if (!recentUpdateCoins.has(a) && recentUpdateCoins.has(b)) return 1
      // 뉴스가 있는 코인 다음
      if (coinsWithNews.has(a) && !coinsWithNews.has(b)) return -1
      if (!coinsWithNews.has(a) && coinsWithNews.has(b)) return 1
      return 0
    })

  const hiddenCoinsCount = coins.filter(
    coin => coin !== 'ALL' && !coinsWithNews.has(coin) && !recentUpdateCoins.has(coin)
  ).length

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-400">코인 선택 ({coins.length - 1}+ 지원)</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAllCoins(!showAllCoins)}
            className="px-3 py-1 rounded-lg text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 flex items-center gap-1"
          >
            {showAllCoins ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                접기
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                모든 코인 보기
              </>
            )}
          </button>
          {onToggleAutoTranslate && (
            <button
              onClick={onToggleAutoTranslate}
              className={`px-3 py-1 rounded-lg text-sm ${
                autoTranslate ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              🌐 자동 번역 {autoTranslate ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {sortedCoins.map(coin => (
          <button
            key={coin}
            onClick={() => onSelectCoin(coin)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all text-sm relative ${
              selectedCoin === coin
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : coinsWithNews.has(coin)
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
            }`}
          >
            {recentUpdateCoins.has(coin) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded animate-pulse">
                NEW
              </span>
            )}
            {coin === 'ALL' ? '🌍' : coinSymbols[coin] || '●'} {coin}
          </button>
        ))}
      </div>

      {!showAllCoins && hiddenCoinsCount > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {hiddenCoinsCount}개의 코인이 숨겨져 있습니다 (뉴스 없음)
        </div>
      )}
    </div>
  )
}