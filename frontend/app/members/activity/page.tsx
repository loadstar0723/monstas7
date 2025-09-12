'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function MemberActivityPage() {
  return (
    <ExclusiveAccess
      title="회원 활동 분석 대시보드"
      category="회원 관리 > 활동 분석"
      description="모든 회원의 상세한 활동 기록과 접속 이력을 실시간으로 추적하고 분석하는 종합 모니터링 시스템"
      features={[
        '실시간 회원 활동 모니터링',
        '로그인/로그아웃 이력 추적',
        '페이지 방문 패턴 분석',
        '의심스러운 활동 자동 감지',
        '회원별 활동 리포트',
        '데이터 내보내기 (CSV/Excel)',
        '고급 필터링 및 검색',
        '관리자 감사 로그'
      ]}
      requiredTier="Platinum"
      techStack={['React', 'Node.js', 'PostgreSQL', 'Redis']}
      previewType="dashboard"
    />
  )
}
