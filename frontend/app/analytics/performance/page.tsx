'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function AnalyticsPerformancePage() {
  return (
    <ExclusiveAccess
      title="성과 분석 (Performance Analytics)"
      category="분석 > 성과"
      description="전반적인 트레이딩 성과를 다각도로 분석하고 개선점을 제시"
      features={[
        '누적 수익률 추적',
        '벤치마크 대비 성과',
        '전략별 성과 비교',
        '시간대별 성과 분석',
        '리스크 대비 수익 평가',
        'AI 기반 성과 예측'
      ]}
      requiredTier="Platinum"
      techStack={['Python', 'TensorFlow', 'Sklearn', 'PostgreSQL']}
      previewType="charts"
    />
  )
}