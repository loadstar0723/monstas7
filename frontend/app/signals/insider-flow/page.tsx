'use client'

import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

// InsiderFlowUltimate 컴포넌트를 동적 임포트
const InsiderFlowUltimate = dynamic(
  () => import('./InsiderFlowUltimate').catch(() => {
    // 모듈 로드 실패 시 폴백
    return {
      default: () => (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
            <p className="text-purple-400">인사이더 플로우 모듈을 로드할 수 없습니다.</p>
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
          <p className="text-gray-400">인사이더 플로우 전문 분석 시스템 로딩 중...</p>
        </div>
      </div>
    )
  }
)

/**
 * 인사이더 플로우 전문 분석 페이지
 * 10개 주요 코인별 인사이더 거래 종합 대시보드
 * 팀/VC 지갑 추적, 토큰 언락, 거래소 플로우 등 전문 분석
 */
export default function InsiderFlowPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Error Boundary로 보호된 Ultimate 모듈 */}
        <ErrorBoundary moduleName="InsiderFlowUltimate">
          <InsiderFlowUltimate />
        </ErrorBoundary>
      </div>
    </div>
  )
}