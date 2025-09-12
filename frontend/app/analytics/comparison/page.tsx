'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function AnalyticsComparisonPage() {
  return (
    <ExclusiveAccess
      title="비교 분석 (Comparative Analysis)"
      category="분석 > 비교"
      description="다양한 전략과 자산 간 성과 비교 분석으로 최적 포트폴리오 구성"
      features={[
        '전략 간 성과 비교',
        '자산별 수익률 대비',
        '시장 지수 대비 성과',
        '다른 투자자 대비 랭킹',
        '비용 대비 효율성',
        '리스크 조정 수익률 비교'
      ]}
      requiredTier="Master"
      techStack={['Python', 'Matplotlib', 'Seaborn', 'Jupyter']}
      previewType="charts"
    />
  )
}