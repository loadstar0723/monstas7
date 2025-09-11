'use client'

import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Dot } from 'recharts'

interface ParabolicSARChartProps {
  data: Array<{
    time: string
    price: number
    sar: number
    trend: 'up' | 'down'
  }>
}

// SAR 커스텀 도트 - 추세에 따라 색상 변경
const CustomSARDot = (props: any) => {
  const { cx, cy, payload } = props
  const color = payload.trend === 'up' ? '#10b981' : '#ef4444'
  
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={3} 
      fill={color}
      stroke={color}
      strokeWidth={1}
    />
  )
}

export default function ParabolicSARChart({ data }: ParabolicSARChartProps) {
  // 최신 추세 계산
  const currentTrend = useMemo(() => {
    if (!data || data.length === 0) return 'neutral'
    const latest = data[data.length - 1]
    return latest.trend
  }, [data])

  // 추세 전환 포인트 찾기
  const trendChangePoints = useMemo(() => {
    const changes: number[] = []
    for (let i = 1; i < data.length; i++) {
      if (data[i].trend !== data[i - 1].trend) {
        changes.push(i)
      }
    }
    return changes
  }, [data])

  // 평균 추세 지속 기간 계산
  const avgTrendDuration = useMemo(() => {
    if (trendChangePoints.length <= 1) return data.length
    
    let totalDuration = 0
    for (let i = 1; i < trendChangePoints.length; i++) {
      totalDuration += trendChangePoints[i] - trendChangePoints[i - 1]
    }
    
    return Math.round(totalDuration / (trendChangePoints.length - 1))
  }, [trendChangePoints, data])

  return (
    <div className="space-y-4">
      {/* 차트 */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value: any, name: string) => {
              if (name === 'SAR') {
                return [`$${value.toFixed(2)}`, 'SAR']
              }
              return [`$${value.toFixed(2)}`, name]
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#9ca3af' }}
          />
          
          {/* 가격 라인 */}
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            name="가격"
            dot={false}
            activeDot={{ r: 6 }}
          />
          
          {/* SAR 포인트 */}
          <Line 
            type="linear" 
            dataKey="sar" 
            stroke="transparent"
            strokeWidth={0}
            name="Parabolic SAR"
            dot={<CustomSARDot />}
            legendType="circle"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* 현재 상태 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-gray-800/50 rounded">
          <div className="text-xs text-gray-400 mb-1">현재 추세</div>
          <div className={`text-lg font-bold ${
            currentTrend === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            {currentTrend === 'up' ? '상승 추세' : '하락 추세'}
          </div>
        </div>
        
        <div className="p-3 bg-gray-800/50 rounded">
          <div className="text-xs text-gray-400 mb-1">SAR 위치</div>
          <div className="text-lg font-bold text-white">
            ${data[data.length - 1]?.sar?.toFixed(2) || '0'}
          </div>
        </div>
        
        <div className="p-3 bg-gray-800/50 rounded">
          <div className="text-xs text-gray-400 mb-1">평균 추세 지속</div>
          <div className="text-lg font-bold text-white">
            {avgTrendDuration}봉
          </div>
        </div>
      </div>

      {/* 시그널 설명 */}
      <div className="p-4 bg-gray-800/30 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-2">Parabolic SAR 시그널</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-gray-300">
              SAR이 가격 아래 위치 = 상승 추세 (매수 신호)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-gray-300">
              SAR이 가격 위에 위치 = 하락 추세 (매도 신호)
            </span>
          </div>
          <div className="text-gray-400 text-xs mt-2">
            * SAR 전환 시점은 추세 전환 신호로 활용
          </div>
        </div>
      </div>
    </div>
  )
}