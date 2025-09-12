import {
  OHLCVData,
  WyckoffPhase,
  WyckoffEvent,
  WyckoffAnalysis,
  WyckoffMarker,
  VolumeProfile,
  WyckoffIndicators
} from './WyckoffTypes'

// 와이코프 분석 핵심 로직

// 볼륨 프로파일 계산
export function calculateVolumeProfile(data: OHLCVData[], bins: number = 50): VolumeProfile[] {
  if (data.length === 0) return []
  
  const prices = data.map(d => d.close)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice
  const binSize = priceRange / bins
  
  const profile: VolumeProfile[] = []
  
  for (let i = 0; i < bins; i++) {
    const binLow = minPrice + (i * binSize)
    const binHigh = binLow + binSize
    const binMid = (binLow + binHigh) / 2
    
    let totalVolume = 0
    let buyVolume = 0
    let sellVolume = 0
    
    data.forEach(candle => {
      if (candle.close >= binLow && candle.close < binHigh) {
        totalVolume += candle.volume
        if (candle.close > candle.open) {
          buyVolume += candle.volume
        } else {
          sellVolume += candle.volume
        }
      }
    })
    
    profile.push({
      price: binMid,
      volume: totalVolume,
      buyVolume,
      sellVolume
    })
  }
  
  // POC (Point of Control) 찾기
  const maxVolume = Math.max(...profile.map(p => p.volume))
  const pocIndex = profile.findIndex(p => p.volume === maxVolume)
  if (pocIndex !== -1) {
    profile[pocIndex].isPOC = true
  }
  
  // Value Area 계산 (전체 볼륨의 70%)
  const totalVolume = profile.reduce((sum, p) => sum + p.volume, 0)
  const valueAreaTarget = totalVolume * 0.7
  let valueAreaVolume = 0
  let valueAreaStart = pocIndex
  let valueAreaEnd = pocIndex
  
  while (valueAreaVolume < valueAreaTarget && (valueAreaStart > 0 || valueAreaEnd < profile.length - 1)) {
    const expandUp = valueAreaEnd < profile.length - 1 ? profile[valueAreaEnd + 1].volume : 0
    const expandDown = valueAreaStart > 0 ? profile[valueAreaStart - 1].volume : 0
    
    if (expandUp > expandDown) {
      valueAreaEnd++
      valueAreaVolume += expandUp
    } else {
      valueAreaStart--
      valueAreaVolume += expandDown
    }
  }
  
  if (valueAreaStart < profile.length) profile[valueAreaStart].isVAL = true
  if (valueAreaEnd < profile.length) profile[valueAreaEnd].isVAH = true
  
  return profile
}

