import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    
    // Binance API 호출
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
    
    if (!response.ok) {
      console.error('Binance API error:', response.status, response.statusText)
      // 기본값 반환
      return NextResponse.json({
        symbol: symbol,
        lastPrice: 0,
        priceChange: 0,
        priceChangePercent: 0,
        volume: 0,
        quoteVolume: 0,
        highPrice: 0,
        lowPrice: 0,
        openPrice: 0,
        prevClosePrice: 0,
        count: 0,
        openTime: Date.now(),
        closeTime: Date.now()
      })
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      symbol: data.symbol || symbol,
      lastPrice: parseFloat(data.lastPrice || '0'),
      priceChange: parseFloat(data.priceChange || '0'),
      priceChangePercent: parseFloat(data.priceChangePercent || '0'),
      volume: parseFloat(data.volume || '0'),
      quoteVolume: parseFloat(data.quoteVolume || '0'),
      highPrice: parseFloat(data.highPrice || '0'),
      lowPrice: parseFloat(data.lowPrice || '0'),
      openPrice: parseFloat(data.openPrice || '0'),
      prevClosePrice: parseFloat(data.prevClosePrice || '0'),
      count: parseInt(data.count || '0'),
      openTime: data.openTime || Date.now(),
      closeTime: data.closeTime || Date.now()
    })
    
  } catch (error) {
    console.error('Ticker API error:', error)
    // 에러 시에도 기본값 반환
    return NextResponse.json({
      symbol: 'BTCUSDT',
      lastPrice: 0,
      priceChange: 0,
      priceChangePercent: 0,
      volume: 0,
      quoteVolume: 0,
      highPrice: 0,
      lowPrice: 0,
      openPrice: 0,
      prevClosePrice: 0,
      count: 0,
      openTime: Date.now(),
      closeTime: Date.now()
    }, { status: 200 })
  }
}