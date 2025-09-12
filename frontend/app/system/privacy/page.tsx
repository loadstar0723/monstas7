'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="개인정보 보호"
      description="개인정보 처리 및 프라이버시 설정"
      requiredTier="Free"
      features={[
        '데이터 처리 동의',
        '쿠키 설정',
        '추적 차단',
        '데이터 삭제 요청',
        '개인정보 열람',
        '동의 철회'
      ]}
    />
  )
}