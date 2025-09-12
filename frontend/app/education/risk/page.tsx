'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="리스크 관리 교육"
      description="체계적인 리스크 관리와 자본 보호 전략"
      requiredTier="Professional"
      features={[
        '포지션 사이징',
        '손절매 전략',
        '분산투자 원칙',
        '레버리지 관리',
        '시장 상황 대응',
        '백테스팅 방법'
      ]}
    />
  )
}