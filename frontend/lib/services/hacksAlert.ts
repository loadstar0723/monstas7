/**
 * 해킹 알림 서비스
 * 실시간 해킹 사건, 보안 위협, 취약점 정보 제공
 */

import { apiClient } from './rateLimiter'

export interface HackIncident {
  id: string
  platform: string
  coin?: string
  type: 'exploit' | 'rugpull' | 'phishing' | 'breach' | 'vulnerability' | 'scam'
  severity: 'critical' | 'high' | 'medium' | 'low'
  amount: number
  amountUSD: number
  timestamp: Date
  description: string
  affectedUsers: number
  recovered: boolean
  recoveredAmount?: number
  attackVector: string
  status: 'ongoing' | 'resolved' | 'investigating' | 'confirmed'
  source: string
  txHash?: string
  exploitAddress?: string
}

export interface SecurityAlert {
  id: string
  type: 'warning' | 'critical' | 'info'
  category: 'smart_contract' | 'exchange' | 'wallet' | 'protocol' | 'bridge'
  title: string
  description: string
  affectedPlatforms: string[]
  recommendations: string[]
  timestamp: Date
  riskScore: number
  mitigationStatus: 'pending' | 'in_progress' | 'completed'
}

export interface VulnerabilityReport {
  id: string
  platform: string
  vulnerabilityType: string
  cvssScore: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  discovered: Date
  disclosed?: Date
  patched?: boolean
  patchDate?: Date
  description: string
  technicalDetails: string
  affectedVersions: string[]
  fixedVersions?: string[]
  bountyAmount?: number
}

export interface HackStatistics {
  total24h: number
  totalWeek: number
  totalMonth: number
  totalYear: number
  totalLossUSD: number
  recoveredUSD: number
  averageIncidentSize: number
  topAttackVectors: Array<{
    vector: string
    count: number
    totalLoss: number
  }>
  affectedPlatforms: Array<{
    platform: string
    incidents: number
    totalLoss: number
  }>
}

export interface SecurityScore {
  platform: string
  score: number // 0-100
  lastAudit?: Date
  auditor?: string
  hasInsurance: boolean
  insuranceCoverage?: number
  historicalIncidents: number
  riskFactors: string[]
  securityFeatures: string[]
}

export class HacksAlertService {
  private wsConnections: Map<string, WebSocket> = new Map()

