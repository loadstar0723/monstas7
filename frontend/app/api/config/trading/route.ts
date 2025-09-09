import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // TODO: 실제로는 데이터베이스에서 가져와야 함
    // prisma.tradingConfig.findFirst() 등을 사용
    
    // 임시로 환경변수나 기본값 반환
    const config = {
      sentiment: {
        veryPositive: parseInt(process.env.SENTIMENT_VERY_POSITIVE || '70'),
        positive: parseInt(process.env.SENTIMENT_POSITIVE || '50'),
        negative: parseInt(process.env.SENTIMENT_NEGATIVE || '40'),
        veryNegative: parseInt(process.env.SENTIMENT_VERY_NEGATIVE || '30')
      },
      mentionGrowth: {
        surge: parseInt(process.env.MENTION_SURGE || '20'),
        decline: parseInt(process.env.MENTION_DECLINE || '-20')
      },
      confidence: {
        high: parseInt(process.env.CONFIDENCE_HIGH || '80'),
        medium: parseInt(process.env.CONFIDENCE_MEDIUM || '65'),
        low: parseInt(process.env.CONFIDENCE_LOW || '50')
      },
      atrMultipliers: {
        stopLoss: parseFloat(process.env.ATR_STOP_LOSS || '1.5'),
        takeProfit1: parseFloat(process.env.ATR_TAKE_PROFIT_1 || '1'),
        takeProfit2: parseFloat(process.env.ATR_TAKE_PROFIT_2 || '2'),
        takeProfit3: parseFloat(process.env.ATR_TAKE_PROFIT_3 || '3')
      },
      influencers: {
        minBullish: parseInt(process.env.MIN_BULLISH_INFLUENCERS || '2')
      }
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('트레이딩 설정 API 에러:', error)
    return NextResponse.json(
      { error: '트레이딩 설정을 불러올 수 없습니다' },
      { status: 500 }
    )
  }
}