'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="경제 지표 분석"
      description="주요 경제 지표의 시장 영향도와 트렌드 분석"
      requiredTier="Signature"
      features={[
        'GDP 성장률 추적',
        '인플레이션 지표 분석',
        '고용 통계 모니터링',
        '제조업/서비스업 PMI',
        '소비자 신뢰지수',
        '주택 시장 지표'
      ]}
    />
  )
}