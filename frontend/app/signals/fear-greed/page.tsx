'use client'

import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

// 메인 대시보드 컴포넌트를 동적 임포트 (에러 격리)
const FearGreedDashboard = dynamic(
  () => import('./FearGreedDashboard').catch(() => {
    return {
      default: () => (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
            <p className="text-yellow-400">공포탐욕 대시보드를 로드할 수 없습니다.</p>
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
          <p className="text-gray-400">공포탐욕 지수 분석 준비 중...</p>
        </div>
      </div>
    )
  }
)

/**
 * 공포탐욕 지수 전문 분석 페이지
 * 10개 주요 코인별 심리 지수 분석 및 역발상 투자 전략 제공
 * 완전 모듈화된 원페이지 대시보드
 */
export default function FearGreedIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      <ErrorBoundary moduleName="FearGreed">
        <FearGreedDashboard />
      </ErrorBoundary>
    </div>
  )
}