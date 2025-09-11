'use client'

import { useEffect, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface LiquidityDepthHeatmapProps {
  orderbook: any
  currentPrice: number
}

export default function LiquidityDepthHeatmap({ orderbook, currentPrice }: LiquidityDepthHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!orderbook || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 캔버스 크기 설정
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    // 배경 클리어
    ctx.fillStyle = '#111111'
    ctx.fillRect(0, 0, rect.width, rect.height)
    
    // 가격 범위 계산
    const allPrices = [
      ...orderbook.bids.map((b: any) => b.price),
      ...orderbook.asks.map((a: any) => a.price)
    ]
    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)
    const priceRange = maxPrice - minPrice
    
    // 최대 거래량 계산
    const maxVolume = Math.max(
      ...orderbook.bids.map((b: any) => b.amount),
      ...orderbook.asks.map((a: any) => a.amount)
    )
    
    // 히트맵 그리기
    const cellHeight = rect.height / 40
    const cellWidth = rect.width / 100
    
    // Bids (매수)
    orderbook.bids.slice(0, 50).forEach((bid: any, i: number) => {
      const x = ((bid.price - minPrice) / priceRange) * rect.width
      const intensity = bid.amount / maxVolume
      
      // 그라데이션 색상 (녹색)
      const green = Math.floor(intensity * 255)
      ctx.fillStyle = `rgba(34, ${green}, 84, ${0.3 + intensity * 0.7})`
      
      for (let j = 0; j < 20; j++) {
        const y = rect.height / 2 + j * cellHeight
        ctx.fillRect(x - cellWidth/2, y, cellWidth, cellHeight - 1)
      }
    })
    
    // Asks (매도)
    orderbook.asks.slice(0, 50).forEach((ask: any, i: number) => {
      const x = ((ask.price - minPrice) / priceRange) * rect.width
      const intensity = ask.amount / maxVolume
      
      // 그라데이션 색상 (빨강)
      const red = Math.floor(intensity * 255)
      ctx.fillStyle = `rgba(${red}, 34, 84, ${0.3 + intensity * 0.7})`
      
      for (let j = 0; j < 20; j++) {
        const y = rect.height / 2 - j * cellHeight
        ctx.fillRect(x - cellWidth/2, y - cellHeight, cellWidth, cellHeight - 1)
      }
    })
    
    // 현재 가격선
    const currentX = ((currentPrice - minPrice) / priceRange) * rect.width
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(currentX, 0)
    ctx.lineTo(currentX, rect.height)
    ctx.stroke()
    
    // 가격 라벨
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px sans-serif'
    ctx.fillText(`$${currentPrice.toLocaleString()}`, currentX + 5, 20)
    
  }, [orderbook, currentPrice])
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">3D 유동성 깊이 히트맵</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-400">매수 유동성</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-400">매도 유동성</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-yellow-400"></div>
            <span className="text-gray-400">현재가</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <canvas 
          ref={canvasRef}
          className="w-full h-64 md:h-96 rounded-lg"
          style={{ background: 'linear-gradient(to bottom, #1a1a2e, #0f0f23)' }}
        />
        
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-3 py-1">
          <p className="text-xs text-gray-400">밝기 = 유동성 규모</p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">총 매수 유동성</p>
          <p className="text-green-400 font-semibold">
            ${(orderbook?.bids?.reduce((sum: number, b: any) => sum + b.total, 0) / 1000000).toFixed(2)}M
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">총 매도 유동성</p>
          <p className="text-red-400 font-semibold">
            ${(orderbook?.asks?.reduce((sum: number, a: any) => sum + a.total, 0) / 1000000).toFixed(2)}M
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">유동성 비율</p>
          <p className="text-yellow-400 font-semibold">
            {((orderbook?.bids?.reduce((sum: number, b: any) => sum + b.total, 0) / 
              (orderbook?.asks?.reduce((sum: number, a: any) => sum + a.total, 0) || 1)) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">깊이 레벨</p>
          <p className="text-purple-400 font-semibold">
            {orderbook?.bids?.length || 0} / {orderbook?.asks?.length || 0}
          </p>
        </div>
      </div>
    </div>
  )
}