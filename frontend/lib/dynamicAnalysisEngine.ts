// 동적 분석 엔진 - 실시간 지표 해석 및 시그널 생성

export interface DynamicAnalysis {
  interpretation: string       // 실시간 해석
  significance: number         // 중요도 0-100
  confidence: number          // 신뢰도 %
  actionSuggestion: string    // 행동 제안
  historicalContext: string   // 역사적 맥락
  probabilityOutcome: {
    bullish: number           // 상승 확률
    bearish: number           // 하락 확률
    neutral: number           // 횡보 확률
  }
  keyLevels: {
    support: number[]
    resistance: number[]
    entry: number[]
    stopLoss: number
    takeProfit: number[]
  }
  riskReward: number
  timeframe: string
}

// RSI 동적 분석
export const analyzeRSI = (rsi: number, historicalRSI?: number[]): DynamicAnalysis => {
  const history = historicalRSI || [rsi]
  const avgRSI = history.length > 0 ? history.reduce((a, b) => a + b, 0) / history.length : rsi
  const rsiTrend = history.length > 1 ? rsi - history[history.length - 2] : 0
  
  let interpretation = ''
  let actionSuggestion = ''
  let significance = 50
  let confidence = 60
  
  if (rsi < 20) {
    interpretation = '극도의 과매도 구간 - 강력한 반등 신호'
    actionSuggestion = '분할 매수 시작, 단기 반등 대비'
    significance = 95
    confidence = 85
  } else if (rsi < 30) {
    interpretation = '과매도 구간 진입 - 매수 타이밍 관찰'
    actionSuggestion = '매수 준비, 추가 하락 대비 분할 매수'
    significance = 80
    confidence = 75
  } else if (rsi > 80) {
    interpretation = '극도의 과매수 구간 - 조정 임박'
    actionSuggestion = '이익 실현 권장, 신규 매수 금지'
    significance = 95
    confidence = 85
  } else if (rsi > 70) {
    interpretation = '과매수 구간 - 상승 모멘텀 강함'
    actionSuggestion = '일부 이익 실현, 추세 지속 관찰'
    significance = 80
    confidence = 75
  } else if (rsi > 50 && rsiTrend > 0) {
    interpretation = '상승 모멘텀 지속 - 추세 강화'
    actionSuggestion = '보유 지속, 추가 매수는 조정 시'
    significance = 60
    confidence = 65
  } else if (rsi < 50 && rsiTrend < 0) {
    interpretation = '하락 모멘텀 지속 - 약세 구간'
    actionSuggestion = '관망, 30 이하 진입 시 매수 검토'
    significance = 60
    confidence = 65
  } else {
    interpretation = '중립 구간 - 방향성 모호'
    actionSuggestion = '관망 유지, 명확한 신호 대기'
    significance = 40
    confidence = 50
  }
  
  const historicalContext = `지난 ${history.length}개 캔들 평균 RSI: ${avgRSI.toFixed(1)}, ` +
    `현재 ${rsi > avgRSI ? '평균 이상' : '평균 이하'} (${((rsi - avgRSI) / avgRSI * 100).toFixed(1)}%)`
  
  const probabilityOutcome = {
    bullish: rsi < 30 ? 70 : rsi > 70 ? 20 : 40,
    bearish: rsi > 70 ? 70 : rsi < 30 ? 20 : 40,
    neutral: Math.abs(rsi - 50) < 20 ? 40 : 20
  }
  
  return {
    interpretation,
    significance,
    confidence,
    actionSuggestion,
    historicalContext,
    probabilityOutcome,
    keyLevels: {
      support: [30, 20],
      resistance: [70, 80],
      entry: rsi < 30 ? [rsi, rsi + 5] : [rsi - 5, rsi],
      stopLoss: rsi < 30 ? 15 : 85,
      takeProfit: rsi < 30 ? [50, 60, 70] : [50, 40, 30]
    },
    riskReward: rsi < 30 || rsi > 70 ? 3 : 1.5,
    timeframe: '15분-1시간'
  }
}

