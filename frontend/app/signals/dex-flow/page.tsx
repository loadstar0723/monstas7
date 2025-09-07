'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

// 모듈화된 컴포넌트를 동적 임포트 (에러 격리)
const DexFlowModule = dynamic(
  () => import('./DexFlowModule').catch(() => {
    // 모듈 로드 실패 시 폴백
    return {
      default: () => (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
            <p className="text-purple-400">DEX 플로우 모듈을 로드할 수 없습니다.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg"
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
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">DEX 플로우 분석 시스템 로딩 중...</p>
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
 * DEX 플로우 분석 페이지
 * Uniswap, PancakeSwap 등 주요 DEX의 유동성과 거래 흐름 분석
 * 완전한 모듈화 구조로 다른 페이지와 독립적으로 작동
 */
export default function DEXFlowAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            DEX 플로우 분석
          </h1>
          <p className="text-gray-400">탈중앙화 거래소의 실시간 유동성과 거래 흐름 모니터링</p>
        </motion.div>

        {/* AI 시장 분석 */}
        <div className="mb-8">
          <MarketAnalysis />
        </div>

        {/* Error Boundary로 보호된 모듈 */}
        <ErrorBoundary moduleName="DexFlow">
          <DexFlowModule />
        </ErrorBoundary>

        {/* DEX 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-purple-900/20 rounded-xl border border-purple-500/30"
        >
          <h3 className="text-xl font-bold mb-2 text-purple-400">🔄 DEX 플로우란?</h3>
          <p className="text-gray-300 mb-4">
            탈중앙화 거래소(DEX)에서 발생하는 스왑, 유동성 공급/제거 등의 온체인 활동을 실시간으로 추적합니다.
          </p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• <span className="text-blue-400">스왑</span>: 토큰 간 교환 거래</li>
            <li>• <span className="text-green-400">유동성 공급</span>: LP 토큰 예치로 수수료 수익</li>
            <li>• <span className="text-yellow-400">TVL</span>: 프로토콜에 잠긴 총 가치</li>
            <li>• <span className="text-purple-400">MEV</span>: 최대 추출 가능 가치 기회</li>
          </ul>
        </motion.div>

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-500/30"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">프리미엄 DEX 분석</h3>
            <p className="text-gray-400 mb-4">
              MEV 기회와 유동성 이동을 실시간으로 포착하세요
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all">
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
            ✅ 모듈화 완료 | 🔒 에러 격리 | 📡 실시간 온체인 데이터 | 🧩 독립 실행
          </p>
        </div>
      </div>
    </div>
  )
}