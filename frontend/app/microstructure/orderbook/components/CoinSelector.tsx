'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCoins, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import Image from 'next/image'

interface CoinSelectorProps {
  symbols: string[]
  selectedSymbol: string
  onSelectSymbol: (symbol: string) => void
  priceData?: {
    price: number
    change: number
  }
}

interface CoinInfo {
  symbol: string
  name: string
  icon: string
  color: string
}

const coinInfo: Record<string, CoinInfo> = {
  'BTCUSDT': {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    icon: '/icons/btc.svg',
    color: 'text-orange-500'
  },
  'ETHUSDT': {
    symbol: 'ETHUSDT',
    name: 'Ethereum',
    icon: '/icons/eth.svg',
    color: 'text-blue-500'
  },
  'BNBUSDT': {
    symbol: 'BNBUSDT',
    name: 'BNB',
    icon: '/icons/bnb.svg',
    color: 'text-yellow-500'
  },
  'SOLUSDT': {
    symbol: 'SOLUSDT',
    name: 'Solana',
    icon: '/icons/sol.svg',
    color: 'text-purple-500'
  },
  'XRPUSDT': {
    symbol: 'XRPUSDT',
    name: 'Ripple',
    icon: '/icons/xrp.svg',
    color: 'text-gray-400'
  },
  'ADAUSDT': {
    symbol: 'ADAUSDT',
    name: 'Cardano',
    icon: '/icons/ada.svg',
    color: 'text-blue-400'
  },
  'DOGEUSDT': {
    symbol: 'DOGEUSDT',
    name: 'Dogecoin',
    icon: '/icons/doge.svg',
    color: 'text-yellow-600'
  },
  'AVAXUSDT': {
    symbol: 'AVAXUSDT',
    name: 'Avalanche',
    icon: '/icons/avax.svg',
    color: 'text-red-500'
  },
  'MATICUSDT': {
    symbol: 'MATICUSDT',
    name: 'Polygon',
    icon: '/icons/matic.svg',
    color: 'text-purple-600'
  },
  'DOTUSDT': {
    symbol: 'DOTUSDT',
    name: 'Polkadot',
    icon: '/icons/dot.svg',
    color: 'text-pink-500'
  }
}

// 각 코인별 실시간 가격 저장
interface PriceInfo {
  price: number
  change: number
  volume24h: number
}

export default function CoinSelector({ symbols, selectedSymbol, onSelectSymbol, priceData }: CoinSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [prices, setPrices] = useState<Record<string, PriceInfo>>({})
  const [loading, setLoading] = useState(true)

  // 모든 코인의 가격 정보 가져오기
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // 병렬로 모든 코인 가격 요청
        const pricePromises = symbols.map(async (symbol) => {
          const response = await fetch(`/api/binance/ticker/24hr?symbol=${symbol}`)
          if (response.ok) {
            const data = await response.json()
            return {
              symbol,
              price: parseFloat(data.lastPrice) || 0,
              change: parseFloat(data.priceChangePercent) || 0,
              volume24h: parseFloat(data.quoteVolume) || 0
            }
          }
          return null
        })

        const results = await Promise.all(pricePromises)
        const priceMap: Record<string, PriceInfo> = {}
        
        results.forEach(result => {
          if (result) {
            priceMap[result.symbol] = {
              price: result.price,
              change: result.change,
              volume24h: result.volume24h
            }
          }
        })

        setPrices(priceMap)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch prices:', error)
        setLoading(false)
      }
    }

    fetchPrices()
    // 30초마다 가격 업데이트
    const interval = setInterval(fetchPrices, 30000)

    return () => clearInterval(interval)
  }, [symbols])

  // 현재 선택된 코인 정보
  const currentCoin = coinInfo[selectedSymbol] || {
    symbol: selectedSymbol,
    name: selectedSymbol.replace('USDT', ''),
    icon: '/icons/default.svg',
    color: 'text-gray-500'
  }

  const currentPrice = priceData?.price || prices[selectedSymbol]?.price || 0
  const currentChange = priceData?.change || prices[selectedSymbol]?.change || 0

  return (
    <div className="relative mb-6">
      {/* 현재 선택된 코인 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center ${currentCoin.color}`}>
              <FaCoins className="text-2xl" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-white">{currentCoin.name}</h3>
              <p className="text-sm text-gray-400">{currentCoin.symbol}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xl font-bold text-white">
              ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              currentChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {currentChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              <span>{Math.abs(currentChange).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </button>

      {/* 코인 선택 드롭다운 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl border border-gray-700 shadow-xl z-50 overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-2">가격 정보 로딩 중...</p>
                </div>
              ) : (
                <div className="p-2">
                  {symbols.map((symbol) => {
                    const coin = coinInfo[symbol] || {
                      symbol,
                      name: symbol.replace('USDT', ''),
                      icon: '/icons/default.svg',
                      color: 'text-gray-500'
                    }
                    const priceInfo = prices[symbol]
                    const isSelected = symbol === selectedSymbol

                    return (
                      <button
                        key={symbol}
                        onClick={() => {
                          onSelectSymbol(symbol)
                          setIsOpen(false)
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-purple-500/20 border border-purple-500/50'
                            : 'hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center ${coin.color}`}>
                            <FaCoins className="text-xl" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-white">{coin.name}</h4>
                            <p className="text-xs text-gray-400">{coin.symbol}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold text-white">
                            ${priceInfo?.price.toLocaleString('en-US', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: symbol.includes('BTC') || symbol.includes('ETH') ? 2 : 4 
                            }) || '0.00'}
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${
                            priceInfo && priceInfo.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {priceInfo && priceInfo.change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                            <span>{Math.abs(priceInfo?.change || 0).toFixed(2)}%</span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 거래량 TOP 3 표시 */}
            {!loading && (
              <div className="border-t border-gray-700 p-3 bg-gray-800/50">
                <p className="text-xs text-gray-400 mb-2">24시간 거래량 TOP 3</p>
                <div className="flex gap-2">
                  {Object.entries(prices)
                    .sort((a, b) => b[1].volume24h - a[1].volume24h)
                    .slice(0, 3)
                    .map(([symbol, info], index) => (
                      <div
                        key={symbol}
                        className="flex-1 bg-gray-700/50 rounded-lg p-2 text-center"
                      >
                        <div className="text-xs text-gray-400">#{index + 1}</div>
                        <div className="text-sm font-semibold text-white">
                          {symbol.replace('USDT', '')}
                        </div>
                        <div className="text-xs text-purple-400">
                          ${(info.volume24h / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 모바일에서 스와이프 힌트 */}
      <div className="mt-2 text-center text-xs text-gray-500 sm:hidden">
        좌우로 스와이프하여 코인 전환 가능
      </div>
    </div>
  )
}