/**
 * 파트너십 및 협업 뉴스 서비스
 * 기업 제휴, 블록체인 협력, 투자 유치 소식
 */

export interface Partnership {
  id: string
  type: 'partnership' | 'investment' | 'acquisition' | 'collaboration' | 'integration' | 'listing'
  title: string
  companies: {
    name: string
    logo: string
    role: 'partner' | 'investor' | 'acquirer' | 'collaborator'
    industry: string
  }[]
  coins: string[]
  description: string
  impact: {
    level: 'high' | 'medium' | 'low'
    score: number // 0-100
    areas: string[]
  }
  dealValue?: {
    amount: number
    currency: string
    type: 'investment' | 'valuation' | 'acquisition'
  }
  announcedAt: Date
  effectiveDate?: Date
  source: string
  verified: boolean
  tags: string[]
  relatedNews?: string[]
}

export interface InvestmentRound {
  id: string
  project: string
  round: 'seed' | 'series-a' | 'series-b' | 'series-c' | 'private' | 'public'
  amount: number
  valuation?: number
  leadInvestor: string
  investors: string[]
  date: Date
  purpose: string
  milestones: string[]
}

export interface M_AActivity {
  id: string
  type: 'merger' | 'acquisition' | 'joint-venture' | 'strategic-investment'
  acquirer: string
  target: string
  value: number
  status: 'announced' | 'pending' | 'completed' | 'cancelled'
  regulatoryApproval: boolean
  expectedClose?: Date
  rationale: string
  synergies: string[]
}

export interface StrategicAlliance {
  id: string
  partners: string[]
  type: 'technology' | 'market' | 'distribution' | 'research'
  scope: string
  duration?: string
  objectives: string[]
  expectedOutcomes: string[]
  status: 'active' | 'planned' | 'completed'
}

export interface PartnershipMetrics {
  totalPartnerships: number
  byType: Record<string, number>
  topPartners: Array<{ name: string; count: number; impact: number }>
  totalInvestment: number
  averageDealSize: number
  successRate: number
}

export class PartnershipService {
  private companies = [
    { name: 'Microsoft', industry: 'Technology', logo: '🏢' },
    { name: 'Google', industry: 'Technology', logo: '🔍' },
    { name: 'PayPal', industry: 'Payments', logo: '💳' },
    { name: 'Visa', industry: 'Payments', logo: '💳' },
    { name: 'Mastercard', industry: 'Payments', logo: '💳' },
    { name: 'Tesla', industry: 'Automotive', logo: '🚗' },
    { name: 'Samsung', industry: 'Electronics', logo: '📱' },
    { name: 'JPMorgan', industry: 'Banking', logo: '🏦' },
    { name: 'Goldman Sachs', industry: 'Banking', logo: '🏦' },
    { name: 'Amazon', industry: 'E-commerce', logo: '📦' }
  ]

  private projects = ['Ethereum', 'Polygon', 'Chainlink', 'Solana', 'Avalanche', 'Polkadot', 'Cardano', 'Near', 'Cosmos', 'Arbitrum']

