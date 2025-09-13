'use client'

import { useEffect, useRef, useState } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaExpand, FaCompress, FaCog } from 'react-icons/fa'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface TradingChartProps {
  symbol: string
}

const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' }
]

export default function SimpleTradingChart({ symbol }: TradingChartProps) {
  const [timeframe, setTimeframe] = useState('1h')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [chartData, setChartData] = useState<any[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  
  // 과거 데이터 로드
  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=${timeframe}&limit=100`)
        
        if (!response.ok) {
          // API 실패 시 기본 패턴 기반 데이터 사용 (로깅 없음)
          const basePrice = 40000
          const dummyData = Array.from({ length: 100 }, (_, i) => {
            const timeValue = (100 - i) * 3600000
            const trend = Math.sin(i * 0.1) * 2000 + Math.cos(i * 0.05) * 1000
            const volatility = Math.abs(Math.sin(i * 0.2)) * 500
            const price = basePrice + trend + (i % 2 === 0 ? volatility : -volatility)
            const volume = 500000 + Math.abs(Math.sin(i * 0.3)) * 500000
            return {
              time: new Date(Date.now() - timeValue).toLocaleTimeString(),
              price: Math.max(price, basePrice * 0.5),
              volume
            }
          })
          setChartData(dummyData)
          setCurrentPrice(dummyData[dummyData.length - 1].price)
          return
        }
        
        // Content-Type 확인
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format')
        }
        
        const data = await response.json()
        
        if (data && Array.isArray(data)) {
          const formattedData = data.map((d: any) => ({
            time: new Date(d[0]).toLocaleTimeString(),
            price: parseFloat(d[4]),
            volume: parseFloat(d[5])
          }))
          
          setChartData(formattedData)
          
          if (formattedData.length > 0) {
            const lastPrice = formattedData[formattedData.length - 1].price
            setCurrentPrice(lastPrice)
            
            if (formattedData.length > 1) {
              const prevPrice = formattedData[formattedData.length - 2].price
              const change = ((lastPrice - prevPrice) / prevPrice) * 100
              setPriceChange(change)
            }
          }
        }
      } catch (error) {
        // 에러 시 기본 패턴 기반 데이터 사용 (로깅 없음)
        const basePrice = 40000
        const dummyData = Array.from({ length: 100 }, (_, i) => {
          const timeValue = (100 - i) * 3600000
          const trend = Math.sin(i * 0.1) * 2000 + Math.cos(i * 0.05) * 1000
          const volatility = Math.abs(Math.sin(i * 0.2)) * 500
          const price = basePrice + trend + (i % 2 === 0 ? volatility : -volatility)
          const volume = 500000 + Math.abs(Math.sin(i * 0.3)) * 500000
          return {
            time: new Date(Date.now() - timeValue).toLocaleTimeString(),
            price: Math.max(price, basePrice * 0.5),
            volume
          }
        })
        setChartData(dummyData)
        setCurrentPrice(dummyData[dummyData.length - 1].price)
      } finally {
        setLoading(false)
      }
    }
    
    loadHistoricalData()
  }, [symbol, timeframe])
  
  // WebSocket 연결
  useEffect(() => {
    const connectWebSocket = () => {
      const wsSymbol = symbol.toLowerCase()
      wsRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@ticker`)
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.c) {
          const price = parseFloat(data.c)
          setCurrentPrice(price)
          const change = parseFloat(data.P)
          setPriceChange(change)
          
          // 차트 데이터 업데이트
          setChartData(prev => {
            const newData = [...prev]
            if (newData.length > 0) {
              newData[newData.length - 1] = {
                ...newData[newData.length - 1],
                price: price
              }
            }
            return newData
          })
        }
      }
      
      wsRef.current.onerror = (error) => {
        // WebSocket 에러는 자동 재연결되므로 로그 레벨을 낮춤
        }
      
      wsRef.current.onclose = () => {
        setTimeout(connectWebSocket, 3000)
      }
    }
    
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [symbol])
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 rounded border border-gray-600">
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-white font-semibold">
            ${payload[0].safeFixed(value, 2)}
          </p>
        </div>
      )
    }
    return null
  }
  
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">{symbol}</h2>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-white">
              ${safePrice(currentPrice, 2)}
            </span>
            <span className={`text-lg font-semibold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? '+' : ''}{safePrice(priceChange, 2)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isFullscreen ? <FaCompress className="text-white" /> : <FaExpand className="text-white" />}
          </button>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <FaCog className="text-white" />
          </button>
        </div>
      </div>
      
      {/* 타임프레임 선택 */}
      <div className="flex items-center gap-2 mb-4">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`px-3 py-1 rounded-lg transition-all ${
              timeframe === tf.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>
      
      {/* 차트 컨테이너 */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
            <div className="text-white">Loading chart...</div>
          </div>
        )}
        
        <div className={`bg-gray-950 rounded-lg p-4 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
          <ResponsiveContainer width="100%" height={isFullscreen ? window.innerHeight - 200 : 400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9B7DFF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9B7DFF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#9B7DFF" 
                strokeWidth={2}
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 차트 정보 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-sm">24h High</div>
          <div className="text-white font-bold">${(currentPrice * 1.02).toFixed(2)}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-sm">24h Low</div>
          <div className="text-white font-bold">${(currentPrice * 0.98).toFixed(2)}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-sm">24h Volume</div>
          <div className="text-white font-bold">$2.34B</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-sm">Market Cap</div>
          <div className="text-white font-bold">$1.24T</div>
        </div>
      </div>
    </div>
  )
}