'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="상관관계 분석"
      description="포트폴리오 자산 간 상관관계를 분석하여 분산투자 전략 수립"
      requiredTier="Platinum"
      features={[
        '멀티 자산 상관관계 매트릭스',
        '동적 상관관계 변화 추적',
        '리스크 집중도 분석',
        '최적 분산투자 비율 제안',
        '상관관계 기반 헤징 전략',
        '시장 위기 시 상관관계 변화'
      ]}
    />
  )
}
}
