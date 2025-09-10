import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/market/analysis/${params.symbol}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API Error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Market analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market analysis' },
      { status: 500 }
    )
  }
}