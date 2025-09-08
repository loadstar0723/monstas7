'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// 모든 기능이 활성화된 Ultimate 버전 사용
const LiquidationUltimate = dynamic(
  () => import('./LiquidationUltimate'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">청산 히트맵 시스템 로딩중...</p>
        </div>
      </div>
    )
  }
)

export default function LiquidationHeatmapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">페이지 준비중...</p>
        </div>
      </div>
    }>
      <LiquidationUltimate />
    </Suspense>
  )
}