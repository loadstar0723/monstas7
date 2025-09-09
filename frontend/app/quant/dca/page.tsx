'use client'

import dynamic from 'next/dynamic'

const DCAUltraModule = dynamic(
  () => import('./DCAUltraModule').catch(() => {
    return { default: () => <div>Error loading DCA Module</div> }
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">DCA 봇 모듈 로딩 중...</p>
        </div>
      </div>
    )
  }
)

export default function DCAPage() {
  return <DCAUltraModule />
}