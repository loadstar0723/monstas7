'use client'

import { useEffect, useState } from 'react'
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import LoadingSpinner from '../LoadingSpinner'

interface MarketDepthChartProps {
  symbol: string
}

interface OrderBookData {
  price: number
  bidVolume: number
  askVolume: number
  totalBid: number
  totalAsk: number
}

export default function MarketDepthChart({ symbol }: MarketDepthChartProps) {
  const { isDarkMode } = useTheme()
  const [data, setData] = useState<OrderBookData[]>([])
  const [loading, setLoading] = useState(true)
  const [spread, setSpread] = useState(0)

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=50`
        )
        const orderBook = await response.json()

        // 매수/매도 데이터 처리
        const bids = orderBook.bids.map((bid: string[]) => ({
          price: parseFloat(bid[0]),
          volume: parseFloat(bid[1])
        }))

        const asks = orderBook.asks.map((ask: string[]) => ({
          price: parseFloat(ask[0]),
          volume: parseFloat(ask[1])
        }))

        // 누적 볼륨 계산
        let totalBid = 0
        let totalAsk = 0

        const depthData: OrderBookData[] = []

        // 매수 데이터 (역순)
        for (let i = bids.length - 1; i >= 0; i--) {
          totalBid += bids[i].volume
          depthData.push({
            price: bids[i].price,
            bidVolume: bids[i].volume,
            askVolume: 0,
            totalBid,
            totalAsk: 0
          })
        }

        // 매도 데이터
        for (let i = 0; i < asks.length; i++) {
          totalAsk += asks[i].volume
          depthData.push({
            price: asks[i].price,
            bidVolume: 0,
            askVolume: asks[i].volume,
            totalBid: 0,
            totalAsk
          })
        }

        // 스프레드 계산
        if (bids.length > 0 && asks.length > 0) {
          setSpread(asks[0].price - bids[0].price)
        }

        setData(depthData)
        setLoading(false)
      } catch (error) {
        console.error('오더북 데이터 로드 실패:', error)
        setLoading(false)
      }
    }

    fetchOrderBook()
    const interval = setInterval(fetchOrderBook, 2000) // 2초마다 업데이트

    return () => clearInterval(interval)
  }, [symbol])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-800 dark:text-white">
            ${data.price.toFixed(2)}
          </p>
          {data.totalBid > 0 && (
            <p className="text-sm text-green-600 dark:text-green-400">
              매수: {data.totalBid.toFixed(4)}
            </p>
          )}
          {data.totalAsk > 0 && (
            <p className="text-sm text-red-600 dark:text-red-400">
              매도: {data.totalAsk.toFixed(4)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="오더북 로딩 중..." />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
    >
      {/* 헤더 */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">시장 깊이</h3>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {symbol} 오더북 분석
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">스프레드:</span>
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
              ${spread.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 차트 */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="askGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDarkMode ? '#374151' : '#e5e7eb'}
            vertical={false}
          />
          
          <XAxis 
            dataKey="price" 
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          
          <YAxis 
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Area
            type="stepAfter"
            dataKey="totalBid"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#bidGradient)"
          />
          
          <Area
            type="stepBefore"
            dataKey="totalAsk"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#askGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* 범례 */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm" />
          <span className="text-xs text-gray-600 dark:text-gray-400">매수 주문</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm" />
          <span className="text-xs text-gray-600 dark:text-gray-400">매도 주문</span>
        </div>
      </div>
    </motion.div>
  )
}