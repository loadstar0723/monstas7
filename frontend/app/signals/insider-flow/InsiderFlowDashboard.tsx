'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaUserSecret, FaExchangeAlt, FaBuilding, FaBrain, FaChartLine, 
  FaBell, FaExclamationTriangle, FaCheckCircle, FaArrowUp, FaArrowDown, 
  FaClock, FaShieldAlt, FaChartBar, FaBook, FaGraduationCap, FaLightbulb, 
  FaQuestionCircle, FaFire, FaSnowflake, FaBalanceScale, FaRocket,
  FaUniversity, FaWallet, FaNetworkWired, FaRobot, FaChartPie,
  FaExclamation, FaBinoculars, FaEye, FaLock, FaUnlock
} from 'react-icons/fa'
import { HiLightningBolt } from 'react-icons/hi'
import { AiOutlineWarning, AiOutlineRadarChart } from 'react-icons/ai'
import { BiTargetLock, BiTransfer } from 'react-icons/bi'
import { MdOutlineSpeed, MdShowChart } from 'react-icons/md'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, RadialBarChart, RadialBar, 
  Area, AreaChart
} from 'recharts'
import { createBinanceWebSocket } from '@/lib/binanceConfig'

// 타입 정의
interface CoinData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
}

interface InsiderMetrics {
  totalVolume24h: number
  buyVolume: number
  sellVolume: number
  netFlow: number
  largeTransactions: number
  institutionalActivity: number
  teamActivity: number
  exchangeInflow: number
  exchangeOutflow: number
  riskScore: number
  signalStrength: number
  trend: 'bullish' | 'bearish' | 'neutral'
}

interface Transaction {
  id: string
  timestamp: Date
  type: 'buy' | 'sell'
  amount: number
  value: number
  price: number
  category: 'retail' | 'whale' | 'institution' | 'team'
  exchange: string
  significance: 'low' | 'medium' | 'high' | 'critical'
}

// 메인 코인 목록
const MAIN_COINS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'BNB', name: 'Binance Coin' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'XRP', name: 'Ripple' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'MATIC', name: 'Polygon' },
  { symbol: 'LINK', name: 'Chainlink' }
]

