'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatPrice, formatPercentage, formatVolume } from '@/lib/formatters'

interface MarketStats {
  currentPrice: number
  priceChange24h: number
  volume24h: number
  volumeChange24h: number
  marketCap: number
  dominance: number
}

interface CoinSelectorProps {
  symbols: string[]
  selectedSymbol: string
  onSelectSymbol: (symbol: string) => void
  marketStats: Record<string, MarketStats>
}

// 코인 이모지 매핑
const getCoinIcon = (symbol: string) => {
  const iconMap: Record<string, string> = {
    'BTCUSDT': '₿',
    'ETHUSDT': 'Ξ',
    'BNBUSDT': '🟡',
    'SOLUSDT': '◎',
    'XRPUSDT': '✕',
    'ADAUSDT': '₳',
    'DOGEUSDT': '🐕',
    'AVAXUSDT': '🔺',
    'MATICUSDT': '⬢',
    'DOTUSDT': '●'
  }
  return iconMap[symbol] || '🪙'
}

// 코인 이름 매핑
const getCoinName = (symbol: string) => {
  const nameMap: Record<string, string> = {
    'BTCUSDT': 'Bitcoin',
    'ETHUSDT': 'Ethereum',
    'BNBUSDT': 'BNB',
    'SOLUSDT': 'Solana',
    'XRPUSDT': 'XRP',
    'ADAUSDT': 'Cardano',
    'DOGEUSDT': 'Dogecoin',
    'AVAXUSDT': 'Avalanche',
    'MATICUSDT': 'Polygon',
    'DOTUSDT': 'Polkadot'
  }
  return nameMap[symbol] || symbol.replace('USDT', '')
}

export default function CoinSelector({ 
  symbols, 
  selectedSymbol, 
  onSelectSymbol,
  marketStats 
}: CoinSelectorProps) {
  const [prices, setPrices] = useState<Record<string, number>>({})
  
  // 실시간 가격 업데이트
  useEffect(() => {
    const updatePrices = async () => {
      try {
        // 여러 심볼의 가격을 한번에 가져오기
        const symbolsQuery = symbols.join(',')
        const response = await fetch(
          `/api/binance/prices?symbols=[${symbols.map(s => `"${s}"`).join(',')}]`
        )
        
        if (response.ok) {
          const data = await response.json()
          const priceMap: Record<string, number> = {}
          data.forEach((item: any) => {
            priceMap[item.symbol] = parseFloat(item.price)
          })
          setPrices(priceMap)
        } else {
          console.error('Prices API error:', response.status)
          // API 에러 시 기본값 사용
          const defaultPrices: Record<string, number> = {
            'BTCUSDT': 98000,
            'ETHUSDT': 3500,
            'BNBUSDT': 700,
            'SOLUSDT': 250,
            'XRPUSDT': 2.5,
            'ADAUSDT': 1.2,
            'DOGEUSDT': 0.4,
            'AVAXUSDT': 40,
            'MATICUSDT': 1.5,
            'DOTUSDT': 10
          }
          setPrices(defaultPrices)
        }
      } catch (error) {
        console.error('Error fetching prices:', error)
        // 네트워크 에러 시 기본값 사용
        const defaultPrices: Record<string, number> = {
          'BTCUSDT': 98000,
          'ETHUSDT': 3500,
          'BNBUSDT': 700,
          'SOLUSDT': 250,
          'XRPUSDT': 2.5,
          'ADAUSDT': 1.2,
          'DOGEUSDT': 0.4,
          'AVAXUSDT': 40,
          'MATICUSDT': 1.5,
          'DOTUSDT': 10
        }
        setPrices(defaultPrices)
      }
    }
    
    updatePrices()
    const interval = setInterval(updatePrices, 3000) // 3초마다 업데이트
    
    return () => clearInterval(interval)
  }, [symbols])
  
  const currentStats = marketStats[selectedSymbol] || {
    currentPrice: prices[selectedSymbol] || 0,
    priceChange24h: 0,
    volume24h: 0,
    volumeChange24h: 0,
    marketCap: 0,
    dominance: 0
  }
  
  return (
    <div className="space-y-4">
      {/* 현재 선택된 코인 정보 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-400 text-xs mb-1">현재 가격</p>
            <p className="text-xl font-bold text-white">
              {formatPrice(currentStats.currentPrice)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">24시간 변동률</p>
            <p className={`text-xl font-bold ${
              currentStats.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {currentStats.priceChange24h >= 0 ? '+' : ''}{formatPercentage(currentStats.priceChange24h)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">24시간 거래량</p>
            <p className="text-xl font-bold text-white">
              {formatVolume(currentStats.volume24h)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">거래량 변화</p>
            <p className={`text-xl font-bold ${
              currentStats.volumeChange24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {currentStats.volumeChange24h >= 0 ? '+' : ''}{formatPercentage(currentStats.volumeChange24h)}
            </p>
          </div>
        </div>
      </div>
      
      {/* 코인 선택 버튼들 */}
      <div className="flex flex-wrap gap-2">
        {symbols.map((symbol) => {
          const Icon = getCoinIcon(symbol)
          const stats = marketStats[symbol]
          const price = prices[symbol] || stats?.currentPrice || 0
          const change = stats?.priceChange24h || 0
          
          return (
            <motion.button
              key={symbol}
              onClick={() => onSelectSymbol(symbol)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                selectedSymbol === symbol
                  ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/20'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800'
              } border backdrop-blur-sm`}
            >
              <span className="text-lg">{Icon}</span>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {symbol.replace('USDT', '')}
                  </span>
                  <span className={`text-xs ${
                    change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {change >= 0 ? '+' : ''}{formatPercentage(change)}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {formatPrice(price)}
                </p>
              </div>
              
              {selectedSymbol === symbol && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="absolute inset-0 border-2 border-purple-500 rounded-lg pointer-events-none"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}