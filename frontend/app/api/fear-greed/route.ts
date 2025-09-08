import { NextRequest, NextResponse } from 'next/server'

const FEAR_GREED_API = 'https://api.alternative.me/fng/'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(FEAR_GREED_API, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 } // 5분 캐시
    })
    
    if (!response.ok) {
      throw new Error(`Fear & Greed API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Alternative.me API는 data 배열로 반환
    // 첫 번째 요소가 최신 데이터
    if (data && data.data && data.data[0]) {
      return NextResponse.json({
        value: parseInt(data.data[0].value),
        classification: data.data[0].value_classification,
        timestamp: data.data[0].timestamp
      })
    }
    
    // 데이터가 없으면 중립값 반환
    return NextResponse.json({
      value: 50,
      classification: 'Neutral',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Fear & Greed proxy error:', error)
    // 에러 시 중립값 반환
    return NextResponse.json({
      value: 50,
      classification: 'Neutral',
      timestamp: new Date().toISOString()
    })
  }
}