/**
 * 전문 데이터 제공업체를 사용하는 마켓 데이터 훅
 * CoinGecko Pro + Binance WebSocket 하이브리드
 */

import { useState, useEffect, useCallback } from 'react'
import { marketDataService } from '@/lib/services/marketDataService'

interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  marketCap: number
  lastUpdate: Date
}

export function useMarketDataPro(symbol: string = 'BTCUSDT') {
  const [data, setData] = useState<MarketData>({
    symbol,
    price: 0,
    change24h: 0,
    volume24h: 0,
    high24h: 0,
    low24h: 0,
    marketCap: 0,
    lastUpdate: new Date()
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 초기 데이터 로드 (CoinGecko)
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      const marketData = await marketDataService.getMarketData(symbol)
      
      setData({
        symbol,
        price: marketData.price,
        change24h: marketData.change24h,
        volume24h: marketData.volume24h,
        high24h: marketData.high24h,
        low24h: marketData.low24h,
        marketCap: marketData.marketCap,
        lastUpdate: new Date()
      })
      
      setError(null)
    } catch (err) {
      console.error('Failed to load market data:', err)
      setError('데이터 로드 실패')
    } finally {
      setLoading(false)
    }
  }, [symbol])
  
  // 실시간 업데이트 (Binance WebSocket)
  useEffect(() => {
    loadInitialData()
    
    // 실시간 가격 구독
    const handleRealtimeUpdate = (wsData: any) => {
      setData(prev => ({
        ...prev,
        price: parseFloat(wsData.c), // 현재 가격
        change24h: parseFloat(wsData.P), // 24시간 변화율
        volume24h: parseFloat(wsData.v) * parseFloat(wsData.c), // 거래량
        high24h: parseFloat(wsData.h), // 24시간 고가
        low24h: parseFloat(wsData.l), // 24시간 저가
        lastUpdate: new Date()
      }))
    }
    
    marketDataService.subscribeToRealtime(symbol, handleRealtimeUpdate)
    
    // 30초마다 전체 데이터 새로고침
    const interval = setInterval(loadInitialData, 30000)
    
    return () => {
      marketDataService.unsubscribeFromRealtime(symbol, handleRealtimeUpdate)
      clearInterval(interval)
    }
  }, [symbol, loadInitialData])
  
  return {
    data,
    loading,
    error,
    refresh: loadInitialData
  }
}

// 여러 심볼 동시 조회
export function useMultipleMarketData(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadPrices = async () => {
      try {
        setLoading(true)
        const data = await marketDataService.getPrices(symbols)
        setPrices(data)
      } catch (error) {
        console.error('Failed to load prices:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadPrices()
    const interval = setInterval(loadPrices, 30000)
    
    return () => clearInterval(interval)
  }, [symbols.join(',')])
  
  return { prices, loading }
}

// OHLCV 차트 데이터
export function useOHLCVData(symbol: string, days: number = 7) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadOHLCV = async () => {
      try {
        setLoading(true)
        const ohlcv = await marketDataService.getOHLCV(symbol, days)
        setData(ohlcv)
      } catch (error) {
        console.error('Failed to load OHLCV:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadOHLCV()
  }, [symbol, days])
  
  return { data, loading }
}

// 상위 100개 코인 티커
export function useTopTickers() {
  const [tickers, setTickers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadTickers = async () => {
      try {
        setLoading(true)
        const data = await marketDataService.getTickers()
        setTickers(data)
      } catch (error) {
        console.error('Failed to load tickers:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadTickers()
    const interval = setInterval(loadTickers, 60000) // 1분마다 갱신
    
    return () => clearInterval(interval)
  }, [])
  
  return { tickers, loading }
}