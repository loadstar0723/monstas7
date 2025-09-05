import { useCallback, useRef } from 'react'

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 1000
): T {
  const lastRun = useRef(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args) => {
      const now = Date.now()
      const timeElapsed = now - lastRun.current

      if (timeElapsed >= delay) {
        callback(...args)
        lastRun.current = now
      } else {
        // 마지막 호출 보장
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          callback(...args)
          lastRun.current = Date.now()
        }, delay - timeElapsed)
      }
    }) as T,
    [callback, delay]
  )
}