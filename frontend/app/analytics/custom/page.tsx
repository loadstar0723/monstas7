'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function AnalyticsCustomPage() {
  return (
    <ExclusiveAccess
      title="커스텀 분석 빌더"
      category="분석 > 커스텀"
      description="드래그 앤 드롭 방식으로 나만의 분석 대시보드와 리포트를 제작"
      features={[
        '비주얼 대시보드 빌더',
        '사용자 정의 지표',
        '드래그 앤 드롭 UI',
        '50+ 차트 컴포넌트',
        '템플릿 저장 및 공유',
        '다크 모드 지원'
      ]}
      requiredTier="Master"
      techStack={['React', 'D3.js', 'Recharts', 'DnD Kit']}
      previewType="dashboard"
    />
  )
}