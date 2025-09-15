'use client'

import ModuleErrorBoundary from '@/components/common/ModuleErrorBoundary'

import dynamic from 'next/dynamic'

import { Suspense } from 'react'

// 동적 임포트로 클라이언트 사이드에서만 로드
const PortfolioOptimizerModule = dynamic(
  () => import('@/components/portfolio-optimizer/PortfolioOptimizerModule'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">포트폴리오 옵티마이저를 로딩중입니다...</div>
      </div>
    )
  }
)

export default function PortfolioOptimizerPage() {
  return (
    <ModuleErrorBoundary moduleName="포트폴리오 옵티마이저">
      <Suspense fallback={<div>Loading...</div>}>
      <PortfolioOptimizerModule />
    </Suspense>
    </ModuleErrorBoundary>
  )
}