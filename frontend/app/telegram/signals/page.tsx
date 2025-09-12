import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function TelegramSignalsPage() {
  return (
    <ExclusiveAccess
      title="텔레그램 시그널 봇"
      description="AI 기반 실시간 트레이딩 시그널을 텔레그램으로 직접 받아보세요"
      requiredTier="Starter"
      features={[
        "실시간 매수/매도 시그널",
        "진입가, 목표가, 손절가 제공",
        "시그널 정확도 추적",
        "백테스트 성능 리포트",
        "리스크 수준별 필터링",
        "성과 추적 및 분석"
      ]}
    />
  )
}