'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="알트시즌 분석"
      description="알트코인 강세장을 예측하고 최적 진입 타이밍을 포착"
      requiredTier="Signature"
      features={[
        '비트코인 도미넌스 분석',
        '알트코인 상대 강도 측정',
        '섹터별 회전 분석',
        '자금 흐름 추적',
        '시장 심리 지표',
        '알트시즌 지수 계산'
      ]}
    />
  )
}