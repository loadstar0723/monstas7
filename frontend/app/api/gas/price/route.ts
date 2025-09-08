import { NextResponse } from 'next/server'

// Gas 가격 API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chain = searchParams.get('chain') || 'Ethereum'
    
    // 실제 가스 가격 데이터 (실제로는 Etherscan, BSCscan 등에서 가져와야 함)
    // 여기서는 시뮬레이션으로 현실적인 값 생성
    const timestamp = Date.now()
    const baseGas = {
      'Ethereum': 25 + Math.sin(timestamp / 100000) * 15, // 10-40 Gwei
      'BSC': 3 + Math.sin(timestamp / 100000) * 1, // 2-4 Gwei
      'Polygon': 30 + Math.sin(timestamp / 100000) * 20, // 10-50 Gwei
      'Arbitrum': 0.1 + Math.sin(timestamp / 100000) * 0.2, // 0.1-0.3 Gwei
      'Avalanche': 20 + Math.sin(timestamp / 100000) * 10, // 10-30 nAVAX
      'Solana': 0.00025, // SOL은 고정 수수료
      'default': 30
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