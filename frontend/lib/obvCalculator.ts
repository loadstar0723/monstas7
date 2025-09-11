// OBV (On-Balance Volume) 계산 함수

/**
 * OBV (온밸런스 볼륨)를 계산합니다
 * OBV = 이전 OBV + (현재 종가 > 이전 종가 ? 현재 거래량 : 현재 종가 < 이전 종가 ? -현재 거래량 : 0)
 * @param data - 가격과 거래량 데이터
 * @returns OBV 값 배열
 */
export function calculateOBV(
  data: Array<{
    close: number
    volume: number
  }>
): number[] {
  if (!data || data.length === 0) return []
  
  const obv: number[] = []
  
  // 첫 번째 OBV는 첫 번째 거래량
  obv.push(data[0].volume)
  
  // 두 번째부터 계산
  for (let i = 1; i < data.length; i++) {
    const currentClose = data[i].close
    const previousClose = data[i - 1].close
    const currentVolume = data[i].volume
    const previousOBV = obv[i - 1]
    
    let currentOBV: number
    
    if (currentClose > previousClose) {
      // 가격 상승: 거래량을 더함
      currentOBV = previousOBV + currentVolume
    } else if (currentClose < previousClose) {
      // 가격 하락: 거래량을 뺌
      currentOBV = previousOBV - currentVolume
    } else {
      // 가격 변화 없음: OBV 유지
      currentOBV = previousOBV
    }
    
    obv.push(currentOBV)
  }
  
  return obv
}

/**
 * OBV 트렌드를 분석합니다
 * @param obv - OBV 값 배열
 * @returns 트렌드 분석 결과
 */
export function analyzeOBVTrend(obv: number[]): {
  trend: 'bullish' | 'bearish' | 'neutral'
  divergence: 'positive' | 'negative' | 'none'
  strength: number
} {
  if (!obv || obv.length < 10) {
    return {
      trend: 'neutral',
      divergence: 'none',
      strength: 0
    }
  }
  
  // 최근 10개 데이터로 트렌드 분석
  const recentOBV = obv.slice(-10)
  const firstValue = recentOBV[0]
  const lastValue = recentOBV[recentOBV.length - 1]
  
  // 트렌드 계산
  const change = ((lastValue - firstValue) / Math.abs(firstValue)) * 100
  
  let trend: 'bullish' | 'bearish' | 'neutral'
  if (change > 5) {
    trend = 'bullish'
  } else if (change < -5) {
    trend = 'bearish'
  } else {
    trend = 'neutral'
  }
  
  // 강도 계산 (0-100)
  const strength = Math.min(100, Math.abs(change))
  
  // 다이버전스는 가격과 비교해야 하므로 여기서는 'none'으로 설정
  // 실제 구현에서는 가격 데이터와 비교 필요
  const divergence = 'none'
  
  return {
    trend,
    divergence,
    strength
  }
}

/**
 * OBV 시그널을 생성합니다
 * @param obv - OBV 값 배열
 * @param period - 시그널 라인 기간 (기본 20)
 * @returns OBV와 시그널 라인
 */
export function calculateOBVWithSignal(
  data: Array<{
    close: number
    volume: number
  }>,
  period: number = 20
): {
  obv: number[]
  signal: (number | null)[]
} {
  const obv = calculateOBV(data)
  const signal: (number | null)[] = []
  
  // 시그널 라인 (OBV의 이동평균)
  for (let i = 0; i < obv.length; i++) {
    if (i < period - 1) {
      signal.push(null)
    } else {
      const sum = obv.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      signal.push(sum / period)
    }
  }
  
  return { obv, signal }
}