'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function PaperTradingPage() {
  return (
    <ExclusiveAccess
      title="실전 시뮬레이션 엔진"
      category="트레이딩 > 자동화"
      description="실제 시장 데이터와 동일한 환경에서 위험 없이 전략을 테스트하고 검증할 수 있는 고도화된 모의거래 플랫폼"
      features={[
        "실시간 시장 데이터 기반 정밀한 모의거래",
        "슬리패지 및 수수료 현실적 반영",
        "무제한 가상 자본금으로 전략 테스트",
        "실제 거래소 API와 동일한 환경 시뮬레이션",
        "멀티 전략 동시 백테스팅 및 성과 비교",
        "리스크 시나리오 테스트 (블랙스완 이벤트 등)",
        "실전 배포 전 전략 검증 리포트 자동 생성",
        "모의거래 결과를 실거래로 원클릭 전환"
      ]}
      requiredTier="Master"
      techStack={["Simulation Engine", "Market Data Feed", "Risk Modeling", "Performance Analytics"]}
      previewType="dashboard"
    />
  )
}