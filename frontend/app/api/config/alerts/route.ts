import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // TODO: 실제로는 데이터베이스에서 가져와야 함
    // prisma.alertConfig.findMany() 등을 사용
    
    const alertConfigs = [
      { 
        id: '1', 
        type: '감성 급등', 
        condition: '>', 
        value: parseInt(process.env.ALERT_SENTIMENT_HIGH || '80'), 
        enabled: true 
      },
      { 
        id: '2', 
        type: '감성 급락', 
        condition: '<', 
        value: parseInt(process.env.ALERT_SENTIMENT_LOW || '20'), 
        enabled: true 
      },
      { 
        id: '3', 
        type: '멘션 폭증', 
        condition: '>', 
        value: parseInt(process.env.ALERT_MENTION_SURGE || '10000'), 
        enabled: false 
      },
      { 
        id: '4', 
        type: '가격 변동', 
        condition: '>', 
        value: parseInt(process.env.ALERT_PRICE_CHANGE || '5'), 
        enabled: true 
      }
    ]
    
    return NextResponse.json(alertConfigs)
  } catch (error) {
    console.error('알림 설정 API 에러:', error)
    return NextResponse.json(
      { error: '알림 설정을 불러올 수 없습니다' },
      { status: 500 }
    )
  }
}