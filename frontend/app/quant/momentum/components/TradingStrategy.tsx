'use client'

import { MomentumData, CoinData } from '../MomentumModule'

interface TradingStrategyProps {
  momentumData: MomentumData | null
  coinData: CoinData | null
}

export default function TradingStrategy({ momentumData, coinData }: TradingStrategyProps) {
  const getStrategyType = () => {
    if (!momentumData) return 'neutral'
    
    if (momentumData.trend === 'strong_bullish' && momentumData.momentumScore > 75) {
      return 'aggressive_long'
    } else if (momentumData.trend === 'bullish' && momentumData.momentumScore > 60) {
      return 'moderate_long'
    } else if (momentumData.trend === 'strong_bearish' && momentumData.momentumScore < 25) {
      return 'aggressive_short'
    } else if (momentumData.trend === 'bearish' && momentumData.momentumScore < 40) {
      return 'moderate_short'
    }
    return 'neutral'
  }

  const strategy = getStrategyType()

  const getStrategyDetails = () => {
    switch (strategy) {
      case 'aggressive_long':
        return {
          title: '적극 매수 전략',
          color: 'text-green-400',
          bg: 'bg-green-900/20',
          border: 'border-green-800/30',
          icon: '🚀',
          actions: [
            '즉시 매수 포지션 진입',
            '레버리지 2-3배 활용 가능',
            '자본의 15-20% 투자',
            '손절선 -3% 설정',
            '목표가 +10% 이상'
          ],
          warning: '과매수 구간 주의'
        }
      case 'moderate_long':
        return {
          title: '신중한 매수 전략',
          color: 'text-blue-400',
          bg: 'bg-blue-900/20',
          border: 'border-blue-800/30',
          icon: '📈',
          actions: [
            '분할 매수 추천',
            '레버리지 1-2배 제한',
            '자본의 10-15% 투자',
            '손절선 -4% 설정',
            '목표가 +5-7%'
          ],
          warning: '추세 전환 모니터링'
        }
      case 'aggressive_short':
        return {
          title: '적극 매도 전략',
          color: 'text-red-400',
          bg: 'bg-red-900/20',
          border: 'border-red-800/30',
          icon: '🔻',
          actions: [
            '공매도 포지션 진입',
            '레버리지 2배 이하',
            '자본의 10% 이하 투자',
            '손절선 +3% 설정',
            '목표가 -10% 이상'
          ],
          warning: '반등 리스크 주의'
        }
      case 'moderate_short':
        return {
          title: '신중한 매도 전략',
          color: 'text-orange-400',
          bg: 'bg-orange-900/20',
          border: 'border-orange-800/30',
          icon: '📉',
          actions: [
            '부분 매도 고려',
            '헤지 포지션 구축',
            '자본의 5-10% 투자',
            '손절선 +4% 설정',
            '목표가 -5%'
          ],
          warning: '지지선 확인 필요'
        }
      default:
        return {
          title: '중립/관망 전략',
          color: 'text-yellow-400',
          bg: 'bg-yellow-900/20',
          border: 'border-yellow-800/30',
          icon: '⚖️',
          actions: [
            '신규 포지션 보류',
            '기존 포지션 유지',
            '시장 방향성 관찰',
            '단타 위주 거래',
            '리스크 최소화'
          ],
          warning: '명확한 신호 대기'
        }
    }
  }

  const details = getStrategyDetails()

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6">종합 트레이딩 전략</h2>

      {/* 메인 전략 */}
      <div className={`mb-6 p-4 rounded-lg ${details.bg} border ${details.border}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{details.icon}</span>
          <div>
            <h3 className={`text-lg font-bold ${details.color}`}>{details.title}</h3>
            <p className="text-sm text-gray-400">
              모멘텀 스코어: {momentumData?.momentumScore || 0} | 
              트렌드: {momentumData?.trend === 'strong_bullish' ? '강한 상승' :
                      momentumData?.trend === 'bullish' ? '상승' :
                      momentumData?.trend === 'bearish' ? '하락' :
                      momentumData?.trend === 'strong_bearish' ? '강한 하락' : '중립'}
            </p>
          </div>
        </div>

        {/* 실행 계획 */}
        <div className="space-y-2 mb-4">
          {details.actions.map((action, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className={`${details.color} mt-0.5`}>▸</span>
              <span className="text-sm text-gray-300">{action}</span>
            </div>
          ))}
        </div>

        {/* 경고 */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-yellow-400">⚠️ 주의: {details.warning}</p>
        </div>
      </div>

      {/* 시간대별 전략 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">단기 (1-4시간)</h4>
          <p className="text-sm text-white mb-2">
            {momentumData?.rsi > 70 ? '과매수 - 단기 조정 예상' :
             momentumData?.rsi < 30 ? '과매도 - 단기 반등 예상' :
             '횡보 - 박스권 거래'}
          </p>
          <p className="text-xs text-gray-500">
            목표: {coinData ? (coinData.price * (momentumData?.rsi > 50 ? 1.02 : 0.98)).toFixed(2) : '-'}
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">중기 (1-3일)</h4>
          <p className="text-sm text-white mb-2">
            {momentumData?.trend === 'bullish' || momentumData?.trend === 'strong_bullish' ? '상승 추세 지속' :
             momentumData?.trend === 'bearish' || momentumData?.trend === 'strong_bearish' ? '하락 추세 지속' :
             '방향성 모호'}
          </p>
          <p className="text-xs text-gray-500">
            목표: {coinData ? (coinData.price * (momentumData?.momentumScore > 50 ? 1.05 : 0.95)).toFixed(2) : '-'}
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">장기 (1주+)</h4>
          <p className="text-sm text-white mb-2">
            {momentumData?.momentumScore > 70 ? '강세 지속 전망' :
             momentumData?.momentumScore < 30 ? '약세 지속 전망' :
             '중립 유지'}
          </p>
          <p className="text-xs text-gray-500">
            목표: {coinData ? (coinData.price * (momentumData?.momentumScore > 50 ? 1.15 : 0.85)).toFixed(2) : '-'}
          </p>
        </div>
      </div>

      {/* 체크리스트 */}
      <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/30">
        <h4 className="text-sm font-semibold text-purple-400 mb-3">실행 전 체크리스트</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" className="rounded" />
            <span>리스크 관리 계획 수립</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" className="rounded" />
            <span>손절/익절 레벨 설정</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" className="rounded" />
            <span>포지션 크기 계산 완료</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" className="rounded" />
            <span>시장 뉴스 확인</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" className="rounded" />
            <span>기술적 지표 재확인</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" className="rounded" />
            <span>자본금 비율 확인</span>
          </label>
        </div>
      </div>

      {/* 전략 요약 */}
      <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-400">AI 추천 신뢰도</h4>
          <span className="text-lg font-bold text-white">
            {momentumData ? Math.min(95, 50 + momentumData.momentumScore * 0.5).toFixed(0) : 50}%
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${momentumData ? Math.min(95, 50 + momentumData.momentumScore * 0.5) : 50}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          * AI 분석 기반 추천입니다. 투자 결정은 본인의 판단으로 하시기 바랍니다.
        </p>
      </div>
    </div>
  )
}