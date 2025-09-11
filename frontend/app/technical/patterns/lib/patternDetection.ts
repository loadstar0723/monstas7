interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface PatternResult {
  type: string
  name: string
  startIndex: number
  endIndex: number
  startTime: number
  endTime: number
  confidence: number
  direction: 'bullish' | 'bearish'
  neckline?: number
  targetPrice?: number
  stopLoss?: number
  keyPoints: { index: number; price: number; label: string }[]
}

// 유틸리티 함수들
const findLocalMaxima = (data: CandleData[], window: number = 5): number[] => {
  const maxima: number[] = []
  for (let i = window; i < data.length - window; i++) {
    let isMaxima = true
    for (let j = i - window; j <= i + window; j++) {
      if (j !== i && data[j].high >= data[i].high) {
        isMaxima = false
        break
      }
    }
    if (isMaxima) maxima.push(i)
  }
  return maxima
}

const findLocalMinima = (data: CandleData[], window: number = 5): number[] => {
  const minima: number[] = []
  for (let i = window; i < data.length - window; i++) {
    let isMinima = true
    for (let j = i - window; j <= i + window; j++) {
      if (j !== i && data[j].low <= data[i].low) {
        isMinima = false
        break
      }
    }
    if (isMinima) minima.push(i)
  }
  return minima
}

const calculateTrendline = (points: { x: number; y: number }[]): { slope: number; intercept: number } => {
  const n = points.length
  const sumX = points.reduce((sum, p) => sum + p.x, 0)
  const sumY = points.reduce((sum, p) => sum + p.y, 0)
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  return { slope, intercept }
}

// 헤드앤숄더 패턴 감지
export const detectHeadAndShoulders = (data: CandleData[]): PatternResult[] => {
  const patterns: PatternResult[] = []
  const maxima = findLocalMaxima(data, 10)
  const minima = findLocalMinima(data, 10)
  
  // 최소 5개의 극값이 필요 (왼쪽 어깨, 왼쪽 계곡, 머리, 오른쪽 계곡, 오른쪽 어깨)
  for (let i = 0; i < maxima.length - 2; i++) {
    const leftShoulder = maxima[i]
    const head = maxima[i + 1]
    const rightShoulder = maxima[i + 2]
    
    // 머리가 양쪽 어깨보다 높아야 함
    if (data[head].high > data[leftShoulder].high && 
        data[head].high > data[rightShoulder].high) {
      
      // 양쪽 어깨의 높이가 비슷해야 함 (10% 오차 허용)
      const shoulderDiff = Math.abs(data[leftShoulder].high - data[rightShoulder].high) / data[leftShoulder].high
      if (shoulderDiff < 0.1) {
        
        // 넥라인 찾기 (계곡들의 평균)
        const valleys = minima.filter(m => m > leftShoulder && m < rightShoulder)
        if (valleys.length >= 2) {
          const neckline = valleys.reduce((sum, v) => sum + data[v].low, 0) / valleys.length
          
          // 신뢰도 계산
          const symmetry = 1 - shoulderDiff
          const heightRatio = (data[head].high - neckline) / neckline
          const confidence = Math.min(95, symmetry * 50 + heightRatio * 100)
          
          // 목표가 계산 (헤드에서 넥라인까지의 거리만큼 하방)
          const patternHeight = data[head].high - neckline
          const targetPrice = neckline - patternHeight
          const stopLoss = data[rightShoulder].high
          
          patterns.push({
            type: 'headAndShoulders',
            name: '헤드앤숄더',
            startIndex: leftShoulder,
            endIndex: rightShoulder,
            startTime: data[leftShoulder].time,
            endTime: data[rightShoulder].time,
            confidence,
            direction: 'bearish',
            neckline,
            targetPrice,
            stopLoss,
            keyPoints: [
              { index: leftShoulder, price: data[leftShoulder].high, label: '왼쪽 어깨' },
              { index: head, price: data[head].high, label: '머리' },
              { index: rightShoulder, price: data[rightShoulder].high, label: '오른쪽 어깨' }
            ]
          })
        }
      }
    }
  }
  
  return patterns
}

