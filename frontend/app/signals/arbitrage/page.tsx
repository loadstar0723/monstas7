'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'
import { config } from '@/lib/config'

// 모듈화된 컴포넌트를 동적 임포트 (에러 격리)
const ArbitrageModule = dynamic(
  () => import('./ArbitrageModule').catch(() => {
    // 모듈 로드 실패 시 폴백
    return {
      default: () => (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
            <p className="text-green-400">차익거래 모듈을 로드할 수 없습니다.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg"
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
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">차익거래 시스템 로딩 중...</p>
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
 * 거래소 간 차익거래 페이지
 * 여러 거래소의 가격 차이를 실시간으로 분석하여 차익거래 기회 포착
 * 완전한 모듈화 구조로 다른 페이지와 독립적으로 작동
 */
export default function CrossExchangeArbitragePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            거래소 간 차익거래
          </h1>
          <p className="text-gray-400">실시간 거래소 가격 차이 분석과 차익거래 기회 포착</p>
        </motion.div>

        {/* AI 시장 분석 */}
        <div className="mb-8">
          <MarketAnalysis />
        </div>

        {/* Error Boundary로 보호된 모듈 */}
        <ErrorBoundary moduleName="Arbitrage">
          <ArbitrageModule />
        </ErrorBoundary>

        {/* 차익거래 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: config.decimals.value3 }}
          className="mt-8 p-6 bg-green-900/20 rounded-xl border border-green-500/30"
        >
          <h3 className="text-xl font-bold mb-2 text-green-400">💰 차익거래란?</h3>
          <p className="text-gray-300 mb-4">
            동일한 자산이 서로 다른 거래소에서 다른 가격으로 거래될 때 발생하는 가격 차이를 이용한 무위험 수익 창출 전략입니다.
          </p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• <span className="text-green-400">매수</span>: 가격이 낮은 거래소에서 구매</li>
            <li>• <span className="text-red-400">매도</span>: 가격이 높은 거래소에서 판매</li>
            <li>• <span className="text-yellow-400">수수료</span>: 거래 수수료와 전송 수수료 고려 필수</li>
            <li>• <span className="text-blue-400">속도</span>: 빠른 실행이 성공의 핵심</li>
          </ul>
        </motion.div>

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: config.decimals.value5 }}
          className="mt-12 p-6 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl border border-green-500/30"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">프리미엄 차익거래 봇</h3>
            <p className="text-gray-400 mb-4">
              자동화된 차익거래 봇으로 24시간 수익 기회를 놓치지 마세요
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all">
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
            ✅ 모듈화 완료 | 🔒 에러 격리 | 📡 실시간 다중 거래소 데이터 | 🧩 독립 실행
          </p>
        </div>
      </div>
    </div>
  )
}