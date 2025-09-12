'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="인플레이션 분석"
      description="글로벌 인플레이션 동향과 암호화폐에 미치는 영향"
      requiredTier="Signature"
      features={[
        'CPI/PPI 데이터 추적',
        '핵심 인플레이션 분석',
        '인플레이션 기대치',
        '중앙은행 목표 대비',
        '에너지/식품 가격 영향',
        '임금 상승 압력'
      ]}
    />
  )
}