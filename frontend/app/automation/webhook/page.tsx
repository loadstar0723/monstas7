'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function WebhookPage() {
  return (
    <ExclusiveAccess
      title="TradingView 시그널 자동 실행"
      category="트레이딩 > 자동화"
      description="TradingView 경고 알림을 실시간으로 감지하여 0.1초 이내 자동 거래 실행하는 초고속 Webhook 시스템"
      features={[
        "TradingView Pine Script 전략 자동 연동",
        "실시간 Webhook 수신 및 0.1초 이내 거래 실행",
        "멀티 Webhook URL 동시 모니터링",
        "거래소별 API 키 자동 로테이션",
        "Webhook 신호 검증 및 보안 필터링",
        "백테스팅 결과 자동 매핑 및 실행",
        "포지션 크기 자동 계산 및 조정",
        "Webhook 실행 로그 및 성과 분석"
      ]}
      requiredTier="Master"
      techStack={["Webhook Server", "Redis Queue", "WebSocket", "Signal Processing"]}
      previewType="dashboard"
    />
  )
}
