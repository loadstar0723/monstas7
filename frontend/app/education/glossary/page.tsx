'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="용어 사전"
      description="암호화폐 및 블록체인 관련 전문 용어 해설"
      requiredTier="Free"
      features={[
        'A-Z 용어 정리',
        '카테고리별 분류',
        '예시와 함께 설명',
        '최신 용어 업데이트',
        '검색 기능',
        '북마크 기능'
      ]}
    />
  )
}