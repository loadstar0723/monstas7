'use client'

import dynamic from 'next/dynamic'
import ModuleErrorBoundary from '@/components/common/ModuleErrorBoundary'

const RandomforestModule = dynamic(() => import('./RandomForestModuleEnhanced'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Random Forest 로딩 중...</p>
      </div>
    </div>
  )
})

export default function RandomforestPage() {
  return (
    <ModuleErrorBoundary moduleName="Random Forest">
      <RandomforestModule />
    </ModuleErrorBoundary>
  )
}