'use client'

import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react'

interface ATRDynamicAnalysisProps {
  atr: number
  currentPrice: number
  historicalATR?: number[]
  volume24h?: number
}

export default function ATRDynamicAnalysis({ 
  atr, 
  currentPrice, 
  historicalATR = [],
  volume24h = 0
}: ATRDynamicAnalysisProps) {
  
  const analysis = useMemo(() => {
    // currentPrice 기본값 설정
    const price = currentPrice || 0;
    const atrValue = atr || 0;
    
    // ATR 기반 변동성 수준 판단
    const getVolatilityLevel = () => {
      const atrPercent = price > 0 ? (atrValue / price) * 100 : 0
      
      if (atrPercent >= 5) return { 
        label: '극도로 높은 변동성', 
        color: 'text-red-500', 
        score: 5,
        description: '매우 위험한 시장'
      }
      if (atrPercent >= 3) return { 
        label: '높은 변동성', 
        color: 'text-orange-400', 
        score: 4,
        description: '리스크 관리 필수'
      }
      if (atrPercent >= 2) return { 
        label: '보통 변동성', 
        color: 'text-yellow-400', 
        score: 3,
        description: '정상적인 시장'
      }
      if (atrPercent >= 1) return { 
        label: '낮은 변동성', 
        color: 'text-blue-400', 
        score: 2,
        description: '안정적인 시장'
      }
      return { 
        label: '매우 낮은 변동성', 
        color: 'text-gray-400', 
        score: 1,
        description: '조용한 시장'
      }
    }
    
    // ATR 추세 분석 (최근 변화)
    const getATRTrend = () => {
      if (historicalATR.length < 5) return { trend: '데이터 부족', change: 0 }
      
      const recent = historicalATR.slice(-5)
      const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length
      const change = ((atrValue - avgRecent) / avgRecent) * 100
      
      if (change > 20) return { trend: '급증', change, color: 'text-red-400' }
      if (change > 10) return { trend: '상승', change, color: 'text-orange-400' }
      if (change > -10) return { trend: '유지', change, color: 'text-yellow-400' }
      if (change > -20) return { trend: '하락', change, color: 'text-blue-400' }
      return { trend: '급락', change, color: 'text-green-400' }
    }
    
    // 포지션 크기 계산 (리스크 2% 기준)
    const calculatePositionSize = (accountBalance: number = 10000) => {
      const riskAmount = accountBalance * 0.02 // 2% 리스크
      const stopDistance = atrValue * 1.5 // 1.5 ATR을 손절 거리로
      const positionSize = stopDistance > 0 ? riskAmount / stopDistance : 0
      
      return {
        positionSize: positionSize.toFixed(2),
        stopLoss: (price - stopDistance).toFixed(2),
        takeProfit: (price + (stopDistance * 2)).toFixed(2),
        riskReward: '1:2'
      }
    }
    
    // 트레이딩 권장사항 생성
    const getTradingRecommendation = () => {
      const volatility = getVolatilityLevel()
      const trend = getATRTrend()
      const position = calculatePositionSize()
      
      if (volatility.score >= 4) {
        return {
          action: '포지션 축소 또는 관망',
          reason: `${volatility.label} - 리스크 매우 높음`,
          stopLoss: `넓은 손절: ${(atrValue * 2).toFixed(2)} USDT`,
          positionSize: '평소의 50% 이하',
          confidence: 30
        }
      }
      
      if (volatility.score === 3) {
        return {
          action: '정상 트레이딩',
          reason: `${volatility.label} - 적절한 기회`,
          stopLoss: `표준 손절: ${(atrValue * 1.5).toFixed(2)} USDT`,
          positionSize: position.positionSize,
          confidence: 60
        }
      }
      
      if (volatility.score <= 2) {
        if (trend.trend === '상승' || trend.trend === '급증') {
          return {
            action: '브레이크아웃 대기',
            reason: '변동성 확대 가능성',
            stopLoss: `타이트 손절: ${atrValue.toFixed(2)} USDT`,
            positionSize: '평소의 120%',
            confidence: 70
          }
        }
        return {
          action: '박스권 매매',
          reason: `${volatility.label} - 레인지 전략`,
          stopLoss: `타이트 손절: ${atrValue.toFixed(2)} USDT`,
          positionSize: position.positionSize,
          confidence: 50
        }
      }
      
      return {
        action: '관망',
        reason: '명확한 신호 없음',
        stopLoss: `${atrValue.toFixed(2)} USDT`,
        positionSize: '0',
        confidence: 0
      }
    }
    
    const volatility = getVolatilityLevel()
    const trend = getATRTrend()
    const position = calculatePositionSize()
    const recommendation = getTradingRecommendation()
    
    return {
      volatility,
      trend,
      position,
      recommendation,
      atrPercent: price > 0 ? (atrValue / price) * 100 : 0
    }
  }, [atr, currentPrice, historicalATR])
  
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📊 ATR 실시간 분석
          <Activity className="w-4 h-4 text-purple-400" />
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">변동성</div>
            <div className={`text-lg font-bold ${analysis.volatility.color}`}>
              {analysis.atrPercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* 현재 ATR 값 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">ATR 값</div>
            <div className="text-sm font-bold text-white">
              {atr.toFixed(2)} USDT
            </div>
            <div className={`text-xs ${analysis.volatility.color} mt-1`}>
              {analysis.volatility.label}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">변동률</div>
            <div className={`text-sm font-bold ${analysis.volatility.color}`}>
              {analysis.atrPercent.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {analysis.volatility.description}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">추세</div>
            <div className={`text-sm font-bold ${analysis.trend.color || 'text-white'}`}>
              {analysis.trend.trend}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {analysis.trend.change > 0 ? '+' : ''}{analysis.trend.change.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* 포지션 계산 */}
        <div className="bg-gray-800/30 rounded p-3">
          <div className="text-sm text-gray-400 mb-2">리스크 관리 (2% 룰)</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">손절가:</span>
              <span className="text-red-400 ml-2">{analysis.position.stopLoss} USDT</span>
            </div>
            <div>
              <span className="text-gray-500">목표가:</span>
              <span className="text-green-400 ml-2">{analysis.position.takeProfit} USDT</span>
            </div>
            <div>
              <span className="text-gray-500">포지션 크기:</span>
              <span className="text-yellow-400 ml-2">{analysis.position.positionSize}</span>
            </div>
            <div>
              <span className="text-gray-500">손익비:</span>
              <span className="text-blue-400 ml-2">{analysis.position.riskReward}</span>
            </div>
          </div>
        </div>

        {/* 트레이딩 권장사항 */}
        <div className={`bg-gradient-to-r ${
          analysis.recommendation.confidence > 60 ? 'from-green-900/30' :
          analysis.recommendation.confidence > 30 ? 'from-yellow-900/30' :
          'from-red-900/30'
        } to-transparent rounded p-3 border ${
          analysis.recommendation.confidence > 60 ? 'border-green-500/30' :
          analysis.recommendation.confidence > 30 ? 'border-yellow-500/30' :
          'border-red-500/30'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {analysis.recommendation.confidence > 60 ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                 analysis.recommendation.confidence > 30 ? <AlertTriangle className="w-4 h-4 text-yellow-400" /> :
                 <AlertTriangle className="w-4 h-4 text-red-400" />}
                {analysis.recommendation.action}
              </div>
              <div className="text-xs text-gray-300 mt-1">
                {analysis.recommendation.reason}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                손절 거리: {analysis.recommendation.stopLoss}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">신뢰도</div>
              <div className={`text-lg font-bold ${
                analysis.recommendation.confidence > 60 ? 'text-green-400' :
                analysis.recommendation.confidence > 30 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {analysis.recommendation.confidence}%
              </div>
            </div>
          </div>
        </div>

        {/* ATR 활용법 */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
          <div className="text-sm text-purple-400 mb-1">ATR 활용법</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• 손절가 설정: 진입가 ± (1.5 × ATR)</div>
            <div>• 목표가 설정: 진입가 ± (2-3 × ATR)</div>
            <div>• 포지션 크기: 리스크금액 ÷ ATR</div>
            <div>• 높은 ATR: 변동성 큼 → 포지션 축소</div>
            <div>• 낮은 ATR: 변동성 작음 → 브레이크아웃 대기</div>
            <div>• ATR 상승: 변동성 확대 → 주의 필요</div>
          </div>
        </div>

        {/* 변동성 경고 */}
        {analysis.volatility.score >= 4 && (
          <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-bold text-red-400">높은 변동성 경고</span>
            </div>
            <div className="text-xs text-gray-300 mt-1">
              현재 시장은 매우 불안정합니다. 포지션 크기를 줄이고 손절을 넓게 설정하세요.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}