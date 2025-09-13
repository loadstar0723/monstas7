import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message, type } = await request.json()

    // 환경 변수 확인
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return NextResponse.json(
        { error: '이메일 설정이 완료되지 않았습니다.' },
        { status: 500 }
      )
    }

    // nodemailer 동적 import
    const nodemailer = (await import('nodemailer')).default
    
    // 이메일 전송 설정
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // HTML 이메일 템플릿 생성
    const htmlContent = createEmailTemplate(message, type)

    // 이메일 발송
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `MONSTA Trading <${process.env.EMAIL_USER}>`,
      to: to || process.env.EMAIL_USER, // 받는 사람이 없으면 본인에게
      subject: subject || '💰 MONSTA Trading 알림',
      html: htmlContent,
      text: convertHtmlToText(htmlContent), // 텍스트 버전
    })

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    })
  } catch (error) {
    console.error('이메일 발송 오류:', error)
    return NextResponse.json(
      { error: '이메일 발송 중 오류가 발생했습니다.', details: error },
      { status: 500 }
    )
  }
}

// 이메일 HTML 템플릿 생성
function createEmailTemplate(message: any, type?: string): string {
  const baseStyles = `
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
      .container { max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
      .alert-box { background: #f0f0f0; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
      .price { font-size: 28px; font-weight: bold; color: #333; }
      .label { color: #666; font-size: 14px; margin-bottom: 5px; }
      .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
      .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      .success { color: #28a745; }
      .danger { color: #dc3545; }
      .warning { color: #ffc107; }
    </style>
  `

  if (typeof message === 'string') {
    return `
      ${baseStyles}
      <div class="container">
        <div class="header">
          <h1>🚀 MONSTA Trading</h1>
        </div>
        <div class="content">
          <p>${message}</p>
        </div>
        <div class="footer">
          <p>© 2025 MONSTA Trading - AI-Powered Trading Platform</p>
        </div>
      </div>
    `
  }

  switch (type || message.type) {
    case 'price_alert':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>💰 가격 알림</h1>
            <p>설정하신 가격 조건이 충족되었습니다</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <div class="label">암호화폐</div>
              <div class="price">${message.symbol}/USDT</div>
            </div>
            
            <table style="width: 100%; margin: 20px 0;">
              <tr>
                <td style="padding: 10px;">
                  <div class="label">현재가</div>
                  <div style="font-size: 20px; font-weight: bold;">$${message.currentPrice?.toLocaleString() || 'N/A'}</div>
                </td>
                <td style="padding: 10px;">
                  <div class="label">목표가</div>
                  <div style="font-size: 20px; font-weight: bold;">${message.targetPrice ? `$${message.targetPrice.toLocaleString()}` : 'N/A'}</div>
                </td>
              </tr>
              ${message.change ? `
              <tr>
                <td colspan="2" style="padding: 10px;">
                  <div class="label">24시간 변동률</div>
                  <div style="font-size: 20px; font-weight: bold;" class="${message.change > 0 ? 'success' : 'danger'}">
                    ${message.change > 0 ? '+' : ''}${message.change.toFixed(2)}%
                  </div>
                </td>
              </tr>
              ` : ''}
            </table>
            
            <div style="text-align: center;">
              <a href="http://localhost:3018/signals/whale-tracker" class="button">차트 확인하기</a>
            </div>
            
            <div class="alert-box" style="background: #fff3cd; border-color: #ffc107;">
              <strong>⚠️ 투자 주의사항</strong><br>
              암호화폐는 변동성이 높은 자산입니다. 투자 결정은 신중하게 내리시기 바랍니다.
            </div>
          </div>
          <div class="footer">
            <p>이 알림은 MONSTA Trading 플랫폼에서 발송되었습니다.</p>
            <p>알림 설정을 변경하려면 웹사이트를 방문해주세요.</p>
          </div>
        </div>
      `

    case 'whale_alert':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>🐋 고래 활동 감지</h1>
            <p>대규모 거래가 포착되었습니다</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <div class="label">암호화폐</div>
              <div class="price">${message.symbol}/USDT</div>
            </div>
            
            <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <div class="label">거래 규모</div>
              <div class="price" style="color: #2e7d32;">$${(message.amount / 1000000).toFixed(2)}M</div>
              <div style="margin-top: 10px; font-size: 16px;">
                ${message.side === 'buy' ? '📈 대규모 매수 감지' : '📉 대규모 매도 감지'}
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              고래의 움직임은 시장에 큰 영향을 미칠 수 있습니다. 
              추세 변화에 주의하시기 바랍니다.
            </p>
            
            <div style="text-align: center;">
              <a href="http://localhost:3018/signals/whale-tracker" class="button">고래 추적 시스템 보기</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 MONSTA Trading - Whale Tracking System</p>
          </div>
        </div>
      `

    case 'volume_alert':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>📊 거래량 급증</h1>
            <p>비정상적인 거래 활동이 감지되었습니다</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <div class="label">암호화폐</div>
              <div class="price">${message.symbol}/USDT</div>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <div class="label">거래량 증가율</div>
              <div class="price" style="color: #ff6b6b;">+${message.volumeIncrease}%</div>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              거래량 급증은 가격 변동성 증가의 신호일 수 있습니다.
              리스크 관리에 유의하시기 바랍니다.
            </p>
            
            <div style="text-align: center;">
              <a href="http://localhost:3018/signals/whale-tracker" class="button">실시간 차트 보기</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 MONSTA Trading</p>
          </div>
        </div>
      `

    default:
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>📢 MONSTA Trading 알림</h1>
          </div>
          <div class="content">
            <pre>${JSON.stringify(message, null, 2)}</pre>
          </div>
          <div class="footer">
            <p>© 2025 MONSTA Trading</p>
          </div>
        </div>
      `
  }
}

// HTML을 텍스트로 변환 (이메일 텍스트 버전용)
function convertHtmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// 이메일 설정 확인 (GET)
export async function GET() {
  try {
    const isConfigured = !!(
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASSWORD &&
      process.env.EMAIL_HOST
    )

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: '이메일 설정이 완료되지 않았습니다. .env.local 파일을 확인해주세요.',
      })
    }

    // 이메일 연결 테스트
    await transporter.verify()

    return NextResponse.json({
      success: true,
      configured: true,
      email: process.env.EMAIL_USER,
      host: process.env.EMAIL_HOST,
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        configured: false,
        error: '이메일 서버 연결 실패',
        details: error 
      },
      { status: 500 }
    )
  }
}