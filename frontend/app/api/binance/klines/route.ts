import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const interval = searchParams.get('interval')
  const limit = searchParams.get('limit') || '100'
  const startTime = searchParams.get('startTime')
  const endTime = searchParams.get('endTime')

  if (!symbol || !interval) {
    return NextResponse.json(
      { error: 'Symbol and interval are required' },
      { status: 400 }
    )
  }

  try {
    let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    
    if (startTime) {
      url += `&startTime=${startTime}`
    }
    
    if (endTime) {
      url += `&endTime=${endTime}`
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }

    const data = await response.json()
    
    // CORS 헤더 추가
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    
    return NextResponse.json(data, { headers })
  } catch (error: any) {
    console.error('Binance API error:', error)
    
    // Rate limit 에러 처리
    if (error.message?.includes('429') || error.message?.includes('banned')) {
      console.log('Binance API rate limit exceeded - using alternative API')
      
      // 대체 API 사용 (CoinGecko)
      try {
        const coinId = getCoinGeckoId(symbol)
        const days = getIntervalDays(interval)
        const geckoUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
        
        const geckoResponse = await fetch(geckoUrl)
        if (geckoResponse.ok) {
          const geckoData = await geckoResponse.json()
          // CoinGecko 데이터를 Binance 형식으로 변환
          const klines = geckoData.map((candle: number[]) => [
            candle[0], // timestamp
            candle[1].toString(), // open
            candle[2].toString(), // high
            candle[3].toString(), // low
            candle[4].toString(), // close
            '0', // volume (CoinGecko doesn't provide volume in OHLC)
            candle[0] + getIntervalMilliseconds(interval), // close time
            '0', // quote volume
            0, // trades
            '0', // taker buy base
            '0', // taker buy quote
            '0' // ignore
          ])
          
          const headers = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          })
          
          return NextResponse.json(klines, { headers })
        }
      } catch (geckoError) {
        console.error('CoinGecko API error:', geckoError)
      }
    }
    
    // 에러 발생 시 개발용 시뮬레이션 데이터 생성
    console.log(`Binance klines API 실패 - ${symbol} ${interval} - 개발용 시뮬레이션 데이터 생성`)
    
    // 개발 환경에서만 시뮬레이션 데이터 생성
    if (process.env.NODE_ENV === 'development') {
      const basePrice = getDefaultKlinePrice(symbol)
      const intervalMs = getIntervalMilliseconds(interval)
      const now = Date.now()
      const klineCount = parseInt(limit)
      
      const simulatedKlines = []
      for (let i = klineCount - 1; i >= 0; i--) {
        const timestamp = now - (i * intervalMs)
        const randomVariation = 0.98 + Math.random() * 0.04 // ±2% 변동
        const open = basePrice * randomVariation
        const close = basePrice * (0.98 + Math.random() * 0.04)
        const high = Math.max(open, close) * (1 + Math.random() * 0.01)
        const low = Math.min(open, close) * (1 - Math.random() * 0.01)
        const volume = (1000 + Math.random() * 9000).toFixed(2)
        
        simulatedKlines.push([
          timestamp,
          open.toFixed(2),
          high.toFixed(2),
          low.toFixed(2),
          close.toFixed(2),
          volume,
          timestamp + intervalMs - 1,
          (parseFloat(volume) * close).toFixed(2),
          Math.floor(100 + Math.random() * 900),
          (parseFloat(volume) * 0.5).toFixed(2),
          (parseFloat(volume) * close * 0.5).toFixed(2),
          '0'
        ])
      }
      
      const headers = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      })
      
      return NextResponse.json(simulatedKlines, { headers })
    }
    
    const defaultKlines = [] // 프로덕션에서는 빈 배열
    
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    
    return NextResponse.json(defaultKlines, { status: 200, headers })
  }
}

// 인터벌을 밀리초로 변환
function getIntervalMilliseconds(interval: string): number {
  const units: Record<string, number> = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    M: 30 * 24 * 60 * 60 * 1000
  }
  
  const match = interval.match(/^(\d+)([mhdwM])$/)
  if (!match) return 5 * 60 * 1000 // 기본 5분
  
  const [, num, unit] = match
  return parseInt(num) * (units[unit] || units.m)
}

// 심볼별 기본 가격
function getDefaultKlinePrice(symbol: string): number {
  const prices: Record<string, number> = {
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
  return prices[symbol] || 100
}

// CoinGecko 코인 ID 매핑
function getCoinGeckoId(symbol: string): string {
  const mapping: Record<string, string> = {
    'BTCUSDT': 'bitcoin',
    'ETHUSDT': 'ethereum',
    'BNBUSDT': 'binancecoin',
    'SOLUSDT': 'solana',
    'XRPUSDT': 'ripple',
    'ADAUSDT': 'cardano',
    'DOGEUSDT': 'dogecoin',
    'AVAXUSDT': 'avalanche-2',
    'MATICUSDT': 'matic-network',
    'DOTUSDT': 'polkadot'
  }
  return mapping[symbol] || 'bitcoin'
}

// 인터벌을 일수로 변환
function getIntervalDays(interval: string): number {
  const mapping: Record<string, number> = {
    '1h': 1,
    '4h': 1,
    '1d': 7,
    '1w': 30
  }
  return mapping[interval] || 7
}