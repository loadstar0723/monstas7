'use client'

import { useState, useEffect } from 'react'

interface Coin {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
  borderColor: string
}

interface CoinSelectorProps {
  selectedCoin: string
  onCoinSelect: (coin: string) => void
  coins: Coin[]
}

export default function CoinSelector({ selectedCoin, onCoinSelect, coins }: CoinSelectorProps) {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [changes, setChanges] = useState<Record<string, number>>({})
  
  useEffect(() => {
    // 초기값 설정
    setPrices({
      BTC: 98000,
      ETH: 3500,
      BNB: 700,
      SOL: 240,
      XRP: 2.4,
      ADA: 1.2,
      DOGE: 0.42,
      AVAX: 45,
      DOT: 11,
      MATIC: 1.5
    })
    setChanges({
      BTC: 2.5,
      ETH: 3.2,
      BNB: 1.8,
      SOL: 5.4,
      XRP: -1.2,
      ADA: 0.8,
      DOGE: 12.5,
      AVAX: -2.3,
      DOT: 1.5,
      MATIC: 2.8
    })
  }, [])
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">코인 선택</h3>
      
      {/* 모바일: 드롭다운 / 데스크톱: 그리드 */}
      <div className="block md:hidden">
        <select
          value={selectedCoin}
          onChange={(e) => onCoinSelect(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
        >
          {coins.map(coin => (
            <option key={coin.symbol} value={coin.symbol}>
              {coin.name} ({coin.symbol}) - ${prices[coin.symbol]?.toLocaleString() || '...'}
            </option>
          ))}
        </select>
      </div>
      
      {/* 데스크톱 그리드 */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-3">
        {coins.map(coin => {
          const isSelected = selectedCoin === coin.symbol
          const price = prices[coin.symbol]
          const change = changes[coin.symbol]
          
          return (
            <button
              key={coin.symbol}
              onClick={() => onCoinSelect(coin.symbol)}
              className={`p-4 rounded-lg border transition-all ${
                isSelected 
                  ? `${coin.bgColor} ${coin.borderColor} border-2 shadow-lg` 
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              }`}
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`font-bold text-lg ${isSelected ? coin.color : 'text-white'}`}>
                    {coin.symbol}
                  </span>
                  {isSelected && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                      선택됨
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 mb-2">{coin.name}</span>
                
                {price && (
                  <div className="w-full">
                    <div className="text-sm font-mono text-white">
                      ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {change !== undefined && (
                      <div className={`text-xs mt-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
      
      {/* 선택된 코인 정보 요약 */}
      {selectedCoin && prices[selectedCoin] && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">현재 선택된 코인</span>
            <div className="flex items-center gap-2">
              <span className="font-bold">{selectedCoin}</span>
              <span className="text-green-400">${prices[selectedCoin]?.toLocaleString()}</span>
              {changes[selectedCoin] !== undefined && (
                <span className={`text-sm ${changes[selectedCoin] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({changes[selectedCoin] >= 0 ? '+' : ''}{changes[selectedCoin].toFixed(2)}%)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}