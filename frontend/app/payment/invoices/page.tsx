'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function InvoiceManagementPage() {
  return (
    <ExclusiveAccess
      title="인보이스 & 청구서 관리"
      category="결제 > 청구관리"
      description="AI 기반 자동화된 인보이스 생성, 국제 표준 준수 전문 청구서 시스템"
      features={[
        'AI 기반 맞춤형 인보이스 자동 생성',
        '다국어 템플릿 및 통화별 세금 계산',
        '브랜딩 커스터마이징 및 로고 삽입',
        '결제 상태 실시간 추적 대시보드',
        '자동 리마인더 및 스마트 독촉 시스템',
        '세금계산서/전자계산서 연동 발급',
        '클라이언트 전용 결제 포털 제공',
        'ERP/회계 시스템 API 양방향 연동'
      ]}
      requiredTier="Signature"
      techStack={['PDF Generator', 'Webhooks', 'Multi-currency API', 'SMTP']}
      previewType="document"
    />
  )
}