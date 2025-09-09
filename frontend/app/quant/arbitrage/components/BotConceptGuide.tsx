'use client'

import { useState } from 'react'

interface BotConceptGuideProps {
  selectedCoin: {
    symbol: string
    name: string
    color: string
    bgColor: string
  }
}

export default function BotConceptGuide({ selectedCoin }: BotConceptGuideProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'strategy' | 'profit' | 'risk'>('basic')
  
  const tabs = [
    { id: 'basic' as const, label: '기본 개념', icon: '📚' },
    { id: 'strategy' as const, label: '전략 종류', icon: '🎯' },
    { id: 'profit' as const, label: '수익 구조', icon: '💰' },
    { id: 'risk' as const, label: '리스크', icon: '⚠️' }
  ]
  
  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? `${selectedCoin.bgColor} ${selectedCoin.color} border border-current`
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* 탭 컨텐츠 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">
                차익거래 봇이란?
              </h3>
              <div className="space-y-4 text-gray-300">
                <p>
                  차익거래 봇은 서로 다른 거래소나 시장 간의 가격 차이를 자동으로 감지하고,
                  이를 활용해 수익을 창출하는 자동화된 트레이딩 시스템입니다.
                </p>
                
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-green-400">핵심 작동 원리</h4>
                  <ol className="space-y-2 list-decimal list-inside">
                    <li>여러 거래소의 {selectedCoin.name} 가격을 실시간 모니터링</li>
                    <li>가격 차이가 수수료를 초과하는 기회 포착</li>
                    <li>낮은 가격 거래소에서 매수</li>
                    <li>높은 가격 거래소에서 매도</li>
                    <li>차액만큼 수익 실현</li>
                  </ol>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-blue-400">봇의 장점</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 24시간 자동 모니터링</li>
                      <li>• 밀리초 단위 빠른 실행</li>
                      <li>• 감정 배제된 거래</li>
                      <li>• 동시 다중 거래 가능</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-yellow-400">필요 조건</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 여러 거래소 계정</li>
                      <li>• 충분한 자본금</li>
                      <li>• API 키 설정</li>
                      <li>• 안정적인 서버</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'strategy' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4 text-white">
              {selectedCoin.name} 차익거래 전략
            </h3>
            
            <div className="space-y-4">
              {/* 삼각 차익거래 */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-purple-400">🔺 삼각 차익거래</h4>
                <p className="text-gray-300 text-sm mb-3">
                  3개의 통화쌍을 순환하며 발생하는 가격 불일치를 활용
                </p>
                <div className="bg-black/30 rounded p-3 font-mono text-xs">
                  <div className="text-green-400">예시: {selectedCoin.symbol}/USDT → USDT/EUR → EUR/{selectedCoin.symbol}</div>
                  <div className="text-gray-400 mt-1">예상 수익률: 0.1% ~ 0.5% per trade</div>
                </div>
              </div>
              
              {/* 거래소 간 차익거래 */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-blue-400">🔄 거래소 간 차익거래</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Binance, Upbit, Coinbase 등 거래소 간 가격 차이 활용
                </p>
                <div className="bg-black/30 rounded p-3 font-mono text-xs">
                  <div className="text-green-400">Binance: ${selectedCoin.symbol === 'BTC' ? '98,000' : '3,500'}</div>
                  <div className="text-yellow-400">Upbit: ${selectedCoin.symbol === 'BTC' ? '98,200' : '3,520'}</div>
                  <div className="text-gray-400 mt-1">차익: 0.2% (수수료 제외)</div>
                </div>
              </div>
              
              {/* 통계적 차익거래 */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-green-400">📊 통계적 차익거래</h4>
                <p className="text-gray-300 text-sm mb-3">
                  과거 데이터 기반 가격 패턴과 평균 회귀 활용
                </p>
                <div className="bg-black/30 rounded p-3 font-mono text-xs">
                  <div className="text-green-400">볼린저 밴드 이탈 시 진입</div>
                  <div className="text-yellow-400">RSI 과매수/과매도 구간 활용</div>
                  <div className="text-gray-400 mt-1">평균 수익률: 0.3% ~ 1% per trade</div>
                </div>
              </div>
              
              {/* DEX-CEX 차익거래 */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-orange-400">🌐 DEX-CEX 차익거래</h4>
                <p className="text-gray-300 text-sm mb-3">
                  탈중앙화 거래소(Uniswap)와 중앙화 거래소(Binance) 간 차이
                </p>
                <div className="bg-black/30 rounded p-3 font-mono text-xs">
                  <div className="text-green-400">Uniswap 슬리피지 활용</div>
                  <div className="text-yellow-400">가스비 고려한 수익 계산</div>
                  <div className="text-gray-400 mt-1">최소 거래 규모: $10,000+</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'profit' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4 text-white">
              수익 구조 분석
            </h3>
            
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-green-400">수익 계산 공식</h4>
              <div className="space-y-3">
                <div className="bg-black/30 rounded p-3 font-mono text-sm">
                  <div className="text-yellow-400">총 수익 = (매도가 - 매수가) × 거래량</div>
                  <div className="text-gray-400 mt-2">순수익 = 총 수익 - (거래 수수료 + 송금 수수료 + 슬리피지)</div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h5 className="font-medium mb-2 text-blue-400">수익 요인</h5>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>✅ 가격 차이 (스프레드)</li>
                      <li>✅ 거래 속도</li>
                      <li>✅ 거래량 규모</li>
                      <li>✅ 시장 변동성</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2 text-red-400">비용 요인</h5>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>❌ 거래 수수료 (0.05-0.1%)</li>
                      <li>❌ 네트워크 수수료</li>
                      <li>❌ 슬리피지 (0.1-0.3%)</li>
                      <li>❌ 환율 변동</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-yellow-400">예상 수익 시뮬레이션</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">일일 거래 횟수</span>
                  <span className="text-white">20-50회</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">평균 수익률 (거래당)</span>
                  <span className="text-green-400">0.1-0.3%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">예상 일 수익률</span>
                  <span className="text-green-400">2-15%</span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span className="text-gray-400">예상 월 수익률</span>
                  <span className="text-green-400">60-450%</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'risk' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4 text-white">
              리스크 관리
            </h3>
            
            <div className="space-y-4">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-red-400">⚠️ 주요 리스크</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <span className="font-semibold text-red-400">• 거래소 리스크:</span> 
                    <span className="ml-2">해킹, 출금 제한, 계정 동결</span>
                  </li>
                  <li>
                    <span className="font-semibold text-red-400">• 기술적 리스크:</span>
                    <span className="ml-2">API 오류, 네트워크 지연, 봇 오작동</span>
                  </li>
                  <li>
                    <span className="font-semibold text-red-400">• 시장 리스크:</span>
                    <span className="ml-2">급격한 가격 변동, 유동성 부족</span>
                  </li>
                  <li>
                    <span className="font-semibold text-red-400">• 규제 리스크:</span>
                    <span className="ml-2">정책 변경, 거래 제한</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-green-400">✅ 리스크 관리 전략</h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 rounded p-3">
                    <h5 className="font-medium text-yellow-400 mb-1">자금 관리</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• 전체 자본의 20% 이하만 봇에 할당</li>
                      <li>• 거래소별 자금 분산 (33% 이하)</li>
                      <li>• 예비 자금 30% 이상 보유</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded p-3">
                    <h5 className="font-medium text-blue-400 mb-1">기술적 안전장치</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• 최대 포지션 크기 제한</li>
                      <li>• 자동 손절매 설정 (-2%)</li>
                      <li>• API Rate Limit 준수</li>
                      <li>• 실시간 모니터링 알림</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded p-3">
                    <h5 className="font-medium text-purple-400 mb-1">운영 원칙</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• 백테스팅 후 실전 적용</li>
                      <li>• 소액으로 시작 후 점진적 증액</li>
                      <li>• 일일 손실 한도 설정 (-5%)</li>
                      <li>• 정기적인 수익 인출</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}