'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaChartBar, FaBell, FaFireAlt, FaWater, FaBalanceScale, 
  FaChartLine, FaBrain, FaExchangeAlt, FaHistory, FaCog, 
  FaTelegram, FaClock, FaFilter, FaSync, FaInfoCircle, 
  FaPlay, FaPause, FaExpand, FaCompress, FaArrowUp, FaArrowDown,
  FaEye, FaBookOpen, FaRocket, FaShieldAlt, FaLightbulb
} from 'react-icons/fa'
import dynamic from 'next/dynamic'
const CoinSelector = dynamic(
  () => import('./components/CoinSelector'),
  { 
    ssr: false,
    loading: () => <div className="h-24 bg-gray-800/50 animate-pulse rounded-lg mb-6" />
  }
)

const ConceptGuide = dynamic(
  () => import('./components/ConceptGuide'),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
  }
)

const ImbalanceIndicator = dynamic(
  () => import('./components/ImbalanceIndicator'),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-800/50 animate-pulse rounded-lg" />
  }
)

const TradingStrategy = dynamic(
  () => import('./components/TradingStrategy'),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
  }
)
import { useOrderbookWebSocket } from './hooks/useOrderbookWebSocket'
import { useOrderbookAnalysis } from './hooks/useOrderbookAnalysis'

const PriceImpactCalculator = dynamic(
  () => import('./components/PriceImpactCalculator'),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
  }
)

const OrderFlowAnimation = dynamic(
  () => import('./components/OrderFlowAnimation'),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
  }
)

// 동적 임포트로 성능 최적화
const OrderbookHeatmap = dynamic(
  () => import('./components/OrderbookHeatmap'),
  { ssr: false, loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" /> }
)

const DynamicsAnalysis = dynamic(
  () => import('./components/DynamicsAnalysis'),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
  }
)

const LiquidityDepth = dynamic(
  () => import('./components/LiquidityDepth'),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
  }
)

const WhaleDetector = dynamic(
  () => import('./components/WhaleDetector'),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
  }
)

const MomentumPredictor = dynamic(
  () => import('./components/MomentumPredictor'),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
  }
)

const HistoricalReplay = dynamic(
  () => import('./components/HistoricalReplay'),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
  }
)

const PriceImpactCalculator = dynamic(
  () => import('./components/PriceImpactCalculator'),
  { ssr: false }
)

const OrderFlowAnimation = dynamic(
  () => import('./components/OrderFlowAnimation'),
  { ssr: false }
)

// 타입 정의
interface OrderbookLevel {
  price: number
  amount: number
  total: number
  percentage?: number
}

interface OrderbookData {
  bids: OrderbookLevel[]
  asks: OrderbookLevel[]
  lastUpdateId: number
  spread: number
  spreadPercent: number
  bestBid: number
  bestAsk: number
  timestamp?: number
}

interface OrderbookStats {
  bidVolume: number
  askVolume: number
  imbalance: number
  pressure: number
  momentum: 'bullish' | 'bearish' | 'neutral'
  largestBid: OrderbookLevel | null
  largestAsk: OrderbookLevel | null
  wallsDetected: {
    bidWalls: OrderbookLevel[]
    askWalls: OrderbookLevel[]
  }
  liquidityScore: number
  executionRisk: 'low' | 'medium' | 'high'
}

