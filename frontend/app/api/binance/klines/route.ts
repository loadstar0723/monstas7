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
      }
    )

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
    
    return NextResponse.json({ data }, { headers })
  } catch (error) {
    console.error('Binance API error:', error)
    
    // 에러 발생 시 빈 배열 반환 (프론트엔드에서 처리)
    console.log(`Binance klines API 실패 - ${symbol} ${interval}`)
    const defaultKlines = [] // 가짜 데이터 생성하지 않음
    
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    
    return NextResponse.json({ data: defaultKlines }, { status: 200, headers })
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