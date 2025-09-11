'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// 컴포넌트 동적 임포트 - 개별 named export 사용
const CoinSelector = dynamic(
  () => import('./components/index').then(mod => ({ default: mod.CoinSelector })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-32" />
  }
)

const ConceptGuide = dynamic(
  () => import('./components/index').then(mod => ({ default: mod.ConceptGuide })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-64" />
  }
)

const SweepHeatmap = dynamic(
  () => import('./components/index').then(mod => ({ default: mod.SweepHeatmap })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
  }
)

const LiquiditySweptChart = dynamic(
  () => import('./components/index').then(mod => ({ default: mod.LiquiditySweptChart })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
  }
)

const SweepVolumeAnalysis = dynamic(
  () => import('./components/index').then(mod => ({ default: mod.SweepVolumeAnalysis })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
  }
)

const PriceImpactChart = dynamic(
  () => import('./components/index').then(mod => ({ default: mod.PriceImpactChart })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
  }
)

const SweepPatternDetector = dynamic(
  () => import('./components/index').then(mod => ({ default: mod.SweepPatternDetector })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
  }
)

const HistoricalSweeps = dynamic(
  () => import('./components/index').then(mod => ({ default: mod.HistoricalSweeps })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
  }
)

const TradingStrategy = dynamic(
  () => import('./components/index').then(mod => ({ default: mod.TradingStrategy })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
  }
)

const RiskAlert = dynamic(
  () => import('./components/index').then(mod => ({ default: mod.RiskAlert })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-64" />
  }
)

const RealtimeMonitor = dynamic(
  () => import('./components/index').then(mod => ({ default: mod.RealtimeMonitor })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
  }
)

// 지원하는 코인 목록
const SUPPORTED_COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: '🔸' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
  { symbol: 'XRPUSDT', name: 'XRP', icon: '✕' },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: '🔺' },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: '⬡' },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: '●' }
]

// 스윕 데이터 타입
interface SweepData {
  timestamp: number
  price: number
  volume: number
  type: 'aggressive' | 'stealth' | 'ladder' | 'iceberg'
  impact: number
  direction: 'buy' | 'sell'
}

// 오더북 데이터 타입
interface OrderBookData {
  bids: Array<[number, number]>
  asks: Array<[number, number]>
  lastUpdateId: number
}

