import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols')
    
    const response = await fetch(`${BACKEND_URL}/api/v1/ai/predictions/batch?symbols=${symbols}`, {
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
    console.error('AI predictions API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI predictions' },
      { status: 500 }
    )
  }
}