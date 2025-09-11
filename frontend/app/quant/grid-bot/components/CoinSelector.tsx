'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight, FaRobot } from 'react-icons/fa'
import { binanceAPI } from '@/lib/binanceConfig'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface CoinSelectorProps {
  selectedCoin: string
  onCoinSelect: (coin: string) => void
  coins: CoinInfo[]
}

export default function CoinSelector({ selectedCoin, onCoinSelect, coins }: CoinSelectorProps) {
  const [prices, setPrices] = useState<Record<string, { price: number, change: number, volume: number }>>({})
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // 선택된 코인의 인덱스 찾기
  useEffect(() => {
    const index = coins.findIndex(coin => coin.symbol === selectedCoin)
    if (index !== -1) {
      setCurrentIndex(index)
    }
  }, [selectedCoin, coins])
  
  // 실시간 가격 데이터 가져오기
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const pricePromises = coins.map(async (coin) => {
          const { data } = await binanceAPI.get24hrTicker(coin.fullSymbol)
          if (data) {
            return {
              symbol: coin.symbol,
              price: parseFloat(data.lastPrice),
              change: parseFloat(data.priceChangePercent),
              volume: parseFloat(data.quoteVolume)
            }
          }
          return null
        })
        
        const results = await Promise.all(pricePromises)
        const priceMap: Record<string, { price: number, change: number, volume: number }> = {}
        
        results.forEach(result => {
          if (result) {
            priceMap[result.symbol] = {
              price: result.price,
              change: result.change,
              volume: result.volume
            }
          }
        })
        
        setPrices(priceMap)
        setLoading(false)
      } catch (error) {
        console.error('가격 데이터 로드 실패:', error)
        setLoading(false)
      }
    }
    
    fetchPrices()
    const interval = setInterval(fetchPrices, 5000) // 5초마다 업데이트
    
    return () => clearInterval(interval)
  }, [coins])
  
  // 이전/다음 코인 선택
  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : coins.length - 1
    setCurrentIndex(newIndex)
    onCoinSelect(coins[newIndex].symbol)
  }
  
  const handleNext = () => {
    const newIndex = currentIndex < coins.length - 1 ? currentIndex + 1 : 0
    setCurrentIndex(newIndex)
    onCoinSelect(coins[newIndex].symbol)
  }
  
  // 터치 스와이프 처리
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    if (isLeftSwipe) handleNext()
    if (isRightSwipe) handlePrevious()
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`
    return `$${safeFixed(volume, 2)}`
  }

  return (
    <div className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* 메인 코인 선택기 */}
        <div 
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 좌측 화살표 */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-all opacity-60 hover:opacity-100"
          >
            <FaChevronLeft className="text-white" />
          </button>
          
          {/* 우측 화살표 */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-all opacity-60 hover:opacity-100"
          >
            <FaChevronRight className="text-white" />
          </button>
          
          {/* 코인 카드 */}
          <AnimatePresence mode="wait">
            {coins.map((coin, index) => {
              if (index !== currentIndex) return null
              const priceInfo = prices[coin.symbol]
              
              return (
                <motion.div
                  key={coin.symbol}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="mx-12"
                >
                  <div className={`${coin.bgColor} border border-gray-700 rounded-xl p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 ${coin.bgColor} rounded-lg flex items-center justify-center`}>
                          <FaRobot className={`text-2xl ${coin.color}`} />
                        </div>
                        <div>
                          <h2 className={`text-2xl font-bold ${coin.color}`}>{coin.symbol}</h2>
                          <p className="text-gray-400">{coin.name}</p>
                        </div>
                      </div>
                      
                      {/* 그리드 봇 상태 */}
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1">그리드 봇 추천도</p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div
                                key={star}
                                className={`w-4 h-4 rounded-full ${
                                  star <= (priceInfo?.change ? Math.min(5, Math.max(1, Math.abs(priceInfo.change) / 2)) : 3)
                                    ? coin.bgColor.replace('/20', '')
                                    : 'bg-gray-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className={`text-sm ${coin.color}`}>
                            {priceInfo?.change ? (Math.abs(priceInfo.change) > 5 ? '최적' : '양호') : '분석중'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 가격 정보 */}
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-6 bg-gray-700 rounded w-1/4"></div>
                      </div>
                    ) : priceInfo ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">현재가</p>
                          <p className="text-2xl font-bold text-white">
                            ${priceInfo.price.toFixed(coin.symbol === 'BTC' ? 2 : 4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">24시간 변동률</p>
                          <p className={`text-xl font-bold ${priceInfo.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {priceInfo.change >= 0 ? '+' : ''}{safePrice(priceInfo.change, 2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">24시간 거래량</p>
                          <p className="text-xl font-bold text-white">
                            {formatVolume(priceInfo.volume)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">가격 정보를 불러올 수 없습니다</p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
        
        {/* 코인 목록 (점 표시) */}
        <div className="flex justify-center gap-2 mt-4">
          {coins.map((coin, index) => (
            <button
              key={coin.symbol}
              onClick={() => {
                setCurrentIndex(index)
                onCoinSelect(coin.symbol)
              }}
              className={`transition-all ${
                index === currentIndex
                  ? `w-8 h-2 ${coin.bgColor.replace('/20', '')} rounded-full`
                  : 'w-2 h-2 bg-gray-600 rounded-full hover:bg-gray-500'
              }`}
              title={coin.name}
            />
          ))}
        </div>
        
        {/* 빠른 선택 버튼 (모바일에서는 숨김) */}
        <div className="hidden md:grid grid-cols-5 gap-2 mt-6">
          {coins.map((coin) => {
            const priceInfo = prices[coin.symbol]
            return (
              <button
                key={coin.symbol}
                onClick={() => onCoinSelect(coin.symbol)}
                className={`p-3 rounded-lg border transition-all ${
                  coin.symbol === selectedCoin
                    ? `${coin.bgColor} border-current ${coin.color}`
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                }`}
              >
                <div className="font-bold">{coin.symbol}</div>
                {priceInfo && (
                  <div className={`text-xs mt-1 ${
                    priceInfo.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {priceInfo.change >= 0 ? '+' : ''}{safePrice(priceInfo.change, 1)}%
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}