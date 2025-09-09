'use client'

import dynamic from 'next/dynamic'

// 동적 임포트로 SSR 비활성화 및 에러 처리
const MarketMakingUltraModule = dynamic(
  () => import('./MarketMakingUltraModule').catch(() => {
    return { default: () => <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">마켓 메이킹 모듈 로딩 오류</h2>
        <p className="text-gray-400">페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
      </div>
    </div> }
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">마켓 메이킹 모듈 로딩 중...</p>
        </div>
      </div>
    )
  }
)

export default function MarketMakingPage() {
  return <MarketMakingUltraModule />
}