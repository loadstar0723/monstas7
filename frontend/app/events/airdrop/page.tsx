'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function AirdropPage() {
  return (
    <ExclusiveAccess
      title="에어드랍 트래커"
      description="최신 에어드랍 정보와 참여 기회를 실시간으로 추적하고 분석합니다."
      requiredTier="Professional"
      features={[
        "실시간 에어드랍 정보 알림",
        "참여 조건 및 자격 요구사항 분석",
        "에어드랍 가치 예측 및 평가",
        "자동 참여 기능 및 일정 관리",
        "과거 에어드랍 성과 데이터베이스",
        "사기 에어드랍 필터링 및 보안 검증",
        "토큰 분배 일정 및 클레임 알림",
        "포트폴리오별 에어드랍 최적화 전략"
      ]}
    />
  )
}