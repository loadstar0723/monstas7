'use client'

import React, { useState, useMemo } from 'react'
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, Area, AreaChart } from 'recharts'
import { config } from '@/lib/config'

interface MonthlyData {
  month: string
  year2025: number
  year2024: number
  year2023: number
}

interface PerformanceData {
  period: string
  value: number
  color: string
}

const SeasonalChart = () => {
  const [activeTab, setActiveTab] = useState<'seasonal' | 'performance'>('seasonal')

  // Monthly comparison data (like TradingView seasonal)
  const monthlyData: MonthlyData[] = useMemo(() => [
    { month: '1월', year2025: 12, year2024: 15, year2023: 8 },
    { month: '2월', year2025: -8, year2024: 22, year2023: 18 },
    { month: '3월', year2025: 25, year2024: -5, year2023: 30 },
    { month: '4월', year2025: 18, year2024: 28, year2023: 15 },
    { month: '5월', year2025: -12, year2024: 35, year2023: -10 },
    { month: '6월', year2025: 30, year2024: 40, year2023: 25 },
    { month: '7월', year2025: 45, year2024: 38, year2023: 42 },
    { month: '8월', year2025: 0, year2024: 52, year2023: 48 },
    { month: '9월', year2025: 0, year2024: 28, year2023: 35 },
    { month: '10월', year2025: 0, year2024: 15, year2023: 20 },
    { month: '11월', year2025: 0, year2024: 32, year2023: 38 },
    { month: '12월', year2025: 0, year2024: 45, year2023: 50 },
  ], [])

  // Performance data
  const performanceData: PerformanceData[] = [
    { period: '1W', value: -1.67, color: 'text-red-400' },
    { period: '1M', value: -3.02, color: 'text-red-400' },
    { period: '3M', value: 6.13, color: 'text-emerald-400' },
    { period: '6M', value: 28.37, color: 'text-emerald-400' },
    { period: 'YTD', value: 18.28, color: 'text-emerald-400' },
    { period: '1Y', value: 90.93, color: 'text-emerald-400' },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-purple-500/30">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Seasonal Chart - Monthly Comparison */}
      <div className="glass-card p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold gradient-text">시즌별</h3>
          <p className="text-gray-400 text-sm mt-1">월별 성과 비교</p>
        </div>

        {/* Monthly Comparison Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="${config.percentage.value100}" height="${config.percentage.value100}">
            <AreaChart data={monthlyData} isAnimationActive={false} animationDuration={0}>
              <defs>
                <linearGradient id="color2025" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="${config.percentage.value5}" stopColor="#3B82F6" stopOpacity={config.decimals.value8}/>
                  <stop offset="${config.percentage.value95}" stopColor="#3B82F6" stopOpacity={config.decimals.value1}/>
                </linearGradient>
                <linearGradient id="color2024" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="${config.percentage.value5}" stopColor="#EC4899" stopOpacity={config.decimals.value8}/>
                  <stop offset="${config.percentage.value95}" stopColor="#EC4899" stopOpacity={config.decimals.value1}/>
                </linearGradient>
                <linearGradient id="color2023" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="${config.percentage.value5}" stopColor="#8B5CF6" stopOpacity={config.decimals.value8}/>
                  <stop offset="${config.percentage.value95}" stopColor="#8B5CF6" stopOpacity={config.decimals.value1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                style={{ fontSize: '11px' }}
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                style={{ fontSize: '11px' }}
                tick={{ fill: '#9CA3AF' }}
                tickFormatter={(value) => `${value}%`}
                domain={[-20, 60]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="year2025"
                stroke="#3B82F6"
                fill="url(#color2025)"
                strokeWidth={2}
                name="2025"
                connectNulls={false}
                isAnimationActive={false}
                animationDuration={0}
              />
              <Area
                type="monotone"
                dataKey="year2024"
                stroke="#EC4899"
                fill="url(#color2024)"
                strokeWidth={2}
                name="2024"
                isAnimationActive={false}
                animationDuration={0}
              />
              <Area
                type="monotone"
                dataKey="year2023"
                stroke="#8B5CF6"
                fill="url(#color2023)"
                strokeWidth={2}
                name="2023"
                isAnimationActive={false}
                animationDuration={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-400 text-sm">2025</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-gray-400 text-sm">2024</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-400 text-sm">2023</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-gray-500 text-xs text-center">
            더 많은 시즌 데이터를 보려면 클릭하세요
          </p>
        </div>
      </div>

      {/* Performance Panel */}
      <div className="glass-card p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold gradient-text">Performance</h3>
          <p className="text-gray-400 text-sm mt-1">기간별 수익률</p>
        </div>

        {/* Performance Grid */}
        <div className="grid grid-cols-3 gap-3">
          {performanceData.map((item) => (
            <div
              key={item.period}
              className="bg-gray-800/50 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-700/50"
            >
              <p className="text-gray-400 text-xs mb-2">{item.period}</p>
              <p className={`text-2xl font-bold ${item.color}`}>
                {item.value > 0 ? '+' : ''}{item.value}%
              </p>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">최고 수익률</p>
              <p className="text-emerald-400 text-lg font-bold">+90.${config.percentage.value93}</p>
              <p className="text-gray-500 text-xs">1Y</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">평균 수익률</p>
              <p className="text-cyan-400 text-lg font-bold">+23.${config.percentage.value15}</p>
              <p className="text-gray-500 text-xs">All Periods</p>
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase">전체 트렌드</p>
              <p className="text-emerald-400 font-bold text-lg mt-1">상승세</p>
            </div>
            <div className="text-3xl">
              📈
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(SeasonalChart)