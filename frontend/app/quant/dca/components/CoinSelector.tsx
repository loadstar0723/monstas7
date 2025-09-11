'use client'

import { useEffect, useState, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaArrowUp, FaArrowDown, FaInfoCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

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
  volatility: number
}

export default function CoinSelector({ coins, selectedCoin, onSelectCoin }: Props) {
  const [priceData, setPriceData] = useState<Record<string, PriceData>>({})
  const [loading, setLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 5000)
    return () => clearInterval(interval)
  }, [coins])

  const fetchPrices = async () => {
    try {
      const response = await fetch(`/api/binance/ticker`)
      const data = await response.json()
      
      if (data.error || !Array.isArray(data)) {
        console.error('API 오류:', data.error)
        setLoading(false)
        return
      }
      
      const priceMap: Record<string, PriceData> = {}
      
      coins.forEach(coin => {
        const ticker = data.find((t: any) => t.symbol === coin.fullSymbol)
        if (ticker) {
          const volumeUSDT = parseFloat(ticker.quoteVolume)
          const changePercent = parseFloat(ticker.priceChangePercent)
          
          // 변동성 계산 (간단한 방식)
          const volatility = Math.abs(changePercent)
          
          priceMap[coin.symbol] = {
            symbol: coin.symbol,
            price: parseFloat(ticker.lastPrice),
            changePercent,
            volume: volumeUSDT,
            volatility
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
    if (price >= 10000) return safePrice(price, 0)
    if (price >= 100) return safePrice(price, 2)
    if (price >= 1) return safePrice(price, 3)
    if (price >= 0.01) return safePrice(price, 4)
    return safePrice(price, 6)
  }

  const getVolatilityColor = (volatility: number) => {
    if (volatility >= 10) return 'text-red-400'
    if (volatility >= 5) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getVolatilityLabel = (volatility: number) => {
    if (volatility >= 10) return '높음'
    if (volatility >= 5) return '보통'
    return '낮음'
  }

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current
    if (!container) return
    
    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth)
  }

  useEffect(() => {
    checkScrollButtons()
    window.addEventListener('resize', checkScrollButtons)
    return () => window.removeEventListener('resize', checkScrollButtons)
  }, [])

  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollBy({ left: -200, behavior: 'smooth' })
    setTimeout(checkScrollButtons, 300)
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollBy({ left: 200, behavior: 'smooth' })
    setTimeout(checkScrollButtons, 300)
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
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">코인 선택</h2>
        <div 
          className="relative"
          onMouseEnter={() => setShowTooltip('dca')}
          onMouseLeave={() => setShowTooltip(null)}
          onClick={() => setShowTooltip(showTooltip === 'dca' ? null : 'dca')}
        >
          <FaInfoCircle className="text-gray-400 cursor-help text-sm sm:text-base" />
          {showTooltip === 'dca' && (
            <div className="absolute right-0 top-6 w-48 sm:w-64 bg-gray-800 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-gray-300 z-10 border border-gray-700">
              <p className="font-semibold mb-1">DCA 추천 기준</p>
              <p>변동성이 높은 코인일수록 DCA 전략에서 더 큰 수익 기회를 제공합니다.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative">
        {/* 왼쪽 화살표 */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 border border-gray-700 rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-gray-700 transition-colors"
          >
            <FaChevronLeft className="text-white text-xs sm:text-sm" />
          </button>
        )}
        
        {/* 오른쪽 화살표 */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 border border-gray-700 rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-gray-700 transition-colors"
          >
            <FaChevronRight className="text-white text-xs sm:text-sm" />
          </button>
        )}
        
        <div 
          ref={scrollContainerRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-3 hide-scrollbar px-8 sm:px-10"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onScroll={checkScrollButtons}
        >
          {coins.map(coin => {
            const data = priceData[coin.symbol]
            const isSelected = selectedCoin.symbol === coin.symbol
            
            return (
              <button
                key={coin.symbol}
                onClick={() => onSelectCoin(coin)}
                className={`flex-shrink-0 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected 
                    ? `${coin.bgColor} border-purple-500` 
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                }`}
              >
                <div className="text-left min-w-[110px] sm:min-w-[140px]">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className={`text-base sm:text-lg font-bold ${coin.color}`}>{coin.symbol}</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">{coin.name}</span>
                  </div>
                  
                  {loading ? (
                    <div className="animate-pulse">
                      <div className="h-3 sm:h-4 bg-gray-700 rounded mb-1 sm:mb-2"></div>
                      <div className="h-2 sm:h-3 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  ) : data ? (
                    <>
                      <div className="text-white font-semibold text-sm sm:text-base">
                        ${formatPrice(data.price)}
                      </div>
                      <div className={`flex items-center gap-1 text-xs sm:text-sm ${
                        data.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {data.changePercent >= 0 ? <FaArrowUp className="text-[10px] sm:text-xs" /> : <FaArrowDown className="text-[10px] sm:text-xs" />}
                        {Math.abs(data.changePercent).toFixed(2)}%
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                        Vol: {formatVolume(data.volume)}
                      </div>
                      <div className="mt-1 sm:mt-2">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs">
                          <span className="text-gray-400">변동성</span>
                          <span className={`${getVolatilityColor(data.volatility)} hidden sm:inline`}>
                            {getVolatilityLabel(data.volatility)}
                          </span>
                          <span className={`${getVolatilityColor(data.volatility)} sm:hidden`}>
                            {safeFixed(data.volatility, 1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1 sm:h-1.5 mt-0.5 sm:mt-1">
                          <div 
                            className={`h-1 sm:h-1.5 rounded-full transition-all ${
                              data.volatility >= 10 ? 'bg-red-400' :
                              data.volatility >= 5 ? 'bg-yellow-400' : 'bg-green-400'
                            }`}
                            style={{ width: `${Math.min(100, data.volatility * 10)}%` }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs sm:text-sm text-gray-400">데이터 없음</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
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