// 역헤드앤숄더 패턴 감지
export const detectInverseHeadAndShoulders = (data: CandleData[]): PatternResult[] => {
  const patterns: PatternResult[] = []
  const minima = findLocalMinima(data, 10)
  const maxima = findLocalMaxima(data, 10)
  
  for (let i = 0; i < minima.length - 2; i++) {
    const leftShoulder = minima[i]
    const head = minima[i + 1]
    const rightShoulder = minima[i + 2]
    
    if (data[head].low < data[leftShoulder].low && 
        data[head].low < data[rightShoulder].low) {
      
      const shoulderDiff = Math.abs(data[leftShoulder].low - data[rightShoulder].low) / data[leftShoulder].low
      if (shoulderDiff < 0.1) {
        
        const peaks = maxima.filter(m => m > leftShoulder && m < rightShoulder)
        if (peaks.length >= 2) {
          const neckline = peaks.reduce((sum, p) => sum + data[p].high, 0) / peaks.length
          
          const symmetry = 1 - shoulderDiff
          const heightRatio = (neckline - data[head].low) / data[head].low
          const confidence = Math.min(95, symmetry * 50 + heightRatio * 100)
          
          const patternHeight = neckline - data[head].low
          const targetPrice = neckline + patternHeight
          const stopLoss = data[rightShoulder].low
          
          patterns.push({
            type: 'inverseHeadAndShoulders',
            name: '역헤드앤숄더',
            startIndex: leftShoulder,
            endIndex: rightShoulder,
            startTime: data[leftShoulder].time,
            endTime: data[rightShoulder].time,
            confidence,
            direction: 'bullish',
            neckline,
            targetPrice,
            stopLoss,
            keyPoints: [
              { index: leftShoulder, price: data[leftShoulder].low, label: '왼쪽 어깨' },
              { index: head, price: data[head].low, label: '머리' },
              { index: rightShoulder, price: data[rightShoulder].low, label: '오른쪽 어깨' }
            ]
          })
        }
      }
    }
  }
  
  return patterns
}

// 이중천정 패턴 감지
export const detectDoubleTop = (data: CandleData[]): PatternResult[] => {
  const patterns: PatternResult[] = []
  const maxima = findLocalMaxima(data, 8)
  const minima = findLocalMinima(data, 8)
  
  for (let i = 0; i < maxima.length - 1; i++) {
    const firstTop = maxima[i]
    const secondTop = maxima[i + 1]
    
    // 두 천정의 높이가 비슷해야 함 (3% 오차 허용)
    const topDiff = Math.abs(data[firstTop].high - data[secondTop].high) / data[firstTop].high
    if (topDiff < 0.03) {
      
      // 중간 계곡 찾기
      const valley = minima.find(m => m > firstTop && m < secondTop)
      if (valley) {
        // 계곡이 천정보다 최소 5% 낮아야 함
        const depthRatio = (data[firstTop].high - data[valley].low) / data[firstTop].high
        if (depthRatio > 0.05) {
          
          const neckline = data[valley].low
          const confidence = Math.min(90, (1 - topDiff) * 50 + depthRatio * 200)
          
          const patternHeight = data[firstTop].high - neckline
          const targetPrice = neckline - patternHeight
          const stopLoss = Math.max(data[firstTop].high, data[secondTop].high) * 1.01
          
          patterns.push({
            type: 'doubleTop',
            name: '이중천정',
            startIndex: firstTop,
            endIndex: secondTop,
            startTime: data[firstTop].time,
            endTime: data[secondTop].time,
            confidence,
            direction: 'bearish',
            neckline,
            targetPrice,
            stopLoss,
            keyPoints: [
              { index: firstTop, price: data[firstTop].high, label: '첫 번째 천정' },
              { index: valley, price: data[valley].low, label: '계곡' },
              { index: secondTop, price: data[secondTop].high, label: '두 번째 천정' }
            ]
          })
        }
      }
    }
  }
  
  return patterns
}

