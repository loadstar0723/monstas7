'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function AnalyticsInsightsPage() {
  return (
    <ExclusiveAccess
      title="AI 인사이트 엔진"
      category="분석 > 인사이트"
      description="고급 AI 알고리즘으로 트레이딩 패턴을 분석하고 실용적 인사이트 제공"
      features={[
        '차세대 GPT 모델 활용',
        '시장 패턴 예측',
        '개인화된 추천 전략',
        '실시간 시장 분석',
        '리스크 경고 시스템',
        '고백이에레 내러티브'
      ]}
      requiredTier="Master"
      techStack={['GPT-4', 'PyTorch', 'LSTM', 'Transformers']}
      previewType="ai"
    />
  )
}