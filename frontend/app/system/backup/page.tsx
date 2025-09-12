'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="백업 및 복원"
      description="설정과 데이터의 백업 및 복원 시스템"
      requiredTier="Professional"
      features={[
        '자동 백업 설정',
        '수동 백업 생성',
        '클라우드 동기화',
        '데이터 복원',
        '설정 내보내기',
        '이전 버전 복구'
      ]}
    />
  )
}