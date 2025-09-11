import { NextResponse } from 'next/server'

// 기술적 지표별 임계값 설정
const getIndicatorThresholds = () => {
  return {
    // RSI 임계값
    rsi: {
      extremeOversold: parseInt(process.env.RSI_EXTREME_OVERSOLD || '20'),
      oversold: parseInt(process.env.RSI_OVERSOLD || '30'),
      neutral_low: parseInt(process.env.RSI_NEUTRAL_LOW || '45'),
      neutral_high: parseInt(process.env.RSI_NEUTRAL_HIGH || '55'),
      overbought: parseInt(process.env.RSI_OVERBOUGHT || '70'),
      extremeOverbought: parseInt(process.env.RSI_EXTREME_OVERBOUGHT || '80')
    },
    // MACD 임계값
    macd: {
      strongBullishCrossover: parseFloat(process.env.MACD_STRONG_BULL || '0.5'),
      bullishCrossover: parseFloat(process.env.MACD_BULL || '0.2'),
      bearishCrossover: parseFloat(process.env.MACD_BEAR || '-0.2'),
      strongBearishCrossover: parseFloat(process.env.MACD_STRONG_BEAR || '-0.5'),
      convergenceThreshold: parseFloat(process.env.MACD_CONVERGENCE || '0.1'),
      divergenceSignificant: parseFloat(process.env.MACD_DIVERGENCE || '1.0')
    },
    // 스토캐스틱 임계값
    stochastic: {
      oversold: parseInt(process.env.STOCH_OVERSOLD || '20'),
      overbought: parseInt(process.env.STOCH_OVERBOUGHT || '80'),
      crossoverThreshold: parseFloat(process.env.STOCH_CROSS || '5')
    },
    // 볼린저 밴드 설정
    bollingerBands: {
      period: parseInt(process.env.BB_PERIOD || '20'),
      standardDeviation: parseFloat(process.env.BB_STD_DEV || '2'),
      squeezeTreshold: parseFloat(process.env.BB_SQUEEZE || '2'),
      expansionThreshold: parseFloat(process.env.BB_EXPANSION || '5'),
      percentBHigh: parseInt(process.env.BB_PERCENT_HIGH || '80'),
      percentBLow: parseInt(process.env.BB_PERCENT_LOW || '20')
    },
    // CCI 임계값
    cci: {
      oversold: parseInt(process.env.CCI_OVERSOLD || '-100'),
      overbought: parseInt(process.env.CCI_OVERBOUGHT || '100'),
      extremeOversold: parseInt(process.env.CCI_EXTREME_OS || '-200'),
      extremeOverbought: parseInt(process.env.CCI_EXTREME_OB || '200')
    },
    // Williams %R 임계값
    williamsR: {
      oversold: parseInt(process.env.WILLIAMS_OVERSOLD || '-80'),
      overbought: parseInt(process.env.WILLIAMS_OVERBOUGHT || '-20'),
      midpoint: parseInt(process.env.WILLIAMS_MID || '-50')
    },
    // MFI (Money Flow Index) 임계값
    mfi: {
      oversold: parseInt(process.env.MFI_OVERSOLD || '20'),
      weakBuy: parseInt(process.env.MFI_WEAK_BUY || '30'),
      neutral: parseInt(process.env.MFI_NEUTRAL || '50'),
      weakSell: parseInt(process.env.MFI_WEAK_SELL || '70'),
      overbought: parseInt(process.env.MFI_OVERBOUGHT || '80')
    },
    // ADX 임계값
    adx: {
      noTrend: parseInt(process.env.ADX_NO_TREND || '20'),
      weakTrend: parseInt(process.env.ADX_WEAK || '25'),
      strongTrend: parseInt(process.env.ADX_STRONG || '40'),
      veryStrongTrend: parseInt(process.env.ADX_VERY_STRONG || '50'),
      extremelyStrong: parseInt(process.env.ADX_EXTREME || '70')
    },
    // ATR 변동성 레벨
    atr: {
      lowVolatility: parseFloat(process.env.ATR_LOW || '0.5'),
      normalVolatility: parseFloat(process.env.ATR_NORMAL || '1.0'),
      highVolatility: parseFloat(process.env.ATR_HIGH || '1.5'),
      extremeVolatility: parseFloat(process.env.ATR_EXTREME || '2.0')
    },
    // 거래량 지표
    volume: {
      lowVolumeThreshold: parseFloat(process.env.VOL_LOW || '0.5'),
      normalVolumeThreshold: parseFloat(process.env.VOL_NORMAL || '1.0'),
      highVolumeThreshold: parseFloat(process.env.VOL_HIGH || '2.0'),
      spikeThreshold: parseFloat(process.env.VOL_SPIKE || '3.0')
    },
    // 피보나치 레벨
    fibonacci: {
      retracementLevels: [
        0,
        parseFloat(process.env.FIB_236 || '0.236'),
        parseFloat(process.env.FIB_382 || '0.382'),
        parseFloat(process.env.FIB_500 || '0.500'),
        parseFloat(process.env.FIB_618 || '0.618'),
        parseFloat(process.env.FIB_786 || '0.786'),
        1
      ],
      extensionLevels: [
        parseFloat(process.env.FIB_EXT_1272 || '1.272'),
        parseFloat(process.env.FIB_EXT_1618 || '1.618'),
        parseFloat(process.env.FIB_EXT_2618 || '2.618')
      ]
    },
    // 이치모쿠 설정
    ichimoku: {
      tenkanPeriod: parseInt(process.env.ICHI_TENKAN || '9'),
      kijunPeriod: parseInt(process.env.ICHI_KIJUN || '26'),
      senkouSpanB: parseInt(process.env.ICHI_SENKOU || '52'),
      displacement: parseInt(process.env.ICHI_DISPLACEMENT || '26')
    },
    // ROC (Rate of Change) 임계값
    roc: {
      strongBullish: parseFloat(process.env.ROC_STRONG_BULL || '10'),
      bullish: parseFloat(process.env.ROC_BULL || '5'),
      neutral: parseFloat(process.env.ROC_NEUTRAL || '0'),
      bearish: parseFloat(process.env.ROC_BEAR || '-5'),
      strongBearish: parseFloat(process.env.ROC_STRONG_BEAR || '-10')
    },
    // Ultimate Oscillator 임계값
    ultimateOscillator: {
      oversold: parseInt(process.env.UO_OVERSOLD || '30'),
      neutral_low: parseInt(process.env.UO_NEUTRAL_LOW || '45'),
      neutral_high: parseInt(process.env.UO_NEUTRAL_HIGH || '55'),
      overbought: parseInt(process.env.UO_OVERBOUGHT || '70')
    }
  }
}

export async function GET() {
  try {
    const thresholds = getIndicatorThresholds()
    
    return NextResponse.json({
      success: true,
      data: thresholds,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching indicator thresholds:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch indicator thresholds' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 실제 환경에서는 DB에 저장
    // 권한 체크 필요
    
    return NextResponse.json({
      success: true,
      message: 'Thresholds updated successfully',
      data: body
    })
  } catch (error) {
    console.error('Error updating indicator thresholds:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update indicator thresholds' },
      { status: 500 }
    )
  }
}