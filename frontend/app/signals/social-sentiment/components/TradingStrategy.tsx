'use client'

import { useState, useEffect } from 'react'
import { useRealtimePrice, useMultipleRealtimePrices, fetchKlines, fetchOrderBook, fetch24hrTicker } from '@/lib/hooks/useRealtimePrice'
import { dataService } from '@/lib/services/finalDataService'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaChartLine, FaClock, FaExclamationTriangle, FaCheckCircle, FaArrowUp, FaArrowDown, FaBalanceScale } from 'react-icons/fa'
import useSocialData from '../hooks/useSocialData'
import { getTradingConfig } from '@/lib/tradingConfig'

interface TradingStrategyProps {
  coin: string
}

interface Strategy {
  timeframe: string
  action: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  entry: number
  stopLoss: number
  takeProfit: number[]
  reasoning: string[]
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

// 가격은 API에서만 가져옴

export default function TradingStrategy({ coin }: TradingStrategyProps) {
  const { sentimentData } = useSocialData(coin)
  const [currentPrice, setCurrentPrice] = useState(0) // API에서 실제 가격을 받을 때까지 0
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const analyzeStrategies = async () => {
      try {
        const symbol = `${coin}USDT`
        const interval = '1h'
        const limit = 100
        // 현재 가격 정보
        // 기본값 설정 (API 호출 실패 시 사용)
        let price = currentPrice || 40000
        let priceChange = 0
        let volume = 1000000000

        const tickerResponse = await fetch24hrTicker(symbol)
        if (tickerResponse.ok) {
          const ticker = await tickerResponse.json()
          price = parseFloat(ticker.lastPrice || '0')
          priceChange = parseFloat(ticker.priceChangePercent || '0')
          volume = parseFloat(ticker.quoteVolume || '0')
          setCurrentPrice(price)
        }

        // ATR 계산을 위한 캔들 데이터
        const klinesResponse = await fetchKlines(symbol, interval, limit)
        let klines: any[] = []
        if (klinesResponse.ok) {
          klines = await klinesResponse.json()
        }

        // ATR 계산 (실제 계산)
        let atr = 0
        if (klines.length >= 14) {
          const trValues = klines.map((kline: any[], i: number) => {
            if (i === 0) return 0
            const high = parseFloat(kline[2])
            const low = parseFloat(kline[3])
            const prevClose = parseFloat(klines[i-1][4])
            return Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose))
          })
          atr = trValues.slice(1).reduce((a, b) => a + b) / (trValues.length - 1)
        }

        const atrPercent = (atr / price) * 100

        // 소셜 감성 기반 전략 생성
        const sentiment = sentimentData.sentimentScore
        const mentionGrowth = sentimentData.sentimentChange

        // 단기 전략 (1-24시간)
        let shortTermAction: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
        let shortTermConfidence = 50
        const shortTermReasons: string[] = []

        if (sentiment > 70 && mentionGrowth > 20) {
          shortTermAction = 'BUY'
          shortTermConfidence = 80
          shortTermReasons.push('소셜 감성 매우 긍정적 (70% 이상)')
          shortTermReasons.push(`멘션 급증 (+${safeFixed(mentionGrowth, 1)}%)`)
          shortTermReasons.push('FOMO 심리 형성 중')
        } else if (sentiment < 30 && mentionGrowth < -20) {
          shortTermAction = 'SELL'
          shortTermConfidence = 75
          shortTermReasons.push('소셜 감성 매우 부정적 (30% 미만)')
          shortTermReasons.push('멘션 급감 (-20% 이상)')
          shortTermReasons.push('FUD 확산 중')
        } else if (sentiment > 50 && priceChange > 0) {
          shortTermAction = 'BUY'
          shortTermConfidence = 65
          shortTermReasons.push('긍정적 감성과 가격 상승 동조')
          shortTermReasons.push('상승 모멘텀 지속 가능성')
        }

        const shortTermStrategy: Strategy = {
          timeframe: '단기 (1-24시간)',
          action: shortTermAction,
          confidence: shortTermConfidence,
          entry: price,
          stopLoss: price * (1 - atrPercent * 1.5 / 100),
          takeProfit: [
            price * (1 + atrPercent * 1 / 100),
            price * (1 + atrPercent * 2 / 100),
            price * (1 + atrPercent * 3 / 100)
          ],
          reasoning: shortTermReasons,
          riskLevel: sentiment > 70 || sentiment < 30 ? 'HIGH' : 'MEDIUM'
        }

        // 중기 전략 (1-7일)
        let midTermAction: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
        let midTermConfidence = 50
        const midTermReasons: string[] = []

        if (sentiment > 60 && sentimentData.influencers.filter(i => i.sentiment === 'BULLISH').length > 2) {
          midTermAction = 'BUY'
          midTermConfidence = 70
          midTermReasons.push('지속적인 긍정 감성')
          midTermReasons.push('인플루언서 다수 긍정적')
          midTermReasons.push('중기 상승 트렌드 형성 가능')
        } else if (sentiment < 40) {
          midTermAction = 'SELL'
          midTermConfidence = 65
          midTermReasons.push('부정적 감성 지속')
          midTermReasons.push('매도 압력 증가 예상')
        }

        const midTermStrategy: Strategy = {
          timeframe: '중기 (1-7일)',
          action: midTermAction,
          confidence: midTermConfidence,
          entry: price,
          stopLoss: price * (1 - atrPercent * 2 / 100),
          takeProfit: [
            price * (1 + atrPercent * 2 / 100),
            price * (1 + atrPercent * 4 / 100),
            price * (1 + atrPercent * 6 / 100)
          ],
          reasoning: midTermReasons,
          riskLevel: 'MEDIUM'
        }

        // 장기 전략 (7일+)
        let longTermAction: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
        let longTermConfidence = 50
        const longTermReasons: string[] = []

        // 거래량 기준을 동적으로 설정
        const significantVolume = volume > 0 ? volume : 100000000 // 기본 최소값
        if (sentiment > 55 && volume > significantVolume * 0.5) {
          longTermAction = 'BUY'
          longTermConfidence = 60
          longTermReasons.push('안정적인 긍정 감성')
          longTermReasons.push(`충분한 거래량 ($${(volume / 1000000).toFixed(0)}M)`)
          longTermReasons.push('장기 축적 단계 가능성')
        }

        const longTermStrategy: Strategy = {
          timeframe: '장기 (7일+)',
          action: longTermAction,
          confidence: longTermConfidence,
          entry: price,
          stopLoss: price * (1 - atrPercent * 3 / 100),
          takeProfit: [
            price * (1 + atrPercent * 5 / 100),
            price * (1 + atrPercent * 10 / 100),
            price * (1 + atrPercent * 15 / 100)
          ],
          reasoning: longTermReasons,
          riskLevel: 'LOW'
        }

        setStrategies([shortTermStrategy, midTermStrategy, longTermStrategy])
        setLoading(false)
      } catch (error) {
        console.error('전략 분석 실패:', error)
        setLoading(false)
      }
    }

    analyzeStrategies()
    const interval = setInterval(analyzeStrategies, 60000)

    return () => clearInterval(interval)
  }, [coin, sentimentData])

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY': return <FaArrowUp className="text-green-400" />
      case 'SELL': return <FaArrowDown className="text-red-400" />
      default: return <FaBalanceScale className="text-yellow-400" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-400'
      case 'SELL': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'text-red-400'
      case 'MEDIUM': return 'text-yellow-400'
      default: return 'text-green-400'
    }
  }


  return (
    <div className="space-y-6">
      {/* 개념 설명 */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3 text-blue-400">📚 소셜 감성 트레이딩이란?</h3>
        <p className="text-gray-300 mb-3">
          소셜 미디어의 감성과 활동량을 분석하여 시장 심리를 파악하고, 이를 바탕으로 매매 타이밍을 결정하는 전략입니다.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-800/50 rounded p-3">
            <p className="text-green-400 font-medium mb-1">긍정 신호</p>
            <p className="text-gray-400">감성 70% 이상, 멘션 급증</p>
          </div>
          <div className="bg-gray-800/50 rounded p-3">
            <p className="text-yellow-400 font-medium mb-1">중립 신호</p>
            <p className="text-gray-400">감성 40-70%, 평균 활동</p>
          </div>
          <div className="bg-gray-800/50 rounded p-3">
            <p className="text-red-400 font-medium mb-1">부정 신호</p>
            <p className="text-gray-400">감성 40% 미만, 멘션 감소</p>
          </div>
        </div>
      </div>

      {/* 현재 시장 상황 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">현재 시장 상황 분석</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">현재 가격</p>
            <p className="text-xl font-bold text-white">${currentPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">감성 점수</p>
            <p className={`text-xl font-bold ${
              sentimentData.sentimentScore > 60 ? 'text-green-400' :
              sentimentData.sentimentScore < 40 ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {sentimentData.sentimentScore}/100
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">멘션 변화</p>
            <p className={`text-xl font-bold ${
              sentimentData.sentimentChange > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {sentimentData.sentimentChange > 0 ? '+' : ''}{sentimentData.sentimentChange}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">트렌딩</p>
            <p className="text-xl font-bold text-purple-400">
              {sentimentData.trendingKeywords.length}개
            </p>
          </div>
        </div>
      </div>

      {/* 시간대별 전략 */}
      {strategies.map((strategy, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaClock className="text-xl text-purple-400" />
              <h3 className="text-lg font-bold">{strategy.timeframe}</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${getRiskColor(strategy.riskLevel)}`}>
                리스크: {strategy.riskLevel}
              </span>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                strategy.action === 'BUY' ? 'bg-green-900/30' :
                strategy.action === 'SELL' ? 'bg-red-900/30' :
                'bg-yellow-900/30'
              }`}>
                {getActionIcon(strategy.action)}
                <span className={`font-bold ${getActionColor(strategy.action)}`}>
                  {strategy.action}
                </span>
              </div>
            </div>
          </div>

          {/* 신뢰도 */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">신뢰도</span>
              <span className="text-white font-medium">{strategy.confidence}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  strategy.confidence > 70 ? 'bg-green-400' :
                  strategy.confidence > 50 ? 'bg-yellow-400' :
                  'bg-red-400'
                }`}
                style={{ width: `${strategy.confidence}%` }}
              />
            </div>
          </div>

          {/* 가격 레벨 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-700/50 rounded p-3">
              <p className="text-xs text-gray-400 mb-1">진입가</p>
              <p className="text-sm font-medium text-white">${safeFixed(strategy.entry, 2)}</p>
            </div>
            <div className="bg-gray-700/50 rounded p-3">
              <p className="text-xs text-gray-400 mb-1">손절가</p>
              <p className="text-sm font-medium text-red-400">${safeFixed(strategy.stopLoss, 2)}</p>
              <p className="text-xs text-gray-500">
                -{((1 - strategy.stopLoss / strategy.entry) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-700/50 rounded p-3">
              <p className="text-xs text-gray-400 mb-1">목표가 1</p>
              <p className="text-sm font-medium text-green-400">${strategy.takeProfit[0].toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                +{((strategy.takeProfit[0] / strategy.entry - 1) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-700/50 rounded p-3">
              <p className="text-xs text-gray-400 mb-1">목표가 2</p>
              <p className="text-sm font-medium text-green-400">${strategy.takeProfit[1].toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                +{((strategy.takeProfit[1] / strategy.entry - 1) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* 분석 근거 */}
          <div>
            <p className="text-sm text-gray-400 mb-2">분석 근거</p>
            <ul className="space-y-1">
              {strategy.reasoning.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* 실전 팁 */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3 text-purple-400">💡 실전 트레이딩 팁</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <p>소셜 감성은 단기적 변동성이 크므로 반드시 손절가를 설정하세요.</p>
          </div>
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <p>극단적인 감성(90% 이상, 10% 이하)일 때는 반대 매매 기회가 될 수 있습니다.</p>
          </div>
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <p>인플루언서 한 명의 의견에 의존하지 말고 전체적인 흐름을 파악하세요.</p>
          </div>
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <p>주말과 미국 시간대의 소셜 활동이 가장 활발하므로 참고하세요.</p>
          </div>
        </div>
      </div>
    </div>
  )
}