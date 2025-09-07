import { NextRequest, NextResponse } from 'next/server'

/**
 * 알림 시스템 테스트 API
 * GET /api/notifications/test?type=telegram|email
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') || 'all'
  
  const results: any = {}
  
  // 텔레그램 테스트
  if (type === 'telegram' || type === 'all') {
    try {
      const telegramTest = await fetch(new URL('/api/notifications/telegram', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            type: 'price_alert',
            symbol: 'BTC',
            currentPrice: 67890.12,
            condition: 'above',
            targetPrice: 67000,
            change: 2.45
          }
        })
      })
      
      results.telegram = {
        status: telegramTest.ok ? 'success' : 'failed',
        response: await telegramTest.json()
      }
    } catch (error) {
      results.telegram = {
        status: 'error',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }
  
  // 이메일 테스트
  if (type === 'email' || type === 'all') {
    try {
      const emailTest = await fetch(new URL('/api/notifications/email', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: '💰 MONSTA Trading 테스트 알림',
          message: {
            type: 'price_alert',
            symbol: 'ETH',
            currentPrice: 3456.78,
            condition: 'below',
            targetPrice: 3500,
            change: -1.23
          },
          type: 'price_alert'
        })
      })
      
      results.email = {
        status: emailTest.ok ? 'success' : 'failed',
        response: await emailTest.json()
      }
    } catch (error) {
      results.email = {
        status: 'error',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }
  
  // 설정 확인
  const config = {
    telegram: {
      configured: !!process.env.TELEGRAM_BOT_TOKEN,
      hasToken: process.env.TELEGRAM_BOT_TOKEN ? '설정됨' : '미설정',
      hasChatId: process.env.TELEGRAM_CHAT_ID ? '설정됨' : '미설정'
    },
    email: {
      configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
      host: process.env.EMAIL_HOST || '미설정',
      user: process.env.EMAIL_USER ? '설정됨' : '미설정',
      password: process.env.EMAIL_PASSWORD ? '설정됨' : '미설정'
    }
  }
  
  return NextResponse.json({
    success: true,
    message: '알림 시스템 테스트 결과',
    testType: type,
    config,
    results,
    instructions: {
      telegram: '텔레그램 봇 설정: @BotFather로 봇 생성 후 토큰을 .env.local에 설정',
      email: '이메일 설정: Gmail의 경우 앱 비밀번호 생성 후 .env.local에 설정'
    }
  })
}

/**
 * 테스트 알림 전송
 */
export async function POST(request: NextRequest) {
  try {
    const { type, channel } = await request.json()
    
    if (channel === 'telegram') {
      const response = await fetch(new URL('/api/notifications/telegram', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            type: type || 'whale_alert',
            symbol: 'BTC',
            amount: 5000000,
            side: 'buy'
          }
        })
      })
      
      return NextResponse.json({
        success: response.ok,
        channel: 'telegram',
        result: await response.json()
      })
    }
    
    if (channel === 'email') {
      const response = await fetch(new URL('/api/notifications/email', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: '🐋 고래 활동 감지 테스트',
          message: {
            type: type || 'whale_alert',
            symbol: 'BTC',
            amount: 5000000,
            side: 'buy'
          },
          type: type || 'whale_alert'
        })
      })
      
      return NextResponse.json({
        success: response.ok,
        channel: 'email',
        result: await response.json()
      })
    }
    
    return NextResponse.json({
      success: false,
      error: '유효하지 않은 채널입니다. telegram 또는 email을 선택하세요.'
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
}