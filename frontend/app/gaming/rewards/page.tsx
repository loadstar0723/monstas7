'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="리워드 시스템"
      description="거래 활동과 참여에 따른 다양한 보상 시스템"
      requiredTier="Professional"
      features={[
        '포인트 적립',
        '등급별 혜택',
        '캐시백 리워드',
        '무료 구독권',
        '특별 이벤트',
        '추천인 보상'
      ]}
    />
  )
}