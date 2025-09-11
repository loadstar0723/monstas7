'use client'

import dynamic from 'next/dynamic'

const StandaloneVolumeProfile = dynamic(
  () => import('../profile/standalone'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">볼륨 프로파일 로딩 중...</p>
        </div>
      </div>
    )
  }
)

export default function StandaloneVolumeProfilePage() {
  return <StandaloneVolumeProfile />
}