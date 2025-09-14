/**
 * Rate Limiter & Circuit Breaker
 * API 호출 제한 관리 및 장애 격리
 */

interface RateLimiterConfig {
  maxRequests: number
  timeWindow: number // milliseconds
  queueSize?: number
}

interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeout: number // milliseconds
  halfOpenRequests?: number
}

// Rate Limiter 클래스
export class RateLimiter {
  private requests: number[] = []
  private queue: Array<() => void> = []
  private config: RateLimiterConfig

  constructor(config: RateLimiterConfig) {
    this.config = {
      queueSize: 100,
      ...config
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // 현재 시간 윈도우 내의 요청 수 확인
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.config.timeWindow)

    if (this.requests.length < this.config.maxRequests) {
      // 즉시 실행 가능
      this.requests.push(now)
      return fn()
    }

    // 큐에 추가
    if (this.queue.length >= this.config.queueSize!) {
      throw new Error('Rate limiter queue is full')
    }

    return new Promise((resolve, reject) => {
      const executeWhenReady = async () => {
        try {
          const result = await this.execute(fn)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }

      this.queue.push(executeWhenReady)
      this.processQueue()
    })
  }

  private processQueue() {
    setTimeout(() => {
      if (this.queue.length > 0) {
        const fn = this.queue.shift()
        if (fn) fn()
      }
    }, this.config.timeWindow / this.config.maxRequests)
  }

  getStatus() {
    const now = Date.now()
    const activeRequests = this.requests.filter(time => now - time < this.config.timeWindow)

    return {
      activeRequests: activeRequests.length,
      maxRequests: this.config.maxRequests,
      queueSize: this.queue.length,
      available: activeRequests.length < this.config.maxRequests
    }
  }

  reset() {
    this.requests = []
    this.queue = []
  }
}

// Circuit Breaker 상태
enum CircuitState {
  CLOSED = 'CLOSED',     // 정상 작동
  OPEN = 'OPEN',         // 차단 상태
  HALF_OPEN = 'HALF_OPEN' // 테스트 상태
}

// Circuit Breaker 클래스
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount = 0
  private successCount = 0
  private lastFailureTime?: number
  private nextAttemptTime?: number
  private config: CircuitBreakerConfig

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      halfOpenRequests: 3,
      ...config
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // 현재 상태 확인
    this.updateState()

    if (this.state === CircuitState.OPEN) {
      throw new Error(`Circuit breaker is OPEN. Next attempt at ${new Date(this.nextAttemptTime!).toISOString()}`)
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private updateState() {
    if (this.state === CircuitState.OPEN && this.nextAttemptTime && Date.now() >= this.nextAttemptTime) {
      // OPEN -> HALF_OPEN 전환
      this.state = CircuitState.HALF_OPEN
      this.successCount = 0
      console.log('[CircuitBreaker] State changed: OPEN -> HALF_OPEN')
    }
  }

  private onSuccess() {
    this.failureCount = 0

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++

      if (this.successCount >= this.config.halfOpenRequests!) {
        // HALF_OPEN -> CLOSED 전환
        this.state = CircuitState.CLOSED
        this.successCount = 0
        console.log('[CircuitBreaker] State changed: HALF_OPEN -> CLOSED')
      }
    }
  }

  private onFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.state === CircuitState.HALF_OPEN) {
      // HALF_OPEN -> OPEN 즉시 전환
      this.openCircuit()
    } else if (this.state === CircuitState.CLOSED && this.failureCount >= this.config.failureThreshold) {
      // CLOSED -> OPEN 전환
      this.openCircuit()
    }
  }

  private openCircuit() {
    this.state = CircuitState.OPEN
    this.nextAttemptTime = Date.now() + this.config.resetTimeout
    console.log(`[CircuitBreaker] State changed: -> OPEN (failures: ${this.failureCount})`)
  }

  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    }
  }

  reset() {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.lastFailureTime = undefined
    this.nextAttemptTime = undefined
  }
}

// API 클라이언트 (Rate Limiter + Circuit Breaker 통합)
export class ResilientAPIClient {
  private rateLimiters: Map<string, RateLimiter> = new Map()
  private circuitBreakers: Map<string, CircuitBreaker> = new Map()

  constructor() {
    // API별 설정
    this.setupAPI('binance', {
      rateLimiter: { maxRequests: 1200, timeWindow: 60000 },
      circuitBreaker: { failureThreshold: 5, resetTimeout: 30000 }
    })

    this.setupAPI('cryptocompare', {
      rateLimiter: { maxRequests: 100, timeWindow: 60000 },
      circuitBreaker: { failureThreshold: 3, resetTimeout: 60000 }
    })

    this.setupAPI('coinmarketcap', {
      rateLimiter: { maxRequests: 30, timeWindow: 60000 },
      circuitBreaker: { failureThreshold: 3, resetTimeout: 60000 }
    })
  }

  private setupAPI(
    name: string,
    config: {
      rateLimiter: RateLimiterConfig
      circuitBreaker: CircuitBreakerConfig
    }
  ) {
    this.rateLimiters.set(name, new RateLimiter(config.rateLimiter))
    this.circuitBreakers.set(name, new CircuitBreaker(config.circuitBreaker))
  }

  async fetch<T>(api: string, url: string, options?: RequestInit): Promise<T> {
    const rateLimiter = this.rateLimiters.get(api)
    const circuitBreaker = this.circuitBreakers.get(api)

    if (!rateLimiter || !circuitBreaker) {
      throw new Error(`API ${api} not configured`)
    }

    // Circuit Breaker -> Rate Limiter -> Fetch
    return circuitBreaker.execute(() =>
      rateLimiter.execute(async () => {
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(10000) // 10초 타임아웃
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return response.json()
      })
    )
  }

  getStatus(api?: string) {
    if (api) {
      return {
        rateLimiter: this.rateLimiters.get(api)?.getStatus(),
        circuitBreaker: this.circuitBreakers.get(api)?.getStatus()
      }
    }

    const status: Record<string, any> = {}
    for (const [name] of this.rateLimiters) {
      status[name] = {
        rateLimiter: this.rateLimiters.get(name)?.getStatus(),
        circuitBreaker: this.circuitBreakers.get(name)?.getStatus()
      }
    }
    return status
  }

  reset(api?: string) {
    if (api) {
      this.rateLimiters.get(api)?.reset()
      this.circuitBreakers.get(api)?.reset()
    } else {
      this.rateLimiters.forEach(rl => rl.reset())
      this.circuitBreakers.forEach(cb => cb.reset())
    }
  }
}

// 싱글톤 인스턴스
export const apiClient = new ResilientAPIClient()

// Exponential Backoff 헬퍼
export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i) * (0.5 + Math.random() * 0.5) // Jitter 추가
        console.log(`[Backoff] Retry ${i + 1}/${maxRetries} after ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}