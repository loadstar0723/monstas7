'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="트레이딩 길드"
      description="같은 관심사를 가진 트레이더들의 그룹 활동"
      requiredTier="Platinum"
      features={[
        '길드 생성/가입',
        '그룹 채팅',
        '공동 포트폴리오',
        '길드 대항전',
        '지식 공유',
        '멘토-멘티 매칭'
      ]}
    />
  )
}