'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function HackathonEventsPage() {
  return (
    <ExclusiveAccess
      title="해커톤 이벤트"
      description="블록체인 해커톤과 개발자 경진대회 정보를 종합적으로 제공합니다."
      requiredTier="Signature"
      features={[
        "글로벌 해커톤 일정 및 등록 정보",
        "상금 규모별 해커톤 분류",
        "참여 조건 및 기술 스택 요구사항",
        "우승 프로젝트 분석 및 트렌드",
        "투자 연계 해커톤 특별 추적",
        "개발자 팀 매칭 및 네트워킹",
        "해커톤 성과와 토큰 런치 연관성",
        "혁신적 프로젝트 조기 발굴"
      ]}
    />
  )
}