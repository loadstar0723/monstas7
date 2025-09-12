'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function MarketplacePage() {
  return (
    <ExclusiveAccess
      title="검증된 봇 마켓플레이스"
      category="트레이딩 > 자동화"
      description="전문가가 개발하고 실전 검증을 완료한 고성능 트레이딩 봇들을 구매, 임대하여 즉시 사용할 수 있는 프리미엄 마켓플레이스"
      features={[
        "100+ 검증된 프로 개발자의 고성능 트레이딩 봇",
        "실전 6개월 이상 검증된 봇만 입점 허가",
        "봇별 상세 백테스팅 결과 및 실거래 성과 공개",
        "구매 전 7일 무료 체험 및 성과 보장제",
        "봇 성과에 따른 자동 환불 시스템",
        "24/7 봇 개발자 직접 기술 지원",
        "원클릭 봇 배포 및 실시간 성과 모니터링",
        "커뮤니티 평점 및 리뷰 기반 추천 시스템"
      ]}
      requiredTier="Master"
      techStack={["Bot Verification", "Performance Analytics", "Payment Gateway", "Community System"]}
      previewType="dashboard"
    />
  )
}
