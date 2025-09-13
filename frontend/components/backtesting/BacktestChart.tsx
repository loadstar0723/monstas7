'use client'

import { useEffect, useRef, useState } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Brush
} from 'recharts'

interface BacktestChartProps {
  data: any[]
  coin: { symbol: string; name: string; icon: string }
  strategy: string
}

export default function BacktestChart({ data, coin, strategy }: BacktestChartProps) {
  const [chartType, setChartType] = useState<'price' | 'returns' | 'drawdown'>('price')
  const [showIndicators, setShowIndicators] = useState(true)
  const [processedData, setProcessedData] = useState<any[]>([])

  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return

    const processed = data.map((candle, index) => {
      const close = parseFloat(candle[4])
      const volume = parseFloat(candle[5])
      const high = parseFloat(candle[2])
      const low = parseFloat(candle[3])
      
      // 이동평균 계산
      const sma20 = index >= 20 
        ? data.slice(index - 19, index + 1).reduce((sum, c) => sum + parseFloat(c[4]), 0) / 20
        : close
      
      const sma50 = index >= 50
        ? data.slice(index - 49, index + 1).reduce((sum, c) => sum + parseFloat(c[4]), 0) / 50
        : close

      // RSI 계산 (간단한 버전)
      let rsi = 50
      if (index >= 14) {
        const gains = []
        const losses = []
        for (let i = index - 13; i <= index; i++) {
          const change = parseFloat(data[i][4]) - parseFloat(data[i - 1][4])
          if (change > 0) gains.push(change)
          else losses.push(Math.abs(change))
        }
        const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / 14 : 0
        const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / 14 : 0
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
        rsi = 100 - (100 / (1 + rs))
      }

      // 수익률 계산
      const returns = index > 0 
        ? ((close - parseFloat(data[index - 1][4])) / parseFloat(data[index - 1][4])) * 100
        : 0

      // 누적 수익률
      const cumulativeReturns = index > 0 
        ? ((close - parseFloat(data[0][4])) / parseFloat(data[0][4])) * 100
        : 0

      return {
        time: new Date(candle[0]).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        timestamp: candle[0],
        price: close,
        high,
        low,
        volume,
        sma20,
        sma50,
        rsi,
        returns,
        cumulativeReturns,
        signal: generateSignal(index, data, strategy)
      }
    })

    // Drawdown 계산
    let peak = processed[0].price
    processed.forEach(item => {
      if (item.price > peak) peak = item.price
      item.drawdown = ((peak - item.price) / peak) * 100
    })

    setProcessedData(processed)
  }, [data, strategy])

  // 거래 신호 생성
  const generateSignal = (index: number, data: any[], strategy: string) => {
    if (index < 50) return null
    
    const current = parseFloat(data[index][4])
    const prev = parseFloat(data[index - 1][4])
    
    const sma20 = data.slice(index - 19, index + 1).reduce((sum, c) => sum + parseFloat(c[4]), 0) / 20
    const sma50 = data.slice(index - 49, index + 1).reduce((sum, c) => sum + parseFloat(c[4]), 0) / 50
    const prevSma20 = data.slice(index - 20, index).reduce((sum, c) => sum + parseFloat(c[4]), 0) / 20
    const prevSma50 = data.slice(index - 50, index - 1).reduce((sum, c) => sum + parseFloat(c[4]), 0) / 50
    
    if (strategy === 'trend-following') {
      if (prevSma20 <= prevSma50 && sma20 > sma50) return 'buy'
      if (prevSma20 >= prevSma50 && sma20 < sma50) return 'sell'
    }
    
    return null
  }

  // 차트 색상 설정
  const getChartColor = (value: number) => {
    return value >= 0 ? '#10b981' : '#ef4444'
  }

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {
                entry.name.includes('량') || entry.name.includes('Volume')
                  ? entry.value.toLocaleString()
                  : safeFixed(entry.value, 2)
              }
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-purple-400">📈</span>
          백테스트 차트 분석
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {/* 차트 타입 선택 */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {[
              { value: 'price', label: '가격' },
              { value: 'returns', label: '수익률' },
              { value: 'drawdown', label: '낙폭' }
            ].map(type => (
              <button
                key={type.value}
                onClick={() => setChartType(type.value as any)}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  chartType === type.value
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* 지표 표시 토글 */}
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              showIndicators
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}
          >
            {showIndicators ? '지표 표시' : '지표 숨김'}
          </button>
        </div>
      </div>

      {/* 메인 차트 */}
      <div className="h-96 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'price' ? (
            <LineChart data={processedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 5%', 'dataMax + 5%']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* 가격 라인 */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                name="가격"
              />
              
              {/* 이동평균선 */}
              {showIndicators && (
                <>
                  <Line
                    type="monotone"
                    dataKey="sma20"
                    stroke="#10b981"
                    strokeWidth={1}
                    dot={false}
                    strokeDasharray="5 5"
                    name="SMA 20"
                  />
                  <Line
                    type="monotone"
                    dataKey="sma50"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    dot={false}
                    strokeDasharray="5 5"
                    name="SMA 50"
                  />
                </>
              )}

              {/* 거래 신호 */}
              {processedData.map((item, index) => {
                if (item.signal === 'buy') {
                  return (
                    <ReferenceLine
                      key={`buy-${index}`}
                      x={item.time}
                      stroke="#10b981"
                      strokeWidth={2}
                      label={{ value: '▲', position: 'bottom', fill: '#10b981' }}
                    />
                  )
                } else if (item.signal === 'sell') {
                  return (
                    <ReferenceLine
                      key={`sell-${index}`}
                      x={item.time}
                      stroke="#ef4444"
                      strokeWidth={2}
                      label={{ value: '▼', position: 'top', fill: '#ef4444' }}
                    />
                  )
                }
                return null
              })}
              
              <Brush dataKey="time" height={30} stroke="#8b5cf6" />
            </LineChart>
          ) : chartType === 'returns' ? (
            <AreaChart data={processedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Area
                type="monotone"
                dataKey="cumulativeReturns"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
                name="누적 수익률 (%)"
              />
              
              <ReferenceLine y={0} stroke="#666" />
              
              <Brush dataKey="time" height={30} stroke="#8b5cf6" />
            </AreaChart>
          ) : (
            <AreaChart data={processedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.3}
                name="낙폭 (%)"
              />
              
              <ReferenceLine y={10} stroke="#f59e0b" strokeDasharray="5 5" label="10%" />
              <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="5 5" label="20%" />
              
              <Brush dataKey="time" height={30} stroke="#ef4444" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 거래량 차트 */}
      {showIndicators && (
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              
              <Bar
                dataKey="volume"
                fill="#6366f1"
                fillOpacity={0.5}
                name="거래량"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* RSI 지표 */}
      {showIndicators && (
        <div className="h-32 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              
              <Line
                type="monotone"
                dataKey="rsi"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="RSI"
              />
              
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" label="과매수" />
              <ReferenceLine y={30} stroke="#10b981" strokeDasharray="5 5" label="과매도" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}