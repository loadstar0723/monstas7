'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface PriceActionProps {
  symbol: string
  currentPrice: number
}

export default function PriceAction({ symbol, currentPrice }: PriceActionProps) {
  const [priceData, setPriceData] = useState<any[]>([])
  const [support, setSupport] = useState(0)
  const [resistance, setResistance] = useState(0)
  const [trend, setTrend] = useState<'up' | 'down' | 'sideways'>('sideways')

  useEffect(() => {
    fetchPriceData()
  }, [symbol])

  const fetchPriceData = async () => {
    try {
      const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=15m&limit=96`)
      const klines = await response.json()
      
      if (Array.isArray(klines)) {
        const data = klines.map((k: any) => ({
          time: new Date(k[0]).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          price: parseFloat(k[4]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          volume: parseFloat(k[5])
        }))
        
        setPriceData(data.slice(-48)) // 최근 48개 캔들만 표시
        
        // 고급 지지/저항 계산 - 피벗 포인트 방식
        const latestCandle = klines[klines.length - 1]
        const high = parseFloat(latestCandle[2])
        const low = parseFloat(latestCandle[3])
        const close = parseFloat(latestCandle[4])
        
        const pivot = (high + low + close) / 3
        const r1 = (2 * pivot) - low
        const s1 = (2 * pivot) - high
        
        setResistance(r1)
        setSupport(s1)
        
        // 추세 판단
        const firstPrice = data[0]?.price || 0
        const lastPrice = data[data.length - 1]?.price || 0
        const change = ((lastPrice - firstPrice) / firstPrice) * 100
        
        if (change > 1) setTrend('up')
        else if (change < -1) setTrend('down')
        else setTrend('sideways')
      }
    } catch (error) {
      console.error('가격 데이터 로드 실패:', error)
    }
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">📈 가격 액션 분석</h3>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-900/30 rounded-lg p-2">
            <p className="text-red-400 text-xs mb-1">저항선</p>
            <p className="text-white font-bold">${safeFixed(resistance, 2)}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs mb-1">현재가</p>
            <p className="text-white font-bold">${safePrice(currentPrice, 2)}</p>
          </div>
          <div className="bg-green-900/30 rounded-lg p-2">
            <p className="text-green-400 text-xs mb-1">지지선</p>
            <p className="text-white font-bold">${safeFixed(support, 2)}</p>
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-gray-900/50 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">추세 판단</p>
          <p className={`font-bold ${
            trend === 'up' ? 'text-green-400' : 
            trend === 'down' ? 'text-red-400' : 
            'text-yellow-400'
          }`}>
            {trend === 'up' ? '상승 추세' : 
             trend === 'down' ? '하락 추세' : 
             '횡보 중'}
          </p>
        </div>
      </div>
      
      <div className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
            <YAxis domain={['dataMin', 'dataMax']} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <ReferenceLine y={resistance} stroke="#EF4444" strokeDasharray="5 5" />
            <ReferenceLine y={support} stroke="#10B981" strokeDasharray="5 5" />
            <ReferenceLine y={currentPrice} stroke="#FBBF24" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}