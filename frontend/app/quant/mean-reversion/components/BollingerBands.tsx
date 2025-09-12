'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts'
import { useEffect, useState } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface Coin {
  symbol: string
  name: string
  color: string
}

interface MarketData {
  price: number
  upperBand: number
  lowerBand: number
  sma20: number
}

interface BollingerBandsProps {
  coin: Coin
  historicalData: any[]
  marketData: MarketData | null
}

export default function BollingerBands({ coin, historicalData, marketData }: BollingerBandsProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (historicalData.length > 0) {
      // 최근 100개 데이터만 사용
      const recentData = historicalData.slice(-100)
      
      const formattedData = recentData.map((d: any, index: number) => {
        const close = parseFloat(d[4])
        
        // 볼린저 밴드 계산
        const bbData = calculateBollingerBandsAtPoint(recentData, index, 20, 2)
        
        return {
          time: new Date(d[0]).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
          price: close,
          upper: bbData?.upper || null,
          middle: bbData?.middle || null,
          lower: bbData?.lower || null,
        }
      })
      
      setChartData(formattedData)
    }
  }, [historicalData])

  // 실시간 데이터 업데이트
  useEffect(() => {
    if (marketData && chartData.length > 0) {
      const updatedData = [...chartData]
      const lastIndex = updatedData.length - 1
      
      // 마지막 데이터 업데이트
      updatedData[lastIndex] = {
        ...updatedData[lastIndex],
        price: marketData.price,
        upper: marketData.upperBand,
        middle: marketData.sma20,
        lower: marketData.lowerBand,
      }
      
      setChartData(updatedData)
    }
  }, [marketData])

  const calculateBollingerBandsAtPoint = (data: any[], index: number, period: number, stdDev: number) => {
    if (index < period - 1) return null
    
    let sum = 0
    const prices = []
    
    for (let i = 0; i < period; i++) {
      const price = parseFloat(data[index - i][4])
      sum += price
      prices.push(price)
    }
    
    const sma = sum / period
    const variance = prices.reduce((acc, price) => acc + Math.pow(price - sma, 2), 0) / period
    const std = Math.sqrt(variance)
    
    return {
      upper: sma + (std * stdDev),
      middle: sma,
      lower: sma - (std * stdDev)
    }
  }

  const getBandPosition = () => {
    if (!marketData) return 50
    const range = marketData.upperBand - marketData.lowerBand
    const position = ((marketData.price - marketData.lowerBand) / range) * 100
    return Math.min(100, Math.max(0, position))
  }

  const bandPosition = getBandPosition()
  const bandStatus = bandPosition > 80 ? '과매수' : bandPosition < 20 ? '과매도' : '중립'
  const bandColor = bandPosition > 80 ? 'text-red-400' : bandPosition < 20 ? 'text-green-400' : 'text-yellow-400'

  const formatTooltipValue = (value: any) => {
    if (value === null || value === undefined) return '-'
    return `$${safeFixed(value, 2)}`
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">볼린저 밴드 분석</h3>
        <div className="flex items-center gap-4">
          <span className={`font-bold ${bandColor}`}>{bandStatus}</span>
          <span className="text-sm text-gray-400">포지션: {safeFixed(bandPosition, 0)}%</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fontSize: 10 }}
            domain={['dataMin - 100', 'dataMax + 100']}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#9CA3AF' }}
            formatter={formatTooltipValue}
          />
          
          {/* 볼린저 밴드 영역 */}
          <Area 
            type="monotone" 
            dataKey="upper" 
            stroke="transparent"
            fill="#EF444420"
            connectNulls
            isAnimationActive={false}
          />
          <Area 
            type="monotone" 
            dataKey="lower" 
            stroke="transparent"
            fill="#10B98120"
            connectNulls
            isAnimationActive={false}
          />
          
          {/* 상단 밴드 */}
          <Line 
            type="monotone" 
            dataKey="upper" 
            stroke="#EF4444"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            name="상단 밴드"
            connectNulls
            isAnimationActive={false}
          />
          
          {/* 중간선 (SMA 20) */}
          <Line 
            type="monotone" 
            dataKey="middle" 
            stroke="#3B82F6"
            strokeWidth={1}
            dot={false}
            name="SMA 20"
            connectNulls
            isAnimationActive={false}
          />
          
          {/* 하단 밴드 */}
          <Line 
            type="monotone" 
            dataKey="lower" 
            stroke="#10B981"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            name="하단 밴드"
            connectNulls
            isAnimationActive={false}
          />
          
          {/* 가격 라인 */}
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={coin.color || '#8B5CF6'}
            strokeWidth={2}
            dot={false}
            name="가격"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-3 gap-4 text-sm mt-4">
        <div className="bg-black/30 rounded p-3">
          <div className="text-gray-400 mb-1">상단 밴드</div>
          <div className="text-red-400 font-bold">
            ${marketData?.upperBand?.toFixed(2) || '-'}
          </div>
        </div>
        <div className="bg-black/30 rounded p-3">
          <div className="text-gray-400 mb-1">중간선 (SMA)</div>
          <div className="text-blue-400 font-bold">
            ${marketData?.sma20?.toFixed(2) || '-'}
          </div>
        </div>
        <div className="bg-black/30 rounded p-3">
          <div className="text-gray-400 mb-1">하단 밴드</div>
          <div className="text-green-400 font-bold">
            ${marketData?.lowerBand?.toFixed(2) || '-'}
          </div>
        </div>
      </div>
    </div>
  )
}