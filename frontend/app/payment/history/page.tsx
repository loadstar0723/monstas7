'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function PaymentHistoryPage() {
  return (
    <ExclusiveAccess
      title="결제 내역 관리 시스템"
      category="결제 > 내역관리"
      description="모든 결제 기록의 완전한 추적성 보장, 실시간 분석 및 세무 신고 지원"
      features={[
        '실시간 결제 내역 동기화 및 조회',
        '고급 필터링 및 검색 엔진',
        '월별/연도별/카테고리별 통계 분석',
        '전자 영수증 자동 발급 및 관리',
        '결제 상태 실시간 추적 시스템',
        '구독/일회성 결제 분류 관리',
        'PDF/Excel/CSV 다중 포맷 내보내기',
        '세무 신고용 데이터 자동 생성'
      ]}
      requiredTier="Starter"
      techStack={['React Table', 'Chart.js', 'PDF-lib', 'Elasticsearch']}
      previewType="dashboard"
    />
  )
}