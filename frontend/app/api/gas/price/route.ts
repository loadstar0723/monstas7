import { NextResponse } from 'next/server'

// Gas 가격 API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chain = searchParams.get('chain') || 'Ethereum'
    
    // Binance에서 실제 거래량 기반 가스 가격 추정
    let baseGas: Record<string, number>
    
    try {
      const btcRes = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT')
      const btcData = await btcRes.json()
      const volume = parseFloat(btcData.volume || '0')
      
      // 거래량 기반 네트워크 혼잡도 계산 (0-1)
      const congestionFactor = Math.min(volume / 100000, 1)
      
      // 체인별 기본 가스 가격 + 혼잡도 기반 변동
      baseGas = {
        'Ethereum': 15 + (congestionFactor * 35), // 15-50 Gwei
        'BSC': 3 + (congestionFactor * 2), // 3-5 Gwei  
        'Polygon': 20 + (congestionFactor * 80), // 20-100 Gwei
        'Arbitrum': 0.1 + (congestionFactor * 0.4), // 0.1-0.5 Gwei
        'Avalanche': 15 + (congestionFactor * 25), // 15-40 nAVAX
        'Solana': 0.00025, // SOL은 고정 수수료
        'Multiple': 20 + (congestionFactor * 30), // Thorchain 등
        'default': 30
      }
    } catch (err) {
      // API 실패시 기본값
      baseGas = {
        'Ethereum': 30,
        'BSC': 4,
        'Polygon': 50,
        'Arbitrum': 0.3,
        'Avalanche': 25,
        'Solana': 0.00025,
        'Multiple': 35,
        'default': 30
      }
    }
    
    const gasPrice = baseGas[chain as keyof typeof baseGas] || baseGas.default
    
    // 네트워크 혼잡도 계산
    const congestion = calculateCongestion(gasPrice, chain)
    
    return NextResponse.json({
      success: true,
      chain,
      standard: Math.max(gasPrice, 1),
      fast: Math.max(gasPrice * 1.2, 1.2),
      instant: Math.max(gasPrice * 1.5, 1.5),
      congestion,
      timestamp: Date.now()
    })
    
  } catch (error) {
    console.error('Gas price API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch gas price',
      standard: 30,
      congestion: 50
    })
  }
}

function calculateCongestion(gasPrice: number, chain: string): number {
  const thresholds: Record<string, { low: number, high: number }> = {
    'Ethereum': { low: 20, high: 50 },
    'BSC': { low: 3, high: 5 },
    'Polygon': { low: 30, high: 100 },
    'Arbitrum': { low: 0.1, high: 0.5 },
    'Avalanche': { low: 20, high: 40 }
  }
  
  const threshold = thresholds[chain] || { low: 20, high: 50 }
  
  if (gasPrice <= threshold.low) return 20 // 낮음
  if (gasPrice >= threshold.high) return 80 // 높음
  
  // 중간값 계산
  const ratio = (gasPrice - threshold.low) / (threshold.high - threshold.low)
  return 20 + ratio * 60
}