// MACD 동적 분석
export const analyzeMACD = (macd: { line: number, signal: number, histogram: number }, price: number): DynamicAnalysis => {
  const crossover = macd.line > macd.signal && macd.histogram > 0
  const crossunder = macd.line < macd.signal && macd.histogram < 0
  const divergence = Math.abs(macd.line - macd.signal)
  
  let interpretation = ''
  let actionSuggestion = ''
  let significance = 50
  let confidence = 60
  
  if (crossover && macd.histogram > 0.5) {
    interpretation = '골든 크로스 발생 - 강력한 상승 신호'
    actionSuggestion = '적극 매수, 상승 추세 진입'
    significance = 90
    confidence = 80
  } else if (crossunder && macd.histogram < -0.5) {
    interpretation = '데드 크로스 발생 - 하락 전환 신호'
    actionSuggestion = '매도 또는 숏 포지션 진입'
    significance = 90
    confidence = 80
  } else if (macd.histogram > 0 && divergence > 1) {
    interpretation = '상승 모멘텀 강화 - 추세 가속'
    actionSuggestion = '보유 지속, 추가 매수 고려'
    significance = 70
    confidence = 70
  } else if (macd.histogram < 0 && divergence > 1) {
    interpretation = '하락 모멘텀 강화 - 추세 가속'
    actionSuggestion = '매도 유지, 반등 시 매도'
    significance = 70
    confidence = 70
  } else if (Math.abs(macd.histogram) < 0.1) {
    interpretation = '수렴 구간 - 추세 전환 임박'
    actionSuggestion = '포지션 축소, 방향성 확인 대기'
    significance = 60
    confidence = 55
  } else {
    interpretation = '추세 유지 중 - 모멘텀 관찰 필요'
    actionSuggestion = '현 포지션 유지, 변화 관찰'
    significance = 50
    confidence = 60
  }
  
  const historicalContext = `MACD 히스토그램: ${macd.histogram.toFixed(3)}, ` +
    `시그널 라인과의 거리: ${divergence.toFixed(3)}`
  
  const probabilityOutcome = {
    bullish: crossover ? 75 : macd.histogram > 0 ? 60 : 30,
    bearish: crossunder ? 75 : macd.histogram < 0 ? 60 : 30,
    neutral: Math.abs(macd.histogram) < 0.2 ? 40 : 10
  }
  
  return {
    interpretation,
    significance,
    confidence,
    actionSuggestion,
    historicalContext,
    probabilityOutcome,
    keyLevels: {
      support: [price * 0.98, price * 0.96],
      resistance: [price * 1.02, price * 1.04],
      entry: crossover ? [price, price * 1.005] : [price * 0.995, price],
      stopLoss: crossover ? price * 0.97 : price * 1.03,
      takeProfit: crossover ? [price * 1.02, price * 1.04, price * 1.06] : [price * 0.98, price * 0.96, price * 0.94]
    },
    riskReward: Math.abs(macd.histogram) > 0.5 ? 3 : 2,
    timeframe: '1시간-4시간'
  }
}

// 볼린저 밴드 동적 분석
export const analyzeBollingerBands = (price: number, bb: { upper: number, middle: number, lower: number, bandwidth: number }): DynamicAnalysis => {
  const position = (price - bb.lower) / (bb.upper - bb.lower) * 100
  const squeeze = bb.bandwidth < 2
  const expansion = bb.bandwidth > 5
  
  let interpretation = ''
  let actionSuggestion = ''
  let significance = 50
  let confidence = 60
  
  if (price > bb.upper) {
    interpretation = '상단 밴드 돌파 - 과매수 또는 강한 상승'
    actionSuggestion = expansion ? '추세 추종' : '되돌림 대기'
    significance = 80
    confidence = 70
  } else if (price < bb.lower) {
    interpretation = '하단 밴드 이탈 - 과매도 또는 강한 하락'
    actionSuggestion = expansion ? '추세 추종' : '반등 매수 준비'
    significance = 80
    confidence = 70
  } else if (squeeze) {
    interpretation = '볼린저 스퀴즈 - 변동성 축소, 폭발 임박'
    actionSuggestion = '브레이크아웃 대기, 양방향 준비'
    significance = 85
    confidence = 75
  } else if (expansion) {
    interpretation = '밴드 확장 - 높은 변동성, 추세 진행'
    actionSuggestion = '추세 방향 확인 후 진입'
    significance = 70
    confidence = 65
  } else if (position > 80) {
    interpretation = '상단 밴드 근접 - 저항 구간'
    actionSuggestion = '일부 이익 실현, 조정 대비'
    significance = 60
    confidence = 65
  } else if (position < 20) {
    interpretation = '하단 밴드 근접 - 지지 구간'
    actionSuggestion = '분할 매수 고려'
    significance = 60
    confidence = 65
  } else {
    interpretation = '중간 밴드 부근 - 균형 상태'
    actionSuggestion = '추세 확인 후 진입'
    significance = 40
    confidence = 50
  }
  
  const historicalContext = `밴드폭: ${bb.bandwidth.toFixed(2)}% (${squeeze ? '축소' : expansion ? '확장' : '정상'}), ` +
    `밴드 내 위치: ${position.toFixed(1)}%`
  
  const probabilityOutcome = {
    bullish: position < 20 ? 65 : position > 80 ? 35 : 50,
    bearish: position > 80 ? 65 : position < 20 ? 35 : 50,
    neutral: squeeze ? 20 : Math.abs(position - 50) < 20 ? 60 : 30
  }
  
  return {
    interpretation,
    significance,
    confidence,
    actionSuggestion,
    historicalContext,
    probabilityOutcome,
    keyLevels: {
      support: [bb.lower, bb.middle],
      resistance: [bb.middle, bb.upper],
      entry: position < 30 ? [bb.lower, price] : [price, bb.upper],
      stopLoss: position < 50 ? bb.lower * 0.98 : bb.upper * 1.02,
      takeProfit: position < 50 ? [bb.middle, bb.upper] : [bb.middle, bb.lower]
    },
    riskReward: squeeze ? 4 : 2,
    timeframe: '30분-2시간'
  }
}

