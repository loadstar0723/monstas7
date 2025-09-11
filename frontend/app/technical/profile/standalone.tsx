'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice, formatPercentage, formatVolume } from '@/lib/formatters'

// 간단한 아이콘 컴포넌트
const Icon = ({ type }: { type: string }) => {
  const icons: Record<string, string> = {
    cube: '📦',
    chart: '📊',
    book: '📚',
    rocket: '🚀',
    grid: '🔲',
    layers: '📑',
    clock: '⏰',
    history: '📜',
    sync: '🔄'
  }
  return <span className="inline-block text-lg">{icons[type] || '•'}</span>
}

// 타입 정의
interface VolumeLevel {
  price: number
  buyVolume: number
  sellVolume: number
  totalVolume: number
  percentage: number
}

interface VolumeProfileData {
  levels: VolumeLevel[]
  poc: number
  vah: number
  val: number
  totalVolume: number
  buyVolume: number
  sellVolume: number
}

interface MarketStats {
  currentPrice: number
  priceChange24h: number
  volume24h: number
  volumeChange24h: number
  marketCap: number
  dominance: number
}

export default function StandaloneVolumeProfile() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [activeTab, setActiveTab] = useState('overview')
  const [timeframe, setTimeframe] = useState('4h')
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D')
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  
  const [marketStats, setMarketStats] = useState<Record<string, MarketStats>>({})
  const [volumeProfileData, setVolumeProfileData] = useState<VolumeProfileData | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const TRACKED_SYMBOLS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
    'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT', 'DOTUSDT'
  ]
  
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
  
  // WebSocket 연결
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    
    try {
      const streams = [
        `${selectedSymbol.toLowerCase()}@depth20@100ms`,
        `${selectedSymbol.toLowerCase()}@ticker`
      ].join('/')
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        loadOrderBookSnapshot()
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.stream) {
            const eventData = data.data
            if (data.stream.includes('@depth')) {
              loadOrderBookSnapshot()
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
        console.log('WebSocket disconnected')
        setIsConnected(false)
        setTimeout(() => connectWebSocket(), 5000)
      }
    } catch (error) {
      console.error('WebSocket connection error:', error)
      setIsConnected(false)
    }
  }, [selectedSymbol])
  
  // Order Book 스냅샷 로드
  const loadOrderBookSnapshot = async () => {
    try {
      const response = await fetch(`/api/binance/depth?symbol=${selectedSymbol}&limit=100`)
      if (response.ok) {
        const data = await response.json()
        processOrderBookSnapshot(data)
      }
    } catch (error) {
      console.error('Error loading order book:', error)
    }
  }
  
  // Order Book 처리
  const processOrderBookSnapshot = (data: any) => {
    const bids = data.bids || []
    const asks = data.asks || []
    
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
  
  // 볼륨 프로파일 계산
  const calculateVolumeProfile = (bids: any[], asks: any[], currentPrice: number) => {
    if (!currentPrice || (bids.length === 0 && asks.length === 0)) return
    
    const priceRangePercent = 0.05
    const minPrice = currentPrice * (1 - priceRangePercent)
    const maxPrice = currentPrice * (1 + priceRangePercent)
    const levelCount = 100
    const levelSize = (maxPrice - minPrice) / levelCount
    
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
          volumeLevels[levelIndex].buyVolume += v * p
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
          volumeLevels[levelIndex].sellVolume += v * p
        }
      }
    })
    
    // 총 볼륨 계산
    const filteredLevels = volumeLevels.filter(level => {
      level.totalVolume = level.buyVolume + level.sellVolume
      return level.totalVolume > 0
    })
    
    if (filteredLevels.length === 0) return
    
    const totalVolume = filteredLevels.reduce((sum, level) => sum + level.totalVolume, 0)
    
    filteredLevels.forEach(level => {
      level.percentage = (level.totalVolume / totalVolume) * 100
    })
    
    // POC 찾기
    const pocLevel = filteredLevels.reduce((max, level) => 
      level.totalVolume > max.totalVolume ? level : max
    )
    
    // Value Area 계산
    const targetVolume = totalVolume * 0.7
    let accumulatedVolume = pocLevel.totalVolume
    const pocIndex = filteredLevels.findIndex(level => level === pocLevel)
    let upperIndex = pocIndex
    let lowerIndex = pocIndex
    
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
    
    const profileData = {
      levels: filteredLevels,
      poc: pocLevel.price,
      vah,
      val,
      totalVolume,
      buyVolume: filteredLevels.reduce((sum, level) => sum + level.buyVolume, 0),
      sellVolume: filteredLevels.reduce((sum, level) => sum + level.sellVolume, 0)
    }
    
    setVolumeProfileData(profileData)
    drawVolumeProfile(profileData)
  }
  
  // 차트 그리기
  const drawVolumeProfile = (data: VolumeProfileData) => {
    const canvas = canvasRef.current
    if (!canvas || !data) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Canvas 크기 설정
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    
    // 배경 클리어
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, width, height)
    
    // 볼륨 프로파일 그리기
    const maxVolume = Math.max(...data.levels.map(l => l.totalVolume))
    const priceRange = Math.max(...data.levels.map(l => l.price)) - Math.min(...data.levels.map(l => l.price))
    const minPrice = Math.min(...data.levels.map(l => l.price))
    
    data.levels.forEach((level, index) => {
      const y = height - ((level.price - minPrice) / priceRange) * height
      const buyWidth = (level.buyVolume / maxVolume) * width * 0.4
      const sellWidth = (level.sellVolume / maxVolume) * width * 0.4
      
      // Buy 볼륨 (녹색)
      ctx.fillStyle = 'rgba(16, 185, 129, 0.8)'
      ctx.fillRect(width * 0.5 - buyWidth, y - 1, buyWidth, 2)
      
      // Sell 볼륨 (빨간색)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'
      ctx.fillRect(width * 0.5, y - 1, sellWidth, 2)
    })
    
    // POC 라인
    const pocY = height - ((data.poc - minPrice) / priceRange) * height
    ctx.strokeStyle = 'rgba(168, 85, 247, 1)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, pocY)
    ctx.lineTo(width, pocY)
    ctx.stroke()
    
    // Value Area
    const vahY = height - ((data.vah - minPrice) / priceRange) * height
    const valY = height - ((data.val - minPrice) / priceRange) * height
    
    ctx.fillStyle = 'rgba(168, 85, 247, 0.1)'
    ctx.fillRect(0, vahY, width, valY - vahY)
  }
  
  // 시장 통계 업데이트
  const updateMarketStats = (data: any) => {
    setMarketStats(prev => ({
      ...prev,
      [selectedSymbol]: {
        currentPrice: parseFloat(data.c || 0),
        priceChange24h: parseFloat(data.P || 0),
        volume24h: parseFloat(data.v || 0),
        volumeChange24h: 0,
        marketCap: parseFloat(data.c || 0) * parseFloat(data.v || 0),
        dominance: 0
      }
    }))
  }
  
  // 초기 데이터 로드
  const loadInitialData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/binance/ticker24hr?symbol=${selectedSymbol}`)
      if (response.ok) {
        const data = await response.json()
        updateMarketStats({
          c: data.lastPrice,
          P: data.priceChangePercent,
          v: data.volume
        })
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Effects
  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connectWebSocket])
  
  useEffect(() => {
    loadInitialData()
    const interval = setInterval(() => {
      if (isConnected) {
        loadOrderBookSnapshot()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [selectedSymbol, isConnected])
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <Icon type="cube" />
            볼륨 프로파일 전문 분석
          </h1>
          <p className="text-gray-400">시장 구조와 거래량 분포로 보는 정확한 매매 타이밍</p>
        </div>
        
        {/* 코인 선택 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 mb-6">
          {TRACKED_SYMBOLS.map((symbol) => (
            <button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              className={`p-2 rounded-lg text-sm transition-all ${
                selectedSymbol === symbol
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {symbol.replace('USDT', '')}
            </button>
          ))}
        </div>
        
        {/* 시장 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">현재가</p>
            <p className="text-xl font-bold">{formatPrice(currentStats.currentPrice)}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">24시간 변동</p>
            <p className={`text-xl font-bold ${currentStats.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercentage(currentStats.priceChange24h)}
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">24시간 거래량</p>
            <p className="text-xl font-bold">{formatVolume(currentStats.volume24h)}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">연결 상태</p>
            <p className="text-xl font-bold flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              {isConnected ? '실시간' : '연결 끊김'}
            </p>
          </div>
        </div>
        
        {/* 메인 차트 */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">볼륨 프로파일 차트</h2>
          <div className="relative" style={{ height: '500px' }}>
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
        
        {/* 분석 정보 */}
        {volumeProfileData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">POC (Point of Control)</h3>
              <p className="text-2xl font-bold text-purple-400">{formatPrice(volumeProfileData.poc)}</p>
              <p className="text-sm text-gray-400">최대 거래량 가격대</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">Value Area High</h3>
              <p className="text-2xl font-bold text-green-400">{formatPrice(volumeProfileData.vah)}</p>
              <p className="text-sm text-gray-400">가치 영역 상단</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">Value Area Low</h3>
              <p className="text-2xl font-bold text-red-400">{formatPrice(volumeProfileData.val)}</p>
              <p className="text-sm text-gray-400">가치 영역 하단</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}