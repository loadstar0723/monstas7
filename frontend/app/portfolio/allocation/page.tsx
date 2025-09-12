'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="자산 배분 최적화"
      description="현대 포트폴리오 이론에 기반한 최적 자산 배분 전략"
      requiredTier="Platinum"
      features={[
        '효율적 프런티어 분석',
        '리밸런싱 전략',
        '리스크 패리티 모델',
        '블랙-리터만 모델',
        '동적 자산 배분',
        '세후 수익률 최적화'
      ]}
    />
  )
}