// 이중바닥 패턴 감지
export const detectDoubleBottom = (data: CandleData[]): PatternResult[] => {
  const patterns: PatternResult[] = []
  const minima = findLocalMinima(data, 8)
  const maxima = findLocalMaxima(data, 8)
  
  for (let i = 0; i < minima.length - 1; i++) {
    const firstBottom = minima[i]
    const secondBottom = minima[i + 1]
    
    const bottomDiff = Math.abs(data[firstBottom].low - data[secondBottom].low) / data[firstBottom].low
    if (bottomDiff < 0.03) {
      
      const peak = maxima.find(m => m > firstBottom && m < secondBottom)
      if (peak) {
        const heightRatio = (data[peak].high - data[firstBottom].low) / data[firstBottom].low
        if (heightRatio > 0.05) {
          
          const neckline = data[peak].high
          const confidence = Math.min(90, (1 - bottomDiff) * 50 + heightRatio * 200)
          
          const patternHeight = neckline - data[firstBottom].low
          const targetPrice = neckline + patternHeight
          const stopLoss = Math.min(data[firstBottom].low, data[secondBottom].low) * 0.99
          
          patterns.push({
            type: 'doubleBottom',
            name: '이중바닥',
            startIndex: firstBottom,
            endIndex: secondBottom,
            startTime: data[firstBottom].time,
            endTime: data[secondBottom].time,
            confidence,
            direction: 'bullish',
            neckline,
            targetPrice,
            stopLoss,
            keyPoints: [
              { index: firstBottom, price: data[firstBottom].low, label: '첫 번째 바닥' },
              { index: peak, price: data[peak].high, label: '피크' },
              { index: secondBottom, price: data[secondBottom].low, label: '두 번째 바닥' }
            ]
          })
        }
      }
    }
  }
  
  return patterns
}

// 상승 삼각형 패턴 감지
export const detectAscendingTriangle = (data: CandleData[], minLength: number = 20): PatternResult[] => {
  const patterns: PatternResult[] = []
  const maxima = findLocalMaxima(data, 5)
  const minima = findLocalMinima(data, 5)
  
  // 연속된 구간에서 패턴 찾기
  for (let start = 0; start < data.length - minLength; start++) {
    const end = Math.min(start + 60, data.length - 1) // 최대 60개 캔들
    
    // 이 구간의 고점들
    const highs = maxima.filter(i => i >= start && i <= end)
    const lows = minima.filter(i => i >= start && i <= end)
    
    if (highs.length >= 3 && lows.length >= 2) {
      // 고점들이 수평 저항선 형성하는지 확인
      const highPrices = highs.map(i => data[i].high)
      const avgHigh = highPrices.reduce((sum, h) => sum + h, 0) / highPrices.length
      const highDeviation = Math.max(...highPrices.map(h => Math.abs(h - avgHigh))) / avgHigh
      
      if (highDeviation < 0.02) { // 2% 이내 오차
        // 저점들이 상승 추세선 형성하는지 확인
        const lowPoints = lows.map(i => ({ x: i - start, y: data[i].low }))
        const { slope } = calculateTrendline(lowPoints)
        
        if (slope > 0) { // 상승 추세
          const confidence = Math.min(85, (1 - highDeviation) * 50 + Math.min(slope * 1000, 35))
          
          const resistance = avgHigh
          const targetPrice = resistance + (resistance - data[lows[0]].low)
          const stopLoss = data[lows[lows.length - 1]].low * 0.98
          
          patterns.push({
            type: 'ascendingTriangle',
            name: '상승삼각형',
            startIndex: start,
            endIndex: end,
            startTime: data[start].time,
            endTime: data[end].time,
            confidence,
            direction: 'bullish',
            neckline: resistance,
            targetPrice,
            stopLoss,
            keyPoints: [
              ...highs.map(i => ({ index: i, price: data[i].high, label: '저항선' })),
              ...lows.map(i => ({ index: i, price: data[i].low, label: '지지선' }))
            ]
          })
          
          start = end // 중복 방지를 위해 건너뛰기
        }
      }
    }
  }
  
  return patterns
}

