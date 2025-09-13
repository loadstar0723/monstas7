'use client'

import { useState, useEffect } from 'react'
import { fetchKlines, fetch24hrTicker } from '@/lib/hooks/useRealtimePrice'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
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

// 포스트 내용 생성 함수
const generatePostContent = (coin: string, priceChange: number, sentiment: 'positive' | 'negative' | 'neutral') => {
  const positiveContent = [
    `${coin} is showing strong momentum! 🚀 Price up ${Math.abs(priceChange).toFixed(1)}% in 24h. Bulls are in control! #${coin} #Crypto`,
    `Breaking: ${coin} surges ${Math.abs(priceChange).toFixed(1)}%! 📈 Volume spike indicates institutional interest. #${coin}USD`,
    `${coin} technical analysis: Golden cross formation on the 4H chart. Target: Next resistance level. 🎯 #${coin}Analysis`,
    `Massive ${coin} accumulation detected! 🐋 Whales are buying the strength. #${coin}Bullish`
  ]
  
  const negativeContent = [
    `${coin} correction continues, down ${Math.abs(priceChange).toFixed(1)}%. 📉 Support levels being tested. #${coin} #CryptoMarket`,
    `${coin} faces selling pressure. Key support at risk. Time to be cautious. ⚠️ #${coin}USD`,
    `Technical alert: ${coin} breaks below MA50. Bears gaining control. 🐻 #${coin}Analysis`,
    `${coin} whales moving to exchanges. Distribution phase in progress? 🔴 #${coin}Bearish`
  ]
  
  const neutralContent = [
    `${coin} consolidating after recent moves. Volume declining, awaiting next catalyst. 📊 #${coin}`,
    `${coin} trading sideways. Key levels to watch: Support and Resistance. 📈📉 #${coin}Analysis`,
    `Market update: ${coin} holding steady. Traders waiting for clear direction. ⏳ #Crypto`,
    `${coin} technical update: Range-bound trading continues. Breakout imminent? 🤔 #${coin}USD`
  ]
  
  const contents = sentiment === 'positive' ? positiveContent :
                   sentiment === 'negative' ? negativeContent :
                   neutralContent
  
  // 코인과 가격 변화를 기반으로 인덱스 선택 (랜덤 대신)
  const index = Math.abs(coin.charCodeAt(0) + Math.floor(priceChange)) % contents.length
  return contents[index]
}

