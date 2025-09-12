'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function AffiliatePage() {
  return (
    <ExclusiveAccess
      title="스마트 제휴 마케팅 생태계"
      description="AI 기반 파트너 매칭과 실시간 성과 추적을 통한 차세대 제휴 마케팅 플랫폼"
      features={[
        "AI 기반 최적 파트너 자동 매칭 시스템",
        "실시간 트래픽 및 전환율 분석 대시보드",
        "스마트 수수료 구조 및 자동 정산 시스템",
        "멀티 플랫폼 통합 추적 (웹/앱/소셜)",
        "파트너별 맞춤형 마케팅 소재 자동 생성",
        "퍼포먼스 기반 파트너 등급 관리",
        "실시간 경쟁사 벤치마킹 및 분석",
        "블록체인 기반 투명한 수익 배분 시스템"
      ]}
      requiredTier="Signature"
    />
  )
}
