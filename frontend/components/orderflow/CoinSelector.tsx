'use client'

import { useEffect, useState, useRef } from 'react'
import { FaArrowUp, FaArrowDown, FaInfoCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface CoinSelectorProps {
  selectedSymbol: string
  onSymbolChange: (symbol: string) => void
}

interface CoinData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  loading: boolean
  volatility?: number
}

const COINS = [
  { symbol: 'BTCUSDT', name: '비트코인', shortName: 'BTC', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  { symbol: 'ETHUSDT', name: '이더리움', shortName: 'ETH', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { symbol: 'BNBUSDT', name: '바이낸스코인', shortName: 'BNB', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  { symbol: 'SOLUSDT', name: '솔라나', shortName: 'SOL', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { symbol: 'XRPUSDT', name: '리플', shortName: 'XRP', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  { symbol: 'ADAUSDT', name: '카르다노', shortName: 'ADA', color: 'text-blue-300', bgColor: 'bg-blue-300/20' },
  { symbol: 'DOGEUSDT', name: '도지코인', shortName: 'DOGE', color: 'text-yellow-300', bgColor: 'bg-yellow-300/20' },
  { symbol: 'AVAXUSDT', name: '아발란체', shortName: 'AVAX', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  { symbol: 'MATICUSDT', name: '폴리곤', shortName: 'MATIC', color: 'text-purple-300', bgColor: 'bg-purple-300/20' },
  { symbol: 'DOTUSDT', name: '폴카닷', shortName: 'DOT', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
]

export default function CoinSelector({ selectedSymbol, onSymbolChange }: CoinSelectorProps) {
  const [coinData, setCoinData] = useState<Record<string, CoinData>>({})
  const [showTooltip, setShowTooltip] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const response = await fetch(`/api/binance/ticker`)
        if (!response.ok) throw new Error('Failed to fetch')
        const tickers = await response.json()
        
        if (!Array.isArray(tickers)) {
          console.error('Invalid ticker data')
          return
        }
        
        const dataMap: Record<string, CoinData> = {}
        
        COINS.forEach(coin => {
          const ticker = tickers.find((t: any) => t.symbol === coin.symbol)
          if (ticker) {
            const change24h = parseFloat(ticker.priceChangePercent || 0)
            const volatility = Math.abs(change24h)
            
            dataMap[coin.symbol] = {
              symbol: coin.symbol,
              name: coin.name,
              price: parseFloat(ticker.lastPrice || ticker.price || 0),
              change24h,
              volume24h: parseFloat(ticker.quoteVolume || ticker.volume || 0),
              loading: false,
              volatility
            }
          } else {
            dataMap[coin.symbol] = {
              symbol: coin.symbol,
              name: coin.name,
              price: 0,
              change24h: 0,
              volume24h: 0,
              loading: false,
              volatility: 0
            }
          }
        })
        
        setCoinData(dataMap)
      } catch (error) {
        console.error('Failed to fetch coin data:', error)
        // 에러 시 기본값 설정
        const dataMap: Record<string, CoinData> = {}
        COINS.forEach(coin => {
          dataMap[coin.symbol] = {
            symbol: coin.symbol,
            name: coin.name,
            price: 0,
            change24h: 0,
            volume24h: 0,
            loading: false,
            volatility: 0
          }
        })
        setCoinData(dataMap)
      }
    }

    fetchCoinData()
    const interval = setInterval(fetchCoinData, 5000)

    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    if (price > 10000) return price.toFixed(0)
    if (price > 100) return price.toFixed(2)
    if (price > 1) return price.toFixed(3)
    if (price > 0.01) return price.toFixed(4)
    return price.toFixed(6)
  }

  const formatVolume = (volume: number) => {
    if (volume > 1e9) return `${(volume / 1e9).toFixed(2)}B`
    if (volume > 1e6) return `${(volume / 1e6).toFixed(2)}M`
    if (volume > 1e3) return `${(volume / 1e3).toFixed(2)}K`
    return volume.toFixed(0)
  }

  const getVolatilityColor = (volatility: number = 0) => {
    if (volatility >= 10) return 'text-red-400'
    if (volatility >= 5) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getVolatilityLabel = (volatility: number = 0) => {
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
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
        >
          <FaInfoCircle className="text-gray-400 cursor-help text-sm sm:text-base" />
          {showTooltip && (
            <div className="absolute right-0 top-6 w-48 sm:w-64 bg-gray-800 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-gray-300 z-10 border border-gray-700">
              <p className="font-semibold mb-1">오더플로우 분석</p>
              <p>실시간 오더북 임밸런스와 거래량 분석을 통해 스마트 머니의 움직임을 추적합니다.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 border border-gray-700 rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-gray-700 transition-colors"
          >
            <FaChevronLeft className="text-white text-xs sm:text-sm" />
          </button>
        )}
        
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
          {COINS.map(coin => {
            const data = coinData[coin.symbol]
            const isSelected = selectedSymbol === coin.symbol
            
            return (
              <button
                key={coin.symbol}
                onClick={() => onSymbolChange(coin.symbol)}
                className={`flex-shrink-0 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected 
                    ? `${coin.bgColor} border-purple-500` 
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                }`}
              >
                <div className="text-left min-w-[110px] sm:min-w-[140px]">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className={`text-base sm:text-lg font-bold ${coin.color}`}>{coin.shortName}</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">{coin.name}</span>
                  </div>
                  
                  {!data ? (
                    <div className="animate-pulse">
                      <div className="h-3 sm:h-4 bg-gray-700 rounded mb-1 sm:mb-2"></div>
                      <div className="h-2 sm:h-3 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-white font-semibold text-sm sm:text-base">
                        ${formatPrice(data.price)}
                      </div>
                      <div className={`flex items-center gap-1 text-xs sm:text-sm ${
                        data.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {data.change24h >= 0 ? <FaArrowUp className="text-[10px] sm:text-xs" /> : <FaArrowDown className="text-[10px] sm:text-xs" />}
                        {Math.abs(data.change24h).toFixed(2)}%
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                        Vol: {formatVolume(data.volume24h)}
                      </div>
                      <div className="mt-1 sm:mt-2">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs">
                          <span className="text-gray-400">변동성</span>
                          <span className={`${getVolatilityColor(data.volatility)} hidden sm:inline`}>
                            {getVolatilityLabel(data.volatility)}
                          </span>
                          <span className={`${getVolatilityColor(data.volatility)} sm:hidden`}>
                            {(data.volatility || 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1 sm:h-1.5 mt-0.5 sm:mt-1">
                          <div 
                            className={`h-1 sm:h-1.5 rounded-full transition-all ${
                              (data.volatility || 0) >= 10 ? 'bg-red-400' :
                              (data.volatility || 0) >= 5 ? 'bg-yellow-400' : 'bg-green-400'
                            }`}
                            style={{ width: `${Math.min(100, (data.volatility || 0) * 10)}%` }}
                          />
                        </div>
                      </div>
                    </>
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