'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface Coin {
  symbol: string
  name: string
  icon: string
  color?: string
}

interface CoinSelectorProps {
  coins: Coin[]
  selected: string
  onChange: (symbol: string) => void
  currentPrice?: number
  priceChange24h?: number
}

export default function CoinSelector({ 
  coins, 
  selected, 
  onChange, 
  currentPrice = 0,
  priceChange24h = 0 
}: CoinSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedCoin = coins.find(c => c.symbol === selected)
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors min-w-[200px]"
      >
        <span className="text-2xl">{selectedCoin?.icon}</span>
        <div className="flex-1 text-left">
          <p className="text-white font-semibold">{selectedCoin?.name}</p>
          <p className="text-xs text-gray-400">
            ${currentPrice.toLocaleString()}
            <span className={`ml-2 ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
            </span>
          </p>
        </div>
        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 rounded-lg shadow-xl z-50 max-h-[400px] overflow-y-auto">
          {coins.map(coin => (
            <button
              key={coin.symbol}
              onClick={() => {
                onChange(coin.symbol)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors ${
                coin.symbol === selected ? 'bg-gray-700' : ''
              }`}
            >
              <span className="text-2xl">{coin.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-white font-semibold">{coin.name}</p>
                <p className="text-xs text-gray-400">{coin.symbol}</p>
              </div>
              {coin.symbol === selected && (
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}