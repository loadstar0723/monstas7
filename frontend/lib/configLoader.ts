// 설정값 로더 - 모든 하드코딩 제거용

export interface TradingConfig {
  tradingParameters: {
    stopLoss: {
      scalping: number
      dayTrading: number
      swing: number
      position: number
    }
    takeProfit: {
      scalping: { target1: number; target2: number; target3: number }
      dayTrading: { target1: number; target2: number; target3: number }
      swing: { target1: number; target2: number; target3: number }
      position: { target1: number; target2: number; target3: number }
    }
    prediction: {
      shortTermAdjustment: number
      mediumTermAdjustment: number
      longTermAdjustment: number
      weeklyAdjustment: number
      confidenceMultiplier: number
    }
    backtest: {
      rsiOversold: number
      rsiOverbought: number
      macdCrossoverThreshold: number
      bollingerMultiplier: number
      minimumDataPoints: number
      slippage: number
      tradingFee: number
    }
    riskManagement: {
      maxDrawdown: number
      maxPositionSize: number
      maxLeverage: {
        scalping: number
        dayTrading: number
        swing: number
        position: number
      }
      riskPerTrade: number
    }
    patterns: {
      doubleTopBottomThreshold: number
      triangleConvergence: number
      flagPoleMinMove: number
      cupHandleDepth: number
      headShouldersSymmetry: number
    }
    indicators: {
      adxTrendStrong: number
      adxTrendVeryStrong: number
      volumeSpike: number
      volatilityHigh: number
      momentumStrong: number
    }
  }
  indicatorThresholds: {
    rsi: {
      extremeOversold: number
      oversold: number
      neutral_low: number
      neutral_high: number
      overbought: number
      extremeOverbought: number
    }
    macd: {
      strongBullishCrossover: number
      bullishCrossover: number
      bearishCrossover: number
      strongBearishCrossover: number
      convergenceThreshold: number
      divergenceSignificant: number
    }
    stochastic: {
      oversold: number
      overbought: number
      crossoverThreshold: number
    }
    bollingerBands: {
      period: number
      standardDeviation: number
      squeezeTreshold: number
      expansionThreshold: number
      percentBHigh: number
      percentBLow: number
    }
    cci: {
      oversold: number
      overbought: number
      extremeOversold: number
      extremeOverbought: number
    }
    williamsR: {
      oversold: number
      overbought: number
      midpoint: number
    }
    mfi: {
      oversold: number
      weakBuy: number
      neutral: number
      weakSell: number
      overbought: number
    }
    adx: {
      noTrend: number
      weakTrend: number
      strongTrend: number
      veryStrongTrend: number
      extremelyStrong: number
    }
    atr: {
      lowVolatility: number
      normalVolatility: number
      highVolatility: number
      extremeVolatility: number
    }
    volume: {
      lowVolumeThreshold: number
      normalVolumeThreshold: number
      highVolumeThreshold: number
      spikeThreshold: number
    }
    fibonacci: {
      retracementLevels: number[]
      extensionLevels: number[]
    }
    ichimoku: {
      tenkanPeriod: number
      kijunPeriod: number
      senkouSpanB: number
      displacement: number
    }
    roc: {
      strongBullish: number
      bullish: number
      neutral: number
      bearish: number
      strongBearish: number
    }
    ultimateOscillator: {
      oversold: number
      neutral_low: number
      neutral_high: number
      overbought: number
    }
  }
}

// 설정값 캐싱
let cachedConfig: TradingConfig | null = null
let configLastFetched: number = 0
const CONFIG_CACHE_DURATION = 5 * 60 * 1000 // 5분

// 설정값 로드
export async function loadTradingConfig(): Promise<TradingConfig> {
  // 캐시 확인
  if (cachedConfig && Date.now() - configLastFetched < CONFIG_CACHE_DURATION) {
    return cachedConfig
  }

  // 일단 기본값 사용 (API는 나중에 구현)
  cachedConfig = getDefaultConfig()
  configLastFetched = Date.now()
  return cachedConfig
}

