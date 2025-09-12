'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="DeFi 교육"
      description="탈중앙화 금융의 이해와 실전 활용 가이드"
      requiredTier="Professional"
      features={[
        'DeFi 기초 개념',
        '유동성 공급 방법',
        '이자 농사 전략',
        '임펄머넌트 로스 이해',
        '거버넌스 참여',
        '리스크 관리'
      ]}
    />
  )
}