  // 최근 해킹 사건 조회
  async getRecentHacks(hours: number = 24): Promise<HackIncident[]> {
    const now = new Date()
    const incidents: HackIncident[] = []

    // 실제 데이터를 위한 API 호출 시뮬레이션
    // 실제로는 Rekt.news API, CertiK API 등을 사용
    const platforms = [
      { name: 'Ethereum Bridge', coin: 'ETH', amount: 2500000 },
      { name: 'BSC DEX', coin: 'BNB', amount: 1800000 },
      { name: 'Solana Protocol', coin: 'SOL', amount: 3200000 },
      { name: 'Polygon Bridge', coin: 'MATIC', amount: 950000 },
      { name: 'Avalanche DeFi', coin: 'AVAX', amount: 1200000 }
    ]

    const types: HackIncident['type'][] = ['exploit', 'rugpull', 'phishing', 'breach', 'vulnerability', 'scam']
    const severities: HackIncident['severity'][] = ['critical', 'high', 'medium', 'low']
    const vectors = ['Smart Contract Exploit', 'Private Key Compromise', 'Flash Loan Attack', 'Reentrancy', 'Oracle Manipulation']

    // 시간 기반 결정적 데이터 생성
    for (let i = 0; i < 5; i++) {
      const platform = platforms[i % platforms.length]
      const hourOffset = (now.getHours() + i) % 24

      incidents.push({
        id: `hack-${i + 1}`,
        platform: platform.name,
        coin: platform.coin,
        type: types[hourOffset % types.length],
        severity: severities[Math.floor(hourOffset / 6) % severities.length],
        amount: platform.amount + (hourOffset * 50000),
        amountUSD: platform.amount + (hourOffset * 50000),
        timestamp: new Date(now.getTime() - (i * 3600000)),
        description: `${platform.name}에서 보안 사건 발생. ${vectors[i % vectors.length]}을 통한 공격으로 확인됨.`,
        affectedUsers: 1000 + (hourOffset * 100),
        recovered: hourOffset % 3 === 0,
        recoveredAmount: hourOffset % 3 === 0 ? platform.amount * 0.3 : undefined,
        attackVector: vectors[i % vectors.length],
        status: i === 0 ? 'ongoing' : i === 1 ? 'investigating' : 'resolved',
        source: 'CertiK Alert',
        txHash: `0x${Math.floor(now.getTime() / 1000).toString(16)}${i}`,
        exploitAddress: `0x${Math.floor(now.getTime() / 2000).toString(16)}${i}`
      })
    }

    return incidents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // 보안 알림 조회
  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    const now = new Date()
    const alerts: SecurityAlert[] = []

    const categories: SecurityAlert['category'][] = ['smart_contract', 'exchange', 'wallet', 'protocol', 'bridge']
    const alertTypes: SecurityAlert['type'][] = ['warning', 'critical', 'info']

    const platforms = [
      ['Uniswap', 'SushiSwap', 'PancakeSwap'],
      ['MetaMask', 'Trust Wallet', 'Phantom'],
      ['Binance', 'Coinbase', 'Kraken'],
      ['Arbitrum', 'Optimism', 'Polygon'],
      ['Wormhole', 'Multichain', 'Synapse']
    ]

    for (let i = 0; i < 8; i++) {
      const hourOffset = (now.getHours() + i) % 24
      const categoryIdx = i % categories.length

      alerts.push({
        id: `alert-${i + 1}`,
        type: alertTypes[Math.floor(hourOffset / 8) % alertTypes.length],
        category: categories[categoryIdx],
        title: `${categories[categoryIdx]} 보안 경고`,
        description: `${categories[categoryIdx]} 관련 잠재적 보안 위협이 감지되었습니다. 사용자는 주의가 필요합니다.`,
        affectedPlatforms: platforms[categoryIdx].slice(0, 2),
        recommendations: [
          '최신 버전으로 업데이트',
          '의심스러운 트랜잭션 확인',
          '2FA 활성화 권장',
          '하드웨어 지갑 사용 고려'
        ].slice(0, 3),
        timestamp: new Date(now.getTime() - (i * 7200000)),
        riskScore: 50 + (hourOffset * 2),
        mitigationStatus: i < 2 ? 'in_progress' : i < 5 ? 'pending' : 'completed'
      })
    }

    return alerts
  }

  // 취약점 보고서 조회
  async getVulnerabilityReports(): Promise<VulnerabilityReport[]> {
    const now = new Date()
    const reports: VulnerabilityReport[] = []

    const platforms = ['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Avalanche', 'Solana']
    const vulnTypes = ['Integer Overflow', 'Reentrancy', 'Access Control', 'Logic Error', 'Oracle Manipulation']

    for (let i = 0; i < 6; i++) {
      const dayOffset = (now.getDate() + i) % 30
      const isPatched = i > 2

      reports.push({
        id: `vuln-${i + 1}`,
        platform: platforms[i % platforms.length],
        vulnerabilityType: vulnTypes[i % vulnTypes.length],
        cvssScore: 5.0 + (dayOffset % 5),
        severity: dayOffset < 7 ? 'critical' : dayOffset < 14 ? 'high' : dayOffset < 21 ? 'medium' : 'low',
        discovered: new Date(now.getTime() - (i * 86400000 * 3)),
        disclosed: new Date(now.getTime() - (i * 86400000 * 2)),
        patched: isPatched,
        patchDate: isPatched ? new Date(now.getTime() - (i * 86400000)) : undefined,
        description: `${platforms[i % platforms.length]}에서 ${vulnTypes[i % vulnTypes.length]} 취약점 발견`,
        technicalDetails: `스마트 컨트랙트 함수에서 ${vulnTypes[i % vulnTypes.length]} 취약점이 발견되었습니다.`,
        affectedVersions: [`v1.${i}.0`, `v1.${i}.1`],
        fixedVersions: isPatched ? [`v1.${i + 1}.0`] : undefined,
        bountyAmount: isPatched ? 50000 + (i * 10000) : undefined
      })
    }

    return reports
  }

