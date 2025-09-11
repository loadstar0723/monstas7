'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaFish, FaExclamationTriangle } from 'react-icons/fa'

interface LargeTradesProps {
  symbol: string
}

interface LargeTrade {
  id: string
  time: string
  price: number
  quantity: number
  value: number
  side: 'buy' | 'sell'
}

const LARGE_TRADE_USD: Record<string, number> = {
  'BTCUSDT': 100000,
  'ETHUSDT': 50000,
  'BNBUSDT': 30000,
  'SOLUSDT': 20000,
  'XRPUSDT': 10000,
  'ADAUSDT': 10000,
  'DOGEUSDT': 10000,
  'AVAXUSDT': 15000,
  'MATICUSDT': 10000,
  'DOTUSDT': 15000,
}

export default function LargeTrades({ symbol }: LargeTradesProps) {
  const [largeTrades, setLargeTrades] = useState<LargeTrade[]>([])
  const [stats, setStats] = useState({
    count24h: 0,
    buyVolume24h: 0,
    sellVolume24h: 0,
    largestTrade: 0
  })

  useEffect(() => {
    // 초기 과거 대량 거래 데이터 로드
    fetch(`/api/binance/trades?symbol=${symbol}&limit=500`)
      .then(res => res.json())
      .then(trades => {
        if (Array.isArray(trades)) {
          const minValue = LARGE_TRADE_USD[symbol] || 50000
          const largeTrades = trades
            .filter((trade: any) => {
              const value = parseFloat(trade.price) * parseFloat(trade.qty)
              return value >= minValue
            })
            .map((trade: any) => ({
              id: trade.id,
              time: new Date(trade.time).toLocaleTimeString('ko-KR'),
              price: parseFloat(trade.price),
              quantity: parseFloat(trade.qty),
              value: parseFloat(trade.price) * parseFloat(trade.qty),
              side: trade.isBuyerMaker ? 'sell' : 'buy'
            }))
            .slice(0, 20)
          
          setLargeTrades(largeTrades)
          
          // 통계 계산
          let buyVol = 0, sellVol = 0, maxTrade = 0
          largeTrades.forEach(trade => {
            if (trade.side === 'buy') buyVol += trade.value
            else sellVol += trade.value
            maxTrade = Math.max(maxTrade, trade.value)
          })
          
          setStats({
            count24h: largeTrades.length,
            buyVolume24h: buyVol,
            sellVolume24h: sellVol,
            largestTrade: maxTrade
          })
        }
      })
    
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`)
    const minValue = LARGE_TRADE_USD[symbol] || 50000
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const price = parseFloat(data.p)
      const quantity = parseFloat(data.q)
      const value = price * quantity
      
      if (value >= minValue) {
        const newTrade: LargeTrade = {
          id: data.t,
          time: new Date(data.T).toLocaleTimeString('ko-KR'),
          price: price,
          quantity: quantity,
          value: value,
          side: data.m ? 'sell' : 'buy'
        }
        
        setLargeTrades(prev => [newTrade, ...prev].slice(0, 20))
        
        setStats(prev => ({
          count24h: prev.count24h + 1,
          buyVolume24h: prev.buyVolume24h + (!data.m ? value : 0),
          sellVolume24h: prev.sellVolume24h + (data.m ? value : 0),
          largestTrade: Math.max(prev.largestTrade, value)
        }))
      }
    }

    return () => ws.close()
  }, [symbol])

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">🐋 대량 거래 감지</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-purple-900/30 rounded-lg p-2">
            <p className="text-purple-400 text-xs mb-1">24시간 감지</p>
            <p className="text-white font-bold">{stats.count24h}건</p>
          </div>
          <div className="bg-orange-900/30 rounded-lg p-2">
            <p className="text-orange-400 text-xs mb-1">최대 거래</p>
            <p className="text-white font-bold">${(stats.largestTrade / 1000).toFixed(0)}K</p>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>매수: ${(stats.buyVolume24h / 1000000).toFixed(2)}M</span>
            <span>매도: ${(stats.sellVolume24h / 1000000).toFixed(2)}M</span>
          </div>
          <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-full"
              style={{ 
                width: `${stats.buyVolume24h + stats.sellVolume24h > 0 ? 
                  (stats.buyVolume24h / (stats.buyVolume24h + stats.sellVolume24h)) * 100 : 50}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {largeTrades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaFish className="text-4xl mx-auto mb-2 opacity-50" />
              <p>대량 거래 대기 중...</p>
            </div>
          ) : (
            largeTrades.map((trade) => (
              <div 
                key={trade.id}
                className={`p-3 rounded-lg border animate-pulse ${
                  trade.side === 'buy' 
                    ? 'bg-green-900/20 border-green-500/30' 
                    : 'bg-red-900/20 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <FaFish className={trade.side === 'buy' ? 'text-green-400' : 'text-red-400'} />
                    <span className="text-white font-medium">
                      ${(trade.value / 1000).toFixed(0)}K
                    </span>
                    {trade.value > LARGE_TRADE_USD[symbol] * 5 && (
                      <FaExclamationTriangle className="text-yellow-400" />
                    )}
                  </div>
                  <span className="text-gray-400 text-xs">{trade.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {safeAmount(trade.quantity)} @ ${safePrice(trade.price, 2)}
                  </span>
                  <span className={`font-medium ${
                    trade.side === 'buy' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.side === 'buy' ? '매수' : '매도'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}