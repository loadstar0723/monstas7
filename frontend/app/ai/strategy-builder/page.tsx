'use client'

import dynamic from 'next/dynamic'
import ModuleErrorBoundary from '@/components/common/ModuleErrorBoundary'

const StrategyBuilderModule = dynamic(() => import('@/components/strategy-builder/StrategyBuilderModule'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">AI 전략 빌더 3.0 로딩 중...</p>
      </div>
    </div>
  )
})

export default function StrategyBuilderPage() {
  return (
    <ModuleErrorBoundary moduleName="AI 전략 빌더 3.0">
      <StrategyBuilderModule />
    </ModuleErrorBoundary>
  )
}