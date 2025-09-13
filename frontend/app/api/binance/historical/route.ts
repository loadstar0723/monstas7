import { NextResponse } from 'next/server'

// 단순화된 과거 데이터 가져오기
async function fetchHistoricalData(symbol: string, interval: string, limit: number) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error(`Binance API error: ${response.status} ${response.statusText}`)
      return []
    }
    
    const data = await response.json()
    
    // 데이터가 배열인지 확인
    if (!Array.isArray(data)) {
      console.error('Invalid data format from Binance API')
      return []
    }
    
    return data.map((candle: any[]) => ({
      time: candle[0],
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5])
    }))
  } catch (error) {
    console.error(`Error fetching ${interval} data:`, error)
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTCUSDT'
  const timeframe = searchParams.get('timeframe') || '1h'
  
  try {
    // 단순화: 하나의 시간대 데이터만 가져오기
    let interval = '1h'
    let limit = 500
    
    switch(timeframe) {
      case '1m':
        interval = '1m'
        limit = 500
        break
      case '5m':
        interval = '5m'
        limit = 500
        break
      case '15m':
        interval = '15m'
        limit = 500
        break
      case '1h':
        interval = '1h'
        limit = 500
        break
      case '4h':
        interval = '4h'
        limit = 500
        break
      case '1d':
        interval = '1d'
        limit = 365
        break
      case 'all':
        interval = '1h'
        limit = 720
        break
    }
    
    const historicalData = await fetchHistoricalData(symbol, interval, limit)
    
    // 현재 가격 정보 가져오기 (단순화)
    let currentPrice = 0
    let priceChange = 0
    let priceChangePercent = 0
    
    try {
      const tickerResponse = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          }
        }
      )
      
      if (tickerResponse.ok) {
        const ticker = await tickerResponse.json()
        currentPrice = parseFloat(ticker.lastPrice || '0')
        priceChange = parseFloat(ticker.priceChange || '0')
        priceChangePercent = parseFloat(ticker.priceChangePercent || '0')
      }
    } catch (e) {
      console.error('[Historical API] Ticker fetch error:', e)
    }
    
    // 단순화된 응답
    const response = {
      success: true,
      symbol,
      data: {
        [timeframe]: historicalData
      },
      ticker: {
        symbol,
        lastPrice: currentPrice,
        priceChange,
        priceChangePercent
      },
      timestamp: new Date().toISOString(),
      totalDataPoints: historicalData.length
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('[Historical API] Critical error:', error)
    
    // 에러 시에도 빈 데이터로 응답
    return NextResponse.json({
      success: true,
      symbol,
      data: {
        [timeframe]: []
      },
      ticker: {
        symbol,
        lastPrice: 0,
        priceChange: 0,
        priceChangePercent: 0
      },
      timestamp: new Date().toISOString(),
      totalDataPoints: 0
    })
  }
}