'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="고급 설정"
      description="전문가를 위한 상세 시스템 설정"
      requiredTier="Master"
      features={[
        '고급 차트 설정',
        '사용자 정의 지표',
        '알고리즘 설정',
        '백테스팅 환경',
        '데이터 내보내기',
        '개발자 도구'
      ]}
    />
  )
}