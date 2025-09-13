// 성능 모니터링 유틸리티

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 성능 측정 시작
  startMeasure(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${name}-start`)
    }
  }

  // 성능 측정 종료
  endMeasure(name: string): number {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
      
      const measure = performance.getEntriesByName(name)[0]
      if (measure) {
        const duration = measure.duration
        
        // 메트릭 저장
        if (!this.metrics.has(name)) {
          this.metrics.set(name, [])
        }
        this.metrics.get(name)?.push(duration)
        
        // 콘솔에 출력 (개발 모드에서만)
        if (process.env.NODE_ENV === 'development') {
          }ms`)
        }
        
        return duration
      }
    }
    return 0
  }

  // 평균 성능 가져오기
  getAverageMetric(name: string): number {
    const metrics = this.metrics.get(name)
    if (!metrics || metrics.length === 0) return 0
    
    const sum = metrics.reduce((a, b) => a + b, 0)
    return sum / metrics.length
  }

  // 모든 메트릭 가져오기
  getAllMetrics(): Record<string, { average: number; count: number; total: number }> {
    const result: Record<string, { average: number; count: number; total: number }> = {}
    
    this.metrics.forEach((values, key) => {
      const total = values.reduce((a, b) => a + b, 0)
      result[key] = {
        average: total / values.length,
        count: values.length,
        total
      }
    })
    
    return result
  }

  // 메트릭 초기화
  clearMetrics(): void {
    this.metrics.clear()
  }

  // Web Vitals 측정
  measureWebVitals(): void {
    if (typeof window === 'undefined') return

    // First Contentful Paint (FCP)
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          }ms`)
        }
      }
    })
    paintObserver.observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      }ms`)
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const delay = entry.processingStart - entry.startTime
        }ms`)
      }
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
          }`)
        }
      }
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  }
}

// 싱글톤 인스턴스 export
export const performanceMonitor = PerformanceMonitor.getInstance()

// React 컴포넌트 렌더링 측정 HOC
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function WrappedComponent(props: P) {
    if (typeof window !== 'undefined') {
      performanceMonitor.startMeasure(`render-${componentName}`)
      
      // useEffect로 렌더링 완료 시점 측정
      const { useEffect } = require('react')
      useEffect(() => {
        performanceMonitor.endMeasure(`render-${componentName}`)
      })
    }
    
    return Component(props)
  }
}