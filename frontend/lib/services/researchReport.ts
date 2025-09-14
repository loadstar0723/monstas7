/**
 * 리서치 보고서 서비스
 * 전문 분석 보고서, 기술 리포트, 펀더멘털 분석
 */

export interface ResearchReport {
  id: string
  title: string
  category: 'technical' | 'fundamental' | 'macro' | 'defi' | 'nft' | 'regulation'
  coin: string
  author: string
  institution: string
  publishedAt: Date
  summary: string
  content: string
  rating: 'buy' | 'hold' | 'sell' | 'neutral'
  targetPrice?: number
  confidence: number
  tags: string[]
  metrics: {
    views: number
    likes: number
    shares: number
  }
  keyPoints: string[]
  charts?: ChartData[]
  relatedReports?: string[]
}

export interface ChartData {
  type: 'price' | 'volume' | 'tvl' | 'dominance' | 'correlation'
  title: string
  data: Array<{ time: string; value: number; label?: string }>
}

export interface InstitutionProfile {
  name: string
  logo: string
  reputation: number // 0-100
  totalReports: number
  accuracy: number // 과거 예측 정확도
  specialization: string[]
}

export interface ReportMetrics {
  totalReports: number
  buyRecommendations: number
  sellRecommendations: number
  avgAccuracy: number
  topAuthors: Array<{ name: string; reports: number; accuracy: number }>
}

export class ResearchReportService {
  // 주요 리서치 기관
  private institutions: InstitutionProfile[] = [
    {
      name: 'Messari Research',
      logo: '/logos/messari.png',
      reputation: 92,
      totalReports: 1250,
      accuracy: 78,
      specialization: ['DeFi', 'Layer 1', 'Infrastructure']
    },
    {
      name: 'Delphi Digital',
      logo: '/logos/delphi.png',
      reputation: 89,
      totalReports: 890,
      accuracy: 75,
      specialization: ['Gaming', 'NFT', 'Metaverse']
    },
    {
      name: 'Glassnode Insights',
      logo: '/logos/glassnode.png',
      reputation: 95,
      totalReports: 2100,
      accuracy: 82,
      specialization: ['On-chain', 'Bitcoin', 'Ethereum']
    },
    {
      name: 'The Block Research',
      logo: '/logos/theblock.png',
      reputation: 87,
      totalReports: 1560,
      accuracy: 73,
      specialization: ['Market Structure', 'Regulation', 'Institutional']
    },
    {
      name: 'Binance Research',
      logo: '/logos/binance.png',
      reputation: 85,
      totalReports: 980,
      accuracy: 71,
      specialization: ['Altcoins', 'Trading', 'Market Analysis']
    }
  ]

  // 최신 리서치 보고서 가져오기
  async getLatestReports(filter?: {
    coin?: string
    category?: string
    rating?: string
    institution?: string
  }): Promise<ResearchReport[]> {
    // 실제로는 API 호출
    const reports: ResearchReport[] = []
    const categories = ['technical', 'fundamental', 'macro', 'defi', 'nft', 'regulation'] as const
    const ratings = ['buy', 'hold', 'sell', 'neutral'] as const
    const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC']

    // 시간 기반 데이터 생성
    const now = Date.now()
    const hour = new Date().getHours()

    for (let i = 0; i < 20; i++) {
      const coinIndex = (hour + i) % coins.length
      const categoryIndex = (hour + i) % categories.length
      const ratingIndex = (hour + i) % ratings.length
      const institutionIndex = (hour + i) % this.institutions.length

      const report: ResearchReport = {
        id: `report-${i + 1}`,
        title: this.generateTitle(coins[coinIndex], categories[categoryIndex]),
        category: categories[categoryIndex],
        coin: coins[coinIndex],
        author: this.generateAuthorName(institutionIndex),
        institution: this.institutions[institutionIndex].name,
        publishedAt: new Date(now - (i * 3600000)), // 1시간 간격
        summary: this.generateSummary(coins[coinIndex], ratings[ratingIndex]),
        content: this.generateContent(coins[coinIndex], categories[categoryIndex]),
        rating: ratings[ratingIndex],
        targetPrice: this.generateTargetPrice(coins[coinIndex], ratings[ratingIndex]),
        confidence: 65 + ((hour + i) % 30),
        tags: this.generateTags(categories[categoryIndex]),
        metrics: {
          views: 1000 + (i * 500) + (hour * 100),
          likes: 50 + (i * 20) + hour,
          shares: 10 + (i * 5) + Math.floor(hour / 2)
        },
        keyPoints: this.generateKeyPoints(coins[coinIndex], ratings[ratingIndex]),
        charts: this.generateChartData(coins[coinIndex])
      }

      // 필터 적용
      if (filter) {
        if (filter.coin && report.coin !== filter.coin) continue
        if (filter.category && report.category !== filter.category) continue
        if (filter.rating && report.rating !== filter.rating) continue
        if (filter.institution && report.institution !== filter.institution) continue
      }

      reports.push(report)
    }

    return reports.slice(0, 10) // 최대 10개
  }

