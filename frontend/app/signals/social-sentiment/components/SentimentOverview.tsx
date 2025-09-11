'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { FaTwitter, FaReddit, FaTelegram, FaSmile, FaMeh, FaFrown } from 'react-icons/fa'
import useSocialData from '../hooks/useSocialData'

interface SentimentOverviewProps {
  coin: string
}

export default function SentimentOverview({ coin }: SentimentOverviewProps) {
  const { sentimentData, loading, error } = useSocialData(coin)
  const [priceHistory, setPriceHistory] = useState<any[]>([]) // 실제 API 데이터만 사용
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange24h, setPriceChange24h] = useState(0)

  // 디버깅용 로그
  useEffect(() => {
    console.log('SentimentOverview - sentimentData:', {
      score: sentimentData.sentimentScore,
      historyLength: sentimentData.sentimentHistory?.length,
      firstHistory: sentimentData.sentimentHistory?.[0],
      lastHistory: sentimentData.sentimentHistory?.[sentimentData.sentimentHistory.length - 1],
      positive: sentimentData.positive,
      neutral: sentimentData.neutral,
      negative: sentimentData.negative
    })
  }, [sentimentData])

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        // 현재 가격 정보
        const tickerResponse = await fetch(`/api/binance/ticker?symbol=${coin}USDT`)
        if (tickerResponse.ok) {
          const ticker = await tickerResponse.json()
          setCurrentPrice(parseFloat(ticker.lastPrice || '0'))
          setPriceChange24h(parseFloat(ticker.priceChangePercent || '0'))
        }

        // 24시간 가격 히스토리 (1시간 캔들)
        const klinesResponse = await fetch(`/api/binance/klines?symbol=${coin}USDT&interval=1h&limit=24`)
        if (klinesResponse.ok) {
          const klines = await klinesResponse.json()
          
          const history = klines.map((kline: any[]) => ({
            time: new Date(kline[0]).toLocaleTimeString('ko-KR', { hour: '2-digit' }),
            price: parseFloat(kline[4]),
            volume: parseFloat(kline[5])
          }))

          setPriceHistory(history)
        }
      } catch (error) {
        console.error('가격 데이터 로딩 실패:', error)
      }
    }

    fetchPriceData()
    const interval = setInterval(fetchPriceData, 60000) // 1분마다 업데이트

    return () => clearInterval(interval)
  }, [coin])

  // loading 상태는 무시하고 바로 렌더링

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
        <p className="text-red-400">데이터 로딩 중 오류가 발생했습니다.</p>
      </div>
    )
  }

  // 감성 분포 데이터 (실제 API 데이터 기반)
  const sentimentDistribution = [
    { name: '긍정', value: sentimentData.positive || 33, color: '#10B981' },
    { name: '중립', value: sentimentData.neutral || 34, color: '#F59E0B' },
    { name: '부정', value: sentimentData.negative || 33, color: '#EF4444' }
  ]

  // 플랫폼별 언급 수 (실제 데이터 기반 - API가 제공하면)
  const platformData = [
    { platform: 'Twitter', mentions: sentimentData.twitterMentions || 0, icon: FaTwitter, color: '#1DA1F2' },
    { platform: 'Reddit', mentions: sentimentData.redditPosts || 0, icon: FaReddit, color: '#FF4500' },
    { platform: 'Telegram', mentions: sentimentData.telegramMessages || 0, icon: FaTelegram, color: '#0088CC' }
  ]

  // 감성 점수에 따른 이모지 선택
  const getSentimentEmoji = () => {
    const score = sentimentData.sentimentScore || 0
    if (score > 60) return { icon: FaSmile, color: 'text-green-400' }
    if (score < 40) return { icon: FaFrown, color: 'text-red-400' }
    return { icon: FaMeh, color: 'text-yellow-400' }
  }

  const SentimentEmoji = getSentimentEmoji()

  return (
    <div className="space-y-6">
      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">감성 점수</span>
            <SentimentEmoji.icon className={`text-2xl ${SentimentEmoji.color}`} />
          </div>
          <div className="text-3xl font-bold text-white">
            {sentimentData.sentimentScore || 50}/100
          </div>
          <div className={`text-sm mt-1 ${
            sentimentData.sentimentScore > 50 ? 'text-green-400' : 'text-red-400'
          }`}>
            {sentimentData.sentimentScore > 50 ? '긍정적' : '부정적'} 감성
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">총 언급 수</div>
          <div className="text-3xl font-bold text-white">
            {(sentimentData.totalMentions || 0).toLocaleString()}
          </div>
          <div className="text-sm mt-1 text-gray-400">
            최근 24시간
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">현재 가격</div>
          <div className="text-3xl font-bold text-white">
            ${currentPrice.toLocaleString()}
          </div>
          <div className={`text-sm mt-1 flex items-center ${
            priceChange24h > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {priceChange24h > 0 ? '▲' : '▼'} {Math.abs(priceChange24h).toFixed(2)}%
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">감성 변화율</div>
          <div className="text-3xl font-bold text-white">
            {sentimentData.sentimentChange || 0}%
          </div>
          <div className="text-sm mt-1 text-gray-400">
            24시간 전 대비
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 감성 트렌드 차트 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4">감성 점수 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sentimentData.sentimentHistory || []} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                interval={3}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value: any) => [`${value}점`, '감성 점수']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#A855F7"
                strokeWidth={2}
                dot={{ fill: '#A855F7', r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 감성 분포 차트 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4">감성 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {sentimentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                formatter={(value: any, name: any) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {sentimentDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm text-gray-400">{entry.name}: {entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 플랫폼별 언급 수 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">플랫폼별 활동</h3>
        <div className="space-y-4">
          {platformData.map((platform) => {
            const Icon = platform.icon
            const percentage = sentimentData.totalMentions 
              ? (platform.mentions / sentimentData.totalMentions * 100) 
              : 0

            return (
              <div key={platform.platform}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="text-xl" style={{ color: platform.color }} />
                    <span className="text-gray-300">{platform.platform}</span>
                  </div>
                  <span className="text-white font-medium">
                    {platform.mentions.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: platform.color
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 가격-감성 상관관계 차트 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">가격 vs 감성 상관관계</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis yAxisId="left" stroke="#9CA3AF" />
            <YAxis yAxisId="right" orientation="right" stroke="#A855F7" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="price"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
              name="가격"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="volume"
              stroke="#A855F7"
              fill="#A855F7"
              fillOpacity={0.3}
              name="거래량"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}