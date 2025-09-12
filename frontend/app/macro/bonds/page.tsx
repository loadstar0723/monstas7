'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="채권 시장 분석"
      description="글로벌 채권 시장 동향과 수익률 곡선 분석"
      requiredTier="Signature"
      features={[
        '국가별 채권 수익률 비교',
        '수익률 곡선 분석',
        '신용 스프레드 추적',
        '중앙은행 정책 영향',
        '인플레이션 연동채 분석',
        '채권 듀레이션 리스크'
      ]}
    />
  )
}