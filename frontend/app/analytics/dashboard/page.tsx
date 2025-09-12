'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function AnalyticsDashboardPage() {
  return (
    <ExclusiveAccess
      title="통합 분석 대시보드"
      category="분석 > 대시보드"
      description="모든 트레이딩 데이터를 한눈에 보는 종합 분석 대시보드로 실시간 성과와 리스크를 모니터링"
      features={[
        '실시간 포트폴리오 현황',
        '수익률 추적 및 분석',
        '리스크 지표 모니터링',
        '시장 상관관계 분석',
        '개인화된 인사이트',
        '알람 및 알림 시스템'
      ]}
      requiredTier="Platinum"
      techStack={['React', 'D3.js', 'WebSocket', 'PostgreSQL']}
      previewType="dashboard"
    />
  )
}