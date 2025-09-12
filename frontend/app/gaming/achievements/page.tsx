'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="트레이딩 업적"
      description="거래 성과에 따른 배지와 업적 시스템"
      requiredTier="Professional"
      features={[
        '수익률 배지',
        '연속 성공 기록',
        '거래량 마일스톤',
        '정확도 레벨',
        '리더보드 랭킹',
        '특별 칭호 획득'
      ]}
    />
  )
}