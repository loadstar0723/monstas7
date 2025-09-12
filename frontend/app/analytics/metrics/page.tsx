'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function AnalyticsMetricsPage() {
  return (
    <ExclusiveAccess
      title="핵심 지표 분석"
      category="분석 > 지표"
      description="트레이딩 성과를 측정하는 주요 KPI와 지표들을 실시간 모니터링하고 분석"
      features={[
        'Sharpe Ratio 및 위험 지표',
        'Win Rate & Profit Factor',
        '최대 드로다운 및 복구 분석',
        '베타, 알파 성과 측정',
        '이동평균 리터 분석',
        '샤피로 비율 최적화 제안'
      ]}
      requiredTier="Platinum"
      techStack={['Python', 'NumPy', 'SciPy', 'QuantLib']}
      previewType="charts"
    />
  )
}