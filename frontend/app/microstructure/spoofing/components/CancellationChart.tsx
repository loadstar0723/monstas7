'use client'

import { useEffect, useRef, useState } from 'react'
import { FaChartLine, FaExclamationTriangle } from 'react-icons/fa'

interface CancellationChartProps {
  orderbook: any
  symbol: string
}

export default function CancellationChart({ orderbook, symbol }: CancellationChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cancellationData, setCancellationData] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    cancelledOrders: 0,
    cancellationRate: 0,
    avgLifespan: 0,
    suspiciousLevel: 'low' as 'low' | 'medium' | 'high'
  })

  // 취소율 계산 및 시각화
  useEffect(() => {
    if (!orderbook) return

    // 취소 데이터 시뮬레이션 (실제로는 WebSocket에서 받아야 함)
    const newData = {
      timestamp: Date.now(),
      cancellationRate: Math.random() * 100,
      orderCount: Math.floor(Math.random() * 500) + 100,
      avgLifespan: Math.random() * 5000 + 500
    }

    setCancellationData(prev => [...prev.slice(-50), newData])

    // 통계 업데이트
    const rate = newData.cancellationRate
    setStats({
      totalOrders: newData.orderCount,
      cancelledOrders: Math.floor(newData.orderCount * rate / 100),
      cancellationRate: rate,
      avgLifespan: newData.avgLifespan,
      suspiciousLevel: rate > 70 ? 'high' : rate > 40 ? 'medium' : 'low'
    })
  }, [orderbook])

  // 차트 렌더링
  useEffect(() => {
    if (!canvasRef.current || cancellationData.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 캔버스 크기 설정
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height

    // 배경 클리어
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, width, height)

    // 그리드 그리기
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // 취소율 라인 차트 그리기
    if (cancellationData.length > 1) {
      ctx.strokeStyle = '#ff6b6b'
      ctx.lineWidth = 2
      ctx.beginPath()

      cancellationData.forEach((data, index) => {
        const x = (index / (cancellationData.length - 1)) * width
        const y = height - (data.cancellationRate / 100) * height

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // 영역 채우기
      ctx.fillStyle = 'rgba(255, 107, 107, 0.1)'
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()
      ctx.fill()
    }

    // 위험 구간 표시
    const dangerZone = height * 0.3 // 70% 이상
    ctx.fillStyle = 'rgba(255, 0, 0, 0.1)'
    ctx.fillRect(0, 0, width, dangerZone)

    // 라벨
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px monospace'
    ctx.fillText('100%', 5, 15)
    ctx.fillText('50%', 5, height / 2)
    ctx.fillText('0%', 5, height - 5)
  }, [cancellationData])

  const getSuspiciousColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaChartLine className="text-purple-400" />
          <h3 className="text-lg font-bold text-white">취소율 분석</h3>
        </div>
        <span className="text-sm text-gray-400">{symbol}</span>
      </div>

      {/* 차트 */}
      <div className="relative h-[200px] mb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
        
        {/* 경고 표시 */}
        {stats.suspiciousLevel === 'high' && (
          <div className="absolute top-2 right-2 bg-red-900/80 rounded-lg px-3 py-1 flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-400" />
            <span className="text-sm text-white">높은 취소율 감지</span>
          </div>
        )}
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">전체 주문</div>
          <div className="text-sm font-semibold text-white">
            {stats.totalOrders.toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">취소된 주문</div>
          <div className="text-sm font-semibold text-red-400">
            {stats.cancelledOrders.toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">취소율</div>
          <div className={`text-sm font-semibold ${getSuspiciousColor(stats.suspiciousLevel)}`}>
            {stats.cancellationRate.toFixed(1)}%
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">평균 생존시간</div>
          <div className="text-sm font-semibold text-white">
            {(stats.avgLifespan / 1000).toFixed(1)}초
          </div>
        </div>
      </div>

      {/* 패턴 감지 */}
      <div className="mt-4 space-y-2">
        {stats.cancellationRate > 70 && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-red-500 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-red-400">스푸핑 의심</div>
                <div className="text-xs text-gray-400">
                  비정상적으로 높은 주문 취소율이 감지되었습니다.
                </div>
              </div>
            </div>
          </div>
        )}

        {stats.avgLifespan < 1000 && (
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-yellow-500 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-yellow-400">플래시 오더</div>
                <div className="text-xs text-gray-400">
                  주문이 매우 짧은 시간 내에 취소되고 있습니다.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}