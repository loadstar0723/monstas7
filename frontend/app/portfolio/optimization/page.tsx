'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="포트폴리오 최적화"
      description="수학적 모델을 통한 포트폴리오 성과 극대화"
      requiredTier="Master"
      features={[
        '마코위츠 최적화',
        '제약 조건 설정',
        '거래 비용 고려',
        '다목적 최적화',
        '강건한 최적화',
        '베이지안 최적화'
      ]}
    />
  )
}