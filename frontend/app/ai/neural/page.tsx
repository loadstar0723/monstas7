'use client'

import dynamic from 'next/dynamic'
import ModuleErrorBoundary from '@/components/common/ModuleErrorBoundary'

const NeuralModule = dynamic(() => import('./NeuralModuleEnhanced'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">신경망 모델 로딩 중...</p>
      </div>
    </div>
  )
})

export default function NeuralPage() {
  return (
    <ModuleErrorBoundary moduleName="신경망 모델">
      <NeuralModule />
    </ModuleErrorBoundary>
  )
}