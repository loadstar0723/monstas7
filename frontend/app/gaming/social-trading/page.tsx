'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="소셜 트레이딩"
      description="성공한 트레이더의 전략을 따라하는 소셜 투자"
      requiredTier="Platinum"
      features={[
        '인기 트레이더 팔로우',
        '자동 복사 거래',
        '트레이더 순위',
        '전략 분석',
        '수수료 공유',
        '커뮤니티 피드'
      ]}
    />
  )
}