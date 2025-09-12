'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function PatternRecognitionPage() {
  return (
    <ExclusiveAccess
      title="딥러닝 차트 패턴 자동 인식"
      description="CNN 기반 딥러닝으로 차트 패턴을 자동 인식하고 매매 신호를 생성하는 시스템"
      requiredTier="Platinum"
      features={[
        "머리어깨형, 삼각형, 깃발형 등 20+ 클래식 패턴 자동 인식",
        "실시간 차트 스캔 및 패턴 매칭 알고리즘",
        "패턴별 성공률 통계 및 리스크 분석",
        "다중 시간대 패턴 분석 (1분~1일)",
        "패턴 완성도 및 신뢰도 점수 제공",
        "자동 매매 신호 생성 및 알림"
      ]}
    />
  )
}