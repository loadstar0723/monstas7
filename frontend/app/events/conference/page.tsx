'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function ConferenceSchedulePage() {
  return (
    <ExclusiveAccess
      title="컨퍼런스 일정"
      description="글로벌 블록체인 컨퍼런스와 이벤트 정보를 실시간으로 제공합니다."
      requiredTier="Professional"
      features={[
        "글로벌 컨퍼런스 일정 통합 관리",
        "주요 발표자 및 세션 정보",
        "실시간 라이브 스트리밍 링크",
        "네트워킹 기회 및 참가자 정보",
        "컨퍼런스별 시장 영향도 분석",
        "VIP 참석자 및 기관 투자자 추적",
        "발표 내용 요약 및 핵심 인사이트",
        "투자 기회 발굴 및 프로젝트 스카우팅"
      ]}
    />
  )
}