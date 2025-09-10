import { NextRequest, NextResponse } from 'next/server'

export async function OPTIONS(request: NextRequest) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  
  return new NextResponse(null, { status: 200, headers })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    const limit = searchParams.get('limit') || '20'
    
    // Binance API 호출
    const response = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`
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
    
    return NextResponse.json(data, { headers })
  } catch (error) {
    console.error('Binance depth API error:', error)
    
    // CORS 헤더 추가
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    
    // 에러 시 빈 오더북 반환 (200 상태로)
    return NextResponse.json({ 
      bids: [],
      asks: [],
      lastUpdateId: Date.now()
    }, { status: 200, headers })
  }
}