// 스토캐스틱 동적 분석
export const analyzeStochastic = (stoch: { k: number, d: number }): DynamicAnalysis => {
  const crossover = stoch.k > stoch.d
  const divergence = Math.abs(stoch.k - stoch.d)
  
  let interpretation = ''
  let actionSuggestion = ''
  let significance = 50
  let confidence = 60
  
  if (stoch.k < 20 && crossover) {
    interpretation = '과매도 구간에서 상향 전환 - 강력한 매수 신호'
    actionSuggestion = '즉시 매수 진입'
    significance = 90
    confidence = 80
  } else if (stoch.k > 80 && !crossover) {
    interpretation = '과매수 구간에서 하향 전환 - 매도 신호'
    actionSuggestion = '매도 또는 숏 진입'
    significance = 90
    confidence = 80
  } else if (stoch.k < 20) {
    interpretation = '과매도 구간 - 반등 준비'
    actionSuggestion = '매수 타이밍 포착'
    significance = 75
    confidence = 70
  } else if (stoch.k > 80) {
    interpretation = '과매수 구간 - 조정 가능성'
    actionSuggestion = '이익 실현 준비'
    significance = 75
    confidence = 70
  } else if (crossover && stoch.k > 50) {
    interpretation = '상승 모멘텀 강화'
    actionSuggestion = '매수 포지션 유지'
    significance = 60
    confidence = 65
  } else if (!crossover && stoch.k < 50) {
    interpretation = '하락 모멘텀 강화'
    actionSuggestion = '매도 포지션 유지'
    significance = 60
    confidence = 65
  } else {
    interpretation = '중립 구간 - 방향성 불명확'
    actionSuggestion = '관망'
    significance = 40
    confidence = 50
  }
  
  const historicalContext = `K선: ${stoch.k.toFixed(1)}, D선: ${stoch.d.toFixed(1)}, ` +
    `${crossover ? '골든크로스' : '데드크로스'} 상태`
  
  const probabilityOutcome = {
    bullish: stoch.k < 20 ? 75 : crossover && stoch.k < 50 ? 60 : 40,
    bearish: stoch.k > 80 ? 75 : !crossover && stoch.k > 50 ? 60 : 40,
    neutral: Math.abs(stoch.k - 50) < 20 ? 40 : 20
  }
  
  return {
    interpretation,
    significance,
    confidence,
    actionSuggestion,
    historicalContext,
    probabilityOutcome,
    keyLevels: {
      support: [20, 10],
      resistance: [80, 90],
      entry: stoch.k < 30 ? [stoch.k, stoch.k + 10] : [stoch.k - 10, stoch.k],
      stopLoss: stoch.k < 50 ? 5 : 95,
      takeProfit: stoch.k < 30 ? [50, 70, 80] : [50, 30, 20]
    },
    riskReward: stoch.k < 20 || stoch.k > 80 ? 3.5 : 2,
    timeframe: '15분-1시간'
  }
}

