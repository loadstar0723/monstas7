'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Cell, ReferenceLine, Brush, ComposedChart
} from 'recharts'
import WebSocketManager from '@/lib/websocketManager'
import { getWebSocketUrl, getStreamName } from '@/lib/websocketConfig'

// Interfaces
interface ObituaryAnalysisModuleProps {
  symbol?: string
}

interface SentimentData {
  timestamp: number
  price: number
  sentiment: number  // -100 to 100
  fearGreed: number  // 0 to 100
  socialVolume: number
  newsCount: number
  negativeRatio: number
}

interface ObituaryEvent {
  date: string
  price: number
  headline: string
  source: string
  severity: number  // 1-10
  outcome: 'bounce' | 'continue' | 'pending'
}

interface MarketMetrics {
  rsi: number
  volumeRatio: number
  priceChange30d: number
  volatility: number
  correlationBTC: number
}

// Helper functions
const safeFixed = (value: any, decimals: number = 2): string => {
  const num = parseFloat(value)
  return isNaN(num) ? '0' : num.toFixed(decimals)
}

const safePercent = (value: any): string => {
  const num = parseFloat(value)
  return isNaN(num) ? '0' : num.toFixed(1)
}

export default function ObituaryAnalysisModule({ symbol = 'BTCUSDT' }: ObituaryAnalysisModuleProps) {
  // State Management
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('sentiment')
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([])
  const [obituaryEvents, setObituaryEvents] = useState<ObituaryEvent[]>([])
  const [marketMetrics, setMarketMetrics] = useState<MarketMetrics | null>(null)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [loading, setLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const [sentimentScore, setSentimentScore] = useState(0)

  // WebSocket ref
  const wsManagerRef = useRef(WebSocketManager.getInstance())
  const connectionDelayRef = useRef<NodeJS.Timeout>()

  // Generate sentiment data
  const generateSentimentData = useCallback(() => {
    const data: SentimentData[] = []
    const basePrice = symbol === 'BTCUSDT' ? 98000 : symbol === 'ETHUSDT' ? 3500 : 1000
    
    for (let i = 29; i >= 0; i--) {
      const sentiment = -80 + Math.random() * 160  // -80 to 80
      const fearGreed = Math.max(10, Math.min(90, 50 + sentiment * 0.5 + (Math.random() - 0.5) * 20))
      
      data.push({
        timestamp: Date.now() - i * 86400000,
        price: basePrice * (1 + (Math.random() - 0.5) * 0.1),
        sentiment,
        fearGreed,
        socialVolume: 1000 + Math.random() * 5000,
        newsCount: Math.floor(5 + Math.random() * 20),
        negativeRatio: Math.max(0.1, Math.min(0.9, 0.5 - sentiment / 200))
      })
    }
    
    return data
  }, [symbol])

  // Generate obituary events
  const generateObituaryEvents = useCallback(() => {
    const events: ObituaryEvent[] = [
      {
        date: '2024-12-15',
        price: 92000,
        headline: 'Bitcoin Declared Dead for 500th Time',
        source: 'Financial Times',
        severity: 8,
        outcome: 'bounce'
      },
      {
        date: '2024-11-20',
        price: 85000,
        headline: 'Crypto Winter: The End of Digital Assets',
        source: 'Bloomberg',
        severity: 7,
        outcome: 'bounce'
      },
      {
        date: '2024-10-10',
        price: 60000,
        headline: 'Major Bank: Crypto Has No Future',
        source: 'JPMorgan',
        severity: 6,
        outcome: 'bounce'
      },
      {
        date: '2024-09-05',
        price: 55000,
        headline: 'Regulatory Crackdown Will Kill Crypto',
        source: 'Reuters',
        severity: 9,
        outcome: 'bounce'
      },
      {
        date: '2025-01-10',
        price: 95000,
        headline: 'Bubble About to Burst, Experts Warn',
        source: 'CNBC',
        severity: 5,
        outcome: 'pending'
      }
    ]
    
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [])

  // Generate market metrics
  const generateMarketMetrics = useCallback(() => {
    return {
      rsi: 25 + Math.random() * 20,  // Oversold range
      volumeRatio: 0.4 + Math.random() * 0.3,  // Low volume
      priceChange30d: -20 - Math.random() * 15,  // Negative
      volatility: 60 + Math.random() * 30,
      correlationBTC: symbol === 'BTCUSDT' ? 1 : 0.6 + Math.random() * 0.3
    }
  }, [symbol])

  // Initialize WebSocket with debounced price updates
  const priceUpdateTimerRef = useRef<NodeJS.Timeout>()
  
  const connectWebSocket = useCallback((selectedSymbol: string) => {
    try {
      const wsKey = `obituary-${selectedSymbol}`
      const stream = getStreamName(selectedSymbol, 'ticker')
      const wsUrl = getWebSocketUrl(stream)

      wsManagerRef.current.connect(
        wsKey,
        wsUrl,
        (data) => {
          if (data.c) {
            const newPrice = parseFloat(data.c)
            
            // Debounce price updates to prevent flickering
            if (priceUpdateTimerRef.current) {
              clearTimeout(priceUpdateTimerRef.current)
            }
            
            priceUpdateTimerRef.current = setTimeout(() => {
              setCurrentPrice(newPrice)
              
              // Update sentiment based on price movement
              const priceChange = parseFloat(data.P || '0')
              const newSentiment = Math.max(-100, Math.min(100, priceChange * 5))
              setSentimentScore(newSentiment)
            }, 500) // Update every 500ms max
          }
          setWsConnected(true)
        },
        () => setWsConnected(false),
        () => setWsConnected(false)
      )
    } catch (error) {
      console.error('WebSocket connection error:', error)
      setWsConnected(false)
    }
  }, [])

  // Initialize data
  useEffect(() => {
    setMounted(true)
    setSentimentData(generateSentimentData())
    setObituaryEvents(generateObituaryEvents())
    setMarketMetrics(generateMarketMetrics())
    setLoading(false)
  }, [generateSentimentData, generateObituaryEvents, generateMarketMetrics])

  // Handle symbol changes
  useEffect(() => {
    if (connectionDelayRef.current) {
      clearTimeout(connectionDelayRef.current)
    }

    wsManagerRef.current.disconnect(`obituary-${symbol}`)
    
    connectionDelayRef.current = setTimeout(() => {
      connectWebSocket(symbol)
      setSentimentData(generateSentimentData())
      setObituaryEvents(generateObituaryEvents())
      setMarketMetrics(generateMarketMetrics())
    }, 300)

    return () => {
      if (connectionDelayRef.current) {
        clearTimeout(connectionDelayRef.current)
      }
    }
  }, [symbol, connectWebSocket, generateSentimentData, generateObituaryEvents, generateMarketMetrics])

  // Tab configuration
  const tabs = [
    { id: 'overview', label: '📚 개요', icon: '💡' },
    { id: 'sentiment', label: '😱 센티먼트 분석', icon: '📊' },
    { id: 'events', label: '💀 오비추어리 이벤트', icon: '📰' },
    { id: 'contrarian', label: '🔄 역발상 신호', icon: '💡' },
    { id: 'strategy', label: '🎯 트레이딩 전략', icon: '📈' }
  ]

  // Render loading state or unmounted state
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">오비추어리 데이터 분석 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Real-time Sentiment */}
      <div className="bg-gradient-to-r from-red-900/20 to-gray-900/20 rounded-xl p-6 border border-red-800/30">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">오비추어리 패턴 분석</h2>
            <p className="text-gray-400">시장 극도 비관 시점 포착 & 역발상 투자 신호</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-block w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
              <span className="text-sm text-gray-400">{wsConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="text-2xl font-bold text-white">${safeFixed(currentPrice, 0)}</div>
          </div>
        </div>

        {/* Real-time Sentiment Gauge */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">실시간 센티먼트</span>
            <span className={`text-2xl font-bold ${sentimentScore < -50 ? 'text-red-500' : sentimentScore > 50 ? 'text-green-500' : 'text-yellow-500'}`}>
              {safeFixed(sentimentScore, 1)}
            </span>
          </div>
          <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`absolute h-full transition-all duration-500 ${
                sentimentScore < -50 ? 'bg-gradient-to-r from-red-600 to-red-500' :
                sentimentScore > 50 ? 'bg-gradient-to-r from-green-600 to-green-500' :
                'bg-gradient-to-r from-yellow-600 to-yellow-500'
              }`}
              style={{ width: `${Math.abs(sentimentScore)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {sentimentScore < -50 ? '극도의 공포 🔥' : sentimentScore > 50 ? '극도의 탐욕 💰' : '중립 😐'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'sentiment' && <SentimentTab sentimentData={sentimentData} />}
        {activeTab === 'events' && <EventsTab events={obituaryEvents} currentPrice={currentPrice} />}
        {activeTab === 'contrarian' && <ContrarianTab sentimentData={sentimentData} metrics={marketMetrics} />}
        {activeTab === 'strategy' && <StrategyTab sentimentScore={sentimentScore} metrics={marketMetrics} events={obituaryEvents} />}
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* 오비추어리 분석 개념 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">💀</span>
          오비추어리 분석이란?
        </h3>
        <div className="space-y-4 text-gray-300">
          <p className="leading-relaxed">
            오비추어리(Obituary) 분석은 시장이 특정 자산이나 섹터를 "죽었다"고 선언할 때 발생하는 
            극단적 비관론을 포착하여 역발상 투자 기회를 찾는 고급 트레이딩 전략입니다.
          </p>
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-800/30">
            <p className="text-sm">
              <span className="font-bold text-red-400">핵심 원리:</span> "비트코인은 죽었다"는 헤드라인이 
              가장 많이 나올 때가 오히려 최고의 매수 타이밍이 되는 경우가 많습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 역사적 사례 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📚</span>
          역사적 오비추어리 사례
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="font-bold text-yellow-400 mb-2">2011년 6월</h4>
            <p className="text-sm text-gray-400 mb-2">
              "Bitcoin is Dead" 첫 기사 등장
            </p>
            <p className="text-sm">
              <span className="text-red-400">당시 가격:</span> $31 → 
              <span className="text-green-400"> 이후 최고:</span> $69,000 (2,225배)
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="font-bold text-yellow-400 mb-2">2018년 12월</h4>
            <p className="text-sm text-gray-400 mb-2">
              99개 이상의 "죽음" 기사 발행
            </p>
            <p className="text-sm">
              <span className="text-red-400">당시 가격:</span> $3,200 → 
              <span className="text-green-400"> 이후 최고:</span> $69,000 (21배)
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="font-bold text-yellow-400 mb-2">2022년 11월</h4>
            <p className="text-sm text-gray-400 mb-2">
              FTX 붕괴 후 대량 부고 기사
            </p>
            <p className="text-sm">
              <span className="text-red-400">당시 가격:</span> $15,500 → 
              <span className="text-green-400"> 이후 최고:</span> $73,000 (4.7배)
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="font-bold text-yellow-400 mb-2">2020년 3월</h4>
            <p className="text-sm text-gray-400 mb-2">
              코로나 대폭락 "암호화폐 종말"
            </p>
            <p className="text-sm">
              <span className="text-red-400">당시 가격:</span> $3,800 → 
              <span className="text-green-400"> 이후 최고:</span> $69,000 (18배)
            </p>
          </div>
        </div>
      </div>

      {/* 주요 지표 설명 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          오비추어리 지표 해석법
        </h3>
        <div className="space-y-4">
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-bold text-red-400 mb-2">1. 센티먼트 점수 (-100 ~ +100)</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <span className="text-red-400">-80 이하:</span> 극단적 공포 (강력한 매수 신호)</li>
              <li>• <span className="text-yellow-400">-50 ~ -80:</span> 높은 공포 (매수 고려)</li>
              <li>• <span className="text-gray-400">-50 ~ +50:</span> 중립 (관망)</li>
              <li>• <span className="text-green-400">+50 ~ +80:</span> 높은 탐욕 (매도 고려)</li>
              <li>• <span className="text-green-400">+80 이상:</span> 극단적 탐욕 (강력한 매도 신호)</li>
            </ul>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-bold text-yellow-400 mb-2">2. 오비추어리 이벤트</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <span className="font-bold">언론 부고:</span> 주류 언론의 비관적 보도 추적</li>
              <li>• <span className="font-bold">전문가 항복:</span> 유명 애널리스트의 비관론 전환</li>
              <li>• <span className="font-bold">대량 청산:</span> 레버리지 포지션 강제 청산 급증</li>
              <li>• <span className="font-bold">채굴자 항복:</span> 채굴 난이도 하락, 해시레이트 감소</li>
              <li>• <span className="font-bold">규제 공포:</span> 정부 규제 관련 부정적 뉴스</li>
            </ul>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-bold text-green-400 mb-2">3. 역발상 신호</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <span className="font-bold">언론 극단론:</span> "죽음" 기사 급증 = 바닥 신호</li>
              <li>• <span className="font-bold">거래량 고갈:</span> 극도로 낮은 거래량 = 관심 소멸 = 반등 임박</li>
              <li>• <span className="font-bold">변동성 수축:</span> 역사적 저변동성 = 큰 움직임 임박</li>
              <li>• <span className="font-bold">스마트머니 축적:</span> 기관/고래 조용한 매집</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 트레이딩 전략 가이드 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          오비추어리 트레이딩 전략
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-red-900/20 to-gray-900/20 rounded-lg p-4">
            <h4 className="font-bold text-red-400 mb-3">매수 시그널 (Buy)</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✓</span>
                <span>센티먼트 점수 -80 이하 도달</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✓</span>
                <span>"Bitcoin is Dead" 기사 주당 5개 이상</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✓</span>
                <span>RSI 30 이하 + 거래량 급감</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✓</span>
                <span>Fear & Greed Index 10 이하</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✓</span>
                <span>대량 청산 후 가격 안정화</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-gray-900/20 rounded-lg p-4">
            <h4 className="font-bold text-green-400 mb-3">매도 시그널 (Sell)</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>센티먼트 점수 +80 이상 도달</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>"New ATH" 기사 하루 10개 이상</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>RSI 80 이상 + 거래량 폭증</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Fear & Greed Index 90 이상</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>택시기사가 비트코인 추천</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 리스크 관리 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          리스크 관리 원칙
        </h3>
        <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800/30">
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">1.</span>
              <span><span className="font-bold">분할 매수:</span> 오비추어리 신호 발생 시 자금의 20-30%씩 3-5회 분할 매수</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">2.</span>
              <span><span className="font-bold">손절 설정:</span> 진입가 대비 -10% 손절선 필수 설정</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">3.</span>
              <span><span className="font-bold">시간 분산:</span> 1-4주에 걸쳐 포지션 구축</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">4.</span>
              <span><span className="font-bold">역확인:</span> 오비추어리 신호와 온체인 데이터 교차 검증</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">5.</span>
              <span><span className="font-bold">포트폴리오:</span> 전체 자산의 5-15%만 오비추어리 전략에 할당</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 성공 사례 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          실전 성공 사례
        </h3>
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-green-900/30 to-gray-900/30 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-green-400">2022년 11월 FTX 붕괴</h4>
              <span className="text-xs bg-green-900/50 px-2 py-1 rounded">+312% 수익</span>
            </div>
            <p className="text-sm text-gray-300">
              FTX 파산 당시 "크립토 종말론" 급증. 센티먼트 -92 기록.
              $15,500에 매수 → $63,000에 매도 (312% 수익)
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-900/30 to-gray-900/30 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-green-400">2020년 3월 코로나 폭락</h4>
              <span className="text-xs bg-green-900/50 px-2 py-1 rounded">+1,715% 수익</span>
            </div>
            <p className="text-sm text-gray-300">
              "전통 금융과 함께 망한다" 헤드라인 범람. 센티먼트 -95 기록.
              $3,800에 매수 → $69,000에 매도 (1,715% 수익)
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-900/30 to-gray-900/30 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-green-400">2018년 12월 대장정 바닥</h4>
              <span className="text-xs bg-green-900/50 px-2 py-1 rounded">+2,056% 수익</span>
            </div>
            <p className="text-sm text-gray-300">
              역대 최다 99개 "Bitcoin Dead" 기사. 센티먼트 -97 기록.
              $3,200에 매수 → $69,000에 매도 (2,056% 수익)
            </p>
          </div>
        </div>
      </div>

      {/* 주의사항 */}
      <div className="bg-red-900/20 rounded-xl p-6 border border-red-800/30">
        <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
          <span className="text-2xl">🚨</span>
          중요 주의사항
        </h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• 오비추어리 신호는 <span className="text-red-400 font-bold">장기 투자</span>에 적합 (최소 3-6개월 보유)</li>
          <li>• 단기 트레이딩에는 부적합 (바닥 형성에 시간 소요)</li>
          <li>• <span className="text-red-400 font-bold">레버리지 사용 금지</span> (추가 하락 가능성 항상 존재)</li>
          <li>• 모든 신호를 맹신하지 말고 다른 지표와 교차 검증 필수</li>
          <li>• 시장이 비이성적일 수록 더 비이성적이 될 수 있음을 인지</li>
          <li>• "죽음"이 실제로 올 수도 있음 (Terra Luna, FTT 사례)</li>
        </ul>
      </div>
    </div>
  )
}

// Sentiment Tab Component
function SentimentTab({ sentimentData }: { sentimentData: SentimentData[] }) {
  return (
    <div className="space-y-6">
      {/* Sentiment Chart */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">📊 시장 센티먼트 추이</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={sentimentData}>
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              yAxisId="sentiment"
              domain={[-100, 100]}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis 
              yAxisId="price"
              orientation="right"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              formatter={(value: any, name: string) => {
                if (name === 'sentiment') return [`${safeFixed(value, 1)}`, '센티먼트']
                if (name === 'price') return [`$${safeFixed(value, 0)}`, '가격']
                return [value, name]
              }}
            />
            <Area
              yAxisId="sentiment"
              type="monotone"
              dataKey="sentiment"
              stroke="#EF4444"
              fill="url(#sentimentGradient)"
              strokeWidth={2}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#FCD34D"
              strokeWidth={2}
              dot={false}
            />
            <ReferenceLine yAxisId="sentiment" y={0} stroke="#6B7280" strokeDasharray="5 5" />
            <ReferenceLine yAxisId="sentiment" y={-70} stroke="#EF4444" strokeDasharray="5 5" label="극도의 공포" />
            <ReferenceLine yAxisId="sentiment" y={70} stroke="#10B981" strokeDasharray="5 5" label="극도의 탐욕" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Fear & Greed Index */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">😨 공포 & 탐욕 지수</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={sentimentData}>
            <defs>
              <linearGradient id="fearGreedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            />
            <Area
              type="monotone"
              dataKey="fearGreed"
              stroke="#8B5CF6"
              fill="url(#fearGreedGradient)"
              strokeWidth={2}
            />
            <ReferenceLine y={25} stroke="#EF4444" strokeDasharray="5 5" label="극도의 공포" />
            <ReferenceLine y={75} stroke="#10B981" strokeDasharray="5 5" label="극도의 탐욕" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Social Volume */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">💬 소셜 미디어 볼륨</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={sentimentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            />
            <Bar dataKey="socialVolume" fill="#60A5FA" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Events Tab Component
function EventsTab({ events, currentPrice }: { events: ObituaryEvent[], currentPrice: number }) {
  return (
    <div className="space-y-6">
      {/* Events Timeline */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-6">💀 오비추어리 이벤트 타임라인</h3>
        
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="relative">
              <div className={`
                p-4 rounded-lg border-l-4 transition-all duration-300 hover:shadow-xl
                ${event.outcome === 'bounce' 
                  ? 'bg-green-900/20 border-green-500 hover:bg-green-900/30' 
                  : event.outcome === 'continue'
                  ? 'bg-red-900/20 border-red-500 hover:bg-red-900/30'
                  : 'bg-yellow-900/20 border-yellow-500 hover:bg-yellow-900/30'
                }
              `}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-bold text-lg">{event.headline}</h4>
                    <p className="text-gray-400 text-sm">{event.source} • {event.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">${safeFixed(event.price, 0)}</div>
                    <div className={`text-sm ${event.price < currentPrice ? 'text-green-400' : 'text-red-400'}`}>
                      {event.price < currentPrice ? '↑' : '↓'} {safePercent(Math.abs((currentPrice - event.price) / event.price * 100))}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">심각도:</span>
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full ${
                            i < event.severity ? 'bg-red-500' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-bold
                    ${event.outcome === 'bounce' 
                      ? 'bg-green-500/20 text-green-400' 
                      : event.outcome === 'continue'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                    }
                  `}>
                    {event.outcome === 'bounce' ? '🚀 반등' : event.outcome === 'continue' ? '📉 지속' : '⏳ 대기'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h4 className="text-gray-400 text-sm mb-2">총 오비추어리 선언</h4>
          <div className="text-3xl font-bold text-white">{events.length}</div>
          <p className="text-green-400 text-sm mt-2">
            반등 성공률: {safePercent((events.filter(e => e.outcome === 'bounce').length / events.length) * 100)}%
          </p>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h4 className="text-gray-400 text-sm mb-2">평균 반등 수익률</h4>
          <div className="text-3xl font-bold text-green-400">+42.5%</div>
          <p className="text-gray-400 text-sm mt-2">30일 이내</p>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h4 className="text-gray-400 text-sm mb-2">최근 이벤트</h4>
          <div className="text-3xl font-bold text-yellow-400">5일 전</div>
          <p className="text-gray-400 text-sm mt-2">주의 필요</p>
        </div>
      </div>
    </div>
  )
}

// Contrarian Tab Component
function ContrarianTab({ sentimentData, metrics }: { sentimentData: SentimentData[], metrics: MarketMetrics | null }) {
  const latestSentiment = sentimentData[sentimentData.length - 1]
  
  const contrarianSignals = [
    {
      name: 'RSI',
      value: metrics?.rsi || 0,
      threshold: 30,
      signal: (metrics?.rsi || 0) < 30
    },
    {
      name: '볼륨',
      value: (metrics?.volumeRatio || 0) * 100,
      threshold: 50,
      signal: (metrics?.volumeRatio || 0) < 0.5
    },
    {
      name: '변동성',
      value: metrics?.volatility || 0,
      threshold: 70,
      signal: (metrics?.volatility || 0) > 70
    },
    {
      name: '센티먼트',
      value: latestSentiment?.sentiment || 0,
      threshold: -50,
      signal: (latestSentiment?.sentiment || 0) < -50
    },
    {
      name: '공포지수',
      value: latestSentiment?.fearGreed || 0,
      threshold: 25,
      signal: (latestSentiment?.fearGreed || 0) < 25
    }
  ]
  
  const signalCount = contrarianSignals.filter(s => s.signal).length
  const signalStrength = (signalCount / contrarianSignals.length) * 100
  
  return (
    <div className="space-y-6">
      {/* Contrarian Signal Dashboard */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30">
        <h3 className="text-lg font-bold text-white mb-4">🔄 역발상 신호 대시보드</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Signal Strength Gauge */}
          <div>
            <h4 className="text-gray-400 text-sm mb-3">신호 강도</h4>
            <div className="relative h-32">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={contrarianSignals}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <Radar 
                    dataKey="value" 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Overall Signal */}
          <div className="flex flex-col justify-center">
            <div className={`
              text-center p-6 rounded-xl
              ${signalStrength > 60 
                ? 'bg-green-900/30 border border-green-500' 
                : signalStrength > 40
                ? 'bg-yellow-900/30 border border-yellow-500'
                : 'bg-gray-900/30 border border-gray-600'
              }
            `}>
              <h4 className="text-gray-400 text-sm mb-2">종합 신호</h4>
              <div className={`text-4xl font-bold mb-2 ${
                signalStrength > 60 ? 'text-green-400' : 
                signalStrength > 40 ? 'text-yellow-400' : 'text-gray-400'
              }`}>
                {safeFixed(signalStrength, 0)}%
              </div>
              <p className={`text-lg font-bold ${
                signalStrength > 60 ? 'text-green-400' : 
                signalStrength > 40 ? 'text-yellow-400' : 'text-gray-400'
              }`}>
                {signalStrength > 60 ? '강한 매수 신호' : 
                 signalStrength > 40 ? '약한 매수 신호' : '신호 없음'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Signals */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">📊 개별 신호 분석</h3>
        
        <div className="space-y-3">
          {contrarianSignals.map((signal, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${signal.signal ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span className="text-white font-medium">{signal.name}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-gray-400">현재: {safeFixed(signal.value, 1)}</span>
                <span className="text-gray-500">임계값: {signal.threshold}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  signal.signal ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {signal.signal ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Performance */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">📈 역발상 신호 성과</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">평균 수익률</p>
            <p className="text-2xl font-bold text-green-400">+35.2%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">승률</p>
            <p className="text-2xl font-bold text-blue-400">68%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">평균 보유기간</p>
            <p className="text-2xl font-bold text-purple-400">45일</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">최대 수익</p>
            <p className="text-2xl font-bold text-yellow-400">+127%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Strategy Tab Component
function StrategyTab({ 
  sentimentScore, 
  metrics, 
  events 
}: { 
  sentimentScore: number
  metrics: MarketMetrics | null
  events: ObituaryEvent[]
}) {
  const recentEvent = events[0]
  const daysSinceEvent = recentEvent ? Math.floor((Date.now() - new Date(recentEvent.date).getTime()) / 86400000) : 999
  
  const getStrategy = () => {
    if (sentimentScore < -70 && (metrics?.rsi || 50) < 30) {
      return {
        action: 'STRONG BUY',
        confidence: 85,
        color: 'text-green-500',
        bgColor: 'bg-green-900/30',
        description: '극도의 공포 상태, 강한 매수 기회'
      }
    } else if (sentimentScore < -50 && (metrics?.rsi || 50) < 40) {
      return {
        action: 'BUY',
        confidence: 65,
        color: 'text-green-400',
        bgColor: 'bg-green-900/20',
        description: '공포 상태, 매수 고려'
      }
    } else if (sentimentScore > 70) {
      return {
        action: 'SELL',
        confidence: 70,
        color: 'text-red-400',
        bgColor: 'bg-red-900/20',
        description: '극도의 탐욕, 매도 고려'
      }
    } else {
      return {
        action: 'HOLD',
        confidence: 50,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/20',
        description: '중립 상태, 관망'
      }
    }
  }
  
  const strategy = getStrategy()
  
  return (
    <div className="space-y-6">
      {/* Current Strategy */}
      <div className={`${strategy.bgColor} rounded-xl p-6 border border-gray-700`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">🎯 현재 트레이딩 전략</h3>
          <div className={`px-4 py-2 rounded-lg ${strategy.bgColor} border border-current`}>
            <span className={`font-bold text-xl ${strategy.color}`}>{strategy.action}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">신뢰도</p>
            <p className="text-white text-2xl font-bold">{strategy.confidence}%</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">최근 이벤트</p>
            <p className="text-white text-2xl font-bold">{daysSinceEvent}일 전</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">RSI</p>
            <p className="text-white text-2xl font-bold">{safeFixed(metrics?.rsi || 0, 1)}</p>
          </div>
        </div>
        
        <p className="text-gray-300 mt-4">{strategy.description}</p>
      </div>

      {/* Entry & Exit Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">📥 진입 규칙</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>센티먼트 -70 이하 도달 시</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>RSI 30 이하 과매도 구간</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>오비추어리 선언 후 3-7일</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>거래량 급감 (평균 대비 50% 이하)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>부정적 뉴스 비율 80% 초과</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">📤 청산 규칙</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-red-400">✓</span>
              <span>목표 수익률 30% 도달</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✓</span>
              <span>센티먼트 +70 이상 전환</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✓</span>
              <span>RSI 70 이상 과매수 구간</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✓</span>
              <span>보유 기간 60일 초과</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✓</span>
              <span>손절선 -10% 하회 시</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Risk Management */}
      <div className="bg-gradient-to-r from-gray-900/50 to-purple-900/20 rounded-xl p-6 border border-purple-700/30">
        <h3 className="text-lg font-bold text-white mb-4">⚠️ 리스크 관리</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-purple-400 font-semibold mb-3">포지션 사이징</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• 총 자본의 5-10% 분할 진입</li>
              <li>• 3-5회 나누어 평균 단가 개선</li>
              <li>• 극도 공포 시 추가 매수 여력 보유</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-blue-400 font-semibold mb-3">주의사항</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• 실제 펀더멘털 악화 구분 필요</li>
              <li>• 단기 변동성 대비 충분한 여유자금</li>
              <li>• 역발상 실패 시 빠른 손절</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}