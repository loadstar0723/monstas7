// 트레이딩 전략 설정 - DB나 환경변수에서 로드해야 함
export async function getTradingConfig() {
  try {
    // TODO: 실제로는 API나 DB에서 가져와야 함
    const response = await fetch('/api/config/trading')
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('트레이딩 설정 로드 실패:', error)
  }
  
  // 기본값 (실제로는 DB에서 가져와야 함)
  return {
    sentiment: {
      veryPositive: 70,
      positive: 50,
      negative: 40,
      veryNegative: 30
    },
    mentionGrowth: {
      surge: 20,
      decline: -20
    },
    confidence: {
      high: 80,
      medium: 65,
      low: 50
    },
    atrMultipliers: {
      stopLoss: 1.5,
      takeProfit1: 1,
      takeProfit2: 2,
      takeProfit3: 3
    },
    influencers: {
      minBullish: 2
    }
  }
}