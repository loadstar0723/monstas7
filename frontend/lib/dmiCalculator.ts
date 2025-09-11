// DMI (Directional Movement Index) 계산 함수

export interface DMIValues {
  plusDI: number   // +DI (상승 방향성 지수)
  minusDI: number  // -DI (하락 방향성 지수)
  adx: number      // ADX (평균 방향성 지수)
}

// True Range 계산
function calculateTrueRange(high: number, low: number, prevClose: number): number {
  return Math.max(
    high - low,                    // 현재 고가 - 현재 저가
    Math.abs(high - prevClose),    // 현재 고가 - 전날 종가
    Math.abs(low - prevClose)       // 현재 저가 - 전날 종가
  )
}

// Directional Movement 계산
function calculateDirectionalMovement(
  highCurrent: number,
  lowCurrent: number,
  highPrev: number,
  lowPrev: number
): { plusDM: number; minusDM: number } {
  const upMove = highCurrent - highPrev
  const downMove = lowPrev - lowCurrent
  
  let plusDM = 0
  let minusDM = 0
  
  if (upMove > downMove && upMove > 0) {
    plusDM = upMove
  }
  if (downMove > upMove && downMove > 0) {
    minusDM = downMove
  }
  
  return { plusDM, minusDM }
}

// Smoothed Average 계산 (Wilder's smoothing)
function calculateSmoothedAverage(values: number[], period: number): number {
  if (values.length < period) return 0
  
  // 첫 번째 값은 단순 평균
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += values[i]
  }
  let avg = sum / period
  
  // 나머지는 Wilder's smoothing
  for (let i = period; i < values.length; i++) {
    avg = (avg * (period - 1) + values[i]) / period
  }
  
  return avg
}

// DMI 계산
export function calculateDMI(
  data: Array<{ high: number; low: number; close: number }>,
  period: number = 14
): DMIValues {
  if (data.length < period + 1) {
    return { plusDI: 0, minusDI: 0, adx: 0 }
  }
  
  const trueRanges: number[] = []
  const plusDMs: number[] = []
  const minusDMs: number[] = []
  
  // TR과 DM 계산
  for (let i = 1; i < data.length; i++) {
    const tr = calculateTrueRange(data[i].high, data[i].low, data[i - 1].close)
    const { plusDM, minusDM } = calculateDirectionalMovement(
      data[i].high,
      data[i].low,
      data[i - 1].high,
      data[i - 1].low
    )
    
    trueRanges.push(tr)
    plusDMs.push(plusDM)
    minusDMs.push(minusDM)
  }
  
  // ATR, +DM, -DM의 smoothed average 계산
  const atr = calculateSmoothedAverage(trueRanges, period)
  const plusDMSmooth = calculateSmoothedAverage(plusDMs, period)
  const minusDMSmooth = calculateSmoothedAverage(minusDMs, period)
  
  // +DI와 -DI 계산
  const plusDI = atr > 0 ? (plusDMSmooth / atr) * 100 : 0
  const minusDI = atr > 0 ? (minusDMSmooth / atr) * 100 : 0
  
  // DX 계산
  const diSum = plusDI + minusDI
  const dx = diSum > 0 ? Math.abs(plusDI - minusDI) / diSum * 100 : 0
  
  // ADX는 DX의 이동평균 (여기서는 간단히 현재 DX 사용)
  const adx = dx
  
  return {
    plusDI: Math.min(100, Math.max(0, plusDI)),
    minusDI: Math.min(100, Math.max(0, minusDI)),
    adx: Math.min(100, Math.max(0, adx))
  }
}

// 여러 기간의 DMI 계산 (차트용)
export function calculateDMISeries(
  data: Array<{ high: number; low: number; close: number }>,
  period: number = 14
): Array<DMIValues> {
  const results: DMIValues[] = []
  
  for (let i = period; i < data.length; i++) {
    const slicedData = data.slice(0, i + 1)
    const dmi = calculateDMI(slicedData, period)
    results.push(dmi)
  }
  
  return results
}