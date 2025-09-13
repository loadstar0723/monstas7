'use client'

import { useState, useEffect, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'

interface RealTimePriceCardProps {
  symbol: string
  name: string
  icon: string
}

export default function RealTimePriceCard({ symbol, name, icon }: RealTimePriceCardProps) {
  const [price, setPrice] = useState(0)
  const [change24h, setChange24h] = useState(0)
  const [volume, setVolume] = useState(0)
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // 초기 가격 가져오기
    const fetchInitialPrice = async () => {
      try {
        const response = await fetch(`/api/binance/ticker/${symbol}`)
        const data = await response.json()
        setPrice(parseFloat(data.lastPrice || data.price || '0'))
        setChange24h(parseFloat(data.priceChangePercent || '0'))
        setVolume(parseFloat(data.volume || data.quoteVolume || '0'))
        setPriceHistory([parseFloat(data.lastPrice || data.price || '0')])
      } catch (error) {
        console.error('가격 조회 실패:', error)
      }
    }

    fetchInitialPrice()

    // WebSocket 연결
    if (typeof window !== 'undefined') {
      const connectWebSocket = () => {
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`)
        
        ws.onopen = () => {
          setIsConnected(true)
        }

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          const newPrice = parseFloat(data.c) // 현재가
          setPrice(newPrice)
          setChange24h(parseFloat(data.P)) // 24시간 변화율
          setVolume(parseFloat(data.v)) // 거래량
          
          // 가격 히스토리 업데이트 (최대 20개)
          setPriceHistory(prev => {
            const updated = [...prev, newPrice]
            return updated.slice(-20)
          })
        }

        ws.onerror = () => {
          setIsConnected(false)
        }

        ws.onclose = () => {
          setIsConnected(false)
          // 재연결 시도
          setTimeout(connectWebSocket, 5000)
        }

        wsRef.current = ws
      }

      connectWebSocket()

      return () => {
        if (wsRef.current) {
          wsRef.current.close()
        }
      }
    }
  }, [symbol])

  const formatPrice = (value: number) => {
    if (value >= 1000) return safeFixed(value, 0)
    if (value >= 10) return safeFixed(value, 2)
    if (value >= 1) return safeFixed(value, 3)
    return safeFixed(value, 6)
  }

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`
    return safeFixed(value, 2)
  }

  // 미니 차트 생성
  const generateSparkline = () => {
    if (priceHistory.length < 2) return ''
    
    const min = Math.min(...priceHistory)
    const max = Math.max(...priceHistory)
    const range = max - min || 1
    
    const points = priceHistory.map((price, index) => {
      const x = (index / (priceHistory.length - 1)) * 100
      const y = 50 - ((price - min) / range) * 40
      return `${x},${y}`
    }).join(' ')
    
    return `0,50 ${points} 100,50`
  }

  const priceColor = change24h >= 0 ? 'text-green-400' : 'text-red-400'
  const bgColor = change24h >= 0 ? 'bg-green-900/20' : 'bg-red-900/20'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 overflow-hidden`}
    >
      {/* 배경 애니메이션 */}
      <motion.div
        className={`absolute inset-0 ${bgColor} opacity-10`}
        animate={{
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* 연결 상태 표시 */}
      <div className="absolute top-2 right-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
      </div>

      {/* 코인 정보 */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <div>
              <h4 className="font-semibold text-white text-sm">{name}</h4>
              <span className="text-xs text-gray-400">{symbol}</span>
            </div>
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="mb-3">
          <motion.div
            key={price}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold ${priceColor}`}
          >
            ${formatPrice(price)}
          </motion.div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-sm ${priceColor}`}>
              {change24h >= 0 ? '▲' : '▼'} {Math.abs(change24h).toFixed(2)}%
            </span>
            <span className="text-xs text-gray-500">24h</span>
          </div>
        </div>

        {/* 미니 차트 */}
        {priceHistory.length > 1 && (
          <svg className="w-full h-12 mb-2" viewBox="0 0 100 50">
            <polyline
              points={generateSparkline()}
              fill="none"
              stroke={change24h >= 0 ? '#10B981' : '#EF4444'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={generateSparkline()}
              fill={change24h >= 0 ? 'url(#greenGradient)' : 'url(#redGradient)'}
              stroke="none"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0"/>
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* 거래량 */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">거래량</span>
          <span className="text-gray-300">{formatVolume(volume)}</span>
        </div>
      </div>
    </motion.div>
  )
}