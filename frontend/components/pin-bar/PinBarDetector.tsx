'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaArrowUp, FaArrowDown, FaChartLine, FaExclamationTriangle } from 'react-icons/fa'

interface PinBarDetectorProps {
  symbol: string
  timeframe: string
}

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface PinBarPattern {
  type: 'bullish' | 'bearish'
  time: string
  price: number
  strength: number // 0-100
  bodyRatio: number
  upperWickRatio: number
  lowerWickRatio: number
  volume: number
  confidence: number // 0-100
}

export default function PinBarDetector({ symbol, timeframe }: PinBarDetectorProps) {
  const [candles, setCandles] = useState<Candle[]>([])
  const [pinBars, setPinBars] = useState<PinBarPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [lastDetection, setLastDetection] = useState<PinBarPattern | null>(null)
  const [detectionStats, setDetectionStats] = useState({
    total: 0,
    bullish: 0,
    bearish: 0,
    avgStrength: 0
  })

  // 핀 바 패턴 감지 알고리즘
  const detectPinBar = (candle: Candle, prevCandle?: Candle): PinBarPattern | null => {
    const body = Math.abs(candle.close - candle.open)
    const totalRange = candle.high - candle.low
    
    if (totalRange === 0) return null
    
    const upperWick = candle.high - Math.max(candle.open, candle.close)
    const lowerWick = Math.min(candle.open, candle.close) - candle.low
    
    const bodyRatio = (body / totalRange) * 100
    const upperWickRatio = (upperWick / totalRange) * 100
    const lowerWickRatio = (lowerWick / totalRange) * 100
    
    // 핀 바 조건: 몸통이 전체 범위의 30% 이하
    const isPinBar = bodyRatio <= 30
    
    // Bullish Pin Bar: 긴 아래꼬리 (전체의 60% 이상)
    const isBullishPin = isPinBar && lowerWickRatio >= 60
    
    // Bearish Pin Bar: 긴 위꼬리 (전체의 60% 이상)
    const isBearishPin = isPinBar && upperWickRatio >= 60
    
    if (!isBullishPin && !isBearishPin) return null
    
    // 패턴 강도 계산
    let strength = 0
    let confidence = 0
    
    if (isBullishPin) {
      strength = Math.min(100, lowerWickRatio * 1.2)
      // 이전 캔들이 하락이면 신뢰도 증가
      if (prevCandle && prevCandle.close < prevCandle.open) {
        confidence += 30
      }
      // 거래량이 평균보다 높으면 신뢰도 증가
      if (candle.volume > (prevCandle?.volume || 0) * 1.5) {
        confidence += 20
      }
      confidence += Math.min(50, strength * 0.5)
    } else if (isBearishPin) {
      strength = Math.min(100, upperWickRatio * 1.2)
      // 이전 캔들이 상승이면 신뢰도 증가
      if (prevCandle && prevCandle.close > prevCandle.open) {
        confidence += 30
      }
      // 거래량이 평균보다 높으면 신뢰도 증가
      if (candle.volume > (prevCandle?.volume || 0) * 1.5) {
        confidence += 20
      }
      confidence += Math.min(50, strength * 0.5)
    }
    
    return {
      type: isBullishPin ? 'bullish' : 'bearish',
      time: new Date(candle.time).toLocaleString('ko-KR'),
      price: candle.close,
      strength: Math.round(strength),
      bodyRatio: Math.round(bodyRatio),
      upperWickRatio: Math.round(upperWickRatio),
      lowerWickRatio: Math.round(lowerWickRatio),
      volume: candle.volume,
      confidence: Math.min(100, Math.round(confidence))
    }
  }

  // 캔들 데이터 로드 및 핀 바 감지
  useEffect(() => {
    const loadCandles = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=${timeframe}&limit=100`)
        const data = await response.json()
        
        if (Array.isArray(data)) {
          const formattedCandles: Candle[] = data.map((k: any[]) => ({
            time: k[0],
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5])
          }))
          
          setCandles(formattedCandles)
          
          // 핀 바 패턴 감지
          const detectedPatterns: PinBarPattern[] = []
          for (let i = 1; i < formattedCandles.length; i++) {
            const pattern = detectPinBar(formattedCandles[i], formattedCandles[i - 1])
            if (pattern) {
              detectedPatterns.push(pattern)
            }
          }
          
          setPinBars(detectedPatterns.slice(-10)) // 최근 10개만 표시
          
          // 통계 계산
          const bullishCount = detectedPatterns.filter(p => p.type === 'bullish').length
          const bearishCount = detectedPatterns.filter(p => p.type === 'bearish').length
          const avgStrength = detectedPatterns.length > 0 
            ? detectedPatterns.reduce((sum, p) => sum + p.strength, 0) / detectedPatterns.length
            : 0
          
          setDetectionStats({
            total: detectedPatterns.length,
            bullish: bullishCount,
            bearish: bearishCount,
            avgStrength: Math.round(avgStrength)
          })
          
          // 마지막 감지된 패턴
          if (detectedPatterns.length > 0) {
            setLastDetection(detectedPatterns[detectedPatterns.length - 1])
          }
        }
      } catch (error) {
        console.error('캔들 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadCandles()
    const interval = setInterval(loadCandles, 60000) // 1분마다 업데이트
    
    return () => clearInterval(interval)
  }, [symbol, timeframe])

  // WebSocket으로 실시간 캔들 업데이트
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${timeframe}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.k) {
        const newCandle: Candle = {
          time: data.k.t,
          open: parseFloat(data.k.o),
          high: parseFloat(data.k.h),
          low: parseFloat(data.k.l),
          close: parseFloat(data.k.c),
          volume: parseFloat(data.k.v)
        }
        
        // 실시간 핀 바 감지
        if (candles.length > 0) {
          const pattern = detectPinBar(newCandle, candles[candles.length - 1])
          if (pattern && data.k.x) { // 캔들 완성 시에만
            setPinBars(prev => [...prev.slice(-9), pattern])
            setLastDetection(pattern)
            setDetectionStats(prev => ({
              total: prev.total + 1,
              bullish: prev.bullish + (pattern.type === 'bullish' ? 1 : 0),
              bearish: prev.bearish + (pattern.type === 'bearish' ? 1 : 0),
              avgStrength: Math.round((prev.avgStrength * prev.total + pattern.strength) / (prev.total + 1))
            }))
          }
        }
      }
    }
    
    return () => ws.close()
  }, [symbol, timeframe, candles])

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">🎯 핀 바 패턴 감지</h3>
        
        {/* 통계 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-900/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs mb-1">총 감지</p>
            <p className="text-white font-bold">{detectionStats.total}개</p>
          </div>
          <div className="bg-green-900/30 rounded-lg p-2">
            <p className="text-green-400 text-xs mb-1">Bullish</p>
            <p className="text-green-400 font-bold">{detectionStats.bullish}개</p>
          </div>
          <div className="bg-red-900/30 rounded-lg p-2">
            <p className="text-red-400 text-xs mb-1">Bearish</p>
            <p className="text-red-400 font-bold">{detectionStats.bearish}개</p>
          </div>
          <div className="bg-purple-900/30 rounded-lg p-2">
            <p className="text-purple-400 text-xs mb-1">평균 강도</p>
            <p className="text-purple-400 font-bold">{detectionStats.avgStrength}%</p>
          </div>
        </div>
        
        {/* 마지막 감지 */}
        {lastDetection && (
          <div className={`rounded-lg p-3 ${
            lastDetection.type === 'bullish' 
              ? 'bg-green-900/30 border border-green-500/50' 
              : 'bg-red-900/30 border border-red-500/50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {lastDetection.type === 'bullish' ? (
                  <FaArrowUp className="text-green-400" />
                ) : (
                  <FaArrowDown className="text-red-400" />
                )}
                <span className={`font-bold ${
                  lastDetection.type === 'bullish' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {lastDetection.type === 'bullish' ? 'Bullish' : 'Bearish'} Pin Bar
                </span>
              </div>
              <span className="text-gray-400 text-sm">{lastDetection.time}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">가격: </span>
                <span className="text-white">${safePrice(lastDetection.price, 2)}</span>
              </div>
              <div>
                <span className="text-gray-400">강도: </span>
                <span className={`font-bold ${
                  lastDetection.strength >= 70 ? 'text-green-400' : 
                  lastDetection.strength >= 40 ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {lastDetection.strength}%
                </span>
              </div>
              <div>
                <span className="text-gray-400">신뢰도: </span>
                <span className={`font-bold ${
                  lastDetection.confidence >= 70 ? 'text-green-400' : 
                  lastDetection.confidence >= 40 ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {lastDetection.confidence}%
                </span>
              </div>
              <div>
                <span className="text-gray-400">거래량: </span>
                <span className="text-white">{safeFixed(lastDetection.volume, 2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 핀 바 목록 */}
      <div className="p-4">
        <h4 className="text-sm font-bold text-gray-400 mb-3">최근 감지된 패턴</h4>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">패턴 분석 중...</p>
          </div>
        ) : pinBars.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {pinBars.map((pattern, index) => (
              <div 
                key={index}
                className={`rounded-lg p-3 border ${
                  pattern.type === 'bullish' 
                    ? 'bg-green-900/20 border-green-500/30 hover:bg-green-900/30' 
                    : 'bg-red-900/20 border-red-500/30 hover:bg-red-900/30'
                } transition cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {pattern.type === 'bullish' ? (
                      <FaArrowUp className="text-green-400 text-sm" />
                    ) : (
                      <FaArrowDown className="text-red-400 text-sm" />
                    )}
                    <span className={`text-sm font-medium ${
                      pattern.type === 'bullish' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {pattern.type === 'bullish' ? 'Bullish' : 'Bearish'}
                    </span>
                    {pattern.strength >= 70 && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                        강함
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500 text-xs">{pattern.time}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">가격</span>
                    <p className="text-white">${safePrice(pattern.price, 2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">강도</span>
                    <p className={`font-medium ${
                      pattern.strength >= 70 ? 'text-green-400' : 
                      pattern.strength >= 40 ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {pattern.strength}%
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">신뢰도</span>
                    <p className={`font-medium ${
                      pattern.confidence >= 70 ? 'text-green-400' : 
                      pattern.confidence >= 40 ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {pattern.confidence}%
                    </p>
                  </div>
                </div>
                
                {/* 비율 표시 */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-16">몸통</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-gray-400 h-1.5 rounded-full"
                        style={{ width: `${pattern.bodyRatio}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-400 text-xs w-10 text-right">{pattern.bodyRatio}%</span>
                  </div>
                  {pattern.type === 'bullish' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs w-16">아래꼬리</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-green-400 h-1.5 rounded-full"
                          style={{ width: `${pattern.lowerWickRatio}%` }}
                        ></div>
                      </div>
                      <span className="text-green-400 text-xs w-10 text-right">{pattern.lowerWickRatio}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs w-16">위꼬리</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-red-400 h-1.5 rounded-full"
                          style={{ width: `${pattern.upperWickRatio}%` }}
                        ></div>
                      </div>
                      <span className="text-red-400 text-xs w-10 text-right">{pattern.upperWickRatio}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaExclamationTriangle className="text-gray-500 text-3xl mx-auto mb-2" />
            <p className="text-gray-400">아직 감지된 핀 바 패턴이 없습니다</p>
            <p className="text-gray-500 text-sm mt-1">패턴이 형성되면 자동으로 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  )
}