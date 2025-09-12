'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function BuilderPage() {
  return (
    <ExclusiveAccess
      title="노코드 비주얼 전략 빌더"
      category="트레이딩 > 자동화"
      description="코딩 없이 드래그앤드롭으로 복잡한 트레이딩 전략을 설계하고 실시간 백테스팅하여 즉시 라이브 트레이딩에 배포하는 비주얼 전략 빌더"
      features={[
        "드래그앤드롭 비주얼 인터페이스로 전략 설계",
        "200+ 기술적 지표 및 커스텀 인디케이터 지원",
        "복잡한 조건부 로직을 시각적으로 구성",
        "실시간 백테스팅 및 성과 시뮬레이션",
        "전략 템플릿 라이브러리 (50+ 검증된 전략)",
        "멀티 타임프레임 및 멀티 심볼 전략 생성",
        "리스크 관리 규칙 시각적 설정",
        "원클릭 라이브 배포 및 실시간 모니터링"
      ]}
      requiredTier="Master"
      techStack={["Visual Builder", "Strategy Engine", "Backtesting", "Live Deployment"]}
      previewType="dashboard"
    />
  )
}