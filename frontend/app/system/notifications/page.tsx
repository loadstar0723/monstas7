'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="알림 설정"
      description="다양한 알림과 경고 시스템 설정"
      requiredTier="Professional"
      features={[
        '가격 알림 설정',
        '이메일/SMS 알림',
        '푸시 알림',
        '텔레그램 봇 연동',
        '알림 빈도 조절',
        '중요도별 분류'
      ]}
    />
  )
}