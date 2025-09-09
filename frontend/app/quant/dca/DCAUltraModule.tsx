'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { FaCoins, FaBook, FaHammer, FaChartLine, FaChartBar, FaCrosshairs, FaCalculator, FaTachometerAlt, FaHistory, FaCog } from 'react-icons/fa'

// 컴포넌트 동적 임포트
const CoinSelector = dynamic(() => import('./components/CoinSelector'), { ssr: false })
const DCAConceptGuide = dynamic(() => import('./components/DCAConceptGuide'), { ssr: false })
const StrategyBuilder = dynamic(() => import('./components/StrategyBuilder'), { ssr: false })
const SimulationChart = dynamic(() => import('./components/SimulationChart'), { ssr: false })
const PriceAnalyzer = dynamic(() => import('./components/PriceAnalyzer'), { ssr: false })
const PositionTracker = dynamic(() => import('./components/PositionTracker'), { ssr: false })
const RiskCalculator = dynamic(() => import('./components/RiskCalculator'), { ssr: false })
const PerformanceAnalytics = dynamic(() => import('./components/PerformanceAnalytics'), { ssr: false })
const BacktestResults = dynamic(() => import('./components/BacktestResults'), { ssr: false })
const OptimizationTool = dynamic(() => import('./components/OptimizationTool'), { ssr: false })

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

export default function DCAUltraModule() {
  const [selectedCoin, setSelectedCoin] = useState(MAJOR_COINS[0])
  const [isLoading, setIsLoading] = useState(true)
  const [dcaSettings, setDcaSettings] = useState({
    interval: 'weekly',    // daily, weekly, monthly
    amount: 100,          // USD per interval
    startDate: new Date().toISOString().split('T')[0],
    totalBudget: 10000,   // Total budget in USD
    stopLoss: 20,         // Stop loss percentage
    takeProfit: 100,      // Take profit percentage
    strategy: 'standard'  // standard, martingale, anti-martingale
  })

  useEffect(() => {
    // 초기 로딩 완료
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">DCA 봇 모듈 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 헤더 */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 sm:py-0 sm:h-16 gap-2 sm:gap-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 overflow-x-auto whitespace-nowrap">
              <Link href="/" className="hover:text-white">홈</Link>
              <span>/</span>
              <Link href="/quant" className="hover:text-white">퀀트</Link>
              <span>/</span>
              <span className="text-white">DCA 봇</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">
              🤖 DCA 봇
            </h1>
          </div>
        </div>
      </div>

      {/* 코인 선택기 */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5 lg:py-6">
        <CoinSelector
          coins={MAJOR_COINS}
          selectedCoin={selectedCoin}
          onSelectCoin={(coin) => setSelectedCoin(coin)}
        />
      </div>

      {/* 메인 콘텐츠 - 원페이지 스크롤 */}
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 pb-6 sm:pb-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* DCA 개념 가이드 */}
          <section>
            <DCAConceptGuide selectedCoin={selectedCoin} />
          </section>

          {/* 전략 빌더 */}
          <section>
            <StrategyBuilder 
              selectedCoin={selectedCoin}
              settings={dcaSettings}
              onSettingsChange={setDcaSettings}
            />
          </section>

          {/* 시뮬레이션 차트 */}
          <section>
            <SimulationChart 
              selectedCoin={selectedCoin}
              settings={dcaSettings}
            />
          </section>

          {/* 가격 분석 */}
          <section>
            <PriceAnalyzer selectedCoin={selectedCoin} />
          </section>

          {/* 포지션 추적기 */}
          <section>
            <PositionTracker 
              selectedCoin={selectedCoin}
              settings={dcaSettings}
            />
          </section>

          {/* 리스크 계산기 */}
          <section>
            <RiskCalculator 
              selectedCoin={selectedCoin}
              settings={dcaSettings}
            />
          </section>

          {/* 성과 분석 */}
          <section>
            <PerformanceAnalytics 
              selectedCoin={selectedCoin}
              settings={dcaSettings}
            />
          </section>

          {/* 백테스트 결과 */}
          <section>
            <BacktestResults 
              selectedCoin={selectedCoin}
              settings={dcaSettings}
            />
          </section>

          {/* 최적화 도구 */}
          <section>
            <OptimizationTool 
              selectedCoin={selectedCoin}
              settings={dcaSettings}
              onOptimize={(newSettings) => setDcaSettings(newSettings)}
            />
          </section>
        </div>
      </main>

      {/* 플로팅 액션 버튼 - 모바일 */}
      <div className="fixed bottom-4 right-4 sm:hidden">
        <button className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors">
          <FaCoins className="text-xl" />
        </button>
      </div>
    </div>
  )
}