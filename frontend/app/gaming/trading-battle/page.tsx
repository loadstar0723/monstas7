'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="트레이딩 배틀"
      description="실시간 1:1 또는 팀 대항 트레이딩 경기"
      requiredTier="Professional"
      features={[
        '실시간 대전',
        '팀 배틀',
        '토너먼트 시스템',
        'ELO 레이팅',
        '배틀 리플레이',
        '전략 분석'
      ]}
    />
  )
}