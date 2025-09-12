'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function CopyTradingPage() {
  return (
    <ExclusiveAccess
      title="프로 트레이더 전략 실시간 복사"
      category="트레이딩 > 자동화"
      description="상위 1% 트레이더의 모든 거래를 실시간으로 복사하는 미러 트레이딩 시스템"
      features={[
        "검증된 프로 트레이더 100+ 명 실시간 추적",
        "거래 지연 시간 0.01초 이내 초고속 복사",
        "리스크 레벨별 자동 포지션 조정",
        "수익률 기반 트레이더 자동 교체",
        "멀티 트레이더 포트폴리오 분산 복사",
        "손실 한도 자동 차단 시스템",
        "트레이더별 상세 성과 분석 대시보드",
        "API를 통한 20+ 거래소 동시 실행"
      ]}
      requiredTier="Signature"
      techStack={["WebSocket", "Redis Queue", "Machine Learning", "Risk Engine"]}
      previewType="dashboard"
    />
  )
}
