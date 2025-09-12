'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function SubscriptionPlansPage() {
  return (
    <ExclusiveAccess
      title="구독 플랜 & 요금제 관리"
      category="결제 > 요금제"
      description="Free ~ Infinity 7단계 구독제, AI 기반 맞춤 플랜 추천 및 실시간 변경 시스템"
      features={[
        'Free → Starter → Professional → Platinum → Signature → Master → Infinity',
        '플랜별 실시간 기능 비교 매트릭스',
        '즉시 업그레이드/다운그레이드 시스템',
        '비례 계산 자동 환불 및 차액 정산',
        'AI 기반 사용 패턴 분석 플랜 추천',
        '가족/팀 플랜 멀티 사용자 관리',
        '자동 갱신 및 결제 실패 알림',
        '플랜별 ROI 분석 및 최적화 제안'
      ]}
      requiredTier="Free"
      techStack={['Subscription Engine', 'Billing API', 'Analytics', 'ML Recommender']}
      previewType="pricing"
    />
  )
}