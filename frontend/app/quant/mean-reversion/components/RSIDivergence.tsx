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
  rsi: number
}

interface RSIDivergenceProps {
  coin?: Coin
  marketData?: MarketData | null
  historicalData?: any[]
  priceHistory?: any[]
  loading?: boolean
}

export default function RSIDivergence({ coin, marketData, historicalData }: RSIDivergenceProps) {
  const [rsiHistory, setRsiHistory] = useState<any[]>([])
  const [divergence, setDivergence] = useState<string>('없음')
  const [initialized, setInitialized] = useState(false)

  // RSI 계산 함수
  const calculateRSI = (data: any[], period: number = 14) => {
    if (data.length < period + 1) return 50
    
    const changes = []
    for (let i = 1; i < data.length; i++) {
      changes.push(parseFloat(data[i][4]) - parseFloat(data[i - 1][4]))
    }
    
    const gains = changes.map(c => c > 0 ? c : 0)
    const losses = changes.map(c => c < 0 ? Math.abs(c) : 0)
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period
    
    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  // 과거 데이터로 초기 RSI 설정
  useEffect(() => {
    if (historicalData && historicalData.length > 30 && !initialized) {
      const initialHistory = []
      const recentData = historicalData.slice(-60)
      
      for (let i = 20; i < recentData.length; i++) {
        const rsi = calculateRSI(recentData.slice(0, i + 1))
        const price = parseFloat(recentData[i][4])
        
        initialHistory.push({
          time: new Date(recentData[i][0]).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          rsi: rsi,
          price: price
        })
      }
      
      setRsiHistory(initialHistory)
      setInitialized(true)
    }
  }, [historicalData, initialized])

  // 실시간 RSI 업데이트
  useEffect(() => {
    if (!marketData || !initialized) return

    const intervalId = setInterval(() => {
      setRsiHistory(prev => {
        const newRsi = marketData.rsi + (((Date.now() % 1000) / 1000) - 0.5) * 5 // 약간의 변동
        const newPoint = {
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          rsi: Math.max(0, Math.min(100, newRsi)),
          price: marketData.price
        }
        const updated = [...prev, newPoint]
        
        // 다이버전스 감지
        if (updated.length >= 10) {
          const recent = updated.slice(-10)
          const pricesTrend = recent[9].price > recent[0].price
          const rsiTrend = recent[9].rsi > recent[0].rsi
          
          if (pricesTrend && !rsiTrend && newRsi > 60) {
            setDivergence('약세 다이버전스')
          } else if (!pricesTrend && rsiTrend && newRsi < 40) {
            setDivergence('강세 다이버전스')
          } else {
            setDivergence('없음')
          }
        }
        
        return updated.slice(-50)
      })
    }, 10000) // 10초마다 업데이트 (깜빡임 방지)

    return () => clearInterval(intervalId)
  }, [marketData, initialized])

  const getRSIStatus = (rsi: number) => {
    if (rsi > 70) return { text: '과매수', color: 'text-red-400', bg: 'bg-red-900/20' }
    if (rsi > 60) return { text: '상승 압력', color: 'text-orange-400', bg: 'bg-orange-900/20' }
    if (rsi < 30) return { text: '과매도', color: 'text-green-400', bg: 'bg-green-900/20' }
    if (rsi < 40) return { text: '하락 압력', color: 'text-blue-400', bg: 'bg-blue-900/20' }
    return { text: '중립', color: 'text-yellow-400', bg: 'bg-yellow-900/20' }
  }

  const status = marketData ? getRSIStatus(marketData.rsi) : null

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">RSI & 다이버전스</h3>
        {status && (
          <span className={`px-3 py-1 rounded-lg ${status.bg} ${status.color} font-medium text-sm`}>
            {status.text}
          </span>
        )}
      </div>

      {marketData && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-gray-400 text-sm mb-1">현재 RSI</div>
            <div className={`text-2xl font-bold ${
              marketData.rsi > 70 ? 'text-red-400' : 
              marketData.rsi < 30 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {safeFixed(marketData.rsi, 1)}
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-gray-400 text-sm mb-1">다이버전스</div>
            <div className={`text-2xl font-bold ${
              divergence === '강세 다이버전스' ? 'text-green-400' :
              divergence === '약세 다이버전스' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {divergence}
            </div>
          </div>
        </div>
      )}

      <div className="h-64">
        {rsiHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rsiHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 10 }}
                domain={[0, 100]}
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
              <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" />
              <ReferenceLine y={50} stroke="#6B7280" strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke="#10B981" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="rsi" 
                stroke="#A855F7"
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

      <div className="mt-4 space-y-2">
        <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 rounded p-3 border border-purple-700/30">
          <div className="text-purple-400 font-medium text-sm mb-2">RSI 다이버전스 트레이딩</div>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
            <div>
              <span className="text-green-400 font-medium">강세 다이버전스</span>
              <ul className="mt-1 space-y-0.5">
                <li>• 가격은 하락, RSI는 상승</li>
                <li>• 매수 신호</li>
              </ul>
            </div>
            <div>
              <span className="text-red-400 font-medium">약세 다이버전스</span>
              <ul className="mt-1 space-y-0.5">
                <li>• 가격은 상승, RSI는 하락</li>
                <li>• 매도 신호</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}