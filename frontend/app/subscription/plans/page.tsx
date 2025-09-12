'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function PlansPage() {
  return (
    <ExclusiveAccess
      title="구독 플랜"
      category="구독 관리"
      description="각 등급별 특내역과 가격 비교, 최적의 구독 플랜 선택을 위한 비교 플랫폼"
      features={[
        '등급별 상세 특내역 제공',
        '가격 비교 시뮤레이터',
        '업그레이드 로드맵',
        '무료 체험 안내',
        '사용 예상 비용 계산',
        '플랜 추천 시스템',
        '등급별 제한 사항',
        'ROI 예측 분석'
      ]}
      requiredTier="Starter"
      techStack={['Next.js', 'Payment API', 'Chart.js', 'Framer Motion']}
      previewType="plans"
    />
  )
}