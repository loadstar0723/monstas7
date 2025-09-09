'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CoinSelector from './components/CoinSelector'
import useFearGreedData from './hooks/useFearGreedData'

// 동적 임포트로 성능 최적화
const FearGreedGauge = dynamic(() => import('./components/FearGreedGauge'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-800/50 animate-pulse rounded-xl" />
})

const MarketSentiment = dynamic(() => import('./components/MarketSentiment'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-xl" />
})

const HistoricalAnalysis = dynamic(() => import('./components/HistoricalAnalysis'), {
  ssr: false,
  loading: () => <div className="h-80 bg-gray-800/50 animate-pulse rounded-xl" />
})

const TradingStrategy = dynamic(() => import('./components/TradingStrategy'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-xl" />
})

const RiskManagement = dynamic(() => import('./components/RiskManagement'), {
  ssr: false,
  loading: () => <div className="h-80 bg-gray-800/50 animate-pulse rounded-xl" />
})

const PsychologyEducation = dynamic(() => import('./components/PsychologyEducation'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-800/50 animate-pulse rounded-xl" />
})

const RealTimeAlerts = dynamic(() => import('./components/RealTimeAlerts'), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-800/50 animate-pulse rounded-xl" />
})

// 지원하는 10개 코인
export const SUPPORTED_COINS = [
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { symbol: 'BNB', name: 'Binance Coin', color: '#F3BA2F' },
  { symbol: 'SOL', name: 'Solana', color: '#00FFA3' },
  { symbol: 'XRP', name: 'Ripple', color: '#23292F' },
  { symbol: 'ADA', name: 'Cardano', color: '#0033AD' },
  { symbol: 'DOGE', name: 'Dogecoin', color: '#C2A633' },
  { symbol: 'AVAX', name: 'Avalanche', color: '#E84142' },
  { symbol: 'MATIC', name: 'Polygon', color: '#8247E5' },
  { symbol: 'DOT', name: 'Polkadot', color: '#E6007A' }
]

export default function FearGreedDashboard() {
  const [selectedCoin, setSelectedCoin] = useState('BTC')
  const { fearGreedData, loading, error } = useFearGreedData(selectedCoin)

  // 헤더 그라디언트 색상 (코인별)
  const getCoinGradient = () => {
    const coin = SUPPORTED_COINS.find(c => c.symbol === selectedCoin)
    if (!coin) return 'from-yellow-600/20 to-orange-600/20'
    
    // 코인 색상에 따른 그라디언트
    return `from-[${coin.color}]/20 to-[${coin.color}]/5`
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 mb-4">데이터 로드 중 오류가 발생했습니다</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-all"
          >
            새로고침
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 헤더 섹션 */}
      <div className={`bg-gradient-to-r ${getCoinGradient()} rounded-2xl p-6 mb-8 border border-yellow-500/20`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              공포 & 탐욕 지수 전문 분석
            </h1>
            <p className="text-gray-400">
              Warren Buffett: "다른 사람들이 탐욕스러울 때 두려워하고, 두려워할 때 탐욕스러워하라"
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">실시간 분석</span>
          </div>
        </div>
      </div>

      {/* 코인 선택기 */}
      <CoinSelector 
        selectedCoin={selectedCoin}
        onSelectCoin={setSelectedCoin}
        coins={SUPPORTED_COINS}
      />

      {/* 메인 대시보드 그리드 */}
      <div className="space-y-8">
        {/* 상단: 게이지와 현재 상태 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FearGreedGauge 
            coin={selectedCoin}
            fearGreedData={fearGreedData}
            loading={loading}
          />
          <MarketSentiment 
            coin={selectedCoin}
            fearGreedData={fearGreedData}
            loading={loading}
          />
        </div>

        {/* 중단: 과거 분석과 트레이딩 전략 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HistoricalAnalysis 
            coin={selectedCoin}
            fearGreedData={fearGreedData}
          />
          <TradingStrategy 
            coin={selectedCoin}
            fearGreedData={fearGreedData}
          />
        </div>

        {/* 리스크 관리 섹션 */}
        <RiskManagement 
          coin={selectedCoin}
          fearGreedData={fearGreedData}
        />

        {/* 교육 콘텐츠 */}
        <PsychologyEducation 
          currentIndex={fearGreedData?.value || 50}
        />

        {/* 실시간 알림 설정 */}
        <RealTimeAlerts 
          coin={selectedCoin}
          currentIndex={fearGreedData?.value || 50}
        />

        {/* 하단 정보 */}
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-400 mb-1">데이터 소스</p>
              <p className="text-white font-medium">Alternative.me + Binance</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">업데이트 주기</p>
              <p className="text-white font-medium">5분</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">분석 정확도</p>
              <p className="text-white font-medium">역사적 73% 성공률</p>
            </div>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-xl p-8 border border-yellow-500/30 text-center">
          <h3 className="text-2xl font-bold mb-4">프리미엄 공포탐욕 알림 서비스</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            극단적 공포와 탐욕 구간에서 실시간 알림을 받아 최적의 매매 타이밍을 포착하세요.
            역사적으로 검증된 역발상 투자 전략으로 시장을 이기는 수익을 만들어보세요.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg font-bold hover:from-yellow-700 hover:to-orange-700 transition-all">
              프리미엄 구독하기
            </button>
            <button className="px-8 py-3 bg-gray-800 border border-gray-700 rounded-lg font-bold hover:bg-gray-700 transition-all">
              텔레그램 봇 연동
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}