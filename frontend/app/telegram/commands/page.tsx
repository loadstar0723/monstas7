import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function TelegramCommandsPage() {
  return (
    <ExclusiveAccess
      title="텔레그램 명령어 설정"
      description="봇 명령어를 커스터마이징하고 자동화된 트레이딩 명령어를 설정하세요"
      requiredTier="Starter"
      features={[
        "기본 트레이딩 명령어 (/price, /volume)",
        "시장 상황 조회 (/market, /fear)",
        "포트폴리오 관리 (/balance, /pnl)",
        "알림 설정 (/alert, /notify)",
        "도움말 및 가이드 (/help, /guide)",
        "커스텀 명령어 생성"
      ]}
    />
  )
}