'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

// 모듈화된 컴포넌트를 동적 임포트 (에러 격리)
const FearGreedModule = dynamic(
  () => import('./FearGreedModule').catch(() => {
    // 모듈 로드 실패 시 폴백
    return {
      default: () => (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
            <p className="text-yellow-400">Fear & Greed 모듈을 로드할 수 없습니다.</p>
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
          <p className="text-gray-400">공포탐욕 지수 로딩 중...</p>
        </div>
      </div>
    )
  }
)

/**
 * Fear & Greed Index 페이지
 * 시장 심리 지수를 분석하여 역발상 투자 전략 제공
 * 완전한 모듈화 구조로 다른 페이지와 독립적으로 작동
 */
export default function FearGreedIndexPage() {
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
            공포 & 탐욕 지수
          </h1>
          <p className="text-gray-400">시장 심리를 역이용한 역발상 투자 전략</p>
        </motion.div>

        {/* Error Boundary로 보호된 모듈 */}
        <ErrorBoundary moduleName="FearGreed">
          <FearGreedModule />
        </ErrorBoundary>

        {/* 공포탐욕 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-yellow-900/20 rounded-xl border border-yellow-500/30"
        >
          <h3 className="text-xl font-bold mb-2 text-yellow-400">📊 Fear & Greed Index란?</h3>
          <p className="text-gray-300 mb-4">
            시장 참여자들의 감정 상태를 0-100 지수로 표현합니다. 
            극단적 공포는 매수 기회, 극단적 탐욕은 매도 신호가 될 수 있습니다.
          </p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• <span className="text-red-400">0-25</span>: 극단적 공포 (Extreme Fear) - 매수 기회</li>
            <li>• <span className="text-orange-400">25-45</span>: 공포 (Fear) - 매수 고려</li>
            <li>• <span className="text-yellow-400">45-55</span>: 중립 (Neutral) - 관망</li>
            <li>• <span className="text-green-400">55-75</span>: 탐욕 (Greed) - 매도 고려</li>
            <li>• <span className="text-green-500">75-100</span>: 극단적 탐욕 (Extreme Greed) - 매도 신호</li>
          </ul>
        </motion.div>

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-xl border border-yellow-500/30"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">역발상 투자 전략</h3>
            <p className="text-gray-400 mb-4">
              남들이 두려워할 때 매수하고, 탐욕스러울 때 매도하세요
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
            ✅ 모듈화 완료 | 🔒 에러 격리 | 📡 실시간 시장 심리 분석 | 🧩 독립 실행
          </p>
        </div>
      </div>
    </div>
  )
}