  // 보고서 상세 정보
  async getReportDetail(id: string): Promise<ResearchReport | null> {
    const reports = await this.getLatestReports()
    return reports.find(r => r.id === id) || null
  }

  // 기관별 보고서
  async getReportsByInstitution(institution: string): Promise<ResearchReport[]> {
    return this.getLatestReports({ institution })
  }

  // 인기 보고서
  async getTrendingReports(): Promise<ResearchReport[]> {
    const reports = await this.getLatestReports()
    return reports.sort((a, b) => b.metrics.views - a.metrics.views).slice(0, 5)
  }

  // 보고서 메트릭스
  async getReportMetrics(): Promise<ReportMetrics> {
    const reports = await this.getLatestReports()
    const buyCount = reports.filter(r => r.rating === 'buy').length
    const sellCount = reports.filter(r => r.rating === 'sell').length

    return {
      totalReports: reports.length,
      buyRecommendations: buyCount,
      sellRecommendations: sellCount,
      avgAccuracy: 75 + (new Date().getHours() % 10),
      topAuthors: [
        { name: 'Michael Chen', reports: 45, accuracy: 82 },
        { name: 'Sarah Johnson', reports: 38, accuracy: 79 },
        { name: 'David Kim', reports: 35, accuracy: 77 },
        { name: 'Emily Wang', reports: 32, accuracy: 80 },
        { name: 'John Smith', reports: 28, accuracy: 75 }
      ]
    }
  }

  // 기관 프로필
  getInstitutions(): InstitutionProfile[] {
    return this.institutions
  }

  // 보고서 제목 생성
  private generateTitle(coin: string, category: string): string {
    const templates = {
      technical: `${coin} 기술적 분석: 주요 지지/저항 레벨 및 거래 전략`,
      fundamental: `${coin} 펀더멘털 분석: 온체인 메트릭과 밸류에이션`,
      macro: `${coin}와 글로벌 매크로 환경: 금리 인상의 영향`,
      defi: `${coin} DeFi 생태계 분석: TVL 성장과 프로토콜 혁신`,
      nft: `${coin} NFT 마켓 리포트: 거래량 추이와 주요 컬렉션`,
      regulation: `${coin} 규제 환경 분석: 최신 정책 변화와 전망`
    }
    return templates[category] || `${coin} 종합 분석 리포트`
  }

  // 요약 생성
  private generateSummary(coin: string, rating: string): string {
    const summaries = {
      buy: `${coin}은 현재 강력한 매수 신호를 보이고 있습니다. 온체인 지표와 기술적 분석 모두 긍정적이며, 단기적으로 20-30% 상승 잠재력이 있습니다.`,
      hold: `${coin}은 현재 중립적인 포지션을 유지하는 것이 적절합니다. 시장 변동성이 높아 관망이 필요한 시점입니다.`,
      sell: `${coin}은 단기적으로 조정이 예상됩니다. 차익 실현을 고려하고 리스크 관리에 집중해야 할 시기입니다.`,
      neutral: `${coin}은 명확한 방향성이 없는 횡보 구간에 있습니다. 추가적인 시그널을 기다리며 포지션을 조절하는 것이 좋습니다.`
    }
    return summaries[rating] || summaries.neutral
  }

