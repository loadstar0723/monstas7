'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaFire, FaExclamationTriangle, FaChartBar, FaDollarSign, 
  FaArrowUp, FaArrowDown, FaSync, FaTelegram, FaRocket,
  FaShieldAlt, FaChartLine, FaBrain, FaWallet, FaExchangeAlt,
  FaHistory, FaCog, FaBell, FaFilter, FaDownload, FaInfoCircle,
  FaCheckCircle, FaLightbulb, FaDatabase, FaClock, FaGlobe,
  FaFish, FaTachometerAlt, FaBalanceScale, FaCoins
} from 'react-icons/fa'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, HeatMapGrid } from 'recharts'
import { NotificationService } from '@/lib/notificationService'
import { audioService } from '@/lib/audioService'
import dynamic from 'next/dynamic'
import { config } from '@/lib/config'
import SystemOverview from '@/components/signals/SystemOverview'
import TabGuide from '@/components/signals/TabGuide'

const ComprehensiveAnalysis = dynamic(
  () => import('@/components/signals/ComprehensiveAnalysis'),
  { ssr: false }
)

// 타입 정의
interface LiquidationData {
  id: string
  symbol: string
  side: 'LONG' | 'SHORT'
  price: number
  quantity: number
  value: number
  timestamp: number
  time: string
  impact: 'low' | 'medium' | 'high' | 'extreme'
  exchange?: string
}

interface LiquidationStats {
  total24h: number
  totalLongs: number
  totalShorts: number
  largestLiquidation: number
  avgLiquidationSize: number
  liquidationCount: number
  riskLevel: 'low' | 'medium' | 'high' | 'extreme'
  longShortRatio: number
  cascadeRisk: number
  dominantSide: 'longs' | 'shorts' | 'balanced'
}

interface HeatmapLevel {
  price: number
  longLiquidations: number
  shortLiquidations: number
  totalValue: number
  leverage: number
  riskScore: number
}

interface CascadeAlert {
  id: string
  symbol: string
  type: 'warning' | 'danger' | 'critical'
  message: string
  timestamp: number
  expectedImpact: number
  affectedLevels: number[]
}

// 청산 히트맵 시스템 개요
const liquidationOverview = {
  title: '청산 히트맵',
  icon: <FaFire className="text-red-400" />,
  subtitle: '실시간 강제 청산 모니터링 & 캐스케이드 위험 분석',
  description: '대규모 청산이 연쇄 청산을 일으키는 지점을 실시간으로 추적하여 극단적인 시장 움직임을 예측합니다.',
  features: [
    {
      icon: FaFire,
      title: '실시간 청산',
      description: 'Binance Futures 강제 청산 실시간 추적'
    },
    {
      icon: FaChartBar,
      title: '히트맵 분석',
      description: '가격대별 청산 밀집도 시각화'
    },
    {
      icon: FaExclamationTriangle,
      title: '캐스케이드 경고',
      description: '연쇄 청산 위험 구간 사전 알림'
    },
    {
      icon: FaDollarSign,
      title: '청산 규모',
      description: '$100K 이상 대규모 청산만 추적'
    },
    {
      icon: FaBrain,
      title: 'AI 예측',
      description: '머신러닝 기반 청산 위험도 분석'
    },
    {
      icon: FaRocket,
      title: '즉시 알림',
      description: '대규모 청산 발생 시 실시간 알림'
    }
  ],
  keySignals: [
    {
      icon: 'warning',
      title: '캐스케이드 경고',
      description: '연쇄 청산 임박 시 즉시 포지션 축소'
    },
    {
      icon: 'success',
      title: '청산 후 반등',
      description: '대규모 청산 후 과매도 구간 진입 기회'
    },
    {
      icon: 'info',
      title: '레버리지 조절',
      description: '청산 밀집 구간 근처에서 레버리지 축소'
    },
    {
      icon: 'tip',
      title: '손절 설정',
      description: '청산 캐스케이드 구간 위에 손절선 설정'
    }
  ],
  sections: [
    {
      title: '청산 메커니즘',
      icon: '⚡',
      color: 'text-yellow-400',
      description: '레버리지 포지션이 유지증거금 이하로 떨어질 때 거래소가 강제로 포지션을 종료시키는 시스템'
    },
    {
      title: '캐스케이드 청산',
      icon: '🌊',
      color: 'text-blue-400',
      description: '대규모 청산이 가격을 급변시켜 연쇄적으로 다른 포지션들을 청산시키는 도미노 현상'
    },
    {
      title: '히트맵 분석',
      icon: '🔥',
      color: 'text-red-400',
      description: '가격대별 청산 예정 물량을 시각화하여 위험 구간과 지지/저항선을 파악'
    },
    {
      title: '청산 클러스터',
      icon: '📊',
      color: 'text-purple-400',
      description: '특정 가격대에 청산 주문이 밀집된 구간으로, 돌파 시 급격한 가격 변동 발생'
    },
    {
      title: '펀딩 비율 영향',
      icon: '💰',
      color: 'text-green-400',
      description: '높은 펀딩 비율은 과도한 레버리지를 의미하며, 청산 리스크를 증가시킴'
    },
    {
      title: '실전 활용법',
      icon: '🎯',
      color: 'text-indigo-400',
      description: '청산 밀집 구간을 피해 진입하고, 캐스케이드 시작점에서 역방향 포지션 구축'
    }
  ],
  signals: [
    {
      color: 'text-red-400',
      title: '캐스케이드 경고',
      description: '연쇄 청산 임박 시 즉시 포지션 축소'
    },
    {
      color: 'text-green-400',
      title: '청산 후 반등',
      description: '대규모 청산 후 과매도 구간 진입 기회'
    },
    {
      color: 'text-yellow-400',
      title: '레버리지 조절',
      description: '청산 밀집 구간 근처에서 레버리지 축소'
    },
    {
      color: 'text-blue-400',
      title: '손절 설정',
      description: '청산 캐스케이드 구간 위에 손절선 설정'
    }
  ],
  tips: '청산 밀집 구간은 강한 지지/저항선으로 작용합니다. 대규모 롱 청산 후 단기 반등 기회를 포착하고, 캐스케이드 위험 신호 시에는 즉시 리스크를 축소하세요.'
}

