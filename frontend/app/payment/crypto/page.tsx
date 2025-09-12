'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function CryptoPaymentPage() {
  return (
    <ExclusiveAccess
      title="암호화폐 결제 시스템"
      category="결제 > 암호화폐"
      description="BTC, ETH, USDT 등 20개 이상 암호화폐 지원, 블록체인 기반 즉시 결제 시스템"
      features={[
        'BTC, ETH, USDT, BNB 등 20+ 암호화폐 지원',
        '실시간 시세 반영 자동 환율 계산',
        '멀티체인 지갑 주소 자동 생성',
        '블록체인 네트워크 확인 즉시 활성화',
        '거래 해시 실시간 추적 시스템',
        'DeFi 프로토콜 연동 자동 스왑',
        'Layer 2 네트워크 저수수료 지원',
        'MEV 보호 및 슬리피지 최적화'
      ]}
      requiredTier="Platinum"
      techStack={['Web3.js', 'Ethers.js', 'Binance API', 'Polygon', 'Arbitrum']}
      previewType="crypto"
    />
  )
}