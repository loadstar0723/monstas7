'use client'

import { useEffect, useRef } from 'react'

interface ProfileData {
  price: number
  volume: number
  buyVolume: number
  sellVolume: number
  isPOC: boolean
  isValueArea: boolean
}

interface VolumeProfileChartProps {
  data: ProfileData[]
  height?: number
  title: string
}

export default function VolumeProfileChart({ data, height = 500, title }: VolumeProfileChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = height

    // Clear canvas
    ctx.fillStyle = '#1F2937'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (!data || data.length === 0) {
      // Default data if none provided
      data = [
        { price: 97000, volume: 1200, buyVolume: 700, sellVolume: 500, isPOC: false, isValueArea: true },
        { price: 97500, volume: 1500, buyVolume: 900, sellVolume: 600, isPOC: false, isValueArea: true },
        { price: 98000, volume: 2000, buyVolume: 1200, sellVolume: 800, isPOC: true, isValueArea: true },
        { price: 98500, volume: 1800, buyVolume: 1000, sellVolume: 800, isPOC: false, isValueArea: true },
        { price: 99000, volume: 1000, buyVolume: 400, sellVolume: 600, isPOC: false, isValueArea: false }
      ]
    }

    const padding = { top: 40, right: 60, bottom: 40, left: 100 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom

    // Find max values
    const maxVolume = Math.max(...data.map(d => d.volume))
    const minPrice = Math.min(...data.map(d => d.price))
    const maxPrice = Math.max(...data.map(d => d.price))

    // Draw grid
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 0.5
    ctx.setLineDash([3, 3])

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
    const barHeight = chartHeight / data.length * 0.8
    const barGap = chartHeight / data.length * 0.2

    data.forEach((item, index) => {
      const y = padding.top + (chartHeight / data.length) * index + barGap / 2
      const barWidth = (item.volume / maxVolume) * chartWidth

      // Draw bar with gradient
      const gradient = ctx.createLinearGradient(padding.left, 0, padding.left + barWidth, 0)
      
      if (item.isPOC) {
        gradient.addColorStop(0, '#FBBF24')
        gradient.addColorStop(1, '#F59E0B')
      } else if (item.isValueArea) {
        gradient.addColorStop(0, '#60A5FA')
        gradient.addColorStop(1, '#3B82F6')
      } else {
        gradient.addColorStop(0, '#8B5CF6')
        gradient.addColorStop(1, '#7C3AED')
      }

      ctx.fillStyle = gradient
      ctx.fillRect(padding.left, y, barWidth, barHeight)

      // Draw bar border
      ctx.strokeStyle = item.isPOC ? '#FBBF24' : item.isValueArea ? '#60A5FA' : '#8B5CF6'
      ctx.lineWidth = 2
      ctx.strokeRect(padding.left, y, barWidth, barHeight)

      // Draw price label
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '12px Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(`$${item.price.toFixed(0)}`, padding.left - 10, y + barHeight / 2 + 4)

      // Draw volume label
      ctx.textAlign = 'left'
      ctx.fillText(`${(item.volume / 1000).toFixed(1)}K`, padding.left + barWidth + 10, y + barHeight / 2 + 4)
    })

    // Draw axes
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

    // Title
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 18px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(title, canvas.width / 2, 25)

    // Legend
    const legendItems = [
      { label: 'POC', color: '#FBBF24' },
      { label: 'Value Area', color: '#60A5FA' },
      { label: 'Normal', color: '#8B5CF6' }
    ]

    let legendX = canvas.width / 2 - 150
    legendItems.forEach(item => {
      ctx.fillStyle = item.color
      ctx.fillRect(legendX, canvas.height - 20, 12, 12)
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '12px Inter, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(item.label, legendX + 16, canvas.height - 10)
      legendX += 100
    })

  }, [data, height, title])

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-2xl">
      <canvas 
        ref={canvasRef} 
        className="w-full cursor-crosshair"
        style={{ height: `${height}px` }}
      />
    </div>
  )
}