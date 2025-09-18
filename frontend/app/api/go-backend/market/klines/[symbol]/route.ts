import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const interval = searchParams.get('interval') || '1h'
    const limit = searchParams.get('limit') || '100'

    const response = await fetch(
      `http://localhost:8092/api/v1/market/klines/${params.symbol}?interval=${interval}&limit=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch klines')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching klines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch klines' },
      { status: 500 }
    )
  }
}