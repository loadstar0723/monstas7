'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface OrderBookData {
  bids: Array<[string, string]>
  asks: Array<[string, string]>
}

interface TradeData {
  price: string
  quantity: string
  time: number
  isBuyerMaker: boolean
}

export default function TradingPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  const [orderBook, setOrderBook] = useState<OrderBookData>({ bids: [], asks: [] })
  const [recentTrades, setRecentTrades] = useState<TradeData[]>([])
  const [volume24h, setVolume24h] = useState(0)

  // Binance WebSocket 실시간 가격
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedSymbol.toLowerCase()}@ticker`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setCurrentPrice(parseFloat(data.c))
      setPriceChange(parseFloat(data.P))
      setVolume24h(parseFloat(data.v))
    }

    return () => ws.close()
  }, [selectedSymbol])

  // 오더북 WebSocket
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedSymbol.toLowerCase()}@depth20`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setOrderBook({
        bids: data.bids?.slice(0, 10) || [],
        asks: data.asks?.slice(0, 10) || []
      })
    }

    return () => ws.close()
  }, [selectedSymbol])

  // 최근 거래 WebSocket
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedSymbol.toLowerCase()}@trade`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setRecentTrades(prev => [{
        price: data.p,
        quantity: data.q,
        time: data.T,
        isBuyerMaker: data.m
      }, ...prev.slice(0, 19)])
    }

    return () => ws.close()
  }, [selectedSymbol])

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })
  }

  return (
    <div className="min-h-screen p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">실시간 트레이딩</h1>
          <p className="text-gray-400">Binance 실시간 거래 데이터</p>
        </div>

        {/* 가격 정보 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6"
          >
            <div className="text-sm text-gray-400 mb-2">현재가</div>
            <div className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${formatPrice(currentPrice)}
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6"
          >
            <div className="text-sm text-gray-400 mb-2">24시간 변동</div>
            <div className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6"
          >
            <div className="text-sm text-gray-400 mb-2">24시간 거래량</div>
            <div className="text-2xl font-bold text-blue-500">
              {(volume24h / 1000000).toFixed(2)}M
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6"
          >
            <div className="text-sm text-gray-400 mb-2">심볼 선택</div>
            <select 
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700 w-full"
            >
              <option value="BTCUSDT">BTC/USDT</option>
              <option value="ETHUSDT">ETH/USDT</option>
              <option value="BNBUSDT">BNB/USDT</option>
              <option value="SOLUSDT">SOL/USDT</option>
            </select>
          </motion.div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 오더북 */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4 gradient-text">오더북</h3>
            
            {/* 매도 주문 */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">매도</div>
              <div className="space-y-1">
                {orderBook.asks.slice().reverse().map((ask, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-red-400">${parseFloat(ask[0]).toFixed(2)}</span>
                    <span className="text-gray-500">{parseFloat(ask[1]).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 현재가 구분선 */}
            <div className="border-t border-b border-gray-700 py-2 my-2">
              <div className="text-center font-bold text-lg">
                ${formatPrice(currentPrice)}
              </div>
            </div>

            {/* 매수 주문 */}
            <div>
              <div className="text-sm text-gray-400 mb-2">매수</div>
              <div className="space-y-1">
                {orderBook.bids.map((bid, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-green-400">${parseFloat(bid[0]).toFixed(2)}</span>
                    <span className="text-gray-500">{parseFloat(bid[1]).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 차트 영역 */}
          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="text-xl font-bold mb-4 gradient-text">차트</h3>
            <div className="h-96 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📈</div>
                <p>TradingView 차트 통합 예정</p>
                <p className="text-sm mt-2">실시간 캔들스틱 차트</p>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 거래 */}
        <div className="mt-6 glass-card p-6">
          <h3 className="text-xl font-bold mb-4 gradient-text">최근 체결</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                  <th className="pb-2">시간</th>
                  <th className="pb-2">가격</th>
                  <th className="pb-2">수량</th>
                  <th className="pb-2">타입</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade, i) => (
                  <tr key={i} className="text-sm border-b border-gray-800">
                    <td className="py-2 text-gray-500">
                      {new Date(trade.time).toLocaleTimeString()}
                    </td>
                    <td className={`py-2 ${trade.isBuyerMaker ? 'text-red-400' : 'text-green-400'}`}>
                      ${parseFloat(trade.price).toFixed(2)}
                    </td>
                    <td className="py-2">{parseFloat(trade.quantity).toFixed(4)}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        trade.isBuyerMaker 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {trade.isBuyerMaker ? '매도' : '매수'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  )
}