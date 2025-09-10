'use client'

import '@/lib/debugFetch' // JSON 파싱 에러 디버깅
import { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaRobot, FaChartLine, FaCode, FaPlay, FaHistory, 
  FaBook, FaBrain, FaShieldAlt, FaCalculator, FaBriefcase,
  FaBell, FaLightbulb, FaCogs, FaRocket
} from 'react-icons/fa'
import { ModuleWebSocket, safeApiCall, ModulePerformance } from '@/lib/moduleUtils'
import { BINANCE_CONFIG, binanceAPI } from '@/lib/binanceConfig'
import { config } from '@/lib/config'
import dynamic from 'next/dynamic'

// 동적 임포트로 성능 최적화
const TradingChart = dynamic(() => import('./components/SimpleTradingChart'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
})

const NoCodeBuilder = dynamic(() => import('./components/NoCodeBuilder'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
})

const CodeEditor = dynamic(() => import('./components/CodeEditor'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
})

const BacktestEngine = dynamic(() => import('./components/BacktestEngine'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
})

const LiveMonitor = dynamic(() => import('./components/LiveMonitor'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
})

const TemplateLibrary = dynamic(() => import('./components/TemplateLibrary'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
})

const AIRecommender = dynamic(() => import('./components/AIRecommender'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
})

const RiskManager = dynamic(() => import('./components/RiskManager'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
})

const ProfitCalculator = dynamic(() => import('./components/ProfitCalculator'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
})

const PortfolioManager = dynamic(() => import('./components/PortfolioManager'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
})

const AlertSettings = dynamic(() => import('./components/AlertSettings'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
})

const TradingGuide = dynamic(() => import('./components/TradingGuide'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
})

const ConceptExplainer = dynamic(() => import('./components/ConceptExplainer'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />
})

// 10개 주요 코인 목록
const SUPPORTED_COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿', color: 'orange' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ', color: 'blue' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: 'BNB', color: 'yellow' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: 'SOL', color: 'purple' },
  { symbol: 'XRPUSDT', name: 'Ripple', icon: 'XRP', color: 'gray' },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: 'ADA', color: 'blue' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'DOGE', color: 'yellow' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: 'AVAX', color: 'red' },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: 'DOT', color: 'pink' },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: 'MATIC', color: 'purple' }
]

// 섹션 정의
const SECTIONS = [
  { id: 'concept', name: '전략 개념', icon: FaBook },
  { id: 'chart', name: '실시간 차트', icon: FaChartLine },
  { id: 'nocode', name: '노코드 빌더', icon: FaCogs },
  { id: 'code', name: '코드 에디터', icon: FaCode },
  { id: 'backtest', name: '백테스팅', icon: FaHistory },
  { id: 'live', name: '실시간 실행', icon: FaPlay },
  { id: 'templates', name: '템플릿', icon: FaLightbulb },
  { id: 'ai', name: 'AI 추천', icon: FaBrain },
  { id: 'risk', name: '리스크 관리', icon: FaShieldAlt },
  { id: 'profit', name: '수익 계산', icon: FaCalculator },
  { id: 'portfolio', name: '포트폴리오', icon: FaBriefcase },
  { id: 'alerts', name: '알림 설정', icon: FaBell },
  { id: 'guide', name: '트레이딩 가이드', icon: FaRocket }
]

interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
}

