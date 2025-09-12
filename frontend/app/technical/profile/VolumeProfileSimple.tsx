'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice, formatPercentage, formatVolume } from '@/lib/formatters'

// 간단한 아이콘 컴포넌트
const Icon = ({ emoji }: { emoji: string }) => <span className="inline-block">{emoji}</span>

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
  hvnLevels: number[]
  lvnLevels: number[]
}

interface MarketStats {
  currentPrice: number
  priceChange24h: number
  volume24h: number
  volumeChange24h: number
  marketCap: number
  dominance: number
}

export default function VolumeProfileSimple() {
  const TRACKED_SYMBOLS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
    'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT', 'DOTUSDT'
  ]
  
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [activeTab, setActiveTab] = useState<
    'overview' | 'concept' | 'analysis' | 'strategy' | 'structure' | 'nodes' | 'sessions' | 'backtest'
  >('overview')
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('4h')
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D')
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  const [marketStats, setMarketStats] = useState<Record<string, MarketStats>>({})
  const [volumeProfileData, setVolumeProfileData] = useState<VolumeProfileData | null>(null)
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  
  const wsRef = useRef<WebSocket | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
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
  
  // 더미 볼륨 프로파일 데이터 생성
  const generateDummyVolumeProfile = (currentPrice: number) => {
    const priceRangePercent = 0.05
    const minPrice = currentPrice * (1 - priceRangePercent)
    const maxPrice = currentPrice * (1 + priceRangePercent)
    const levelCount = 50
    const levelSize = (maxPrice - minPrice) / levelCount
    
    const levels: VolumeLevel[] = []
    let maxVolume = 0
    
    for (let i = 0; i < levelCount; i++) {
      const price = maxPrice - (i * levelSize)
      const distanceFromCenter = Math.abs(i - levelCount / 2) / (levelCount / 2)
      const volumeMultiplier = 1 - (distanceFromCenter * 0.8)
      
      const baseVolume = (((Date.now() % 1000) / 1000) * 1000000) * volumeMultiplier
      const buyRatio = 0.4 + (((Date.now() % 1000) / 1000) * 0.2)
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
    
    const pocIndex = Math.floor(levelCount / 2) + Math.floor((((Date.now() % 1000) / 1000) * 5)) - 2
    const poc = levels[pocIndex].price
    const vah = poc * 1.01
    const val = poc * 0.99
    
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
  }
  
  // 차트 그리기
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current
    const data = volumeProfileData
    if (!canvas || !data) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, width, height)
    
    const maxVolume = Math.max(...data.levels.map(l => l.totalVolume))
    const priceRange = Math.max(...data.levels.map(l => l.price)) - Math.min(...data.levels.map(l => l.price))
    const minPrice = Math.min(...data.levels.map(l => l.price))
    
    data.levels.forEach((level) => {
      const y = height - ((level.price - minPrice) / priceRange) * height
      const buyWidth = (level.buyVolume / maxVolume) * width * 0.4
      const sellWidth = (level.sellVolume / maxVolume) * width * 0.4
      
      ctx.fillStyle = 'rgba(16, 185, 129, 0.8)'
      ctx.fillRect(width * 0.5 - buyWidth, y - 1, buyWidth, 2)
      
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'
      ctx.fillRect(width * 0.5, y - 1, sellWidth, 2)
    })
    
    const pocY = height - ((data.poc - minPrice) / priceRange) * height
    ctx.strokeStyle = 'rgba(168, 85, 247, 1)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, pocY)
    ctx.lineTo(width, pocY)
    ctx.stroke()
    
    const vahY = height - ((data.vah - minPrice) / priceRange) * height
    const valY = height - ((data.val - minPrice) / priceRange) * height
    
    ctx.fillStyle = 'rgba(168, 85, 247, 0.1)'
    ctx.fillRect(0, vahY, width, valY - vahY)
  }, [volumeProfileData])
  
  // WebSocket 연결
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    
    try {
      const streams = [
        `${selectedSymbol.toLowerCase()}@ticker`
      ].join('/')
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.stream?.includes('@ticker')) {
            const tickerData = data.data
            setMarketStats(prev => ({
              ...prev,
              [selectedSymbol]: {
                currentPrice: parseFloat(tickerData.c || 0),
                priceChange24h: parseFloat(tickerData.P || 0),
                volume24h: parseFloat(tickerData.v || 0),
                volumeChange24h: 0,
                marketCap: parseFloat(tickerData.c || 0) * parseFloat(tickerData.v || 0),
                dominance: 0
              }
            }))
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
        if (autoRefresh) {
          setTimeout(() => connectWebSocket(), 5000)
        }
      }
    } catch (error) {
      console.error('WebSocket connection error:', error)
      setIsConnected(false)
    }
  }, [selectedSymbol, autoRefresh])
  
  // 초기 데이터 로드
  useEffect(() => {
    const defaultPrice = selectedSymbol === 'BTCUSDT' ? 98000 : 
                       selectedSymbol === 'ETHUSDT' ? 3500 : 
                       selectedSymbol === 'BNBUSDT' ? 700 : 
                       selectedSymbol === 'SOLUSDT' ? 250 : 100
    
    setMarketStats(prev => ({
      ...prev,
      [selectedSymbol]: {
        currentPrice: defaultPrice,
        priceChange24h: 2.5,
        volume24h: 1000000000,
        volumeChange24h: 5.2,
        marketCap: defaultPrice * 1000000,
        dominance: 42.5
      }
    }))
    
    generateDummyVolumeProfile(defaultPrice)
  }, [selectedSymbol])
  
  // WebSocket 연결
  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connectWebSocket])
  
  // 차트 그리기
  useEffect(() => {
    drawChart()
  }, [drawChart])
  
  const handleSymbolChange = (symbol: string) => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setSelectedSymbol(symbol)
    setVolumeProfileData(null)
  }
  
  const tabs = [
    { id: 'overview', label: '종합 대시보드', icon: '📊' },
    { id: 'concept', label: '개념 학습', icon: '📚' },
    { id: 'analysis', label: 'Value Area 분석', icon: '📑' },
    { id: 'strategy', label: '트레이딩 전략', icon: '🚀' },
    { id: 'structure', label: '시장 구조', icon: '📦' },
    { id: 'nodes', label: 'HVN/LVN', icon: '🔲' },
    { id: 'sessions', label: '세션 프로파일', icon: '⏰' },
    { id: 'backtest', label: '백테스팅', icon: '📜' }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="border-b border-gray-800 backdrop-blur-sm bg-black/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Icon emoji="📦" />
                볼륨 프로파일 전문 분석 🚀
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                시장 구조와 거래량 분포로 보는 정확한 매매 타이밍
              </p>
            </div>
            
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
                <Icon emoji="🔄" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {TRACKED_SYMBOLS.map((symbol) => (
              <button
                key={symbol}
                onClick={() => handleSymbolChange(symbol)}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                  selectedSymbol === symbol
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
              >
                {symbol.replace('USDT', '')}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-[140px] sm:top-[120px] z-30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon emoji={tab.icon} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">현재가</p>
                <p className="text-xl font-bold">{formatPrice(currentStats.currentPrice)}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">24시간 변동</p>
                <p className={`text-xl font-bold ${currentStats.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercentage(currentStats.priceChange24h)}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">24시간 거래량</p>
                <p className="text-xl font-bold">{formatVolume(currentStats.volume24h)}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">시가총액</p>
                <p className="text-xl font-bold">{formatVolume(currentStats.marketCap)}</p>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">볼륨 프로파일 차트</h2>
              <div className="relative" style={{ height: '500px' }}>
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
            
            {volumeProfileData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-2">POC</h3>
                  <p className="text-2xl font-bold text-purple-400">{formatPrice(volumeProfileData.poc)}</p>
                  <p className="text-sm text-gray-400">최대 거래량 가격대</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-2">Value Area High</h3>
                  <p className="text-2xl font-bold text-green-400">{formatPrice(volumeProfileData.vah)}</p>
                  <p className="text-sm text-gray-400">가치 영역 상단</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-2">Value Area Low</h3>
                  <p className="text-2xl font-bold text-red-400">{formatPrice(volumeProfileData.val)}</p>
                  <p className="text-sm text-gray-400">가치 영역 하단</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab !== 'overview' && (
          <div className="bg-gray-800/50 rounded-lg p-8 text-center">
            <p className="text-xl text-gray-400">
              {tabs.find(t => t.id === activeTab)?.label} 탭 - 곧 업데이트 예정
            </p>
          </div>
        )}
      </div>
    </div>
  )
}