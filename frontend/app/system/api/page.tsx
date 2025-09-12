'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="API 연동 설정"
      description="거래소 API 연동 및 자동화 거래 설정"
      requiredTier="Master"
      features={[
        '거래소 API 키 설정',
        'REST API 연동',
        'WebSocket 실시간 데이터',
        'API 보안 설정',
        '자동 거래 봇 설정',
        'API 사용량 관리'
      ]}
    />
  )
}