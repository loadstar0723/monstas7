'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface Coin {
  symbol: string
  name: string
  icon: string
}

interface CoinSelectorProps {
  coins: Coin[]
  selectedCoin: Coin
  onCoinChange: (coin: Coin) => void
}

export default function CoinSelector({ coins, selectedCoin, onCoinChange }: CoinSelectorProps) {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [changes, setChanges] = useState<Record<string, number>>({})

  // 실시간 가격 정보 가져오기
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const promises = coins.map(async (coin) => {
          const response = await fetch(`/api/binance/ticker/${coin.symbol}`)
          if (response.ok) {
            const data = await response.json()
            return {
              symbol: coin.symbol,
              price: parseFloat(data.lastPrice),
              change: parseFloat(data.priceChangePercent)
            }
          }
          return null
        })

        const results = await Promise.all(promises)
        const priceMap: Record<string, number> = {}
        const changeMap: Record<string, number> = {}

        results.forEach(result => {
          if (result) {
            priceMap[result.symbol] = result.price
            changeMap[result.symbol] = result.change
          }
        })

        setPrices(priceMap)
        setChanges(changeMap)
      } catch (error) {
        console.error('가격 정보 로드 실패:', error)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 30000) // 30초마다 업데이트

    return () => clearInterval(interval)
  }, [coins])

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    if (price >= 1) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 4 })}`
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">코인 선택</h2>
        <span className="text-xs text-gray-400">실시간 가격 기준</span>
      </div>

      {/* 모바일: 수평 스크롤 */}
      <div className="md:hidden overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-2">
          {coins.map((coin, index) => (
            <motion.button
              key={coin.symbol}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onCoinChange(coin)}
              className={`flex-shrink-0 p-3 rounded-lg border transition-all ${
                selectedCoin.symbol === coin.symbol
                  ? 'bg-purple-600/20 border-purple-500 text-white'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{coin.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{coin.name}</div>
                  {prices[coin.symbol] && (
                    <div className="text-xs text-gray-400">
                      {formatPrice(prices[coin.symbol])}
                      {changes[coin.symbol] !== undefined && (
                        <span className={`ml-1 ${changes[coin.symbol] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {changes[coin.symbol] >= 0 ? '+' : ''}{changes[coin.symbol].toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 데스크톱: 그리드 레이아웃 */}
      <div className="hidden md:grid grid-cols-5 gap-3">
        {coins.map((coin, index) => (
          <motion.button
            key={coin.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onCoinChange(coin)}
            className={`p-4 rounded-xl border transition-all ${
              selectedCoin.symbol === coin.symbol
                ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">{coin.icon}</span>
              <div className="text-center">
                <div className="font-medium">{coin.name}</div>
                {prices[coin.symbol] && (
                  <div className="text-xs text-gray-400 mt-1">
                    {formatPrice(prices[coin.symbol])}
                  </div>
                )}
                {changes[coin.symbol] !== undefined && (
                  <div className={`text-xs mt-1 ${changes[coin.symbol] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {changes[coin.symbol] >= 0 ? '▲' : '▼'} {Math.abs(changes[coin.symbol]).toFixed(2)}%
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* 선택된 코인 정보 */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedCoin.icon}</span>
            <div>
              <h3 className="text-white font-semibold">{selectedCoin.name}</h3>
              <span className="text-xs text-gray-400">{selectedCoin.symbol}</span>
            </div>
          </div>
          {prices[selectedCoin.symbol] && (
            <div className="text-right">
              <div className="text-xl font-bold text-white">
                {formatPrice(prices[selectedCoin.symbol])}
              </div>
              {changes[selectedCoin.symbol] !== undefined && (
                <div className={`text-sm ${changes[selectedCoin.symbol] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {changes[selectedCoin.symbol] >= 0 ? '+' : ''}{changes[selectedCoin.symbol].toFixed(2)}%
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}