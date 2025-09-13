// WebSocket Helper - 프로덕션 환경 지원
export const createWebSocket = (url: string): WebSocket => {
  try {
    const ws = new WebSocket(url)
    
    // 연결 타임아웃 설정
    const timeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        ws.close()
      }
    }, 10000)
    
    ws.addEventListener('open', () => {
      clearTimeout(timeout)
    })
    
    return ws
  } catch (error) {
    console.error('WebSocket creation failed:', error)
    throw error
  }
}

// WebSocket 재연결 로직
export const reconnectWebSocket = (
  url: string, 
  onMessage: (data: any) => void,
  onError?: (error: Event) => void,
  retries = 5
): WebSocket | null => {
  let ws: WebSocket | null = null
  let retryCount = 0
  
  const connect = () => {
    try {
      ws = createWebSocket(url)
      
      ws.onopen = () => {
        retryCount = 0
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage(data)
        } catch (error) {
          console.error('WebSocket parse error:', error)
        }
      }
      
      ws.onerror = (error) => {
        console.error(`WebSocket error: ${url}`, error)
        onError?.(error)
      }
      
      ws.onclose = () => {
        if (retryCount < retries) {
          retryCount++
          const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)
          `)
          setTimeout(connect, delay)
        }
      }
    } catch (error) {
      console.error('WebSocket connection failed:', error)
    }
  }
  
  connect()
  return ws
}