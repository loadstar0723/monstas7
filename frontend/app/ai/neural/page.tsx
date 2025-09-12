'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function NeuralPage() {
  return (
    <ExclusiveAccess
      title="신경망 가격 예측 모델"
      description="LSTM, Transformer 기반 심층 신경망을 활용한 정밀 가격 예측 시스템"
      requiredTier="Signature"
      features={[
        "LSTM 기반 시계열 데이터 분석 및 가격 예측",
        "Transformer 아키텍처를 활용한 장기 트렌드 예측",
        "Multi-modal 데이터 융합 (가격, 거래량, 온체인, 뉴스)",
        "실시간 모델 재학습 및 성능 최적화",
        "예측 신뢰구간 및 불확실성 정량화",
        "백테스팅 및 성과 검증 시스템"
      ]}
    />
  )
}