// 와이코프 단계 판별
export function detectWyckoffPhase(
  data: OHLCVData[], 
  lookbackPeriod: number = 100
): { phase: WyckoffPhase; confidence: number; progress: number } {
  if (data.length < lookbackPeriod) {
    return { phase: WyckoffPhase.Unknown, confidence: 0, progress: 0 }
  }
  
  const recentData = data.slice(-lookbackPeriod)
  const prices = recentData.map(d => d.close)
  const volumes = recentData.map(d => d.volume)
  
  // 가격 범위와 추세 계산
  const maxPrice = Math.max(...prices)
  const minPrice = Math.min(...prices)
  const priceRange = maxPrice - minPrice
  const currentPrice = prices[prices.length - 1]
  const pricePosition = (currentPrice - minPrice) / priceRange
  
  // 볼륨 추세 계산
  const avgVolumeFirst = volumes.slice(0, 20).reduce((a, b) => a + b, 0) / 20
  const avgVolumeLast = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20
  const volumeTrend = (avgVolumeLast - avgVolumeFirst) / avgVolumeFirst
  
  // 가격 변동성 계산
  const priceChanges = prices.slice(1).map((p, i) => Math.abs(p - prices[i]) / prices[i])
  const avgVolatility = priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length
  
  // 추세 강도 계산
  const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20
  const sma50 = prices.slice(-50).reduce((a, b) => a + b, 0) / 50
  const trendStrength = (sma20 - sma50) / sma50
  
  let phase = WyckoffPhase.Unknown
  let confidence = 0
  let progress = 0
  
  // 축적 단계 판별 (조건 완화)
  if (pricePosition < 0.4 && avgVolatility < 0.1) {
    phase = WyckoffPhase.Accumulation
    confidence = Math.min(
      (0.4 - pricePosition) * 150 + 
      (1 - avgVolatility * 10) * 50,
      90
    )
    progress = pricePosition * 100 / 0.4
  }
  // 마크업 단계 판별 (상승 추세)
  else if (trendStrength > 0.01 && pricePosition > 0.3 && pricePosition < 0.8) {
    phase = WyckoffPhase.Markup
    confidence = Math.min(
      60 + 
      trendStrength * 200 + 
      (pricePosition - 0.3) * 50,
      90
    )
    progress = ((pricePosition - 0.3) / 0.5) * 100
  }
  // 분산 단계 판별 (고점 횡보)
  else if (pricePosition > 0.6 && avgVolatility < 0.1) {
    phase = WyckoffPhase.Distribution
    confidence = Math.min(
      50 +
      (pricePosition - 0.6) * 100 + 
      (1 - avgVolatility * 10) * 30,
      90
    )
    progress = ((pricePosition - 0.6) / 0.4) * 100
  }
  // 마크다운 단계 판별 (하락 추세)
  else if (trendStrength < -0.01 && pricePosition < 0.7) {
    phase = WyckoffPhase.Markdown
    confidence = Math.min(
      60 +
      Math.abs(trendStrength) * 200 + 
      (1 - pricePosition) * 30,
      90
    )
    progress = (1 - pricePosition) * 100
  }
  
  // 기본값 설정 (Unknown이 너무 많은 경우 방지)
  if (phase === WyckoffPhase.Unknown) {
    // 가격 위치를 기반으로 가장 가능성 높은 단계 추측
    if (pricePosition < 0.5) {
      phase = WyckoffPhase.Accumulation
      confidence = 40
      progress = pricePosition * 200
    } else {
      phase = WyckoffPhase.Distribution
      confidence = 40
      progress = (pricePosition - 0.5) * 200
    }
  }
  
  return { phase, confidence, progress: Math.min(progress, 100) }
}

// 와이코프 이벤트 감지
export function detectWyckoffEvents(data: OHLCVData[]): WyckoffMarker[] {
  const events: WyckoffMarker[] = []
  
  if (data.length < 50) return events
  
  // 지난 50개 캔들 분석
  for (let i = 50; i < data.length; i++) {
    const window = data.slice(i - 50, i)
    const current = data[i]
    const prev = data[i - 1]
    
    const prices = window.map(d => d.close)
    const volumes = window.map(d => d.volume)
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    
    // Selling Climax (SC) 감지
    if (current.volume > avgVolume * 2.5 && 
        current.close < current.open &&
        (current.open - current.close) > (current.high - current.low) * 0.7 &&
        current.close <= minPrice * 1.01) {
      events.push({
        time: current.time,
        event: WyckoffEvent.SC,
        price: current.close,
        description: '매도 절정 - 패닉 매도의 정점',
        confidence: 85
      })
    }
    
    // Automatic Rally (AR) 감지
    if (i > 1 && events.length > 0) {
      const lastSC = events.filter(e => e.event === WyckoffEvent.SC).slice(-1)[0]
      if (lastSC && i - data.findIndex(d => d.time === lastSC.time) < 10) {
        if (current.close > current.open && 
            current.volume > avgVolume * 1.5 &&
            current.close > lastSC.price * 1.05) {
          events.push({
            time: current.time,
            event: WyckoffEvent.AR,
            price: current.close,
            description: '자동 반등 - SC 후 자연스러운 반등',
            confidence: 80
          })
        }
      }
    }
    
    // Spring 감지
    if (current.low < minPrice * 0.99 && 
        current.close > minPrice &&
        current.close > current.open &&
        current.volume > avgVolume) {
      events.push({
        time: current.time,
        event: WyckoffEvent.Spring,
        price: current.low,
        description: '스프링 - 지지선 하향 돌파 후 반등',
        confidence: 75
      })
    }
    
    // UTAD 감지
    if (current.high > maxPrice * 1.01 && 
        current.close < current.open &&
        current.close < maxPrice * 0.99 &&
        current.volume > avgVolume * 1.5) {
      events.push({
        time: current.time,
        event: WyckoffEvent.UTAD,
        price: current.high,
        description: 'UTAD - 분산 후 가짜 돌파',
        confidence: 80
      })
    }
  }
  
  return events
}

