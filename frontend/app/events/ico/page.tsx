'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function ICOSchedulePage() {
  return (
    <ExclusiveAccess
      title="ICO 스케줄"
      description="초기 코인 공개(ICO) 및 토큰 세일 일정을 실시간으로 추적하고 분석합니다."
      requiredTier="Platinum"
      features={[
        "글로벌 ICO 및 토큰 세일 캘린더",
        "프로젝트 실사 및 리스크 평가",
        "토큰 이코노믹스 심층 분석",
        "팀 배경 조사 및 신뢰도 검증",
        "화이트페이퍼 AI 분석 및 요약",
        "투자 조건 및 베스팅 일정 추적",
        "유사 프로젝트 비교 및 시장 포지션",
        "상장 예정 거래소 및 유동성 분석"
      ]}
    />
  )
}