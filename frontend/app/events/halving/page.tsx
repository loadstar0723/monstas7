'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function HalvingEventsPage() {
  return (
    <ExclusiveAccess
      title="반감기 전략 대시보드"
      category="이벤트 > 반감기"
      description="비트코인 및 주요 암호화폐 반감기를 예측하고 최적의 투자 타이밍을 찾는 AI 분석 시스템"
      features={[
        "전 암호화폐 반감기 실시간 카운트다운",
        "AI 기반 반감기 전후 가격 예측 모델",
        "채굴 난이도 및 해시레이트 부간 모니터링",
        "반감기 타이밍 최적화 포트폴리오 전략",
        "과거 5차례 반감기 패턴 분석 및 예측",
        "채굴자 수익성 대비 투자 기회 분석",
        "반감기 기반 자동 매매 전략",
        "기관 투자자 대응 패턴 분석"
      ]}
      requiredTier="Signature"
      techStack={['Python', 'AI/ML', 'TensorFlow', 'Redis']}
      previewType="dashboard"
    />
  )
}
