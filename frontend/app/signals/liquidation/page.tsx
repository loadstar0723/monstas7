'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

// 모듈화된 컴포넌트를 동적 임포트 (에러 격리)
const LiquidationModule = dynamic(
  () => import('./LiquidationModule').catch(() => {
    // 모듈 로드 실패 시 폴백
    return {
      default: () => (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
            <p className="text-red-400">청산 모듈을 로드할 수 없습니다.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"
            >
              새로고침
            </button>
          </div>
        </div>
      )
    }
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">청산 히트맵 시스템 로딩 중...</p>
        </div>
      </div>
    )
  }
)

const MarketAnalysis = dynamic(() => import('@/components/signals/MarketAnalysis'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
})

/**
 * 청산 히트맵 페이지
 * 실시간 Binance 청산 데이터와 위험 분석을 제공
 * 완전한 모듈화 구조로 다른 페이지와 독립적으로 작동
 */
export default function LiquidationHeatmapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            청산 히트맵
          </h1>
          <p className="text-gray-400">실시간 Binance 강제 청산 모니터링과 위험 분석</p>
        </motion.div>

        {/* AI 시장 분석 */}
        <div className="mb-8">
          <MarketAnalysis />
        </div>

        {/* Error Boundary로 보호된 모듈 */}
        <ErrorBoundary moduleName="Liquidation">
          <LiquidationModule />
        </ErrorBoundary>

        {/* 위험 경고 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-red-900/20 rounded-xl border border-red-500/30"
        >
          <h3 className="text-xl font-bold mb-2 text-red-400">⚠️ 위험 관리 안내</h3>
          <p className="text-gray-300">
            청산 히트맵은 시장의 극단적인 움직임을 보여줍니다. 
            높은 레버리지는 큰 손실로 이어질 수 있으니 주의하세요.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-400">
            <li>• 레버리지는 항상 관리 가능한 수준으로 유지</li>
            <li>• 손절선은 반드시 설정하고 엄격히 준수</li>
            <li>• 청산 캐스케이드 신호 발생 시 포지션 축소</li>
            <li>• 극단적인 시장 상황에서는 관망 권장</li>
          </ul>
        </motion.div>

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-xl border border-red-500/30"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">프리미엄 청산 알림</h3>
            <p className="text-gray-400 mb-4">
              대규모 청산 발생 시 실시간 알림을 받아보세요
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg font-bold hover:from-red-700 hover:to-orange-700 transition-all">
                프리미엄 구독하기
              </button>
              <button className="px-8 py-3 bg-gray-800 border border-gray-700 rounded-lg font-bold hover:bg-gray-700 transition-all">
                텔레그램 봇 연동
              </button>
            </div>
          </div>
        </motion.div>

        {/* 모듈 정보 */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            ✅ 모듈화 완료 | 🔒 에러 격리 | 📡 실시간 Binance 데이터 | 🧩 독립 실행
          </p>
        </div>
      </div>
    </div>
  )
}