// 거래량 프로파일 계산 함수

interface VolumeProfileBin {
  priceLevel: number
  volume: number
  buyVolume: number
  sellVolume: number
  pocLevel?: boolean // Point of Control
}

/**
 * 거래량 프로파일을 계산합니다
 * @param data - 가격과 거래량 데이터
 * @param bins - 가격대 구간 수 (기본 20)
 * @returns 가격대별 거래량 프로파일
 */
export function calculateVolumeProfile(
  data: Array<{
    high: number
    low: number
    close: number
    volume: number
  }>,
  bins: number = 20
): VolumeProfileBin[] {
  if (!data || data.length === 0) return []

  // 전체 가격 범위 찾기
  let minPrice = Infinity
  let maxPrice = -Infinity
  
  data.forEach(candle => {
    minPrice = Math.min(minPrice, candle.low)
    maxPrice = Math.max(maxPrice, candle.high)
  })

  // 가격대 구간 크기 계산
  const binSize = (maxPrice - minPrice) / bins
  
  // 각 구간별 거래량 초기화
  const profile: Map<number, VolumeProfileBin> = new Map()
  
  for (let i = 0; i < bins; i++) {
    const priceLevel = minPrice + (i * binSize) + (binSize / 2) // 구간 중앙값
    profile.set(i, {
      priceLevel,
      volume: 0,
      buyVolume: 0,
      sellVolume: 0
    })
  }

  // 각 캔들의 거래량을 해당 가격대에 분배
  data.forEach((candle, index) => {
    // 캔들이 걸쳐있는 모든 구간 찾기
    const lowBin = Math.floor((candle.low - minPrice) / binSize)
    const highBin = Math.floor((candle.high - minPrice) / binSize)
    
    // 거래량을 구간에 비례 분배
    const range = candle.high - candle.low
    const isBullish = index > 0 ? candle.close > data[index - 1].close : true
    
    for (let bin = lowBin; bin <= highBin && bin < bins; bin++) {
      const binStart = minPrice + (bin * binSize)
      const binEnd = binStart + binSize
      
      // 캔들과 구간이 겹치는 부분 계산
      const overlapStart = Math.max(candle.low, binStart)
      const overlapEnd = Math.min(candle.high, binEnd)
      const overlapRange = Math.max(0, overlapEnd - overlapStart)
      
      // 비례 분배된 거래량
      const volumeShare = range > 0 ? (overlapRange / range) * candle.volume : candle.volume / bins
      
      const binData = profile.get(bin)
      if (binData) {
        binData.volume += volumeShare
        if (isBullish) {
          binData.buyVolume += volumeShare
        } else {
          binData.sellVolume += volumeShare
        }
      }
    }
  })

  // 배열로 변환 및 POC(Point of Control) 찾기
  const result = Array.from(profile.values())
  
  // 최대 거래량 구간 찾기 (POC)
  let maxVolume = 0
  result.forEach(bin => {
    if (bin.volume > maxVolume) {
      maxVolume = bin.volume
    }
  })
  
  // POC 표시
  result.forEach(bin => {
    if (bin.volume === maxVolume) {
      bin.pocLevel = true
    }
  })

  return result.sort((a, b) => a.priceLevel - b.priceLevel)
}

/**
 * 가격대별 거래량 비율을 계산합니다
 * @param profile - 거래량 프로파일 데이터
 * @returns 비율이 계산된 프로파일
 */
export function calculateVolumeProfilePercentage(
  profile: VolumeProfileBin[]
): Array<VolumeProfileBin & { percentage: number }> {
  const totalVolume = profile.reduce((sum, bin) => sum + bin.volume, 0)
  
  return profile.map(bin => ({
    ...bin,
    percentage: totalVolume > 0 ? (bin.volume / totalVolume) * 100 : 0
  }))
}

/**
 * Value Area를 계산합니다 (70% 거래량이 발생한 구간)
 * @param profile - 거래량 프로파일 데이터
 * @returns Value Area High, Low, POC
 */
export function calculateValueArea(
  profile: VolumeProfileBin[]
): {
  vah: number // Value Area High
  val: number // Value Area Low
  poc: number // Point of Control
} {
  // POC 찾기
  let poc = 0
  let pocIndex = 0
  let maxVolume = 0
  
  profile.forEach((bin, index) => {
    if (bin.volume > maxVolume) {
      maxVolume = bin.volume
      poc = bin.priceLevel
      pocIndex = index
    }
  })

  // 전체 거래량의 70% 계산
  const totalVolume = profile.reduce((sum, bin) => sum + bin.volume, 0)
  const targetVolume = totalVolume * 0.7
  
  // POC부터 시작해서 양방향으로 확장
  let accumulatedVolume = profile[pocIndex].volume
  let lowIndex = pocIndex
  let highIndex = pocIndex
  
  while (accumulatedVolume < targetVolume && (lowIndex > 0 || highIndex < profile.length - 1)) {
    let nextLowVolume = lowIndex > 0 ? profile[lowIndex - 1].volume : 0
    let nextHighVolume = highIndex < profile.length - 1 ? profile[highIndex + 1].volume : 0
    
    if (nextLowVolume >= nextHighVolume && lowIndex > 0) {
      lowIndex--
      accumulatedVolume += profile[lowIndex].volume
    } else if (highIndex < profile.length - 1) {
      highIndex++
      accumulatedVolume += profile[highIndex].volume
    } else if (lowIndex > 0) {
      lowIndex--
      accumulatedVolume += profile[lowIndex].volume
    }
  }

  return {
    vah: profile[highIndex].priceLevel,
    val: profile[lowIndex].priceLevel,
    poc
  }
}