'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaExpandAlt, FaCompressAlt, FaExternalLinkAlt, FaLanguage,
  FaRobot, FaChartLine, FaExclamationTriangle, FaBookmark,
  FaShare, FaThumbsUp, FaThumbsDown, FaClock, FaEye,
  FaBell, FaVolumeUp, FaFire, FaArrowUp, FaArrowDown
} from 'react-icons/fa'
import { translationService } from '@/lib/services/translationService'

interface NewsCardProps {
  news: {
    id: string
    title: string
    description: string
    url: string
    source: string
    publishedAt: Date | string
    imageUrl?: string
    categories?: string[]
    relatedCoins?: string[]
    sentiment?: 'positive' | 'negative' | 'neutral'
    trustScore?: number
    importance?: 'high' | 'medium' | 'low'
    aiSummary?: string
    confidence?: number
    impactScore?: number // 영향도 점수
    viewCount?: number
    reactions?: { likes: number; dislikes: number }
  }
  expanded?: boolean
  onExpand?: () => void
  className?: string
}

export default function EnhancedNewsCard({ news, expanded = false, onExpand, className = '' }: NewsCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedContent, setTranslatedContent] = useState<{ title: string; description: string } | null>(null)
  const [showTranslation, setShowTranslation] = useState(true) // 기본 한국어 번역 ON
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null)
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesisUtterance | null>(null)

  // NEW 뱃지 표시 여부 (1시간 이내)
  const isNew = () => {
    const publishedTime = new Date(news.publishedAt).getTime()
    const now = Date.now()
    return now - publishedTime < 60 * 60 * 1000 // 1시간
  }

  // HOT 뱃지 표시 여부 (높은 영향도 또는 조회수)
  const isHot = () => {
    return (news.impactScore && news.impactScore > 80) ||
           (news.viewCount && news.viewCount > 1000) ||
           news.importance === 'high'
  }

  // 번역 기능
  useEffect(() => {
    if (showTranslation && !translatedContent && !isTranslating) {
      translateContent()
    }
  }, [showTranslation])

  const translateContent = async () => {
    if (translatedContent || isTranslating) return

    setIsTranslating(true)
    try {
      const [translatedTitle, translatedDesc] = await Promise.all([
        translationService.translateToKorean(news.title),
        translationService.translateToKorean(news.description)
      ])

      setTranslatedContent({
        title: translatedTitle,
        description: translatedDesc
      })
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  // 음성 읽기 기능
  const handleTextToSpeech = () => {
    if (speechSynthesis) {
      window.speechSynthesis.cancel()
      setSpeechSynthesis(null)
      return
    }

    const text = showTranslation && translatedContent
      ? `${translatedContent.title}. ${translatedContent.description}`
      : `${news.title}. ${news.description}`

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = showTranslation ? 'ko-KR' : 'en-US'
    utterance.rate = 0.9

    window.speechSynthesis.speak(utterance)
    setSpeechSynthesis(utterance)

    utterance.onend = () => setSpeechSynthesis(null)
  }

  // 감성 색상
  const getSentimentColor = () => {
    switch (news.sentiment) {
      case 'positive': return 'text-green-400 bg-green-500/20'
      case 'negative': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  // 중요도 색상
  const getImportanceColor = () => {
    switch (news.importance) {
      case 'high': return 'border-red-500/50 bg-red-500/10'
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10'
      default: return 'border-gray-700/50'
    }
  }

  // 영향도 표시
  const getImpactIndicator = () => {
    if (!news.impactScore) return null

    if (news.impactScore > 70) {
      return <FaArrowUp className="text-red-500" />
    } else if (news.impactScore > 30) {
      return <FaArrowUp className="text-yellow-500" />
    } else {
      return <FaArrowDown className="text-green-500" />
    }
  }

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    const now = Date.now()
    const diff = now - d.getTime()

    if (diff < 60000) return '방금 전'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`
    return d.toLocaleDateString('ko-KR')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border ${getImportanceColor()} p-4 hover:bg-gray-800/70 transition-all ${className}`}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* 뱃지들 */}
          <div className="flex items-center gap-2 mb-2">
            {isNew() && (
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full flex items-center gap-1"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                NEW
              </motion.span>
            )}

            {isHot() && (
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full flex items-center gap-1">
                <FaFire className="animate-pulse" />
                HOT
              </span>
            )}

            {news.categories?.map(cat => (
              <span key={cat} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {cat}
              </span>
            ))}

            {/* 감성 표시 */}
            <span className={`px-2 py-1 text-xs rounded-full ${getSentimentColor()}`}>
              {news.sentiment === 'positive' ? '📈' : news.sentiment === 'negative' ? '📉' : '➡️'}
            </span>

            {/* 영향도 표시 */}
            {news.impactScore && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                {getImpactIndicator()}
                {news.impactScore}%
              </span>
            )}
          </div>

          {/* 제목 */}
          <h3 className="text-lg font-bold text-white mb-2">
            {showTranslation && translatedContent ? translatedContent.title : news.title}
            {isTranslating && <span className="ml-2 text-xs text-gray-400">번역 중...</span>}
          </h3>

          {/* 메타 정보 */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <FaClock />
              {formatTime(news.publishedAt)}
            </span>
            <span>{news.source}</span>
            {news.trustScore && (
              <span className="flex items-center gap-1">
                신뢰도:
                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                    style={{ width: `${news.trustScore}%` }}
                  />
                </div>
                {news.trustScore}%
              </span>
            )}
            {news.viewCount && (
              <span className="flex items-center gap-1">
                <FaEye />
                {news.viewCount.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* 이미지 */}
        {news.imageUrl && (
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-20 h-20 rounded-lg object-cover ml-4"
          />
        )}
      </div>

      {/* 설명 */}
      <p className={`text-gray-300 mb-3 ${isExpanded ? '' : 'line-clamp-2'}`}>
        {showTranslation && translatedContent ? translatedContent.description : news.description}
      </p>

      {/* AI 분석 섹션 */}
      {news.aiSummary && showAIAnalysis && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-purple-500/10 rounded-lg p-3 mb-3 border border-purple-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <FaRobot className="text-purple-400" />
            <span className="text-sm font-semibold text-purple-400">AI 분석</span>
            {news.confidence && (
              <span className="text-xs text-gray-400">신뢰도: {news.confidence}%</span>
            )}
          </div>
          <p className="text-sm text-gray-300">{news.aiSummary}</p>
        </motion.div>
      )}

      {/* 관련 코인 */}
      {news.relatedCoins && news.relatedCoins.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400">관련 코인:</span>
          {news.relatedCoins.map(coin => (
            <span key={coin} className="px-2 py-1 bg-gray-700/50 text-xs text-yellow-400 rounded-full">
              {coin}
            </span>
          ))}
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
        <div className="flex items-center gap-2">
          {/* 번역 토글 */}
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`p-2 rounded-lg transition-colors ${
              showTranslation ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700/50 text-gray-400'
            } hover:bg-gray-700`}
            title={showTranslation ? '원문 보기' : '한국어 번역'}
          >
            <FaLanguage />
          </button>

          {/* 음성 읽기 */}
          <button
            onClick={handleTextToSpeech}
            className={`p-2 rounded-lg transition-colors ${
              speechSynthesis ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400'
            } hover:bg-gray-700`}
            title="음성 읽기"
          >
            <FaVolumeUp />
          </button>

          {/* AI 분석 토글 */}
          {news.aiSummary && (
            <button
              onClick={() => setShowAIAnalysis(!showAIAnalysis)}
              className={`p-2 rounded-lg transition-colors ${
                showAIAnalysis ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700/50 text-gray-400'
              } hover:bg-gray-700`}
              title="AI 분석"
            >
              <FaRobot />
            </button>
          )}

          {/* 북마크 */}
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700/50 text-gray-400'
            } hover:bg-gray-700`}
            title="북마크"
          >
            <FaBookmark />
          </button>

          {/* 확대/축소 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-gray-700/50 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
            title={isExpanded ? '접기' : '펼치기'}
          >
            {isExpanded ? <FaCompressAlt /> : <FaExpandAlt />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* 반응 버튼 */}
          {news.reactions && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUserReaction(userReaction === 'like' ? null : 'like')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                  userReaction === 'like' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-green-400'
                }`}
              >
                <FaThumbsUp />
                <span className="text-xs">{news.reactions.likes}</span>
              </button>
              <button
                onClick={() => setUserReaction(userReaction === 'dislike' ? null : 'dislike')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                  userReaction === 'dislike' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-red-400'
                }`}
              >
                <FaThumbsDown />
                <span className="text-xs">{news.reactions.dislikes}</span>
              </button>
            </div>
          )}

          {/* 원문 링크 */}
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FaExternalLinkAlt />
            <span className="text-xs">원문</span>
          </a>
        </div>
      </div>
    </motion.div>
  )
}