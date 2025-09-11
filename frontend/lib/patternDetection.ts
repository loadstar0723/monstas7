// 실제 데이터 기반 차트 패턴 감지 알고리즘

export interface PatternData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface DetectedPattern {
  pattern: string
  startIndex: number
  endIndex: number
  reliability: number
  completion: number
  target: number
  stopLoss: number
  description: string
  timeToTarget: string
  action: string
  keyPoints: Array<{ index: number; price: number; type: string }>
  trendlines?: Array<{ start: { index: number; price: number }; end: { index: number; price: number } }>
  patternData?: any
}

// 피크와 밸리 찾기
export const findPeaksAndValleys = (data: PatternData[], lookback: number = 5): Array<{ index: number; price: number; type: 'peak' | 'valley' }> => {
  const points: Array<{ index: number; price: number; type: 'peak' | 'valley' }> = []
  
  for (let i = lookback; i < data.length - lookback; i++) {
    const current = data[i].high
    const currentLow = data[i].low
    
    // 피크 찾기
    let isPeak = true
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j !== i && data[j].high >= current) {
        isPeak = false
        break
      }
    }
    if (isPeak) {
      points.push({ index: i, price: current, type: 'peak' })
    }
    
    // 밸리 찾기
    let isValley = true
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j !== i && data[j].low <= currentLow) {
        isValley = false
        break
      }
    }
    if (isValley) {
      points.push({ index: i, price: currentLow, type: 'valley' })
    }
  }
  
  return points
}

// 헤드앤숄더 패턴 감지
export const detectHeadAndShoulders = (data: PatternData[]): DetectedPattern | null => {
  const peaks = findPeaksAndValleys(data).filter(p => p.type === 'peak')
  const valleys = findPeaksAndValleys(data).filter(p => p.type === 'valley')
  
  if (peaks.length < 3 || valleys.length < 2) return null
  
  // 최근 3개 피크 확인
  const recentPeaks = peaks.slice(-3)
  const [leftShoulder, head, rightShoulder] = recentPeaks
  
  // 헤드가 가장 높아야 함
  if (head.price <= leftShoulder.price || head.price <= rightShoulder.price) return null
  
  // 어깨들이 비슷한 높이여야 함 (5% 이내)
  const shoulderDiff = Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price
  if (shoulderDiff > 0.05) return null
  
  // 넥라인 찾기
  const necklineValleys = valleys.filter(v => 
    v.index > leftShoulder.index && v.index < rightShoulder.index
  )
  if (necklineValleys.length < 2) return null
  
  const neckline = (necklineValleys[0].price + necklineValleys[1].price) / 2
  const patternHeight = head.price - neckline
  const target = neckline - patternHeight
  
  return {
    pattern: '헤드앤숄더',
    startIndex: leftShoulder.index,
    endIndex: rightShoulder.index,
    reliability: 85 - (shoulderDiff * 100), // 어깨 대칭성에 따라 신뢰도 조정
    completion: 100,
    target,
    stopLoss: head.price,
    description: '하락 반전 패턴. 넥라인 하향 돌파 시 급락 예상',
    timeToTarget: '5-10일',
    action: '매도/숏 진입',
    keyPoints: [
      { index: leftShoulder.index, price: leftShoulder.price, type: 'leftShoulder' },
      { index: head.index, price: head.price, type: 'head' },
      { index: rightShoulder.index, price: rightShoulder.price, type: 'rightShoulder' }
    ],
    trendlines: [
      {
        start: { index: necklineValleys[0].index, price: necklineValleys[0].price },
        end: { index: necklineValleys[1].index, price: necklineValleys[1].price }
      }
    ],
    patternData: { neckline, patternHeight }
  }
}

