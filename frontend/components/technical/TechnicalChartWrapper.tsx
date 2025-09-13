'use client'

import { useEffect, useRef, memo } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Brush
} from 'recharts'
import type { ChartData, ChartConfig } from './types'

interface TechnicalChartWrapperProps {
  data: ChartData[]
  type?: 'line' | 'area' | 'bar' | 'candlestick' | 'composed'
  height?: number
  showVolume?: boolean
  showGrid?: boolean
  colors?: {
    up?: string
    down?: string
    line?: string
    area?: string
    volume?: string
    grid?: string
  }
  indicators?: {
    name: string
    data: number[]
    color: string
    type?: 'line' | 'area' | 'bar'
  }[]
  title?: string
  description?: string
  loading?: boolean
  className?: string
}

const TechnicalChartWrapper = memo(({
  data,
  type = 'line',
  height = 400,
  showVolume = false,
  showGrid = true,
  colors = {
    up: '#00ff88',
    down: '#ff3366',
    line: '#8884d8',
    area: '#8884d8',
    volume: '#82ca9d',
    grid: '#374151'
  },
  indicators = [],
  title,
  description,
  loading = false,
  className = ''
}: TechnicalChartWrapperProps) => {
  const chartRef = useRef<HTMLDivElement>(null)

  // 차트 데이터 포맷팅 (data가 없으면 빈 배열 사용)
  const formattedData = (data || []).map((item, index) => ({
    ...item,
    time: new Date(item.time).toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    ...indicators.reduce((acc, indicator) => ({
      ...acc,
      [indicator.name]: indicator.data[index] || null
    }), {})
  }))

  // 로딩 상태
  if (loading) {
    return (
      <div className={`bg-gray-800/50 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="h-[${height}px] bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  // 데이터가 없을 때
  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800/50 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white text-sm">
                {entry.name}: {typeof entry.value === 'number' 
                  ? entry.value.toFixed(2) 
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className={`bg-gray-800/50 rounded-xl p-6 ${className}`}>
      {/* 헤더 */}
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-bold text-white mb-1">{title}</h3>}
          {description && <p className="text-sm text-gray-400">{description}</p>}
        </div>
      )}

      {/* 차트 */}
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={height}>
          {type === 'composed' || showVolume ? (
            <ComposedChart data={formattedData}>
              {showGrid && (
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={colors.grid} 
                  opacity={0.3}
                />
              )}
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                yAxisId="price"
                orientation="right"
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              {showVolume && (
                <YAxis 
                  yAxisId="volume"
                  orientation="left"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 11 }}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              
              {/* 메인 가격 라인 */}
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="value"
                stroke={colors.line}
                strokeWidth={2}
                dot={false}
                name="가격"
              />
              
              {/* 거래량 바 */}
              {showVolume && (
                <Bar
                  yAxisId="volume"
                  dataKey="volume"
                  fill={colors.volume}
                  opacity={0.3}
                  name="거래량"
                />
              )}
              
              {/* 추가 지표들 */}
              {indicators.map((indicator) => {
                if (indicator.type === 'bar') {
                  return (
                    <Bar
                      key={indicator.name}
                      yAxisId="price"
                      dataKey={indicator.name}
                      fill={indicator.color}
                      opacity={0.5}
                      name={indicator.name}
                    />
                  )
                } else if (indicator.type === 'area') {
                  return (
                    <Area
                      key={indicator.name}
                      yAxisId="price"
                      type="monotone"
                      dataKey={indicator.name}
                      stroke={indicator.color}
                      fill={indicator.color}
                      fillOpacity={0.2}
                      strokeWidth={1}
                      name={indicator.name}
                    />
                  )
                } else {
                  return (
                    <Line
                      key={indicator.name}
                      yAxisId="price"
                      type="monotone"
                      dataKey={indicator.name}
                      stroke={indicator.color}
                      strokeWidth={1}
                      dot={false}
                      name={indicator.name}
                    />
                  )
                }
              })}
              
              <Brush 
                dataKey="time" 
                height={30} 
                stroke={colors.grid}
                fill="#1F2937"
              />
            </ComposedChart>
          ) : type === 'area' ? (
            <AreaChart data={formattedData}>
              {showGrid && (
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={colors.grid} 
                  opacity={0.3}
                />
              )}
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.area}
                fill={colors.area}
                fillOpacity={0.3}
                strokeWidth={2}
                name="가격"
              />
              {indicators.map((indicator) => (
                <Area
                  key={indicator.name}
                  type="monotone"
                  dataKey={indicator.name}
                  stroke={indicator.color}
                  fill={indicator.color}
                  fillOpacity={0.1}
                  strokeWidth={1}
                  name={indicator.name}
                />
              ))}
            </AreaChart>
          ) : type === 'bar' ? (
            <BarChart data={formattedData}>
              {showGrid && (
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={colors.grid} 
                  opacity={0.3}
                />
              )}
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                fill={colors.volume}
                name="값"
              />
            </BarChart>
          ) : (
            <LineChart data={formattedData}>
              {showGrid && (
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={colors.grid} 
                  opacity={0.3}
                />
              )}
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.line}
                strokeWidth={2}
                dot={false}
                name="가격"
              />
              {indicators.map((indicator) => (
                <Line
                  key={indicator.name}
                  type="monotone"
                  dataKey={indicator.name}
                  stroke={indicator.color}
                  strokeWidth={1}
                  dot={false}
                  name={indicator.name}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      {indicators.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4">
          {indicators.map((indicator) => (
            <div key={indicator.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: indicator.color }}
              />
              <span className="text-xs text-gray-400">{indicator.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

TechnicalChartWrapper.displayName = 'TechnicalChartWrapper'

export default TechnicalChartWrapper