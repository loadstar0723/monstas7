'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="펀더멘털 분석"
      description="암호화폐 프로젝트의 기본 가치 평가 방법론"
      requiredTier="Professional"
      features={[
        '프로젝트 평가 기준',
        '토크노믹스 분석',
        '팀 및 파트너십 평가',
        '기술적 혁신성',
        '시장 적용 가능성',
        '경쟁 분석'
      ]}
    />
  )
}