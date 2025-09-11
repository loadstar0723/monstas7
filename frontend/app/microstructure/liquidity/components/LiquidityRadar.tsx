'use client'

import { useEffect, useRef, useMemo } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface LiquidityRadarProps {
  orderbook: any
  history: any[]
}

export default function LiquidityRadar({ orderbook, history }: LiquidityRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // 레이더 데이터 계산
  const radarData = useMemo(() => {
    if (!orderbook) return null
    
    // 스프레드 타이트니스 (낮을수록 좋음, 반전 점수)
    const bestBid = orderbook.bids[0]?.price || 0
    const bestAsk = orderbook.asks[0]?.price || 0
    const spread = bestAsk - bestBid
    const spreadScore = Math.max(0, 100 - (spread / bestBid) * 1000)
    
    // 깊이 균형 (50에 가까울수록 좋음)
    const bidDepth = orderbook.bids.slice(0, 10).reduce((sum: number, b: any) => sum + b.total, 0)
    const askDepth = orderbook.asks.slice(0, 10).reduce((sum: number, a: any) => sum + a.total, 0)
    const depthBalance = Math.abs(50 - (bidDepth / (bidDepth + askDepth)) * 100)
    const balanceScore = 100 - depthBalance * 2
    
    // 유동성 크기
    const totalLiquidity = bidDepth + askDepth
    const liquidityScore = Math.min(100, (totalLiquidity / 5000000) * 100)
    
    // 주문 밀도 (주문 개수)
    const orderDensity = orderbook.bids.length + orderbook.asks.length
    const densityScore = Math.min(100, (orderDensity / 200) * 100)
    
    // 가격 안정성 (히스토리 기반)
    let stabilityScore = 80
    if (history.length > 10) {
      const recentPrices = history.slice(-10).map(h => {
        const bid = h.bids[0]?.price || 0
        const ask = h.asks[0]?.price || 0
        return (bid + ask) / 2
      })
      const avgPrice = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length
      const variance = recentPrices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / recentPrices.length
      const volatility = Math.sqrt(variance) / avgPrice
      stabilityScore = Math.max(0, 100 - volatility * 10000)
    }
    
    // 실행 가능성
    const executabilityScore = (spreadScore * 0.3 + liquidityScore * 0.4 + densityScore * 0.3)
    
    return {
      spread: spreadScore,
      balance: balanceScore,
      liquidity: liquidityScore,
      density: densityScore,
      stability: stabilityScore,
      executability: executabilityScore
    }
  }, [orderbook, history])
  
  // 레이더 차트 그리기
  useEffect(() => {
    if (!radarData || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 캔버스 크기 설정
    const size = Math.min(canvas.parentElement?.clientWidth || 300, 300)
    canvas.width = size
    canvas.height = size
    
    const centerX = size / 2
    const centerY = size / 2
    const radius = size * 0.35
    
    // 배경 클리어
    ctx.fillStyle = '#111111'
    ctx.fillRect(0, 0, size, size)
    
    // 레이더 축
    const categories = [
      { name: '스프레드', value: radarData.spread },
      { name: '균형성', value: radarData.balance },
      { name: '유동성', value: radarData.liquidity },
      { name: '밀도', value: radarData.density },
      { name: '안정성', value: radarData.stability },
      { name: '실행력', value: radarData.executability }
    ]
    
    const angleStep = (Math.PI * 2) / categories.length
    
    // 그리드 그리기
    for (let level = 1; level <= 5; level++) {
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
      ctx.lineWidth = 1
      
      for (let i = 0; i <= categories.length; i++) {
        const angle = i * angleStep - Math.PI / 2
        const x = centerX + Math.cos(angle) * radius * (level / 5)
        const y = centerY + Math.sin(angle) * radius * (level / 5)
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    }
    
    // 축 선 그리기
    categories.forEach((_, i) => {
      const angle = i * angleStep - Math.PI / 2
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.5)'
      ctx.lineWidth = 1
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      )
      ctx.stroke()
    })
    
    // 데이터 영역 그리기
    ctx.beginPath()
    ctx.fillStyle = 'rgba(139, 92, 246, 0.2)'
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)'
    ctx.lineWidth = 2
    
    categories.forEach((cat, i) => {
      const angle = i * angleStep - Math.PI / 2
      const value = cat.value / 100
      const x = centerX + Math.cos(angle) * radius * value
      const y = centerY + Math.sin(angle) * radius * value
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // 데이터 포인트 그리기
    categories.forEach((cat, i) => {
      const angle = i * angleStep - Math.PI / 2
      const value = cat.value / 100
      const x = centerX + Math.cos(angle) * radius * value
      const y = centerY + Math.sin(angle) * radius * value
      
      ctx.beginPath()
      ctx.fillStyle = '#a855f7'
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })
    
    // 라벨 그리기
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    categories.forEach((cat, i) => {
      const angle = i * angleStep - Math.PI / 2
      const labelX = centerX + Math.cos(angle) * (radius + 20)
      const labelY = centerY + Math.sin(angle) * (radius + 20)
      
      ctx.fillText(cat.name, labelX, labelY)
      
      // 값 표시
      const valueX = centerX + Math.cos(angle) * (radius + 35)
      const valueY = centerY + Math.sin(angle) * (radius + 35)
      ctx.fillStyle = '#9ca3af'
      ctx.font = '10px sans-serif'
      ctx.fillText(safeFixed(cat.value, 0), valueX, valueY)
      ctx.fillStyle = '#ffffff'
      ctx.font = '12px sans-serif'
    })
    
  }, [radarData])
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">유동성 레이더</h3>
        <p className="text-gray-400 text-sm">6개 핵심 지표의 종합 평가</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 레이더 차트 */}
        <div className="flex-shrink-0">
          <canvas 
            ref={canvasRef}
            className="max-w-full"
            style={{ maxWidth: '300px', maxHeight: '300px' }}
          />
        </div>
        
        {/* 지표 설명 */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">스프레드</span>
              <span className="text-white font-semibold">{radarData?.safeFixed(spread, 0)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${radarData?.spread || 0}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">균형성</span>
              <span className="text-white font-semibold">{radarData?.safeFixed(balance, 0)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${radarData?.balance || 0}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">유동성</span>
              <span className="text-white font-semibold">{radarData?.safeFixed(liquidity, 0)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${radarData?.liquidity || 0}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">밀도</span>
              <span className="text-white font-semibold">{radarData?.safeFixed(density, 0)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${radarData?.density || 0}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">안정성</span>
              <span className="text-white font-semibold">{radarData?.safeFixed(stability, 0)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${radarData?.stability || 0}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">실행력</span>
              <span className="text-white font-semibold">{radarData?.safeFixed(executability, 0)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${radarData?.executability || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* 종합 평가 */}
      <div className="mt-4 bg-gray-800/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">종합 유동성 점수</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-white">
              {((radarData?.spread || 0) * 0.2 + 
                (radarData?.balance || 0) * 0.15 + 
                (radarData?.liquidity || 0) * 0.25 + 
                (radarData?.density || 0) * 0.15 + 
                (radarData?.stability || 0) * 0.1 + 
                (radarData?.executability || 0) * 0.15).toFixed(1)}
            </span>
            <span className="text-gray-400 ml-1">/100</span>
          </div>
        </div>
      </div>
    </div>
  )
}