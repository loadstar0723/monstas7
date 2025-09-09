'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

// 동적 임포트로 모듈화 및 성능 최적화 - 백테스팅 컴포넌트
const CoinSelector = dynamic(() => import('@/components/backtesting/CoinSelector'), {
  loading: () => <div className="animate-pulse h-12 bg-gray-800 rounded-lg" />,
  ssr: false
})

const BacktestDashboard = dynamic(() => import('@/components/backtesting/BacktestDashboard'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-800 rounded-lg" />,
  ssr: false
})

// 지원하는 10개 주요 코인
const SUPPORTED_COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: '🅱' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
  { symbol: 'XRPUSDT', name: 'Ripple', icon: '✕' },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: '🔺' },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: '⬟' },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: '●' }
]

export default function BacktestingPage() {
  const [selectedCoin, setSelectedCoin] = useState(SUPPORTED_COINS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 페이지 타이틀 업데이트
  useEffect(() => {
    document.title = `백테스팅 엔진 - ${selectedCoin.name} | MONSTA`
  }, [selectedCoin])

  // 코인 변경 핸들러
  const handleCoinChange = (coin: typeof SUPPORTED_COINS[0]) => {
    setSelectedCoin(coin)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 헤더 섹션 */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <span className="text-purple-500">⚡</span>
                백테스팅 엔진
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                과거 데이터 기반 전략 성과 분석 · 리스크 평가 · 수익률 예측
              </p>
            </div>
            
            {/* 실시간 상태 표시 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">실시간 분석</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 코인 선택기 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CoinSelector
          coins={SUPPORTED_COINS}
          selectedCoin={selectedCoin}
          onCoinChange={handleCoinChange}
        />
      </div>

      {/* 메인 대시보드 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center"
          >
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all"
            >
              다시 시도
            </button>
          </motion.div>
        ) : (
          <BacktestDashboard
            coin={selectedCoin}
            onError={setError}
            onLoadingChange={setLoading}
          />
        )}
      </div>

      {/* 하단 정보 */}
      <div className="border-t border-gray-800 bg-black/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="text-purple-400 font-semibold mb-2">📊 백테스팅이란?</h3>
              <p className="text-gray-400">
                과거 시장 데이터를 활용하여 트레이딩 전략의 성과를 검증하는 분석 기법입니다.
              </p>
            </div>
            <div>
              <h3 className="text-purple-400 font-semibold mb-2">🎯 활용 방법</h3>
              <p className="text-gray-400">
                다양한 전략을 테스트하고 최적의 매매 타이밍과 리스크 관리 방법을 찾아냅니다.
              </p>
            </div>
            <div>
              <h3 className="text-purple-400 font-semibold mb-2">⚠️ 주의사항</h3>
              <p className="text-gray-400">
                과거 성과가 미래 수익을 보장하지 않으며, 시장 상황 변화를 고려해야 합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}