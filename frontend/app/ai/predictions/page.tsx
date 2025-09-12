'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function PredictionsPage() {
  return (
    <ExclusiveAccess
      title="단기/중기/장기 가격 예측"
      description="다양한 시간 스케일에 최적화된 AI 모델로 정확한 가격 예측을 제공"
      requiredTier="Signature"
      features={[
        "단기 예측: 1분~4시간 스캘핑/데이트레이딩 최적화",
        "중기 예측: 1일~2주 스윙트레이딩 전략",
        "장기 예측: 1개월~6개월 포지션 트레이딩",
        "시간대별 최적화된 AI 모델 앙상블",
        "예측 확률 및 신뢰구간 제공",
        "리스크 조정 수익률 예측"
      ]}
    />
  )
}
