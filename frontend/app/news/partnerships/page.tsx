'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  AreaChart, Area, ComposedChart,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Cell
} from 'recharts'

export default function PartnershipsPage() {
  const [activeTab, setActiveTab] = useState('latest')
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC']
  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6']

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // 최근 파트너십 데이터
  const getRecentPartnerships = () => {
    const hour = new Date().getHours()
    return [
      {
        id: 1,
        title: 'Ethereum과 대형 은행 파트너십',
        companies: ['JP Morgan', 'Ethereum Foundation'],
        coin: 'ETH',
        amount: 500000000,
        type: 'partnership',
        impact: 'high',
        date: '2024-01-15'
      },
      {
        id: 2,
        title: 'Binance Smart Chain 기업 협업',
        companies: ['Microsoft', 'Binance'],
        coin: 'BNB',
        amount: 300000000,
        type: 'collaboration',
        impact: 'medium',
        date: '2024-01-14'
      },
      {
        id: 3,
        title: 'Solana 글로벌 결제 통합',
        companies: ['Visa', 'Solana Labs'],
        coin: 'SOL',
        amount: 400000000,
        type: 'integration',
        impact: 'high',
        date: '2024-01-13'
      },
      {
        id: 4,
        title: 'Polygon 엔터프라이즈 솔루션',
        companies: ['Amazon Web Services', 'Polygon'],
        coin: 'MATIC',
        amount: 250000000,
        type: 'partnership',
        impact: 'medium',
        date: '2024-01-12'
      },
      {
        id: 5,
        title: 'Cardano 아프리카 확장',
        companies: ['Ethiopian Government', 'Cardano Foundation'],
        coin: 'ADA',
        amount: 150000000,
        type: 'partnership',
        impact: 'high',
        date: '2024-01-11'
      }
    ].filter(p => !selectedCoin || p.coin === selectedCoin)
  }

  // 투자 라운드 데이터
  const getInvestmentRounds = () => {
    return [
      { project: 'DeFi Protocol A', amount: 150, round: 'Series B', investors: 12 },
      { project: 'NFT Platform B', amount: 100, round: 'Series A', investors: 8 },
      { project: 'L2 Solution C', amount: 200, round: 'Series C', investors: 15 },
      { project: 'Gaming Platform D', amount: 80, round: 'Seed', investors: 6 },
      { project: 'DEX Protocol E', amount: 120, round: 'Series A', investors: 10 }
    ]
  }

  // M&A 활동 데이터
  const getMAActivity = () => {
    const day = new Date().getDate()
    return [
      { date: '2024-01', value: 450 + day * 5, type: 'acquisition', count: 3 },
      { date: '2024-02', value: 520 + day * 4, type: 'merger', count: 2 },
      { date: '2024-03', value: 380 + day * 6, type: 'acquisition', count: 4 },
      { date: '2024-04', value: 610 + day * 3, type: 'merger', count: 1 },
      { date: '2024-05', value: 490 + day * 7, type: 'acquisition', count: 5 }
    ]
  }

  // 파트너십 유형 분포
  const getTypeDistribution = () => {
    const hour = new Date().getHours()
    return [
      { name: '파트너십', value: 35 + hour % 10 },
      { name: '투자', value: 25 + hour % 8 },
      { name: '인수', value: 20 + hour % 6 },
      { name: '협업', value: 15 + hour % 5 },
      { name: '통합', value: 5 + hour % 3 }
    ]
  }

  // 상위 파트너 기업
  const getTopPartners = () => {
    const hour = new Date().getHours()
    return [
      { name: 'Microsoft', deals: 12, value: 85 + hour % 15 },
      { name: 'Google', deals: 10, value: 75 + hour % 12 },
      { name: 'Amazon', deals: 8, value: 70 + hour % 10 },
      { name: 'JP Morgan', deals: 7, value: 65 + hour % 8 },
      { name: 'Visa', deals: 6, value: 60 + hour % 6 }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-white">
              🤝 파트너십 & 협업 뉴스
            </h1>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-green-500">
                실시간 업데이트
              </Badge>
              <span className="text-sm text-gray-400">
                마지막 업데이트: {mounted ? lastUpdate.toLocaleTimeString('ko-KR') : '로딩중...'}
              </span>
            </div>
          </div>
          <p className="text-gray-400">
            기업 제휴, 투자, M&A, 전략적 협력 등 블록체인 파트너십 소식을 실시간으로 전달합니다
          </p>
        </div>

        {/* 필터 */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              onClick={() => setSelectedCoin(null)}
              variant={!selectedCoin ? 'default' : 'outline'}
              className="min-w-[80px]"
            >
              전체
            </Button>
            {coins.map(coin => (
              <Button
                key={coin}
                onClick={() => setSelectedCoin(coin)}
                variant={selectedCoin === coin ? 'default' : 'outline'}
                className="min-w-[80px]"
              >
                {coin}
              </Button>
            ))}
          </div>
        </div>

        {/* 메트릭스 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
            <p className="text-gray-400 text-sm">총 파트너십</p>
            <p className="text-2xl font-bold text-white">
              {mounted ? 1234 + new Date().getHours() * 3 : 0}
            </p>
            <p className="text-xs text-green-400 mt-1">+15% 이번 달</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
            <p className="text-gray-400 text-sm">총 투자금</p>
            <p className="text-2xl font-bold text-white">$12.5B</p>
            <p className="text-xs text-green-400 mt-1">+25% YoY</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
            <p className="text-gray-400 text-sm">평균 거래 규모</p>
            <p className="text-2xl font-bold text-white">$250M</p>
            <p className="text-xs text-yellow-400 mt-1">안정적</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
            <p className="text-gray-400 text-sm">성공률</p>
            <p className="text-2xl font-bold text-white">87%</p>
            <Progress value={87} className="h-1 mt-2" />
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {['latest', 'investment', 'ma', 'analysis'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-4 ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab === 'latest' && '최신 파트너십'}
              {tab === 'investment' && '투자 라운드'}
              {tab === 'ma' && 'M&A 활동'}
              {tab === 'analysis' && '종합 분석'}
            </button>
          ))}
        </div>

        {/* 최신 파트너십 탭 */}
        {activeTab === 'latest' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {getRecentPartnerships().map(partnership => (
                <div
                  key={partnership.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {partnership.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {partnership.companies.map((company, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {company}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge className="bg-purple-600">
                      {partnership.coin}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <span className="text-green-400 font-semibold">
                      ${(partnership.amount / 1000000).toFixed(0)}M
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      ({partnership.type})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{partnership.date}</span>
                    <Badge className={
                      partnership.impact === 'high' ? 'bg-red-500' :
                      partnership.impact === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }>
                      {partnership.impact === 'high' ? '높음' :
                       partnership.impact === 'medium' ? '보통' : '낮음'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* 파트너십 유형 분포 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">파트너십 유형 분포</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getTypeDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getTypeDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">상위 파트너 기업</h3>
                {getTopPartners().map((partner, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300">{partner.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{partner.deals}건</span>
                        <Badge variant="outline" className="text-xs">
                          영향도 {partner.value}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={partner.value} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 투자 라운드 탭 */}
        {activeTab === 'investment' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">투자 라운드 현황</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={getInvestmentRounds()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="project" tick={{ fill: '#9ca3af' }} />
                  <YAxis yAxisId="left" tick={{ fill: '#9ca3af' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="amount" fill="#8b5cf6" name="투자금(M$)" />
                  <Line yAxisId="right" type="monotone" dataKey="investors" stroke="#10b981" name="투자자 수" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {getInvestmentRounds().map((round, i) => (
                <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{round.project}</h3>
                      <Badge className="mt-2" variant="outline">
                        {round.round}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">
                        ${round.amount}M
                      </p>
                      <p className="text-sm text-gray-400">
                        {round.investors} 투자자
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* M&A 활동 탭 */}
        {activeTab === 'ma' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">M&A 활동 타임라인</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={getMAActivity()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="거래 규모 (M$)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">진행 중인 거래</p>
                <p className="text-2xl font-bold text-white">
                  {mounted ? 5 + new Date().getHours() % 3 : 0}
                </p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 text-sm">완료된 거래</p>
                <p className="text-2xl font-bold text-white">
                  {mounted ? 28 + new Date().getDate() : 0}
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm">총 거래 가치</p>
                <p className="text-2xl font-bold text-white">$8.5B</p>
              </div>
            </div>
          </div>
        )}

        {/* 종합 분석 탭 */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">파트너십 트렌드 분석</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getMAActivity()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} name="거래 가치" />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} name="거래 수" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">핵심 인사이트</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span className="text-gray-300">엔터프라이즈 파트너십이 전년 대비 45% 증가</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span className="text-gray-300">평균 거래 규모가 $250M로 상승 추세</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span className="text-gray-300">아시아 지역 파트너십이 전체의 35% 차지</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span className="text-gray-300">DeFi와 전통 금융 간 협업 급증</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">예상 전망</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">→</span>
                    <span className="text-gray-300">2024년 총 파트너십 가치 $50B 예상</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">→</span>
                    <span className="text-gray-300">중앙은행 디지털 화폐(CBDC) 협력 증가</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">→</span>
                    <span className="text-gray-300">Web3 게임 분야 대규모 투자 예정</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">→</span>
                    <span className="text-gray-300">규제 준수 솔루션 파트너십 확대</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}