'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function EnsemblePage() {
  return (
    <ExclusiveAccess
      title="11개 AI 모델 앙상블 시스템"
      description="다양한 AI 모델의 예측을 통합하여 최고 정확도의 매매 신호를 생성"
      requiredTier="Master"
      features={[
        "LSTM, CNN, Transformer 등 11개 AI 모델 통합",
        "Dynamic Weight 기반 앙상블 최적화",
        "실시간 모델 성능 평가 및 가중치 조정",
        "Meta-learning을 통한 앙상블 학습",
        "모델 간 상관관계 분석 및 다양성 최적화",
        "통합 신뢰도 점수 및 예측 범위 제공"
      ]}
    />
  )
}
