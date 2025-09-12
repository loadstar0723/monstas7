'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="중앙은행 정책 분석"
      description="주요 중앙은행의 통화정책과 시장 영향 분석"
      requiredTier="Master"
      features={[
        'Fed 정책 실시간 추적',
        'ECB/BOJ 정책 비교',
        '금리 인상/인하 예측',
        'QE 정책 영향 분석',
        '중앙은행 발언 분석',
        '통화정책 일정 추적'
      ]}
    />
  )
}