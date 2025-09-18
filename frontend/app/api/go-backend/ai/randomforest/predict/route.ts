import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch('http://localhost:8092/api/v1/ai/randomforest/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch RandomForest prediction')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching RandomForest prediction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch RandomForest prediction' },
      { status: 500 }
    )
  }
}