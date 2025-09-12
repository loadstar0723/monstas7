'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRealtimePrice, useMultipleRealtimePrices, fetchKlines, fetchOrderBook, fetch24hrTicker } from '@/lib/hooks/useRealtimePrice'
import { dataService } from '@/lib/services/finalDataService'
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
    const timeKey = `${time.getHours().toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    
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
    console.log('[시뮬레이션] 모드 시작 - 과거 거래 데이터 로드')
    setIsSimulationMode(true)
    
    // 기존 시뮬레이션 정리
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current)
    }
    
    try {
      // Binance API에서 최근 거래 데이터 가져오기
      const response = await fetch(`/api/binance/trades?symbol=${selectedSymbol}&limit=100`)
      if (!response.ok) {
        console.error('거래 데이터 로드 실패')
        return
      }
      
      const trades = await response.json()
      if (!trades || trades.length === 0) {
        console.error('거래 데이터 없음')
        return
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
      
    } catch (error) {
      console.error('시뮬레이션 모드 시작 실패:', error)
      setIsSimulationMode(false)
    }
  }, [selectedSymbol, processTradeData])

  // SSE 연결 (WebSocket 대체)
  const connectSSE = useCallback(() => {
    // 기존 SSE 연결 정리
    if (sseRef.current) {
      console.log('[SSE] 기존 연결 종료')
      sseRef.current.close()
      sseRef.current = null
    }

    try {
      const symbol = selectedSymbol.toLowerCase()
      const sseUrl = `/api/binance/websocket?stream=${symbol}@aggTrade`
      console.log(`[SSE] 연결 시도: ${sseUrl}`)
      
      sseRef.current = new EventSource(sseUrl)
      
      sseRef.current.onopen = () => {
        console.log('[SSE] 연결 성공:', selectedSymbol)
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
      }
      
      sseRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'connected') {
            console.log('[SSE] 스트림 연결됨:', data.stream)
          } else {
            processTradeData(data)
          }
        } catch (error) {
          console.error('[SSE] 메시지 처리 오류:', error)
        }
      }
      
      sseRef.current.onerror = (error) => {
        console.warn('[SSE] 연결 오류 - 시뮬레이션 모드로 전환')
        setIsConnected(false)
        
        if (reconnectAttemptsRef.current === 0) {
          console.log('[SSE] 연결 실패 - 시뮬레이션 모드 활성화')
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
        console.log('[WebSocket] 기존 연결 종료')
        wsRef.current.close(1000)
        wsRef.current = null
      }
    }

    try {
      const symbol = selectedSymbol.toLowerCase()
      const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@aggTrade`
      console.log(`[WebSocket] 연결 시도: ${wsUrl}`)