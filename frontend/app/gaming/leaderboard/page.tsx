'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="리더보드"
      description="트레이더들의 실시간 순위와 성과 비교"
      requiredTier="Professional"
      features={[
        '일일/주간/월간 순위',
        '수익률 랭킹',
        '승률 순위',
        '거래량 순위',
        '안정성 점수',
        '종합 평가'
      ]}
    />
  )
}