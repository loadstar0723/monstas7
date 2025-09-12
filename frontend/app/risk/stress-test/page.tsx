'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="스트레스 테스트"
      description="극한 시장 상황에서의 포트폴리오 안정성 검증 시스템"
      requiredTier="Master"
      features={[
        '2008 금융위기 시나리오',
        'COVID-19 팬데믹 충격 테스트',
        '암호화폐 대폭락 시뮬레이션',
        '유동성 위기 스트레스 테스트',
        '금리 급변동 시나리오',
        '지정학적 리스크 모델링'
      ]}
    />
  )
}