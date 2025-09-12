'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function SEOPage() {
  return (
    <ExclusiveAccess
      title="AI 기반 차세대 SEO 최적화"
      description="머신러닝과 자연어 처리를 활용한 완전 자동화된 SEO 최적화 및 컨텐츠 관리 시스템"
      features={[
        "GPT 기반 SEO 최적화 콘텐츠 자동 생성",
        "실시간 검색엔진 알고리즘 변화 감지 및 대응",
        "경쟁사 키워드 분석 및 기회 발굴",
        "테크니컬 SEO 자동 진단 및 수정",
        "다국어 SEO 콘텐츠 번역 및 현지화",
        "백링크 품질 분석 및 구축 전략",
        "Core Web Vitals 자동 모니터링",
        "구조화된 데이터 자동 삽입 및 관리"
      ]}
      requiredTier="Master"
    />
  )
}