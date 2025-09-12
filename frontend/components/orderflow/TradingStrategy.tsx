'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface TradingStrategyProps {
  symbol: string
}

interface StrategySignal {
  direction: 'long' | 'short' | 'neutral'
  confidence: number
  entry: number
  stopLoss: number
  takeProfit: number[]
  riskReward: number
  positionSize: number
  reasons: string[]
}

export default function TradingStrategy({ symbol }: TradingStrategyProps) {
  const [strategy, setStrategy] = useState<StrategySignal | null>(null)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [marketCondition, setMarketCondition] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const analyzeStrategy = async () => {
      try {
        // 여러 데이터 소스에서 정보 수집
        const [tickerResponse, klinesResponse, orderbookResponse] = await Promise.all([
          fetch(`/api/binance/ticker/24hr?symbol=${symbol}`),
          fetch(`/api/binance/klines?symbol=${symbol}&interval=15m&limit=20`),
          fetch(`/api/binance/orderbook?symbol=${symbol}&limit=10`)
        ])

        if (!tickerResponse.ok || !klinesResponse.ok || !orderbookResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const ticker = await tickerResponse.json()
        const klinesResult = await klinesResponse.json()
        const orderbook = await orderbookResponse.json()
        
        // API 응답에서 data 배열 추출
        const klines = klinesResult.data || klinesResult.klines || klinesResult || []
        
        if (!Array.isArray(klines) || klines.length === 0) {
          console.error('Invalid klines data:', klinesResult)
          setIsLoading(false)
          return
        }

        // 현재 가격 및 변동성 분석
        const price = parseFloat(ticker.lastPrice)
        const change24h = parseFloat(ticker.priceChangePercent)
        const volume24h = parseFloat(ticker.quoteVolume)
        const avgVolume = parseFloat(ticker.count) > 0 ? volume24h / parseFloat(ticker.count) : 0

        setCurrentPrice(price)

        // 기술적 지표 계산
        const closes = klines.map((k: any[]) => parseFloat(k[4]))
        const highs = klines.map((k: any[]) => parseFloat(k[2]))
        const lows = klines.map((k: any[]) => parseFloat(k[3]))
        
        // 간단한 RSI 계산
        let gains = 0
        let losses = 0
        for (let i = 1; i < closes.length; i++) {
          const change = closes[i] - closes[i - 1]
          if (change > 0) gains += change
          else losses += Math.abs(change)
        }
        const avgGain = gains / (closes.length - 1)
        const avgLoss = losses / (closes.length - 1)
        const rs = avgGain / avgLoss
        const rsi = 100 - (100 / (1 + rs))

        // 볼린저 밴드 계산
        const sma = closes.reduce((a, b) => a + b) / closes.length
        const variance = closes.reduce((sum, close) => sum + Math.pow(close - sma, 2), 0) / closes.length
        const stdDev = Math.sqrt(variance)
        const upperBand = sma + (stdDev * 2)
        const lowerBand = sma - (stdDev * 2)

        // 오더북 임밸런스
        const bidTotal = orderbook.bids.reduce((sum: number, bid: any) => sum + bid.total, 0)
        const askTotal = orderbook.asks.reduce((sum: number, ask: any) => sum + ask.total, 0)
        const orderImbalance = ((bidTotal - askTotal) / (bidTotal + askTotal)) * 100

        // 시장 상태 판단
        let condition = ''
        if (rsi > 70 && price > upperBand) condition = '과매수 상태'
        else if (rsi < 30 && price < lowerBand) condition = '과매도 상태'
        else if (change24h > 5) condition = '강한 상승 추세'
        else if (change24h < -5) condition = '강한 하락 추세'
        else condition = '횡보/중립 상태'
        
        setMarketCondition(condition)

        // 전략 신호 생성
        const reasons: string[] = []
        let direction: 'long' | 'short' | 'neutral' = 'neutral'
        let confidence = 50

        // 롱 신호 조건
        if (rsi < 40 && price < lowerBand && orderImbalance > 20) {
          direction = 'long'
          confidence = 75
          reasons.push('RSI 과매도 구간')
          reasons.push('볼린저 밴드 하단 터치')
          reasons.push('강한 매수 오더북')
        } else if (rsi > 60 && price > upperBand && orderImbalance < -20) {
          direction = 'short'
          confidence = 75
          reasons.push('RSI 과매수 구간')
          reasons.push('볼린저 밴드 상단 돌파')
          reasons.push('강한 매도 오더북')
        } else if (change24h > 3 && rsi < 70 && orderImbalance > 10) {
          direction = 'long'
          confidence = 65
          reasons.push('상승 추세 지속')
          reasons.push('매수세 우위')
          reasons.push('모멘텀 양호')
        } else if (change24h < -3 && rsi > 30 && orderImbalance < -10) {
          direction = 'short'
          confidence = 65
          reasons.push('하락 추세 지속')
          reasons.push('매도세 우위')
          reasons.push('약한 모멘텀')
        }

        // 엔트리, 손절, 익절 계산
        const atr = highs.reduce((sum, high, i) => sum + (high - lows[i]), 0) / highs.length
        const entry = price
        const stopLoss = direction === 'long' 
          ? price - (atr * 1.5)
          : price + (atr * 1.5)
        const takeProfit = direction === 'long'
          ? [price + atr, price + (atr * 2), price + (atr * 3)]
          : [price - atr, price - (atr * 2), price - (atr * 3)]
        
        const riskReward = Math.abs(takeProfit[1] - entry) / Math.abs(entry - stopLoss)
        const accountBalance = 10000 // 가상 계좌 잔고
        const riskPercent = 0.02 // 2% 리스크
        const riskAmount = accountBalance * riskPercent
        const positionSize = riskAmount / Math.abs(entry - stopLoss)

        setStrategy({
          direction,
          confidence,
          entry,
          stopLoss,
          takeProfit,
          riskReward,
          positionSize,
          reasons
        })
        
        setIsLoading(false)
      } catch (error) {
        console.error('Strategy analysis error:', error)
        setIsLoading(false)
      }
    }

    analyzeStrategy()
    const interval = setInterval(analyzeStrategy, 10000) // 10초마다 업데이트

    return () => clearInterval(interval)
  }, [symbol])

  if (isLoading || !strategy) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4 w-48"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'long': return 'text-green-400'
      case 'short': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getDirectionEmoji = (direction: string) => {
    switch (direction) {
      case 'long': return '📈'
      case 'short': return '📉'
      default: return '➡️'
    }
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          AI 트레이딩 전략
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-400">시장 상태</p>
          <p className="text-lg font-bold text-purple-400">{marketCondition}</p>
        </div>
      </div>

      {/* 메인 신호 */}
      <div className={`p-6 rounded-lg mb-6 ${
        strategy.direction === 'long' ? 'bg-green-900/20 border border-green-500/30' :
        strategy.direction === 'short' ? 'bg-red-900/20 border border-red-500/30' :
        'bg-gray-800/30 border border-gray-700'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getDirectionEmoji(strategy.direction)}</span>
            <div>
              <p className="text-xs text-gray-400">추천 포지션</p>
              <p className={`text-2xl font-bold ${getDirectionColor(strategy.direction)} uppercase`}>
                {strategy.direction}
              </p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">신뢰도</p>
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="rgba(75, 85, 99, 0.3)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke={strategy.confidence > 70 ? '#10b981' : strategy.confidence > 50 ? '#f59e0b' : '#6b7280'}
                  strokeWidth="8"
                  strokeDasharray={`${strategy.confidence * 2.26} 226`}
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{strategy.confidence}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 신호 근거 */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-300 mb-2">📊 신호 근거</p>
          <ul className="space-y-1">
            {strategy.reasons.map((reason, index) => (
              <li key={index} className="text-xs text-gray-400 flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 거래 설정 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-400 mb-1">진입가</p>
          <p className="text-lg font-bold text-white">${safeFixed(strategy.entry, 2)}</p>
          <p className="text-xs text-gray-500">현재가 기준</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">손절가</p>
          <p className="text-lg font-bold text-red-400">${safeFixed(strategy.stopLoss, 2)}</p>
          <p className="text-xs text-gray-500">
            -{((Math.abs(strategy.entry - strategy.stopLoss) / strategy.entry) * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">목표가</p>
          <div className="space-y-1">
            {strategy.takeProfit.map((tp, index) => (
              <p key={index} className="text-sm font-medium text-green-400">
                TP{index + 1}: ${safeFixed(tp, 2)}
              </p>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">리스크/리워드</p>
          <p className="text-lg font-bold text-purple-400">1:{safeFixed(strategy.riskReward, 1)}</p>
          <p className="text-xs text-gray-500">권장 비율</p>
        </div>
      </div>

      {/* 포지션 사이징 */}
      <div className="p-4 bg-gray-800/50 rounded-lg mb-4">
        <h4 className="text-sm font-medium text-purple-400 mb-2">💰 포지션 사이징</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">계좌 잔고 (가정)</p>
            <p className="text-white font-medium">$10,000</p>
          </div>
          <div>
            <p className="text-gray-400">리스크 비율</p>
            <p className="text-white font-medium">2%</p>
          </div>
          <div>
            <p className="text-gray-400">최대 손실액</p>
            <p className="text-red-400 font-medium">$200</p>
          </div>
          <div>
            <p className="text-gray-400">추천 수량</p>
            <p className="text-green-400 font-medium">{safeFixed(strategy.positionSize, 4)} 개</p>
          </div>
        </div>
      </div>

      {/* 주의사항 */}
      <div className="p-4 bg-yellow-900/10 border border-yellow-500/20 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-2">
          <span>⚠️</span>
          주의사항
        </h4>
        <ul className="space-y-1 text-xs text-gray-300">
          <li>• 이 전략은 AI 분석 기반 제안이며, 투자 권유가 아닙니다</li>
          <li>• 실제 거래 전 본인의 분석과 판단이 필요합니다</li>
          <li>• 손실 감수 능력을 초과하는 거래는 피하세요</li>
          <li>• 시장 상황은 급변할 수 있으니 지속적인 모니터링이 필요합니다</li>
        </ul>
      </div>
    </div>
  )
}