'use client'

import React, { useMemo } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface SweepData {
  timestamp: number
  price: number
  volume: number
  type: 'aggressive' | 'stealth' | 'ladder' | 'iceberg'
  impact: number
  side: 'buy' | 'sell'
}

interface SweepPatternDetectorProps {
  sweeps: SweepData[]
  symbol?: string
}

export default function SweepPatternDetector({ sweeps, symbol = 'BTCUSDT' }: SweepPatternDetectorProps) {
  // 패턴 분석
  const patternAnalysis = useMemo(() => {
    const patterns = {
      accumulation: 0,        // 누적 패턴 (연속적인 소규모 매수)
      distribution: 0,        // 분산 패턴 (연속적인 소규모 매도)
      momentum: 0,            // 모멘텀 패턴 (같은 방향 대규모)
      reversal: 0,            // 반전 패턴 (방향 전환)
      consolidation: 0,       // 횡보 패턴 (양방향 균형)
      breakout: 0            // 돌파 패턴 (급격한 볼륨 증가)
    }
    
    // 패턴 감지 로직
    for (let i = 1; i < sweeps.length; i++) {
      const current = sweeps[i]
      const prev = sweeps[i - 1]
      
      // 누적/분산 패턴
      if (current.type === 'stealth' || current.type === 'iceberg') {
        if (current.side === 'buy') patterns.accumulation++
        else patterns.distribution++
      }
      
      // 모멘텀 패턴
      if (current.side === prev.side && current.volume > prev.volume) {
        patterns.momentum++
      }
      
      // 반전 패턴
      if (current.side !== prev.side && current.impact > 2) {
        patterns.reversal++
      }
      
      // 횡보 패턴
      if (Math.abs(current.price - prev.price) / prev.price < 0.001) {
        patterns.consolidation++
      }
      
      // 돌파 패턴
      if (current.impact > 3 && current.type === 'aggressive') {
        patterns.breakout++
      }
    }
    
    // 정규화 (0-100 스케일)
    const maxCount = Math.max(...Object.values(patterns), 1)
    const normalized = Object.entries(patterns).map(([pattern, count]) => ({
      pattern: pattern === 'accumulation' ? '누적' :
               pattern === 'distribution' ? '분산' :
               pattern === 'momentum' ? '모멘텀' :
               pattern === 'reversal' ? '반전' :
               pattern === 'consolidation' ? '횡보' : '돌파',
      value: (count / maxCount) * 100,
      count
    }))
    
    return { patterns, normalized }
  }, [sweeps])

  // 시간대별 패턴 분석
  const timePatterns = useMemo(() => {
    const hourlyPatterns: Record<string, Record<string, number>> = {}
    
    sweeps.forEach(sweep => {
      const hour = new Date(sweep.timestamp).getHours()
      const timeSlot = `${hour}:00-${hour + 1}:00`
      
      if (!hourlyPatterns[timeSlot]) {
        hourlyPatterns[timeSlot] = {
          aggressive: 0,
          stealth: 0,
          ladder: 0,
          iceberg: 0
        }
      }
      
      hourlyPatterns[timeSlot][sweep.type]++
    })
    
    return Object.entries(hourlyPatterns).map(([time, patterns]) => ({
      time,
      ...patterns
    }))
  }, [sweeps])

  // 연속 패턴 감지
  const sequencePatterns = useMemo(() => {
    const sequences: Array<{
      type: string
      length: number
      startTime: number
      endTime: number
      totalVolume: number
      avgImpact: number
    }> = []
    
    let currentSequence: typeof sequences[0] | null = null
    
    sweeps.forEach((sweep, index) => {
      if (index === 0) {
        currentSequence = {
          type: sweep.side,
          length: 1,
          startTime: sweep.timestamp,
          endTime: sweep.timestamp,
          totalVolume: sweep.volume,
          avgImpact: sweep.impact
        }
      } else if (currentSequence) {
        if (sweep.side === currentSequence.type) {
          // 같은 방향 연속
          currentSequence.length++
          currentSequence.endTime = sweep.timestamp
          currentSequence.totalVolume += sweep.volume
          currentSequence.avgImpact = (currentSequence.avgImpact * (currentSequence.length - 1) + sweep.impact) / currentSequence.length
        } else {
          // 방향 전환
          if (currentSequence.length >= 3) {
            sequences.push({ ...currentSequence })
          }
          currentSequence = {
            type: sweep.side,
            length: 1,
            startTime: sweep.timestamp,
            endTime: sweep.timestamp,
            totalVolume: sweep.volume,
            avgImpact: sweep.impact
          }
        }
      }
    })
    
    // 마지막 시퀀스 추가
    if (currentSequence && currentSequence.length >= 3) {
      sequences.push(currentSequence)
    }
    
    return sequences
  }, [sweeps])

  // 패턴 신뢰도 계산
  const patternConfidence = useMemo(() => {
    if (sweeps.length < 10) return 0
    
    const { patterns } = patternAnalysis
    const totalPatterns = Object.values(patterns).reduce((sum, count) => sum + count, 0)
    
    // 다양한 패턴이 균등하게 나타날수록 신뢰도 높음
    const diversity = Object.values(patterns).filter(count => count > 0).length / 6
    
    // 충분한 데이터가 있을수록 신뢰도 높음
    const dataConfidence = Math.min(sweeps.length / 100, 1)
    
    return ((diversity + dataConfidence) / 2) * 100
  }, [sweeps, patternAnalysis])

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">
          스윕 패턴 감지 - {symbol.replace('USDT', '')}
        </h3>
      </div>
      
      <div className="space-y-6">
        {/* 패턴 레이더 차트 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm text-gray-400">패턴 분석</h4>
            <span className="text-xs text-gray-500">
              신뢰도: {patternConfidence.toFixed(0)}%
            </span>
          </div>
        
          <div className="h-80 bg-gray-800/30 p-4 rounded-lg">
            {patternAnalysis.normalized.some(p => p.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={patternAnalysis.normalized}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="pattern" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis stroke="#374151" domain={[0, 100]} />
                  <Radar
                    name="패턴 강도"
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                            <p className="text-white font-medium">{data.pattern}</p>
                            <p className="text-gray-400 text-sm">강도: {data.value.toFixed(1)}%</p>
                            <p className="text-gray-400 text-sm">횟수: {data.count}회</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">패턴 분석 준비 중</div>
                  <p className="text-xs text-gray-500">데이터를 수집하고 있습니다...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* 연속 패턴 */}
        <div>
          <h4 className="text-sm text-gray-400 mb-4">연속 스윕 패턴</h4>
          {sequencePatterns.length > 0 ? (
            <div className="space-y-3">
              {sequencePatterns.slice(-5).reverse().map((seq, index) => (
                <div key={index} className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${seq.type === 'buy' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-medium text-white">
                        {seq.type === 'buy' ? '매수' : '매도'} 연속 {seq.length}회
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(seq.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(seq.endTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400">총 거래량</span>
                      <p className="text-white font-medium mt-1">{seq.totalVolume.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">평균 영향도</span>
                      <p className="text-yellow-400 font-medium mt-1">{seq.avgImpact.toFixed(2)}%</p>
                    </div>
                    <div>
                      <span className="text-gray-400">지속 시간</span>
                      <p className="text-white font-medium mt-1">
                        {Math.round((seq.endTime - seq.startTime) / 60000)}분
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">연속 패턴 대기 중</p>
              <p className="text-xs text-gray-500">3회 이상 연속 필요</p>
            </div>
          )}
        </div>

        {/* 패턴 기반 전략 제안 */}
        <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-800/30">
          <h4 className="text-sm font-medium text-white mb-4">패턴 기반 트레이딩 전략</h4>
          <div className="space-y-3">
          {patternAnalysis.patterns.accumulation > patternAnalysis.patterns.distribution && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1" />
              <p className="text-sm text-gray-300">
                <span className="font-medium text-green-400">누적 패턴 우세:</span> 은밀한 매수 진행 중. 
                중장기 상승 가능성 높음
              </p>
            </div>
          )}
          
          {patternAnalysis.patterns.momentum > 5 && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-1" />
              <p className="text-sm text-gray-300">
                <span className="font-medium text-purple-400">강한 모멘텀:</span> 추세 추종 전략 적합. 
                트레일링 스톱 활용 권장
              </p>
            </div>
          )}
          
          {patternAnalysis.patterns.reversal > 3 && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1" />
              <p className="text-sm text-gray-300">
                <span className="font-medium text-yellow-400">잦은 반전:</span> 변동성 매매 전략 적합. 
                작은 포지션으로 빠른 진입/청산
              </p>
            </div>
          )}
          
          {patternAnalysis.patterns.breakout > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-1" />
              <p className="text-sm text-gray-300">
                <span className="font-medium text-red-400">돌파 신호:</span> 주요 레벨 돌파 시 
                거래량 확인 후 추세 추종
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}