  // 해킹 통계 조회
  async getHackStatistics(): Promise<HackStatistics> {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDate()

    return {
      total24h: 3 + (hour % 5),
      totalWeek: 15 + (day % 10),
      totalMonth: 45 + (day % 20),
      totalYear: 523 + (day * 5),
      totalLossUSD: 1250000000 + (day * 10000000),
      recoveredUSD: 320000000 + (day * 1000000),
      averageIncidentSize: 5000000 + (hour * 100000),
      topAttackVectors: [
        { vector: 'Smart Contract Exploit', count: 145 + day, totalLoss: 450000000 },
        { vector: 'Flash Loan Attack', count: 89 + day, totalLoss: 280000000 },
        { vector: 'Private Key Compromise', count: 67 + day, totalLoss: 190000000 },
        { vector: 'Reentrancy', count: 45 + day, totalLoss: 120000000 },
        { vector: 'Oracle Manipulation', count: 38 + day, totalLoss: 95000000 }
      ],
      affectedPlatforms: [
        { platform: 'DeFi Protocols', incidents: 234 + day, totalLoss: 580000000 },
        { platform: 'Bridges', incidents: 45 + day, totalLoss: 320000000 },
        { platform: 'Exchanges', incidents: 28 + day, totalLoss: 210000000 },
        { platform: 'NFT Platforms', incidents: 67 + day, totalLoss: 89000000 },
        { platform: 'Wallets', incidents: 34 + day, totalLoss: 51000000 }
      ]
    }
  }

  // 플랫폼 보안 점수 조회
  async getSecurityScores(platforms: string[]): Promise<SecurityScore[]> {
    const now = new Date()
    const scores: SecurityScore[] = []

    for (const platform of platforms) {
      const seed = platform.charCodeAt(0) + now.getDate()

      scores.push({
        platform,
        score: 60 + (seed % 40),
        lastAudit: new Date(now.getTime() - (seed % 180) * 86400000),
        auditor: ['CertiK', 'PeckShield', 'Trail of Bits', 'ConsenSys Diligence'][seed % 4],
        hasInsurance: seed % 2 === 0,
        insuranceCoverage: seed % 2 === 0 ? 10000000 + (seed * 1000000) : undefined,
        historicalIncidents: seed % 5,
        riskFactors: [
          'Complex smart contracts',
          'High TVL concentration',
          'New protocol',
          'Limited audits'
        ].slice(0, (seed % 3) + 1),
        securityFeatures: [
          'Multi-sig wallet',
          'Timelock',
          'Bug bounty program',
          'Insurance fund',
          'Emergency pause'
        ].slice(0, (seed % 4) + 2)
      })
    }

    return scores
  }

  // 실시간 해킹 알림 스트림
  async streamHackAlerts(
    onUpdate: (alert: HackIncident | SecurityAlert) => void
  ): Promise<() => void> {
    // 실제로는 WebSocket을 통한 실시간 알림
    // 여기서는 시뮬레이션
    const interval = setInterval(async () => {
      const hacks = await this.getRecentHacks(1)
      if (hacks.length > 0) {
        onUpdate(hacks[0])
      }
    }, 30000) // 30초마다 체크

    return () => {
      clearInterval(interval)
    }
  }

  // 모든 연결 종료
  closeAll() {
    this.wsConnections.forEach(ws => ws.close())
    this.wsConnections.clear()
  }
}

// 싱글톤 인스턴스
export const hacksAlertService = new HacksAlertService()