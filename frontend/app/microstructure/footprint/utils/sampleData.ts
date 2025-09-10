// Binance API에서 실제 과거 데이터를 가져와서 풋프린트 데이터로 변환
import { FootprintCell } from '../types'
import { FOOTPRINT_CONFIG } from '../config/constants'

export async function generateSampleFootprintData(symbol: string, currentPrice: number): Promise<FootprintCell[]> {
  try {
    // Binance API에서 과거 24시간 캔들 데이터 가져오기 (5분봉)
    const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=5m&limit=288`) // 24시간 = 288개 5분봉
    
    if (!response.ok) {
      console.error('캔들 데이터 로드 실패')
      return []
    }
    
    const klines = await response.json()
    
    // 실제 거래 데이터도 가져오기
    let trades: any[] = []
    try {
      const tradesResponse = await fetch(`/api/binance/trades?symbol=${symbol}&limit=500`)
      if (tradesResponse.ok) {
        trades = await tradesResponse.json()
      }
    } catch (error) {
      console.log('거래 데이터 로드 실패, 캔들 데이터만 사용')
    }
    
    const data: FootprintCell[] = []
    const priceGrouping = FOOTPRINT_CONFIG.PRICE_GROUPING[symbol] || 1
    const volumeMap = new Map<string, { buyVolume: number, sellVolume: number }>()
    
    // 캔들 데이터를 풋프린트 셀로 변환
    for (const kline of klines) {
      const [timestamp, open, high, low, close, volume, closeTime, quoteVolume, trades] = kline
      const time = new Date(parseInt(timestamp))
      const hours = time.getHours().toString().padStart(2, '0')
      const minutes = Math.floor(time.getMinutes() / 5) * 5
      const timeKey = `${hours}:${minutes.toString().padStart(2, '0')}`
      
      // 실제 가격 범위 내에서 풋프린트 셀 생성
      const priceHigh = parseFloat(high)
      const priceLow = parseFloat(low)
      const priceRange = priceHigh - priceLow
      const levels = Math.max(5, Math.ceil(priceRange / priceGrouping)) // 더 세밀한 레벨
      
      // 볼륨 분배 - 종가가 시가보다 높으면 매수 우세로 추정
      const isBullish = parseFloat(close) > parseFloat(open)
      const totalVol = parseFloat(volume)
      const avgTradeSize = totalVol / Math.max(1, parseInt(trades))
      
      // VWAP 계산 (볼륨 가중 평균가)
      const vwap = parseFloat(quoteVolume) / totalVol
      
      for (let i = 0; i < levels; i++) {
        const price = Math.round((priceLow + (i * priceGrouping)) / priceGrouping) * priceGrouping
        
        if (price <= priceHigh) {
          // 가격 레벨별 볼륨 분배 (실제 거래 분포 추정)
          const priceDistance = Math.abs(price - vwap)
          const volumeWeight = Math.exp(-priceDistance / (priceRange * 0.5)) // 가우시안 분포
          const levelVolume = totalVol * (volumeWeight / levels)
          
          // 더 정교한 매수/매도 비율 계산
          let buyRatio = 0.5
          if (isBullish) {
            buyRatio = 0.55 + (0.3 * (1 - i / levels)) // 하단 가격에서 매수 우세
          } else {
            buyRatio = 0.45 - (0.3 * (i / levels)) // 상단 가격에서 매도 우세
          }
          
          const buyVolume = levelVolume * buyRatio
          const sellVolume = levelVolume * (1 - buyRatio)
          
          const key = `${timeKey}-${price}`
          const existing = volumeMap.get(key)
          
          if (existing) {
            volumeMap.set(key, {
              buyVolume: existing.buyVolume + buyVolume,
              sellVolume: existing.sellVolume + sellVolume
            })
          } else {
            volumeMap.set(key, { buyVolume, sellVolume })
          }
        }
      }
    }
    
    // Map을 FootprintCell 배열로 변환
    volumeMap.forEach((volumes, key) => {
      const [timeKey, priceStr] = key.split('-')
      const price = parseFloat(priceStr)
      const totalVolume = volumes.buyVolume + volumes.sellVolume
      
      data.push({
        price,
        time: timeKey,
        buyVolume: volumes.buyVolume,
        sellVolume: volumes.sellVolume,
        delta: volumes.buyVolume - volumes.sellVolume,
        totalVolume,
        imbalance: totalVolume > 0 ? (volumes.buyVolume - volumes.sellVolume) / totalVolume : 0,
        poc: false
      })
    })
    
    // POC (Point of Control) 계산 - 가장 많은 거래량이 발생한 가격
    const priceVolumes = new Map<number, number>()
    data.forEach(cell => {
      const currentVolume = priceVolumes.get(cell.price) || 0
      priceVolumes.set(cell.price, currentVolume + cell.totalVolume)
    })
    
    let maxVolume = 0
    let pocPrice = currentPrice
    priceVolumes.forEach((volume, price) => {
      if (volume > maxVolume) {
        maxVolume = volume
        pocPrice = price
      }
    })
    
    // POC 표시
    data.forEach(cell => {
      if (cell.price === pocPrice) {
        cell.poc = true
      }
    })
    
    console.log(`[풋프린트] ${symbol} 데이터 생성 완료 - ${data.length}개 셀`)
    return data
  } catch (error) {
    console.error('풋프린트 데이터 생성 실패:', error)
    return []
  }
}

function getPriceStep(symbol: string): number {
  if (symbol.includes('BTC')) return 10
  if (symbol.includes('ETH')) return 1
  if (symbol.includes('BNB')) return 0.5
  if (symbol.includes('SOL')) return 0.1
  if (symbol.includes('XRP')) return 0.001
  if (symbol.includes('DOGE')) return 0.0001
  return 0.01
}