'use client'

import dynamic from 'next/dynamic'

// 동적 임포트로 MomentumModule 로드 (성능 최적화)
const MomentumModule = dynamic(() => import('./MomentumModule'), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">모멘텀 트레이딩 모듈 로딩 중...</p>
      </div>
    </div>
  ),
  ssr: false // 클라이언트 사이드 렌더링만 사용
})

export default function Page() {
  return <MomentumModule />
}