// 기본 설정값 (폴백용)
function getDefaultConfig(): TradingConfig {
  return {
    tradingParameters: {
      stopLoss: {
        scalping: 0.005,
        dayTrading: 0.02,
        swing: 0.05,
        position: 0.08
      },
      takeProfit: {
        scalping: { target1: 0.008, target2: 0.012, target3: 0.02 },
        dayTrading: { target1: 0.015, target2: 0.025, target3: 0.04 },
        swing: { target1: 0.05, target2: 0.08, target3: 0.12 },
        position: { target1: 0.08, target2: 0.15, target3: 0.25 }
      },
      prediction: {
        shortTermAdjustment: 0.012,
        mediumTermAdjustment: 0.025,
        longTermAdjustment: 0.05,
        weeklyAdjustment: 0.08,
        confidenceMultiplier: 0.95
      },
      backtest: {
        rsiOversold: 30,
        rsiOverbought: 70,
        macdCrossoverThreshold: 0.5,
        bollingerMultiplier: 2,
        minimumDataPoints: 50,
        slippage: 0.001,
        tradingFee: 0.001
      },
      riskManagement: {
        maxDrawdown: 0.15,
        maxPositionSize: 0.1,
        maxLeverage: {
          scalping: 3,
          dayTrading: 5,
          swing: 3,
          position: 2
        },
        riskPerTrade: 0.02
      },
      patterns: {
        doubleTopBottomThreshold: 0.03,
        triangleConvergence: 0.05,
        flagPoleMinMove: 0.05,
        cupHandleDepth: 0.15,
        headShouldersSymmetry: 0.02
      },
      indicators: {
        adxTrendStrong: 25,
        adxTrendVeryStrong: 40,
        volumeSpike: 2,
        volatilityHigh: 0.03,
        momentumStrong: 60
      }
    },
    indicatorThresholds: {
      rsi: {
        extremeOversold: 20,
        oversold: 30,
        neutral_low: 45,
        neutral_high: 55,
        overbought: 70,
        extremeOverbought: 80
      },
      macd: {
        strongBullishCrossover: 0.5,
        bullishCrossover: 0.2,
        bearishCrossover: -0.2,
        strongBearishCrossover: -0.5,
        convergenceThreshold: 0.1,
        divergenceSignificant: 1.0
      },
      stochastic: {
        oversold: 20,
        overbought: 80,
        crossoverThreshold: 5
      },
      bollingerBands: {
        period: 20,
        standardDeviation: 2,
        squeezeTreshold: 2,
        expansionThreshold: 5,
        percentBHigh: 80,
        percentBLow: 20
      },
      cci: {
        oversold: -100,
        overbought: 100,
        extremeOversold: -200,
        extremeOverbought: 200
      },
      williamsR: {
        oversold: -80,
        overbought: -20,
        midpoint: -50
      },
      mfi: {
        oversold: 20,
        weakBuy: 30,
        neutral: 50,
        weakSell: 70,
        overbought: 80
      },
      adx: {
        noTrend: 20,
        weakTrend: 25,
        strongTrend: 40,
        veryStrongTrend: 50,
        extremelyStrong: 70
      },
      atr: {
        lowVolatility: 0.5,
        normalVolatility: 1.0,
        highVolatility: 1.5,
        extremeVolatility: 2.0
      },
      volume: {
        lowVolumeThreshold: 0.5,
        normalVolumeThreshold: 1.0,
        highVolumeThreshold: 2.0,
        spikeThreshold: 3.0
      },
      fibonacci: {
        retracementLevels: [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1],
        extensionLevels: [1.272, 1.618, 2.618]
      },
      ichimoku: {
        tenkanPeriod: 9,
        kijunPeriod: 26,
        senkouSpanB: 52,
        displacement: 26
      },
      roc: {
        strongBullish: 10,
        bullish: 5,
        neutral: 0,
        bearish: -5,
        strongBearish: -10
      },
      ultimateOscillator: {
        oversold: 30,
        neutral_low: 45,
        neutral_high: 55,
        overbought: 70
      }
    }
  }
}

// 특정 전략에 대한 설정값 가져오기
export function getStrategyConfig(config: TradingConfig, timeframe: 'scalping' | 'dayTrading' | 'swing' | 'position') {
  return {
    stopLoss: config.tradingParameters.stopLoss[timeframe],
    takeProfit: config.tradingParameters.takeProfit[timeframe],
    leverage: config.tradingParameters.riskManagement.maxLeverage[timeframe],
    positionSize: config.tradingParameters.riskManagement.maxPositionSize,
    riskPerTrade: config.tradingParameters.riskManagement.riskPerTrade
  }
}

