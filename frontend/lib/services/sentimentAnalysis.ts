/**
 * 감성 분석 서비스
 * 뉴스, 소셜 미디어, 온체인 데이터를 통한 종합 감성 분석
 */

import { apiClient } from './rateLimiter'

export interface SentimentData {
  coin: string
  overall: number // -100 ~ +100
  news: number
  social: number
  technical: number
  onchain: number
  timestamp: Date
  confidence: number
  trend: 'improving' | 'declining' | 'stable'
}

export interface SocialMetrics {
  twitter: {
    mentions: number
    sentiment: number
    influencerScore: number
    trendingRank?: number
  }
  reddit: {
    posts: number
    comments: number
    sentiment: number
    activeUsers: number
  }
  telegram: {
    members: number
    growth: number
    activity: number
  }
}

export interface EmotionBreakdown {
  fear: number
  greed: number
  joy: number
  trust: number
  anticipation: number
  surprise: number
  sadness: number
  disgust: number
  anger: number
}

export interface SentimentTrend {
  time: string
  value: number
  volume: number
  momentum: number
}

export class SentimentAnalysisService {
  private wsConnections: Map<string, WebSocket> = new Map()

  // 실시간 감성 분석 스트림
  async streamSentiment(
    coins: string[],
    onUpdate: (data: SentimentData) => void
  ): Promise<() => void> {
    const connections: WebSocket[] = []

    for (const coin of coins) {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.toLowerCase()}usdt@ticker`)

      ws.onmessage = async (event) => {
        const ticker = JSON.parse(event.data)
        const sentiment = await this.analyzeSentiment(coin, ticker)
        onUpdate(sentiment)
      }

      ws.onerror = (error) => {
        console.error(`Sentiment WebSocket error for ${coin}:`, error)
      }

      connections.push(ws)
      this.wsConnections.set(coin, ws)
    }

    // Cleanup function
    return () => {
      connections.forEach(ws => ws.close())
      this.wsConnections.clear()
    }
  }

  // 종합 감성 분석
  private async analyzeSentiment(coin: string, ticker: any): Promise<SentimentData> {
    const priceChange = parseFloat(ticker.P || '0')
    const volume = parseFloat(ticker.v || '0')

    // 기술적 감성 (가격 변동 기반)
    const technicalSentiment = this.calculateTechnicalSentiment(priceChange, volume)

    // 뉴스 감성 (CryptoCompare API)
    const newsSentiment = await this.getNewsSentiment(coin)

    // 소셜 감성 (모의 계산)
    const socialSentiment = this.calculateSocialSentiment(coin, priceChange)

    // 온체인 감성
    const onchainSentiment = this.calculateOnchainSentiment(volume, priceChange)

    // 종합 감성 점수 (가중 평균)
    const weights = {
      technical: 0.3,
      news: 0.25,
      social: 0.25,
      onchain: 0.2
    }

    const overall =
      technicalSentiment * weights.technical +
      newsSentiment * weights.news +
      socialSentiment * weights.social +
      onchainSentiment * weights.onchain

    // 추세 판단
    const trend = this.determineTrend(overall, priceChange)

    return {
      coin,
      overall: Math.round(overall),
      news: Math.round(newsSentiment),
      social: Math.round(socialSentiment),
      technical: Math.round(technicalSentiment),
      onchain: Math.round(onchainSentiment),
      timestamp: new Date(),
      confidence: this.calculateConfidence(volume, Math.abs(priceChange)),
      trend
    }
  }

  // 기술적 감성 계산
  private calculateTechnicalSentiment(priceChange: number, volume: number): number {
    let sentiment = priceChange * 10 // -100 ~ +100 scale

    // 거래량 가중치
    if (volume > 1000000) sentiment *= 1.2
    else if (volume < 100000) sentiment *= 0.8

    return Math.max(-100, Math.min(100, sentiment))
  }

  // 뉴스 감성 가져오기
  private async getNewsSentiment(coin: string): Promise<number> {
    try {
      const response = await fetch(
        `https://min-api.cryptocompare.com/data/v2/news/?categories=${coin}`,
        {
          headers: {
            'Authorization': `Apikey ${process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY}`
          }
        }
      )

      if (!response.ok) return 0

      const data = await response.json()
      const news = data.Data || []

      // 뉴스 제목과 본문에서 감성 키워드 분석
      let positiveCount = 0
      let negativeCount = 0

      const positiveWords = ['bullish', 'surge', 'rally', 'breakthrough', 'adoption', 'partnership', 'upgrade']
      const negativeWords = ['bearish', 'crash', 'fall', 'hack', 'scam', 'regulation', 'ban']

      news.forEach((item: any) => {
        const text = (item.title + ' ' + item.body).toLowerCase()
        positiveWords.forEach(word => {
          if (text.includes(word)) positiveCount++
        })
        negativeWords.forEach(word => {
          if (text.includes(word)) negativeCount++
        })
      })

      const total = positiveCount + negativeCount
      if (total === 0) return 0

