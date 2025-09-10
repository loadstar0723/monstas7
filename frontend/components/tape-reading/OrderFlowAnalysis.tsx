'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6'

interface OrderFlowAnalysisProps {
  symbol: string
}

interface DeltaPoint {
  time: string
  delta: number
  cumDelta: number
}

export default function OrderFlowAnalysis({ symbol }: OrderFlowAnalysisProps) {
  const [deltaData, setDeltaData] = useState<DeltaPoint[]>([])
  const [currentDelta, setCurrentDelta] = useState(0)
  const [cumDelta, setCumDelta] = useState(0)
  const [imbalance, setImbalance] = useState(0)
  const [trend, setTrend] = useState<'bullish' | 'bearish' | 'neutral'>('neutral')
  const [bidAskRatio, setBidAskRatio] = useState(1)
  const [aggression, setAggression] = useState(0)

  useEffect(() => {
    // 초기 과거 데이터 로드
    fetch(`/api/binance/trades?symbol=${symbol}&limit=100`)
      .then(res => res.json())
      .then(trades => {
        if (Array.isArray(trades)) {
          let cumulative = 0
          const historicalData = trades.slice(-30).map((trade: any) => {
            const volume = parseFloat(trade.qty)
            const delta = trade.isBuyerMaker ? -volume : volume
            cumulative += delta
            return {
              time: new Date(trade.time).toLocaleTimeString('ko-KR'),
              delta: delta,
              cumDelta: cumulative
            }
          })
          setDeltaData(historicalData)
          setCumDelta(cumulative)
        }
      })
    
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`)
    let buyVolume = 0
    let sellVolume = 0
    let cumulative = cumDelta
    
    const interval = setInterval(() => {
      const delta = buyVolume - sellVolume
      cumulative += delta
      const newPoint = {
        time: new Date().toLocaleTimeString('ko-KR'),
        delta: delta,
        cumDelta: cumulative
      }
      
      setDeltaData(prev => [...prev.slice(-29), newPoint])
      setCurrentDelta(delta)
      setCumDelta(cumulative)
      
      const imb = buyVolume + sellVolume > 0 ? 
        ((buyVolume - sellVolume) / (buyVolume + sellVolume)) * 100 : 0
      setImbalance(imb)
      
      if (imb > 20) setTrend('bullish')
      else if (imb < -20) setTrend('bearish')
      else setTrend('neutral')
      
      buyVolume = 0
      sellVolume = 0
    }, 5000)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const volume = parseFloat(data.q)
      if (data.m) {
        sellVolume += volume
      } else {
        buyVolume += volume
      }
    }

    return () => {
      ws.close()
      clearInterval(interval)
    }
  }, [symbol])

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">📈 주문 흐름 분석</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gray-900/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs mb-1">현재 델타</p>
            <p className={`font-bold ${currentDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {currentDelta >= 0 ? '+' : ''}{currentDelta.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs mb-1">누적 델타</p>
            <p className={`font-bold ${cumDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {cumDelta >= 0 ? '+' : ''}{cumDelta.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs mb-1">임밸런스</p>
            <p className={`font-bold ${imbalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {imbalance >= 0 ? '+' : ''}{imbalance.toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs mb-1">트렌드</p>
            <div className="flex items-center gap-2">
              {trend === 'bullish' ? (
                <><FaArrowTrendUp className="text-green-400" /><span className="text-green-400 font-bold">상승</span></>
              ) : trend === 'bearish' ? (
                <><FaArrowTrendDown className="text-red-400" /><span className="text-red-400 font-bold">하락</span></>
              ) : (
                <span className="text-gray-400 font-bold">중립</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={deltaData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Line 
              type="monotone" 
              dataKey="cumDelta" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={false}
              name="누적 델타"
            />
            <Line 
              type="monotone" 
              dataKey="delta" 
              stroke="#60A5FA" 
              strokeWidth={1}
              dot={false}
              name="델타"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}