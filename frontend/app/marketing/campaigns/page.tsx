'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function CampaignsPage() {
  return (
    <ExclusiveAccess
      title="AI 기반 마케팅 캠페인 자동화"
      description="머신러닝과 빅데이터 분석을 활용한 개인화된 마케팅 캠페인 관리 시스템"
      features={[
        "타겟 고객 AI 세분화 및 프로파일링",
        "실시간 캠페인 성과 추적 및 최적화",
        "다채널 마케팅 자동화 (이메일, SMS, 푸시)",
        "고객 여정 기반 개인화 메시징",
        "A/B 테스트 자동 실행 및 분석",
        "ROI 기반 예산 자동 배분",
        "소셜 미디어 통합 캠페인 관리",
        "전환율 예측 및 최적화 알고리즘"
      ]}
      requiredTier="Platinum"
    />
  )
}
