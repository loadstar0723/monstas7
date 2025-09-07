'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { FaFish, FaArrowUp, FaArrowDown, FaExchangeAlt, FaChartBar } from 'react-icons/fa'
import { ModuleWebSocket, safeApiCall, ModulePerformance } from '@/lib/moduleUtils'
import { BINANCE_CONFIG, binanceAPI } from '@/lib/binanceConfig'

const WhaleAnalysis = dynamic(() => import('@/components/signals/WhaleAnalysis'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
})

const SimplePriceChart = dynamic(() => import('@/components/SimplePriceChart'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800 animate-pulse rounded-lg" />
})

interface WhaleTransaction {
  id: string
  symbol: string
  price: number
  quantity: number
  quoteQty: number
  time: number
  isBuyerMaker: boolean
  isBestMatch: boolean
}

interface WhaleStats {
  totalVolume24h: number
  largeTransactions: number
  buyVolume: number
  sellVolume: number
  avgTransactionSize: number
}

export default function WhaleTrackerModule() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])
  const [stats, setStats] = useState<WhaleStats>({
    totalVolume24h: 0,
    largeTransactions: 0,
    buyVolume: 0,
    sellVolume: 0,
    avgTransactionSize: 0
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analysis'>('overview')
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<ModuleWebSocket | null>(null)
  const performance = useRef(new ModulePerformance('WhaleTracker'))
  
  // 대규모 거래 필터링 (고래 기준)
  const WHALE_THRESHOLDS = {
    BTCUSDT: 10,     // 10 BTC 이상
    ETHUSDT: 100,    // 100 ETH 이상
    BNBUSDT: 500,    // 500 BNB 이상
    SOLUSDT: 1000,   // 1000 SOL 이상
  }
  
  useEffect(() => {
    const initModule = async () => {
      const measureInit = performance.current.startMeasure('initialization')
      
      try {
        setLoading(true)
        
        // 24시간 거래 통계 가져오기
        const { data: ticker24h, error: tickerError } = await safeApiCall(
          () => binanceAPI.get24hrTicker(selectedSymbol),
          null,
          'WhaleTracker'
        )
        
        if (ticker24h) {
          setStats(prev => ({
            ...prev,
            totalVolume24h: parseFloat(ticker24h.volume) * parseFloat(ticker24h.lastPrice)
          }))
        }
        
        // WebSocket 연결 (aggTrade 스트림 - 집계된 거래 데이터)
        wsRef.current = new ModuleWebSocket('WhaleTracker')
        const wsUrl = `${BINANCE_CONFIG.WS_BASE}/${selectedSymbol.toLowerCase()}@aggTrade`
        
        wsRef.current.connect(wsUrl, (data) => {
          const measureWs = performance.current.startMeasure('websocket_message')
          
          // 고래 거래만 필터링
          const threshold = WHALE_THRESHOLDS[selectedSymbol as keyof typeof WHALE_THRESHOLDS] || 1
          const quantity = parseFloat(data.q)
          
          if (quantity >= threshold) {
            const transaction: WhaleTransaction = {
              id: data.a, // aggregate trade ID
              symbol: data.s,
              price: parseFloat(data.p),
              quantity: quantity,
              quoteQty: parseFloat(data.p) * quantity,
              time: data.T,
              isBuyerMaker: data.m,
              isBestMatch: data.M
            }
            
            setTransactions(prev => {
              const updated = [transaction, ...prev].slice(0, 50) // 최근 50개만 유지
              return updated
            })
            
            // 통계 업데이트
            setStats(prev => ({
              ...prev,
              largeTransactions: prev.largeTransactions + 1,
              buyVolume: !data.m ? prev.buyVolume + transaction.quoteQty : prev.buyVolume,
              sellVolume: data.m ? prev.sellVolume + transaction.quoteQty : prev.sellVolume,
              avgTransactionSize: (prev.avgTransactionSize * prev.largeTransactions + transaction.quoteQty) / (prev.largeTransactions + 1)
            }))
          }
          
          measureWs()
        })
        
        setLoading(false)
      } catch (err) {
        console.error('[WhaleTracker] Initialization error:', err)
        setError('모듈 초기화 실패')
        setLoading(false)
      } finally {
        measureInit()
      }
    }
    
    initModule()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
    }
  }, [selectedSymbol])
  
  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"
          >
            새로고침
          </button>
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">고래 추적 모듈 로딩 중...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      {/* 심볼 선택 */}
      <div className="flex gap-2">
        {['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'].map(symbol => (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedSymbol === symbol
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {symbol.replace('USDT', '')}
          </button>
        ))}
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="flex gap-4 border-b border-gray-800">
        {[
          { id: 'overview', label: '개요' },
          { id: 'transactions', label: '고래 거래' },
          { id: 'analysis', label: '패턴 분석' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-4 font-medium transition-all ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* 탭 컨텐츠 */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* AI 분석 */}
          <WhaleAnalysis />
          
          {/* 실시간 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <FaFish className="text-blue-400 text-2xl mb-3" />
              <p className="text-gray-400 text-sm mb-1">고래 거래</p>
              <p className="text-2xl font-bold text-white">{stats.largeTransactions}</p>
              <p className="text-green-400 text-sm mt-2">실시간</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <FaArrowUp className="text-green-400 text-2xl mb-3" />
              <p className="text-gray-400 text-sm mb-1">매수량</p>
              <p className="text-2xl font-bold text-white">
                ${(stats.buyVolume / 1000000).toFixed(2)}M
              </p>
              <p className="text-green-400 text-sm mt-2">
                {stats.buyVolume > stats.sellVolume ? '매수 우세' : '매도 우세'}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <FaArrowDown className="text-red-400 text-2xl mb-3" />
              <p className="text-gray-400 text-sm mb-1">매도량</p>
              <p className="text-2xl font-bold text-white">
                ${(stats.sellVolume / 1000000).toFixed(2)}M
              </p>
              <p className="text-sm mt-2 text-gray-400">
                비율: {((stats.buyVolume / (stats.sellVolume || 1)) * 100).toFixed(0)}%
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <FaChartBar className="text-purple-400 text-2xl mb-3" />
              <p className="text-gray-400 text-sm mb-1">평균 규모</p>
              <p className="text-2xl font-bold text-white">
                ${(stats.avgTransactionSize / 1000).toFixed(1)}K
              </p>
              <p className="text-purple-400 text-sm mt-2">고래 기준 이상</p>
            </motion.div>
          </div>
          
          {/* 실시간 차트 */}
          <SimplePriceChart symbol={selectedSymbol} height={400} />
        </div>
      )}
      
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">실시간 고래 거래 (Binance)</h2>
          
          {transactions.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">고래 거래 대기 중...</p>
              <p className="text-sm text-gray-500 mt-2">
                {selectedSymbol} {WHALE_THRESHOLDS[selectedSymbol as keyof typeof WHALE_THRESHOLDS] || 1} 이상 거래만 표시
              </p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">시간</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">유형</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">가격</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">수량</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">가치</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {transactions.map((tx, index) => (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {new Date(tx.time).toLocaleTimeString('ko-KR')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {tx.isBuyerMaker ? (
                              <FaArrowDown className="text-red-400" />
                            ) : (
                              <FaArrowUp className="text-green-400" />
                            )}
                            <span className={`text-sm font-medium ${
                              tx.isBuyerMaker ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {tx.isBuyerMaker ? '매도' : '매수'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          ${tx.price.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-white">
                          {tx.quantity.toLocaleString('ko-KR', { maximumFractionDigits: 4 })}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-yellow-400">
                          ${tx.quoteQty.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">고래 패턴 분석</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-blue-400">매수/매도 비율</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">매수</span>
                    <span className="text-green-400 font-bold">
                      {((stats.buyVolume / (stats.buyVolume + stats.sellVolume || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-green-400 h-3 rounded-full"
                      style={{ width: `${(stats.buyVolume / (stats.buyVolume + stats.sellVolume || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">매도</span>
                    <span className="text-red-400 font-bold">
                      {((stats.sellVolume / (stats.buyVolume + stats.sellVolume || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-red-400 h-3 rounded-full"
                      style={{ width: `${(stats.sellVolume / (stats.buyVolume + stats.sellVolume || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                실시간 Binance 고래 거래 데이터 기반
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-blue-400">거래 강도</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">총 고래 거래</span>
                  <span className="text-white font-bold">{stats.largeTransactions}건</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">평균 거래 규모</span>
                  <span className="text-white font-bold">
                    ${(stats.avgTransactionSize / 1000).toFixed(1)}K
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">24시간 거래량</span>
                  <span className="text-white font-bold">
                    ${(stats.totalVolume24h / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">시장 신호</span>
                  <span className={`font-bold ${
                    stats.buyVolume > stats.sellVolume ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stats.buyVolume > stats.sellVolume ? '강세' : '약세'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}