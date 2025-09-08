'use client'

import dynamic from 'next/dynamic'

// InsiderFlowUltimate 컴포넌트를 동적으로 가져오기
const InsiderFlowUltimate = dynamic(
  () => import('./InsiderFlowUltimate'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">내부자 거래 추적 시스템 로딩 중...</p>
        </div>
      </div>
    )
  }
)

export default function InsiderFlowPage() {
  return <InsiderFlowUltimate />
}