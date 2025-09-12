'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="헤징 전략"
      description="포트폴리오 리스크를 줄이기 위한 고급 헤징 전략 및 도구"
      requiredTier="Master"
      features={[
        '다양한 헤징 전략 비교 분석',
        'Delta Neutral 전략 구현',
        '옵션을 활용한 보험 헤징',
        '통화 헤징 및 금리 헤징',
        '베이시스 리스크 관리',
        '헤징 효율성 측정'
      ]}
    />
  )
}
