'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaFish, FaArrowUp, FaArrowDown, FaChartBar, FaBell, FaRocket, 
  FaShieldAlt, FaChartLine, FaBrain, FaWallet, FaExchangeAlt, 
  FaHistory, FaCog, FaTelegram, FaEnvelope, FaFireAlt, FaDatabase,
  FaClock, FaGlobe, FaFilter, FaDownload, FaSync, FaCheckCircle,
  FaExclamationTriangle, FaInfoCircle, FaPlay, FaPause, FaStop, FaLightbulb
} from 'react-icons/fa'
import { formatPrice, formatPercentage, formatVolume, safeToFixed } from '@/lib/formatters'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { NotificationService } from '@/lib/notificationService'
import { audioService } from '@/lib/audioService'
import dynamic from 'next/dynamic'
import { config } from '@/lib/config'
import SystemOverview, { whaleTrackingOverview } from '@/components/signals/SystemOverview'
import TabGuide, { tabGuides } from '@/components/signals/TabGuide'
import { getWebSocketUrl, getStreamName } from '@/lib/websocketConfig'
import { createWebSocket, reconnectWebSocket } from '@/lib/wsHelper'
import DynamicTabGuide from '@/components/signals/DynamicTabGuide'

const ComprehensiveAnalysis = dynamic(
  () => import('@/components/signals/ComprehensiveAnalysis'),
  { ssr: false }
)

const TradingStrategy = dynamic(
  () => import('@/components/signals/TradingStrategy'),
  { ssr: false }
)

// 타입 정의
interface WhaleTransaction {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  value: number
  time: string
  timestamp: number
  exchange?: string
  wallet?: string
  impact?: 'high' | 'medium' | 'low'
  hash?: string
}

interface WhaleWallet {
  address: string
  balance: number
  totalTrades: number
  winRate: number
  avgProfit: number
  lastActive: string
  reputation: 'legendary' | 'expert' | 'active' | 'new'
  tags: string[]
}

interface ExchangeFlow {
  exchange: string
  inflow: number
  outflow: number
  netFlow: number
  trend: 'accumulation' | 'distribution' | 'neutral'
  change24h: number
  reserves?: number
}

interface BacktestResult {
  strategy: string
  totalReturn: number
  winRate: number
  maxDrawdown: number
  sharpeRatio: number
  totalTrades: number
  avgHoldTime: number
  profitableTrades: number
  avgWin: number
  avgLoss: number
  bestTrade: number
  worstTrade: number
  monthlyReturns: number[]
}

