'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="가격 예측 게임"
      description="암호화폐 가격 예측을 통한 포인트 획득 게임"
      requiredTier="Professional"
      features={[
        '일일 예측 미션',
        '정확도 점수',
        '예측 스트릭',
        '보너스 포인트',
        '예측왕 선발',
        '리워드 교환'
      ]}
    />
  )
}