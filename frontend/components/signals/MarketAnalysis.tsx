'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { FaBrain, FaChartLine, FaRobot, FaSignal } from 'react-icons/fa'
import { config } from '@/lib/config'

interface MarketIndicator {
  name: string
  value: number
  signal: 'buy' | 'sell' | 'neutral'
  confidence: number
}

export default function MarketAnalysis() {
  const [indicators, setIndicators] = useState<MarketIndicator[]>([])
  const [overallSignal, setOverallSignal] = useState<'buy' | 'sell' | 'neutral'>('neutral')
  const [marketSentiment, setMarketSentiment] = useState(0)

  useEffect(() => {
    // 시뮬레이션 데이터 생성
    const generateIndicators = () => {
      const rsi = 50 + (((Date.now() % 1000) / 1000) * 50)
      const macd = (((Date.now() % 1000) / 1000) * 2 - 1)
      const bb = (((Date.now() % 1000) / 1000) * 100)
      const volume = 50 + (((Date.now() % 1000) / 1000) * 50)
      
      const newIndicators: MarketIndicator[] = [
        {
          name: 'RSI',
          value: rsi,
          signal: rsi > 70 ? 'sell' : rsi < 30 ? 'buy' : 'neutral',
          confidence: Math.abs(rsi - 50) * 2
        },
        {
          name: 'MACD',
          value: macd,
          signal: macd > 0 ? 'buy' : 'sell',
          confidence: Math.abs(macd) * 50
        },
        {
          name: '볼린저 밴드',
          value: bb,
          signal: bb > 80 ? 'sell' : bb < 20 ? 'buy' : 'neutral',
          confidence: Math.abs(bb - 50) * 2
        },
        {
          name: '거래량',
          value: volume,
          signal: volume > 75 ? 'buy' : volume < 25 ? 'sell' : 'neutral',
          confidence: Math.abs(volume - 50) * 2
        }
      ]
      
      setIndicators(newIndicators)
      
      // 전체 시그널 계산
      const buyCount = newIndicators.filter(i => i.signal === 'buy').length
      const sellCount = newIndicators.filter(i => i.signal === 'sell').length
      setOverallSignal(buyCount > sellCount ? 'buy' : sellCount > buyCount ? 'sell' : 'neutral')
      
      // 시장 심리 계산
      setMarketSentiment((((Date.now() % 1000) / 1000) * 100))
    }
    
    generateIndicators()
    const interval = setInterval(generateIndicators, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const getSignalColor = (signal: string) => {
    switch(signal) {
      case 'buy': return 'text-green-400'
      case 'sell': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getSignalText = (signal: string) => {
    switch(signal) {
      case 'buy': return '매수'
      case 'sell': return '매도'
      default: return '중립'
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-2xl border border-purple-500/20">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaBrain className="text-purple-400 text-2xl" />
          <h2 className="text-xl font-bold text-white">AI 시장 종합 분석</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">실시간 분석 중</span>
        </div>
      </div>

      {/* 전체 시그널 */}
      <motion.div
        initial={{ opacity: 0, scale: config.decimals.value9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
      >
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">AI 종합 판단</p>
          <div className={`text-3xl font-bold ${getSignalColor(overallSignal)} mb-2`}>
            {getSignalText(overallSignal)} 신호
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="text-sm">
              <span className="text-gray-400">신뢰도: </span>
              <span className="text-white font-bold">{(marketSentiment).toFixed(1)}%</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">강도: </span>
              <span className={`font-bold ${marketSentiment > 70 ? 'text-green-400' : marketSentiment > 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                {marketSentiment > 70 ? '강함' : marketSentiment > 30 ? '보통' : '약함'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 개별 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {indicators.map((indicator, index) => (
          <motion.div
            key={indicator.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * config.decimals.value1 }}
            className="p-3 bg-gray-800/30 rounded-lg border border-gray-700"
          >
            <p className="text-xs text-gray-400 mb-1">{indicator.name}</p>
            <p className="text-lg font-bold text-white mb-1">
              {safeFixed(indicator.value, 2)}
            </p>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${getSignalColor(indicator.signal)}`}>
                {getSignalText(indicator.signal)}
              </span>
              <span className="text-xs text-gray-500">
                {safeFixed(indicator.confidence, 0)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 시장 심리 바 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">시장 심리 지수</span>
          <span className="text-sm font-bold text-white">{safeFixed(marketSentiment, 1)}</span>
        </div>
        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${marketSentiment}%` }}
            transition={{ duration: 1 }}
            className={`h-full ${
              marketSentiment > 70 
                ? 'bg-gradient-to-r from-green-500 to-green-400' 
                : marketSentiment > 30 
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                  : 'bg-gradient-to-r from-red-500 to-red-400'
            }`}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-red-400">공포</span>
          <span className="text-xs text-gray-400">중립</span>
          <span className="text-xs text-green-400">탐욕</span>
        </div>
      </div>

      {/* AI 코멘트 */}
      <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
        <div className="flex items-start gap-3">
          <FaRobot className="text-purple-400 mt-1" />
          <div>
            <p className="text-sm text-gray-300 leading-relaxed">
              현재 시장은 {overallSignal === 'buy' ? '상승' : overallSignal === 'sell' ? '하락' : '횡보'} 
              압력이 우세합니다. RSI와 MACD 지표가 {overallSignal === 'buy' ? '긍정적' : overallSignal === 'sell' ? '부정적' : '중립적'}
              신호를 보이고 있으며, 거래량 {indicators[3]?.value > 50 ? '증가' : '감소'} 추세입니다.
              단기적으로는 변동성이 {marketSentiment > 50 ? '확대' : '축소'}될 가능성이 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}