// 하락 삼각형 패턴 감지
export const detectDescendingTriangle = (data: CandleData[], minLength: number = 20): PatternResult[] => {
  const patterns: PatternResult[] = []
  const maxima = findLocalMaxima(data, 5)
  const minima = findLocalMinima(data, 5)
  
  for (let start = 0; start < data.length - minLength; start++) {
    const end = Math.min(start + 60, data.length - 1)
    
    const highs = maxima.filter(i => i >= start && i <= end)
    const lows = minima.filter(i => i >= start && i <= end)
    
    if (highs.length >= 2 && lows.length >= 3) {
      // 저점들이 수평 지지선 형성하는지 확인
      const lowPrices = lows.map(i => data[i].low)
      const avgLow = lowPrices.reduce((sum, l) => sum + l, 0) / lowPrices.length
      const lowDeviation = Math.max(...lowPrices.map(l => Math.abs(l - avgLow))) / avgLow
      
      if (lowDeviation < 0.02) {
        // 고점들이 하락 추세선 형성하는지 확인
        const highPoints = highs.map(i => ({ x: i - start, y: data[i].high }))
        const { slope } = calculateTrendline(highPoints)
        
        if (slope < 0) { // 하락 추세
          const confidence = Math.min(85, (1 - lowDeviation) * 50 + Math.min(Math.abs(slope) * 1000, 35))
          
          const support = avgLow
          const targetPrice = support - (data[highs[0]].high - support)
          const stopLoss = data[highs[highs.length - 1]].high * 1.02
          
          patterns.push({
            type: 'descendingTriangle',
            name: '하락삼각형',
            startIndex: start,
            endIndex: end,
            startTime: data[start].time,
            endTime: data[end].time,
            confidence,
            direction: 'bearish',
            neckline: support,
            targetPrice,
            stopLoss,
            keyPoints: [
              ...highs.map(i => ({ index: i, price: data[i].high, label: '저항선' })),
              ...lows.map(i => ({ index: i, price: data[i].low, label: '지지선' }))
            ]
          })
          
          start = end
        }
      }
    }
  }
  
  return patterns
}

// 대칭 삼각형 패턴 감지
export const detectSymmetricalTriangle = (data: CandleData[], minLength: number = 20): PatternResult[] => {
  const patterns: PatternResult[] = []
  const maxima = findLocalMaxima(data, 5)
  const minima = findLocalMinima(data, 5)
  
  for (let start = 0; start < data.length - minLength; start++) {
    const end = Math.min(start + 60, data.length - 1)
    
    const highs = maxima.filter(i => i >= start && i <= end)
    const lows = minima.filter(i => i >= start && i <= end)
    
    if (highs.length >= 2 && lows.length >= 2) {
      // 고점 추세선
      const highPoints = highs.map(i => ({ x: i - start, y: data[i].high }))
      const highTrend = calculateTrendline(highPoints)
      
      // 저점 추세선
      const lowPoints = lows.map(i => ({ x: i - start, y: data[i].low }))
      const lowTrend = calculateTrendline(lowPoints)
      
      // 수렴하는 삼각형인지 확인 (반대 방향 기울기)
      if (highTrend.slope < 0 && lowTrend.slope > 0) {
        const convergenceRate = Math.abs(highTrend.slope) + Math.abs(lowTrend.slope)
        const confidence = Math.min(80, convergenceRate * 500)
        
        // 브레이크아웃 방향은 이전 추세에 따라
        const preTrend = data[start].close > data[Math.max(0, start - 20)].close ? 'bullish' : 'bearish'
        
        const midPrice = (data[end].high + data[end].low) / 2
        const patternHeight = data[highs[0]].high - data[lows[0]].low
        const targetPrice = preTrend === 'bullish' ? midPrice + patternHeight : midPrice - patternHeight
        const stopLoss = preTrend === 'bullish' ? data[lows[lows.length - 1]].low : data[highs[highs.length - 1]].high
        
        patterns.push({
          type: 'symmetricalTriangle',
          name: '대칭삼각형',
          startIndex: start,
          endIndex: end,
          startTime: data[start].time,
          endTime: data[end].time,
          confidence,
          direction: preTrend as 'bullish' | 'bearish',
          targetPrice,
          stopLoss,
          keyPoints: [
            ...highs.map(i => ({ index: i, price: data[i].high, label: '고점' })),
            ...lows.map(i => ({ index: i, price: data[i].low, label: '저점' }))
          ]
        })
        
        start = end
      }
    }
  }
  
  return patterns
}

