'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight, FaBitcoin } from 'react-icons/fa'
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
  const [prices, setPrices] = useState<Record<string, { price: number, change: number }>>({})
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
              change: parseFloat(data.priceChangePercent)
            }
          }
          return null
        })
        
        const results = await Promise.all(pricePromises)
        const priceMap: Record<string, { price: number, change: number }> = {}
        
        results.forEach(result => {
          if (result) {
            priceMap[result.symbol] = {
              price: result.price,
              change: result.change
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
    
    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrevious()
    }
  }
  
  return (
    <div className="mb-8">
      {/* 모바일 스와이프 가능한 메인 선택기 */}
      <div 
        className="relative bg-gray-800 rounded-xl p-6 border border-gray-700 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 이전/다음 버튼 (데스크톱) */}
        <button
          onClick={handlePrevious}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full items-center justify-center text-white transition-all z-10"
        >
          <FaChevronLeft />
        </button>
        
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full items-center justify-center text-white transition-all z-10"
        >
          <FaChevronRight />
        </button>
        
        {/* 선택된 코인 정보 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCoin}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className={`w-16 h-16 ${coins[currentIndex].bgColor} rounded-full flex items-center justify-center`}>
                <FaBitcoin className={`text-3xl ${coins[currentIndex].color}`} />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white">{coins[currentIndex].name}</h3>
                <p className="text-gray-400">{coins[currentIndex].symbol}/USDT</p>
              </div>
            </div>
            
            {/* 가격 정보 */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-gray-400 text-sm">현재가</p>
                <p className="text-xl font-bold text-white">
                  ${prices[coins[currentIndex].symbol]?.price.toLocaleString() || '-'}
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-gray-400 text-sm">24시간 변동</p>
                <p className={`text-xl font-bold ${
                  (prices[coins[currentIndex].symbol]?.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {prices[coins[currentIndex].symbol]?.change.toFixed(2) || '0.00'}%
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* 인디케이터 */}
        <div className="flex justify-center gap-2 mt-4">
          {coins.map((coin, index) => (
            <button
              key={coin.symbol}
              onClick={() => {
                setCurrentIndex(index)
                onCoinSelect(coin.symbol)
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? `${coin.bgColor} w-8`
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        {/* 모바일 스와이프 힌트 */}
        <p className="text-center text-gray-500 text-xs mt-3 md:hidden">
          ← 좌우로 스와이프하여 코인 변경 →
        </p>
      </div>
      
      {/* 전체 코인 그리드 (데스크톱) */}
      <div className="hidden md:grid grid-cols-5 gap-3 mt-6">
        {coins.map((coin) => (
          <button
            key={coin.symbol}
            onClick={() => onCoinSelect(coin.symbol)}
            className={`p-3 rounded-lg border transition-all ${
              selectedCoin === coin.symbol
                ? `${coin.bgColor} ${coin.color} border-current`
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            <div className="text-center">
              <p className="font-bold">{coin.symbol}</p>
              {prices[coin.symbol] && (
                <p className="text-xs mt-1">
                  ${prices[coin.symbol].price > 10 
                    ? prices[coin.symbol].price.toFixed(0) 
                    : prices[coin.symbol].price.toFixed(2)
                  }
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {/* 로딩 상태 */}
      {loading && (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-400 mt-2">가격 데이터 로딩 중...</p>
          </div>
        </div>
      )}
    </div>
  )
}