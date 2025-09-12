'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="포지션 사이징"
      description="자본금 대비 최적의 거래 규모를 계산하는 전문 도구"
      requiredTier="Platinum"
      features={[
        '자본금 기반 포지션 계산',
        '변동성 조정 사이징',
        '리스크 패리티 모델',
        'ATR 기반 포지션 조정',
        '멀티 자산 포지션 배분',
        '동적 사이징 알고리즘'
      ]}
    />
  )
}