// 플래그 패턴 감지
export const detectFlag = (data: CandleData[], minFlagLength: number = 5): PatternResult[] => {
  const patterns: PatternResult[] = []
  
  for (let i = 15; i < data.length - minFlagLength; i++) {
    // 플래그폴 찾기 (강한 상승 또는 하락)
    const poleStart = Math.max(0, i - 15)
    const poleEnd = i
    const poleMove = (data[poleEnd].close - data[poleStart].close) / data[poleStart].close
    
    if (Math.abs(poleMove) > 0.1) { // 10% 이상 움직임
      // 플래그 부분 찾기 (작은 채널)
      const flagLength = Math.min(20, data.length - i - 1)
      let isFlag = true
      let flagSlope = 0
      
      if (flagLength >= minFlagLength) {
        const flagHighs: number[] = []
        const flagLows: number[] = []
        
        for (let j = 0; j < flagLength; j++) {
          flagHighs.push(data[i + j].high)
          flagLows.push(data[i + j].low)
        }
        
        // 플래그의 기울기 계산
        const highPoints = flagHighs.map((h, idx) => ({ x: idx, y: h }))
        const lowPoints = flagLows.map((l, idx) => ({ x: idx, y: l }))
        const highTrend = calculateTrendline(highPoints)
        const lowTrend = calculateTrendline(lowPoints)
        
        flagSlope = (highTrend.slope + lowTrend.slope) / 2
        
        // 플래그는 폴과 반대 방향으로 기울어짐
        if ((poleMove > 0 && flagSlope < 0) || (poleMove < 0 && flagSlope > 0)) {
          const channelWidth = Math.max(...flagHighs) - Math.min(...flagLows)
          const avgPrice = (Math.max(...flagHighs) + Math.min(...flagLows)) / 2
          
          if (channelWidth / avgPrice < 0.05) { // 좁은 채널
            const confidence = Math.min(85, Math.abs(poleMove) * 300 + (1 - channelWidth / avgPrice) * 50)
            const direction = poleMove > 0 ? 'bullish' : 'bearish'
            
            const targetPrice = direction === 'bullish' 
              ? data[i + flagLength - 1].close + Math.abs(data[poleEnd].close - data[poleStart].close)
              : data[i + flagLength - 1].close - Math.abs(data[poleEnd].close - data[poleStart].close)
            
            const stopLoss = direction === 'bullish' ? Math.min(...flagLows) : Math.max(...flagHighs)
            
            patterns.push({
              type: 'flag',
              name: direction === 'bullish' ? '상승플래그' : '하락플래그',
              startIndex: poleStart,
              endIndex: i + flagLength - 1,
              startTime: data[poleStart].time,
              endTime: data[i + flagLength - 1].time,
              confidence,
              direction,
              targetPrice,
              stopLoss,
              keyPoints: [
                { index: poleStart, price: data[poleStart].close, label: '폴 시작' },
                { index: poleEnd, price: data[poleEnd].close, label: '폴 끝' },
                { index: i + Math.floor(flagLength / 2), price: avgPrice, label: '플래그 중심' }
              ]
            })
            
            i += flagLength // 중복 방지
          }
        }
      }
    }
  }
  
  return patterns
}

// 웨지 패턴 감지
export const detectWedge = (data: CandleData[], minLength: number = 15): PatternResult[] => {
  const patterns: PatternResult[] = []
  const maxima = findLocalMaxima(data, 5)
  const minima = findLocalMinima(data, 5)
  
  for (let start = 0; start < data.length - minLength; start++) {
    const end = Math.min(start + 50, data.length - 1)
    
    const highs = maxima.filter(i => i >= start && i <= end)
    const lows = minima.filter(i => i >= start && i <= end)
    
    if (highs.length >= 2 && lows.length >= 2) {
      const highPoints = highs.map(i => ({ x: i - start, y: data[i].high }))
      const lowPoints = lows.map(i => ({ x: i - start, y: data[i].low }))
      
      const highTrend = calculateTrendline(highPoints)
      const lowTrend = calculateTrendline(lowPoints)
      
      // 웨지는 두 추세선이 같은 방향
      if (highTrend.slope * lowTrend.slope > 0) {
        const isRising = highTrend.slope > 0
        const convergenceRate = Math.abs(highTrend.slope - lowTrend.slope)
        
        if (convergenceRate > 0.0001) { // 수렴하는 웨지
          // 상승 웨지는 약세, 하락 웨지는 강세
          const direction = isRising ? 'bearish' : 'bullish'
          const confidence = Math.min(80, convergenceRate * 10000)
          
          const lastPrice = data[end].close
          const wedgeHeight = data[highs[0]].high - data[lows[0]].low
          const targetPrice = direction === 'bullish' ? lastPrice + wedgeHeight : lastPrice - wedgeHeight
          const stopLoss = direction === 'bullish' ? data[lows[lows.length - 1]].low : data[highs[highs.length - 1]].high
          
          patterns.push({
            type: 'wedge',
            name: isRising ? '상승웨지' : '하락웨지',
            startIndex: start,
            endIndex: end,
            startTime: data[start].time,
            endTime: data[end].time,
            confidence,
            direction,
            targetPrice,
            stopLoss,
            keyPoints: [
              ...highs.slice(0, 3).map(i => ({ index: i, price: data[i].high, label: '고점' })),
              ...lows.slice(0, 3).map(i => ({ index: i, price: data[i].low, label: '저점' }))
            ]
          })
          
          start = end - 10 // 약간 겹치게
        }
      }
    }
  }
  
  return patterns
}

