'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ReferenceLine } from 'recharts'
import { config } from '@/lib/config'

interface SeasonalityChartProps {
  symbol?: string
}

export default function SeasonalityChart({ symbol = 'BTCUSDT' }: SeasonalityChartProps) {
  const [showFullChart, setShowFullChart] = useState(false)

  // 월별 데이터 (1월~12월)
  const monthlyData = [
    { month: '1월', '2025': 17.06, '2024': 25, '2023': 40, '2022': -38, '2021': 85 },
    { month: '2월', '2025': 0, '2024': 45, '2023': 18, '2022': -15, '2021': 120 },
    { month: '3월', '2025': 0, '2024': 15, '2023': 65, '2022': -8, '2021': 100 },
    { month: '4월', '2025': 0, '2024': -8, '2023': 28, '2022': -18, '2021': 95 },
    { month: '5월', '2025': 0, '2024': 5, '2023': -15, '2022': -42, '2021': 35 },
    { month: '6월', '2025': 0, '2024': 12, '2023': 18, '2022': -55, '2021': 20 },
    { month: '7월', '2025': 0, '2024': 25, '2023': 35, '2022': -40, '2021': 45 },
    { month: '8월', '2025': 0, '2024': 0, '2023': 25, '2022': -25, '2021': 75 },
    { month: '9월', '2025': 0, '2024': -12, '2023': 8, '2022': -3, '2021': 42 },
    { month: '10월', '2025': 0, '2024': 58, '2023': 65, '2022': 15, '2021': 125 },
    { month: '11월', '2025': 0, '2024': 85, '2023': 75, '2022': -35, '2021': 155 },
    { month: '12월', '2025': 0, '2024': 111.81, '2023': 154.46, '2022': -65.34, '2021': 57.57 }
  ]

  // 연도별 수익률 데이터
  const yearlyReturns = [
    { year: '2025', value: 17.06, color: '#3B82F6' },
    { year: '2024', value: 111.81, color: '#EC4899' },
    { year: '2023', value: 154.46, color: '#8B5CF6' },
    { year: '2022', value: -65.34, color: '#EF4444' },
    { year: '2021', value: 57.57, color: '#10B981' }
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 p-3 rounded-lg border border-purple-500/30 backdrop-blur">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }} className="text-sm">
                {entry.name}
              </span>
              <span style={{ color: entry.color }} className="text-sm font-bold">
                {entry.value > 0 ? '+' : ''}{entry.value?.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <>
      <div className="glass-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold gradient-text">시즌별</h3>
            <p className="text-gray-400 text-sm mt-1">Bitcoin / TetherUS</p>
          </div>
          <motion.button
            onClick={() => setShowFullChart(!showFullChart)}
            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-sm font-medium border border-gray-700 transition-all flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: config.decimals.value95 }}
          >
            {showFullChart ? '닫기' : '더 많은 시즌'}
            <span className="text-xs">→</span>
          </motion.button>
        </div>

        {/* 차트 영역 */}
        <div className="h-80 w-full mb-6">
          <ResponsiveContainer width="${config.percentage.value100}" height="${config.percentage.value100}">
            <LineChart 
              data={monthlyData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#374151" 
                vertical={true}
              />
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
                domain={[-80, 160]}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* ${config.percentage.value0} 기준선 */}
              <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="5 5" />
              
              {/* 각 연도별 라인 */}
              <Line
                type="monotone"
                dataKey="2025"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                name="2025"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="2024"
                stroke="#EC4899"
                strokeWidth={2}
                dot={false}
                name="2024"
              />
              <Line
                type="monotone"
                dataKey="2023"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={false}
                name="2023"
              />
              <Line
                type="monotone"
                dataKey="2022"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                name="2022"
              />
              <Line
                type="monotone"
                dataKey="2021"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                name="2021"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 연도별 수익률 박스 */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {yearlyReturns.map((year) => (
            <div 
              key={year.year}
              className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: year.color }}
                />
                <span className="text-gray-400 text-xs">{year.year}</span>
              </div>
              <div 
                className="text-sm font-bold"
                style={{ color: year.value > 0 ? '#10B981' : '#EF4444' }}
              >
                {year.value > 0 ? '+' : ''}{year.value.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>

        {/* 범례 */}
        <div className="flex items-center justify-center gap-4">
          {yearlyReturns.map((year) => (
            <div key={year.year} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: year.color }}
              />
              <span className="text-gray-400 text-sm">{year.year}</span>
            </div>
          ))}
        </div>

        {/* 추가 정보 텍스트 */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-gray-500 text-xs text-center">
            더 많은 시즌 데이터를 보려면 클릭하세요
          </p>
        </div>
      </div>

      {/* 전체 화면 모달 */}
      {showFullChart && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setShowFullChart(false)}
        >
          <motion.div
            initial={{ scale: config.decimals.value9 }}
            animate={{ scale: 1 }}
            className="w-full max-w-7xl bg-gray-900 rounded-xl p-6 border border-purple-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold gradient-text">시즌별 상세 분석 - {symbol}</h3>
              <button
                onClick={() => setShowFullChart(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="h-96 w-full">
              <ResponsiveContainer width="${config.percentage.value100}" height="${config.percentage.value100}">
                <LineChart 
                  data={monthlyData} 
                  margin={{ top: 10, right: 30, left: 50, bottom: 30 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#374151" 
                    vertical={true}
                  />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${value}%`}
                    domain={[-80, 180]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="5 5" />
                  
                  <Line type="monotone" dataKey="2025" stroke="#3B82F6" strokeWidth={3} dot={false} name="2025" />
                  <Line type="monotone" dataKey="2024" stroke="#EC4899" strokeWidth={3} dot={false} name="2024" />
                  <Line type="monotone" dataKey="2023" stroke="#8B5CF6" strokeWidth={3} dot={false} name="2023" />
                  <Line type="monotone" dataKey="2022" stroke="#EF4444" strokeWidth={3} dot={false} name="2022" />
                  <Line type="monotone" dataKey="2021" stroke="#10B981" strokeWidth={3} dot={false} name="2021" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-5 gap-4 mt-6">
              {yearlyReturns.map((year) => (
                <div key={year.year} className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: year.color }} />
                    <span className="text-gray-300">{year.year}</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: year.value > 0 ? '#10B981' : '#EF4444' }}>
                    {year.value > 0 ? '+' : ''}{year.value.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}