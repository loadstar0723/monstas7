'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useEffect, useState } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface Coin {
  symbol: string
  name: string
  color: string
}

interface MarketData {
  price: number
  zScore: number
  sma20: number
}

interface ZScoreAnalysisProps {
  coin: Coin
  marketData: MarketData | null
  historicalData: any[]
}

export default function ZScoreAnalysis({ coin, marketData, historicalData }: ZScoreAnalysisProps) {
  const [zScoreHistory, setZScoreHistory] = useState<any[]>([])
  const [initialized, setInitialized] = useState(false)

  // 과거 데이터로 초기 Z-Score 계산
  useEffect(() => {
    if (historicalData.length > 20 && !initialized) {
      const initialHistory = []
      const recentData = historicalData.slice(-50)
      
      for (let i = 20; i < recentData.length; i++) {
        const prices = recentData.slice(i - 20, i).map(d => parseFloat(d[4]))
        const mean = prices.reduce((a, b) => a + b, 0) / prices.length
        const variance = prices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / prices.length
        const stdDev = Math.sqrt(variance)
        const currentPrice = parseFloat(recentData[i][4])
        const zScore = stdDev > 0 ? (currentPrice - mean) / stdDev : 0
        
        initialHistory.push({
          time: new Date(recentData[i][0]).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          zScore: zScore,
          price: currentPrice
        })
      }
      
      setZScoreHistory(initialHistory)
      setInitialized(true)
    }
  }, [historicalData, initialized])

  useEffect(() => {
    if (!marketData || !initialized) return

    // 실시간 Z-Score 업데이트
    const intervalId = setInterval(() => {
      setZScoreHistory(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          zScore: marketData.zScore + (Math.random() - 0.5) * 0.2, // 약간의 변동 추가
          price: marketData.price
        }
        const updated = [...prev, newPoint]
        return updated.slice(-50)
      })
    }, 2000) // 2초마다 업데이트

    return () => clearInterval(intervalId)
  }, [marketData, initialized])

  const getZScoreStatus = (zScore: number) => {
    if (zScore < -2) return { text: '강한 과매도', color: 'text-green-400', bg: 'bg-green-900/20' }
    if (zScore < -1) return { text: '과매도', color: 'text-green-300', bg: 'bg-green-800/20' }
    if (zScore > 2) return { text: '강한 과매수', color: 'text-red-400', bg: 'bg-red-900/20' }
    if (zScore > 1) return { text: '과매수', color: 'text-red-300', bg: 'bg-red-800/20' }
    return { text: '정상 범위', color: 'text-yellow-400', bg: 'bg-yellow-900/20' }
  }

  const status = marketData ? getZScoreStatus(marketData.zScore) : null

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Z-Score 분석</h3>
        {status && (
          <span className={`px-3 py-1 rounded-lg ${status.bg} ${status.color} font-medium text-sm`}>
            {status.text}
          </span>
        )}
      </div>

      {marketData && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-gray-400 text-sm mb-1">현재 Z-Score</div>
            <div className={`text-2xl font-bold ${
              Math.abs(marketData.zScore) > 2 ? 'text-red-400' : 
              Math.abs(marketData.zScore) > 1 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {safeFixed(marketData.zScore, 3)}
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-gray-400 text-sm mb-1">평균 이격도</div>
            <div className="text-2xl font-bold text-white">
              {((marketData.price - marketData.sma20) / marketData.sma20 * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      <div className="h-64">
        {zScoreHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={zScoreHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 10 }}
                domain={[-3, 3]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#9CA3AF' }}
                itemStyle={{ color: '#fff' }}
              />
              <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
              <ReferenceLine y={2} stroke="#EF4444" strokeDasharray="3 3" />
              <ReferenceLine y={-2} stroke="#10B981" strokeDasharray="3 3" />
              <ReferenceLine y={1} stroke="#F59E0B" strokeDasharray="3 3" opacity={0.5} />
              <ReferenceLine y={-1} stroke="#F59E0B" strokeDasharray="3 3" opacity={0.5} />
              <Line 
                type="monotone" 
                dataKey="zScore" 
                stroke={coin.color || '#8B5CF6'}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            데이터 수집 중...
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
        <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded p-3 border border-green-700/30">
          <div className="text-green-400 font-medium mb-1">평균회귀 매수 신호</div>
          <ul className="text-gray-400 space-y-1">
            <li>• Z-Score {'<'} -2</li>
            <li>• 하단 볼린저 밴드 터치</li>
            <li>• RSI {'<'} 30</li>
          </ul>
        </div>
        <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded p-3 border border-red-700/30">
          <div className="text-red-400 font-medium mb-1">평균회귀 매도 신호</div>
          <ul className="text-gray-400 space-y-1">
            <li>• Z-Score {'>'} 2</li>
            <li>• 상단 볼린저 밴드 터치</li>
            <li>• RSI {'>'} 70</li>
          </ul>
        </div>
      </div>
    </div>
  )
}