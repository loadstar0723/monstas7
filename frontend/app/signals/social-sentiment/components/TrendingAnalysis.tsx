'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FaFire, FaHashtag, FaUserCheck, FaChartLine, FaClock } from 'react-icons/fa'
import { FiTrendingUp } from 'react-icons/fi'
import useSocialData from '../hooks/useSocialData'

interface TrendingAnalysisProps {
  coin: string
}

interface ViralPost {
  platform: string
  author: string
  content: string
  likes: number
  retweets: number
  timestamp: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

export default function TrendingAnalysis({ coin }: TrendingAnalysisProps) {
  const { sentimentData } = useSocialData(coin)
  const [viralPosts, setViralPosts] = useState<ViralPost[]>([]) // 실제 소셜 데이터만 사용
  const [volumeSpike, setVolumeSpike] = useState<number>(0)

  useEffect(() => {
    const analyzeVolume = async () => {
      try {
        // 최근 거래량 스파이크 분석
        const tickerResponse = await fetch(`/api/binance/ticker?symbol=${coin}USDT`)
        let currentVolume = 1000000000 // 기본값
        
        if (tickerResponse.ok) {
          const ticker = await tickerResponse.json()
          currentVolume = parseFloat(ticker.quoteVolume || '1000000000')
        }
        
        // 7일 평균 거래량과 비교 (실제로는 히스토리 데이터 필요)
        // 이동평균 거래량 계산을 위해 과거 데이터 필요
        // TODO: Binance API에서 과거 거래량 데이터 가져와서 실제 평균 계산
        setVolumeSpike(0) // 실제 계산 전까지 0

        // TODO: 실제 소셜 미디어 API 연동 필요
        // Twitter API, Reddit API 등을 통해 실제 바이럴 포스트를 가져와야 함
        setViralPosts([]) // 실제 데이터를 받을 때까지 빈 배열
      } catch (error) {
        console.error('거래량 분석 실패:', error)
      }
    }

    analyzeVolume()
    const interval = setInterval(analyzeVolume, 60000)

    return () => clearInterval(interval)
  }, [coin])

  // 시간대별 활동 데이터 - 실제 데이터를 받을 때까지 빈 배열
  const hourlyActivity = sentimentData.sentimentHistory.map((item, index) => ({
    hour: item.time,
    mentions: Math.floor(sentimentData.totalMentions / 24), // 평균값으로 표시
    sentiment: item.score
  }))

  // 키워드 성장률 계산 - 실제 히스토리 데이터 필요
  const keywordGrowth = sentimentData.trendingKeywords.map(kw => ({
    ...kw,
    growth: 0 // TODO: 실제 히스토리 데이터와 비교하여 성장률 계산
  }))

  return (
    <div className="space-y-6">
      {/* 트렌딩 알림 배너 */}
      {volumeSpike > 50 && (
        <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border border-orange-500/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaFire className="text-2xl text-orange-400 animate-pulse" />
            <div>
              <p className="text-orange-300 font-bold">🔥 핫 트렌딩 감지!</p>
              <p className="text-sm text-gray-300">
                거래량이 평균 대비 {volumeSpike.toFixed(0)}% 증가했습니다. 
                소셜 미디어에서 큰 관심을 받고 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <FaHashtag className="text-2xl text-purple-400" />
            <span className="text-xs text-gray-400">트렌딩 키워드</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {sentimentData.trendingKeywords.length}개
          </p>
          <p className="text-sm text-gray-400 mt-1">활발한 토론 진행 중</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <FaUserCheck className="text-2xl text-blue-400" />
            <span className="text-xs text-gray-400">인플루언서 언급</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {sentimentData.influencers.length}명
          </p>
          <p className="text-sm text-gray-400 mt-1">주요 인플루언서 참여</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <FiTrendingUp className="text-2xl text-green-400" />
            <span className="text-xs text-gray-400">멘션 증가율</span>
          </div>
          <p className="text-2xl font-bold text-white">
            +{Math.max(0, volumeSpike).toFixed(0)}%
          </p>
          <p className="text-sm text-gray-400 mt-1">1시간 전 대비</p>
        </div>
      </div>

      {/* 트렌딩 키워드 분석 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaHashtag className="text-purple-400" />
          실시간 트렌딩 키워드
        </h3>
        <div className="space-y-3">
          {keywordGrowth.map((keyword, index) => (
            <div key={keyword.keyword} className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-purple-400">#{index + 1}</span>
                <span className="text-white font-medium">#{keyword.keyword}</span>
                <span className="text-sm text-gray-400">({keyword.count} 멘션)</span>
              </div>
              <div className={`flex items-center gap-2 ${
                keyword.growth > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <FiTrendingUp className={keyword.growth < 0 ? 'rotate-180' : ''} />
                <span className="text-sm font-medium">
                  {keyword.growth > 0 ? '+' : ''}{keyword.growth}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 시간대별 활동 차트 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaClock className="text-blue-400" />
          시간대별 소셜 활동
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={hourlyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="hour" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Bar dataKey="mentions" fill="#A855F7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 바이럴 포스트 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaFire className="text-orange-400" />
          바이럴 포스트
        </h3>
        <div className="space-y-4">
          {viralPosts.map((post, index) => (
            <div key={index} className="p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm text-gray-400">{post.platform}</span>
                  <p className="text-white font-medium">{post.author}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  post.sentiment === 'positive' ? 'bg-green-900 text-green-300' :
                  post.sentiment === 'negative' ? 'bg-red-900 text-red-300' :
                  'bg-yellow-900 text-yellow-300'
                }`}>
                  {post.sentiment === 'positive' ? '긍정' :
                   post.sentiment === 'negative' ? '부정' : '중립'}
                </span>
              </div>
              <p className="text-gray-300 mb-3">{post.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-4">
                  <span>❤️ {post.likes.toLocaleString()}</span>
                  {post.retweets > 0 && <span>🔁 {post.retweets.toLocaleString()}</span>}
                </div>
                <span>{new Date(post.timestamp).toLocaleTimeString('ko-KR')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 인플루언서 추적 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaUserCheck className="text-blue-400" />
          주요 인플루언서 동향
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sentimentData.influencers.map((influencer) => (
            <div key={influencer.name} className="p-4 bg-gray-700/50 rounded-lg text-center">
              <p className="text-white font-medium mb-1">{influencer.name}</p>
              <p className="text-sm text-gray-400 mb-2">
                {influencer.followers.toLocaleString()} 팔로워
              </p>
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                influencer.sentiment === 'BULLISH' ? 'bg-green-900 text-green-300' :
                influencer.sentiment === 'BEARISH' ? 'bg-red-900 text-red-300' :
                'bg-yellow-900 text-yellow-300'
              }`}>
                {influencer.sentiment === 'BULLISH' ? '긍정적' :
                 influencer.sentiment === 'BEARISH' ? '부정적' : '중립'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}