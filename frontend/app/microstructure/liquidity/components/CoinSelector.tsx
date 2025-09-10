'use client'

interface Coin {
  symbol: string
  name: string
  icon: string
}

interface CoinSelectorProps {
  coins: Coin[]
  selectedCoin: string
  onSelectCoin: (symbol: string) => void
}

export default function CoinSelector({ coins, selectedCoin, onSelectCoin }: CoinSelectorProps) {
  return (
    <div className="bg-gray-900/50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {coins.map((coin) => (
            <button
              key={coin.symbol}
              onClick={() => onSelectCoin(coin.symbol)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${selectedCoin === coin.symbol
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <span className="mr-2">{coin.icon}</span>
              <span className="hidden sm:inline">{coin.name}</span>
              <span className="sm:hidden">{coin.symbol.replace('USDT', '')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}