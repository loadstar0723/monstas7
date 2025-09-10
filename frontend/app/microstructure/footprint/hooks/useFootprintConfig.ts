// 풋프린트 설정을 동적으로 로드하는 Hook
import { useState, useEffect } from 'react'
import { FOOTPRINT_CONFIG, loadConfigFromAPI } from '../config/constants'

export function useFootprintConfig() {
  const [config, setConfig] = useState(FOOTPRINT_CONFIG)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadConfig = async () => {
      try {
        setIsLoading(true)
        const apiConfig = await loadConfigFromAPI()
        
        if (mounted) {
          setConfig(apiConfig)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          console.error('설정 로드 실패:', err)
          setError('설정을 불러올 수 없습니다. 기본값을 사용합니다.')
          // 에러 시 기본 설정 사용
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadConfig()

    // 5분마다 설정 재로드
    const interval = setInterval(loadConfig, 5 * 60 * 1000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return { config, isLoading, error, reload: () => location.reload() }
}