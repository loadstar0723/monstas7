'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function UpgradePage() {
  return (
    <ExclusiveAccess
      title="업그레이드"
      category="구독 관리"
      description="현재 등급에서 더 높은 등급으로 업그레이드하여 고급 기능과 특내역 해제"
      features={[
        '단계별 업그레이드 경로',
        '이전 등급 비교 분석',
        '업그레이드 효과 미리보기',
        '즐시 업그레이드 옵션',
        '캐시백 이벤트',
        '기존 사용자 할인',
        '유료 전환 가이드',
        '맞춤 우대가 제공'
      ]}
      requiredTier="Professional"
      techStack={['Next.js', 'Stripe API', 'Webhooks', 'Redis']}
      previewType="upgrade"
    />
  )
}