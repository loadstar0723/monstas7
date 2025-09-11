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
    
    return NextResponse.json(
      {
        success: true,
        data: data || [],
        count: data?.length || 0,
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
  } catch (error) {
    console.error('API route error:', error)
    // 에러 시에도 빈 배열 반환하여 앱이 계속 작동하도록
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
}