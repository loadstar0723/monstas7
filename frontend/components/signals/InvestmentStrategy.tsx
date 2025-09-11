'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaWallet, FaChartPie, FaUserShield, FaRocket, FaGraduationCap, FaChessKing, FaCrown, FaExclamationCircle } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { config } from '@/lib/config'

interface InvestmentTier {
  name: string
  range: string
  icon: JSX.Element
  color: string
  bgColor: string
  leverage: {
    safe: string
    moderate: string
    aggressive: string
  }
  strategy: {
    position: string
    stopLoss: string
    takeProfit: string
    riskPerTrade: string
  }
  tips: string[]
}

interface InvestmentStrategyProps {
  symbol?: string
  currentPrice?: number
  signalType?: string
  marketCondition?: 'bullish' | 'bearish' | 'neutral'
  volatility?: number
}

export default function InvestmentStrategy({ 
  symbol = 'BTC',
  currentPrice = 67000,
  signalType = 'general',
  marketCondition = 'neutral',
  volatility = 25
}: InvestmentStrategyProps) {
  const [selectedTier, setSelectedTier] = useState<number>(0)
  const [accountBalance, setAccountBalance] = useState<number>(10000)
  const [calculatedStrategy, setCalculatedStrategy] = useState<any>(null)

  // 투자금액별 티어 정의
  const investmentTiers: InvestmentTier[] = [
    {
      name: '초보자',
      range: '$100 - $1,000',
      icon: <FaGraduationCap className="text-green-500" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      leverage: {
        safe: '1x (현물)',
        moderate: '2-3x',
        aggressive: '5x 이하'
      },
      strategy: {
        position: '계좌의 5-${config.percentage.value10}',
        stopLoss: '3-${config.percentage.value5}',
        takeProfit: '5-${config.percentage.value10}',
        riskPerTrade: '계좌의 1-${config.percentage.value2}'
      },
      tips: [
        '소액으로 경험 쌓기 집중',
        '손절선 반드시 설정',
        '감정적 매매 금지',
        '매매일지 작성 필수'
      ]
    },
    {
      name: '일반 투자자',
      range: '$1,000 - $10,000',
      icon: <FaUserShield className="text-blue-500" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      leverage: {
        safe: '2-3x',
        moderate: '5-7x',
        aggressive: '10x 이하'
      },
      strategy: {
        position: '계좌의 10-${config.percentage.value20}',
        stopLoss: '2-${config.percentage.value3}',
        takeProfit: '7-${config.percentage.value15}',
        riskPerTrade: '계좌의 2-${config.percentage.value3}'
      },
      tips: [
        '분할 매수/매도 전략',
        '포트폴리오 분산',
        '기술적 분석 활용',
        '뉴스 모니터링'
      ]
    },
    {
      name: '숙련자',
      range: '$10,000 - $50,000',
      icon: <FaRocket className="text-purple-500" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      leverage: {
        safe: '3-5x',
        moderate: '10-15x',
        aggressive: '20x 이하'
      },
      strategy: {
        position: '계좌의 20-${config.percentage.value30}',
        stopLoss: '1.5-${config.percentage.value2}',
        takeProfit: '10-${config.percentage.value20}',
        riskPerTrade: '계좌의 3-${config.percentage.value5}'
      },
      tips: [
        '복합 전략 활용',
        '헤징 포지션 고려',
        '자동매매 도구 활용',
        '세금 최적화 전략'
      ]
    },
    {
      name: '전문가',
      range: '$50,000 - $250,000',
      icon: <FaChessKing className="text-orange-500" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      leverage: {
        safe: '5-10x',
        moderate: '15-25x',
        aggressive: '50x 이하'
      },
      strategy: {
        position: '계좌의 30-${config.percentage.value40}',
        stopLoss: '1-1.${config.percentage.value5}',
        takeProfit: '15-${config.percentage.value30}',
        riskPerTrade: '계좌의 5-${config.percentage.value7}'
      },
      tips: [
        '알고리즘 트레이딩',
        '크로스 익스체인지 차익',
        '옵션 전략 결합',
        '기관 동향 분석'
      ]
    },
    {
      name: 'VIP',
      range: '$250,000+',
      icon: <FaCrown className="text-yellow-500" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      leverage: {
        safe: '10-20x',
        moderate: '25-50x',
        aggressive: '100x+'
      },
      strategy: {
        position: '계좌의 40-${config.percentage.value50}',
        stopLoss: 'config.decimals.value5-${config.percentage.value1}',
        takeProfit: '20-${config.percentage.value50}',
        riskPerTrade: '계좌의 7-${config.percentage.value10}'
      },
      tips: [
        'OTC 거래 활용',
        '프라임 브로커 서비스',
        'DeFi 수익 농사',
        '벤처 투자 병행'
      ]
    }
  ]

  // 시그널별 특화 전략
  const getSignalSpecificStrategy = () => {
    const strategies: { [key: string]: any } = {
      'whale-tracker': {
        name: '고래 추적 전략',
        entry: '고래 매수 신호 확인 시',
        exit: '고래 매도 움직임 포착 시',
        leverage: '고래 규모에 비례 (최대 10x)',
        tips: ['대량 매수 후 30분 관찰', '청산 벽 확인', '오더북 깊이 체크']
      },
      'fear-greed': {
        name: '공포탐욕 역발상',
        entry: '극단적 공포(20 이하) 시 매수',
        exit: '극단적 탐욕(80 이상) 시 매도',
        leverage: '공포 시 높게, 탐욕 시 낮게',
        tips: ['역발상 투자', '시장 심리 반대', '장기 관점 유지']
      },
      'funding-rate': {
        name: '펀딩비 차익거래',
        entry: '펀딩비 극단값 시',
        exit: '펀딩비 정상화 시',
        leverage: '펀딩비 크기에 반비례',
        tips: ['8시간마다 체크', '롱숏 헤징', '펀딩 수익 복리']
      },
      'liquidation': {
        name: '청산 캐스케이드',
        entry: '대규모 청산 후 반등',
        exit: '청산 압력 해소 시',
        leverage: '청산 후 낮게 시작',
        tips: ['청산 맵 모니터링', '지지선 확인', '단계별 진입']
      },
      'arbitrage': {
        name: '차익거래 전략',
        entry: '스프레드 0.${config.percentage.value5} 이상',
        exit: '스프레드 수렴 시',
        leverage: '안정적 5-10x',
        tips: ['수수료 계산 필수', '실행 속도 중요', '자동화 권장']
      },
      'dex-flow': {
        name: 'DEX 자금 흐름',
        entry: 'TVL 급증 시그널',
        exit: '자금 유출 시작',
        leverage: 'TVL 증가율 기반',
        tips: ['가스비 고려', '슬리피지 설정', '유동성 풀 체크']
      },
      'social-sentiment': {
        name: '소셜 모멘텀',
        entry: '긍정 감성 급증',
        exit: 'FOMO 정점 신호',
        leverage: '감성 점수 기반',
        tips: ['허위 정보 필터링', '인플루언서 체크', '해시태그 추적']
      },
      'unusual-options': {
        name: '옵션 플로우',
        entry: '대규모 콜옵션 매수',
        exit: '풋옵션 증가 시',
        leverage: 'IV 기반 조정',
        tips: ['만기일 확인', 'Greeks 모니터링', '행사가 분석']
      }
    }

    return strategies[signalType] || strategies['whale-tracker']
  }

  // 포지션 크기 계산
  const calculatePositionSize = () => {
    const tier = investmentTiers[selectedTier]
    // "계좌의 10-${config.percentage.value20}" 형태에서 숫자만 추출
    const positionStr = tier.strategy.position.replace('계좌의 ', '').replace('%', '')
    const positionPercent = parseFloat(positionStr.split('-')[0]) || 10
    const positionSize = accountBalance * (positionPercent / 100)
    
    // 레버리지별 실제 거래 가능 금액
    const safeLeverage = tier.leverage.safe.includes('현물') ? 1 : parseInt(tier.leverage.safe.split('x')[0]) || 1
    const moderateLeverage = parseInt(tier.leverage.moderate.split('-')[1]) || parseInt(tier.leverage.moderate.split('x')[0]) || 5
    const aggressiveLeverage = parseInt(tier.leverage.aggressive.replace('x', '').replace(' 이하', '').replace('+', '')) || 10
    
    const leverages = {
      safe: safeLeverage,
      moderate: moderateLeverage,
      aggressive: aggressiveLeverage
    }

    // "계좌의 1-${config.percentage.value2}" 형태에서 숫자만 추출
    const riskStr = tier.strategy.riskPerTrade.replace('계좌의 ', '').replace('%', '')
    const riskPercent = parseFloat(riskStr.split('-')[0]) || 1
    const maxLoss = accountBalance * (riskPercent / 100)
    const stopLossPercent = parseFloat(tier.strategy.stopLoss.split('-')[0]) || 3

    setCalculatedStrategy({
      positionSize: isNaN(positionSize) ? 0 : positionSize,
      leverages,
      maxLoss: isNaN(maxLoss) ? 0 : maxLoss,
      stopLossPercent,
      numberOfCoins: isNaN(positionSize) ? 0 : positionSize / currentPrice,
      liquidationPrices: {
        safe: currentPrice * (1 - 100/leverages.safe/100),
        moderate: currentPrice * (1 - 100/leverages.moderate/100),
        aggressive: currentPrice * (1 - 100/leverages.aggressive/100)
      }
    })
  }

  useEffect(() => {
    calculatePositionSize()
  }, [selectedTier, accountBalance, currentPrice])

  const signalStrategy = getSignalSpecificStrategy()

  return (
    <div className="space-y-6">
      {/* 계좌 잔고 입력 */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaWallet className="text-purple-400" />
          투자금액별 레버리지 전략
        </h3>
        
        <div className="mb-6">
          <label className="text-sm text-gray-400 block mb-2">계좌 잔고 (USDT)</label>
          <input
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            placeholder="10000"
          />
        </div>

        {/* 투자 티어 선택 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {investmentTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: config.decimals.value98 }}
              onClick={() => setSelectedTier(index)}
              className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                selectedTier === index 
                  ? 'border-purple-500 bg-purple-900/20' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-purple-400/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {tier.icon}
                <div>
                  <div className={`font-semibold ${tier.color}`}>{tier.name}</div>
                  <div className="text-xs text-gray-400">{tier.range}</div>
                </div>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">안전:</span>
                  <span className="text-green-400">{tier.leverage.safe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">보통:</span>
                  <span className="text-yellow-400">{tier.leverage.moderate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">공격:</span>
                  <span className="text-red-400">{tier.leverage.aggressive}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 선택된 티어 상세 전략 */}
        {calculatedStrategy && (
          <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <FaChartPie className="text-purple-400" />
              {investmentTiers[selectedTier].name} 포지션 전략
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">추천 포지션 크기</div>
                <div className="text-xl font-bold text-white">
                  ${calculatedStrategy.positionSize.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {symbol} {safeFixed(calculatedStrategy.numberOfCoins, 4)}개
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-1">최대 손실 허용</div>
                <div className="text-xl font-bold text-red-400">
                  ${calculatedStrategy.maxLoss.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  계좌의 {investmentTiers[selectedTier].strategy.riskPerTrade}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="text-sm text-gray-400 mb-2">레버리지별 청산가격</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-green-900/30 rounded p-2">
                  <div className="text-green-400 font-semibold">안전 ({calculatedStrategy.leverages.safe}x)</div>
                  <div className="text-white">${calculatedStrategy.liquidationPrices.safe.toLocaleString()}</div>
                </div>
                <div className="bg-yellow-900/30 rounded p-2">
                  <div className="text-yellow-400 font-semibold">보통 ({calculatedStrategy.leverages.moderate}x)</div>
                  <div className="text-white">${calculatedStrategy.liquidationPrices.moderate.toLocaleString()}</div>
                </div>
                <div className="bg-red-900/30 rounded p-2">
                  <div className="text-red-400 font-semibold">공격 ({calculatedStrategy.leverages.aggressive}x)</div>
                  <div className="text-white">${calculatedStrategy.liquidationPrices.aggressive.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="text-sm text-gray-400 mb-2">리스크 관리 전략</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">손절선:</span>
                  <span className="text-red-400">{investmentTiers[selectedTier].strategy.stopLoss}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">익절선:</span>
                  <span className="text-green-400">{investmentTiers[selectedTier].strategy.takeProfit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">포지션:</span>
                  <span className="text-blue-400">{investmentTiers[selectedTier].strategy.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">리스크:</span>
                  <span className="text-orange-400">{investmentTiers[selectedTier].strategy.riskPerTrade}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="text-sm text-gray-400 mb-2">투자 팁</div>
              <ul className="space-y-1">
                {investmentTiers[selectedTier].tips.map((tip, index) => (
                  <li key={index} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-purple-400 mt-config.decimals.value5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 시그널별 특화 전략 */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartPie className="text-blue-400" />
          {signalStrategy.name}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">진입 시점</div>
            <div className="text-white font-semibold">{signalStrategy.entry}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">청산 시점</div>
            <div className="text-white font-semibold">{signalStrategy.exit}</div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <div className="text-sm text-gray-400 mb-1">레버리지 전략</div>
          <div className="text-white font-semibold">{signalStrategy.leverage}</div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <FaExclamationCircle className="text-yellow-400 mt-1" />
            <div>
              <div className="text-sm font-semibold text-yellow-300 mb-1">핵심 전략 포인트</div>
              <ul className="space-y-1">
                {signalStrategy.tips.map((tip: string, index: number) => (
                  <li key={index} className="text-xs text-yellow-200">• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 시장 상황별 조정 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-500/30">
        <div className="text-sm text-gray-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">현재 시장 상황:</span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              marketCondition === 'bullish' ? 'bg-green-500/20 text-green-400' :
              marketCondition === 'bearish' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {marketCondition === 'bullish' ? '상승장' : 
               marketCondition === 'bearish' ? '하락장' : '횡보장'}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            {marketCondition === 'bullish' && '상승장: 레버리지를 단계적으로 높이되, 과열 구간 주의'}
            {marketCondition === 'bearish' && '하락장: 레버리지를 낮추고, 숏 포지션 고려'}
            {marketCondition === 'neutral' && '횡보장: 낮은 레버리지로 스윙 트레이딩 권장'}
          </div>
        </div>
      </div>
    </div>
  )
}