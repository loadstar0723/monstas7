import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = '57f89e8ea43da615e49a75d31d9e64742063d53553dc16bb7b832a8ea359422b'
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        cache: 'no-store' // 캐시 없이 항상 최신 데이터
      }
    )

    if (!response.ok) {
      console.error('CryptoCompare API error:', response.status, response.statusText)
      // 실제 API 에러 반환
      return NextResponse.json({
        Data: [],
        Message: 'API temporarily unavailable'
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    // 에러 시 빈 데이터 반환
    return NextResponse.json({
      Data: [],
      Message: 'API error occurred'
    }, { status: 500 })
  }
}