// 컵앤핸들 패턴 감지
export const detectCupAndHandle = (data: CandleData[], minCupLength: number = 30): PatternResult[] => {
  const patterns: PatternResult[] = []
  
  for (let start = 0; start < data.length - minCupLength - 10; start++) {
    // 컵 부분 찾기
    let cupEnd = start + minCupLength
    let cupBottom = start
    let lowestPrice = data[start].low
    
    // U자 형태 확인
    for (let i = start + 1; i < cupEnd; i++) {
      if (data[i].low < lowestPrice) {
        lowestPrice = data[i].low
        cupBottom = i
      }
    }
    
    // 컵의 양쪽 끝이 비슷한 높이인지
    const leftRim = data[start].high
    const rightRim = data[cupEnd].high
    const rimDiff = Math.abs(leftRim - rightRim) / leftRim
    
    if (rimDiff < 0.05 && cupBottom > start + 5 && cupBottom < cupEnd - 5) {
      // 컵의 깊이
      const cupDepth = (leftRim - lowestPrice) / leftRim
      
      if (cupDepth > 0.12 && cupDepth < 0.35) { // 12-35% 깊이
        // 핸들 찾기
        const handleStart = cupEnd
        const handleEnd = Math.min(handleStart + 15, data.length - 1)
        
        let handleFound = false
        let handleLow = data[handleStart].low
        
        for (let i = handleStart + 1; i < handleEnd; i++) {
          if (data[i].low < handleLow) {
            handleLow = data[i].low
          }
          
          // 핸들은 컵의 50% 이상 되돌림 안됨
          const handleRetracement = (rightRim - handleLow) / (rightRim - lowestPrice)
          if (handleRetracement < 0.5 && i - handleStart > 3) {
            handleFound = true
            
            const confidence = Math.min(85, cupDepth * 200 + (1 - rimDiff) * 50)
            const targetPrice = rightRim + (rightRim - lowestPrice)
            const stopLoss = handleLow * 0.98
            
            patterns.push({
              type: 'cupAndHandle',
              name: '컵앤핸들',
              startIndex: start,
              endIndex: i,
              startTime: data[start].time,
              endTime: data[i].time,
              confidence,
              direction: 'bullish',
              targetPrice,
              stopLoss,
              keyPoints: [
                { index: start, price: leftRim, label: '왼쪽 림' },
                { index: cupBottom, price: lowestPrice, label: '컵 바닥' },
                { index: cupEnd, price: rightRim, label: '오른쪽 림' },
                { index: i, price: data[i].close, label: '핸들' }
              ]
            })
            
            start = i
            break
          }
        }
      }
    }
  }
  
  return patterns
}

// 사각형(박스) 패턴 감지
export const detectRectangle = (data: CandleData[], minLength: number = 15): PatternResult[] => {
  const patterns: PatternResult[] = []
  
  for (let start = 0; start < data.length - minLength; start++) {
    const end = Math.min(start + 50, data.length - 1)
    const rangeData = data.slice(start, end + 1)
    
    if (rangeData.length < minLength) continue
    
    // 고점과 저점의 평균과 편차 계산
    const highs = rangeData.map(d => d.high)
    const lows = rangeData.map(d => d.low)
    
    const avgHigh = highs.reduce((sum, h) => sum + h, 0) / highs.length
    const avgLow = lows.reduce((sum, l) => sum + l, 0) / lows.length
    
    const highStdDev = Math.sqrt(highs.reduce((sum, h) => sum + Math.pow(h - avgHigh, 2), 0) / highs.length)
    const lowStdDev = Math.sqrt(lows.reduce((sum, l) => sum + Math.pow(l - avgLow, 2), 0) / lows.length)
    
    // 표준편차가 작으면 수평 채널
    const highDevRatio = highStdDev / avgHigh
    const lowDevRatio = lowStdDev / avgLow
    
    if (highDevRatio < 0.01 && lowDevRatio < 0.01) {
      const channelHeight = avgHigh - avgLow
      const centerPrice = (avgHigh + avgLow) / 2
      
      // 최소 3번 이상 터치
      const highTouches = highs.filter(h => Math.abs(h - avgHigh) / avgHigh < 0.005).length
      const lowTouches = lows.filter(l => Math.abs(l - avgLow) / avgLow < 0.005).length
      
      if (highTouches >= 3 && lowTouches >= 3) {
        const confidence = Math.min(85, (highTouches + lowTouches) * 10)
        
        // 브레이크아웃 방향은 마지막 캔들 위치로
        const lastClose = data[end].close
        const direction = lastClose > centerPrice ? 'bullish' : 'bearish'
        
        const targetPrice = direction === 'bullish' ? avgHigh + channelHeight : avgLow - channelHeight
        const stopLoss = direction === 'bullish' ? avgLow * 0.99 : avgHigh * 1.01
        
        patterns.push({
          type: 'rectangle',
          name: '직사각형',
          startIndex: start,
          endIndex: end,
          startTime: data[start].time,
          endTime: data[end].time,
          confidence,
          direction,
          targetPrice,
          stopLoss,
          keyPoints: [
            { index: start, price: avgHigh, label: '상단' },
            { index: start, price: avgLow, label: '하단' },
            { index: Math.floor((start + end) / 2), price: centerPrice, label: '중심' }
          ]
        })
        
        start = end - 5
      }
    }
  }
  
  return patterns
}

