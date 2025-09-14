/**
 * 규제 뉴스 서비스
 * 각국 암호화폐 규제 정책, 법률 변경, 정부 발표 등 추적
 */

import { apiClient } from './rateLimiter'

export interface Regulation {
  id: string
  country: string
  region: 'americas' | 'europe' | 'asia' | 'oceania' | 'africa' | 'global'
  type: 'law' | 'policy' | 'guidance' | 'enforcement' | 'taxation' | 'licensing' | 'ban' | 'framework'
  status: 'proposed' | 'draft' | 'enacted' | 'effective' | 'suspended' | 'repealed'
  title: string
  titleKr: string
  summary: string
  summaryKr: string
  impact: {
    level: 'critical' | 'high' | 'medium' | 'low'
    score: number // 0-100
    affectedAreas: string[]
    marketImpact: 'positive' | 'negative' | 'neutral' | 'mixed'
  }
  timeline: {
    announced: Date
    effective?: Date
    deadline?: Date
    reviewDate?: Date
  }
  entities: {
    regulators: string[]
    affectedExchanges?: string[]
    affectedCoins?: string[]
    stakeholders: string[]
  }
  details: {
    requirements?: string[]
    restrictions?: string[]
    penalties?: string[]
    benefits?: string[]
  }
  sources: {
    official?: string
    news?: string[]
    documents?: string[]
  }
  marketReaction?: {
    priceChange: number
    volumeChange: number
    sentiment: number
  }
}

export interface PolicyUpdate {
  id: string
  policyId: string
  date: Date
  type: 'amendment' | 'clarification' | 'extension' | 'suspension'
  changes: string[]
  reason: string
  impact: 'major' | 'minor' | 'clarification'
}

export interface ComplianceRequirement {
  id: string
  jurisdiction: string
  category: 'kyc' | 'aml' | 'reporting' | 'custody' | 'trading' | 'tax'
  requirement: string
  deadline?: Date
  penalties: string[]
  status: 'mandatory' | 'recommended' | 'optional'
  applicableTo: string[]
}

export interface RegulatoryTrend {
  region: string
  trend: 'tightening' | 'loosening' | 'stable' | 'developing'
  momentum: number // -100 to +100
  keyDrivers: string[]
  outlook: string
  confidence: number
}

export interface GlobalRegulatoryIndex {
  score: number // 0-100 (0=very restrictive, 100=very friendly)
  trend: 'improving' | 'declining' | 'stable'
  topFriendly: { country: string; score: number }[]
  topRestrictive: { country: string; score: number }[]
  recentChanges: { country: string; change: number; reason: string }[]
}

export class RegulatoryNewsService {
  private wsConnections: Map<string, WebSocket> = new Map()

