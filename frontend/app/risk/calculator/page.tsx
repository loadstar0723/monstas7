'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="리스크 계산기"
      description="포지션 사이징과 리스크 관리를 위한 전문 계산 도구"
      requiredTier="Platinum"
      features={[
        '포지션 사이즈 자동 계산',
        '리스크/리워드 비율 분석',
        '다양한 리스크 모델 지원',
        '실시간 리스크 모니터링',
        '커스텀 리스크 파라미터',
        '백테스팅 결과 연동'
      ]}
    />
  )
}
}
