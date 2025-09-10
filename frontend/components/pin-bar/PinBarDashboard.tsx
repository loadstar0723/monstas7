'use client'

import { useState, useEffect } from 'react'
import { FaArrowUp, FaArrowDown, FaCircle, FaClock } from 'react-icons/fa'

interface PinBarDashboardProps {
  coins: Array<{ symbol: string; name: string; color: string }>
  selectedTimeframe: string
}

interface CoinPinBarData {
  symbol: string
  name: string
  price: number
  priceChange: number
  lastPinBar: {
    type: 'bullish' | 'bearish'
    time: string
    strength: number
    confidence: number
  } | null
  pinBarCount: {
    bullish: number
    bearish: number
    total: number
  }
  trend: 'bullish' | 'bearish' | 'neutral'
  volume: number
}

export default function PinBarDashboard({ coins, selectedTimeframe }: PinBarDashboardProps) {
  const [dashboardData, setDashboardData] = useState<CoinPinBarData[]>([])
  const [loading, setLoading] = useState(true)
  const [wsConnections, setWsConnections] = useState<Map<string, WebSocket>>(new Map())

  // 핀 바 패턴 감지 함수
  const detectPinBar = (candle: any) => {
    const open = parseFloat(candle.o)
    const high = parseFloat(candle.h)
    const low = parseFloat(candle.l)
    const close = parseFloat(candle.c)
    
    const body = Math.abs(close - open)
    const totalRange = high - low
    
    if (totalRange === 0) return null
    
    const upperWick = high - Math.max(open, close)
    const lowerWick = Math.min(open, close) - low
    
    const bodyRatio = (body / totalRange) * 100
    const upperWickRatio = (upperWick / totalRange) * 100
    const lowerWickRatio = (lowerWick / totalRange) * 100
    
    const isPinBar = bodyRatio <= 30
    const isBullishPin = isPinBar && lowerWickRatio >= 60
    const isBearishPin = isPinBar && upperWickRatio >= 60
    
    if (!isBullishPin && !isBearishPin) return null
    
    let strength = 0
    let confidence = 50
    
    if (isBullishPin) {
      strength = Math.min(100, lowerWickRatio * 1.2)
      confidence = Math.min(100, strength * 0.8 + 20)
    } else if (isBearishPin) {
      strength = Math.min(100, upperWickRatio * 1.2)
      confidence = Math.min(100, strength * 0.8 + 20)
    }
    
    return {
      type: isBullishPin ? 'bullish' : 'bearish',
      time: new Date(candle.t).toLocaleTimeString('ko-KR'),
      strength: Math.round(strength),
      confidence: Math.round(confidence)
    }
  }

  // 각 코인의 초기 데이터 로드
  const loadCoinData = async (coin: { symbol: string; name: string }) => {
    try {
      // 현재 가격 정보
      const tickerRes = await fetch(`/api/binance/ticker?symbol=${coin.symbol}`)
      const tickerData = await tickerRes.json()
      
      // 캔들 데이터로 핀 바 분석
      const klinesRes = await fetch(`/api/binance/klines?symbol=${coin.symbol}&interval=${selectedTimeframe}&limit=100`)
      const klinesData = await klinesRes.json()
      
      let bullishCount = 0
      let bearishCount = 0
      let lastPinBar = null
      
      if (Array.isArray(klinesData)) {
        for (let i = klinesData.length - 1; i >= 0; i--) {
          const candle = {
            t: klinesData[i][0],
            o: klinesData[i][1],
            h: klinesData[i][2],
            l: klinesData[i][3],
            c: klinesData[i][4],
            v: klinesData[i][5]
          }
          
          const pinBar = detectPinBar(candle)
          if (pinBar) {
            if (pinBar.type === 'bullish') bullishCount++
            else bearishCount++
            
            if (!lastPinBar) {
              lastPinBar = pinBar
            }
          }
        }
      }
      
      // 트렌드 판단
      let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral'
      if (bullishCount > bearishCount * 1.5) trend = 'bullish'
      else if (bearishCount > bullishCount * 1.5) trend = 'bearish'
      
      // 안전한 숫자 변환 함수
      const safeParseFloat = (value: any): number => {
        if (typeof value === 'number') return value
        if (typeof value === 'string') {
          const parsed = parseFloat(value)
          return isNaN(parsed) ? 0 : parsed
        }
        return 0
      }
      
      // Binance API 필드 매핑
      const currentPrice = safeParseFloat(tickerData?.lastPrice || tickerData?.price)
      const changePercent = safeParseFloat(tickerData?.priceChangePercent)
      const volumeValue = safeParseFloat(tickerData?.volume || tickerData?.quoteVolume)
      
      return {
        symbol: coin.symbol,
        name: coin.name,
        price: currentPrice,
        priceChange: changePercent,
        lastPinBar,
        pinBarCount: {
          bullish: bullishCount,
          bearish: bearishCount,
          total: bullishCount + bearishCount
        },
        trend,
        volume: volumeValue
      }
    } catch (error) {
      console.error(`${coin.symbol} 데이터 로드 실패:`, error)
      return {
        symbol: coin.symbol,
        name: coin.name,
        price: 0,
        priceChange: 0,
        lastPinBar: null,
        pinBarCount: { bullish: 0, bearish: 0, total: 0 },
        trend: 'neutral' as const,
        volume: 0
      }
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      const promises = coins.map(coin => loadCoinData(coin))
      const data = await Promise.all(promises)
      setDashboardData(data)
      setLoading(false)
    }
    
    loadAllData()
  }, [coins, selectedTimeframe])

  // WebSocket 연결 설정
  useEffect(() => {
    // 기존 연결 정리
    wsConnections.forEach(ws => ws.close())
    const newConnections = new Map<string, WebSocket>()
    
    coins.forEach(coin => {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.symbol.toLowerCase()}@kline_${selectedTimeframe}`)
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.k && data.k.x) { // 캔들 완성 시
          const pinBar = detectPinBar(data.k)
          if (pinBar) {
            setDashboardData(prev => prev.map(item => {
              if (item.symbol === coin.symbol) {
                return {
                  ...item,
                  lastPinBar: pinBar,
                  pinBarCount: {
                    ...item.pinBarCount,
                    [pinBar.type === 'bullish' ? 'bullish' : 'bearish']: 
                      item.pinBarCount[pinBar.type === 'bullish' ? 'bullish' : 'bearish'] + 1,
                    total: item.pinBarCount.total + 1
                  }
                }
              }
              return item
            }))
          }
        }
      }
      
      newConnections.set(coin.symbol, ws)
    })
    
    // 가격 업데이트용 통합 WebSocket
    const priceWs = new WebSocket(`wss://stream.binance.com:9443/ws/!ticker@arr`)
    priceWs.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (Array.isArray(data)) {
        setDashboardData(prev => prev.map(item => {
          const ticker = data.find(t => t.s === item.symbol)
          if (ticker) {
            // 안전한 숫자 변환
            const price = typeof ticker.c === 'number' ? ticker.c : parseFloat(ticker.c) || 0
            const priceChange = typeof ticker.P === 'number' ? ticker.P : parseFloat(ticker.P) || 0
            const volume = typeof ticker.v === 'number' ? ticker.v : parseFloat(ticker.v) || 0
            const volumeUSD = volume * price
            
            return {
              ...item,
              price: price,
              priceChange: priceChange,
              volume: volumeUSD
            }
          }
          return item
        }))
      }
    }
    
    setWsConnections(newConnections)
    
    return () => {
      newConnections.forEach(ws => ws.close())
      priceWs.close()
    }
  }, [coins, selectedTimeframe])

  const getPinBarColor = (type: 'bullish' | 'bearish' | null) => {
    if (!type) return 'text-gray-400'
    return type === 'bullish' ? 'text-green-400' : 'text-red-400'
  }

  const getStrengthColor = (strength: number) => {
    if (strength >= 70) return 'text-green-400'
    if (strength >= 40) return 'text-yellow-400'
    return 'text-gray-400'
  }

  const getTrendIcon = (trend: 'bullish' | 'bearish' | 'neutral') => {
    if (trend === 'bullish') return <FaArrowUp className="text-green-400" />
    if (trend === 'bearish') return <FaArrowDown className="text-red-400" />
    return <FaCircle className="text-gray-400 text-xs" />
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">10개 코인 핀 바 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-2">🎯 멀티 코인 핀 바 대시보드</h3>
        <p className="text-gray-400 text-sm">10개 주요 코인의 핀 바 패턴을 실시간으로 모니터링</p>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {dashboardData.map((coin) => (
            <div 
              key={coin.symbol}
              className="bg-gray-900/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition p-3"
            >
              {/* 코인 헤더 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white">{coin.name}</h4>
                  {getTrendIcon(coin.trend)}
                </div>
                <span className="text-xs text-gray-500">{coin.symbol}</span>
              </div>
              
              {/* 가격 정보 */}
              <div className="mb-3">
                <p className="text-lg font-bold text-white">
                  ${coin.price > 100 
                    ? coin.price.toFixed(2) 
                    : coin.price > 1 
                    ? coin.price.toFixed(4)
                    : coin.price.toFixed(6)}
                </p>
                <p className={`text-sm ${coin.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.priceChange >= 0 ? '+' : ''}{coin.priceChange.toFixed(2)}%
                </p>
              </div>
              
              {/* 핀 바 통계 */}
              <div className="grid grid-cols-3 gap-1 mb-3 text-xs">
                <div className="text-center">
                  <p className="text-gray-500">총</p>
                  <p className="font-bold text-white">{coin.pinBarCount.total}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">🟢</p>
                  <p className="font-bold text-green-400">{coin.pinBarCount.bullish}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">🔴</p>
                  <p className="font-bold text-red-400">{coin.pinBarCount.bearish}</p>
                </div>
              </div>
              
              {/* 마지막 핀 바 */}
              {coin.lastPinBar ? (
                <div className={`rounded-lg p-2 ${
                  coin.lastPinBar.type === 'bullish' 
                    ? 'bg-green-900/20 border border-green-500/30' 
                    : 'bg-red-900/20 border border-red-500/30'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${getPinBarColor(coin.lastPinBar.type)}`}>
                      {coin.lastPinBar.type === 'bullish' ? 'Bullish' : 'Bearish'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FaClock className="text-[8px]" />
                      {coin.lastPinBar.time}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">강도</span>
                    <span className={`font-medium ${getStrengthColor(coin.lastPinBar.strength)}`}>
                      {coin.lastPinBar.strength}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">핀 바 대기 중...</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* 요약 통계 */}
        <div className="mt-6 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-bold text-gray-400 mb-3">📊 전체 요약</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-500 text-xs mb-1">총 핀 바 감지</p>
              <p className="text-xl font-bold text-white">
                {dashboardData.reduce((sum, coin) => sum + coin.pinBarCount.total, 0)}개
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Bullish 패턴</p>
              <p className="text-xl font-bold text-green-400">
                {dashboardData.reduce((sum, coin) => sum + coin.pinBarCount.bullish, 0)}개
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Bearish 패턴</p>
              <p className="text-xl font-bold text-red-400">
                {dashboardData.reduce((sum, coin) => sum + coin.pinBarCount.bearish, 0)}개
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">강한 시그널 (70%+)</p>
              <p className="text-xl font-bold text-purple-400">
                {dashboardData.filter(coin => 
                  coin.lastPinBar && coin.lastPinBar.strength >= 70
                ).length}개
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}