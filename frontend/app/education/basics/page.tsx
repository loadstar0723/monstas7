'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="트레이딩 기초"
      description="암호화폐 트레이딩의 기본 개념과 용어 학습"
      requiredTier="Free"
      features={[
        '기초 용어 정리',
        '차트 읽는 방법',
        '주문 타입 설명',
        '기본 지표 활용',
        '리스크 관리 기초',
        '실전 예제 학습'
      ]}
    />
  )
}