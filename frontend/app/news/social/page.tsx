'use client'

import React, { useState, useEffect } from 'react'
import { translateToKorean, translateNewsBody } from '@/lib/translateService'
import { socialSentimentService } from '@/lib/services/socialSentimentService'
import NewsModuleWrapper from '@/app/news/components/NewsModuleWrapper'
import { TrendingUp, TrendingDown, Users, MessageCircle, Heart, Share2, BarChart2, Globe } from 'lucide-react'

export default function SocialNewsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC')
  const [redditMentions, setRedditMentions] = useState<any[]>([])
  const [twitterMentions, setTwitterMentions] = useState<any[]>([])
  const [correlation, setCorrelation] = useState<any>(null)
  const [economicIndicators, setEconomicIndicators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 60000) // 1분마다 갱신
    return () => clearInterval(interval)
  }, [selectedSymbol])

  const fetchAllData = async () => {
    try {
      setLoading(true)

      // Reddit 멘션
      const redditData = await socialSentimentService.fetchRedditMentions([selectedSymbol])
      setRedditMentions(redditData)

      // Twitter 멘션
      const twitterData = await socialSentimentService.fetchTwitterMentions([selectedSymbol])
      setTwitterMentions(twitterData)

      // 상관관계 분석
      const correlationData = await socialSentimentService.analyzeNewsCorrelation(selectedSymbol)
      setCorrelation(correlationData)

      // 경제 지표
      const economicData = await socialSentimentService.fetchEconomicIndicators()
      setEconomicIndicators(economicData)

      setLastUpdate(new Date())
    } catch (error) {
      console.error('데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateOverallSentiment = () => {
    const allMentions = [...redditMentions, ...twitterMentions]
    return socialSentimentService.calculateOverallSentiment(allMentions)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return '방금 전'
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
    return `${Math.floor(diff / 86400)}일 전`
  }

  const symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'DOT']

  return (
    <NewsModuleWrapper moduleName="소셜 감성 분석">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <Globe className="w-6 h-6 text-purple-500" />
                소셜 미디어 & 경제 지표 분석
              </h2>
              <p className="text-gray-400">Reddit, Twitter의 실시간 감성과 경제 지표의 상관관계</p>
            </div>
            <div className="text-sm text-gray-400">
              마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
            </div>
          </div>

          {/* 코인 선택 */}
          <div className="flex gap-2 flex-wrap">
            {symbols.map(symbol => (
              <button
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedSymbol === symbol
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">종합 감성</div>
            <div className={`text-2xl font-bold ${calculateOverallSentiment() > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {calculateOverallSentiment().toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {calculateOverallSentiment() > 0 ? '긍정' : '부정'}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Reddit 멘션</div>
            <div className="text-2xl font-bold text-white">{redditMentions.length}</div>
            <div className="text-xs text-gray-500">최근 24시간</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Twitter 멘션</div>
            <div className="text-2xl font-bold text-white">{twitterMentions.length}</div>
            <div className="text-xs text-gray-500">최근 24시간</div>
          </div>

          {correlation && (
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">가격 상관관계</div>
              <div className="text-2xl font-bold text-purple-400">
                {(correlation.priceCorrelation * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">소셜 vs 가격</div>
            </div>
          )}
        </div>

        {/* Reddit 멘션 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-500" />
            Reddit 실시간 멘션
          </h3>
          <div className="space-y-3">
            {redditMentions.slice(0, 5).map((mention) => (
              <div key={mention.id} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-orange-400">r/{mention.author}</span>
                    <span className="text-xs text-gray-500">{formatTime(mention.timestamp)}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    mention.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                    mention.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {mention.sentiment === 'positive' ? '긍정' :
                     mention.sentiment === 'negative' ? '부정' : '중립'}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{translateNewsBody(mention.content)}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {mention.engagement.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> {mention.engagement.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" /> {mention.engagement.shares}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Twitter 멘션 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            Twitter 실시간 멘션
          </h3>
          <div className="space-y-3">
            {twitterMentions.slice(0, 5).map((mention) => (
              <div key={mention.id} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-400">{mention.author}</span>
                    <span className="text-xs text-gray-500">{formatTime(mention.timestamp)}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    mention.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                    mention.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {mention.sentiment === 'positive' ? '긍정' :
                     mention.sentiment === 'negative' ? '부정' : '중립'}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{translateNewsBody(mention.content)}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {mention.engagement.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> {mention.engagement.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" /> {mention.engagement.shares}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 경제 지표 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-500" />
            경제 지표와 암호화폐 상관관계
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {economicIndicators.map((indicator, idx) => (
              <div key={idx} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">{indicator.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    indicator.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                    indicator.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {indicator.impact === 'high' ? '높음' :
                     indicator.impact === 'medium' ? '중간' : '낮음'}
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-xl font-bold text-white">{indicator.value}</span>
                  <span className={`text-sm ${indicator.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {indicator.change > 0 ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />}
                    {Math.abs(indicator.change)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  암호화폐 상관관계: {(indicator.cryptoCorrelation * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        )}
      </div>
    </NewsModuleWrapper>
  )
}