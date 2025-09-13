'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const ObituaryAnalysisModule = dynamic(() => import('./ObituaryAnalysisModule'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-400">오비추어리 분석 모듈 로딩 중...</p>
      </div>
    </div>
  )
})

const coins = [
  { symbol: 'BTCUSDT', name: 'BTC', color: 'from-orange-500 to-yellow-500' },
  { symbol: 'ETHUSDT', name: 'ETH', color: 'from-blue-500 to-purple-500' },
  { symbol: 'BNBUSDT', name: 'BNB', color: 'from-yellow-400 to-orange-400' },
  { symbol: 'SOLUSDT', name: 'SOL', color: 'from-purple-500 to-pink-500' },
  { symbol: 'XRPUSDT', name: 'XRP', color: 'from-gray-500 to-gray-600' },
  { symbol: 'ADAUSDT', name: 'ADA', color: 'from-blue-600 to-indigo-600' },
  { symbol: 'DOGEUSDT', name: 'DOGE', color: 'from-yellow-500 to-amber-500' },
  { symbol: 'AVAXUSDT', name: 'AVAX', color: 'from-red-500 to-red-600' },
  { symbol: 'MATICUSDT', name: 'MATIC', color: 'from-purple-600 to-violet-600' },
  { symbol: 'DOTUSDT', name: 'DOT', color: 'from-pink-500 to-purple-500' }
]

export default function ObituaryAnalysisPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">페이지 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Coin Selection Bar */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">💀 Obituary Analysis</h1>
            <div className="flex gap-2 overflow-x-auto">
              {coins.map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => setSelectedSymbol(coin.symbol)}
                  className={`
                    px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300
                    ${selectedSymbol === coin.symbol 
                      ? `bg-gradient-to-r ${coin.color} text-white shadow-lg scale-105`
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  {coin.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Obituary Analysis Module */}
      <ObituaryAnalysisModule symbol={selectedSymbol} />
    </div>
  )
}