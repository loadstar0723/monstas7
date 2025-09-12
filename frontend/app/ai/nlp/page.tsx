'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function NLPPage() {
  return (
    <ExclusiveAccess
      title="뉴스 자연어 처리 엔진"
      description="최신 NLP 기술로 암호화폐 관련 뉴스와 공시를 실시간 분석하여 투자 인사이트 제공"
      requiredTier="Signature"
      features={[
        "실시간 뉴스 수집 및 NLP 기반 감성 분석",
        "RoBERTa, GPT 기반 텍스트 분류 및 요약",
        "프로젝트 공시, 파트너십 등 중요 이벤트 자동 감지",
        "뉴스 임팩트 점수 및 가격 영향도 예측",
        "다국어 뉴스 처리 (한국어, 영어, 중국어)",
        "키워드 트렌드 및 토픽 모델링"
      ]}
    />
  )
}
