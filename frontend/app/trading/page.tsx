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
  const [high24h, setHigh24h] = useState(0)
  const [low24h, setLow24h] = useState(0)
  const [isAutoTrade, setIsAutoTrade] = useState(false)
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT')
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY')
  const [orderPrice, setOrderPrice] = useState('')
  const [orderAmount, setOrderAmount] = useState('')

  // Binance WebSocket 실시간 가격
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedSymbol.toLowerCase()}@ticker`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setCurrentPrice(parseFloat(data.c))
      setPriceChange(parseFloat(data.P))
      setVolume24h(parseFloat(data.v))
      setHigh24h(parseFloat(data.h))
      setLow24h(parseFloat(data.l))
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

        {/* 심볼 선택 및 AI 자동매매 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <select 
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 font-medium"
            >
              <option value="BTCUSDT">BTC/USDT</option>
              <option value="ETHUSDT">ETH/USDT</option>
              <option value="BNBUSDT">BNB/USDT</option>
              <option value="SOLUSDT">SOL/USDT</option>
              <option value="XRPUSDT">XRP/USDT</option>
              <option value="ADAUSDT">ADA/USDT</option>
              <option value="DOGEUSDT">DOGE/USDT</option>
              <option value="AVAXUSDT">AVAX/USDT</option>
            </select>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAutoTrade(!isAutoTrade)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                isAutoTrade 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              🤖 AI 자동매매 {isAutoTrade ? 'ON' : 'OFF'}
            </motion.button>
          </div>
          
          <div className="text-sm text-gray-400">
            마지막 업데이트: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-4"
          >
            <div className="text-xs text-gray-400 mb-1">현재가</div>
            <div className={`text-xl font-bold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${formatPrice(currentPrice)}
            </div>
            <div className="text-xs mt-1">
              {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-4"
          >
            <div className="text-xs text-gray-400 mb-1">24시간 최고</div>
            <div className="text-xl font-bold text-green-400">
              ${formatPrice(high24h)}
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-4"
          >
            <div className="text-xs text-gray-400 mb-1">24시간 최저</div>
            <div className="text-xl font-bold text-red-400">
              ${formatPrice(low24h)}
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-4"
          >
            <div className="text-xs text-gray-400 mb-1">24시간 거래량</div>
            <div className="text-xl font-bold text-blue-400">
              {(volume24h / 1000000).toFixed(2)}M
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-4"
          >
            <div className="text-xs text-gray-400 mb-1">오더북 스프레드</div>
            <div className="text-xl font-bold text-yellow-400">
              0.01%
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-4"
          >
            <div className="text-xs text-gray-400 mb-1">RSI</div>
            <div className="text-xl font-bold text-purple-400">
              65.4
            </div>
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
            <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-900 rounded-lg mb-4">
              <div className="text-center">
                <div className="text-6xl mb-4">📈</div>
                <p>TradingView 차트 통합 예정</p>
                <p className="text-sm mt-2">실시간 캔들스틱 차트</p>
              </div>
            </div>
            
            {/* 주문 입력 섹션 */}
            <div className="border-t border-gray-700 pt-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setOrderType('LIMIT')}
                  className={`flex-1 py-2 rounded font-medium ${
                    orderType === 'LIMIT'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  지정가
                </button>
                <button
                  onClick={() => setOrderType('MARKET')}
                  className={`flex-1 py-2 rounded font-medium ${
                    orderType === 'MARKET'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  시장가
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <button
                    onClick={() => setOrderSide('BUY')}
                    className={`w-full py-2 rounded-lg font-bold mb-3 ${
                      orderSide === 'BUY'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                  >
                    매수
                  </button>
                  
                  {orderType === 'LIMIT' && (
                    <input
                      type="number"
                      placeholder="가격"
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(e.target.value)}
                      className="w-full mb-2 px-3 py-2 bg-gray-800 rounded border border-gray-700 text-white"
                    />
                  )}
                  
                  <input
                    type="number"
                    placeholder="수량"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    className="w-full mb-3 px-3 py-2 bg-gray-800 rounded border border-gray-700 text-white"
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg"
                  >
                    매수 주문
                  </motion.button>
                </div>
                
                <div>
                  <button
                    onClick={() => setOrderSide('SELL')}
                    className={`w-full py-2 rounded-lg font-bold mb-3 ${
                      orderSide === 'SELL'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                  >
                    매도
                  </button>
                  
                  {orderType === 'LIMIT' && (
                    <input
                      type="number"
                      placeholder="가격"
                      className="w-full mb-2 px-3 py-2 bg-gray-800 rounded border border-gray-700 text-white"
                    />
                  )}
                  
                  <input
                    type="number"
                    placeholder="수량"
                    className="w-full mb-3 px-3 py-2 bg-gray-800 rounded border border-gray-700 text-white"
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-lg"
                  >
                    매도 주문
                  </motion.button>
                </div>
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