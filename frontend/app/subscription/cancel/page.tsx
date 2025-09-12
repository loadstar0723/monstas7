'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function CancelPage() {
  return (
    <ExclusiveAccess
      title="구독 취소"
      category="구독 관리"
      description="구독 취소 절차, 수수료 및 주의사항 안내, 대안 솔루션 제공"
      features={[
        '일시 중단/완전 취소 옵션',
        '취소 예약 스케줄링',
        '사용 예정 비용 확인',
        '대안 플랜 제안',
        '취소 이유 분석',
        '서비스 개선사항 수집',
        '전담 상담원 연결',
        '유지 혜택 안내'
      ]}
      requiredTier="Starter"
      techStack={['Next.js', 'CRM API', 'Email API', 'Analytics']}
      previewType="cancel"
    />
  )
}