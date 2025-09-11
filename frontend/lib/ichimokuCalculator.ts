// 일목균형표 계산 함수
export interface IchimokuValues {
  tenkan: number    // 전환선 (9일)
  kijun: number     // 기준선 (26일)
  senkouA: number   // 선행스팬 A
  senkouB: number   // 선행스팬 B
  chikou: number    // 후행스팬
}

export function calculateIchimoku(
  data: Array<{ high: number; low: number; close: number }>,
  currentIndex: number
): IchimokuValues {
  // 전환선 (9일) - (9일 최고가 + 9일 최저가) / 2
  const tenkan = calculateMidPoint(data, currentIndex, 9)
  
  // 기준선 (26일) - (26일 최고가 + 26일 최저가) / 2
  const kijun = calculateMidPoint(data, currentIndex, 26)
  
  // 선행스팬 A - (전환선 + 기준선) / 2를 26일 앞으로
  const senkouA = (tenkan + kijun) / 2
  
  // 선행스팬 B - (52일 최고가 + 52일 최저가) / 2를 26일 앞으로
  const senkouB = calculateMidPoint(data, currentIndex, 52)
  
  // 후행스팬 - 현재 종가를 26일 뒤로
  const chikou = data[currentIndex]?.close || 0
  
  return {
    tenkan,
    kijun,
    senkouA,
    senkouB,
    chikou
  }
}

// 특정 기간의 중간값 계산 (최고가 + 최저가) / 2
function calculateMidPoint(
  data: Array<{ high: number; low: number; close: number }>,
  currentIndex: number,
  period: number
): number {
  const startIndex = Math.max(0, currentIndex - period + 1)
  const endIndex = currentIndex + 1
  const slicedData = data.slice(startIndex, endIndex)
  
  if (slicedData.length === 0) {
    return data[currentIndex]?.close || 0
  }
  
  const highs = slicedData.map(d => d.high)
  const lows = slicedData.map(d => d.low)
  
  const maxHigh = Math.max(...highs)
  const minLow = Math.min(...lows)
  
  return (maxHigh + minLow) / 2
}

// 일목균형표 신호 분석
export function analyzeIchimokuSignals(
  current: IchimokuValues,
  price: number
): {
  signal: string
  strength: number
  cross: string | null
  cloudPosition: string
  futureCloud: string
} {
  // 구름대 위치 판단
  const cloudTop = Math.max(current.senkouA, current.senkouB)
  const cloudBottom = Math.min(current.senkouA, current.senkouB)
  
  let cloudPosition = '구름 내부'
  if (price > cloudTop) {
    cloudPosition = '구름 위'
  } else if (price < cloudBottom) {
    cloudPosition = '구름 아래'
  }
  
  // 미래 구름 (선행스팬 A vs B)
  const futureCloud = current.senkouA > current.senkouB ? '양운 (녹색)' : '음운 (적색)'
  
  // 전환선/기준선 크로스
  let cross = null
  const crossDiff = current.tenkan - current.kijun
  if (Math.abs(crossDiff) < price * 0.001) { // 0.1% 이내면 크로스 임박
    cross = '전환선/기준선 크로스 임박!'
  }
  
  // 신호 강도 계산
  let strength = 0
  
  // 가격 위치 (40점)
  if (cloudPosition === '구름 위') strength += 40
  else if (cloudPosition === '구름 아래') strength -= 40
  
  // 전환선/기준선 관계 (30점)
  if (current.tenkan > current.kijun) strength += 30
  else strength -= 30
  
  // 미래 구름 (30점)
  if (futureCloud === '양운 (녹색)') strength += 30
  else strength -= 30
  
  // 종합 신호
  let signal = '중립'
  if (strength > 50) signal = '강한 매수'
  else if (strength > 20) signal = '매수'
  else if (strength < -50) signal = '강한 매도'
  else if (strength < -20) signal = '매도'
  
  return {
    signal,
    strength,
    cross,
    cloudPosition,
    futureCloud
  }
}

// 일목균형표 레벨 계산
export function getIchimokuLevels(ichimoku: IchimokuValues) {
  return {
    resistance: [
      { level: ichimoku.tenkan, label: '전환선 저항' },
      { level: ichimoku.kijun, label: '기준선 저항' },
      { level: Math.max(ichimoku.senkouA, ichimoku.senkouB), label: '구름 상단' }
    ],
    support: [
      { level: ichimoku.tenkan, label: '전환선 지지' },
      { level: ichimoku.kijun, label: '기준선 지지' },
      { level: Math.min(ichimoku.senkouA, ichimoku.senkouB), label: '구름 하단' }
    ]
  }
}