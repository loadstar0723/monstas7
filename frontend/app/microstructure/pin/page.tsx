'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

// 동적 임포트로 PinBarModule 로드
const PinBarModule = dynamic(() => import('@/components/pin-bar/PinBarModule'), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">핀 바 분석 모듈 로딩 중...</p>
        </div>
      </div>
    </div>
  ),
  ssr: false
})

export default function PinBarPage() {
  return <PinBarModule />
}
