'use client'

import { useState } from 'react'
import { 
  BookOpenIcon, 
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

export default function ConceptGuide() {
  const [expandedSection, setExpandedSection] = useState<string | null>('liquidity')
  
  const sections = [
    {
      id: 'liquidity',
      title: '유동성 풀이란?',
      icon: BookOpenIcon,
      content: (
        <div className="space-y-3 text-gray-300">
          <p>
            <strong className="text-white">유동성 풀(Liquidity Pool)</strong>은 거래소의 오더북에 
            대기 중인 매수/매도 주문의 총합을 의미합니다.
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-white">깊은 유동성:</strong> 대량 거래 시에도 가격 변동이 적음</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-white">얕은 유동성:</strong> 소량 거래에도 가격이 크게 움직임</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-white">유동성 공급자:</strong> 마켓 메이커가 주문을 배치하여 유동성 제공</span>
            </li>
          </ul>
          <div className="bg-gray-800/50 rounded-lg p-3 mt-3">
            <p className="text-sm">
              💡 <strong className="text-yellow-400">핵심:</strong> 유동성이 높을수록 슬리피지가 적고, 
              더 나은 가격에 거래할 수 있습니다.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'orderbook',
      title: '오더북 읽는 법',
      icon: AcademicCapIcon,
      content: (
        <div className="space-y-3 text-gray-300">
          <p>
            오더북은 현재 대기 중인 모든 매수/매도 주문을 가격별로 정렬한 표입니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-900/20 rounded-lg p-3">
              <h5 className="text-green-400 font-semibold mb-2">Bid (매수 주문)</h5>
              <ul className="text-sm space-y-1">
                <li>• 시장가보다 낮은 가격에 대기</li>
                <li>• 가격이 내려오길 기다림</li>
                <li>• 지지선 역할</li>
              </ul>
            </div>
            <div className="bg-red-900/20 rounded-lg p-3">
              <h5 className="text-red-400 font-semibold mb-2">Ask (매도 주문)</h5>
              <ul className="text-sm space-y-1">
                <li>• 시장가보다 높은 가격에 대기</li>
                <li>• 가격이 올라가길 기다림</li>
                <li>• 저항선 역할</li>
              </ul>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-sm">
              📊 <strong className="text-cyan-400">읽기 팁:</strong> 큰 주문(Wall)은 가격 움직임을 막는 
              장벽 역할을 하며, 주문 불균형은 가격 방향을 예측하는 단서가 됩니다.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'spread',
      title: '스프레드의 의미',
      icon: QuestionMarkCircleIcon,
      content: (
        <div className="space-y-3 text-gray-300">
          <p>
            <strong className="text-white">Bid-Ask 스프레드</strong>는 최고 매수가와 최저 매도가의 차이입니다.
          </p>
          <div className="space-y-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-sm mb-2"><strong className="text-white">스프레드가 좁을 때 (&lt; 0.05%)</strong></p>
              <ul className="text-sm space-y-1">
                <li>✅ 유동성이 풍부함</li>
                <li>✅ 거래 비용이 낮음</li>
                <li>✅ 시장이 효율적임</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-sm mb-2"><strong className="text-white">스프레드가 넓을 때 (&gt; 0.1%)</strong></p>
              <ul className="text-sm space-y-1">
                <li>⚠️ 유동성이 부족함</li>
                <li>⚠️ 거래 비용이 높음</li>
                <li>⚠️ 변동성이 클 가능성</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-yellow-400">
            💰 <strong>거래 비용:</strong> 스프레드는 즉시 체결 시 지불하는 숨은 비용입니다.
          </p>
        </div>
      )
    },
    {
      id: 'slippage',
      title: '슬리피지 관리',
      icon: LightBulbIcon,
      content: (
        <div className="space-y-3 text-gray-300">
          <p>
            <strong className="text-white">슬리피지(Slippage)</strong>는 예상 가격과 실제 체결 가격의 차이입니다.
          </p>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-white font-semibold mb-2">슬리피지 발생 원인</h5>
            <ul className="text-sm space-y-1">
              <li>1. 대량 주문이 여러 가격대를 소진</li>
              <li>2. 시장가 주문 사용</li>
              <li>3. 유동성 부족</li>
              <li>4. 급격한 가격 변동</li>
            </ul>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-900/20 rounded-lg p-3">
              <h5 className="text-blue-400 font-semibold mb-2">슬리피지 줄이기</h5>
              <ul className="text-sm space-y-1">
                <li>✅ 지정가 주문 사용</li>
                <li>✅ 주문 분할 실행</li>
                <li>✅ 유동성 높은 시간대 거래</li>
                <li>✅ 작은 포지션 크기</li>
              </ul>
            </div>
            <div className="bg-purple-900/20 rounded-lg p-3">
              <h5 className="text-purple-400 font-semibold mb-2">허용 슬리피지</h5>
              <ul className="text-sm space-y-1">
                <li>• 스캘핑: &lt; 0.05%</li>
                <li>• 데이트레이딩: &lt; 0.1%</li>
                <li>• 스윙: &lt; 0.3%</li>
                <li>• 장기: &lt; 0.5%</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'market-maker',
      title: '마켓 메이커 vs 테이커',
      icon: AcademicCapIcon,
      content: (
        <div className="space-y-3 text-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-900/20 rounded-lg p-4">
              <h5 className="text-green-400 font-semibold mb-2">마켓 메이커 (Maker)</h5>
              <p className="text-sm mb-2">오더북에 유동성을 공급하는 참가자</p>
              <ul className="text-sm space-y-1">
                <li>✅ 지정가 주문 사용</li>
                <li>✅ 낮은 수수료 (또는 리베이트)</li>
                <li>✅ 스프레드 수익 가능</li>
                <li>⚠️ 체결 보장 없음</li>
              </ul>
            </div>
            <div className="bg-red-900/20 rounded-lg p-4">
              <h5 className="text-red-400 font-semibold mb-2">마켓 테이커 (Taker)</h5>
              <p className="text-sm mb-2">오더북의 유동성을 소비하는 참가자</p>
              <ul className="text-sm space-y-1">
                <li>✅ 즉시 체결</li>
                <li>✅ 시장가 주문 가능</li>
                <li>⚠️ 높은 수수료</li>
                <li>⚠️ 슬리피지 발생 가능</li>
              </ul>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 mt-3">
            <p className="text-sm">
              🎯 <strong className="text-yellow-400">전략 선택:</strong> 급한 거래는 테이커로, 
              여유있는 거래는 메이커로 실행하면 비용을 절감할 수 있습니다.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'advanced',
      title: '고급 전략',
      icon: LightBulbIcon,
      content: (
        <div className="space-y-3 text-gray-300">
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <h5 className="text-white font-semibold mb-2">1. Wall 트레이딩</h5>
              <p className="text-sm mb-2">대량 주문(Wall) 앞에서 포지션 설정</p>
              <ul className="text-sm space-y-1">
                <li>• 매수 Wall 위: 롱 포지션 (지지선)</li>
                <li>• 매도 Wall 아래: 숏 포지션 (저항선)</li>
                <li>• Wall 제거 시: 즉시 손절</li>
              </ul>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3">
              <h5 className="text-white font-semibold mb-2">2. 유동성 공백 활용</h5>
              <p className="text-sm mb-2">오더북에 주문이 적은 구간 활용</p>
              <ul className="text-sm space-y-1">
                <li>• 빠른 가격 움직임 예상</li>
                <li>• 브레이크아웃 트레이딩</li>
                <li>• 타이트한 손절 필수</li>
              </ul>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3">
              <h5 className="text-white font-semibold mb-2">3. 임밸런스 추종</h5>
              <p className="text-sm mb-2">매수/매도 불균형 활용</p>
              <ul className="text-sm space-y-1">
                <li>• 매수 &gt; 매도: 상승 모멘텀</li>
                <li>• 매도 &gt; 매수: 하락 모멘텀</li>
                <li>• 30% 이상 차이 시 진입 고려</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ]
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">유동성 개념 가이드</h3>
        <p className="text-gray-400 text-sm">초보자도 이해하기 쉬운 유동성 트레이딩 완벽 가이드</p>
      </div>
      
      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon
          const isExpanded = expandedSection === section.id
          
          return (
            <div key={section.id} className="bg-gray-800/50 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-semibold">{section.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="border-t border-gray-700 pt-4">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* 추가 학습 자료 */}
      <div className="mt-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">📚 추가 학습 팁</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <p className="font-semibold text-purple-400 mb-1">초보자</p>
            <ul className="space-y-1">
              <li>• 작은 금액으로 시작</li>
              <li>• 스프레드가 좁은 메이저 코인</li>
              <li>• 지정가 주문만 사용</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-blue-400 mb-1">고급자</p>
            <ul className="space-y-1">
              <li>• 멀티 거래소 차익거래</li>
              <li>• 유동성 공급으로 수익</li>
              <li>• 알고리즘 트레이딩</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}