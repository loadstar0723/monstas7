'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function MemberBanPage() {
  return (
    <ExclusiveAccess
      title="AI 기반 회원 제재 관리 시스템"
      category="회원 관리 > 제재 관리"
      description="위반 회원에 대한 경고, 정지, 차단 등의 제재 조치를 AI로 자동화하여 효율적으로 관리하는 종합 시스템"
      features={[
        'AI 기반 자동 제재 규칙 엔진',
        '단계별 제재 (경고 → 정지 → 차단)',
        '반복 위반자 자동 감지',
        '제재 이력 및 이의제기 처리',
        'IP/기기/계정 다단계 차단',
        '대량 제재 예약 처리',
        '제재 해지 심사 프로세스',
        '보안 감사 로그 관리'
      ]}
      requiredTier="Master"
      techStack={['Python', 'FastAPI', 'AI/ML', 'PostgreSQL', 'Redis']}
      previewType="admin-panel"
    />
  )
}