  // 최신 파트너십 가져오기
  async getLatestPartnerships(filter?: {
    type?: string
    coin?: string
    company?: string
    minImpact?: number
  }): Promise<Partnership[]> {
    const partnerships: Partnership[] = []
    const types = ['partnership', 'investment', 'acquisition', 'collaboration', 'integration', 'listing'] as const
    const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC']

    const now = Date.now()
    const hour = new Date().getHours()

    for (let i = 0; i < 20; i++) {
      const typeIndex = (hour + i) % types.length
      const coinIndex = (hour + i) % coins.length
      const companyIndex1 = (hour + i) % this.companies.length
      const companyIndex2 = (hour + i + 3) % this.companies.length

      const partnership: Partnership = {
        id: `partnership-${i + 1}`,
        type: types[typeIndex],
        title: this.generateTitle(types[typeIndex], this.companies[companyIndex1].name, coins[coinIndex]),
        companies: [
          {
            name: this.companies[companyIndex1].name,
            logo: this.companies[companyIndex1].logo,
            role: types[typeIndex] === 'investment' ? 'investor' : 'partner',
            industry: this.companies[companyIndex1].industry
          },
          {
            name: this.projects[(hour + i) % this.projects.length],
            logo: '🔗',
            role: 'partner',
            industry: 'Blockchain'
          }
        ],
        coins: [coins[coinIndex], coins[(coinIndex + 1) % coins.length]],
        description: this.generateDescription(types[typeIndex], this.companies[companyIndex1].name, coins[coinIndex]),
        impact: {
          level: i < 5 ? 'high' : i < 12 ? 'medium' : 'low',
          score: 70 + ((hour + i) % 30),
          areas: this.generateImpactAreas(types[typeIndex])
        },
        dealValue: types[typeIndex] === 'investment' || types[typeIndex] === 'acquisition' ? {
          amount: (100 + i * 50) * 1000000,
          currency: 'USD',
          type: types[typeIndex] === 'investment' ? 'investment' : 'acquisition'
        } : undefined,
        announcedAt: new Date(now - (i * 3600000)),
        effectiveDate: new Date(now + (7 * 24 * 3600000)),
        source: ['CoinDesk', 'Cointelegraph', 'The Block', 'Decrypt'][i % 4],
        verified: i < 10,
        tags: this.generateTags(types[typeIndex]),
        relatedNews: i < 3 ? [`news-${i + 10}`, `news-${i + 20}`] : undefined
      }

      // 필터 적용
      if (filter) {
        if (filter.type && partnership.type !== filter.type) continue
        if (filter.coin && !partnership.coins.includes(filter.coin)) continue
        if (filter.company && !partnership.companies.some(c => c.name === filter.company)) continue
        if (filter.minImpact && partnership.impact.score < filter.minImpact) continue
      }

      partnerships.push(partnership)
    }

    return partnerships.slice(0, 10)
  }

  // 투자 라운드 정보
  async getInvestmentRounds(): Promise<InvestmentRound[]> {
    const rounds: InvestmentRound[] = []
    const roundTypes = ['seed', 'series-a', 'series-b', 'series-c', 'private'] as const
    const hour = new Date().getHours()

    for (let i = 0; i < 8; i++) {
      const roundIndex = (hour + i) % roundTypes.length
      const projectIndex = (hour + i) % this.projects.length

      rounds.push({
        id: `round-${i + 1}`,
        project: this.projects[projectIndex],
        round: roundTypes[roundIndex],
        amount: (10 + i * 15) * 1000000,
        valuation: (100 + i * 50) * 1000000,
        leadInvestor: this.companies[(hour + i) % this.companies.length].name,
        investors: [
          this.companies[(hour + i + 1) % this.companies.length].name,
          this.companies[(hour + i + 2) % this.companies.length].name
        ],
        date: new Date(Date.now() - (i * 7 * 24 * 3600000)),
        purpose: this.generatePurpose(roundTypes[roundIndex]),
        milestones: this.generateMilestones(roundTypes[roundIndex])
      })
    }

    return rounds
  }

  // M&A 활동
  async getMAActivity(): Promise<M_AActivity[]> {
    const activities: M_AActivity[] = []
    const hour = new Date().getHours()

    for (let i = 0; i < 5; i++) {
      const companyIndex = (hour + i) % this.companies.length
      const projectIndex = (hour + i) % this.projects.length

      activities.push({
        id: `ma-${i + 1}`,
        type: ['merger', 'acquisition', 'joint-venture', 'strategic-investment'][i % 4] as any,
        acquirer: this.companies[companyIndex].name,
        target: this.projects[projectIndex],
        value: (500 + i * 200) * 1000000,
        status: i === 0 ? 'completed' : i < 3 ? 'pending' : 'announced',
        regulatoryApproval: i < 3,
        expectedClose: new Date(Date.now() + (30 * 24 * 3600000)),
        rationale: `전략적 블록체인 역량 강화 및 Web3 시장 진출`,
        synergies: [
          '기술 시너지',
          '시장 확대',
          '비용 절감',
          '혁신 가속화'
        ]
      })
    }

    return activities
  }

  // 전략적 제휴
  async getStrategicAlliances(): Promise<StrategicAlliance[]> {
    const alliances: StrategicAlliance[] = []
    const hour = new Date().getHours()

    for (let i = 0; i < 6; i++) {
      const partners = [
        this.companies[(hour + i) % this.companies.length].name,
        this.projects[(hour + i) % this.projects.length]
      ]

      alliances.push({
        id: `alliance-${i + 1}`,
        partners,
        type: ['technology', 'market', 'distribution', 'research'][i % 4] as any,
        scope: this.generateScope(i),
        duration: `${2 + (i % 3)}년`,
        objectives: this.generateObjectives(i),
        expectedOutcomes: this.generateOutcomes(i),
        status: i < 2 ? 'active' : i < 4 ? 'planned' : 'completed'
      })
    }

    return alliances
  }

