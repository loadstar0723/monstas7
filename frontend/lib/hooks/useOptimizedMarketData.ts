/**
 * 최적화된 마켓 데이터 훅
 * Binance WebSocket + CryptoCompare 하이브리드
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { dataService } from '@/lib/services/finalDataService'

interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  timestamp: number
}

export function useOptimizedMarketData(symbol: string = 'BTCUSDT') {
  const [data, setData] = useState<MarketData>({
    symbol,
    price: 0,
    change24h: 0,
    volume24h: 0,
    high24h: 0,
    low24h: 0,
    timestamp: Date.now()
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const callbackRef = useRef<(data: any) => void>()
  
  // WebSocket 콜백
  callbackRef.current = useCallback((wsData: any) => {
    setData({
      symbol: wsData.symbol,
      price: wsData.price,
      change24h: wsData.change24h,
      volume24h: wsData.volume24h,
      high24h: wsData.high24h,
      low24h: wsData.low24h,
      timestamp: wsData.timestamp
    })
    setLoading(false)
    setError(null)
  }, [])
  
  useEffect(() => {
    // 캐시된 데이터 먼저 확인
    const cached = dataService.getPrice(symbol)
    if (cached) {
      setData(prev => ({
        ...prev,
        price: cached.price,
        change24h: cached.change24h,
        volume24h: cached.volume24h
      }))
      setLoading(false)
    }
    
    // WebSocket 구독
    const callback = (data: any) => callbackRef.current?.(data)
    dataService.subscribeToPrice(symbol, callback)
    
    // 클린업
    return () => {
      dataService.unsubscribeFromPrice(symbol, callback)
    }
  }, [symbol])
  
  return { data, loading, error }
}

// 뉴스 데이터 훅
export function useMarketNews(categories?: string[]) {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true)
        const data = await dataService.getNews(categories)
        setNews(data)
      } catch (error) {
        console.error('뉴스 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadNews()
    // 30분마다 새로고침
    const interval = setInterval(loadNews, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [categories?.join(',')])
  
  return { news, loading }
}

// 공포 탐욕 지수 훅
export function useFearGreedIndex() {
  const [index, setIndex] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadIndex = async () => {
      try {
        setLoading(true)
        const data = await dataService.getFearGreedIndex()
        setIndex(data)
      } catch (error) {
        console.error('Fear & Greed 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadIndex()
    // 1시간마다 새로고침
    const interval = setInterval(loadIndex, 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return { index, loading }
}

// 소셜 통계 훅
export function useSocialStats(symbol: string) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await dataService.getSocialStats(symbol)
        setStats(data)
      } catch (error) {
        console.error('소셜 통계 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
    // 30분마다 새로고침
    const interval = setInterval(loadStats, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [symbol])
  
  return { stats, loading }
}

// 사용량 통계 훅
export function useDataServiceStats() {
  const [stats, setStats] = useState<any>(null)
  
  useEffect(() => {
    const updateStats = () => {
      setStats(dataService.getStats())
    }
    
    updateStats()
    const interval = setInterval(updateStats, 5000) // 5초마다 업데이트
    
    return () => clearInterval(interval)
  }, [])
  
  return stats
}