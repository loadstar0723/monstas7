'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { ErrorBoundary } from 'react-error-boundary'

const CVDModule = dynamic(() => import('./CVDModule'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-400">CVD 분석 모듈 로딩 중...</p>
      </div>
    </div>
  )
})

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center p-8 bg-red-900/20 rounded-lg border border-red-500">
        <h2 className="text-2xl font-bold text-red-400 mb-4">오류가 발생했습니다</h2>
        <p className="text-gray-300 mb-4">{error.message}</p>
        <button 
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}

export default function CVDPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <CVDModule />
    </ErrorBoundary>
  )
}
