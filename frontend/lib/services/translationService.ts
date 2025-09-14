/**
 * Claude API를 활용한 뉴스 번역 서비스
 * 영문 뉴스를 한국어로 실시간 번역
 */

export interface TranslationResult {
  originalText: string
  translatedText: string
  language: 'en' | 'ko'
  timestamp: string
}

export class TranslationService {
  private cache = new Map<string, TranslationResult>()
  private cacheTTL = 86400000 // 24시간 캐싱

  /**
   * Claude API를 사용한 텍스트 번역
   */
  async translateWithClaude(
    text: string,
    targetLang: 'ko' | 'en' = 'ko'
  ): Promise<string> {
    // 캐시 확인
    const cacheKey = `${text.substring(0, 50)}_${targetLang}`
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - new Date(cached.timestamp).getTime() < this.cacheTTL) {
      return cached.translatedText
    }

    try {
      // Claude API 호출 (API 라우트 경유)
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLang,
          context: 'cryptocurrency news translation'
        })
      })

      if (!response.ok) {
        throw new Error('Translation API failed')
      }

      const data = await response.json()
      const translatedText = data.translatedText

      // 캐시 저장
      const result: TranslationResult = {
        originalText: text,
        translatedText,
        language: targetLang,
        timestamp: new Date().toISOString()
      }

      this.cache.set(cacheKey, result)

      return translatedText
    } catch (error) {
      console.error('Translation error:', error)
      // 번역 실패시 원문 반환
      return text
    }
  }

  /**
   * 뉴스 제목과 내용 번역
   */
  async translateNews(news: {
    title: string
    description: string
    content?: string
  }): Promise<{
    title: string
    description: string
    content?: string
    isTranslated: boolean
  }> {
    try {
      // 언어 감지 (간단한 방법)
      const isEnglish = this.isEnglishText(news.title)

      if (!isEnglish) {
        // 이미 한국어인 경우
        return {
          ...news,
          isTranslated: false
        }
      }

      // 병렬 번역 처리
      const [translatedTitle, translatedDescription, translatedContent] = await Promise.all([
        this.translateWithClaude(news.title, 'ko'),
        this.translateWithClaude(news.description, 'ko'),
        news.content ? this.translateWithClaude(news.content, 'ko') : Promise.resolve(undefined)
      ])

      return {
        title: translatedTitle,
        description: translatedDescription,
        content: translatedContent,
        isTranslated: true
      }
    } catch (error) {
      console.error('News translation error:', error)
      return {
        ...news,
        isTranslated: false
      }
    }
  }

  /**
   * 배치 번역 (여러 뉴스 동시 처리)
   */
  async translateNewsBatch(
    newsList: Array<{
      id: string
      title: string
      description: string
      content?: string
    }>
  ): Promise<Map<string, {
    title: string
    description: string
    content?: string
    isTranslated: boolean
  }>> {
    const results = new Map()

    // 배치 처리 (5개씩 병렬 처리)
    const batchSize = 5
    for (let i = 0; i < newsList.length; i += batchSize) {
      const batch = newsList.slice(i, i + batchSize)
      const translations = await Promise.all(
        batch.map(news => this.translateNews(news))
      )

      batch.forEach((news, index) => {
        results.set(news.id, translations[index])
      })
    }

    return results
  }

  /**
   * 영어 텍스트 감지
   */
  private isEnglishText(text: string): boolean {
    // 간단한 영어 감지 로직
    // 실제로는 더 정교한 언어 감지 필요
    const englishPattern = /^[A-Za-z0-9\s\.,!?;:\-'"()[\]{}]+$/
    const sample = text.substring(0, 100)

    // 영어 단어 비율 체크
    const words = sample.split(/\s+/)
    const englishWords = words.filter(word =>
      /^[A-Za-z]+$/.test(word)
    )

    return englishWords.length > words.length * 0.5
  }

  /**
   * 암호화폐 용어 사전 (전문 용어 처리)
   */
  private getCryptoGlossary(): Record<string, string> {
    return {
      'blockchain': '블록체인',
      'cryptocurrency': '암호화폐',
      'bitcoin': '비트코인',
      'ethereum': '이더리움',
      'smart contract': '스마트 컨트랙트',
      'DeFi': '디파이',
      'NFT': 'NFT',
      'mining': '채굴',
      'staking': '스테이킹',
      'whale': '고래',
      'bull market': '상승장',
      'bear market': '하락장',
      'HODL': '홀드',
      'FOMO': '포모',
      'FUD': 'FUD',
      'pump and dump': '펌프 앤 덤프',
      'market cap': '시가총액',
      'volume': '거래량',
      'liquidity': '유동성',
      'volatility': '변동성',
      'resistance': '저항선',
      'support': '지지선',
      'breakout': '돌파',
      'breakdown': '붕괴',
      'consolidation': '횡보',
      'altcoin': '알트코인',
      'mainnet': '메인넷',
      'testnet': '테스트넷',
      'gas fee': '가스비',
      'hash rate': '해시레이트',
      'halving': '반감기',
      'fork': '포크',
      'airdrop': '에어드롭',
      'ICO': 'ICO',
      'IDO': 'IDO',
      'DAO': 'DAO',
      'TVL': 'TVL',
      'APY': 'APY',
      'impermanent loss': '비영구적 손실'
    }
  }

  /**
   * 전문 용어 후처리
   */
  private postProcessTranslation(text: string): string {
    // 암호화폐 전문 용어 보정
    const glossary = this.getCryptoGlossary()
    let processed = text

    // 용어 치환
    Object.entries(glossary).forEach(([eng, kor]) => {
      const regex = new RegExp(`\\b${eng}\\b`, 'gi')
      processed = processed.replace(regex, kor)
    })

    return processed
  }

  /**
   * 캐시 정리
   */
  clearCache(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - new Date(value.timestamp).getTime() > this.cacheTTL) {
        this.cache.delete(key)
      }
    }
  }
}

// 싱글톤 인스턴스
export const translationService = new TranslationService()