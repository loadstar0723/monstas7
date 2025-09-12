'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="지정학적 리스크 분석"
      description="국제 정치 상황이 금융 시장에 미치는 영향 분석"
      requiredTier="Master"
      features={[
        '국제 분쟁 모니터링',
        '제재 영향 분석',
        '안전자산 플로우',
        '에너지 안보 이슈',
        '무역 분쟁 추적',
        '선거 영향 분석'
      ]}
    />
  )
}