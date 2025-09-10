'use client'

import { useEffect, useState, useRef } from 'react'

interface CumulativeDeltaProps {
  symbol: string
}

interface TradeData {
  time: number
  price: number
  quantity: number
  isBuyerMaker: boolean
}

interface DeltaPoint {
  time: string
  delta: number
  cumDelta: number
  price: number
  buyVolume: number
  sellVolume: number
}

export default function CumulativeDelta({ symbol }: CumulativeDeltaProps) {
  const [deltaData, setDeltaData] = useState<DeltaPoint[]>([])
  const [currentDelta, setCurrentDelta] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    // 초기 거래 데이터 가져오기
    const fetchTrades = async () => {
      try {
        const response = await fetch(`/api/binance/trades?symbol=${symbol}&limit=100`)
        if (!response.ok) throw new Error('Failed to fetch trades')
        const trades = await response.json()

        // 델타 계산
        const processedData: DeltaPoint[] = []
        let cumDelta = 0
        
        // 시간별로 그룹화 (1분 단위)
        const groupedTrades = new Map<string, TradeData[]>()
        
        trades.forEach((trade: any) => {
          const time = new Date(trade.T || trade.time)
          const timeKey = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`
          
          if (!groupedTrades.has(timeKey)) {
            groupedTrades.set(timeKey, [])
          }
          
          groupedTrades.get(timeKey)?.push({
            time: trade.T || trade.time,
            price: parseFloat(trade.p),
            quantity: parseFloat(trade.q),
            isBuyerMaker: trade.m
          })
        })

        // 각 시간대별로 델타 계산
        groupedTrades.forEach((trades, timeKey) => {
          let buyVolume = 0
          let sellVolume = 0
          let avgPrice = 0
          
          trades.forEach(trade => {
            if (trade.isBuyerMaker) {
              sellVolume += trade.quantity
            } else {
              buyVolume += trade.quantity
            }
            avgPrice += trade.price
          })
          
          avgPrice = avgPrice / trades.length
          const delta = buyVolume - sellVolume
          cumDelta += delta
          
          processedData.push({
            time: timeKey,
            delta,
            cumDelta,
            price: avgPrice,
            buyVolume,
            sellVolume
          })
        })

        setDeltaData(processedData.slice(-20)) // 최근 20개 데이터만 표시
        setCurrentDelta(cumDelta)
        setIsLoading(false)
      } catch (error) {
        console.error('Trades fetch error:', error)
        setIsLoading(false)
      }
    }

    fetchTrades()
    intervalRef.current = setInterval(fetchTrades, 5000) // 5초마다 업데이트

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [symbol])

  // 캔버스에 차트 그리기
  useEffect(() => {
    if (!canvasRef.current || deltaData.length === 0) return

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

    // 차트 영역 계산
    const padding = 40
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2

    // Y축 범위 계산
    const maxDelta = Math.max(...deltaData.map(d => Math.abs(d.cumDelta)))
    const yRange = maxDelta * 1.2

    // 그리드 그리기
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)'
    ctx.lineWidth = 1
    
    // 수평 그리드
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i * chartHeight) / 4
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(rect.width - padding, y)
      ctx.stroke()
    }

    // 중앙선 (델타 = 0)
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, rect.height / 2)
    ctx.lineTo(rect.width - padding, rect.height / 2)
    ctx.stroke()

    // 누적 델타 라인 그리기
    ctx.lineWidth = 3
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height)
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)')
    gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.8)')
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.8)')
    ctx.strokeStyle = gradient

    ctx.beginPath()
    deltaData.forEach((point, index) => {
      const x = padding + (index / (deltaData.length - 1)) * chartWidth
      const y = rect.height / 2 - (point.cumDelta / yRange) * (chartHeight / 2)
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // 델타 바 그리기
    deltaData.forEach((point, index) => {
      const x = padding + (index / (deltaData.length - 1)) * chartWidth
      const barWidth = chartWidth / deltaData.length * 0.8
      const barHeight = Math.abs(point.delta / yRange) * (chartHeight / 2)
      const y = rect.height / 2

      if (point.delta > 0) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.3)'
        ctx.fillRect(x - barWidth / 2, y - barHeight, barWidth, barHeight)
      } else {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'
        ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight)
      }
    })

    // 시간 라벨
    ctx.fillStyle = 'rgba(156, 163, 175, 0.8)'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    
    deltaData.forEach((point, index) => {
      if (index % 4 === 0) { // 4개마다 표시
        const x = padding + (index / (deltaData.length - 1)) * chartWidth
        ctx.fillText(point.time, x, rect.height - 20)
      }
    })

  }, [deltaData])

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4 w-48"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const getDeltaStatus = () => {
    if (currentDelta > 1000) return { text: '강한 매수 우세', color: 'text-green-400' }
    if (currentDelta > 500) return { text: '매수 우세', color: 'text-green-300' }
    if (currentDelta < -1000) return { text: '강한 매도 우세', color: 'text-red-400' }
    if (currentDelta < -500) return { text: '매도 우세', color: 'text-red-300' }
    return { text: '중립', color: 'text-gray-400' }
  }

  const status = getDeltaStatus()

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📈</span>
          누적 델타 분석
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-400">현재 누적 델타</p>
          <p className={`text-2xl font-bold ${currentDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {currentDelta > 0 ? '+' : ''}{currentDelta.toFixed(2)}
          </p>
          <p className={`text-sm ${status.color}`}>{status.text}</p>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="relative h-64 mb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ imageRendering: 'crisp-edges' }}
        />
      </div>

      {/* 범례 */}
      <div className="flex justify-center gap-6 text-xs mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span className="text-gray-400">매수 델타</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded"></div>
          <span className="text-gray-400">매도 델타</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-0.5 bg-gradient-to-r from-green-400 via-purple-400 to-red-400"></div>
          <span className="text-gray-400">누적 델타</span>
        </div>
      </div>

      {/* 델타 해석 */}
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-purple-400 mb-2">🔍 누적 델타 해석</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
          <div>
            <p className="font-medium text-gray-200 mb-1">델타 다이버전스 체크</p>
            {currentDelta > 0 && deltaData[deltaData.length - 1]?.price < deltaData[0]?.price && (
              <p className="text-yellow-400">⚠️ 약세 다이버전스 - 가격 하락에도 매수 우세</p>
            )}
            {currentDelta < 0 && deltaData[deltaData.length - 1]?.price > deltaData[0]?.price && (
              <p className="text-yellow-400">⚠️ 강세 다이버전스 - 가격 상승에도 매도 우세</p>
            )}
            {!((currentDelta > 0 && deltaData[deltaData.length - 1]?.price < deltaData[0]?.price) ||
              (currentDelta < 0 && deltaData[deltaData.length - 1]?.price > deltaData[0]?.price)) && (
              <p className="text-gray-400">✓ 다이버전스 없음 - 추세 일치</p>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-200 mb-1">트레이딩 시그널</p>
            {currentDelta > 1000 && (
              <p className="text-green-400">📈 강한 상승 모멘텀 - 롱 포지션 유리</p>
            )}
            {currentDelta > 500 && currentDelta <= 1000 && (
              <p className="text-green-300">📊 중간 상승 압력 - 신중한 롱 고려</p>
            )}
            {currentDelta >= -500 && currentDelta <= 500 && (
              <p className="text-gray-400">➡️ 방향성 불명확 - 관망 권장</p>
            )}
            {currentDelta < -500 && currentDelta >= -1000 && (
              <p className="text-red-300">📊 중간 하락 압력 - 신중한 숏 고려</p>
            )}
            {currentDelta < -1000 && (
              <p className="text-red-400">📉 강한 하락 모멘텀 - 숏 포지션 유리</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}