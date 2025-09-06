'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    // 초기 데이터 생성
    const generateInitialData = () => {
      const initialPrices: PriceData[] = []
      const basePrice = symbol === 'BTCUSDT' ? 110739.99 : 3900.50
      
      // 20개의 초기 데이터 포인트 생성
      for (let i = 0; i < 20; i++) {
        const variation = (Math.random() - 0.5) * (basePrice * 0.02) // 2% 변동
        const time = new Date(Date.now() - (20 - i) * 60000)
        initialPrices.push({
          time: time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          price: basePrice + variation
        })
      }
      
      setPrices(initialPrices)
      setCurrentPrice(initialPrices[initialPrices.length - 1].price)
      setPriceChange(((initialPrices[19].price - initialPrices[0].price) / initialPrices[0].price) * 100)
      setLoading(false)
    }

    generateInitialData()

    // 실시간 업데이트 시뮬레이션
    const interval = setInterval(() => {
      setPrices(prev => {
        const newPrices = [...prev]
        if (newPrices.length > 20) {
          newPrices.shift()
        }
        const lastPrice = newPrices[newPrices.length - 1]?.price || 110739.99
        const variation = (Math.random() - 0.5) * (lastPrice * 0.001) // 0.1% 변동
        const newPrice = lastPrice + variation
        const newTime = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        
        newPrices.push({ time: newTime, price: newPrice })
        setCurrentPrice(newPrice)
        setPriceChange(((newPrice - newPrices[0].price) / newPrices[0].price) * 100)
        return newPrices
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [symbol])

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse" style={{ height }}>
        <div className="h-full bg-gray-700 rounded"></div>
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
              ${currentPrice.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          <span className="text-gray-400">실시간 업데이트 중</span>
        </div>
        <span className="text-gray-500">2초마다 갱신</span>
      </div>
    </motion.div>
  )
}