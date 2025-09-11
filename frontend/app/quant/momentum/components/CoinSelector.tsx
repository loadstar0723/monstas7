'use client'

import { CoinData } from '../MomentumModule'

interface Coin {
  symbol: string
  name: string
  icon: string
}

interface CoinSelectorProps {
  coins: Coin[]
  selectedCoin: string
  onSelectCoin: (symbol: string) => void
  coinData: CoinData | null
}

export default function CoinSelector({ coins, selectedCoin, onSelectCoin, coinData }: CoinSelectorProps) {
  return (
    <div className="sticky top-0 z-40 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* 상단 정보 바 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">모멘텀 트레이딩 분석</h1>
            <p className="text-gray-400 text-sm mt-1">실시간 모멘텀 지표와 트레이딩 신호</p>
          </div>
          
          {coinData && (
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-gray-400 text-xs">현재가</p>
                <p className="text-2xl font-bold text-white">
                  ${coinData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">24시간 변동</p>
                <p className={`text-xl font-bold ${coinData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coinData.change24h >= 0 ? '+' : ''}{safePercent(coinData.change24h)}%
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-gray-400 text-xs">24시간 거래량</p>
                <p className="text-lg font-semibold text-white">
                  ${(coinData.volume24h * coinData.price / 1000000).toFixed(2)}M
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 코인 선택 탭 */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {coins.map((coin) => (
            <button
              key={coin.symbol}
              onClick={() => onSelectCoin(coin.symbol)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                whitespace-nowrap font-medium text-sm
                ${selectedCoin === coin.symbol
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }
              `}
            >
              <span className="text-lg">{coin.icon}</span>
              <span>{coin.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}