'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="원자재 시장 분석"
      description="금, 은, 원유 등 주요 원자재 가격 동향 분석"
      requiredTier="Signature"
      features={[
        '금/은 가격 추적',
        '원유 선물 분석',
        '농산물 가격 동향',
        '산업용 금속 추적',
        '달러 인덱스 연관성',
        '인플레이션 헤지 전략'
      ]}
    />
  )
}