  // 내용 생성
  private generateContent(coin: string, category: string): string {
    return `
## 1. 개요
${coin}의 최근 시장 동향과 ${category} 관점에서의 심층 분석을 제공합니다.

## 2. 시장 현황
- 현재 가격 동향 및 거래량 분석
- 주요 이벤트 및 뉴스 영향
- 경쟁 프로젝트 대비 포지션

## 3. 기술적 분석
- 주요 지지/저항 레벨
- 이동평균선 및 모멘텀 지표
- 차트 패턴 분석

## 4. 온체인 메트릭
- 활성 주소 수 변화
- 거래소 유입/유출량
- 고래 지갑 동향

## 5. 투자 전략
- 단기/중장기 전망
- 리스크 관리 방안
- 포트폴리오 배분 제안

## 6. 결론
종합적인 분석 결과와 향후 전망을 제시합니다.
    `
  }

  // 목표가 생성
  private generateTargetPrice(coin: string, rating: string): number {
    const basePrices = {
      'BTC': 45000,
      'ETH': 3000,
      'BNB': 400,
      'SOL': 100,
      'XRP': 0.8,
      'ADA': 0.5,
      'DOGE': 0.1,
      'AVAX': 35,
      'DOT': 8,
      'MATIC': 1.2
    }

    const base = basePrices[coin] || 100
    const multiplier = {
      'buy': 1.25,
      'hold': 1.05,
      'sell': 0.85,
      'neutral': 1.0
    }

    return base * multiplier[rating]
  }

  // 태그 생성
  private generateTags(category: string): string[] {
    const tagMap = {
      technical: ['차트분석', '트레이딩', '기술적지표', '패턴분석'],
      fundamental: ['밸류에이션', '온체인', '펀더멘털', '투자분석'],
      macro: ['매크로', '금리', '인플레이션', '달러지수'],
      defi: ['DeFi', 'TVL', '유동성', '이자농사'],
      nft: ['NFT', '메타버스', '디지털아트', 'P2E'],
      regulation: ['규제', '정책', '법률', '컴플라이언스']
    }
    return tagMap[category] || ['암호화폐', '블록체인']
  }

  // 핵심 포인트 생성
  private generateKeyPoints(coin: string, rating: string): string[] {
    const points = [
      `${coin} 현재 RSI ${65 + (new Date().getMinutes() % 20)} 수준`,
      `24시간 거래량 ${20 + (new Date().getHours() % 30)}% 증가`,
      `온체인 활성 주소 수 ${15 + (new Date().getHours() % 25)}% 상승`,
      `거래소 ${coin} 보유량 ${5 + (new Date().getMinutes() % 10)}% 감소`,
      `소셜 미디어 언급량 전주 대비 ${30 + (new Date().getHours() % 40)}% 증가`
    ]

    if (rating === 'buy') {
      points.push('강력한 매수 시그널 포착')
    } else if (rating === 'sell') {
      points.push('단기 과열 구간 진입')
    }

    return points.slice(0, 4)
  }

  // 차트 데이터 생성
  private generateChartData(coin: string): ChartData[] {
    const now = Date.now()
    const priceData: ChartData = {
      type: 'price',
      title: `${coin} 가격 추이`,
      data: []
    }

    const volumeData: ChartData = {
      type: 'volume',
      title: `${coin} 거래량`,
      data: []
    }

    for (let i = 0; i < 7; i++) {
      const date = new Date(now - (i * 86400000))
      const basePrice = { BTC: 45000, ETH: 3000, BNB: 400 }[coin] || 100

      priceData.data.push({
        time: date.toLocaleDateString('ko-KR'),
        value: basePrice * (1 + Math.sin(i) * 0.1),
        label: `Day ${7 - i}`
      })

      volumeData.data.push({
        time: date.toLocaleDateString('ko-KR'),
        value: 1000000 * (1 + Math.cos(i) * 0.3),
        label: `Day ${7 - i}`
      })
    }

    return [priceData, volumeData]
  }

  // 저자 이름 생성
  private generateAuthorName(index: number): string {
    const authors = [
      'Michael Chen',
      'Sarah Johnson',
      'David Kim',
      'Emily Wang',
      'John Smith'
    ]
    return authors[index % authors.length]
  }
}

// 싱글톤 인스턴스
export const researchService = new ResearchReportService()