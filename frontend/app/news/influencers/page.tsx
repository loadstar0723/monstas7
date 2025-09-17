'use client'

import { useState, useEffect } from 'react'
import { translateToKorean, translateNewsBody } from '@/lib/translateService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Twitter, Users, TrendingUp, AlertCircle, Eye, MessageCircle, Heart, Share2, Target, ChevronUp, ChevronDown, ExternalLink, Verified, Bell, Star, Filter, Search } from 'lucide-react'
import NewsModuleWrapper from '../components/NewsModuleWrapper'

interface Influencer {
  id: string
  name: string
  handle: string
  platform: 'twitter' | 'youtube' | 'telegram'
  followers: number
  verified: boolean
  engagementRate: number
  sentiment: number
  influence: 'high' | 'medium' | 'low'
  topics: string[]
  recentPosts: Post[]
  mentionedCoins: CoinMention[]
  accuracy: number
  avatar: string
}

interface Post {
  id: string
  content: string
  timestamp: Date
  likes: number
  retweets: number
  comments: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  coins: string[]
}

interface CoinMention {
  symbol: string
  count: number
  sentiment: number
  impact: number
}

export default function InfluencersNewsModule() {
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null)
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'followers' | 'engagement' | 'accuracy'>('followers')
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h')

  // 인플루언서 목록 데이터
  const influencers: Influencer[] = [
    {
      id: '1',
      name: 'CryptoPunk',
      handle: '@cryptopunk',
      platform: 'twitter',
      followers: 1234567,
      verified: true,
      engagementRate: 8.5,
      sentiment: 72,
      influence: 'high',
      topics: ['BTC', 'ETH', 'DeFi'],
      recentPosts: [],
      mentionedCoins: [
        { symbol: 'BTC', count: 45, sentiment: 85, impact: 92 },
        { symbol: 'ETH', count: 32, sentiment: 78, impact: 85 },
        { symbol: 'SOL', count: 28, sentiment: 65, impact: 72 }
      ],
      accuracy: 78,
      avatar: '🦅'
    },
    {
      id: '2',
      name: 'Whale Alert',
      handle: '@whale_alert',
      platform: 'twitter',
      followers: 2456789,
      verified: true,
      engagementRate: 12.3,
      sentiment: 68,
      influence: 'high',
      topics: ['Whale Tracking', 'On-chain'],
      recentPosts: [],
      mentionedCoins: [
        { symbol: 'BTC', count: 120, sentiment: 70, impact: 95 },
        { symbol: 'USDT', count: 85, sentiment: 60, impact: 88 }
      ],
      accuracy: 92,
      avatar: '🐋'
    },
    {
      id: '3',
      name: 'DeFi Master',
      handle: '@defimaster',
      platform: 'youtube',
      followers: 567890,
      verified: false,
      engagementRate: 6.7,
      sentiment: 75,
      influence: 'medium',
      topics: ['DeFi', 'Yield Farming', 'NFT'],
      recentPosts: [],
      mentionedCoins: [
        { symbol: 'AAVE', count: 35, sentiment: 82, impact: 78 },
        { symbol: 'UNI', count: 28, sentiment: 75, impact: 72 }
      ],
      accuracy: 71,
      avatar: '🎯'
    }
  ]

  // 플랫폼별 통계
  const platformStats = [
    { platform: 'Twitter', count: 145, color: '#1DA1F2' },
    { platform: 'YouTube', count: 67, color: '#FF0000' },
    { platform: 'Telegram', count: 89, color: '#0088cc' }
  ]

  // 영향력 분포
  const influenceDistribution = [
    { level: 'High', count: 23, percentage: 15 },
    { level: 'Medium', count: 78, percentage: 52 },
    { level: 'Low', count: 49, percentage: 33 }
  ]

  // 실시간 트렌드
  const trendingTopics = [
    { topic: 'Bitcoin ETF', mentions: 2345, change: 234 },
    { topic: 'Ethereum 2.0', mentions: 1876, change: -123 },
    { topic: 'AI Tokens', mentions: 1543, change: 456 },
    { topic: 'Layer 2', mentions: 1234, change: 89 },
    { topic: 'Staking', mentions: 987, change: -45 }
  ]

  // 센티먼트 추이
  const sentimentTrend = [
    { time: '00:00', bullish: 45, bearish: 30, neutral: 25 },
    { time: '04:00', bullish: 48, bearish: 28, neutral: 24 },
    { time: '08:00', bullish: 52, bearish: 25, neutral: 23 },
    { time: '12:00', bullish: 58, bearish: 22, neutral: 20 },
    { time: '16:00', bullish: 55, bearish: 24, neutral: 21 },
    { time: '20:00', bullish: 60, bearish: 20, neutral: 20 }
  ]

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']

  return (
    <NewsModuleWrapper moduleName="InfluencersNewsModule">
      <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{translateToKorean("인플루언서 추적")}</h1>
          <p className="text-gray-400">{translateNewsBody("주요 크립토 인플루언서들의 실시간 동향과 영향력 분석")}</p>
        </div>

        {/* 필터 및 정렬 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                <Button
                  variant={filterPlatform === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterPlatform('all')}
                  size="sm"
                >
                  전체
                </Button>
                <Button
                  variant={filterPlatform === 'twitter' ? 'default' : 'outline'}
                  onClick={() => setFilterPlatform('twitter')}
                  size="sm"
                >
                  Twitter
                </Button>
                <Button
                  variant={filterPlatform === 'youtube' ? 'default' : 'outline'}
                  onClick={() => setFilterPlatform('youtube')}
                  size="sm"
                >
                  YouTube
                </Button>
                <Button
                  variant={filterPlatform === 'telegram' ? 'default' : 'outline'}
                  onClick={() => setFilterPlatform('telegram')}
                  size="sm"
                >
                  Telegram
                </Button>
              </div>
              <div className="flex gap-2 ml-auto">
                <select
                  className="bg-gray-800 border-gray-700 rounded px-3 py-1 text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="followers">팔로워순</option>
                  <option value="engagement">참여율순</option>
                  <option value="accuracy">정확도순</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 주요 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">추적 인플루언서</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold">301</div>
              <div className="text-xs text-green-400">+12 이번주</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">평균 정확도</span>
                <Target className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold">73.8%</div>
              <div className="text-xs text-green-400">+2.3% 상승</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">총 팔로워</span>
                <Eye className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold">45.2M</div>
              <div className="text-xs text-gray-400">3개 플랫폼</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">평균 참여율</span>
                <MessageCircle className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold">8.7%</div>
              <div className="text-xs text-red-400">-0.5% 하락</div>
            </CardContent>
          </Card>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 인플루언서 목록 */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="w-5 h-5" />
                  Top 인플루언서
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {influencers.map((influencer) => (
                  <div
                    key={influencer.id}
                    className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => setSelectedInfluencer(influencer.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{influencer.avatar}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{influencer.name}</span>
                            {influencer.verified && <Verified className="w-4 h-4 text-blue-400" />}
                          </div>
                          <div className="text-sm text-gray-400">{influencer.handle}</div>
                        </div>
                      </div>
                      <Badge variant={influencer.influence === 'high' ? 'default' : 'secondary'}>
                        {influencer.influence.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">팔로워</div>
                        <div className="font-semibold">
                          {influencer.followers > 1000000
                            ? `${(influencer.followers / 1000000).toFixed(1)}M`
                            : `${(influencer.followers / 1000).toFixed(0)}K`}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">참여율</div>
                        <div className="font-semibold">{influencer.engagementRate}%</div>
                      </div>
                      <div>
                        <div className="text-gray-400">센티먼트</div>
                        <div className={`font-semibold ${influencer.sentiment > 60 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {influencer.sentiment}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">정확도</div>
                        <div className="font-semibold">{influencer.accuracy}%</div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {influencer.topics.map((topic, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-700 rounded text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>

                    {influencer.mentionedCoins.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="text-sm text-gray-400 mb-2">최근 언급 코인</div>
                        <div className="flex gap-3">
                          {influencer.mentionedCoins.slice(0, 3).map((coin) => (
                            <div key={coin.symbol} className="flex items-center gap-2">
                              <span className="font-semibold">{coin.symbol}</span>
                              <span className="text-xs text-gray-400">({coin.count}회)</span>
                              <span className={`text-xs ${coin.sentiment > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {coin.sentiment > 70 ? '↑' : '→'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 통계 */}
          <div className="space-y-6">
            {/* 플랫폼 분포 */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-sm">플랫폼 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={platformStats}
                      dataKey="count"
                      nameKey="platform"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    >
                      {platformStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 트렌딩 토픽 */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  트렌딩 토픽
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.map((topic, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{topic.topic}</div>
                      <div className="text-xs text-gray-400">{topic.mentions} 언급</div>
                    </div>
                    <div className={`text-sm ${topic.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {topic.change > 0 ? '+' : ''}{topic.change}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 영향력 분포 */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-sm">영향력 분포</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {influenceDistribution.map((level) => (
                  <div key={level.level}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{level.level}</span>
                      <span>{level.count} ({level.percentage}%)</span>
                    </div>
                    <Progress value={level.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 센티먼트 분석 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>센티먼트 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sentimentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Line type="monotone" dataKey="bullish" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="bearish" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="neutral" stroke="#6b7280" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 실시간 알림 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              실시간 알림
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-800 rounded-lg flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">CryptoPunk가 BTC를 언급했습니다</div>
                <div className="text-xs text-gray-400">2분 전 • 센티먼트: 매우 긍정적</div>
              </div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Whale Alert가 대규모 이체를 감지했습니다</div>
                <div className="text-xs text-gray-400">5분 전 • 1,000 BTC 이동</div>
              </div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg flex items-start gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">DeFi Master가 위험 경고를 발표했습니다</div>
                <div className="text-xs text-gray-400">15분 전 • 특정 프로토콜 주의</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
      </NewsModuleWrapper>
  )}
