/**
 * AI 기반 트레이딩 시그널 분석 서비스
 * 뉴스 데이터를 분석하여 매매 신호 생성
 */

import { RealNewsItem } from './realNewsService'

export interface TradingSignal {
  direction: 'long' | 'short' | 'neutral'
  confidence: number // 0-100%
  entryPrice?: number
  stopLoss?: number
  takeProfit?: number
  riskReward?: number
  timeframe: 'short' | 'medium' | 'long'
  reasoning: string[]
}

export interface MarketSentiment {
  bullish: number // 0-100
  bearish: number // 0-100
  neutral: number // 0-100
  fearGreedIndex: number // 0-100
  volatilityScore: number // 0-100
}

export interface EconomicCorrelation {
  sp500: number // -1 to 1
  dxy: number // Dollar Index correlation
  gold: number
  oil: number
  interestRate: number
  timestamp: string
}

export interface SocialSentiment {
  twitterMentions: number
  redditPosts: number
  telegramMessages: number
  buzzScore: number // 0-100
  viralProbability: number // 0-100
  sentimentTrend: 'increasing' | 'decreasing' | 'stable'
}

export class AIAnalysisService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTTL = 300000 // 5분 캐싱

  /**
   * 뉴스 기반 트레이딩 시그널 생성
   */
  async generateTradingSignal(
    news: RealNewsItem,
    currentPrice: number
  ): Promise<TradingSignal> {
    try {
      // 뉴스 카테고리와 내용 분석
      const sentiment = this.analyzeNewsSentiment(news)
      const keywords = this.extractTradingKeywords(news)
      const impact = this.calculateMarketImpact(news)

      // 방향성 결정
      let direction: 'long' | 'short' | 'neutral' = 'neutral'
      let confidence = 50

      // 긍정적 키워드 분석
      const positiveKeywords = [
        'surge', 'rally', 'bullish', 'breakout', 'adoption',
        'partnership', 'upgrade', 'buy', 'accumulation', 'support',
        '상승', '급등', '돌파', '매수', '강세', '호재'
      ]

      // 부정적 키워드 분석
      const negativeKeywords = [
        'crash', 'dump', 'bearish', 'breakdown', 'ban',
        'hack', 'sell', 'resistance', 'decline', 'warning',
        '하락', '급락', '매도', '약세', '악재', '규제'
      ]

      const newsText = `${news.title} ${news.description}`.toLowerCase()

      const positiveCount = positiveKeywords.filter(k => newsText.includes(k)).length
      const negativeCount = negativeKeywords.filter(k => newsText.includes(k)).length

      // 방향성과 신뢰도 계산
      if (positiveCount > negativeCount) {
        direction = 'long'
        confidence = Math.min(95, 50 + positiveCount * 10)
      } else if (negativeCount > positiveCount) {
        direction = 'short'
        confidence = Math.min(95, 50 + negativeCount * 10)
      } else {
        direction = 'neutral'
        confidence = 40 + Math.floor(Math.random() * 20)
      }

      // 카테고리별 가중치 적용
      if (news.category === 'breaking') {
        confidence = Math.min(100, confidence + 15)
      } else if (news.category === 'regulatory') {
        if (direction === 'short') confidence = Math.min(100, confidence + 10)
      } else if (news.category === 'defi' || news.category === 'technical') {
        if (direction === 'long') confidence = Math.min(100, confidence + 5)
      }

      // 진입가, 손절가, 목표가 계산
      const entryPrice = currentPrice
      let stopLoss: number
      let takeProfit: number

      if (direction === 'long') {
        stopLoss = entryPrice * 0.97 // -3%
        takeProfit = entryPrice * 1.06 // +6%
      } else if (direction === 'short') {
        stopLoss = entryPrice * 1.03 // +3%
        takeProfit = entryPrice * 0.94 // -6%
      } else {
        stopLoss = entryPrice * 0.98
        takeProfit = entryPrice * 1.02
      }

      // Risk/Reward 비율 계산
      const risk = Math.abs(entryPrice - stopLoss)
      const reward = Math.abs(takeProfit - entryPrice)
      const riskReward = reward / risk

      // 시간대 결정
      let timeframe: 'short' | 'medium' | 'long' = 'medium'
      if (news.category === 'breaking') {
        timeframe = 'short'
      } else if (news.category === 'regulatory') {
        timeframe = 'long'
      }

      // 추론 근거 생성
      const reasoning: string[] = []
      if (positiveCount > 0) {
        reasoning.push(`긍정적 키워드 ${positiveCount}개 감지`)
      }
      if (negativeCount > 0) {
        reasoning.push(`부정적 키워드 ${negativeCount}개 감지`)
      }
      if (news.category === 'breaking') {
        reasoning.push('속보 뉴스로 즉각적 영향 예상')
      }
      if (news.relatedCoins.length > 3) {
        reasoning.push('여러 코인에 영향을 미치는 중요 뉴스')
      }

      return {
        direction,
        confidence,
        entryPrice,
        stopLoss,
        takeProfit,
        riskReward,
        timeframe,
        reasoning
      }
    } catch (error) {
      console.error('Trading signal generation error:', error)
      return {
        direction: 'neutral',
        confidence: 50,
        timeframe: 'medium',
        reasoning: ['분석 중 오류 발생']
      }
    }
  }

  /**
   * 시장 센티먼트 분석
   */
  async analyzeMarketSentiment(newsList: RealNewsItem[]): Promise<MarketSentiment> {
    let bullishCount = 0
    let bearishCount = 0
    let neutralCount = 0

    for (const news of newsList) {
      const signal = await this.generateTradingSignal(news, 100000) // 임시 가격
      if (signal.direction === 'long') bullishCount++
      else if (signal.direction === 'short') bearishCount++
      else neutralCount++
    }

    const total = newsList.length || 1
    const bullish = (bullishCount / total) * 100
    const bearish = (bearishCount / total) * 100
    const neutral = (neutralCount / total) * 100

    // Fear & Greed Index 계산 (0 = Extreme Fear, 100 = Extreme Greed)
    const fearGreedIndex = bullish // 단순화된 계산

    // 변동성 점수 계산
    const volatilityScore = Math.abs(bullish - bearish)

    return {
      bullish,
      bearish,
      neutral,
      fearGreedIndex,
      volatilityScore
    }
  }

  /**
   * 경제 지표와의 상관관계 분석
   */
  async getEconomicCorrelation(symbol: string): Promise<EconomicCorrelation> {
    // 실제 구현시 외부 API 호출 필요
    // 현재는 시뮬레이션 데이터
    const baseCorrelation = {
      BTC: { sp500: 0.45, dxy: -0.35, gold: 0.25, oil: 0.15 },
      ETH: { sp500: 0.55, dxy: -0.40, gold: 0.20, oil: 0.10 },
      default: { sp500: 0.35, dxy: -0.25, gold: 0.15, oil: 0.05 }
    }

    const correlations = baseCorrelation[symbol as keyof typeof baseCorrelation] || baseCorrelation.default

    return {
      sp500: correlations.sp500,
      dxy: correlations.dxy,
      gold: correlations.gold,
      oil: correlations.oil,
      interestRate: -0.30, // 금리와는 일반적으로 역상관
      timestamp: new Date().toISOString()
    }
  }

  /**
   * 소셜 미디어 센티먼트 분석
   */
  async getSocialSentiment(symbol: string): Promise<SocialSentiment> {
    // 실제 구현시 Twitter, Reddit API 필요
    // CryptoCompare Social API 활용 가능

    try {
      const response = await fetch(
        `/api/social/sentiment?symbol=${symbol}`
      )

      if (!response.ok) {
        throw new Error('Social API failed')
      }

      const data = await response.json()

      return {
        twitterMentions: data.twitter || 0,
        redditPosts: data.reddit || 0,
        telegramMessages: data.telegram || 0,
        buzzScore: data.buzzScore || 50,
        viralProbability: data.viralProbability || 10,
        sentimentTrend: data.trend || 'stable'
      }
    } catch (error) {
      // 폴백 데이터
      return {
        twitterMentions: 1000 + Math.floor(Math.random() * 5000),
        redditPosts: 50 + Math.floor(Math.random() * 200),
        telegramMessages: 100 + Math.floor(Math.random() * 500),
        buzzScore: 40 + Math.floor(Math.random() * 30),
        viralProbability: 5 + Math.floor(Math.random() * 20),
        sentimentTrend: 'stable'
      }
    }
  }

  /**
   * 뉴스 센티먼트 분석
   */
  private analyzeNewsSentiment(news: RealNewsItem): number {
    const text = `${news.title} ${news.description}`.toLowerCase()

    const positiveWords = ['growth', 'increase', 'surge', 'gain', 'bullish', 'rise']
    const negativeWords = ['drop', 'fall', 'crash', 'decline', 'bearish', 'plunge']

    let score = 0
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 10
    })
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 10
    })

    return Math.max(-100, Math.min(100, score))
  }

  /**
   * 트레이딩 키워드 추출
   */
  private extractTradingKeywords(news: RealNewsItem): string[] {
    const text = `${news.title} ${news.description}`.toLowerCase()
    const keywords: string[] = []

    const tradingTerms = [
      'breakout', 'breakdown', 'support', 'resistance',
      'bullish', 'bearish', 'accumulation', 'distribution',
      'pump', 'dump', 'rally', 'crash'
    ]

    tradingTerms.forEach(term => {
      if (text.includes(term)) {
        keywords.push(term)
      }
    })

    return keywords
  }

  /**
   * 시장 영향도 계산
   */
  private calculateMarketImpact(news: RealNewsItem): number {
    let impact = 50 // 기본값

    // 카테고리별 가중치
    const categoryWeights: Record<string, number> = {
      breaking: 90,
      regulatory: 85,
      security: 80,
      exchange: 75,
      market: 70,
      defi: 65,
      technical: 60,
      general: 50
    }

    impact = categoryWeights[news.category] || 50

    // 관련 코인 수에 따른 가중치
    if (news.relatedCoins.length > 5) impact += 10
    if (news.relatedCoins.includes('BTC')) impact += 5
    if (news.relatedCoins.includes('ETH')) impact += 5

    return Math.min(100, impact)
  }

  /**
   * 투자 전략 제안
   */
  async generateInvestmentStrategy(
    signal: TradingSignal,
    capitalSize: number
  ): Promise<{
    positionSize: number
    leverage: number
    alternativeStrategies: string[]
  }> {
    const positionSizePercent = signal.confidence > 80 ? 10 :
                               signal.confidence > 60 ? 7 :
                               signal.confidence > 40 ? 5 : 3

    const positionSize = capitalSize * (positionSizePercent / 100)

    const leverage = signal.confidence > 80 ? 3 :
                    signal.confidence > 60 ? 2 : 1

    const alternativeStrategies: string[] = []

    if (signal.direction === 'neutral') {
      alternativeStrategies.push('그리드 트레이딩 고려')
      alternativeStrategies.push('변동성 매매 전략')
    } else if (signal.confidence < 60) {
      alternativeStrategies.push('DCA (분할 매수) 전략 권장')
      alternativeStrategies.push('옵션 헤지 고려')
    }

    if (signal.timeframe === 'short') {
      alternativeStrategies.push('스캘핑 전략 적용')
    } else if (signal.timeframe === 'long') {
      alternativeStrategies.push('장기 보유 전략')
    }

    return {
      positionSize,
      leverage,
      alternativeStrategies
    }
  }
}

// 싱글톤 인스턴스
export const aiAnalysisService = new AIAnalysisService()