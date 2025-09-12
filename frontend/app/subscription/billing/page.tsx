'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function BillingPage() {
  return (
    <ExclusiveAccess
      title="청구 관리"
      category="구독 관리"
      description="구독 요금, 결제 내역, 영수증 다운로드를 한 곳에서 관리하는 통합 청구 시스템"
      features={[
        '실시간 청구 현황 조회',
        '결제 방법 변경 및 관리',
        '영수증 자동 발급',
        '세금계산서 발행',
        '결제 실패 알림',
        '자동 결제 설정',
        '할인 쿠폰 적용',
        '환불 요청 처리'
      ]}
      requiredTier="Starter"
      techStack={['Next.js', 'Stripe API', 'PostgreSQL', 'PDF.js']}
      previewType="billing"
    />
  )
}