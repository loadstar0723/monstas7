'use client'

import dynamic from 'next/dynamic'
import ModuleErrorBoundary from '@/components/common/ModuleErrorBoundary'

const PatternRecognitionModuleEnhanced = dynamic(() => import('./PatternRecognitionModuleEnhanced'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">패턴 인식 로딩 중...</p>
      </div>
    </div>
  )
})

export default function PatternRecognitionPage() {
  return (
    <ModuleErrorBoundary moduleName="패턴 인식">
      <PatternRecognitionModuleEnhanced />
    </ModuleErrorBoundary>
  )
}