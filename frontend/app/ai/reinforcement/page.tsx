'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function ReinforcementPage() {
  return (
    <ExclusiveAccess
      title="강화학습 자동 트레이딩"
      description="Deep Q-Network 기반 강화학습으로 시장 환경에 적응하는 자동 매매 시스템"
      requiredTier="Master"
      features={[
        "Deep Q-Network 기반 자동 매매 에이전트",
        "실시간 시장 환경 적응 및 전략 최적화",
        "Multi-agent 시스템으로 다양한 전략 동시 실행",
        "리스크 관리 및 포지션 사이징 최적화",
        "백테스팅 및 실전 성과 비교 분석",
        "연속 학습을 통한 성능 개선"
      ]}
    />
  )
}
