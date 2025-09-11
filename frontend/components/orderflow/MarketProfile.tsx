'use client'

import { useEffect, useState, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface MarketProfileProps {
  symbol: string
}

interface ProfileLevel {
  price: number
  volume: number
  tpo: number // Time Price Opportunity
  isVA: boolean // Value Area
  isPOC: boolean // Point of Control
}

interface ProfileData {
  levels: ProfileLevel[]
  poc: number
  vah: number // Value Area High
  val: number // Value Area Low
  totalVolume: number
}

export default function MarketProfile({ symbol }: MarketProfileProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // 가격 데이터와 거래 데이터 가져오기
        const [klinesResponse, tradesResponse] = await Promise.all([
          fetch(`/api/binance/klines?symbol=${symbol}&interval=5m&limit=24`), // 2시간 데이터
          fetch(`/api/binance/trades?symbol=${symbol}&limit=500`)
        ])

        if (!klinesResponse.ok || !tradesResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const klines = await klinesResponse.json()
        const trades = await tradesResponse.json()

        // 현재 가격
        const lastKline = klines[klines.length - 1]
        setCurrentPrice(parseFloat(lastKline[4])) // close price

        // 가격 범위 계산
        let highPrice = 0
        let lowPrice = Infinity
        
        klines.forEach((kline: any[]) => {
          const high = parseFloat(kline[2])
          const low = parseFloat(kline[3])
          if (high > highPrice) highPrice = high
          if (low < lowPrice) lowPrice = low
        })

        // 가격 레벨 생성 (30개)
        const levels: ProfileLevel[] = []
        const priceStep = (highPrice - lowPrice) / 30
        const volumeMap = new Map<number, number>()
        let totalVolume = 0

        for (let i = 0; i < 30; i++) {
          const price = lowPrice + (priceStep * i)
          volumeMap.set(Math.round(price * 100) / 100, 0)
        }

        // 거래량 할당
        trades.forEach((trade: any) => {
          const tradePrice = parseFloat(trade.p)
          const tradeVolume = parseFloat(trade.q)
          totalVolume += tradeVolume

          // 가장 가까운 가격 레벨 찾기
          let closestPrice = 0
          let minDiff = Infinity

          volumeMap.forEach((_, price) => {
            const diff = Math.abs(price - tradePrice)
            if (diff < minDiff) {
              minDiff = diff
              closestPrice = price
            }
          })

          volumeMap.set(closestPrice, (volumeMap.get(closestPrice) || 0) + tradeVolume)
        })

        // POC (Point of Control) 찾기
        let maxVolume = 0
        let poc = 0
        
        volumeMap.forEach((volume, price) => {
          if (volume > maxVolume) {
            maxVolume = volume
            poc = price
          }
        })

        // Value Area 계산 (70% 거래량 포함 구역)
        const sortedLevels = Array.from(volumeMap.entries())
          .sort((a, b) => b[1] - a[1])
        
        let vaVolume = 0
        const vaTarget = totalVolume * 0.7
        const vaLevels: number[] = []
        
        for (const [price, volume] of sortedLevels) {
          if (vaVolume < vaTarget) {
            vaVolume += volume
            vaLevels.push(price)
          } else {
            break
          }
        }

        const vah = Math.max(...vaLevels)
        const val = Math.min(...vaLevels)

        // TPO 계산 (Time Price Opportunity)
        const tpoMap = new Map<number, number>()
        klines.forEach((kline: any[]) => {
          const high = parseFloat(kline[2])
          const low = parseFloat(kline[3])
          
          volumeMap.forEach((_, price) => {
            if (price >= low && price <= high) {
              tpoMap.set(price, (tpoMap.get(price) || 0) + 1)
            }
          })
        })

        // ProfileLevel 배열 생성
        volumeMap.forEach((volume, price) => {
          levels.push({
            price,
            volume,
            tpo: tpoMap.get(price) || 0,
            isVA: vaLevels.includes(price),
            isPOC: price === poc
          })
        })

        levels.sort((a, b) => b.price - a.price)

        setProfileData({
          levels,
          poc,
          vah,
          val,
          totalVolume
        })
        setIsLoading(false)
      } catch (error) {
        console.error('MarketProfile data fetch error:', error)
        setIsLoading(false)
      }
    }

    fetchProfileData()
    intervalRef.current = setInterval(fetchProfileData, 10000) // 10초마다 업데이트

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [symbol])

  // 캔버스에 프로파일 그리기
  useEffect(() => {
    if (!canvasRef.current || !profileData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 캔버스 크기 설정
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // 클리어
    ctx.clearRect(0, 0, rect.width, rect.height)

    const padding = 10
    const priceWidth = 80
    const chartWidth = rect.width - priceWidth - padding * 2
    const chartHeight = rect.height - padding * 2
    const levelHeight = chartHeight / profileData.levels.length

    // 최대 볼륨 찾기
    const maxVolume = Math.max(...profileData.levels.map(l => l.volume))

    profileData.levels.forEach((level, index) => {
      const y = padding + index * levelHeight
      const barWidth = (level.volume / maxVolume) * chartWidth * 0.8
      
      // Value Area 배경
      if (level.isVA) {
        ctx.fillStyle = 'rgba(139, 92, 246, 0.1)'
        ctx.fillRect(priceWidth, y, chartWidth, levelHeight)
      }

      // 볼륨 바
      if (level.isPOC) {
        ctx.fillStyle = 'rgba(236, 72, 153, 0.8)' // POC는 핑크색
      } else if (level.isVA) {
        ctx.fillStyle = 'rgba(139, 92, 246, 0.6)' // VA는 보라색
      } else {
        ctx.fillStyle = 'rgba(75, 85, 99, 0.6)' // 일반은 회색
      }
      
      ctx.fillRect(priceWidth, y + levelHeight * 0.2, barWidth, levelHeight * 0.6)

      // 현재 가격 표시
      if (profileData.levels.length > 1) {
        const priceDiff = Math.abs(profileData.levels[1].price - profileData.levels[0].price)
        if (Math.abs(level.price - currentPrice) < priceDiff) {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.3)'
          ctx.fillRect(0, y, rect.width, levelHeight)
        }
      }

      // 가격 텍스트
      ctx.fillStyle = level.isPOC ? '#ec4899' : '#9ca3af'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(`$${safePrice(level.price, 2)}`, priceWidth - 5, y + levelHeight / 2)

      // POC 표시
      if (level.isPOC) {
        ctx.fillStyle = '#ec4899'
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText('POC', priceWidth + barWidth + 5, y + levelHeight / 2)
      }
    })

    // VAH/VAL 라인
    const vahIndex = profileData.levels.findIndex(l => l.price === profileData.vah)
    const valIndex = profileData.levels.findIndex(l => l.price === profileData.val)

    ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    // VAH
    if (vahIndex >= 0) {
      const y = padding + vahIndex * levelHeight
      ctx.beginPath()
      ctx.moveTo(priceWidth, y)
      ctx.lineTo(rect.width - padding, y)
      ctx.stroke()

      ctx.fillStyle = '#8b5cf6'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText('VAH', priceWidth - 5, y - 5)
    }

    // VAL
    if (valIndex >= 0) {
      const y = padding + (valIndex + 1) * levelHeight
      ctx.beginPath()
      ctx.moveTo(priceWidth, y)
      ctx.lineTo(rect.width - padding, y)
      ctx.stroke()

      ctx.fillStyle = '#8b5cf6'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText('VAL', priceWidth - 5, y + 12)
    }

    ctx.setLineDash([])

  }, [profileData, currentPrice])

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
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📊</span>
          마켓 프로파일
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-400">현재가</p>
          <p className="text-lg font-bold text-white">${safePrice(currentPrice, 2)}</p>
        </div>
      </div>

      {/* 프로파일 차트 */}
      <div className="relative h-96 mb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ imageRendering: 'crisp-edges' }}
        />
      </div>

      {/* 지표 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-400">POC</p>
          <p className="text-lg font-bold text-pink-400">${profileData?.safeFixed(poc, 2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">VAH</p>
          <p className="text-lg font-bold text-purple-400">${profileData?.safeFixed(vah, 2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">VAL</p>
          <p className="text-lg font-bold text-purple-400">${profileData?.safeFixed(val, 2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">VA Range</p>
          <p className="text-lg font-bold text-gray-300">
            {profileData && ((profileData.vah - profileData.val) / profileData.val * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* 프로파일 해석 */}
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-purple-400 mb-2">📐 마켓 프로파일 트레이딩 전략</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
          <div>
            <p className="font-medium text-gray-200 mb-1">현재 위치 분석</p>
            {currentPrice > (profileData?.vah || 0) && (
              <div className="space-y-1">
                <p className="text-yellow-400">• VAH 위 - 강한 상승세</p>
                <p>• 추가 상승 가능하나 저항 예상</p>
                <p className="text-green-400 font-medium">💡 단기 숏 또는 이익실현</p>
              </div>
            )}
            {currentPrice <= (profileData?.vah || 0) && currentPrice >= (profileData?.val || 0) && (
              <div className="space-y-1">
                <p className="text-blue-400">• VA 내부 - 균형 구간</p>
                <p>• POC 근처에서 지지/저항</p>
                <p className="text-gray-400 font-medium">💡 POC 기준 단타 매매</p>
              </div>
            )}
            {currentPrice < (profileData?.val || 0) && (
              <div className="space-y-1">
                <p className="text-yellow-400">• VAL 아래 - 약세 구간</p>
                <p>• VAL 회복 시도 주목</p>
                <p className="text-green-400 font-medium">💡 반등 매수 기회</p>
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-200 mb-1">프로파일 형태 해석</p>
            <ul className="space-y-1">
              <li>• <span className="text-purple-400">POC</span>: 가장 많이 거래된 가격 (강한 지지/저항)</li>
              <li>• <span className="text-purple-400">VA</span>: 70% 거래 발생 구간 (공정 가치)</li>
              <li>• <span className="text-green-400">D형 프로파일</span>: 트렌드 시작</li>
              <li>• <span className="text-blue-400">P형 프로파일</span>: 균형 상태</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}