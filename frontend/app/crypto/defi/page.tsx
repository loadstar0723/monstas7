'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="DeFi 생태계 분석"
      description="탈중앙화 금융 프로토콜 분석과 수익 기회 발굴"
      requiredTier="Master"
      features={[
        'TVL 변화 추적',
        '이자율 비교 분석',
        '임펄머넌트 로스 계산',
        '거버넌스 토큰 분석',
        '프로토콜 수익성 평가',
        '리스크 등급 산정'
      ]}
    />
  )
}