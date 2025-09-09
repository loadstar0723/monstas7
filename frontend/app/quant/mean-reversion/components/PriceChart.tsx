'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useEffect, useState } from 'react'

interface Coin {
  symbol: string
  name: string
  icon: string
  color: string
}

interface MarketData {
  price: number
  sma20: number
  sma50: number
  sma200: number
  upperBand: number
  lowerBand: number
}

interface PriceChartProps {
  coin: Coin
  historicalData: any[]
  marketData: MarketData | null
}

export default function PriceChart({ coin, historicalData, marketData }: PriceChartProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (historicalData.length > 0) {
      // 최근 100개 데이터만 사용
      const recentData = historicalData.slice(-100)
      
      const formattedData = recentData.map((d: any, index: number) => {
        const close = parseFloat(d[4])
        
        // SMA 계산
        const sma20 = calculateSMAAtPoint(recentData, index, 20)
        const sma50 = calculateSMAAtPoint(recentData, index, 50)
        const sma200 = calculateSMAAtPoint(recentData, index, 200)
        
        return {
          time: new Date(d[0]).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
          price: close,
          sma20: sma20,
          sma50: sma50,
          sma200: index >= 199 ? sma200 : null, // 200일 이상 데이터가 있을 때만 표시
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
        sma20: marketData.sma20,
        sma50: marketData.sma50,
        sma200: marketData.sma200,
      }
      
      setChartData(updatedData)
    }
  }, [marketData])

  const calculateSMAAtPoint = (data: any[], index: number, period: number) => {
    if (index < period - 1) return null
    
    let sum = 0
    for (let i = 0; i < period; i++) {
      sum += parseFloat(data[index - i][4])
    }
    return sum / period
  }

  const formatTooltipValue = (value: any) => {
    if (value === null || value === undefined) return '-'
    return `$${value.toFixed(2)}`
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span style={{ color: coin.color }}>{coin.icon}</span>
          {coin.name} 가격 차트
        </h3>
        <div className="text-sm text-gray-400">
          현재: ${marketData?.price.toFixed(2) || '-'}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          
          {/* 가격 라인 */}
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={coin.color || '#10B981'}
            strokeWidth={2}
            dot={false}
            name="가격"
            isAnimationActive={false}
          />
          
          {/* SMA 20 */}
          <Line 
            type="monotone" 
            dataKey="sma20" 
            stroke="#3B82F6"
            strokeWidth={1}
            dot={false}
            name="SMA 20"
            connectNulls
            isAnimationActive={false}
          />
          
          {/* SMA 50 */}
          <Line 
            type="monotone" 
            dataKey="sma50" 
            stroke="#A855F7"
            strokeWidth={1}
            dot={false}
            name="SMA 50"
            connectNulls
            isAnimationActive={false}
          />
          
          {/* SMA 200 */}
          <Line 
            type="monotone" 
            dataKey="sma200" 
            stroke="#F97316"
            strokeWidth={1}
            dot={false}
            name="SMA 200"
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
        <div className="bg-black/30 rounded p-2">
          <div className="text-gray-400">현재가</div>
          <div className="text-white font-bold">${marketData?.price.toFixed(2) || '-'}</div>
        </div>
        <div className="bg-black/30 rounded p-2">
          <div className="text-gray-400">SMA 20</div>
          <div className="text-blue-400 font-bold">${marketData?.sma20.toFixed(2) || '-'}</div>
        </div>
        <div className="bg-black/30 rounded p-2">
          <div className="text-gray-400">SMA 50</div>
          <div className="text-purple-400 font-bold">${marketData?.sma50.toFixed(2) || '-'}</div>
        </div>
        <div className="bg-black/30 rounded p-2">
          <div className="text-gray-400">SMA 200</div>
          <div className="text-orange-400 font-bold">${marketData?.sma200.toFixed(2) || '-'}</div>
        </div>
      </div>
    </div>
  )
}