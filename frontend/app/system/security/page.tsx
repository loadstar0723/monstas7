'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="보안 설정"
      description="계정 보안 강화 및 위험 관리"
      requiredTier="Professional"
      features={[
        '2FA 인증 설정',
        '로그인 기록 조회',
        'IP 화이트리스트',
        '세션 관리',
        '보안 알림',
        '의심 활동 탐지'
      ]}
    />
  )
}