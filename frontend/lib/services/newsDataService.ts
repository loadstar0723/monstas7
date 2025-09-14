/**
 * 뉴스 데이터 서비스 - 데이터 정제 파이프라인
 * 중복 제거, 신뢰도 스코어링, Fallback API 체인
 */

import NodeCache from 'node-cache'

// 캐시 설정 (30초 TTL)
const cache = new NodeCache({ stdTTL: 30, checkperiod: 10 })

// 신뢰도 높은 뉴스 소스
const TRUSTED_SOURCES = {
  'coindesk.com': 95,
  'cointelegraph.com': 90,
  'bloomberg.com': 95,
  'reuters.com': 98,
  'theblock.co': 85,
  'decrypt.co': 80,
  'messari.io': 90,
  'glassnode.com': 92,
  'cryptoquant.com': 88,
  'santiment.net': 85
}

// 뉴스 타입 정의
export interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  source: string
  publishedAt: Date
  imageUrl?: string
  categories: string[]
  relatedCoins: string[]
  sentiment?: 'positive' | 'negative' | 'neutral'
  trustScore?: number
  importance?: 'high' | 'medium' | 'low'
  aiSummary?: string
  confidence?: number
}

// 유사도 계산 (Cosine Similarity)
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)

  const uniqueWords = Array.from(new Set([...words1, ...words2]))

  const vector1 = uniqueWords.map(word => words1.filter(w => w === word).length)
  const vector2 = uniqueWords.map(word => words2.filter(w => w === word).length)

  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0)
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0))
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0))

  if (magnitude1 === 0 || magnitude2 === 0) return 0

  return dotProduct / (magnitude1 * magnitude2)
}

// 신뢰도 점수 계산
function calculateTrustScore(source: string, content: string): number {
  const domain = new URL(source).hostname.replace('www.', '')
  let score = TRUSTED_SOURCES[domain] || 50

  // 내용 길이에 따른 보정
  if (content.length > 500) score += 5
  if (content.length > 1000) score += 5

  // 출처 명시 여부
  if (content.includes('according to') || content.includes('reported by')) score += 3

  return Math.min(100, score)
}

// 중복 제거 (85% 이상 유사도)
function removeDuplicates(news: NewsItem[]): NewsItem[] {
  const filtered: NewsItem[] = []

  for (const item of news) {
    const isDuplicate = filtered.some(existing => {
      const similarity = calculateSimilarity(
        existing.title + ' ' + existing.description,
        item.title + ' ' + item.description
      )
      return similarity > 0.85
    })

    if (!isDuplicate) {
      filtered.push(item)
    }
  }

  return filtered
}

// API 체인 관리
class APIChain {
  private apis = [
    { name: 'cryptocompare', url: process.env.CRYPTOCOMPARE_BASE_URL, key: process.env.CRYPTOCOMPARE_API_KEY },
    { name: 'coinmarketcap', url: 'https://pro-api.coinmarketcap.com', key: process.env.CMC_API_KEY },
    { name: 'messari', url: 'https://data.messari.io', key: process.env.MESSARI_API_KEY }
  ]

  private currentIndex = 0

  async fetchWithFallback(endpoint: string): Promise<any> {
    for (let i = 0; i < this.apis.length; i++) {
      const api = this.apis[(this.currentIndex + i) % this.apis.length]

      try {
        const response = await fetch(`${api.url}${endpoint}`, {
          headers: api.key ? { 'Authorization': `Bearer ${api.key}` } : {}
        })

        if (response.ok) {
          return await response.json()
        }
      } catch (error) {
        console.error(`API ${api.name} failed:`, error)
      }
    }

    // 모든 API 실패 시
    throw new Error('All APIs failed')
  }
}

const apiChain = new APIChain()

// 메인 뉴스 서비스
export class NewsDataService {
  // 뉴스 가져오기
  async getNews(coins: string[] = [], category?: string): Promise<NewsItem[]> {
    const cacheKey = `news_${coins.join('_')}_${category || 'all'}`
    const cached = cache.get<NewsItem[]>(cacheKey)

    if (cached) {
      return cached
    }

    try {
      // CryptoCompare 뉴스 API
      const newsData = await this.fetchFromCryptoCompare(coins, category)

      // 중복 제거
      const uniqueNews = removeDuplicates(newsData)

      // 신뢰도 점수 추가
      const scoredNews = uniqueNews.map(item => ({
        ...item,
        trustScore: calculateTrustScore(item.source, item.description)
      }))

      // 중요도 기준 정렬
      const sortedNews = scoredNews.sort((a, b) => {
        const importanceOrder = { high: 3, medium: 2, low: 1 }
        return (importanceOrder[b.importance || 'low'] - importanceOrder[a.importance || 'low']) ||
               (b.trustScore || 0) - (a.trustScore || 0)
      })

      cache.set(cacheKey, sortedNews)
      return sortedNews

    } catch (error) {
      console.error('Failed to fetch news:', error)

      // Fallback 처리
      return this.getFallbackNews()
    }
  }

