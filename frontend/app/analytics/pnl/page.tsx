'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function AnalyticsPnlPage() {
  return (
    <ExclusiveAccess
      title="손익 분석 (P&L Analysis)"
      category="분석 > 손익"
      description="상세한 수익성 분석과 손실 요인 파악을 통한 포트폴리오 최적화"
      features={[
        '일별/월별/년별 P&L 분석',
        '대기별 수익성 비교',
        '거래비용 영향도 분석',
        '리스크 조정 수익률',
        '실현 vs 미실현 손익',
        '세금 최적화 전략'
      ]}
      requiredTier="Signature"
      techStack={['Python', 'Pandas', 'Plotly', 'FastAPI']}
      previewType="charts"
    />
  )
}