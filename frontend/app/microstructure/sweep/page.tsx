'use client'

import dynamic from 'next/dynamic'
import { ErrorBoundary } from 'react-error-boundary'

// 동적 임포트로 성능 최적화 - Wrapper 사용
const SweepDetectionWrapper = dynamic(
  () => import('./SweepDetectionWrapper'),
  { 
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">스윕 감지 모듈 로딩 중...</p>
        </div>
      </div>
    ),
    ssr: false 
  }
)

// 에러 폴백 컴포넌트
function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-lg w-full">
        <h2 className="text-xl font-bold text-red-400 mb-4">모듈 로드 에러</h2>
        <p className="text-gray-300 mb-2">스윕 감지 모듈을 로드하는 중 문제가 발생했습니다.</p>
        <p className="text-gray-400 text-sm mb-6 font-mono">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SweepDetectionWrapper />
    </ErrorBoundary>
  )
}