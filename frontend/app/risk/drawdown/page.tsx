'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="Drawdown 분석"
      description="포트폴리오 최대 손실 구간을 분석하여 리스크 관리 최적화"
      requiredTier="Signature"
      features={[
        '최대 낙폭(MDD) 실시간 계산',
        'Drawdown 기간 및 회복 분석',
        '리스크 조정 수익률 측정',
        'Calmar Ratio 계산',
        '포트폴리오별 Drawdown 비교',
        '스트레스 테스트 시나리오'
      ]}
    />
  )
}