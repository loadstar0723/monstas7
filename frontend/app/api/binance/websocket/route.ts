import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const stream = searchParams.get('stream')
  
  if (!stream) {
    return new Response('Stream parameter is required', { status: 400 })
  }

  // Server-Sent Events로 WebSocket 데이터를 스트리밍
  const encoder = new TextEncoder()
  
  const customReadable = new ReadableStream({
    async start(controller) {
      // 실제 환경에서는 WebSocket 연결을 서버에서 관리
      // 여기서는 시뮬레이션 데이터를 스트리밍
      // 초기 연결 메시지
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', stream })}\n\n`)
      )
      
      // 주기적으로 실제 거래 데이터 가져오기
      const interval = setInterval(async () => {
        try {
          // Binance API에서 최근 거래 가져오기
          const symbol = stream.split('@')[0].toUpperCase()
          const response = await fetch(
            `https://api.binance.com/api/v3/aggTrades?symbol=${symbol}&limit=5`
          )
          
          if (response.ok) {
            const trades = await response.json()
            
            // 각 거래를 SSE로 전송
            for (const trade of trades) {
              const tradeData = {
                e: 'aggTrade',
                s: symbol,
                p: trade.p,
                q: trade.q,
                m: trade.m,
                T: trade.T || Date.now()
              }
              
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(tradeData)}\n\n`)
              )
            }
          }
        } catch (error) {
          console.error('[SSE] 거래 데이터 가져오기 실패:', error)
        }
      }, 2000) // 2초마다 업데이트
      
      // 연결 종료 시 인터벌 정리
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    }
  })

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}