// 예측 조정값 가져오기
export function getPredictionAdjustments(config: TradingConfig, timeframe: string) {
  const pred = config.tradingParameters.prediction
  
  switch (timeframe) {
    case '15분':
    case '15m':
      return {
        bullishMultiplier: 1 + pred.shortTermAdjustment / 10,
        bearishMultiplier: 1 - pred.shortTermAdjustment / 10,
        confidenceBase: 85 * pred.confidenceMultiplier
      }
    case '1시간':
    case '1h':
      return {
        bullishMultiplier: 1 + pred.shortTermAdjustment / 5,
        bearishMultiplier: 1 - pred.shortTermAdjustment / 5,
        confidenceBase: 78 * pred.confidenceMultiplier
      }
    case '4시간':
    case '4h':
      return {
        bullishMultiplier: 1 + pred.mediumTermAdjustment,
        bearishMultiplier: 1 - pred.mediumTermAdjustment,
        confidenceBase: 72 * pred.confidenceMultiplier
      }
    case '1일':
    case '1d':
      return {
        bullishMultiplier: 1 + pred.longTermAdjustment,
        bearishMultiplier: 1 - pred.longTermAdjustment,
        confidenceBase: 65 * pred.confidenceMultiplier
      }
    case '1주':
    case '1w':
      return {
        bullishMultiplier: 1 + pred.weeklyAdjustment,
        bearishMultiplier: 1 - pred.weeklyAdjustment,
        confidenceBase: 55 * pred.confidenceMultiplier
      }
    default:
      return {
        bullishMultiplier: 1.01,
        bearishMultiplier: 0.99,
        confidenceBase: 70
      }
  }
}

// 지표별 임계값 가져오기
export function getIndicatorThreshold(config: TradingConfig, indicator: string, level: string): number {
  const thresholds = config.indicatorThresholds
  
  switch (indicator) {
    case 'RSI':
      return thresholds.rsi[level as keyof typeof thresholds.rsi] || 50
    case 'MACD':
      return thresholds.macd[level as keyof typeof thresholds.macd] || 0
    case 'STOCH':
      return thresholds.stochastic[level as keyof typeof thresholds.stochastic] || 50
    case 'BB':
      return thresholds.bollingerBands[level as keyof typeof thresholds.bollingerBands] || 20
    case 'CCI':
      return thresholds.cci[level as keyof typeof thresholds.cci] || 0
    case 'MFI':
      return thresholds.mfi[level as keyof typeof thresholds.mfi] || 50
    case 'ADX':
      return thresholds.adx[level as keyof typeof thresholds.adx] || 25
    default:
      return 50
  }
}

// 리스크 레벨 계산
export function calculateRiskLevel(config: TradingConfig, drawdown: number, consecutiveLosses: number): 'low' | 'medium' | 'high' | 'extreme' {
  const { maxDrawdown } = config.tradingParameters.riskManagement
  
  if (drawdown > maxDrawdown * 0.8 || consecutiveLosses > 5) {
    return 'extreme'
  } else if (drawdown > maxDrawdown * 0.6 || consecutiveLosses > 3) {
    return 'high'
  } else if (drawdown > maxDrawdown * 0.3 || consecutiveLosses > 1) {
    return 'medium'
  } else {
    return 'low'
  }
}

// 신뢰도 점수 계산
export function calculateConfidence(
  config: TradingConfig,
  indicators: {
    rsi?: number
    macdHistogram?: number
    adx?: number
    volumeRatio?: number
  },
  volatility: number,
  currentPrice: number
): number {
  let confidence = 50 // 기본값
  
  const thresholds = config.indicatorThresholds
  
  // RSI 기반 신뢰도
  if (indicators.rsi !== undefined) {
    if (indicators.rsi < thresholds.rsi.oversold || indicators.rsi > thresholds.rsi.overbought) {
      confidence += 15
    } else if (indicators.rsi < thresholds.rsi.extremeOversold || indicators.rsi > thresholds.rsi.extremeOverbought) {
      confidence += 25
    }
  }
  
  // MACD 기반 신뢰도
  if (indicators.macdHistogram !== undefined) {
    if (Math.abs(indicators.macdHistogram) > thresholds.macd.strongBullishCrossover) {
      confidence += 20
    } else if (Math.abs(indicators.macdHistogram) > thresholds.macd.bullishCrossover) {
      confidence += 10
    }
  }
  
  // ADX 기반 신뢰도 (트렌드 강도)
  if (indicators.adx !== undefined) {
    if (indicators.adx > thresholds.adx.veryStrongTrend) {
      confidence += 20
    } else if (indicators.adx > thresholds.adx.strongTrend) {
      confidence += 10
    } else if (indicators.adx < thresholds.adx.noTrend) {
      confidence -= 10
    }
  }
  
  // 거래량 기반 신뢰도
  if (indicators.volumeRatio !== undefined) {
    if (indicators.volumeRatio > thresholds.volume.spikeThreshold) {
      confidence += 15
    } else if (indicators.volumeRatio > thresholds.volume.highVolumeThreshold) {
      confidence += 8
    }
  }
  
  // 변동성 조정
  const volatilityRatio = volatility / currentPrice
  if (volatilityRatio > thresholds.atr.extremeVolatility / 100) {
    confidence -= 15
  } else if (volatilityRatio > thresholds.atr.highVolatility / 100) {
    confidence -= 8
  }
  
  // 신뢰도를 0-100 범위로 제한
  return Math.max(0, Math.min(100, confidence))
}