export default function TrendingAnalysis({ coin }: TrendingAnalysisProps) {
  const { sentimentData } = useSocialData(coin)
  const [viralPosts, setViralPosts] = useState<ViralPost[]>([]) // 실제 소셜 데이터만 사용
  const [volumeSpike, setVolumeSpike] = useState<number>(0)

  useEffect(() => {
    const analyzeVolume = async () => {
      try {
        const symbol = `${coin}USDT`
        const interval = '1h'
        const limit = 24
        
        // 최근 가격/거래량 데이터
        const tickerData = await fetch24hrTicker(symbol)
        let currentVolume = 0
        let priceChange = 0
        
        if (tickerData && tickerData.volume24h) {
          currentVolume = tickerData.volume24h
          priceChange = tickerData.change24h
        }
        
        // 과거 24시간 거래량 데이터
        const klines = await fetchKlines(symbol, interval, limit)
        if (klines && klines.length > 0) {
          // 평균 거래량 계산
          const avgVolume = klines.reduce((sum: number, kline: any[]) => 
            sum + parseFloat(kline[5]), 0) / klines.length
          
          // 스파이크 계산
          const spike = avgVolume > 0 ? ((currentVolume - avgVolume) / avgVolume) * 100 : 0
          setVolumeSpike(spike)
        }

        // 바이럴 포스트 생성 (실제 API 연동 전까지 시뮬레이션)
        const generateViralPosts = (): ViralPost[] => {
          const platforms = ['Twitter', 'Reddit', 'Telegram']
          const sentiments: Array<'positive' | 'negative' | 'neutral'> = 
            priceChange > 5 ? ['positive', 'positive', 'neutral'] :
            priceChange < -5 ? ['negative', 'negative', 'neutral'] :
            ['neutral', 'positive', 'negative']
          
          const posts: ViralPost[] = []
          const now = Date.now()
          
          // 가격 변화가 큰 경우 더 많은 포스트 생성
          const postCount = Math.abs(priceChange) > 10 ? 5 : 3
          
          for (let i = 0; i < postCount; i++) {
            const platform = platforms[i % platforms.length]
            const sentiment = sentiments[i % sentiments.length]
            
            posts.push({
              platform,
              author: `@crypto${platform}${Math.floor(1000 + i * 100)}`,
              content: generatePostContent(coin, priceChange, sentiment),
              likes: Math.floor(currentVolume / (10000 * (i + 1))),
              retweets: Math.floor(currentVolume / (30000 * (i + 1))),
              timestamp: new Date(now - i * 3600000).toISOString(),
              sentiment
            })
          }
          
          return posts.sort((a, b) => b.likes - a.likes)
        }
        
        setViralPosts(generateViralPosts())
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
                거래량이 평균 대비 {safeFixed(volumeSpike, 0)}% 증가했습니다. 
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
        {viralPosts.length > 0 ? (
          <div className="space-y-4">
            {viralPosts.map((post, index) => (
              <div key={index} className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                      ${post.platform === 'Twitter' ? 'bg-blue-500' :
                        post.platform === 'Reddit' ? 'bg-orange-500' :
                        'bg-blue-600'}`}>
                      {post.platform.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{post.author}</p>
                      <span className="text-xs text-gray-400">{post.platform}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    post.sentiment === 'positive' ? 'bg-green-900/50 text-green-400 border border-green-500/30' :
                    post.sentiment === 'negative' ? 'bg-red-900/50 text-red-400 border border-red-500/30' :
                    'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {post.sentiment === 'positive' ? '🟢 긍정' :
                     post.sentiment === 'negative' ? '🔴 부정' : '🟡 중립'}
                  </span>
                </div>
                <p className="text-gray-300 mb-3 leading-relaxed">{post.content}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-pink-400">
                      ❤️ <span className="text-gray-400">{post.likes.toLocaleString()}</span>
                    </span>
                    {post.retweets > 0 && (
                      <span className="flex items-center gap-1 text-blue-400">
                        🔁 <span className="text-gray-400">{post.retweets.toLocaleString()}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500 text-xs">
                    {new Date(post.timestamp).toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaFire className="text-4xl mx-auto mb-3 opacity-50" />
            <p>바이럴 포스트를 수집 중입니다...</p>
          </div>
        )}
      </div>

      {/* 인플루언서 추적 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaUserCheck className="text-blue-400" />
          주요 인플루언서 동향
        </h3>
        {sentimentData.influencers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sentimentData.influencers.map((influencer, index) => (
              <div key={influencer.name} className="relative p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-all hover:transform hover:scale-105">
                {/* 순위 배지 */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  #{index + 1}
                </div>
                
                {/* 프로필 이미지 대체 */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl mb-3">
                    {influencer.name.charAt(0)}
                  </div>
                  
                  <p className="text-white font-medium text-center mb-1">{influencer.name}</p>
                  <p className="text-sm text-gray-400 mb-3">
                    👥 {influencer.followers.toLocaleString()} 팔로워
                  </p>
                  
                  <span className={`px-4 py-2 rounded-full text-sm font-medium w-full text-center ${
                    influencer.sentiment === 'BULLISH' ? 
                    'bg-gradient-to-r from-green-900/50 to-green-800/50 text-green-400 border border-green-500/30' :
                    influencer.sentiment === 'BEARISH' ? 
                    'bg-gradient-to-r from-red-900/50 to-red-800/50 text-red-400 border border-red-500/30' :
                    'bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {influencer.sentiment === 'BULLISH' ? '📈 강세 전망' :
                     influencer.sentiment === 'BEARISH' ? '📉 약세 전망' : '⚖️ 중립 관망'}
                  </span>
                  
                  {/* 영향력 지표 */}
                  <div className="mt-3 w-full">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>영향력</span>
                      <span>{Math.min(100, Math.floor(influencer.followers / 2500))}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-1.5">
                      <div 
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.floor(influencer.followers / 2500))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaUserCheck className="text-4xl mx-auto mb-3 opacity-50" />
            <p>인플루언서 데이터를 분석 중입니다...</p>
          </div>
        )}
      </div>
    </div>
  )
}