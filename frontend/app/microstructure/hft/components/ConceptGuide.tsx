'use client'

import { useState } from 'react'
import { BookOpenIcon, LightBulbIcon, ChartBarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function ConceptGuide() {
  const [activeTab, setActiveTab] = useState('basics')
  
  const tabs = [
    { id: 'basics', label: '기초 개념', icon: BookOpenIcon },
    { id: 'patterns', label: 'HFT 패턴', icon: ChartBarIcon },
    { id: 'strategies', label: '대응 전략', icon: LightBulbIcon },
    { id: 'risks', label: '리스크 관리', icon: ShieldCheckIcon }
  ]
  
  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20">
      <h2 className="text-2xl font-bold text-white mb-6">📚 HFT 패턴 완벽 가이드</h2>
      
      {/* 탭 메뉴 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* 탭 콘텐츠 */}
      <div className="space-y-4">
        {activeTab === 'basics' && (
          <div className="space-y-4">
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">🎯 HFT란 무엇인가?</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                고빈도 거래(High-Frequency Trading)는 초단위로 수천 건의 거래를 자동으로 실행하는 알고리즘 트레이딩입니다.
                밀리초 단위의 속도로 시장의 미세한 가격 차이를 포착하여 수익을 창출합니다.
              </p>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">⚡ HFT의 특징</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400">•</span>
                  <span>초고속 실행: 마이크로초 단위의 거래 실행</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400">•</span>
                  <span>대량 거래: 하루 수만~수십만 건의 거래</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400">•</span>
                  <span>짧은 보유: 포지션 보유 시간 초~분 단위</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400">•</span>
                  <span>낮은 마진: 건당 수익은 작지만 거래량으로 보완</span>
                </li>
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'patterns' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg p-4 border border-green-500/20">
              <h3 className="text-lg font-semibold text-green-400 mb-2">📊 마켓 메이킹</h3>
              <p className="text-gray-300 text-sm mb-2">
                매수/매도 호가를 동시에 제시하여 스프레드 수익 창출
              </p>
              <div className="text-xs text-gray-400">
                <p>• 특징: 양방향 호가, 높은 취소율</p>
                <p>• 리스크: 재고 위험, 역선택</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-lg p-4 border border-blue-500/20">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">🔄 차익거래</h3>
              <p className="text-gray-300 text-sm mb-2">
                거래소 간 가격 차이를 이용한 무위험 수익
              </p>
              <div className="text-xs text-gray-400">
                <p>• 특징: 대량 거래, 빠른 실행</p>
                <p>• 리스크: 레이턴시, 슬리피지</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 rounded-lg p-4 border border-yellow-500/20">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">📈 모멘텀 트레이딩</h3>
              <p className="text-gray-300 text-sm mb-2">
                단기 추세를 포착하여 방향성 베팅
              </p>
              <div className="text-xs text-gray-400">
                <p>• 특징: 일방향 거래, 빠른 청산</p>
                <p>• 리스크: 급반전, 유동성 부족</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-lg p-4 border border-red-500/20">
              <h3 className="text-lg font-semibold text-red-400 mb-2">⚡ 스캘핑</h3>
              <p className="text-gray-300 text-sm mb-2">
                작은 가격 변동에서 빈번한 수익 실현
              </p>
              <div className="text-xs text-gray-400">
                <p>• 특징: 초단기 보유, 높은 빈도</p>
                <p>• 리스크: 수수료, 슬리피지</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'strategies' && (
          <div className="space-y-4">
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-3">✅ HFT 활용 전략</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🕐</span>
                  <div>
                    <p className="text-white font-medium">타이밍 최적화</p>
                    <p className="text-gray-400 text-sm">HFT 활동이 적은 시간대에 거래 실행</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📏</span>
                  <div>
                    <p className="text-white font-medium">주문 크기 조절</p>
                    <p className="text-gray-400 text-sm">대량 주문을 작게 나누어 실행</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="text-white font-medium">지정가 주문 활용</p>
                    <p className="text-gray-400 text-sm">시장가 대신 지정가로 슬리피지 최소화</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-400 mb-3">❌ HFT 회피 전략</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">• 변동성이 높은 시간대 거래 자제</p>
                <p className="text-gray-300">• 호가창 벽(Wall) 근처 주문 회피</p>
                <p className="text-gray-300">• 스푸핑 패턴 감지 시 거래 중단</p>
                <p className="text-gray-300">• 비정상적 거래량 급증 시 관망</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'risks' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/20">
                <h3 className="text-lg font-semibold text-red-400 mb-2">⚠️ 주요 리스크</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• 플래시 크래시 위험</li>
                  <li>• 유동성 함정</li>
                  <li>• 스푸핑/레이어링</li>
                  <li>• 시장 조작</li>
                </ul>
              </div>
              
              <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/20">
                <h3 className="text-lg font-semibold text-green-400 mb-2">🛡️ 보호 방법</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• 손절매 설정 필수</li>
                  <li>• 포지션 크기 제한</li>
                  <li>• 패턴 모니터링</li>
                  <li>• 분산 투자</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/20">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">💡 실전 팁</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                HFT 봇과 경쟁하지 마세요. 대신 그들의 패턴을 이해하고 활용하세요.
                봇들이 만드는 유동성을 이용하되, 조작 신호가 보이면 즉시 철수하세요.
                장기적 관점에서 투자하고, 단기 노이즈에 흔들리지 마세요.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}