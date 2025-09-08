import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTC'

  try {
    // 코인별 기본값 설정
    const defaultPrices: Record<string, number> = {
      BTC: 98000,
      ETH: 3500,
      BNB: 700,
      SOL: 240,
      XRP: 2.5,
      ADA: 1.2,
      AVAX: 45,
      DOT: 10,
      MATIC: 1.5,
      LINK: 20
    }
    
    const volumeMultiplier = symbol === 'BTC' ? 1000 :
                           symbol === 'ETH' ? 500 :
                           symbol === 'BNB' ? 200 : 100
    
    const price = defaultPrices[symbol] || 100
    const volume = volumeMultiplier * 1000000

    // 실제 팀 지갑 데이터를 가져올 때까지 동적 계산
    const totalSupply = volume * 100 // 실제로는 토큰 컨트랙트에서
    const teamHoldings = totalSupply * 0.1 // 실제로는 온체인에서
    const lockedAmount = teamHoldings * 0.75 // 실제로는 락 컨트랙트에서
    const lockedPercent = (lockedAmount / teamHoldings) * 100

    // 언락 스케줄은 실제로 스마트 컨트랙트나 DB에서
    const currentDate = new Date()
    const unlock1Date = new Date(currentDate)
    unlock1Date.setMonth(unlock1Date.getMonth() + 3)
    const unlock2Date = new Date(currentDate)
    unlock2Date.setMonth(unlock2Date.getMonth() + 6)

    const walletData = {
      symbol,
      team: {
        totalHoldings: Math.floor(teamHoldings),
        lockedAmount: Math.floor(lockedAmount),
        lockedPercent: lockedPercent,
        unlockedAmount: Math.floor(teamHoldings - lockedAmount),
      },
      unlockSchedule: [
        {
          date: unlock1Date.toISOString().split('T')[0],
          amount: Math.floor(teamHoldings * 0.1),
          type: 'team',
        },
        {
          date: unlock2Date.toISOString().split('T')[0],
          amount: Math.floor(teamHoldings * 0.15),
          type: 'team',
        }
      ],
      activity: {
        // 실제로는 온체인 모니터링이 필요하지만 임시로 거래량 기반 계산
        last24h: Math.floor(volume / 10000000), // 거래량이 많을수록 활동 많음
        last7d: Math.floor(volume / 1000000), // 주간 활동
        suspicious: false, // 실제로는 패턴 분석
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: walletData
    })
  } catch (error) {
    console.error('Error fetching wallet data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet data' },
      { status: 500 }
    )
  }
}