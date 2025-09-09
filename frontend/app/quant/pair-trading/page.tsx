'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// 페어 트레이딩 전용 컴포넌트들 동적 임포트
const PairSelector = dynamic(() => import('@/components/pair-trading/PairSelector'), {
  loading: () => <div className="animate-pulse h-20 bg-gray-800 rounded-lg" />,
  ssr: false
})

const RealTimePriceCard = dynamic(() => import('@/components/pair-trading/RealTimePriceCard'), {
  loading: () => <div className="animate-pulse h-32 bg-gray-800 rounded-lg" />,
  ssr: false
})

const MarketOverview = dynamic(() => import('@/components/pair-trading/MarketOverview'), {
  loading: () => <div className="animate-pulse h-32 bg-gray-800 rounded-lg" />,
  ssr: false
})

const CorrelationMatrix = dynamic(() => import('@/components/pair-trading/CorrelationMatrix'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-800 rounded-lg" />,
  ssr: false
})

const SpreadAnalysis = dynamic(() => import('@/components/pair-trading/SpreadAnalysis'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-800 rounded-lg" />,
  ssr: false
})

const CointegrationTest = dynamic(() => import('@/components/pair-trading/CointegrationTest'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-800 rounded-lg" />,
  ssr: false
})

const TradingSignals = dynamic(() => import('@/components/pair-trading/TradingSignals'), {
  loading: () => <div className="animate-pulse h-80 bg-gray-800 rounded-lg" />,
  ssr: false
})

const PairPerformance = dynamic(() => import('@/components/pair-trading/PairPerformance'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-800 rounded-lg" />,
  ssr: false
})

// 주요 암호화폐 목록
const MAJOR_COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: '🔸' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
  { symbol: 'XRPUSDT', name: 'XRP', icon: '✕' },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: '🔺' },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: '⬟' },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: '⚪' }
]

