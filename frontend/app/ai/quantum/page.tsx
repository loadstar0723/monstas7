'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function QuantumPage() {
  return (
    <ExclusiveAccess
      title="양자 컴퓨팅 최적화"
      description="양자 어닐링과 QAOA 알고리즘을 활용한 포트폴리오 최적화 및 리스크 관리 시스템"
      requiredTier="Infinity"
      features={[
        "양자 어닐링 기반 포트폴리오 최적화",
        "QAOA 알고리즘을 통한 리스크 최소화",
        "양자 머신러닝 모델 하이브리드 시스템",
        "복잡한 제약조건 하의 최적 자산 배분",
        "양자 컴퓨팅 기반 몬테카를로 시뮬레이션",
        "차세대 양자 우위 투자 전략"
      ]}
    />
  )
}
