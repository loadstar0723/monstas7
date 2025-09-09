'use client'

import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

// FundingRateUltimate 컴포넌트를 동적 임포트 (에러 격리)
const FundingRateUltimate = dynamic(
  () => import('./FundingRateUltimate').catch(() => {
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
          <p className="text-gray-400">펀딩비 Ultimate 시스템 로딩 중...</p>
        </div>
      </div>
    )
  }
)

/**
 * 펀딩비 시그널 Ultimate 페이지
 * 10개 주요 코인별 펀딩비 종합 분석 대시보드
 * 실시간 Binance Futures 데이터 연동
 */
export default function FundingRateSignalsPage() {
  return (
    <ErrorBoundary moduleName="FundingRateUltimate">
      <FundingRateUltimate />
    </ErrorBoundary>
  )
}