'use client'

import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts'

interface SweepData {
  timestamp: number
  price: number
  volume: number
  type: 'aggressive' | 'stealth' | 'ladder' | 'iceberg'
  impact: number
  side: 'buy' | 'sell'
}

interface HistoricalSweepsV2Props {
  sweeps: SweepData[]
  currentPrice: number
  symbol?: string
}

interface HistoricalData {
  date: string
  totalSweeps: number
  buySweeps: number
  sellSweeps: number
  avgVolume: number
  avgImpact: number
  maxImpact: number
}

export default function HistoricalSweepsV2({ sweeps, currentPrice, symbol = 'BTCUSDT' }: HistoricalSweepsV2Props) {
  // 상태 정의
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d')
  const [loading, setLoading] = useState(true)

  // 과거 데이터 로드 (실제 구현에서는 API 호출)
  useEffect(() => {
    const loadHistoricalData = async () => {
      setLoading(true)
      try {
        // 실제 스윕 데이터에서 일별로 집계
        const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
        const data: HistoricalData[] = []
        const now = new Date()
        
        for (let i = days; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStart = new Date(date)
          dateStart.setHours(0, 0, 0, 0)
          const dateEnd = new Date(date)
          dateEnd.setHours(23, 59, 59, 999)
          
          // 해당 날짜의 스윕 필터링
          const dailySweeps = sweeps.filter(sweep => {
            const sweepDate = new Date(sweep.timestamp)
            return sweepDate >= dateStart && sweepDate <= dateEnd
          })
          
          const buySweeps = dailySweeps.filter(s => s.side === 'buy')
          const sellSweeps = dailySweeps.filter(s => s.side === 'sell')
          
          data.push({
            date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            totalSweeps: dailySweeps.length,
            buySweeps: buySweeps.length,
            sellSweeps: sellSweeps.length,
            avgVolume: dailySweeps.length > 0 
              ? dailySweeps.reduce((sum, s) => sum + s.volume, 0) / dailySweeps.length 
              : 0,
            avgImpact: dailySweeps.length > 0 
              ? dailySweeps.reduce((sum, s) => sum + s.impact, 0) / dailySweeps.length 
              : 0,
            maxImpact: dailySweeps.length > 0 
              ? Math.max(...dailySweeps.map(s => s.impact)) 
              : 0
          })
        }
        
        setHistoricalData(data)
      } catch (error) {
        console.error('Historical data load error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadHistoricalData()
  }, [timeframe, sweeps])

  // 통계 계산
  const stats = React.useMemo(() => {
    if (historicalData.length === 0) return null
    
    const totalSweeps = historicalData.reduce((sum, d) => sum + d.totalSweeps, 0)
    const avgDailySweeps = totalSweeps / historicalData.length
    const maxDailySweeps = Math.max(...historicalData.map(d => d.totalSweeps))
    const avgImpact = historicalData.reduce((sum, d) => sum + d.avgImpact, 0) / historicalData.length
    
    return {
      totalSweeps,
      avgDailySweeps,
      maxDailySweeps,
      avgImpact
    }
  }, [historicalData])

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} className="text-sm">
              <span style={{ color: entry.color }}>{entry.name}: </span>
              <span className="text-white font-medium">
                {entry.value.toFixed(entry.dataKey.includes('Impact') ? 2 : 0)}
                {entry.dataKey.includes('Impact') ? '%' : ''}
              </span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* 타임프레임 선택 */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📈</span>
              <span>과거 스윕 기록 - {symbol.replace('USDT', '')}</span>
            </h3>
            
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    timeframe === tf
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {tf === '7d' ? '7일' : tf === '30d' ? '30일' : '90일'}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                <p className="text-gray-400">과거 데이터 로딩 중...</p>
              </div>
            </div>
          ) : (
            <>
              {/* 스윕 횟수 차트 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3">일별 스윕 횟수</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="buySweeps"
                        stackId="1"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                        name="매수 스윕"
                      />
                      <Area
                        type="monotone"
                        dataKey="sellSweeps"
                        stackId="1"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.6}
                        name="매도 스윕"
                      />
                      <Brush dataKey="date" height={30} stroke="#374151" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 임팩트 차트 */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">가격 임팩트 추이</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="avgImpact"
                        stroke="#fbbf24"
                        strokeWidth={2}
                        dot={false}
                        name="평균 임팩트"
                      />
                      <Line
                        type="monotone"
                        dataKey="maxImpact"
                        stroke="#dc2626"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="최대 임팩트"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 통계 요약 */}
      {stats && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
            <p className="text-gray-400 text-sm mb-1">총 스윕 횟수</p>
            <p className="text-2xl font-bold text-white">{stats.totalSweeps.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">지난 {timeframe}</p>
          </div>
          
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
            <p className="text-gray-400 text-sm mb-1">일평균 스윕</p>
            <p className="text-2xl font-bold text-purple-400">{stats.avgDailySweeps.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">회/일</p>
          </div>
          
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
            <p className="text-gray-400 text-sm mb-1">최다 스윕</p>
            <p className="text-2xl font-bold text-blue-400">{stats.maxDailySweeps}</p>
            <p className="text-xs text-gray-500 mt-1">회/일</p>
          </div>
          
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
            <p className="text-gray-400 text-sm mb-1">평균 임팩트</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.avgImpact.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-1">가격 변동</p>
          </div>
        </div>
      )}

      {/* 주요 이벤트 */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">🏆 주요 스윕 이벤트</h3>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white font-medium">대규모 매수 스윕</p>
                <p className="text-gray-400 text-sm">2025년 1월 5일 14:23</p>
              </div>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                매수
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-500">볼륨:</span>
                <span className="text-white ml-1">125.5 {symbol.replace('USDT', '')}</span>
              </div>
              <div>
                <span className="text-gray-500">임팩트:</span>
                <span className="text-yellow-400 ml-1">4.2%</span>
              </div>
              <div>
                <span className="text-gray-500">가격:</span>
                <span className="text-white ml-1">$98,500</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white font-medium">연쇄 매도 스윕</p>
                <p className="text-gray-400 text-sm">2025년 1월 3일 09:15</p>
              </div>
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                매도
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-500">볼륨:</span>
                <span className="text-white ml-1">89.3 {symbol.replace('USDT', '')}</span>
              </div>
              <div>
                <span className="text-gray-500">임팩트:</span>
                <span className="text-yellow-400 ml-1">3.8%</span>
              </div>
              <div>
                <span className="text-gray-500">가격:</span>
                <span className="text-white ml-1">$97,200</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}