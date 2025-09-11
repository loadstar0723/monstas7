'use client'

import { useEffect, useRef, useState } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { FaExpand, FaCompress, FaCog } from 'react-icons/fa'

interface TradingChartProps {
  symbol: string
}

const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' }
]

const INDICATORS = [
  { id: 'ma', name: 'MA', color: '#2962FF' },
  { id: 'ema', name: 'EMA', color: '#FF6D00' },
  { id: 'bb', name: 'BB', color: '#00E676' },
  { id: 'volume', name: 'Volume', color: '#7B1FA2' }
]

export default function TradingChart({ symbol }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const candlestickSeriesRef = useRef<any>(null)
  const volumeSeriesRef = useRef<any>(null)
  const wsRef = useRef<WebSocket | null>(null)
  
  const [timeframe, setTimeframe] = useState('1h')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['volume'])
  const [loading, setLoading] = useState(true)
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [priceChange, setPriceChange] = useState<number>(0)
  
  // 차트 초기화 (동적 임포트)
  useEffect(() => {
    if (!chartContainerRef.current) return
    
    const initChart = async () => {
      try {
        const { createChart, ColorType } = await import('lightweight-charts')
        
        const chart = createChart(chartContainerRef.current!, {
          width: chartContainerRef.current!.clientWidth,
          height: isFullscreen ? window.innerHeight - 100 : 400,
          layout: {
            background: { type: ColorType.Solid, color: 'transparent' },
            textColor: '#d1d5db',
          },
          grid: {
            vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
            horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
          },
          crosshair: {
            mode: 1,
            vertLine: {
              width: 1,
              color: '#9B7DFF',
              style: 3,
            },
            horzLine: {
              width: 1,
              color: '#9B7DFF',
              style: 3,
            },
          },
          rightPriceScale: {
            borderColor: 'rgba(42, 46, 57, 0.5)',
            scaleMargins: {
              top: 0.1,
              bottom: 0.2,
            },
          },
          timeScale: {
            borderColor: 'rgba(42, 46, 57, 0.5)',
            timeVisible: true,
            secondsVisible: false,
          },
        })
        
        chartRef.current = chart
        
        // 캔들스틱 시리즈
        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        })
        candlestickSeriesRef.current = candlestickSeries
        
        // 볼륨 시리즈
        const volumeSeries = chart.addHistogramSeries({
          color: '#26a69a',
          priceFormat: { type: 'volume' },
          priceScaleId: '',
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        })
        volumeSeriesRef.current = volumeSeries
        
        // 초기 데이터 로드
        await loadHistoricalData()
        
        // 반응형 처리
        const handleResize = () => {
          if (chartContainerRef.current) {
            chart.applyOptions({ 
              width: chartContainerRef.current.clientWidth,
              height: isFullscreen ? window.innerHeight - 100 : 400
            })
          }
        }
        
        window.addEventListener('resize', handleResize)
        
        return () => {
          window.removeEventListener('resize', handleResize)
          chart.remove()
        }
      } catch (error) {
        console.error('Chart initialization error:', error)
        setLoading(false)
      }
    }
    
    initChart()
  }, [symbol, timeframe, isFullscreen])
  
  // 과거 데이터 로드
  const loadHistoricalData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=${timeframe}&limit=200`)
      
      if (!response.ok) {
        console.error('Failed to fetch klines:', response.status)
        return
      }
      
      // Content-Type 확인
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType)
        return
      }
      
      const data = await response.json()
      
      if (data && Array.isArray(data)) {
        const candleData = data.map((d: any) => ({
          time: d[0] / 1000,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }))
        
        const volumeData = data.map((d: any) => ({
          time: d[0] / 1000,
          value: parseFloat(d[5]),
          color: parseFloat(d[4]) >= parseFloat(d[1]) ? '#26a69a' : '#ef5350',
        }))
        
        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setData(candleData)
        }
        
        if (volumeSeriesRef.current && activeIndicators.includes('volume')) {
          volumeSeriesRef.current.setData(volumeData)
        }
        
        // 현재 가격 설정
        if (candleData.length > 0) {
          const lastCandle = candleData[candleData.length - 1]
          setCurrentPrice(lastCandle.close)
          
          if (candleData.length > 1) {
            const prevCandle = candleData[candleData.length - 2]
            const change = ((lastCandle.close - prevCandle.close) / prevCandle.close) * 100
            setPriceChange(change)
          }
        }
        
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent()
        }
      }
    } catch (error) {
      console.error('Error loading historical data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // WebSocket 연결
  useEffect(() => {
    const connectWebSocket = () => {
      const wsSymbol = symbol.toLowerCase()
      wsRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@kline_${timeframe}`)
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.k) {
          const candle = {
            time: data.k.t / 1000,
            open: parseFloat(data.k.o),
            high: parseFloat(data.k.h),
            low: parseFloat(data.k.l),
            close: parseFloat(data.k.c),
          }
          
          const volume = {
            time: data.k.t / 1000,
            value: parseFloat(data.k.v),
            color: parseFloat(data.k.c) >= parseFloat(data.k.o) ? '#26a69a' : '#ef5350',
          }
          
          if (candlestickSeriesRef.current) {
            candlestickSeriesRef.current.update(candle)
          }
          
          if (volumeSeriesRef.current && activeIndicators.includes('volume')) {
            volumeSeriesRef.current.update(volume)
          }
          
          setCurrentPrice(candle.close)
          const change = ((candle.close - candle.open) / candle.open) * 100
          setPriceChange(change)
        }
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected')
        setTimeout(connectWebSocket, 3000)
      }
    }
    
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [symbol, timeframe])
  
  // 인디케이터 토글
  const toggleIndicator = (indicatorId: string) => {
    setActiveIndicators(prev => 
      prev.includes(indicatorId)
        ? prev.filter(id => id !== indicatorId)
        : [...prev, indicatorId]
    )
  }
  
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">{symbol}</h2>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-white">
              ${safePrice(currentPrice, 2)}
            </span>
            <span className={`text-lg font-semibold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? '+' : ''}{safePrice(priceChange, 2)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isFullscreen ? <FaCompress className="text-white" /> : <FaExpand className="text-white" />}
          </button>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <FaCog className="text-white" />
          </button>
        </div>
      </div>
      
      {/* 타임프레임 선택 */}
      <div className="flex items-center gap-2 mb-4">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`px-3 py-1 rounded-lg transition-all ${
              timeframe === tf.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>
      
      {/* 인디케이터 선택 */}
      <div className="flex items-center gap-2 mb-4">
        {INDICATORS.map(indicator => (
          <button
            key={indicator.id}
            onClick={() => toggleIndicator(indicator.id)}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeIndicators.includes(indicator.id)
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {indicator.name}
          </button>
        ))}
      </div>
      
      {/* 차트 컨테이너 */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
            <div className="text-white">Loading chart...</div>
          </div>
        )}
        <div 
          ref={chartContainerRef} 
          className={`bg-gray-950 rounded-lg ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}
          style={{ height: isFullscreen ? 'calc(100vh - 100px)' : '400px' }}
        />
      </div>
      
      {/* 차트 정보 */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-sm">24h High</div>
          <div className="text-white font-bold">${(currentPrice * 1.02).toFixed(2)}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-sm">24h Low</div>
          <div className="text-white font-bold">${(currentPrice * 0.98).toFixed(2)}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-sm">24h Volume</div>
          <div className="text-white font-bold">$2.34B</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-sm">Market Cap</div>
          <div className="text-white font-bold">$1.24T</div>
        </div>
      </div>
    </div>
  )
}