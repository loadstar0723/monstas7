'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="시나리오 분석"
      description="다양한 시장 상황에서의 포트폴리오 성과 시뮬레이션"
      requiredTier="Signature"
      features={[
        '몬테카를로 시뮬레이션',
        '극한 상황 스트레스 테스트',
        '역사적 시나리오 재현',
        'VaR 및 CVaR 계산',
        '다양한 시장 환경 모델링',
        '리스크 시나리오 백테스팅'
      ]}
    />
  )
}