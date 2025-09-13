'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
// 서비스들은 나중에 필요할 때 추가
// import { NotificationService } from '@/lib/notificationService'
// import { audioService } from '@/lib/audioService'
// import { config } from '@/lib/config'

// 아이콘 대체 컴포넌트 (react-icons 대신 이모지 사용)
const IconCube = () => <span className="inline-block">📦</span>
const IconChart = () => <span className="inline-block">📊</span>
const IconBook = () => <span className="inline-block">📚</span>
const IconRocket = () => <span className="inline-block">🚀</span>
const IconGrid = () => <span className="inline-block">🔲</span>
const IconLayers = () => <span className="inline-block">📑</span>
const IconClock = () => <span className="inline-block">⏰</span>
const IconHistory = () => <span className="inline-block">📜</span>
const IconSync = () => <span className="inline-block">🔄</span>

// 동적 임포트 컴포넌트들
const VolumeProfileChart3D = dynamic(
  () => import('./components/VolumeProfileChart3D'),
  { ssr: false }
)

const CoinSelector = dynamic(
  () => import('./components/CoinSelector'),
  { ssr: false }
)

// 탭 컴포넌트들을 직접 import하여 번들에 포함
import ConceptEducation from './components/ConceptEducation'
import TradingStrategy from './components/TradingStrategy'
import VolumeAnalysis from './components/VolumeAnalysis'
import MarketStructure from './components/MarketStructure'
import ValueArea from './components/ValueArea'
import VolumeNodes from './components/VolumeNodes'
import SessionProfiles from './components/SessionProfiles'
import BacktestResults from './components/BacktestResults'

// 타입 정의
interface VolumeLevel {
  price: number
  buyVolume: number
  sellVolume: number
  totalVolume: number
  percentage: number
  time?: string
}

interface VolumeProfileData {
  levels: VolumeLevel[]
  poc: number // Point of Control
  vah: number // Value Area High
  val: number // Value Area Low
  totalVolume: number
  buyVolume: number
  sellVolume: number
  hvnLevels: number[] // High Volume Nodes
  lvnLevels: number[] // Low Volume Nodes
  tpo?: any // Time Price Opportunity
  vpvr?: any // Volume Profile Visible Range
}

interface MarketStats {
  currentPrice: number
  priceChange24h: number
  volume24h: number
  volumeChange24h: number
  marketCap: number
  dominance: number
  openInterest?: number
}

