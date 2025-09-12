import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function TelegramMultiLanguagePage() {
  return (
    <ExclusiveAccess
      title="다국어 지원"
      description="글로벌 사용자를 위한 다국어 텔레그램 봇 서비스를 제공합니다"
      requiredTier="Professional"
      features={[
        "한국어, 영어, 중국어, 일본어 지원",
        "자동 언어 감지",
        "실시간 번역 기능",
        "지역별 맞춤 시그널",
        "현지 시간대 알림",
        "다국어 고객 지원"
      ]}
    />
  )
}