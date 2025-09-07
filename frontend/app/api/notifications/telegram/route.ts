import { NextRequest, NextResponse } from 'next/server'

// Telegram Bot API URL
const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, parseMode = 'HTML' } = await request.json()

    // 환경 변수 확인
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { error: '텔레그램 봇 토큰이 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // 메시지 포맷팅
    const formattedMessage = formatTelegramMessage(message)

    // 텔레그램 API 호출
    const telegramResponse = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId || process.env.TELEGRAM_CHAT_ID,
        text: formattedMessage,
        parse_mode: parseMode,
        disable_web_page_preview: false,
      }),
    })

    const result = await telegramResponse.json()

    if (!result.ok) {
      console.error('텔레그램 API 오류:', result)
      return NextResponse.json(
        { error: '텔레그램 메시지 전송 실패', details: result },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.result.message_id,
    })
  } catch (error) {
    console.error('텔레그램 알림 오류:', error)
    return NextResponse.json(
      { error: '텔레그램 알림 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 가격 알림 메시지 포맷
function formatTelegramMessage(message: any): string {
  if (typeof message === 'string') {
    return message
  }

  const { type, symbol, currentPrice, condition, targetPrice, change } = message

  switch (type) {
    case 'price_alert':
      return `
🚨 <b>가격 알림</b>

📊 <b>${symbol}/USDT</b>
💰 현재가: <b>$${currentPrice.toLocaleString()}</b>
${targetPrice ? `🎯 목표가: $${targetPrice.toLocaleString()}` : ''}
${change ? `📈 변동률: ${change > 0 ? '+' : ''}${change.toFixed(2)}%` : ''}

${getConditionEmoji(condition)} ${getConditionText(condition, targetPrice)}

<i>MONSTA Trading Alert</i>
      `.trim()

    case 'whale_alert':
      return `
🐋 <b>고래 활동 감지</b>

📊 <b>${symbol}/USDT</b>
💵 거래 규모: <b>$${(message.amount / 1000000).toFixed(2)}M</b>
${message.side === 'buy' ? '📈 대규모 매수' : '📉 대규모 매도'}

<i>MONSTA Whale Tracker</i>
      `.trim()

    case 'volume_alert':
      return `
📊 <b>거래량 급증</b>

📊 <b>${symbol}/USDT</b>
🔥 거래량: <b>+${message.volumeIncrease}%</b>
⚡ 비정상적인 거래 활동 감지

<i>MONSTA Volume Alert</i>
      `.trim()

    default:
      return JSON.stringify(message, null, 2)
  }
}

function getConditionEmoji(condition: string): string {
  switch (condition) {
    case 'above': return '📈'
    case 'below': return '📉'
    case 'percentChange': return '⚡'
    default: return '📊'
  }
}

function getConditionText(condition: string, targetPrice?: number): string {
  switch (condition) {
    case 'above':
      return `목표가 돌파! (${targetPrice ? `$${targetPrice.toLocaleString()}` : ''})`
    case 'below':
      return `지지선 하락! (${targetPrice ? `$${targetPrice.toLocaleString()}` : ''})`
    case 'percentChange':
      return '급등/급락 감지!'
    default:
      return '알림 조건 충족'
  }
}

// 텔레그램 봇 정보 확인 (GET)
export async function GET() {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { error: '텔레그램 봇 토큰이 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    const response = await fetch(`${TELEGRAM_API_URL}/getMe`)
    const result = await response.json()

    if (!result.ok) {
      return NextResponse.json(
        { error: '텔레그램 봇 정보를 가져올 수 없습니다.', details: result },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      bot: result.result,
      configured: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: '텔레그램 봇 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}