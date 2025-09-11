'use client'

import dynamic from 'next/dynamic'

// 원래 VolumeProfile 모듈로 복원 - 모든 탭 컴포넌트 포함
const VolumeProfileModule = dynamic(
  () => import('./VolumeProfileModule'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">볼륨 프로파일 시스템 로딩중...</p>
        </div>
      </div>
    )
  }
)

export default function VolumeProfilePage() {
  return <VolumeProfileModule />
}
