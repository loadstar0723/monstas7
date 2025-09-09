'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaBook, FaChartLine, FaExchangeAlt, FaLightbulb, FaShieldAlt, FaRocket, FaCalculator, FaClock } from 'react-icons/fa'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface Props {
  selectedCoin: CoinInfo
}

export default function ArbitrageConceptGuide({ selectedCoin }: Props) {
  const [activeTab, setActiveTab] = useState('basic')
  
  const tabs = [
    { id: 'basic', label: '기본 개념', icon: <FaBook /> },
    { id: 'types', label: '차익거래 유형', icon: <FaExchangeAlt /> },
    { id: 'strategy', label: '실전 전략', icon: <FaChartLine /> },
    { id: 'tips', label: '수익 극대화', icon: <FaLightbulb /> }
  ]
  
  return (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaBook className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">차익거래 완벽 가이드</h2>
          <p className="text-gray-400">개념부터 실전까지 {selectedCoin.name} 차익거래의 모든 것</p>
        </div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? `${selectedCoin.bgColor} ${selectedCoin.color} border border-current`
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* 탭 컨텐츠 */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* 기본 개념 */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* 차익거래란? */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>차익거래(Arbitrage)란?</h3>
              <p className="text-gray-300 mb-4">
                차익거래는 동일한 자산이 서로 다른 거래소에서 다른 가격으로 거래될 때 발생하는 가격 차이를 이용해 
                무위험 수익을 창출하는 거래 전략입니다.
              </p>
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-2">예시: {selectedCoin.name} 차익거래</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-gray-400">거래소 A</p>
                    <p className="text-2xl font-bold text-green-400">$45,000</p>
                    <p className="text-sm text-gray-500">매수</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <FaExchangeAlt className="text-3xl text-gray-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">거래소 B</p>
                    <p className="text-2xl font-bold text-red-400">$45,500</p>
                    <p className="text-sm text-gray-500">매도</p>
                  </div>
                </div>
                <p className="text-center mt-4 text-yellow-400 font-bold">수익: $500 (1.1%)</p>
              </div>
            </div>
            
            {/* 핵심 원리 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <FaShieldAlt className={`text-2xl ${selectedCoin.color}`} />
                  <h4 className="text-lg font-bold">무위험 수익</h4>
                </div>
                <p className="text-gray-300">
                  가격 차이를 이용한 즉각적인 수익 실현으로 시장 방향성에 영향받지 않는 안정적인 수익 창출
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <FaClock className={`text-2xl ${selectedCoin.color}`} />
                  <h4 className="text-lg font-bold">타이밍이 핵심</h4>
                </div>
                <p className="text-gray-300">
                  가격 차이는 빠르게 수렴하므로 신속한 실행이 필수. 자동화 봇 활용이 경쟁력의 핵심
                </p>
              </div>
            </div>
            
            {/* 수익 공식 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaCalculator className={selectedCoin.color} />
                수익 계산 공식
              </h4>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                <p className="text-green-400 mb-2">총 수익 = (매도가 - 매수가) × 거래량</p>
                <p className="text-yellow-400 mb-2">순수익 = 총 수익 - (거래 수수료 + 전송 수수료)</p>
                <p className="text-gray-400">수익률(%) = (순수익 ÷ 투자금) × 100</p>
              </div>
            </div>
          </div>
        )}
        
        {/* 차익거래 유형 */}
        {activeTab === 'types' && (
          <div className="space-y-6">
            {/* 거래소간 차익거래 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>
                1. 거래소간 차익거래 (Exchange Arbitrage)
              </h3>
              <div className="space-y-4">
                <p className="text-gray-300">
                  가장 일반적인 차익거래 유형으로, 서로 다른 거래소 간 가격 차이를 활용합니다.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-green-400 font-bold mb-2">장점</p>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• 기회가 자주 발생</li>
                      <li>• 수익 실현이 빠름</li>
                      <li>• 리스크가 낮음</li>
                    </ul>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-red-400 font-bold mb-2">단점</p>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• 전송 시간 필요</li>
                      <li>• 수수료 고려 필수</li>
                      <li>• 경쟁이 치열함</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 삼각 차익거래 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>
                2. 삼각 차익거래 (Triangular Arbitrage)
              </h3>
              <p className="text-gray-300 mb-4">
                단일 거래소 내에서 3개 통화 쌍의 가격 불균형을 활용하는 전략입니다.
              </p>
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">예시 경로</p>
                <div className="flex items-center justify-center gap-2 text-lg font-mono">
                  <span className="text-yellow-400">USDT</span>
                  <span className="text-gray-500">→</span>
                  <span className={selectedCoin.color}>{selectedCoin.symbol}</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-blue-400">ETH</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-yellow-400">USDT</span>
                </div>
                <p className="text-center mt-3 text-gray-400 text-sm">
                  환율 차이로 인해 원금보다 많은 USDT로 돌아옴
                </p>
              </div>
            </div>
            
            {/* 펀딩 차익거래 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>
                3. 펀딩 비율 차익거래 (Funding Arbitrage)
              </h3>
              <p className="text-gray-300 mb-4">
                선물과 현물 간 가격 차이와 펀딩 비율을 활용하는 전략입니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="font-bold mb-2">롱 포지션 펀딩 &gt; 0</p>
                  <p className="text-sm text-gray-300">• 현물 매수 + 선물 숏</p>
                  <p className="text-sm text-green-400">• 펀딩 수수료 수취</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="font-bold mb-2">숏 포지션 펀딩 &lt; 0</p>
                  <p className="text-sm text-gray-300">• 현물 매도 + 선물 롱</p>
                  <p className="text-sm text-green-400">• 역펀딩 수수료 수취</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 실전 전략 */}
        {activeTab === 'strategy' && (
          <div className="space-y-6">
            {/* 단계별 실행 가이드 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>
                {selectedCoin.name} 차익거래 실행 가이드
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: '거래소 계정 준비',
                    content: '최소 3개 이상의 주요 거래소에 계정 개설 및 KYC 완료'
                  },
                  {
                    step: 2,
                    title: '자금 분산 배치',
                    content: '각 거래소에 균등하게 자금 분산 (USDT + 코인)'
                  },
                  {
                    step: 3,
                    title: '가격 모니터링',
                    content: '실시간 가격 차이 감지 시스템 구축 (API 활용)'
                  },
                  {
                    step: 4,
                    title: '기회 포착',
                    content: '수수료 고려 후 0.5% 이상 차익 발생 시 실행'
                  },
                  {
                    step: 5,
                    title: '동시 주문 실행',
                    content: '저가 거래소 매수 + 고가 거래소 매도 동시 진행'
                  },
                  {
                    step: 6,
                    title: '리밸런싱',
                    content: '거래 후 각 거래소 자금 균형 맞추기'
                  }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className={`w-10 h-10 ${selectedCoin.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className={`font-bold ${selectedCoin.color}`}>{item.step}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 리스크 관리 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>리스크 관리 전략</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="font-bold mb-2 text-yellow-400">주의사항</h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>• 전송 중 가격 변동 리스크</li>
                    <li>• 거래소 출금 지연/중단</li>
                    <li>• 슬리피지로 인한 손실</li>
                    <li>• 네트워크 수수료 급증</li>
                  </ul>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="font-bold mb-2 text-green-400">대응 방안</h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>• 충분한 마진 확보 (1% 이상)</li>
                    <li>• 여러 거래소 자금 분산</li>
                    <li>• 시장가 주문 활용</li>
                    <li>• 자동화 시스템 구축</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 수익 극대화 팁 */}
        {activeTab === 'tips' && (
          <div className="space-y-6">
            {/* 프로 팁 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>
                프로 트레이더의 {selectedCoin.name} 차익거래 팁
              </h3>
              <div className="space-y-4">
                {[
                  {
                    icon: <FaRocket />,
                    title: '자동화가 핵심',
                    tip: 'API를 활용한 봇 트레이딩으로 24시간 기회 포착. 수동 거래로는 한계가 있음'
                  },
                  {
                    icon: <FaClock />,
                    title: '골든 타임 활용',
                    tip: '한국 시간 새벽 2-6시, 미국 장 마감 전후로 차익거래 기회가 많이 발생'
                  },
                  {
                    icon: <FaShieldAlt />,
                    title: '안전 마진 확보',
                    tip: '최소 0.8% 이상의 스프레드에서만 진입. 수수료와 슬리피지 고려 필수'
                  },
                  {
                    icon: <FaChartLine />,
                    title: '거래량 체크',
                    tip: '양 거래소 모두 충분한 유동성이 있는지 확인. 대량 거래 시 가격 영향 주의'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className={`text-2xl ${selectedCoin.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 수익률 향상 전략 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>수익률 향상 전략</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-3 text-yellow-400">초급자 전략</h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>• 대형 거래소 위주로 시작</li>
                    <li>• 1% 이상 차익에만 진입</li>
                    <li>• 소액으로 테스트 후 증액</li>
                    <li>• 수동 모니터링으로 학습</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-3 text-green-400">고급자 전략</h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>• 10개 이상 거래소 연동</li>
                    <li>• 0.3% 차익도 고속 실행</li>
                    <li>• 멀티 코인 동시 모니터링</li>
                    <li>• AI 기반 예측 시스템 활용</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* 수익 시뮬레이션 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>월 수익 시뮬레이션</h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-gray-400 text-sm">투자금</p>
                    <p className="text-2xl font-bold text-white">$10,000</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">일 평균 기회</p>
                    <p className="text-2xl font-bold text-yellow-400">3-5회</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">회당 순수익</p>
                    <p className="text-2xl font-bold text-green-400">0.5-1%</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-center">
                    <span className="text-gray-400">예상 월 수익: </span>
                    <span className="text-3xl font-bold text-green-400">$1,500 - $3,000</span>
                    <span className="text-gray-400"> (15-30%)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}