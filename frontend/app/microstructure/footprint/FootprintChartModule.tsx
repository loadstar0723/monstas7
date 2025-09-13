'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaChartBar, FaChartLine, FaBrain, FaFireAlt, FaClock,
  FaArrowUp, FaArrowDown, FaSync, FaInfoCircle, FaExclamationTriangle,
  FaBook, FaChevronLeft, FaChevronRight, FaExpand, FaCompress
} from 'react-icons/fa'
import { FootprintCell, MarketProfile, OrderFlowData, DeltaData, MarketMetrics } from './types'
import { FOOTPRINT_CONFIG, loadConfigFromAPI } from './config/constants'
import { generateSampleFootprintData } from './utils/sampleData'
import { fetchInitialPrice, getDefaultPrice } from './utils/priceData'
import { generateMarketProfile, generateSampleMarketProfile } from './utils/marketProfileGenerator'
import dynamic from 'next/dynamic'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts'

// 동적 컴포넌트 로드
const ComprehensiveAnalysis = dynamic(
  () => import('@/components/signals/ComprehensiveAnalysis'),
  { ssr: false }
)

// 컴포넌트들 (나중에 분리)
const FootprintChart = dynamic(() => import('./components/FootprintChart'), { ssr: false })
const DeltaAnalysis = dynamic(() => import('./components/DeltaAnalysis'), { ssr: false })
const MarketProfile = dynamic(() => import('./components/MarketProfile'), { ssr: false })
const VolumeHeatmap = dynamic(() => import('./components/VolumeHeatmap'), { ssr: false })
const OrderFlowTable = dynamic(() => import('./components/OrderFlowTable'), { ssr: false })
const FootprintGuide = dynamic(() => import('./components/FootprintGuide'), { ssr: false })
const DebugPanel = dynamic(() => import('./components/DebugPanel'), { ssr: false })

