'use client'

import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

interface SweepData {
  timestamp: number
  price: number
  volume: number
  type: 'aggressive' | 'stealth' | 'ladder' | 'iceberg'
  impact: number
  side: 'buy' | 'sell'
}

interface SweepVolumeAnalysisProps {
  sweeps: SweepData[]
}

export default function SweepVolumeAnalysis({ sweeps }: SweepVolumeAnalysisProps) {
  // 시간대별 분석
  const timeAnalysis = useMemo(() => {
    const hourlyData: Record<number, { volume: number, count: number, buyVolume: number, sellVolume: number }> = {}
    
    sweeps.forEach(sweep => {
      const hour = new Date(sweep.timestamp).getHours()
      if (!hourlyData[hour]) {
        hourlyData[hour] = { volume: 0, count: 0, buyVolume: 0, sellVolume: 0 }
      }
      hourlyData[hour].volume += sweep.volume
      hourlyData[hour].count += 1
      if (sweep.side === 'buy') {
        hourlyData[hour].buyVolume += sweep.volume
      } else {
        hourlyData[hour].sellVolume += sweep.volume
      }
    })
    
    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour: `${hour}h`,
      ...data,
      avgVolume: data.volume / data.count
    }))
  }, [sweeps])

  // 방향별 분석
  const directionAnalysis = useMemo(() => {
    const buyData = sweeps.filter(s => s.side === 'buy')
    const sellData = sweeps.filter(s => s.side === 'sell')
    
    const buyVolume = buyData.reduce((sum, s) => sum + s.volume, 0)
    const sellVolume = sellData.reduce((sum, s) => sum + s.volume, 0)
    const totalVolume = buyVolume + sellVolume
    
    return [
      { 
        name: 'Buy Sweep', 
        value: buyVolume, 
        percentage: totalVolume > 0 ? (buyVolume / totalVolume * 100).toFixed(1) : '0',
        count: buyData.length
      },
      { 
        name: 'Sell Sweep', 
        value: sellVolume, 
        percentage: totalVolume > 0 ? (sellVolume / totalVolume * 100).toFixed(1) : '0',
        count: sellData.length
      }
    ]
  }, [sweeps])

  // 타입별 통계
  const typeStats = useMemo(() => {
    const stats = {
      aggressive: { count: 0, volume: 0, avgImpact: 0 },
      stealth: { count: 0, volume: 0, avgImpact: 0 },
      ladder: { count: 0, volume: 0, avgImpact: 0 },
      iceberg: { count: 0, volume: 0, avgImpact: 0 }
    }
    
    sweeps.forEach(sweep => {
      stats[sweep.type].count += 1
      stats[sweep.type].volume += sweep.volume
      stats[sweep.type].avgImpact += sweep.impact
    })
    
    Object.keys(stats).forEach(type => {
      const key = type as keyof typeof stats
      if (stats[key].count > 0) {
        stats[key].avgImpact /= stats[key].count
      }
    })
    
    return stats
  }, [sweeps])

  // 색상 테마
  const COLORS = {
    buy: '#10b981',
    sell: '#ef4444',
    aggressive: '#ef4444',
    stealth: '#3b82f6',
    ladder: '#10b981',
    iceberg: '#a855f7'
  }

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4">
              <span className="text-gray-400 text-xs">
                {entry.name === 'Buy' ? '매수' : 
                 entry.name === 'Sell' ? '매도' :
                 entry.name === 'Buy Sweep' ? '매수 스윕' :
                 entry.name === 'Sell Sweep' ? '매도 스윕' : entry.name}
              </span>
              <span className="text-white font-medium">{entry.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // 커스텀 레전드
  const CustomLegend = (props: any) => {
    const { payload } = props
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-400">
              {entry.value === 'Buy' ? '매수' : 
               entry.value === 'Sell' ? '매도' : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">거래량 분석</h3>
      </div>
      
      <div className="space-y-8">
        {/* 방향별 분포 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm text-gray-400 mb-4">방향별 분포</h4>
            <div className="h-64">
              {directionAnalysis[0].value > 0 || directionAnalysis[1].value > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={directionAnalysis}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentage }) => `${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS.buy} />
                      <Cell fill={COLORS.sell} />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">데이터 대기 중</div>
                    <p className="text-xs text-gray-500">스윕 감지 중...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* 방향별 통계 */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {directionAnalysis.map((data) => (
                <div key={data.name} className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: data.name === 'Buy Sweep' ? COLORS.buy : COLORS.sell }}
                    />
                    <p className="text-xs text-gray-400">{data.name === 'Buy Sweep' ? '매수 스윕' : '매도 스윕'}</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{data.value.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">{data.count}회 감지</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* 타입별 분석 */}
          <div>
            <h4 className="text-sm text-gray-400 mb-4">타입별 특성</h4>
            <div className="space-y-3">
              {Object.entries(typeStats).map(([type, stats]) => (
                <div key={type} className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: COLORS[type as keyof typeof COLORS] }}
                      />
                      <span className="text-sm font-medium text-white">
                        {type === 'aggressive' ? '공격적' :
                         type === 'stealth' ? '스텔스' :
                         type === 'ladder' ? '래더' :
                         type === 'iceberg' ? '빙산' : type}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{stats.count}회</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">거래량</span>
                      <p className="text-white font-medium mt-1">{stats.volume.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">평균 영향도</span>
                      <p className="text-white font-medium mt-1">{stats.avgImpact.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 시간대별 분석 */}
        <div>
          <h4 className="text-sm text-gray-400 mb-4">시간대별 활동</h4>
          <div className="h-64 bg-gray-800/30 p-4 rounded-lg">
            {timeAnalysis.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#6b7280"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#4b5563' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#4b5563' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                  <Bar dataKey="buyVolume" stackId="a" fill={COLORS.buy} name="매수" />
                  <Bar dataKey="sellVolume" stackId="a" fill={COLORS.sell} name="매도" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">시간별 데이터 수집 중</div>
                  <p className="text-xs text-gray-500">데이터를 모으고 있습니다...</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 요약 인사이트 */}
        <div className="bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-sm text-gray-400 mb-4">분석 인사이트</h4>
          <div className="space-y-3">
            {directionAnalysis[0].value > directionAnalysis[1].value ? (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1" />
                <p className="text-sm text-gray-300">매수 스윕이 우세하여 <span className="text-green-400 font-medium">상승 압력</span> 존재</p>
              </div>
            ) : directionAnalysis[1].value > directionAnalysis[0].value ? (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1" />
                <p className="text-sm text-gray-300">매도 스윕이 우세하여 <span className="text-red-400 font-medium">하락 압력</span> 존재</p>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1" />
                <p className="text-sm text-gray-300">매수/매도 스윕이 균형 상태</p>
              </div>
            )}
            
            {typeStats.aggressive.count > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1" />
                <p className="text-sm text-gray-300"><span className="text-red-400 font-medium">공격적 스윕</span> {typeStats.aggressive.count}회 감지 - 높은 변동성</p>
              </div>
            )}
            
            {timeAnalysis.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1" />
                <p className="text-sm text-gray-300">가장 활발한 시간: <span className="text-purple-400 font-medium">
                  {timeAnalysis.reduce((max, curr) => curr.volume > max.volume ? curr : max).hour}
                </span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}