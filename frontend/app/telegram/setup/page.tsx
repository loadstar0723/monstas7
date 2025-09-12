import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function TelegramSetupPage() {
  return (
    <ExclusiveAccess
      title="텔레그램 봇 설정"
      description="개인화된 트레이딩 봇을 설정하고 맞춤형 알림과 기능을 구성하세요"
      requiredTier="Free"
      features={[
        "기본 봇 연동 설정",
        "알림 시간 맞춤 설정",
        "관심 코인 목록 관리",
        "기본 명령어 테스트",
        "초기 설정 가이드",
        "봇 상태 모니터링"
      ]}
    />
  )
}