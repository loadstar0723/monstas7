'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function AnalyticsExportPage() {
  return (
    <ExclusiveAccess
      title="데이터 내보내기 시스템"
      category="분석 > 내보내기"
      description="모든 거래 및 분석 데이터를 다양한 포맷으로 내보내고 외부 시스템과 연동"
      features={[
        'CSV, Excel, JSON 다중 포맷',
        'API 자동 동기화',
        '스케줄링 자동 백업',
        '클라우드 스토리지 연동',
        '거래내역 완전 복원',
        '세금 보고서 호환성'
      ]}
      requiredTier="Platinum"
      techStack={['Python', 'Pandas', 'AWS S3', 'Celery']}
      previewType="tools"
    />
  )
}