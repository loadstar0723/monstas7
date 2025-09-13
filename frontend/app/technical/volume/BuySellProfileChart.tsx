'use client'

import { useEffect, useRef } from 'react'

interface ProfileData {
  price: number
  buyVolume: number
  sellVolume: number
}

interface BuySellProfileChartProps {
  data: ProfileData[]
  height?: number
  title: string
}

export default function BuySellProfileChart({ data, height = 400, title }: BuySellProfileChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = height

    // Clear canvas with gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    bgGradient.addColorStop(0, '#111827')
    bgGradient.addColorStop(1, '#1F2937')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (!data || data.length === 0) {
      // Default data if none provided
      data = [
        { price: 97500, buyVolume: 600, sellVolume: 400 },
        { price: 98000, buyVolume: 1000, sellVolume: 800 },
        { price: 98500, buyVolume: 900, sellVolume: 900 },
        { price: 99000, buyVolume: 700, sellVolume: 500 }
      ]
    }

    const padding = { top: 50, right: 60, bottom: 60, left: 100 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom

    // Find max values
    const maxTotal = Math.max(...data.map(d => d.buyVolume + d.sellVolume))

    // Draw animated grid
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 0.5
    ctx.setLineDash([5, 5])

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(canvas.width - padding.right, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
      const x = padding.left + (chartWidth / 4) * i
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, canvas.height - padding.bottom)
      ctx.stroke()
    }

    ctx.setLineDash([])

    // Draw bars
    const barHeight = (chartHeight / data.length) * 0.7
    const barGap = (chartHeight / data.length) * 0.3

    data.forEach((item, index) => {
      const y = padding.top + (chartHeight / data.length) * index + barGap / 2
      const totalVolume = item.buyVolume + item.sellVolume
      const totalWidth = (totalVolume / maxTotal) * chartWidth
      const buyWidth = (item.buyVolume / totalVolume) * totalWidth
      const sellWidth = (item.sellVolume / totalVolume) * totalWidth

      // Draw buy volume with gradient
      const buyGradient = ctx.createLinearGradient(padding.left, 0, padding.left + buyWidth, 0)
      buyGradient.addColorStop(0, '#059669')
      buyGradient.addColorStop(0.5, '#10B981')
      buyGradient.addColorStop(1, '#34D399')
      
      ctx.fillStyle = buyGradient
      ctx.fillRect(padding.left, y, buyWidth, barHeight)

      // Add glow effect for buy
      ctx.shadowColor = '#10B981'
      ctx.shadowBlur = 10
      ctx.strokeStyle = '#10B981'
      ctx.lineWidth = 2
      ctx.strokeRect(padding.left, y, buyWidth, barHeight)
      ctx.shadowBlur = 0

      // Draw sell volume with gradient
      const sellGradient = ctx.createLinearGradient(padding.left + buyWidth, 0, padding.left + totalWidth, 0)
      sellGradient.addColorStop(0, '#DC2626')
      sellGradient.addColorStop(0.5, '#EF4444')
      sellGradient.addColorStop(1, '#F87171')
      
      ctx.fillStyle = sellGradient
      ctx.fillRect(padding.left + buyWidth, y, sellWidth, barHeight)

      // Add glow effect for sell
      ctx.shadowColor = '#EF4444'
      ctx.shadowBlur = 10
      ctx.strokeStyle = '#EF4444'
      ctx.lineWidth = 2
      ctx.strokeRect(padding.left + buyWidth, y, sellWidth, barHeight)
      ctx.shadowBlur = 0

      // Draw price label with background
      ctx.fillStyle = 'rgba(31, 41, 55, 0.8)'
      ctx.fillRect(padding.left - 85, y + barHeight / 2 - 10, 75, 20)
      
      ctx.fillStyle = '#F3F4F6'
      ctx.font = 'bold 13px Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(`$${item.price.toFixed(0)}`, padding.left - 10, y + barHeight / 2 + 4)

      // Draw volume labels on bars
      if (buyWidth > 40) {
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 11px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`${(item.buyVolume / 1000).toFixed(1)}K`, padding.left + buyWidth / 2, y + barHeight / 2 + 4)
      }

      if (sellWidth > 40) {
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 11px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`${(item.sellVolume / 1000).toFixed(1)}K`, padding.left + buyWidth + sellWidth / 2, y + barHeight / 2 + 4)
      }

      // Draw percentage
      const buyPercent = ((item.buyVolume / totalVolume) * 100).toFixed(1)
      const sellPercent = ((item.sellVolume / totalVolume) * 100).toFixed(1)
      
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '10px Inter, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`${buyPercent}% / ${sellPercent}%`, padding.left + totalWidth + 10, y + barHeight / 2 + 4)
    })

    // Draw axes with thicker lines
    ctx.strokeStyle = '#6B7280'
    ctx.lineWidth = 2

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, canvas.height - padding.bottom)
    ctx.stroke()

    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding.left, canvas.height - padding.bottom)
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom)
    ctx.stroke()

    // Title with shadow
    ctx.shadowColor = '#000000'
    ctx.shadowBlur = 4
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 20px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(title, canvas.width / 2, 30)
    ctx.shadowBlur = 0

    // X-axis label
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '12px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('거래량 (Volume)', canvas.width / 2, canvas.height - 10)

    // Legend with icons
    const legendItems = [
      { label: '매수 거래량', color: '#10B981', icon: '▲' },
      { label: '매도 거래량', color: '#EF4444', icon: '▼' }
    ]

    let legendX = canvas.width / 2 - 100
    const legendY = canvas.height - 35
    
    // Legend background
    ctx.fillStyle = 'rgba(31, 41, 55, 0.8)'
    ctx.fillRect(legendX - 10, legendY - 15, 220, 25)
    
    legendItems.forEach(item => {
      // Draw icon
      ctx.fillStyle = item.color
      ctx.font = 'bold 14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(item.icon, legendX, legendY)
      
      // Draw label
      ctx.fillStyle = '#E5E7EB'
      ctx.font = '12px Inter, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(item.label, legendX + 10, legendY)
      legendX += 110
    })

  }, [data, height, title])

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 shadow-2xl hover:shadow-purple-500/20 transition-shadow duration-300">
      <canvas 
        ref={canvasRef} 
        className="w-full cursor-crosshair"
        style={{ height: `${height}px` }}
      />
    </div>
  )
}