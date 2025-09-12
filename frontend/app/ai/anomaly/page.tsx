'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function AnomalyPage() {
  return (
    <ExclusiveAccess
      title="이상거래 실시간 감지"
      description="Isolation Forest, Autoencoder를 활용한 이상 거래 패턴 실시간 탐지 시스템"
      requiredTier="Platinum"
      features={[
        "실시간 이상 거래 패턴 감지 및 알림",
        "펌프 앤 덤프, 조작 거래 조기 탐지",
        "고래 거래 및 비정상 거래량 감지",
        "시장 조작 신호 및 워시 트레이딩 탐지",
        "이상 징후별 위험도 등급 분류",
        "Historical 이상 거래 데이터베이스 구축"
      ]}
    />
  )
}
