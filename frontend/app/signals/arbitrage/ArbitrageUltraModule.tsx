'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ModulePerformance } from '@/lib/moduleUtils'

// 컴포넌트들 동적 임포트
const CoinSelector = dynamic(() => import('./components/CoinSelector'), { ssr: false })
const ArbitrageConceptGuide = dynamic(() => import('./components/ArbitrageConceptGuide'), { ssr: false })
const RealTimeOpportunities = dynamic(() => import('./components/RealTimeOpportunities'), { ssr: false })
const ExchangePriceMatrix = dynamic(() => import('./components/ExchangePriceMatrix'), { ssr: false })
const ArbitrageCalculator = dynamic(() => import('./components/ArbitrageCalculator'), { ssr: false })
const ExecutionStrategy = dynamic(() => import('./components/ExecutionStrategy'), { ssr: false })
const RiskAnalysis = dynamic(() => import('./components/RiskAnalysis'), { ssr: false })
const HistoricalPerformance = dynamic(() => import('./components/HistoricalPerformance'), { ssr: false })
const ProfessionalTools = dynamic(() => import('./components/ProfessionalTools'), { ssr: false })

// 10개 주요 코인 (USDT 페어)
export const MAJOR_COINS = [
  { symbol: 'BTC', fullSymbol: 'BTCUSDT', name: '비트코인', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  { symbol: 'ETH', fullSymbol: 'ETHUSDT', name: '이더리움', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { symbol: 'BNB', fullSymbol: 'BNBUSDT', name: '바이낸스', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  { symbol: 'SOL', fullSymbol: 'SOLUSDT', name: '솔라나', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { symbol: 'XRP', fullSymbol: 'XRPUSDT', name: '리플', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  { symbol: 'ADA', fullSymbol: 'ADAUSDT', name: '카르다노', color: 'text-blue-300', bgColor: 'bg-blue-400/20' },
  { symbol: 'DOGE', fullSymbol: 'DOGEUSDT', name: '도지코인', color: 'text-yellow-300', bgColor: 'bg-yellow-400/20' },
  { symbol: 'AVAX', fullSymbol: 'AVAXUSDT', name: '아발란체', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  { symbol: 'DOT', fullSymbol: 'DOTUSDT', name: '폴카닷', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  { symbol: 'MATIC', fullSymbol: 'MATICUSDT', name: '폴리곤', color: 'text-purple-300', bgColor: 'bg-purple-400/20' }
]

export default function ArbitrageUltraModule() {
  const [selectedCoin, setSelectedCoin] = useState('BTC')
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<string>('concept') // 초기 섹션은 개념 설명
  
  const performance = new ModulePerformance('ArbitrageUltra')
  
  // 선택된 코인 정보
  const selectedCoinInfo = MAJOR_COINS.find(coin => coin.symbol === selectedCoin) || MAJOR_COINS[0]
  
  useEffect(() => {
    const initModule = async () => {
      const measureInit = performance.startMeasure('initialization')
      
      try {
        setLoading(true)
        // 초기화 로직
        // 실제 API 데이터 로드는 각 컴포넌트에서 수행
        
        // 약간의 지연 후 로딩 완료
        await new Promise(resolve => setTimeout(resolve, 800))
        setLoading(false)
      } catch (err) {
        console.error('[ArbitrageUltra] 초기화 오류:', err)
        setLoading(false)
      } finally {
        measureInit()
      }
    }
    
    initModule()
  }, [])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-400">차익거래 분석 시스템 초기화 중...</p>
          <p className="text-sm text-gray-500 mt-2">10개 주요 코인 데이터 로드 중</p>
        </div>
      </div>
    )
  }
  
  // 섹션 네비게이션
  const sections = [
    { id: 'concept', label: '개념 정리', icon: '📚' },
    { id: 'opportunities', label: '실시간 기회', icon: '🔥' },
    { id: 'matrix', label: '가격 매트릭스', icon: '📊' },
    { id: 'strategy', label: '실행 전략', icon: '🎯' },
    { id: 'calculator', label: '수익 계산', icon: '💰' },
    { id: 'risk', label: '리스크 관리', icon: '⚠️' },
    { id: 'history', label: '과거 성과', icon: '📈' },
    { id: 'tools', label: '전문 도구', icon: '🛠️' }
  ]
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          차익거래 기회 전문 분석
        </h1>
        <p className="text-gray-400 text-lg">
          10개 주요 코인의 거래소 간 가격 차이를 실시간으로 분석하여 수익 기회를 포착합니다
        </p>
      </div>
      
      {/* 코인 선택기 */}
      <CoinSelector 
        selectedCoin={selectedCoin}
        onCoinSelect={setSelectedCoin}
        coins={MAJOR_COINS}
      />
      
      {/* 섹션 네비게이션 - 모바일 스크롤 가능 */}
      <div className="mb-8 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max py-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeSection === section.id
                  ? `${selectedCoinInfo.bgColor} ${selectedCoinInfo.color} border border-current`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* 메인 컨텐츠 */}
      <div className="space-y-8">
        {/* 선택된 코인 정보 배너 */}
        <div className={`p-6 rounded-xl ${selectedCoinInfo.bgColor} border border-current/30`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className={`text-2xl font-bold ${selectedCoinInfo.color}`}>
                {selectedCoinInfo.name} ({selectedCoinInfo.symbol})
              </h2>
              <p className="text-gray-400 mt-1">차익거래 전문 분석 대시보드</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">실시간 업데이트</p>
              <p className={`text-lg font-mono ${selectedCoinInfo.color}`}>
                {new Date().toLocaleTimeString('ko-KR')}
              </p>
            </div>
          </div>
        </div>
        
        {/* 섹션별 컨텐츠 */}
        <div className="min-h-[600px]">
          {activeSection === 'concept' && (
            <ArbitrageConceptGuide selectedCoin={selectedCoinInfo} />
          )}
          
          {activeSection === 'opportunities' && (
            <RealTimeOpportunities selectedCoin={selectedCoinInfo} />
          )}
          
          {activeSection === 'matrix' && (
            <ExchangePriceMatrix selectedCoin={selectedCoinInfo} />
          )}
          
          {activeSection === 'strategy' && (
            <ExecutionStrategy selectedCoin={selectedCoinInfo} />
          )}
          
          {activeSection === 'calculator' && (
            <ArbitrageCalculator selectedCoin={selectedCoinInfo} />
          )}
          
          {activeSection === 'risk' && (
            <RiskAnalysis selectedCoin={selectedCoinInfo} />
          )}
          
          {activeSection === 'history' && (
            <HistoricalPerformance selectedCoin={selectedCoinInfo} />
          )}
          
          {activeSection === 'tools' && (
            <ProfessionalTools selectedCoin={selectedCoinInfo} />
          )}
        </div>
      </div>
      
      {/* 하단 정보 */}
      <div className="mt-12 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-gray-400 text-sm">지원 거래소</p>
            <p className="text-white font-bold">6개+</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">실시간 스캔</p>
            <p className="text-green-400 font-bold">24/7</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">업데이트 주기</p>
            <p className="text-yellow-400 font-bold">실시간</p>
          </div>
        </div>
      </div>
    </div>
  )
}