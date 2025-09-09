'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { FaRobot, FaChartLine, FaCog, FaHistory, FaWallet, FaChartBar, FaShieldAlt, FaBrain, FaInfoCircle } from 'react-icons/fa'

// 컴포넌트 동적 임포트
const CoinSelector = dynamic(() => import('./components/CoinSelector'), { ssr: false })
const GridBotConceptGuide = dynamic(() => import('./components/GridBotConceptGuide'), { ssr: false })
const GridSetupTool = dynamic(() => import('./components/GridSetupTool'), { ssr: false })
const RealTimeGridChart = dynamic(() => import('./components/RealTimeGridChart'), { ssr: false })
const BacktestResults = dynamic(() => import('./components/BacktestResults'), { ssr: false })
const ActivePositions = dynamic(() => import('./components/ActivePositions'), { ssr: false })
const ProfitAnalysis = dynamic(() => import('./components/ProfitAnalysis'), { ssr: false })
const RiskManagement = dynamic(() => import('./components/RiskManagement'), { ssr: false })
const OptimizationTool = dynamic(() => import('./components/OptimizationTool'), { ssr: false })
const MarketConditionAnalyzer = dynamic(() => import('./components/MarketConditionAnalyzer'), { ssr: false })

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
  { id: 'concept', title: '그리드 봇 개념', icon: <FaInfoCircle />, component: 'GridBotConceptGuide' },
  { id: 'market', title: '시장 상황 분석', icon: <FaChartLine />, component: 'MarketConditionAnalyzer' },
  { id: 'setup', title: '그리드 설정', icon: <FaCog />, component: 'GridSetupTool' },
  { id: 'chart', title: '실시간 차트', icon: <FaChartLine />, component: 'RealTimeGridChart' },
  { id: 'backtest', title: '백테스트', icon: <FaHistory />, component: 'BacktestResults' },
  { id: 'positions', title: '활성 포지션', icon: <FaWallet />, component: 'ActivePositions' },
  { id: 'profit', title: '수익 분석', icon: <FaChartBar />, component: 'ProfitAnalysis' },
  { id: 'risk', title: '리스크 관리', icon: <FaShieldAlt />, component: 'RiskManagement' },
  { id: 'optimize', title: 'AI 최적화', icon: <FaBrain />, component: 'OptimizationTool' }
]

export default function GridBotUltraModule() {
  const [selectedCoin, setSelectedCoin] = useState(MAJOR_COINS[0].symbol)
  const [activeSection, setActiveSection] = useState('concept')
  const [isLoading, setIsLoading] = useState(true)

  // 선택된 코인 정보 가져오기
  const selectedCoinInfo = MAJOR_COINS.find(coin => coin.symbol === selectedCoin) || MAJOR_COINS[0]

  useEffect(() => {
    // 초기 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // 섹션별 컴포넌트 렌더링
  const renderSection = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">데이터 로딩 중...</p>
          </div>
        </div>
      )
    }

    switch (activeSection) {
      case 'concept':
        return <GridBotConceptGuide selectedCoin={selectedCoinInfo} />
      case 'market':
        return <MarketConditionAnalyzer selectedCoin={selectedCoinInfo} />
      case 'setup':
        return <GridSetupTool selectedCoin={selectedCoinInfo} />
      case 'chart':
        return <RealTimeGridChart selectedCoin={selectedCoinInfo} />
      case 'backtest':
        return <BacktestResults selectedCoin={selectedCoinInfo} />
      case 'positions':
        return <ActivePositions selectedCoin={selectedCoinInfo} />
      case 'profit':
        return <ProfitAnalysis selectedCoin={selectedCoinInfo} />
      case 'risk':
        return <RiskManagement selectedCoin={selectedCoinInfo} />
      case 'optimize':
        return <OptimizationTool selectedCoin={selectedCoinInfo} />
      default:
        return <GridBotConceptGuide selectedCoin={selectedCoinInfo} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 헤더 */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* 브레드크럼 */}
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">홈</Link>
            <span className="text-gray-600">/</span>
            <Link href="/quant" className="text-gray-400 hover:text-white transition-colors">퀀트 전략</Link>
            <span className="text-gray-600">/</span>
            <span className="text-purple-400">그리드 봇</span>
          </div>
          
          {/* 페이지 타이틀 */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <FaRobot className="text-2xl text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">그리드 봇 (Grid Bot)</h1>
              <p className="text-gray-400">자동화된 그리드 트레이딩 전문 분석</p>
            </div>
          </div>
        </div>
      </div>

      {/* 코인 선택기 */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <CoinSelector
            selectedCoin={selectedCoin}
            onCoinSelect={setSelectedCoin}
            coins={MAJOR_COINS}
          />
        </div>
      </div>

      {/* 섹션 탭 */}
      <div className="bg-gray-900/50 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? `${selectedCoinInfo.bgColor} ${selectedCoinInfo.color} border border-current`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {section.icon}
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderSection()}
      </div>

      {/* 푸터 정보 */}
      <div className="mt-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p className="mb-2">그리드 봇은 변동성 시장에서 자동으로 매수/매도를 반복하는 전략입니다</p>
            <p>모든 데이터는 실시간 Binance API를 통해 제공됩니다</p>
          </div>
        </div>
      </div>
    </div>
  )
}