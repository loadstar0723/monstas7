'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="손절매 최적화"
      description="기술적 분석과 리스크 관리를 결합한 스마트 손절매 시스템"
      requiredTier="Platinum"
      features={[
        'ATR 기반 동적 손절매',
        '트레일링 스톱 알고리즘',
        '볼린저 밴드 손절매',
        '피보나치 리트레이스먼트 활용',
        '지지저항선 기반 손절매',
        '시간 기반 손절매 전략'
      ]}
    />
  )
}