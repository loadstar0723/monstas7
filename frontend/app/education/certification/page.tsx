'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="트레이더 인증"
      description="체계적인 학습과 평가를 통한 트레이더 자격 인증"
      requiredTier="Platinum"
      features={[
        '레벨별 학습 과정',
        '실력 평가 테스트',
        '인증서 발급',
        '전문가 멘토링',
        '커뮤니티 액세스',
        '지속 교육 프로그램'
      ]}
    />
  )
}