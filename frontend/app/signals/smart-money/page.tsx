'use client'

import dynamic from 'next/dynamic'

// SmartMoneyUltimate 컴포넌트를 동적으로 가져오기
const SmartMoneyUltimate = dynamic(
  () => import('./SmartMoneyUltimate'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">스마트 머니 시스템 로딩 중...</p>
        </div>
      </div>
    )
  }
)

export default function SmartMoneySignalsPage() {
  return <SmartMoneyUltimate />
}