'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaChartLine, FaShieldAlt, FaRocket, FaExclamationTriangle } from 'react-icons/fa'

interface TradingStrategyProps {
  symbol: string
  stats: any
  currentPrice: number
  priceChange: number
  activeTab: string
}

export default function TradingStrategy({ 
  symbol, 
  stats, 
  currentPrice, 
  priceChange,
  activeTab 
}: TradingStrategyProps) {
  const [strategy, setStrategy] = useState({
    position: 'neutral' as 'long' | 'short' | 'neutral',
    confidence: 0,
    entry: 0,
    stopLoss: 0,
    targets: [] as number[],
    risk: 'medium' as 'low' | 'medium' | 'high',
    action: '관망',
    reason: ''
  })

  // 탭별 전략 분석
  useEffect(() => {
    analyzeStrategy()
  }, [symbol, stats, currentPrice, priceChange, activeTab])

  const analyzeStrategy = () => {
    let newStrategy = { ...strategy }
    
    // 디버깅 로그
    console.log(`🎯 ${symbol} 트레이딩 전략 분석:`, {
      symbol,
      currentPrice,
      priceChange,
      stats: {
        buyCount: stats?.buyCount || 0,
        sellCount: stats?.sellCount || 0,
        netFlow: stats?.netFlow || 0,
        totalWhales: stats?.totalWhales || 0
      },
      activeTab
    })
    
    // stats가 없거나 초기값인 경우 기본 전략 설정
    if (!stats || (!stats.buyCount && !stats.sellCount && !stats.netFlow)) {
      // 가격 변화 기반 간단한 전략
      if (priceChange > 2) {
        newStrategy.position = 'long'
        newStrategy.confidence = Math.min(70, 50 + priceChange * 5)
        newStrategy.action = '상승 추세'
        newStrategy.reason = '가격 상승세, 추세 추종 매수 고려'
      } else if (priceChange < -2) {
        newStrategy.position = 'short'
        newStrategy.confidence = Math.min(70, 50 + Math.abs(priceChange) * 5)
        newStrategy.action = '하락 추세'
        newStrategy.reason = '가격 하락세, 리스크 관리 필요'
      } else {
        newStrategy.position = 'neutral'
        newStrategy.confidence = 35
        newStrategy.action = '관망'
        newStrategy.reason = '거래 데이터 수집 중, 추세 확인 대기'
      }
      
      // 간단한 목표가 설정
      if (currentPrice > 0) {
        newStrategy.entry = currentPrice
        newStrategy.stopLoss = currentPrice * 0.97
        newStrategy.targets = [
          currentPrice * 1.02,
          currentPrice * 1.05,
          currentPrice * 1.08
        ]
        newStrategy.risk = Math.abs(priceChange) > 5 ? 'high' : Math.abs(priceChange) > 2 ? 'medium' : 'low'
      }
      
      setStrategy(newStrategy)
      return
    }

    // 탭별 특화 전략
    switch(activeTab) {
      case 'overview':
        // 종합 분석 기반 전략
        if (stats.netFlow > 0 && stats.buyCount > stats.sellCount * 1.5) {
          newStrategy.position = 'long'
          newStrategy.confidence = Math.min(85, 50 + (stats.buyCount - stats.sellCount))
          newStrategy.action = '매수 신호'
          newStrategy.reason = '고래 순매수 우세, 상승 모멘텀 형성'
        } else if (stats.netFlow < 0 && stats.sellCount > stats.buyCount * 1.5) {
          newStrategy.position = 'short'
          newStrategy.confidence = Math.min(85, 50 + (stats.sellCount - stats.buyCount))
          newStrategy.action = '매도 신호'
          newStrategy.reason = '고래 순매도 우세, 하락 압력 증가'
        } else {
          newStrategy.position = 'neutral'
          newStrategy.confidence = 45
          newStrategy.action = '관망'
          newStrategy.reason = '방향성 불명확, 추가 신호 대기'
        }
        break

      case 'realtime':
        // 실시간 거래 기반 전략
        const recentBuyRatio = stats.buyCount / Math.max(1, stats.buyCount + stats.sellCount)
        if (recentBuyRatio > 0.7) {
          newStrategy.position = 'long'
          newStrategy.confidence = Math.floor(recentBuyRatio * 100)
          newStrategy.action = '즉시 매수'
          newStrategy.reason = '실시간 매수세 압도적'
        } else if (recentBuyRatio < 0.3) {
          newStrategy.position = 'short'
          newStrategy.confidence = Math.floor((1 - recentBuyRatio) * 100)
          newStrategy.action = '즉시 매도'
          newStrategy.reason = '실시간 매도세 압도적'
        }
        break

      case 'analysis':
        // 종합분석 기반 전략
        const buyStrength = stats.buyCount || 0
        const sellStrength = stats.sellCount || 0
        const whaleCount = stats.totalWhales || 0
        
        if (whaleCount > 5 && buyStrength > sellStrength && priceChange > 0) {
          newStrategy.position = 'long'
          newStrategy.confidence = Math.min(85, 60 + whaleCount * 2)
          newStrategy.action = '단계적 매수'
          newStrategy.reason = `고래 ${whaleCount}건 + 매수우세 + 가격상승 동조`
        } else if (whaleCount > 5 && sellStrength > buyStrength && priceChange < 0) {
          newStrategy.position = 'short'
          newStrategy.confidence = Math.min(80, 55 + whaleCount * 2)
          newStrategy.action = '손절 고려'
          newStrategy.reason = `고래 ${whaleCount}건 + 매도우세 + 가격하락 압력`
        } else {
          newStrategy.position = 'neutral'
          newStrategy.confidence = Math.min(50, 30 + whaleCount * 2)
          newStrategy.action = '종합분석 중'
          newStrategy.reason = `고래 활동 ${whaleCount}건, 추세 관찰 필요`
        }
        break

      case 'history':
        // 과거 데이터 기반 전략
        const historicalWhales = stats.totalWhales || 0
        const historicalBuyRatio = stats.buyCount / Math.max(1, stats.buyCount + stats.sellCount)
        
        if (historicalWhales > 20) {
          newStrategy.position = 'long'
          newStrategy.confidence = Math.min(80, 50 + historicalWhales)
          newStrategy.action = '중장기 보유'
          newStrategy.reason = `누적 고래 ${historicalWhales}건, 장기 상승 신호`
        } else if (historicalWhales > 10) {
          if (historicalBuyRatio > 0.6) {
            newStrategy.position = 'long'
            newStrategy.confidence = Math.min(70, 40 + historicalWhales * 2)
            newStrategy.action = '단계적 매수'
            newStrategy.reason = `고래 ${historicalWhales}건, 매수 ${(historicalBuyRatio * 100).toFixed(0)}% 우세`
          } else if (historicalBuyRatio < 0.4) {
            newStrategy.position = 'short'
            newStrategy.confidence = Math.min(65, 40 + historicalWhales * 2)
            newStrategy.action = '리스크 관리'
            newStrategy.reason = `고래 ${historicalWhales}건, 매도 ${((1 - historicalBuyRatio) * 100).toFixed(0)}% 우세`
          } else {
            newStrategy.position = 'neutral'
            newStrategy.confidence = 50
            newStrategy.action = '균형 상태'
            newStrategy.reason = `고래 ${historicalWhales}건, 매수/매도 균형`
          }
        } else {
          newStrategy.position = 'neutral'
          newStrategy.confidence = Math.max(30, historicalWhales * 3)
          newStrategy.action = '데이터 축적 중'
          newStrategy.reason = `고래 활동 ${historicalWhales}건, 추가 데이터 필요`
        }
        break

      case 'wallets':
        // 지갑 분석 기반 전략
        const buyWalletStrength = stats.buyCount * (stats.buyVolume || 0)
        const sellWalletStrength = stats.sellCount * (stats.sellVolume || 0)
        
        if (buyWalletStrength > sellWalletStrength * 1.5 && stats.totalWhales > 10) {
          newStrategy.position = 'long'
          newStrategy.confidence = Math.min(80, 50 + stats.totalWhales)
          newStrategy.action = '고래 매집 진행'
          newStrategy.reason = '대형 지갑들의 매수 집중, 상승 준비 신호'
        } else if (sellWalletStrength > buyWalletStrength * 1.5) {
          newStrategy.position = 'short'
          newStrategy.confidence = Math.min(75, 50 + (stats.sellCount - stats.buyCount) * 2)
          newStrategy.action = '고래 이탈 경고'
          newStrategy.reason = '대형 지갑 매도 증가, 하락 가능성'
        } else {
          newStrategy.position = 'neutral'
          newStrategy.confidence = 40
          newStrategy.action = '지갑 동향 관찰'
          newStrategy.reason = '고래 지갑 활동 미미, 방향성 불분명'
        }
        break

      case 'flows':
        // 자금 흐름 기반 전략
        const flowStrength = Math.abs(stats.netFlow || 0)
        const flowDirection = stats.netFlow > 0 ? 'in' : 'out'
        
        if (flowDirection === 'in' && flowStrength > 1000000) {
          newStrategy.position = 'long'
          newStrategy.confidence = Math.min(85, 60 + (flowStrength / 100000))
          newStrategy.action = '대규모 유입 감지'
          newStrategy.reason = `$${(flowStrength / 1000000).toFixed(1)}M 순유입, 강한 매수 압력`
        } else if (flowDirection === 'out' && flowStrength > 1000000) {
          newStrategy.position = 'short'
          newStrategy.confidence = Math.min(80, 55 + (flowStrength / 100000))
          newStrategy.action = '대규모 유출 경고'
          newStrategy.reason = `$${(flowStrength / 1000000).toFixed(1)}M 순유출, 매도 압력 증가`
        } else {
          newStrategy.position = 'neutral'
          newStrategy.confidence = 35
          newStrategy.action = '자금 흐름 약세'
          newStrategy.reason = '뚜렷한 자금 이동 없음, 관망 필요'
        }
        break

      case 'patterns':
        // 패턴 분석 기반 전략 (기술적 지표 + 고래 활동)
        const technicalScore = (stats.buyCount - stats.sellCount) / Math.max(1, stats.totalWhales) * 100
        const volumeStrength = stats.totalVolume / 1000000 // $M 단위
        
        if (technicalScore > 30 && volumeStrength > 5 && priceChange > 1) {
          newStrategy.position = 'long'
          newStrategy.confidence = Math.min(82, 60 + technicalScore / 2)
          newStrategy.action = '돌파 패턴 형성'
          newStrategy.reason = '고래 매수 패턴 + 기술적 돌파 신호'
        } else if (technicalScore < -30 && volumeStrength > 5 && priceChange < -1) {
          newStrategy.position = 'short'
          newStrategy.confidence = Math.min(78, 60 + Math.abs(technicalScore) / 2)
          newStrategy.action = '하락 패턴 경고'
          newStrategy.reason = '고래 매도 패턴 + 기술적 약세'
        } else {
          newStrategy.position = 'neutral'
          newStrategy.confidence = 45
          newStrategy.action = '패턴 형성 중'
          newStrategy.reason = '명확한 패턴 미형성, 추가 확인 필요'
        }
        break

      case 'backtest':
        // 백테스트 기반 전략
        newStrategy.position = 'neutral'
        newStrategy.confidence = 50
        newStrategy.action = '백테스트 필요'
        newStrategy.reason = '과거 데이터 검증 후 진입'
        break

      default:
        // 기본 전략 (알려지지 않은 탭)
        newStrategy.position = 'neutral'
        newStrategy.confidence = 40
        newStrategy.action = '분석 중'
        newStrategy.reason = '데이터 수집 및 분석 진행 중'
        break
    }

    // 진입가 및 목표가 계산
    if (newStrategy.position === 'long') {
      newStrategy.entry = currentPrice * 1.002 // 0.2% 위
      newStrategy.stopLoss = currentPrice * 0.97 // 3% 손절
      newStrategy.targets = [
        currentPrice * 1.02,  // 1차 목표 2%
        currentPrice * 1.05,  // 2차 목표 5%
        currentPrice * 1.10   // 3차 목표 10%
      ]
      newStrategy.risk = stats.volatility > 50 ? 'high' : stats.volatility > 30 ? 'medium' : 'low'
    } else if (newStrategy.position === 'short') {
      newStrategy.entry = currentPrice * 0.998 // 0.2% 아래
      newStrategy.stopLoss = currentPrice * 1.03 // 3% 손절
      newStrategy.targets = [
        currentPrice * 0.98,  // 1차 목표 -2%
        currentPrice * 0.95,  // 2차 목표 -5%
        currentPrice * 0.90   // 3차 목표 -10%
      ]
      newStrategy.risk = stats.volatility > 50 ? 'high' : stats.volatility > 30 ? 'medium' : 'low'
    }

    setStrategy(newStrategy)
  }

  const getRiskColor = () => {
    switch(strategy.risk) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getPositionColor = () => {
    switch(strategy.position) {
      case 'long': return 'from-green-600 to-green-800'
      case 'short': return 'from-red-600 to-red-800'
      default: return 'from-gray-600 to-gray-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FaRocket className="text-yellow-400" />
          트레이딩 전략 동적분석 - {symbol.replace('USDT', '')}
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400">
            고래: {stats?.totalWhales || 0}건
          </div>
          <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getPositionColor()} text-white font-bold`}>
            {strategy.action}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 신호 강도 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">신호 강도</span>
            <span className="text-white font-bold">{strategy.confidence}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                strategy.position === 'long' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                strategy.position === 'short' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                'bg-gradient-to-r from-gray-400 to-gray-600'
              }`}
              style={{ width: `${strategy.confidence}%` }}
            />
          </div>
        </div>

        {/* 리스크 레벨 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">리스크 레벨</span>
            <span className={`font-bold ${getRiskColor()}`}>
              {strategy.risk === 'low' ? '낮음' : strategy.risk === 'medium' ? '중간' : '높음'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaShieldAlt className={getRiskColor()} />
            <div className="flex gap-1">
              {['low', 'medium', 'high'].map((level) => (
                <div
                  key={level}
                  className={`h-2 w-8 rounded ${
                    (level === 'low' && ['low', 'medium', 'high'].includes(strategy.risk)) ||
                    (level === 'medium' && ['medium', 'high'].includes(strategy.risk)) ||
                    (level === 'high' && strategy.risk === 'high')
                      ? level === 'low' ? 'bg-green-400' : level === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 진입 전략 */}
        {strategy.position !== 'neutral' && (
          <>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">진입 전략</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">진입가</span>
                  <span className="text-white font-mono">${strategy.entry.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">손절가</span>
                  <span className="text-red-400 font-mono">${strategy.stopLoss.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 목표가 */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">목표가</h4>
              <div className="space-y-2">
                {strategy.targets.map((target, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-500">{idx + 1}차 목표</span>
                    <span className="text-green-400 font-mono">${target.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 분석 근거 */}
      <div className="mt-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
        <div className="flex items-start gap-2">
          <FaExclamationTriangle className="text-yellow-400 mt-1" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white mb-1">분석 근거</p>
            <p className="text-xs text-gray-400">{strategy.reason}</p>
            <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-gray-500">매수:</span>
                <span className="text-green-400 ml-1">{stats?.buyCount || 0}</span>
              </div>
              <div>
                <span className="text-gray-500">매도:</span>
                <span className="text-red-400 ml-1">{stats?.sellCount || 0}</span>
              </div>
              <div>
                <span className="text-gray-500">순유입:</span>
                <span className={`ml-1 ${(stats?.netFlow || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(stats?.netFlow || 0) > 1000000 ? 
                    `${(Math.abs(stats?.netFlow || 0) / 1000000).toFixed(1)}M` : 
                    (Math.abs(stats?.netFlow || 0) / 1000).toFixed(0) + 'K'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">가격:</span>
                <span className={`ml-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 실시간 업데이트 표시 */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-500">실시간 AI 분석 기반</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-gray-400">자동 업데이트 중</span>
        </div>
      </div>
    </motion.div>
  )
}