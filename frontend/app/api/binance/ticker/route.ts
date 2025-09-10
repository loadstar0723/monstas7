import { NextRequest, NextResponse } from "next/server"

export async function OPTIONS(request: NextRequest) {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  })
  
  return new NextResponse(null, { status: 200, headers })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol") || "BTCUSDT"
    
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 }
      }
    )
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    })
    
    return NextResponse.json(data, { headers })
  } catch (error) {
    console.error("Binance ticker API error:", error)
    
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    })
    
    return NextResponse.json({ 
      symbol: request.nextUrl.searchParams.get("symbol") || "BTCUSDT",
      price: "0"
    }, { status: 200, headers })
  }
}
