'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="언어 설정"
      description="다국어 지원 및 지역별 설정"
      requiredTier="Free"
      features={[
        '한국어/영어/일본어',
        '시간대 설정',
        '통화 단위 선택',
        '날짜 형식',
        '숫자 표기법',
        '지역별 규정'
      ]}
    />
  )
}