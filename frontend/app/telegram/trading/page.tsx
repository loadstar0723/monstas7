import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function TelegramTradingPage() {
  return (
    <ExclusiveAccess
      title="자동 거래 실행"
      description="텔레그램 봇을 통해 실제 거래소와 연동하여 자동 트레이딩을 실행하세요"
      requiredTier="Master"
      features={[
        "실시간 자동 거래 실행",
        "다중 거래소 연동",
        "스마트 포지션 관리",
        "손실 제한 및 익절 설정",
        "고급 리스크 관리",
        "거래 이력 및 수익 추적"
      ]}
    />
  )
}