export default function SweepDetectionModule() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [sweepData, setSweepData] = useState<SweepData[]>([])
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [isConnected, setIsConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)

  // WebSocket 연결 함수
  const connectWebSocket = useCallback((symbol: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close()
    }

    const streams = [
      `${symbol.toLowerCase()}@depth20@100ms`,
      `${symbol.toLowerCase()}@trade`,
      `${symbol.toLowerCase()}@ticker`
    ]
    
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`
    
    try {
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        console.log('WebSocket 연결 성공:', symbol)
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.stream?.includes('depth20')) {
            handleOrderBookUpdate(data.data)
          } else if (data.stream?.includes('trade')) {
            handleTradeUpdate(data.data)
          } else if (data.stream?.includes('ticker')) {
            handleTickerUpdate(data.data)
          }
        } catch (error) {
          console.error('메시지 파싱 에러:', error)
        }
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket 에러:', error)
        setIsConnected(false)
      }
      
      wsRef.current.onclose = () => {
        console.log('WebSocket 연결 종료')
        setIsConnected(false)
        handleReconnect(symbol)
      }
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      setIsConnected(false)
    }
  }, [])

  // 재연결 처리
  const handleReconnect = useCallback((symbol: string) => {
    if (reconnectAttemptsRef.current < 5) {
      reconnectAttemptsRef.current++
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
      
      console.log(`재연결 시도 ${reconnectAttemptsRef.current}/5, ${delay}ms 후 재시도`)
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket(symbol)
      }, delay)
    }
  }, [connectWebSocket])

  // 오더북 업데이트 처리
  const handleOrderBookUpdate = (data: any) => {
    setOrderBook({
      bids: data.bids.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
      asks: data.asks.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
      lastUpdateId: data.lastUpdateId
    })
  }

  // 거래 업데이트 처리 (스윕 감지)
  const handleTradeUpdate = (data: any) => {
    const volume = parseFloat(data.q)
    const price = parseFloat(data.p)
    
    // 대규모 거래 감지 (스윕 가능성)
    const thresholds = {
      'BTCUSDT': 1,
      'ETHUSDT': 10,
      'BNBUSDT': 20,
      'SOLUSDT': 100,
      'XRPUSDT': 10000,
      'ADAUSDT': 10000,
      'DOGEUSDT': 100000,
      'AVAXUSDT': 100,
      'MATICUSDT': 10000,
      'DOTUSDT': 100
    }
    
    const threshold = thresholds[selectedCoin as keyof typeof thresholds] || 100
    
    if (volume >= threshold) {
      const newSweep: SweepData = {
        timestamp: data.T,
        price,
        volume,
        type: detectSweepType(volume, threshold),
        impact: calculatePriceImpact(volume, price),
        direction: data.m ? 'sell' : 'buy'
      }
      
      setSweepData(prev => [...prev.slice(-99), newSweep])
    }
  }

  // 티커 업데이트 처리
  const handleTickerUpdate = (data: any) => {
    setCurrentPrice(parseFloat(data.c))
  }

  // 스윕 타입 감지
  const detectSweepType = (volume: number, threshold: number): SweepData['type'] => {
    const ratio = volume / threshold
    
    if (ratio >= 10) return 'aggressive'
    if (ratio >= 5) return 'ladder'
    if (ratio >= 2) return 'iceberg'
    return 'stealth'
  }

  // 가격 영향 계산
  const calculatePriceImpact = (volume: number, price: number): number => {
    // 실제 구현에서는 오더북 깊이를 고려한 정교한 계산 필요
    return Math.min((volume * 0.0001), 5)
  }

  // 코인 변경 처리
  const handleCoinChange = (coin: string) => {
    setSelectedCoin(coin)
    setSweepData([])
    setOrderBook(null)
  }

  // WebSocket 연결 관리
  useEffect(() => {
    connectWebSocket(selectedCoin)
    
    return () => {
      clearTimeout(reconnectTimeoutRef.current)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [selectedCoin, connectWebSocket])

  // 탭 메뉴
  const tabs = [
    { id: 'overview', label: '개요', icon: '📊' },
    { id: 'realtime', label: '실시간', icon: '⚡' },
    { id: 'patterns', label: '패턴 분석', icon: '🔍' },
    { id: 'history', label: '과거 기록', icon: '📈' },
    { id: 'strategy', label: '전략', icon: '🎯' }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 헤더 */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Link href="/" className="hover:text-white">홈</Link>
                <span>/</span>
                <Link href="/microstructure" className="hover:text-white">시장 미시구조</Link>
                <span>/</span>
                <span className="text-white">스윕 감지</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                🌊 스윕 감지 (Sweep Detection)
              </h1>
            </div>
            
            {/* 연결 상태 */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-sm text-gray-400">
                {isConnected ? '실시간 연결됨' : '연결 중...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 코인 선택기 */}
      <div className="container mx-auto px-4 py-6">
        <CoinSelector
          coins={SUPPORTED_COINS}
          selectedCoin={selectedCoin}
          onCoinChange={handleCoinChange}
        />
      </div>

      {/* 탭 메뉴 */}
      <div className="container mx-auto px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 pb-20">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <ConceptGuide />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SweepHeatmap orderBook={orderBook} currentPrice={currentPrice} />
              <LiquiditySweptChart sweepData={sweepData} />
            </div>
            <SweepVolumeAnalysis sweepData={sweepData} selectedCoin={selectedCoin} />
            <PriceImpactChart sweepData={sweepData} currentPrice={currentPrice} />
          </div>
        )}

        {activeTab === 'realtime' && (
          <div className="space-y-6">
            <RealtimeMonitor 
              sweepData={sweepData} 
              orderBook={orderBook}
              currentPrice={currentPrice}
              selectedCoin={selectedCoin}
            />
            <RiskAlert sweepData={sweepData} currentPrice={currentPrice} />
          </div>
        )}

        {activeTab === 'patterns' && (
          <SweepPatternDetector 
            sweepData={sweepData} 
            selectedCoin={selectedCoin}
          />
        )}

        {activeTab === 'history' && (
          <HistoricalSweeps 
            selectedCoin={selectedCoin}
          />
        )}

        {activeTab === 'strategy' && (
          <TradingStrategy 
            sweepData={sweepData}
            orderBook={orderBook}
            currentPrice={currentPrice}
            selectedCoin={selectedCoin}
          />
        )}
      </div>
    </div>
  )
}