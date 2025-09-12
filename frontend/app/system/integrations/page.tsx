'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="외부 서비스 연동"
      description="써드파티 서비스와의 연동 및 동기화"
      requiredTier="Platinum"
      features={[
        '포트폴리오 트래커 연동',
        '세무 소프트웨어 동기화',
        'DeFi 프로토콜 연결',
        '소셜 미디어 연동',
        '뉴스 피드 통합',
        '알림 서비스'
      ]}
    />
  )
}