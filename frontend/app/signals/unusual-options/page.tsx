'use client'

import dynamic from 'next/dynamic'

// Ultimate 컴포넌트를 직접 동적 임포트 (에러 격리)
const UnusualOptionsUltimate = dynamic(
  () => import('./UnusualOptionsUltimate'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">비정상 옵션 Ultimate 시스템 로딩 중...</p>
        </div>
      </div>
    )
  }
)

/**
 * 비정상 옵션 Ultimate 분석 페이지
 * 10개 주요 코인별 옵션 활동 종합 분석 대시보드
 * 실시간 Binance 데이터 연동
 */
export default function UnusualOptionsPage() {
  return <UnusualOptionsUltimate />
}