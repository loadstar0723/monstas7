'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function ReferralProgramPage() {
  return (
    <ExclusiveAccess
      title="리퍼럴 & 추천 보상 시스템"
      category="결제 > 리퍼럴"
      description="MLM 방식 다단계 추천 시스템, 블록체인 기반 투명한 보상 정산"
      features={[
        '다단계 추천 트리 및 양방향 리워드',
        '맞춤형 추천 링크 및 QR 코드 생성',
        '실시간 추천 성과 트래킹 대시보드',
        '차등 보상율 및 VIP 티어 시스템',
        '월별 자동 정산 및 즉시 출금',
        '추천 네트워크 분석 및 수익 예측',
        'SNS 바이럴 마케팅 도구 통합',
        '블록체인 기반 투명한 보상 분배'
      ]}
      requiredTier="Master"
      techStack={['Blockchain', 'Smart Contracts', 'Analytics', 'Social API']}
      previewType="network"
    />
  )
}