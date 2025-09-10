'use client'

import React, { Suspense, lazy } from 'react'

// Use React.lazy instead of Next.js dynamic for internal components
const SweepDetectionModule = lazy(() => import('./SweepDetectionModuleStatic'))

const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 animate-pulse">
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">스윕 감지 시스템 로딩 중...</h1>
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  </div>
)

export default function SweepDetectionWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SweepDetectionModule />
    </Suspense>
  )
}