export default function StrategyBuilderModule() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [activeSection, setActiveSection] = useState('concept')
  const [loading, setLoading] = useState(true)
  const [strategyMode, setStrategyMode] = useState<'nocode' | 'code'>('nocode')
  const [showScrollTop, setShowScrollTop] = useState(false)
  
  const wsRef = useRef<ModuleWebSocket | null>(null)
  const performance = useRef(new ModulePerformance('StrategyBuilder'))
  
  // WebSocket 연결 관리
  useEffect(() => {
    const connectWebSocket = () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
      
      wsRef.current = new ModuleWebSocket('StrategyBuilder')
      
      // 실시간 가격 스트림
      const wsUrl = `wss://stream.binance.com:9443/ws/${selectedCoin.toLowerCase()}@ticker`
      wsRef.current.connect(wsUrl, (data) => {
        setMarketData({
          symbol: selectedCoin,
          price: parseFloat(data.c),
          change24h: parseFloat(data.P),
          volume24h: parseFloat(data.v),
          high24h: parseFloat(data.h),
          low24h: parseFloat(data.l)
        })
      })
    }
    
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
    }
  }, [selectedCoin])
  
  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      
      try {
        // 24시간 티커 정보 가져오기
        const { data: ticker } = await safeApiCall(
          () => binanceAPI.get24hrTicker(selectedCoin),
          null,
          'StrategyBuilder'
        )
        
        if (ticker) {
          setMarketData({
            symbol: selectedCoin,
            price: parseFloat(ticker.lastPrice),
            change24h: parseFloat(ticker.priceChangePercent),
            volume24h: parseFloat(ticker.volume),
            high24h: parseFloat(ticker.highPrice),
            low24h: parseFloat(ticker.lowPrice)
          })
        }
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [selectedCoin])
  
  // 스크롤 감지하여 상단 바로가기 버튼 표시/숨김
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setShowScrollTop(scrollTop > 300)
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll() // 초기 상태 설정
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  
  const currentCoin = SUPPORTED_COINS.find(coin => coin.symbol === selectedCoin)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 헤더 - 코인 선택 탭 */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* 모바일 드롭다운 */}
          <div className="sm:hidden mb-4">
            <select
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700"
            >
              {SUPPORTED_COINS.map(coin => (
                <option key={coin.symbol} value={coin.symbol}>
                  {coin.icon} {coin.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* 데스크톱 탭 */}
          <div className="hidden sm:flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">
            {SUPPORTED_COINS.map(coin => (
              <motion.button
                key={coin.symbol}
                onClick={() => setSelectedCoin(coin.symbol)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                  selectedCoin === coin.symbol
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg font-bold">{coin.icon}</span>
                <span className="hidden lg:inline">{coin.name}</span>
              </motion.button>
            ))}
          </div>
          
          {/* 현재 가격 정보 */}
          {marketData && (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="text-gray-400">현재가:</span>
                <span className="ml-2 text-xl font-bold text-white">
                  ${marketData.price.toLocaleString()}
                </span>
              </div>
              <div className={`${marketData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {marketData.change24h >= 0 ? '▲' : '▼'} {Math.abs(marketData.change24h).toFixed(2)}%
              </div>
              <div className="text-gray-400">
                거래량: ${(marketData.volume24h * marketData.price / 1000000).toFixed(2)}M
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 섹션 네비게이션 */}
      <div className="sticky top-[120px] sm:top-[100px] z-40 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-thin scrollbar-thumb-gray-700">
            {SECTIONS.map(section => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id)
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                    activeSection === section.id
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500'
                      : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <Icon className="text-sm" />
                  <span className="text-xs sm:text-sm">{section.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* 1. 전략 개념 섹션 */}
        <section id="concept" className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <FaBook className="text-2xl text-purple-400" />
            <h2 className="text-2xl font-bold text-white">전략 개념 & 교육</h2>
          </div>
          <ConceptExplainer coin={currentCoin} />
        </section>
        
        {/* 2. 실시간 차트 섹션 */}
        <section id="chart" className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <FaChartLine className="text-2xl text-blue-400" />
            <h2 className="text-2xl font-bold text-white">실시간 차트 & 기술적 지표</h2>
          </div>
          <TradingChart symbol={selectedCoin} />
        </section>
        
        {/* 3. 전략 빌더 섹션 (노코드/코드 전환) */}
        <section id="builder" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaCogs className="text-2xl text-green-400" />
              <h2 className="text-2xl font-bold text-white">전략 빌더</h2>
            </div>
            <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setStrategyMode('nocode')}
                className={`px-4 py-2 rounded-md transition-all ${
                  strategyMode === 'nocode'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                노코드
              </button>
              <button
                onClick={() => setStrategyMode('code')}
                className={`px-4 py-2 rounded-md transition-all ${
                  strategyMode === 'code'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                코드
              </button>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {strategyMode === 'nocode' ? (
              <motion.div
                key="nocode"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <NoCodeBuilder symbol={selectedCoin} />
              </motion.div>
            ) : (
              <motion.div
                key="code"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CodeEditor symbol={selectedCoin} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        
        {/* 4. 백테스팅 섹션 */}
        <section id="backtest" className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <FaHistory className="text-2xl text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">백테스팅 엔진</h2>
          </div>
          <BacktestEngine symbol={selectedCoin} />
        </section>
        
        {/* 5. 실시간 실행 모니터 */}
        <section id="live" className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <FaPlay className="text-2xl text-red-400" />
            <h2 className="text-2xl font-bold text-white">실시간 실행 모니터</h2>
          </div>
          <LiveMonitor symbol={selectedCoin} />
        </section>
        
        {/* 6. 전략 템플릿 라이브러리 */}
        <section id="templates" className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <FaLightbulb className="text-2xl text-orange-400" />
            <h2 className="text-2xl font-bold text-white">전략 템플릿 라이브러리</h2>
          </div>
          <TemplateLibrary 
            onSelectTemplate={(template) => {
              console.log('Template selected:', template)
              // 템플릿 선택 시 처리 로직
            }} 
          />
        </section>
        
        {/* 7. AI 전략 추천 */}
        <section id="ai" className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <FaBrain className="text-2xl text-pink-400" />
            <h2 className="text-2xl font-bold text-white">AI 전략 추천</h2>
          </div>
          <AIRecommender symbol={selectedCoin} marketData={marketData} />
        </section>
        
        {/* 8. 리스크 관리 도구 */}
        <section id="risk" className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <FaShieldAlt className="text-2xl text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">리스크 관리 도구</h2>
          </div>
          <RiskManager symbol={selectedCoin} />
        </section>
        
        {/* 9. 수익 계산기 */}
        <section id="profit" className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <FaCalculator className="text-2xl text-green-400" />
            <h2 className="text-2xl font-bold text-white">수익 계산기</h2>
          </div>
          <ProfitCalculator symbol={selectedCoin} currentPrice={marketData?.price || 0} />
        </section>
        
        {/* 9-1. 코드 에디터 */}
        <section id="code" className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <FaCode className="text-2xl text-blue-400" />
            <h2 className="text-2xl font-bold text-white">코드 에디터</h2>
          </div>
          <CodeEditor />
        </section>
        
        {/* 10. 포트폴리오 관리 */}
        <section id="portfolio" className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <FaBriefcase className="text-2xl text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">포트폴리오 관리</h2>
          </div>
          <PortfolioManager selectedCoin={selectedCoin} />
        </section>
        
        {/* 11. 알림 설정 */}
        <section id="alerts" className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <FaBell className="text-2xl text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">알림 설정</h2>
          </div>
          <AlertSettings symbol={selectedCoin} />
        </section>
        
        {/* 12. 실전 트레이딩 가이드 */}
        <section id="guide" className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <FaRocket className="text-2xl text-purple-400" />
            <h2 className="text-2xl font-bold text-white">실전 트레이딩 가이드</h2>
          </div>
          <TradingGuide symbol={selectedCoin} marketData={marketData} />
        </section>
      </div>
      
      {/* 상단 바로가기 버튼 */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div 
            className="fixed bottom-6 right-6 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              className="w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm bg-opacity-90"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              title="상단으로 이동"
            >
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 10l7-7m0 0l7 7m-7-7v18" 
                />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}