// 종합 지표 분석
export const analyzeMultipleIndicators = (indicators: {
  rsi: number,
  macd: { line: number, signal: number, histogram: number },
  bb: { upper: number, middle: number, lower: number, bandwidth: number },
  stochastic: { k: number, d: number },
  price: number
}): DynamicAnalysis => {
  // 각 지표별 신호 점수 계산
  const rsiScore = indicators.rsi < 30 ? 2 : indicators.rsi > 70 ? -2 : 
                   indicators.rsi < 40 ? 1 : indicators.rsi > 60 ? -1 : 0
  
  const macdScore = indicators.macd.histogram > 0 ? 1 : -1
  
  const bbScore = indicators.price < indicators.bb.lower ? 2 : 
                  indicators.price > indicators.bb.upper ? -2 :
                  indicators.price < indicators.bb.middle ? 1 : -1
  
  const stochScore = indicators.stochastic.k < 20 ? 2 : 
                     indicators.stochastic.k > 80 ? -2 :
                     indicators.stochastic.k < 40 ? 1 : 
                     indicators.stochastic.k > 60 ? -1 : 0
  
  const totalScore = rsiScore + macdScore + bbScore + stochScore
  const confidence = Math.min(100, Math.abs(totalScore) * 15 + 40)
  const significance = Math.min(100, Math.abs(totalScore) * 12 + 50)
  
  let interpretation = ''
  let actionSuggestion = ''
  
  if (totalScore >= 4) {
    interpretation = '다중 지표 강력 매수 신호 - 모든 지표 일치'
    actionSuggestion = '적극 매수, 큰 포지션 가능'
  } else if (totalScore >= 2) {
    interpretation = '다중 지표 매수 신호 - 대부분 지표 긍정적'
    actionSuggestion = '매수 진입, 적정 포지션'
  } else if (totalScore <= -4) {
    interpretation = '다중 지표 강력 매도 신호 - 모든 지표 부정적'
    actionSuggestion = '즉시 매도 또는 숏 포지션'
  } else if (totalScore <= -2) {
    interpretation = '다중 지표 매도 신호 - 대부분 지표 부정적'
    actionSuggestion = '매도 권장, 신규 매수 금지'
  } else {
    interpretation = '지표 신호 혼재 - 방향성 불명확'
    actionSuggestion = '관망, 추가 확인 필요'
  }
  
  const historicalContext = `종합 점수: ${totalScore}/8, ` +
    `일치도: ${Math.abs(totalScore) > 4 ? '높음' : Math.abs(totalScore) > 2 ? '보통' : '낮음'}`
  
  const probabilityOutcome = {
    bullish: totalScore > 0 ? Math.min(80, 50 + totalScore * 7.5) : 30,
    bearish: totalScore < 0 ? Math.min(80, 50 + Math.abs(totalScore) * 7.5) : 30,
    neutral: Math.abs(totalScore) < 2 ? 60 : 20
  }
  
  return {
    interpretation,
    significance,
    confidence,
    actionSuggestion,
    historicalContext,
    probabilityOutcome,
    keyLevels: {
      support: [indicators.bb.lower, indicators.price * 0.98, indicators.price * 0.96],
      resistance: [indicators.bb.upper, indicators.price * 1.02, indicators.price * 1.04],
      entry: totalScore > 0 ? 
        [indicators.price, indicators.price * 1.002, indicators.price * 1.005] :
        [indicators.price * 0.995, indicators.price * 0.998, indicators.price],
      stopLoss: totalScore > 0 ? indicators.bb.lower : indicators.bb.upper,
      takeProfit: totalScore > 0 ? 
        [indicators.bb.middle, indicators.bb.upper, indicators.bb.upper * 1.02] :
        [indicators.bb.middle, indicators.bb.lower, indicators.bb.lower * 0.98]
    },
    riskReward: Math.abs(totalScore) > 4 ? 4 : Math.abs(totalScore) > 2 ? 2.5 : 1.5,
    timeframe: '30분-4시간'
  }
}

export default {
  analyzeRSI,
  analyzeMACD,
  analyzeBollingerBands,
  analyzeStochastic,
  analyzeMultipleIndicators
}