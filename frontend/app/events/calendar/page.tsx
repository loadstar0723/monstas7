'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function EventCalendarPage() {
  return (
    <ExclusiveAccess
      title="이벤트 캘린더"
      description="암호화폐 업계의 모든 중요한 이벤트를 한 곳에서 관리하고 추적합니다."
      requiredTier="Starter"
      features={[
        "통합 이벤트 캘린더 뷰",
        "중요도별 이벤트 분류 및 필터링",
        "개인 맞춤 이벤트 알림 설정",
        "시장 영향도 예측 및 분석",
        "이벤트별 투자 기회 추천",
        "글로벌 시간대 자동 변환",
        "이벤트 히스토리 및 성과 추적",
        "포트폴리오 연동 이벤트 임팩트 분석"
      ]}
    />
  )
}