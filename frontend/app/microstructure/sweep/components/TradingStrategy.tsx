'use client'

import React, { useMemo } from 'react'

interface SweepData {
  timestamp: number
  price: number
  volume: number
  type: 'aggressive' | 'stealth' | 'ladder' | 'iceberg'
  impact: number
  side: 'buy' | 'sell'
}

interface OrderBookData {
  bids: Array<[number, number]>
  asks: Array<[number, number]>
  lastUpdateId: number
}

interface TradingStrategyProps {
  sweeps: SweepData[]
  currentPrice: number
  symbol: string
}

export default function TradingStrategy({ sweeps, currentPrice, symbol }: TradingStrategyProps) {
  // 코인별 전략 설정
  const getStrategySettings = (symbol: string) => {
    const settings: Record<string, { stopLossRatio: number, takeProfitRatio: number, minConfidence: number }> = {
      'BTCUSDT': { stopLossRatio: 0.02, takeProfitRatio: 0.04, minConfidence: 60 },
      'ETHUSDT': { stopLossRatio: 0.025, takeProfitRatio: 0.05, minConfidence: 55 },
      'BNBUSDT': { stopLossRatio: 0.03, takeProfitRatio: 0.06, minConfidence: 50 },
      'SOLUSDT': { stopLossRatio: 0.04, takeProfitRatio: 0.08, minConfidence: 50 },
      'XRPUSDT': { stopLossRatio: 0.05, takeProfitRatio: 0.1, minConfidence: 45 },
      'DOGEUSDT': { stopLossRatio: 0.06, takeProfitRatio: 0.12, minConfidence: 45 }
    }
    return settings[symbol] || { stopLossRatio: 0.03, takeProfitRatio: 0.06, minConfidence: 50 }
  }

  const settings = getStrategySettings(symbol)

  // 전략 분석
  const strategyAnalysis = useMemo(() => {
    if (sweeps.length === 0) {
      return {
        signal: 'neutral',
        confidence: 0,
        direction: 'hold',
        entry: currentPrice,
        stopLoss: currentPrice * (1 - settings.stopLossRatio),
        takeProfit: currentPrice * (1 + settings.takeProfitRatio),
        riskReward: settings.takeProfitRatio / settings.stopLossRatio,
        position: 'wait'
      }
    }
    
    // 최근 스윕 분석
    const recentSweeps = sweeps.slice(-10)
    const buySweeps = recentSweeps.filter(s => s.side === 'buy')
    const sellSweeps = recentSweeps.filter(s => s.side === 'sell')
    
    // 방향성 계산
    const buyVolume = buySweeps.reduce((sum, s) => sum + s.volume, 0)
    const sellVolume = sellSweeps.reduce((sum, s) => sum + s.volume, 0)
    const netVolume = buyVolume - sellVolume
    const totalVolume = buyVolume + sellVolume
    
    // 신뢰도 계산
    const volumeImbalance = Math.abs(netVolume) / (totalVolume || 1)
    const avgImpact = recentSweeps.reduce((sum, s) => sum + s.impact, 0) / recentSweeps.length
    const confidence = Math.min((volumeImbalance * 50 + avgImpact * 10), 100)
    
    // 전략 결정
    let signal: 'bullish' | 'bearish' | 'neutral'
    let direction: 'long' | 'short' | 'hold'
    let position: 'aggressive' | 'moderate' | 'conservative' | 'wait'
    
    if (netVolume > totalVolume * 0.3) {
      signal = 'bullish'
      direction = 'long'
      position = confidence > 70 ? 'aggressive' : confidence > settings.minConfidence ? 'moderate' : 'conservative'
    } else if (netVolume < -totalVolume * 0.3) {
      signal = 'bearish'
      direction = 'short'
      position = confidence > 70 ? 'aggressive' : confidence > settings.minConfidence ? 'moderate' : 'conservative'
    } else {
      signal = 'neutral'
      direction = 'hold'
      position = 'wait'
    }
    
    // 진입/청산 가격 계산
    const volatility = avgImpact / 100
    const entry = direction === 'long' ? currentPrice * (1 + volatility * 0.1) :
                  direction === 'short' ? currentPrice * (1 - volatility * 0.1) :
                  currentPrice
    
    const stopLoss = direction === 'long' ? entry * (1 - Math.max(settings.stopLossRatio, volatility * 2)) :
                     direction === 'short' ? entry * (1 + Math.max(settings.stopLossRatio, volatility * 2)) :
                     currentPrice * (1 - settings.stopLossRatio)
    
    const takeProfit = direction === 'long' ? entry * (1 + Math.max(settings.takeProfitRatio, volatility * 4)) :
                       direction === 'short' ? entry * (1 - Math.max(settings.takeProfitRatio, volatility * 4)) :
                       currentPrice * (1 + settings.takeProfitRatio)
    
    const riskReward = Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss)
    
    return {
      signal,
      confidence,
      direction,
      entry,
      stopLoss,
      takeProfit,
      riskReward,
      position,
      buyVolume,
      sellVolume,
      netVolume,
      avgImpact,
      volumeImbalance
    }
  }, [sweeps, currentPrice, settings])

  // 포지션 크기 계산
  const positionSizing = useMemo(() => {
    const baseSize = {
      aggressive: 0.1,    // 자본의 10%
      moderate: 0.05,     // 자본의 5%
      conservative: 0.02, // 자본의 2%
      wait: 0             // 0%
    }
    
    const leverage = {
      aggressive: 5,
      moderate: 3,
      conservative: 1,
      wait: 1
    }
    
    return {
      size: baseSize[strategyAnalysis.position],
      leverage: leverage[strategyAnalysis.position],
      effectiveSize: baseSize[strategyAnalysis.position] * leverage[strategyAnalysis.position]
    }
  }, [strategyAnalysis])

  // 시그널 색상
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish': return 'text-green-400'
      case 'bearish': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* 종합 전략 신호 */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>🎯</span>
            <span>스윕 기반 트레이딩 전략 - {symbol.replace('USDT', '')}</span>
            <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
              strategyAnalysis.signal === 'bullish' ? 'bg-green-500/20 text-green-400' :
              strategyAnalysis.signal === 'bearish' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {strategyAnalysis.signal === 'bullish' ? '상승 신호' :
               strategyAnalysis.signal === 'bearish' ? '하락 신호' : '중립'}
            </span>
          </h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 신뢰도 게이지 */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">신호 신뢰도</h4>
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-2xl font-bold">{strategyAnalysis.confidence.toFixed(0)}%</span>
                    <span className={`text-sm font-medium ${
                      strategyAnalysis.confidence > 70 ? 'text-green-400' :
                      strategyAnalysis.confidence > 40 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {strategyAnalysis.confidence > 70 ? '높은 신뢰도' :
                       strategyAnalysis.confidence > 40 ? '중간 신뢰도' : '낮은 신뢰도'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        strategyAnalysis.confidence > 70 ? 'bg-green-500' :
                        strategyAnalysis.confidence > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${strategyAnalysis.confidence}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">볼륨 불균형</span>
                    <span className="text-white">{(strategyAnalysis.volumeImbalance * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">평균 영향도</span>
                    <span className="text-white">{strategyAnalysis.avgImpact.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 전략 상세 */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">전략 권장사항</h4>
              <div className="space-y-3">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">방향</span>
                    <span className={`font-medium ${
                      strategyAnalysis.direction === 'long' ? 'text-green-400' :
                      strategyAnalysis.direction === 'short' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      {strategyAnalysis.direction === 'long' ? '매수 (Long)' :
                       strategyAnalysis.direction === 'short' ? '매도 (Short)' : '대기'}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">포지션 강도</span>
                    <span className={`font-medium capitalize ${
                      strategyAnalysis.position === 'aggressive' ? 'text-red-400' :
                      strategyAnalysis.position === 'moderate' ? 'text-yellow-400' :
                      strategyAnalysis.position === 'conservative' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {strategyAnalysis.position === 'aggressive' ? '공격적' :
                       strategyAnalysis.position === 'moderate' ? '보통' :
                       strategyAnalysis.position === 'conservative' ? '보수적' : '대기'}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">위험/보상 비율</span>
                    <span className={`font-medium ${
                      strategyAnalysis.riskReward > 2 ? 'text-green-400' :
                      strategyAnalysis.riskReward > 1 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      1:{strategyAnalysis.riskReward.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 가격 레벨 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-4 rounded-lg border border-blue-800/30">
              <p className="text-blue-400 text-sm mb-1">진입가</p>
              <p className="text-white text-xl font-bold">${strategyAnalysis.entry.toFixed(2)}</p>
              <p className="text-gray-500 text-xs mt-1">
                현재가 대비 {((strategyAnalysis.entry - currentPrice) / currentPrice * 100).toFixed(2)}%
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 p-4 rounded-lg border border-red-800/30">
              <p className="text-red-400 text-sm mb-1">손절가</p>
              <p className="text-white text-xl font-bold">${strategyAnalysis.stopLoss.toFixed(2)}</p>
              <p className="text-gray-500 text-xs mt-1">
                리스크: {Math.abs((strategyAnalysis.stopLoss - strategyAnalysis.entry) / strategyAnalysis.entry * 100).toFixed(2)}%
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 p-4 rounded-lg border border-green-800/30">
              <p className="text-green-400 text-sm mb-1">목표가</p>
              <p className="text-white text-xl font-bold">${strategyAnalysis.takeProfit.toFixed(2)}</p>
              <p className="text-gray-500 text-xs mt-1">
                수익: {Math.abs((strategyAnalysis.takeProfit - strategyAnalysis.entry) / strategyAnalysis.entry * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 포지션 크기 계산기 */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">💰 포지션 크기 계산</h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">기본 크기</p>
              <p className="text-white text-xl font-bold">{(positionSizing.size * 100).toFixed(0)}%</p>
              <p className="text-gray-500 text-xs mt-1">총 자본 대비</p>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">권장 레버리지</p>
              <p className="text-purple-400 text-xl font-bold">{positionSizing.leverage}x</p>
              <p className="text-gray-500 text-xs mt-1">최대 레버리지</p>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">실효 크기</p>
              <p className="text-yellow-400 text-xl font-bold">{(positionSizing.effectiveSize * 100).toFixed(0)}%</p>
              <p className="text-gray-500 text-xs mt-1">레버리지 포함</p>
            </div>
          </div>
          
          {/* 자본금별 계산 */}
          <div className="mt-4 bg-gray-800/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-3">자본금별 포지션 크기</p>
            <div className="space-y-2">
              {[10000, 50000, 100000].map(capital => (
                <div key={capital} className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">${capital.toLocaleString()} 자본금</span>
                  <span className="text-white font-medium">
                    ${(capital * positionSizing.size).toLocaleString()} 
                    <span className="text-gray-500 ml-2">
                      ({positionSizing.leverage}x = ${(capital * positionSizing.effectiveSize).toLocaleString()})
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 실시간 전략 업데이트 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-4">
        <h4 className="text-sm font-medium text-white mb-3">📡 실시간 전략 업데이트</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className={getSignalColor(strategyAnalysis.signal)}>●</span>
            <p className="text-gray-300">
              현재 <span className={getSignalColor(strategyAnalysis.signal)}>
                {strategyAnalysis.signal === 'bullish' ? '매수' :
                 strategyAnalysis.signal === 'bearish' ? '매도' : '중립'}
              </span> 신호 발생 중 (신뢰도: {strategyAnalysis.confidence.toFixed(0)}%)
            </p>
          </div>
          
          {strategyAnalysis.volumeImbalance > 0.5 && (
            <div className="flex items-start gap-2">
              <span className="text-yellow-400">⚡</span>
              <p className="text-gray-300">
                강한 볼륨 임밸런스 감지 ({(strategyAnalysis.volumeImbalance * 100).toFixed(0)}%)
              </p>
            </div>
          )}
          
          {strategyAnalysis.avgImpact > 3 && (
            <div className="flex items-start gap-2">
              <span className="text-red-400">🚨</span>
              <p className="text-gray-300">
                높은 가격 임팩트 주의 (평균: {strategyAnalysis.avgImpact.toFixed(2)}%)
              </p>
            </div>
          )}
          
          <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-700">
            <span className="text-blue-400">💡</span>
            <p className="text-gray-300">
              <span className="font-medium">권장 행동:</span> {
                strategyAnalysis.position === 'wait' ? '추가 신호를 기다리세요' :
                strategyAnalysis.position === 'aggressive' ? '적극적으로 포지션 진입을 고려하세요' :
                strategyAnalysis.position === 'moderate' ? '적정 규모로 진입을 고려하세요' :
                '보수적으로 접근하거나 관망하세요'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}