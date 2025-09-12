'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="도미넌스 분석"
      description="비트코인과 주요 알트코인의 시장 지배력 변화 추적"
      requiredTier="Signature"
      features={[
        '비트코인 도미넌스 차트',
        '이더리움 도미넌스 분석',
        '스테이블코인 비중 변화',
        '시가총액 순위 변동',
        '도미넌스 기반 매매 신호',
        '시장 단계별 전략'
      ]}
    />
  )
}