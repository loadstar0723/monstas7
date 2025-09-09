'use client'

import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

// 모듈을 동적으로 로드
const OptionsStrategyModule = dynamic(
  () => import('./OptionsStrategyModule'),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">옵션 전략 모듈 로딩 중...</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

export default function OptionsStrategyPage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        <OptionsStrategyModule />
      </div>
    </ErrorBoundary>
  )
}