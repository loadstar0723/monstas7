'use client'

import { useEffect, useState, useRef } from 'react'
import { FaArrowUp, FaArrowDown, FaInfoCircle } from 'react-icons/fa'
import { BINANCE_CONFIG } from '@/lib/binanceConfig'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface Props {
  coins: CoinInfo[]
  selectedCoin: CoinInfo
  onSelectCoin: (coin: CoinInfo) => void
}

interface PriceData {
  symbol: string
  price: number
  changePercent: number
  volume: number
  liquidityScore: number
}

export default function CoinSelector({ coins, selectedCoin, onSelectCoin }: Props) {
  const [priceData, setPriceData] = useState<Record<string, PriceData>>({})
  const [loading, setLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 5000)
    return () => clearInterval(interval)
  }, [coins])

  const fetchPrices = async () => {
    try {
      const response = await fetch(`${BINANCE_CONFIG.BASE_URL}/ticker/24hr`)
      const data = await response.json()
      
      const priceMap: Record<string, PriceData> = {}
      
      coins.forEach(coin => {
        const ticker = data.find((t: any) => t.symbol === coin.fullSymbol)
        if (ticker) {
          // 유동성 점수 계산 (거래량 기반)
          const volumeUSDT = parseFloat(ticker.quoteVolume)
          let liquidityScore = 0
          
          if (volumeUSDT > 1000000000) liquidityScore = 100 // 10억 USDT 이상
          else if (volumeUSDT > 500000000) liquidityScore = 90 // 5억 USDT
          else if (volumeUSDT > 100000000) liquidityScore = 80 // 1억 USDT
          else if (volumeUSDT > 50000000) liquidityScore = 70 // 5천만 USDT
          else if (volumeUSDT > 10000000) liquidityScore = 60 // 1천만 USDT
          else liquidityScore = Math.floor((volumeUSDT / 10000000) * 60)
          
          priceMap[coin.symbol] = {
            symbol: coin.symbol,
            price: parseFloat(ticker.lastPrice),
            changePercent: parseFloat(ticker.priceChangePercent),
            volume: volumeUSDT,
            liquidityScore: Math.min(100, liquidityScore)
          }
        }
      })
      
      setPriceData(priceMap)
      setLoading(false)
    } catch (error) {
      console.error('가격 데이터 가져오기 실패:', error)
      setLoading(false)
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(2)}B`
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`
    return `${(volume / 1000).toFixed(2)}K`
  }

  const formatPrice = (price: number) => {
    if (price >= 10000) return price.toFixed(0)
    if (price >= 100) return price.toFixed(2)
    if (price >= 1) return price.toFixed(3)
    if (price >= 0.01) return price.toFixed(4)
    return price.toFixed(6)
  }

  const getLiquidityColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-blue-400'
    if (score >= 50) return 'text-yellow-400'
    if (score >= 30) return 'text-orange-400'
    return 'text-red-400'
  }

  const getLiquidityLabel = (score: number) => {
    if (score >= 90) return '매우 높음'
    if (score >= 70) return '높음'
    if (score >= 50) return '보통'
    if (score >= 30) return '낮음'
    return '매우 낮음'
  }

  // 터치 스와이프 지원
  const handleTouchStart = useRef(0)
  const handleTouchEnd = useRef(0)

  const onTouchStart = (e: React.TouchEvent) => {
    handleTouchStart.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    handleTouchEnd.current = e.changedTouches[0].clientX
    const diff = handleTouchStart.current - handleTouchEnd.current
    
    if (Math.abs(diff) > 50) {
      const container = scrollContainerRef.current
      if (container) {
        container.scrollLeft += diff
      }
    }
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">코인 선택</h2>
        <div 
          className="relative"
          onMouseEnter={() => setShowTooltip('liquidity')}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <FaInfoCircle className="text-gray-400 cursor-help" />
          {showTooltip === 'liquidity' && (
            <div className="absolute right-0 top-6 w-64 bg-gray-800 rounded-lg p-3 text-sm text-gray-300 z-10 border border-gray-700">
              <p className="font-semibold mb-1">유동성 점수란?</p>
              <p>24시간 거래량 기반으로 계산된 유동성 지표입니다. 높을수록 마켓 메이킹에 유리합니다.</p>
            </div>
          )}
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-3 hide-scrollbar"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {coins.map(coin => {
          const data = priceData[coin.symbol]
          const isSelected = selectedCoin.symbol === coin.symbol
          
          return (
            <button
              key={coin.symbol}
              onClick={() => onSelectCoin(coin)}
              className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected 
                  ? `${coin.bgColor} border-purple-500` 
                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
              }`}
            >
              <div className="text-left min-w-[140px]">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-lg font-bold ${coin.color}`}>{coin.symbol}</span>
                  <span className="text-xs text-gray-400">{coin.name}</span>
                </div>
                
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                  </div>
                ) : data ? (
                  <>
                    <div className="text-white font-semibold">
                      ${formatPrice(data.price)}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      data.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {data.changePercent >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                      {Math.abs(data.changePercent).toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Vol: {formatVolume(data.volume)}
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">유동성</span>
                        <span className={getLiquidityColor(data.liquidityScore)}>
                          {getLiquidityLabel(data.liquidityScore)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full transition-all ${
                            data.liquidityScore >= 90 ? 'bg-green-400' :
                            data.liquidityScore >= 70 ? 'bg-blue-400' :
                            data.liquidityScore >= 50 ? 'bg-yellow-400' :
                            data.liquidityScore >= 30 ? 'bg-orange-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${data.liquidityScore}%` }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-400">데이터 없음</div>
                )}
              </div>
            </button>
          )
        })}
      </div>
      
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}