'use client'

import { motion } from 'framer-motion'
import { FearGreedData } from '../hooks/useFearGreedData'
import { 
  FaChartLine, FaExclamationTriangle, FaDollarSign, 
  FaArrowUp, FaArrowDown, FaBalanceScale 
} from 'react-icons/fa'

interface MarketSentimentProps {
  coin: string
  fearGreedData: FearGreedData | null
  loading: boolean
}

export default function MarketSentiment({ coin, fearGreedData, loading }: MarketSentimentProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Extreme Fear': return 'text-red-500'
      case 'Fear': return 'text-orange-400'
      case 'Neutral': return 'text-yellow-400'
      case 'Greed': return 'text-lime-400'
      case 'Extreme Greed': return 'text-green-500'
      default: return 'text-gray-400'
    }
  }

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'bullish': return <FaArrowUp className="text-green-400" />
      case 'bearish': return <FaArrowDown className="text-red-400" />
      default: return <FaBalanceScale className="text-yellow-400" />
    }
  }

  const getInvestmentAdvice = (value: number) => {
    if (value <= 20) {
      return {
        title: '역발상 매수 최적기',
        description: '극도의 공포는 역사적으로 최고의 매수 기회였습니다. Warren Buffett의 "남들이 두려워할 때 탐욕스러워하라"는 격언을 기억하세요.',
        action: '자산의 30-40%를 3회 분할 매수',
        risk: '단기적 추가 하락 가능',
        reward: '3-6개월 내 30-50% 상승 기대'
      }
    } else if (value <= 40) {
      return {
        title: '점진적 매수 구간',
        description: '시장이 두려움에 빠져있습니다. 신중한 매수 전략을 시작할 시점입니다.',
        action: '자산의 10-20% 분할 매수',
        risk: '변동성 지속 가능',
        reward: '중기적 20-30% 상승 가능'
      }
    } else if (value <= 60) {
      return {
        title: '관망 및 포지션 유지',
        description: '시장이 균형 상태입니다. 명확한 방향성이 나타날 때까지 기다리세요.',
        action: '현재 포지션 유지',
        risk: '양방향 변동 가능',
        reward: '단기 수익 제한적'
      }
    } else if (value <= 80) {
      return {
        title: '차익 실현 고려',
        description: '시장에 탐욕이 나타나고 있습니다. 수익 실현을 고려하세요.',
        action: '보유 포지션의 30-50% 매도',
        risk: '추가 상승 놓칠 가능성',
        reward: '하락 리스크 회피'
      }
    } else {
      return {
        title: '역발상 매도 신호',
        description: '극도의 탐욕은 조정의 전조입니다. "남들이 탐욕스러울 때 두려워하라"',
        action: '보유 포지션의 50-70% 매도',
        risk: '단기 추가 상승 가능',
        reward: '큰 조정 회피'
      }
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const value = fearGreedData?.value || 50
  const advice = getInvestmentAdvice(value)

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-white">시장 심리 분석</h2>
        <div className="flex items-center gap-2">
          {getMomentumIcon(fearGreedData?.momentum || 'neutral')}
          <span className="text-sm text-gray-400">
            {fearGreedData?.momentum === 'bullish' ? '상승 모멘텀' : 
             fearGreedData?.momentum === 'bearish' ? '하락 모멘텀' : '중립'}
          </span>
        </div>
      </div>

      {/* 현재 심리 상태 */}
      <motion.div
        className="bg-gray-900/50 rounded-xl p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400">현재 시장 심리</span>
          <span className={`text-2xl font-bold ${getSentimentColor(fearGreedData?.coinSentiment || 'Neutral')}`}>
            {fearGreedData?.coinSentiment || 'Neutral'}
          </span>
        </div>
        
        {/* 심리 지표 바 */}
        <div className="grid grid-cols-5 gap-1 mb-3">
          <div className={`h-2 rounded ${value <= 20 ? 'bg-red-500' : 'bg-gray-700'}`} />
          <div className={`h-2 rounded ${value > 20 && value <= 40 ? 'bg-orange-400' : 'bg-gray-700'}`} />
          <div className={`h-2 rounded ${value > 40 && value <= 60 ? 'bg-yellow-400' : 'bg-gray-700'}`} />
          <div className={`h-2 rounded ${value > 60 && value <= 80 ? 'bg-lime-400' : 'bg-gray-700'}`} />
          <div className={`h-2 rounded ${value > 80 ? 'bg-green-500' : 'bg-gray-700'}`} />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>극공포</span>
          <span>공포</span>
          <span>중립</span>
          <span>탐욕</span>
          <span>극탐욕</span>
        </div>
      </motion.div>

      {/* AI 투자 조언 */}
      <motion.div
        className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl p-4 mb-6 border border-yellow-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
          <FaChartLine />
          {advice.title}
        </h3>
        <p className="text-sm text-gray-300 mb-4">
          {advice.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <FaDollarSign className="text-green-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-white">추천 액션</p>
              <p className="text-xs text-gray-400">{advice.action}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="text-yellow-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-white">리스크</p>
              <p className="text-xs text-gray-400">{advice.risk}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <FaChartLine className="text-blue-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-white">기대 수익</p>
              <p className="text-xs text-gray-400">{advice.reward}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 실시간 지표 */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="bg-gray-900/50 rounded-lg p-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-gray-400 mb-1">24시간 거래량</p>
          <p className="text-lg font-bold text-white">
            ${((fearGreedData?.volume24h || 0) / 1000000000).toFixed(2)}B
          </p>
          <p className="text-xs text-gray-400">
            {fearGreedData?.volume24h && fearGreedData.volume24h > 50000000000 ? '높음' : '보통'}
          </p>
        </motion.div>
        
        <motion.div
          className="bg-gray-900/50 rounded-lg p-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xs text-gray-400 mb-1">변동성</p>
          <p className="text-lg font-bold text-white">
            {fearGreedData?.volatility?.toFixed(2) || '0'}%
          </p>
          <p className="text-xs text-gray-400">
            {(fearGreedData?.volatility || 0) > 5 ? '높음' : (fearGreedData?.volatility || 0) > 2 ? '중간' : '낮음'}
          </p>
        </motion.div>
      </div>

      {/* 트레이딩 신호 */}
      <motion.div
        className="mt-6 p-4 bg-gray-900/50 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">트레이딩 신호</p>
            <p className={`text-xl font-bold ${
              fearGreedData?.tradingSignal?.includes('buy') ? 'text-green-400' : 
              fearGreedData?.tradingSignal?.includes('sell') ? 'text-red-400' : 
              'text-yellow-400'
            }`}>
              {fearGreedData?.tradingSignal === 'strong_buy' ? '강력 매수' :
               fearGreedData?.tradingSignal === 'buy' ? '매수' :
               fearGreedData?.tradingSignal === 'hold' ? '홀드' :
               fearGreedData?.tradingSignal === 'sell' ? '매도' :
               fearGreedData?.tradingSignal === 'strong_sell' ? '강력 매도' : '대기'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">신뢰도</p>
            <p className="text-xl font-bold text-white">
              {fearGreedData?.confidence || 50}%
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}