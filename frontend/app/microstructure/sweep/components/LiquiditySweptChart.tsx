'use client'

import React from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

interface SweepData {
  timestamp: number
  price: number
  volume: number
  type: 'aggressive' | 'stealth' | 'ladder' | 'iceberg'
  impact: number
  side: 'buy' | 'sell'
}

interface LiquiditySweptChartProps {
  sweeps: SweepData[]
}

export default function LiquiditySweptChart({ sweeps = [] }: LiquiditySweptChartProps) {
  // 시간별로 데이터 집계
  const chartData = React.useMemo(() => {
    const last30Sweeps = sweeps.slice(-30)
    
    return last30Sweeps.map((sweep, index) => ({
      index: index + 1,
      time: new Date(sweep.timestamp).toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }),
      volume: sweep.volume,
      buyVolume: sweep.side === 'buy' ? sweep.volume : 0,
      sellVolume: sweep.side === 'sell' ? sweep.volume : 0,
      impact: sweep.impact,
      type: sweep.type,
      price: sweep.price
    }))
  }, [sweeps])

  // 누적 볼륨 계산
  const cumulativeData = React.useMemo(() => {
    let cumBuy = 0
    let cumSell = 0
    
    return chartData.map(data => {
      cumBuy += data.buyVolume
      cumSell += data.sellVolume
      
      return {
        ...data,
        cumulativeBuy: cumBuy,
        cumulativeSell: cumSell,
        netCumulative: cumBuy - cumSell
      }
    })
  }, [chartData])

  // 스윕 타입별 색상
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'aggressive': return '#ef4444'
      case 'stealth': return '#3b82f6'
      case 'ladder': return '#10b981'
      case 'iceberg': return '#a855f7'
      default: return '#6b7280'
    }
  }

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold text-sm mb-2">{data.time}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">거래량</span>
              <span className="text-white font-medium">{data.volume.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">영향도</span>
              <span className="text-yellow-400 font-medium">{data.impact.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">타입</span>
              <span className="font-medium" style={{ color: getTypeColor(data.type) }}>
                {data.type}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">가격</span>
              <span className="text-purple-400 font-medium">${data.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // 통계 계산
  const stats = React.useMemo(() => {
    if (sweeps.length === 0) return null
    
    const totalBuyVolume = sweeps.filter(s => s.side === 'buy').reduce((sum, s) => sum + s.volume, 0)
    const totalSellVolume = sweeps.filter(s => s.side === 'sell').reduce((sum, s) => sum + s.volume, 0)
    const avgImpact = sweeps.reduce((sum, s) => sum + s.impact, 0) / sweeps.length
    
    const typeCount = sweeps.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalBuyVolume,
      totalSellVolume,
      netVolume: totalBuyVolume - totalSellVolume,
      avgImpact,
      typeCount,
      dominantType: Object.entries(typeCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'
    }
  }, [sweeps])

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">유동성 소진 분석</h3>
      </div>
      
      <div className="space-y-8">
        {/* 볼륨 차트 */}
        <div>
          <h4 className="text-sm text-gray-400 mb-4">거래량 플로우</h4>
          <div className="h-64 bg-gray-800/30 p-4 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="index" 
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
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="rect"
                  formatter={(value) => <span style={{ color: '#e5e7eb' }}>{value === 'Buy Sweep' ? '매수 스윕' : '매도 스윕'}</span>}
                />
                <Bar dataKey="buyVolume" fill="#10b981" name="Buy Sweep" stackId="stack" />
                <Bar dataKey="sellVolume" fill="#ef4444" name="Sell Sweep" stackId="stack" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 누적 차트 */}
        <div>
          <h4 className="text-sm text-gray-400 mb-4">누적 유동성</h4>
          <div className="h-48 bg-gray-800/30 p-4 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="index" 
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
                <ReferenceLine y={0} stroke="#8b5cf6" strokeDasharray="5 5" />
                <Area 
                  type="monotone" 
                  dataKey="netCumulative" 
                  stroke="#8b5cf6"
                  fill="url(#purpleGradient)"
                  name="순 누적"
                />
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 가격 영향 차트 */}
        <div>
          <h4 className="text-sm text-gray-400 mb-4">가격 영향도</h4>
          <div className="h-48 bg-gray-800/30 p-4 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="index" 
                  stroke="#6b7280"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                  domain={[0, 'dataMax + 1']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="impact" 
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={{ fill: '#fbbf24', r: 4 }}
                  name="영향도 %"
                />
                <ReferenceLine y={2} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "위험 수준", fill: "#ef4444", fontSize: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 통계 요약 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-green-900/20 p-4 rounded-lg border border-green-800/30">
              <p className="text-xs text-green-400 mb-2">매수 스윕</p>
              <p className="text-2xl font-bold text-green-400">{stats.totalBuyVolume.toFixed(2)}</p>
            </div>
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-800/30">
              <p className="text-xs text-red-400 mb-2">매도 스윕</p>
              <p className="text-2xl font-bold text-red-400">{stats.totalSellVolume.toFixed(2)}</p>
            </div>
            <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-800/30">
              <p className="text-xs text-purple-400 mb-2">순 거래량</p>
              <p className={`text-2xl font-bold ${stats.netVolume > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.netVolume > 0 ? '+' : ''}{stats.netVolume.toFixed(2)}
              </p>
            </div>
            <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-800/30">
              <p className="text-xs text-yellow-400 mb-2">평균 영향도</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.avgImpact.toFixed(2)}%</p>
            </div>
          </div>
        )}

        {/* 스윕 타입 분포 */}
        {stats && stats.typeCount && Object.keys(stats.typeCount).length > 0 && (
          <div className="bg-gray-800/30 p-6 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-4">타입별 분포</h4>
            <div className="space-y-3">
              {Object.entries(stats.typeCount).map(([type, count]) => (
                <div key={type} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium" style={{ color: getTypeColor(type) }}>
                    {type === 'aggressive' ? '공격적' : 
                     type === 'stealth' ? '스텔스' :
                     type === 'ladder' ? '래더' :
                     type === 'iceberg' ? '빙산' : type}
                  </div>
                  <div className="flex-1 bg-gray-700 h-2 rounded-full relative overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ 
                        width: `${(count / sweeps.length) * 100}%`,
                        backgroundColor: getTypeColor(type)
                      }}
                    />
                  </div>
                  <div className="text-sm text-white w-8 text-right font-medium">{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}