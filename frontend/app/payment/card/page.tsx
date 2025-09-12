'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function CardPaymentPage() {
  return (
    <ExclusiveAccess
      title="신용/체크카드 결제 시스템"
      category="결제 > 카드결제"
      description="국내외 모든 카드사 지원, 최고 보안 수준의 안전한 카드 결제 시스템"
      features={[
        '국내외 모든 신용카드 및 체크카드 지원',
        'PCI DSS Level 1 보안 인증 완료',
        '자동 정기결제 및 구독 관리 시스템',
        '결제 실패 시 스마트 재시도 로직',
        '카드사별 무이자 할부 최적화',
        '실시간 결제 승인 및 즉시 알림',
        '사기 거래 탐지 AI 시스템',
        '3D Secure 2.0 추가 인증 지원'
      ]}
      requiredTier="Starter"
      techStack={['Stripe API', 'Toss Payments', 'NHN KCP', 'Inicis']}
      previewType="form"
    />
  )
}