// 더블탑/더블바텀 패턴 감지
export const detectDoubleTopBottom = (data: PatternData[]): DetectedPattern | null => {
  const peaks = findPeaksAndValleys(data).filter(p => p.type === 'peak')
  const valleys = findPeaksAndValleys(data).filter(p => p.type === 'valley')
  
  // 더블탑 체크
  if (peaks.length >= 2) {
    const [peak1, peak2] = peaks.slice(-2)
    const priceDiff = Math.abs(peak1.price - peak2.price) / peak1.price
    
    if (priceDiff < 0.03) { // 3% 이내 차이
      const middleValley = valleys.find(v => 
        v.index > peak1.index && v.index < peak2.index
      )
      
      if (middleValley) {
        const patternHeight = Math.max(peak1.price, peak2.price) - middleValley.price
        const target = middleValley.price - patternHeight
        
        return {
          pattern: '더블탑',
          startIndex: peak1.index,
          endIndex: peak2.index,
          reliability: 80 - (priceDiff * 100),
          completion: 100,
          target,
          stopLoss: Math.max(peak1.price, peak2.price) * 1.02,
          description: '하락 반전 패턴. 지지선 돌파 시 하락 예상',
          timeToTarget: '3-7일',
          action: '매도 준비',
          keyPoints: [
            { index: peak1.index, price: peak1.price, type: 'firstTop' },
            { index: peak2.index, price: peak2.price, type: 'secondTop' },
            { index: middleValley.index, price: middleValley.price, type: 'valley' }
          ],
          patternData: { resistance: Math.max(peak1.price, peak2.price), support: middleValley.price }
        }
      }
    }
  }
  
  // 더블바텀 체크
  if (valleys.length >= 2) {
    const [valley1, valley2] = valleys.slice(-2)
    const priceDiff = Math.abs(valley1.price - valley2.price) / valley1.price
    
    if (priceDiff < 0.03) { // 3% 이내 차이
      const middlePeak = peaks.find(p => 
        p.index > valley1.index && p.index < valley2.index
      )
      
      if (middlePeak) {
        const patternHeight = middlePeak.price - Math.min(valley1.price, valley2.price)
        const target = middlePeak.price + patternHeight
        
        return {
          pattern: '더블바텀',
          startIndex: valley1.index,
          endIndex: valley2.index,
          reliability: 80 - (priceDiff * 100),
          completion: 100,
          target,
          stopLoss: Math.min(valley1.price, valley2.price) * 0.98,
          description: '상승 반전 패턴. 저항선 돌파 시 상승 예상',
          timeToTarget: '3-7일',
          action: '매수 준비',
          keyPoints: [
            { index: valley1.index, price: valley1.price, type: 'firstBottom' },
            { index: valley2.index, price: valley2.price, type: 'secondBottom' },
            { index: middlePeak.index, price: middlePeak.price, type: 'peak' }
          ],
          patternData: { support: Math.min(valley1.price, valley2.price), resistance: middlePeak.price }
        }
      }
    }
  }
  
  return null
}

// 삼각형 패턴 감지
export const detectTriangle = (data: PatternData[]): DetectedPattern | null => {
  if (data.length < 20) return null
  
  const recentData = data.slice(-30)
  const peaks = findPeaksAndValleys(recentData).filter(p => p.type === 'peak')
  const valleys = findPeaksAndValleys(recentData).filter(p => p.type === 'valley')
  
  if (peaks.length < 2 || valleys.length < 2) return null
  
  // 상단 추세선 계산
  const upperTrendSlope = (peaks[peaks.length - 1].price - peaks[0].price) / (peaks[peaks.length - 1].index - peaks[0].index)
  const upperTrendIntercept = peaks[0].price - upperTrendSlope * peaks[0].index
  
  // 하단 추세선 계산
  const lowerTrendSlope = (valleys[valleys.length - 1].price - valleys[0].price) / (valleys[valleys.length - 1].index - valleys[0].index)
  const lowerTrendIntercept = valleys[0].price - lowerTrendSlope * valleys[0].index
  
  // 수렴점 계산
  const convergenceIndex = (upperTrendIntercept - lowerTrendIntercept) / (lowerTrendSlope - upperTrendSlope)
  
  // 패턴 타입 결정
  let patternType = '대칭 삼각형'
  let reliability = 70
  
  if (Math.abs(upperTrendSlope) < 0.001 && lowerTrendSlope > 0.001) {
    patternType = '상승 삼각형'
    reliability = 75
  } else if (upperTrendSlope < -0.001 && Math.abs(lowerTrendSlope) < 0.001) {
    patternType = '하락 삼각형'
    reliability = 75
  }
  
  const currentPrice = data[data.length - 1].close
  const patternHeight = peaks[0].price - valleys[0].price
  const target = patternType === '상승 삼각형' ? currentPrice + patternHeight :
                 patternType === '하락 삼각형' ? currentPrice - patternHeight :
                 currentPrice + (upperTrendSlope > 0 ? patternHeight : -patternHeight)
  
  return {
    pattern: patternType,
    startIndex: Math.min(peaks[0].index, valleys[0].index),
    endIndex: data.length - 1,
    reliability,
    completion: Math.min(100, ((data.length - 1) / convergenceIndex) * 100),
    target,
    stopLoss: patternType === '상승 삼각형' ? valleys[valleys.length - 1].price :
              patternType === '하락 삼각형' ? peaks[peaks.length - 1].price :
              currentPrice * (target > currentPrice ? 0.98 : 1.02),
    description: `${patternType} 패턴. 브레이크아웃 대기 중`,
    timeToTarget: '2-5일',
    action: patternType === '상승 삼각형' ? '매수 준비' :
            patternType === '하락 삼각형' ? '매도 준비' : '브레이크아웃 대기',
    keyPoints: [...peaks, ...valleys],
    trendlines: [
      {
        start: { index: peaks[0].index, price: peaks[0].price },
        end: { index: peaks[peaks.length - 1].index, price: peaks[peaks.length - 1].price }
      },
      {
        start: { index: valleys[0].index, price: valleys[0].price },
        end: { index: valleys[valleys.length - 1].index, price: valleys[valleys.length - 1].price }
      }
    ],
    patternData: { convergenceIndex, upperTrendSlope, lowerTrendSlope }
  }
}

