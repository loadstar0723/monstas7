import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('API Route called: /api/binance/ticker24hr')
  
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    console.log('Requested symbol:', symbol)
    
    // Binance API에서 24시간 티커 통계 가져오기
    const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    console.log('Calling Binance API:', binanceUrl)
    
    const response = await fetch(binanceUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    console.log('Binance API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Binance API error:', errorText)
      throw new Error(`Binance API error: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log('Binance API data:', data)
    
    // 24시간 데이터 반환
    return NextResponse.json({
      success: true,
      data: {
        symbol: data.symbol,
        priceChange: parseFloat(data.priceChange),
        priceChangePercent: parseFloat(data.priceChangePercent),
        volume: parseFloat(data.volume), // 24시간 거래량 (코인)
        quoteVolume: parseFloat(data.quoteVolume), // 24시간 거래량 (USDT)
        count: parseInt(data.count), // 24시간 거래 건수
        bidPrice: parseFloat(data.bidPrice), // 현재 매수 호가
        askPrice: parseFloat(data.askPrice), // 현재 매도 호가
        lastPrice: parseFloat(data.lastPrice),
        highPrice: parseFloat(data.highPrice),
        lowPrice: parseFloat(data.lowPrice)
      }
    })
  } catch (error) {
    console.error('Binance 24hr ticker API error details:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name
    })
    
    // 에러 응답 반환
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: null
    }, { status: 500 })
  }
}