  // 파트너십 메트릭스
  async getPartnershipMetrics(): Promise<PartnershipMetrics> {
    const partnerships = await this.getLatestPartnerships()
    const hour = new Date().getHours()

    const byType: Record<string, number> = {}
    partnerships.forEach(p => {
      byType[p.type] = (byType[p.type] || 0) + 1
    })

    const topPartners = this.companies.slice(0, 5).map((c, i) => ({
      name: c.name,
      count: 5 - i + (hour % 3),
      impact: 80 + (hour % 20) - i * 5
    }))

    return {
      totalPartnerships: partnerships.length,
      byType,
      topPartners,
      totalInvestment: 5000000000 + (hour * 100000000),
      averageDealSize: 250000000 + (hour * 10000000),
      successRate: 75 + (hour % 15)
    }
  }

  // 파트너십 영향도 분석
  async analyzePartnershipImpact(partnershipId: string): Promise<{
    priceImpact: number
    volumeImpact: number
    sentimentImpact: number
    longTermPotential: number
    risks: string[]
    opportunities: string[]
  }> {
    const hour = new Date().getHours()

    return {
      priceImpact: 5 + (hour % 15),
      volumeImpact: 20 + (hour % 30),
      sentimentImpact: 60 + (hour % 30),
      longTermPotential: 70 + (hour % 25),
      risks: [
        '규제 승인 지연 가능성',
        '시장 변동성 영향',
        '경쟁사 대응',
        '기술 통합 복잡성'
      ],
      opportunities: [
        '시장 점유율 확대',
        '기술 혁신 가속',
        '신규 사용자 유입',
        '수익 모델 다변화'
      ]
    }
  }

  // 헬퍼 함수들
  private generateTitle(type: string, company: string, coin: string): string {
    const templates = {
      partnership: `${company}, ${coin} 블록체인과 전략적 파트너십 체결`,
      investment: `${company}, ${coin} 프로젝트에 대규모 투자 발표`,
      acquisition: `${company}, ${coin} 관련 기업 인수 추진`,
      collaboration: `${company}와 ${coin}, 기술 협력 MOU 체결`,
      integration: `${company}, ${coin} 결제 시스템 통합 발표`,
      listing: `${coin}, ${company} 플랫폼 상장 확정`
    }
    return templates[type] || `${company}와 ${coin} 협력 소식`
  }

  private generateDescription(type: string, company: string, coin: string): string {
    const descriptions = {
      partnership: `${company}가 ${coin} 블록체인과 전략적 파트너십을 체결하여 Web3 생태계 확장을 가속화합니다. 이번 협력을 통해 기술 공유, 공동 개발, 시장 확대 등 다양한 시너지가 기대됩니다.`,
      investment: `${company}가 ${coin} 생태계에 대규모 투자를 단행했습니다. 이번 투자는 블록체인 기술 채택 확대와 엔터프라이즈 솔루션 개발에 활용될 예정입니다.`,
      acquisition: `${company}가 ${coin} 관련 핵심 기업을 인수하여 블록체인 역량을 대폭 강화합니다. 이번 인수로 Web3 시장에서의 경쟁력이 크게 향상될 전망입니다.`,
      collaboration: `${company}와 ${coin}이 기술 협력을 위한 양해각서를 체결했습니다. 양사는 블록체인 기술 연구개발과 실용화를 위해 긴밀히 협력할 계획입니다.`,
      integration: `${company}가 자사 서비스에 ${coin} 블록체인을 통합한다고 발표했습니다. 이로써 수백만 사용자가 암호화폐 서비스를 이용할 수 있게 됩니다.`,
      listing: `${coin}이 ${company} 플랫폼에 공식 상장되어 거래가 시작됩니다. 이번 상장으로 유동성과 접근성이 크게 개선될 것으로 예상됩니다.`
    }
    return descriptions[type] || `${company}와 ${coin}의 협력 관련 상세 내용`
  }

