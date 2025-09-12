'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function ApiBotPage() {
  return (
    <ExclusiveAccess
      title="멀티 거래소 API 통합 봇"
      category="트레이딩 > 자동화"
      description="Binance, Coinbase, Kraken 등 20개 거래소를 하나의 통합 API로 연결하여 동시 거래 및 차익거래 자동화"
      features={[
        "20개 주요 거래소 통합 API 연결",
        "실시간 가격차 감지 및 차익거래 자동화",
        "통합 오더북 및 거래량 실시간 집계",
        "거래소별 수수료 최적화 자동 선택",
        "통합 포트폴리오 관리 및 리밸런싱",
        "크로스 익스체인지 헤지 전략 실행",
        "API 키 암호화 및 보안 관리",
        "거래소 장애 시 자동 폴백 시스템"
      ]}
      requiredTier="Master"
      techStack={["Multi-Exchange API", "WebSocket Pool", "Redis Cache", "Encryption"]}
      previewType="bot"
    />
  )
}
