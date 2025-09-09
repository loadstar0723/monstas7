'use client'

import { useState } from 'react'
import { FaBook, FaChartLine, FaBalanceScale, FaLightbulb } from 'react-icons/fa'

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

export default function DCAConceptGuide({ selectedCoin }: Props) {
  const [activeTab, setActiveTab] = useState('concept')

  const tabs = [
    { id: 'concept', label: '개념', icon: <FaBook /> },
    { id: 'strategy', label: '전략', icon: <FaChartLine /> },
    { id: 'comparison', label: '비교', icon: <FaBalanceScale /> },
    { id: 'tips', label: '팁', icon: <FaLightbulb /> }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'concept':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">DCA란 무엇인가?</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                DCA(Dollar Cost Averaging, 달러 비용 평균법)는 정해진 간격으로 동일한 금액을 투자하는 전략입니다. 
                {selectedCoin.name}에 매주 $100씩 투자한다면, 가격이 높을 때는 적게, 낮을 때는 많이 매수하게 됩니다.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h5 className="text-purple-400 font-semibold mb-2">핵심 원리</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span className="text-gray-300">시장 타이밍을 예측하지 않고 꾸준히 투자</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span className="text-gray-300">평균 매수 가격을 낮춰 변동성 위험 감소</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span className="text-gray-300">심리적 부담 없이 기계적으로 투자</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4">
                <h5 className="text-green-400 font-semibold mb-2">장점</h5>
                <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
                  <li>• 시장 변동성 완화</li>
                  <li>• 감정적 투자 방지</li>
                  <li>• 초보자도 쉽게 시작</li>
                  <li>• 자동화 가능</li>
                </ul>
              </div>
              <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4">
                <h5 className="text-red-400 font-semibold mb-2">단점</h5>
                <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
                  <li>• 상승장에서 수익률 제한</li>
                  <li>• 하락장 지속 시 손실 누적</li>
                  <li>• 수수료 누적</li>
                  <li>• 자금 효율성 낮음</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'strategy':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">DCA 전략 유형</h4>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-blue-400 font-semibold">표준 DCA</h5>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">추천</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">정해진 간격으로 동일한 금액 투자</p>
                <div className="bg-gray-900 rounded p-3">
                  <code className="text-xs text-green-400">
                    매주 월요일 {selectedCoin.symbol} $100 매수
                  </code>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-yellow-400 font-semibold">가치 평균법 (VA)</h5>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">중급</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">목표 포트폴리오 가치에 맞춰 투자 금액 조정</p>
                <div className="bg-gray-900 rounded p-3">
                  <code className="text-xs text-green-400">
                    목표: 매월 $1,000 증가<br/>
                    현재 가치 $800 → $200 추가 투자
                  </code>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-purple-400 font-semibold">동적 DCA</h5>
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">고급</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">시장 상황에 따라 투자 금액 조절</p>
                <div className="bg-gray-900 rounded p-3">
                  <code className="text-xs text-green-400">
                    RSI {'<'} 30: $200 투자<br/>
                    RSI 30-70: $100 투자<br/>
                    RSI {'>'} 70: $50 투자
                  </code>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-red-400 font-semibold">마틴게일 DCA</h5>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">위험</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">가격 하락 시 투자 금액 2배 증가</p>
                <div className="bg-gray-900 rounded p-3">
                  <code className="text-xs text-green-400">
                    -10% 하락: $100 → $200<br/>
                    -20% 하락: $200 → $400<br/>
                    주의: 자금 소진 위험
                  </code>
                </div>
              </div>
            </div>
          </div>
        )

      case 'comparison':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-2">일괄 투자 vs DCA</h4>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-300">항목</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-300">일괄 투자</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-300">DCA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-300">상승장 수익률</td>
                    <td className="px-4 py-3 text-center text-green-400">높음</td>
                    <td className="px-4 py-3 text-center text-yellow-400">보통</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-300">하락장 위험</td>
                    <td className="px-4 py-3 text-center text-red-400">높음</td>
                    <td className="px-4 py-3 text-center text-green-400">낮음</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-300">심리적 부담</td>
                    <td className="px-4 py-3 text-center text-red-400">높음</td>
                    <td className="px-4 py-3 text-center text-green-400">낮음</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-300">자금 효율성</td>
                    <td className="px-4 py-3 text-center text-green-400">높음</td>
                    <td className="px-4 py-3 text-center text-yellow-400">보통</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-4">
                <h5 className="text-blue-400 font-semibold mb-2">일괄 투자 적합 상황</h5>
                <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
                  <li>• 명확한 상승 트렌드</li>
                  <li>• 대규모 자금 보유</li>
                  <li>• 리스크 감수 가능</li>
                  <li>• 장기 투자 계획</li>
                </ul>
              </div>
              <div className="bg-purple-600/20 border border-purple-600/30 rounded-lg p-4">
                <h5 className="text-purple-400 font-semibold mb-2">DCA 적합 상황</h5>
                <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
                  <li>• 시장 방향성 불확실</li>
                  <li>• 정기적인 수입 있음</li>
                  <li>• 위험 회피 성향</li>
                  <li>• 투자 초보자</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'tips':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-2">{selectedCoin.name} DCA 실전 팁</h4>
            
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-4 border border-purple-600/30">
                <h5 className="text-purple-400 font-semibold mb-2">🎯 최적 투자 주기</h5>
                <p className="text-gray-300 text-sm mb-2">
                  {selectedCoin.symbol === 'BTC' ? '월간 투자 추천 - 장기 가치 저장' :
                   selectedCoin.symbol === 'ETH' ? '격주 투자 추천 - 중기 성장 포착' :
                   '주간 투자 추천 - 높은 변동성 활용'}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h5 className="text-yellow-400 font-semibold mb-2">💡 투자 금액 설정</h5>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• 월 수입의 5-10% 이내 권장</li>
                  <li>• 6개월 이상 여유 자금만 투자</li>
                  <li>• 생활비와 완전히 분리된 자금 사용</li>
                  <li>• 최소 1년 이상 투자 계획 수립</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h5 className="text-green-400 font-semibold mb-2">✅ 성공적인 DCA 체크리스트</h5>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" className="rounded" />
                    <span>자동 투자 설정 완료</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" className="rounded" />
                    <span>손절/익절 라인 설정</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" className="rounded" />
                    <span>정기적인 포트폴리오 리뷰</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" className="rounded" />
                    <span>세금 고려사항 확인</span>
                  </label>
                </div>
              </div>

              <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4">
                <h5 className="text-red-400 font-semibold mb-2">⚠️ 주의사항</h5>
                <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
                  <li>• 무한 하락 자산에는 DCA 피하기</li>
                  <li>• 레버리지와 DCA 병행 금지</li>
                  <li>• 수수료 누적 비용 계산하기</li>
                  <li>• 출구 전략 미리 수립하기</li>
                </ul>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaBook className={`text-lg sm:text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">DCA 개념 가이드</h2>
          <p className="text-sm sm:text-base text-gray-400">{selectedCoin.name} DCA 전략 완벽 가이드</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-700">
        {/* 탭 네비게이션 */}
        <div className="flex overflow-x-auto border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-base sm:text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="p-4 sm:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}