  // 최신 규제 뉴스 가져오기
  async getLatestRegulations(filter?: {
    countries?: string[]
    types?: string[]
    impactLevels?: string[]
  }): Promise<Regulation[]> {
    // 시간 기반 더미 데이터 생성
    const now = new Date()
    const seed = now.getHours() * 100 + now.getMinutes()

    const countries = ['미국', '중국', '일본', '한국', '유럽연합', '영국', '싱가포르', '인도', '브라질', '캐나다']
    const types: Regulation['type'][] = ['law', 'policy', 'guidance', 'enforcement', 'taxation', 'licensing']
    const statuses: Regulation['status'][] = ['proposed', 'draft', 'enacted', 'effective']

    const regulations: Regulation[] = []

    for (let i = 0; i < 20; i++) {
      const countryIndex = (seed + i * 7) % countries.length
      const typeIndex = (seed + i * 5) % types.length
      const statusIndex = (seed + i * 3) % statuses.length
      const impactLevel = (seed + i * 11) % 4

      const country = countries[countryIndex]
      const type = types[typeIndex]
      const status = statuses[statusIndex]

      regulations.push({
        id: `reg-${i + 1}`,
        country,
        region: this.getRegion(country),
        type,
        status,
        title: this.generateTitle(type, country),
        titleKr: this.generateTitleKr(type, country),
        summary: this.generateSummary(type, status),
        summaryKr: this.generateSummaryKr(type, status),
        impact: {
          level: ['low', 'medium', 'high', 'critical'][impactLevel] as any,
          score: 25 + (impactLevel * 25),
          affectedAreas: this.getAffectedAreas(type),
          marketImpact: ['positive', 'negative', 'neutral', 'mixed'][(seed + i) % 4] as any
        },
        timeline: {
          announced: new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)),
          effective: status === 'effective' ? new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)) : undefined,
          deadline: type === 'licensing' ? new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)) : undefined
        },
        entities: {
          regulators: this.getRegulators(country),
          affectedExchanges: ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit'].slice(0, 3 + (i % 3)),
          affectedCoins: ['BTC', 'ETH', 'USDT', 'XRP', 'SOL'].slice(0, 2 + (i % 4)),
          stakeholders: ['거래소', '투자자', '마이너', 'DeFi 프로토콜'].slice(0, 2 + (i % 3))
        },
        details: {
          requirements: type === 'licensing' ? ['라이선스 신청', 'KYC/AML 준수', '자본금 요구사항'] : undefined,
          restrictions: type === 'ban' ? ['거래 금지', '광고 제한', '결제 사용 금지'] : undefined,
          penalties: ['벌금', '영업정지', '형사처벌'].slice(0, 1 + (i % 3)),
          benefits: status === 'effective' && ['positive', 'mixed'].includes(this.getMarketImpact(i, seed)) ?
            ['법적 명확성', '투자자 보호', '시장 성장'] : undefined
        },
        sources: {
          official: `https://gov.${country.toLowerCase()}/crypto-regulation-${i}`,
          news: [`https://news.crypto.com/regulation-${i}`],
          documents: [`regulation-${i}.pdf`]
        },
        marketReaction: {
          priceChange: -10 + ((seed + i * 13) % 20),
          volumeChange: -20 + ((seed + i * 17) % 40),
          sentiment: -50 + ((seed + i * 19) % 100)
        }
      })
    }

    // 필터 적용
    let filtered = regulations
    if (filter?.countries?.length) {
      filtered = filtered.filter(r => filter.countries!.includes(r.country))
    }
    if (filter?.types?.length) {
      filtered = filtered.filter(r => filter.types!.includes(r.type))
    }
    if (filter?.impactLevels?.length) {
      filtered = filtered.filter(r => filter.impactLevels!.includes(r.impact.level))
    }

    return filtered
  }

  // 정책 업데이트 가져오기
  async getPolicyUpdates(days: number = 7): Promise<PolicyUpdate[]> {
    const now = new Date()
    const seed = now.getHours() * 100 + now.getMinutes()

    const updates: PolicyUpdate[] = []
    const updateTypes: PolicyUpdate['type'][] = ['amendment', 'clarification', 'extension', 'suspension']

    for (let i = 0; i < 10; i++) {
      updates.push({
        id: `update-${i + 1}`,
        policyId: `reg-${(i % 5) + 1}`,
        date: new Date(now.getTime() - (i * 12 * 60 * 60 * 1000)),
        type: updateTypes[(seed + i) % 4],
        changes: [
          '요구사항 변경',
          '시행일 연장',
          '적용 범위 확대',
          '예외 조항 추가'
        ].slice(0, 2 + (i % 3)),
        reason: ['시장 피드백', '기술적 검토', '국제 협조', '업계 요청'][(seed + i) % 4],
        impact: ['major', 'minor', 'clarification'][(seed + i) % 3] as any
      })
    }

    return updates.filter(u => {
      const daysDiff = (now.getTime() - u.date.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= days
    })
  }

  // 컴플라이언스 요구사항
  async getComplianceRequirements(jurisdiction?: string): Promise<ComplianceRequirement[]> {
    const now = new Date()
    const seed = now.getHours() * 100 + now.getMinutes()

    const requirements: ComplianceRequirement[] = []
    const categories: ComplianceRequirement['category'][] = ['kyc', 'aml', 'reporting', 'custody', 'trading', 'tax']
    const jurisdictions = ['미국', '유럽연합', '일본', '한국', '싱가포르']

    for (let i = 0; i < 15; i++) {
      const jIndex = (seed + i * 3) % jurisdictions.length
      const cIndex = (seed + i * 5) % categories.length

      requirements.push({
        id: `req-${i + 1}`,
        jurisdiction: jurisdictions[jIndex],
        category: categories[cIndex],
        requirement: this.getRequirementText(categories[cIndex]),
        deadline: i % 3 === 0 ? new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000)) : undefined,
        penalties: ['벌금 최대 $1M', '라이선스 취소', '영업 정지'].slice(0, 1 + (i % 3)),
        status: ['mandatory', 'recommended', 'optional'][(seed + i) % 3] as any,
        applicableTo: ['거래소', '브로커', '커스터디', 'DeFi'].slice(0, 2 + (i % 3))
      })
    }

    if (jurisdiction) {
      return requirements.filter(r => r.jurisdiction === jurisdiction)
    }

    return requirements
  }

  // 규제 트렌드 분석
  async getRegulatoryTrends(): Promise<RegulatoryTrend[]> {
    const now = new Date()
    const seed = now.getHours() * 100 + now.getMinutes()

    const regions = [
      { name: '북미', base: 60 },
      { name: '유럽', base: 70 },
      { name: '아시아', base: 40 },
      { name: '중동', base: 30 },
      { name: '남미', base: 50 }
    ]

    return regions.map((region, i) => {
      const momentum = region.base + ((seed + i * 7) % 40) - 20

      return {
        region: region.name,
        trend: momentum > 60 ? 'loosening' : momentum < 40 ? 'tightening' : 'stable' as any,
        momentum: momentum - 50, // -50 to +50 scale
        keyDrivers: this.getKeyDrivers(region.name),
        outlook: this.getOutlook(momentum),
        confidence: 60 + ((seed + i * 11) % 30)
      }
    })
  }

  // 글로벌 규제 지수
  async getGlobalRegulatoryIndex(): Promise<GlobalRegulatoryIndex> {
    const now = new Date()
    const seed = now.getHours() * 100 + now.getMinutes()

    const score = 45 + ((seed % 30) - 15)

    return {
      score,
      trend: score > 50 ? 'improving' : score < 45 ? 'declining' : 'stable',
      topFriendly: [
        { country: '스위스', score: 85 + (seed % 10) },
        { country: '싱가포르', score: 82 + (seed % 8) },
        { country: '두바이', score: 78 + (seed % 12) },
        { country: '일본', score: 75 + (seed % 10) },
        { country: '한국', score: 72 + (seed % 8) }
      ],
      topRestrictive: [
        { country: '중국', score: 15 + (seed % 10) },
        { country: '알제리', score: 18 + (seed % 8) },
        { country: '방글라데시', score: 22 + (seed % 10) },
        { country: '볼리비아', score: 25 + (seed % 8) },
        { country: '이집트', score: 28 + (seed % 10) }
      ],
      recentChanges: [
        { country: '미국', change: 5, reason: 'ETF 승인' },
        { country: '유럽', change: -3, reason: 'MiCA 규제 강화' },
        { country: '인도', change: 8, reason: '암호화폐 합법화 논의' },
        { country: '브라질', change: 6, reason: '암호화폐 법안 통과' }
      ]
    }
  }

  // 실시간 규제 업데이트 스트림
  async streamRegulatoryUpdates(
    onUpdate: (update: any) => void
  ): Promise<() => void> {
    // 5초마다 업데이트 시뮬레이션
    const interval = setInterval(async () => {
      const regulations = await this.getLatestRegulations()
      const trends = await this.getRegulatoryTrends()
      const index = await this.getGlobalRegulatoryIndex()

      onUpdate({
        type: 'regulatory_update',
        timestamp: new Date(),
        regulations: regulations.slice(0, 5),
        trends,
        globalIndex: index
      })
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }

  // Helper 함수들
  private getRegion(country: string): Regulation['region'] {
    const regionMap: Record<string, Regulation['region']> = {
      '미국': 'americas',
      '캐나다': 'americas',
      '브라질': 'americas',
      '중국': 'asia',
      '일본': 'asia',
      '한국': 'asia',
      '싱가포르': 'asia',
      '인도': 'asia',
      '유럽연합': 'europe',
      '영국': 'europe',
      '호주': 'oceania'
    }
    return regionMap[country] || 'global'
  }

  private generateTitle(type: string, country: string): string {
    const titles: Record<string, string> = {
      'law': `${country} Comprehensive Crypto Asset Law`,
      'policy': `${country} Digital Asset Policy Framework`,
      'guidance': `${country} Regulatory Guidance for Virtual Assets`,
      'enforcement': `${country} Enforcement Action on Unregistered Exchanges`,
      'taxation': `${country} Cryptocurrency Tax Regulations`,
      'licensing': `${country} VASP Licensing Requirements`,
      'ban': `${country} Restrictions on Crypto Trading`,
      'framework': `${country} DeFi Regulatory Framework`
    }
    return titles[type] || `${country} Crypto Regulation Update`
  }

  private generateTitleKr(type: string, country: string): string {
    const titles: Record<string, string> = {
      'law': `${country} 암호자산 종합 법안`,
      'policy': `${country} 디지털 자산 정책 프레임워크`,
      'guidance': `${country} 가상자산 규제 가이드라인`,
      'enforcement': `${country} 미등록 거래소 단속`,
      'taxation': `${country} 암호화폐 세금 규정`,
      'licensing': `${country} VASP 라이선스 요구사항`,
      'ban': `${country} 암호화폐 거래 제한`,
      'framework': `${country} DeFi 규제 프레임워크`
    }
    return titles[type] || `${country} 암호화폐 규제 업데이트`
  }

  private generateSummary(type: string, status: string): string {
    const summaries: Record<string, string> = {
      'law': `Comprehensive legislation establishing legal framework for crypto assets, including definitions, licensing requirements, and consumer protections.`,
      'policy': `New policy guidelines outlining regulatory approach to digital assets, focusing on innovation while ensuring market integrity.`,
      'guidance': `Regulatory guidance clarifying application of existing laws to virtual asset service providers and DeFi protocols.`,
      'enforcement': `Enforcement action taken against unregistered exchanges operating without proper authorization.`,
      'taxation': `Tax regulations specifying treatment of cryptocurrency transactions, mining income, and staking rewards.`,
      'licensing': `Licensing requirements for virtual asset service providers including capital requirements and operational standards.`
    }
    return summaries[type] || 'Regulatory update affecting cryptocurrency market participants.'
  }

  private generateSummaryKr(type: string, status: string): string {
    const summaries: Record<string, string> = {
      'law': `암호자산에 대한 법적 프레임워크를 수립하는 종합 법안으로, 정의, 라이선스 요구사항, 소비자 보호 조항 포함.`,
      'policy': `혁신을 장려하면서 시장 무결성을 보장하는 디지털 자산 규제 접근 방식을 설명하는 새로운 정책 가이드라인.`,
      'guidance': `가상자산 서비스 제공업체 및 DeFi 프로토콜에 대한 기존 법률 적용을 명확히 하는 규제 지침.`,
      'enforcement': `적절한 승인 없이 운영되는 미등록 거래소에 대한 단속 조치.`,
      'taxation': `암호화폐 거래, 채굴 수익, 스테이킹 보상의 세금 처리를 명시하는 세금 규정.`,
      'licensing': `자본 요구사항 및 운영 표준을 포함한 가상자산 서비스 제공업체의 라이선스 요구사항.`
    }
    return summaries[type] || '암호화폐 시장 참여자에게 영향을 미치는 규제 업데이트.'
  }

  private getAffectedAreas(type: string): string[] {
    const areas: Record<string, string[]> = {
      'law': ['거래소 운영', '커스터디', '결제', 'DeFi'],
      'policy': ['시장 접근', '혁신', '투자자 보호'],
      'guidance': ['컴플라이언스', '리포팅', 'KYC/AML'],
      'enforcement': ['라이선스', '운영', '마케팅'],
      'taxation': ['거래 과세', '소득세', '양도세'],
      'licensing': ['자본 요구사항', '운영 기준', '보안']
    }
    return areas[type] || ['일반 규제']
  }

  private getRegulators(country: string): string[] {
    const regulators: Record<string, string[]> = {
      '미국': ['SEC', 'CFTC', 'FinCEN', 'Treasury'],
      '일본': ['FSA', 'JVCEA'],
      '한국': ['FSC', 'FSS', '한국은행'],
      '유럽연합': ['ECB', 'ESMA', 'EBA'],
      '영국': ['FCA', 'Bank of England', 'HM Treasury'],
      '싱가포르': ['MAS'],
      '중국': ['PBOC', 'NDRC'],
      '인도': ['RBI', 'SEBI'],
      '브라질': ['CVM', 'Central Bank'],
      '캐나다': ['CSA', 'FINTRAC']
    }
    return regulators[country] || ['Financial Regulator']
  }

  private getMarketImpact(index: number, seed: number): string {
    return ['positive', 'negative', 'neutral', 'mixed'][(seed + index) % 4]
  }

  private getRequirementText(category: string): string {
    const requirements: Record<string, string> = {
      'kyc': '모든 고객에 대한 신원 확인 및 실명 인증 필수',
      'aml': '자금세탁 방지 프로그램 구축 및 의심거래 보고',
      'reporting': '분기별 거래 보고서 제출 및 감사 보고서 제공',
      'custody': '고객 자산 분리 보관 및 콜드 월렛 최소 95% 유지',
      'trading': '시장 조작 방지 및 공정 거래 정책 수립',
      'tax': '모든 거래에 대한 세금 보고 및 원천징수'
    }
    return requirements[category] || '규제 요구사항 준수'
  }

  private getKeyDrivers(region: string): string[] {
    const drivers: Record<string, string[]> = {
      '북미': ['SEC 정책 변화', 'ETF 승인', '스테이블코인 규제'],
      '유럽': ['MiCA 시행', 'ESG 규제', 'CBDC 개발'],
      '아시아': ['중국 정책', '일본 규제 완화', '한국 특금법'],
      '중동': ['이슬람 금융', '석유 자본 유입', '핀테크 허브'],
      '남미': ['인플레이션 대응', '달러화', '금융 포용성']
    }
    return drivers[region] || ['규제 변화', '시장 성장']
  }

  private getOutlook(momentum: number): string {
    if (momentum > 70) return '매우 우호적 - 암호화폐 채택 가속화 예상'
    if (momentum > 50) return '우호적 - 점진적 규제 완화 진행'
    if (momentum > 30) return '중립적 - 균형잡힌 규제 접근'
    if (momentum > 10) return '제한적 - 규제 강화 움직임'
    return '매우 제한적 - 엄격한 규제 예상'
  }

  // 연결 종료
  closeAll() {
    this.wsConnections.forEach(ws => ws.close())
    this.wsConnections.clear()
  }
}

// 싱글톤 인스턴스
export const regulatoryNewsService = new RegulatoryNewsService()