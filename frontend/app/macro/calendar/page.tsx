'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="경제 캘린더"
      description="주요 경제 지표 발표 일정과 시장 영향도 분석"
      requiredTier="Signature"
      features={[
        '중요 경제지표 일정',
        '발표 전후 변동성 분석',
        'GDP, CPI, NFP 추적',
        '중앙은행 회의 일정',
        '기업 실적 발표',
        '시장 컨센서스 비교'
      ]}
    />
  )
}