export default function PairTradingPage() {
  const [selectedPair, setSelectedPair] = useState<{ coin1: string; coin2: string }>({
    coin1: 'BTCUSDT',
    coin2: 'ETHUSDT'
  })
  const [timeframe, setTimeframe] = useState('4h')
  const [strategy, setStrategy] = useState('mean-reversion')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 헤더 */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Link href="/" className="hover:text-white transition-colors">홈</Link>
                <span>/</span>
                <Link href="/quant" className="hover:text-white transition-colors">퀀트 전략</Link>
                <span>/</span>
                <span className="text-white">페어 트레이딩</span>
              </div>
              <h1 className="text-3xl font-bold text-white">페어 트레이딩 분석 엔진</h1>
              <p className="text-gray-400 mt-1">통계적 차익거래 및 상관관계 기반 트레이딩</p>
            </div>

            {/* 전략 선택 */}
            <div className="flex items-center gap-4">
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              >
                <option value="mean-reversion">평균 회귀</option>
                <option value="statistical-arbitrage">통계적 차익거래</option>
                <option value="cointegration">공적분 트레이딩</option>
                <option value="correlation-breakdown">상관관계 붕괴</option>
              </select>
              
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              >
                <option value="1h">1시간</option>
                <option value="4h">4시간</option>
                <option value="1d">1일</option>
                <option value="1w">1주</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 마켓 오버뷰 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <MarketOverview />
        </motion.div>

        {/* 실시간 가격 카드 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-400">💹</span>
            실시간 가격 모니터링
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {MAJOR_COINS.slice(0, 5).map((coin, index) => (
              <motion.div
                key={coin.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RealTimePriceCard
                  symbol={coin.symbol}
                  name={coin.name}
                  icon={coin.icon}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 페어 선택기 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Suspense fallback={<div className="animate-pulse h-20 bg-gray-800 rounded-lg" />}>
            <PairSelector
              coins={MAJOR_COINS}
              selectedPair={selectedPair}
              onPairChange={setSelectedPair}
            />
          </Suspense>
        </motion.div>

        {/* 상관관계 매트릭스 & 공적분 테스트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Suspense fallback={<div className="animate-pulse h-96 bg-gray-800 rounded-lg" />}>
              <CorrelationMatrix
                coins={MAJOR_COINS}
                selectedPair={selectedPair}
                timeframe={timeframe}
              />
            </Suspense>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Suspense fallback={<div className="animate-pulse h-96 bg-gray-800 rounded-lg" />}>
              <CointegrationTest
                pair={selectedPair}
                timeframe={timeframe}
              />
            </Suspense>
          </motion.div>
        </div>

        {/* 스프레드 분석 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Suspense fallback={<div className="animate-pulse h-96 bg-gray-800 rounded-lg" />}>
            <SpreadAnalysis
              pair={selectedPair}
              timeframe={timeframe}
              strategy={strategy}
            />
          </Suspense>
        </motion.div>

        {/* 트레이딩 시그널 & 성과 지표 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Suspense fallback={<div className="animate-pulse h-80 bg-gray-800 rounded-lg" />}>
              <TradingSignals
                pair={selectedPair}
                strategy={strategy}
                timeframe={timeframe}
              />
            </Suspense>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Suspense fallback={<div className="animate-pulse h-80 bg-gray-800 rounded-lg" />}>
              <PairPerformance
                pair={selectedPair}
                strategy={strategy}
                timeframe={timeframe}
              />
            </Suspense>
          </motion.div>
        </div>

        {/* 실시간 알림 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-400">🔔</span>
            실시간 알림
            <span className="ml-auto text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full animate-pulse">
              LIVE
            </span>
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {[
              { time: '방금 전', message: 'BTC/ETH 페어 Z-Score 2.1 돌파 - SHORT 신호', type: 'signal' },
              { time: '1분 전', message: 'SOL/AVAX 상관관계 0.85 달성', type: 'info' },
              { time: '3분 전', message: 'XRP 거래량 급증 +45%', type: 'volume' },
              { time: '5분 전', message: 'BNB/MATIC 스프레드 수렴 구간 진입', type: 'spread' },
            ].map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.type === 'signal' ? 'bg-yellow-400' :
                    alert.type === 'volume' ? 'bg-blue-400' :
                    alert.type === 'spread' ? 'bg-purple-400' :
                    'bg-gray-400'
                  } animate-pulse`} />
                  <span className="text-sm text-gray-300">{alert.message}</span>
                </div>
                <span className="text-xs text-gray-500">{alert.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 페어 트레이딩 가이드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📚</span>
            페어 트레이딩 전략 가이드
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-purple-400 mb-2">평균 회귀 (Mean Reversion)</h4>
              <p className="text-sm text-gray-300 mb-3">
                두 자산 간 스프레드가 평균으로 회귀하는 특성을 활용합니다.
                Z-score가 ±2를 벗어나면 진입 신호로 간주합니다.
              </p>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• 진입: Z-score {'>'} 2 (숏) 또는 {'<'} -2 (롱)</li>
                <li>• 청산: Z-score가 0에 근접</li>
                <li>• 손절: Z-score {'>'} 3 또는 {'<'} -3</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-400 mb-2">공적분 트레이딩 (Cointegration)</h4>
              <p className="text-sm text-gray-300 mb-3">
                장기적으로 안정적인 관계를 유지하는 페어를 찾아 거래합니다.
                ADF 테스트로 공적분 관계를 검증합니다.
              </p>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• 조건: p-value {'<'} 0.05 (통계적 유의성)</li>
                <li>• 헤지 비율: OLS 회귀분석으로 계산</li>
                <li>• 리밸런싱: 주기적 헤지 비율 조정</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h4 className="text-sm font-semibold text-yellow-400 mb-2">⚠️ 리스크 관리</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div>
                <strong className="text-white">포지션 크기:</strong>
                <br />전체 자본의 5-10%
              </div>
              <div>
                <strong className="text-white">최대 드로다운:</strong>
                <br />15% 이내 유지
              </div>
              <div>
                <strong className="text-white">상관관계 모니터링:</strong>
                <br />0.7 이상 유지 확인
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}