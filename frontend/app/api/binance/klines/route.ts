import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    const interval = searchParams.get('interval') || '1m'
    const limit = searchParams.get('limit') || '20'
    
    // Binance API 호출 - BTCUSDT로 symbol 형식 맞추기
    const fullSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`
    
    // 디버깅용 로그
    console.log('Binance API Request:', {
      originalSymbol: symbol,
      fullSymbol: fullSymbol,
      interval: interval,
      limit: limit,
      url: `https://api.binance.com/api/v3/klines?symbol=${fullSymbol}&interval=${interval}&limit=${limit}`
    })
    
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${fullSymbol}&interval=${interval}&limit=${limit}`
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Binance API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        requestedSymbol: fullSymbol
      })
      throw new Error(`Binance API error: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    
    // 데이터를 올바른 형식으로 반환
    return NextResponse.json({ 
      success: true, 
      data: data 
    })
  } catch (error) {
    console.error('Binance klines API error:', error)
    
    // 오류 시 빈 배열 반환 (가짜 데이터 사용 금지)
    return NextResponse.json({ 
      success: false, 
      data: [],
      error: 'Failed to fetch Binance data. Please try again.'
    })
  }
}