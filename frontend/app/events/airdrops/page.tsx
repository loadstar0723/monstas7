'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function AirdropPage() {
  return (
    <ExclusiveAccess
      title="프리미엄 에어드랍 헌터"
      category="이벤트 > 에어드랍"
      description="고수익 에어드랍을 선별하고 자동으로 참여하는 AI 기반 에어드랍 헌팅 시스템"
      features={[
        "AI 기반 고가치 에어드랍 선별 (수익률 예측)",
        "실시간 에어드랍 알림 및 자동 참여",
        "사기 프로젝트 필터링 및 리스크 분석",
        "에어드랍 참여 조건 자동 확인",
        "토큰 분배 및 클레임 스케줄 관리",
        "과거 에어드랍 성과 분석 데이터베이스",
        "포트폴리오별 최적화된 에어드랍 전략",
        "VIP 전용 프라이빗 에어드랍 정보"
      ]}
      requiredTier="Platinum"
      techStack={['Python', 'AI/ML', 'Web3.js', 'PostgreSQL']}
      previewType="analytics"
    />
  )
}
