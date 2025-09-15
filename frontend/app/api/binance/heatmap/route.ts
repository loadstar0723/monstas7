import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 타임아웃 설정과 함께 fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃

    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
      cache: 'no-store' // 캐시 비활성화
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`Binance API HTTP error: ${response.status}`)
      throw new Error(`Binance API error: ${response.status}`)
    }

    const data = await response.json()

    // 데이터 검증
    if (!Array.isArray(data)) {
      console.error('Invalid data format from Binance:', typeof data)
      throw new Error('Invalid data format')
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    // 에러 로깅 개선
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Binance API timeout after 10 seconds')
      } else {
        console.error('Binance API error details:', error.message)
      }
    } else {
      console.error('Unknown Binance API error:', error)
    }

    // 폴백 데이터 또는 에러 응답
    return NextResponse.json(
      { error: 'Failed to fetch data from Binance', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}