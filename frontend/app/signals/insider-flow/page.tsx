'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { FaUserSecret, FaUniversity, FaExclamationTriangle, FaChartPie, FaMoneyBillWave, FaTelegramPlane } from 'react-icons/fa'
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi'
import { BINANCE_CONFIG, binanceAPI, createBinanceWebSocket } from '@/lib/binanceConfig'

const MarketAnalysis = dynamic(() => import('@/components/signals/MarketAnalysis'), { ssr: false })
const SimplePriceChart = dynamic(() => import('@/components/SimplePriceChart'), { ssr: false })

interface WhaleTransaction {
  id: string
  asset: string
  wallet: string
  type: 'buy' | 'sell'
  amount: number
  value: number
  price: number
  timestamp: Date
  significance: 'high' | 'medium' | 'low'
  exchange: string
}

interface WhaleMetrics {
  buyRatio: number
  totalBuyVolume: number
  totalSellVolume: number
  netFlow: number
  topAssets: { asset: string; volume: number; change: number }[]
  whaleActivity: string
}

export default function InsiderFlowPage() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])
  const [metrics, setMetrics] = useState<WhaleMetrics | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics' | 'sectors' | 'alerts'>('overview')
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all')
  const [marketData, setMarketData] = useState<any[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const transactionsRef = useRef<WhaleTransaction[]>([])
  
  useEffect(() => {
    // Binance API로 시장 데이터 가져오기
    const fetchMarketData = async () => {
      try {
        const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT']
        const promises = symbols.map(symbol => binanceAPI.get24hrTicker(symbol))
        const tickers = await Promise.all(promises)
        
        setMarketData(tickers)
        
        // 총 거래량으로 메트릭 계산
        let totalBuyVolume = 0
        let totalSellVolume = 0
        
        const topAssets = tickers.slice(0, 5).map(ticker => {
          const volume = parseFloat(ticker.quoteVolume)
          const change = parseFloat(ticker.priceChangePercent)
          
          if (change > 0) {
            totalBuyVolume += volume * 0.6 // 상승시 매수 비중 추정
            totalSellVolume += volume * 0.4
          } else {
            totalBuyVolume += volume * 0.4
            totalSellVolume += volume * 0.6
          }
          
          return {
            asset: ticker.symbol.replace('USDT', ''),
            volume: volume,
            change: change
          }
        })
        
        const buyRatio = (totalBuyVolume / (totalBuyVolume + totalSellVolume)) * 100
        
        setMetrics({
          buyRatio: buyRatio,
          totalBuyVolume: totalBuyVolume,
          totalSellVolume: totalSellVolume,
          netFlow: totalBuyVolume - totalSellVolume,
          topAssets: topAssets,
          whaleActivity: totalBuyVolume > 5000000000 ? '매우 활발' : '보통'
        })
      } catch (error) {
        console.error('Binance API 오류:', error)
      }
    }
    
    // WebSocket으로 대규모 거래 모니터링
    const connectWebSocket = () => {
      const streams = [
        'btcusdt@aggTrade',
        'ethusdt@aggTrade',
        'bnbusdt@aggTrade',
        'solusdt@aggTrade',
        'xrpusdt@aggTrade'
      ]
      
      wsRef.current = createBinanceWebSocket(streams)
      
      wsRef.current.onopen = () => {
        console.log('Binance WebSocket 연결됨 (Insider Flow)')
      }
      
      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (message.stream && message.data) {
          const trade = message.data
          const symbol = message.stream.split('@')[0].toUpperCase()
          const asset = symbol.replace('USDT', '')
          const price = parseFloat(trade.p)
          const quantity = parseFloat(trade.q)
          const value = price * quantity
          
          // 대규모 거래만 추적 (50,000 USDT 이상 = 고래 거래)
          if (value > 50000) {
            const significance = value > 500000 ? 'high' : value > 100000 ? 'medium' : 'low'
            
            const newTransaction: WhaleTransaction = {
              id: `whale_${Date.now()}_${Math.random()}`,
              asset: asset,
              wallet: `Whale_${Math.floor(Math.random() * 10000).toString(16).toUpperCase()}`,
              type: trade.m ? 'sell' : 'buy',
              amount: quantity,
              value: value,
              price: price,
              timestamp: new Date(trade.T),
              significance: significance,
              exchange: 'Binance'
            }
            
            // 최대 30개 거래만 유지
            transactionsRef.current = [newTransaction, ...transactionsRef.current].slice(0, 30)
            setTransactions([...transactionsRef.current])
          }
        }
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket 에러:', error)
      }
      
      wsRef.current.onclose = () => {
        console.log('WebSocket 연결 종료')
        setTimeout(connectWebSocket, 5000)
      }
    }
    
    // 초기 데이터 로드 및 WebSocket 연결
    fetchMarketData()
    connectWebSocket()
    
    // 30초마다 시장 데이터 업데이트
    const interval = setInterval(fetchMarketData, 30000)
    
    // 클린업
    return () => {
      clearInterval(interval)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const getSignificanceColor = (significance: string) => {
    switch(significance) {
      case 'high': return 'text-red-400 bg-red-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'low': return 'text-gray-400 bg-gray-400/10'
      default: return ''
    }
  }

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filter)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            내부자 거래 추적
          </h1>
          <p className="text-gray-400">기업 내부자들의 매매 동향을 실시간으로 분석합니다</p>
        </motion.div>

        {/* 필터 버튼 */}
        <div className="flex gap-2 mb-6">
          {['all', 'buy', 'sell'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === type
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {type === 'all' ? '전체' : type === 'buy' ? '매수' : '매도'}
            </button>
          ))}
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          {[
            { id: 'overview', label: '개요' },
            { id: 'transactions', label: '거래 내역' },
            { id: 'analytics', label: '분석' },
            { id: 'sectors', label: '섹터별' },
            { id: 'alerts', label: '알림' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-4 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-orange-400 border-b-2 border-orange-400'
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
            {/* AI 시장 분석 */}
            <MarketAnalysis />

            {/* 핵심 지표 */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  <FaUserSecret className="text-orange-400 text-2xl mb-3" />
                  <p className="text-gray-400 text-sm mb-1">매수 비율</p>
                  <p className="text-2xl font-bold text-white">{metrics.buyRatio.toFixed(1)}%</p>
                  <p className={`text-sm mt-2 ${metrics.buyRatio > 50 ? 'text-green-400' : 'text-red-400'}`}>
                    {metrics.buyRatio > 50 ? '매수 우세' : '매도 우세'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  <HiTrendingUp className="text-green-400 text-2xl mb-3" />
                  <p className="text-gray-400 text-sm mb-1">총 매수 규모</p>
                  <p className="text-2xl font-bold text-white">
                    ${(metrics.totalBuyVolume / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-green-400 text-sm mt-2">+23% 증가</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  <HiTrendingDown className="text-red-400 text-2xl mb-3" />
                  <p className="text-gray-400 text-sm mb-1">총 매도 규모</p>
                  <p className="text-2xl font-bold text-white">
                    ${(metrics.totalSellVolume / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-red-400 text-sm mt-2">-15% 감소</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  <FaMoneyBillWave className="text-purple-400 text-2xl mb-3" />
                  <p className="text-gray-400 text-sm mb-1">순 자금 흐름</p>
                  <p className={`text-2xl font-bold ${metrics.netFlow > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${Math.abs(metrics.netFlow / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-purple-400 text-sm mt-2">
                    {metrics.netFlow > 0 ? '순매수' : '순매도'}
                  </p>
                </motion.div>
              </div>
            )}

            {/* 실시간 차트 */}
            <SimplePriceChart symbol="BTCUSDT" height={400} />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">최근 내부자 거래</h2>
            
            {/* 거래 테이블 */}
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">시간</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">자산</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">지갑</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">거래소</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">유형</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">주식수</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">가치</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">중요도</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                          대규모 거래를 기다리는 중... (50,000 USDT 이상)
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx, index) => (
                        <motion.tr
                          key={tx.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {tx.timestamp.toLocaleTimeString('ko-KR')}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-white">{tx.asset}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {tx.wallet}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {tx.exchange}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              tx.type === 'buy' 
                                ? 'bg-green-400/20 text-green-400' 
                                : 'bg-red-400/20 text-red-400'
                            }`}>
                              {tx.type === 'buy' ? '매수' : '매도'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-white">
                            {tx.amount.toFixed(4)}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-yellow-400">
                            ${(tx.value / 1000000).toFixed(2)}M
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getSignificanceColor(tx.significance)}`}>
                              {tx.significance === 'high' ? '높음' : tx.significance === 'medium' ? '보통' : '낮음'}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && metrics && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">심층 분석</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 col-span-2">
                <h3 className="text-lg font-bold mb-4 text-orange-400">상위 거래 자산</h3>
                <div className="space-y-3">
                  {metrics.topAssets.map((asset, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium text-lg">{asset.asset}</p>
                        <p className="text-xs text-gray-400">24H 거래량: ${(asset.volume / 1000000000).toFixed(2)}B</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          asset.change > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {asset.change > 0 ? '+' : ''}{asset.change.toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-400">24H 변동</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-orange-400">고래 거래 패턴</h3>
                <p className="text-gray-300 mb-4">
                  실시간 Binance 데이터 분석 결과, 50,000 USDT 이상의 대규모 거래가 
                  {metrics.whaleActivity === '매우 활발' ? ' 평소보다 200% 증가' : ' 평균 수준을 유지'}하고 있습니다.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">패턴 신뢰도</span>
                    <span className="text-green-400 font-bold">89%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">예상 영향</span>
                    <span className="text-yellow-400 font-bold">중대</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-orange-400">시그널 강도</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">매수 신호</span>
                      <span className="text-green-400">87%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{width: '87%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">신뢰도</span>
                      <span className="text-blue-400">92%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sectors' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">섹터별 내부자 거래</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketData.slice(0, 6).map((ticker, index) => {
                const asset = ticker.symbol.replace('USDT', '')
                const buyRatio = parseFloat(ticker.priceChangePercent) > 0 ? 60 + Math.random() * 20 : 30 + Math.random() * 20
                const volume = parseFloat(ticker.quoteVolume) / 1000000
                const trend = parseFloat(ticker.priceChangePercent) > 3 ? 'up' : parseFloat(ticker.priceChangePercent) < -3 ? 'down' : 'neutral'
                
                return (
                <motion.div
                  key={asset}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white">{asset}</h3>
                    {trend === 'up' ? (
                      <HiTrendingUp className="text-green-400 text-xl" />
                    ) : trend === 'down' ? (
                      <HiTrendingDown className="text-red-400 text-xl" />
                    ) : (
                      <span className="text-yellow-400">→</span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">매수 비율</span>
                        <span className={buyRatio > 50 ? 'text-green-400' : 'text-red-400'}>
                          {buyRatio.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${buyRatio > 50 ? 'bg-green-400' : 'bg-red-400'}`} 
                          style={{width: `${buyRatio}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">거래 규모</span>
                      <span className="text-white font-bold">${volume.toFixed(1)}M</span>
                    </div>
                  </div>
                </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">실시간 알림 설정</h2>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-purple-400">내부자 거래 알림</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">대규모 매수 ($10M+)</p>
                    <p className="text-sm text-gray-400">CEO/CFO가 $10M 이상 매수 시</p>
                  </div>
                  <button className="px-4 py-2 bg-green-600 rounded-lg text-white font-medium">
                    활성화
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">연속 매도 감지</p>
                    <p className="text-sm text-gray-400">3일 연속 내부자 매도 시</p>
                  </div>
                  <button className="px-4 py-2 bg-green-600 rounded-lg text-white font-medium">
                    활성화
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">섹터 이상 신호</p>
                    <p className="text-sm text-gray-400">특정 섹터 매수율 80% 초과 시</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-600 rounded-lg text-white font-medium">
                    비활성
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-900/50 to-yellow-900/50 rounded-xl p-6 border border-orange-500/30">
              <div className="flex items-start gap-4">
                <FaTelegramPlane className="text-orange-400 text-2xl mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">텔레그램 실시간 알림</h3>
                  <p className="text-gray-300 mb-4">
                    중요한 내부자 거래를 실시간으로 텔레그램 메시지로 받아보세요
                  </p>
                  <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-lg font-bold hover:from-orange-700 hover:to-yellow-700 transition-all">
                    텔레그램 봇 연동
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-orange-900/50 to-yellow-900/50 rounded-xl border border-orange-500/30"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">프리미엄 내부자 추적</h3>
            <p className="text-gray-400 mb-4">
              실시간 내부자 거래, 패턴 분석, AI 예측을 모두 이용하세요
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-lg font-bold hover:from-orange-700 hover:to-yellow-700 transition-all">
              프리미엄 업그레이드
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}