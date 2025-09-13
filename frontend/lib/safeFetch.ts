/**
 * 안전한 fetch 래퍼 - JSON 파싱 에러 방지
 */
export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const response = await fetch(url, options)
    
    // 응답 상태 확인
    if (!response.ok) {
      return { data: null, error: new Error(`HTTP ${response.status}`) }
    }
    
    // Content-Type 확인
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return { data: null, error: new Error('Invalid response format') }
    }
    
    // JSON 파싱
    try {
      const data = await response.json()
      return { data, error: null }
    } catch (parseError) {
      console.error(`JSON 파싱 실패: ${url}`, parseError)
      return { data: null, error: parseError as Error }
    }
  } catch (error) {
    console.error(`네트워크 에러: ${url}`, error)
    return { data: null, error: error as Error }
  }
}

/**
 * 기본값과 함께 사용하는 안전한 fetch
 */
export async function safeFetchWithDefault<T>(
  url: string,
  defaultValue: T,
  options?: RequestInit
): Promise<T> {
  const { data, error } = await safeFetch<T>(url, options)
  
  if (error) {
    return defaultValue
  }
  
  return data || defaultValue
}