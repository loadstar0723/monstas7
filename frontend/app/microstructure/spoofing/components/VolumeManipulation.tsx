'use client'

import { useEffect, useState, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaChartBar, FaExclamationTriangle, FaArrowUp, FaArrowDown, FaHistory } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

interface VolumeAnomaly {
  id: string
  timestamp: number
  price: number
  volume: number
  avgVolume: number
  spike: number // 평균 대비 배수
  type: 'wash' | 'pump' | 'dump' | 'normal'
  suspicious: boolean
}

interface VolumePattern {
  type: 'repeating' | 'artificial' | 'organic'
  confidence: number
  description: string
}

interface VolumeManipulationProps {
  tradeData: any[]
  symbol: string
  settings: any
}

export default function VolumeManipulation({ tradeData, symbol, settings }: VolumeManipulationProps) {
  const [anomalies, setAnomalies] = useState<VolumeAnomaly[]>([])
  const [patterns, setPatterns] = useState<VolumePattern[]>([])
  const [stats, setStats] = useState({
    totalAnomalies: 0,
    washTrades: 0,
    pumpDumps: 0,
    avgVolumeSpike: 0,
    manipulationScore: 0,
    suspiciousRatio: 0
  })
  
  const volumeHistory = useRef<{ timestamp: number, volume: number, price: number }[]>([])
  const detectionBuffer = useRef<VolumeAnomaly[]>([])
  const patternAnalysis = useRef<Map<string, number>>(new Map())

  // 거래량 이상 감지
  useEffect(() => {
    if (!tradeData || tradeData.length === 0) return

    const currentTime = Date.now()
    const timeWindow = settings?.volumeTimeWindow || 60000 // 1분 기본
    const spikeThreshold = settings?.volumeSpikeThreshold || 3 // 평균의 3배

    // 최근 거래 데이터 집계
    const recentTrades = tradeData.filter(
      trade => currentTime - trade.time < timeWindow
    )

    if (recentTrades.length === 0) return

    // 거래량 계산
    const volumeBySecond = new Map<number, { volume: number, price: number, count: number }>()
    
    recentTrades.forEach(trade => {
      const second = Math.floor(trade.time / 1000)
      const existing = volumeBySecond.get(second) || { volume: 0, price: 0, count: 0 }
      
      volumeBySecond.set(second, {
        volume: existing.volume + trade.quantity,
        price: trade.price,
        count: existing.count + 1
      })
    })

    // 평균 거래량 계산
    const volumes = Array.from(volumeBySecond.values()).map(v => v.volume)
    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length
    const stdDev = Math.sqrt(
      volumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumes.length
    )

    // 이상 거래량 감지
    const detectedAnomalies: VolumeAnomaly[] = []
    
    volumeBySecond.forEach((data, second) => {
      const spike = data.volume / avgVolume
      
      if (spike >= spikeThreshold) {
        // 워시 트레이딩 감지 (같은 가격에서 대량 거래)
        const priceVariance = calculatePriceVariance(recentTrades, second * 1000, 1000)
        let type: 'wash' | 'pump' | 'dump' | 'normal' = 'normal'
        let suspicious = false
        
        if (priceVariance < 0.001 && spike > 5) {
          type = 'wash'
          suspicious = true
        } else if (data.price > avgVolume && spike > 4) {
          type = 'pump'
          suspicious = true
        } else if (data.price < avgVolume && spike > 4) {
          type = 'dump'
          suspicious = true
        }
        
        const anomaly: VolumeAnomaly = {
          id: `anomaly-${second}-${currentTime}`,
          timestamp: second * 1000,
          price: data.price,
          volume: data.volume,
          avgVolume,
          spike,
          type,
          suspicious
        }
        
        detectedAnomalies.push(anomaly)
        detectionBuffer.current.push(anomaly)
      }
    })

    // 패턴 분석
    analyzePatterns(volumeBySecond, avgVolume)

    // 버퍼 정리 (최근 5분만 유지)
    detectionBuffer.current = detectionBuffer.current.filter(
      a => currentTime - a.timestamp < 300000
    )

    // 최근 이상 거래 업데이트
    const recentAnomalies = detectionBuffer.current
      .filter(a => currentTime - a.timestamp < 60000)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20)

    setAnomalies(recentAnomalies)

    // 통계 계산
    if (detectionBuffer.current.length > 0) {
      const recent = detectionBuffer.current.filter(
        a => currentTime - a.timestamp < 300000
      )
      
      const washTrades = recent.filter(a => a.type === 'wash')
      const pumpDumps = recent.filter(a => a.type === 'pump' || a.type === 'dump')
      const suspicious = recent.filter(a => a.suspicious)
      const avgSpike = recent.reduce((sum, a) => sum + a.spike, 0) / recent.length

      setStats({
        totalAnomalies: recent.length,
        washTrades: washTrades.length,
        pumpDumps: pumpDumps.length,
        avgVolumeSpike: avgSpike,
        manipulationScore: Math.min(100, (suspicious.length / recent.length) * 100),
        suspiciousRatio: (suspicious.length / recent.length) * 100
      })
    }
  }, [tradeData, settings])

  // 가격 변동성 계산
  const calculatePriceVariance = (trades: any[], startTime: number, duration: number) => {
    const windowTrades = trades.filter(
      t => t.time >= startTime && t.time < startTime + duration
    )
    
    if (windowTrades.length < 2) return 0
    
    const prices = windowTrades.map(t => t.price)
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
    
    return variance / (avgPrice * avgPrice) // 정규화된 변동성
  }

  // 패턴 분석
  const analyzePatterns = (volumeData: Map<number, any>, avgVolume: number) => {
    const detectedPatterns: VolumePattern[] = []
    
    // 반복 패턴 감지
    const intervals: number[] = []
    let lastSpike = 0
    
    volumeData.forEach((data, second) => {
      if (data.volume > avgVolume * 2) {
        if (lastSpike > 0) {
          intervals.push(second - lastSpike)
        }
        lastSpike = second
      }
    })
    
    if (intervals.length >= 3) {
      const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length
      const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length
      
      if (variance < avgInterval * 0.2) {
        detectedPatterns.push({
          type: 'repeating',
          confidence: 90 - (variance / avgInterval) * 100,
          description: `${Math.round(avgInterval)}초 간격 반복 패턴`
        })
      }
    }
    
    // 인공적 패턴 감지
    const volumes = Array.from(volumeData.values()).map(v => v.volume)
    const roundedCount = volumes.filter(v => v % 100 === 0 || v % 1000 === 0).length
    
    if (roundedCount / volumes.length > 0.3) {
      detectedPatterns.push({
        type: 'artificial',
        confidence: (roundedCount / volumes.length) * 100,
        description: '인위적 거래량 패턴 감지'
      })
    }
    
    setPatterns(detectedPatterns)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'wash': return 'text-purple-500'
      case 'pump': return 'text-green-500'
      case 'dump': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'wash': return 'bg-purple-900/30 border-purple-700'
      case 'pump': return 'bg-green-900/30 border-green-700'
      case 'dump': return 'bg-red-900/30 border-red-700'
      default: return 'bg-gray-900/30 border-gray-700'
    }
  }

  const getManipulationLevel = (score: number) => {
    if (score >= 70) return { text: '매우 높음', color: 'text-red-500' }
    if (score >= 40) return { text: '높음', color: 'text-orange-500' }
    if (score >= 20) return { text: '중간', color: 'text-yellow-500' }
    return { text: '낮음', color: 'text-green-500' }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaChartBar className="text-orange-400" />
          <h3 className="text-lg font-bold text-white">거래량 조작 감지</h3>
        </div>
        <span className="text-sm text-gray-400">{symbol}</span>
      </div>

      {/* 조작 점수 */}
      <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">조작 가능성</span>
          <span className={`text-lg font-bold ${getManipulationLevel(stats.manipulationScore).color}`}>
            {getManipulationLevel(stats.manipulationScore).text}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${
              stats.manipulationScore > 70 ? 'bg-red-500' :
              stats.manipulationScore > 40 ? 'bg-orange-500' :
              stats.manipulationScore > 20 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${stats.manipulationScore}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1 text-right">
          {safeFixed(stats.manipulationScore, 1)}%
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">전체 이상</div>
          <div className="text-lg font-bold text-white">{stats.totalAnomalies}</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">워시 트레이딩</div>
          <div className="text-lg font-bold text-purple-400">{stats.washTrades}</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">펌프/덤프</div>
          <div className="text-lg font-bold text-orange-400">{stats.pumpDumps}</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">평균 스파이크</div>
          <div className="text-lg font-bold text-yellow-400">
            {safeFixed(stats.avgVolumeSpike, 1)}x
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">의심 비율</div>
          <div className="text-lg font-bold text-red-400">
            {safeFixed(stats.suspiciousRatio, 1)}%
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">조작 점수</div>
          <div className={`text-lg font-bold ${getManipulationLevel(stats.manipulationScore).color}`}>
            {safeFixed(stats.manipulationScore, 0)}
          </div>
        </div>
      </div>

      {/* 패턴 감지 */}
      {patterns.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-300 mb-2">감지된 패턴</div>
          <div className="space-y-1">
            {patterns.map((pattern, index) => (
              <div key={index} className="p-2 bg-gray-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    pattern.type === 'repeating' ? 'text-purple-400' :
                    pattern.type === 'artificial' ? 'text-orange-400' :
                    'text-gray-400'
                  }`}>
                    {pattern.description}
                  </span>
                  <span className="text-xs text-gray-500">
                    신뢰도: {safeFixed(pattern.confidence, 0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 실시간 이상 거래 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FaHistory className="text-gray-400 text-sm" />
          <span className="text-sm font-semibold text-gray-300">거래량 이상 감지 (최근 1분)</span>
        </div>
        
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          <AnimatePresence>
            {anomalies.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <FaChartBar className="text-2xl mx-auto mb-1 opacity-30" />
                <p className="text-sm">이상 거래량이 감지되지 않았습니다</p>
              </div>
            ) : (
              anomalies.map((anomaly, index) => (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.02 }}
                  className={`p-2 rounded-lg border ${getTypeBg(anomaly.type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {anomaly.type === 'wash' ? (
                        <FaExclamationTriangle className="text-purple-400 text-xs" />
                      ) : anomaly.type === 'pump' ? (
                        <FaArrowUp className="text-green-400 text-xs" />
                      ) : anomaly.type === 'dump' ? (
                        <FaArrowDown className="text-red-400 text-xs" />
                      ) : null}
                      
                      <span className={`text-xs font-bold ${getTypeColor(anomaly.type)}`}>
                        {anomaly.type === 'wash' ? '워시' :
                         anomaly.type === 'pump' ? '펌프' :
                         anomaly.type === 'dump' ? '덤프' : '일반'}
                      </span>
                      
                      <span className="text-xs text-white">
                        ${anomaly.price.toLocaleString()}
                      </span>
                      
                      <span className="text-xs text-gray-400">
                        거래량: {safeFixed(anomaly.volume, 4)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${
                        anomaly.spike > 10 ? 'text-red-400' :
                        anomaly.spike > 5 ? 'text-orange-400' :
                        'text-yellow-400'
                      }`}>
                        {safeFixed(anomaly.spike, 1)}x
                      </span>
                      
                      {anomaly.suspicious && (
                        <span className="text-xs text-red-400 animate-pulse">의심</span>
                      )}
                      
                      <span className="text-xs text-gray-500">
                        {new Date(anomaly.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 경고 */}
      {stats.manipulationScore > 50 && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="text-red-400 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-red-400">
                높은 조작 가능성 감지
              </div>
              <div className="text-xs text-gray-400 mt-1">
                거래량 조작 점수가 {safeFixed(stats.manipulationScore, 0)}%입니다.
                워시 트레이딩 {stats.washTrades}건, 펌프/덤프 {stats.pumpDumps}건이 감지되었습니다.
                거래 시 주의가 필요합니다.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}