export default function WhaleTrackerUltimate() {
  // 추적할 상위 10개 코인
  const TRACKED_SYMBOLS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
    'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT', 'DOTUSDT'
  ]
  
  // 상태 관리
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(0)  // 실시간 가격으로 업데이트됨
  const [priceChange, setPriceChange] = useState(0)
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])
  
  // 각 코인별 거래 내역 저장 (localStorage 연동)
  const [transactionsBySymbol, setTransactionsBySymbol] = useState<Record<string, WhaleTransaction[]>>(() => {
    // localStorage에서 저장된 거래 내역 불러오기
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whaleTransactions')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // 24시간 이상 지난 거래 제거
          const now = Date.now()
          const dayInMs = 24 * 60 * 60 * 1000
          Object.keys(parsed).forEach(symbol => {
            parsed[symbol] = parsed[symbol].filter((tx: WhaleTransaction) => 
              now - tx.timestamp < dayInMs
            )
          })
          return parsed
        } catch (e) {
          console.error('Failed to load saved transactions:', e)
        }
      }
    }
    return {
      'BTCUSDT': [],
      'ETHUSDT': [],
      'BNBUSDT': [],
      'SOLUSDT': [],
      'XRPUSDT': [],
      'ADAUSDT': [],
      'DOGEUSDT': [],
      'AVAXUSDT': [],
      'MATICUSDT': [],
      'DOTUSDT': []
    }
  })
  
  // 모든 코인 데이터 저장
  const [allCoinData, setAllCoinData] = useState<Record<string, {
    price: number
    change: number
    volume: number
    whaleCount: number
  }>>(() => {
    const initialData: Record<string, any> = {}
    TRACKED_SYMBOLS.forEach(symbol => {
      initialData[symbol] = { price: 0, change: 0, volume: 0, whaleCount: 0 }
    })
    return initialData
  })
  
  const [activeTab, setActiveTab] = useState('overview')
  const [timeframe, setTimeframe] = useState('1h')
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [historyFilter, setHistoryFilter] = useState<'all' | 'buy' | 'sell' | 'large'>('all')
  
  // 데이터 상태
  const [whaleWallets, setWhaleWallets] = useState<WhaleWallet[]>([])
  const [exchangeFlows, setExchangeFlows] = useState<ExchangeFlow[]>([])
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [isBacktesting, setIsBacktesting] = useState(false)
  
  // 각 코인별 통계 저장 - 실제 데이터로 초기화
  const getDefaultStats = () => ({
    totalWhales: 0,
    buyCount: 0,
    sellCount: 0,
    totalVolume: 0,
    largestTrade: 0,
    avgTradeSize: 0,
    buyVolume: 0,
    sellVolume: 0,
    netFlow: 0,
    whaleActivity: 'normal',
    marketSentiment: 50,
    fearGreedIndex: 50,
    dominance: 0,
    volatility: 0,
    activeWhales: 0,
    volume24h: 0,
    priceHistory: [] as number[],
    priceChange24h: 0,
    volumeChange24h: 0,
    whaleActivityScore: 0
  })

  // 거래 내역에서 통계 계산하는 함수
  const calculateStatsFromTransactions = (transactions: WhaleTransaction[]) => {
    if (!transactions || transactions.length === 0) {
      return getDefaultStats()
    }

    const buyTransactions = transactions.filter(tx => tx.type === 'buy')
    const sellTransactions = transactions.filter(tx => tx.type === 'sell')
    const totalVolume = transactions.reduce((sum, tx) => sum + (tx.value || 0), 0)
    const buyVolume = buyTransactions.reduce((sum, tx) => sum + (tx.value || 0), 0)
    const sellVolume = sellTransactions.reduce((sum, tx) => sum + (tx.value || 0), 0)
    const largestTrade = Math.max(...transactions.map(tx => tx.value || 0), 0)
    const avgTradeSize = transactions.length > 0 ? totalVolume / transactions.length : 0

    // 시장 심리 계산
    const buyRatio = totalVolume > 0 ? buyVolume / totalVolume : 0.5
    const sentiment = Math.round(buyRatio * 100)

    // 고래 활동 수준
    let whaleActivity = 'normal'
    if (transactions.length > 20) whaleActivity = 'very_high'
    else if (transactions.length > 10) whaleActivity = 'high'
    else if (transactions.length > 5) whaleActivity = 'moderate'

    // Fear & Greed Index 계산
    let fearGreedScore = 50
    
    // 1. 거래량 기반 (25%)
    const volumeScore = Math.min(100, (totalVolume / 1000000) * 10)
    fearGreedScore += (volumeScore - 50) * 0.25
    
    // 2. 매수/매도 비율 (25%)
    const buyRatioScore = buyRatio * 100
    fearGreedScore += (buyRatioScore - 50) * 0.25
    
    // 3. 고래 활동 (25%)
    const whaleActivityScore = transactions.length > 20 ? 80 : 
                              transactions.length > 10 ? 60 : 
                              transactions.length > 5 ? 40 : 20
    fearGreedScore += (whaleActivityScore - 50) * 0.25
    
    // 4. 가격 변동성 (25%) - 간단하게 계산
    const volatilityScore = 60 // 기본값
    fearGreedScore += (volatilityScore - 50) * 0.25
    
    fearGreedScore = Math.max(0, Math.min(100, Math.round(fearGreedScore)))

    return {
      totalWhales: transactions.length,
      buyCount: buyTransactions.length,
      sellCount: sellTransactions.length,
      totalVolume,
      largestTrade,
      avgTradeSize,
      buyVolume,
      sellVolume,
      netFlow: buyVolume - sellVolume,
      whaleActivity,
      marketSentiment: sentiment,
      fearGreedIndex: fearGreedScore,
      dominance: 0,
      volatility: 20, // 기본값
      activeWhales: transactions.length,
      volume24h: totalVolume,
      priceHistory: [],
      priceChange24h: 0,
      volumeChange24h: 0,
      whaleActivityScore
    }
  }

  // 각 심볼별 통계를 독립적으로 관리
  const [statsBySymbol, setStatsBySymbol] = useState<Record<string, ReturnType<typeof getDefaultStats>>>(() => {
    const initialStats: Record<string, any> = {}
    TRACKED_SYMBOLS.forEach(symbol => {
      initialStats[symbol] = getDefaultStats() // 모든 통계를 0으로 초기화 (실제 거래 데이터로 채워질 예정)
    })
    
    // localStorage에서 저장된 통계 불러오기
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whaleStats')
      if (saved) {
        try {
          const savedStats = JSON.parse(saved)
          Object.keys(savedStats).forEach(symbol => {
            if (initialStats[symbol]) {
              initialStats[symbol] = { ...initialStats[symbol], ...savedStats[symbol] }
            }
          })
        } catch (e) {
          console.error('Failed to load saved stats:', e)
        }
      }
    }
    return initialStats
  })

  // 현재 선택된 심볼의 통계 - 거래 내역에서 계산
  const stats = calculateStatsFromTransactions(transactionsBySymbol[selectedSymbol] || [])
  
  // 디버깅용 로그
  useEffect(() => {
    console.log(`📊 ${selectedSymbol} 통계:`, {
      거래수: stats.totalWhales,
      매수: stats.buyCount,
      매도: stats.sellCount,
      거래량: stats.totalVolume
    })
  }, [selectedSymbol, stats.totalWhales])

  // 패턴 분석
  const [patterns, setPatterns] = useState({
    accumulation: false,
    distribution: false,
    wyckoff: 'Phase C',
    support: 65000,
    resistance: 69000,
    trend: 'sideways',
    breakoutProbability: 45,
    volumeProfile: 'balanced',
    orderFlow: 'neutral',
    rsi: 50,
    macd: {
      value: 0,
      signal: 0,
      histogram: 0
    },
    bollingerBands: {
      upper: 70000,
      middle: 67000,
      lower: 64000
    }
  })

  // 알림 설정 (로컬스토리지에서 불러오기)
  const [alerts, setAlerts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alertSettings')
      if (saved) {
        const savedAlerts = JSON.parse(saved)
        // 오디오 서비스에도 설정 적용
        if (savedAlerts.sound !== undefined) {
          audioService.setEnabled(savedAlerts.sound)
        }
        return savedAlerts
      }
    }
    return {
      telegram: false,
      email: false,
      priceAlert: true,
      volumeAlert: true,
      patternAlert: true,
      whaleAlert: true,
      threshold: 10,
      sound: false
    }
  })

  // 알림 설정 변경 시 자동 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alertSettings', JSON.stringify(alerts))
    }
  }, [alerts])

  // 알림 메시지
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'info' | 'warning' | 'success' | 'error'
    message: string
    time: string
  }>>([])

  // 가격 히스토리 (차트용) - 심볼별로 관리
  const [priceHistoryBySymbol, setPriceHistoryBySymbol] = useState<Record<string, Array<{
    time: string
    price: number
  }>>>({})
  
  // 현재 선택된 심볼의 가격 히스토리
  const priceHistory = priceHistoryBySymbol[selectedSymbol] || []
  
  // 1분봉 데이터
  const [candleData, setCandleData] = useState<Array<{
    time: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>>([])

  // WebSocket 연결 (백그라운드)
  const backgroundWsRefs = useRef<Record<string, WebSocket>>({}) // 모든 코인의 백그라운드 WebSocket
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const firstPrices = useRef<Record<string, number>>({}) // 각 심볼별 첫 가격 저장

  // 심볼별 임계값 (현실적인 고래 거래 기준) - 10개 코인
  const getThreshold = (symbol: string) => {
    switch(symbol) {
      case 'BTCUSDT': return 0.1     // 0.1 BTC 이상 (약 $10,000)
      case 'ETHUSDT': return 1       // 1 ETH 이상 (약 $2,500)
      case 'BNBUSDT': return 5       // 5 BNB 이상 (약 $1,500)
      case 'SOLUSDT': return 20      // 20 SOL 이상 (약 $2,000)
      case 'XRPUSDT': return 5000    // 5,000 XRP 이상 (약 $2,500)
      case 'ADAUSDT': return 5000    // 5,000 ADA 이상 (약 $2,000)
      case 'DOGEUSDT': return 20000  // 20,000 DOGE 이상 (약 $1,500)
      case 'AVAXUSDT': return 20     // 20 AVAX 이상 (약 $1,000)
      case 'MATICUSDT': return 3000  // 3,000 MATIC 이상 (약 $2,000)
      case 'DOTUSDT': return 50      // 50 DOT 이상 (약 $1,500)
      default: return 100
    }
  }
  

  // API 데이터 가져오기
  const fetchWhaleData = async () => {
    try {
      console.log(`🐋 고래 데이터 가져오기: ${selectedSymbol}`)
      
      // 현재 선택된 심볼의 거래 데이터 가져오기
      const tradesRes = await fetch(`/api/whale/trades?symbol=${selectedSymbol}`)
      const tradesData = await tradesRes.json()
      
      if (tradesData.success && tradesData.trades) {
        // 거래 데이터를 WhaleTransaction 형식으로 변환
        console.log(`API 거래 데이터: ${tradesData.trades.length}건`)
        const formattedTrades = tradesData.trades
          .map((trade: any) => ({
          id: `${selectedSymbol}-${trade.id || Date.now()}`,
          symbol: selectedSymbol,  // 선택된 심볼로 통일
          type: trade.type?.toLowerCase() === 'sell' ? 'sell' : 'buy' as 'buy' | 'sell',
          amount: parseFloat(trade.quantity || trade.amount || 0),
          price: parseFloat(trade.price || 0),
          value: parseFloat(trade.value || (trade.quantity * trade.price) || 0),
          time: new Date(trade.time || trade.timestamp || Date.now()).toLocaleTimeString(),
          timestamp: trade.time || trade.timestamp || Date.now(),
          exchange: 'Binance',
          impact: trade.value > 1000000 ? 'high' : trade.value > 500000 ? 'medium' : 'low',
          wallet: `Whale_${trade.id}`,
          hash: `0x${trade.id}`
        }))
        .filter((trade: WhaleTransaction) => trade.amount > 0 && trade.price > 0 && trade.value > 0)
        
        setTransactions(formattedTrades)
        
        // 심볼별 거래 저장 및 localStorage에 저장 (중복 제거)
        setTransactionsBySymbol(prev => {
          const existingTrades = prev[selectedSymbol] || []
          // 새로운 거래와 기존 거래를 합치되 중복 제거
          const allTrades = [...formattedTrades]
          existingTrades.forEach(existing => {
            if (!formattedTrades.some(t => t.id === existing.id)) {
              allTrades.push(existing)
            }
          })
          const updated = {
            ...prev,
            [selectedSymbol]: allTrades.slice(0, 100)
          }
          // localStorage에 저장
          try {
            localStorage.setItem('whaleTransactions', JSON.stringify(updated))
          } catch (e) {
            console.error('Failed to save transactions:', e)
          }
          return updated
        })
        
        // 거래 리스트에서 통계 계산 및 업데이트
        if (formattedTrades.length > 0) {
          const buyTrades = formattedTrades.filter(t => t.type === 'buy')
          const sellTrades = formattedTrades.filter(t => t.type === 'sell')
          const buyVolume = buyTrades.reduce((sum, t) => sum + t.value, 0)
          const sellVolume = sellTrades.reduce((sum, t) => sum + t.value, 0)
          
          setStatsBySymbol(prev => ({
            ...prev,
            [selectedSymbol]: {
              ...prev[selectedSymbol],
              totalWhales: formattedTrades.length,
              buyCount: buyTrades.length,
              sellCount: sellTrades.length,
              totalVolume: buyVolume + sellVolume,
              buyVolume: buyVolume,
              sellVolume: sellVolume,
              netFlow: buyVolume - sellVolume,
              largestTrade: Math.max(...formattedTrades.map(t => t.value)),
              avgTradeSize: (buyVolume + sellVolume) / formattedTrades.length
            }
          }))
        }
      }
      
      // 통계 데이터 가져오기
      const statsRes = await fetch(`/api/whale/trades?symbol=${selectedSymbol}&type=stats`)
      const statsData = await statsRes.json()
      
      if (statsData) {
        console.log(`📊 API 통계 데이터 (${selectedSymbol}):`, statsData)
        setStatsBySymbol(prev => {
          const currentStats = prev[selectedSymbol] || getDefaultStats()
          const buyVolume = statsData.buyVolume || currentStats.buyVolume || 0
          const sellVolume = statsData.sellVolume || currentStats.sellVolume || 0
          const totalWhales = statsData.totalWhales || currentStats.totalWhales || 0
          const totalVolume = buyVolume + sellVolume
          
          // Fear & Greed Index 계산
          let fearGreedScore = 50
          
          // 1. 거래량 기반 (25%)
          const volumeScore = Math.min(100, (totalVolume / 1000000) * 10)
          fearGreedScore += (volumeScore - 50) * 0.25
          
          // 2. 매수/매도 비율 (25%)
          const buyRatio = totalVolume > 0 ? buyVolume / totalVolume : 0.5
          const buyRatioScore = buyRatio * 100
          fearGreedScore += (buyRatioScore - 50) * 0.25
          
          // 3. 고래 활동 (25%)
          const whaleActivityScore = totalWhales > 20 ? 80 : totalWhales > 10 ? 60 : totalWhales > 5 ? 40 : 20
          fearGreedScore += (whaleActivityScore - 50) * 0.25
          
          // 4. 변동성 (25%)
          const volatility = currentStats.volatility || 0
          const volatilityScore = volatility > 50 ? 20 : volatility > 30 ? 40 : volatility > 10 ? 60 : 80
          fearGreedScore += (volatilityScore - 50) * 0.25
          
          fearGreedScore = Math.max(0, Math.min(100, Math.round(fearGreedScore)))
          
          return {
            ...prev,
            [selectedSymbol]: {
              ...currentStats,
              ...statsData,
              whaleActivity: totalWhales > 20 ? 'very_high' : 
                            totalWhales > 10 ? 'high' : 
                            totalWhales > 5 ? 'moderate' : 'normal',
              marketSentiment: totalVolume > 0 ? Math.round(buyRatio * 100) : 50,
              fearGreedIndex: fearGreedScore,
              whaleActivityScore: whaleActivityScore
            }
          }
        })
        
        // 현재 가격 업데이트
        if (statsData.currentPrice) {
          setCurrentPrice(statsData.currentPrice)
        }
      }
      
      // 고래 지갑 데이터
      const walletsRes = await fetch('/api/whale?type=wallets')
      const walletsData = await walletsRes.json()
      if (walletsData.success) {
        setWhaleWallets(walletsData.data)
      }
      
      // 거래소 플로우 데이터
      const flowsRes = await fetch('/api/whale?type=flows')
      const flowsData = await flowsRes.json()
      if (flowsData.success) {
        setExchangeFlows(flowsData.data)
      }
      
      // 패턴 분석 데이터
      const patternsRes = await fetch('/api/whale?type=patterns')
      const patternsData = await patternsRes.json()
      if (patternsData.success) {
        setPatterns(patternsData.data)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch whale data:', error)
      setLoading(false)
      addNotification('error', 'API 데이터 로드 실패')
    }
  }

  // 통계 자동 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('whaleStats', JSON.stringify(statsBySymbol))
    }
  }, [statsBySymbol])

  // 선택된 심볼 변경 시 처리 (백그라운드 WebSocket에서 데이터 가져오기)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // 심볼 변경 시 상태만 초기화
    console.log(`📊 심볼 변경: ${selectedSymbol}`)
    
    // 코인 변경 시 상태 초기화
    const savedPrice = allCoinData[selectedSymbol]?.price || 0
    setCurrentPrice(savedPrice)
    setPriceChange(0)
    
    // 저장된 거래 내역 복원
    const savedTransactions = transactionsBySymbol[selectedSymbol] || []
    setTransactions(savedTransactions)
    
    // 백그라운드 WebSocket이 이미 연결되어 있으므로 상태 표시
    const bgWs = backgroundWsRefs.current[selectedSymbol]
    if (bgWs && bgWs.readyState === WebSocket.OPEN) {
      setIsConnected(true)
      console.log(`✅ ${selectedSymbol} 백그라운드 WebSocket 이미 연결됨`)
    } else {
      setIsConnected(false)
      console.log(`⏳ ${selectedSymbol} 백그라운드 WebSocket 연결 대기중...`)
    }
    
    setCandleData([])
    // 심볼별 통계는 유지하고 표시만 변경됨
    
    // 15분봉 데이터 로드
    fetchCandleData()
  }, [selectedSymbol, transactionsBySymbol])

  // transactionsBySymbol이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(transactionsBySymbol).length > 0) {
      // 24시간 이상 지난 거래 제거 후 저장
      const now = Date.now()
      const dayInMs = 24 * 60 * 60 * 1000
      const filtered: Record<string, WhaleTransaction[]> = {}
      
      Object.keys(transactionsBySymbol).forEach(symbol => {
        filtered[symbol] = transactionsBySymbol[symbol].filter(tx => 
          now - tx.timestamp < dayInMs
        )
      })
      
      localStorage.setItem('whaleTransactions', JSON.stringify(filtered))
    }
  }, [transactionsBySymbol])

  // 자동 새로고침
  useEffect(() => {
    if (autoRefresh) {
      fetchWhaleData()
      refreshIntervalRef.current = setInterval(() => {
        fetchWhaleData()
      }, 30000) // 30초마다 새로고침
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefresh])

  // 초기 데이터 로드 및 모든 코인 WebSocket 연결
  useEffect(() => {
    // localStorage 데이터 확인
    const savedTransactions = localStorage.getItem('whaleTransactions')
    if (savedTransactions) {
      try {
        const parsed = JSON.parse(savedTransactions)
        console.log('📦 localStorage 저장된 거래:', Object.keys(parsed).map(sym => `${sym}: ${parsed[sym]?.length || 0}건`))
      } catch (e) {
        console.error('localStorage 파싱 에러:', e)
      }
    }
    
    fetchWhaleData()
    const candleTimer = setTimeout(() => {
      fetchCandleData() // 15분봉 데이터 로드
    }, 1000)
    
    // 모든 코인에 대해 WebSocket 연결 (백그라운드)
    let delay = 0
    TRACKED_SYMBOLS.forEach(symbol => {
      setTimeout(() => {
        const streamName = getStreamName(symbol, 'trade')
        const wsUrl = getWebSocketUrl(streamName)
        
        try {
          const ws = new WebSocket(wsUrl)
          
          ws.onopen = () => {
            console.log(`✅ ${symbol} WebSocket 연결 성공`)
            if (symbol === selectedSymbol) {
              setIsConnected(true)
            }
          }
          
          ws.onerror = (error) => {
            console.log(`⚠️ ${symbol} WebSocket 연결 재시도 중...`)
            // WebSocket 에러는 Event 객체로 오므로 상세 정보가 없음
          }
          
          ws.onclose = (event) => {
            console.log(`🔌 ${symbol} WebSocket 연결 종료:`, event.code, event.reason)
            if (symbol === selectedSymbol) {
              setIsConnected(false)
            }
          }
          
          ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          const price = parseFloat(data.p)
          const quantity = parseFloat(data.q)
          const threshold = getThreshold(symbol)
          
          // 코인별 데이터 업데이트
          setAllCoinData(prev => ({
            ...prev,
            [symbol]: {
              price: price,
              change: prev[symbol] ? ((price - prev[symbol].price) / prev[symbol].price) * 100 : 0,
              volume: (prev[symbol]?.volume || 0) + (price * quantity),
              whaleCount: (prev[symbol]?.whaleCount || 0) + (quantity >= threshold ? 1 : 0)
            }
          }))
          
          // 현재 선택된 코인이면 실시간 가격 업데이트
          setSelectedSymbol(currentSymbol => {
            if (currentSymbol === symbol) {
              setCurrentPrice(price)
              // 첫 가격 저장 및 변화율 계산
              if (!firstPrices.current[symbol]) {
                firstPrices.current[symbol] = price
              }
              const basePrice = firstPrices.current[symbol] || price
              setPriceChange(((price - basePrice) / basePrice) * 100)
              
              // 가격 히스토리 업데이트 (차트용)
              const now = new Date()
              const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
              setPriceHistoryBySymbol(prev => {
                const currentHistory = prev[symbol] || []
                const newHistory = [...currentHistory, { time: timeStr, price }]
                return {
                  ...prev,
                  [symbol]: newHistory.slice(-50) // 최근 50개만 유지
                }
              })
              
              // 거래량 누적 및 변동성 계산 (현재 심볼의 통계 업데이트)
              const tradeValue = price * quantity
              setStatsBySymbol(prev => {
                const currentStats = prev[symbol] || getDefaultStats()
                const priceHistory = [...(currentStats.priceHistory || []), price].slice(-100) // 최근 100개 가격 유지
                
                // 변동성 계산 (표준편차 기반)
                let volatility = 0
                if (priceHistory.length > 10) {
                  const mean = priceHistory.reduce((a, b) => a + b, 0) / priceHistory.length
                  const variance = priceHistory.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / priceHistory.length
                  volatility = Math.min(100, (Math.sqrt(variance) / mean) * 100) // 변동성 퍼센트
                }
                
                // Fear & Greed Index 계산 (실시간)
                const totalVolume = currentStats.totalVolume + tradeValue
                const buyRatio = currentStats.buyVolume / (currentStats.buyVolume + currentStats.sellVolume || 1)
                
                let fearGreedScore = 50
                
                // 1. 거래량 기반 (25%)
                const volumeScore = Math.min(100, (totalVolume / 1000000) * 10)
                fearGreedScore += (volumeScore - 50) * 0.25
                
                // 2. 매수/매도 비율 (25%)
                const buyRatioScore = buyRatio * 100
                fearGreedScore += (buyRatioScore - 50) * 0.25
                
                // 3. 고래 활동 (25%)
                const whaleActivityScore = currentStats.totalWhales > 20 ? 80 : 
                                         currentStats.totalWhales > 10 ? 60 : 
                                         currentStats.totalWhales > 5 ? 40 : 20
                fearGreedScore += (whaleActivityScore - 50) * 0.25
                
                // 4. 변동성 (25%)
                const volatilityScore = volatility > 50 ? 20 : volatility > 30 ? 40 : volatility > 10 ? 60 : 80
                fearGreedScore += (volatilityScore - 50) * 0.25
                
                fearGreedScore = Math.max(0, Math.min(100, Math.round(fearGreedScore)))
                
                return {
                  ...prev,
                  [symbol]: {
                    ...currentStats,
                    totalVolume: totalVolume,
                    volume24h: currentStats.volume24h + tradeValue,
                    volatility: Math.round(volatility * 10) / 10, // 소수점 1자리
                    priceHistory,
                    fearGreedIndex: fearGreedScore,
                    whaleActivityScore: whaleActivityScore
                  }
                }
              })
            }
            return currentSymbol
          })
          
          // 고래 거래만 저장
          if (quantity >= threshold) {
            console.log(`🐋 ${symbol} 고래 거래 감지:`, {
              가격: price,
              수량: quantity,
              임계값: threshold,
              거래금액: price * quantity
            })
            
            const trade: WhaleTransaction = {
              id: `${symbol}-${data.a || Date.now()}`,
              symbol: symbol,  // 전체 심볼 유지 (BTCUSDT 형태)
              price: price,
              amount: quantity,  // amount로 변경
              value: price * quantity,  // value로 변경
              time: new Date(data.T || Date.now()).toLocaleTimeString(),
              timestamp: data.T || Date.now(),
              type: !data.m ? 'buy' : 'sell',
              exchange: 'Binance',
              impact: quantity >= threshold * 10 ? 'high' : quantity >= threshold * 5 ? 'medium' : 'low',
              wallet: `Trade_${data.a}`,  // Binance aggTrade ID 사용
              hash: `0x${data.a}`  // 실제 거래 ID를 hash로 사용
            }
            
            // 데이터 유효성 검증
            if (!trade.amount || !trade.price || !trade.value || trade.value === 0) {
              console.warn('Invalid trade data:', trade)
              return
            }
            
            // 코인별 거래 히스토리 업데이트 (중복 제거)
            setTransactionsBySymbol(prev => {
              const existingTrades = prev[symbol] || []
              // 동일한 거래 ID가 있는지 확인
              const exists = existingTrades.some(t => t.id === trade.id)
              if (exists) return prev
              
              console.log(`💰 ${symbol} 고래 거래 추가:`, trade.type, trade.amount, trade.symbol)
              
              const updatedTrades = {
                ...prev,
                [symbol]: [trade, ...existingTrades].slice(0, 100)  // 100개까지 유지 (기존 20개에서 증가)
              }
              
              // localStorage에 즉시 저장
              try {
                localStorage.setItem('whaleTransactions', JSON.stringify(updatedTrades))
              } catch (e) {
                console.error('Failed to save transactions:', e)
              }
              
              // transactionsBySymbol 업데이트 반환
              return updatedTrades
            })
            
            // 현재 선택된 코인이면 화면에 즉시 표시
            setSelectedSymbol(currentSymbol => {
              if (currentSymbol === symbol) {
                setTransactions(prev => {
                  // 중복 제거 후 추가
                  const exists = prev.some(t => t.id === trade.id)
                  if (exists) return prev
                  return [trade, ...prev].slice(0, 100)  // 100개까지 유지
                })
              }
              return currentSymbol
            })
              
              // 고래 알림 (현재 선택된 코인만)
              setSelectedSymbol(currentSymbol => {
                if (currentSymbol === symbol) {
                  if (trade.impact === 'high') {
                    addNotification('warning', `🐋 초대형 고래 ${trade.type === 'buy' ? '매수' : '매도'}: ${safeToFixed(trade.amount, 2)} ${trade.symbol.replace('USDT', '')}`)
                    // 소리 알림 재생
                    if (alerts.whaleAlert && alerts.sound) {
                      audioService.playNotification('whale')
                    }
                    // 브라우저 알림
                    if (alerts.whaleAlert) {
                      audioService.showBrowserNotification(
                        `🐋 고래 거래 감지!`,
                        `${trade.symbol.replace('USDT', '')} ${trade.type === 'buy' ? '매수' : '매도'}: ${safeToFixed(trade.amount, 2)}`,
                      )
                    }
                  } else if (alerts.whaleAlert && alerts.sound) {
                    // 일반 고래 거래도 알림
                    audioService.playNotification('whale')
                  }
                }
                return currentSymbol
              })
          }
        }
        
        backgroundWsRefs.current[symbol] = ws
        } catch (error) {
          console.error(`WebSocket 생성 실패 ${symbol}:`, error)
        }
      }, delay)
      delay += 300 // 0.3초씩 순차 연결
    })
    
    // 클린업
    return () => {
      clearTimeout(candleTimer)
      Object.entries(backgroundWsRefs.current).forEach(([symbol, ws]) => {
        if (ws) {
          try {
            ws.onmessage = null
            ws.onerror = null
            ws.onclose = null
            ws.onopen = null
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
              ws.close(1000, 'Component unmount')
            }
          } catch (error) {
            console.error(`WebSocket cleanup error for ${symbol}:`, error)
          }
        }
      })
      backgroundWsRefs.current = {}
    }
  }, [])
  
  // 15분봉 데이터 가져오기 - useEffect보다 먼저 정의
  const fetchCandleData = useCallback(async () => {
    try {
      console.log('15분봉 데이터 로드 중...', selectedSymbol)
      const res = await fetch(`/api/binance/klines?symbol=${selectedSymbol}&interval=15m&limit=20`)
      const data = await res.json()
      
      if (data && data.data) {
        const formattedData = data.data.map((candle: any[]) => {
          const date = new Date(candle[0])
          return {
            time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            volume: parseFloat(candle[5]),
            price: parseFloat(candle[4]) // LineChart를 위한 price 필드 추가
          }
        })
        console.log('15분봉 데이터 로드 완료:', formattedData.length, '개')
        setCandleData(formattedData)
      } else {
        console.log('캔들 데이터 없음')
      }
    } catch (error) {
      console.error('Failed to fetch candle data:', error)
    }
  }, [selectedSymbol])

  // 심볼 변경 시 거래 리스트 업데이트 (통계는 별도로 관리)
  useEffect(() => {
    // 심볼 변경 시 해당 심볼의 거래 내역으로 업데이트
    const symbolTransactions = transactionsBySymbol[selectedSymbol] || []
    console.log(`📊 심볼 변경: ${selectedSymbol}, 저장된 거래: ${symbolTransactions.length}개`)
    console.log('거래 내역 샘플:', symbolTransactions.slice(0, 3))
    console.log('모든 심볼 거래 수:', Object.keys(transactionsBySymbol).map(sym => `${sym}: ${transactionsBySymbol[sym]?.length || 0}개`))
    setTransactions(symbolTransactions)
    
    // 2초 후에 캔들 데이터 로드 (WebSocket 연결과 동기화)
    const timer = setTimeout(() => {
      fetchCandleData()
    }, 2500)
    
    return () => clearTimeout(timer)
  }, [selectedSymbol, transactionsBySymbol, fetchCandleData])
  
  // 15분마다 15분봉 데이터 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCandleData()
    }, 15 * 60 * 1000) // 15분마다
    
    return () => clearInterval(interval)
  }, [selectedSymbol, fetchCandleData])
  
  // 초기 데이터 로드 및 심볼 변경 시 데이터 갱신
  useEffect(() => {
    // API에서 새 데이터 가져오기
    fetchWhaleData()
    
    // 30초마다 데이터 갱신 (너무 자주 호출하지 않도록)
    const interval = setInterval(fetchWhaleData, 30000)
    return () => clearInterval(interval)
  }, [selectedSymbol])

  // 통계 업데이트 (심볼별로 독립적으로 관리)
  const updateStats = (tx: WhaleTransaction) => {
    setStatsBySymbol(prev => {
      const currentStats = prev[tx.symbol] || getDefaultStats()
      const txValue = tx.value || 0
      const newBuyVolume = tx.type === 'buy' ? currentStats.buyVolume + txValue : currentStats.buyVolume
      const newSellVolume = tx.type === 'sell' ? currentStats.sellVolume + txValue : currentStats.sellVolume
      const newTotalWhales = currentStats.totalWhales + 1
      const newTotalVolume = currentStats.totalVolume + txValue
      
      // 시장 심리 계산
      const buyRatio = newBuyVolume / (newBuyVolume + newSellVolume || 1)
      const sentiment = Math.round(buyRatio * 100)
      
      // 고래 활동 수준
      let activity = 'normal'
      if (newTotalWhales > 20) activity = 'very_high'
      else if (newTotalWhales > 10) activity = 'high'
      else if (newTotalWhales > 5) activity = 'moderate'
      
      // Fear & Greed Index 계산 (여러 요소 종합)
      let fearGreedScore = 50
      
      // 1. 거래량 기반 (25%)
      const volumeScore = Math.min(100, (newTotalVolume / 1000000) * 10) // $10M = 100점
      fearGreedScore += (volumeScore - 50) * 0.25
      
      // 2. 매수/매도 비율 (25%)
      const buyRatioScore = buyRatio * 100
      fearGreedScore += (buyRatioScore - 50) * 0.25
      
      // 3. 고래 활동 (25%)
      const whaleActivityScore = newTotalWhales > 20 ? 80 : newTotalWhales > 10 ? 60 : newTotalWhales > 5 ? 40 : 20
      fearGreedScore += (whaleActivityScore - 50) * 0.25
      
      // 4. 가격 변동성 (25%)
      const volatilityScore = currentStats.volatility > 50 ? 20 : currentStats.volatility > 30 ? 40 : currentStats.volatility > 10 ? 60 : 80
      fearGreedScore += (volatilityScore - 50) * 0.25
      
      // 최종 점수 조정 (0-100 범위)
      fearGreedScore = Math.max(0, Math.min(100, Math.round(fearGreedScore)))
      
      return {
        ...prev,
        [tx.symbol]: {
          ...currentStats,
          totalWhales: newTotalWhales,
          buyCount: currentStats.buyCount + (tx.type === 'buy' ? 1 : 0),
          sellCount: currentStats.sellCount + (tx.type === 'sell' ? 1 : 0),
          totalVolume: newTotalVolume,
          largestTrade: Math.max(currentStats.largestTrade, txValue),
          avgTradeSize: newTotalVolume / newTotalWhales,
          buyVolume: newBuyVolume,
          sellVolume: newSellVolume,
          netFlow: newBuyVolume - newSellVolume,
          whaleActivity: activity,
          marketSentiment: sentiment,
          fearGreedIndex: fearGreedScore,
          whaleActivityScore: whaleActivityScore
        }
      }
    })
  }

  // 알림 추가
  const addNotification = (type: 'info' | 'warning' | 'success' | 'error', message: string) => {
    const notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      time: new Date().toLocaleTimeString()
    }
    setNotifications(prev => [notification, ...prev].slice(0, 10))
    
    // 5초 후 자동 제거
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  // 백테스팅 실행
  const runBacktest = async (strategy: string) => {
    setIsBacktesting(true)
    try {
      const res = await fetch(`/api/whale?type=backtest&strategy=${strategy}`)
      const data = await res.json()
      if (data.success) {
        setBacktestResult(data.data)
        addNotification('success', `백테스팅 완료: ${strategy}`)
      }
    } catch (error) {
      console.error('Backtest failed:', error)
      addNotification('error', '백테스팅 실패')
    } finally {
      setIsBacktesting(false)
    }
  }

  // 알림 설정 저장
  const saveAlertSettings = async () => {
    try {
      const res = await fetch('/api/whale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'alerts', data: alerts })
      })
      if (res.ok) {
        addNotification('success', '알림 설정 저장됨')
      }
    } catch (error) {
      console.error('Failed to save alerts:', error)
      addNotification('error', '알림 설정 저장 실패')
    }
  }

  // 데이터 내보내기
  const exportData = () => {
    const data = {
      transactions,
      stats,
      patterns,
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `whale-data-${Date.now()}.json`
    a.click()
    addNotification('success', '데이터 내보내기 완료')
  }

  // 시장 신호 계산
  const getMarketSignal = () => {
    const buyRatio = stats.buyCount / (stats.totalWhales || 1)
    if (buyRatio > config.decimals.value7) return { signal: '강한 매수', color: 'text-green-400', icon: '🟢' }
    if (buyRatio > config.decimals.value55) return { signal: '매수 우세', color: 'text-green-300', icon: '🟢' }
    if (buyRatio > config.decimals.value45) return { signal: '중립', color: 'text-yellow-400', icon: '🟡' }
    if (buyRatio > config.decimals.value3) return { signal: '매도 우세', color: 'text-red-300', icon: '🔴' }
    return { signal: '강한 매도', color: 'text-red-400', icon: '🔴' }
  }

  const marketSignal = getMarketSignal()

  // 차트 데이터 메모이제이션
  const memoizedChartData = useMemo(() => {
    return candleData.length > 0 ? candleData : priceHistory
  }, [candleData, priceHistory])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* 알림 토스트 */}
      <AnimatePresence>
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`p-4 rounded-lg shadow-lg backdrop-blur flex items-center gap-2 ${
                notification.type === 'error' ? 'bg-red-900/80 border border-red-500' :
                notification.type === 'warning' ? 'bg-yellow-900/80 border border-yellow-500' :
                notification.type === 'success' ? 'bg-green-900/80 border border-green-500' :
                'bg-blue-900/80 border border-blue-500'
              }`}
            >
              {notification.type === 'error' ? <FaExclamationTriangle /> :
               notification.type === 'warning' ? <FaExclamationTriangle /> :
               notification.type === 'success' ? <FaCheckCircle /> :
               <FaInfoCircle />}
              <div>
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs opacity-75">{notification.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      <div className="container mx-auto px-4 pt-2 pb-8 max-w-7xl">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {/* 상단 헤더 - 정렬 개선 */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              {/* 좌측: 로고와 타이틀 */}
              <div className="flex items-center gap-4">
                {/* MONSTA 로고 */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-white">M</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">MONSTA AI</div>
                    <div className="text-xs text-gray-500">Whale Tracking</div>
                  </div>
                </div>
                
                {/* 세로 구분선 */}
                <div className="h-10 w-px bg-gray-700"></div>
                
                {/* 페이지 타이틀 */}
                <div>
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">🐋</span>
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      고래 추적 시스템 Ultimate
                    </span>
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">실시간 고래 활동 모니터링 & AI 분석</p>
                </div>
              </div>
              
              {/* 우측: 상태 및 컨트롤 */}
              <div className="flex items-center gap-3">
                {/* 연결 상태 표시 */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                  isConnected ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 'bg-red-900/30 text-red-400 border border-red-800/50'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`} />
                  <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
                
                {/* 컨트롤 버튼들 */}
                <div className="flex items-center gap-2">
                  {/* 자동 새로고침 토글 */}
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      autoRefresh 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                    title={autoRefresh ? '자동 새로고침 켜짐' : '자동 새로고침 꺼짐'}
                  >
                    <FaSync className={`text-sm ${autoRefresh ? 'animate-spin' : ''}`} />
                  </button>
                  
                  {/* 데이터 내보내기 */}
                  <button
                    onClick={exportData}
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-all duration-200"
                    title="데이터 내보내기"
                  >
                    <FaDownload className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 심볼 선택 & 필터 */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {TRACKED_SYMBOLS.map(symbol => (
              <button
                key={symbol}
                onClick={() => {
                  if (selectedSymbol !== symbol) {
                    setSelectedSymbol(symbol)
                    addNotification('info', `${symbol.replace('USDT', '')} 선택됨`)
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedSymbol === symbol
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {symbol.replace('USDT', '')}
              </button>
            ))}
          </div>
          
          {/* 시간대 필터 */}
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
          >
            <option value="1m">1분</option>
            <option value="5m">5분</option>
            <option value="15m">15분</option>
            <option value="1h">1시간</option>
            <option value="4h">4시간</option>
            <option value="1d">1일</option>
          </select>

          {/* 수동 새로고침 */}
          <button 
            onClick={fetchWhaleData}
            disabled={loading}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 disabled:opacity-50"
          >
            <FaSync className={`inline mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6 flex gap-2 border-b border-gray-800 overflow-x-auto">
          {[
            { id: 'overview', label: '개요', icon: <FaChartBar /> },
            { id: 'analysis', label: '종합분석 🔥', icon: <FaBrain /> },
            { id: 'wallets', label: '고래 지갑', icon: <FaWallet /> },
            { id: 'flows', label: '거래소 플로우', icon: <FaExchangeAlt /> },
            { id: 'patterns', label: '패턴 분석', icon: <FaBrain /> },
            { id: 'history', label: '거래 내역', icon: <FaHistory /> },
            { id: 'alerts', label: '알림 설정', icon: <FaBell /> },
            { id: 'backtest', label: '백테스팅', icon: <FaRocket /> },
            { id: 'settings', label: '설정', icon: <FaCog /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 flex items-center gap-2 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 개요 탭 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 메인 대시보드 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 가격 & 시장 신호 */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">
                      {selectedSymbol.replace('USDT', '')}/USDT
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full animate-pulse">
                        LIVE
                      </span>
                      <span className={`text-sm font-bold ${marketSignal.color}`}>
                        {marketSignal.icon} {marketSignal.signal}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        ${safeToFixed(currentPrice, 2)}
                      </p>
                      <p className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {priceChange >= 0 ? '▲' : '▼'} {safeToFixed(Math.abs(priceChange), 2)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">24h 고래 거래량</p>
                      <p className="text-xl font-bold text-purple-400">
                        ${formatVolume(stats.totalVolume)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        고래 거래 {stats.totalWhales || 0}건
                      </p>
                    </div>
                  </div>

                  {/* 실시간 15분봉 차트 */}
                  <div className="h-80 bg-gray-900/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400">15분봉 차트</span>
                      <span className="text-xs text-purple-400">실시간 업데이트</span>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart 
                        data={memoizedChartData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        isAnimationActive={false}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="time" 
                          stroke="#9CA3AF"
                          tick={{ fontSize: 10 }}
                          interval={Math.floor(memoizedChartData.length / 5) || 1}
                          tickMargin={5}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          tick={{ fontSize: 10 }}
                          domain={['dataMin - 100', 'dataMax + 100']}
                          tickFormatter={(value) => `$${safeToFixed(value / 1000, 0)}k`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                          labelStyle={{ color: '#9CA3AF' }}
                          formatter={(value: number, name: string) => {
                            if (name === 'close') return [`$${safeToFixed(value, 2)}`, '종가']
                            if (name === 'high') return [`$${safeToFixed(value, 2)}`, '고가']
                            if (name === 'low') return [`$${safeToFixed(value, 2)}`, '저가']
                            if (name === 'price') return [`$${safeToFixed(value, 2)}`, '가격']
                            return [`$${safeToFixed(value, 2)}`, name]
                          }}
                        />
                        {candleData.length > 0 ? (
                          <>
                            <Line 
                              type="monotone" 
                              dataKey="close" 
                              stroke="#8B5CF6" 
                              strokeWidth={2}
                              dot={false}
                              isAnimationActive={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="high" 
                              stroke="#10B981" 
                              strokeWidth={1}
                              strokeDasharray="3 3"
                              dot={false}
                              isAnimationActive={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="low" 
                              stroke="#EF4444" 
                              strokeWidth={1}
                              strokeDasharray="3 3"
                              dot={false}
                              isAnimationActive={false}
                            />
                          </>
                        ) : (
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#8B5CF6" 
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* AI 분석 */}
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FaBrain className="text-purple-400" />
                  AI 분석
                </h3>
                
                <div className="space-y-4">
                  {/* 시장 심리 */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">시장 심리</span>
                      <span className="text-sm font-bold text-white">{stats.marketSentiment}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <motion.div 
                        className={`h-3 rounded-full ${
                          stats.marketSentiment > 70 ? 'bg-gradient-to-r from-green-600 to-green-400' :
                          stats.marketSentiment > 30 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                          'bg-gradient-to-r from-red-600 to-red-400'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.marketSentiment}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>

                  {/* Fear & Greed */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Fear & Greed</span>
                      <span className="text-sm font-bold text-white">{stats.fearGreedIndex}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <motion.div 
                        className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.fearGreedIndex}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>

                  {/* 변동성 */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">변동성</span>
                      <span className="text-sm font-bold text-white">{stats.volatility}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <motion.div 
                        className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.volatility}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>

                  {/* 고래 활동 */}
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">고래 활동 수준</p>
                    <p className={`text-lg font-bold ${
                      stats.whaleActivity === 'very_high' ? 'text-red-400' :
                      stats.whaleActivity === 'high' ? 'text-orange-400' :
                      stats.whaleActivity === 'moderate' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {stats.whaleActivity === 'very_high' ? '매우 높음 🔥' :
                       stats.whaleActivity === 'high' ? '높음 ⚠️' :
                       stats.whaleActivity === 'moderate' ? '보통 📊' :
                       '정상 ✅'}
                    </p>
                  </div>

                  {/* 예측 */}
                  <div className="p-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30">
                    <p className="text-xs text-gray-400 mb-1">단기 예측</p>
                    <p className="text-sm text-white">
                      {stats.netFlow > 0 && stats.buyCount > stats.sellCount * 1.5 ? '강한 상승 압력 📈' :
                       stats.netFlow > 0 && stats.buyCount > stats.sellCount ? '상승 압력 우세 ↗️' :
                       stats.netFlow < 0 && stats.sellCount > stats.buyCount * 1.5 ? '강한 하락 압력 📉' :
                       stats.netFlow < 0 && stats.sellCount > stats.buyCount ? '하락 압력 우세 ↘️' :
                       '횡보 예상 ➡️'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      신뢰도: {Math.min(95, Math.max(20, 
                        Math.round(30 + 
                        (stats.totalWhales * 2) + 
                        (Math.abs(stats.buyCount - stats.sellCount) * 3) +
                        (stats.volatility > 50 ? -10 : stats.volatility > 30 ? 0 : 10)
                      )))}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: <FaFish />, label: '고래 거래', value: stats.totalWhales || 0, color: 'purple' },
                { icon: <FaArrowUp />, label: '매수', value: stats.buyCount || 0, color: 'green' },
                { icon: <FaArrowDown />, label: '매도', value: stats.sellCount || 0, color: 'red' },
                { icon: <FaExchangeAlt />, label: '순 유입', value: stats.netFlow !== 0 ? `$${formatVolume(Math.abs(stats.netFlow))}` : '$0.0M', color: stats.netFlow >= 0 ? 'green' : 'red' },
                { icon: <FaChartLine />, label: '최대 거래', value: stats.largestTrade > 0 ? `$${formatVolume(stats.largestTrade)}` : '$0.00M', color: 'yellow' },
                { icon: <FaShieldAlt />, label: '평균 규모', value: stats.avgTradeSize > 0 ? `$${formatVolume(stats.avgTradeSize)}` : '$0.00M', color: 'cyan' },
                { icon: <FaFireAlt />, label: '매수량', value: stats.buyVolume > 0 ? `$${formatVolume(stats.buyVolume)}` : '$0.0M', color: 'orange' },
                { icon: <FaDatabase />, label: '매도량', value: stats.sellVolume > 0 ? `$${formatVolume(stats.sellVolume)}` : '$0.0M', color: 'pink' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * config.decimals.value05 }}
                  className={`bg-${stat.color}-900/30 rounded-xl p-4 border border-${stat.color}-500/30 hover:scale-105 transition-transform cursor-pointer`}
                  style={{
                    backgroundColor: `rgba(${stat.color === 'purple' ? '147, 51, 234' :
                                             stat.color === 'green' ? '34, 197, 94' :
                                             stat.color === 'red' ? '239, 68, 68' :
                                             stat.color === 'yellow' ? '250, 204, 21' :
                                             stat.color === 'cyan' ? '6, 182, 212' :
                                             stat.color === 'orange' ? '251, 146, 60' :
                                             '236, 72, 153'}, config.decimals.value1)`,
                    borderColor: `rgba(${stat.color === 'purple' ? '147, 51, 234' :
                                         stat.color === 'green' ? '34, 197, 94' :
                                         stat.color === 'red' ? '239, 68, 68' :
                                         stat.color === 'yellow' ? '250, 204, 21' :
                                         stat.color === 'cyan' ? '6, 182, 212' :
                                         stat.color === 'orange' ? '251, 146, 60' :
                                         '236, 72, 153'}, config.decimals.value3)`
                  }}
                >
                  <div className={`text-${stat.color}-400 text-xl mb-2`}>
                    {stat.icon}
                  </div>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* 실시간 거래 목록 */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaFish className="text-blue-400" />
                실시간 고래 거래 ({getThreshold(selectedSymbol)}+ {selectedSymbol.replace('USDT', '')})
                {transactions.length > 0 && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full animate-pulse">
                    LIVE
                  </span>
                )}
              </h3>
              
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <FaFish className="text-6xl text-gray-600 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-400">실시간 고래 거래를 모니터링 중입니다...</p>
                  <p className="text-xs text-gray-500 mt-2">임계값: {getThreshold(selectedSymbol)} {selectedSymbol.replace('USDT', '')}</p>
                  <p className="text-xs text-gray-600 mt-1">데이터 로딩 중...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {transactions.filter(tx => tx && tx.amount && tx.price && tx.value && tx.symbol === selectedSymbol).map(tx => (
                      <motion.div
                        key={tx.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-4 rounded-lg border backdrop-blur ${
                          tx.type === 'buy'
                            ? 'bg-green-900/20 border-green-500/30'
                            : 'bg-red-900/20 border-red-500/30'
                        } ${tx.impact === 'high' ? 'ring-2 ring-yellow-500/50' : ''}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <FaFish className={`text-3xl ${
                                tx.type === 'buy' ? 'text-green-400' : 'text-red-400'
                              }`} />
                              {tx.impact === 'high' && (
                                <FaFireAlt className="absolute -top-1 -right-1 text-orange-400 text-xs animate-pulse" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${
                                  tx.type === 'buy' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {tx.type === 'buy' ? '매수' : '매도'}
                                </span>
                                <span className="text-white font-medium">
                                  {safeAmount(tx.amount)} {tx.symbol?.replace('USDT', '') || ''}
                                </span>
                                <span className="text-gray-400 text-sm">
                                  @ ${safePrice(tx.price)}
                                </span>
                                {tx.impact === 'high' && (
                                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                                    초대형
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                <span>{tx.exchange}</span>
                                <span>{tx.wallet}</span>
                                <span>{tx.time}</span>
                                {tx.hash && (
                                  <span className="font-mono">{tx.hash.slice(0, 10)}...</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-white">
                              ${safeMillion((tx.value || 0), 2)}M
                            </p>
                            <p className={`text-xs ${
                              tx.impact === 'high' ? 'text-yellow-400' :
                              tx.impact === 'medium' ? 'text-orange-400' :
                              'text-gray-400'
                            }`}>
                              영향도: {tx.impact.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* 트레이딩 전략 동적분석 */}
            <TradingStrategy
              symbol={selectedSymbol}
              stats={stats}
              currentPrice={currentPrice}
              priceChange={priceChange}
              activeTab='overview'
            />

            {/* 시스템 소개 - 페이지 하단 */}
            <SystemOverview 
              title={whaleTrackingOverview.title}
              icon={<FaFish className="text-purple-400" />}
              sections={whaleTrackingOverview.sections}
              signals={whaleTrackingOverview.signals}
              tips={whaleTrackingOverview.tips}
            />
          </div>
        )}

        {/* 종합분석 탭 */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <ComprehensiveAnalysis
              symbol={selectedSymbol.replace('USDT', '')}
              currentPrice={currentPrice}
              marketData={{
                volume24h: stats.volume24h,
                change24h: priceChange,
                high24h: currentPrice * 1.02,
                low24h: currentPrice * config.decimals.value98
              }}
              whaleData={{
                totalWhales: stats.totalWhales,
                buyCount: stats.buyCount,
                sellCount: stats.sellCount,
                netFlow: stats.netFlow,
                whaleActivity: stats.whaleActivity
              }}
              fearGreedIndex={stats.fearGreedIndex}
              fundingRate={config.decimals.value01}
            />
            
            {/* 트레이딩 전략 동적분석 */}
            <TradingStrategy
              symbol={selectedSymbol}
              stats={stats}
              currentPrice={currentPrice}
              priceChange={priceChange}
              activeTab='analysis'
            />
          </div>
        )}

        {/* 고래 지갑 탭 */}
        {activeTab === 'wallets' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaWallet className="text-purple-400" />
                추적 중인 고래 지갑 - {selectedSymbol.replace('USDT', '')}
              </h3>
              
              {/* 실제 거래 데이터 기반 지갑 분석 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">상위 매수 지갑</h4>
                  <div className="space-y-2">
                    {(() => {
                      const buyTxs = transactions.filter(tx => tx?.type === 'buy' && tx?.symbol === selectedSymbol);
                      const walletMap = new Map();
                      
                      // 실제 거래에서 지갑별 집계
                      buyTxs.forEach(tx => {
                        const wallet = tx.id.substring(0, 8) + '...' + tx.id.substring(tx.id.length - 4);
                        walletMap.set(wallet, (walletMap.get(wallet) || 0) + tx.value);
                      });
                      
                      // 상위 3개 지갑
                      const topWallets = Array.from(walletMap.entries())
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3);
                      
                      if (topWallets.length === 0) {
                        return <div className="text-gray-500 text-sm">매수 지갑 수집 중...</div>;
                      }
                      
                      return topWallets.map(([wallet, value]) => (
                        <div key={wallet} className="flex justify-between items-center">
                          <span className="text-gray-300 font-mono text-sm">{wallet}</span>
                          <span className="text-green-400 font-bold">
                            ${safeThousand(value)}K
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">상위 매도 지갑</h4>
                  <div className="space-y-2">
                    {(() => {
                      const sellTxs = transactions.filter(tx => tx?.type === 'sell' && tx?.symbol === selectedSymbol);
                      const walletMap = new Map();
                      
                      // 실제 거래에서 지갑별 집계
                      sellTxs.forEach(tx => {
                        const wallet = tx.id.substring(0, 8) + '...' + tx.id.substring(tx.id.length - 4);
                        walletMap.set(wallet, (walletMap.get(wallet) || 0) + tx.value);
                      });
                      
                      // 상위 3개 지갑
                      const topWallets = Array.from(walletMap.entries())
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3);
                      
                      if (topWallets.length === 0) {
                        return <div className="text-gray-500 text-sm">매도 지갑 수집 중...</div>;
                      }
                      
                      return topWallets.map(([wallet, value]) => (
                        <div key={wallet} className="flex justify-between items-center">
                          <span className="text-gray-300 font-mono text-sm">{wallet}</span>
                          <span className="text-red-400 font-bold">
                            ${safeThousand(value)}K
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
              
              {/* 지갑 활동 요약 */}
              <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-400">활성 지갑</div>
                    <div className="text-white font-bold">
                      {new Set(transactions.filter(tx => tx?.symbol === selectedSymbol).map(tx => tx.id.substring(0, 8))).size}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">평균 거래</div>
                    <div className="text-yellow-400 font-bold">
                      ${(() => {
                        const symbolTxs = transactions.filter(tx => tx?.symbol === selectedSymbol && tx?.value);
                        if (symbolTxs.length === 0) return '0';
                        return safeThousand(symbolTxs.reduce((sum, tx) => sum + tx.value, 0) / symbolTxs.length);
                      })()}K
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">최대 거래</div>
                    <div className="text-blue-400 font-bold">
                      ${(() => {
                        const symbolTxs = transactions.filter(tx => tx?.symbol === selectedSymbol && tx?.value);
                        if (symbolTxs.length === 0) return '0';
                        return safeThousand(Math.max(...symbolTxs.map(tx => tx.value)));
                      })()}K
                    </div>
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <FaSync className="text-4xl text-gray-500 animate-spin mx-auto mb-2" />
                  <p className="text-gray-400">데이터 로딩 중...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-700">
                      <tr className="text-left text-sm text-gray-400">
                        <th className="pb-3">지갑 주소</th>
                        <th className="pb-3">보유량</th>
                        <th className="pb-3">거래 수</th>
                        <th className="pb-3">승률</th>
                        <th className="pb-3">평균 수익</th>
                        <th className="pb-3">마지막 활동</th>
                        <th className="pb-3">평판</th>
                        <th className="pb-3">태그</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {whaleWallets.map((wallet, idx) => (
                        <motion.tr 
                          key={idx} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * config.decimals.value05 }}
                          className="border-b border-gray-800 hover:bg-gray-800/50"
                        >
                          <td className="py-3">
                            <span className="font-mono text-blue-400 cursor-pointer hover:underline">
                              {wallet.address}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="text-white font-bold">{safeFixed(wallet.balance, 2)} {selectedSymbol.replace('USDT', '')}</span>
                          </td>
                          <td className="py-3">{wallet.totalTrades.toLocaleString()}</td>
                          <td className="py-3">
                            <span className={`font-bold ${
                              wallet.winRate > 70 ? 'text-green-400' :
                              wallet.winRate > 50 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {wallet.winRate}%
                            </span>
                          </td>
                          <td className="py-3 text-green-400">+{wallet.avgProfit}%</td>
                          <td className="py-3 text-gray-400">{wallet.lastActive}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              wallet.reputation === 'legendary' ? 'bg-purple-500/20 text-purple-400' :
                              wallet.reputation === 'expert' ? 'bg-blue-500/20 text-blue-400' :
                              wallet.reputation === 'active' ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {wallet.reputation.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1 flex-wrap">
                              {wallet.tags.map(tag => (
                                <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={fetchWhaleData}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all"
                >
                  더 많은 지갑 불러오기
                </button>
              </div>
            </div>
            
            {/* 동적 탭 가이드 - 하단으로 이동 */}
            <DynamicTabGuide 
              tabType="wallets"
              transactions={transactions}
              stats={{...stats, currentPrice}}
              patterns={patterns}
              whaleWallets={whaleWallets}
            />
            
            {/* 트레이딩 전략 동적분석 */}
            <TradingStrategy
              symbol={selectedSymbol}
              stats={stats}
              currentPrice={currentPrice}
              priceChange={priceChange}
              activeTab='wallets'
            />
          </div>
        )}

        {/* 거래소 플로우 탭 */}
        {activeTab === 'flows' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaExchangeAlt className="text-purple-400" />
                거래소 자금 흐름 - {selectedSymbol.replace('USDT', '')}
              </h3>
              
              {/* 실시간 자금 흐름 데이터 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* 시간대별 자금 흐름 */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">시간대별 순유입</h4>
                  <div className="space-y-2">
                    {(() => {
                      const now = Date.now();
                      const intervals = [5, 15, 30, 60]; // 분 단위
                      
                      return intervals.map(minutes => {
                        const startTime = now - minutes * 60 * 1000;
                        const periodTxs = transactions.filter(tx => {
                          if (!tx || tx.symbol !== selectedSymbol) return false;
                          const txTime = new Date(tx.time.replace(' ', 'T')).getTime();
                          return txTime >= startTime;
                        });
                        
                        const buySum = periodTxs.filter(tx => tx.type === 'buy').reduce((sum, tx) => sum + tx.value, 0);
                        const sellSum = periodTxs.filter(tx => tx.type === 'sell').reduce((sum, tx) => sum + tx.value, 0);
                        const netFlow = buySum - sellSum;
                        
                        return (
                          <div key={minutes} className="flex justify-between items-center">
                            <span className="text-gray-400">{minutes}분</span>
                            <span className={`font-bold ${
                              netFlow >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {netFlow >= 0 ? '+' : ''}{safeThousand(netFlow)}K
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
                
                {/* 거래 규모별 분포 */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">거래 규모 분포</h4>
                  <div className="space-y-2">
                    {(() => {
                      const symbolTxs = transactions.filter(tx => tx?.symbol === selectedSymbol && tx?.value);
                      const ranges = [
                        { label: '< $50K', min: 0, max: 50000 },
                        { label: '$50K-100K', min: 50000, max: 100000 },
                        { label: '$100K-500K', min: 100000, max: 500000 },
                        { label: '> $500K', min: 500000, max: Infinity }
                      ];
                      
                      return ranges.map(range => {
                        const count = symbolTxs.filter(tx => tx.value >= range.min && tx.value < range.max).length;
                        const percentage = symbolTxs.length > 0 ? (count / symbolTxs.length * 100).toFixed(1) : 0;
                        
                        return (
                          <div key={range.label} className="flex justify-between items-center">
                            <span className="text-gray-400">{range.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white">{count}건</span>
                              <span className="text-gray-500 text-sm">({percentage}%)</span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
              
              {/* 흐름 시각화 */}
              <div className="bg-gray-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">실시간 자금 흐름</span>
                  <span className="text-xs text-gray-500">
                    총 {transactions.filter(tx => tx?.symbol === selectedSymbol).length}건
                  </span>
                </div>
                <div className="relative h-20">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      {(() => {
                        const symbolTxs = transactions.filter(tx => tx?.symbol === selectedSymbol);
                        const buyCount = symbolTxs.filter(tx => tx?.type === 'buy').length;
                        const total = symbolTxs.length || 1;
                        const buyPercentage = (buyCount / total) * 100;
                        
                        return (
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                            style={{ width: `${buyPercentage}%` }}
                          />
                        );
                      })()}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex justify-between items-center px-2">
                    <span className="text-green-400 font-bold text-sm">
                      매수 {transactions.filter(tx => tx?.symbol === selectedSymbol && tx?.type === 'buy').length}
                    </span>
                    <span className="text-red-400 font-bold text-sm">
                      매도 {transactions.filter(tx => tx?.symbol === selectedSymbol && tx?.type === 'sell').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {exchangeFlows.map((flow, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, scale: config.decimals.value9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * config.decimals.value1 }}
                  className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
                >
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                    <span>{flow.exchange}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      flow.trend === 'accumulation' ? 'bg-green-500/20 text-green-400' :
                      flow.trend === 'distribution' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {flow.trend === 'accumulation' ? '축적' :
                       flow.trend === 'distribution' ? '분산' : '중립'}
                    </span>
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">유입</span>
                      <span className="text-sm font-bold text-green-400">
                        +${safeMillion(flow.inflow, 1)}M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">유출</span>
                      <span className="text-sm font-bold text-red-400">
                        -${safeMillion(flow.outflow, 1)}M
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-700 flex justify-between">
                      <span className="text-sm text-gray-400">순 플로우</span>
                      <span className={`text-lg font-bold ${
                        flow.netFlow >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${safeMillion(Math.abs(flow.netFlow), 1)}M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">24h 변화</span>
                      <span className={`text-sm font-bold ${
                        flow.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {flow.change24h >= 0 ? '+' : ''}{safePercent(flow.change24h)}%
                      </span>
                    </div>
                    {flow.reserves && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">총 보유량</span>
                        <span className="text-sm font-bold text-white">
                          {safeFixed(flow.reserves, 2)} BTC
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-400">
                      {flow.trend === 'accumulation' ? 
                        '거래소 내 BTC가 증가하고 있습니다. 매도 압력 가능성' :
                       flow.trend === 'distribution' ?
                        '거래소에서 BTC가 빠져나가고 있습니다. 장기 보유 신호' :
                        '유입과 유출이 균형을 이루고 있습니다'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* 탭 가이드 - 하단으로 이동 */}
            <TabGuide {...tabGuides.flows} />
            
            {/* 트레이딩 전략 동적분석 */}
            <TradingStrategy
              symbol={selectedSymbol}
              stats={stats}
              currentPrice={currentPrice}
              priceChange={priceChange}
              activeTab='flows'
            />
          </div>
        )}

        {/* 패턴 분석 탭 */}
        {activeTab === 'patterns' && (
          <div className="space-y-6">
            
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaBrain className="text-purple-400" />
                패턴 인식 & 예측 - {selectedSymbol.replace('USDT', '')}
              </h3>
              
              {/* 실시간 패턴 분석 데이터 */}
              <div className="mb-4 bg-gray-800/30 rounded-lg p-4">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">현재 가격</div>
                    <div className="text-white font-bold">${safePrice(currentPrice)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">거래량</div>
                    <div className="text-white font-bold">{transactions.filter(tx => tx?.symbol === selectedSymbol).length}건</div>
                  </div>
                  <div>
                    <div className="text-gray-400">매수/매도</div>
                    <div className="text-white font-bold">
                      {transactions.filter(tx => tx?.symbol === selectedSymbol && tx?.type === 'buy').length}/
                      {transactions.filter(tx => tx?.symbol === selectedSymbol && tx?.type === 'sell').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">순유입</div>
                    <div className={`font-bold ${
                      stats.netFlow >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ${safeThousand(stats.netFlow)}K
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-sm font-semibold text-white mb-3">현재 패턴</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">축적/분산</span>
                        <span className="text-sm font-bold text-yellow-400">
                          {patterns.accumulation ? '축적 중' : patterns.distribution ? '분산 중' : '중립'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Wyckoff Phase</span>
                        <span className="text-sm font-bold text-white">{patterns.wyckoff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">추세</span>
                        <span className="text-sm font-bold text-white">{patterns.trend}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">거래량 프로필</span>
                        <span className="text-sm font-bold text-white">{patterns.volumeProfile}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">RSI</span>
                        <span className={`text-sm font-bold ${
                          patterns.rsi > 70 ? 'text-red-400' :
                          patterns.rsi < 30 ? 'text-green-400' :
                          'text-yellow-400'
                        }`}>
                          {patterns.safePercent(rsi)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-sm font-semibold text-white mb-3">지지/저항</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">주요 지지선</span>
                        <span className="text-sm font-bold text-green-400">${patterns.support.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">주요 저항선</span>
                        <span className="text-sm font-bold text-red-400">${patterns.resistance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">돌파 확률</span>
                        <span className="text-sm font-bold text-white">{patterns.breakoutProbability}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-sm font-semibold text-white mb-3">기술적 지표</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">MACD</span>
                        <span className={`text-sm font-bold ${
                          patterns.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {patterns.macd.safePrice(histogram)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">볼린저 상단</span>
                        <span className="text-sm font-bold text-white">${patterns.safeFixed(bollingerBands.upper, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">볼린저 하단</span>
                        <span className="text-sm font-bold text-white">${patterns.safeFixed(bollingerBands.lower, 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30">
                  <h4 className="text-sm font-semibold text-white mb-3">AI 예측</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">24시간 예측</p>
                      <p className="text-sm text-white">
                        {patterns.breakoutProbability > 60 ? '상향 돌파 가능성 높음' :
                         patterns.breakoutProbability < 40 ? '하향 돌파 가능성 높음' :
                         '횡보 지속 예상'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">주요 시나리오</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• 저항선 돌파 시 $72,000 목표</li>
                        <li>• 지지선 이탈 시 $63,000 목표</li>
                        <li>• 현재 구간 횡보 가능성 ${config.percentage.value45}</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">추천 전략</p>
                      <p className="text-sm text-white">
                        {patterns.rsi > 70 ? 
                          '과매수 구간, 숏 포지션 고려' :
                         patterns.rsi < 30 ?
                          '과매도 구간, 롱 포지션 기회' :
                          '중립 구간, 추세 확인 필요'}
                      </p>
                    </div>
                    <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
                      <button 
                        onClick={fetchWhaleData}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all"
                      >
                        패턴 분석 업데이트
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 탭 가이드 - 하단으로 이동 */}
            <TabGuide {...tabGuides.patterns} />
            
            {/* 트레이딩 전략 동적분석 */}
            <TradingStrategy
              symbol={selectedSymbol}
              stats={stats}
              currentPrice={currentPrice}
              priceChange={priceChange}
              activeTab='patterns'
            />
          </div>
        )}

        {/* 거래 내역 탭 */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaHistory className="text-purple-400" />
                과거 고래 거래 내역 - {selectedSymbol.replace('USDT', '')}
                <span className="text-xs text-gray-400 ml-2">
                  ({transactions.filter(tx => tx.symbol === selectedSymbol).length}건)
                </span>
              </h3>
              
              {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <FaHistory className="text-6xl text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">아직 기록된 거래 내역이 없습니다</p>
                    <p className="text-xs text-gray-500 mt-2">실시간 거래가 발생하면 여기에 표시됩니다</p>
                  </div>
              ) : (() => {
                // 필터링된 거래 목록 - 현재 심볼의 거래만
                const filteredTransactions = transactions.filter(tx => {
                  // 먼저 심볼이 일치하는지 확인
                  if (tx.symbol !== selectedSymbol) return false
                  
                  if (historyFilter === 'buy') return tx.type === 'buy'
                  if (historyFilter === 'sell') return tx.type === 'sell'
                  if (historyFilter === 'large') return tx.impact === 'high'
                  return true
                })
                
                return (
                  <div className="space-y-4">
                    {/* 거래 내역 필터 */}
                    <div className="flex gap-2 mb-4">
                      <button 
                        onClick={() => setHistoryFilter('all')}
                        className={`px-3 py-1 rounded text-sm transition-all ${
                          historyFilter === 'all' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        전체 ({transactions.filter(tx => tx.symbol === selectedSymbol).length})
                      </button>
                      <button 
                        onClick={() => setHistoryFilter('buy')}
                        className={`px-3 py-1 rounded text-sm transition-all ${
                          historyFilter === 'buy' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        매수만 ({transactions.filter(t => t.type === 'buy' && t.symbol === selectedSymbol).length})
                      </button>
                      <button 
                        onClick={() => setHistoryFilter('sell')}
                        className={`px-3 py-1 rounded text-sm transition-all ${
                          historyFilter === 'sell' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        매도만 ({transactions.filter(t => t.type === 'sell' && t.symbol === selectedSymbol).length})
                      </button>
                      <button 
                        onClick={() => setHistoryFilter('large')}
                        className={`px-3 py-1 rounded text-sm transition-all ${
                          historyFilter === 'large' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        대형 거래 ({transactions.filter(t => t.impact === 'high' && t.symbol === selectedSymbol).length})
                      </button>
                    </div>
                  
                  {/* 거래 내역 테이블 */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-700">
                        <tr className="text-left text-sm text-gray-400">
                          <th className="pb-3">시간</th>
                          <th className="pb-3">타입</th>
                          <th className="pb-3">수량</th>
                          <th className="pb-3">가격</th>
                          <th className="pb-3">거래액</th>
                          <th className="pb-3">영향도</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {filteredTransactions.slice(0, 20).map((tx) => (
                          <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="py-3 text-gray-400">{tx.time}</td>
                            <td className={`py-3 font-medium ${
                              tx.type === 'buy' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {tx.type === 'buy' ? '매수' : '매도'}
                            </td>
                            <td className="py-3">{safeAmount(tx.amount)} {tx.symbol?.replace('USDT', '') || ''}</td>
                            <td className="py-3">${safePrice(tx.price)}</td>
                            <td className="py-3 font-medium">${safeMillion((tx.value || 0), 2)}M</td>
                            <td className={`py-3 ${
                              tx.impact === 'high' ? 'text-red-400' :
                              tx.impact === 'medium' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {tx.impact === 'high' ? '높음' :
                               tx.impact === 'medium' ? '중간' : '낮음'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* 통계 요약 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">필터된 거래 수</p>
                      <p className="text-xl font-bold text-white">{filteredTransactions.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">매수/매도 비율</p>
                      <p className="text-xl font-bold text-white">
                        {filteredTransactions.filter(t => t.type === 'buy').length}/
                        {filteredTransactions.filter(t => t.type === 'sell').length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">평균 거래액</p>
                      <p className="text-xl font-bold text-white">
                        ${filteredTransactions.length > 0 ? safeMillion(filteredTransactions.reduce((sum, tx) => sum + tx.value, 0) / filteredTransactions.length, 2) : '0.00'}M
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">최대 거래액</p>
                      <p className="text-xl font-bold text-white">
                        ${filteredTransactions.length > 0 ? safeMillion(Math.max(...filteredTransactions.map(tx => tx.value)), 2) : '0.00'}M
                      </p>
                    </div>
                  </div>
                </div>
              )
            })()}
            </div>
            
            {/* 탭 가이드 - 하단으로 이동 */}
            <TabGuide {...tabGuides.history} />
            
            {/* 트레이딩 전략 동적분석 */}
            <TradingStrategy
              symbol={selectedSymbol}
              stats={stats}
              currentPrice={currentPrice}
              priceChange={priceChange}
              activeTab='history'
            />
          </div>
        )}

        {/* 알림 설정 탭 */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">알림 설정</h3>
              
              <div className="space-y-6">
                {/* 알림 채널 */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">알림 채널</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setAlerts(prev => ({...prev, telegram: !prev.telegram}))}
                      className={`p-4 rounded-lg border transition-all ${
                        alerts.telegram
                          ? 'bg-blue-900/30 border-blue-500/50 text-blue-400'
                          : 'bg-gray-900/30 border-gray-700 text-gray-400'
                      }`}
                    >
                      <FaTelegram className="text-2xl mb-2 mx-auto" />
                      <p className="text-sm">텔레그램</p>
                    </button>
                    
                    <button
                      onClick={() => setAlerts(prev => ({...prev, email: !prev.email}))}
                      className={`p-4 rounded-lg border transition-all ${
                        alerts.email
                          ? 'bg-blue-900/30 border-blue-500/50 text-blue-400'
                          : 'bg-gray-900/30 border-gray-700 text-gray-400'
                      }`}
                    >
                      <FaEnvelope className="text-2xl mb-2 mx-auto" />
                      <p className="text-sm">이메일</p>
                    </button>

                    <button
                      onClick={() => {
                        const newSoundState = !alerts.sound
                        setAlerts(prev => ({...prev, sound: newSoundState}))
                        audioService.setEnabled(newSoundState)
                        // 테스트 사운드 재생
                        if (newSoundState) {
                          audioService.playTest()
                        }
                      }}
                      className={`p-4 rounded-lg border transition-all ${
                        alerts.sound
                          ? 'bg-blue-900/30 border-blue-500/50 text-blue-400'
                          : 'bg-gray-900/30 border-gray-700 text-gray-400'
                      }`}
                    >
                      <FaBell className="text-2xl mb-2 mx-auto" />
                      <p className="text-sm">소리 알림</p>
                    </button>
                  </div>
                </div>
                
                {/* 알림 조건 */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">알림 조건</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'whaleAlert', label: '고래 거래 알림' },
                      { key: 'priceAlert', label: '가격 변동 알림' },
                      { key: 'volumeAlert', label: '거래량 급증 알림' },
                      { key: 'patternAlert', label: '패턴 인식 알림' }
                    ].map(alert => (
                      <div key={alert.key} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                        <span className="text-sm text-gray-300">{alert.label}</span>
                        <button
                          onClick={() => setAlerts(prev => ({...prev, [alert.key]: !prev[alert.key as keyof typeof alerts]}))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            alerts[alert.key as keyof typeof alerts] ? 'bg-blue-600' : 'bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            alerts[alert.key as keyof typeof alerts] ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 임계값 설정 */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">임계값 설정</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">고래 거래 임계값 ({selectedSymbol.replace('USDT', '')})</label>
                      <input
                        type="number"
                        value={alerts.threshold}
                        onChange={(e) => setAlerts(prev => ({...prev, threshold: Number(e.target.value)}))}
                        className="w-full mt-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={saveAlertSettings}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    설정 저장
                  </button>
                  <button 
                    onClick={() => addNotification('info', '테스트 알림입니다')}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all"
                  >
                    테스트 알림 전송
                  </button>
                </div>
              </div>
            </div>
            
            {/* 탭 가이드 - 하단으로 이동 */}
            <TabGuide {...tabGuides.alerts} />
          </div>
        )}

        {/* 백테스팅 탭 */}
        {activeTab === 'backtest' && (
          <div className="space-y-6">
            
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaRocket className="text-purple-400" />
                전략 백테스팅
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-sm font-semibold text-white mb-3">테스트 설정</h4>
                    <div className="space-y-3">
                      <select 
                        id="strategy"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="whale-follow">고래 따라가기 전략</option>
                        <option value="contrarian">역추세 전략</option>
                        <option value="momentum">모멘텀 전략</option>
                        <option value="smart-money">스마트머니 추종</option>
                      </select>
                      <input
                        type="date"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                      <input
                        type="number"
                        placeholder="초기 자본 ($)"
                        defaultValue="10000"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const strategy = (document.getElementById('strategy') as HTMLSelectElement).value
                      runBacktest(strategy)
                    }}
                    disabled={isBacktesting}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                  >
                    {isBacktesting ? (
                      <span className="flex items-center justify-center">
                        <FaSync className="animate-spin mr-2" />
                        백테스팅 중...
                      </span>
                    ) : (
                      '백테스팅 시작'
                    )}
                  </button>
                </div>
                
                {backtestResult ? (
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-sm font-semibold text-white mb-3">결과 요약</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">전략</span>
                        <span className="text-white font-bold">{backtestResult.strategy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">총 수익률</span>
                        <span className={`font-bold ${
                          backtestResult.totalReturn > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {backtestResult.totalReturn > 0 ? '+' : ''}{backtestResult.safePrice(totalReturn)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">승률</span>
                        <span className="text-white font-bold">{backtestResult.safePercent(winRate)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">최대 낙폭</span>
                        <span className="text-red-400 font-bold">{backtestResult.safePercent(maxDrawdown)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">샤프 비율</span>
                        <span className="text-white font-bold">{backtestResult.safePrice(sharpeRatio)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">총 거래 수</span>
                        <span className="text-white font-bold">{backtestResult.totalTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">평균 보유 기간</span>
                        <span className="text-white font-bold">{backtestResult.safePercent(avgHoldTime)}일</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">최고 수익 거래</span>
                        <span className="text-green-400 font-bold">+{backtestResult.safePercent(bestTrade)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">최대 손실 거래</span>
                        <span className="text-red-400 font-bold">{backtestResult.safePercent(worstTrade)}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-sm font-semibold text-white mb-3">결과 요약</h4>
                    <div className="text-center py-8 text-gray-500">
                      <FaChartLine className="text-4xl mx-auto mb-2 opacity-50" />
                      <p>백테스팅을 시작하면 결과가 표시됩니다</p>
                    </div>
                  </div>
                )}
              </div>
              
              {backtestResult && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-white mb-3">월별 수익률</h4>
                  <div className="grid grid-cols-12 gap-1">
                    {backtestResult.monthlyReturns.map((ret, idx) => (
                      <div 
                        key={idx}
                        className="text-center"
                      >
                        <div className={`h-20 rounded flex items-end justify-center ${
                          ret > 0 ? 'bg-green-900/30' : 'bg-red-900/30'
                        }`}>
                          <div 
                            className={`w-full rounded ${
                              ret > 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ height: `${Math.abs(ret)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{idx + 1}월</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* 탭 가이드 - 하단으로 이동 */}
            <TabGuide {...tabGuides.backtest} />
          </div>
        )}

        {/* 설정 탭 */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaCog className="text-purple-400" />
                시스템 설정
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">데이터 설정</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                      <span className="text-sm text-gray-300">실시간 업데이트</span>
                      <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          autoRefresh ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoRefresh ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">연결 상태</h4>
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">WebSocket</span>
                      <span className={`text-sm font-bold ${
                        isConnected ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isConnected ? '연결됨' : '연결 끊김'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">API 상태</span>
                      <span className="text-sm font-bold text-green-400">정상</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">데이터 관리</h4>
                  <div className="flex gap-4">
                    <button 
                      onClick={exportData}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all"
                    >
                      데이터 내보내기
                    </button>
                    <button 
                      onClick={() => {
                        setTransactions([])
                        // 현재 심볼의 통계만 초기화
                        setStatsBySymbol(prev => ({
                          ...prev,
                          [selectedSymbol]: {
                            ...getDefaultStats(),
                            fearGreedIndex: stats.fearGreedIndex,
                            dominance: stats.dominance,
                            volatility: stats.volatility,
                            activeWhales: stats.activeWhales
                          }
                        }))
                        setTransactionsBySymbol(prev => ({
                          ...prev,
                          [selectedSymbol]: []
                        }))
                        // localStorage에서 현재 심볼 데이터만 제거
                        const saved = localStorage.getItem('whaleTransactions')
                        if (saved) {
                          const allTransactions = JSON.parse(saved)
                          delete allTransactions[selectedSymbol]
                          localStorage.setItem('whaleTransactions', JSON.stringify(allTransactions))
                        }
                        addNotification('success', `${selectedSymbol} 데이터 초기화 완료`)
                      }}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-all"
                    >
                      데이터 초기화
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: config.decimals.value5 }}
          className="mt-12 p-6 bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-cyan-900/50 backdrop-blur rounded-xl border border-blue-500/30"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">🚀 프리미엄 고래 추적 Ultimate</h3>
            <p className="text-gray-400 mb-4">
              AI 예측, 자동 매매, 실시간 알림, 백테스팅, 포트폴리오 관리까지
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
                프리미엄 시작하기
              </button>
              <button className="px-8 py-3 bg-gray-800 border border-gray-700 rounded-lg font-bold hover:bg-gray-700 transition-all">
                텔레그램 봇 연동
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}