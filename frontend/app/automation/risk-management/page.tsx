'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function RiskManagementPage() {
  return (
    <ExclusiveAccess
      title="자동 손절/익절 관리"
      category="트레이딩 > 자동화"
      description="AI 기반 동적 손절/익절 시스템으로 시장 변동성에 따라 자동 조정되는 지능형 리스크 관리 시스템"
      features={[
        "시장 변동성에 따른 동적 손절 설정 자동 조정",
        "단계별 익절 시스템으로 최대 수익 그립 보장",
        "포지션 크기에 따른 자동 리스크 비율 계산",
        "드로다운 예방 및 MDD 제한 단계적 진입 제어",
        "실시간 VaR(Value at Risk) 모니터링 및 경고",
        "스마트 포지션 사이징 및 자동 리밸런싱",
        "뉴스•이벤트 반영 빠른 리스크 대응",
        "리스크 현황 실시간 리포트 및 알림 시스템"
      ]}
      requiredTier="Signature"
      techStack={["Risk Analytics", "Position Sizing", "Dynamic Stop-Loss", "Alert System"]}
      previewType="dashboard"
    />
  )
}
