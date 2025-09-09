'use client'

import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

// DexFlowUltimate 컴포넌트를 동적 임포트
const DexFlowUltimate = dynamic(
  () => import('./DexFlowUltimate').catch(() => {
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
          <p className="text-gray-400">DEX 플로우 전문 분석 시스템 로딩 중...</p>
        </div>
      </div>
    )
  }
)


/**
 * DEX 플로우 전문 분석 페이지
 * 10개 주요 코인별 DEX 활동 종합 대시보드
 * AMM, 유동성 풀, MEV, 차익거래 등 DEX 전문 분석
 */
export default function DEXFlowAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      <div className="container mx-auto px-4 py-8 h-screen overflow-y-auto">
        {/* Error Boundary로 보호된 Ultimate 모듈 */}
        <ErrorBoundary moduleName="DexFlowUltimate">
          <DexFlowUltimate />
        </ErrorBoundary>
      </div>
    </div>
  )
}