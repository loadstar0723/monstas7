'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function AnalyticsPredictionsPage() {
  return (
    <ExclusiveAccess
      title="예측 분석 (Predictive Analytics)"
      category="분석 > 예측"
      description="머신러닝 및 딱러닝 기반 미래 가격 예측과 트레드 분석"
      features={[
        '가격 예측 모델 (LSTM, GRU)',
        '변동성 예측 시스템',
        '시나리오 분석',
        '가능성 기반 예측',
        '신뢰도 구간 표시',
        '예측 정확도 백테스팅'
      ]}
      requiredTier="Infinity"
      techStack={['TensorFlow', 'LSTM', 'Prophet', 'XGBoost']}
      previewType="charts"
    />
  )
}