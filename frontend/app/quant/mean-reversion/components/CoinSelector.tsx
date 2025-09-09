'use client'

import { motion } from 'framer-motion'

interface Coin {
  symbol: string
  name: string
  icon: string
  color: string
  initialPrice: number
}

interface CoinSelectorProps {
  coins: Coin[]
  selectedCoin: Coin
  onSelectCoin: (coin: Coin) => void
}

export default function CoinSelector({ coins, selectedCoin, onSelectCoin }: CoinSelectorProps) {
  return (
    <div className="px-4 py-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {coins.map((coin) => (
          <motion.button
            key={coin.symbol}
            onClick={() => onSelectCoin(coin)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
              whitespace-nowrap min-w-fit
              ${selectedCoin.symbol === coin.symbol
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl" style={{ color: selectedCoin.symbol === coin.symbol ? 'white' : coin.color }}>
              {coin.icon}
            </span>
            <span className="font-medium">{coin.name}</span>
            <span className="text-xs opacity-70">{coin.symbol.replace('USDT', '')}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}