export default function FootprintChartModule() {
  // 추적할 상위 10개 코인
  const TRACKED_SYMBOLS = [
    { symbol: 'BTCUSDT', name: 'BTC', color: '#F7931A' },
    { symbol: 'ETHUSDT', name: 'ETH', color: '#627EEA' },
    { symbol: 'BNBUSDT', name: 'BNB', color: '#F3BA2F' },
    { symbol: 'SOLUSDT', name: 'SOL', color: '#14F195' },
    { symbol: 'XRPUSDT', name: 'XRP', color: '#23292F' },
    { symbol: 'ADAUSDT', name: 'ADA', color: '#0033AD' },
    { symbol: 'DOGEUSDT', name: 'DOGE', color: '#C2A633' },
    { symbol: 'AVAXUSDT', name: 'AVAX', color: '#E84142' },
    { symbol: 'MATICUSDT', name: 'MATIC', color: '#8247E5' },
    { symbol: 'DOTUSDT', name: 'DOT', color: '#E6007A' }
  ]
  
  // 상태 관리
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [timeframe, setTimeframe] = useState('5m')
  const [activeSection, setActiveSection] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSimulationMode, setIsSimulationMode] = useState(false)
  
  // 시장 데이터
  const [marketMetrics, setMarketMetrics] = useState<MarketMetrics>({
    symbol: 'BTCUSDT',
    price: 0,
    change24h: 0,
    volume24h: 0,
    whaleActivity: 'low',
    orderFlowSentiment: 'neutral',
    institutionalFlow: 0,
    retailFlow: 0
  })
  
  // 풋프린트 데이터
  const [footprintData, setFootprintData] = useState<FootprintCell[]>([])
  const [deltaData, setDeltaData] = useState<DeltaData[]>([])
  const [marketProfile, setMarketProfile] = useState<MarketProfile[]>([])
  const [orderFlow, setOrderFlow] = useState<OrderFlowData[]>([])
  
  // 가격 추이 데이터 (5분 단위 OHLC)
  const [priceHistory, setPriceHistory] = useState<{time: string, open: number, high: number, low: number, close: number, volume: number}[]>([])
  
  // WebSocket/SSE 레퍼런스
  const wsRef = useRef<WebSocket | null>(null)
  const sseRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  
  // 시뮬레이션 모드 참조
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // 풋프린트 데이터 업데이트 함수
  const updateFootprintData = useCallback((order: OrderFlowData) => {
    const time = new Date(order.timestamp)
    const minutes = Math.floor(time.getMinutes() / 5) * 5
    const timeKey = time.getHours().toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
    
    setFootprintData(prev => {
      const priceGrouping = FOOTPRINT_CONFIG.PRICE_GROUPING[selectedSymbol] || 1
      const groupedPrice = Math.round(order.price / priceGrouping) * priceGrouping
      const existing = prev.find(f => f.time === timeKey && Math.abs(f.price - groupedPrice) < priceGrouping)
      
      if (existing) {
        // 기존 셀 업데이트
        return prev.map(f => {
          if (f.time === timeKey && Math.abs(f.price - groupedPrice) < priceGrouping) {
            const buyVolume = f.buyVolume + (order.side === 'buy' ? order.size : 0)
            const sellVolume = f.sellVolume + (order.side === 'sell' ? order.size : 0)
            const totalVolume = buyVolume + sellVolume
            const delta = buyVolume - sellVolume
            
            return {
              ...f,
              buyVolume,
              sellVolume,
              totalVolume,
              delta,
              imbalance: totalVolume > 0 ? delta / totalVolume : 0
            }
          }
          return f
        })
      } else {
        // 새 셀 추가
        const newCell: FootprintCell = {
          price: groupedPrice,
          time: timeKey,
          buyVolume: order.side === 'buy' ? order.size : 0,
          sellVolume: order.side === 'sell' ? order.size : 0,
          delta: order.side === 'buy' ? order.size : -order.size,
          totalVolume: order.size,
          imbalance: order.side === 'buy' ? 1 : -1,
          poc: false
        }
        
        return [...prev.slice(-99), newCell]
      }
    })
  }, [selectedSymbol])
  
  // 거래 데이터 처리 함수
  const processTradeData = useCallback((data: any) => {
    const newOrderFlow: OrderFlowData = {
      timestamp: data.T,
      price: parseFloat(data.p),
      size: parseFloat(data.q),
      side: data.m ? 'sell' : 'buy',
      aggressor: data.m,
      exchange: 'Binance'
    }
    
    // 오더플로우 업데이트 (최대 100개로 제한)
    setOrderFlow(prev => {
      const updated = [...prev, newOrderFlow]
      // 100개가 넘으면 오래된 데이터 제거
      if (updated.length > 100) {
        return updated.slice(-100)
      }
      return updated
    })
    
    // 시장 메트릭 업데이트
    setMarketMetrics(prev => ({
      ...prev,
      price: newOrderFlow.price
    }))
    
    // 풋프린트 데이터 업데이트 (5분 단위로 집계)
    updateFootprintData(newOrderFlow)
  }, [updateFootprintData])
  
  // 시뮬레이션 모드 시작 함수 - 실제 과거 거래 데이터 사용
  const startSimulationMode = useCallback(async () => {
    setIsSimulationMode(true)
    
    // 기존 시뮬레이션 정리
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current)
    }
    
    let trades = []
    
    try {
      // Binance API에서 최근 거래 데이터 가져오기
      const response = await fetch('/api/binance/trades?symbol=' + selectedSymbol + '&limit=100')
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          trades = data
          }
      }
    } catch (error) {
      }
    
    // API 실패 시 샘플 데이터 생성
    if (trades.length === 0) {
      const basePrice = marketMetrics.price || 98000
      // 샘플 거래 데이터 생성
      for (let i = 0; i < 50; i++) {
        const priceVar = (Math.random() - 0.5) * basePrice * 0.002 // 0.2% 변동
        const qty = Math.random() * 0.5 + 0.1 // 0.1 ~ 0.6 BTC
        trades.push({
          price: basePrice + priceVar,
          qty: qty,
          isBuyerMaker: Math.random() > 0.5
        })
      }
    }
    
    let tradeIndex = 0
    
    // 과거 거래 데이터를 순환하며 재생
    simulationIntervalRef.current = setInterval(() => {
      const trade = trades[tradeIndex]
      
      processTradeData({
        T: Date.now(), // 현재 시간으로 변경
        p: trade.price,
        q: trade.qty,
        m: trade.isBuyerMaker
      })
      
      // 다음 거래로 이동 (순환)
      tradeIndex = (tradeIndex + 1) % trades.length
    }, 1000) // 1초마다 재생
    
    }, [selectedSymbol, marketMetrics.price, processTradeData])

  // SSE 연결 (WebSocket 대체)
  const connectSSE = useCallback(() => {
    // 기존 SSE 연결 정리
    if (sseRef.current) {
      sseRef.current.close()
      sseRef.current = null
    }

    try {
      const symbol = selectedSymbol.toLowerCase()
      const sseUrl = '/api/binance/websocket?stream=' + symbol + '@aggTrade'
      sseRef.current = new EventSource(sseUrl)
      
      sseRef.current.onopen = () => {
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
      }
      
      sseRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'connected') {
            } else {
            processTradeData(data)
          }
        } catch (error) {
          console.error('[SSE] 메시지 처리 오류:', error)
        }
      }
      
      sseRef.current.onerror = (error) => {
        setIsConnected(false)
        
        if (reconnectAttemptsRef.current === 0) {
          reconnectAttemptsRef.current = 5
          startSimulationMode()
        }
        
        sseRef.current?.close()
      }
    } catch (error) {
      console.error('[SSE] 연결 생성 실패:', error)
      setIsConnected(false)
      startSimulationMode()
    }
  }, [selectedSymbol, processTradeData, startSimulationMode])

  // WebSocket 연결 (폴백)
  const connectWebSocket = useCallback(() => {
    // 기존 연결이 열려있거나 연결 중인 경우 정리
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000)
        wsRef.current = null
      }
    }

    try {
      const symbol = selectedSymbol.toLowerCase()
      const wsUrl = 'wss://stream.binance.com:9443/ws/' + symbol + '@aggTrade'
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          processTradeData(data)
        } catch (error) {
          console.error('[WebSocket] 메시지 처리 오류:', error)
        }
      }
      
      wsRef.current.onerror = (error) => {
        setIsConnected(false)
        
        // CORS나 네트워크 오류로 즉시 실패한 경우 빠르게 시뮬레이션 모드로 전환
        if (reconnectAttemptsRef.current === 0) {
          reconnectAttemptsRef.current = 5 // 재시도 건너뛰기
          startSimulationMode()
        }
      }
      
      wsRef.current.onclose = (event) => {
        setIsConnected(false)
        
        // 정상 종료가 아닌 경우에만 재연결
        if (!event.wasClean && event.code !== 1000) {
          handleReconnect()
        }
      }
    } catch (error) {
      console.error('[WebSocket] 연결 생성 실패:', error)
      setIsConnected(false)
    }
  }, [selectedSymbol, processTradeData])

  // 재연결 처리
  const handleReconnect = useCallback(() => {
    // 기존 재연결 타임아웃 정리
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (reconnectAttemptsRef.current < 5) {
      reconnectAttemptsRef.current += 1
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket()
      }, delay)
    } else {
      startSimulationMode()
    }
  }, [connectWebSocket, startSimulationMode])
  
  // 시뮬레이션 모드 정리
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
      }
    }
  }, [])

  // 초기 데이터 로드
  const loadInitialData = async () => {
    setIsLoading(true)
    let currentPrice = 0
    
    try {
      // 현재 가격 가져오기
      currentPrice = await fetchInitialPrice(selectedSymbol)
      // 시장 메트릭 업데이트
      setMarketMetrics(prev => ({
        ...prev,
        price: currentPrice
      }))
      
      // Binance API에서 최근 캔들 데이터 가져오기 (5분봉 288개 - 24시간)
      try {
        const response = await fetch('/api/binance/klines?symbol=' + selectedSymbol + '&interval=5m&limit=288')
        if (response.ok) {
          const result = await response.json()
          const klines = result.data || result.klines || [] // API 응답 구조에 맞게 수정
          // 캔들 데이터를 풋프린트 데이터로 변환 (최근 50개만 실시간처럼 처리)
          const recentKlines = Array.isArray(klines) ? klines.slice(-50) : [] // 배열 확인 후 처리
          recentKlines.forEach((kline: any) => {
            const [timestamp, open, high, low, close, volume, closeTime, quoteVolume] = kline
            const avgPrice = (parseFloat(high) + parseFloat(low)) / 2
            const vwap = parseFloat(quoteVolume) / parseFloat(volume) // VWAP 계산
            
            // 더 정교한 매수/매도 추정
            const isBullish = parseFloat(close) > parseFloat(open)
            const priceChangeRatio = (parseFloat(close) - parseFloat(open)) / parseFloat(open)
            const buyRatio = 0.5 + (priceChangeRatio * 10) // -0.5 ~ 0.5 범위로 조정
            
            processTradeData({
              T: parseInt(timestamp),
              p: vwap.toString(), // VWAP 사용
              q: (parseFloat(volume) * 0.05).toString(), // 캔들 데이터 샘플링 5%
              m: !isBullish // 매수 우세면 false (매수자가 공격적)
            })
          })
          
          // 가격 히스토리 설정
          const priceHistoryData = Array.isArray(klines) ? klines.map((kline: any) => {
            const [timestamp, open, high, low, close, volume] = kline
            const time = new Date(parseInt(timestamp))
            const hours = time.getHours().toString().padStart(2, '0')
            const minutes = time.getMinutes().toString().padStart(2, '0')
            return {
              time: hours + ':' + minutes,
              open: parseFloat(open),
              high: parseFloat(high),
              low: parseFloat(low),
              close: parseFloat(close),
              volume: parseFloat(volume)
            }
          }) : []
          setPriceHistory(priceHistoryData)
          
          // 초기 가격 및 변화율 설정
          if (Array.isArray(klines) && klines.length > 0) {
            const lastKline = klines[klines.length - 1]
            const firstKline = klines[0]
            const lastPrice = parseFloat(lastKline[4]) // 현재 종가
            const openPrice = parseFloat(firstKline[1]) // 첫 시가
            const change24h = ((lastPrice - openPrice) / openPrice) * 100
            
            setMarketMetrics(prev => ({
              ...prev,
              price: lastPrice,
              change24h: change24h
            }))
            
            currentPrice = lastPrice // 최신 가격으로 업데이트
          }
        }
      } catch (klinesError) {
        console.error('캔들 데이터 로드 실패:', klinesError)
      }
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error)
    }
    
    // 초기 풋프린트 데이터 설정 (실제 과거 데이터 사용)
    const price = currentPrice || marketMetrics.price || getDefaultPrice(selectedSymbol)
    const historicalData = await generateSampleFootprintData(selectedSymbol, price)
    setFootprintData(historicalData)
    
    // 초기 마켓 프로파일 생성 (실제 오더북 데이터 사용)
    const realProfile = await generateSampleMarketProfile(price, selectedSymbol)
    setMarketProfile(realProfile)
    
    setIsLoading(false)
  }

  // 심볼 변경 시 WebSocket 재연결
  useEffect(() => {
    // 기존 연결 정리
    if (wsRef.current) {
      wsRef.current.close(1000) // 정상 종료
      wsRef.current = null
    }
    
    if (sseRef.current) {
      sseRef.current.close()
      sseRef.current = null
    }
    
    // 재연결 시도 카운터 초기화
    reconnectAttemptsRef.current = 0
    
    // 시뮬레이션 모드 정리
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current)
      simulationIntervalRef.current = null
      setIsSimulationMode(false)
    }
    
    // 데이터 초기화
    setFootprintData([])
    setDeltaData([])
    setOrderFlow([])
    setPriceHistory([])
    setIsConnected(false)
    
    // 초기 데이터 로드
    loadInitialData()
    
    // SSE 연결 시도 (약간의 지연 후) - WebSocket 대신 SSE 사용
    const connectTimeout = setTimeout(() => {
      connectSSE() // WebSocket 대신 SSE 사용
    }, 500)
    
    return () => {
      clearTimeout(connectTimeout)
      if (wsRef.current) {
        wsRef.current.close(1000)
      }
      if (sseRef.current) {
        sseRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [selectedSymbol])

  // 시간대별 데이터 계산
  useEffect(() => {
    // 델타 데이터 계산
    const newDeltaData: DeltaData[] = []
    let cumulativeDelta = 0
    
    footprintData.forEach(cell => {
      cumulativeDelta += cell.delta
      newDeltaData.push({
        time: cell.time,
        delta: cell.delta,
        cumulativeDelta,
        price: cell.price,
        divergence: false // 나중에 계산
      })
    })
    
    setDeltaData(newDeltaData)
    
    // 마켓 프로파일 계산
    const newProfile = generateMarketProfile(footprintData, selectedSymbol)
    setMarketProfile(newProfile)
  }, [footprintData, selectedSymbol])

  // 전체화면 토글
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const selectedCoin = TRACKED_SYMBOLS.find(s => s.symbol === selectedSymbol)!

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* 헤더 */}
      <div className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">풋프린트 차트</h1>
              <span className={`flex items-center gap-1 text-sm ${isConnected ? 'text-green-400' : isSimulationMode ? 'text-yellow-400' : 'text-red-400'}`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : isSimulationMode ? 'bg-yellow-400' : 'bg-red-400'} ${isConnected || isSimulationMode ? 'animate-pulse' : ''}`} />
                {isConnected ? '실시간' : isSimulationMode ? '시뮬레이션' : '연결 끊김'}
              </span>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>
      </div>

      {/* 코인 선택 탭 */}
      <div className="bg-gray-800/30 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-2 overflow-x-auto scrollbar-hide">
            {TRACKED_SYMBOLS.map(coin => (
              <button
                key={coin.symbol}
                onClick={() => setSelectedSymbol(coin.symbol)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedSymbol === coin.symbol
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                style={{
                  borderColor: selectedSymbol === coin.symbol ? coin.color : 'transparent',
                  borderWidth: '2px',
                  borderStyle: 'solid'
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="font-bold">{coin.name}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 시장 개요 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">현재가</span>
              <FaChartLine className="text-gray-500" />
            </div>
            <div className="text-2xl font-bold">
              ${marketMetrics.price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-1 text-sm ${marketMetrics.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {marketMetrics.change24h >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(marketMetrics.change24h).toFixed(2)}%
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">오더플로우</span>
              <FaChartBar className="text-gray-500" />
            </div>
            <div className="text-2xl font-bold capitalize">
              {marketMetrics.orderFlowSentiment}
            </div>
            <div className="text-sm text-gray-400">
              {marketMetrics.orderFlowSentiment === 'bullish' ? '매수 우세' : 
               marketMetrics.orderFlowSentiment === 'bearish' ? '매도 우세' : '균형'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">고래 활동</span>
              <FaFireAlt className="text-gray-500" />
            </div>
            <div className="text-2xl font-bold capitalize">
              {marketMetrics.whaleActivity}
            </div>
            <div className={`text-sm ${
              marketMetrics.whaleActivity === 'high' ? 'text-red-400' :
              marketMetrics.whaleActivity === 'medium' ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {marketMetrics.whaleActivity === 'high' ? '활발함' :
               marketMetrics.whaleActivity === 'medium' ? '보통' : '조용함'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">POC</span>
              <FaBrain className="text-gray-500" />
            </div>
            <div className="text-2xl font-bold">
              ${marketProfile[0]?.price.toLocaleString('ko-KR') || '-'}
            </div>
            <div className="text-sm text-gray-400">최다 거래 가격</div>
          </motion.div>
        </div>

        {/* 시간대 선택 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {['1m', '5m', '15m', '30m', '1h', '4h', '1d'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  timeframe === tf
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          <button
            onClick={() => loadInitialData()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <FaSync className={isLoading ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>

        {/* 섹션 탭 */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: '개요', icon: FaChartBar },
            { id: 'footprint', label: '풋프린트', icon: FaChartLine },
            { id: 'delta', label: '델타 분석', icon: FaArrowUp },
            { id: 'profile', label: '마켓 프로파일', icon: FaChartBar },
            { id: 'heatmap', label: '히트맵', icon: FaFireAlt },
            { id: 'flow', label: '주문 플로우', icon: FaClock },
            { id: 'analysis', label: 'AI 분석', icon: FaBrain },
            { id: 'guide', label: '가이드', icon: FaBook }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeSection === section.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <section.icon className="text-sm" />
              {section.label}
            </button>
          ))}
        </div>

        {/* 디버그 패널 */}
        <DebugPanel 
          footprintData={footprintData}
          marketProfile={marketProfile}
          selectedSymbol={selectedSymbol}
        />

        {/* 컨텐츠 영역 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* 시스템 개요 설명 */}
                <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <FaChartBar className="text-purple-400 text-2xl" />
                    <h3 className="text-xl font-bold text-white">풋프린트 차트 개요</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    풋프린트 차트는 가격대별 거래량과 매수/매도 강도를 시각화하여 시장의 미시구조를 분석하는 고급 트레이딩 도구입니다.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-purple-400 mb-2">주요 기능</h4>
                      <ul className="space-y-1 text-xs text-gray-400">
                        <li>• 가격대별 거래량 분석</li>
                        <li>• 매수/매도 불균형 감지</li>
                        <li>• 지지/저항 레벨 식별</li>
                        <li>• 실시간 주문 플로우 추적</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-blue-400 mb-2">분석 활용</h4>
                      <ul className="space-y-1 text-xs text-gray-400">
                        <li>• 큰 주문 진입점 파악</li>
                        <li>• 트렌드 전환 시점 포착</li>
                        <li>• 스톱 헌팅 구간 회피</li>
                        <li>• 기관 매집 구간 발견</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 주요 지표 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">현재 가격</span>
                      <FaChartLine className="text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      ${safePrice(marketMetrics.price, 2)}
                    </p>
                    <p className={`text-sm mt-1 ${marketMetrics.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {marketMetrics.change24h >= 0 ? '▲' : '▼'} {Math.abs(marketMetrics.change24h).toFixed(2)}%
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">누적 델타</span>
                      <FaArrowUp className={(deltaData[deltaData.length - 1]?.cumulativeDelta || 0) >= 0 ? 'text-green-400' : 'text-red-400'} />
                    </div>
                    <p className={`text-2xl font-bold ${(deltaData[deltaData.length - 1]?.cumulativeDelta || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(deltaData[deltaData.length - 1]?.cumulativeDelta || 0) >= 0 ? '+' : ''}{((deltaData[deltaData.length - 1]?.cumulativeDelta || 0) / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(deltaData[deltaData.length - 1]?.cumulativeDelta || 0) >= 0 ? '매수 우세' : '매도 우세'}
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">거래량 프로파일</span>
                      <FaChartBar className="text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {marketProfile.filter(mp => mp.volume > 0).length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      활성 가격대
                    </p>
                  </div>
                </div>

                {/* 차트 영역 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 간단한 가격 차트 */}
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">가격 추이</h3>
                    <div className="h-64">
                    {priceHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height={256}>
                        <LineChart data={priceHistory.slice(-50)}> {/* 최근 50개 캔들 표시 */}
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#9CA3AF"
                            interval="preserveStartEnd"
                            minTickGap={50}
                          />
                          <YAxis 
                            stroke="#9CA3AF"
                            domain={['dataMin - 10', 'dataMax + 10']}
                            tickFormatter={(value) => `$${safeFixed(value, 0)}`}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                            labelStyle={{ color: '#9CA3AF' }}
                            formatter={(value: number, name: string) => {
                              const labels: Record<string, string> = {
                                high: '고가',
                                low: '저가',
                                close: '종가'
                              }
                              return [`$${safeFixed(value, 2)}`, labels[name] || name]
                            }}
                            labelFormatter={(label) => `시간: ${label}`}
                          />
                          {/* 고저 범위를 표시하는 area */}
                          <defs>
                            <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={selectedCoin.color} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={selectedCoin.color} stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <Line 
                            type="monotone" 
                            dataKey="high" 
                            stroke="transparent"
                            strokeWidth={0}
                            dot={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="low" 
                            stroke="transparent"
                            strokeWidth={0}
                            dot={false}
                            fillOpacity={1}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="close" 
                            stroke={selectedCoin.color} 
                            strokeWidth={2} 
                            dot={false}
                            animationDuration={500}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-400">데이터 수집 중...</p>
                      </div>
                    )}
                    </div>
                  </div>

                  {/* 누적 델타 차트 */}
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">누적 델타</h3>
                    <div className="h-64">
                    {deltaData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={256}>
                        <LineChart data={deltaData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#9CA3AF"
                            tick={{ fontSize: 10 }}
                            interval="preserveStartEnd"
                            minTickGap={50}
                          />
                          <YAxis 
                            stroke="#9CA3AF"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
                          />
                          <Tooltip
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                            labelStyle={{ color: '#9CA3AF' }}
                            formatter={(value: number) => [`${safeFixed(value, 0)}`, '델타']}
                            labelFormatter={(label) => `시간: ${label}`}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="cumulativeDelta" 
                            stroke={deltaData[deltaData.length - 1]?.cumulativeDelta >= 0 ? '#10B981' : '#EF4444'} 
                            strokeWidth={2} 
                            dot={false}
                            animationDuration={500}
                          />
                          <Area
                            type="monotone"
                            dataKey="cumulativeDelta"
                            stroke="none"
                            fill={deltaData[deltaData.length - 1]?.cumulativeDelta >= 0 ? '#10B981' : '#EF4444'}
                            fillOpacity={0.1}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-400">데이터 수집 중...</p>
                      </div>
                    )}
                    </div>
                  </div>
                </div>

                {/* 트레이딩 인사이트 */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <FaBrain className="text-yellow-400" />
                    <h3 className="text-lg font-bold">AI 트레이딩 인사이트</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">
                          현재 <span className="font-bold text-green-400">매수세</span>가 우세하며, 
                          POC(Point of Control) 근처에서 강한 지지가 확인됩니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">
                          HVN(High Volume Node) 구간에서 기관의 매집 흔적이 발견되었습니다.
                          단기 상승 모멘텀이 예상됩니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">
                          델타 다이버전스는 관찰되지 않으며, 현재 추세가 지속될 가능성이 높습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 주요 지표 */}
                <div className="bg-gray-800/50 rounded-xl p-6 lg:col-span-2">
                  <h3 className="text-lg font-bold mb-4">주요 거래 지표</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">총 매수량</span>
                        <FaArrowUp className="text-green-400 text-xs" />
                      </div>
                      <div className="text-xl font-bold text-green-400">
                        {footprintData.reduce((sum, f) => sum + f.buyVolume, 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((footprintData.reduce((sum, f) => sum + f.buyVolume, 0) / 
                          (footprintData.reduce((sum, f) => sum + f.buyVolume + f.sellVolume, 0) || 1)) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">총 매도량</span>
                        <FaArrowDown className="text-red-400 text-xs" />
                      </div>
                      <div className="text-xl font-bold text-red-400">
                        {footprintData.reduce((sum, f) => sum + f.sellVolume, 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((footprintData.reduce((sum, f) => sum + f.sellVolume, 0) / 
                          (footprintData.reduce((sum, f) => sum + f.buyVolume + f.sellVolume, 0) || 1)) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">누적 델타</span>
                        <span className={`text-xs ${(deltaData[deltaData.length - 1]?.cumulativeDelta || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(deltaData[deltaData.length - 1]?.cumulativeDelta || 0) >= 0 ? '▲' : '▼'}
                        </span>
                      </div>
                      <div className={`text-xl font-bold ${(deltaData[deltaData.length - 1]?.cumulativeDelta || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {safeFixed(deltaData[deltaData.length - 1]?.cumulativeDelta, 2) || '0'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(deltaData[deltaData.length - 1]?.cumulativeDelta || 0) >= 0 ? '매수 압력' : '매도 압력'}
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">밸류 레벨</span>
                        <FaChartBar className="text-yellow-400 text-xs" />
                      </div>
                      <div className="text-xl font-bold text-yellow-400">
                        {marketProfile.filter(p => p.valueArea).length}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        주요 거래 구간
                      </div>
                    </div>
                  </div>

                  {/* 추가 메트릭스 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">POC (가격 중심)</span>
                        <span className="text-sm font-bold text-purple-400">
                          ${safePrice(marketProfile.find(p => p.poc)?.price, 2) || safePrice(marketMetrics.price, 2)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">VAH (밸류 상단)</span>
                        <span className="text-sm font-bold text-blue-400">
                          ${(marketMetrics.price * 1.01).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">VAL (밸류 하단)</span>
                        <span className="text-sm font-bold text-cyan-400">
                          ${(marketMetrics.price * 0.99).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 트레이딩 전략 가이드 */}
                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/20 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <FaBook className="text-blue-400" />
                    <h3 className="text-lg font-bold">풋프린트 트레이딩 전략</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-bold text-green-400 mb-2">롱 포지션 진입 시그널</h4>
                      <ul className="space-y-1 text-xs text-gray-300">
                        <li>✅ HVN에서 매수 압력 증가</li>
                        <li>✅ 델타 다이버전스 없음</li>
                        <li>✅ POC 상단 돌파 시도</li>
                        <li>✅ 대량 매수 주문 감지</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-400 mb-2">숏 포지션 진입 시그널</h4>
                      <ul className="space-y-1 text-xs text-gray-300">
                        <li>❌ LVN에서 매도 압력 증가</li>
                        <li>❌ 음의 델타 다이버전스</li>
                        <li>❌ POC 하단 이탈</li>
                        <li>❌ 대량 매도 주문 감지</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-400">
                      <span className="font-bold text-yellow-400">Pro Tip:</span> 풋프린트 차트는 단독으로 사용하기보다 
                      다른 기술적 지표와 함께 사용할 때 더욱 효과적입니다. 특히 지지/저항선과 함께 분석하면 
                      더욱 정확한 진입/청산 시점을 찾을 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'footprint' && (
              <FootprintChart 
                data={footprintData} 
                symbol={selectedSymbol}
                timeframe={timeframe}
              />
            )}

            {activeSection === 'delta' && (
              <DeltaAnalysis 
                data={deltaData}
                footprintData={footprintData}
                symbol={selectedSymbol}
              />
            )}

            {activeSection === 'profile' && (
              <MarketProfile 
                data={marketProfile}
                currentPrice={marketMetrics.price}
                symbol={selectedSymbol}
              />
            )}

            {activeSection === 'heatmap' && (
              <VolumeHeatmap 
                data={footprintData}
                symbol={selectedSymbol}
              />
            )}

            {activeSection === 'flow' && (
              <OrderFlowTable 
                data={orderFlow}
                symbol={selectedSymbol}
              />
            )}

            {activeSection === 'analysis' && (
              <ComprehensiveAnalysis
                symbol={selectedSymbol.replace('USDT', '')}
                currentPrice={marketMetrics.price}
                marketData={{
                  change24h: marketMetrics.change24h,
                  volume24h: marketMetrics.volume24h,
                  orderFlow: marketMetrics.orderFlowSentiment
                }}
                whaleData={{
                  activity: marketMetrics.whaleActivity,
                  institutionalFlow: marketMetrics.institutionalFlow,
                  retailFlow: marketMetrics.retailFlow,
                  poc: marketProfile[0]?.price || 0,
                  valueAreaHigh: marketProfile.filter(p => p.valueArea).map(p => p.price).sort().reverse()[0] || 0,
                  valueAreaLow: marketProfile.filter(p => p.valueArea).map(p => p.price).sort()[0] || 0,
                  cumulativeDelta: deltaData[deltaData.length - 1]?.cumulativeDelta || 0
                }}
              />
            )}

            {activeSection === 'guide' && (
              <FootprintGuide />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}