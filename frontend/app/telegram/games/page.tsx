import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function TelegramGamesPage() {
  return (
    <ExclusiveAccess
      title="텔레그램 게임 센터"
      description="트레이딩 시뮬레이션 게임과 포인트 리워드 시스템을 즐기세요"
      requiredTier="Professional"
      features={[
        "가상 트레이딩 게임",
        "일일 예측 퀴즈",
        "트레이딩 챌린지",
        "포인트 리워드 시스템",
        "리더보드 랭킹",
        "아이템 상점 (프리미엄 시그널)"
      ]}
    />
  )
}