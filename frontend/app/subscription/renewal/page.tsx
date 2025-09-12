'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function RenewalPage() {
  return (
    <ExclusiveAccess
      title="자동 갱신"
      category="구독 관리"
      description="구독 자동 갱신 설정, 갱신 알림, 결제 실패 대응 및 갱신 연기 옵션 관리"
      features={[
        '자동 갱신 ON/OFF 설정',
        '갱신 알림 스케줄링',
        '결제 실패 자동 재시도',
        '갱신 연기 옵션 (30일)',
        '갱신전 할인 이벤트',
        '결제 수단 변경',
        '갱신 날짜 변경',
        '갱신 실패 알림'
      ]}
      requiredTier="Professional"
      techStack={['Next.js', 'Cron Jobs', 'Email API', 'Payment Gateway']}
      previewType="renewal"
    />
  )
}