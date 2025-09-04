'use client'

import { useState, useEffect } from 'react'

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
        .slice(0, 100)
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
    if (change > 10) return 'bg-green-500'
    if (change > 5) return 'bg-green-400'
    if (change > 2) return 'bg-green-300'
    if (change > 0) return 'bg-green-200'
    if (change === 0) return 'bg-gray-500'
    if (change > -2) return 'bg-red-200'
    if (change > -5) return 'bg-red-300'
    if (change > -10) return 'bg-red-400'
    return 'bg-red-500'
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
    if (price < 0.00001) return price.toExponential(2)
    if (price < 0.01) return price.toFixed(6)
    if (price < 1) return price.toFixed(4)
    if (price < 100) return price.toFixed(2)
    return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`
    return `$${volume.toFixed(0)}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">🔥 실시간 암호화폐 히트맵</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-3 h-3 bg-green-500 rounded animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>
      
      <p className="text-gray-400 mb-4">거래량 기준 상위 100개 코인 | 크기: 거래량 | 색상: 24시간 변동률</p>
      
      <div className="grid grid-cols-12 gap-1 auto-rows-min">
        {heatmapData.map((coin, index) => (
          <div
            key={coin.symbol}
            className={`
              ${getColorByChange(coin.change)}
              ${getSizeByVolume(coin.volume, index)}
              p-2 rounded-lg cursor-pointer hover:opacity-80 transition-all
              flex flex-col justify-center items-center text-center
              min-h-[60px] hover:scale-105 hover:z-10
              transform transition-transform duration-200
              shadow-lg
            `}
            title={`${coin.name}: $${formatPrice(coin.price)} (${coin.change > 0 ? '+' : ''}${coin.change.toFixed(2)}%)`}
          >
            <div className="font-bold text-black dark:text-black">
              {coin.name}
            </div>
            <div className="text-xs text-black/90 dark:text-black/90 font-bold">
              ${formatPrice(coin.price)}
            </div>
            <div className="text-xs text-black/90 dark:text-black/90 font-semibold">
              {coin.change > 0 ? '+' : ''}{coin.change.toFixed(1)}%
            </div>
            {index < 10 && (
              <div className="text-xs text-black/80 dark:text-black/80 font-medium mt-1">
                {formatVolume(coin.volume)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 범례 */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-gray-300 font-semibold">📈 가격 변동률:</span>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded"></span>
            <span className="text-gray-400">+10% 이상</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-300 rounded"></span>
            <span className="text-gray-400">+2~10%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gray-500 rounded"></span>
            <span className="text-gray-400">-2~+2%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-300 rounded"></span>
            <span className="text-gray-400">-10~-2%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-500 rounded"></span>
            <span className="text-gray-400">-10% 이하</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-gray-300 font-semibold">📊 거래량 크기:</span>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-gray-600 rounded"></span>
            <span className="text-gray-400">초대형 (Top 3)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-gray-600 rounded"></span>
            <span className="text-gray-400">대형 (Top 10)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-gray-600 rounded"></span>
            <span className="text-gray-400">중형 (Top 30)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gray-600 rounded"></span>
            <span className="text-gray-400">소형</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-gray-500">
        데이터 제공: Binance | 실시간 업데이트 (10초)
      </div>
    </div>
  )
}