'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { config } from '@/lib/config'

interface HeatmapItem {
  symbol: string
  name: string
  price: number
  change: number
  volume: number
  marketCap: number
}

export default function CryptoHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHeatmapData()
    const interval = setInterval(fetchHeatmapData, 10000) // 10초마다 업데이트
    return () => clearInterval(interval)
  }, [])

  const fetchHeatmapData = async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr')
      const allTickers: Array<Record<string, string>> = await response.json()
      
      // USDT 페어만 필터링하고 거래량 기준 정렬
      const usdtPairs = allTickers
        .filter((ticker: Record<string, string>) => ticker.symbol.endsWith('USDT'))
        .sort((a: Record<string, string>, b: Record<string, string>) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 30)
        .map((ticker: Record<string, string>) => ({
          symbol: ticker.symbol,
          name: ticker.symbol.replace('USDT', ''),
          price: parseFloat(ticker.lastPrice),
          change: parseFloat(ticker.priceChangePercent),
          volume: parseFloat(ticker.quoteVolume),
          marketCap: parseFloat(ticker.quoteVolume)
        }))
      
      setHeatmapData(usdtPairs)
      setLoading(false)
    } catch (error) {
      console.error('히트맵 데이터 로드 실패:', error)
      setLoading(false)
    }
  }

  const getColorByChange = (change: number) => {
    if (change > 10) return 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/50'
    if (change > 5) return 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-emerald-400/40'
    if (change > 2) return 'bg-gradient-to-br from-green-400 to-green-500 shadow-green-400/30'
    if (change > 0) return 'bg-gradient-to-br from-green-300 to-green-400 shadow-green-300/20'
    if (change === 0) return 'bg-gradient-to-br from-gray-500 to-gray-600 shadow-gray-500/20'
    if (change > -2) return 'bg-gradient-to-br from-red-300 to-red-400 shadow-red-300/20'
    if (change > -5) return 'bg-gradient-to-br from-red-400 to-red-500 shadow-red-400/30'
    if (change > -10) return 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/40'
    return 'bg-gradient-to-br from-red-600 to-red-700 shadow-red-600/50'
  }

  const getSizeByVolume = (volume: number, index: number) => {
    // 상위 3개는 초대형
    if (index < 3) return 'col-span-3 row-span-3 text-2xl'
    // 상위 10개는 대형
    if (index < 10) return 'col-span-2 row-span-2 text-lg'
    // 상위 30개는 중형
    if (index < 30) return 'col-span-2 row-span-1 text-base'
    // 나머지는 소형
    return 'col-span-1 row-span-1 text-sm'
  }

  const formatPrice = (price: number) => {
    if (price < config.decimals.value00001) return price.toExponential(2)
    if (price < config.decimals.value01) return safePrice(price, 6)
    if (price < 1) return safePrice(price, 4)
    if (price < 100) return safePrice(price, 2)
    return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`
    return `$${safeFixed(volume, 0)}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: config.decimals.value8 }}
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">실시간 암호화폐 히트맵</span>
        </h2>
        <p className="text-gray-400 text-lg">거래량 기준 상위 30개 코인의 실시간 현황</p>
      </div>

      <div className="gradient-border">
        <div className="gradient-border-content bg-gray-900/95">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600/20 to-emerald-600/10 border border-emerald-500/30">
                <span className="animate-pulse w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span className="text-sm font-medium text-emerald-400">LIVE</span>
              </div>
              <span className="text-gray-500 text-sm">10초마다 업데이트</span>
            </div>
            <div className="text-sm text-gray-500">
              크기: 거래량 | 색상: 24h 변동률
            </div>
          </div>
      
          <div className="grid grid-cols-12 gap-2 auto-rows-min">
            {heatmapData.map((coin, index) => (
              <motion.div
                key={coin.symbol}
                initial={{ opacity: 0, scale: config.decimals.value8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * config.decimals.value005, type: "spring", stiffness: 300 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className={`
                  ${getColorByChange(coin.change)}
                  ${getSizeByVolume(coin.volume, index)}
                  p-3 rounded-xl cursor-pointer
                  flex flex-col justify-center items-center text-center
                  min-h-[60px] shadow-xl border border-white/10
                  backdrop-blur-sm relative overflow-hidden group
                `}
                title={`${coin.name}: $${formatPrice(coin.price)} (${coin.change > 0 ? '+' : ''}${safePercent(coin.change)}%)`}
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="font-black text-white drop-shadow-lg">
                    {coin.name}
                  </div>
                  <div className="text-xs text-white/90 font-bold drop-shadow">
                    ${formatPrice(coin.price)}
                  </div>
                  <div className={`text-xs font-bold mt-1 ${
                    coin.change > 0 ? 'text-white' : 'text-white/90'
                  }`}>
                    {coin.change > 0 ? '↑' : '↓'} {Math.abs(coin.change).toFixed(1)}%
                  </div>
                  {index < 10 && (
                    <div className="text-xs text-white/80 font-medium mt-1">
                      {formatVolume(coin.volume)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* 범례 */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="glass-card p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">가격 변동률</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded shadow-lg"></span>
                  <span className="text-gray-400">+${config.percentage.value10} 이상</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded shadow-lg"></span>
                  <span className="text-gray-400">+2~${config.percentage.value10}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-gradient-to-br from-gray-500 to-gray-600 rounded shadow-lg"></span>
                  <span className="text-gray-400">-2~+${config.percentage.value2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-500 rounded shadow-lg"></span>
                  <span className="text-gray-400">-10~-${config.percentage.value2}</span>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">거래량 크기</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded shadow-lg"></span>
                  <span className="text-gray-400">Top 3</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded shadow-lg"></span>
                  <span className="text-gray-400">Top 10</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-gradient-to-br from-purple-600 to-purple-700 rounded shadow-lg"></span>
                  <span className="text-gray-400">Top 30</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-gradient-to-br from-purple-600 to-purple-700 rounded shadow-lg"></span>
                  <span className="text-gray-400">기타</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}