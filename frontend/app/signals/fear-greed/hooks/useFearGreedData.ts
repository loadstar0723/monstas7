'use client'

import { useState, useEffect, useRef } from 'react'
import { fetch24hrTicker } from '@/lib/hooks/useRealtimePrice'
import { ModuleWebSocket } from '@/lib/moduleUtils'
import { BINANCE_CONFIG } from '@/lib/binanceConfig'

export interface FearGreedData {
  value: number
  classification: string
  timestamp: string
  updateTime: string
  // 코인별 추가 데이터
  coinPrice: number
  priceChange24h: number
  volume24h: number
  marketCap: number
  volatility: number
  // 계산된 지표
  coinSentiment: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed'
  rsi: number
  momentum: 'bullish' | 'bearish' | 'neutral'
  tradingSignal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
  confidence: number
}

export default function useFearGreedData(coin: string) {
  const [fearGreedData, setFearGreedData] = useState<FearGreedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<ModuleWebSocket | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 공포탐욕 지수 계산 (코인별)
  const calculateCoinSentiment = (
    marketIndex: number,
    priceChange: number,
    volume: number,
    volatility: number,
    rsi: number
  ): number => {
    // 전체 시장 지수 (40% 가중치)
    let coinIndex = marketIndex * 0.4

    // 가격 변화 (20% 가중치)
    if (priceChange > 10) coinIndex += 20
    else if (priceChange > 5) coinIndex += 15
    else if (priceChange > 0) coinIndex += 10
    else if (priceChange > -5) coinIndex += 5
    else coinIndex += 0

    // 거래량 (20% 가중치)
    // 높은 거래량 = 관심도 상승
    const volumeScore = Math.min(volume / 1000000000, 1) * 20
    coinIndex += volumeScore

    // 변동성 (10% 가중치)
    // 낮은 변동성 = 안정 = 탐욕
    const volatilityScore = Math.max(10 - volatility, 0)
    coinIndex += volatilityScore

    // RSI (10% 가중치)
    if (rsi > 70) coinIndex += 10 // 과매수 = 탐욕
    else if (rsi > 50) coinIndex += 7
    else if (rsi > 30) coinIndex += 3
    else coinIndex += 0 // 과매도 = 공포

    return Math.min(Math.max(Math.round(coinIndex), 0), 100)
  }

  const getClassification = (value: number): FearGreedData['coinSentiment'] => {
    if (value <= 20) return 'Extreme Fear'
    if (value <= 40) return 'Fear'
    if (value <= 60) return 'Neutral'
    if (value <= 80) return 'Greed'
    return 'Extreme Greed'
  }

  const getTradingSignal = (value: number): FearGreedData['tradingSignal'] => {
    if (value <= 20) return 'strong_buy'
    if (value <= 35) return 'buy'
    if (value <= 65) return 'hold'
    if (value <= 80) return 'sell'
    return 'strong_sell'
  }

  const fetchFearGreedData = async () => {
    try {
      // Alternative.me API 호출 (전체 시장)
      const fearGreedResponse = await fetch('/api/fear-greed')
      if (!fearGreedResponse.ok) {
        }
      
      let marketIndex = 50
      let marketClassification = 'Neutral'
      let fearGreedTimestamp = new Date().toISOString()
      
      if (fearGreedResponse.ok) {
        const fearGreedJson = await fearGreedResponse.json()
        marketIndex = fearGreedJson.value || 50
        marketClassification = fearGreedJson.value_classification || 'Neutral'
        fearGreedTimestamp = fearGreedJson.timestamp || new Date().toISOString()
      }

      // Binance API 호출 (코인별 데이터)
      const symbol = `${coin}USDT`
      
      // fetch24hrTicker는 직접 데이터를 반환함
      const stats = await fetch24hrTicker(symbol)
      // 디버깅용
      
      // 데이터가 없으면 기본값 사용
      if (!stats || stats.price === 0) {
        const defaultData: FearGreedData = {
          value: 50,
          classification: 'Neutral',
          timestamp: new Date().toISOString(),
          updateTime: new Date().toLocaleTimeString('ko-KR'),
          coinPrice: 0,
          priceChange24h: 0,
          volume24h: 0,
          marketCap: 0,
          volatility: 0,
          coinSentiment: 'Neutral',
          rsi: 50,
          momentum: 'neutral',
          tradingSignal: 'hold',
          confidence: 50
        }
        setFearGreedData(defaultData)
        return
      }
      
      // 24시간 통계 데이터 사용 (이미 파싱된 데이터)
      const currentPrice = stats.price || 0
      const priceChange = stats.change24h || 0
      const volume = stats.volume24h || 0
      const highPrice = stats.high24h || 0
      const lowPrice = stats.low24h || 0
      
      // 변동성 계산
      const volatility = currentPrice > 0 ? ((highPrice - lowPrice) / currentPrice) * 100 : 0

      // RSI 계산 (간단한 버전)
      const rsi = 50 + (priceChange * 2) // 실제로는 더 복잡한 계산 필요

      // 코인별 공포탐욕 지수 계산
      const coinSentimentValue = calculateCoinSentiment(
        marketIndex,
        priceChange,
        volume,
        volatility,
        Math.min(Math.max(rsi, 0), 100)
      )

      // 모멘텀 판단
      const momentum = priceChange > 2 ? 'bullish' : priceChange < -2 ? 'bearish' : 'neutral'

      // 신뢰도 계산
      let confidence = 50
      if (coinSentimentValue <= 20 || coinSentimentValue >= 80) {
        confidence = 85 // 극단값에서 높은 신뢰도
      } else if (coinSentimentValue <= 35 || coinSentimentValue >= 65) {
        confidence = 70
      }

      const data: FearGreedData = {
        value: coinSentimentValue,
        classification: marketClassification,
        timestamp: fearGreedTimestamp,
        updateTime: new Date().toLocaleTimeString('ko-KR'),
        coinPrice: currentPrice,
        priceChange24h: priceChange,
        volume24h: volume,
        marketCap: currentPrice * 19000000, // 예시 (실제로는 각 코인별 공급량 필요)
        volatility,
        coinSentiment: getClassification(coinSentimentValue),
        rsi: Math.min(Math.max(rsi, 0), 100),
        momentum,
        tradingSignal: getTradingSignal(coinSentimentValue),
        confidence
      }

      setFearGreedData(data)
      setError(null)
    } catch (err) {
      console.error('Fear & Greed 데이터 fetch 오류:', err)
      setError(err instanceof Error ? err.message : '데이터 로드 실패')
    }
  }

  useEffect(() => {
    setLoading(true)
    
    // 초기 데이터 로드
    fetchFearGreedData().finally(() => setLoading(false))

    // 5분마다 업데이트
    intervalRef.current = setInterval(fetchFearGreedData, 5 * 60 * 1000)

    // WebSocket 연결 (실시간 가격 업데이트)
    try {
      const symbol = `${coin.toLowerCase()}usdt`
      wsRef.current = new ModuleWebSocket('FearGreed')
      const wsUrl = `${BINANCE_CONFIG.WS_BASE}/${symbol}@ticker`
      
      wsRef.current.connect(wsUrl, (data) => {
        // 실시간 가격 업데이트
        const newPrice = parseFloat(data.c || '0')
        const priceChange = parseFloat(data.P || '0')
        
        setFearGreedData(prev => {
          if (!prev) return prev
          
          // 실시간으로 일부 데이터만 업데이트
          const updatedSentiment = calculateCoinSentiment(
            prev.value,
            priceChange,
            prev.volume24h,
            prev.volatility,
            prev.rsi
          )
          
          return {
            ...prev,
            coinPrice: newPrice,
            priceChange24h: priceChange,
            updateTime: new Date().toLocaleTimeString('ko-KR'),
            value: updatedSentiment,
            coinSentiment: getClassification(updatedSentiment),
            tradingSignal: getTradingSignal(updatedSentiment)
          }
        })
      })
    } catch (wsError) {
      console.error('WebSocket 연결 오류:', wsError)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [coin])

  return { fearGreedData, loading, error }
}