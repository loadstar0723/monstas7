'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function CouponSystemPage() {
  return (
    <ExclusiveAccess
      title="스마트 쿠폰 & 할인 시스템"
      category="결제 > 쿠폰"
      description="AI 기반 개인화 쿠폰 발급, 게이미피케이션 리워드 및 동적 할인 최적화"
      features={[
        '신규 가입 웰컴 쿠폰 자동 발급',
        'AI 기반 개인 맞춤 쿠폰 추천',
        '등급별 VIP 전용 쿠폰 매월 지급',
        '시즌/이벤트 한정 특별 할인 쿠폰',
        '구매 패턴 분석 로열티 쿠폰',
        '생일/기념일 개인화 축하 혜택',
        '쿠폰 만료 스마트 알림 시스템',
        '중복 할인 최적화 자동 계산'
      ]}
      requiredTier="Professional"
      techStack={['Coupon Engine', 'ML Personalization', 'Push Notifications', 'Redis']}
      previewType="rewards"
    />
  )
}