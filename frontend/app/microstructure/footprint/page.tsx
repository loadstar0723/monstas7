'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { FootprintErrorBoundary } from './components/ErrorRecovery'

// 풋프린트 차트 모듈 동적 로드
const FootprintChartModule = dynamic(
  () => import('./FootprintChartModule'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">풋프린트 차트 시스템 로딩중...</p>
        </div>
      </div>
    )
  }
)

export default function FootprintChartsPage() {
  return (
    <FootprintErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-900 text-white p-6">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">페이지 준비중...</p>
          </div>
        </div>
      }>
        <FootprintChartModule />
      </Suspense>
    </FootprintErrorBoundary>
  )
}