// 지지/저항 레벨 계산
export function calculateSupportResistance(data: OHLCVData[]): { support: number[]; resistance: number[] } {
  if (data.length < 20) return { support: [], resistance: [] }
  
  const support: number[] = []
  const resistance: number[] = []
  const pricePoints: { price: number; touches: number }[] = []
  
  // 주요 가격 포인트 찾기
  data.forEach((candle, i) => {
    if (i < 2 || i >= data.length - 2) return
    
    const prevPrev = data[i - 2]
    const prev = data[i - 1]
    const next = data[i + 1]
    const nextNext = data[i + 2]
    
    // 지역 고점
    if (candle.high > prev.high && candle.high > next.high &&
        candle.high > prevPrev.high && candle.high > nextNext.high) {
      const existing = pricePoints.find(p => Math.abs(p.price - candle.high) / candle.high < 0.005)
      if (existing) {
        existing.touches++
      } else {
        pricePoints.push({ price: candle.high, touches: 1 })
      }
    }
    
    // 지역 저점
    if (candle.low < prev.low && candle.low < next.low &&
        candle.low < prevPrev.low && candle.low < nextNext.low) {
      const existing = pricePoints.find(p => Math.abs(p.price - candle.low) / candle.low < 0.005)
      if (existing) {
        existing.touches++
      } else {
        pricePoints.push({ price: candle.low, touches: 1 })
      }
    }
  })
  
  // 중요도 순으로 정렬
  pricePoints.sort((a, b) => b.touches - a.touches)
  
  const currentPrice = data[data.length - 1].close
  
  // 지지/저항 분류
  pricePoints.slice(0, 10).forEach(point => {
    if (point.touches >= 2) {
      if (point.price < currentPrice) {
        support.push(point.price)
      } else {
        resistance.push(point.price)
      }
    }
  })
  
  return { 
    support: support.sort((a, b) => b - a).slice(0, 3),
    resistance: resistance.sort((a, b) => a - b).slice(0, 3)
  }
}

// Effort vs Result 분석
export function analyzeEffortVsResult(data: OHLCVData[]): 'aligned' | 'divergent' {
  if (data.length < 20) return 'aligned'
  
  const recent = data.slice(-20)
  const priceChange = (recent[recent.length - 1].close - recent[0].close) / recent[0].close
  const avgVolume = recent.slice(0, 10).reduce((sum, d) => sum + d.volume, 0) / 10
  const recentVolume = recent.slice(-10).reduce((sum, d) => sum + d.volume, 0) / 10
  const volumeChange = (recentVolume - avgVolume) / avgVolume
  
  // 큰 볼륨 증가에 작은 가격 변화 = 다이버전스
  if (volumeChange > 0.5 && Math.abs(priceChange) < 0.02) return 'divergent'
  // 작은 볼륨에 큰 가격 변화 = 다이버전스
  if (volumeChange < -0.2 && Math.abs(priceChange) > 0.05) return 'divergent'
  
  return 'aligned'
}

