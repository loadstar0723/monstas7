'use client'

import { useState } from 'react'
import { translateToKorean, translateNewsBody } from '@/lib/translateService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, AlertCircle, BarChart3, Activity } from 'lucide-react'
import NewsModuleWrapper from '../components/NewsModuleWrapper'

export default function AnalysisNewsModule() {
  const [activeTab, setActiveTab] = useState('overview')

  // 시장 개요 데이터
  const marketData = [
    { name: 'BTC', value: 65432, change: 2.5 },
    { name: 'ETH', value: 3245, change: -1.2 },
    { name: 'BNB', value: 543, change: 0.8 },
    { name: 'SOL', value: 132, change: 5.3 }
  ]

  // 거래량 데이터
  const volumeData = [
    { time: '00:00', volume: 45 },
    { time: '04:00', volume: 38 },
    { time: '08:00', volume: 52 },
    { time: '12:00', volume: 61 },
    { time: '16:00', volume: 58 },
    { time: '20:00', volume: 65 }
  ]

  // 섹터별 성과
  const sectorData = [
    { sector: 'DeFi', value: 35, color: '#3b82f6' },
    { sector: 'NFT', value: 20, color: '#10b981' },
    { sector: '게임', value: 25, color: '#f59e0b' },
    { sector: 'Layer 2', value: 20, color: '#8b5cf6' }
  ]

  return (
    <NewsModuleWrapper moduleName="AnalysisNewsModule">
      <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{translateToKorean("시장 분석")}</h1>
          <p className="text-gray-400">{translateNewsBody("종합적인 암호화폐 시장 분석 및 인사이트")}</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            size="sm"
          >
            개요
          </Button>
          <Button
            variant={activeTab === 'technical' ? 'default' : 'outline'}
            onClick={() => setActiveTab('technical')}
            size="sm"
          >
            기술적 분석
          </Button>
          <Button
            variant={activeTab === 'sentiment' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sentiment')}
            size="sm"
          >
            센티먼트
          </Button>
        </div>

        {/* 주요 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">총 시가총액</span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold">$2.45T</div>
              <div className="text-xs text-green-400">+3.2% (24시간)</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">24시간 거래량</span>
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold">$98.5B</div>
              <div className="text-xs text-red-400">-5.1% (24시간)</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">BTC 점유율</span>
                <Activity className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold">52.3%</div>
              <div className="text-xs text-gray-400">+0.5% (24시간)</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">공포 & 탐욕</span>
                <AlertCircle className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold">68</div>
              <div className="text-xs text-green-400">탐욕</div>
            </CardContent>
          </Card>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* 가격 차트 */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>주요 암호화폐</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 거래량 차트 */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>24시간 거래량</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'technical' && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>기술적 지표</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>RSI (14)</span>
                    <Badge variant="secondary">65.4</Badge>
                  </div>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>MACD</span>
                    <Badge variant="default" className="bg-green-600">상승세</Badge>
                  </div>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>이동평균선 (50)</span>
                    <Badge variant="secondary">$64,230</Badge>
                  </div>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>지지선</span>
                    <Badge variant="secondary">$63,500</Badge>
                  </div>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>저항선</span>
                    <Badge variant="secondary">$67,800</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'sentiment' && (
          <>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>시장 센티먼트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-800 rounded-lg text-center">
                    <div className="text-3xl mb-2">😊</div>
                    <div className="text-xl font-bold text-green-400">45%</div>
                    <div className="text-sm text-gray-400">상승세</div>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-lg text-center">
                    <div className="text-3xl mb-2">😐</div>
                    <div className="text-xl font-bold text-yellow-400">30%</div>
                    <div className="text-sm text-gray-400">중립</div>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-lg text-center">
                    <div className="text-3xl mb-2">😟</div>
                    <div className="text-xl font-bold text-red-400">25%</div>
                    <div className="text-sm text-gray-400">하락세</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 섹터별 성과 */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>섹터별 성과</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      dataKey="value"
                      nameKey="sector"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {/* 뉴스 피드 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>최신 분석</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">비트코인이 $65,000 주요 저항선 돌파</div>
                  <div className="text-xs text-gray-400">기술적 분석에서 강한 상승 모멘텀 확인</div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">이더리움 네트워크 활동 급증</div>
                  <div className="text-xs text-gray-400">사용량 증가에도 가스비는 안정적 유지</div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">DeFi TVL 월간 최고치 달성</div>
                  <div className="text-xs text-gray-400">총 예치 가치 1,200억 달러 초과</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
      </NewsModuleWrapper>
  )