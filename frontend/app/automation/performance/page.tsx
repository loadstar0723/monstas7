'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function PerformancePage() {
  return (
    <ExclusiveAccess
      title="봇 성과 실시간 모니터링"
      category="트레이딩 > 자동화"
      description="24/7 작동하는 트레이딩 봇의 성과를 실시간으로 추적하고 분석하여 최적의 성능을 유지하는 고급 모니터링 대시보드"
      features={[
        "실시간 수익률 및 손익 추적",
        "리스크 지표 모니터링 (샤프 비율, MDD 등)",
        "거래 통계 및 패턴 분석",
        "전략별 성과 비교 및 벤치마킹",
        "알림 시스템 (임계값 도달 시 즉시 알림)",
        "성과 저하 시 자동 봇 중단 기능",
        "커스텀 KPI 대시보드 구성",
        "상세 거래 히스토리 및 리포트 생성"
      ]}
      requiredTier="Signature"
      techStack={["Analytics Engine", "Real-time Dashboard", "Alert System", "Performance Metrics"]}
      previewType="dashboard"
    />
  )
}