'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="외환 시장 분석"
      description="주요 통화쌍의 환율 동향과 크로스 커런시 분석"
      requiredTier="Master"
      features={[
        '주요 통화쌍 분석',
        '크로스 커런시 기회',
        '캐리 트레이드 전략',
        '중앙은행 개입 추적',
        '경제지표 영향 분석',
        '헤지 전략 활용'
      ]}
    />
  )
}