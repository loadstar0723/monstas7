'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaBitcoin, FaEthereum, FaChevronDown, FaSync
} from 'react-icons/fa'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot } from 'react-icons/si'
import { binanceWS } from '@/lib/services/enhancedWebSocketManager'

// 코인 정보 타입
interface CoinInfo {
  symbol: string
  name: string
  icon: React.ReactNode
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  marketCap?: number
}

// 코인 목록 (technical/indicators 스타일)
const COINS: Omit<CoinInfo, 'price' | 'change24h' | 'volume24h' | 'high24h' | 'low24h'>[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: <FaBitcoin className="text-yellow-500" /> },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: <FaEthereum className="text-blue-500" /> },
  { symbol: 'BNBUSDT', name: 'BNB', icon: <SiBinance className="text-yellow-600" /> },
  { symbol: 'SOLUSDT', name: 'Solana', icon: <div className="text-purple-500 font-bold">◎</div> },
  { symbol: 'XRPUSDT', name: 'XRP', icon: <div className="text-gray-400 font-bold">XRP</div> },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: <SiCardano className="text-blue-600" /> },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: <SiDogecoin className="text-yellow-500" /> },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: <div className="text-red-500 font-bold">AVAX</div> },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: <div className="text-purple-600 font-bold">MATIC</div> },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: <SiPolkadot className="text-pink-500" /> }
]

interface EnhancedCoinSelectorProps {
  selectedSymbol: string
  onSymbolChange: (symbol: string) => void
  showPriceInfo?: boolean
  className?: string
}

export default function EnhancedCoinSelector({
  selectedSymbol,
  onSymbolChange,
  showPriceInfo = true,
  className = ''
}: EnhancedCoinSelectorProps) {
  const [coinData, setCoinData] = useState<Map<string, CoinInfo>>(new Map())
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Binance 24hr ticker 데이터 가져오기
        const symbols = COINS.map(c => c.symbol).join('","')
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=["${symbols}"]`)

        if (response.ok) {
          const data = await response.json()
          const newCoinData = new Map<string, CoinInfo>()

          data.forEach((ticker: any) => {
            const coin = COINS.find(c => c.symbol === ticker.symbol)
            if (coin) {
              newCoinData.set(ticker.symbol, {
                ...coin,
                price: parseFloat(ticker.lastPrice),
                change24h: parseFloat(ticker.priceChangePercent),
                volume24h: parseFloat(ticker.quoteVolume),
                high24h: parseFloat(ticker.highPrice),
                low24h: parseFloat(ticker.lowPrice)
              })
            }
          })

          setCoinData(newCoinData)
        }
      } catch (error) {
        console.error('Failed to load initial data:', error)
        // 기본값 설정
        const newCoinData = new Map<string, CoinInfo>()
        COINS.forEach(coin => {
          newCoinData.set(coin.symbol, {
            ...coin,
            price: 0,
            change24h: 0,
            volume24h: 0,
            high24h: 0,
            low24h: 0
          })
        })
        setCoinData(newCoinData)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // WebSocket 연결
  useEffect(() => {
    // WebSocket 연결
    binanceWS.connect().then(() => {
      setIsConnected(true)

      // 모든 코인 구독
      COINS.forEach(coin => {
        binanceWS.subscribeToSymbol(coin.symbol, ['ticker'])
      })
    })

    // 실시간 가격 업데이트
    const handleTicker = (data: any) => {
      setCoinData(prev => {
        const newData = new Map(prev)
        const coin = newData.get(data.symbol)
        if (coin) {
          newData.set(data.symbol, {
            ...coin,
            price: data.price,
            change24h: data.change,
            volume24h: data.volume,
            high24h: data.high || coin.high24h,
            low24h: data.low || coin.low24h
          })
        }
        return newData
      })
    }

    binanceWS.on('ticker', handleTicker)

    // 연결 상태 이벤트
    binanceWS.on('connected', () => setIsConnected(true))
    binanceWS.on('disconnected', () => setIsConnected(false))

    return () => {
      binanceWS.off('ticker', handleTicker)
      binanceWS.unsubscribeAll()
    }
  }, [])

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedCoin = coinData.get(selectedSymbol) || COINS.find(c => c.symbol === selectedSymbol)

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${(price / 1000).toFixed(1)}K`
    if (price >= 1) return `$${price.toFixed(2)}`
    return `$${price.toFixed(4)}`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`
    return `$${volume.toFixed(2)}`
  }

  return (
    <div className={`${className}`}>
      {/* 코인 선택기 헤더 (technical/indicators 스타일) */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
        <div className="flex items-center justify-between mb-4">
          {/* 코인 선택 드롭다운 */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors"
            >
              {selectedCoin && (
                <>
                  <span className="text-xl">{selectedCoin.icon}</span>
                  <div className="text-left">
                    <div className="text-white font-semibold">{selectedCoin.name}</div>
                    <div className="text-xs text-gray-400">{selectedCoin.symbol.replace('USDT', '')}</div>
                  </div>
                </>
              )}
              <FaChevronDown className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* 드롭다운 메뉴 */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-gray-800 rounded-xl border border-gray-700 shadow-xl z-50 overflow-hidden"
                >
                  <div className="max-h-96 overflow-y-auto">
                    {Array.from(coinData.values()).map(coin => (
                      <button
                        key={coin.symbol}
                        onClick={() => {
                          onSymbolChange(coin.symbol)
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/50 transition-colors ${
                          coin.symbol === selectedSymbol ? 'bg-gray-700/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{coin.icon}</span>
                          <div className="text-left">
                            <div className="text-white font-medium">{coin.name}</div>
                            <div className="text-xs text-gray-400">{coin.symbol.replace('USDT', '')}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{formatPrice(coin.price)}</div>
                          <div className={`text-xs ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 연결 상태 */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-xs text-gray-400">
              {isConnected ? 'Live' : 'Connecting...'}
            </span>
            {isLoading && (
              <FaSync className="text-gray-400 animate-spin" />
            )}
          </div>
        </div>

        {/* 가격 정보 섹션 */}
        {showPriceInfo && selectedCoin && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 현재 가격 */}
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Price</div>
              <div className="text-xl font-bold text-white">
                {formatPrice(selectedCoin.price || 0)}
              </div>
              <div className={`text-sm mt-1 ${(selectedCoin.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(selectedCoin.change24h || 0) >= 0 ? '▲' : '▼'} {Math.abs(selectedCoin.change24h || 0).toFixed(2)}%
              </div>
            </div>

            {/* 24시간 거래량 */}
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">24h Volume</div>
              <div className="text-lg font-semibold text-white">
                {formatVolume(selectedCoin.volume24h || 0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {((selectedCoin.volume24h || 0) / 1e6).toFixed(2)}M USDT
              </div>
            </div>

            {/* 24시간 최고가 */}
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">24h High</div>
              <div className="text-lg font-semibold text-green-400">
                {formatPrice(selectedCoin.high24h || 0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                +{(((selectedCoin.high24h || 0) / (selectedCoin.price || 1) - 1) * 100).toFixed(2)}%
              </div>
            </div>

            {/* 24시간 최저가 */}
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">24h Low</div>
              <div className="text-lg font-semibold text-red-400">
                {formatPrice(selectedCoin.low24h || 0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {(((selectedCoin.low24h || 0) / (selectedCoin.price || 1) - 1) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}