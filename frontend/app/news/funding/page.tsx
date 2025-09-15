'use client'

import { useState, useEffect } from 'react'
import { translateToKorean, translateNewsBody } from '@/lib/translateService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { DollarSign, TrendingUp, Building2, Briefcase, PiggyBank, Rocket, AlertCircle, ChevronUp, ChevronDown, ExternalLink, Calendar, Users, Globe, Award } from 'lucide-react'
import NewsModuleWrapper from '../components/NewsModuleWrapper'

interface FundingRound {
  id: string
  project: string
  category: string
  amount: number
  round: string
  investors: string[]
  date: Date
  valuation?: number
  description: string
  logo: string
  change24h?: number
}

interface Investor {
  name: string
  type: 'VC' | 'Angel' | 'Corporate' | 'DAO'
  totalInvested: number
  deals: number
  focusAreas: string[]
  portfolio: string[]
}

export default function FundingNewsModule() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const [viewMode, setViewMode] = useState<'rounds' | 'investors' | 'trends'>('rounds')

  // 최근 펀딩 라운드
  const recentFundings: FundingRound[] = [
    {
      id: '1',
      project: 'LayerZero',
      category: 'Infrastructure',
      amount: 120000000,
      round: 'Series B',
      investors: ['a16z', 'Sequoia', 'FTX Ventures'],
      date: new Date('2024-01-15'),
      valuation: 3000000000,
      description: '크로스체인 메시징 프로토콜',
      logo: '🌉',
      change24h: 15.5
    },
    {
      id: '2',
      project: 'Magic Eden',
      category: 'NFT',
      amount: 130000000,
      round: 'Series B',
      investors: ['Electric Capital', 'Greylock'],
      date: new Date('2024-01-12'),
      valuation: 1600000000,
      description: '멀티체인 NFT 마켓플레이스',
      logo: '🎨',
      change24h: 8.3
    },
    {
      id: '3',
      project: 'Fuel Labs',
      category: 'Layer 2',
      amount: 80000000,
      round: 'Series A',
      investors: ['Blockchain Capital', 'CoinFund'],
      date: new Date('2024-01-10'),
      description: '고성능 모듈러 실행 레이어',
      logo: '⚡',
      change24h: -2.1
    },
    {
      id: '4',
      project: 'Backpack',
      category: 'Wallet',
      amount: 17000000,
      round: 'Seed',
      investors: ['Placeholder', 'Coral DeFi'],
      date: new Date('2024-01-08'),
      description: '차세대 크립토 지갑',
      logo: '🎒',
      change24h: 12.7
    }
  ]

  // 투자자 통계
  const topInvestors: Investor[] = [
    {
      name: 'a16z Crypto',
      type: 'VC',
      totalInvested: 7500000000,
      deals: 145,
      focusAreas: ['Infrastructure', 'DeFi', 'Gaming'],
      portfolio: ['Uniswap', 'Solana', 'Avalanche']
    },
    {
      name: 'Paradigm',
      type: 'VC',
      totalInvested: 5200000000,
      deals: 98,
      focusAreas: ['DeFi', 'Infrastructure', 'MEV'],
      portfolio: ['Uniswap', 'Optimism', 'Flashbots']
    },
    {
      name: 'Coinbase Ventures',
      type: 'Corporate',
      totalInvested: 3800000000,
      deals: 256,
      focusAreas: ['Infrastructure', 'DeFi', 'Web3'],
      portfolio: ['Compound', 'BlockFi', 'Etherscan']
    }
  ]

  // 카테고리별 펀딩 분포
  const categoryDistribution = [
    { category: 'DeFi', amount: 2340, count: 89, color: '#3b82f6' },
    { category: 'Infrastructure', amount: 1890, count: 67, color: '#10b981' },
    { category: 'Gaming', amount: 1560, count: 123, color: '#f59e0b' },
    { category: 'NFT', amount: 980, count: 78, color: '#8b5cf6' },
    { category: 'Layer 2', amount: 750, count: 45, color: '#ef4444' }
  ]

  // 월별 펀딩 추이
  const monthlyTrend = [
    { month: 'Aug', amount: 1200, deals: 45 },
    { month: 'Sep', amount: 1450, deals: 52 },
    { month: 'Oct', amount: 980, deals: 38 },
    { month: 'Nov', amount: 1680, deals: 61 },
    { month: 'Dec', amount: 2100, deals: 73 },
    { month: 'Jan', amount: 1850, deals: 68 }
  ]

  // 라운드별 통계
  const roundStats = [
    { round: 'Pre-Seed', avgAmount: 1.5, count: 234 },
    { round: 'Seed', avgAmount: 5.2, count: 156 },
    { round: 'Series A', avgAmount: 25.8, count: 89 },
    { round: 'Series B', avgAmount: 68.5, count: 45 },
    { round: 'Series C+', avgAmount: 150.3, count: 23 }
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

  const formatAmount = (amount: number) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount}`
  }

  return (
    <NewsModuleWrapper moduleName="FundingNewsModule">
      <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{translateToKorean("펀딩 뉴스")}</h1>
          <p className="text-gray-400">{translateNewsBody("크립토 프로젝트 투자 및 펀딩 라운드 실시간 추적")}</p>
        </div>

        {/* 뷰 모드 선택 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={viewMode === 'rounds' ? 'default' : 'outline'}
            onClick={() => setViewMode('rounds')}
            size="sm"
          >
            펀딩 라운드
          </Button>
          <Button
            variant={viewMode === 'investors' ? 'default' : 'outline'}
            onClick={() => setViewMode('investors')}
            size="sm"
          >
            투자자
          </Button>
          <Button
            variant={viewMode === 'trends' ? 'default' : 'outline'}
            onClick={() => setViewMode('trends')}
            size="sm"
          >
            트렌드
          </Button>
        </div>

        {/* 주요 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">이번 주 총 펀딩</span>
                <DollarSign className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold">$458M</div>
              <div className="text-xs text-green-400">+23% vs 지난주</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">펀딩 라운드</span>
                <Briefcase className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold">27</div>
              <div className="text-xs text-gray-400">이번 주</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">평균 라운드 규모</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold">$17M</div>
              <div className="text-xs text-green-400">+8% 상승</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">활성 투자자</span>
                <Building2 className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold">142</div>
              <div className="text-xs text-gray-400">이번 달</div>
            </CardContent>
          </Card>
        </div>

        {viewMode === 'rounds' && (
          <>
            {/* 최근 펀딩 라운드 */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  최근 펀딩 라운드
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentFundings.map((funding) => (
                  <div key={funding.id} className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{funding.logo}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{funding.project}</span>
                            <Badge variant="secondary" className="text-xs">
                              {funding.round}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400">{funding.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">
                          {formatAmount(funding.amount)}
                        </div>
                        {funding.valuation && (
                          <div className="text-sm text-gray-400">
                            Valuation: {formatAmount(funding.valuation)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {funding.investors.slice(0, 3).map((investor, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-700 rounded text-xs">
                            {investor}
                          </span>
                        ))}
                        {funding.investors.length > 3 && (
                          <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                            +{funding.investors.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">
                          {funding.date.toLocaleDateString()}
                        </span>
                        {funding.change24h && (
                          <span className={`flex items-center gap-1 ${funding.change24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {funding.change24h > 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {Math.abs(funding.change24h)}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <Badge variant="outline" className="mr-2">
                        {funding.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 라운드별 통계 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm">라운드별 평균 규모</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={roundStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="round" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                        formatter={(value: any) => `$${value}M`}
                      />
                      <Bar dataKey="avgAmount" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm">카테고리별 펀딩</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => `${entry.category}: $${entry.amount}M`}
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {viewMode === 'investors' && (
          <>
            {/* Top 투자자 */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Top 투자자
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topInvestors.map((investor, idx) => (
                  <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg">{investor.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {investor.type}
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-400">
                          <span>총 투자: {formatAmount(investor.totalInvested)}</span>
                          <span>딜 수: {investor.deals}</span>
                        </div>
                      </div>
                      <Award className="w-5 h-5 text-yellow-400" />
                    </div>

                    <div className="mb-3">
                      <div className="text-sm text-gray-400 mb-2">주요 투자 분야</div>
                      <div className="flex flex-wrap gap-2">
                        {investor.focusAreas.map((area, aIdx) => (
                          <span key={aIdx} className="px-2 py-1 bg-gray-700 rounded text-xs">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-2">주요 포트폴리오</div>
                      <div className="flex flex-wrap gap-2">
                        {investor.portfolio.map((company, cIdx) => (
                          <span key={cIdx} className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 투자자 활동 히트맵 */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>투자자 활동 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">가장 활발한 투자자</div>
                    <div className="text-xl font-bold">Coinbase Ventures</div>
                    <div className="text-sm text-green-400">256 deals</div>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">최대 투자 규모</div>
                    <div className="text-xl font-bold">a16z Crypto</div>
                    <div className="text-sm text-blue-400">$7.5B total</div>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">신규 투자자</div>
                    <div className="text-xl font-bold">12</div>
                    <div className="text-sm text-purple-400">이번 달</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {viewMode === 'trends' && (
          <>
            {/* 펀딩 트렌드 */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>월별 펀딩 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      formatter={(value: any) => [`$${value}M`, 'Amount']}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 핫 섹터 */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  핫 섹터
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['AI & ML', 'RWA (Real World Assets)', 'Bitcoin L2', 'Account Abstraction', 'Decentralized Social'].map((sector, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium">{sector}</div>
                        <div className="text-sm text-gray-400">
                          {15 - idx * 2} projects funded
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-400">
                          ${(120 - idx * 15)}M
                        </div>
                        <div className="text-xs text-gray-400">
                          +{25 - idx * 3}% MoM
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 지역별 분포 */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  지역별 펀딩 분포
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { region: 'North America', amount: 2340, percentage: 45 },
                    { region: 'Asia', amount: 1560, percentage: 30 },
                    { region: 'Europe', amount: 780, percentage: 15 },
                    { region: 'Others', amount: 520, percentage: 10 }
                  ].map((region) => (
                    <div key={region.region}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{region.region}</span>
                        <span>${region.amount}M ({region.percentage}%)</span>
                      </div>
                      <Progress value={region.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* 실시간 알림 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              실시간 펀딩 알림
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-800 rounded-lg flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 animate-pulse"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">새로운 Series B 라운드 발표</div>
                <div className="text-xs text-gray-400">LayerZero가 $120M 펀딩 완료 • 방금 전</div>
              </div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">a16z가 새로운 펀드 조성</div>
                <div className="text-xs text-gray-400">$4.5B 규모의 Crypto Fund V • 2시간 전</div>
              </div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">DeFi 프로토콜 시드 라운드</div>
                <div className="text-xs text-gray-400">익명 프로젝트 $15M 조달 • 5시간 전</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
      </NewsModuleWrapper>
  )