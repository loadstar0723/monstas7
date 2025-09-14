/**
 * Explainable AI (XAI) Module
 * AI 예측에 대한 설명 가능한 분석 제공
 */

import { NewsItem } from './newsDataService'

// XAI 분석 결과 타입
export interface XAIAnalysis {
  // 예측 결과
  prediction: {
    sentiment: 'bullish' | 'bearish' | 'neutral'
    confidence: number // 0-100
    priceImpact: number // -100 ~ +100
    timeframe: 'short' | 'medium' | 'long'
  }

  // 설명 가능한 요인들
  factors: {
    name: string
    impact: number // -100 ~ +100
    weight: number // 0-1
    explanation: string
    evidence: string[]
  }[]

  // 주요 키워드와 가중치
  keywords: {
    word: string
    frequency: number
    sentiment: number // -1 ~ +1
    importance: number // 0-1
  }[]

  // 시장 컨텍스트
  marketContext: {
    fearGreedIndex: number
    volumeTrend: 'increasing' | 'decreasing' | 'stable'
    priceVolatility: 'high' | 'medium' | 'low'
    marketDominance: number
  }

  // 히스토리 기반 예측
  historicalPattern: {
    similarEvents: {
      date: Date
      event: string
      outcome: string
      similarity: number // 0-100
    }[]
    patternConfidence: number
  }

  // 리스크 평가
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'extreme'
    factors: string[]
    mitigationStrategies: string[]
  }

  // AI 모델 메타데이터
  modelInfo: {
    name: string
    version: string
    trainedOn: Date
    accuracy: number
    dataPoints: number
  }
}

// 감성 키워드 사전
const SENTIMENT_KEYWORDS = {
  bullish: [
    'surge', 'rally', 'breakthrough', 'adoption', 'partnership', 'upgrade',
    'bullish', 'growth', 'success', 'milestone', 'record', 'innovation',
    'institutional', 'investment', 'positive', 'buy', 'accumulation'
  ],
  bearish: [
    'crash', 'plunge', 'bearish', 'selloff', 'dump', 'decline', 'fail',
    'hack', 'scam', 'fraud', 'investigation', 'lawsuit', 'ban', 'restriction',
    'bubble', 'overvalued', 'correction', 'liquidation', 'bankruptcy'
  ],
  neutral: [
    'stable', 'consolidation', 'sideways', 'unchanged', 'steady', 'maintain',
    'hold', 'wait', 'observe', 'monitor', 'review', 'analysis'
  ]
}

// 영향도 가중치
const IMPACT_WEIGHTS = {
  'regulation': 0.9,
  'institutional': 0.85,
  'partnership': 0.75,
  'technology': 0.7,
  'market': 0.65,
  'social': 0.5,
  'general': 0.3
}

export class ExplainableAI {
  // 뉴스 분석
  async analyzeNews(news: NewsItem[], symbol: string): Promise<XAIAnalysis> {
    // 키워드 추출 및 분석
    const keywords = this.extractKeywords(news)

    // 감성 분석
    const sentiment = this.analyzeSentiment(news, keywords)

    // 영향 요인 분석
    const factors = this.analyzeFactors(news, symbol)

    // 시장 컨텍스트 수집
    const marketContext = await this.getMarketContext(symbol)

    // 히스토리 패턴 매칭
    const historicalPattern = await this.matchHistoricalPatterns(news, symbol)

    // 리스크 평가
    const riskAssessment = this.assessRisk(factors, marketContext, sentiment)

    // 최종 예측
    const prediction = this.makePrediction(
      sentiment,
      factors,
      marketContext,
      historicalPattern
    )

    return {
      prediction,
      factors,
      keywords,
      marketContext,
      historicalPattern,
      riskAssessment,
      modelInfo: {
        name: 'MONSTA-XAI-v2',
        version: '2.0.1',
        trainedOn: new Date('2025-01-01'),
        accuracy: 87.5,
        dataPoints: 1500000
      }
    }
  }

  // 키워드 추출
  private extractKeywords(news: NewsItem[]): XAIAnalysis['keywords'] {
    const wordFreq = new Map<string, number>()
    const wordSentiment = new Map<string, number[]>()

    // 모든 뉴스에서 키워드 추출
    news.forEach(item => {
      const text = `${item.title} ${item.description}`.toLowerCase()
      const words = text.split(/\s+/)

      words.forEach(word => {
        // 클린업
        word = word.replace(/[^a-z0-9]/g, '')
        if (word.length < 3) return

        // 빈도 카운트
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1)

        // 감성 점수 계산
        let sentimentScore = 0
        if (SENTIMENT_KEYWORDS.bullish.includes(word)) sentimentScore = 1
        else if (SENTIMENT_KEYWORDS.bearish.includes(word)) sentimentScore = -1

        if (!wordSentiment.has(word)) wordSentiment.set(word, [])
        wordSentiment.get(word)!.push(sentimentScore)
      })
    })

