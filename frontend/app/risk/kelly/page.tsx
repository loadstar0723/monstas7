'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="켈리 공식 최적화"
      description="확률과 배당률을 고려한 최적 베팅 크기 계산 시스템"
      requiredTier="Master"
      features={[
        '켈리 기준(Kelly Criterion) 계산',
        '분할 켈리 전략 구현',
        '리스크 조정 켈리 비율',
        '승률과 평균 손익 분석',
        '최적 포지션 사이징',
        '백테스팅 검증 시스템'
      ]}
    />
  )
}
