'use client'

import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

// 모듈화된 컴포넌트를 동적 임포트 (에러 격리)
const ArbitrageUltraModule = dynamic(
  () => import('./ArbitrageUltraModule').catch(() => {
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

// MarketAnalysis 제거 - 차익거래 전문 페이지에 집중

/**
 * 차익거래 기회 전문 분석 페이지
 * 10개 주요 코인별 종합 대시보드
 * 실제 거래소 API 데이터만 사용
 */
export default function ArbitrageUltraPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Error Boundary로 보호된 모듈 */}
      <ErrorBoundary moduleName="ArbitrageUltra">
        <ArbitrageUltraModule />
      </ErrorBoundary>
    </div>
  )
}