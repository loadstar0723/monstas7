'use client'

import React, { useEffect, useRef, useMemo } from 'react'

interface OrderBookData {
  bids: Array<[number, number]>
  asks: Array<[number, number]>
  lastUpdateId: number
}

interface SweepHeatmapProps {
  orderBook: OrderBookData | null
  currentPrice: number
}

export default function SweepHeatmap({ orderBook, currentPrice }: SweepHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // 오더북 데이터를 히트맵 형식으로 변환
  const heatmapData = useMemo(() => {
    if (!orderBook || !orderBook.bids || !orderBook.asks) return null
    
    try {
      // 빈 배열 체크
      if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
        return {
          bids: [],
          asks: [],
          maxVolume: 0
        }
      }
      
      // 숫자로 변환
      const bidVolumes = orderBook.bids.map(b => parseFloat(b[1]))
      const askVolumes = orderBook.asks.map(a => parseFloat(a[1]))
      
      const maxBidVolume = Math.max(...bidVolumes, 0)
      const maxAskVolume = Math.max(...askVolumes, 0)
      const maxVolume = Math.max(maxBidVolume, maxAskVolume, 1) // 0으로 나누기 방지
      
      return {
        bids: orderBook.bids.map(([price, volume]) => ({
          price: parseFloat(price),
          volume: parseFloat(volume),
          intensity: parseFloat(volume) / maxVolume
        })),
        asks: orderBook.asks.map(([price, volume]) => ({
          price: parseFloat(price),
          volume: parseFloat(volume),
          intensity: parseFloat(volume) / maxVolume
        })),
        maxVolume
      }
    } catch (error) {
      console.error('오더북 데이터 변환 오류:', error)
      return null
    }
  }, [orderBook])

  // Canvas 렌더링
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !heatmapData) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Canvas 크기 설정
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    // 배경 초기화
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, rect.width, rect.height)
    
    const levelHeight = rect.height / 40 // 40개 레벨 표시
    const priceWidth = 80
    const volumeWidth = rect.width - priceWidth - 20
    
    // 매도 주문 (위쪽) - 빨간색 계열
    heatmapData.asks.slice(0, 20).reverse().forEach((ask, index) => {
      const y = index * levelHeight
      
      // 히트맵 색상 - 빨간색 그라데이션
      const opacity = ask.intensity
      ctx.fillStyle = `rgba(239, 68, 68, ${opacity * 0.3})`
      ctx.fillRect(priceWidth + 10, y, volumeWidth * ask.intensity, levelHeight - 1)
      
      // 가격 표시
      ctx.fillStyle = '#9ca3af'
      ctx.font = '11px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(ask.price.toFixed(2), priceWidth, y + levelHeight / 2 + 4)
      
      // 볼륨 표시
      if (ask.intensity > 0.5) {
        ctx.fillStyle = '#f87171'
        ctx.font = '9px monospace'
        ctx.textAlign = 'left'
        ctx.fillText(ask.volume.toFixed(4), priceWidth + 15, y + levelHeight / 2 + 3)
      }
    })
    
    // 현재가 라인
    const midY = rect.height / 2
    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(0, midY)
    ctx.lineTo(rect.width, midY)
    ctx.stroke()
    ctx.setLineDash([])
    
    // 현재가 표시
    ctx.fillStyle = '#8b5cf6'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`$${currentPrice.toFixed(2)}`, rect.width / 2, midY - 8)
    
    // 매수 주문 (아래쪽) - 초록색 계열
    heatmapData.bids.slice(0, 20).forEach((bid, index) => {
      const y = midY + index * levelHeight
      
      // 히트맵 색상 - 초록색 그라데이션
      const opacity = bid.intensity
      ctx.fillStyle = `rgba(34, 197, 94, ${opacity * 0.3})`
      ctx.fillRect(priceWidth + 10, y, volumeWidth * bid.intensity, levelHeight - 1)
      
      // 가격 표시
      ctx.fillStyle = '#9ca3af'
      ctx.font = '11px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(bid.price.toFixed(2), priceWidth, y + levelHeight / 2 + 4)
      
      // 볼륨 표시
      if (bid.intensity > 0.5) {
        ctx.fillStyle = '#34d399'
        ctx.font = '9px monospace'
        ctx.textAlign = 'left'
        ctx.fillText(bid.volume.toFixed(4), priceWidth + 15, y + levelHeight / 2 + 3)
      }
    })
    
    // 스윕 위험 구역 표시
    const sweepThreshold = 0.8
    
    // 매도 스윕 위험 구역
    heatmapData.asks.forEach((ask, index) => {
      if (ask.intensity > sweepThreshold) {
        const y = (19 - index) * levelHeight
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 2
        ctx.strokeRect(priceWidth + 5, y, volumeWidth + 10, levelHeight)
        
        // 위험 표시
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText('⚠', 5, y + levelHeight / 2 + 3)
      }
    })
    
    // 매수 스윕 위험 구역
    heatmapData.bids.forEach((bid, index) => {
      if (bid.intensity > sweepThreshold) {
        const y = midY + index * levelHeight
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 2
        ctx.strokeRect(priceWidth + 5, y, volumeWidth + 10, levelHeight)
        
        // 위험 표시
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText('⚠', 5, y + levelHeight / 2 + 3)
      }
    })
    
  }, [heatmapData, currentPrice])

  // 통계 계산
  const stats = useMemo(() => {
    if (!heatmapData || !heatmapData.bids || !heatmapData.asks) return null
    
    try {
      const totalBidVolume = heatmapData.bids.reduce((sum, bid) => sum + (bid.volume || 0), 0)
      const totalAskVolume = heatmapData.asks.reduce((sum, ask) => sum + (ask.volume || 0), 0)
      
      const totalVolume = totalBidVolume + totalAskVolume
      const imbalance = totalVolume > 0 
        ? ((totalBidVolume - totalAskVolume) / totalVolume) * 100 
        : 0
      
      const sweepRiskBids = heatmapData.bids.filter(b => b.intensity > 0.8).length
      const sweepRiskAsks = heatmapData.asks.filter(a => a.intensity > 0.8).length
      
      return {
        totalBidVolume: totalBidVolume || 0,
        totalAskVolume: totalAskVolume || 0,
        imbalance: imbalance || 0,
        sweepRiskBids: sweepRiskBids || 0,
        sweepRiskAsks: sweepRiskAsks || 0,
        totalSweepRisk: (sweepRiskBids + sweepRiskAsks) || 0
      }
    } catch (error) {
      console.error('통계 계산 오류:', error)
      return {
        totalBidVolume: 0,
        totalAskVolume: 0,
        imbalance: 0,
        sweepRiskBids: 0,
        sweepRiskAsks: 0,
        totalSweepRisk: 0
      }
    }
  }, [heatmapData])

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">오더북 히트맵</h3>
          {stats && stats.totalSweepRisk > 0 && (
            <span className="text-sm text-yellow-500">
              ⚠️ {stats.totalSweepRisk}개 위험 레벨 감지
            </span>
          )}
        </div>
      </div>
      
      {/* 히트맵 캔버스 */}
      <div className="relative bg-gray-800 rounded-lg overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: '400px' }}
        />
        
        {!orderBook && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
            <p className="text-gray-400 text-sm">오더북 데이터 로딩 중...</p>
          </div>
        )}
      </div>
      
      {/* 범례 */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-green-500 rounded"></div>
            <span>매수</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-red-500 rounded"></div>
            <span>매도</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">⚠️</span>
            <span>위험</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>강도:</span>
          <div className="flex gap-1">
            {[0.2, 0.4, 0.6, 0.8, 1].map((opacity) => (
              <div
                key={opacity}
                className="w-3 h-1 bg-purple-500 rounded"
                style={{ opacity }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* 통계 */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">매수 물량</p>
            <p className="text-xl font-bold text-green-400">
              {typeof stats.totalBidVolume === 'number' 
                ? stats.totalBidVolume.toFixed(2) 
                : '0.00'}
            </p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">매도 물량</p>
            <p className="text-xl font-bold text-red-400">
              {typeof stats.totalAskVolume === 'number' 
                ? stats.totalAskVolume.toFixed(2) 
                : '0.00'}
            </p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">불균형</p>
            <p className={`text-xl font-bold ${
              stats.imbalance > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {typeof stats.imbalance === 'number' 
                ? `${stats.imbalance > 0 ? '+' : ''}${stats.imbalance.toFixed(1)}%`
                : '0.0%'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}