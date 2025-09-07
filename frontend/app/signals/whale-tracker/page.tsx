'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

// 모듈화된 컴포넌트를 동적 임포트 (에러 격리)
const WhaleTrackerModule = dynamic(
  () => import('./WhaleTrackerModule').catch(() => {
    // 모듈 로드 실패 시 폴백
    return {
      default: () => (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
            <p className="text-red-400">고래 추적 모듈을 로드할 수 없습니다.</p>
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
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">고래 추적 시스템 로딩 중...</p>
        </div>
      </div>
    )
  }
)

/**
 * 고래 추적 페이지
 * 완전한 모듈화 구조로 다른 페이지와 독립적으로 작동
 * 에러 발생 시에도 다른 페이지에 영향 없음
 */
export default function WhaleTrackerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            고래 추적 시스템
          </h1>
          <p className="text-gray-400">실시간 Binance 대규모 거래와 고래 지갑을 모니터링합니다</p>
        </motion.div>

        {/* Error Boundary로 보호된 모듈 */}
        <ErrorBoundary moduleName="WhaleTracker">
          <WhaleTrackerModule />
        </ErrorBoundary>

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl border border-blue-500/30"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">프리미엄 고래 추적</h3>
            <p className="text-gray-400 mb-4">
              실시간 고래 움직임, 패턴 분석, 맞춤 알림을 모두 이용하세요
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-bold hover:from-blue-700 hover:to-cyan-700 transition-all">
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