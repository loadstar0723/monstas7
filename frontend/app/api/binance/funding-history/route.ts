import { NextResponse } from 'next/server'

// Binance Futures 펀딩비 히스토리 API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    const limit = searchParams.get('limit') || '200'
    
    // Binance Futures API - 펀딩비 히스토리
    const response = await fetch(
      `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=${limit}`
    )
    
    if (!response.ok) {
      throw new Error('Binance API response not ok')
    }
    
    const data = await response.json()
    
    // 데이터 가공
    const history = data.map((item: any) => ({
      time: parseInt(item.fundingTime),
      rate: parseFloat(item.fundingRate) * 100, // 퍼센트로 변환
      symbol: item.symbol,
      date: new Date(parseInt(item.fundingTime)).toISOString()
    }))
    
    // 시간대별 분석
    const hourlyAnalysis: Record<number, { total: number, count: number, avg: number }> = {}
    
    history.forEach((item: any) => {
      const hour = new Date(item.time).getUTCHours()
      if (!hourlyAnalysis[hour]) {
        hourlyAnalysis[hour] = { total: 0, count: 0, avg: 0 }
      }
      hourlyAnalysis[hour].total += item.rate
      hourlyAnalysis[hour].count += 1
    })
    
    // 평균 계산
    Object.keys(hourlyAnalysis).forEach(hour => {
      const h = parseInt(hour)
      hourlyAnalysis[h].avg = hourlyAnalysis[h].total / hourlyAnalysis[h].count
    })
    
    // 일별 분석
    const dailyAnalysis: Record<string, { rates: number[], avg: number, max: number, min: number }> = {}
    
    history.forEach((item: any) => {
      const date = new Date(item.time).toISOString().split('T')[0]
      if (!dailyAnalysis[date]) {
        dailyAnalysis[date] = { rates: [], avg: 0, max: 0, min: 0 }
      }
      dailyAnalysis[date].rates.push(item.rate)
    })
    
    // 일별 통계 계산
    Object.keys(dailyAnalysis).forEach(date => {
      const rates = dailyAnalysis[date].rates
      dailyAnalysis[date].avg = rates.reduce((acc, r) => acc + r, 0) / rates.length
      dailyAnalysis[date].max = Math.max(...rates)
      dailyAnalysis[date].min = Math.min(...rates)
    })
    
    // 주요 통계
    const allRates = history.map((h: any) => h.rate)
    const stats = {
      totalDataPoints: history.length,
      avgRate: allRates.reduce((acc: number, r: number) => acc + r, 0) / allRates.length,
      maxRate: Math.max(...allRates),
      minRate: Math.min(...allRates),
      stdDev: calculateStdDev(allRates),
      positiveCount: allRates.filter((r: number) => r > 0).length,
      negativeCount: allRates.filter((r: number) => r < 0).length,
      neutralCount: allRates.filter((r: number) => r === 0).length
    }
    
    // 최근 트렌드 (24시간, 7일, 30일)
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    
    const trends = {
      '24h': calculateTrend(history.filter((h: any) => h.time > now - day)),
      '7d': calculateTrend(history.filter((h: any) => h.time > now - (7 * day))),
      '30d': calculateTrend(history)
    }
    
    return NextResponse.json({
      success: true,
      data: {
        symbol,
        history: history.slice(0, 100), // 최근 100개
        statistics: stats,
        hourlyAnalysis,
        dailyAnalysis,
        trends,
        timestamp: Date.now()
      }
    })
    
  } catch (error) {
    console.error('Funding history API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch funding history',
      data: {
        history: [],
        statistics: {},
        hourlyAnalysis: {},
        dailyAnalysis: {},
        trends: {}
      }
    })
  }
}

// 표준편차 계산
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0
  const avg = values.reduce((acc, val) => acc + val, 0) / values.length
  const squareDiffs = values.map(value => Math.pow(value - avg, 2))
  const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / values.length
  return Math.sqrt(avgSquareDiff)
}

// 트렌드 계산
function calculateTrend(history: any[]): any {
  if (history.length === 0) {
    return { avg: 0, trend: 'UNKNOWN', change: 0 }
  }
  
  const rates = history.map((h: any) => h.rate)
  const avg = rates.reduce((acc: number, r: number) => acc + r, 0) / rates.length
  
  // 첫 번째와 마지막 비교
  const firstHalf = rates.slice(0, Math.floor(rates.length / 2))
  const secondHalf = rates.slice(Math.floor(rates.length / 2))
  
  const firstAvg = firstHalf.reduce((acc: number, r: number) => acc + r, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((acc: number, r: number) => acc + r, 0) / secondHalf.length
  
  let trend = 'STABLE'
  if (secondAvg > firstAvg * 1.1) trend = 'RISING'
  else if (secondAvg < firstAvg * 0.9) trend = 'FALLING'
  
  return {
    avg,
    trend,
    change: ((secondAvg - firstAvg) / Math.abs(firstAvg || 0.0001)) * 100,
    firstAvg,
    secondAvg
  }
}