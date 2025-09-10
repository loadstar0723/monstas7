'use client'

import dynamic from 'next/dynamic'

// 동적 임포트로 클라이언트 사이드에서만 로드
const OrderbookHeatmapUltimate = dynamic(
  () => import('./OrderbookHeatmapUltimate'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">오더북 히트맵 로딩 중...</p>
        </div>
      </div>
    )
  }
)

export default function OrderbookPage() {
  return <OrderbookHeatmapUltimate />
}