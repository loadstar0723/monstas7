'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaFire } from 'react-icons/fa'
import { FiTrendingUp } from 'react-icons/fi'
import WebSocketManager from '@/lib/websocketManager'

const websocketManager = WebSocketManager.getInstance()

interface CoinSelectorProps {
  selectedCoin: string
  onSelectCoin: (coin: string) => void
}

interface CoinData {
  symbol: string
  name: string
  price: number
  priceChange: number
  isTrending: boolean
}

const SUPPORTED_COINS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'BNB', name: 'BNB' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'XRP', name: 'Ripple' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'DOGE', name: 'Dogecoin' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'MATIC', name: 'Polygon' },
  { symbol: 'DOT', name: 'Polkadot' }
]

// WebSocket 연결로 실시간 가격 받기
const BINANCE_WS_URL = 'wss://stream.binance.com:9443'

export default function CoinSelector({ selectedCoin, onSelectCoin }: CoinSelectorProps) {
  const [coinsData, setCoinsData] = useState<CoinData[]>(
    SUPPORTED_COINS.map(coin => ({
      symbol: coin.symbol,
      name: coin.name,
      price: 0, // API에서 실제 가격을 받을 때까지 0
      priceChange: 0,
      isTrending: false
    }))
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCoinsData = async () => {
      try {
        const updatedData: CoinData[] = []
        
        // 순차적으로 가져와서 CORS 및 Rate Limit 문제 방지
        for (const coin of SUPPORTED_COINS) {
          try {
            const response = await fetch(
              `/api/binance/ticker?symbol=${coin.symbol}USDT`
            )
            
            if (response.ok) {
              const data = await response.json()
              updatedData.push({
                symbol: coin.symbol,
                name: coin.name,
                price: parseFloat(data.lastPrice || '0'),
                priceChange: parseFloat(data.priceChangePercent || '0'),
                isTrending: Math.abs(parseFloat(data.priceChangePercent || '0')) > 5
              })
            } else {
              // 실패한 경우 기존 데이터 사용
              updatedData.push({
                symbol: coin.symbol,
                name: coin.name,
                price: 0, // API 연결 실패 시 0 표시
                priceChange: 0,
                isTrending: false
              })
            }
          } catch (error) {
            console.error(`Error fetching ${coin.symbol} data:`, error)
            // 에러 시 기존 데이터 사용
            updatedData.push({
              symbol: coin.symbol,
              name: coin.name,
              price: 0, // 에러 시 0 표시
              priceChange: 0,
              isTrending: false
            })
          }
        }
        
        setCoinsData(updatedData)
      } catch (error) {
        console.error('Error fetching coins data:', error)
      } finally {
        setLoading(false)
      }
    }

    // 컴포넌트 마운트 후 데이터 가져오기
    fetchCoinsData()
    
    // WebSocket 연결로 실시간 가격 업데이트 - WebSocketManager 사용
    // Binance WebSocket은 단일 스트림으로 시작하고 구독 메시지로 추가
    const wsUrl = `${BINANCE_WS_URL}/ws`
    
    websocketManager.connect(
      'coin-prices',
      wsUrl,
      (data) => {
        // 구독 응답은 무시
        if (data.result !== undefined || data.id !== undefined) {
          return
        }
        
        // miniTicker 데이터 처리
        if (data.e === '24hrMiniTicker' && data.s) {
          const symbol = data.s.replace('USDT', '')
          
          setCoinsData(prev => prev.map(coin => 
            coin.symbol === symbol ? {
              ...coin,
              price: parseFloat(data.c || '0'),
              priceChange: parseFloat(data.P || '0'), 
              isTrending: Math.abs(parseFloat(data.P || '0')) > 5
            } : coin
          ))
        }
      },
      (error) => {
        console.error('WebSocket error details:', {
          message: error.type || 'Connection failed',
          url: wsUrl,
          readyState: (error.target as WebSocket)?.readyState,
          timestamp: new Date().toISOString()
        })
      },
      () => {
        },
      () => {
        },
      (ws) => {
        // 연결 후 구독 메시지 전송
        const subscribeMsg = {
          method: 'SUBSCRIBE',
          params: SUPPORTED_COINS.map(coin => `${coin.symbol.toLowerCase()}usdt@miniTicker`),
          id: 1
        }
        ws.send(JSON.stringify(subscribeMsg))
        }
    )
    
    // 30초마다 REST API로 백업 업데이트
    const interval = setInterval(fetchCoinsData, 30000)

    return () => {
      clearInterval(interval)
      websocketManager.disconnect('coin-prices')
    }
  }, [])

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 pb-2">
        {coinsData.map((coin) => (
          <button
            key={coin.symbol}
            onClick={() => onSelectCoin(coin.symbol)}
            className={`flex-shrink-0 p-4 rounded-lg transition-all transform hover:scale-105 ${
              selectedCoin === coin.symbol
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-lg">{coin.symbol}</span>
              {coin.isTrending && (
                <FaFire className="text-orange-400 animate-pulse" />
              )}
            </div>
            <div className="text-sm">
              <div className="text-gray-400">{coin.name}</div>
              <div className="font-medium">
                ${coin.price.toLocaleString()}
              </div>
              {coin.priceChange !== 0 && (
                <div className={`flex items-center text-xs mt-1 ${
                  coin.priceChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  <FiTrendingUp className={`mr-1 ${
                    coin.priceChange < 0 ? 'rotate-180' : ''
                  }`} />
                  {coin.priceChange > 0 ? '+' : ''}{safePrice(coin.priceChange, 2)}%
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}