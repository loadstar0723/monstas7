import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function TelegramStatsPage() {
  return (
    <ExclusiveAccess
      title="텔레그램 통계 분석"
      description="봇 사용량과 시그널 성과를 상세하게 분석하고 추적하세요"
      requiredTier="Professional"
      features={[
        "봇 사용 통계 대시보드",
        "시그널 성과 분석",
        "사용자 활동 추적",
        "수익률 히스토리",
        "성과 벤치마킹",
        "상세 분석 리포트"
      ]}
    />
  )
}