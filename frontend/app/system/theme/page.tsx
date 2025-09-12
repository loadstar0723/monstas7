'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="테마 설정"
      description="사용자 인터페이스 테마 및 레이아웃 커스터마이징"
      requiredTier="Free"
      features={[
        '다크/라이트 모드',
        '색상 테마 선택',
        '레이아웃 조정',
        '차트 스타일',
        '글꼴 크기 조절',
        '사용자 정의 CSS'
      ]}
    />
  )
}