import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function TelegramPremiumPage() {
  return (
    <ExclusiveAccess
      title="프리미엄 봇 서비스"
      description="고급 AI 분석과 VIP 전용 기능이 포함된 프리미엄 텔레그램 봇을 사용하세요"
      requiredTier="Signature"
      features={[
        "AI 맞춤형 시그널 분석",
        "VIP 전용 채널 접근",
        "실시간 포트폴리오 관리",
        "고급 리스크 관리",
        "24/7 우선 고객지원",
        "개인 맞춤 트레이딩 전략"
      ]}
    />
  )
}