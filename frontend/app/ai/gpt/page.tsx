'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function GPT4Page() {
  return (
    <ExclusiveAccess
      title="GPT-4 기반 시장 예측 엔진"
      description="OpenAI GPT-4를 활용한 고도화된 암호화폐 시장 분석 및 예측 시스템"
      requiredTier="Master"
      features={[
        "GPT-4 기반 실시간 시장 분석 및 트렌드 예측",
        "뉴스, 소셜미디어, 온체인 데이터 종합 해석",
        "자연어로 표현되는 상세한 시장 인사이트",
        "복합적 시장 상황에 대한 AI 전문가 의견",
        "개인화된 투자 전략 및 리스크 관리 조언",
        "실시간 시장 변화에 대한 즉각적 분석"
      ]}
    />
  )
}