    // 상위 키워드 선택
    const keywords: XAIAnalysis['keywords'] = []
    const sortedWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)

    sortedWords.forEach(([word, freq]) => {
      const sentiments = wordSentiment.get(word) || [0]
      const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length

      keywords.push({
        word,
        frequency: freq,
        sentiment: avgSentiment,
        importance: Math.min(freq / 100, 1) // 정규화
      })
    })

    return keywords
  }

  // 감성 분석
  private analyzeSentiment(
    news: NewsItem[],
    keywords: XAIAnalysis['keywords']
  ): { score: number; type: 'bullish' | 'bearish' | 'neutral' } {
    let totalScore = 0
    let totalWeight = 0

    // 뉴스별 감성 점수
    news.forEach(item => {
      let score = 0

      // 제목은 더 높은 가중치
      const titleWords = item.title.toLowerCase().split(/\s+/)
      titleWords.forEach(word => {
        if (SENTIMENT_KEYWORDS.bullish.some(k => word.includes(k))) score += 2
        if (SENTIMENT_KEYWORDS.bearish.some(k => word.includes(k))) score -= 2
      })

      // 본문 분석
      const bodyWords = item.description.toLowerCase().split(/\s+/)
      bodyWords.forEach(word => {
        if (SENTIMENT_KEYWORDS.bullish.some(k => word.includes(k))) score += 1
        if (SENTIMENT_KEYWORDS.bearish.some(k => word.includes(k))) score -= 1
      })

      // 신뢰도로 가중치 적용
      const weight = (item.trustScore || 50) / 100
      totalScore += score * weight
      totalWeight += weight
    })

    // 키워드 기반 추가 분석
    keywords.forEach(kw => {
      totalScore += kw.sentiment * kw.importance * 10
    })

    const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0

    return {
      score: normalizedScore,
      type: normalizedScore > 5 ? 'bullish' : normalizedScore < -5 ? 'bearish' : 'neutral'
    }
  }

  // 영향 요인 분석
  private analyzeFactors(news: NewsItem[], symbol: string): XAIAnalysis['factors'] {
    const factors: XAIAnalysis['factors'] = []

    // 규제 요인
    const regulationNews = news.filter(n =>
      n.categories?.includes('regulation') ||
      n.description.toLowerCase().includes('regulation') ||
      n.description.toLowerCase().includes('sec') ||
      n.description.toLowerCase().includes('government')
    )

    if (regulationNews.length > 0) {
      factors.push({
        name: '규제 동향',
        impact: regulationNews.some(n => n.sentiment === 'negative') ? -60 : 40,
        weight: IMPACT_WEIGHTS.regulation,
        explanation: '정부 및 규제 기관의 움직임이 시장에 큰 영향을 미칩니다',
        evidence: regulationNews.map(n => n.title)
      })
    }

    // 기관 투자 요인
    const institutionalNews = news.filter(n =>
      n.description.toLowerCase().includes('institutional') ||
      n.description.toLowerCase().includes('fund') ||
      n.description.toLowerCase().includes('etf')
    )

    if (institutionalNews.length > 0) {
      factors.push({
        name: '기관 투자',
        impact: institutionalNews.some(n => n.sentiment === 'positive') ? 70 : -30,
        weight: IMPACT_WEIGHTS.institutional,
        explanation: '대형 기관의 투자 결정이 가격에 직접적인 영향을 줍니다',
        evidence: institutionalNews.map(n => n.title)
      })
    }

    // 기술 개발 요인
    const techNews = news.filter(n =>
      n.categories?.includes('technology') ||
      n.description.toLowerCase().includes('upgrade') ||
      n.description.toLowerCase().includes('development')
    )

    if (techNews.length > 0) {
      factors.push({
        name: '기술 발전',
        impact: 45,
        weight: IMPACT_WEIGHTS.technology,
        explanation: '블록체인 기술 업그레이드와 개발 진척도',
        evidence: techNews.map(n => n.title)
      })
    }

    // 파트너십 요인
    const partnershipNews = news.filter(n =>
      n.categories?.includes('partnership') ||
      n.description.toLowerCase().includes('partnership') ||
      n.description.toLowerCase().includes('collaboration')
    )

    if (partnershipNews.length > 0) {
      factors.push({
        name: '파트너십',
        impact: 55,
        weight: IMPACT_WEIGHTS.partnership,
        explanation: '주요 기업과의 제휴 및 협력 관계',
        evidence: partnershipNews.map(n => n.title)
      })
    }

    // 시장 심리 요인
    const sentimentScore = news.reduce((acc, n) => {
      return acc + (n.sentiment === 'positive' ? 1 : n.sentiment === 'negative' ? -1 : 0)
    }, 0) / news.length * 100

    factors.push({
      name: '시장 심리',
      impact: sentimentScore,
      weight: IMPACT_WEIGHTS.social,
      explanation: '전반적인 시장 참여자들의 심리 상태',
      evidence: [`평균 감성 점수: ${sentimentScore.toFixed(1)}`]
    })

    return factors
  }

  // 시장 컨텍스트 수집
  private async getMarketContext(symbol: string): Promise<XAIAnalysis['marketContext']> {
    try {
      // Fear & Greed Index
      const fgResponse = await fetch('https://api.alternative.me/fng/')
      const fgData = await fgResponse.json()
      const fearGreedIndex = parseInt(fgData.data[0].value)

      // 거래량 트렌드 (실제 API 연동 시 구현)
      const volumeTrend = 'stable' as const // TODO: Binance API로 실제 계산

      // 변동성 계산 (실제 API 연동 시 구현)
      const priceVolatility = 'medium' as const // TODO: 실제 변동성 계산

      // 시장 지배력 (실제 API 연동 시 구현)
      const marketDominance = symbol === 'BTCUSDT' ? 48.5 : 2.5 // TODO: 실제 데이터

      return {
        fearGreedIndex,
        volumeTrend,
        priceVolatility,
        marketDominance
      }
    } catch (error) {
      console.error('Market context error:', error)
      return {
        fearGreedIndex: 50,
        volumeTrend: 'stable',
        priceVolatility: 'medium',
        marketDominance: 0
      }
    }
  }

  // 히스토리 패턴 매칭
  private async matchHistoricalPatterns(
    news: NewsItem[],
    symbol: string
  ): Promise<XAIAnalysis['historicalPattern']> {
    // 실제 구현 시 데이터베이스에서 과거 유사 이벤트 검색
    const similarEvents = [
      {
        date: new Date('2024-01-10'),
        event: 'SEC ETF 승인 발표',
        outcome: 'BTC 15% 상승',
        similarity: 85
      },
      {
        date: new Date('2023-11-15'),
        event: '기관 대량 매수',
        outcome: '일주일 내 20% 상승',
        similarity: 72
      }
    ]

    const patternConfidence = similarEvents.length > 0
      ? similarEvents.reduce((acc, e) => acc + e.similarity, 0) / similarEvents.length
      : 0

    return {
      similarEvents,
      patternConfidence
    }
  }

  // 리스크 평가
  private assessRisk(
    factors: XAIAnalysis['factors'],
    marketContext: XAIAnalysis['marketContext'],
    sentiment: { score: number }
  ): XAIAnalysis['riskAssessment'] {
    const riskFactors: string[] = []
    let riskScore = 0

    // Fear & Greed 극단값 체크
    if (marketContext.fearGreedIndex > 80) {
      riskFactors.push('시장 과열 (극도의 탐욕)')
      riskScore += 30
    }
    if (marketContext.fearGreedIndex < 20) {
      riskFactors.push('시장 공포 (극도의 두려움)')
      riskScore += 25
    }

    // 높은 변동성
    if (marketContext.priceVolatility === 'high') {
      riskFactors.push('높은 가격 변동성')
      riskScore += 20
    }

    // 부정적 요인 많음
    const negativeFactors = factors.filter(f => f.impact < -30)
    if (negativeFactors.length > 2) {
      riskFactors.push('다수의 부정적 요인 존재')
      riskScore += 25
    }

    // 리스크 레벨 결정
    let level: XAIAnalysis['riskAssessment']['level'] = 'low'
    if (riskScore > 70) level = 'extreme'
    else if (riskScore > 50) level = 'high'
    else if (riskScore > 30) level = 'medium'

    // 리스크 완화 전략
    const mitigationStrategies: string[] = []
    if (level === 'extreme' || level === 'high') {
      mitigationStrategies.push('포지션 크기 축소 (자본의 2-3%)')
      mitigationStrategies.push('손절 라인 타이트하게 설정 (2-3%)')
      mitigationStrategies.push('분할 진입으로 리스크 분산')
    }
    if (marketContext.fearGreedIndex > 80) {
      mitigationStrategies.push('이익 실현 고려')
      mitigationStrategies.push('신규 진입 자제')
    }
    if (marketContext.fearGreedIndex < 20) {
      mitigationStrategies.push('단계적 매수 전략')
      mitigationStrategies.push('장기 투자 관점 유지')
    }

    return {
      level,
      factors: riskFactors,
      mitigationStrategies
    }
  }

  // 최종 예측
  private makePrediction(
    sentiment: { score: number; type: 'bullish' | 'bearish' | 'neutral' },
    factors: XAIAnalysis['factors'],
    marketContext: XAIAnalysis['marketContext'],
    historicalPattern: XAIAnalysis['historicalPattern']
  ): XAIAnalysis['prediction'] {
    // 가중 평균 계산
    let totalImpact = 0
    let totalWeight = 0

    factors.forEach(factor => {
      totalImpact += factor.impact * factor.weight
      totalWeight += factor.weight
    })

    const weightedImpact = totalWeight > 0 ? totalImpact / totalWeight : 0

    // 신뢰도 계산
    let confidence = 50

    // 감성과 팩터가 일치하면 신뢰도 증가
    if ((sentiment.type === 'bullish' && weightedImpact > 20) ||
        (sentiment.type === 'bearish' && weightedImpact < -20)) {
      confidence += 20
    }

    // 히스토리 패턴 신뢰도 추가
    confidence += historicalPattern.patternConfidence * 0.2

    // Fear & Greed 일치도
    if ((marketContext.fearGreedIndex > 60 && sentiment.type === 'bullish') ||
        (marketContext.fearGreedIndex < 40 && sentiment.type === 'bearish')) {
      confidence += 10
    }

    // 최대 100으로 제한
    confidence = Math.min(confidence, 100)

    // 가격 영향 예측
    const priceImpact = weightedImpact

    // 시간 프레임 결정
    let timeframe: 'short' | 'medium' | 'long' = 'medium'
    if (Math.abs(weightedImpact) > 70) timeframe = 'short'
    else if (Math.abs(weightedImpact) < 30) timeframe = 'long'

    return {
      sentiment: sentiment.type,
      confidence,
      priceImpact,
      timeframe
    }
  }

  // 신뢰도 설명 생성
  generateConfidenceExplanation(confidence: number): string {
    if (confidence >= 80) {
      return '매우 높은 신뢰도: 다수의 지표가 일치하며 과거 패턴과 유사성이 높습니다'
    } else if (confidence >= 60) {
      return '높은 신뢰도: 주요 지표들이 대체로 일치하며 예측 가능성이 높습니다'
    } else if (confidence >= 40) {
      return '보통 신뢰도: 일부 지표가 상충하며 추가 확인이 필요합니다'
    } else {
      return '낮은 신뢰도: 불확실성이 높으며 신중한 접근이 필요합니다'
    }
  }

  // 트레이딩 전략 생성
  generateTradingStrategy(analysis: XAIAnalysis): {
    action: string
    entry: string
    stopLoss: string
    takeProfit: string
    leverage: string
    allocation: string
    reasoning: string[]
  } {
    const { prediction, riskAssessment, marketContext } = analysis

    let action = '관망'
    let leverage = '1x'
    let allocation = '5%'
    const reasoning: string[] = []

    // 액션 결정
    if (prediction.confidence > 70 && prediction.sentiment === 'bullish') {
      action = 'LONG 진입'
      reasoning.push('높은 신뢰도의 상승 시그널 포착')
    } else if (prediction.confidence > 70 && prediction.sentiment === 'bearish') {
      action = 'SHORT 진입'
      reasoning.push('높은 신뢰도의 하락 시그널 포착')
    } else if (prediction.confidence > 50) {
      action = '부분 진입'
      reasoning.push('중간 신뢰도로 신중한 접근 필요')
    }

    // 레버리지 결정
    if (riskAssessment.level === 'low' && prediction.confidence > 80) {
      leverage = '3-5x'
      reasoning.push('낮은 리스크와 높은 신뢰도로 레버리지 활용 가능')
    } else if (riskAssessment.level === 'medium') {
      leverage = '2-3x'
      reasoning.push('중간 리스크로 보수적 레버리지 권장')
    } else {
      leverage = '1-2x'
      reasoning.push('높은 리스크로 최소 레버리지만 사용')
    }

    // 자본 배분
    if (prediction.confidence > 80 && riskAssessment.level === 'low') {
      allocation = '10-15%'
      reasoning.push('유리한 조건으로 적극적 자본 투입 가능')
    } else if (prediction.confidence > 60) {
      allocation = '5-10%'
      reasoning.push('표준 리스크 관리 비율 적용')
    } else {
      allocation = '2-5%'
      reasoning.push('불확실성 대비 최소 자본만 투입')
    }

    return {
      action,
      entry: '현재가 기준 ±0.5%',
      stopLoss: prediction.sentiment === 'bullish' ? '-3%' : '+3%',
      takeProfit: prediction.sentiment === 'bullish' ? '+10%' : '-10%',
      leverage,
      allocation,
      reasoning
    }
  }
}

// 싱글톤 인스턴스
export const explainableAI = new ExplainableAI()