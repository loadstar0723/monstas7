import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function TelegramAlertsPage() {
  return (
    <ExclusiveAccess
      title="텔레그램 알림 설정"
      description="중요한 시장 변동과 트레이딩 시그널을 실시간으로 받아보세요"
      requiredTier="Professional"
      features={[
        "실시간 가격 변동 알림",
        "고래 거래 감지 알림",
        "청산 위험 경고",
        "기술적 지표 신호",
        "뉴스 속보 알림",
        "개인 맞춤 알림 설정"
      ]}
    />
  )
}
