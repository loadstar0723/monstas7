import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    const interval = searchParams.get('interval') || '1m'
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000)
    
    console.log(`Fetching klines for ${symbol}, interval: ${interval}, limit: ${limit}`)
    
    // Binance API 직접 호출
    const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    
    const response = await fetch(binanceUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('Binance API error:', response.status, response.statusText)
      // 에러 시 빈 배열 반환
      return NextResponse.json(
        {
          success: true,
          data: [],
          count: 0,
          timestamp: new Date().toISOString()
        },
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      )
    }

    const data = await response.json()
    console.log(`Successfully fetched ${data?.length || 0} klines`)
    
    // CORS 헤더 추가
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache'
    })
    
    return NextResponse.json(
      {
        success: true,
        data: data || [],
        count: data?.length || 0,
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