  // CryptoCompare API 호출
  private async fetchFromCryptoCompare(coins: string[], category?: string): Promise<NewsItem[]> {
    const params = new URLSearchParams()
    if (coins.length > 0) {
      params.append('categories', coins.join(','))
    }
    if (category) {
      params.append('excludeCategories', category)
    }

    const response = await fetch(
      `https://min-api.cryptocompare.com/data/v2/news/?${params}`,
      {
        headers: {
          'Authorization': `Apikey ${process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('CryptoCompare API failed')
    }

    const data = await response.json()

    return data.Data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.body.substring(0, 500),
      url: item.url,
      source: item.source_info.name,
      publishedAt: new Date(item.published_on * 1000),
      imageUrl: item.imageurl,
      categories: item.categories?.split('|') || [],
      relatedCoins: this.extractCoins(item.title + ' ' + item.body),
      sentiment: this.analyzeSentiment(item.body),
      importance: this.calculateImportance(item)
    }))
  }

  // 코인 추출
  private extractCoins(text: string): string[] {
    const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'DOT']
    const found: string[] = []

    for (const coin of coins) {
      if (text.toUpperCase().includes(coin)) {
        found.push(coin)
      }
    }

    return found
  }

  // 감성 분석 (간단한 키워드 기반)
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positive = ['bullish', 'surge', 'rally', 'gain', 'rise', 'up', 'high', 'breakthrough', 'success']
    const negative = ['bearish', 'crash', 'fall', 'drop', 'down', 'low', 'fail', 'hack', 'scam']

    const lowerText = text.toLowerCase()
    const positiveCount = positive.filter(word => lowerText.includes(word)).length
    const negativeCount = negative.filter(word => lowerText.includes(word)).length

    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  // 중요도 계산
  private calculateImportance(item: any): 'high' | 'medium' | 'low' {
    // 카테고리 수, 소스 신뢰도, 내용 길이 등을 고려
    const categoryCount = item.categories?.split('|').length || 0
    const contentLength = item.body?.length || 0

    if (categoryCount > 3 || contentLength > 1000) return 'high'
    if (categoryCount > 1 || contentLength > 500) return 'medium'
    return 'low'
  }

  // Fallback 뉴스 (캐시된 데이터 또는 기본값)
  private getFallbackNews(): NewsItem[] {
    // 캐시에서 가장 최근 데이터 찾기
    const keys = cache.keys()
    for (const key of keys) {
      if (key.startsWith('news_')) {
        const data = cache.get<NewsItem[]>(key)
        if (data) return data
      }
    }

    // 기본 메시지
    return [{
      id: 'fallback',
      title: '뉴스 데이터를 불러오는 중입니다',
      description: '잠시 후 다시 시도해주세요',
      url: '#',
      source: 'System',
      publishedAt: new Date(),
      categories: [],
      relatedCoins: [],
      sentiment: 'neutral',
      trustScore: 0,
      importance: 'low'
    }]
  }

  // 실시간 뉴스 스트림 (SSE)
  streamNews(coins: string[], onUpdate: (news: NewsItem) => void): () => void {
    let eventSource: EventSource | null = null

    const connect = () => {
      eventSource = new EventSource(`/api/news/stream?coins=${coins.join(',')}`)

      eventSource.onmessage = (event) => {
        const news = JSON.parse(event.data) as NewsItem
        news.trustScore = calculateTrustScore(news.source, news.description)
        onUpdate(news)
      }

      eventSource.onerror = () => {
        eventSource?.close()
        // 5초 후 재연결
        setTimeout(connect, 5000)
      }
    }

    connect()

    // Cleanup 함수
    return () => {
      eventSource?.close()
    }
  }
}

// 싱글톤 인스턴스
export const newsDataService = new NewsDataService()