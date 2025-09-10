// 성능 모니터링 Hook
import { useEffect, useRef, useState, useCallback } from 'react'

interface PerformanceMetrics {
  fps: number
  memory: number | null
  renderTime: number
  webSocketLatency: number
  dataProcessingTime: number
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: null,
    renderTime: 0,
    webSocketLatency: 0,
    dataProcessingTime: 0
  })
  
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const animationFrameId = useRef<number>()

  // FPS 측정
  const measureFPS = useCallback(() => {
    const currentTime = performance.now()
    frameCount.current++
    
    if (currentTime >= lastTime.current + 1000) {
      const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current))
      frameCount.current = 0
      lastTime.current = currentTime
      
      setMetrics(prev => ({ ...prev, fps }))
    }
    
    animationFrameId.current = requestAnimationFrame(measureFPS)
  }, [])

  // 메모리 사용량 측정
  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory
      const usedMemory = memoryInfo.usedJSHeapSize / (1024 * 1024) // MB
      setMetrics(prev => ({ ...prev, memory: Math.round(usedMemory) }))
    }
  }, [])

  // 렌더 시간 측정
  const measureRenderTime = useCallback((startTime: number) => {
    const renderTime = performance.now() - startTime
    setMetrics(prev => ({ ...prev, renderTime: Math.round(renderTime) }))
  }, [])

  // WebSocket 지연시간 측정
  const measureWebSocketLatency = useCallback((timestamp: number) => {
    const latency = Date.now() - timestamp
    setMetrics(prev => ({ ...prev, webSocketLatency: latency }))
  }, [])

  // 데이터 처리 시간 측정
  const measureDataProcessing = useCallback((callback: () => void) => {
    const startTime = performance.now()
    callback()
    const processingTime = performance.now() - startTime
    setMetrics(prev => ({ ...prev, dataProcessingTime: Math.round(processingTime) }))
  }, [])

  useEffect(() => {
    // FPS 모니터링 시작
    measureFPS()
    
    // 메모리 모니터링 (1초마다)
    const memoryInterval = setInterval(measureMemory, 1000)
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      clearInterval(memoryInterval)
    }
  }, [measureFPS, measureMemory])

  // 성능 경고 확인
  const getPerformanceWarnings = useCallback(() => {
    const warnings: string[] = []
    
    if (metrics.fps < 30) {
      warnings.push('낮은 FPS 감지: 성능 최적화가 필요합니다')
    }
    
    if (metrics.memory && metrics.memory > 500) {
      warnings.push('높은 메모리 사용량: 데이터 정리가 필요합니다')
    }
    
    if (metrics.renderTime > 16.67) { // 60fps = 16.67ms per frame
      warnings.push('렌더링 지연: UI 최적화가 필요합니다')
    }
    
    if (metrics.webSocketLatency > 100) {
      warnings.push('WebSocket 지연: 네트워크 상태를 확인하세요')
    }
    
    return warnings
  }, [metrics])

  return {
    metrics,
    measureRenderTime,
    measureWebSocketLatency,
    measureDataProcessing,
    getPerformanceWarnings
  }
}

// React DevTools Profiler 통합
export function ProfilerOnRender(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
  interactions: Set<any>
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${id} (${phase})`, {
      actualDuration: `${actualDuration.toFixed(2)}ms`,
      baseDuration: `${baseDuration.toFixed(2)}ms`,
      startTime: `${startTime.toFixed(2)}ms`,
      commitTime: `${commitTime.toFixed(2)}ms`,
      interactions: interactions.size
    })
  }
}