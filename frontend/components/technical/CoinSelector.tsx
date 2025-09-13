'use client'

import { motion } from 'framer-motion'
import { FaBitcoin, FaEthereum } from 'react-icons/fa'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot } from 'react-icons/si'
import type { CoinSymbol } from './types'

// 추적할 코인 목록 (10개 주요 코인)
export const TRACKED_SYMBOLS: CoinSymbol[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: <FaBitcoin className="text-yellow-500" />, initialPrice: 98000 },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: <FaEthereum className="text-blue-500" />, initialPrice: 3500 },
  { symbol: 'BNBUSDT', name: 'BNB', icon: <SiBinance className="text-yellow-600" />, initialPrice: 700 },
  { symbol: 'SOLUSDT', name: 'Solana', icon: <div className="text-purple-500 font-bold">◎</div>, initialPrice: 240 },
  { symbol: 'XRPUSDT', name: 'XRP', icon: <div className="text-gray-400 font-bold">XRP</div>, initialPrice: 2.4 },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: <SiCardano className="text-blue-600" />, initialPrice: 1.05 },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: <SiDogecoin className="text-yellow-500" />, initialPrice: 0.42 },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: <div className="text-red-500 font-bold">AVAX</div>, initialPrice: 48 },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: <div className="text-purple-600 font-bold">MATIC</div>, initialPrice: 1.45 },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: <SiPolkadot className="text-pink-500" />, initialPrice: 8.5 }
]

interface CoinSelectorProps {
  selectedSymbol: string
  onSymbolChange: (symbol: string) => void
  className?: string
  showPrice?: boolean
  prices?: { [key: string]: number }
}

export default function CoinSelector({ 
  selectedSymbol, 
  onSymbolChange, 
  className = "",
  showPrice = false,
  prices = {}
}: CoinSelectorProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <h3 className="text-white text-sm mb-3">코인 선택</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TRACKED_SYMBOLS.map((coin) => (
          <motion.button
            key={coin.symbol}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSymbolChange(coin.symbol)}
            className={`min-w-[100px] p-3 rounded-lg border transition-all ${
              selectedSymbol === coin.symbol 
                ? 'bg-purple-600/20 border-purple-500 text-white' 
                : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="text-2xl">{coin.icon}</div>
              <span className="text-xs font-medium">{coin.name}</span>
              {showPrice && prices[coin.symbol] && (
                <span className="text-xs text-gray-500">
                  ${prices[coin.symbol].toLocaleString()}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// 코인 정보 가져오기 헬퍼 함수
export function getCoinInfo(symbol: string): CoinSymbol | undefined {
  return TRACKED_SYMBOLS.find(coin => coin.symbol === symbol)
}

// 코인 아이콘 가져오기 헬퍼 함수
export function getCoinIcon(symbol: string): JSX.Element {
  const coin = getCoinInfo(symbol)
  return coin?.icon || <div className="text-gray-500 font-bold">?</div>
}

// 코인 이름 가져오기 헬퍼 함수
export function getCoinName(symbol: string): string {
  const coin = getCoinInfo(symbol)
  return coin?.name || symbol.replace('USDT', '')
}