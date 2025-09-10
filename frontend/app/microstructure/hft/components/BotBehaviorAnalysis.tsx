'use client'

import { useMemo } from 'react'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface HFTPattern {
  timestamp: number
  type: string
  confidence: number
  volume: number
  impact: string
}

interface TradeData {
  price: number
  quantity: number
  time: number
  isBuyerMaker: boolean
}

interface BotBehaviorAnalysisProps {
  patterns: HFTPattern[]
  trades: TradeData[]
  orderbook: any
}

export default function BotBehaviorAnalysis({ patterns, trades, orderbook }: BotBehaviorAnalysisProps) {
  // 봇 행동 지표 계산
  const botMetrics = useMemo(() => {
    const now = Date.now()
    const recentTrades = trades.filter(t => now - t.time < 60000) // 최근 1분
    
    // 거래 빈도
    const tradeFrequency = recentTrades.length
    
    // 평균 거래 크기
    const avgTradeSize = recentTrades.length > 0
      ? recentTrades.reduce((sum, t) => sum + t.quantity, 0) / recentTrades.length
      : 0
    
    // 포지션 홀딩 시간 추정
    const holdingTime = recentTrades.length > 1
      ? (recentTrades[0].time - recentTrades[recentTrades.length - 1].time) / recentTrades.length
      : 0
    
    // 양방향 거래 비율
    const buyCount = recentTrades.filter(t => !t.isBuyerMaker).length
    const sellCount = recentTrades.filter(t => t.isBuyerMaker).length
    const bidirectionalRatio = Math.min(buyCount, sellCount) / Math.max(buyCount, sellCount, 1)
    
    // 가격 영향도
    const priceImpact = recentTrades.length > 0
      ? (Math.max(...recentTrades.map(t => t.price)) - Math.min(...recentTrades.map(t => t.price))) / Math.min(...recentTrades.map(t => t.price)) * 100
      : 0
    
    return {
      frequency: Math.min(tradeFrequency, 100),
      avgSize: avgTradeSize,
      holdingTime: holdingTime / 1000, // 초 단위
      bidirectional: bidirectionalRatio * 100,
      priceImpact: priceImpact,
      botScore: (tradeFrequency > 30 ? 80 : tradeFrequency > 10 ? 50 : 20)
    }
  }, [trades])
  
  // 봇 유형별 특성 레이더 차트 데이터
  const radarData = useMemo(() => {
    const types = {
      market_making: { speed: 90, volume: 70, risk: 30, profit: 50, consistency: 85 },
      arbitrage: { speed: 80, volume: 90, risk: 20, profit: 60, consistency: 70 },
      momentum: { speed: 70, volume: 60, risk: 60, profit: 70, consistency: 50 },
      scalping: { speed: 95, volume: 40, risk: 50, profit: 40, consistency: 60 },
      spoofing: { speed: 60, volume: 80, risk: 90, profit: 80, consistency: 30 }
    }
    
    const dominantPattern = patterns[0]?.type || 'market_making'
    const data = types[dominantPattern as keyof typeof types] || types.market_making
    
    return [
      { metric: '속도', value: data.speed, fullMark: 100 },
      { metric: '거래량', value: data.volume, fullMark: 100 },
      { metric: '리스크', value: data.risk, fullMark: 100 },
      { metric: '수익성', value: data.profit, fullMark: 100 },
      { metric: '일관성', value: data.consistency, fullMark: 100 }
    ]
  }, [patterns])
  
  // 시간대별 봇 활동 추이
  const activityTrend = useMemo(() => {
    const slots = 12
    const now = Date.now()
    const slotDuration = 300000 // 5분
    
    return Array(slots).fill(0).map((_, i) => {
      const slotStart = now - (slots - i) * slotDuration
      const slotEnd = slotStart + slotDuration
      const slotTrades = trades.filter(t => t.time >= slotStart && t.time < slotEnd)
      const slotPatterns = patterns.filter(p => p.timestamp >= slotStart && p.timestamp < slotEnd)
      
      return {
        time: new Date(slotStart).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        trades: slotTrades.length,
        patterns: slotPatterns.length,
        volume: slotTrades.reduce((sum, t) => sum + t.quantity, 0)
      }
    })
  }, [trades, patterns])
  
  // 봇 타입 판별
  const identifiedBots = useMemo(() => {
    const bots = []
    
    // 마켓 메이킹 봇 탐지
    if (botMetrics.bidirectional > 70) {
      bots.push({
        type: '마켓 메이킹 봇',
        confidence: botMetrics.bidirectional,
        risk: 'LOW',
        description: '양방향 호가 제시로 스프레드 수익 창출'
      })
    }
    
    // 스캘핑 봇 탐지
    if (botMetrics.frequency > 50 && botMetrics.holdingTime < 30) {
      bots.push({
        type: '스캘핑 봇',
        confidence: Math.min(botMetrics.frequency, 100),
        risk: 'MEDIUM',
        description: '초단기 거래로 작은 수익 반복 실현'
      })
    }
    
    // 모멘텀 봇 탐지
    if (botMetrics.priceImpact > 0.5 && botMetrics.bidirectional < 30) {
      bots.push({
        type: '모멘텀 봇',
        confidence: Math.min(botMetrics.priceImpact * 20, 100),
        risk: 'MEDIUM',
        description: '추세 추종으로 방향성 수익 추구'
      })
    }
    
    // 차익거래 봇 탐지
    if (botMetrics.avgSize > trades.reduce((sum, t) => sum + t.quantity, 0) / trades.length * 2) {
      bots.push({
        type: '차익거래 봇',
        confidence: 70,
        risk: 'LOW',
        description: '거래소 간 가격 차이 활용'
      })
    }
    
    return bots
  }, [botMetrics, trades])
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'text-red-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'LOW': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6">🤖 봇 행동 분석</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 봇 특성 레이더 차트 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">봇 특성 프로파일</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" fontSize={12} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" fontSize={10} />
              <Radar name="특성" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* 시간대별 활동 추이 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">활동 추이</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
              <YAxis stroke="#9CA3AF" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#D1D5DB' }}
              />
              <Line type="monotone" dataKey="trades" stroke="#3B82F6" name="거래" strokeWidth={2} />
              <Line type="monotone" dataKey="patterns" stroke="#F59E0B" name="패턴" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 봇 행동 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">거래 빈도</p>
          <p className="text-lg font-bold text-white">{botMetrics.frequency}</p>
          <p className="text-xs text-gray-500">건/분</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">평균 크기</p>
          <p className="text-lg font-bold text-white">{botMetrics.avgSize.toFixed(3)}</p>
          <p className="text-xs text-gray-500">단위</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">홀딩 시간</p>
          <p className="text-lg font-bold text-white">{botMetrics.holdingTime.toFixed(1)}</p>
          <p className="text-xs text-gray-500">초</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">양방향성</p>
          <p className="text-lg font-bold text-white">{botMetrics.bidirectional.toFixed(0)}%</p>
          <p className="text-xs text-gray-500">비율</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">가격 영향</p>
          <p className="text-lg font-bold text-white">{botMetrics.priceImpact.toFixed(3)}%</p>
          <p className="text-xs text-gray-500">변동</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">봇 점수</p>
          <p className={`text-lg font-bold ${botMetrics.botScore > 60 ? 'text-red-400' : botMetrics.botScore > 30 ? 'text-yellow-400' : 'text-green-400'}`}>
            {botMetrics.botScore}
          </p>
          <p className="text-xs text-gray-500">/100</p>
        </div>
      </div>
      
      {/* 식별된 봇 유형 */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">🎯 식별된 봇 유형</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {identifiedBots.map((bot, i) => (
            <div key={i} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold">{bot.type}</h4>
                <span className={`text-xs font-medium px-2 py-1 rounded ${getRiskColor(bot.risk)}`}>
                  {bot.risk} RISK
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-3">{bot.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">신뢰도</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${bot.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-purple-400">{bot.confidence.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 주의사항 */}
      <div className="mt-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
        <p className="text-yellow-400 text-sm">
          ⚠️ HFT 봇 활동이 감지되었습니다. 슬리피지를 최소화하려면 지정가 주문을 사용하고, 
          대량 주문은 작게 나누어 실행하세요.
        </p>
      </div>
    </div>
  )
}