// 컵앤핸들 패턴 감지
export const detectCupAndHandle = (data: PatternData[]): DetectedPattern | null => {
  if (data.length < 30) return null
  
  const recentData = data.slice(-40)
  const valleys = findPeaksAndValleys(recentData).filter(p => p.type === 'valley')
  
  if (valleys.length < 1) return null
  
  // 컵 부분 찾기 (U자 형태)
  const cupBottom = valleys.reduce((min, v) => v.price < min.price ? v : min)
  const cupStart = recentData.findIndex(d => d.close > cupBottom.price * 1.1)
  const cupEnd = recentData.slice(cupBottom.index).findIndex(d => d.close > cupBottom.price * 1.1) + cupBottom.index
  
  if (cupEnd - cupStart < 10) return null
  
  // 핸들 부분 찾기 (작은 하락)
  const handleData = recentData.slice(cupEnd)
  if (handleData.length < 5) return null
  
  const handleBottom = Math.min(...handleData.map(d => d.low))
  const cupHeight = recentData[cupStart].close - cupBottom.price
  const handleDepth = recentData[cupEnd].close - handleBottom
  
  // 핸들이 컵 깊이의 50% 이하여야 함
  if (handleDepth > cupHeight * 0.5) return null
  
  const target = recentData[cupEnd].close + cupHeight
  
  return {
    pattern: '컵앤핸들',
    startIndex: cupStart,
    endIndex: recentData.length - 1,
    reliability: 78,
    completion: 90,
    target,
    stopLoss: handleBottom,
    description: '강력한 상승 지속 패턴. 핸들 돌파 시 급등 예상',
    timeToTarget: '5-10일',
    action: '적극 매수',
    keyPoints: [
      { index: cupStart, price: recentData[cupStart].close, type: 'cupStart' },
      { index: cupBottom.index, price: cupBottom.price, type: 'cupBottom' },
      { index: cupEnd, price: recentData[cupEnd].close, type: 'cupEnd' }
    ],
    patternData: { cupHeight, handleDepth }
  }
}

// 플래그 패턴 감지
export const detectFlag = (data: PatternData[]): DetectedPattern | null => {
  if (data.length < 15) return null
  
  const poleData = data.slice(-15, -8)
  const flagData = data.slice(-8)
  
  // 폴 계산 (급격한 움직임)
  const poleMove = poleData[poleData.length - 1].close - poleData[0].close
  const polePercentMove = Math.abs(poleMove) / poleData[0].close
  
  if (polePercentMove < 0.05) return null // 5% 이상 움직임 필요
  
  // 플래그 계산 (작은 되돌림)
  const flagMove = flagData[flagData.length - 1].close - flagData[0].close
  const flagPercentMove = Math.abs(flagMove) / flagData[0].close
  
  // 플래그는 폴의 30% 이하 되돌림
  if (flagPercentMove > polePercentMove * 0.3) return null
  
  const isBullish = poleMove > 0
  const target = data[data.length - 1].close + poleMove
  
  return {
    pattern: isBullish ? '상승 플래그' : '하락 플래그',
    startIndex: data.length - 15,
    endIndex: data.length - 1,
    reliability: 72,
    completion: 85,
    target,
    stopLoss: isBullish ? 
      Math.min(...flagData.map(d => d.low)) :
      Math.max(...flagData.map(d => d.high)),
    description: `${isBullish ? '상승' : '하락'} 지속 패턴. 추세 재개 예상`,
    timeToTarget: '1-3일',
    action: isBullish ? '추가 매수' : '추가 매도',
    keyPoints: [
      { index: data.length - 15, price: poleData[0].close, type: 'poleStart' },
      { index: data.length - 8, price: poleData[poleData.length - 1].close, type: 'poleEnd' },
      { index: data.length - 1, price: data[data.length - 1].close, type: 'flagEnd' }
    ],
    patternData: { poleMove, flagMove, polePercentMove, flagPercentMove }
  }
}

