/**
 * 모듈화 개발을 위한 유틸리티 함수들
 * 에러 격리, 독립 실행, 안정성 보장
 */

/**
 * 안전한 API 호출 래퍼
 * 에러 발생 시에도 앱이 중단되지 않음
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallbackData?: T,
  moduleName?: string
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await apiCall()
    return { data, error: null }
  } catch (error) {
    console.error(`API Error in ${moduleName || 'module'}:`, error)
    return { 
      data: fallbackData || null, 
      error: error as Error 
    }
  }
}

/**
 * WebSocket 연결 관리 (모듈별 독립)
 * 각 모듈은 자체 WebSocket 연결 사용
 */
export class ModuleWebSocket {
  private ws: WebSocket | null = null
  private moduleName: string
  private reconnectAttempts = 0
  private maxReconnects = 5
  private reconnectTimeout: NodeJS.Timeout | null = null

  constructor(moduleName: string) {
    this.moduleName = moduleName
  }

  connect(url: string, onMessage: (data: any) => void) {
    // 브라우저 환경이 아니면 연결하지 않음 (SSR 방지)
    if (typeof window === 'undefined') {
      return
    }
    
    try {
      this.ws = new WebSocket(url)
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0
      }
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage(data)
        } catch (error) {
          console.error('[' + this.moduleName + '] Message parse error:', error)
        }
      }
      
      this.ws.onerror = (error) => {
        // WebSocket 에러는 자동 재연결되므로 로그 레벨을 낮춤
        }
      
      this.ws.onclose = () => {
        this.attemptReconnect(url, onMessage)
      }
    } catch (error) {
      console.error('[' + this.moduleName + '] Connection error:', error)
    }
  }

  private attemptReconnect(url: string, onMessage: (data: any) => void) {
    if (this.reconnectAttempts < this.maxReconnects) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect(url, onMessage)
      }, delay)
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

/**
 * 모듈 상태 관리
 * 각 모듈은 독립적인 상태를 가짐
 */
export function createModuleState<T>(
  initialState: T,
  moduleName: string
) {
  const storageKey = 'monsta_module_' + moduleName
  
  // localStorage에서 이전 상태 복원
  const loadState = (): T => {
    // 브라우저 환경이 아니면 초기 상태 반환
    if (typeof window === 'undefined') {
      return initialState
    }
    
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : initialState
    } catch {
      return initialState
    }
  }
  
  // 상태를 localStorage에 저장
  const saveState = (state: T) => {
    // 브라우저 환경이 아니면 저장하지 않음
    if (typeof window === 'undefined') {
      return
    }
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch (error) {
      console.error(`[${moduleName}] State save error:`, error)
    }
  }
  
  return { loadState, saveState }
}

/**
 * 모듈 성능 모니터링
 */
export class ModulePerformance {
  private moduleName: string
  private metrics: Map<string, number[]> = new Map()

  constructor(moduleName: string) {
    this.moduleName = moduleName
  }

  startMeasure(label: string): () => void {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, [])
      }
      
      const measurements = this.metrics.get(label)!
      measurements.push(duration)
      
      // 최근 100개만 유지
      if (measurements.length > 100) {
        measurements.shift()
      }
      
      // 평균 계산
      const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length
      
      if (avg > 1000) {
        }ms`)
      }
    }
  }

  getMetrics() {
    const result: Record<string, { avg: number; count: number }> = {}
    
    this.metrics.forEach((measurements, label) => {
      const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length
      result[label] = { avg, count: measurements.length }
    })
    
    return result
  }
}

/**
 * 모듈 에러 리포팅
 */
export function reportModuleError(
  moduleName: string,
  error: Error,
  context?: Record<string, any>
) {
  const errorInfo = {
    module: moduleName,
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  }
  
  // 콘솔에 출력
  console.error(`[${moduleName}] Error Report:`, errorInfo)
  
  // 추후 에러 수집 서비스로 전송 가능
  // sendToErrorService(errorInfo)
}

/**
 * 모듈 초기화 체크
 */
export async function initializeModule(
  moduleName: string,
  checks: Array<() => Promise<boolean>>
): Promise<boolean> {
  for (const check of checks) {
    try {
      const result = await check()
      if (!result) {
        console.error(`[${moduleName}] Initialization check failed`)
        return false
      }
    } catch (error) {
      console.error(`[${moduleName}] Initialization error:`, error)
      return false
    }
  }
  
  return true
}