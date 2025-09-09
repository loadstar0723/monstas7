'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Coin {
  symbol: string
  name: string
  icon: string
}

interface PairSelectorProps {
  coins: Coin[]
  selectedPair: { coin1: string; coin2: string }
  onPairChange: (pair: { coin1: string; coin2: string }) => void
}

export default function PairSelector({ coins, selectedPair, onPairChange }: PairSelectorProps) {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  // 실시간 가격 조회
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const pricePromises = coins.map(async (coin) => {
          const response = await fetch(`/api/binance/ticker/${coin.symbol}`)
          const data = await response.json()
          return { symbol: coin.symbol, price: parseFloat(data.price || data.lastPrice || '0') }
        })

        const results = await Promise.all(pricePromises)
        const priceMap: Record<string, number> = {}
        results.forEach(({ symbol, price }) => {
          priceMap[symbol] = price
        })
        setPrices(priceMap)
        setLoading(false)
      } catch (error) {
        console.error('가격 조회 실패:', error)
        setLoading(false)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 10000) // 10초마다 업데이트
    return () => clearInterval(interval)
  }, [coins])

  const handleCoinChange = (position: 'coin1' | 'coin2', symbol: string) => {
    const newPair = { ...selectedPair }
    newPair[position] = symbol
    
    // 같은 코인 선택 방지
    if (newPair.coin1 === newPair.coin2) {
      if (position === 'coin1') {
        newPair.coin2 = coins.find(c => c.symbol !== symbol)?.symbol || coins[0].symbol
      } else {
        newPair.coin1 = coins.find(c => c.symbol !== symbol)?.symbol || coins[0].symbol
      }
    }
    
    onPairChange(newPair)
  }

  const calculateSpread = () => {
    const price1 = prices[selectedPair.coin1]
    const price2 = prices[selectedPair.coin2]
    if (price1 && price2) {
      return ((price1 - price2) / price2 * 100).toFixed(2)
    }
    return '0.00'
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(0)
    if (price >= 10) return price.toFixed(2)
    if (price >= 1) return price.toFixed(3)
    return price.toFixed(6)
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-purple-400">🔄</span>
        페어 선택
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coin 1 선택 */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">첫 번째 코인</label>
          <select
            value={selectedPair.coin1}
            onChange={(e) => handleCoinChange('coin1', e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
          >
            {coins.map((coin) => (
              <option key={coin.symbol} value={coin.symbol}>
                {coin.icon} {coin.name} - ${formatPrice(prices[coin.symbol] || 0)}
              </option>
            ))}
          </select>
          {!loading && prices[selectedPair.coin1] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-500"
            >
              현재가: <span className="text-green-400">${formatPrice(prices[selectedPair.coin1])}</span>
            </motion.div>
          )}
        </div>

        {/* 페어 정보 */}
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-sm text-gray-400">스프레드</div>
            <div className={`text-2xl font-bold ${parseFloat(calculateSpread()) > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {calculateSpread()}%
            </div>
          </div>
        </div>

        {/* Coin 2 선택 */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">두 번째 코인</label>
          <select
            value={selectedPair.coin2}
            onChange={(e) => handleCoinChange('coin2', e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
          >
            {coins.map((coin) => (
              <option key={coin.symbol} value={coin.symbol}>
                {coin.icon} {coin.name} - ${formatPrice(prices[coin.symbol] || 0)}
              </option>
            ))}
          </select>
          {!loading && prices[selectedPair.coin2] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-500"
            >
              현재가: <span className="text-green-400">${formatPrice(prices[selectedPair.coin2])}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* 추천 페어 */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-semibold text-yellow-400 mb-3">🎯 추천 페어</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { pair: 'BTC/ETH', correlation: 0.85 },
            { pair: 'SOL/AVAX', correlation: 0.78 },
            { pair: 'BNB/MATIC', correlation: 0.72 },
            { pair: 'ADA/DOT', correlation: 0.69 }
          ].map((item, index) => (
            <motion.button
              key={item.pair}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                const [coin1, coin2] = item.pair.split('/')
                const symbol1 = coins.find(c => c.name.includes(coin1) || c.symbol.startsWith(coin1))?.symbol
                const symbol2 = coins.find(c => c.name.includes(coin2) || c.symbol.startsWith(coin2))?.symbol
                if (symbol1 && symbol2) {
                  onPairChange({ coin1: symbol1, coin2: symbol2 })
                }
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            >
              <div className="font-semibold">{item.pair}</div>
              <div className="text-xs text-gray-400">상관계수: {item.correlation}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}