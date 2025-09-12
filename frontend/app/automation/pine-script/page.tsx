'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function PineScriptPage() {
  return (
    <ExclusiveAccess
      title="파인스크립트 전략 자동화"
      category="트레이딩 > 자동화"
      description="TradingView Pine Script 전략을 실거래 봇으로 자동 변환하여 24/7 무중단 자동매매 실행하는 전략 자동화 엔진"
      features={[
        "Pine Script 코드 자동 분석 및 거래 로직 추출",
        "백테스팅 결과 실거래 환경으로 자동 매핑",
        "진입/청산 조건 실시간 모니터링 및 실행",
        "Pine Script 변수 및 파라미터 실시간 조정",
        "알림 조건을 실거래 신호로 자동 변환",
        "멀티 타임프레임 전략 통합 실행",
        "Pine Script 성능 지표 실시간 추적",
        "전략 코드 업데이트 시 자동 재배포"
      ]}
      requiredTier="Signature"
      techStack={["Pine Script Parser", "Strategy Engine", "Real-time Execution", "Performance Tracking"]}
      previewType="bot"
    />
  )
}