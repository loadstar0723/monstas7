'use client'

import React from 'react'

interface Coin {
  symbol: string
  name: string
  icon: string
}

interface CoinSelectorProps {
  coins: Coin[]
  selectedCoin: string
  onCoinChange: (coin: string) => void
}

export default function CoinSelector({ coins, selectedCoin, onCoinChange }: CoinSelectorProps) {
  const selected = coins.find(coin => coin.symbol === selectedCoin)

  return (
    <div className="mb-8">
      {/* 데스크탑: 버튼 그룹 */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        {coins.map((coin) => (
          <button
            key={coin.symbol}
            onClick={() => onCoinChange(coin.symbol)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium
              ${
                selectedCoin === coin.symbol
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            <span className="text-lg mr-2">{coin.icon}</span>
            {coin.symbol.replace('USDT', '')}
          </button>
        ))}
      </div>
      
      {/* 모바일: 드롭다운 */}
      <div className="md:hidden">
        <select
          value={selectedCoin}
          onChange={(e) => onCoinChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          {coins.map((coin) => (
            <option key={coin.symbol} value={coin.symbol}>
              {coin.icon} {coin.name} ({coin.symbol.replace('USDT', '')})
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}