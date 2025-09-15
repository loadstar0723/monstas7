'use client'

import ModuleErrorBoundary from '@/components/common/ModuleErrorBoundary'

import dynamic from 'next/dynamic'

import { Suspense } from 'react'

// 동적 임포트로 클라이언트 사이드에서만 로드
const RiskManagementSuite = dynamic(
  () => import('@/components/risk-management/RiskManagementSuite'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">리스크 관리 스위트를 로딩중입니다...</div>
      </div>
    )
  }
)

export default function RiskManagementPage() {
  return (
    <ModuleErrorBoundary moduleName="리스크 관리">
      <Suspense fallback={<div>Loading...</div>}>
      <RiskManagementSuite />
    </Suspense>
    </ModuleErrorBoundary>
  )
}