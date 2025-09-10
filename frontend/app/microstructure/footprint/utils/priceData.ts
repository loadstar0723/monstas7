// 초기 가격 데이터 가져오기
export async function fetchInitialPrice(symbol: string): Promise<number> {
  try {
    // Binance API에서 현재 가격 가져오기
    const response = await fetch(`/api/binance/ticker?symbol=${symbol}`)
    
    // 상태 코드와 관계없이 JSON 파싱 시도
    if (response.ok || response.status === 500) {
      try {
        const data = await response.json()
        // Binance API는 lastPrice 필드를 사용
        const price = parseFloat(data.lastPrice || data.price || '0')
        if (price > 0) {
          console.log(`[가격 조회] ${symbol}: $${price}`)
          return price
        }
      } catch (jsonError) {
        console.error('JSON 파싱 실패:', jsonError)
      }
    }
    
    // API 실패 시 기본값
    console.log(`[가격 조회] ${symbol}: API 실패, 기본값 사용`)
    return getDefaultPrice(symbol)
  } catch (error) {
    console.error('가격 조회 실패:', error)
    return getDefaultPrice(symbol)
  }
}

// 심볼별 기본 가격 (API 실패 시 사용)
export function getDefaultPrice(symbol: string): number {
  const defaults: Record<string, number> = {
    'BTCUSDT': 98000,
    'ETHUSDT': 3500,
    'BNBUSDT': 700,
    'SOLUSDT': 200,
    'XRPUSDT': 0.6,
    'ADAUSDT': 0.6,
    'DOGEUSDT': 0.1,
    'AVAXUSDT': 40,
    'MATICUSDT': 0.9,
    'DOTUSDT': 8
  }
  
  return defaults[symbol] || 100
}