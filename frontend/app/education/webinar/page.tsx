'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="실시간 웨비나"
      description="전문가와 함께하는 라이브 교육 세션"
      requiredTier="Platinum"
      features={[
        '주간 라이브 세션',
        '전문가 Q&A',
        '실시간 차트 분석',
        '시장 상황 토론',
        '녹화 다시보기',
        'VIP 세션 참여'
      ]}
    />
  )
}