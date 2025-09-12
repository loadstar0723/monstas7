'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function AnalyticsReportsPage() {
  return (
    <ExclusiveAccess
      title="전문 트레이딩 리포트 생성"
      category="분석 > 리포트"
      description="AI 기반 자동 리포트 생성으로 상세한 트레이딩 성과 분석과 시장 인사이트를 제공"
      features={[
        '자동 성과 분석 리포트',
        '커스텀 리포트 템플릿',
        'PDF/Excel 다중 포맷 지원',
        '스케줄링 자동 발송',
        '시각적 차트 및 그래프',
        '백테스팅 결과 통합'
      ]}
      requiredTier="Signature"
      techStack={['Python', 'Pandas', 'Matplotlib', 'ReportLab']}
      previewType="reports"
    />
  )
}