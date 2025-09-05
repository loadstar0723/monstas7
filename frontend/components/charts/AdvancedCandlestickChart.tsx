'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, IChartApi, ISeriesApi, CandlestickData, ColorType } from 'lightweight-charts'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import { FaExpand, FaCompress, FaChartLine, FaVolumeUp } from 'react-icons/fa'

interface AdvancedCandlestickChartProps {
  symbol: string
  interval?: string
  height?: number
}

export default function AdvancedCandlestickChart({ 
  symbol, 
  interval = '1h',
  height = 500 
}: AdvancedCandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const candleSeries = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeries = useRef<ISeriesApi<'Histogram'> | null>(null)
  
  const { isDarkMode } = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showVolume, setShowVolume] = useState(true)
  const [data, setData] = useState<CandlestickData[]>([])

  // 실시간 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`
        )
        const klines = await response.json()
        
        const formattedData: CandlestickData[] = klines.map((k: any) => ({
          time: k[0] / 1000,
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5])
        }))
        
        setData(formattedData)
      } catch (error) {
        console.error('차트 데이터 로드 실패:', error)
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, 5000) // 5초마다 업데이트
    
    return () => clearInterval(intervalId)
  }, [symbol, interval])

  // 차트 초기화 및 업데이트
  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return

    // 차트 생성
    chart.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDarkMode ? '#1a1a1a' : '#ffffff' },
        textColor: isDarkMode ? '#d1d5db' : '#4b5563',
      },
      grid: {
        vertLines: { color: isDarkMode ? '#2d2d2d' : '#e5e7eb' },
        horzLines: { color: isDarkMode ? '#2d2d2d' : '#e5e7eb' },
      },
      width: chartContainerRef.current.clientWidth,
      height: isFullscreen ? window.innerHeight - 100 : height,
      rightPriceScale: {
        borderColor: isDarkMode ? '#2d2d2d' : '#e5e7eb',
      },
      timeScale: {
        borderColor: isDarkMode ? '#2d2d2d' : '#e5e7eb',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: isDarkMode ? '#6b7280' : '#9ca3af',
          style: 3,
        },
        horzLine: {
          width: 1,
          color: isDarkMode ? '#6b7280' : '#9ca3af',
          style: 3,
        },
      },
    })

    // 캔들스틱 시리즈 추가
    candleSeries.current = chart.current.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    // 볼륨 시리즈 추가
    if (showVolume) {
      volumeSeries.current = chart.current.addHistogramSeries({
        color: '#3b82f6',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      })

      chart.current.priceScale('').applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      })

      const volumeData = data.map(d => ({
        time: d.time,
        value: d.volume || 0,
        color: d.close >= d.open ? '#22c55e50' : '#ef444450'
      }))
      
      volumeSeries.current.setData(volumeData)
    }

    // 데이터 설정
    candleSeries.current.setData(data)

    // 화면 크기 조정
    const handleResize = () => {
      if (chart.current && chartContainerRef.current) {
        chart.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 100 : height
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.current?.remove()
    }
  }, [data, isDarkMode, isFullscreen, height, showVolume])

  // WebSocket 연결 (실시간 업데이트)
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`)
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      const kline = message.k
      
      if (kline && candleSeries.current) {
        const newCandle: CandlestickData = {
          time: kline.t / 1000,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
        }
        
        candleSeries.current.update(newCandle)
        
        if (showVolume && volumeSeries.current) {
          volumeSeries.current.update({
            time: kline.t / 1000,
            value: parseFloat(kline.v),
            color: parseFloat(kline.c) >= parseFloat(kline.o) ? '#22c55e50' : '#ef444450'
          })
        }
      }
    }

    return () => {
      ws.close()
    }
  }, [symbol, interval, showVolume])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      chartContainerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {symbol} 차트
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            실시간 캔들스틱 차트 • {interval}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 볼륨 토글 */}
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`p-2 rounded-lg transition-colors ${
              showVolume 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
            title="볼륨 표시"
          >
            <FaVolumeUp className="w-4 h-4" />
          </button>
          
          {/* 전체화면 토글 */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={isFullscreen ? '전체화면 종료' : '전체화면'}
          >
            {isFullscreen ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 차트 컨테이너 */}
      <div 
        ref={chartContainerRef} 
        className="relative rounded-lg overflow-hidden"
        style={{ height: isFullscreen ? 'calc(100vh - 100px)' : `${height}px` }}
      />

      {/* 인디케이터 범례 */}
      <div className="mt-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm" />
          <span className="text-gray-600 dark:text-gray-400">상승</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm" />
          <span className="text-gray-600 dark:text-gray-400">하락</span>
        </div>
        {showVolume && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm opacity-50" />
            <span className="text-gray-600 dark:text-gray-400">거래량</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}