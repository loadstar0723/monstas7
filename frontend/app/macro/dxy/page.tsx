'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="달러 인덱스 분석"
      description="DXY 달러 지수와 암호화폐 시장의 상관관계 분석"
      requiredTier="Signature"
      features={[
        '달러 강세/약세 분석',
        '주요 통화 대비 달러',
        '암호화폐 역상관성',
        '연준 정책과 달러',
        'DXY 기술적 분석',
        '글로벌 리스크 온오프'
      ]}
    />
  )
}