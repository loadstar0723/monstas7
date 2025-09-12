'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="금리 분석"
      description="주요국 기준금리 변화와 시장에 미치는 영향 분석"
      requiredTier="Signature"
      features={[
        '기준금리 추적',
        '금리 기대치 분석',
        '수익률 곡선 변화',
        '실질금리 계산',
        '금리 차이 거래',
        '채권-주식 상관관계'
      ]}
    />
  )
}