'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'
import { config } from '@/lib/config'

// 모듈화된 컴포넌트를 동적 임포트 (에러 격리)
const FundingRateModule = dynamic(
  () => import('./FundingRateModule').catch(() => {
    // 모듈 로드 실패 시 폴백
    return {
      default: () => (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
            <p className="text-yellow-400">펀딩비 모듈을 로드할 수 없습니다.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg"
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
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">펀딩비 시스템 로딩 중...</p>
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
 * 펀딩비 시그널 페이지
 * 실시간 Binance Futures 펀딩비 모니터링과 차익거래 기회 분석
 * 완전한 모듈화 구조로 다른 페이지와 독립적으로 작동
 */
export default function FundingRateSignalsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            펀딩비 시그널
          </h1>
          <p className="text-gray-400">실시간 Binance Futures 펀딩비와 차익거래 기회 분석</p>
        </motion.div>

        {/* AI 시장 분석 */}
        <div className="mb-8">
          <MarketAnalysis />
        </div>

        {/* Error Boundary로 보호된 모듈 */}
        <ErrorBoundary moduleName="FundingRate">
          <FundingRateModule />
        </ErrorBoundary>

        {/* 펀딩비 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: config.decimals.value3 }}
          className="mt-8 p-6 bg-yellow-900/20 rounded-xl border border-yellow-500/30"
        >
          <h3 className="text-xl font-bold mb-2 text-yellow-400">💡 펀딩비란?</h3>
          <p className="text-gray-300 mb-4">
            펀딩비는 무기한 선물 시장에서 현물 가격과의 균형을 맞추기 위한 메커니즘입니다.
          </p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• <span className="text-green-400">양수(+)</span>: 롱 포지션이 숏에게 지불 (롱 과열)</li>
            <li>• <span className="text-red-400">음수(-)</span>: 숏 포지션이 롱에게 지불 (숏 과열)</li>
            <li>• 8시간마다 결제 (00:00, 08:00, 16:00 UTC)</li>
            <li>• 높은 펀딩비 = 반대 포지션 기회</li>
          </ul>
        </motion.div>

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: config.decimals.value5 }}
          className="mt-12 p-6 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-xl border border-yellow-500/30"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">프리미엄 펀딩비 알림</h3>
            <p className="text-gray-400 mb-4">
              극단적인 펀딩비 발생 시 실시간 알림으로 차익거래 기회를 놓치지 마세요
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg font-bold hover:from-yellow-700 hover:to-orange-700 transition-all">
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
            ✅ 모듈화 완료 | 🔒 에러 격리 | 📡 실시간 Binance Futures 데이터 | 🧩 독립 실행
          </p>
        </div>
      </div>
    </div>
  )
}