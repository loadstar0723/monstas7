'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Coin {
  symbol: string
  name: string
  color: string
}

interface MarketData {
  price: number
  zScore: number
  rsi: number
}

interface StrategyGuideProps {
  coin: Coin
  marketData: MarketData | null
}

export default function StrategyGuide({ coin, marketData }: StrategyGuideProps) {
  const [activeTab, setActiveTab] = useState('basic')

  const tabs = [
    { id: 'basic', label: '기본 전략', icon: '📖' },
    { id: 'advanced', label: '고급 전략', icon: '🎓' },
    { id: 'tips', label: '실전 팁', icon: '💡' },
    { id: 'mistakes', label: '주의사항', icon: '⚠️' }
  ]

  const content = {
    basic: (
      <div className="space-y-4">
        <div className="bg-black/30 rounded-lg p-4">
          <h4 className="text-purple-400 font-medium mb-3">평균회귀 기본 전략</h4>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">1.</span>
              <div>
                <strong>진입 시점</strong>
                <p className="text-gray-400 mt-1">
                  {coin.name}이 20일 이동평균에서 10% 이상 이탈하거나,
                  Z-Score가 -2 이하로 떨어질 때 매수 진입
                </p>
              </div>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">2.</span>
              <div>
                <strong>포지션 크기</strong>
                <p className="text-gray-400 mt-1">
                  총 자본의 5-10%를 한 번의 거래에 할당.
                  변동성이 높을 때는 5%, 낮을 때는 10%까지 가능
                </p>
              </div>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">3.</span>
              <div>
                <strong>목표 설정</strong>
                <p className="text-gray-400 mt-1">
                  20일 이동평균 도달 시 청산.
                  일반적으로 3-5% 수익 목표
                </p>
              </div>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">4.</span>
              <div>
                <strong>손절 설정</strong>
                <p className="text-gray-400 mt-1">
                  진입가 대비 -3% 손절선 설정.
                  트렌드 전환 시 즉시 청산
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    ),
    advanced: (
      <div className="space-y-4">
        <div className="bg-black/30 rounded-lg p-4">
          <h4 className="text-blue-400 font-medium mb-3">고급 평균회귀 기법</h4>
          <div className="space-y-3">
            <div>
              <h5 className="text-white font-medium mb-2">🌐 멀티 타임프레임 분석</h5>
              <p className="text-sm text-gray-400">
                4시간, 일봉, 주봉 차트를 동시에 분석하여
                모든 시간대에서 과매도 신호가 나타날 때만 진입
              </p>
            </div>
            <div>
              <h5 className="text-white font-medium mb-2">🔄 다이나믹 포지션 조정</h5>
              <p className="text-sm text-gray-400">
                Z-Score가 -3 이하로 떨어지면 포지션 추가 (피라미딩).
                단, 총 포지션은 자본의 20% 이내로 제한
              </p>
            </div>
            <div>
              <h5 className="text-white font-medium mb-2">🎯 복합 지표 활용</h5>
              <p className="text-sm text-gray-400">
                Z-Score + RSI + 볼린저밴드 + MACD를 종합하여
                3개 이상 지표가 동시에 신호를 줄 때만 진입
              </p>
            </div>
            <div>
              <h5 className="text-white font-medium mb-2">⏰ 타이밍 최적화</h5>
              <p className="text-sm text-gray-400">
                아시아 시장 마감 직전이나 미국 시장 개장 직후는 피하기.
                변동성이 낮은 유럽 시간대가 유리
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    tips: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg p-4 border border-green-700/30">
          <h4 className="text-green-400 font-medium mb-3">✅ 성공적인 평균회귀 팁</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>인내심 갖기:</strong> 평균회귀는 시간이 걸림. 성급한 진입 금지</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>작은 포지션:</strong> 처음에는 작은 금액으로 연습</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>기록 유지:</strong> 모든 거래를 기록하고 분석</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>시장 상황:</strong> 횡보장에서만 사용, 트렌드장에서는 피하기</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>분산 투자:</strong> 여러 코인에 나누어 평균회귀 적용</span>
            </li>
          </ul>
        </div>
      </div>
    ),
    mistakes: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-lg p-4 border border-red-700/30">
          <h4 className="text-red-400 font-medium mb-3">❌ 피해야 할 실수</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-red-400">×</span>
              <span><strong>강한 트렌드 무시:</strong> 상승/하락 트렌드가 강할 때 평균회귀 기대 금지</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-400">×</span>
              <span><strong>과도한 레버리지:</strong> 평균회귀는 소폭 이동. 레버리지 2배 이내</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-400">×</span>
              <span><strong>손절 미설정:</strong> 평균회귀 실패 시 큰 손실 가능</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-400">×</span>
              <span><strong>뉴스 이벤트:</strong> 중요 발표 전후 평균회귀 기대 금지</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-400">×</span>
              <span><strong>감정적 거래:</strong> 지표와 시스템을 무시한 충동 거래</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6">평균회귀 전략 가이드</h3>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {content[activeTab as keyof typeof content]}
        </motion.div>
      </AnimatePresence>

      {/* 현재 시장 적용 */}
      {marketData && (
        <div className="mt-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-700/30">
          <h4 className="text-purple-400 font-medium mb-2">🎯 현재 {coin.name} 적용 전략</h4>
          <p className="text-sm text-gray-300">
            {marketData.zScore < -2 
              ? `Z-Score가 ${marketData.zScore.toFixed(2)}로 강한 과매도 상태입니다. 자본의 10%까지 매수 가능한 시점입니다.`
              : marketData.zScore < -1
              ? `Z-Score가 ${marketData.zScore.toFixed(2)}로 약한 과매도 상태입니다. 자본의 5% 정도로 소량 매수를 고려해볼 수 있습니다.`
              : marketData.zScore > 2
              ? `Z-Score가 ${marketData.zScore.toFixed(2)}로 과매수 상태입니다. 보유 포지션이 있다면 일부 또는 전량 청산을 고려하세요.`
              : `현재 Z-Score가 ${marketData.zScore.toFixed(2)}로 중립 구간입니다. 평균회귀 신호를 기다리며 관망하세요.`
            }
          </p>
        </div>
      )}
    </div>
  )
}