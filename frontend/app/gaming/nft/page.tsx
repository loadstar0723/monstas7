'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="NFT 게임"
      description="NFT 기반 트레이딩 카드와 수집품 게임"
      requiredTier="Master"
      features={[
        '트레이딩 카드 NFT',
        '카드 배틀 시스템',
        '레어 카드 수집',
        'P2E 리워드',
        '카드 거래소',
        '시즌별 이벤트'
      ]}
    />
  )
}