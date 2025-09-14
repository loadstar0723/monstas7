'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface NewsCardProps {
  news: any
  index?: number
  viewMode?: 'analysis' | 'list' | 'grid'
  showTranslated?: boolean
  translation?: { title: string; description: string }
  translating?: boolean
  coinSymbols?: Record<string, string>
  onVote?: (newsId: string, vote: 'bullish' | 'neutral' | 'bearish') => void
}

export default function NewsCard({
  news,
  index = 0,
  viewMode = 'list',
  showTranslated = false,
  translation,
  translating = false,
  coinSymbols = {},
  onVote
}: NewsCardProps) {
  const [expanded, setExpanded] = useState(false)

  // 뉴스 중요도 결정
  const getImportance = () => {
    const text = (news.title + ' ' + (news.description || '')).toLowerCase()
    if (text.includes('breaking') || text.includes('urgent')) return 'CRITICAL'
    if (text.includes('major') || text.includes('significant')) return 'HIGH'
    if (text.includes('update') || text.includes('announces')) return 'MEDIUM'
    return 'LOW'
  }

  const importance = news.importance || getImportance()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-purple-500 transition-all ${
        viewMode === 'analysis' ? 'p-6' : 'p-4'
      }`}
    >
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-bold ${
            importance === 'CRITICAL' ? 'bg-red-600 text-white' :
            importance === 'HIGH' ? 'bg-orange-600 text-white' :
            importance === 'MEDIUM' ? 'bg-yellow-600 text-black' :
            'bg-gray-600 text-white'
          }`}>
            {importance}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(news.publishedAt || news.published_at || news.createdAt || news.date).toLocaleString('ko-KR')}
          </span>
        </div>
        {news.tradingSignal && (
          <span className={`px-2 py-1 rounded text-xs font-bold ${
            news.tradingSignal.direction === 'LONG' ? 'bg-green-600/20 text-green-400' :
            news.tradingSignal.direction === 'SHORT' ? 'bg-red-600/20 text-red-400' :
            'bg-gray-600/20 text-gray-400'
          }`}>
            {news.tradingSignal.direction === 'LONG' ? '🟢 LONG' :
             news.tradingSignal.direction === 'SHORT' ? '🔴 SHORT' :
             '⚪ NEUTRAL'} {news.tradingSignal.confidence}%
          </span>
        )}
      </div>

      {/* 제목 */}
      <h3 className="text-white font-semibold mb-2">
        {showTranslated && translation?.title
          ? translation.title
          : news.title}
        {translating && ' 번역중...'}
      </h3>

      {/* 설명 */}
      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
        {showTranslated && translation?.description
          ? translation.description
          : news.description || news.summary || news.content?.substring(0, 200)}
      </p>

      {/* 간단한 정보 표시 */}
      {news.tradingSignal && (
        <div className="flex items-center gap-3 mb-3 text-xs">
          <span className={`flex items-center gap-1 px-2 py-1 rounded ${
            news.tradingSignal.direction === 'LONG' ? 'bg-green-600/20 text-green-400' :
            news.tradingSignal.direction === 'SHORT' ? 'bg-red-600/20 text-red-400' :
            'bg-gray-600/20 text-gray-400'
          }`}>
            {news.tradingSignal.direction === 'LONG' ? '📈' :
             news.tradingSignal.direction === 'SHORT' ? '📉' : '➡️'}
            {news.tradingSignal.direction}
          </span>
          <span className="flex items-center gap-1">
            🎯 {news.tradingSignal.confidence}%
          </span>
        </div>
      )}

      {/* 펼치기/접기 버튼 */}
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
        >
          {expanded ? (
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
              상세보기
            </>
          )}
        </button>
      </div>

      {/* 확장된 내용 */}
      {expanded && (
        <>
          {/* 전체 내용 */}
          {news.content && (
            <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
              <h4 className="text-xs font-semibold text-purple-400 mb-2">📄 전체 내용</h4>
              <p className="text-gray-400 text-xs">
                {showTranslated && translation?.description
                  ? translation.description
                  : news.content.substring(0, 500) + '...'}
              </p>
            </div>
          )}

          {/* 상세 분석 정보 - 분석 모드일 때만 */}
          {viewMode === 'analysis' && (
            <>
              {/* AI 트레이딩 시그널 */}
              {news.tradingSignal && (
                <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                  <h4 className="text-xs font-semibold text-purple-400 mb-2">🤖 AI 트레이딩 시그널</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>방향: {news.tradingSignal.direction}</div>
                    <div>신뢰도: {news.tradingSignal.confidence}%</div>
                    <div>시간대: {news.tradingSignal.timeframe}</div>
                    <div>R:R: {news.tradingSignal.riskReward}</div>
                  </div>
                </div>
              )}

              {/* 소셜 센티먼트 */}
              {news.socialSentiment && (
                <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                  <h4 className="text-xs font-semibold text-purple-400 mb-2">💬 소셜 센티먼트</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>Twitter: {news.socialSentiment.twitter?.toLocaleString() || 'N/A'}</div>
                    <div>Reddit: {news.socialSentiment.reddit?.toLocaleString() || 'N/A'}</div>
                    <div>버즈: {news.socialSentiment.buzzScore || 0}점</div>
                  </div>
                  {news.socialSentiment.viralPotential && (
                    <div className={`mt-2 text-xs ${
                      news.socialSentiment.viralPotential === 'HIGH' ? 'text-red-400' :
                      news.socialSentiment.viralPotential === 'MEDIUM' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      바이럴 가능성: {news.socialSentiment.viralPotential}
                    </div>
                  )}
                </div>
              )}

              {/* 커뮤니티 투표 */}
              {news.communityVote && onVote && (
                <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                  <h4 className="text-xs font-semibold text-purple-400 mb-2">🗳️ 커뮤니티 투표</h4>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => onVote(news.id, 'bullish')}
                      className="flex-1 py-1 bg-green-600/20 text-green-400 rounded text-xs hover:bg-green-600/30"
                    >
                      📈 강세 ({news.communityVote.bullish})
                    </button>
                    <button
                      onClick={() => onVote(news.id, 'neutral')}
                      className="flex-1 py-1 bg-gray-600/20 text-gray-400 rounded text-xs hover:bg-gray-600/30"
                    >
                      ➡️ 중립 ({news.communityVote.neutral})
                    </button>
                    <button
                      onClick={() => onVote(news.id, 'bearish')}
                      className="flex-1 py-1 bg-red-600/20 text-red-400 rounded text-xs hover:bg-red-600/30"
                    >
                      📉 약세 ({news.communityVote.bearish})
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    총 {news.communityVote.total}명 참여
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* 관련 코인 */}
      {news.relatedCoins && news.relatedCoins.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {news.relatedCoins.slice(0, 5).map((coin: string) => (
            <span
              key={coin}
              className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs"
            >
              {coinSymbols[coin] || '●'} {coin}
            </span>
          ))}
        </div>
      )}

      {/* 카테고리 태그 */}
      {news.categories && news.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {news.categories.slice(0, 3).map((cat: string) => (
            <span
              key={cat}
              className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* 하단 액션 */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          📰 {news.source?.name || news.source || 'Unknown'}
        </span>
        <div className="flex gap-2">
          {news.url && (
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 text-sm px-2 py-1 bg-purple-600/20 rounded"
            >
              📰 원문 보기 →
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}