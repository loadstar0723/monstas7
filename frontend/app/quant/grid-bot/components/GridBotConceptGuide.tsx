'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaBook, FaChartLine, FaRobot, FaLightbulb, FaShieldAlt, FaRocket, FaCalculator, FaClock } from 'react-icons/fa'

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

export default function GridBotConceptGuide({ selectedCoin }: Props) {
  const [activeTab, setActiveTab] = useState('basic')
  
  const tabs = [
    { id: 'basic', label: '기본 개념', icon: <FaBook /> },
    { id: 'howto', label: '작동 원리', icon: <FaRobot /> },
    { id: 'strategy', label: '전략 설명', icon: <FaChartLine /> },
    { id: 'tips', label: '실전 팁', icon: <FaLightbulb /> }
  ]
  
  return (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaBook className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">그리드 봇 완벽 가이드</h2>
          <p className="text-gray-400">개념부터 실전까지 {selectedCoin.name} 그리드 봇의 모든 것</p>
        </div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
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
            {/* 그리드 봇이란? */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>그리드 봇(Grid Bot)이란?</h3>
              <p className="text-gray-300 mb-4">
                그리드 봇은 가격이 일정 범위 내에서 움직일 때 자동으로 매수와 매도를 반복하여 수익을 창출하는 자동화된 트레이딩 전략입니다.
                마치 그물망(Grid)을 쳐놓고 물고기를 잡는 것처럼, 가격 변동을 포착하여 작은 수익을 지속적으로 쌓아갑니다.
              </p>
              
              {/* 시각적 예시 */}
              <div className="bg-gray-900 rounded-lg p-6 mb-4">
                <p className="text-sm text-gray-400 mb-4">그리드 봇 작동 예시</p>
                <div className="space-y-3">
                  {[50000, 49000, 48000, 47000, 46000].map((price, index) => (
                    <div key={price} className="flex items-center gap-4">
                      <div className="w-20 text-right text-gray-400">${price.toLocaleString()}</div>
                      <div className="flex-1 h-2 bg-gray-700 rounded-full relative">
                        {index % 2 === 0 && (
                          <div className={`absolute inset-0 ${selectedCoin.bgColor} rounded-full`}>
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-red-400">매도</span>
                          </div>
                        )}
                        {index % 2 === 1 && (
                          <div className={`absolute inset-0 ${selectedCoin.bgColor} rounded-full`}>
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-green-400">매수</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center mt-6 text-sm text-gray-400">
                  가격이 하락하면 매수, 상승하면 매도를 반복
                </p>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">핵심 특징</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className={selectedCoin.color}>•</span>
                    <span className="text-gray-300">변동성 시장에서 효과적</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={selectedCoin.color}>•</span>
                    <span className="text-gray-300">감정 배제한 자동 매매</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={selectedCoin.color}>•</span>
                    <span className="text-gray-300">24시간 무중단 운영</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={selectedCoin.color}>•</span>
                    <span className="text-gray-300">리스크 분산 효과</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* 핵심 개념 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <FaCalculator className={`text-2xl ${selectedCoin.color}`} />
                  <h4 className="text-lg font-bold">그리드 설정</h4>
                </div>
                <p className="text-gray-300 mb-3">
                  그리드 봇의 핵심 설정값들입니다:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="text-gray-300">
                    <span className="text-gray-400">상한가:</span> 그리드의 최고 가격
                  </li>
                  <li className="text-gray-300">
                    <span className="text-gray-400">하한가:</span> 그리드의 최저 가격
                  </li>
                  <li className="text-gray-300">
                    <span className="text-gray-400">그리드 수:</span> 가격 구간 분할 개수
                  </li>
                  <li className="text-gray-300">
                    <span className="text-gray-400">투자금:</span> 총 투자 금액
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <FaShieldAlt className={`text-2xl ${selectedCoin.color}`} />
                  <h4 className="text-lg font-bold">리스크 관리</h4>
                </div>
                <p className="text-gray-300 mb-3">
                  그리드 봇의 리스크 요소:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="text-gray-300">
                    <span className="text-yellow-400">추세 리스크:</span> 일방향 움직임
                  </li>
                  <li className="text-gray-300">
                    <span className="text-yellow-400">범위 이탈:</span> 설정 범위 벗어남
                  </li>
                  <li className="text-gray-300">
                    <span className="text-yellow-400">수수료:</span> 잦은 거래로 누적
                  </li>
                  <li className="text-gray-300">
                    <span className="text-yellow-400">자금 고착:</span> 포지션에 묶임
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* 작동 원리 */}
        {activeTab === 'howto' && (
          <div className="space-y-6">
            {/* 단계별 작동 원리 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>그리드 봇 작동 원리</h3>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: '가격 범위 설정',
                    content: `${selectedCoin.name}의 예상 변동 범위를 설정합니다. 예: $45,000 ~ $55,000`
                  },
                  {
                    step: 2,
                    title: '그리드 분할',
                    content: '설정한 범위를 균등하게 나눕니다. 예: 10개 그리드 = $1,000 간격'
                  },
                  {
                    step: 3,
                    title: '주문 배치',
                    content: '각 그리드 라인에 매수/매도 주문을 자동 배치합니다'
                  },
                  {
                    step: 4,
                    title: '자동 실행',
                    content: '가격이 그리드 라인을 터치하면 자동으로 매수/매도 실행'
                  },
                  {
                    step: 5,
                    title: '수익 실현',
                    content: '각 거래마다 그리드 간격만큼의 수익 자동 확정'
                  },
                  {
                    step: 6,
                    title: '재배치',
                    content: '체결된 주문은 다음 그리드에 자동으로 재배치'
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
            
            {/* 수익 계산 예시 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>수익 계산 예시</h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-3">설정값</p>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">투자금:</span>
                    <span className="text-white ml-2">$10,000</span>
                  </div>
                  <div>
                    <span className="text-gray-500">그리드 수:</span>
                    <span className="text-white ml-2">20개</span>
                  </div>
                  <div>
                    <span className="text-gray-500">상한가:</span>
                    <span className="text-white ml-2">$50,000</span>
                  </div>
                  <div>
                    <span className="text-gray-500">하한가:</span>
                    <span className="text-white ml-2">$40,000</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-sm text-gray-400 mb-2">계산 결과</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">그리드 간격</span>
                      <span className="text-white">$500 (2.5%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">그리드당 수익</span>
                      <span className="text-green-400">$25 (0.5%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">일일 평균 거래 (변동성 5%)</span>
                      <span className="text-white">4-6회</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-300">예상 일일 수익</span>
                      <span className="text-green-400">$100-150 (1-1.5%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 전략 설명 */}
        {activeTab === 'strategy' && (
          <div className="space-y-6">
            {/* 시장 상황별 전략 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>시장 상황별 그리드 전략</h3>
              <div className="space-y-4">
                {/* 횡보장 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-green-400">횡보장 (최적)</h4>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">추천도 ★★★★★</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    가격이 일정 범위 내에서 움직이는 횡보장은 그리드 봇에 최적의 환경입니다.
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 좁은 그리드 간격 설정 (1-2%)</li>
                    <li>• 많은 그리드 수 (30-50개)</li>
                    <li>• 전체 자금의 80-90% 투입 가능</li>
                  </ul>
                </div>
                
                {/* 상승장 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-blue-400">상승장 (양호)</h4>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">추천도 ★★★☆☆</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    상승 추세에서는 그리드 범위를 위쪽으로 조정하며 운영합니다.
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 넓은 그리드 간격 (3-5%)</li>
                    <li>• 상한가를 높게 설정</li>
                    <li>• 전체 자금의 50-60% 투입</li>
                  </ul>
                </div>
                
                {/* 하락장 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-red-400">하락장 (주의)</h4>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">추천도 ★★☆☆☆</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    하락 추세에서는 리스크 관리가 중요하며, 보수적 운영이 필요합니다.
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 매우 넓은 그리드 간격 (5-10%)</li>
                    <li>• 하한가를 충분히 낮게 설정</li>
                    <li>• 전체 자금의 30% 이하 투입</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* 고급 전략 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>{selectedCoin.name} 전용 전략</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="font-bold mb-2 text-yellow-400">변동성 활용</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    {selectedCoin.name}의 일일 변동성을 분석하여 최적 설정
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 평균 일일 변동: 실시간 계산</li>
                    <li>• 그리드 간격: 변동성의 25-30%</li>
                    <li>• 자동 조정 기능 활용</li>
                  </ul>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="font-bold mb-2 text-purple-400">시간대별 운영</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    거래량이 많은 시간대 집중 운영
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 아시아 세션: 오전 9시-12시</li>
                    <li>• 유럽 세션: 오후 4시-8시</li>
                    <li>• 미국 세션: 밤 10시-새벽 2시</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 실전 팁 */}
        {activeTab === 'tips' && (
          <div className="space-y-6">
            {/* 프로 팁 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>
                프로 트레이더의 {selectedCoin.name} 그리드 봇 팁
              </h3>
              <div className="space-y-4">
                {[
                  {
                    icon: <FaRocket />,
                    title: '시작은 작게',
                    tip: '처음에는 소액으로 테스트하고, 수익이 안정되면 점진적으로 증액하세요'
                  },
                  {
                    icon: <FaClock />,
                    title: '인내심이 핵심',
                    tip: '그리드 봇은 장기 전략입니다. 최소 1개월 이상 운영해야 효과를 볼 수 있습니다'
                  },
                  {
                    icon: <FaShieldAlt />,
                    title: '손절선 설정',
                    tip: '하한가 아래 10-15%에 손절선을 설정하여 급락장에 대비하세요'
                  },
                  {
                    icon: <FaChartLine />,
                    title: '백테스트 필수',
                    tip: '실제 운영 전 과거 데이터로 백테스트를 진행하여 최적 설정을 찾으세요'
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
            
            {/* 주의사항 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>주의사항</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-3 text-red-400">피해야 할 실수</h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>• 너무 좁은 범위 설정</li>
                    <li>• 과도한 레버리지 사용</li>
                    <li>• 추세장에서 역방향 설정</li>
                    <li>• 수수료 고려하지 않음</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-3 text-green-400">성공 요인</h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>• 충분한 가격 범위 확보</li>
                    <li>• 변동성에 맞는 그리드 수</li>
                    <li>• 정기적인 모니터링</li>
                    <li>• 시장 상황에 따른 조정</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* 수익률 향상 전략 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className={`text-xl font-bold mb-4 ${selectedCoin.color}`}>수익률 향상 전략</h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-gray-400 text-sm">기본 전략</p>
                    <p className="text-2xl font-bold text-white">5-10%</p>
                    <p className="text-xs text-gray-500">월 수익률</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">최적화 전략</p>
                    <p className="text-2xl font-bold text-yellow-400">10-20%</p>
                    <p className="text-xs text-gray-500">월 수익률</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">고급 전략</p>
                    <p className="text-2xl font-bold text-green-400">20-30%</p>
                    <p className="text-xs text-gray-500">월 수익률</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-center text-sm text-gray-400">
                    ※ 수익률은 시장 상황에 따라 변동될 수 있으며, 과거 성과가 미래 수익을 보장하지 않습니다
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