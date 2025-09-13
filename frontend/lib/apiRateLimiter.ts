// API Rate Limiter for Binance
class APIRateLimiter {
  private queue: Array<() => Promise<any>> = []
  private processing = false
  private lastCallTime = 0
  private minDelay = 100 // 최소 100ms 간격
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheExpiry = 5000 // 5초 캐시

  async throttle<T>(fn: () => Promise<T>, cacheKey?: string): Promise<T> {
    // 캐시 확인
    if (cacheKey) {
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data
      }
    }

    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // 최소 지연 시간 적용
          const now = Date.now()
          const timeSinceLastCall = now - this.lastCallTime
          if (timeSinceLastCall < this.minDelay) {
            await this.delay(this.minDelay - timeSinceLastCall)
          }
          
          this.lastCallTime = Date.now()
          const result = await fn()
          
          // 캐시 저장
          if (cacheKey) {
            this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
          }
          
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return
    
    this.processing = true
    while (this.queue.length > 0) {
      const task = this.queue.shift()
      if (task) await task()
    }
    this.processing = false
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  clearCache() {
    this.cache.clear()
  }
}

export const apiRateLimiter = new APIRateLimiter()

// Binance API 엔드포인트별 레이트 리밋
export const BINANCE_LIMITS = {
  weight: {
    limit: 1200,      // 분당 가중치 제한
    interval: 60000   // 1분
  },
  order: {
    limit: 50,        // 10초당 주문 제한
    interval: 10000   // 10초
  },
  raw: {
    limit: 6100,      // 5분당 원시 요청 제한
    interval: 300000  // 5분
  }
}

// WebSocket 우선 사용을 위한 헬퍼
export function preferWebSocket(): boolean {
  // WebSocket을 우선적으로 사용하도록 설정
  return true
}

// API 호출 전 대기 시간 계산
export function calculateDelay(weight: number = 1): number {
  // 가중치에 따른 지연 시간 계산 (ms)
  // 1200 weight/min = 20 weight/sec = 50ms per weight
  return weight * 50
}

// 레이트 리밋 에러 체크
export function isRateLimitError(error: any): boolean {
  if (!error) return false
  
  // Binance 레이트 리밋 에러 코드
  const rateLimitCodes = [-1003, -1015, -2010, -2011]
  
  if (error.code && rateLimitCodes.includes(error.code)) {
    return true
  }
  
  // HTTP 429 Too Many Requests
  if (error.status === 429 || error.statusCode === 429) {
    return true
  }
  
  // 에러 메시지에서 레이트 리밋 관련 텍스트 확인
  const message = error.message?.toLowerCase() || ''
  return message.includes('rate limit') || 
         message.includes('too many requests') ||
         message.includes('exceeded')
}

// 재시도 로직
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (!isRateLimitError(error) && i === maxRetries - 1) {
        throw error
      }
      
      // 지수 백오프: 1s, 2s, 4s...
      const delay = initialDelay * Math.pow(2, i)
      `)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}