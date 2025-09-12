'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function ClusteringPage() {
  return (
    <ExclusiveAccess
      title="시장 상태 클러스터 분석"
      description="K-means, DBSCAN 클러스터링으로 시장 상태를 분류하고 최적 전략을 제시"
      requiredTier="Platinum"
      features={[
        "실시간 시장 상태 클러스터링 및 분류",
        "Bull/Bear/Sideways 등 시장 국면 자동 감지",
        "클러스터별 최적화된 매매 전략 제시",
        "변동성 패턴 및 거래량 클러스터 분석",
        "시장 상태 전환점 예측 및 알림",
        "Historical 패턴 매칭 및 유사도 분석"
      ]}
    />
  )
}
