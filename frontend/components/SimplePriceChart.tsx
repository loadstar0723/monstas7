'use client'

import { useEffect, useState, useRef, useMemo, memo } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'

interface SimplePriceChartProps {
  symbol: string
  height?: number
}

interface PriceData {
  time: string
  price: number
}

// 시간 라벨 컴포넌트 - React.memo로 최적화하여 불필요한 리렌더링 방지
const TimeLabels = memo(({ labels }: { labels: Array<{ key: number, time: string, position: number }> }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-6 text-xs text-gray-500">
      {labels.map((label) => (
        <span 
          key={label.key}
          className="absolute"
          style={{
            left: `${label.position}%`,
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap'
          }}
        >
          {label.time}
        </span>
      ))}
    </div>
  )
})

export default function SimplePriceChart({ symbol, height = 400 }: SimplePriceChartProps) {
  const [prices, setPrices] = useState<PriceData[]>([])
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const pricesRef = useRef<PriceData[]>([])
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 브라우저 환경이 아니면 실행하지 않음 (SSR 방지)
    if (typeof window === 'undefined') {
      return
    }
    
    // Binance WebSocket 실제 연결
    const connectWebSocket = () => {
      const wsSymbol = symbol.toLowerCase()
      const wsUrl = `wss://stream.binance.com:9443/ws/${wsSymbol}@trade`
      
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        setLoading(false)
      }
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        const newPrice = parseFloat(data.p)
        
        // 현재가만 업데이트 (차트는 15분봉 데이터 유지)
        setCurrentPrice(newPrice)
        
        // 가격 변화율 계산
        if (pricesRef.current.length > 0) {
          const firstPrice = pricesRef.current[0].price
          const change = ((newPrice - firstPrice) / firstPrice) * 100
          setPriceChange(change)
        }
      }
      
      wsRef.current.onerror = (error) => {
        // WebSocket 에러는 Event 객체로 오므로 세부 정보가 없음
        setLoading(false)
      }
      
      wsRef.current.onclose = (event) => {
        // 정상 종료가 아닌 경우에만 재연결
        if (event.code !== 1000) {
          // 5초 후 재연결
          setTimeout(connectWebSocket, 5000)
        }
      }
    }
    
    // 초기 가격 데이터 가져오기 (프록시 경유)
    const fetchInitialData = async () => {
      try {
        const response = await fetch(
          `/api/binance/klines?symbol=${symbol}&interval=15m&limit=20`
        )
        const result = await response.json()
        
        // API 응답에서 data 배열 추출
        const klineData = result.data || []
        
        const initialPrices: PriceData[] = klineData.map((candle: any[]) => {
          const timestamp = candle[0]
          const date = new Date(timestamp)
          
          return {
            time: date.toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            price: parseFloat(candle[4]) // Close price
          }
        })
        
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
    
    // 15분마다 새로운 15분봉 데이터 가져오기
    updateIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/binance/klines?symbol=${symbol}&interval=15m&limit=20`
        )
        const result = await response.json()
        const klineData = result.data || []
        
        const updatedPrices: PriceData[] = klineData.map((candle: any[]) => {
          // Binance는 이미 정확한 15분봉 시작 시간을 제공
          const timestamp = candle[0]
          const date = new Date(timestamp)
          
          return {
            time: date.toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            price: parseFloat(candle[4])
          }
        })
        
        if (updatedPrices.length > 0) {
          pricesRef.current = updatedPrices
          // 깊은 비교를 통해 실제로 데이터가 변경되었을 때만 업데이트
          setPrices(prevPrices => {
            // 길이가 다르거나 시간이 다른 경우에만 업데이트
            if (prevPrices.length !== updatedPrices.length || 
                prevPrices[0]?.time !== updatedPrices[0]?.time ||
                prevPrices[prevPrices.length - 1]?.time !== updatedPrices[updatedPrices.length - 1]?.time) {
              return updatedPrices
            }
            return prevPrices
          })
        }
      } catch (error) {
        console.error('15분봉 데이터 업데이트 실패:', error)
      }
    }, 15 * 60 * 1000) // 15분마다 실행
    
    // 클린업
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [symbol])

  // 시간 라벨을 메모이제이션하여 깜빡거림 방지 (모든 Hook은 조건문 전에 호출되어야 함)
  const timeLabels = useMemo(() => {
    if (prices.length === 0) {
      return []
    }
    
    // 고정된 5개의 라벨 위치 계산
    const labels = []
    const indices = [0, Math.floor(prices.length * 0.25), Math.floor(prices.length * 0.5), Math.floor(prices.length * 0.75), prices.length - 1]
    
    indices.forEach((index, i) => {
      if (index < prices.length && prices[index]) {
        labels.push({
          key: i, // 고정된 순서 기반 key
          time: prices[index].time,
          position: (index / Math.max(1, prices.length - 1)) * 100
        })
      }
    })
    
    return labels
  }, [prices]) // prices 배열의 내용이 변경될 때만 재계산

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
    const x = prices.length > 1 ? (index / (prices.length - 1)) * 100 : 50
    const y = priceRange > 0 ? ((maxPrice - data.price) / priceRange) * 100 : 50
    return `${x},${y}`
  }).join(' ')
  
  // 현재 가격 점의 위치 계산
  const currentPriceY = priceRange > 0 
    ? Math.min(95, Math.max(5, ((maxPrice - currentPrice) / priceRange) * 100))
    : 50
  const currentPriceX = prices.length > 0 ? Math.min(95, (prices.length - 1) / Math.max(1, prices.length - 1) * 100) : 50

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
          <h3 className="text-lg font-semibold text-gray-300 mb-1">
            {symbol}
            <span className="ml-2 text-xs text-gray-500 font-normal">(15분봉)</span>
          </h3>
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
          <p className="text-sm font-semibold text-green-400">${safeFixed(maxPrice, 2)}</p>
          <p className="text-xs text-gray-500 mt-2 mb-1">24H 최저</p>
          <p className="text-sm font-semibold text-red-400">${safeFixed(minPrice, 2)}</p>
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
            cx={currentPriceX}
            cy={currentPriceY}
            r="1.5"
            fill={priceChange >= 0 ? '#10b981' : '#ef4444'}
            className="animate-pulse"
          />
        </svg>
        
        {/* Y축 가격 라벨 */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 -ml-12 w-10">
          <span>${safeFixed(maxPrice, 0)}</span>
          <span>${((maxPrice + minPrice) / 2).toFixed(0)}</span>
          <span>${safeFixed(minPrice, 0)}</span>
        </div>
        
        {/* X축 시간 라벨 - React.memo로 최적화 */}
        <TimeLabels labels={timeLabels} />
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