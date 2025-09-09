'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts'

interface Coin {
  symbol: string
  name: string
  color: string
}

interface MarketData {
  price: number
  change24h: number
  zScore: number
  rsi: number
  sma20: number
  upperBand: number
  lowerBand: number
}

interface AIRecommendationProps {
  coin: Coin
  marketData: MarketData | null
}

export default function AIRecommendation({ coin, marketData }: AIRecommendationProps) {
  const [recommendation, setRecommendation] = useState<any>(null)
  const [confidence, setConfidence] = useState(0)
  const [animatedConfidence, setAnimatedConfidence] = useState(0)
  const [signals, setSignals] = useState<any[]>([])
  const [updateTime, setUpdateTime] = useState(new Date())
  const [thinking, setThinking] = useState(false)

  // 신뢰도 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedConfidence(prev => {
        const diff = confidence - prev
        if (Math.abs(diff) < 1) return confidence
        return prev + diff * 0.2
      })
    }, 50)
    return () => clearInterval(interval)
  }, [confidence])

  // 실시간 업데이트 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setUpdateTime(new Date())
      setThinking(true)
      setTimeout(() => setThinking(false), 500)
    }, 10000) // 10초마다 업데이트
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!marketData) return

    // AI 분석 시뮬레이션
    let action = ''
    let reasoning = []
    let conf = 50
    let strategy = ''
    let timeframe = ''
    let targetPrice = marketData.price
    let stopLoss = marketData.price

    // 종합 분석
    const oversold = marketData.zScore < -2 || marketData.rsi < 30
    const overbought = marketData.zScore > 2 || marketData.rsi > 70
    const nearLowerBand = marketData.price < marketData.lowerBand * 1.02
    const nearUpperBand = marketData.price > marketData.upperBand * 0.98
    const belowSMA = marketData.price < marketData.sma20
    const aboveSMA = marketData.price > marketData.sma20

    if (oversold && nearLowerBand) {
      action = 'STRONG_BUY'
      conf = 85
      reasoning = [
        '강한 과매도 상태 (Z-Score < -2)',
        '볼린저 하단 근처',
        'RSI 과매도 구간',
        '평균회귀 가능성 높음'
      ]
      strategy = '적극적 매수'
      timeframe = '1-3일'
      targetPrice = marketData.sma20
      stopLoss = marketData.price * 0.97
    } else if (oversold) {
      action = 'BUY'
      conf = 70
      reasoning = [
        '과매도 상태',
        '평균회귀 기회',
        '단기 반등 가능'
      ]
      strategy = '소량 매수'
      timeframe = '2-5일'
      targetPrice = marketData.sma20
      stopLoss = marketData.price * 0.97
    } else if (overbought && nearUpperBand) {
      action = 'STRONG_SELL'
      conf = 85
      reasoning = [
        '강한 과매수 상태 (Z-Score > 2)',
        '볼린저 상단 근처',
        'RSI 과매수 구간',
        '하락 조정 가능성 높음'
      ]
      strategy = '즉시 청산'
      timeframe = '즉시'
      targetPrice = marketData.sma20
      stopLoss = marketData.price * 1.03
    } else if (overbought) {
      action = 'SELL'
      conf = 70
      reasoning = [
        '과매수 상태',
        '평균회귀 가능',
        '단기 조정 예상'
      ]
      strategy = '일부 청산'
      timeframe = '1-2일'
      targetPrice = marketData.sma20
      stopLoss = marketData.price * 1.03
    } else {
      action = 'HOLD'
      conf = 60
      reasoning = [
        '중립 구간',
        '방향성 불확실',
        '추가 신호 대기'
      ]
      strategy = '관망'
      timeframe = '-'
      targetPrice = marketData.price
      stopLoss = marketData.price
    }

    // 시그널 강도 계산
    const signalStrengths = [
      { name: 'Z-Score', value: Math.min(100, Math.abs(marketData.zScore) * 33), color: '#8B5CF6' },
      { name: 'RSI', value: marketData.rsi > 70 || marketData.rsi < 30 ? 80 : 40, color: '#F59E0B' },
      { name: '볼린저', value: nearLowerBand || nearUpperBand ? 90 : 30, color: '#10B981' },
      { name: 'SMA', value: Math.abs((marketData.price - marketData.sma20) / marketData.sma20 * 100), color: '#3B82F6' }
    ]
    setSignals(signalStrengths)

    setRecommendation({
      action,
      reasoning,
      strategy,
      timeframe,
      targetPrice,
      stopLoss,
      expectedReturn: ((targetPrice - marketData.price) / marketData.price * 100),
      risk: ((marketData.price - stopLoss) / marketData.price * 100)
    })
    setConfidence(conf)
  }, [marketData, updateTime])

  if (!recommendation) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-gray-700 rounded"></div>
      </div>
    )
  }

  const actionColors = {
    STRONG_BUY: 'from-green-600 to-green-500',
    BUY: 'from-green-500 to-green-400',
    HOLD: 'from-yellow-500 to-yellow-400',
    SELL: 'from-red-400 to-red-500',
    STRONG_SELL: 'from-red-500 to-red-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <motion.span 
            className="text-2xl"
            animate={thinking ? { rotate: [0, 360] } : {}}
            transition={{ duration: 0.5 }}
          >
            🤖
          </motion.span>
          AI 종합 분석
          <AnimatePresence>
            {thinking && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-xs text-purple-400"
              >
                분석중...
              </motion.span>
            )}
          </AnimatePresence>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">신뢰도</span>
          <div className="w-24 bg-gray-700 rounded-full h-2">
            <motion.div 
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-400"
              initial={{ width: 0 }}
              animate={{ width: `${animatedConfidence}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <motion.span 
            className="text-purple-400 font-bold text-sm"
            key={confidence}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
          >
            {Math.round(animatedConfidence)}%
          </motion.span>
        </div>
      </div>

      {/* 시그널 강도 차트 */}
      <div className="bg-black/30 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">📡 시그널 강도 분석</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={signals} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" isAnimationActive={false} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 메인 추천 */}
      <motion.div 
        className={`bg-gradient-to-r ${actionColors[recommendation.action as keyof typeof actionColors]} rounded-xl p-5 mb-6`}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-white">
            <div className="text-2xl font-bold mb-1">
              {recommendation.action === 'STRONG_BUY' && '강력 매수'}
              {recommendation.action === 'BUY' && '매수'}
              {recommendation.action === 'HOLD' && '대기'}
              {recommendation.action === 'SELL' && '매도'}
              {recommendation.action === 'STRONG_SELL' && '강력 매도'}
            </div>
            <div className="text-sm opacity-90">{recommendation.strategy}</div>
          </div>
          <div className="text-right text-white">
            <div className="text-sm opacity-90">예상 기간</div>
            <div className="font-bold">{recommendation.timeframe}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <div className="text-xs text-white/70">목표가</div>
            <div className="text-white font-bold">
              ${recommendation.targetPrice.toFixed(2)}
              <span className="text-xs ml-1">({recommendation.expectedReturn > 0 ? '+' : ''}{recommendation.expectedReturn.toFixed(1)}%)</span>
            </div>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <div className="text-xs text-white/70">손절선</div>
            <div className="text-white font-bold">
              ${recommendation.stopLoss.toFixed(2)}
              <span className="text-xs ml-1">(-{recommendation.risk.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 분석 근거 */}
      <div className="bg-black/30 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-3">📊 AI 분석 근거</h4>
        <ul className="space-y-2">
          {recommendation.reasoning.map((reason: string, i: number) => (
            <motion.li 
              key={i} 
              className="flex items-start gap-2 text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.span 
                className="text-purple-400 mt-0.5"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, delay: i * 0.1 }}
              >
                •
              </motion.span>
              <span className="text-gray-300">{reason}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* 실시간 시장 상황 */}
      {marketData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-lg p-2 border border-blue-700/30">
            <div className="text-blue-400 text-xs mb-1">현재가</div>
            <div className="text-white font-bold text-sm">${marketData.price.toFixed(2)}</div>
          </div>
          <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 rounded-lg p-2 border border-purple-700/30">
            <div className="text-purple-400 text-xs mb-1">Z-Score</div>
            <div className="text-white font-bold text-sm">{marketData.zScore.toFixed(2)}</div>
          </div>
          <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 rounded-lg p-2 border border-orange-700/30">
            <div className="text-orange-400 text-xs mb-1">RSI</div>
            <div className="text-white font-bold text-sm">{marketData.rsi.toFixed(0)}</div>
          </div>
          <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg p-2 border border-green-700/30">
            <div className="text-green-400 text-xs mb-1">24h 변동</div>
            <div className="text-white font-bold text-sm">
              {marketData.change24h > 0 ? '+' : ''}{marketData.change24h.toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {/* 알고리즘 설명 */}
      <motion.div 
        className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-3 border border-gray-600"
        animate={{ borderColor: ['#4B5563', '#6B7280', '#4B5563'] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <p className="text-xs text-gray-400">
          <span className="text-purple-400 font-medium">⚡ AI 평균회귀 알고리즘:</span> 
          {' '}Z-Score, RSI, 볼린저 밴드, 이동평균선 등 다중 지표를 종합 분석하여 
          평균회귀 가능성을 평가합니다. 실시간 시장 데이터를 기반으로 
          최적의 진입/청산 시점을 제시합니다.
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">마지막 업데이트</span>
          <motion.span 
            key={updateTime.getTime()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-purple-400"
          >
            {updateTime.toLocaleTimeString('ko-KR')}
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  )
}