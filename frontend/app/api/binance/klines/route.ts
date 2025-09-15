import { NextRequest, NextResponse } from 'next/server'

// 기본 가격 설정
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    const interval = searchParams.get('interval') || '1m'
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000)

    // Binance API 직접 호출
    const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`

    // Binance API 직접 호출
    const response = await fetch(binanceUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      cache: 'no-store'
    })

    let data: any

    if (!response.ok) {
      console.error('Binance API error:', response.status, response.statusText)

      // API 에러 시 빈 배열 반환 (WebSocket으로 실시간 데이터 받기)
      data = []
    } else {
      data = await response.json()
    }
    // CORS 헤더 추가
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache'
    })
    
    // 캔들 데이터를 처리된 형태로 변환
    const processedData = data?.map((candle: any[]) => ({
      time: new Date(candle[0]).toLocaleTimeString(),
      openTime: candle[0],
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5]),
      closeTime: candle[6]
    })) || []
    
    return NextResponse.json(
      {
        success: true,
        klines: processedData,
        data: data || [],
        count: processedData.length,
        timestamp: new Date().toISOString()
      },
      { 
        status: 200,
        headers
      }
    )
  } catch (error) {
    console.error('API route error:', error)
    // 에러 시에도 빈 배열 반환하여 앱이 계속 작동하도록
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache'
    })
    
    return NextResponse.json(
      {
        success: true,
        klines: [],
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      },
      { 
        status: 200,
        headers
      }
    )
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