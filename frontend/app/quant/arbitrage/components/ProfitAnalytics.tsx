'use client'

import { useState, useEffect } from 'react'

interface ProfitAnalyticsProps {
  selectedCoin: {
    symbol: string
    name: string
    color: string
    bgColor: string
  }
}

interface DailyProfit {
  date: string
  profit: number
  trades: number
  volume: number
}

export default function ProfitAnalytics({ selectedCoin }: ProfitAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('7d')
  const [dailyProfits, setDailyProfits] = useState<DailyProfit[]>([])
  const [stats, setStats] = useState({
    totalProfit: 0,
    avgDailyProfit: 0,
    bestDay: 0,
    worstDay: 0,
    totalTrades: 0,
    totalVolume: 0,
    profitableDays: 0,
    unprofitableDays: 0
  })
  
  useEffect(() => {
    // 수익 데이터 생성 (실제로는 API에서 받아옴)
    const days = timeRange === 'today' ? 1 :
                 timeRange === '7d' ? 7 :
                 timeRange === '30d' ? 30 :
                 90
    
    const profits: DailyProfit[] = []
    let totalProfit = 0
    let bestDay = -Infinity
    let worstDay = Infinity
    let totalTrades = 0
    let totalVolume = 0
    let profitableDays = 0
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      const dayProfit = -200 + Math.random() * 600
      const dayTrades = 5 + Math.floor(Math.random() * 20)
      const dayVolume = 1000 + Math.random() * 9000
      
      profits.push({
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        profit: dayProfit,
        trades: dayTrades,
        volume: dayVolume
      })
      
      totalProfit += dayProfit
      totalTrades += dayTrades
      totalVolume += dayVolume
      
      if (dayProfit > bestDay) bestDay = dayProfit
      if (dayProfit < worstDay) worstDay = dayProfit
      if (dayProfit > 0) profitableDays++
    }
    
    setDailyProfits(profits.reverse())
    setStats({
      totalProfit,
      avgDailyProfit: totalProfit / days,
      bestDay,
      worstDay,
      totalTrades,
      totalVolume,
      profitableDays,
      unprofitableDays: days - profitableDays
    })
  }, [timeRange])
  
  const timeRanges = [
    { value: 'today' as const, label: '오늘' },
    { value: '7d' as const, label: '7일' },
    { value: '30d' as const, label: '30일' },
    { value: 'all' as const, label: '전체' }
  ]
  
  // 차트 데이터의 최대값 찾기
  const maxProfit = Math.max(...dailyProfits.map(d => Math.abs(d.profit)))
  
  return (
    <div className="space-y-6">
      {/* 기간 선택 */}
      <div className="flex gap-2">
        {timeRanges.map(range => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === range.value
                ? `${selectedCoin.bgColor} ${selectedCoin.color} border border-current`
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
      
      {/* 핵심 수익 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">총 수익</div>
          <div className={`text-2xl font-bold ${
            stats.totalProfit > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            ${stats.totalProfit.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {timeRange === 'today' ? '오늘' :
             timeRange === '7d' ? '최근 7일' :
             timeRange === '30d' ? '최근 30일' :
             '전체 기간'}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">일평균 수익</div>
          <div className={`text-2xl font-bold ${
            stats.avgDailyProfit > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            ${stats.avgDailyProfit.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            일평균
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">수익률</div>
          <div className={`text-2xl font-bold ${
            stats.profitableDays > stats.unprofitableDays ? 'text-green-400' : 'text-red-400'
          }`}>
            {((stats.profitableDays / (stats.profitableDays + stats.unprofitableDays)) * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.profitableDays}일 수익 / {stats.unprofitableDays}일 손실
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">총 거래</div>
          <div className="text-2xl font-bold text-white">
            {stats.totalTrades}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            거래량: ${(stats.totalVolume / 1000).toFixed(1)}K
          </div>
        </div>
      </div>
      
      {/* 일별 수익 차트 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h4 className="font-semibold text-gray-300 mb-4">일별 수익 추이</h4>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {dailyProfits.map((day, index) => (
            <div key={index} className="flex items-center gap-3 py-2">
              <span className="text-xs text-gray-400 w-16">{day.date}</span>
              
              <div className="flex-1 flex items-center">
                <div className="flex-1 bg-gray-900/50 h-8 rounded relative flex items-center">
                  {/* 0 기준선 */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-600"></div>
                  
                  {/* 수익 바 */}
                  <div
                    className={`h-6 rounded ${
                      day.profit > 0 ? 'bg-green-500/50' : 'bg-red-500/50'
                    }`}
                    style={{
                      width: `${(Math.abs(day.profit) / maxProfit) * 45}%`,
                      marginLeft: day.profit > 0 ? '50%' : 'auto',
                      marginRight: day.profit < 0 ? '50%' : 'auto'
                    }}
                  />
                </div>
              </div>
              
              <div className="text-right">
                <div className={`font-mono text-sm ${
                  day.profit > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${day.profit.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  {day.trades}거래
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 베스트/워스트 데이 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
          <div className="text-sm text-green-400 mb-1">최고 수익일</div>
          <div className="text-2xl font-bold text-white">
            +${stats.bestDay.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            일일 최고 기록
          </div>
        </div>
        
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
          <div className="text-sm text-red-400 mb-1">최대 손실일</div>
          <div className="text-2xl font-bold text-white">
            ${stats.worstDay.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            일일 최대 손실
          </div>
        </div>
      </div>
      
      {/* 수익 분포 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h4 className="font-semibold text-gray-300 mb-4">수익 분포 분석</h4>
        
        <div className="space-y-4">
          {[
            { range: '$500+', count: Math.floor(stats.profitableDays * 0.1), color: 'bg-green-500' },
            { range: '$200-500', count: Math.floor(stats.profitableDays * 0.2), color: 'bg-green-400' },
            { range: '$0-200', count: Math.floor(stats.profitableDays * 0.4), color: 'bg-yellow-400' },
            { range: '-$200-0', count: Math.floor(stats.unprofitableDays * 0.4), color: 'bg-orange-400' },
            { range: '-$500--200', count: Math.floor(stats.unprofitableDays * 0.3), color: 'bg-red-400' },
            { range: '-$500 이하', count: Math.floor(stats.unprofitableDays * 0.3), color: 'bg-red-500' }
          ].map((range, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm text-gray-400 w-24">{range.range}</span>
              <div className="flex-1 bg-gray-900/50 h-6 rounded relative">
                <div
                  className={`h-full rounded ${range.color} bg-opacity-50`}
                  style={{ width: `${(range.count / 30) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 w-12 text-right">
                {range.count}일
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}