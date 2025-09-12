'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function PaymentMethodsPage() {
  return (
    <ExclusiveAccess
      title="통합 결제수단 관리"
      category="결제 > 수단관리"
      description="국내외 모든 결제 방식 통합 지원, AI 기반 최적 결제 루트 자동 선택"
      features={[
        '신용/체크카드, 계좌이체, 무통장입금',
        '카카오페이, 네이버페이, 토스페이 연동',
        '암호화폐 20+ 코인 멀티체인 지원',
        'PayPal, Stripe 글로벌 결제 연동',
        '가상계좌 자동 발급 및 만료 관리',
        'AI 기반 수수료 최적화 엔진',
        '원클릭 결제 토큰화 보안 저장',
        '결제 실패 시 스마트 대체수단 제안'
      ]}
      requiredTier="Starter"
      techStack={['Payment Gateway', 'Tokenization', 'AI Optimizer', 'Multi-PG']}
      previewType="settings"
    />
  )
}