'use client'

import dynamic from 'next/dynamic'

// 동적 임포트로 PatternRecognitionUltimate 로드
const PatternRecognitionUltimate = dynamic(
  () => import('./PatternRecognitionUltimate'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">패턴 인식 시스템 로딩 중...</p>
        </div>
      </div>
    )
  }
)

export default function Page() {
  return <PatternRecognitionUltimate />
}
