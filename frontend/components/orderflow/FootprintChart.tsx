'use client'

import { useEffect, useState, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface FootprintChartProps {
  symbol: string
}

interface FootprintCell {
  price: number
  buyVolume: number
  sellVolume: number
  totalVolume: number
  delta: number
  time: string
}

interface PriceLevel {
  price: number
  cells: FootprintCell[]
}

export default function FootprintChart({ symbol }: FootprintChartProps) {
  const [footprintData, setFootprintData] = useState<PriceLevel[]>([])
  const [maxVolume, setMaxVolume] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 가격 데이터와 거래 데이터를 함께 가져오기
        const [klinesResponse, tradesResponse] = await Promise.all([
          fetch(`/api/binance/klines?symbol=${symbol}&interval=1m&limit=10`),
          fetch(`/api/binance/trades?symbol=${symbol}&limit=200`)
        ])

        if (!klinesResponse.ok || !tradesResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const klines = await klinesResponse.json()
        const trades = await tradesResponse.json()

        // 가격 레벨 생성
        const priceMap = new Map<number, PriceLevel>()
        let maxVol = 0

        // 각 캔들에서 가격 범위 추출
        klines.forEach((kline: any[]) => {
          const high = parseFloat(kline[2])
          const low = parseFloat(kline[3])
          const time = new Date(kline[0]).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })

          // 가격 레벨 생성 (5개 레벨로 줄임)
          const priceStep = (high - low) / 5
          for (let i = 0; i < 5; i++) {
            const price = low + (priceStep * i)
            const roundedPrice = Math.round(price * 100) / 100

            if (!priceMap.has(roundedPrice)) {
              priceMap.set(roundedPrice, {
                price: roundedPrice,
                cells: []
              })
            }

            // 해당 시간대의 셀 추가
            priceMap.get(roundedPrice)!.cells.push({
              price: roundedPrice,
              buyVolume: 0,
              sellVolume: 0,
              totalVolume: 0,
              delta: 0,
              time
            })
          }
        })

        // 거래 데이터를 가격 레벨에 할당
        trades.forEach((trade: any) => {
          const tradePrice = parseFloat(trade.p)
          const tradeQty = parseFloat(trade.q)
          const isSell = trade.m

          // 가장 가까운 가격 레벨 찾기
          let closestPrice = 0
          let minDiff = Infinity

          priceMap.forEach((_, price) => {
            const diff = Math.abs(price - tradePrice)
            if (diff < minDiff) {
              minDiff = diff
              closestPrice = price
            }
          })

          const priceLevel = priceMap.get(closestPrice)
          if (priceLevel && priceLevel.cells.length > 0) {
            const lastCell = priceLevel.cells[priceLevel.cells.length - 1]
            
            if (isSell) {
              lastCell.sellVolume += tradeQty
            } else {
              lastCell.buyVolume += tradeQty
            }
            
            lastCell.totalVolume = lastCell.buyVolume + lastCell.sellVolume
            lastCell.delta = lastCell.buyVolume - lastCell.sellVolume
            
            if (lastCell.totalVolume > maxVol) {
              maxVol = lastCell.totalVolume
            }
          }
        })

        // 가격순으로 정렬
        const sortedData = Array.from(priceMap.values()).sort((a, b) => b.price - a.price)
        
        setFootprintData(sortedData)
        setMaxVolume(maxVol)
        setIsLoading(false)
      } catch (error) {
        console.error('FootprintChart data fetch error:', error)
        setIsLoading(false)
      }
    }

    fetchData()
    intervalRef.current = setInterval(fetchData, 5000) // 5초마다 업데이트

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [symbol])

  // 색상 강도 계산
  const getColorIntensity = (volume: number) => {
    if (maxVolume === 0) return 0
    return Math.min((volume / maxVolume) * 100, 100)
  }

  // 델타 색상
  const getDeltaColor = (delta: number, intensity: number) => {
    if (delta > 0) {
      return `rgba(16, 185, 129, ${intensity / 100})`
    } else if (delta < 0) {
      return `rgba(239, 68, 68, ${intensity / 100})`
    }
    return `rgba(156, 163, 175, ${intensity / 100})`
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4 w-48"></div>
          <div className="h-96 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">🎨</span>
        풋프린트 차트
      </h3>

      {/* 차트 헤더 */}
      <div className="mb-4">
        <div className="grid grid-cols-10 gap-1 text-xs text-gray-400 text-center mb-2">
          {footprintData[0]?.cells.map((cell, i) => (
            <div key={i}>{cell.time}</div>
          ))}
        </div>
      </div>

      {/* 풋프린트 그리드 */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <div className="min-w-[600px]">
          {footprintData.map((level, i) => (
            <div key={i} className="flex items-center gap-1 mb-1">
              {/* 가격 라벨 */}
              <div className="w-20 text-xs text-gray-400 text-right pr-2">
                ${safePrice(level.price, 2)}
              </div>
              
              {/* 셀 */}
              <div className="flex-1 grid grid-cols-10 gap-1">
                {level.cells.map((cell, j) => {
                  const intensity = getColorIntensity(cell.totalVolume)
                  const bgColor = getDeltaColor(cell.delta, intensity)
                  
                  return (
                    <div
                      key={j}
                      className="relative h-10 rounded flex items-center justify-center text-xs font-medium cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                      style={{ backgroundColor: bgColor }}
                      title={`매수: ${safeFixed(cell.buyVolume, 2)} / 매도: ${safeFixed(cell.sellVolume, 2)}`}
                    >
                      {cell.totalVolume > 0 && (
                        <span className={`${intensity > 50 ? 'text-white' : 'text-gray-300'}`}>
                          {cell.totalVolume > 100 
                            ? Math.round(cell.totalVolume / 100) + 'K'
                            : safeFixed(cell.totalVolume, 0)
                          }
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-gray-400">매수 우세</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-gray-400">매도 우세</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-gray-400">균형</span>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          색상 강도 = 거래량 크기
        </div>
      </div>

      {/* 풋프린트 해석 */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-purple-400 mb-2">🔎 풋프린트 차트 해석법</h4>
        <div className="space-y-2 text-xs text-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-200 mb-1">주요 패턴</p>
              <ul className="space-y-1">
                <li>• <span className="text-green-400">진한 녹색</span>: 대량 매수 → 지지선</li>
                <li>• <span className="text-red-400">진한 빨강</span>: 대량 매도 → 저항선</li>
                <li>• <span className="text-purple-400">수직 정렬</span>: 특정 시간 집중 거래</li>
                <li>• <span className="text-yellow-400">수평 정렬</span>: 특정 가격 집중 거래</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-200 mb-1">트레이딩 활용</p>
              <ul className="space-y-1">
                <li>• 대량 매수 후 가격 상승 실패 → 매도 신호</li>
                <li>• 대량 매도 후 가격 하락 실패 → 매수 신호</li>
                <li>• 연속된 매수 우세 → 상승 트렌드</li>
                <li>• POC(최다 거래 가격) 근처 → 중요 지지/저항</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}