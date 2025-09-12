'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRealtimePrice, useMultipleRealtimePrices, fetchKlines, fetchOrderBook, fetch24hrTicker } from '@/lib/hooks/useRealtimePrice'
import { dataService } from '@/lib/services/finalDataService'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
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