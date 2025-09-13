'use client'

import { useEffect, useRef } from 'react'
import { createChart, IChartApi, ISeriesApi, ColorType } from 'lightweight-charts'

interface LightweightChartProps {
  data: any[]
  type?: 'candlestick' | 'line' | 'area' | 'bar'
  height?: number
  colors?: {
    background?: string
    lineColor?: string
    textColor?: string
    areaTopColor?: string
    areaBottomColor?: string
  }
}

export default function LightweightChart({
  data,
  type = 'candlestick',
  height = 400,
  colors = {
    background: 'transparent',
    lineColor: '#2962FF',
    textColor: '#999',
    areaTopColor: '#2962FF',
    areaBottomColor: 'rgba(41, 98, 255, 0.28)'
  }
}: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<any> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart
    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      grid: {
        vertLines: {
          color: 'rgba(197, 203, 206, 0.1)',
        },
        horzLines: {
          color: 'rgba(197, 203, 206, 0.1)',
        },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.3)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.3)',
      },
    })

    // Add series based on type
    switch (type) {
      case 'line':
        seriesRef.current = chartRef.current.addLineSeries({
          color: colors.lineColor,
          lineWidth: 2,
        })
        break
      case 'area':
        seriesRef.current = chartRef.current.addAreaSeries({
          lineColor: colors.areaTopColor,
          topColor: colors.areaTopColor,
          bottomColor: colors.areaBottomColor,
        })
        break
      case 'bar':
        seriesRef.current = chartRef.current.addHistogramSeries({
          color: colors.lineColor,
        })
        break
      case 'candlestick':
      default:
        seriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        })
        break
    }

    // Set data
    if (seriesRef.current && data && data.length > 0) {
      try {
        seriesRef.current.setData(data)
        chartRef.current.timeScale().fitContent()
      } catch (error) {
        console.error('Error setting chart data:', error)
      }
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
      }
    }
  }, [data, type, height, colors])

  // Update data when it changes
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      try {
        seriesRef.current.setData(data)
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent()
        }
      } catch (error) {
        console.error('Error updating chart data:', error)
      }
    }
  }, [data])

  return (
    <div 
      ref={chartContainerRef} 
      className="w-full"
      style={{ minHeight: height }}
    />
  )
}