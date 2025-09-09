import { NextResponse } from 'next/server'

// Binance Futures 펀딩비 API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    
    // Binance Futures API - 실시간 펀딩비
    const [fundingRes, priceRes, historyRes] = await Promise.all([
      // 현재 펀딩비
      fetch(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=1`),
      // Mark Price (펀딩비 계산용)
      fetch(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`),
      // 펀딩비 히스토리 (최근 100개)
      fetch(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=100`)
    ])
    
    if (!fundingRes.ok || !priceRes.ok || !historyRes.ok) {
      throw new Error('Binance API response not ok')
    }
    
    const fundingData = await fundingRes.json()
    const priceData = await priceRes.json()
    const historyData = await historyRes.json()
    
    // 현재 펀딩비 (최신 데이터)
    const currentFunding = fundingData[0] || {}
    const fundingRate = parseFloat(currentFunding.fundingRate || '0')
    const fundingTime = parseInt(currentFunding.fundingTime || Date.now())
    
    // 다음 펀딩 시간까지 카운트다운 계산
    const now = Date.now()
    const nextFundingTime = fundingTime > now ? fundingTime : fundingTime + (8 * 60 * 60 * 1000)
    const countdownMs = nextFundingTime - now
    const hours = Math.floor(countdownMs / (1000 * 60 * 60))
    const minutes = Math.floor((countdownMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((countdownMs % (1000 * 60)) / 1000)
    
    // 가격 정보
    const markPrice = parseFloat(priceData.markPrice || '0')
    const indexPrice = parseFloat(priceData.indexPrice || '0')
    const lastFundingRate = parseFloat(priceData.lastFundingRate || '0')
    const nextFundingRate = parseFloat(priceData.nextFundingRate || fundingRate.toString())
    
    // 히스토리 데이터 처리
    const history = historyData.map((item: any) => ({
      time: parseInt(item.fundingTime),
      rate: parseFloat(item.fundingRate),
      symbol: item.symbol
    }))
    
    // 통계 계산 (실제 데이터 기반)
    const rates = history.map((h: any) => h.rate)
    const avgRate = rates.reduce((acc: number, rate: number) => acc + rate, 0) / rates.length
    const maxRate = Math.max(...rates)
    const minRate = Math.min(...rates)
    
    // 펀딩비 트렌드 분석
    const recentRates = rates.slice(0, 10)
    const olderRates = rates.slice(10, 20)
    const recentAvg = recentRates.reduce((acc: number, r: number) => acc + r, 0) / recentRates.length
    const olderAvg = olderRates.reduce((acc: number, r: number) => acc + r, 0) / olderRates.length
    
    let trend = 'NEUTRAL'
    if (recentAvg > olderAvg * 1.2) trend = 'INCREASING'
    else if (recentAvg < olderAvg * 0.8) trend = 'DECREASING'
    
    // 시장 센티먼트 분석
    let sentiment = 'NEUTRAL'
    if (fundingRate > 0.0001) sentiment = 'BULLISH' // 0.01% 이상
    else if (fundingRate < -0.0001) sentiment = 'BEARISH' // -0.01% 이하
    
    // 차익거래 기회 계산 (연율화)
    const annualizedRate = fundingRate * 3 * 365 * 100 // 8시간마다 = 하루 3번
    
    return NextResponse.json({
      success: true,
      data: {
        current: {
          symbol,
          fundingRate: fundingRate * 100, // 퍼센트로 변환
          nextFundingRate: nextFundingRate * 100,
          lastFundingRate: lastFundingRate * 100,
          fundingTime,
          nextFundingTime,
          countdown: `${hours}시간 ${minutes}분 ${seconds}초`,
          countdownMs,
          markPrice,
          indexPrice,
          premium: ((markPrice - indexPrice) / indexPrice) * 100,
          annualizedRate
        },
        statistics: {
          avgRate: avgRate * 100,
          maxRate: maxRate * 100,
          minRate: minRate * 100,
          trend,
          sentiment,
          dataPoints: history.length
        },
        history: history.slice(0, 50), // 최근 50개만
        recommendation: {
          action: fundingRate > 0.0003 ? 'SHORT_OPPORTUNITY' : 
                  fundingRate < -0.0003 ? 'LONG_OPPORTUNITY' : 'NEUTRAL',
          confidence: Math.abs(fundingRate) * 100000, // 신뢰도 계산
          reason: fundingRate > 0 ? 
                  `롱 포지션이 펀딩비 ${(fundingRate * 100).toFixed(4)}%를 지불 중` :
                  `숏 포지션이 펀딩비 ${Math.abs(fundingRate * 100).toFixed(4)}%를 지불 중`
        },
        timestamp: Date.now()
      }
    })
    
  } catch (error) {
    console.error('Funding rate API error:', error)
    
    // 에러 시 기본값 반환 (빈 데이터, CLAUDE.md 규칙 준수)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch funding rate',
      data: {
        current: {
          fundingRate: 0,
          markPrice: 0,
          indexPrice: 0,
          countdown: '0시간 0분 0초'
        },
        statistics: {
          avgRate: 0,
          trend: 'UNKNOWN'
        },
        history: [],
        recommendation: {
          action: 'WAIT',
          confidence: 0
        }
      }
    })
  }
}