// 스마트 머니 플로우 분석
export function analyzeSmartMoneyFlow(data: OHLCVData[]): 'accumulating' | 'distributing' | 'neutral' {
  if (data.length < 50) return 'neutral'
  
  const recent = data.slice(-50)
  let accumulationVolume = 0
  let distributionVolume = 0
  
  recent.forEach(candle => {
    const range = candle.high - candle.low
    if (range === 0) return
    
    const closePosition = (candle.close - candle.low) / range
    
    if (closePosition > 0.7) {
      accumulationVolume += candle.volume
    } else if (closePosition < 0.3) {
      distributionVolume += candle.volume
    }
  })
  
  const ratio = accumulationVolume / (distributionVolume + 1)
  
  // 더 민감한 기준값 설정
  if (ratio > 1.2) return 'accumulating'
  if (ratio < 0.8) return 'distributing'
  return 'neutral'
}

// 와이코프 지표 계산
export function calculateWyckoffIndicators(data: OHLCVData[]): WyckoffIndicators {
  if (data.length < 50) {
    return {
      compositeOperator: 0,
      volumeTrend: 0,
      priceStrength: 0,
      marketPhase: 0,
      effortVsResult: 0
    }
  }
  
  const recent = data.slice(-50)
  const prices = recent.map(d => d.close)
  const volumes = recent.map(d => d.volume)
  
  // Composite Operator (스마트 머니 활동)
  let compositeOperator = 0
  const smartFlow = analyzeSmartMoneyFlow(data)
  if (smartFlow === 'accumulating') compositeOperator = 50
  else if (smartFlow === 'distributing') compositeOperator = -50
  
  // Volume Trend
  const volumeSMA10 = volumes.slice(-10).reduce((a, b) => a + b, 0) / 10
  const volumeSMA30 = volumes.slice(-30).reduce((a, b) => a + b, 0) / 30
  const volumeTrend = ((volumeSMA10 - volumeSMA30) / volumeSMA30) * 100
  
  // Price Strength
  const priceSMA10 = prices.slice(-10).reduce((a, b) => a + b, 0) / 10
  const priceSMA30 = prices.slice(-30).reduce((a, b) => a + b, 0) / 30
  const priceStrength = ((priceSMA10 - priceSMA30) / priceSMA30) * 100
  
  // Market Phase (0-3)
  const phaseData = detectWyckoffPhase(data)
  let marketPhase = 0
  switch (phaseData.phase) {
    case WyckoffPhase.Accumulation: marketPhase = 0; break
    case WyckoffPhase.Markup: marketPhase = 1; break
    case WyckoffPhase.Distribution: marketPhase = 2; break
    case WyckoffPhase.Markdown: marketPhase = 3; break
  }
  
  // Effort vs Result
  const effortResult = analyzeEffortVsResult(data)
  const effortVsResult = effortResult === 'aligned' ? 50 : -50
  
  return {
    compositeOperator: Math.max(-100, Math.min(100, compositeOperator)),
    volumeTrend: Math.max(-100, Math.min(100, volumeTrend)),
    priceStrength: Math.max(-100, Math.min(100, priceStrength)),
    marketPhase,
    effortVsResult
  }
}

