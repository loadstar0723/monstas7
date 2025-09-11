'use client'

import { useEffect, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { FaBalanceScale, FaArrowUp, FaArrowDown, FaExclamationTriangle } from 'react-icons/fa'
import { config } from '@/lib/config'

interface OrderbookLevel {
  price: number
  amount: number
  total: number
}

interface OrderbookData {
  bids: OrderbookLevel[]
  asks: OrderbookLevel[]
  lastUpdateId: number
  spread: number
  spreadPercent: number
  bestBid: number
  bestAsk: number
}

interface OrderbookStats {
  bidVolume: number
  askVolume: number
  imbalance: number
  pressure: number
  momentum: 'bullish' | 'bearish' | 'neutral'
  largestBid: OrderbookLevel | null
  largestAsk: OrderbookLevel | null
  wallsDetected: {
    bidWalls: OrderbookLevel[]
    askWalls: OrderbookLevel[]
  }
  liquidityScore: number
  executionRisk: 'low' | 'medium' | 'high'
}

interface ImbalanceIndicatorProps {
  stats: OrderbookStats | null
  orderbook: OrderbookData | null
}

export default function ImbalanceIndicator({ stats, orderbook }: ImbalanceIndicatorProps) {
  const gaugeRef = useRef<HTMLCanvasElement>(null)

  // 게이지 렌더링
  useEffect(() => {
    if (!gaugeRef.current || !stats) return

    const canvas = gaugeRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 캔버스 크기 설정
    canvas.width = 200
    canvas.height = 120

    // 중심점
    const centerX = canvas.width / 2
    const centerY = canvas.height - 10
    const radius = 80

    // 배경 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 반원 배경
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false)
    ctx.strokeStyle = 'rgba(107, 114, 128, 0.3)'
    ctx.lineWidth = 20
    ctx.stroke()

    // 불균형 지표 (-100 ~ 100) -> 각도로 변환
    const imbalance = stats.imbalance
    const angle = Math.PI + (Math.PI * (imbalance + 100) / 200)

    // 색상 결정
    let color
    if (imbalance > 20) {
      color = '#10b981' // 초록 (매수 우세)
    } else if (imbalance < -20) {
      color = '#ef4444' // 빨강 (매도 우세)
    } else {
      color = '#6b7280' // 회색 (중립)
    }

    // 불균형 게이지
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, angle, false)
    ctx.strokeStyle = color
    ctx.lineWidth = 20
    ctx.stroke()

    // 중심 텍스트
    ctx.fillStyle = 'white'
    ctx.font = 'bold 24px Inter'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${Math.abs(imbalance)}%`, centerX, centerY - 20)

    // 라벨
    ctx.font = '12px Inter'
    ctx.fillStyle = 'rgba(156, 163, 175, 0.9)'
    ctx.fillText('매도', 20, centerY - 5)
    ctx.fillText('중립', centerX, centerY - 50)
    ctx.fillText('매수', canvas.width - 20, centerY - 5)

    // 포인터
    const pointerAngle = angle
    const pointerLength = radius - 25
    const pointerX = centerX + Math.cos(pointerAngle) * pointerLength
    const pointerY = centerY + Math.sin(pointerAngle) * pointerLength

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(pointerX, pointerY)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 3
    ctx.stroke()

    // 중심 원
    ctx.beginPath()
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.fill()
  }, [stats])

  if (!stats || !orderbook) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  // 매수/매도 비율
  const totalVolume = stats.bidVolume + stats.askVolume
  const bidRatio = totalVolume > 0 ? (stats.bidVolume / totalVolume) * 100 : 50
  const askRatio = totalVolume > 0 ? (stats.askVolume / totalVolume) * 100 : 50

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaBalanceScale className="text-purple-400" />
        주문 불균형 분석
      </h3>

      {/* 불균형 게이지 */}
      <div className="flex justify-center mb-6">
        <canvas ref={gaugeRef} className="max-w-full" />
      </div>

      {/* 모멘텀 상태 */}
      <div className={`text-center p-3 rounded-lg mb-4 ${
        stats.momentum === 'bullish' ? 'bg-green-500/20 border border-green-500/50' :
        stats.momentum === 'bearish' ? 'bg-red-500/20 border border-red-500/50' :
        'bg-gray-700/50 border border-gray-600'
      }`}>
        <div className="flex items-center justify-center gap-2">
          {stats.momentum === 'bullish' ? (
            <>
              <FaArrowUp className="text-green-400" />
              <span className="text-green-400 font-semibold">매수 우세</span>
            </>
          ) : stats.momentum === 'bearish' ? (
            <>
              <FaArrowDown className="text-red-400" />
              <span className="text-red-400 font-semibold">매도 우세</span>
            </>
          ) : (
            <span className="text-gray-400 font-semibold">균형 상태</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          압력 지표: {stats.pressure}%
        </p>
      </div>

      {/* 볼륨 비교 */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">매수량</span>
            <span className="text-green-400">{safeFixed(bidRatio, 1)}%</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${bidRatio}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ${stats.bidVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">매도량</span>
            <span className="text-red-400">{safeFixed(askRatio, 1)}%</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: `${askRatio}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ${stats.askVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* 벽 감지 알림 */}
      {(stats.wallsDetected.bidWalls.length > 0 || stats.wallsDetected.askWalls.length > 0) && (
        <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold mb-2">
            <FaExclamationTriangle />
            대량 주문 감지
          </div>
          <div className="space-y-1 text-xs">
            {stats.wallsDetected.bidWalls.length > 0 && (
              <p className="text-gray-300">
                매수벽: {stats.wallsDetected.bidWalls.map(w => `$${w.price}`).join(', ')}
              </p>
            )}
            {stats.wallsDetected.askWalls.length > 0 && (
              <p className="text-gray-300">
                매도벽: {stats.wallsDetected.askWalls.map(w => `$${w.price}`).join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 트레이딩 신호 */}
      <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
        <p className="text-sm text-gray-300">
          {stats.imbalance > 30 ? (
            <span className="text-green-400">
              💡 강한 매수 압력 - 단기 상승 가능성
            </span>
          ) : stats.imbalance < -30 ? (
            <span className="text-red-400">
              💡 강한 매도 압력 - 단기 하락 가능성
            </span>
          ) : (
            <span className="text-gray-400">
              💡 균형 상태 - 추세 관망 필요
            </span>
          )}
        </p>
      </div>
    </div>
  )
}