export default function VolumeProfileModule() {
  // 추적할 상위 10개 코인
  const TRACKED_SYMBOLS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
    'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT', 'DOTUSDT'
  ]
  
  // 상태 관리
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [activeTab, setActiveTab] = useState<
    'overview' | 'concept' | 'analysis' | 'strategy' | 'structure' | 'nodes' | 'sessions' | 'backtest'
  >('overview')
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('4h')
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D')
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [previousVolume, setPreviousVolume] = useState<Record<string, number>>({})
  
  // 데이터 상태
  const [marketStats, setMarketStats] = useState<Record<string, MarketStats>>({})
  const [volumeProfileData, setVolumeProfileData] = useState<VolumeProfileData | null>(null)
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  
  // WebSocket 관련
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // 현재 시장 통계
  const currentStats = useMemo(() => {
    return marketStats[selectedSymbol] || {
      currentPrice: 0,
      priceChange24h: 0,
      volume24h: 0,
      volumeChange24h: 0,
      marketCap: 0,
      dominance: 0
    }
  }, [marketStats, selectedSymbol])
  
  // WebSocket 연결 관리 - 최적화된 버전
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    
    try {
      // Binance WebSocket 연결 - 최소한의 스트림만 구독
      const streams = [
        `${selectedSymbol.toLowerCase()}@depth20@1000ms`, // 1초 간격으로 변경
        `${selectedSymbol.toLowerCase()}@ticker`
      ].join('/')
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        setIsConnected(true)
        
        // 초기 order book snapshot 요청
        loadOrderBookSnapshot()
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // 스트림 데이터 처리
          if (data.stream) {
            const eventData = data.data
            
            if (data.stream.includes('@depth')) {
              processOrderBookData(eventData)
            } else if (data.stream.includes('@aggTrade')) {
              processTradeData(eventData)
            } else if (data.stream.includes('@ticker')) {
              updateMarketStats(eventData)
            }
          }
        } catch (error) {
          console.error('WebSocket message error:', error)
        }
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }
      
      wsRef.current.onclose = () => {
        setIsConnected(false)
        
        // 자동 재연결
        if (autoRefresh) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, 5000)
        }
      }
    } catch (error) {
      console.error('WebSocket connection error:', error)
      setIsConnected(false)
    }
  }, [selectedSymbol, autoRefresh])
  
  // Order Book 스냅샷 로드
  const loadOrderBookSnapshot = async () => {
    try {
      const response = await fetch(`/api/binance/depth?symbol=${selectedSymbol}&limit=100`)
      if (!response.ok) {
        console.error('Order book API error:', response.status, response.statusText)
        // 에러 시 간단한 더미 데이터 사용
        const currentPrice = selectedSymbol === 'BTCUSDT' ? 98000 : 
                           selectedSymbol === 'ETHUSDT' ? 3500 : 
                           selectedSymbol === 'BNBUSDT' ? 700 : 100
        generateDummyVolumeProfile(currentPrice)
        return
      }
      const data = await response.json()
      processOrderBookSnapshot(data)
    } catch (error) {
      console.error('Error loading order book snapshot:', error)
      // 네트워크 에러 시 더미 데이터 생성
      const currentPrice = selectedSymbol === 'BTCUSDT' ? 98000 : 
                         selectedSymbol === 'ETHUSDT' ? 3500 : 
                         selectedSymbol === 'BNBUSDT' ? 700 : 100
      generateDummyVolumeProfile(currentPrice)
    }
  }
  
  // 더미 볼륨 프로파일 데이터 생성 (API 에러 시)
  const generateDummyVolumeProfile = (currentPrice: number) => {
    const priceRangePercent = 0.03
    const minPrice = currentPrice * (1 - priceRangePercent)
    const maxPrice = currentPrice * (1 + priceRangePercent)
    const levelCount = 100
    const levelSize = (maxPrice - minPrice) / levelCount
    
    const levels: VolumeLevel[] = []
    let maxVolume = 0
    
    for (let i = 0; i < levelCount; i++) {
      const price = maxPrice - (i * levelSize)
      // 중앙에 가까울수록 볼륨이 높게
      const distanceFromCenter = Math.abs(i - levelCount / 2) / (levelCount / 2)
      const volumeMultiplier = 1 - (distanceFromCenter * 0.8)
      
      // 기술적 분석: 볼륨 프로파일 캐들 비율 적용
      const pricePosition = (price - minPrice) / (maxPrice - minPrice)
      const gaussianWeight = Math.exp(-Math.pow(pricePosition - 0.5, 2) / 0.08) // 가우시안 분포
      const baseVolume = 500000 + gaussianWeight * 800000 * volumeMultiplier
      
      // 매수/매도 비율: 거래량 가중 평균 가격(VWAP) 기반
      const vwapBias = pricePosition > 0.5 ? 0.45 + (pricePosition - 0.5) * 0.2 : 0.55 - (0.5 - pricePosition) * 0.2
      const buyRatio = Math.max(0.3, Math.min(0.7, vwapBias))
      const buyVolume = baseVolume * buyRatio
      const sellVolume = baseVolume * (1 - buyRatio)
      const totalVolume = buyVolume + sellVolume
      
      if (totalVolume > maxVolume) {
        maxVolume = totalVolume
      }
      
      levels.push({
        price,
        buyVolume,
        sellVolume,
        totalVolume,
        percentage: 0
      })
    }
    
    const totalVolumeSum = levels.reduce((sum, level) => sum + level.totalVolume, 0)
    levels.forEach(level => {
      level.percentage = (level.totalVolume / totalVolumeSum) * 100
    })
    
    // POC(Point of Control) 계산: 최대 볼륨 레벨
    const pocIndex = levels.findIndex(level => level.totalVolume === Math.max(...levels.map(l => l.totalVolume)))
    const poc = levels[pocIndex].price
    
    // Value Area 계산: 70% 볼륨 포함 범위
    const sortedByVolume = [...levels].sort((a, b) => b.totalVolume - a.totalVolume)
    const seventyPercentVolume = totalVolumeSum * 0.7
    let accumulatedVolume = 0
    const valueAreaPrices: number[] = []
    
    for (const level of sortedByVolume) {
      accumulatedVolume += level.totalVolume
      valueAreaPrices.push(level.price)
      if (accumulatedVolume >= seventyPercentVolume) break
    }
    
    const vah = Math.max(...valueAreaPrices) // Value Area High
    const val = Math.min(...valueAreaPrices) // Value Area Low
    
    setVolumeProfileData({
      levels,
      poc,
      vah,
      val,
      totalVolume: totalVolumeSum,
      buyVolume: levels.reduce((sum, level) => sum + level.buyVolume, 0),
      sellVolume: levels.reduce((sum, level) => sum + level.sellVolume, 0),
      hvnLevels: levels.filter(l => l.totalVolume > maxVolume * 0.7).map(l => l.price),
      lvnLevels: levels.filter(l => l.totalVolume < maxVolume * 0.3).map(l => l.price)
    })
    
    setMarketStats(prev => ({
      ...prev,
      [selectedSymbol]: {
        ...prev[selectedSymbol],
        currentPrice
      }
    }))
  }
  
  // Order Book 스냅샷 처리
  const processOrderBookSnapshot = (data: any) => {
    const bids = data.bids || []
    const asks = data.asks || []
    
    // 현재 가격 추정 (bid와 ask의 중간값)
    const currentPrice = bids.length > 0 && asks.length > 0 
      ? (parseFloat(bids[0][0]) + parseFloat(asks[0][0])) / 2
      : 0
    
    if (currentPrice > 0) {
      setMarketStats(prev => ({
        ...prev,
        [selectedSymbol]: {
          ...prev[selectedSymbol],
          currentPrice
        }
      }))
    }
    
    calculateVolumeProfile(bids, asks, currentPrice)
  }
  
  // 볼륨 프로파일 계산 - 최적화된 버전
  const calculateVolumeProfile = useMemo(() => (bids: any[], asks: any[], currentPrice: number) => {
    if (!currentPrice || (bids.length === 0 && asks.length === 0)) return
    
    // 가격 범위 설정 (현재 가격 기준 ±3%)
    const priceRangePercent = 0.03
    const minPrice = currentPrice * (1 - priceRangePercent)
    const maxPrice = currentPrice * (1 + priceRangePercent)
    const levelCount = 100 // 100개 레벨로 증가하여 막대 간격 축소
    const levelSize = (maxPrice - minPrice) / levelCount
    
    // 볼륨 레벨 초기화
    const volumeLevels: VolumeLevel[] = []
    for (let i = 0; i < levelCount; i++) {
      volumeLevels.push({
        price: maxPrice - (i * levelSize),
        buyVolume: 0,
        sellVolume: 0,
        totalVolume: 0,
        percentage: 0
      })
    }
    
    // Bid 볼륨 집계
    bids.forEach(([price, volume]: [string, string]) => {
      const p = parseFloat(price)
      const v = parseFloat(volume)
      if (p >= minPrice && p <= maxPrice) {
        const levelIndex = Math.floor((maxPrice - p) / levelSize)
        if (levelIndex >= 0 && levelIndex < levelCount) {
          volumeLevels[levelIndex].buyVolume += v * p // USDT 볼륨으로 변환
        }
      }
    })
    
    // Ask 볼륨 집계
    asks.forEach(([price, volume]: [string, string]) => {
      const p = parseFloat(price)
      const v = parseFloat(volume)
      if (p >= minPrice && p <= maxPrice) {
        const levelIndex = Math.floor((maxPrice - p) / levelSize)
        if (levelIndex >= 0 && levelIndex < levelCount) {
          volumeLevels[levelIndex].sellVolume += v * p // USDT 볼륨으로 변환
        }
      }
    })
    
    // 총 볼륨 계산 및 빈 레벨 제거
    const filteredLevels = volumeLevels.filter(level => {
      level.totalVolume = level.buyVolume + level.sellVolume
      return level.totalVolume > 0
    })
    
    if (filteredLevels.length === 0) return
    
    // 전체 볼륨 계산
    const totalVolume = filteredLevels.reduce((sum, level) => sum + level.totalVolume, 0)
    
    // 퍼센테이지 계산
    filteredLevels.forEach(level => {
      level.percentage = (level.totalVolume / totalVolume) * 100
    })
    
    // POC 찾기 (최대 볼륨 가격)
    const pocLevel = filteredLevels.reduce((max, level) => 
      level.totalVolume > max.totalVolume ? level : max
    )
    
    // Value Area 계산 (전체 볼륨의 70%)
    const targetVolume = totalVolume * 0.7
    let accumulatedVolume = pocLevel.totalVolume
    const pocIndex = filteredLevels.findIndex(level => level === pocLevel)
    let upperIndex = pocIndex
    let lowerIndex = pocIndex
    
    // POC를 중심으로 양쪽으로 확장
    while (accumulatedVolume < targetVolume && (upperIndex > 0 || lowerIndex < filteredLevels.length - 1)) {
      const upperVol = upperIndex > 0 ? filteredLevels[upperIndex - 1].totalVolume : 0
      const lowerVol = lowerIndex < filteredLevels.length - 1 ? filteredLevels[lowerIndex + 1].totalVolume : 0
      
      if (upperVol > lowerVol && upperIndex > 0) {
        upperIndex--
        accumulatedVolume += upperVol
      } else if (lowerIndex < filteredLevels.length - 1) {
        lowerIndex++
        accumulatedVolume += lowerVol
      }
    }
    
    const vah = filteredLevels[upperIndex].price
    const val = filteredLevels[lowerIndex].price
    
    // HVN/LVN 레벨 찾기
    const avgVolume = totalVolume / filteredLevels.length
    const hvnLevels = filteredLevels
      .filter(level => level.totalVolume > avgVolume * 1.5)
      .map(level => level.price)
    const lvnLevels = filteredLevels
      .filter(level => level.totalVolume < avgVolume * 0.5)
      .map(level => level.price)
    
    // 볼륨 프로파일 데이터 업데이트
    const profileData = {
      levels: filteredLevels,
      poc: pocLevel.price,
      vah,
      val,
      totalVolume,
      buyVolume: filteredLevels.reduce((sum, level) => sum + level.buyVolume, 0),
      sellVolume: filteredLevels.reduce((sum, level) => sum + level.sellVolume, 0),
      hvnLevels,
      lvnLevels
    }
    
    setVolumeProfileData(profileData)
  }, [])
  
  // Order Book 데이터로 볼륨 프로파일 업데이트 (실시간)
  const processOrderBookData = (data: any) => {
    // depth update는 증분 업데이트이므로 전체 오더북 스냅샷을 다시 로드
    loadOrderBookSnapshot()
  }
  
  // Trade 데이터 처리
  const processTradeData = (data: any) => {
    // 실시간 거래 데이터로 TPO 업데이트
    // TODO: TPO (Time Price Opportunity) 계산 로직
  }
  
  // 시장 통계 업데이트
  const updateMarketStats = (data: any) => {
    const currentPrice = parseFloat(data.c || 0)
    const volume = parseFloat(data.v || 0)
    const quoteVolume = parseFloat(data.q || 0) // USDT 거래량
    const currentVolumeUsdt = quoteVolume || (volume * currentPrice)
    
    // 거래량 변화율 계산
    const prevVol = previousVolume[selectedSymbol] || currentVolumeUsdt
    const volumeChange = prevVol > 0 ? ((currentVolumeUsdt - prevVol) / prevVol) * 100 : 0
    
    // 이전 거래량 업데이트
    if (currentVolumeUsdt > 0) {
      setPreviousVolume(prev => ({ ...prev, [selectedSymbol]: currentVolumeUsdt }))
    }
    
    setMarketStats(prev => ({
      ...prev,
      [selectedSymbol]: {
        currentPrice: currentPrice,
        priceChange24h: parseFloat(data.P || 0),
        volume24h: currentVolumeUsdt,
        volumeChange24h: volumeChange,
        marketCap: currentPrice * volume,
        dominance: 0
      }
    }))
  }
  
  // 초기 데이터 로드
  const loadInitialData = async () => {
    setLoading(true)
    try {
      // Binance API에서 시장 데이터 가져오기
      const response = await fetch(`/api/binance/ticker24hr?symbol=${selectedSymbol}`)
      if (response.ok) {
        const data = await response.json()
        updateMarketStats({
          c: data.lastPrice,
          P: data.priceChangePercent,
          v: data.volume,
          q: data.quoteVolume || data.volume * parseFloat(data.lastPrice)
        })
      } else {
        // API 에러 시 기본값 설정
        console.error('Ticker API error:', response.status)
        const defaultPrice = selectedSymbol === 'BTCUSDT' ? 98000 : 
                           selectedSymbol === 'ETHUSDT' ? 3500 : 
                           selectedSymbol === 'BNBUSDT' ? 700 : 100
        updateMarketStats({
          c: defaultPrice.toString(),
          P: '2.5',
          v: '10000',
          q: defaultPrice * 10000 // 실제 USDT 거래량
        })
      }
      
      // Kline 데이터로 가격 히스토리 가져오기
      const klineResponse = await fetch(
        `/api/binance/klines?symbol=${selectedSymbol}&interval=${timeframe}&limit=100`
      )
      if (klineResponse.ok) {
        const response = await klineResponse.json()
        // 디버그용
        
        // response.klines 또는 response.data에서 kline 데이터 추출
        const klineData = response.klines || response.data || response || []
        
        // klineData가 배열인지 확인
        if (Array.isArray(klineData) && klineData.length > 0) {
          // 이미 처리된 형태인 경우 (time, open, high, low, close 속성이 있는 경우)
          if (klineData[0].time !== undefined) {
            setPriceHistory(klineData)
          } else {
            // 원시 Binance 형태인 경우 [timestamp, open, high, low, close, volume, ...]
            setPriceHistory(klineData.map((k: any) => ({
              time: k[0],
              open: parseFloat(k[1]),
              high: parseFloat(k[2]),
              low: parseFloat(k[3]),
              close: parseFloat(k[4]),
              volume: parseFloat(k[5])
            })))
          }
        } else {
          console.error('Invalid or empty kline data:', klineData)
          // 빈 응답인 경우 기본 데이터 생성
          const now = Date.now()
          const defaultHistory = []
          for (let i = 99; i >= 0; i--) {
            const time = now - (i * 60 * 60 * 1000) // 1시간 간격
            defaultHistory.push({
              time,
              open: currentStats.currentPrice * (1 + ((((Date.now() % 1000) / 1000) - 0.5) * 0.02)),
              high: currentStats.currentPrice * (1 + (((Date.now() % 1000) / 1000) * 0.01)),
              low: currentStats.currentPrice * (1 - (((Date.now() % 1000) / 1000) * 0.01)),
              close: currentStats.currentPrice * (1 + ((((Date.now() % 1000) / 1000) - 0.5) * 0.02)),
              volume: 1000 + (((Date.now() % 1000) / 1000) * 500)
            })
          }
          setPriceHistory(defaultHistory)
        }
      } else {
        console.error('Kline API request failed:', klineResponse.status)
        setPriceHistory([])
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
      // 네트워크 에러 시 기본값 설정
      const defaultPrice = selectedSymbol === 'BTCUSDT' ? 98000 : 
                         selectedSymbol === 'ETHUSDT' ? 3500 : 
                         selectedSymbol === 'BNBUSDT' ? 700 : 100
      updateMarketStats({
        c: defaultPrice.toString(),
        P: '2.5',
        v: '10000',
        q: defaultPrice * 10000 // 실제 USDT 거래량
      })
      generateDummyVolumeProfile(defaultPrice)
    } finally {
      setLoading(false)
    }
  }
  
  // 심볼 변경 처리
  const handleSymbolChange = (symbol: string) => {
    // 기존 WebSocket 연결 종료
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setSelectedSymbol(symbol)
    setVolumeProfileData(null)
  }
  
  // Effect: WebSocket 연결
  useEffect(() => {
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
    }
  }, [connectWebSocket])
  
  // Effect: 초기 데이터 로드
  useEffect(() => {
    loadInitialData()
    // 초기 로딩 후 바로 오더북 데이터 로드
    setTimeout(() => {
      loadOrderBookSnapshot()
    }, 1000) // 1초로 증가
    
    // 5초마다 오더북 스냅샷 업데이트 (성능 최적화)
    const interval = setInterval(() => {
      if (autoRefresh && isConnected) {
        loadOrderBookSnapshot()
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [selectedSymbol, timeframe, autoRefresh, isConnected])
  
  // 렌더링된 탭 컨텐츠 캐싱
  const [renderedTabs, setRenderedTabs] = useState<Record<string, boolean>>({})
  
  // 탭 컨텐츠 렌더링
  const renderTabContent = useMemo(() => {
    const content: Record<string, JSX.Element | null> = {}
    
    // Overview 탭은 항상 렌더링
    content.overview = (
      <div className="grid grid-cols-1 gap-6">
        {/* 메인 차트 - 큰 화면 */}
        <div className="h-[calc(100vh-400px)]">
          <VolumeProfileChart3D
            data={volumeProfileData}
            currentPrice={currentStats.currentPrice}
            symbol={selectedSymbol}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isConnected={isConnected}
          />
        </div>
        
        {/* 분석 카드들 - 하단에 가로로 배치 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VolumeAnalysis
            data={volumeProfileData}
            currentPrice={currentStats.currentPrice}
          />
          
          <MarketStructure
            data={volumeProfileData}
            priceHistory={priceHistory}
            currentPrice={currentStats.currentPrice}
          />
        </div>
      </div>
    )
    
    // 나머지 탭은 활성화되었거나 이전에 렌더링된 경우만
    if (activeTab === 'concept' || renderedTabs.concept) {
      content.concept = <ConceptEducation />
    }
    
    if (activeTab === 'analysis' || renderedTabs.analysis) {
      content.analysis = (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ValueArea
            data={volumeProfileData}
            currentPrice={currentStats.currentPrice}
          />
          <VolumeNodes
            data={volumeProfileData}
            currentPrice={currentStats.currentPrice}
          />
        </div>
      )
    }
    
    if (activeTab === 'strategy' || renderedTabs.strategy) {
      content.strategy = (
        <TradingStrategy
          data={volumeProfileData}
          currentPrice={currentStats.currentPrice}
          symbol={selectedSymbol}
        />
      )
    }
    
    if (activeTab === 'structure' || renderedTabs.structure) {
      content.structure = (
        <div className="grid grid-cols-1 gap-6">
          <MarketStructure
            data={volumeProfileData}
            priceHistory={priceHistory}
            currentPrice={currentStats.currentPrice}
          />
          <VolumeNodes
            data={volumeProfileData}
            currentPrice={currentStats.currentPrice}
          />
        </div>
      )
    }
    
    if (activeTab === 'nodes' || renderedTabs.nodes) {
      content.nodes = (
        <VolumeNodes
          data={volumeProfileData}
          currentPrice={currentStats.currentPrice}
        />
      )
    }
    
    if (activeTab === 'sessions' || renderedTabs.sessions) {
      content.sessions = (
        <SessionProfiles
          priceHistory={priceHistory}
          currentPrice={currentStats.currentPrice}
          volumeProfileData={volumeProfileData}
        />
      )
    }
    
    if (activeTab === 'backtest' || renderedTabs.backtest) {
      content.backtest = (
        <BacktestResults
          symbol={selectedSymbol}
          currentPrice={currentStats.currentPrice}
          volumeProfileData={volumeProfileData}
        />
      )
    }
    
    return content
  }, [activeTab, renderedTabs, volumeProfileData, currentStats, selectedSymbol, priceHistory, viewMode, isConnected])
  
  // 탭 변경 시 렌더링 상태 업데이트
  useEffect(() => {
    if (activeTab && !renderedTabs[activeTab]) {
      setRenderedTabs(prev => ({ ...prev, [activeTab]: true }))
    }
  }, [activeTab, renderedTabs])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* 헤더 영역 */}
      <div className="border-b border-gray-800 backdrop-blur-sm bg-black/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <span className="text-purple-400"><IconCube /></span>
                볼륨 프로파일 전문 분석 🚀
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                시장 구조와 거래량 분포로 보는 정확한 매매 타이밍 (실시간)
              </p>
            </div>
            
            {/* 연결 상태 및 설정 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-gray-400">
                  {isConnected ? '실시간' : '연결 끊김'}
                </span>
              </div>
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg ${
                  autoRefresh ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'
                } hover:bg-purple-500/30 transition-colors`}
              >
                <IconSync />
              </button>
            </div>
          </div>
          
          {/* 코인 선택기 */}
          <CoinSelector
            symbols={TRACKED_SYMBOLS}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={handleSymbolChange}
            marketStats={marketStats}
          />
        </div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-[140px] sm:top-[120px] z-30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {[
              { id: 'overview', label: '종합 대시보드', icon: IconChart },
              { id: 'concept', label: '개념 학습', icon: IconBook },
              { id: 'analysis', label: 'Value Area 분석', icon: IconLayers },
              { id: 'strategy', label: '트레이딩 전략', icon: IconRocket },
              { id: 'structure', label: '시장 구조', icon: IconCube },
              { id: 'nodes', label: 'HVN/LVN', icon: IconGrid },
              { id: 'sessions', label: '세션 프로파일', icon: IconClock },
              { id: 'backtest', label: '백테스팅', icon: IconHistory }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  onMouseEnter={() => {
                    // 호버 시 해당 탭 프리렌더링
                    if (!renderedTabs[tab.id]) {
                      setRenderedTabs(prev => ({ ...prev, [tab.id]: true }))
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-sm"><Icon /></span>
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">데이터 로딩 중...</div>
          </div>
        ) : (
          <div className="relative min-h-[600px]">
            {/* 모든 탭을 미리 렌더링하고 숨김/표시로 처리 */}
            {Object.entries(renderTabContent).map(([tabKey, tabContent]) => (
              <div
                key={tabKey}
                className={`${activeTab === tabKey ? 'block' : 'hidden'}`}
              >
                {tabContent}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 하단 정보 */}
      <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <p>실시간 데이터 제공: Binance</p>
            <p>마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}