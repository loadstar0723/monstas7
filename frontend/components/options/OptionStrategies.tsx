'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, TrendingDown, Shield, Zap } from 'lucide-react'

interface Strategy {
  name: string
  description: string
  setup: string[]
  maxProfit: string
  maxLoss: string
  breakeven: string
  marketOutlook: string
  icon: any
  color: string
}

interface Props {
  coin: string
  spotPrice: number
}

export default function OptionStrategies({ coin, spotPrice }: Props) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('long-call')

  const strategies: Record<string, Strategy> = {
    'long-call': {
      name: '롱 콜 (Long Call)',
      description: '콜 옵션을 매수하여 상승장에서 수익을 추구하는 전략',
      setup: ['콜 옵션 매수'],
      maxProfit: '무제한',
      maxLoss: '프리미엄',
      breakeven: '행사가 + 프리미엄',
      marketOutlook: '강세',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    'long-put': {
      name: '롱 풋 (Long Put)',
      description: '풋 옵션을 매수하여 하락장에서 수익을 추구하는 전략',
      setup: ['풋 옵션 매수'],
      maxProfit: '행사가 - 프리미엄',
      maxLoss: '프리미엄',
      breakeven: '행사가 - 프리미엄',
      marketOutlook: '약세',
      icon: TrendingDown,
      color: 'text-red-400'
    },
    'covered-call': {
      name: '커버드 콜 (Covered Call)',
      description: '기초자산을 보유하면서 콜 옵션을 매도하여 추가 수익 창출',
      setup: ['기초자산 보유', '콜 옵션 매도'],
      maxProfit: '(행사가 - 매수가) + 프리미엄',
      maxLoss: '매수가 - 프리미엄',
      breakeven: '매수가 - 프리미엄',
      marketOutlook: '중립/약강세',
      icon: Shield,
      color: 'text-blue-400'
    },
    'protective-put': {
      name: '프로텍티브 풋 (Protective Put)',
      description: '기초자산을 보유하면서 풋 옵션을 매수하여 하락 리스크 헤지',
      setup: ['기초자산 보유', '풋 옵션 매수'],
      maxProfit: '무제한',
      maxLoss: '(매수가 - 행사가) + 프리미엄',
      breakeven: '매수가 + 프리미엄',
      marketOutlook: '강세 (하락 보험)',
      icon: Shield,
      color: 'text-purple-400'
    },
    'bull-spread': {
      name: '불 스프레드 (Bull Spread)',
      description: '낮은 행사가 콜 매수, 높은 행사가 콜 매도로 제한된 상승 수익',
      setup: ['낮은 행사가 콜 매수', '높은 행사가 콜 매도'],
      maxProfit: '행사가 차이 - 순프리미엄',
      maxLoss: '순프리미엄',
      breakeven: '낮은 행사가 + 순프리미엄',
      marketOutlook: '제한적 강세',
      icon: TrendingUp,
      color: 'text-orange-400'
    },
    'bear-spread': {
      name: '베어 스프레드 (Bear Spread)',
      description: '높은 행사가 풋 매수, 낮은 행사가 풋 매도로 제한된 하락 수익',
      setup: ['높은 행사가 풋 매수', '낮은 행사가 풋 매도'],
      maxProfit: '행사가 차이 - 순프리미엄',
      maxLoss: '순프리미엄',
      breakeven: '높은 행사가 - 순프리미엄',
      marketOutlook: '제한적 약세',
      icon: TrendingDown,
      color: 'text-pink-400'
    },
    'straddle': {
      name: '스트래들 (Straddle)',
      description: '같은 행사가의 콜과 풋을 동시에 매수하여 큰 변동성에 베팅',
      setup: ['ATM 콜 매수', 'ATM 풋 매수'],
      maxProfit: '무제한',
      maxLoss: '총 프리미엄',
      breakeven: '행사가 ± 총 프리미엄',
      marketOutlook: '높은 변동성 예상',
      icon: Zap,
      color: 'text-yellow-400'
    },
    'iron-condor': {
      name: '아이언 컨도르 (Iron Condor)',
      description: '불 풋 스프레드 + 베어 콜 스프레드로 횡보장에서 수익',
      setup: [
        'OTM 풋 매도',
        '더 OTM 풋 매수',
        'OTM 콜 매도', 
        '더 OTM 콜 매수'
      ],
      maxProfit: '순 프리미엄',
      maxLoss: '행사가 차이 - 순 프리미엄',
      breakeven: '풋 매도 행사가 - 순 프리미엄, 콜 매도 행사가 + 순 프리미엄',
      marketOutlook: '낮은 변동성 예상',
      icon: Shield,
      color: 'text-indigo-400'
    }
  }

  const currentStrategy = strategies[selectedStrategy]
  const StrategyIcon = currentStrategy.icon

  // 전략 시뮬레이터
  const [strikePrice, setStrikePrice] = useState(spotPrice)
  const [premium, setPremium] = useState(spotPrice * 0.02) // 2% 가정
  const [quantity, setQuantity] = useState(1)

  // 손익 계산
  const calculatePnL = (futurePrice: number) => {
    switch (selectedStrategy) {
      case 'long-call':
        if (futurePrice > strikePrice) {
          return (futurePrice - strikePrice - premium) * quantity
        }
        return -premium * quantity
        
      case 'long-put':
        if (futurePrice < strikePrice) {
          return (strikePrice - futurePrice - premium) * quantity
        }
        return -premium * quantity
        
      case 'covered-call':
        const stockPnL = (futurePrice - spotPrice) * quantity
        const optionPnL = futurePrice > strikePrice 
          ? -(futurePrice - strikePrice) * quantity + premium * quantity
          : premium * quantity
        return stockPnL + optionPnL
        
      default:
        return 0
    }
  }

  return (
    <div className="space-y-6">
      {/* 전략 선택 */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">옵션 전략 선택</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(strategies).map(([key, strategy]) => {
            const Icon = strategy.icon
            return (
              <button
                key={key}
                onClick={() => setSelectedStrategy(key)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedStrategy === key
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${strategy.color} mb-2`} />
                <p className="text-sm font-medium">{strategy.name.split(' ')[0]}</p>
              </button>
            )
          })}
        </div>

        {/* 선택된 전략 상세 */}
        <div className="bg-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <StrategyIcon className={`w-8 h-8 ${currentStrategy.color}`} />
            <div>
              <h4 className="text-lg font-bold">{currentStrategy.name}</h4>
              <p className="text-sm text-gray-400">시장 전망: {currentStrategy.marketOutlook}</p>
            </div>
          </div>

          <p className="text-gray-300 mb-4">{currentStrategy.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold mb-2">전략 구성</h5>
              <ul className="space-y-1">
                {currentStrategy.setup.map((step, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-purple-400">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">최대 이익</span>
                <span className="text-green-400">{currentStrategy.maxProfit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">최대 손실</span>
                <span className="text-red-400">{currentStrategy.maxLoss}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">손익분기점</span>
                <span className="text-yellow-400">{currentStrategy.breakeven}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 전략 시뮬레이터 */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">전략 시뮬레이터</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">행사가</label>
            <input
              type="number"
              value={strikePrice}
              onChange={(e) => setStrikePrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">프리미엄</label>
            <input
              type="number"
              value={premium}
              onChange={(e) => setPremium(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">수량</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
            />
          </div>
        </div>

        {/* 시나리오 분석 */}
        <div className="space-y-2">
          <h4 className="font-semibold mb-2">시나리오 분석</h4>
          {[-30, -20, -10, 0, 10, 20, 30].map(percent => {
            const futurePrice = spotPrice * (1 + percent / 100)
            const pnl = calculatePnL(futurePrice)
            const pnlPercent = (pnl / (premium * quantity)) * 100
            
            return (
              <div key={percent} className="flex items-center justify-between p-2 rounded bg-gray-700">
                <span className="text-sm">
                  {percent > 0 ? '+' : ''}{percent}% (${futurePrice.toFixed(2)})
                </span>
                <span className={`font-semibold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${pnl.toFixed(2)} ({pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
          <p className="text-sm text-blue-400">
            💡 실제 거래 시에는 수수료, 슬리피지, 시장 상황 등을 고려해야 합니다.
          </p>
        </div>
      </div>

      {/* 실전 팁 */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">실전 트레이딩 팁</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold mb-2">진입 시점</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• IV가 역사적 평균보다 낮을 때 매수</li>
              <li>• IV가 높을 때 매도 전략 고려</li>
              <li>• 중요 이벤트 전후 변동성 변화 주목</li>
            </ul>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold mb-2">리스크 관리</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 전체 자본의 5-10%만 옵션에 배분</li>
              <li>• 손절선 설정 필수 (보통 -50%)</li>
              <li>• 만기일 가까워질수록 세타 리스크 증가</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}