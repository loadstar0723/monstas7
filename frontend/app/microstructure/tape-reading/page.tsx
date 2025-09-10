'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// 동적 임포트로 모듈 로드 (에러 격리)
const TapeReadingModule = dynamic(
  () => import('@/components/tape-reading/TapeReadingModule').catch(() => {
    return import('@/components/ErrorBoundary').then(mod => ({
      default: () => mod.default({ 
        error: new Error('테이프 리딩 모듈 로드 실패'),
        reset: () => window.location.reload() 
      })
    }))
  }),
  { 
    ssr: false,
    loading: () => <LoadingScreen />
  }
)

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-white mb-2">테이프 리딩 모듈 로딩 중...</h2>
        <p className="text-gray-400">실시간 데이터를 준비하고 있습니다</p>
      </div>
    </div>
  )
}

export default function TapeReadingPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <TapeReadingModule />
    </Suspense>
  )
}