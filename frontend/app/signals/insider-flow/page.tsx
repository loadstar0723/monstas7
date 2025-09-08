'use client'

import dynamic from 'next/dynamic'

// InsiderFlowSimple 컴포넌트를 먼저 사용 (디버깅용)
const InsiderFlowSimple = dynamic(
  () => import('./InsiderFlowSimple'),
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

// 나중에 Ultimate로 전환 예정
// const InsiderFlowUltimate = dynamic(
//   () => import('./InsiderFlowUltimate'),
//   { ssr: false }
// )

export default function InsiderFlowPage() {
  return <InsiderFlowSimple />
}