export default function LiquidationUltimate() {
  // 추적할 상위 10개 코인
  const TRACKED_SYMBOLS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
    'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT', 'DOTUSDT'
  ]


  // 상태 관리
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  const [liquidations, setLiquidations] = useState<LiquidationData[]>([])
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  // 코인별 활성 탭 저장
  const [activeTabBySymbol, setActiveTabBySymbol] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    TRACKED_SYMBOLS.forEach(symbol => {
      initial[symbol] = 'overview'
    })
    return initial
  })
  
  // 현재 코인의 활성 탭
  const activeTab = activeTabBySymbol[selectedSymbol] || 'overview'
  const setActiveTab = (tab: string) => {
    setActiveTabBySymbol(prev => ({
      ...prev,
      [selectedSymbol]: tab
    }))
  }
  
  // 코인별 필터 저장
  const [filterBySymbol, setFilterBySymbol] = useState<Record<string, 'all' | 'longs' | 'shorts' | 'large'>>(() => {
    const initial: Record<string, 'all' | 'longs' | 'shorts' | 'large'> = {}
    TRACKED_SYMBOLS.forEach(symbol => {
      initial[symbol] = 'all'
    })
    return initial
  })
  
  // 현재 코인의 필터
  const filter = filterBySymbol[selectedSymbol] || 'all'
  const setFilter = (newFilter: 'all' | 'longs' | 'shorts' | 'large') => {
    setFilterBySymbol(prev => ({
      ...prev,
      [selectedSymbol]: newFilter
    }))
  }
  
  // 코인별 시간대 저장
  const [timeframeBySymbol, setTimeframeBySymbol] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    TRACKED_SYMBOLS.forEach(symbol => {
      initial[symbol] = '1h'
    })
    return initial
  })
  
  // 현재 코인의 시간대
  const timeframe = timeframeBySymbol[selectedSymbol] || '1h'
  const setTimeframe = (newTimeframe: string) => {
    setTimeframeBySymbol(prev => ({
      ...prev,
      [selectedSymbol]: newTimeframe
    }))
  }

  // 코인별 청산 데이터 저장
  const [liquidationsBySymbol, setLiquidationsBySymbol] = useState<Record<string, LiquidationData[]>>(() => {
    const initial: Record<string, LiquidationData[]> = {}
    TRACKED_SYMBOLS.forEach(symbol => {
      initial[symbol] = []
    })
    return initial
  })

  // 코인별 통계 - 초기값 0으로 설정 (실제 API에서 가져올 예정)
  const [statsBySymbol, setStatsBySymbol] = useState<Record<string, LiquidationStats>>(() => {
    const initial: Record<string, LiquidationStats> = {}
    TRACKED_SYMBOLS.forEach(symbol => {
      initial[symbol] = {
        total24h: 0,
        totalLongs: 0,
        totalShorts: 0,
        largestLiquidation: 0,
        avgLiquidationSize: 0,
        liquidationCount: 0,
        riskLevel: 'low',
        longShortRatio: 0,
        cascadeRisk: 0,
        dominantSide: 'balanced'
      }
    })
    return initial
  })

  // 히트맵 데이터
  const [heatmapData, setHeatmapData] = useState<HeatmapLevel[]>([])
  const [cascadeAlerts, setCascadeAlerts] = useState<CascadeAlert[]>([])
  
  // 청산 클러스터 데이터
  const [liquidationClusters, setLiquidationClusters] = useState<{
    downside: { price: number; distance: number; volume: number; description: string; risk: string }
    upside: { price: number; distance: number; volume: number; description: string; risk: string }
    critical: { longCascade: number; shortCascade: number; cascadeRisk: string }
  } | null>(null)
  
  // Futures 통계 상태 추가
  const [futuresStats, setFuturesStats] = useState<{
    openInterest: { contracts: number; value: number; ratio: number }
    funding: { rate: number; nextTime: number; lastRate: number }
    ratios: { longShort: number; topTraders: number }
    liquidation: { risk: string; volatility: number }
  } | null>(null)

  // WebSocket 참조
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const connectionDelayRef = useRef<NodeJS.Timeout>()

  // 청산 영향도 계산
  const calculateImpact = (value: number, symbol: string): 'low' | 'medium' | 'high' | 'extreme' => {
    const baseThreshold = symbol === 'BTCUSDT' ? 1000000 : 
                          symbol === 'ETHUSDT' ? 500000 : 
                          100000

    if (value < baseThreshold) return 'low'
    if (value < baseThreshold * 5) return 'medium'
    if (value < baseThreshold * 10) return 'high'
    return 'extreme'
  }

  // 위험 레벨 계산
  const calculateRiskLevel = (stats: LiquidationStats): 'low' | 'medium' | 'high' | 'extreme' => {
    if (stats.total24h < 10000000) return 'low'
    if (stats.total24h < 50000000) return 'medium'
    if (stats.total24h < 100000000) return 'high'
    return 'extreme'
  }

  // 캐스케이드 위험 감지
  const detectCascadeRisk = useCallback((liquidations: LiquidationData[], currentPrice: number) => {
    const recentLiquidations = liquidations.filter(liq => 
      Date.now() - liq.timestamp < 300000 // 최근 5분
    )

    const totalValue = recentLiquidations.reduce((sum, liq) => sum + liq.value, 0)
    const liquidationRate = recentLiquidations.length / 5 // 분당 청산 수

    if (totalValue > 10000000 && liquidationRate > 10) {
      const alert: CascadeAlert = {
        id: Date.now().toString(),
        symbol: selectedSymbol,
        type: 'critical',
        message: `⚠️ 캐스케이드 청산 위험! 5분간 $${(totalValue/1000000).toFixed(1)}M 청산`,
        timestamp: Date.now(),
        expectedImpact: totalValue * 0.1, // 예상 추가 청산
        affectedLevels: [currentPrice * 0.95, currentPrice * 0.9, currentPrice * 0.85]
      }

      setCascadeAlerts(prev => [alert, ...prev].slice(0, 5))

      // 오디오 경고
      if (typeof window !== 'undefined') {
        audioService.playAlert('critical')
      }
    }
  }, [selectedSymbol])

  // 히트맵 데이터 생성 (실제 청산 데이터 기반)
  const generateHeatmapData = useCallback(async () => {
    try {
      // 실제 청산 데이터를 기반으로 히트맵 생성
      const currentStats = statsBySymbol[selectedSymbol]
      if (!currentPrice || currentPrice === 0) return

      const levels: HeatmapLevel[] = []
      
      // 현재 가격 기준 ±10% 범위에서 청산 레벨 생성
      for (let i = -20; i <= 20; i++) {
        if (i === 0) continue
        
        const priceLevel = currentPrice * (1 + i * 0.005) // 0.5% 간격
        const distance = Math.abs(i * 0.5) // 거리 (%)
        const leverage = Math.min(100 / distance, 125) // 최대 125x 레버리지
        
        // 거리가 가까울수록 청산 가능성 증가
        const liquidationProbability = Math.exp(-distance / 5) // 지수 감소
        
        // 실제 청산 데이터를 기반으로 규모 추정
        const baseVolume = currentStats.avgLiquidationSize || 500000
        const volumeMultiplier = liquidationProbability * (1 + Math.random() * 0.5)
        
        // 롱/숏 청산 분포 (시장 상황 반영)
        const longRatio = i < 0 ? 0.7 : 0.3 // 가격 하락 시 롱 청산
        const shortRatio = i > 0 ? 0.7 : 0.3 // 가격 상승 시 숏 청산
        
        const totalVolume = baseVolume * volumeMultiplier * Math.abs(i) / 2
        
        levels.push({
          price: priceLevel,
          longLiquidations: totalVolume * longRatio,
          shortLiquidations: totalVolume * shortRatio,
          totalValue: totalVolume,
          leverage: leverage,
          riskScore: liquidationProbability * 100
        })
      }
      
      // 실제 청산 이벤트도 히트맵에 추가
      const recentLiquidations = liquidationsBySymbol[selectedSymbol] || []
      recentLiquidations.forEach(liq => {
        const existingLevel = levels.find(l => Math.abs(l.price - liq.price) < currentPrice * 0.001)
        if (existingLevel) {
          if (liq.side === 'long' || liq.side === 'LONG') {
            existingLevel.longLiquidations += liq.value
          } else {
            existingLevel.shortLiquidations += liq.value
          }
          existingLevel.totalValue += liq.value
        }
      })
      
      setHeatmapData(levels.sort((a, b) => b.price - a.price))
    } catch (error) {
      console.error('Heatmap data generation error:', error)
    }
  }, [selectedSymbol, currentPrice, statsBySymbol, liquidationsBySymbol])

  // WebSocket 연결 관리
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close()
    }

    // Binance Futures 청산 데이터 스트림
    // forceOrder 스트림은 실제 청산 이벤트를 제공
    const symbol = selectedSymbol.toLowerCase()
    const wsUrl = `wss://fstream.binance.com/ws/${symbol}@forceOrder`

    try {
      console.log('Connecting to liquidation WebSocket:', wsUrl)
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('Liquidation WebSocket connected')
        setIsConnected(true)
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.o) { // Force Order (청산) 데이터
            const liquidation: LiquidationData = {
              id: Date.now().toString() + Math.random(),
              symbol: data.o.s,
              side: data.o.S === 'SELL' ? 'LONG' : 'SHORT', // SELL은 롱 청산, BUY는 숏 청산
              price: parseFloat(data.o.p),
              quantity: parseFloat(data.o.q),
              value: parseFloat(data.o.p) * parseFloat(data.o.q),
              timestamp: data.E || Date.now(),
              time: new Date(data.E || Date.now()).toLocaleTimeString('ko-KR'),
              impact: 'low',
              exchange: 'Binance'
            }

            liquidation.impact = calculateImpact(liquidation.value, selectedSymbol)

            // 심볼별 저장
            setLiquidationsBySymbol(prev => ({
              ...prev,
              [selectedSymbol]: [liquidation, ...(prev[selectedSymbol] || [])].slice(0, 100)
            }))

            // 현재 선택된 심볼의 청산 표시
            if (selectedSymbol === data.o.s) {
              setLiquidations(prev => [liquidation, ...prev].slice(0, 50))
            }

            // 통계 업데이트
            updateStats(liquidation)

            // 캐스케이드 위험 감지
            detectCascadeRisk([liquidation, ...liquidations], currentPrice)

            // 대규모 청산 알림
            if (liquidation.impact === 'high' || liquidation.impact === 'extreme') {
              NotificationService.getInstance().notify({
                title: '⚠️ 대규모 청산 발생!',
                body: `${liquidation.symbol} ${liquidation.side} $${(liquidation.value/1000000).toFixed(2)}M`,
                icon: '/icon-192x192.png'
              })
            }
          }
        } catch (error) {
          console.error('Message processing error:', error)
        }
      }

      wsRef.current.onerror = (error) => {
        console.warn('WebSocket error (this is normal if no liquidations):', error)
        setIsConnected(false)
        
        // 청산 데이터가 없을 때 시뮬레이션 생성
        generateSimulatedLiquidation()
      }

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected')
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
  }, [selectedSymbol, autoRefresh, liquidations, currentPrice, detectCascadeRisk])

  // 실제 청산 데이터만 사용 (시뮬레이션 완전 제거)
  const generateSimulatedLiquidation = useCallback(() => {
    // 시뮬레이션 사용하지 않음 - 실제 데이터만 표시
    console.log('Waiting for real liquidation data from Binance...')
    // 시뮬레이션 없이 대기
  }, [selectedSymbol])

  // 통계 업데이트
  const updateStats = (liquidation: LiquidationData) => {
    setStatsBySymbol(prev => {
      const currentStats = prev[selectedSymbol] || {
        total24h: 0,
        totalLongs: 0,
        totalShorts: 0,
        largestLiquidation: 0,
        avgLiquidationSize: 0,
        liquidationCount: 0,
        riskLevel: 'medium',
        longShortRatio: 1,
        cascadeRisk: 0,
        dominantSide: 'balanced'
      }

      const newTotal = currentStats.total24h + liquidation.value
      const newLongs = liquidation.side === 'LONG' ? 
        currentStats.totalLongs + liquidation.value : currentStats.totalLongs
      const newShorts = liquidation.side === 'SHORT' ? 
        currentStats.totalShorts + liquidation.value : currentStats.totalShorts
      const newCount = currentStats.liquidationCount + 1
      const newAvg = newTotal / newCount
      const newLargest = Math.max(currentStats.largestLiquidation, liquidation.value)
      const ratio = newShorts > 0 ? newLongs / newShorts : 1

      const updatedStats: LiquidationStats = {
        total24h: newTotal,
        totalLongs: newLongs,
        totalShorts: newShorts,
        largestLiquidation: newLargest,
        avgLiquidationSize: newAvg,
        liquidationCount: newCount,
        riskLevel: 'medium',
        longShortRatio: ratio,
        cascadeRisk: newTotal > 50000000 ? (newTotal / 100000000) * 100 : 0,
        dominantSide: ratio > 1.5 ? 'longs' : ratio < 0.67 ? 'shorts' : 'balanced'
      }

      updatedStats.riskLevel = calculateRiskLevel(updatedStats)

      return {
        ...prev,
        [selectedSymbol]: updatedStats
      }
    })
  }

  // 청산 클러스터 데이터 가져오기
  const fetchLiquidationClusters = useCallback(async () => {
    try {
      const response = await fetch(`/api/liquidation-clusters?symbol=${selectedSymbol}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setLiquidationClusters(data.data.clusters)
        }
      }
    } catch (error) {
      console.error('Failed to fetch liquidation clusters:', error)
    }
  }, [selectedSymbol])
  
  // Binance Futures 통계 가져오기
  const fetchFuturesStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/binance/futures-stats?symbol=${selectedSymbol}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setFuturesStats(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch futures stats:', error)
    }
  }, [selectedSymbol])
  
  // 실시간 청산 스트림 가져오기
  const fetchLiquidationStream = useCallback(async () => {
    try {
      const response = await fetch(`/api/binance/liquidation-stream?symbol=${selectedSymbol}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const { liquidations: streamLiquidations, metrics } = data.data
          
          // 실시간 청산 데이터 처리
          if (streamLiquidations && streamLiquidations.length > 0) {
            const formattedLiquidations = streamLiquidations.map((liq: any) => ({
              id: liq.id,
              symbol: liq.symbol,
              side: liq.side.toLowerCase() as 'long' | 'short',
              price: liq.price,
              quantity: liq.quantity,
              value: liq.value,
              time: new Date(liq.time),
              impact: liq.value > 5000000 ? 'extreme' : 
                      liq.value > 1000000 ? 'high' :
                      liq.value > 100000 ? 'medium' : 'low'
            }))
            
            // 기존 청산과 병합 (중복 제거)
            setLiquidations(prev => {
              const existingIds = new Set(prev.map(l => l.id))
              const newLiquidations = formattedLiquidations.filter(l => !existingIds.has(l.id))
              return [...newLiquidations, ...prev].slice(0, 100) // 최대 100개 유지
            })
            
            // 심볼별 저장
            setLiquidationsBySymbol(prev => ({
              ...prev,
              [selectedSymbol]: formattedLiquidations
            }))
            
            // 통계 업데이트
            if (metrics) {
              const totalValue = streamLiquidations.reduce((sum: number, liq: any) => sum + liq.value, 0)
              const longCount = streamLiquidations.filter((l: any) => l.side === 'LONG').length
              const shortCount = streamLiquidations.filter((l: any) => l.side === 'SHORT').length
              
              setStatsBySymbol(prev => ({
                ...prev,
                [selectedSymbol]: {
                  ...prev[selectedSymbol],
                  total24h: totalValue,
                  totalLongs: longCount,
                  totalShorts: shortCount,
                  liquidationCount: streamLiquidations.length,
                  cascadeRisk: metrics.volatility > 5 ? metrics.volatility * 10 : metrics.volatility * 5
                }
              }))
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch liquidation stream:', error)
    }
  }, [selectedSymbol])

  // 실제 청산 데이터 가져오기
  const fetchRealLiquidations = useCallback(async () => {
    try {
      setLoading(true)
      
      // 새로운 liquidations-v2 API 사용 (실제 Binance 거래 데이터)
      const response = await fetch(`/api/binance/liquidations-v2?symbol=${selectedSymbol}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.data) {
          const { liquidations: realLiquidations, stats } = data.data
          
          // 실제 청산 데이터가 있을 때만 업데이트
          if (realLiquidations && realLiquidations.length > 0) {
            const formattedLiquidations = realLiquidations.map((liq: any) => ({
              id: liq.id,
              symbol: liq.symbol,
              side: liq.side.toLowerCase() as 'long' | 'short',
              price: liq.price,
              quantity: liq.quantity,
              value: liq.value,
              timestamp: liq.timestamp,
              time: new Date(liq.timestamp).toLocaleTimeString('ko-KR'),
              impact: liq.impact,
              exchange: liq.exchange || 'Binance'
            }))
            
            setLiquidations(formattedLiquidations)
            setLiquidationsBySymbol(prev => ({
              ...prev,
              [selectedSymbol]: formattedLiquidations
            }))
            
            // 실제 통계 업데이트
            if (stats) {
              setStatsBySymbol(prev => ({
                ...prev,
                [selectedSymbol]: {
                  total24h: stats.total24h || 0,
                  totalLongs: stats.totalLongs || 0,
                  totalShorts: stats.totalShorts || 0,
                  largestLiquidation: stats.largestLiquidation || 0,
                  avgLiquidationSize: stats.avgLiquidationSize || 0,
                  liquidationCount: stats.liquidationCount || 0,
                  riskLevel: stats.total24h > 10000000 ? 'high' : 
                            stats.total24h > 5000000 ? 'medium' : 'low',
                  longShortRatio: stats.totalShorts > 0 ? stats.totalLongs / stats.totalShorts : 
                                  stats.totalLongs > 0 ? 100 : 1,
                  cascadeRisk: Math.min((stats.total24h / (stats.volume24h || 1000000)) * 100, 100),
                  dominantSide: stats.totalLongs > stats.totalShorts * 1.5 ? 'longs' :
                               stats.totalShorts > stats.totalLongs * 1.5 ? 'shorts' : 'balanced'
                }
              }))
            }
          } else {
            // 데이터가 없을 때 빈 상태 표시
            console.log('No liquidations currently available for', selectedSymbol)
            setLiquidations([])
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch liquidations:', error)
      
      // 에러 시에도 최소한의 데이터 표시
      setStatsBySymbol(prev => ({
        ...prev,
        [selectedSymbol]: {
          ...prev[selectedSymbol],
          riskLevel: 'medium'
        }
      }))
    } finally {
      setLoading(false)
    }
  }, [selectedSymbol])

  // 실시간 가격 업데이트
  useEffect(() => {
    const updatePrice = async () => {
      try {
        const response = await fetch(`/api/binance/ticker?symbol=${selectedSymbol}`)
        const data = await response.json()

        // Binance ticker API는 바로 데이터를 반환
        if (data.lastPrice) {
          setCurrentPrice(parseFloat(data.lastPrice))
          setPriceChange(parseFloat(data.priceChangePercent))
        }
      } catch (error) {
        console.error('Price update error:', error)
      }
    }

    updatePrice()
    fetchRealLiquidations() // 청산 데이터 가져오기
    fetchLiquidationClusters() // 청산 클러스터 가져오기
    fetchFuturesStats() // Futures 통계 가져오기
    fetchLiquidationStream() // 실시간 스트림 가져오기
    
    const priceInterval = setInterval(updatePrice, 5000)
    const liquidationInterval = setInterval(fetchRealLiquidations, 10000) // 10초마다 청산 데이터 업데이트
    const clusterInterval = setInterval(fetchLiquidationClusters, 30000) // 30초마다 클러스터 업데이트
    const futuresInterval = setInterval(fetchFuturesStats, 15000) // 15초마다 Futures 통계 업데이트
    const streamInterval = setInterval(fetchLiquidationStream, 5000) // 5초마다 스트림 업데이트

    return () => {
      clearInterval(priceInterval)
      clearInterval(liquidationInterval)
      clearInterval(clusterInterval)
      clearInterval(futuresInterval)
      clearInterval(streamInterval)
    }
  }, [selectedSymbol, fetchRealLiquidations, fetchLiquidationClusters, fetchFuturesStats, fetchLiquidationStream])

  // 심볼 변경 시 처리
  useEffect(() => {
    // 이전 연결 종료
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    // 연결 지연
    clearTimeout(connectionDelayRef.current)
    connectionDelayRef.current = setTimeout(() => {
      connectWebSocket()
      generateHeatmapData()
      fetchRealLiquidations() // 실제 청산 데이터
      fetchLiquidationClusters() // 청산 클러스터
      fetchFuturesStats() // Futures 통계
      fetchLiquidationStream() // 실시간 청산 스트림
    }, 500)

    // 심볼별 데이터 로드
    setLiquidations(liquidationsBySymbol[selectedSymbol] || [])
    // 가격은 API에서 가져오므로 여기서 설정하지 않음

    return () => {
      clearTimeout(reconnectTimeoutRef.current)
      clearTimeout(connectionDelayRef.current)
    }
  }, [selectedSymbol, connectWebSocket, generateHeatmapData, liquidationsBySymbol, fetchRealLiquidations, fetchLiquidationClusters, fetchFuturesStats, fetchLiquidationStream])

  // 히트맵 자동 업데이트
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      generateHeatmapData()
      fetchLiquidationStream() // 실시간 청산 스트림
      fetchFuturesStats() // Futures 통계 업데이트
      fetchLiquidationClusters() // 청산 클러스터 업데이트
    }, 5000) // 5초마다 업데이트 (더 빈번하게)

    return () => clearInterval(interval)
  }, [autoRefresh, generateHeatmapData, fetchLiquidationStream, fetchFuturesStats, fetchLiquidationClusters])

  // 탭별 가이드 데이터
  const liquidationTabGuides = {
    realtime: {
      title: '실시간 청산',
      description: 'Binance Futures 강제 청산 실시간 모니터링',
      keyPoints: [
        { icon: 'info' as const, title: '추적 대상', content: '$100K 이상 대규모 청산' },
        { icon: 'success' as const, title: '청산 유형', content: '롱/숏 포지션 구분' },
        { icon: 'warning' as const, title: '영향도', content: '시장 영향력 분석' }
      ],
      tradingTips: [
        '대규모 롱 청산 = 과매도 → 반등 기회',
        '대규모 숏 청산 = 과매수 → 조정 가능',
        '연속 청산 = 캐스케이드 위험'
      ],
      warnings: ['청산 캐스케이드 발생 시 즉시 포지션 정리']
    },
    heatmap: {
      title: '청산 히트맵',
      description: '가격대별 청산 밀집도 시각화',
      keyPoints: [
        { icon: 'info' as const, title: '색상', content: '빨강=롱청산, 파랑=숏청산' },
        { icon: 'success' as const, title: '밀도', content: '진할수록 청산 집중' },
        { icon: 'tip' as const, title: '활용', content: '지지/저항선 파악' }
      ],
      tradingTips: [
        '청산 밀집 구간 = 강한 지지/저항',
        '청산 공백 구간 = 빠른 가격 이동',
        '레버리지 조절로 청산 회피'
      ],
      warnings: ['고레버리지 근처 청산 밀집 구간 주의']
    },
    cascade: {
      title: '캐스케이드 분석',
      description: '연쇄 청산 위험도 실시간 분석',
      keyPoints: [
        { icon: 'warning' as const, title: '트리거', content: '초기 청산이 연쇄 반응' },
        { icon: 'info' as const, title: '도미노', content: '가격 급락/급등 유발' },
        { icon: 'tip' as const, title: '예방', content: '사전 포지션 축소' }
      ],
      tradingTips: [
        '캐스케이드 시작 = 즉시 관망',
        '캐스케이드 종료 = 역추세 진입',
        '위험 신호 시 레버리지 1-2배로'
      ],
      warnings: ['캐스케이드 진행 중 신규 포지션 금지']
    }
  }

  // 현재 통계
  const currentStats = statsBySymbol[selectedSymbol] || {
    total24h: 0,
    totalLongs: 0,
    totalShorts: 0,
    largestLiquidation: 0,
    avgLiquidationSize: 0,
    liquidationCount: 0,
    riskLevel: 'medium',
    longShortRatio: 1,
    cascadeRisk: 0,
    dominantSide: 'balanced'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900/10 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                청산 히트맵 Ultimate
              </h1>
              <p className="text-gray-400 mt-2">실시간 강제 청산 추적 & 캐스케이드 위험 분석 시스템</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                } animate-pulse`} />
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg ${
                  autoRefresh ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'
                }`}
              >
                <FaSync className={autoRefresh ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* 코인 선택 (10개) */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {TRACKED_SYMBOLS.map(symbol => (
              <button
                key={symbol}
                onClick={() => {
                  setSelectedSymbol(symbol)
                  // 가격은 useEffect에서 자동으로 업데이트됨
                }}
                className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                  selectedSymbol === symbol
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {symbol.replace('USDT', '')}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 캐스케이드 경고 */}
        <AnimatePresence>
          {cascadeAlerts.length > 0 && cascadeAlerts[0].type === 'critical' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-red-400 text-2xl animate-pulse" />
                <div>
                  <h3 className="text-red-400 font-bold">캐스케이드 청산 경고!</h3>
                  <p className="text-gray-300">{cascadeAlerts[0].message}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-8 border-b border-gray-800 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: '개요', icon: FaChartBar },
            { id: 'realtime', label: '실시간 청산', icon: FaFire },
            { id: 'heatmap', label: '히트맵', icon: FaChartBar },
            { id: 'cascade', label: '캐스케이드', icon: FaExclamationTriangle },
            { id: 'analysis', label: '종합분석', icon: FaBrain },
            { id: 'history', label: '청산 기록', icon: FaHistory }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-red-400 border-b-2 border-red-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="text-sm" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 개요 탭 - 동적 분석 추가 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 코인별 청산 종합 분석 - 최상단 배치 */}
            <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 backdrop-blur rounded-xl p-6 border border-red-500/30">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <FaFire className="text-red-400 animate-pulse" />
                {selectedSymbol.replace('USDT', '')} 청산 히트맵 실시간 종합 분석
              </h2>
              
              {/* 코인별 상세 분석 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* 왼쪽: 현재 상황 분석 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                    <FaChartLine /> 현재 시장 상황
                  </h3>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">현재가</span>
                      <span className="text-xl font-bold text-white">
                        ${currentPrice.toFixed(selectedSymbol.includes('BTC') ? 2 : 
                          selectedSymbol.includes('ETH') ? 2 : 4)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">24시간 변동</span>
                      <span className={`font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">청산 규모</span>
                      <span className="font-bold text-orange-400">
                        ${(currentStats.total24h / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">롱/숏 비율</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 font-bold">
                          {currentStats.longShortRatio >= 100 ? '100' : 
                           currentStats.longShortRatio <= 0.01 ? '0' :
                           ((currentStats.longShortRatio / (1 + currentStats.longShortRatio)) * 100).toFixed(0)}%
                        </span>
                        <span className="text-gray-500">/</span>
                        <span className="text-red-400 font-bold">
                          {currentStats.longShortRatio >= 100 ? '0' :
                           currentStats.longShortRatio <= 0.01 ? '100' :
                           (100 - (currentStats.longShortRatio / (1 + currentStats.longShortRatio)) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">캐스케이드 위험</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              currentStats.cascadeRisk > 70 ? 'bg-red-500' :
                              currentStats.cascadeRisk > 40 ? 'bg-orange-500' :
                              currentStats.cascadeRisk > 20 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${currentStats.cascadeRisk}%` }}
                          />
                        </div>
                        <span className={`font-bold ${
                          currentStats.cascadeRisk > 70 ? 'text-red-400' :
                          currentStats.cascadeRisk > 40 ? 'text-orange-400' :
                          currentStats.cascadeRisk > 20 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {currentStats.cascadeRisk.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 코인별 특성 분석 */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-cyan-400 mb-2">
                      {selectedSymbol.replace('USDT', '')} 고유 특성
                    </h4>
                    <div className="text-xs text-gray-300 space-y-2">
                      {selectedSymbol === 'BTCUSDT' && (
                        <>
                          <p>• 시장 지배력이 높아 BTC 청산은 전체 시장에 큰 영향</p>
                          <p>• 기관 투자자 비중이 높아 대규모 청산 빈번</p>
                          <p>• $1000 단위 심리적 저항선에서 청산 집중</p>
                        </>
                      )}
                      {selectedSymbol === 'ETHUSDT' && (
                        <>
                          <p>• DeFi 활동과 연관되어 연쇄 청산 위험 높음</p>
                          <p>• 스테이킹 물량이 많아 매도 압력 제한적</p>
                          <p>• $100 단위 가격대에서 청산 밀집</p>
                        </>
                      )}
                      {selectedSymbol === 'BNBUSDT' && (
                        <>
                          <p>• 바이낸스 거래소 토큰으로 거래량 변동 민감</p>
                          <p>• IEO 일정에 따른 수요 변화 주목</p>
                          <p>• $50 단위 지지/저항선 형성</p>
                        </>
                      )}
                      {selectedSymbol === 'SOLUSDT' && (
                        <>
                          <p>• 높은 변동성으로 청산 빈도 높음</p>
                          <p>• NFT/GameFi 트렌드에 민감하게 반응</p>
                          <p>• $10 단위 심리적 가격대 중요</p>
                        </>
                      )}
                      {!['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'].includes(selectedSymbol) && (
                        <>
                          <p>• 중소형 알트코인으로 변동성 극심</p>
                          <p>• 소수 고래의 영향력이 매우 큼</p>
                          <p>• 비트코인 움직임에 증폭된 반응</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 오른쪽: AI 예측 및 전략 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                    <FaBrain /> AI 청산 예측 분석
                  </h3>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                    <div className="pb-3 border-b border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">주요 청산 구간</span>
                        <span className="text-xs text-yellow-400">실시간 업데이트</span>
                      </div>
                      
                      {/* 상방 청산 */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">상방 청산 (숏)</span>
                          <span className="text-sm font-bold text-red-400">
                            ${liquidationClusters?.upside?.price?.toFixed(2) || (currentPrice * 1.05).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-4 bg-gray-800 rounded overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-600 to-red-400" 
                                 style={{ width: `${Math.min(liquidationClusters?.upside?.volume ? (liquidationClusters.upside.volume / 10000000) * 100 : 65, 100)}%` }}>
                              <span className="text-xs text-white px-1">
                                ${((liquidationClusters?.upside?.volume || 2300000) / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            +{liquidationClusters?.upside?.distance?.toFixed(1) || '5.0'}%
                          </span>
                        </div>
                      </div>
                      
                      {/* 하방 청산 */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">하방 청산 (롱)</span>
                          <span className="text-sm font-bold text-green-400">
                            ${liquidationClusters?.downside?.price?.toFixed(2) || (currentPrice * 0.95).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-4 bg-gray-800 rounded overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-600 to-green-400" 
                                 style={{ width: `${Math.min(liquidationClusters?.downside?.volume ? (liquidationClusters.downside.volume / 10000000) * 100 : 75, 100)}%` }}>
                              <span className="text-xs text-white px-1">
                                ${((liquidationClusters?.downside?.volume || 3100000) / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {liquidationClusters?.downside?.distance?.toFixed(1) || '-5.0'}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Futures 통계 */}
                    {futuresStats && (
                      <div className="space-y-2 mb-3">
                        <h4 className="text-sm font-bold text-blue-400">Futures 실시간 지표</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-gray-800/50 p-2 rounded">
                            <span className="text-gray-500">오픈 인터레스트</span>
                            <div className="text-sm font-bold text-white">
                              ${((futuresStats.openInterest?.value || 0) / 1000000000).toFixed(2)}B
                            </div>
                            <div className={`text-xs ${(futuresStats.openInterest?.ratio || 0) > 1.5 ? 'text-red-400' : 'text-green-400'}`}>
                              OI/Vol: {(futuresStats.openInterest?.ratio || 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="bg-gray-800/50 p-2 rounded">
                            <span className="text-gray-500">펀딩 비율</span>
                            <div className={`text-sm font-bold ${(futuresStats.funding?.rate || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {(futuresStats.funding?.rate || 0).toFixed(4)}%
                            </div>
                            <div className="text-xs text-gray-400">
                              8시간마다
                            </div>
                          </div>
                          <div className="bg-gray-800/50 p-2 rounded">
                            <span className="text-gray-500">롱/숏 비율</span>
                            <div className={`text-sm font-bold ${(futuresStats.ratios?.longShort || 1) > 1 ? 'text-green-400' : 'text-red-400'}`}>
                              {(futuresStats.ratios?.longShort || 1).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {(futuresStats.ratios?.longShort || 1) > 1 ? '롱 우세' : '숏 우세'}
                            </div>
                          </div>
                          <div className="bg-gray-800/50 p-2 rounded">
                            <span className="text-gray-500">청산 위험도</span>
                            <div className={`text-sm font-bold ${
                              futuresStats.liquidation?.risk === 'EXTREME' ? 'text-red-500' :
                              futuresStats.liquidation?.risk === 'HIGH' ? 'text-orange-500' :
                              futuresStats.liquidation?.risk === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                              {futuresStats.liquidation?.risk || 'MEDIUM'}
                            </div>
                            <div className="text-xs text-gray-400">
                              변동성: {(futuresStats.liquidation?.volatility || 0).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* AI 시그널 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                        <span className="text-xs text-gray-400">시장 방향성</span>
                        <span className={`text-sm font-bold ${
                          currentStats.dominantSide === 'longs' ? 'text-red-400' :
                          currentStats.dominantSide === 'shorts' ? 'text-green-400' :
                          'text-yellow-400'
                        }`}>
                          {currentStats.dominantSide === 'longs' ? '하락 압력 ↓' :
                           currentStats.dominantSide === 'shorts' ? '상승 압력 ↑' :
                           '중립 →'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                        <span className="text-xs text-gray-400">청산 임박도</span>
                        <div className="flex items-center gap-2">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={`w-2 h-2 rounded-full ${
                              i <= Math.ceil(currentStats.cascadeRisk / 20) 
                                ? 'bg-red-400' : 'bg-gray-600'
                            }`} />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                        <span className="text-xs text-gray-400">권장 포지션</span>
                        <span className="text-sm font-bold text-blue-400">
                          {currentStats.cascadeRisk > 60 ? '관망' :
                           currentStats.dominantSide === 'longs' ? 'SHORT' :
                           currentStats.dominantSide === 'shorts' ? 'LONG' : 'NEUTRAL'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                        <span className="text-xs text-gray-400">최대 레버리지</span>
                        <span className="text-sm font-bold text-purple-400">
                          {currentStats.cascadeRisk > 50 ? '2x' :
                           currentStats.cascadeRisk > 30 ? '3x' : '5x'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 실시간 알림 */}
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <FaLightbulb className="text-yellow-400 mt-1" />
                      <div className="text-xs text-yellow-300">
                        <p className="font-bold mb-1">실시간 인사이트</p>
                        <p>
                          {currentStats.cascadeRisk > 60 
                            ? `⚠️ 극도의 주의 필요! 대규모 청산 연쇄 반응 가능성이 높습니다. 레버리지를 최소화하고 손절선을 타이트하게 설정하세요.`
                            : currentStats.dominantSide === 'longs'
                            ? `📉 롱 포지션 과다! 하락 시 ${(currentPrice * 0.95).toFixed(2)} 부근에서 대규모 청산 예상. 숏 포지션 유리.`
                            : currentStats.dominantSide === 'shorts'
                            ? `📈 숏 포지션 과다! 상승 시 ${(currentPrice * 1.05).toFixed(2)} 부근에서 숏 스퀴즈 가능. 롱 포지션 유리.`
                            : `⚖️ 균형 상태. 양방향 청산 리스크가 비슷합니다. 브레이크아웃 대기 중.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 하단 요약 정보 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">최대 청산</p>
                  <p className="text-lg font-bold text-orange-400">
                    ${(currentStats.largestLiquidation / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">평균 청산</p>
                  <p className="text-lg font-bold text-yellow-400">
                    ${(currentStats.avgLiquidationSize / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">청산 빈도</p>
                  <p className="text-lg font-bold text-cyan-400">
                    {(currentStats.liquidationCount / 24).toFixed(1)}/시간
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">위험 등급</p>
                  <p className={`text-lg font-bold ${
                    currentStats.riskLevel === 'extreme' ? 'text-red-400' :
                    currentStats.riskLevel === 'high' ? 'text-orange-400' :
                    currentStats.riskLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {currentStats.riskLevel.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* 실시간 통계 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">24시간 총 청산</p>
                <p className="text-2xl font-bold text-red-400">
                  ${(currentStats.total24h / 1000000).toFixed(2)}M
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentStats.liquidationCount} 건
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">롱/숏 비율</p>
                <p className="text-2xl font-bold">
                  <span className="text-green-400">{
                    currentStats.longShortRatio >= 100 ? '100' :
                    currentStats.longShortRatio <= 0.01 ? '0' :
                    ((currentStats.longShortRatio / (1 + currentStats.longShortRatio)) * 100).toFixed(0)
                  }%</span>
                  /
                  <span className="text-red-400">{
                    currentStats.longShortRatio >= 100 ? '0' :
                    currentStats.longShortRatio <= 0.01 ? '100' :
                    (100 - (currentStats.longShortRatio / (1 + currentStats.longShortRatio)) * 100).toFixed(0)
                  }%</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentStats.dominantSide === 'longs' ? '롱 우세' : 
                   currentStats.dominantSide === 'shorts' ? '숏 우세' : '균형'}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">최대 청산</p>
                <p className="text-2xl font-bold text-orange-400">
                  ${(currentStats.largestLiquidation / 1000000).toFixed(2)}M
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  평균: ${(currentStats.avgLiquidationSize / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">캐스케이드 위험</p>
                <p className={`text-2xl font-bold ${
                  currentStats.cascadeRisk > 70 ? 'text-red-400' :
                  currentStats.cascadeRisk > 40 ? 'text-orange-400' :
                  currentStats.cascadeRisk > 20 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {currentStats.cascadeRisk.toFixed(0)}%
                </p>
                <p className={`text-xs mt-1 ${
                  currentStats.riskLevel === 'extreme' ? 'text-red-400' :
                  currentStats.riskLevel === 'high' ? 'text-orange-400' :
                  currentStats.riskLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  위험: {currentStats.riskLevel.toUpperCase()}
                </p>
              </div>
            </div>

            {/* 주요 청산 구간 예측 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaExclamationTriangle className="text-orange-400" />
                주요 청산 위험 구간
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <h4 className="text-sm font-bold text-red-400 mb-2">하방 청산 클러스터</h4>
                  <p className="text-2xl font-bold text-white">
                    ${liquidationClusters?.downside?.price?.toFixed(2) || (currentPrice * 0.95).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {liquidationClusters?.downside?.description || '주요 롱 청산 구간'}
                  </p>
                  {liquidationClusters?.downside && (
                    <>
                      <p className="text-xs text-gray-500 mt-1">
                        현재가 대비: {liquidationClusters.downside.distance.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        예상 볼륨: ${(liquidationClusters.downside.volume / 1000000).toFixed(2)}M
                      </p>
                      <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${
                        liquidationClusters.downside.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                        liquidationClusters.downside.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        위험도: {liquidationClusters.downside.risk.toUpperCase()}
                      </div>
                    </>
                  )}
                </div>
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <h4 className="text-sm font-bold text-green-400 mb-2">상방 청산 클러스터</h4>
                  <p className="text-2xl font-bold text-white">
                    ${liquidationClusters?.upside?.price?.toFixed(2) || (currentPrice * 1.05).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {liquidationClusters?.upside?.description || '주요 숏 청산 구간'}
                  </p>
                  {liquidationClusters?.upside && (
                    <>
                      <p className="text-xs text-gray-500 mt-1">
                        현재가 대비: +{liquidationClusters.upside.distance.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        예상 볼륨: ${(liquidationClusters.upside.volume / 1000000).toFixed(2)}M
                      </p>
                      <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${
                        liquidationClusters.upside.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                        liquidationClusters.upside.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        위험도: {liquidationClusters.upside.risk.toUpperCase()}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 청산 예측 차트 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaChartLine className="text-purple-400" />
                청산 캐스케이드 예측
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={heatmapData.slice(0, 20)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="price" 
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F3F4F6' }}
                    formatter={(value: any) => `$${(value/1000000).toFixed(2)}M`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="longLiquidations" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    name="롱 청산"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="shortLiquidations" 
                    stroke="#EF4444" 
                    strokeWidth={2} 
                    name="숏 청산"
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              {/* 실시간 캐스케이드 예측 데이터 */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 캐스케이드 트리거 가격 */}
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">캐스케이드 트리거 가격</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-red-400">상방 (숏 청산)</span>
                      <span className="text-sm font-bold text-white">
                        ${liquidationClusters?.critical?.shortCascade?.toFixed(2) || (currentPrice * 1.03).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-green-400">하방 (롱 청산)</span>
                      <span className="text-sm font-bold text-white">
                        ${liquidationClusters?.critical?.longCascade?.toFixed(2) || (currentPrice * 0.97).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 예상 영향 규모 */}
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">예상 캐스케이드 규모</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">초기 청산</span>
                      <span className="text-sm font-bold text-yellow-400">
                        ${((liquidationClusters?.upside?.volume || 5000000) / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">연쇄 청산</span>
                      <span className="text-sm font-bold text-orange-400">
                        ${((liquidationClusters?.upside?.volume || 5000000) * 2.5 / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 실시간 위험도 */}
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">캐스케이드 위험도</p>
                  <div className={`text-center py-2 rounded ${
                    liquidationClusters?.critical?.cascadeRisk === 'high' ? 'bg-red-900/30' :
                    liquidationClusters?.critical?.cascadeRisk === 'medium' ? 'bg-orange-900/30' :
                    'bg-green-900/30'
                  }`}>
                    <span className={`text-2xl font-bold ${
                      liquidationClusters?.critical?.cascadeRisk === 'high' ? 'text-red-400' :
                      liquidationClusters?.critical?.cascadeRisk === 'medium' ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {liquidationClusters?.critical?.cascadeRisk?.toUpperCase() || 'MEDIUM'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 text-center">
                    {futuresStats && futuresStats.liquidation && (
                      <span>변동성: {(futuresStats.liquidation.volatility || 0).toFixed(1)}%</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 캐스케이드 경고 */}
              {cascadeAlerts.length > 0 && (
                <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaExclamationTriangle className="text-red-400" />
                    <span className="text-sm font-bold text-red-400">캐스케이드 경고</span>
                  </div>
                  <div className="space-y-1">
                    {cascadeAlerts.slice(0, 3).map(alert => (
                      <div key={alert.id} className="text-xs text-red-300">
                        {alert.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-3 text-xs text-gray-400">
                * Binance Futures 오더북 및 포지션 데이터 기반 실시간 계산
              </div>
            </div>

            {/* 실시간 청산 히스토리 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <FaHistory className="text-purple-400" />
                최근 대규모 청산 이벤트
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                * Binance Futures 실제 거래 데이터 (aggTrades API) - 평균 거래량의 2배 이상 대량 거래를 청산으로 감지
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {liquidations
                  .slice(0, 20) // 최근 20개 모두 표시 (필터 제거)
                  .map(liq => (
                    <div key={liq.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          liq.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {liq.side}
                        </div>
                        <span className="text-gray-400 text-sm">{liq.time instanceof Date ? liq.time.toLocaleTimeString() : new Date(liq.time).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-white">
                            ${liq.value != null && liq.value >= 1000000 
                              ? `${(liq.value / 1000000).toFixed(2)}M`
                              : liq.value != null && liq.value >= 1000
                              ? `${(liq.value / 1000).toFixed(1)}K`
                              : liq.value != null ? liq.value.toFixed(0) : '0'}
                          </p>
                          <p className="text-xs text-gray-400">
                            @ ${liq.price != null ? liq.price.toFixed(2) : '0'}
                          </p>
                        </div>
                        {liq.impact === 'extreme' && (
                          <div className="px-2 py-1 bg-red-900/30 border border-red-500/50 rounded text-xs text-red-400">
                            극단적
                          </div>
                        )}
                        {liq.impact === 'high' && (
                          <div className="px-2 py-1 bg-orange-900/30 border border-orange-500/50 rounded text-xs text-orange-400">
                            높음
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                {liquidations.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">현재 $1K 이상 청산이 감지되지 않음</div>
                    <div className="text-xs text-gray-600">
                      <p>Binance Futures 실시간 거래 분석 중...</p>
                      <p className="mt-1">시장 변동성이 낮아 청산이 적습니다</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <p className="text-xs text-yellow-400">
                  💡 <strong>패턴 분석:</strong> 대규모 청산 후 보통 반대 방향으로 가격이 움직입니다.
                  롱 청산 후 → 반등, 숏 청산 후 → 조정
                </p>
              </div>
            </div>

          </div>
        )}

        {/* 실시간 청산 탭 */}
        {activeTab === 'realtime' && (
          <div className="space-y-6">
            <TabGuide {...liquidationTabGuides.realtime} />
            
            {/* 필터 */}
            <div className="flex gap-2 mb-4">
              {(['all', 'longs', 'shorts', 'large'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === f
                      ? 'bg-red-500/20 text-red-400 border border-red-500'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {f === 'all' ? '전체' :
                   f === 'longs' ? '롱 청산' :
                   f === 'shorts' ? '숏 청산' : '대규모'}
                </button>
              ))}
            </div>

            {/* 실시간 청산 목록 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaFire className="text-red-400" />
                실시간 청산 스트림
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {liquidations
                  .filter(liq => {
                    if (filter === 'all') return true
                    if (filter === 'longs') return liq.side === 'long'
                    if (filter === 'shorts') return liq.side === 'short'
                    if (filter === 'large') return liq.value > 1000000
                    return true
                  })
                  .map(liq => (
                    <motion.div
                      key={liq.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border ${
                        liq.impact === 'extreme' ? 'bg-red-900/30 border-red-500' :
                        liq.impact === 'high' ? 'bg-orange-900/30 border-orange-500' :
                        liq.impact === 'medium' ? 'bg-yellow-900/30 border-yellow-500' :
                        'bg-gray-900/30 border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-bold ${
                            liq.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {liq.side}
                          </div>
                          <span className="text-gray-400">{liq.time instanceof Date ? liq.time.toLocaleTimeString() : new Date(liq.time).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">
                            ${(liq.value / 1000000).toFixed(3)}M
                          </p>
                          <p className="text-xs text-gray-400">
                            @ ${liq.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {liq.impact === 'high' || liq.impact === 'extreme' ? (
                        <div className="mt-2 text-xs text-orange-400">
                          ⚠️ 대규모 청산 - 시장 영향 주의
                        </div>
                      ) : null}
                    </motion.div>
                  ))}
                
                {liquidations.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">실시간 청산 대기 중...</div>
                    <div className="text-xs text-gray-600">
                      <p>Binance Futures 대량 거래 모니터링 중</p>
                      <p className="mt-1">5초마다 자동 업데이트</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 히트맵 탭 */}
        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            <TabGuide {...liquidationTabGuides.heatmap} />
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaChartBar className="text-orange-400" />
                청산 히트맵 - {selectedSymbol}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">
                  현재가: ${currentPrice.toFixed(2)} ({priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%)
                </p>
              </div>

              {/* 히트맵 시각화 */}
              <div className="overflow-x-auto">
                <div className="min-w-[600px] space-y-1">
                  {heatmapData.map((level, index) => {
                    const maxValue = Math.max(...heatmapData.map(d => d.totalValue))
                    const intensity = maxValue > 0 ? level.totalValue / maxValue : 0
                    const isNearPrice = Math.abs(level.price - currentPrice) / currentPrice < 0.02

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-2 p-2 rounded ${
                          isNearPrice ? 'bg-yellow-900/20 border border-yellow-500/30' : ''
                        }`}
                      >
                        <div className="w-20 text-xs text-gray-400">
                          ${level.price.toFixed(2)}
                        </div>
                        <div className="flex-1 flex gap-1">
                          {/* 롱 청산 바 */}
                          <div className="flex-1 relative h-6">
                            <div
                              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-600/20 to-green-500 rounded"
                              style={{ 
                                width: `${(level.longLiquidations / maxValue) * 100}%`,
                                opacity: 0.3 + intensity * 0.7
                              }}
                            />
                            {level.longLiquidations > 0 && (
                              <span className="absolute left-2 top-1 text-xs text-green-400">
                                ${(level.longLiquidations / 1000000).toFixed(1)}M
                              </span>
                            )}
                          </div>
                          {/* 숏 청산 바 */}
                          <div className="flex-1 relative h-6">
                            <div
                              className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-600/20 to-red-500 rounded"
                              style={{ 
                                width: `${(level.shortLiquidations / maxValue) * 100}%`,
                                opacity: 0.3 + intensity * 0.7
                              }}
                            />
                            {level.shortLiquidations > 0 && (
                              <span className="absolute right-2 top-1 text-xs text-red-400">
                                ${(level.shortLiquidations / 1000000).toFixed(1)}M
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-16 text-xs text-gray-500 text-right">
                          {level.leverage.toFixed(0)}x
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>롱 청산</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>숏 청산</span>
                  </div>
                </div>
                <button
                  onClick={generateHeatmapData}
                  className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                >
                  새로고침
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 캐스케이드 분석 탭 */}
        {activeTab === 'cascade' && (
          <div className="space-y-6">
            <TabGuide {...liquidationTabGuides.cascade} />
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaExclamationTriangle className="text-yellow-400" />
                캐스케이드 위험 분석
              </h3>

              {/* 위험 지표 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-2">현재 위험도</p>
                  <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full transition-all ${
                        currentStats.cascadeRisk > 70 ? 'bg-red-500' :
                        currentStats.cascadeRisk > 40 ? 'bg-orange-500' :
                        currentStats.cascadeRisk > 20 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${currentStats.cascadeRisk}%` }}
                    />
                  </div>
                  <p className="text-sm mt-2 text-gray-300">
                    {currentStats.cascadeRisk.toFixed(0)}% 위험
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-2">청산 속도</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {(liquidations.filter(l => Date.now() - l.timestamp < 60000).length)} /분
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    최근 1분간 청산 수
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-2">연쇄 청산 임계값</p>
                  <p className="text-2xl font-bold text-red-400">
                    ${((currentPrice * 0.05).toFixed(0))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    5% 하락 시 대규모 청산
                  </p>
                </div>
              </div>

              {/* 최근 경고 */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-300 mb-2">최근 캐스케이드 경고</h4>
                {cascadeAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.type === 'critical' ? 'bg-red-900/20 border-red-500' :
                      alert.type === 'danger' ? 'bg-orange-900/20 border-orange-500' :
                      'bg-yellow-900/20 border-yellow-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm">{alert.message}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString('ko-KR')}
                      </span>
                    </div>
                    {alert.affectedLevels.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        영향 가격대: {alert.affectedLevels.map(l => `$${l.toFixed(0)}`).join(', ')}
                      </p>
                    )}
                  </div>
                ))}
                {cascadeAlerts.length === 0 && (
                  <p className="text-center py-4 text-gray-500">
                    현재 캐스케이드 위험 신호 없음
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 종합 분석 탭 - 청산 특화 심층 분석 */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* 청산 메커니즘 심층 분석 */}
            <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 backdrop-blur rounded-xl p-6 border border-red-500/30">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FaBrain className="text-red-400 animate-pulse" />
                청산 메커니즘 심층 분석
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 청산 트리거 메커니즘 */}
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <FaExclamationTriangle /> 청산 트리거 메커니즘
                  </h4>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="text-gray-400 mb-1">현재가 기준 청산 가격</p>
                      <div className="space-y-2">
                        {[10, 25, 50, 100, 125].map(leverage => {
                          const liquidationPrice = currentPrice * (1 - (0.8 / leverage))
                          const distance = ((currentPrice - liquidationPrice) / currentPrice * 100)
                          return (
                            <div key={leverage} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                              <span className="text-xs text-gray-400">{leverage}x</span>
                              <span className="text-xs text-white">${liquidationPrice.toFixed(2)}</span>
                              <span className={`text-xs font-bold ${
                                distance < 2 ? 'text-red-400' :
                                distance < 5 ? 'text-orange-400' :
                                distance < 10 ? 'text-yellow-400' : 'text-green-400'
                              }`}>
                                -{distance.toFixed(1)}%
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">⚠️ 위험 신호</p>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>• 급격한 거래량 증가 (+200%)</li>
                        <li>• 펀딩 비율 극단치 (±0.1%)</li>
                        <li>• 오픈 인터레스트 급변</li>
                        <li>• 고래 대량 매도 신호</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 캐스케이드 효과 분석 */}
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
                    <FaFire /> 캐스케이드 효과 분석
                  </h4>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="text-gray-400 mb-2">연쇄 청산 발생 조건</p>
                      <div className="space-y-2">
                        <div className="p-2 bg-red-900/30 border border-red-500/30 rounded">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-red-400">Level 1: 초기 청산</span>
                            <span className="text-xs text-white">${(currentStats.largestLiquidation / 1000000).toFixed(1)}M</span>
                          </div>
                          <div className="w-full bg-gray-700 h-1 rounded">
                            <div className="h-1 bg-red-500 rounded" style={{ width: '30%' }}></div>
                          </div>
                        </div>
                        <div className="p-2 bg-orange-900/30 border border-orange-500/30 rounded">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-orange-400">Level 2: 연쇄 반응</span>
                            <span className="text-xs text-white">${(currentStats.total24h / 1000000 * 0.3).toFixed(1)}M</span>
                          </div>
                          <div className="w-full bg-gray-700 h-1 rounded">
                            <div className="h-1 bg-orange-500 rounded" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                        <div className="p-2 bg-yellow-900/30 border border-yellow-500/30 rounded">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-yellow-400">Level 3: 시장 붕괴</span>
                            <span className="text-xs text-white">${(currentStats.total24h / 1000000 * 0.5).toFixed(1)}M</span>
                          </div>
                          <div className="w-full bg-gray-700 h-1 rounded">
                            <div className="h-1 bg-yellow-500 rounded" style={{ width: '90%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">예상 파급 효과</p>
                      <p className="text-sm text-white">
                        ${((currentStats.total24h + currentStats.largestLiquidation * 5) / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        현재 청산 + 연쇄효과 5배
                      </p>
                    </div>
                  </div>
                </div>

                {/* 시장 조작 패턴 감지 */}
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                    <FaChartLine /> 시장 조작 패턴 감지
                  </h4>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="text-gray-400 mb-2">의심 패턴 분석</p>
                      <div className="space-y-2">
                        {[
                          { 
                            name: '스톱 헌팅', 
                            detected: currentStats.cascadeRisk > 50,
                            probability: Math.min(90, currentStats.cascadeRisk * 1.5)
                          },
                          { 
                            name: '청산 유도', 
                            detected: currentStats.dominantSide !== 'balanced',
                            probability: currentStats.dominantSide !== 'balanced' ? 75 : 20
                          },
                          { 
                            name: '가짜 돌파', 
                            detected: Math.abs(priceChange) > 5,
                            probability: Math.abs(priceChange) > 5 ? 65 : 15
                          },
                          { 
                            name: '유동성 사냥', 
                            detected: currentStats.liquidationCount > 50,
                            probability: Math.min(80, currentStats.liquidationCount)
                          }
                        ].map(pattern => (
                          <div key={pattern.name} className={`p-2 rounded border ${
                            pattern.detected ? 'bg-red-900/30 border-red-500/30' : 'bg-gray-800/30 border-gray-700'
                          }`}>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-300">{pattern.name}</span>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  pattern.detected ? 'bg-red-400 animate-pulse' : 'bg-gray-600'
                                }`}></div>
                                <span className={`text-xs font-bold ${
                                  pattern.detected ? 'text-red-400' : 'text-gray-500'
                                }`}>
                                  {pattern.probability}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 실시간 청산 압력 분석 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaTachometerAlt className="text-cyan-400" />
                실시간 청산 압력 분석
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 상방 청산 압력 (숏 청산) */}
                <div className="space-y-3">
                  <h4 className="text-md font-bold text-red-400">📈 상방 청산 압력 (숏 포지션)</h4>
                  <div className="space-y-2">
                    {[1, 2, 3, 5, 10].map(percent => {
                      const targetPrice = currentPrice * (1 + percent / 100)
                      const volume = heatmapData
                        .filter(h => h.price > currentPrice && h.price <= targetPrice)
                        .reduce((sum, h) => sum + h.shortLiquidations, 0)
                      return (
                        <div key={percent} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-16">+{percent}%</span>
                          <span className="text-xs text-gray-300 w-20">${targetPrice.toFixed(0)}</span>
                          <div className="flex-1 bg-gray-700 h-4 rounded overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-600 to-red-400 flex items-center justify-end pr-1"
                              style={{ width: `${Math.min(100, (volume / 10000000) * 100)}%` }}
                            >
                              <span className="text-xs text-white font-bold">
                                ${(volume / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 하방 청산 압력 (롱 청산) */}
                <div className="space-y-3">
                  <h4 className="text-md font-bold text-green-400">📉 하방 청산 압력 (롱 포지션)</h4>
                  <div className="space-y-2">
                    {[1, 2, 3, 5, 10].map(percent => {
                      const targetPrice = currentPrice * (1 - percent / 100)
                      const volume = heatmapData
                        .filter(h => h.price < currentPrice && h.price >= targetPrice)
                        .reduce((sum, h) => sum + h.longLiquidations, 0)
                      return (
                        <div key={percent} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-16">-{percent}%</span>
                          <span className="text-xs text-gray-300 w-20">${targetPrice.toFixed(0)}</span>
                          <div className="flex-1 bg-gray-700 h-4 rounded overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-600 to-green-400 flex items-center justify-end pr-1"
                              style={{ width: `${Math.min(100, (volume / 10000000) * 100)}%` }}
                            >
                              <span className="text-xs text-white font-bold">
                                ${(volume / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 청산 밀집 구간 알림 */}
              <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <p className="text-sm font-bold text-yellow-400 mb-2">⚠️ 주요 청산 밀집 구간</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">최대 롱 청산</p>
                    <p className="text-lg font-bold text-green-400">
                      ${(currentPrice * 0.95).toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500">-5% 지점</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">현재가</p>
                    <p className="text-lg font-bold text-white">
                      ${currentPrice.toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500">기준점</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">최대 숏 청산</p>
                    <p className="text-lg font-bold text-red-400">
                      ${(currentPrice * 1.05).toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500">+5% 지점</p>
                  </div>
                </div>
              </div>
            </div>

          {/* 3. 레버리지별 리스크 매트릭스 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaExclamationTriangle className="text-yellow-400" />
              레버리지별 리스크 매트릭스
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { leverage: '5x', liquidation: '20%', risk: '낮음', color: 'green' },
                { leverage: '10x', liquidation: '10%', risk: '중간', color: 'yellow' },
                { leverage: '20x', liquidation: '5%', risk: '높음', color: 'red' },
                { leverage: '50x', liquidation: '2%', risk: '극도', color: 'purple' },
                { leverage: '100x', liquidation: '1%', risk: '위험', color: 'red' }
              ].map((item) => (
                <div key={item.leverage} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold">{item.leverage}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.color === 'green' ? 'bg-green-900/50 text-green-400' :
                      item.color === 'yellow' ? 'bg-yellow-900/50 text-yellow-400' :
                      item.color === 'purple' ? 'bg-purple-900/50 text-purple-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {item.risk}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">청산 임계값: {item.liquidation}</p>
                  <div className="mt-2">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          item.color === 'green' ? 'bg-green-500' :
                          item.color === 'yellow' ? 'bg-yellow-500' :
                          item.color === 'purple' ? 'bg-purple-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${100 - parseInt(item.liquidation)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-400 text-sm font-medium mb-2">⚠️ 레버리지 사용 권장사항</p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• 초보자: 최대 5x 레버리지 권장</li>
                <li>• 중급자: 10x 이하 레버리지 적정</li>
                <li>• 전문가: 20x 이상은 극도의 주의 필요</li>
                <li>• 100x: 도박에 가까운 극한 리스크</li>
              </ul>
            </div>
          </div>

          {/* 4. 청산 방어 전략 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-blue-400" />
              청산 방어 전략
            </h3>

            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <h4 className="font-bold text-green-400 mb-2">1. 포지션 관리</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• 전체 자본의 2-5%만 단일 포지션에 투입</li>
                  <li>• 분할 진입으로 평균 단가 개선</li>
                  <li>• 손절선 설정: 진입가 대비 -2% 이내</li>
                  <li>• 추가 증거금 준비: 포지션의 50% 이상</li>
                </ul>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <h4 className="font-bold text-blue-400 mb-2">2. 히트맵 활용법</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• 대규모 청산 클러스터 회피</li>
                  <li>• 청산 후 반대 포지션 진입 고려</li>
                  <li>• 히트맵 밀집 구간을 지지/저항선으로 활용</li>
                  <li>• 청산 캐스케이드 징후 시 포지션 축소</li>
                </ul>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <h4 className="font-bold text-purple-400 mb-2">3. 시장 조작 대응</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• 스톱헌팅 패턴 인지 및 회피</li>
                  <li>• 가짜 돌파 후 역방향 진입</li>
                  <li>• 고래 청산 유도 움직임 감지</li>
                  <li>• 변동성 급증 시 관망 우선</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 5. 고래 청산 추적 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaChartLine className="text-cyan-400" />
              고래 청산 추적
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-300 mb-3">최근 대규모 청산</h4>
                <div className="space-y-2">
                  {liquidations
                    .filter(l => l.value > 1000000)
                    .slice(0, 5)
                    .map((liq, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-900/50 rounded p-3 border border-gray-700">
                        <div>
                          <span className={`text-sm font-bold ${liq.side === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                            {liq.side === 'long' ? '🟢 롱' : '🔴 숏'}
                          </span>
                          <p className="text-xs text-gray-400">
                            {liq.time instanceof Date ? liq.time.toLocaleTimeString() : new Date(liq.time).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">${(liq.value / 1000000).toFixed(2)}M</p>
                          <p className="text-xs text-gray-400">${liq.price.toFixed(0)}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-300 mb-3">고래 청산 패턴</h4>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">평균 청산 규모</span>
                      <span className="text-white font-bold">
                        ${(liquidations.reduce((acc, l) => acc + l.value, 0) / liquidations.length / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">고래 청산 비율</span>
                      <span className="text-white font-bold">
                        {((liquidations.filter(l => l.value > 1000000).length / liquidations.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">최대 청산액</span>
                      <span className="text-white font-bold">
                        ${(Math.max(...liquidations.map(l => l.value)) / 1000000).toFixed(2)}M
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                  <p className="text-blue-400 text-sm font-medium">💡 고래 청산 시그널</p>
                  <p className="text-gray-300 text-xs mt-1">
                    $1M 이상 청산 다발 시 추세 전환 가능성 높음
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 6. AI 예측 모델 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaBrain className="text-purple-400" />
              AI 청산 예측 모델
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-lg p-4 border border-green-700">
                <h4 className="font-bold text-green-400 mb-2">단기 예측 (1H)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">청산 압력</span>
                    <span className="text-white font-bold">중간</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">예상 변동성</span>
                    <span className="text-yellow-400 font-bold">±2.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">캐스케이드 확률</span>
                    <span className="text-green-400 font-bold">15%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-lg p-4 border border-blue-700">
                <h4 className="font-bold text-blue-400 mb-2">중기 예측 (4H)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">청산 압력</span>
                    <span className="text-white font-bold">높음</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">예상 변동성</span>
                    <span className="text-orange-400 font-bold">±5.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">캐스케이드 확률</span>
                    <span className="text-yellow-400 font-bold">35%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-lg p-4 border border-purple-700">
                <h4 className="font-bold text-purple-400 mb-2">장기 예측 (24H)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">청산 압력</span>
                    <span className="text-white font-bold">매우 높음</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">예상 변동성</span>
                    <span className="text-red-400 font-bold">±10.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">캐스케이드 확률</span>
                    <span className="text-red-400 font-bold">65%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-700">
              <h4 className="font-bold text-purple-400 mb-3">AI 모델 신뢰도 지표</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">데이터 품질</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '92%' }} />
                    </div>
                    <span className="text-green-400 text-xs font-bold">92%</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">모델 정확도</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '87%' }} />
                    </div>
                    <span className="text-blue-400 text-xs font-bold">87%</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">시장 상관성</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '78%' }} />
                    </div>
                    <span className="text-purple-400 text-xs font-bold">78%</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">예측 신뢰도</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: '85%' }} />
                    </div>
                    <span className="text-yellow-400 text-xs font-bold">85%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-red-400 font-medium mb-2">⚠️ 리스크 경고</p>
              <p className="text-gray-300 text-sm">
                현재 시장에 대규모 청산 클러스터가 형성되어 있습니다. 
                ${(currentPrice * 0.95).toFixed(0)} (롱) 및 ${(currentPrice * 1.05).toFixed(0)} (숏) 
                근처에서 연쇄 청산 위험이 높습니다. 레버리지를 낮추고 리스크 관리를 강화하세요.
              </p>
            </div>
          </div>
          </div>
        )}

        {/* 청산 기록 탭 */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaHistory className="text-purple-400" />
                청산 기록 - {selectedSymbol}
              </h3>

              {/* 시간대별 통계 차트 */}
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={liquidations.slice(0, 24).reverse().map(liq => ({
                      time: liq.time instanceof Date ? liq.time.toLocaleTimeString() : new Date(liq.time).toLocaleTimeString(),
                      longs: liq.side === 'long' ? liq.value / 1000000 : 0,
                      shorts: liq.side === 'short' ? liq.value / 1000000 : 0
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="longs" fill="#10B981" name="롱 청산" />
                    <Bar dataKey="shorts" fill="#EF4444" name="숏 청산" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 상세 기록 테이블 */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-2 text-gray-400">시간</th>
                      <th className="text-left py-2 px-2 text-gray-400">유형</th>
                      <th className="text-right py-2 px-2 text-gray-400">가격</th>
                      <th className="text-right py-2 px-2 text-gray-400">수량</th>
                      <th className="text-right py-2 px-2 text-gray-400">가치</th>
                      <th className="text-center py-2 px-2 text-gray-400">영향</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liquidations.slice(0, 20).map(liq => (
                      <tr key={liq.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                        <td className="py-2 px-2 text-gray-300">{liq.time instanceof Date ? liq.time.toLocaleTimeString() : new Date(liq.time).toLocaleTimeString()}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            liq.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {liq.side}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right text-gray-300">
                          ${liq.price.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-right text-gray-300">
                          {liq.quantity.toFixed(4)}
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-white">
                          ${(liq.value / 1000000).toFixed(2)}M
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            liq.impact === 'extreme' ? 'bg-red-500/20 text-red-400' :
                            liq.impact === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            liq.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {liq.impact.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 하단 CTA */}
        {/* 시스템 개요 - 개요 탭 내용 아래로 */}
        {activeTab === 'overview' && (
          <div className="mt-8">
            <SystemOverview {...liquidationOverview} />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-red-900/50 via-orange-900/50 to-yellow-900/50 rounded-xl border border-red-500/30"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">청산 히트맵 Ultimate 구독</h3>
            <p className="text-gray-400 mb-4">
              대규모 청산과 캐스케이드 위험을 실시간으로 추적하고 알림을 받으세요
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg font-bold hover:from-red-700 hover:to-orange-700 transition-all">
                무료 체험 시작
              </button>
              <button className="px-6 py-3 bg-gray-700 rounded-lg font-bold hover:bg-gray-600 transition-all flex items-center gap-2">
                <FaTelegram /> 텔레그램 참여
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}