export default function InsiderFlowDashboard() {
  const [selectedCoin, setSelectedCoin] = useState('BTC')
  const [coinData, setCoinData] = useState<Record<string, CoinData>>({})
  const [insiderMetrics, setInsiderMetrics] = useState<Record<string, InsiderMetrics>>({})
  const [transactions, setTransactions] = useState<Record<string, Transaction[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  
  const wsRef = useRef<WebSocket | null>(null)
  const priceUpdateRef = useRef<Record<string, NodeJS.Timeout>>({})

  // 초기 데이터 설정
  useEffect(() => {
    const initData: Record<string, CoinData> = {}
    const initMetrics: Record<string, InsiderMetrics> = {}
    const initTransactions: Record<string, Transaction[]> = {}
    
    MAIN_COINS.forEach(coin => {
      initData[coin.symbol] = {
        symbol: coin.symbol,
        name: coin.name,
        price: 0,
        change24h: 0,
        volume24h: 0,
        marketCap: 0
      }
      
      initMetrics[coin.symbol] = {
        totalVolume24h: 0,
        buyVolume: 0,
        sellVolume: 0,
        netFlow: 0,
        largeTransactions: 0,
        institutionalActivity: 0,
        teamActivity: 0,
        exchangeInflow: 0,
        exchangeOutflow: 0,
        riskScore: 0,
        signalStrength: 0,
        trend: 'neutral'
      }
      
      initTransactions[coin.symbol] = []
    })
    
    setCoinData(initData)
    setInsiderMetrics(initMetrics)
    setTransactions(initTransactions)
  }, [])

  // 24시간 티커 데이터 가져오기
  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        for (const coin of MAIN_COINS) {
          try {
            const response = await fetch(`/api/binance/ticker24hr?symbol=${coin.symbol}USDT`)
            const data = await response.json()
            
            if (data.success && data.data) {
              setCoinData(prev => ({
                ...prev,
                [coin.symbol]: {
                  ...prev[coin.symbol],
                  price: data.data.lastPrice,
                  change24h: data.data.priceChangePercent,
                  volume24h: data.data.quoteVolume,
                  marketCap: data.data.lastPrice * data.data.volume
                }
              }))
            }
          } catch (error) {
            console.error(`Error fetching ticker for ${coin.symbol}:`, error)
          }
        }
      } finally {
        // 에러가 발생하더라도 로딩 상태를 해제
        setIsLoading(false)
      }
    }
    
    fetchTickerData()
    const interval = setInterval(fetchTickerData, 30000) // 30초마다 업데이트
    
    // 2초 후에도 로딩 중이면 강제로 로딩 해제
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  // WebSocket 연결
  useEffect(() => {
    const streams = MAIN_COINS.map(coin => `${coin.symbol.toLowerCase()}usdt@aggTrade`)
    const ws = createBinanceWebSocket(streams)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected for all coins')
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.stream && message.data) {
        const trade = message.data
        const symbol = message.stream.split('@')[0].replace('usdt', '').toUpperCase()
        const price = parseFloat(trade.p)
        const quantity = parseFloat(trade.q)
        const value = price * quantity

        // 가격 업데이트 (디바운스)
        if (priceUpdateRef.current[symbol]) {
          clearTimeout(priceUpdateRef.current[symbol])
        }
        
        priceUpdateRef.current[symbol] = setTimeout(() => {
          setCoinData(prev => ({
            ...prev,
            [symbol]: {
              ...prev[symbol],
              price: price
            }
          }))
        }, 500)

        // 대규모 거래만 추적 (동적 임계값)
        const threshold = symbol === 'BTC' ? 10000 : 
                        symbol === 'ETH' ? 5000 : 
                        symbol === 'BNB' ? 3000 : 1000

        if (value >= threshold) {
          const newTransaction: Transaction = {
            id: `${symbol}_${Date.now()}_${trade.a}`,
            timestamp: new Date(trade.T || Date.now()),
            type: trade.m ? 'sell' : 'buy',
            amount: quantity,
            value: value,
            price: price,
            category: value >= threshold * 10 ? 'institution' :
                     value >= threshold * 5 ? 'whale' : 'retail',
            exchange: 'Binance',
            significance: value >= threshold * 20 ? 'critical' :
                         value >= threshold * 10 ? 'high' :
                         value >= threshold * 5 ? 'medium' : 'low'
          }

          // 트랜잭션 추가 및 메트릭 업데이트
          setTransactions(prev => ({
            ...prev,
            [symbol]: [newTransaction, ...(prev[symbol] || [])].slice(0, 100)
          }))

          // 메트릭 업데이트
          updateMetrics(symbol, newTransaction)
        }
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [])

  // 메트릭 업데이트 함수
  const updateMetrics = useCallback((symbol: string, transaction: Transaction) => {
    setInsiderMetrics(prev => {
      const current = prev[symbol] || {}
      const recentTxs = transactions[symbol] || []
      
      // 최근 거래 분석
      const buyVolume = recentTxs
        .filter(tx => tx.type === 'buy')
        .reduce((sum, tx) => sum + tx.value, 0)
      
      const sellVolume = recentTxs
        .filter(tx => tx.type === 'sell')
        .reduce((sum, tx) => sum + tx.value, 0)
      
      const institutionalTxs = recentTxs.filter(tx => tx.category === 'institution').length
      const whaleTxs = recentTxs.filter(tx => tx.category === 'whale').length
      
      // 리스크 스코어 계산
      const sellPressure = sellVolume / (buyVolume + sellVolume + 1) * 100
      const riskScore = Math.min(100, sellPressure * 0.6 + (institutionalTxs > 5 ? 20 : 0))
      
      // 시그널 강도 계산
      const signalStrength = Math.min(100, 
        (buyVolume - sellVolume) / (buyVolume + sellVolume + 1) * 50 + 50
      )
      
      // 트렌드 판단
      let trend: InsiderMetrics['trend'] = 'neutral'
      if (signalStrength > 65) trend = 'bullish'
      else if (signalStrength < 35) trend = 'bearish'
      
      return {
        ...prev,
        [symbol]: {
          totalVolume24h: buyVolume + sellVolume,
          buyVolume,
          sellVolume,
          netFlow: buyVolume - sellVolume,
          largeTransactions: recentTxs.length,
          institutionalActivity: institutionalTxs,
          teamActivity: 0, // 실제 구현 시 팀 지갑 추적 필요
          exchangeInflow: sellVolume * 0.7, // 추정치
          exchangeOutflow: buyVolume * 0.7, // 추정치
          riskScore,
          signalStrength,
          trend
        }
      }
    })
  }, [transactions])

  // 현재 선택된 코인의 데이터
  const currentCoinData = coinData[selectedCoin] || {}
  const currentMetrics = insiderMetrics[selectedCoin] || {}
  const currentTransactions = transactions[selectedCoin] || []

  // 차트 데이터 준비
  const volumeChartData = useMemo(() => {
    const last24Hours = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date()
      hour.setHours(hour.getHours() - (23 - i))
      return {
        time: hour.getHours() + '시',
        buy: 0,
        sell: 0
      }
    })
    
    currentTransactions.forEach(tx => {
      const txHour = new Date(tx.timestamp).getHours()
      const currentHour = new Date().getHours()
      const hoursAgo = (currentHour - txHour + 24) % 24
      
      if (hoursAgo < 24) {
        const index = 23 - hoursAgo
        if (index >= 0 && index < 24) {
          if (tx.type === 'buy') {
            last24Hours[index].buy += tx.value
          } else {
            last24Hours[index].sell += tx.value
          }
        }
      }
    })
    
    return last24Hours
  }, [currentTransactions])

  // 색상 함수들
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-500 bg-red-500/20'
    if (score >= 60) return 'text-orange-500 bg-orange-500/20'
    if (score >= 40) return 'text-yellow-500 bg-yellow-500/20'
    return 'text-green-500 bg-green-500/20'
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'bullish') return <FaArrowUp className="text-green-500" />
    if (trend === 'bearish') return <FaArrowDown className="text-red-500" />
    return <FaBalanceScale className="text-yellow-500" />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">내부자 거래 대시보드 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            <FaUserSecret className="inline mr-3 text-yellow-400" />
            내부자 거래 추적 대시보드
          </h1>
          <p className="text-gray-400">실시간 대규모 거래 모니터링 및 AI 기반 패턴 분석</p>
        </motion.div>

        {/* 코인 선택 탭 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 overflow-x-auto"
        >
          <div className="flex gap-2 min-w-max">
            {MAIN_COINS.map(coin => (
              <button
                key={coin.symbol}
                onClick={() => setSelectedCoin(coin.symbol)}
                className={`px-6 py-4 rounded-lg transition-all ${
                  selectedCoin === coin.symbol
                    ? 'bg-yellow-600 text-white shadow-lg'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold">{coin.symbol}</div>
                  <div className="text-sm opacity-80">{coin.name}</div>
                  <div className="text-lg font-mono mt-1">
                    ${coinData[coin.symbol]?.price.toLocaleString() || '0'}
                  </div>
                  <div className={`text-sm ${
                    coinData[coin.symbol]?.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {coinData[coin.symbol]?.change24h >= 0 ? '+' : ''}
                    {coinData[coin.symbol]?.change24h.toFixed(2)}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* 메인 대시보드 - 전체 화면 표시를 위해 그리드 구조 수정 */}
        <div className="space-y-6">
          {/* 섹션 1~2: 핵심 지표 요약 + 실시간 거래 플로우 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 섹션 1: 핵심 지표 요약 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
            >
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaChartPie className="mr-3 text-yellow-400" />
              핵심 지표 요약
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">총 거래량 (24H)</div>
                <div className="text-2xl font-bold">
                  ${(currentMetrics.totalVolume24h / 1000000).toFixed(2)}M
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">순 흐름</div>
                <div className={`text-2xl font-bold ${
                  currentMetrics.netFlow >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${(Math.abs(currentMetrics.netFlow) / 1000000).toFixed(2)}M
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">위험도</div>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold ${getRiskColor(currentMetrics.riskScore).split(' ')[0]}`}>
                    {currentMetrics.riskScore.toFixed(0)}%
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${getRiskColor(currentMetrics.riskScore)}`}>
                    {currentMetrics.riskScore >= 80 ? '위험' :
                     currentMetrics.riskScore >= 60 ? '주의' :
                     currentMetrics.riskScore >= 40 ? '보통' : '안전'}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">추세</div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(currentMetrics.trend)}
                  <span className="text-xl font-bold capitalize">
                    {currentMetrics.trend}
                  </span>
                </div>
              </div>
            </div>

            {/* 신호 강도 게이지 */}
            <div className="mt-6">
              <div className="text-sm text-gray-400 mb-2">신호 강도</div>
              <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentMetrics.signalStrength}%` }}
                  transition={{ duration: 1 }}
                  className={`absolute h-full ${
                    currentMetrics.signalStrength > 65 ? 'bg-green-500' :
                    currentMetrics.signalStrength > 35 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {currentMetrics.signalStrength.toFixed(0)}%
                </div>
              </div>
            </div>
          </motion.div>

            {/* 섹션 2: 실시간 거래 플로우 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
            >
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <HiLightningBolt className="mr-3 text-yellow-400" />
              실시간 거래 플로우
            </h2>
            
            <div className="h-80 overflow-y-auto">
              <AnimatePresence>
                {currentTransactions.slice(0, 20).map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="mb-2 p-3 bg-gray-900/50 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        tx.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="font-mono text-sm">
                          {tx.amount.toFixed(4)} {selectedCoin}
                        </div>
                        <div className="text-xs text-gray-400">
                          ${tx.value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded ${
                        tx.significance === 'critical' ? 'bg-red-600' :
                        tx.significance === 'high' ? 'bg-orange-600' :
                        tx.significance === 'medium' ? 'bg-yellow-600' : 'bg-gray-600'
                      }`}>
                        {tx.category}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
          </div>

          {/* 섹션 3~4: 거래소 입출금 분석 + 기관 활동 추적 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 섹션 3: 거래소 입출금 분석 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
            >
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaExchangeAlt className="mr-3 text-yellow-400" />
              거래소 입출금 분석
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={volumeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  formatter={(value: number) => `$${(value / 1000).toFixed(1)}K`}
                />
                <Area
                  type="monotone"
                  dataKey="buy"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="매수"
                />
                <Area
                  type="monotone"
                  dataKey="sell"
                  stackId="1"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.6}
                  name="매도"
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-sm text-gray-400">거래소 유입</div>
                <div className="text-xl font-bold text-red-400">
                  ${(currentMetrics.exchangeInflow / 1000000).toFixed(2)}M
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">거래소 유출</div>
                <div className="text-xl font-bold text-green-400">
                  ${(currentMetrics.exchangeOutflow / 1000000).toFixed(2)}M
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">넷플로우</div>
                <div className={`text-xl font-bold ${
                  currentMetrics.exchangeOutflow - currentMetrics.exchangeInflow >= 0
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${((currentMetrics.exchangeOutflow - currentMetrics.exchangeInflow) / 1000000).toFixed(2)}M
                </div>
              </div>
            </div>
          </motion.div>

            {/* 섹션 4: 기관 활동 추적 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
            >
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaUniversity className="mr-3 text-yellow-400" />
              기관 활동 추적
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <FaBuilding className="text-2xl text-blue-400 mb-2" />
                <div className="text-sm text-gray-400">기관 거래</div>
                <div className="text-2xl font-bold">{currentMetrics.institutionalActivity}</div>
                <div className="text-xs text-gray-500 mt-1">최근 24시간</div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <FaWallet className="text-2xl text-purple-400 mb-2" />
                <div className="text-sm text-gray-400">대규모 거래</div>
                <div className="text-2xl font-bold">{currentMetrics.largeTransactions}</div>
                <div className="text-xs text-gray-500 mt-1">$10K+ 거래</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-gray-400 mb-2">기관 활동 지표</div>
              <div className="space-y-2">
                {currentTransactions
                  .filter(tx => tx.category === 'institution' || tx.category === 'whale')
                  .slice(0, 5)
                  .map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-2 bg-gray-900/30 rounded">
                      <div className="flex items-center gap-2">
                        <FaUniversity className="text-blue-400" />
                        <span className="text-sm">{tx.category.toUpperCase()}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          ${(tx.value / 1000000).toFixed(2)}M
                        </div>
                        <div className={`text-xs ${tx.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
          </div>

          {/* 섹션 5~6: AI 패턴 인식 + 실전 트레이딩 가이드 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 섹션 5: AI 패턴 인식 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
            >
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaBrain className="mr-3 text-yellow-400" />
              AI 패턴 인식 및 예측
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">현재 패턴</span>
                  <span className={`px-3 py-1 rounded text-sm ${
                    currentMetrics.trend === 'bullish' ? 'bg-green-600' :
                    currentMetrics.trend === 'bearish' ? 'bg-red-600' : 'bg-gray-600'
                  }`}>
                    {currentMetrics.trend === 'bullish' ? '축적 단계' :
                     currentMetrics.trend === 'bearish' ? '분배 단계' : '보합 단계'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-300">
                  {currentMetrics.trend === 'bullish' ? 
                    '🟢 기관 매수세가 강하게 나타나고 있습니다. 추가 상승 가능성이 높습니다.' :
                   currentMetrics.trend === 'bearish' ?
                    '🔴 매도 압력이 증가하고 있습니다. 단기 조정 가능성에 주의하세요.' :
                    '🟡 뚜렷한 방향성이 없습니다. 추세 형성을 기다리는 것이 좋습니다.'}
                </div>
              </div>

              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">이상 거래 감지</div>
                {currentTransactions
                  .filter(tx => tx.significance === 'critical' || tx.significance === 'high')
                  .slice(0, 3)
                  .map(tx => (
                    <div key={tx.id} className="flex items-center gap-2 mb-2">
                      <AiOutlineWarning className="text-yellow-400" />
                      <span className="text-sm">
                        {tx.value >= 1000000 ? '초대형' : '대형'} {tx.type === 'buy' ? '매수' : '매도'} 감지: 
                        ${(tx.value / 1000000).toFixed(2)}M
                      </span>
                    </div>
                  ))}
              </div>

              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">AI 예측</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">단기 (1-4H):</span>
                    <span className={`ml-2 ${
                      currentMetrics.signalStrength > 65 ? 'text-green-400' :
                      currentMetrics.signalStrength < 35 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {currentMetrics.signalStrength > 65 ? '상승' :
                       currentMetrics.signalStrength < 35 ? '하락' : '보합'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">신뢰도:</span>
                    <span className="ml-2">{(currentMetrics.signalStrength * 0.8).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

            {/* 섹션 6: 실전 트레이딩 가이드 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
            >
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaRocket className="mr-3 text-yellow-400" />
              실전 트레이딩 가이드
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <h3 className="font-bold mb-2">현재 시장 상황</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">추세 강도</span>
                    <span>{currentMetrics.signalStrength.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">리스크 레벨</span>
                    <span className={getRiskColor(currentMetrics.riskScore).split(' ')[0]}>
                      {currentMetrics.riskScore.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">권장 포지션</span>
                    <span className={
                      currentMetrics.trend === 'bullish' ? 'text-green-400' :
                      currentMetrics.trend === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                    }>
                      {currentMetrics.trend === 'bullish' ? 'LONG' :
                       currentMetrics.trend === 'bearish' ? 'SHORT' : 'WAIT'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-900/50 rounded-lg">
                <h3 className="font-bold mb-2">진입 전략</h3>
                <div className="text-sm space-y-1">
                  <div>✅ 진입 가격: ${currentCoinData.price.toLocaleString()}</div>
                  <div>✅ 손절 가격: ${(currentCoinData.price * 0.97).toLocaleString()} (-3%)</div>
                  <div>✅ 목표 가격: ${(currentCoinData.price * 1.05).toLocaleString()} (+5%)</div>
                  <div>✅ 포지션 크기: 총 자본의 {
                    currentMetrics.riskScore > 70 ? '3%' :
                    currentMetrics.riskScore > 50 ? '5%' : '10%'
                  } 이하</div>
                </div>
              </div>

              <div className="p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="text-yellow-400 mt-1" />
                  <div className="text-sm">
                    <div className="font-bold mb-1">주의사항</div>
                    <div className="text-gray-300">
                      내부자 거래 신호는 참고용입니다. 실제 투자 결정은 여러 지표를 종합적으로 고려하세요.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </div>

          {/* 섹션 7: 팀/프로젝트 지갑 모니터링 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaWallet className="mr-3 text-yellow-400" />
              팀/프로젝트 지갑 모니터링
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FaLock className="text-purple-400" />
                  토큰 락/언락 현황
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">팀 지갑 보유량</span>
                      <span className="font-mono">{(1000000).toLocaleString()} {selectedCoin}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">75% 락업 중</div>
                  </div>
                  
                  <div className="p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <FaUnlock className="text-yellow-400 text-sm" />
                      <span className="text-sm font-semibold">다음 언락 일정</span>
                    </div>
                    <div className="text-xs text-gray-300">
                      <div>2025년 3월 15일 - 100,000 {selectedCoin}</div>
                      <div>2025년 6월 15일 - 150,000 {selectedCoin}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FaExclamationTriangle className="text-orange-400" />
                  팀 활동 알림
                </h3>
                <div className="space-y-2">
                  {currentMetrics.teamActivity > 0 ? (
                    <div className="p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaExclamation className="text-red-400" />
                        <span className="text-sm">팀 지갑 이동 감지!</span>
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        최근 24시간 동안 {currentMetrics.teamActivity}건의 팀 지갑 활동이 감지되었습니다.
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-green-900/30 border border-green-600/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-400" />
                        <span className="text-sm">팀 지갑 활동 없음</span>
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        최근 24시간 동안 팀 지갑 이동이 감지되지 않았습니다.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 섹션 8: 온체인 분석 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaNetworkWired className="mr-3 text-yellow-400" />
              온체인 분석
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <MdOutlineSpeed className="text-3xl text-blue-400 mx-auto mb-2" />
                <div className="text-sm text-gray-400">활성 주소</div>
                <div className="text-2xl font-bold">{(125000).toLocaleString()}</div>
                <div className="text-xs text-green-400 mt-1">+12.5%</div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <BiTransfer className="text-3xl text-purple-400 mx-auto mb-2" />
                <div className="text-sm text-gray-400">거래 건수</div>
                <div className="text-2xl font-bold">{(8500000).toLocaleString()}</div>
                <div className="text-xs text-red-400 mt-1">-5.2%</div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <FaBinoculars className="text-3xl text-green-400 mx-auto mb-2" />
                <div className="text-sm text-gray-400">대형 홀더</div>
                <div className="text-2xl font-bold">1,250</div>
                <div className="text-xs text-green-400 mt-1">+25</div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <AiOutlineRadarChart className="text-3xl text-orange-400 mx-auto mb-2" />
                <div className="text-sm text-gray-400">네트워크 활성도</div>
                <div className="text-2xl font-bold">87%</div>
                <div className="text-xs text-yellow-400 mt-1">높음</div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-3">홀더 분포도</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                  <span className="text-sm">상위 1-10 홀더</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <span className="text-sm font-mono">35%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                  <span className="text-sm">상위 11-50 홀더</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-sm font-mono">25%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                  <span className="text-sm">상위 51-100 홀더</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <span className="text-sm font-mono">15%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                  <span className="text-sm">기타</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-sm font-mono">25%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 섹션 9: 기술적 분석 통합 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <MdShowChart className="mr-3 text-yellow-400" />
              기술적 분석 통합
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">주요 가격 레벨</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg">
                    <span className="text-sm text-gray-400">강력 저항선</span>
                    <span className="font-mono text-red-400">
                      ${(currentCoinData.price * 1.15).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg">
                    <span className="text-sm text-gray-400">약한 저항선</span>
                    <span className="font-mono text-orange-400">
                      ${(currentCoinData.price * 1.05).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-blue-900/30 rounded-lg border border-blue-600/50">
                    <span className="text-sm">현재 가격</span>
                    <span className="font-mono font-bold">
                      ${currentCoinData.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg">
                    <span className="text-sm text-gray-400">약한 지지선</span>
                    <span className="font-mono text-yellow-400">
                      ${(currentCoinData.price * 0.95).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg">
                    <span className="text-sm text-gray-400">강력 지지선</span>
                    <span className="font-mono text-green-400">
                      ${(currentCoinData.price * 0.85).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">기술적 지표 신호</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">RSI (14)</span>
                      <span className={`text-sm font-bold ${
                        currentMetrics.signalStrength > 70 ? 'text-red-400' :
                        currentMetrics.signalStrength < 30 ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {currentMetrics.signalStrength.toFixed(0)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {currentMetrics.signalStrength > 70 ? '과매수 구간' :
                       currentMetrics.signalStrength < 30 ? '과매도 구간' : '중립 구간'}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">MACD</span>
                      <span className={`text-sm font-bold ${
                        currentMetrics.trend === 'bullish' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {currentMetrics.trend === 'bullish' ? '골든크로스' : '데드크로스'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">볼린저 밴드</span>
                      <span className="text-sm">
                        {currentMetrics.signalStrength > 80 ? '상단 터치' :
                         currentMetrics.signalStrength < 20 ? '하단 터치' : '중간 영역'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 섹션 10: 시그널 및 알림 시스템 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 }}
            className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaBell className="mr-3 text-yellow-400" />
              실시간 시그널 & 알림
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">활성 시그널</h3>
                <div className="space-y-2">
                  {currentMetrics.signalStrength > 70 && (
                    <div className="p-3 bg-green-900/30 border border-green-600/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaArrowUp className="text-green-400" />
                        <span className="font-semibold">강력 매수 신호</span>
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        기관 매수세 증가, 거래소 유출량 급증
                      </div>
                    </div>
                  )}
                  
                  {currentMetrics.institutionalActivity > 5 && (
                    <div className="p-3 bg-blue-900/30 border border-blue-600/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaUniversity className="text-blue-400" />
                        <span className="font-semibold">기관 활동 급증</span>
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        최근 24시간 동안 {currentMetrics.institutionalActivity}건의 대규모 거래
                      </div>
                    </div>
                  )}
                  
                  {currentMetrics.riskScore > 70 && (
                    <div className="p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AiOutlineWarning className="text-red-400" />
                        <span className="font-semibold">리스크 경고</span>
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        매도 압력 증가, 단기 조정 가능성
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">알림 설정</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <label className="flex items-center justify-between">
                      <span className="text-sm">대규모 거래 알림</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                    <div className="text-xs text-gray-400 mt-1">
                      ${selectedCoin === 'BTC' ? '100K' : '50K'}+ 거래 시 알림
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <label className="flex items-center justify-between">
                      <span className="text-sm">기관 활동 알림</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                    <div className="text-xs text-gray-400 mt-1">
                      기관 거래 패턴 변화 시 알림
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <label className="flex items-center justify-between">
                      <span className="text-sm">가격 목표 알림</span>
                      <input type="checkbox" className="toggle" />
                    </label>
                    <div className="text-xs text-gray-400 mt-1">
                      설정한 가격 도달 시 알림
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 하단 교육 콘텐츠 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-500/30"
        >
          <div className="flex items-start gap-4">
            <FaBook className="text-purple-400 text-2xl mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-3">내부자 거래란?</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p>
                  내부자 거래는 프로젝트 팀, 기관 투자자, 대규모 보유자(고래) 등이 수행하는 대규모 거래를 의미합니다.
                  이들의 거래 패턴을 분석하면 시장의 방향성을 예측하는 데 도움이 됩니다.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-gray-800/50 p-3 rounded">
                    <h4 className="font-bold text-green-400 mb-1">거래소 유출 신호</h4>
                    <p className="text-xs">대규모 출금은 장기 보유 의사를 나타내며 가격 상승 신호일 수 있습니다.</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <h4 className="font-bold text-red-400 mb-1">거래소 유입 신호</h4>
                    <p className="text-xs">대규모 입금은 매도 압력을 의미하며 단기 조정 가능성을 시사합니다.</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <h4 className="font-bold text-yellow-400 mb-1">기관 활동 패턴</h4>
                    <p className="text-xs">기관의 지속적인 매집은 중장기 상승 가능성을 나타냅니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}