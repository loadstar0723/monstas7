'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="기술적 분석"
      description="차트 패턴과 기술적 지표를 활용한 분석 기법"
      requiredTier="Professional"
      features={[
        '차트 패턴 인식',
        '이동평균선 활용',
        'RSI, MACD 해석',
        '볼린저 밴드 전략',
        '피보나치 리트레이스먼트',
        '지지저항선 분석'
      ]}
    />
  )
}