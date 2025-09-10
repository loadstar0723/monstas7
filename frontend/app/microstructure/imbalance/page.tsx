'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// 동적 임포트로 성능 최적화
const ImbalanceModule = dynamic(() => import('./ImbalanceModule'), {
  loading: () => <LoadingScreen />,
  ssr: false
})

// 로딩 화면 컴포넌트
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">임밸런스 분석 로딩 중...</h2>
        <p className="text-gray-400">실시간 데이터를 준비하고 있습니다</p>
      </div>
    </div>
  )
}

export default function ImbalancePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ImbalanceModule />
    </Suspense>
  )
}