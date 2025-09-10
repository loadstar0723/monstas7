// 풋프린트 차트 계산 유틸리티

import { FootprintCell, MarketProfile, DeltaData, TradingSignal } from '../types'
import { FOOTPRINT_CONFIG } from '../config/constants'

// POC (Point of Control) 계산
export function calculatePOC(data: FootprintCell[]): number {
  const volumeMap = new Map<number, number>()
  
  data.forEach(cell => {
    const currentVolume = volumeMap.get(cell.price) || 0
    volumeMap.set(cell.price, currentVolume + cell.totalVolume)
  })
  
  let maxVolume = 0
  let pocPrice = 0
  
  volumeMap.forEach((volume, price) => {
    if (volume > maxVolume) {
      maxVolume = volume
      pocPrice = price
    }
  })
  
  return pocPrice
}

// 밸류 에어리어 계산 (70% 거래량 집중 구역)
export function calculateValueArea(data: FootprintCell[]): { high: number, low: number } {
  const sortedByPrice = [...data].sort((a, b) => a.price - b.price)
  const totalVolume = data.reduce((sum, cell) => sum + cell.totalVolume, 0)
  const targetVolume = totalVolume * FOOTPRINT_CONFIG.VALUE_AREA_PERCENTAGE
  
  const poc = calculatePOC(data)
  let accumulatedVolume = 0
  let high = poc
  let low = poc
  
  // POC부터 시작해서 위아래로 확장
  const pocIndex = sortedByPrice.findIndex(cell => cell.price === poc)
  
  if (pocIndex >= 0) {
    accumulatedVolume = sortedByPrice[pocIndex].totalVolume
    let upperIndex = pocIndex + 1
    let lowerIndex = pocIndex - 1
    
    while (accumulatedVolume < targetVolume && (upperIndex < sortedByPrice.length || lowerIndex >= 0)) {
      const upperVolume = upperIndex < sortedByPrice.length ? sortedByPrice[upperIndex].totalVolume : 0
      const lowerVolume = lowerIndex >= 0 ? sortedByPrice[lowerIndex].totalVolume : 0
      
      if (upperVolume > lowerVolume) {
        accumulatedVolume += upperVolume
        high = sortedByPrice[upperIndex].price
        upperIndex++
      } else {
        accumulatedVolume += lowerVolume
        low = sortedByPrice[lowerIndex].price
        lowerIndex--
      }
    }
  }
  
  return { high, low }
}

// 델타 다이버전스 감지
export function detectDeltaDivergence(deltaData: DeltaData[], priceData: { time: string, price: number }[]): boolean[] {
  const divergences: boolean[] = []
  
  for (let i = 1; i < deltaData.length; i++) {
    const priceTrend = priceData[i].price > priceData[i-1].price
    const deltaTrend = deltaData[i].cumulativeDelta > deltaData[i-1].cumulativeDelta
    
    // 가격은 상승하는데 델타는 하락 (약세 다이버전스)
    // 가격은 하락하는데 델타는 상승 (강세 다이버전스)
    divergences.push(priceTrend !== deltaTrend)
  }
  
  return divergences
}

// 지지/저항 레벨 계산
export function calculateSupportResistance(data: FootprintCell[]): { support: number[], resistance: number[] } {
  const priceVolumes = new Map<number, number>()
  
  data.forEach(cell => {
    const current = priceVolumes.get(cell.price) || 0
    priceVolumes.set(cell.price, current + cell.totalVolume)
  })
  
  const sortedPrices = Array.from(priceVolumes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([price]) => price)
  
  const currentPrice = data[data.length - 1]?.price || 0
  const support = sortedPrices.filter(price => price < currentPrice).slice(0, 3)
  const resistance = sortedPrices.filter(price => price > currentPrice).slice(0, 3)
  
  return { support, resistance }
}

// 오더플로우 임밸런스 계산
export function calculateOrderFlowImbalance(buyVolume: number, sellVolume: number): number {
  const totalVolume = buyVolume + sellVolume
  if (totalVolume === 0) return 0
  
  return ((buyVolume - sellVolume) / totalVolume) * 100
}

