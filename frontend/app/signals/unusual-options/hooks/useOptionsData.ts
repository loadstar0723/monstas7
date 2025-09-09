'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface OptionsFlow {
  id: string
  symbol: string
  type: 'CALL' | 'PUT'
  strike: number
  expiry: string
  volume: number
  premium: number
  iv: number
  delta: number
  gamma: number
  unusualScore: number
  timestamp: Date
  exchange: string
}

interface GammaExposure {
  strike: number
  callGamma: number
  putGamma: number
  netGamma: number
}

export function useOptionsData(selectedCoin: string) {
  const [currentPrice, setCurrentPrice] = useState(0)
  const [optionsFlows, setOptionsFlows] = useState<OptionsFlow[]>([])
  const [gammaExposure, setGammaExposure] = useState<GammaExposure[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [volumeHistory, setVolumeHistory] = useState<any[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket 연결
  const connectWebSocket = useCallback((symbol: string) => {
    try {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }

      // Binance WebSocket 스트림 URL
      const streamName = `${symbol.toLowerCase()}@ticker`
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`)
      
      ws.onopen = () => {
        console.log('WebSocket connected for:', symbol)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          // Binance ticker 스트림 데이터 처리
          if (data.s === symbol) {
            const price = parseFloat(data.c) // 현재가
            setCurrentPrice(price)
          }
        } catch (err) {
          console.error('WebSocket message parse error:', err)
        }
      }

      ws.onerror = (error) => {
        console.warn('WebSocket error occurred, will retry...')
        // 재연결 시도
        setTimeout(() => {
          if (wsRef.current === ws) {
            connectWebSocket(symbol)
          }
        }, 5000)
      }

      ws.onclose = () => {
        console.log('WebSocket closed for:', symbol)
      }

      wsRef.current = ws
    } catch (error) {
      console.error('WebSocket connection error:', error)
      // 초기 가격 설정 (WebSocket 실패 시)
      const initialPrices: Record<string, number> = {
        'BTCUSDT': 98000,
        'ETHUSDT': 3500,
        'BNBUSDT': 700,
        'SOLUSDT': 240,
        'XRPUSDT': 2.4,
        'ADAUSDT': 1.0,
        'DOGEUSDT': 0.4,
        'AVAXUSDT': 40,
        'MATICUSDT': 0.5,
        'ARBUSDT': 1.2
      }
      setCurrentPrice(initialPrices[symbol] || 100)
    }
  }, [])

  // 옵션 플로우 데이터 가져오기 (강화된 V2 API 사용)
  const fetchOptionsFlow = useCallback(async () => {
    setLoading(true)
    try {
      // 새로운 V2 API 사용 - 실제 데이터 기반
      const res = await fetch(`/api/binance/options-flow-v2?symbol=${selectedCoin}`)
      const data = await res.json()
      
      if (data.success) {
        setOptionsFlows(data.data.flows || [])
        setGammaExposure(data.data.gammaExposure || [])
        setStats({
          ...data.data.stats,
          marketFlow: data.data.marketFlow,
          priceTargets: data.data.priceTargets
        })
        
        // 실제 거래 데이터 기반 볼륨 히스토리
        const history = data.data.flows.slice(0, 10).map((flow: OptionsFlow) => ({
          time: new Date(flow.timestamp).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          call: flow.type === 'CALL' ? flow.volume : 0,
          put: flow.type === 'PUT' ? flow.volume : 0,
          total: flow.volume
        }))
        setVolumeHistory(history)
        
        // 과거 24시간 차트 데이터 가져오기
        fetchHistoricalData(selectedCoin)
      }
    } catch (error) {
      console.error('Options flow error:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCoin])
  
  // 과거 데이터 가져오기 (차트용)
  const fetchHistoricalData = async (symbol: string) => {
    try {
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`)
      const klines = await res.json()
      
      const historicalData = klines.map((k: any) => ({
        time: new Date(k[0]).toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        price: parseFloat(k[4]),
        volume: parseFloat(k[5]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3])
      }))
      
      // 실제 과거 데이터를 기반으로 볼륨 히스토리 업데이트
      const volumeData = historicalData.slice(-10).map((d: any, idx: number) => ({
        time: d.time,
        call: d.volume * (d.price > historicalData[idx > 0 ? idx - 1 : 0]?.price ? 0.6 : 0.4),
        put: d.volume * (d.price < historicalData[idx > 0 ? idx - 1 : 0]?.price ? 0.6 : 0.4),
        total: d.volume
      }))
      
      setVolumeHistory(volumeData)
    } catch (error) {
      console.error('Historical data error:', error)
    }
  }

  useEffect(() => {
    connectWebSocket(selectedCoin)
    fetchOptionsFlow()
    
    const interval = setInterval(fetchOptionsFlow, 30000)
    
    return () => {
      clearInterval(interval)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [selectedCoin, connectWebSocket, fetchOptionsFlow])

  return {
    currentPrice,
    optionsFlows,
    gammaExposure,
    stats,
    loading,
    volumeHistory
  }
}