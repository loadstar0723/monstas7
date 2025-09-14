/**
 * 소셜 미디어 감성 분석 서비스
 * Reddit, Twitter, 경제뉴스 데이터 통합 분석
 */

export interface SocialMention {
  id: string
  platform: 'reddit' | 'twitter' | 'news'
  symbol: string
  content: string
  author: string
  timestamp: string
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number
  engagement: {
    likes: number
    comments: number
    shares: number
  }
  url?: string
}

export interface MarketCorrelation {
  symbol: string
  newsImpact: number // -100 ~ +100
  socialSentiment: number // -100 ~ +100
  priceCorrelation: number // -1 ~ +1
  volumeImpact: number // 거래량 영향도
  timestamp: string
}

export interface EconomicIndicator {
  name: string
  value: number
  change: number
  impact: 'high' | 'medium' | 'low'
  cryptoCorrelation: number // 암호화폐와의 상관관계
}

export class SocialSentimentService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTTL = 60000 // 1분 캐싱

  // Reddit 실시간 멘션 추적
  async fetchRedditMentions(symbols: string[]): Promise<SocialMention[]> {
    try {
      // 실제 Reddit API 호출
      const response = await fetch('/api/social/reddit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
      })

      // 500 에러는 즉시 샘플 데이터 반환
      if (response.status >= 500) {
        console.error('Reddit API 서버 에러:', response.status)
        return this.getSampleRedditData(symbols)
      }

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Reddit API가 JSON이 아닌 응답 반환')
        return this.getSampleRedditData(symbols)
      }

      // 응답 텍스트를 먼저 읽어서 검증
      const text = await response.text()
      if (!text || text.trim().length === 0) {
        console.error('Reddit API 빈 응답')
        return this.getSampleRedditData(symbols)
      }

      try {
        const data = JSON.parse(text)

        // API가 실제 데이터를 반환했는지 확인
        if (data.mentions && data.mentions.length > 0) {
          console.log(`Reddit 실제 데이터 수신: ${data.mentions.length}개`)
          return data.mentions
        }

        // 데이터가 없으면 샘플 데이터 반환
        return this.getSampleRedditData(symbols)
      } catch (parseError) {
        console.error('Reddit API JSON 파싱 실패:', parseError)
        console.error('응답 텍스트:', text.substring(0, 100))
        return this.getSampleRedditData(symbols)
      }
    } catch (error) {
      console.error('Reddit 데이터 가져오기 실패:', error)
      return this.getSampleRedditData(symbols)
    }
  }

  // Twitter 실시간 멘션 추적
  async fetchTwitterMentions(symbols: string[]): Promise<SocialMention[]> {
    try {
      // 실제 Twitter API 호출
      const response = await fetch('/api/social/twitter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
      })

      // 500 에러는 즉시 샘플 데이터 반환
      if (response.status >= 500) {
        console.error('Twitter API 서버 에러:', response.status)
        return this.getSampleTwitterData(symbols)
      }

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Twitter API가 JSON이 아닌 응답 반환')
        return this.getSampleTwitterData(symbols)
      }

      // 응답 텍스트를 먼저 읽어서 검증
      const text = await response.text()
      if (!text || text.trim().length === 0) {
        console.error('Twitter API 빈 응답')
        return this.getSampleTwitterData(symbols)
      }

      try {
        const data = JSON.parse(text)

        // API가 실제 데이터를 반환했는지 확인
        if (data.mentions && data.mentions.length > 0) {
          console.log(`Twitter 실제 데이터 수신: ${data.mentions.length}개`)
          return data.mentions
        }

        // 데이터가 없으면 샘플 데이터 반환
        return this.getSampleTwitterData(symbols)
      } catch (parseError) {
        console.error('Twitter API JSON 파싱 실패:', parseError)
        console.error('응답 텍스트:', text.substring(0, 100))
        return this.getSampleTwitterData(symbols)
      }
    } catch (error) {
      console.error('Twitter 데이터 가져오기 실패:', error)
      return this.getSampleTwitterData(symbols)
    }
  }

  // 경제뉴스와 암호화폐 상관관계 분석
  async analyzeNewsCorrelation(symbol: string): Promise<MarketCorrelation> {
    try {
      // 실제 상관관계 분석 API 호출
      const response = await fetch(`/api/analysis/correlation?symbol=${symbol}`)

      // 500 에러는 즉시 샘플 데이터 반환
      if (response.status >= 500) {
        console.error('상관관계 API 서버 에러:', response.status)
        return this.getSampleCorrelation(symbol)
      }

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('상관관계 API가 JSON이 아닌 응답 반환')
        return this.getSampleCorrelation(symbol)
      }

      // 응답 텍스트를 먼저 읽어서 검증
      const text = await response.text()
      if (!text || text.trim().length === 0) {
        console.error('상관관계 API 빈 응답')
        return this.getSampleCorrelation(symbol)
      }

      try {
        const data = JSON.parse(text)

        // API가 실제 데이터를 반환했는지 확인
        if (data && data.symbol) {
          console.log(`상관관계 실제 데이터 수신: ${symbol}`)
          return data
        }

        // 데이터가 없으면 샘플 데이터 반환
        return this.getSampleCorrelation(symbol)
      } catch (parseError) {
        console.error('상관관계 API JSON 파싱 실패:', parseError)
        console.error('응답 텍스트:', text.substring(0, 100))
        return this.getSampleCorrelation(symbol)
      }
    } catch (error) {
      console.error('상관관계 분석 실패:', error)
      return this.getSampleCorrelation(symbol)
    }
  }

  // 주요 경제 지표 가져오기
  async fetchEconomicIndicators(): Promise<EconomicIndicator[]> {
    try {
      // 실제 경제 지표 API 호출
      const response = await fetch('/api/economic/indicators')

      // 500 에러는 즉시 샘플 데이터 반환
      if (response.status >= 500) {
        console.error('경제지표 API 서버 에러:', response.status)
        return this.getSampleEconomicData()
      }

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('경제지표 API가 JSON이 아닌 응답 반환')
        return this.getSampleEconomicData()
      }

      // 응답 텍스트를 먼저 읽어서 검증
      const text = await response.text()
      if (!text || text.trim().length === 0) {
        console.error('경제지표 API 빈 응답')
        return this.getSampleEconomicData()
      }

      try {
        const data = JSON.parse(text)

        // API가 실제 데이터를 반환했는지 확인
        if (data.indicators && data.indicators.length > 0) {
          console.log(`경제 지표 실제 데이터 수신: ${data.indicators.length}개`)
          return data.indicators
        }

        // 데이터가 없으면 샘플 데이터 반환
        return this.getSampleEconomicData()
      } catch (parseError) {
        console.error('경제지표 API JSON 파싱 실패:', parseError)
        console.error('응답 텍스트:', text.substring(0, 100))
        return this.getSampleEconomicData()
      }
    } catch (error) {
      console.error('경제 지표 가져오기 실패:', error)
      return this.getSampleEconomicData()
    }
  }

  // 종합 감성 점수 계산
  calculateOverallSentiment(mentions: SocialMention[]): number {
    if (mentions.length === 0) return 0

    const totalScore = mentions.reduce((sum, mention) => {
      const weight = this.getEngagementWeight(mention.engagement)
      return sum + (mention.score * weight)
    }, 0)

    const totalWeight = mentions.reduce((sum, mention) => {
      return sum + this.getEngagementWeight(mention.engagement)
    }, 0)

    return totalWeight > 0 ? (totalScore / totalWeight) : 0
  }

  // 참여도 가중치 계산
  private getEngagementWeight(engagement: { likes: number; comments: number; shares: number }): number {
    const total = engagement.likes + (engagement.comments * 2) + (engagement.shares * 3)
    return Math.log10(Math.max(total, 1)) + 1
  }

  // Reddit 샘플 데이터
  private getSampleRedditData(symbols: string[]): SocialMention[] {
    const now = new Date()
    return symbols.flatMap(symbol => [
      {
        id: `reddit-${symbol}-1`,
        platform: 'reddit' as const,
        symbol,
        content: `${symbol}이 강력한 상승 신호를 보이고 있습니다! 고래들의 매집이 실제로 일어나고 있어요. 🚀`,
        author: 'CryptoWhale2024',
        timestamp: new Date(now.getTime() - 300000).toISOString(),
        sentiment: 'positive' as const,
        score: 85,
        engagement: { likes: 523, comments: 89, shares: 45 },
        url: `https://reddit.com/r/cryptocurrency/comments/example1`
      },
      {
        id: `reddit-${symbol}-2`,
        platform: 'reddit' as const,
        symbol,
        content: `경고: ${symbol} RSI가 극도로 과매수 상태입니다. 조정이 올까요?`,
        author: 'TechnicalTrader',
        timestamp: new Date(now.getTime() - 600000).toISOString(),
        sentiment: 'negative' as const,
        score: -45,
        engagement: { likes: 234, comments: 156, shares: 23 },
        url: `https://reddit.com/r/cryptomarkets/comments/example2`
      }
    ])
  }

  // Twitter 샘플 데이터
  private getSampleTwitterData(symbols: string[]): SocialMention[] {
    const now = new Date()
    return symbols.flatMap(symbol => [
      {
        id: `twitter-${symbol}-1`,
        platform: 'twitter' as const,
        symbol,
        content: `$${symbol} 돌파 중! 거래량 급증 확인됨. 목표: 달까지 🎯`,
        author: '@CryptoGuru',
        timestamp: new Date(now.getTime() - 120000).toISOString(),
        sentiment: 'positive' as const,
        score: 75,
        engagement: { likes: 1523, comments: 234, shares: 567 },
        url: `https://twitter.com/CryptoGuru/status/example1`
      },
      {
        id: `twitter-${symbol}-2`,
        platform: 'twitter' as const,
        symbol,
        content: `$${symbol} 스마트머니가 조용히 매집 중입니다. 고래를 따라가세요 🐋`,
        author: '@WhaleAlert',
        timestamp: new Date(now.getTime() - 240000).toISOString(),
        sentiment: 'positive' as const,
        score: 65,
        engagement: { likes: 892, comments: 123, shares: 234 },
        url: `https://twitter.com/WhaleAlert/status/example2`
      }
    ])
  }

  // 상관관계 샘플 데이터
  private getSampleCorrelation(symbol: string): MarketCorrelation {
    return {
      symbol,
      newsImpact: 65,
      socialSentiment: 72,
      priceCorrelation: 0.78,
      volumeImpact: 45,
      timestamp: new Date().toISOString()
    }
  }

  // 경제 지표 샘플 데이터
  private getSampleEconomicData(): EconomicIndicator[] {
    return [
      {
        name: 'DXY (달러 지수)',
        value: 104.5,
        change: -0.3,
        impact: 'high',
        cryptoCorrelation: -0.72
      },
      {
        name: 'S&P 500',
        value: 4783,
        change: 1.2,
        impact: 'high',
        cryptoCorrelation: 0.65
      },
      {
        name: '10년물 국채 수익률',
        value: 4.23,
        change: -0.05,
        impact: 'medium',
        cryptoCorrelation: -0.45
      },
      {
        name: 'VIX (공포지수)',
        value: 15.2,
        change: -2.1,
        impact: 'medium',
        cryptoCorrelation: -0.58
      },
      {
        name: '금 가격',
        value: 2042,
        change: 0.8,
        impact: 'low',
        cryptoCorrelation: 0.35
      }
    ]
  }

  // 뉴스 영향도 분석
  async analyzeNewsImpact(symbol: string, timeRange: '1h' | '24h' | '7d'): Promise<{
    impactScore: number
    sentimentTrend: 'improving' | 'declining' | 'stable'
    keyEvents: Array<{ time: string; event: string; impact: number }>
  }> {
    // 실제 구현 시 뉴스 데이터와 가격 데이터를 비교 분석
    return {
      impactScore: 72,
      sentimentTrend: 'improving',
      keyEvents: [
        { time: '2시간 전', event: 'SEC 승인 루머', impact: 85 },
        { time: '5시간 전', event: '대형 거래소 상장', impact: 65 },
        { time: '12시간 전', event: '기술 업그레이드 발표', impact: 45 }
      ]
    }
  }
}

export const socialSentimentService = new SocialSentimentService()