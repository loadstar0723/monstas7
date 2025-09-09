'use client'

import { useState } from 'react'
import { FaBook, FaChartLine, FaCoins, FaLightbulb, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'

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

export default function MarketMakingGuide({ selectedCoin }: Props) {
  const [activeTab, setActiveTab] = useState('basic')

  const tabs = [
    { id: 'basic', label: '기본 개념', icon: <FaBook /> },
    { id: 'how', label: '작동 원리', icon: <FaChartLine /> },
    { id: 'strategy', label: '수익 전략', icon: <FaCoins /> },
    { id: 'tips', label: '실전 팁', icon: <FaLightbulb /> }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">마켓 메이킹이란?</h3>
              <p className="text-gray-300 mb-4">
                마켓 메이킹(Market Making)은 거래소에서 매수/매도 호가를 동시에 제시하여 
                유동성을 공급하고, 그 대가로 스프레드(매수-매도 가격 차이)에서 수익을 얻는 전략입니다.
              </p>
              <div className="bg-purple-600/20 rounded-lg p-4 border border-purple-600/30">
                <p className="text-purple-300">
                  <strong>{selectedCoin.name}</strong>의 경우, 높은 거래량과 변동성으로 인해 
                  마켓 메이킹 기회가 많습니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FaCheckCircle className="text-green-400" />
                  마켓 메이커의 역할
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• 시장에 유동성 제공</li>
                  <li>• 가격 안정성 기여</li>
                  <li>• 매수/매도 스프레드 유지</li>
                  <li>• 즉시 거래 가능하게 함</li>
                </ul>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FaExclamationTriangle className="text-yellow-400" />
                  주요 리스크
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• 재고 리스크 (inventory risk)</li>
                  <li>• 역선택 리스크 (adverse selection)</li>
                  <li>• 가격 변동 리스크</li>
                  <li>• 경쟁 마켓 메이커</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-6 border border-purple-600/30">
              <h4 className="text-lg font-semibold text-white mb-3">핵심 개념</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="text-purple-400 font-semibold mb-1">스프레드(Spread)</h5>
                  <p className="text-gray-300 text-sm">매수/매도 호가의 차이</p>
                </div>
                <div>
                  <h5 className="text-blue-400 font-semibold mb-1">유동성(Liquidity)</h5>
                  <p className="text-gray-300 text-sm">거래 가능한 물량의 규모</p>
                </div>
                <div>
                  <h5 className="text-green-400 font-semibold mb-1">재고(Inventory)</h5>
                  <p className="text-gray-300 text-sm">보유 중인 자산의 양</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'how':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">마켓 메이킹 작동 원리</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">호가 제시</h4>
                    <p className="text-gray-300">
                      현재 시장가 기준으로 상하에 매수/매도 주문을 동시에 걸어둡니다.
                      예: {selectedCoin.symbol} 현재가 $50,000 → 매수 $49,950, 매도 $50,050
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">주문 체결</h4>
                    <p className="text-gray-300">
                      시장 참가자가 즉시 거래를 원할 때 마켓 메이커의 호가에 체결됩니다.
                      스프레드만큼의 차익이 발생합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">재조정</h4>
                    <p className="text-gray-300">
                      체결 후 즉시 새로운 호가를 제시하여 지속적으로 유동성을 공급합니다.
                      재고 상황에 따라 호가를 조정합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">리스크 관리</h4>
                    <p className="text-gray-300">
                      포지션 편향을 방지하고, 재고를 중립적으로 유지하여 
                      가격 변동 리스크를 최소화합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg p-6 border border-orange-600/30">
              <h4 className="text-lg font-semibold text-white mb-3">예시: {selectedCoin.symbol} 마켓 메이킹</h4>
              <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
                <div className="text-green-400">매수 주문: {selectedCoin.symbol} 0.1개 @ $49,980</div>
                <div className="text-gray-400 text-center my-2">--- 현재가: $50,000 ---</div>
                <div className="text-red-400">매도 주문: {selectedCoin.symbol} 0.1개 @ $50,020</div>
                <div className="mt-3 text-yellow-300">스프레드: $40 (0.08%)</div>
              </div>
            </div>
          </div>
        )

      case 'strategy':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">마켓 메이킹 수익 전략</h3>
              
              <div className="space-y-4">
                <div className="bg-green-600/20 rounded-lg p-4 border border-green-600/30">
                  <h4 className="text-green-400 font-semibold mb-2">1. 스프레드 수익 최적화</h4>
                  <p className="text-gray-300 mb-2">
                    거래량과 경쟁 상황을 고려하여 최적의 스프레드를 설정합니다.
                  </p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 높은 변동성 → 넓은 스프레드</li>
                    <li>• 높은 경쟁 → 좁은 스프레드</li>
                    <li>• {selectedCoin.symbol} 권장: 0.05% ~ 0.15%</li>
                  </ul>
                </div>

                <div className="bg-blue-600/20 rounded-lg p-4 border border-blue-600/30">
                  <h4 className="text-blue-400 font-semibold mb-2">2. 재고 관리 전략</h4>
                  <p className="text-gray-300 mb-2">
                    포지션 편향을 방지하여 리스크를 최소화합니다.
                  </p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 매수 편향 시 → 매도 호가 낮춤</li>
                    <li>• 매도 편향 시 → 매수 호가 높임</li>
                    <li>• 목표 재고: 중립(±5% 이내)</li>
                  </ul>
                </div>

                <div className="bg-purple-600/20 rounded-lg p-4 border border-purple-600/30">
                  <h4 className="text-purple-400 font-semibold mb-2">3. 거래량 기반 전략</h4>
                  <p className="text-gray-300 mb-2">
                    시장 활동성에 따라 전략을 조정합니다.
                  </p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 높은 거래량 → 적극적 호가 제시</li>
                    <li>• 낮은 거래량 → 보수적 접근</li>
                    <li>• 피크 시간대 집중 운영</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-3">수익 계산 예시</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>일일 거래 횟수:</span>
                    <span>200회</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>평균 스프레드:</span>
                    <span>0.1%</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>거래당 수량:</span>
                    <span>0.1 {selectedCoin.symbol}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between text-green-400 font-semibold">
                      <span>예상 일일 수익:</span>
                      <span>~$1,000</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-3">리스크 한도</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>최대 포지션:</span>
                    <span>±5 {selectedCoin.symbol}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>손절 기준:</span>
                    <span>-2%</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>일일 손실 한도:</span>
                    <span>$5,000</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between text-yellow-400 font-semibold">
                      <span>리스크/수익 비율:</span>
                      <span>1:5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'tips':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">마켓 메이킹 실전 팁</h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="text-green-400 font-semibold mb-2">✅ 성공 요소</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• <strong>빠른 실행:</strong> 저지연(low-latency) 시스템 구축</li>
                    <li>• <strong>정확한 가격 예측:</strong> 실시간 시장 데이터 분석</li>
                    <li>• <strong>효율적인 자금 관리:</strong> 레버리지 활용 및 자본 효율성</li>
                    <li>• <strong>지속적인 모니터링:</strong> 24/7 시스템 감시</li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="text-red-400 font-semibold mb-2">❌ 피해야 할 실수</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• <strong>과도한 재고 보유:</strong> 한쪽으로 치우친 포지션</li>
                    <li>• <strong>넓은 스프레드:</strong> 경쟁력 없는 호가 제시</li>
                    <li>• <strong>리스크 관리 부재:</strong> 손절선 미설정</li>
                    <li>• <strong>시장 상황 무시:</strong> 뉴스나 이벤트 간과</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-6 border border-purple-600/30">
              <h4 className="text-lg font-semibold text-white mb-3">{selectedCoin.symbol} 특화 팁</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-purple-400 font-semibold mb-2">최적 거래 시간</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 아시아 세션: 09:00-17:00 KST</li>
                    <li>• 유럽 세션: 16:00-01:00 KST</li>
                    <li>• 미국 세션: 23:00-07:00 KST</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-pink-400 font-semibold mb-2">주의 이벤트</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• FOMC 발표</li>
                    <li>• 대규모 옵션 만기일</li>
                    <li>• 주요 경제 지표 발표</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">고급 전략</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-blue-400 font-semibold mb-1">1. 다이나믹 스프레드</h5>
                  <p className="text-gray-300 text-sm">
                    변동성, 거래량, 시간대에 따라 스프레드를 자동 조정
                  </p>
                </div>
                <div>
                  <h5 className="text-green-400 font-semibold mb-1">2. 크로스 거래소 차익</h5>
                  <p className="text-gray-300 text-sm">
                    여러 거래소 간 가격 차이를 활용한 추가 수익 창출
                  </p>
                </div>
                <div>
                  <h5 className="text-yellow-400 font-semibold mb-1">3. 페어 트레이딩 결합</h5>
                  <p className="text-gray-300 text-sm">
                    상관관계 높은 자산 간 스프레드 거래 병행
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaBook className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">마켓 메이킹 가이드</h2>
          <p className="text-gray-400">{selectedCoin.name} 마켓 메이킹 전략 가이드</p>
        </div>
      </div>
      
      {/* 탭 메뉴 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  )
}