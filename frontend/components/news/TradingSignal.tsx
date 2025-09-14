'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TradingSignal, MarketSentiment, SocialSentiment } from '@/lib/services/aiAnalysisService'
import { aiAnalysisService } from '@/lib/services/aiAnalysisService'

interface TradingSignalProps {
  newsId: string
  newsTitle: string
  newsCategory: string
  currentPrice: number
  symbol: string
}

export default function TradingSignalComponent({
  newsId,
  newsTitle,
  newsCategory,
  currentPrice,
  symbol
}: TradingSignalProps) {
  const [signal, setSignal] = useState<TradingSignal | null>(null)
  const [socialSentiment, setSocialSentiment] = useState<SocialSentiment | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    loadSignalData()
  }, [newsId, currentPrice])

  const loadSignalData = async () => {
    setLoading(true)
    try {
      // AI 시그널 생성
      const tradingSignal = await aiAnalysisService.generateTradingSignal(
        {
          id: newsId,
          title: newsTitle,
          description: newsTitle,
          category: newsCategory,
          relatedCoins: [symbol],
          publishedAt: new Date().toISOString(),
          source: { name: 'Analysis' },
          url: '#',
          tags: []
        },
        currentPrice
      )

      // 소셜 센티먼트 가져오기
      const social = await aiAnalysisService.getSocialSentiment(symbol)

      setSignal(tradingSignal)
      setSocialSentiment(social)
    } catch (error) {
      console.error('Signal loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'long': return 'text-green-400 bg-green-500/20'
      case 'short': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'long': return '📈'
      case 'short': return '📉'
      default: return '➡️'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    if (confidence >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case 'short': return '단기 (1-24시간)'
      case 'medium': return '중기 (1-7일)'
      case 'long': return '장기 (1개월+)'
      default: return '중기'
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-800/50 rounded-lg p-4">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    )
  }

  if (!signal) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800/50 to-purple-900/20 rounded-xl p-4 border border-purple-500/30"
    >
      {/* 헤더 - 기본 시그널 정보 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* 방향성 표시 */}
          <div className={`px-3 py-1 rounded-lg font-bold ${getDirectionColor(signal.direction)}`}>
            <span className="text-lg mr-1">{getDirectionIcon(signal.direction)}</span>
            {signal.direction.toUpperCase()}
          </div>

          {/* 신뢰도 */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">신뢰도:</span>
            <span className={`font-bold text-lg ${getConfidenceColor(signal.confidence)}`}>
              {signal.confidence}%
            </span>
          </div>

          {/* 시간대 */}
          <div className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-400">
            {getTimeframeLabel(signal.timeframe)}
          </div>
        </div>

        {/* 확장/축소 버튼 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {expanded ? '🔼' : '🔽'}
        </button>
      </div>

      {/* 가격 정보 */}
      {signal.entryPrice && (
        <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
          <div className="bg-gray-800/50 rounded p-2">
            <span className="text-gray-500 text-xs block">진입가</span>
            <span className="text-white font-medium">
              ${signal.entryPrice.toLocaleString()}
            </span>
          </div>
          <div className="bg-red-900/30 rounded p-2">
            <span className="text-gray-500 text-xs block">손절가</span>
            <span className="text-red-400 font-medium">
              ${signal.stopLoss?.toLocaleString()}
            </span>
          </div>
          <div className="bg-green-900/30 rounded p-2">
            <span className="text-gray-500 text-xs block">목표가</span>
            <span className="text-green-400 font-medium">
              ${signal.takeProfit?.toLocaleString()}
            </span>
          </div>
          <div className="bg-purple-900/30 rounded p-2">
            <span className="text-gray-500 text-xs block">R:R</span>
            <span className="text-purple-400 font-medium">
              1:{signal.riskReward?.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* 확장 섹션 */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-700 pt-3 mt-3 space-y-3"
        >
          {/* 추론 근거 */}
          {signal.reasoning.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">📊 분석 근거</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                {signal.reasoning.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 소셜 센티먼트 */}
          {socialSentiment && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">💬 소셜 센티먼트</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-800/50 rounded p-2">
                  <span className="text-gray-500 block">Twitter</span>
                  <span className="text-blue-400 font-medium">
                    {socialSentiment.twitterMentions.toLocaleString()} 멘션
                  </span>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <span className="text-gray-500 block">Reddit</span>
                  <span className="text-orange-400 font-medium">
                    {socialSentiment.redditPosts} 포스트
                  </span>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <span className="text-gray-500 block">버즈 스코어</span>
                  <span className="text-purple-400 font-medium">
                    {socialSentiment.buzzScore}/100
                  </span>
                </div>
              </div>

              {/* 바이럴 가능성 */}
              {socialSentiment.viralProbability > 30 && (
                <div className="mt-2 px-3 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <span className="text-yellow-400 text-xs font-medium">
                    ⚡ 바이럴 가능성: {socialSentiment.viralProbability}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 투자 전략 제안 */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">💡 전략 제안</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">권장 포지션 크기:</span>
                <span className="text-white">
                  자본금의 {signal.confidence > 80 ? '10%' : signal.confidence > 60 ? '7%' : '5%'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">권장 레버리지:</span>
                <span className="text-white">
                  {signal.confidence > 80 ? '3x' : signal.confidence > 60 ? '2x' : '1x'}
                </span>
              </div>
              {signal.direction === 'neutral' && (
                <div className="text-xs text-yellow-400 mt-2">
                  ⚠️ 중립 신호: 그리드 트레이딩 또는 관망 권장
                </div>
              )}
            </div>
          </div>

          {/* 리스크 경고 */}
          {signal.confidence < 60 && (
            <div className="px-3 py-2 bg-red-500/20 rounded-lg border border-red-500/30">
              <span className="text-red-400 text-xs">
                ⚠️ 낮은 신뢰도: 신중한 접근 필요
              </span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}