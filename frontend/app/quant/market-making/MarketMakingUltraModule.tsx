'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { FaBook, FaChartBar, FaChartLine, FaCog, FaHistory, FaWallet, FaShieldAlt, FaBrain, FaLayerGroup, FaWater } from 'react-icons/fa'

// 컴포넌트 동적 임포트
const CoinSelector = dynamic(() => import('./components/CoinSelector'), { ssr: false })
const MarketMakingGuide = dynamic(() => import('./components/MarketMakingGuide'), { ssr: false })
const OrderBookAnalyzer = dynamic(() => import('./components/OrderBookAnalyzer'), { ssr: false })
const SpreadAnalysisTool = dynamic(() => import('./components/SpreadAnalysisTool'), { ssr: false })
const LiquidityChart = dynamic(() => import('./components/LiquidityChart'), { ssr: false })
const ProfitSimulator = dynamic(() => import('./components/ProfitSimulator'), { ssr: false })
const PositionMonitor = dynamic(() => import('./components/PositionMonitor'), { ssr: false })
const RiskDashboard = dynamic(() => import('./components/RiskDashboard'), { ssr: false })
const MarketDepthAnalyzer = dynamic(() => import('./components/MarketDepthAnalyzer'), { ssr: false })
const MMOptimizationTool = dynamic(() => import('./components/MMOptimizationTool'), { ssr: false })

// 10개 주요 코인 정보
export const MAJOR_COINS = [
  { symbol: 'BTC', fullSymbol: 'BTCUSDT', name: '비트코인', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  { symbol: 'ETH', fullSymbol: 'ETHUSDT', name: '이더리움', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { symbol: 'BNB', fullSymbol: 'BNBUSDT', name: '바이낸스코인', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  { symbol: 'SOL', fullSymbol: 'SOLUSDT', name: '솔라나', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { symbol: 'XRP', fullSymbol: 'XRPUSDT', name: '리플', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  { symbol: 'ADA', fullSymbol: 'ADAUSDT', name: '카르다노', color: 'text-blue-300', bgColor: 'bg-blue-300/20' },
  { symbol: 'DOGE', fullSymbol: 'DOGEUSDT', name: '도지코인', color: 'text-yellow-300', bgColor: 'bg-yellow-300/20' },
  { symbol: 'AVAX', fullSymbol: 'AVAXUSDT', name: '아발란체', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  { symbol: 'DOT', fullSymbol: 'DOTUSDT', name: '폴카닷', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  { symbol: 'MATIC', fullSymbol: 'MATICUSDT', name: '폴리곤', color: 'text-purple-300', bgColor: 'bg-purple-300/20' }
]

// 섹션 정보
const SECTIONS = [
  { id: 'guide', title: '마켓 메이킹 개념', icon: <FaBook />, component: 'MarketMakingGuide' },
  { id: 'orderbook', title: '오더북 분석', icon: <FaChartBar />, component: 'OrderBookAnalyzer' },
  { id: 'spread', title: '스프레드 분석', icon: <FaChartLine />, component: 'SpreadAnalysisTool' },
  { id: 'liquidity', title: '유동성 차트', icon: <FaWater />, component: 'LiquidityChart' },
  { id: 'depth', title: '시장 심도', icon: <FaLayerGroup />, component: 'MarketDepthAnalyzer' },
  { id: 'profit', title: '수익 시뮬레이터', icon: <FaHistory />, component: 'ProfitSimulator' },
  { id: 'positions', title: '포지션 모니터', icon: <FaWallet />, component: 'PositionMonitor' },
  { id: 'risk', title: '리스크 관리', icon: <FaShieldAlt />, component: 'RiskDashboard' },
  { id: 'optimize', title: 'AI 최적화', icon: <FaBrain />, component: 'MMOptimizationTool' }
]

export default function MarketMakingUltraModule() {
  const [selectedCoin, setSelectedCoin] = useState(MAJOR_COINS[0])
  const [activeSection, setActiveSection] = useState('guide')
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // 초기 로딩 완료
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const renderSection = () => {
    const sectionMap = {
      'guide': <MarketMakingGuide selectedCoin={selectedCoin} />,
      'orderbook': <OrderBookAnalyzer selectedCoin={selectedCoin} />,
      'spread': <SpreadAnalysisTool selectedCoin={selectedCoin} />,
      'liquidity': <LiquidityChart selectedCoin={selectedCoin} />,
      'depth': <MarketDepthAnalyzer selectedCoin={selectedCoin} />,
      'profit': <ProfitSimulator selectedCoin={selectedCoin} />,
      'positions': <PositionMonitor selectedCoin={selectedCoin} />,
      'risk': <RiskDashboard selectedCoin={selectedCoin} />,
      'optimize': <MMOptimizationTool selectedCoin={selectedCoin} />
    }

    return sectionMap[activeSection] || null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">마켓 메이킹 모듈 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 헤더 */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-800"
              >
                <div className="space-y-1">
                  <div className="w-5 h-0.5 bg-gray-400"></div>
                  <div className="w-5 h-0.5 bg-gray-400"></div>
                  <div className="w-5 h-0.5 bg-gray-400"></div>
                </div>
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Link href="/" className="hover:text-white">홈</Link>
                <span>/</span>
                <Link href="/quant" className="hover:text-white">퀀트 전략</Link>
                <span>/</span>
                <span className="text-white">마켓 메이킹</span>
              </div>
            </div>
            <h1 className="text-xl font-bold text-white hidden md:block">
              🎯 마켓 메이킹 전문 분석
            </h1>
          </div>
        </div>
      </div>

      {/* 코인 선택기 */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <CoinSelector
          coins={MAJOR_COINS}
          selectedCoin={selectedCoin}
          onSelectCoin={(coin) => setSelectedCoin(coin)}
        />
      </div>

      <div className="flex">
        {/* 사이드바 */}
        <aside className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900/95 backdrop-blur-sm lg:bg-transparent transition-transform duration-300 ease-in-out lg:transition-none`}>
          <div className="h-full overflow-y-auto pt-20 lg:pt-0 px-4">
            <nav className="space-y-2">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id)
                    setIsSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{section.icon}</span>
                  <span className="font-medium">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-6xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>

      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}