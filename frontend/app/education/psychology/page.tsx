'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="트레이딩 심리학"
      description="감정 관리와 심리적 편향 극복을 위한 멘털 트레이닝"
      requiredTier="Professional"
      features={[
        '감정 관리 기법',
        '인지적 편향 이해',
        'FOMO/FUD 대응',
        '손실 수용 심리',
        '자기 통제력 향상',
        '멘털 코칭'
      ]}
    />
  )
}