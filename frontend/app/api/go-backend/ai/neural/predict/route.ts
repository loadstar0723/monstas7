import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch('http://localhost:8092/api/v1/ai/neural/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch neural prediction')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching neural prediction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch neural prediction' },
      { status: 500 }
    )
  }
}