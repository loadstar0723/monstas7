'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  FaDollarSign, FaUniversity, FaChartLine, FaBrain, FaShieldAlt,
  FaExchangeAlt, FaHistory, FaCog, FaArrowUp, FaArrowDown
} from 'react-icons/fa'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import dynamic from 'next/dynamic'

const ComprehensiveAnalysis = dynamic(
  () => import('@/components/signals/ComprehensiveAnalysis'),
  { ssr: false }
)

export default function SmartMoneySimple() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [trades, setTrades] = useState<any[]>([])
  
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket 연결
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedSymbol.toLowerCase()}@aggTrade`)
      
      ws.onopen = () => {
        console.log('WebSocket 연결됨')
        setIsConnected(true)
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        const price = parseFloat(data.p)
        const quantity = parseFloat(data.q)
        const value = price * quantity
        
        setCurrentPrice(price)
        
        // 대규모 거래만 저장 (50,000 USDT 이상)
        if (value > 50000) {
          const trade = {
            id: data.a,
            price,
            quantity,
            value,
            time: new Date(data.T).toLocaleTimeString('ko-KR'),
            type: data.m ? 'sell' : 'buy'
          }
          
          setTrades(prev => [trade, ...prev].slice(0, 50))
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket 에러:', error)
        setIsConnected(false)
      }
      
      ws.onclose = () => {
        setIsConnected(false)
        setTimeout(connectWebSocket, 5000)
      }
      
      wsRef.current = ws
    }
    
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [selectedSymbol])

  // 차트 데이터
  const chartData = trades.slice(0, 20).reverse().map((trade, idx) => ({
    name: idx,
    value: trade.value,
    type: trade.type
  }))

  const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT']

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                스마트 머니 시그널
              </h1>
              <p className="text-gray-400 mt-2">실시간 기관 거래 추적</p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>

          {/* 심볼 선택 */}
          <div className="flex gap-2 mt-4">
            {SYMBOLS.map(symbol => (
              <button
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  selectedSymbol === symbol
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {symbol.replace('USDT', '')}
              </button>
            ))}
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          {['overview', 'trades', 'analysis'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 font-medium transition-all ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'overview' ? '개요' : tab === 'trades' ? '거래' : '분석'}
            </button>
          ))}
        </div>

        {/* 컨텐츠 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 현재 가격 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-2">현재 가격</h3>
              <p className="text-4xl font-bold text-white">
                ${currentPrice.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <FaUniversity className="text-purple-400 text-2xl mb-3" />
                <p className="text-gray-400 text-sm mb-1">대규모 거래</p>
                <p className="text-2xl font-bold text-white">{trades.length}건</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <FaArrowUp className="text-green-400 text-2xl mb-3" />
                <p className="text-gray-400 text-sm mb-1">매수 거래</p>
                <p className="text-2xl font-bold text-green-400">
                  {trades.filter(t => t.type === 'buy').length}건
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <FaArrowDown className="text-red-400 text-2xl mb-3" />
                <p className="text-gray-400 text-sm mb-1">매도 거래</p>
                <p className="text-2xl font-bold text-red-400">
                  {trades.filter(t => t.type === 'sell').length}건
                </p>
              </div>
            </div>

            {/* 차트 */}
            {chartData.length > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4">거래량 추이</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      formatter={(value: any) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-bold">실시간 대규모 거래 (&gt;$50K)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">시간</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">유형</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">가격</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">수량</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">금액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {trades.slice(0, 20).map((trade) => (
                    <motion.tr
                      key={trade.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-300">{trade.time}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1 text-sm font-bold ${
                          trade.type === 'buy' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {trade.type === 'buy' ? <FaArrowUp /> : <FaArrowDown />}
                          {trade.type === 'buy' ? '매수' : '매도'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        ${trade.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {trade.quantity.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-white">
                        ${(trade.value / 1000).toFixed(1)}K
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <ComprehensiveAnalysis 
              symbol={selectedSymbol.replace('USDT', '')}
              analysisType="smart-money"
            />
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4">거래 분석</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 mb-2">매수/매도 비율</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-green-500/20 rounded p-2 text-center">
                      <p className="text-green-400 font-bold">
                        {trades.length > 0 
                          ? ((trades.filter(t => t.type === 'buy').length / trades.length) * 100).toFixed(0)
                          : 0}%
                      </p>
                    </div>
                    <div className="flex-1 bg-red-500/20 rounded p-2 text-center">
                      <p className="text-red-400 font-bold">
                        {trades.length > 0
                          ? ((trades.filter(t => t.type === 'sell').length / trades.length) * 100).toFixed(0)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-400 mb-2">평균 거래 규모</p>
                  <p className="text-2xl font-bold text-white">
                    ${trades.length > 0 
                      ? (trades.reduce((sum, t) => sum + t.value, 0) / trades.length / 1000).toFixed(1)
                      : 0}K
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}