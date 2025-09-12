import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function TelegramGroupsPage() {
  return (
    <ExclusiveAccess
      title="텔레그램 그룹 관리"
      description="프리미엄 전용 그룹과 커뮤니티를 관리하고 멤버십을 운영하세요"
      requiredTier="Platinum"
      features={[
        "VIP 전용 시그널 그룹",
        "등급별 차등 접근 권한",
        "실시간 채팅 모니터링",
        "자동 멤버 관리",
        "스팸 필터링 시스템",
        "그룹별 분석 리포트"
      ]}
    />
  )
}