// 트레이딩 시그널 생성
export function generateTradingSignal(
  footprintData: FootprintCell[],
  deltaData: DeltaData[],
  currentPrice: number
): TradingSignal {
  if (!footprintData.length || !deltaData.length) {
    return {
      type: 'neutral',
      confidence: 0,
      reason: '데이터 부족',
      entry: currentPrice,
      stopLoss: currentPrice * FOOTPRINT_CONFIG.STOP_LOSS_RATIO,
      targets: [currentPrice * 1.02],
      riskRewardRatio: 1
    }
  }
  
  // 최근 데이터 분석
  const recentCells = footprintData.slice(-20)
  const recentDelta = deltaData.slice(-20)
  
  const totalBuyVolume = recentCells.reduce((sum, cell) => sum + cell.buyVolume, 0)
  const totalSellVolume = recentCells.reduce((sum, cell) => sum + cell.sellVolume, 0)
  const imbalance = calculateOrderFlowImbalance(totalBuyVolume, totalSellVolume)
  
  const cumulativeDelta = recentDelta[recentDelta.length - 1]?.cumulativeDelta || 0
  const deltaTrend = recentDelta.length > 1 ? 
    recentDelta[recentDelta.length - 1].cumulativeDelta - recentDelta[0].cumulativeDelta : 0
  
  const { support, resistance } = calculateSupportResistance(footprintData)
  
  // 시그널 판단 로직
  let type: 'buy' | 'sell' | 'neutral' = 'neutral'
  let confidence = 50
  let reason = ''
  
  if (imbalance > 30 && deltaTrend > 0) {
    type = 'buy'
    confidence = Math.min(80, 50 + imbalance / 2)
    reason = '강한 매수 압력과 상승 델타'
  } else if (imbalance < -30 && deltaTrend < 0) {
    type = 'sell'
    confidence = Math.min(80, 50 + Math.abs(imbalance) / 2)
    reason = '강한 매도 압력과 하락 델타'
  } else if (Math.abs(imbalance) < 10) {
    type = 'neutral'
    confidence = 40
    reason = '균형잡힌 오더플로우'
  }
  
  // 진입가, 손절가, 목표가 계산
  const entry = currentPrice
  const stopLoss = type === 'buy' ? 
    support[0] || currentPrice * FOOTPRINT_CONFIG.STOP_LOSS_RATIO : 
    resistance[0] || currentPrice * 1.02
  
  const targets = type === 'buy' ? [
    resistance[0] || currentPrice * 1.01,
    resistance[1] || currentPrice * 1.02,
    resistance[2] || currentPrice * 1.03
  ].filter(t => t > entry) : [
    support[0] || currentPrice * FOOTPRINT_CONFIG.SUPPORT_LEVEL_1,
    support[1] || currentPrice * FOOTPRINT_CONFIG.SUPPORT_LEVEL_2,
    support[2] || currentPrice * FOOTPRINT_CONFIG.SUPPORT_LEVEL_3
  ].filter(t => t < entry)
  
  const risk = Math.abs(entry - stopLoss)
  const reward = targets.length > 0 ? Math.abs(targets[0] - entry) : risk
  const riskRewardRatio = risk > 0 ? reward / risk : 1
  
  return {
    type,
    confidence,
    reason,
    entry,
    stopLoss,
    targets,
    riskRewardRatio
  }
}

// 시간대별 그룹화
export function groupByTimeframe(data: FootprintCell[], timeframe: string): FootprintCell[] {
  const grouped = new Map<string, FootprintCell>()
  const intervalMinutes = getTimeframeMinutes(timeframe)
  
  data.forEach(cell => {
    const [hours, minutes] = cell.time.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes
    const groupedMinutes = Math.floor(totalMinutes / intervalMinutes) * intervalMinutes
    const groupedHours = Math.floor(groupedMinutes / 60)
    const groupedMins = groupedMinutes % 60
    const timeKey = `${groupedHours.toString().padStart(2, '0')}:${groupedMins.toString().padStart(2, '0')}`
    
    const existing = grouped.get(timeKey)
    if (existing) {
      existing.buyVolume += cell.buyVolume
      existing.sellVolume += cell.sellVolume
      existing.totalVolume += cell.totalVolume
      existing.delta += cell.delta
      existing.imbalance = existing.totalVolume > 0 ? existing.delta / existing.totalVolume : 0
    } else {
      grouped.set(timeKey, { ...cell, time: timeKey })
    }
  })
  
  return Array.from(grouped.values())
}

function getTimeframeMinutes(timeframe: string): number {
  const map: { [key: string]: number } = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '4h': 240,
    '1d': 1440
  }
  return map[timeframe] || 5
}