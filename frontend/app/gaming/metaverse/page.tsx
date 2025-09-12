'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="메타버스 트레이딩"
      description="가상현실 환경에서의 몰입형 트레이딩 경험"
      requiredTier="Infinity"
      features={[
        'VR 트레이딩 룸',
        '3D 차트 시각화',
        '아바타 커스터마이징',
        '가상 거래소',
        '소셜 트레이딩 공간',
        'NFT 수집품'
      ]}
    />
  )
}