// 종합 와이코프 분석
export function performWyckoffAnalysis(
  data: OHLCVData[], 
  currentPrice: number
): WyckoffAnalysis {
  const phaseData = detectWyckoffPhase(data)
  const events = detectWyckoffEvents(data)
  const levels = calculateSupportResistance(data)
  const effortVsResult = analyzeEffortVsResult(data)
  const smartMoneyFlow = analyzeSmartMoneyFlow(data)
  
  // 트레이딩 전략 계산
  let bias: 'bullish' | 'bearish' | 'neutral' = 'neutral'
  let entryPoints: number[] = []
  let stopLoss = currentPrice
  let targets: number[] = []
  
  // 더 포괄적인 트레이딩 전략
  if (phaseData.phase === WyckoffPhase.Accumulation) {
    bias = phaseData.progress > 50 ? 'bullish' : 'neutral'
    entryPoints = levels.support.length > 0 ? levels.support.slice(0, 2) : [currentPrice * 0.98, currentPrice * 0.96]
    stopLoss = Math.min(...(levels.support.length > 0 ? levels.support : [currentPrice])) * 0.97
    targets = levels.resistance.length > 0 ? levels.resistance : [currentPrice * 1.05, currentPrice * 1.1]
  } else if (phaseData.phase === WyckoffPhase.Distribution) {
    bias = phaseData.progress > 50 ? 'bearish' : 'neutral'
    entryPoints = levels.resistance.length > 0 ? levels.resistance.slice(0, 2) : [currentPrice * 1.02, currentPrice * 1.04]
    stopLoss = Math.max(...(levels.resistance.length > 0 ? levels.resistance : [currentPrice])) * 1.03
    targets = levels.support.length > 0 ? levels.support : [currentPrice * 0.95, currentPrice * 0.9]
  } else if (phaseData.phase === WyckoffPhase.Markup) {
    bias = 'bullish'
    entryPoints = [currentPrice * 0.99, currentPrice * 0.98]
    stopLoss = currentPrice * 0.95
    targets = [currentPrice * 1.03, currentPrice * 1.06, currentPrice * 1.1]
  } else if (phaseData.phase === WyckoffPhase.Markdown) {
    bias = 'bearish'
    entryPoints = [currentPrice * 1.01, currentPrice * 1.02]
    stopLoss = currentPrice * 1.05
    targets = [currentPrice * 0.97, currentPrice * 0.94, currentPrice * 0.9]
  }
  
  // 엔트리 포인트가 없으면 현재가 기준으로 생성
  if (entryPoints.length === 0) {
    entryPoints = [currentPrice]
  }
  
  // 타겟이 없으면 기본 타겟 설정
  if (targets.length === 0) {
    if (bias === 'bullish') {
      targets = [currentPrice * 1.03, currentPrice * 1.06]
    } else if (bias === 'bearish') {
      targets = [currentPrice * 0.97, currentPrice * 0.94]
    } else {
      targets = [currentPrice * 1.02, currentPrice * 0.98]
    }
  }
  
  const riskRewardRatio = targets.length > 0 ? 
    Math.abs(targets[0] - entryPoints[0]) / Math.abs(entryPoints[0] - stopLoss) : 0
  
  // 다음 단계 예측
  const nextPhasesPrediction = []
  if (phaseData.phase === WyckoffPhase.Accumulation) {
    nextPhasesPrediction.push({
      phase: WyckoffPhase.Markup,
      probability: phaseData.progress,
      timeframe: '1-2 weeks'
    })
  } else if (phaseData.phase === WyckoffPhase.Markup) {
    nextPhasesPrediction.push({
      phase: WyckoffPhase.Distribution,
      probability: 50 + (phaseData.progress / 2),
      timeframe: '2-4 weeks'
    })
  }
  
  return {
    phase: phaseData.phase,
    phaseConfidence: phaseData.confidence,
    phaseProgress: phaseData.progress,
    events,
    keyLevels: {
      resistance: levels.resistance,
      support: levels.support,
      currentRange: {
        high: Math.max(...data.slice(-20).map(d => d.high)),
        low: Math.min(...data.slice(-20).map(d => d.low))
      }
    },
    volumeAnalysis: {
      trend: smartMoneyFlow === 'accumulating' ? 'increasing' : 
             smartMoneyFlow === 'distributing' ? 'decreasing' : 'stable',
      effortVsResult,
      smartMoneyFlow
    },
    tradingStrategy: {
      bias,
      entryPoints,
      stopLoss,
      targets,
      riskRewardRatio,
      positionSize: riskRewardRatio > 2 ? '5-10%' : riskRewardRatio > 1 ? '3-5%' : '1-3%'
    },
    nextPhasesPrediction
  }
}