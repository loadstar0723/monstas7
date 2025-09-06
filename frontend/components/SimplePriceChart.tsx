'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface SimplePriceChartProps {
  symbol: string
  height?: number
}

interface PriceData {
  time: string
  price: number
}

export default function SimplePriceChart({ symbol, height = 400 }: SimplePriceChartProps) {
  const [prices, setPrices] = useState<PriceData[]>([])
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const pricesRef = useRef<PriceData[]>([])

  useEffect(() => {
    // Binance WebSocket 실제 연결
    const connectWebSocket = () => {
      const wsSymbol = symbol.toLowerCase()
      const wsUrl = `wss://stream.binance.com:9443/ws/${wsSymbol}@trade`
      
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        console.log('Binance WebSocket 연결됨')
        setLoading(false)
      }
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        const newPrice = parseFloat(data.p)
        const newTime = new Date().toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
        
        const newPriceData: PriceData = {
          time: newTime,
          price: newPrice
        }
        
        // 가격 데이터 업데이트 (최대 20개 유지)
        pricesRef.current = [...pricesRef.current, newPriceData].slice(-20)
        setPrices([...pricesRef.current])
        setCurrentPrice(newPrice)
        
        // 가격 변화율 계산
        if (pricesRef.current.length > 1) {
          const firstPrice = pricesRef.current[0].price
          const change = ((newPrice - firstPrice) / firstPrice) * 100
          setPriceChange(change)
        }
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket 에러:', error)
        setLoading(false)
      }
      
      wsRef.current.onclose = () => {
        console.log('WebSocket 연결 종료')
        // 5초 후 재연결
        setTimeout(connectWebSocket, 5000)
      }
    }
    
    // 초기 가격 데이터 가져오기 (Binance REST API)
    const fetchInitialData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=20`
        )
        const data = await response.json()
        
        const initialPrices: PriceData[] = data.map((candle: any[]) => ({
          time: new Date(candle[0]).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: parseFloat(candle[4]) // Close price
        }))
        
        pricesRef.current = initialPrices
        setPrices(initialPrices)
        
        if (initialPrices.length > 0) {
          const lastPrice = initialPrices[initialPrices.length - 1].price
          setCurrentPrice(lastPrice)
          
          const firstPrice = initialPrices[0].price
          const change = ((lastPrice - firstPrice) / firstPrice) * 100
          setPriceChange(change)
        }
        
        // WebSocket 연결
        connectWebSocket()
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error)
        setLoading(false)
      }
    }
    
    fetchInitialData()
    
    // 클린업
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [symbol])

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse" style={{ height }}>
        <div className="h-full bg-gray-700 rounded"></div>
      </div>
    )
  }

  if (prices.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6" style={{ height }}>
        <div className="h-full flex items-center justify-center text-gray-400">
          데이터 로딩 중...
        </div>
      </div>
    )
  }

  const maxPrice = Math.max(...prices.map(p => p.price))
  const minPrice = Math.min(...prices.map(p => p.price))
  const priceRange = maxPrice - minPrice || 1

  // SVG 차트 포인트 계산
  const chartPoints = prices.map((data, index) => {
    const x = (index / (prices.length - 1)) * 100
    const y = ((maxPrice - data.price) / priceRange) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700"
      style={{ height }}
    >
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">{symbol}</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white">
              ${currentPrice.toLocaleString('ko-KR', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: symbol.includes('BTC') ? 2 : 4 
              })}
            </span>
            <span className={`text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-lg ${
              priceChange >= 0 
                ? 'text-green-400 bg-green-400/10' 
                : 'text-red-400 bg-red-400/10'
            }`}>
              {priceChange >= 0 ? '▲' : '▼'}
              {Math.abs(priceChange).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">24H 최고</p>
          <p className="text-sm font-semibold text-green-400">${maxPrice.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2 mb-1">24H 최저</p>
          <p className="text-sm font-semibold text-red-400">${minPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* SVG 차트 */}
      <div className="relative" style={{ height: height - 200 }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* 그리드 라인 */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="rgba(156, 163, 175, 0.1)"
              strokeWidth="0.2"
            />
          ))}
          
          {/* 그라데이션 정의 */}
          <defs>
            <linearGradient id={`gradient-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={priceChange >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={priceChange >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* 영역 차트 */}
          <polygon
            fill={`url(#gradient-${symbol})`}
            points={`0,100 ${chartPoints} 100,100`}
          />
          
          {/* 가격 라인 */}
          <polyline
            fill="none"
            stroke={priceChange >= 0 ? '#10b981' : '#ef4444'}
            strokeWidth="2"
            points={chartPoints}
            vectorEffect="non-scaling-stroke"
          />
          
          {/* 현재 가격 점 */}
          <circle
            cx="100"
            cy={((maxPrice - currentPrice) / priceRange) * 100}
            r="1.5"
            fill={priceChange >= 0 ? '#10b981' : '#ef4444'}
            className="animate-pulse"
          />
        </svg>
        
        {/* Y축 가격 라벨 */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 -ml-12 w-10">
          <span>${maxPrice.toFixed(0)}</span>
          <span>${((maxPrice + minPrice) / 2).toFixed(0)}</span>
          <span>${minPrice.toFixed(0)}</span>
        </div>
        
        {/* X축 시간 라벨 */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
          {prices.filter((_, i) => i % 5 === 0).map((data, i) => (
            <span key={i}>{data.time}</span>
          ))}
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="mt-6 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-gray-400">Binance 실시간 데이터</span>
        </div>
        <span className="text-gray-500">실시간 업데이트</span>
      </div>
    </motion.div>
  )
}