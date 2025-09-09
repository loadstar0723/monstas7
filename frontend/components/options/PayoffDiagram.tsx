'use client'

import { useState, useMemo } from 'react'
import { LineChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface Props {
  coin: string
  spotPrice: number
}

export default function PayoffDiagram({ coin, spotPrice }: Props) {
  const [strategy, setStrategy] = useState<'long-call' | 'long-put' | 'straddle' | 'iron-condor'>('long-call')
  const [strikePrice, setStrikePrice] = useState(spotPrice)
  const [premium, setPremium] = useState(spotPrice * 0.02)
  const [showAtExpiry, setShowAtExpiry] = useState(true)

  // 가격 범위 설정 (현재가 기준 -50% ~ +50%)
  const priceRange = useMemo(() => {
    const min = spotPrice * 0.5
    const max = spotPrice * 1.5
    const step = (max - min) / 100
    
    return Array.from({ length: 101 }, (_, i) => min + step * i)
  }, [spotPrice])

  // 손익 계산 함수
  const calculatePayoff = (price: number) => {
    switch (strategy) {
      case 'long-call':
        return showAtExpiry 
          ? Math.max(0, price - strikePrice) - premium
          : Math.max(0, price - strikePrice) - premium * 0.7 // 시간가치 포함
      
      case 'long-put':
        return showAtExpiry
          ? Math.max(0, strikePrice - price) - premium
          : Math.max(0, strikePrice - price) - premium * 0.7
      
      case 'straddle':
        const callPayoff = Math.max(0, price - strikePrice) - premium
        const putPayoff = Math.max(0, strikePrice - price) - premium
        return callPayoff + putPayoff
      
      case 'iron-condor':
        // 간단한 아이언 컨도르 예시
        const putSpreadWidth = spotPrice * 0.1
        const callSpreadWidth = spotPrice * 0.1
        const totalCredit = premium * 2
        
        if (price < strikePrice - putSpreadWidth) {
          return -putSpreadWidth + totalCredit
        } else if (price > strikePrice + callSpreadWidth) {
          return -callSpreadWidth + totalCredit
        } else {
          return totalCredit
        }
      
      default:
        return 0
    }
  }

  // 차트 데이터 생성
  const chartData = priceRange.map(price => ({
    price,
    payoff: calculatePayoff(price),
    breakeven: 0
  }))

  // 손익분기점 계산
  const breakevens = useMemo(() => {
    switch (strategy) {
      case 'long-call':
        return [strikePrice + premium]
      case 'long-put':
        return [strikePrice - premium]
      case 'straddle':
        return [strikePrice - premium * 2, strikePrice + premium * 2]
      case 'iron-condor':
        return [strikePrice - premium, strikePrice + premium]
      default:
        return []
    }
  }, [strategy, strikePrice, premium])

  // 최대 손익 계산
  const maxProfit = Math.max(...chartData.map(d => d.payoff))
  const maxLoss = Math.min(...chartData.map(d => d.payoff))

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4">수익 구조 다이어그램</h3>

      {/* 전략 선택 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => setStrategy('long-call')}
          className={`px-3 py-2 rounded-lg text-sm ${
            strategy === 'long-call' ? 'bg-purple-600' : 'bg-gray-700'
          }`}
        >
          롱 콜
        </button>
        <button
          onClick={() => setStrategy('long-put')}
          className={`px-3 py-2 rounded-lg text-sm ${
            strategy === 'long-put' ? 'bg-purple-600' : 'bg-gray-700'
          }`}
        >
          롱 풋
        </button>
        <button
          onClick={() => setStrategy('straddle')}
          className={`px-3 py-2 rounded-lg text-sm ${
            strategy === 'straddle' ? 'bg-purple-600' : 'bg-gray-700'
          }`}
        >
          스트래들
        </button>
        <button
          onClick={() => setStrategy('iron-condor')}
          className={`px-3 py-2 rounded-lg text-sm ${
            strategy === 'iron-condor' ? 'bg-purple-600' : 'bg-gray-700'
          }`}
        >
          아이언 컨도르
        </button>
      </div>

      {/* 파라미터 설정 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">행사가</label>
          <input
            type="number"
            value={strikePrice}
            onChange={(e) => setStrikePrice(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">프리미엄</label>
          <input
            type="number"
            value={premium}
            onChange={(e) => setPremium(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showAtExpiry}
              onChange={(e) => setShowAtExpiry(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">만기일 기준</span>
          </label>
        </div>
      </div>

      {/* 수익 다이어그램 차트 */}
      <div className="h-96 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="lossGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            
            <XAxis 
              dataKey="price" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              domain={['dataMin', 'dataMax']}
            />
            
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value: any) => [`$${value.toFixed(2)}`, '손익']}
              labelFormatter={(value: any) => `가격: $${value.toFixed(2)}`}
            />
            
            {/* 손익분기선 */}
            <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="5 5" />
            
            {/* 현재가 표시 */}
            <ReferenceLine 
              x={spotPrice} 
              stroke="#FBBF24" 
              strokeDasharray="5 5"
              label={{ value: "현재가", position: "top", fill: "#FBBF24" }}
            />
            
            {/* 손익분기점 표시 */}
            {breakevens.map((be, index) => (
              <ReferenceLine
                key={index}
                x={be}
                stroke="#8B5CF6"
                strokeDasharray="5 5"
                label={{ value: "BEP", position: "top", fill: "#8B5CF6" }}
              />
            ))}
            
            {/* 수익 곡선 */}
            <Line
              type="monotone"
              dataKey="payoff"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={false}
            />
            
            {/* 수익/손실 영역 */}
            <Area
              type="monotone"
              dataKey="payoff"
              stroke="none"
              fill="url(#profitGradient)"
              baseValue={0}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">최대 이익</p>
          <p className={`text-lg font-bold ${maxProfit > 0 ? 'text-green-400' : 'text-gray-400'}`}>
            {maxProfit === Infinity ? '무제한' : `$${maxProfit.toFixed(2)}`}
          </p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">최대 손실</p>
          <p className="text-lg font-bold text-red-400">
            ${Math.abs(maxLoss).toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">손익분기점</p>
          <p className="text-lg font-bold text-purple-400">
            {breakevens.length > 1 
              ? `$${breakevens[0].toFixed(0)}-${breakevens[1].toFixed(0)}`
              : `$${breakevens[0]?.toFixed(0) || '-'}`
            }
          </p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">필요 변동</p>
          <p className="text-lg font-bold text-yellow-400">
            {breakevens[0] ? `${((breakevens[0] / spotPrice - 1) * 100).toFixed(1)}%` : '-'}
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <p className="text-sm text-blue-400">
          💡 이 다이어그램은 만기일 기준 이론적 손익을 보여줍니다. 
          실제 거래에서는 시간가치, 변동성 변화 등이 영향을 미칩니다.
        </p>
      </div>
    </div>
  )
}