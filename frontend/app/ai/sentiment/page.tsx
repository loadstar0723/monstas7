'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function SentimentPage() {
  return (
    <ExclusiveAccess
      title="소셜 미디어 감성 분석 AI"
      description="Twitter, Reddit, 텔레그램 등 소셜 미디어 데이터의 실시간 감성 분석 시스템"
      requiredTier="Platinum"
      features={[
        "실시간 소셜 미디어 데이터 수집 및 감성 분석",
        "BERT 기반 한국어/영어 감성 분류 모델",
        "인플루언서 및 고래 계정 가중치 분석",
        "감성 지수와 가격 상관관계 분석",
        "소셜 트렌드 기반 매매 신호 생성",
        "바이럴 이벤트 및 FUD 조기 감지"
      ]}
    />
  )
}
