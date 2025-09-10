'use client'

import React, { useMemo } from 'react'
import { ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Scatter } from 'recharts'

interface SweepData {
  timestamp: number
  price: number
  volume: number
  type: 'aggressive' | 'stealth' | 'ladder' | 'iceberg'
  impact: number
  side: 'buy' | 'sell'
}

interface PriceImpactChartProps {
  sweeps: SweepData[]
  currentPrice: number
  symbol?: string
}

export default function PriceImpactChart({ sweeps, currentPrice, symbol = 'BTCUSDT' }: PriceImpactChartProps) {
  // 차트 데이터 준비
  const chartData = useMemo(() => {
    return sweeps.slice(-50).map((sweep, index) => {
      const priceChange = ((sweep.price - currentPrice) / currentPrice) * 100
      
      return {
        index: index + 1,
        time: new Date(sweep.timestamp).toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        price: sweep.price,
        priceChange,
        impact: sweep.impact,
        volume: sweep.volume,
        volumeImpact: sweep.volume * sweep.impact / 100, // 볼륨 가중 임팩트
        side: sweep.side,
        type: sweep.type,
        impactDirection: sweep.side === 'buy' ? sweep.impact : -sweep.impact
      }
    })
  }, [sweeps, currentPrice])

  // 임팩트 레벨별 통계
  const impactLevels = useMemo(() => {
    const levels = {
      low: { count: 0, avgVolume: 0, totalVolume: 0 },      // < 1%
      medium: { count: 0, avgVolume: 0, totalVolume: 0 },   // 1-3%
      high: { count: 0, avgVolume: 0, totalVolume: 0 },     // 3-5%
      extreme: { count: 0, avgVolume: 0, totalVolume: 0 }   // > 5%
    }
    
    sweeps.forEach(sweep => {
      let level: keyof typeof levels
      if (sweep.impact < 1) level = 'low'
      else if (sweep.impact < 3) level = 'medium'
      else if (sweep.impact < 5) level = 'high'
      else level = 'extreme'
      
      levels[level].count += 1
      levels[level].totalVolume += sweep.volume
    })
    
    // 평균 계산
    Object.keys(levels).forEach(key => {
      const level = key as keyof typeof levels
      if (levels[level].count > 0) {
        levels[level].avgVolume = levels[level].totalVolume / levels[level].count
      }
    })
    
    return levels
  }, [sweeps])

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold text-sm mb-2">{data.time}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center gap-4">
              <span className="text-gray-400 text-xs">가격</span>
              <span className="text-white font-medium">
                ${data.price.toFixed(2)}
                <span className={`ml-2 ${data.priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({data.priceChange > 0 ? '+' : ''}{data.priceChange.toFixed(2)}%)
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-gray-400 text-xs">영향도</span>
              <span className={`font-medium ${data.impact > 3 ? 'text-red-400' : data.impact > 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                {data.impact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-gray-400 text-xs">거래량</span>
              <span className="text-white font-medium">{data.volume.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-gray-400 text-xs">타입</span>
              <span className="text-white font-medium">
                {data.type === 'aggressive' ? '공격적' :
                 data.type === 'stealth' ? '스텔스' :
                 data.type === 'ladder' ? '래더' : '빙산'}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-gray-400 text-xs">방향</span>
              <span className={`font-medium ${data.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                {data.side === 'buy' ? '매수' : '매도'}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // 임팩트 색상
  const getImpactColor = (impact: number) => {
    if (impact > 5) return '#ef4444' // 극도로 높음
    if (impact > 3) return '#f59e0b' // 높음
    if (impact > 1) return '#fbbf24' // 중간
    return '#10b981' // 낮음
  }

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            가격 영향도 분석 - {symbol.replace('USDT', '')}
          </h3>
          <span className="text-sm text-gray-400">
            현재가: ${currentPrice.toFixed(2)}
          </span>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* 메인 임팩트 차트 */}
        <div>
          <h4 className="text-sm text-gray-400 mb-4">스윕 영향도 & 가격 움직임</h4>
          <div className="h-80 bg-gray-800/30 p-4 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="index" 
                  stroke="#6b7280"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                />
                <YAxis 
                  yAxisId="price"
                  orientation="left"
                  stroke="#6b7280"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                  domain={['dataMin - 10', 'dataMax + 10']}
                />
                <YAxis 
                  yAxisId="impact"
                  orientation="right"
                  stroke="#6b7280"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                  domain={[0, 'dataMax + 1']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="rect"
                  formatter={(value) => {
                    if (value === 'Impact %') return '영향도 %'
                    if (value === 'Price') return '가격'
                    if (value === 'Volume Impact') return '거래량 영향도'
                    return value
                  }}
                />
                
                <ReferenceLine 
                  y={currentPrice} 
                  yAxisId="price"
                  stroke="#8b5cf6" 
                  strokeDasharray="5 5" 
                  label={{ value: "현재가", position: "left", fill: "#8b5cf6", fontSize: 10 }}
                />
                
                <ReferenceLine 
                  y={3} 
                  yAxisId="impact"
                  stroke="#ef4444" 
                  strokeDasharray="5 5" 
                  label={{ value: "고위험", position: "right", fill: "#ef4444", fontSize: 10 }}
                />
                
                <Area
                  yAxisId="impact"
                  type="monotone"
                  dataKey="impact"
                  fill="url(#impactGradient)"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  name="Impact %"
                />
                
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="price"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 3 }}
                  name="Price"
                />
                
                <Bar
                  yAxisId="impact"
                  dataKey="volumeImpact"
                  fill="#60a5fa"
                  opacity={0.6}
                  name="Volume Impact"
                />
                
                <defs>
                  <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 방향별 임팩트 */}
        <div>
          <h4 className="text-sm text-gray-400 mb-4">방향별 영향도</h4>
          <div className="h-48 bg-gray-800/30 p-4 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
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
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
                
                <Bar
                  dataKey="impactDirection"
                  fill={(data: any) => data.side === 'buy' ? '#10b981' : '#ef4444'}
                  name="방향별 영향도"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 임팩트 레벨 통계 */}
        <div>
          <h4 className="text-sm text-gray-400 mb-4">영향도 레벨 분포</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-green-900/20 p-4 rounded-lg border border-green-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-green-400">낮음 &lt;1%</span>
                <span className="text-xs text-gray-400">{impactLevels.low.count}회</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {impactLevels.low.avgVolume.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">평균 거래량</p>
            </div>
            
            <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-yellow-400">중간 1-3%</span>
                <span className="text-xs text-gray-400">{impactLevels.medium.count}회</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">
                {impactLevels.medium.avgVolume.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">평균 거래량</p>
            </div>
            
            <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-orange-400">높음 3-5%</span>
                <span className="text-xs text-gray-400">{impactLevels.high.count}회</span>
              </div>
              <p className="text-2xl font-bold text-orange-400">
                {impactLevels.high.avgVolume.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">평균 거래량</p>
            </div>
            
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-red-400">극도 &gt;5%</span>
                <span className="text-xs text-gray-400">{impactLevels.extreme.count}회</span>
              </div>
              <p className="text-2xl font-bold text-red-400">
                {impactLevels.extreme.avgVolume.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">평균 거래량</p>
            </div>
          </div>
        </div>

        {/* 임팩트 예측 */}
        <div className="bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-sm text-gray-400 mb-4">영향도 트레이딩 시그널</h4>
          <div className="space-y-3">
            {impactLevels.extreme.count > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1 animate-pulse" />
                <p className="text-sm text-gray-300">
                  극도의 영향도 스윕 {impactLevels.extreme.count}회 감지 
                  <span className="text-red-400 font-medium"> 높은 변동성 경고</span>
                </p>
              </div>
            )}
            
            {impactLevels.high.count > impactLevels.low.count && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1" />
                <p className="text-sm text-gray-300">
                  높은 영향도 스윕 빈번 
                  <span className="text-yellow-400 font-medium"> 추세 전환 가능성</span>
                </p>
              </div>
            )}
            
            {chartData.length > 0 && chartData[chartData.length - 1].impact > 3 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1" />
                <p className="text-sm text-gray-300">
                  최근 스윕 영향도 높음 
                  <span className="text-orange-400 font-medium"> 단기 조정 예상</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}