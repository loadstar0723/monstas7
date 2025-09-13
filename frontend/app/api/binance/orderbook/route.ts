import { NextRequest, NextResponse } from 'next/server'

const BINANCE_API_BASE = 'https://api.binance.com'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    const limit = searchParams.get('limit') || '20'
    
    console.log(`Fetching orderbook for ${symbol} with limit ${limit}`)
    
    // Binance 오더북 API
    const response = await fetch(
      `${BINANCE_API_BASE}/api/v3/depth?symbol=${symbol}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        cache: 'no-store'
      }
    )
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 오더북 데이터 가공
    const processedData = {
      bids: data.bids.map((bid: string[]) => ({
        price: parseFloat(bid[0]),
        amount: parseFloat(bid[1]),
        total: parseFloat(bid[0]) * parseFloat(bid[1])
      })),
      asks: data.asks.map((ask: string[]) => ({
        price: parseFloat(ask[0]),
        amount: parseFloat(ask[1]),
        total: parseFloat(ask[0]) * parseFloat(ask[1])
      })),
      lastUpdateId: data.lastUpdateId
    }
    
    // 스프레드 계산
    const bestBid = processedData.bids[0]?.price || 0
    const bestAsk = processedData.asks[0]?.price || 0
    const spread = bestAsk - bestBid
    const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0
    
    return NextResponse.json({
      ...processedData,
      spread: spread,
      spreadPercent: spreadPercent,
      bestBid: bestBid,
      bestAsk: bestAsk
    })
  } catch (error) {
    console.error('Binance orderbook proxy error:', error)
    
    // 에러 발생 시 기본 오더북 데이터 반환 (빈 오더북)
    const defaultData = {
      bids: [],
      asks: [],
      lastUpdateId: 0,
      spread: 0,
      spreadPercent: 0,
      bestBid: 0,
      bestAsk: 0
    }
    
    return NextResponse.json(defaultData)
  }
}