  private generateImpactAreas(type: string): string[] {
    const areas = {
      partnership: ['기술 혁신', '시장 확대', '사용자 증가', '생태계 성장'],
      investment: ['자금 조달', '개발 가속', '인프라 구축', '팀 확장'],
      acquisition: ['시장 통합', '기술 흡수', '경쟁력 강화', '포트폴리오 확대'],
      collaboration: ['R&D 협력', '지식 공유', '표준화', '공동 개발'],
      integration: ['서비스 통합', '사용성 개선', '대중화', '결제 편의성'],
      listing: ['유동성 증가', '가격 발견', '접근성 향상', '시장 신뢰도']
    }
    return areas[type] || ['시장 영향', '기술 발전', '생태계 확장']
  }

  private generateTags(type: string): string[] {
    const tags = {
      partnership: ['전략적제휴', '파트너십', '협력', 'Web3'],
      investment: ['투자', '펀딩', '자금조달', 'VC'],
      acquisition: ['M&A', '인수합병', '기업인수', '통합'],
      collaboration: ['협업', 'MOU', '공동개발', '기술협력'],
      integration: ['통합', '연동', '시스템통합', 'API'],
      listing: ['상장', '거래소', '신규상장', '거래개시']
    }
    return tags[type] || ['파트너십', '협력', '뉴스']
  }

  private generatePurpose(round: string): string {
    const purposes = {
      'seed': '초기 제품 개발 및 팀 구성',
      'series-a': '제품 완성 및 시장 진출',
      'series-b': '시장 확대 및 성장 가속',
      'series-c': '글로벌 확장 및 신규 사업',
      'private': '전략적 투자 및 파트너십 구축'
    }
    return purposes[round] || '사업 확장 및 기술 개발'
  }

  private generateMilestones(round: string): string[] {
    const milestones = {
      'seed': ['MVP 출시', '초기 사용자 1만명 달성', '핵심 팀 구성'],
      'series-a': ['메인넷 런칭', '월 거래량 $1M 달성', '주요 파트너십 체결'],
      'series-b': ['사용자 100만명 돌파', '수익 모델 확립', '글로벌 진출'],
      'series-c': ['유니콘 달성', '10개국 진출', '신규 서비스 런칭'],
      'private': ['전략적 제휴', '엔터프라이즈 고객 확보', 'IPO 준비']
    }
    return milestones[round] || ['제품 개발', '시장 확대', '팀 성장']
  }

  private generateScope(index: number): string {
    const scopes = [
      '블록체인 기술 공동 연구 및 개발',
      '글로벌 시장 진출 및 마케팅 협력',
      '유통 채널 공유 및 판매 네트워크 확대',
      '차세대 Web3 솔루션 공동 개발',
      '크로스체인 인프라 구축',
      '엔터프라이즈 블록체인 솔루션 개발'
    ]
    return scopes[index % scopes.length]
  }

  private generateObjectives(index: number): string[] {
    const objectives = [
      ['기술 혁신 가속화', '시장 점유율 확대', '비용 절감'],
      ['신규 시장 개척', '고객 기반 확대', '수익 증대'],
      ['제품 포트폴리오 다변화', '경쟁력 강화', '브랜드 가치 상승'],
      ['연구개발 효율화', '기술 표준 수립', '특허 공유'],
      ['생태계 확장', '네트워크 효과 극대화', '사용자 경험 개선'],
      ['규제 대응력 강화', '리스크 분산', '지속가능성 확보']
    ]
    return objectives[index % objectives.length]
  }

  private generateOutcomes(index: number): string[] {
    const outcomes = [
      ['신제품 3종 출시', '매출 30% 증가', '시장 점유율 10% 상승'],
      ['사용자 200% 증가', '거래량 5배 성장', 'TVL $1B 달성'],
      ['10개 신규 시장 진출', '파트너 네트워크 50개 확대', '브랜드 인지도 상승'],
      ['특허 20건 출원', '핵심 기술 3종 개발', '표준 프로토콜 확립'],
      ['처리 속도 10배 향상', '수수료 50% 절감', '보안성 강화'],
      ['규제 승인 5개국', '기관 고객 100개 확보', '엔터프라이즈 매출 $100M']
    ]
    return outcomes[index % outcomes.length]
  }
}

// 싱글톤 인스턴스
export const partnershipService = new PartnershipService()