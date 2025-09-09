'use client'

import { useState, useEffect } from 'react'
import { FaBullhorn, FaExclamationCircle, FaCheckCircle, FaTimesCircle, FaBalanceScale, FaRocket, FaBomb, FaShieldAlt } from 'react-icons/fa'
import useSocialData from '../hooks/useSocialData'

interface InvestmentSignalsProps {
  coin: string
}

interface Signal {
  type: 'BUY' | 'SELL' | 'HOLD'
  strength: 'STRONG' | 'MODERATE' | 'WEAK'
  confidence: number
  reasons: string[]
  risk: 'LOW' | 'MEDIUM' | 'HIGH'
  timeHorizon: string
  potentialReturn: number
  potentialLoss: number
}

export default function InvestmentSignals({ coin }: InvestmentSignalsProps) {
  const { sentimentData } = useSocialData(coin)
  const [mainSignal, setMainSignal] = useState<Signal | null>(null)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange24h, setPriceChange24h] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [marketCap, setMarketCap] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const analyzeSignals = async () => {
      try {
        // 현재 시장 데이터
        let price = 0
        let change = 0
        let volume = 0
        
        const tickerResponse = await fetch(`/api/binance/ticker?symbol=${coin}USDT`)
        if (tickerResponse.ok) {
          const ticker = await tickerResponse.json()
          price = parseFloat(ticker.lastPrice || '0')
          change = parseFloat(ticker.priceChangePercent || '0')
          volume = parseFloat(ticker.quoteVolume || '0')
        }
        
        setCurrentPrice(price)
        setPriceChange24h(change)
        setVolume24h(volume)

        // 시장 총액 계산 (실제로는 CoinGecko API 등 사용)
        const estimatedSupply = coin === 'BTC' ? 19600000 : 
                               coin === 'ETH' ? 120000000 : 
                               1000000000 // 기본값
        setMarketCap(price * estimatedSupply)

        // 종합 신호 분석
        const sentiment = sentimentData.sentimentScore
        const mentionGrowth = sentimentData.sentimentChange
        const trendingCount = sentimentData.trendingKeywords.length
        const bullishInfluencers = sentimentData.influencers.filter(i => i.sentiment === 'BULLISH').length
        const bearishInfluencers = sentimentData.influencers.filter(i => i.sentiment === 'BEARISH').length

        let signalType: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
        let strength: 'STRONG' | 'MODERATE' | 'WEAK' = 'WEAK'
        let confidence = 50
        const reasons: string[] = []
        let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
        let timeHorizon = '1-3일'
        let potentialReturn = 0
        let potentialLoss = 0

        // 강한 매수 신호
        if (sentiment > 75 && mentionGrowth > 30 && bullishInfluencers > bearishInfluencers) {
          signalType = 'BUY'
          strength = 'STRONG'
          confidence = 85
          reasons.push('소셜 감성 매우 긍정적 (75% 이상)')
          reasons.push('멘션 급증세 (+30% 이상)')
          reasons.push('주요 인플루언서들 긍정적')
          reasons.push('FOMO 심리 강하게 형성')
          risk = 'HIGH'
          timeHorizon = '1-2일'
          potentialReturn = 10
          potentialLoss = 5
        }
        // 중간 매수 신호
        else if (sentiment > 60 && change > 0 && trendingCount > 3) {
          signalType = 'BUY'
          strength = 'MODERATE'
          confidence = 70
          reasons.push('긍정적 감성 우세')
          reasons.push('가격 상승 추세')
          reasons.push('트렌딩 키워드 다수 감지')
          risk = 'MEDIUM'
          timeHorizon = '2-5일'
          potentialReturn = 7
          potentialLoss = 3
        }
        // 강한 매도 신호
        else if (sentiment < 25 && mentionGrowth < -30 && bearishInfluencers > bullishInfluencers) {
          signalType = 'SELL'
          strength = 'STRONG'
          confidence = 80
          reasons.push('소셜 감성 매우 부정적 (25% 미만)')
          reasons.push('멘션 급감 (-30% 이상)')
          reasons.push('FUD 확산 중')
          reasons.push('주요 인플루언서들 부정적')
          risk = 'HIGH'
          timeHorizon = '즉시'
          potentialReturn = -10
          potentialLoss = 2
        }
        // 중간 매도 신호
        else if (sentiment < 40 && change < -3) {
          signalType = 'SELL'
          strength = 'MODERATE'
          confidence = 65
          reasons.push('부정적 감성 지속')
          reasons.push('가격 하락 추세')
          reasons.push('매도 압력 증가')
          risk = 'MEDIUM'
          timeHorizon = '1-2일'
          potentialReturn = -5
          potentialLoss = 2
        }
        // 홀드 신호
        else {
          signalType = 'HOLD'
          strength = 'MODERATE'
          confidence = 60
          reasons.push('중립적 시장 감성')
          reasons.push('뚜렷한 방향성 부재')
          reasons.push('추가 신호 대기 권장')
          risk = 'LOW'
          timeHorizon = '관망'
          potentialReturn = 0
          potentialLoss = 0
        }

        // 거래량 이상 감지 - 코인별 평균 거래량 대비
        const avgVolume = volume24h || volume
        const volumeThreshold = avgVolume * 2 // 평균 대비 2배
        if (volume > volumeThreshold && volumeThreshold > 0) {
          reasons.push(`비정상적 거래량 감지 (평균 대비 ${(volume / avgVolume).toFixed(1)}배)`)
          confidence += 5
        }

        // 극단적 감성 경고
        if (sentiment > 90 || sentiment < 10) {
          reasons.push('극단적 감성 - 반전 가능성 주의')
          risk = 'HIGH'
        }

        setMainSignal({
          type: signalType,
          strength,
          confidence: Math.min(95, confidence),
          reasons,
          risk,
          timeHorizon,
          potentialReturn,
          potentialLoss
        })

        setLoading(false)
      } catch (error) {
        console.error('신호 분석 실패:', error)
        setLoading(false)
      }
    }

    analyzeSignals()
    const interval = setInterval(analyzeSignals, 60000)

    return () => clearInterval(interval)
  }, [coin, sentimentData])

  if (!mainSignal) {
    return null // 로딩 UI 대신 null 반환
  }

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'BUY': return 'from-green-600 to-green-700'
      case 'SELL': return 'from-red-600 to-red-700'
      default: return 'from-yellow-600 to-yellow-700'
    }
  }

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'BUY': return <FaRocket className="text-4xl" />
      case 'SELL': return <FaBomb className="text-4xl" />
      default: return <FaBalanceScale className="text-4xl" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'text-red-400'
      case 'MEDIUM': return 'text-yellow-400'
      default: return 'text-green-400'
    }
  }

  const getStrengthBars = (strength: string) => {
    const bars = strength === 'STRONG' ? 3 : strength === 'MODERATE' ? 2 : 1
    return Array.from({ length: 3 }, (_, i) => (
      <div
        key={i}
        className={`w-2 h-4 rounded ${
          i < bars ? 'bg-white' : 'bg-gray-600'
        }`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* 메인 신호 카드 */}
      <div className={`bg-gradient-to-r ${getSignalColor(mainSignal.type)} rounded-lg p-6 text-white`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">실시간 투자 신호</h3>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">{mainSignal.type}</span>
              <div className="flex items-center gap-1">
                {getStrengthBars(mainSignal.strength)}
              </div>
            </div>
          </div>
          {getSignalIcon(mainSignal.type)}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm opacity-80">신뢰도</p>
            <p className="text-xl font-bold">{mainSignal.confidence}%</p>
          </div>
          <div>
            <p className="text-sm opacity-80">리스크</p>
            <p className={`text-xl font-bold ${getRiskColor(mainSignal.risk)}`}>
              {mainSignal.risk}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-80">시간대</p>
            <p className="text-xl font-bold">{mainSignal.timeHorizon}</p>
          </div>
          <div>
            <p className="text-sm opacity-80">예상 수익률</p>
            <p className="text-xl font-bold">
              {mainSignal.potentialReturn > 0 ? '+' : ''}{mainSignal.potentialReturn}%
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm opacity-80 mb-2">신호 근거</p>
          <ul className="space-y-1">
            {mainSignal.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <FaCheckCircle className="mt-0.5 flex-shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 시장 현황 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaBullhorn className="text-purple-400" />
          시장 현황
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700/50 rounded p-3">
            <p className="text-sm text-gray-400 mb-1">현재가</p>
            <p className="text-lg font-bold text-white">
              ${currentPrice.toLocaleString()}
            </p>
            <p className={`text-xs ${priceChange24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange24h > 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
            </p>
          </div>
          <div className="bg-gray-700/50 rounded p-3">
            <p className="text-sm text-gray-400 mb-1">24h 거래량</p>
            <p className="text-lg font-bold text-white">
              ${(volume24h / 1000000).toFixed(0)}M
            </p>
          </div>
          <div className="bg-gray-700/50 rounded p-3">
            <p className="text-sm text-gray-400 mb-1">감성 점수</p>
            <p className="text-lg font-bold text-purple-400">
              {sentimentData.sentimentScore}/100
            </p>
          </div>
          <div className="bg-gray-700/50 rounded p-3">
            <p className="text-sm text-gray-400 mb-1">총 언급 수</p>
            <p className="text-lg font-bold text-blue-400">
              {sentimentData.totalMentions.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 투자 전략 가이드 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaShieldAlt className="text-green-400" />
          투자 전략 가이드
        </h3>
        
        {mainSignal.type === 'BUY' && (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded p-4">
              <h4 className="font-bold text-green-400 mb-2">📈 매수 전략</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• 진입가: 현재가 기준 ±0.5% 범위</li>
                <li>• 포지션 크기: 전체 자본의 3-5%</li>
                <li>• 분할 매수: 3회로 나누어 진입</li>
                <li>• 손절가: 진입가 대비 -3%</li>
                <li>• 목표가: 단계별 분할 익절 전략</li>
              </ul>
            </div>
          </div>
        )}

        {mainSignal.type === 'SELL' && (
          <div className="space-y-4">
            <div className="bg-red-900/20 border border-red-500/30 rounded p-4">
              <h4 className="font-bold text-red-400 mb-2">📉 매도 전략</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• 즉시 매도 또는 분할 매도</li>
                <li>• 보유 포지션의 50% 우선 정리</li>
                <li>• 반등 시 추가 매도</li>
                <li>• 재진입 대기: 감성 40% 이상 회복 시</li>
                <li>• 현금 보유 비중 높이기</li>
              </ul>
            </div>
          </div>
        )}

        {mainSignal.type === 'HOLD' && (
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-4">
              <h4 className="font-bold text-yellow-400 mb-2">⚖️ 관망 전략</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• 신규 포지션 진입 보류</li>
                <li>• 기존 포지션 유지</li>
                <li>• 추가 신호 모니터링</li>
                <li>• 현금 비중 30% 이상 유지</li>
                <li>• 극단적 움직임 대비</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 위험 관리 */}
      <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3 text-orange-400 flex items-center gap-2">
          <FaExclamationCircle />
          위험 관리 원칙
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h4 className="font-bold text-orange-300 mb-2">필수 준수사항</h4>
            <ul className="space-y-1">
              <li>• 손절가는 반드시 설정</li>
              <li>• 전체 자본의 10% 이상 단일 포지션 금지</li>
              <li>• 레버리지는 3배 이하 권장</li>
              <li>• 감정적 매매 금지</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-orange-300 mb-2">시장 상황별 대응</h4>
            <ul className="space-y-1">
              <li>• 극단적 감성(90%+, 10%-): 역발상 고려</li>
              <li>• 거래량 급증: 변동성 확대 대비</li>
              <li>• 인플루언서 의견 급변: 단기 변동 주의</li>
              <li>• 주말/공휴일: 유동성 부족 주의</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}