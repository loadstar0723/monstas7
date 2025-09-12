'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="VaR 리스크 측정"
      description="Value at Risk를 통한 정량적 리스크 측정 및 관리"
      requiredTier="Infinity"
      features={[
        '히스토리컬 VaR 계산',
        '몬테카를로 VaR 시뮬레이션',
        'Conditional VaR (CVaR) 분석',
        '포트폴리오 VaR 분해',
        'VaR 백테스팅 검증',
        '리스크 기여도 분석'
      ]}
    />
  )
}