'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function HistoryPage() {
  return (
    <ExclusiveAccess
      title="구독 내역"
      category="구독 관리"
      description="전체 구독 이력, 결제 내역, 사용량 통계를 시간순으로 추적 및 분석"
      features={[
        '전체 구독 타임라인',
        '결제 내역 상세 조회',
        '사용량 통계 대시보드',
        'ROI 분석 리포트',
        '등급 변경 내역',
        '할인/쿠폰 사용 내역',
        '사용량 경고 알림',
        '내역 복버 기능'
      ]}
      requiredTier="Starter"
      techStack={['Next.js', 'Chart.js', 'Date-fns', 'Export API']}
      previewType="history"
    />
  )
}