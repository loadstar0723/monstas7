'use client'

import { motion } from 'framer-motion'

interface Coin {
  symbol: string
  name: string
  color: string
}

interface CoinSelectorProps {
  selectedCoin: string
  onSelectCoin: (coin: string) => void
  coins: Coin[]
}

export default function CoinSelector({ selectedCoin, onSelectCoin, coins }: CoinSelectorProps) {
  return (
    <div className="mb-8">
      {/* 모바일: 가로 스크롤 */}
      <div className="lg:hidden overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max px-1">
          {coins.map((coin, index) => (
            <motion.button
              key={coin.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectCoin(coin.symbol)}
              className={`
                px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap
                ${selectedCoin === coin.symbol 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }
              `}
              style={{
                borderColor: selectedCoin === coin.symbol ? coin.color : 'transparent',
                borderWidth: selectedCoin === coin.symbol ? '2px' : '1px'
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{coin.symbol}</span>
                <span className="text-xs opacity-75">{coin.name}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 데스크톱: 그리드 */}
      <div className="hidden lg:grid grid-cols-5 gap-3">
        {coins.map((coin, index) => (
          <motion.button
            key={coin.symbol}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onSelectCoin(coin.symbol)}
            className={`
              px-4 py-3 rounded-xl font-medium transition-all
              ${selectedCoin === coin.symbol 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-xl scale-105 ring-2 ring-yellow-400/50' 
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
              }
            `}
          >
            <div className="flex flex-col items-center gap-1">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: coin.color }}
              >
                {coin.symbol.charAt(0)}
              </div>
              <span className="text-base font-bold">{coin.symbol}</span>
              <span className="text-xs opacity-75">{coin.name}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* 선택된 코인 정보 */}
      <div className="mt-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: coins.find(c => c.symbol === selectedCoin)?.color }}
            >
              {selectedCoin.charAt(0)}
            </div>
            <div>
              <p className="text-white font-bold text-lg">{selectedCoin}</p>
              <p className="text-gray-400 text-sm">
                {coins.find(c => c.symbol === selectedCoin)?.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">선택된 코인</p>
            <p className="text-sm text-yellow-400">실시간 분석 중</p>
          </div>
        </div>
      </div>
    </div>
  )
}