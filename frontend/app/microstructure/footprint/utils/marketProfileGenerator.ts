// 마켓 프로파일 생성 유틸리티
import { MarketProfile, FootprintCell } from '../types'
import { FOOTPRINT_CONFIG } from '../config/constants'

export function generateMarketProfile(
  footprintData: FootprintCell[],
  symbol: string
): MarketProfile[] {
  if (!footprintData || footprintData.length === 0) {
    return []
  }

  // 가격별 볼륨 집계
  const profileMap = new Map<number, number>()
  let totalVolume = 0
  
  footprintData.forEach(cell => {
    const currentVolume = profileMap.get(cell.price) || 0
    profileMap.set(cell.price, currentVolume + cell.totalVolume)
    totalVolume += cell.totalVolume
  })
  
  // MarketProfile 배열 생성
  const profile: MarketProfile[] = Array.from(profileMap.entries())
    .map(([price, volume]) => ({
      price,
      volume,
      tpo: totalVolume > 0 ? Math.round((volume / totalVolume) * 100) : 0,
      valueArea: false,
      poc: false
    }))
    .sort((a, b) => b.volume - a.volume)
  
  // POC (Point of Control) 설정 - 가장 많은 볼륨
  if (profile.length > 0) {
    profile[0].poc = true
  }
  
  // Value Area 계산 (70% 볼륨이 집중된 구역)
  if (profile.length > 0 && totalVolume > 0) {
    let accumulatedVolume = 0
    const targetVolume = totalVolume * FOOTPRINT_CONFIG.VALUE_AREA_PERCENTAGE
    
    for (const level of profile) {
      if (accumulatedVolume < targetVolume) {
        level.valueArea = true
        accumulatedVolume += level.volume
      }
    }
  }
  
  // 가격순으로 정렬하여 반환
  return profile.sort((a, b) => b.price - a.price)
}

// Binance API 깊이 데이터에서 실제 마켓 프로파일 생성
export async function generateSampleMarketProfile(
  currentPrice: number,
  symbol: string
): Promise<MarketProfile[]> {
  try {
    // Binance API에서 오더북(깊이) 데이터 가져오기
    const response = await fetch(`/api/binance/depth?symbol=${symbol}&limit=100`)
    
    if (!response.ok) {
      console.error('오더북 데이터 로드 실패')
      return []
    }
    
    const depthData = await response.json()
    const profile: MarketProfile[] = []
    
    // 매수 호가 처리 (bids)
    if (depthData.bids) {
      depthData.bids.forEach(([price, quantity]: [string, string]) => {
        profile.push({
          price: parseFloat(price),
          volume: parseFloat(quantity),
          tpo: 0,
          valueArea: false,
          poc: false
        })
      })
    }
    
    // 매도 호가 처리 (asks)
    if (depthData.asks) {
      depthData.asks.forEach(([price, quantity]: [string, string]) => {
        const existingLevel = profile.find(p => p.price === parseFloat(price))
        if (existingLevel) {
          existingLevel.volume += parseFloat(quantity)
        } else {
          profile.push({
            price: parseFloat(price),
            volume: parseFloat(quantity),
            tpo: 0,
            valueArea: false,
            poc: false
          })
        }
      })
    }
    
    // 전체 볼륨 계산
    const totalVolume = profile.reduce((sum, p) => sum + p.volume, 0)
    
    // TPO (Time Price Opportunity) 계산
    profile.forEach(p => {
      p.tpo = totalVolume > 0 ? Math.round((p.volume / totalVolume) * 100) : 0
    })
    
    // 볼륨 기준으로 정렬하여 POC 찾기
    const sortedByVolume = [...profile].sort((a, b) => b.volume - a.volume)
    if (sortedByVolume.length > 0) {
      sortedByVolume[0].poc = true
    }
    
    // Value Area 설정 (70% 볼륨이 집중된 구역)
    let accumulatedVolume = 0
    const targetVolume = totalVolume * FOOTPRINT_CONFIG.VALUE_AREA_PERCENTAGE
    
    for (const level of sortedByVolume) {
      if (accumulatedVolume < targetVolume) {
        level.valueArea = true
        accumulatedVolume += level.volume
      }
    }
    
    // 가격순으로 정렬하여 반환
    return profile.sort((a, b) => b.price - a.price)
  } catch (error) {
    console.error('마켓 프로파일 생성 실패:', error)
    return []
  }
}

function getPriceStep(symbol: string): number {
  const config = FOOTPRINT_CONFIG.PRICE_GROUPING[symbol]
  if (config) return config * 10
  
  if (symbol.includes('BTC')) return 100
  if (symbol.includes('ETH')) return 10
  if (symbol.includes('BNB')) return 5
  return 1
}