'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="트레이딩 전략"
      description="검증된 트레이딩 전략과 실전 적용 방법"
      requiredTier="Platinum"
      features={[
        'DCA 전략 심화',
        '스윙 트레이딩 기법',
        '스캘핑 전략',
        '아비트라지 기법',
        '포트폴리오 전략',
        '백테스팅 방법'
      ]}
    />
  )
}