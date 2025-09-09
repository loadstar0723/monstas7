import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // TODO: 실제로는 데이터베이스에서 가져와야 함
    
    const config = {
      sentiment: {
        veryPositive: parseInt(process.env.SIGNAL_SENTIMENT_VERY_POSITIVE || '75'),
        positive: parseInt(process.env.SIGNAL_SENTIMENT_POSITIVE || '60'),
        negative: parseInt(process.env.SIGNAL_SENTIMENT_NEGATIVE || '40'),
        veryNegative: parseInt(process.env.SIGNAL_SENTIMENT_VERY_NEGATIVE || '25')
      },
      mentionChange: {
        surge: parseInt(process.env.SIGNAL_MENTION_SURGE || '30'),
        increase: parseInt(process.env.SIGNAL_MENTION_INCREASE || '10'),
        decline: parseInt(process.env.SIGNAL_MENTION_DECLINE || '-10'),
        plunge: parseInt(process.env.SIGNAL_MENTION_PLUNGE || '-30')
      },
      confidence: {
        veryHigh: parseInt(process.env.SIGNAL_CONFIDENCE_VERY_HIGH || '85'),
        high: parseInt(process.env.SIGNAL_CONFIDENCE_HIGH || '70'),
        medium: parseInt(process.env.SIGNAL_CONFIDENCE_MEDIUM || '50'),
        low: parseInt(process.env.SIGNAL_CONFIDENCE_LOW || '30')
      },
      returns: {
        strongBuy: parseInt(process.env.SIGNAL_RETURN_STRONG_BUY || '10'),
        buy: parseInt(process.env.SIGNAL_RETURN_BUY || '5'),
        hold: parseInt(process.env.SIGNAL_RETURN_HOLD || '2'),
        sell: parseInt(process.env.SIGNAL_RETURN_SELL || '-5'),
        strongSell: parseInt(process.env.SIGNAL_RETURN_STRONG_SELL || '-10')
      },
      risk: {
        strongBuy: parseInt(process.env.SIGNAL_RISK_STRONG_BUY || '5'),
        buy: parseInt(process.env.SIGNAL_RISK_BUY || '3'),
        hold: parseInt(process.env.SIGNAL_RISK_HOLD || '2'),
        sell: parseInt(process.env.SIGNAL_RISK_SELL || '3'),
        strongSell: parseInt(process.env.SIGNAL_RISK_STRONG_SELL || '5')
      },
      trendingThreshold: parseInt(process.env.SIGNAL_TRENDING_THRESHOLD || '3')
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('신호 설정 API 에러:', error)
    return NextResponse.json(
      { error: '신호 설정을 불러올 수 없습니다' },
      { status: 500 }
    )
  }
}