// 모든 패턴 감지 통합 함수
export const detectAllPatterns = (data: CandleData[]): PatternResult[] => {
  const patterns: PatternResult[] = []
  
  // 각 패턴 감지 함수 실행
  patterns.push(...detectHeadAndShoulders(data))
  patterns.push(...detectInverseHeadAndShoulders(data))
  patterns.push(...detectDoubleTop(data))
  patterns.push(...detectDoubleBottom(data))
  patterns.push(...detectAscendingTriangle(data))
  patterns.push(...detectDescendingTriangle(data))
  patterns.push(...detectSymmetricalTriangle(data))
  patterns.push(...detectFlag(data))
  patterns.push(...detectWedge(data))
  patterns.push(...detectCupAndHandle(data))
  patterns.push(...detectRectangle(data))
  
  // 시간순 정렬
  patterns.sort((a, b) => a.startTime - b.startTime)
  
  // 겹치는 패턴 제거 (신뢰도가 높은 것 우선)
  const filteredPatterns: PatternResult[] = []
  for (const pattern of patterns) {
    const overlapping = filteredPatterns.find(p => 
      (pattern.startIndex >= p.startIndex && pattern.startIndex <= p.endIndex) ||
      (pattern.endIndex >= p.startIndex && pattern.endIndex <= p.endIndex)
    )
    
    if (!overlapping) {
      filteredPatterns.push(pattern)
    } else if (pattern.confidence > overlapping.confidence) {
      const index = filteredPatterns.indexOf(overlapping)
      filteredPatterns[index] = pattern
    }
  }
  
  return filteredPatterns
}

// 패턴 유효성 검증
export const validatePattern = (pattern: PatternResult, currentData: CandleData[]): boolean => {
  const lastCandle = currentData[currentData.length - 1]
  const patternAge = lastCandle.time - pattern.endTime
  
  // 패턴이 너무 오래됐으면 무효
  if (patternAge > 24 * 60 * 60 * 1000 * 7) { // 7일
    return false
  }
  
  // 목표가나 손절가에 도달했으면 무효
  if (pattern.targetPrice && pattern.stopLoss) {
    if (pattern.direction === 'bullish') {
      if (lastCandle.high >= pattern.targetPrice || lastCandle.low <= pattern.stopLoss) {
        return false
      }
    } else {
      if (lastCandle.low <= pattern.targetPrice || lastCandle.high >= pattern.stopLoss) {
        return false
      }
    }
  }
  
  return true
}

// 패턴 성공 여부 판단
export const evaluatePatternResult = (pattern: PatternResult, subsequentData: CandleData[]): 'success' | 'failure' | 'pending' => {
  if (!pattern.targetPrice || !pattern.stopLoss) return 'pending'
  
  for (const candle of subsequentData) {
    if (pattern.direction === 'bullish') {
      if (candle.high >= pattern.targetPrice) return 'success'
      if (candle.low <= pattern.stopLoss) return 'failure'
    } else {
      if (candle.low <= pattern.targetPrice) return 'success'
      if (candle.high >= pattern.stopLoss) return 'failure'
    }
  }
  
  return 'pending'
}