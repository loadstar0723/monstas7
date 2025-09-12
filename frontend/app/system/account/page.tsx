'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="계정 관리"
      description="개인 정보 및 계정 설정 관리"
      requiredTier="Free"
      features={[
        '프로필 설정',
        '비밀번호 변경',
        '2FA 보안 설정',
        '알림 설정',
        '개인정보 수정',
        '계정 탈퇴'
      ]}
    />
  )
}