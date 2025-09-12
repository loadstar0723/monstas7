'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function CloudPage() {
  return (
    <ExclusiveAccess
      title="24/7 클라우드 봇 호스팅"
      category="트레이딩 > 자동화"
      description="AWS/Google Cloud 기반 고가용성 클라우드 환경에서 트레이딩 봇을 24/7 무중단으로 호스팅하는 프리미엄 서비스"
      features={[
        "99.99% 가동률 보장하는 고가용성 클라우드 인프라",
        "전세계 4개 리전 분산 배포로 최저 지연시간 보장",
        "실시간 봇 성능 모니터링 및 자동 스케일링",
        "시스템 장애 시 자동 복구 및 백업 복원",
        "SSL 보안 및 API 키 암호화 저장",
        "클라우드 리소스 사용량 실시간 최적화",
        "봇 배포/중단/업데이트 원터치 관리",
        "24시간 기술 지원 및 모니터링 서비스"
      ]}
      requiredTier="Infinity"
      techStack={["AWS EC2", "Docker", "Kubernetes", "Redis Cluster", "CloudWatch", "Load Balancer"]}
      previewType="dashboard"
    />
  )
}
