// 투자 신호 설정 - DB나 환경변수에서 로드해야 함
export async function getSignalConfig() {
  try {
    // TODO: 실제로는 API나 DB에서 가져와야 함
    const response = await fetch('/api/config/signals')
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('신호 설정 로드 실패:', error)
  }
  
  // 기본값 (실제로는 DB에서 가져와야 함)
  return {
    sentiment: {
      veryPositive: 75,
      positive: 60,
      negative: 40,
      veryNegative: 25
    },
    mentionChange: {
      surge: 30,
      increase: 10,
      decline: -10,
      plunge: -30
    },
    confidence: {
      veryHigh: 85,
      high: 70,
      medium: 50,
      low: 30
    },
    returns: {
      strongBuy: 10,
      buy: 5,
      hold: 2,
      sell: -5,
      strongSell: -10
    },
    risk: {
      strongBuy: 5,
      buy: 3,
      hold: 2,
      sell: 3,
      strongSell: 5
    },
    trendingThreshold: 3
  }
}