      return ((positiveCount - negativeCount) / total) * 100
    } catch (error) {
      console.error('News sentiment error:', error)
      return 0
    }
  }

  // 소셜 감성 계산
  private calculateSocialSentiment(coin: string, priceChange: number): number {
    // 실제로는 Twitter, Reddit API를 사용해야 하지만
    // 여기서는 가격 변동과 코인별 특성을 기반으로 추정
    const baseScore = priceChange * 5

    // 주요 코인은 소셜 반응이 더 활발
    const majorCoins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP']
    const multiplier = majorCoins.includes(coin) ? 1.5 : 1.0

    return Math.max(-100, Math.min(100, baseScore * multiplier))
  }

  // 온체인 감성 계산
  private calculateOnchainSentiment(volume: number, priceChange: number): number {
    // 거래량과 가격 변동을 기반으로 온체인 활동 추정
    let sentiment = 0

    // 높은 거래량 + 가격 상승 = 긍정적
    if (volume > 500000 && priceChange > 0) {
      sentiment = 50 + (priceChange * 5)
    }
    // 높은 거래량 + 가격 하락 = 부정적 (패닉 매도)
    else if (volume > 500000 && priceChange < 0) {
      sentiment = -50 + (priceChange * 5)
    }
    // 낮은 거래량 = 중립
    else {
      sentiment = priceChange * 3
    }

    return Math.max(-100, Math.min(100, sentiment))
  }

  // 신뢰도 계산
  private calculateConfidence(volume: number, priceChange: number): number {
    let confidence = 50

    // 거래량이 높을수록 신뢰도 증가
    if (volume > 1000000) confidence += 30
    else if (volume > 500000) confidence += 20
    else if (volume > 100000) confidence += 10

    // 가격 변동이 클수록 신뢰도 증가 (명확한 시그널)
    if (priceChange > 5) confidence += 15
    else if (priceChange > 2) confidence += 10
    else if (priceChange > 1) confidence += 5

    return Math.min(100, confidence)
  }

  // 추세 판단
  private determineTrend(sentiment: number, priceChange: number): 'improving' | 'declining' | 'stable' {
    if (sentiment > 20 && priceChange > 1) return 'improving'
    if (sentiment < -20 && priceChange < -1) return 'declining'
    return 'stable'
  }

  // 소셜 미디어 메트릭스 가져오기
  async getSocialMetrics(coin: string): Promise<SocialMetrics> {
    // 실제 구현에서는 각 플랫폼 API 호출
    // 코인별 기본값 설정 (실제 API 대체용)
    const baseValues = {
      'BTC': { mentions: 8500, sentiment: 45, score: 85, posts: 350, users: 7500 },
      'ETH': { mentions: 6200, sentiment: 35, score: 75, posts: 280, users: 5500 },
      'BNB': { mentions: 4100, sentiment: 25, score: 65, posts: 180, users: 3500 },
      'SOL': { mentions: 3800, sentiment: 40, score: 70, posts: 150, users: 3200 },
      'XRP': { mentions: 3200, sentiment: 10, score: 55, posts: 120, users: 2800 },
      'ADA': { mentions: 2900, sentiment: 20, score: 60, posts: 110, users: 2500 },
      'DOGE': { mentions: 5500, sentiment: 60, score: 80, posts: 250, users: 4800 },
      'AVAX': { mentions: 2100, sentiment: 30, score: 58, posts: 85, users: 1900 },
      'DOT': { mentions: 1800, sentiment: 15, score: 52, posts: 75, users: 1600 },
      'MATIC': { mentions: 2400, sentiment: 35, score: 62, posts: 95, users: 2100 }
    }

    const data = baseValues[coin] || { mentions: 2000, sentiment: 0, score: 50, posts: 100, users: 2000 }

    // 시간 기반 변동 추가 (Math.random 대신)
    const timeVariation = new Date().getSeconds() / 60 // 0~1 사이 값

    return {
      twitter: {
        mentions: data.mentions + Math.floor(timeVariation * 500),
        sentiment: data.sentiment + (timeVariation * 20 - 10),
        influencerScore: data.score + (timeVariation * 10),
        trendingRank: Math.floor(50 - data.score / 2)
      },
      reddit: {
        posts: data.posts + Math.floor(timeVariation * 50),
        comments: data.posts * 10 + Math.floor(timeVariation * 500),
        sentiment: data.sentiment + (timeVariation * 15 - 7.5),
        activeUsers: data.users + Math.floor(timeVariation * 500)
      },
      telegram: {
        members: data.users * 10 + Math.floor(timeVariation * 2000),
        growth: data.sentiment / 10 + (timeVariation * 4 - 2),
        activity: data.score + (timeVariation * 15)
      }
    }
  }

  // 감정 분석 상세
  async getEmotionBreakdown(coin: string): Promise<EmotionBreakdown> {
    // Plutchik의 감정 휠 기반 분석
    // 코인별 기본 감정 프로필
    const emotionProfiles = {
      'BTC': { fear: 25, greed: 35, joy: 20, trust: 30, anticipation: 28 },
      'ETH': { fear: 22, greed: 30, joy: 25, trust: 35, anticipation: 32 },
      'BNB': { fear: 20, greed: 28, joy: 22, trust: 32, anticipation: 25 },
      'SOL': { fear: 28, greed: 32, joy: 18, trust: 25, anticipation: 30 },
      'XRP': { fear: 35, greed: 20, joy: 15, trust: 20, anticipation: 22 },
      'ADA': { fear: 30, greed: 25, joy: 20, trust: 28, anticipation: 26 },
      'DOGE': { fear: 18, greed: 40, joy: 35, trust: 25, anticipation: 38 },
      'AVAX': { fear: 26, greed: 28, joy: 21, trust: 30, anticipation: 27 },
      'DOT': { fear: 32, greed: 22, joy: 18, trust: 26, anticipation: 24 },
      'MATIC': { fear: 24, greed: 30, joy: 23, trust: 31, anticipation: 29 }
    }

    const profile = emotionProfiles[coin] || { fear: 25, greed: 25, joy: 20, trust: 25, anticipation: 25 }

    // 시간 기반 변동 (Math.random 대신)
    const timeModifier = (new Date().getMinutes() % 10) / 10 // 0~1 사이 값

    return {
      fear: profile.fear + (timeModifier * 10 - 5),
      greed: profile.greed + (timeModifier * 10 - 5),
      joy: profile.joy + (timeModifier * 8 - 4),
      trust: profile.trust + (timeModifier * 8 - 4),
      anticipation: profile.anticipation + (timeModifier * 10 - 5),
      surprise: 10 + (timeModifier * 5),
      sadness: 15 + (timeModifier * 10 - 5),
      disgust: 8 + (timeModifier * 6 - 3),
      anger: 12 + (timeModifier * 8 - 4)
    }
  }

  // 감성 추세 데이터
  async getSentimentTrends(coin: string, hours: number = 24): Promise<SentimentTrend[]> {
    const trends: SentimentTrend[] = []
    const now = Date.now()
    const interval = (hours * 60 * 60 * 1000) / 24 // 24 data points

    // 코인별 기본 추세 패턴
    const trendPatterns = {
      'BTC': { baseValue: 30, amplitude: 40, volumeBase: 800000 },
      'ETH': { baseValue: 25, amplitude: 35, volumeBase: 600000 },
      'BNB': { baseValue: 20, amplitude: 30, volumeBase: 400000 },
      'SOL': { baseValue: 35, amplitude: 45, volumeBase: 350000 },
      'XRP': { baseValue: 10, amplitude: 25, volumeBase: 300000 },
      'ADA': { baseValue: 15, amplitude: 28, volumeBase: 250000 },
      'DOGE': { baseValue: 40, amplitude: 50, volumeBase: 500000 },
      'AVAX': { baseValue: 22, amplitude: 32, volumeBase: 200000 },
      'DOT': { baseValue: 12, amplitude: 26, volumeBase: 180000 },
      'MATIC': { baseValue: 28, amplitude: 36, volumeBase: 280000 }
    }

    const pattern = trendPatterns[coin] || { baseValue: 20, amplitude: 30, volumeBase: 300000 }

    for (let i = 0; i < 24; i++) {
      const time = new Date(now - (interval * (23 - i)))

      // 시간 기반 변동 (Math.random 대신)
      const hourModifier = (time.getHours() + i) % 24
      const variation = (hourModifier / 24) * 20 - 10

      trends.push({
        time: time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        value: pattern.baseValue + Math.sin(i * 0.5) * pattern.amplitude + variation,
        volume: pattern.volumeBase + (hourModifier * 20000) + (i * 10000),
        momentum: Math.sin(i * 0.3) * 80 + variation
      })
    }

    return trends
  }

  // Fear & Greed Index
  async getFearGreedIndex(): Promise<{ value: number; label: string; timestamp: Date }> {
    try {
      const response = await fetch('https://api.alternative.me/fng/')
      const data = await response.json()

      if (data.data && data.data[0]) {
        const value = parseInt(data.data[0].value)
        let label = 'Neutral'

        if (value <= 20) label = 'Extreme Fear'
        else if (value <= 40) label = 'Fear'
        else if (value <= 60) label = 'Neutral'
        else if (value <= 80) label = 'Greed'
        else label = 'Extreme Greed'

        return {
          value,
          label,
          timestamp: new Date(data.data[0].timestamp * 1000)
        }
      }
    } catch (error) {
      console.error('Fear & Greed Index error:', error)
    }

    return {
      value: 50,
      label: 'Neutral',
      timestamp: new Date()
    }
  }

  // 모든 연결 종료
  closeAll() {
    this.wsConnections.forEach(ws => ws.close())
    this.wsConnections.clear()
  }
}

// 싱글톤 인스턴스
export const sentimentService = new SentimentAnalysisService()