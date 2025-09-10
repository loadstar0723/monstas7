'use client'

import { useState } from 'react'
import { FaBook, FaChartLine, FaGraduationCap, FaLightbulb, FaChevronDown, FaChevronUp } from 'react-icons/fa'

export default function ConceptGuide() {
  const [expandedSection, setExpandedSection] = useState<string | null>('basics')

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="space-y-6">
      {/* 소개 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-white mb-4">📚 테이프 리딩 완벽 가이드</h2>
        <p className="text-gray-300 leading-relaxed">
          테이프 리딩(Tape Reading)은 실시간 체결 데이터를 분석하여 시장의 수급과 방향성을 파악하는 전통적이면서도 강력한 트레이딩 기법입니다.
          개념부터 실전 전략까지 단계별로 학습해보세요.
        </p>
      </div>

      {/* 기초 개념 */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700">
        <button
          onClick={() => toggleSection('basics')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-800/70 transition"
        >
          <div className="flex items-center gap-3">
            <FaBook className="text-2xl text-blue-400" />
            <h3 className="text-xl font-bold text-white">기초 개념</h3>
          </div>
          {expandedSection === 'basics' ? 
            <FaChevronUp className="text-gray-400" /> : 
            <FaChevronDown className="text-gray-400" />
          }
        </button>
        
        {expandedSection === 'basics' && (
          <div className="px-6 pb-6 space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-blue-400 mb-2">테이프 리딩이란?</h4>
              <p className="text-gray-300 mb-3">
                과거 주식 시장에서 전신 테이프(Ticker Tape)를 통해 실시간 거래를 확인하던 방식에서 유래한 기법입니다.
                현대에는 Time & Sales 창을 통해 모든 체결 내역을 실시간으로 모니터링합니다.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>체결 시간, 가격, 수량, 방향을 종합적으로 분석</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>대량 거래와 연속 거래 패턴 파악</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>시장 참여자의 긴급성과 의도 해석</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-yellow-400 mb-2">핵심 용어</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div>
                    <span className="text-white font-medium">Bid (매수 호가)</span>
                    <p className="text-gray-400 text-sm">구매자가 제시한 가격</p>
                  </div>
                  <div>
                    <span className="text-white font-medium">Ask (매도 호가)</span>
                    <p className="text-gray-400 text-sm">판매자가 제시한 가격</p>
                  </div>
                  <div>
                    <span className="text-white font-medium">Spread (스프레드)</span>
                    <p className="text-gray-400 text-sm">Bid와 Ask의 차이</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-white font-medium">Print (체결)</span>
                    <p className="text-gray-400 text-sm">실제 거래가 성사된 기록</p>
                  </div>
                  <div>
                    <span className="text-white font-medium">Block Trade</span>
                    <p className="text-gray-400 text-sm">대량 거래 (기관/고래)</p>
                  </div>
                  <div>
                    <span className="text-white font-medium">Sweep</span>
                    <p className="text-gray-400 text-sm">여러 호가를 쓸어담는 거래</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 핵심 분석 기법 */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700">
        <button
          onClick={() => toggleSection('analysis')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-800/70 transition"
        >
          <div className="flex items-center gap-3">
            <FaChartLine className="text-2xl text-green-400" />
            <h3 className="text-xl font-bold text-white">핵심 분석 기법</h3>
          </div>
          {expandedSection === 'analysis' ? 
            <FaChevronUp className="text-gray-400" /> : 
            <FaChevronDown className="text-gray-400" />
          }
        </button>
        
        {expandedSection === 'analysis' && (
          <div className="px-6 pb-6 space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-green-400 mb-3">1. 거래량 프로파일 분석</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-white font-medium">POC (Point of Control)</p>
                    <p className="text-gray-400 text-sm">가장 많은 거래가 발생한 가격대 - 강력한 지지/저항</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-white font-medium">Value Area</p>
                    <p className="text-gray-400 text-sm">전체 거래량의 70%가 발생한 구간 - 공정 가치 영역</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-white font-medium">HVN/LVN</p>
                    <p className="text-gray-400 text-sm">고거래량 노드(지지) vs 저거래량 노드(돌파 가능)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-blue-400 mb-3">2. 주문 흐름 해석</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="text-white font-medium">매수 압력 신호</h5>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• Ask를 연속으로 치고 올라감</li>
                    <li>• 대량 매수 체결 증가</li>
                    <li>• Bid 수량 &gt; Ask 수량</li>
                    <li>• 누적 델타 상승</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="text-white font-medium">매도 압력 신호</h5>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• Bid를 연속으로 때림</li>
                    <li>• 대량 매도 체결 증가</li>
                    <li>• Ask 수량 &gt; Bid 수량</li>
                    <li>• 누적 델타 하락</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-purple-400 mb-3">3. 대량 거래 패턴</h4>
              <div className="space-y-3">
                <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                  <p className="text-white font-medium mb-1">축적 (Accumulation)</p>
                  <p className="text-gray-400 text-sm">
                    저점에서 조용히 대량 매수 - 가격 변동 최소화하며 포지션 구축
                  </p>
                </div>
                <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                  <p className="text-white font-medium mb-1">분산 (Distribution)</p>
                  <p className="text-gray-400 text-sm">
                    고점에서 조용히 대량 매도 - 시장에 충격 없이 포지션 정리
                  </p>
                </div>
                <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                  <p className="text-white font-medium mb-1">스윕 (Sweep)</p>
                  <p className="text-gray-400 text-sm">
                    여러 호가를 한 번에 쓸어담기 - 긴급한 포지션 진입/청산
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 실전 전략 */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700">
        <button
          onClick={() => toggleSection('strategy')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-800/70 transition"
        >
          <div className="flex items-center gap-3">
            <FaGraduationCap className="text-2xl text-purple-400" />
            <h3 className="text-xl font-bold text-white">실전 전략</h3>
          </div>
          {expandedSection === 'strategy' ? 
            <FaChevronUp className="text-gray-400" /> : 
            <FaChevronDown className="text-gray-400" />
          }
        </button>
        
        {expandedSection === 'strategy' && (
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-lg p-4 border border-green-500/30">
                <h4 className="text-lg font-semibold text-green-400 mb-3">🌱 초급 전략</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• 대량 거래 추종</li>
                  <li>• 지지/저항 확인</li>
                  <li>• 거래량 급증 포착</li>
                  <li>• 기본 패턴 인식</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-lg p-4 border border-blue-500/30">
                <h4 className="text-lg font-semibold text-blue-400 mb-3">🚀 중급 전략</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• 델타 다이버전스</li>
                  <li>• 흡수 패턴 매매</li>
                  <li>• 임밸런스 활용</li>
                  <li>• 복합 지표 조합</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-lg p-4 border border-purple-500/30">
                <h4 className="text-lg font-semibold text-purple-400 mb-3">💎 고급 전략</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• 기관 플로우 추적</li>
                  <li>• 시장 조작 감지</li>
                  <li>• 미시구조 차익</li>
                  <li>• AI 패턴 예측</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-orange-400 mb-3">실전 체크리스트</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-medium mb-2">진입 전 확인사항</h5>
                  <ul className="space-y-1 text-gray-400 text-sm">
                    <li>✓ 전체 시장 트렌드 확인</li>
                    <li>✓ 주요 지지/저항 레벨 파악</li>
                    <li>✓ 거래량 프로파일 분석</li>
                    <li>✓ 대량 거래 방향성 확인</li>
                    <li>✓ 리스크/리워드 계산</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-white font-medium mb-2">포지션 관리</h5>
                  <ul className="space-y-1 text-gray-400 text-sm">
                    <li>✓ 손절가 설정 (진입가 -2%)</li>
                    <li>✓ 목표가 설정 (R:R 1:2 이상)</li>
                    <li>✓ 포지션 크기 (자본의 3-5%)</li>
                    <li>✓ 분할 진입/청산 계획</li>
                    <li>✓ 트레일링 스톱 활용</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 실전 팁 */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700">
        <button
          onClick={() => toggleSection('tips')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-800/70 transition"
        >
          <div className="flex items-center gap-3">
            <FaLightbulb className="text-2xl text-yellow-400" />
            <h3 className="text-xl font-bold text-white">전문가 팁</h3>
          </div>
          {expandedSection === 'tips' ? 
            <FaChevronUp className="text-gray-400" /> : 
            <FaChevronDown className="text-gray-400" />
          }
        </button>
        
        {expandedSection === 'tips' && (
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                <h4 className="text-yellow-400 font-semibold mb-2">💡 성공 팁</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• 한 가지 패턴을 완벽히 익히고 확장</li>
                  <li>• 거래 일지 작성으로 패턴 학습</li>
                  <li>• 감정 배제하고 데이터로 판단</li>
                  <li>• 작은 포지션으로 시작해 점진적 확대</li>
                  <li>• 시장 상황별 전략 차별화</li>
                </ul>
              </div>
              
              <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                <h4 className="text-red-400 font-semibold mb-2">⚠️ 주의사항</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• 과도한 레버리지 사용 금지</li>
                  <li>• 손절 없는 거래 절대 금지</li>
                  <li>• 복수 매매 (리벤지 트레이딩) 주의</li>
                  <li>• 시장 조작 가능성 항상 염두</li>
                  <li>• 뉴스/이벤트 시간대 주의</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/30">
              <h4 className="text-white font-semibold mb-2">🎯 마스터의 조언</h4>
              <p className="text-gray-300 italic">
                "테이프 리딩은 단순히 숫자를 보는 것이 아니라, 시장 참여자들의 심리와 의도를 읽는 예술입니다.
                꾸준한 관찰과 경험을 통해 시장의 언어를 이해하게 될 것입니다."
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}