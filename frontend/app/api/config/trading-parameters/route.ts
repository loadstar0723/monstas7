import { NextResponse } from 'next/server'

// 실제 운영 환경에서는 DB에서 가져와야 하지만, 
// 현재는 환경변수나 설정 파일에서 가져오는 방식으로 구현
const getTradingParameters = () => {
  return {
    // 손절/익절 비율 (DB나 환경변수에서 로드)
    stopLoss: {
      scalping: parseFloat(process.env.STOPLOSS_SCALPING || '0.005'), // 0.5%
      dayTrading: parseFloat(process.env.STOPLOSS_DAY || '0.02'), // 2%
      swing: parseFloat(process.env.STOPLOSS_SWING || '0.05'), // 5%
      position: parseFloat(process.env.STOPLOSS_POSITION || '0.08') // 8%
    },
    takeProfit: {
      scalping: {
        target1: parseFloat(process.env.TP_SCALPING_1 || '0.008'), // 0.8%
        target2: parseFloat(process.env.TP_SCALPING_2 || '0.012'), // 1.2%
        target3: parseFloat(process.env.TP_SCALPING_3 || '0.02') // 2%
      },
      dayTrading: {
        target1: parseFloat(process.env.TP_DAY_1 || '0.015'), // 1.5%
        target2: parseFloat(process.env.TP_DAY_2 || '0.025'), // 2.5%
        target3: parseFloat(process.env.TP_DAY_3 || '0.04') // 4%
      },
      swing: {
        target1: parseFloat(process.env.TP_SWING_1 || '0.05'), // 5%
        target2: parseFloat(process.env.TP_SWING_2 || '0.08'), // 8%
        target3: parseFloat(process.env.TP_SWING_3 || '0.12') // 12%
      },
      position: {
        target1: parseFloat(process.env.TP_POSITION_1 || '0.08'), // 8%
        target2: parseFloat(process.env.TP_POSITION_2 || '0.15'), // 15%
        target3: parseFloat(process.env.TP_POSITION_3 || '0.25') // 25%
      }
    },
    // 예측 조정 비율
    prediction: {
      shortTermAdjustment: parseFloat(process.env.PRED_SHORT_ADJ || '0.012'), // 1.2%
      mediumTermAdjustment: parseFloat(process.env.PRED_MED_ADJ || '0.025'), // 2.5%
      longTermAdjustment: parseFloat(process.env.PRED_LONG_ADJ || '0.05'), // 5%
      weeklyAdjustment: parseFloat(process.env.PRED_WEEK_ADJ || '0.08'), // 8%
      confidenceMultiplier: parseFloat(process.env.PRED_CONF_MULT || '0.95') // 95%
    },
    // 백테스트 파라미터
    backtest: {
      rsiOversold: parseInt(process.env.RSI_OVERSOLD || '30'),
      rsiOverbought: parseInt(process.env.RSI_OVERBOUGHT || '70'),
      macdCrossoverThreshold: parseFloat(process.env.MACD_CROSS || '0.5'),
      bollingerMultiplier: parseFloat(process.env.BB_MULT || '2'),
      minimumDataPoints: parseInt(process.env.MIN_DATA || '50'),
      slippage: parseFloat(process.env.SLIPPAGE || '0.001'), // 0.1%
      tradingFee: parseFloat(process.env.TRADING_FEE || '0.001') // 0.1%
    },
    // 리스크 관리
    riskManagement: {
      maxDrawdown: parseFloat(process.env.MAX_DRAWDOWN || '0.15'), // 15%
      maxPositionSize: parseFloat(process.env.MAX_POSITION || '0.1'), // 10% of capital
      maxLeverage: {
        scalping: parseInt(process.env.MAX_LEV_SCALPING || '3'),
        dayTrading: parseInt(process.env.MAX_LEV_DAY || '5'),
        swing: parseInt(process.env.MAX_LEV_SWING || '3'),
        position: parseInt(process.env.MAX_LEV_POSITION || '2')
      },
      riskPerTrade: parseFloat(process.env.RISK_PER_TRADE || '0.02') // 2%
    },
    // 패턴 감지 임계값
    patterns: {
      doubleTopBottomThreshold: parseFloat(process.env.PATTERN_DOUBLE || '0.03'), // 3% 차이
      triangleConvergence: parseFloat(process.env.PATTERN_TRIANGLE || '0.05'), // 5%
      flagPoleMinMove: parseFloat(process.env.PATTERN_FLAG || '0.05'), // 5%
      cupHandleDepth: parseFloat(process.env.PATTERN_CUP || '0.15'), // 15%
      headShouldersSymmetry: parseFloat(process.env.PATTERN_HS || '0.02') // 2%
    },
    // 지표 임계값
    indicators: {
      adxTrendStrong: parseInt(process.env.ADX_STRONG || '25'),
      adxTrendVeryStrong: parseInt(process.env.ADX_VERY_STRONG || '40'),
      volumeSpike: parseFloat(process.env.VOLUME_SPIKE || '2'), // 2x average
      volatilityHigh: parseFloat(process.env.VOL_HIGH || '0.03'), // 3%
      momentumStrong: parseFloat(process.env.MOMENTUM_STRONG || '60')
    }
  }
}

export async function GET() {
  try {
    const parameters = getTradingParameters()
    
    return NextResponse.json({
      success: true,
      data: parameters,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching trading parameters:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trading parameters' },
      { status: 500 }
    )
  }
}

// POST 메서드로 파라미터 업데이트 (관리자용)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 실제 환경에서는 DB에 저장해야 함
    // 현재는 환경변수 업데이트 로직이 필요
    // 보안을 위해 관리자 권한 체크도 필요
    
    return NextResponse.json({
      success: true,
      message: 'Parameters updated successfully',
      data: body
    })
  } catch (error) {
    console.error('Error updating trading parameters:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update trading parameters' },
      { status: 500 }
    )
  }
}