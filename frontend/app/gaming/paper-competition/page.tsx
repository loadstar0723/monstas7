'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="페이퍼 트레이딩 대회"
      description="가상 자금으로 진행하는 트레이딩 경연 대회"
      requiredTier="Professional"
      features={[
        '월간 대회',
        '실시간 순위',
        '가상 자금 100만원',
        '우승 상금',
        '전략 공유',
        '대회 분석 리포트'
      ]}
    />
  )
}