// 웨지 패턴 감지
export const detectWedge = (data: PatternData[]): DetectedPattern | null => {
  if (data.length < 20) return null
  
  const recentData = data.slice(-25)
  const peaks = findPeaksAndValleys(recentData).filter(p => p.type === 'peak')
  const valleys = findPeaksAndValleys(recentData).filter(p => p.type === 'valley')
  
  if (peaks.length < 3 || valleys.length < 3) return null
  
  // 상단과 하단 추세선 기울기 계산
  const upperSlope = (peaks[peaks.length - 1].price - peaks[0].price) / (peaks[peaks.length - 1].index - peaks[0].index)
  const lowerSlope = (valleys[valleys.length - 1].price - valleys[0].price) / (valleys[valleys.length - 1].index - valleys[0].index)
  
  // 웨지 패턴 조건: 두 추세선이 같은 방향이고 수렴
  if (upperSlope * lowerSlope <= 0) return null // 방향이 다르면 삼각형
  
  const isRising = upperSlope > 0 && lowerSlope > 0
  const isFalling = upperSlope < 0 && lowerSlope < 0
  
  if (!isRising && !isFalling) return null
  
  const patternType = isRising ? '상승 웨지' : '하락 웨지'
  const currentPrice = data[data.length - 1].close
  const patternHeight = peaks[0].price - valleys[0].price
  
  // 웨지는 일반적으로 반대 방향으로 브레이크
  const target = isRising ? 
    currentPrice - patternHeight : // 상승 웨지는 하락 브레이크
    currentPrice + patternHeight   // 하락 웨지는 상승 브레이크
  
  return {
    pattern: patternType,
    startIndex: Math.min(peaks[0].index, valleys[0].index),
    endIndex: data.length - 1,
    reliability: 68,
    completion: 80,
    target,
    stopLoss: isRising ? 
      peaks[peaks.length - 1].price :
      valleys[valleys.length - 1].price,
    description: `${patternType} 패턴. ${isRising ? '하락' : '상승'} 반전 예상`,
    timeToTarget: '3-7일',
    action: isRising ? '매도 준비' : '매수 준비',
    keyPoints: [...peaks, ...valleys],
    trendlines: [
      {
        start: { index: peaks[0].index, price: peaks[0].price },
        end: { index: peaks[peaks.length - 1].index, price: peaks[peaks.length - 1].price }
      },
      {
        start: { index: valleys[0].index, price: valleys[0].price },
        end: { index: valleys[valleys.length - 1].index, price: valleys[valleys.length - 1].price }
      }
    ],
    patternData: { upperSlope, lowerSlope, isRising, isFalling }
  }
}

// 모든 패턴 감지 통합 함수
export const detectAllPatterns = (data: PatternData[]): DetectedPattern[] => {
  const patterns: DetectedPattern[] = []
  
  const headAndShoulders = detectHeadAndShoulders(data)
  if (headAndShoulders) patterns.push(headAndShoulders)
  
  const doubleTopBottom = detectDoubleTopBottom(data)
  if (doubleTopBottom) patterns.push(doubleTopBottom)
  
  const triangle = detectTriangle(data)
  if (triangle) patterns.push(triangle)
  
  const cupAndHandle = detectCupAndHandle(data)
  if (cupAndHandle) patterns.push(cupAndHandle)
  
  const flag = detectFlag(data)
  if (flag) patterns.push(flag)
  
  const wedge = detectWedge(data)
  if (wedge) patterns.push(wedge)
  
  // 신뢰도 순으로 정렬
  return patterns.sort((a, b) => b.reliability - a.reliability)
}