export default function OrderbookHeatmapUltimate() {
  // 추적할 상위 10개 코인
  const TRACKED_SYMBOLS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
    'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT', 'DOTUSDT'
  ]
  
  // 상태 관리
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  const [orderbook, setOrderbook] = useState<OrderbookData | null>(null)
  const [stats, setStats] = useState<OrderbookStats | null>(null)
  const [activeTab, setActiveTab] = useState('heatmap')
  const [depthLevel, setDepthLevel] = useState(20)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D')
  const [showAnimation, setShowAnimation] = useState(true)
  const [historicalData, setHistoricalData] = useState<OrderbookData[]>([])
  
  // 각 코인별 오더북 데이터 저장
  const [orderbookBySymbol, setOrderbookBySymbol] = useState<Record<string, OrderbookData>>({})
  
  // WebSocket 연결 및 데이터 처리
  const { 
    isConnected, 
    orderbookData,
    priceData,
    reconnect 
  } = useOrderbookWebSocket(selectedSymbol, depthLevel)
  
  // 오더북 분석
  const analysis = useOrderbookAnalysis(orderbook)
  
  // 오더북 데이터 업데이트
  useEffect(() => {
    if (orderbookData) {
      setOrderbook(orderbookData)
      
      // 심볼별로 저장
      setOrderbookBySymbol(prev => ({
        ...prev,
        [selectedSymbol]: orderbookData
      }))
      
      // 히스토리 데이터 추가 (최대 100개)
      setHistoricalData(prev => {
        const newData = [...prev, { ...orderbookData, timestamp: Date.now() }]
        return newData.slice(-100)
      })
    }
  }, [orderbookData, selectedSymbol])
  
  // 가격 데이터 업데이트
  useEffect(() => {
    if (priceData) {
      setCurrentPrice(priceData.price)
      setPriceChange(priceData.change)
    }
  }, [priceData])
  
  // 통계 업데이트
  useEffect(() => {
    if (analysis) {
      setStats(analysis)
    }
  }, [analysis])
  
  // 심볼 변경 시 저장된 데이터 복원
  useEffect(() => {
    const savedData = orderbookBySymbol[selectedSymbol]
    if (savedData) {
      setOrderbook(savedData)
    }
    setHistoricalData([]) // 심볼 변경 시 히스토리 초기화
  }, [selectedSymbol, orderbookBySymbol])

  // 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'heatmap':
        return (
          <div className="space-y-6">
            <OrderbookHeatmap 
              orderbook={orderbook}
              viewMode={viewMode}
              showAnimation={showAnimation}
              symbol={selectedSymbol}
              currentPrice={currentPrice}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ImbalanceIndicator 
                stats={stats}
                orderbook={orderbook}
              />
              <WhaleDetector
                orderbook={orderbook}
                stats={stats}
                symbol={selectedSymbol}
              />
            </div>
          </div>
        )
      
      case 'dynamics':
        return (
          <div className="space-y-6">
            <DynamicsAnalysis 
              orderbook={orderbook}
              historicalData={historicalData}
              symbol={selectedSymbol}
            />
            <OrderFlowAnimation
              orderbook={orderbook}
              showAnimation={showAnimation}
            />
          </div>
        )
      
      case 'liquidity':
        return (
          <div className="space-y-6">
            <LiquidityDepth 
              orderbook={orderbook}
              symbol={selectedSymbol}
              currentPrice={currentPrice}
            />
            <PriceImpactCalculator
              orderbook={orderbook}
              currentPrice={currentPrice}
            />
          </div>
        )
      
      case 'strategy':
        return (
          <TradingStrategy 
            orderbook={orderbook}
            stats={stats}
            symbol={selectedSymbol}
            currentPrice={currentPrice}
            priceChange={priceChange}
          />
        )
      
      case 'momentum':
        return (
          <MomentumPredictor
            orderbook={orderbook}
            historicalData={historicalData}
            stats={stats}
            symbol={selectedSymbol}
          />
        )
      
      case 'replay':
        return (
          <HistoricalReplay
            historicalData={historicalData}
            symbol={selectedSymbol}
          />
        )
      
      case 'concept':
        return (
          <ConceptGuide />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-2 sm:p-4 lg:p-6">
      <div className="max-w-8xl mx-auto">
        {/* 헤더 */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-6 border border-gray-700/50">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <FaChartBar className="text-purple-500" />
                오더북 히트맵 전문 분석
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                실시간 호가창 분석과 AI 기반 매매 전략
              </p>
            </div>
            
            {/* 컨트롤 패널 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 2D/3D 토글 */}
              <button
                onClick={() => setViewMode(viewMode === '2D' ? '3D' : '2D')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === '3D'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {viewMode === '3D' ? <FaExpand /> : <FaCompress />}
                <span className="ml-2">{viewMode}</span>
              </button>
              
              {/* 애니메이션 토글 */}
              <button
                onClick={() => setShowAnimation(!showAnimation)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showAnimation
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {showAnimation ? <FaPlay /> : <FaPause />}
                <span className="ml-2 hidden sm:inline">애니메이션</span>
              </button>
              
              {/* 연결 상태 */}
              <div className={`px-4 py-2 rounded-lg font-medium ${
                isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <span className="text-sm">
                  {isConnected ? '● 실시간' : '○ 연결끊김'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 코인 선택기 */}
        <CoinSelector
          symbols={TRACKED_SYMBOLS}
          selectedSymbol={selectedSymbol}
          onSelectSymbol={setSelectedSymbol}
          priceData={{
            price: currentPrice,
            change: priceChange
          }}
        />

        {/* 탭 네비게이션 */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-2 mb-6 border border-gray-700/50">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'heatmap', label: '히트맵', icon: <FaChartBar /> },
              { id: 'dynamics', label: '다이나믹스', icon: <FaFireAlt /> },
              { id: 'liquidity', label: '유동성', icon: <FaWater /> },
              { id: 'strategy', label: '전략', icon: <FaBrain /> },
              { id: 'momentum', label: '모멘텀', icon: <FaRocket /> },
              { id: 'replay', label: '리플레이', icon: <FaHistory /> },
              { id: 'concept', label: '개념', icon: <FaBookOpen /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 하단 정보 */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 스프레드 정보 */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">스프레드</span>
              <FaBalanceScale className="text-purple-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">
                ${orderbook?.spread.toFixed(2) || '0.00'}
              </span>
              <span className="text-sm text-gray-400 ml-2">
                ({orderbook?.spreadPercent.toFixed(3) || '0.000'}%)
              </span>
            </div>
          </div>

          {/* 매수/매도 압력 */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">압력 지표</span>
              <FaChartLine className="text-green-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">
                {stats?.pressure || 0}%
              </span>
              <span className={`text-sm ml-2 ${
                stats?.momentum === 'bullish' ? 'text-green-400' : 
                stats?.momentum === 'bearish' ? 'text-red-400' : 
                'text-gray-400'
              }`}>
                {stats?.momentum === 'bullish' ? '매수 우세' :
                 stats?.momentum === 'bearish' ? '매도 우세' :
                 '중립'}
              </span>
            </div>
          </div>

          {/* 유동성 점수 */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">유동성</span>
              <FaWater className="text-blue-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">
                {stats?.liquidityScore || 0}
              </span>
              <span className="text-sm text-gray-400 ml-2">
                / 100
              </span>
            </div>
          </div>

          {/* 실행 리스크 */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">실행 리스크</span>
              <FaShieldAlt className={
                stats?.executionRisk === 'low' ? 'text-green-400' :
                stats?.executionRisk === 'medium' ? 'text-yellow-400' :
                'text-red-400'
              } />
            </div>
            <div className="mt-2">
              <span className={`text-2xl font-bold ${
                stats?.executionRisk === 'low' ? 'text-green-400' :
                stats?.executionRisk === 'medium' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {stats?.executionRisk === 'low' ? '낮음' :
                 stats?.executionRisk === 'medium' ? '보통' :
                 '높음'}
              </span>
            </div>
          </div>
        </div>

        {/* 도움말 */}
        <div className="mt-6 bg-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-blue-400 text-xl mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">오더북 히트맵이란?</h3>
              <p className="text-gray-300 text-sm">
                오더북 히트맵은 현재 시장의 매수/매도 주문을 시각적으로 표현한 것입니다. 
                색상의 강도는 주문량을 나타내며, 큰 주문(벽)을 쉽게 식별할 수 있습니다. 
                이를 통해 지지/저항 레벨을 파악하고 최적의 진입 시점을 찾을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}