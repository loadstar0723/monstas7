'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaBook, FaGraduationCap, FaChartLine, FaCogs, 
  FaLightbulb, FaCheckCircle, FaExclamationTriangle,
  FaPlayCircle, FaQuestionCircle, FaBrain
} from 'react-icons/fa'

export default function ConceptTab() {
  const [activeSection, setActiveSection] = useState('basics')

  const sections = [
    { id: 'basics', name: '기본 개념', icon: FaBook },
    { id: 'fibonacci', name: '피보나치 이론', icon: FaChartLine },
    { id: 'patterns', name: '패턴 종류', icon: FaCogs },
    { id: 'trading', name: '트레이딩 전략', icon: FaLightbulb },
    { id: 'psychology', name: '트레이딩 심리', icon: FaBrain },
    { id: 'faq', name: '자주 묻는 질문', icon: FaQuestionCircle }
  ]

  return (
    <div className="space-y-6">
      {/* 섹션 네비게이션 */}
      <div className="flex flex-wrap gap-2">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeSection === section.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <section.icon />
            <span>{section.name}</span>
          </button>
        ))}
      </div>

      {/* 기본 개념 */}
      {activeSection === 'basics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaBook className="text-purple-400" />
              하모닉 패턴이란?
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                하모닉 패턴(Harmonic Pattern)은 <span className="text-purple-400 font-semibold">피보나치 수열</span>을 기반으로 한 
                기술적 분석 도구입니다. H.M. Gartley가 1932년 처음 소개한 이후, Scott Carney, Larry Pesavento 등이 
                발전시켜 현재의 정교한 패턴 분석 체계가 되었습니다.
              </p>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">핵심 원리</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-400 mt-0.5" />
                    <span>가격 움직임은 특정 피보나치 비율로 되돌림과 확장을 반복</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-400 mt-0.5" />
                    <span>시장 심리가 만들어내는 반복적인 가격 패턴</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-400 mt-0.5" />
                    <span>수학적 정확성과 시장 심리의 결합</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-400 mt-0.5" />
                    <span>높은 확률의 전환점 예측 가능</span>
                  </li>
                </ul>
              </div>
              <div className="bg-blue-600/20 rounded-lg p-4 border border-blue-500/30">
                <p className="text-sm">
                  💡 <span className="font-semibold">Pro Tip:</span> 하모닉 패턴은 단독으로 사용하기보다 
                  다른 기술적 지표(RSI, MACD, 거래량)와 함께 사용할 때 정확도가 크게 향상됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 역사와 발전 */}
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">하모닉 패턴의 역사</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="text-3xl">📅</div>
                <div>
                  <div className="text-purple-400 font-semibold">1932년</div>
                  <div className="text-gray-300">H.M. Gartley가 "Profits in the Stock Market"에서 최초로 가틀리 패턴 소개</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">🔬</div>
                <div>
                  <div className="text-purple-400 font-semibold">1990년대</div>
                  <div className="text-gray-300">Larry Pesavento가 피보나치 비율을 적용한 정교한 패턴 분석 개발</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">🚀</div>
                <div>
                  <div className="text-purple-400 font-semibold">2000년대</div>
                  <div className="text-gray-300">Scott Carney가 Bat, Crab, Butterfly 등 새로운 패턴 발견 및 체계화</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">🤖</div>
                <div>
                  <div className="text-purple-400 font-semibold">현재</div>
                  <div className="text-gray-300">AI와 머신러닝을 활용한 자동 패턴 인식 및 트레이딩 시스템 발전</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 피보나치 이론 */}
      {activeSection === 'fibonacci' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-r from-yellow-600/10 to-orange-600/10 rounded-xl p-6 border border-yellow-500/30">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaChartLine className="text-yellow-400" />
              피보나치 수열과 황금비
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">피보나치 수열</h3>
                <p className="text-gray-300 mb-3">
                  0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...
                </p>
                <p className="text-gray-300">
                  각 숫자는 앞의 두 숫자를 더한 값으로, 자연과 금융시장에서 반복적으로 나타나는 신비한 수열입니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-semibold mb-3">주요 되돌림 비율</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• <span className="text-white font-mono">0.236 (23.6%)</span> - 약한 되돌림</li>
                    <li>• <span className="text-white font-mono">0.382 (38.2%)</span> - 표준 되돌림</li>
                    <li>• <span className="text-white font-mono">0.500 (50.0%)</span> - 중간 되돌림</li>
                    <li>• <span className="text-white font-mono">0.618 (61.8%)</span> - 황금 되돌림</li>
                    <li>• <span className="text-white font-mono">0.786 (78.6%)</span> - 깊은 되돌림</li>
                    <li>• <span className="text-white font-mono">0.886 (88.6%)</span> - 극단 되돌림</li>
                  </ul>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-orange-400 font-semibold mb-3">주요 확장 비율</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• <span className="text-white font-mono">1.000 (100%)</span> - 완전 확장</li>
                    <li>• <span className="text-white font-mono">1.130 (113%)</span> - 약한 확장</li>
                    <li>• <span className="text-white font-mono">1.272 (127.2%)</span> - 표준 확장</li>
                    <li>• <span className="text-white font-mono">1.414 (141.4%)</span> - 중간 확장</li>
                    <li>• <span className="text-white font-mono">1.618 (161.8%)</span> - 황금 확장</li>
                    <li>• <span className="text-white font-mono">2.618 (261.8%)</span> - 극단 확장</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-600/20 rounded-lg p-4 border border-yellow-500/30">
                <h4 className="text-white font-semibold mb-2">황금비 (Golden Ratio) = 1.618</h4>
                <p className="text-sm text-gray-300">
                  피보나치 수열에서 인접한 두 수의 비율은 점점 황금비 1.618에 수렴합니다. 
                  이 비율은 자연, 예술, 건축 그리고 금융시장에서 보편적으로 나타나는 완벽한 비율입니다.
                </p>
              </div>
            </div>
          </div>

          {/* PRZ 설명 */}
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">PRZ (Potential Reversal Zone)</h3>
            <div className="space-y-4 text-gray-300">
              <p>
                PRZ는 여러 피보나치 레벨이 수렴하는 영역으로, 가격 반전 가능성이 가장 높은 구간입니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-600/20 rounded-lg p-4 border border-red-500/30">
                  <h4 className="text-red-400 font-semibold mb-2">강한 PRZ 조건</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• 3개 이상 피보나치 레벨 수렴</li>
                    <li>• 0.382, 0.618, 0.786 포함</li>
                    <li>• 가격 범위 2% 이내</li>
                  </ul>
                </div>
                <div className="bg-yellow-600/20 rounded-lg p-4 border border-yellow-500/30">
                  <h4 className="text-yellow-400 font-semibold mb-2">중간 PRZ 조건</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• 2개 피보나치 레벨 수렴</li>
                    <li>• 주요 비율 1개 이상</li>
                    <li>• 가격 범위 3% 이내</li>
                  </ul>
                </div>
                <div className="bg-green-600/20 rounded-lg p-4 border border-green-500/30">
                  <h4 className="text-green-400 font-semibold mb-2">PRZ 진입 신호</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• 반전 캔들 패턴</li>
                    <li>• RSI 다이버전스</li>
                    <li>• 거래량 급증</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 패턴 종류 */}
      {activeSection === 'patterns' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-r from-green-600/10 to-teal-600/10 rounded-xl p-6 border border-green-500/30">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaCogs className="text-green-400" />
              6대 하모닉 패턴 완벽 가이드
            </h2>
            
            {/* 패턴 비교 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400">패턴</th>
                    <th className="text-center py-3 px-4 text-gray-400">XAB</th>
                    <th className="text-center py-3 px-4 text-gray-400">ABC</th>
                    <th className="text-center py-3 px-4 text-gray-400">BCD</th>
                    <th className="text-center py-3 px-4 text-gray-400">XAD</th>
                    <th className="text-center py-3 px-4 text-gray-400">승률</th>
                    <th className="text-center py-3 px-4 text-gray-400">난이도</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 text-white font-semibold">🦋 가틀리</td>
                    <td className="text-center py-3 px-4 text-gray-300">0.618</td>
                    <td className="text-center py-3 px-4 text-gray-300">0.382-0.886</td>
                    <td className="text-center py-3 px-4 text-gray-300">1.13-1.618</td>
                    <td className="text-center py-3 px-4 text-gray-300">0.786</td>
                    <td className="text-center py-3 px-4 text-green-400">70%</td>
                    <td className="text-center py-3 px-4 text-yellow-400">중간</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 text-white font-semibold">🦇 배트</td>
                    <td className="text-center py-3 px-4 text-gray-300">0.382-0.5</td>
                    <td className="text-center py-3 px-4 text-gray-300">0.382-0.886</td>
                    <td className="text-center py-3 px-4 text-gray-300">1.618-2.618</td>
                    <td className="text-center py-3 px-4 text-gray-300">0.886</td>
                    <td className="text-center py-3 px-4 text-green-400">72%</td>
                    <td className="text-center py-3 px-4 text-green-400">쉬움</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 text-white font-semibold">🦋 버터플라이</td>
                    <td className="text-center py-3 px-4 text-gray-300">0.786</td>
                    <td className="text-center py-3 px-4 text-gray-300">0.382-0.886</td>
                    <td className="text-center py-3 px-4 text-gray-300">1.618-2.618</td>
                    <td className="text-center py-3 px-4 text-gray-300">1.27-1.618</td>
                    <td className="text-center py-3 px-4 text-yellow-400">68%</td>
                    <td className="text-center py-3 px-4 text-yellow-400">중간</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 text-white font-semibold">🦀 크랩</td>
                    <td className="text-center py-3 px-4 text-gray-300">0.382-0.618</td>
                    <td className="text-center py-3 px-4 text-gray-300">0.382-0.886</td>
                    <td className="text-center py-3 px-4 text-gray-300">2.618-3.618</td>
                    <td className="text-center py-3 px-4 text-gray-300">1.618</td>
                    <td className="text-center py-3 px-4 text-green-400">78%</td>
                    <td className="text-center py-3 px-4 text-red-400">어려움</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 text-white font-semibold">🦈 샤크</td>
                    <td className="text-center py-3 px-4 text-gray-300">0.382-0.618</td>
                    <td className="text-center py-3 px-4 text-gray-300">1.13-1.618</td>
                    <td className="text-center py-3 px-4 text-gray-300">1.618-2.24</td>
                    <td className="text-center py-3 px-4 text-gray-300">0.886-1.13</td>
                    <td className="text-center py-3 px-4 text-yellow-400">65%</td>
                    <td className="text-center py-3 px-4 text-yellow-400">중간</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-white font-semibold">🔐 사이퍼</td>
                    <td className="text-center py-3 px-4 text-gray-300">0.382-0.618</td>
                    <td className="text-center py-3 px-4 text-gray-300">1.13-1.414</td>
                    <td className="text-center py-3 px-4 text-gray-300">1.272-2.0</td>
                    <td className="text-center py-3 px-4 text-gray-300">0.786</td>
                    <td className="text-center py-3 px-4 text-green-400">70%</td>
                    <td className="text-center py-3 px-4 text-red-400">어려움</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 패턴 선택 가이드 */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-3">초보자 추천 패턴</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>🦇 <span className="font-semibold">배트 패턴</span> - 명확한 0.886 되돌림</li>
                  <li>🦋 <span className="font-semibold">가틀리 패턴</span> - 가장 기본적인 패턴</li>
                </ul>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-purple-400 font-semibold mb-3">고급자 추천 패턴</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>🦀 <span className="font-semibold">크랩 패턴</span> - 높은 승률, 극단 움직임</li>
                  <li>🔐 <span className="font-semibold">사이퍼 패턴</span> - C 확장형 고급 패턴</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 트레이딩 전략 */}
      {activeSection === 'trading' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-r from-red-600/10 to-pink-600/10 rounded-xl p-6 border border-red-500/30">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaLightbulb className="text-red-400" />
              실전 트레이딩 전략
            </h2>

            {/* 진입 전략 */}
            <div className="space-y-6">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3">📍 진입 전략 (Entry Strategy)</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="text-green-400 font-semibold mb-2">1단계: 패턴 확인</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• 완성도 90% 이상 패턴만 진입</li>
                      <li>• 모든 피보나치 비율 허용 오차 5% 이내</li>
                      <li>• PRZ 영역 명확히 형성</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="text-yellow-400 font-semibold mb-2">2단계: 확인 신호</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• 반전 캔들 패턴 (핀바, 도지, 인걸핑)</li>
                      <li>• RSI 다이버전스 발생</li>
                      <li>• 거래량 급증 (평균 대비 150% 이상)</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="text-red-400 font-semibold mb-2">3단계: 포지션 진입</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• 분할 진입 (3회: 30%-40%-30%)</li>
                      <li>• 전체 자본의 2-3% 리스크</li>
                      <li>• 레버리지 최대 3배</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 손절/익절 전략 */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3">🎯 손절/익절 전략</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-900/30 rounded-lg p-3 border border-red-600/30">
                    <h4 className="text-red-400 font-semibold mb-2">손절 (Stop Loss)</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• X 포인트 10-20핍 밖</li>
                      <li>• 진입가 대비 -5% 이내</li>
                      <li>• ATR × 1.5 거리</li>
                      <li>• 트레일링 스탑 활용</li>
                    </ul>
                  </div>
                  <div className="bg-green-900/30 rounded-lg p-3 border border-green-600/30">
                    <h4 className="text-green-400 font-semibold mb-2">익절 (Take Profit)</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• TP1: 0.382 AD (30% 청산)</li>
                      <li>• TP2: 0.618 AD (40% 청산)</li>
                      <li>• TP3: 1.0 AD (30% 청산)</li>
                      <li>• 부분 익절 필수</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 리스크 관리 */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3">⚠️ 리스크 관리 철칙</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-purple-900/30 rounded-lg p-3">
                    <h4 className="text-purple-400 font-semibold mb-2">자금 관리</h4>
                    <ul className="space-y-1 text-xs text-gray-300">
                      <li>• 1회 거래 최대 2%</li>
                      <li>• 일일 최대 손실 6%</li>
                      <li>• 예비 자금 50% 확보</li>
                    </ul>
                  </div>
                  <div className="bg-blue-900/30 rounded-lg p-3">
                    <h4 className="text-blue-400 font-semibold mb-2">포지션 관리</h4>
                    <ul className="space-y-1 text-xs text-gray-300">
                      <li>• 동시 최대 3개 포지션</li>
                      <li>• 상관관계 높은 페어 제한</li>
                      <li>• 헤지 포지션 활용</li>
                    </ul>
                  </div>
                  <div className="bg-orange-900/30 rounded-lg p-3">
                    <h4 className="text-orange-400 font-semibold mb-2">심리 관리</h4>
                    <ul className="space-y-1 text-xs text-gray-300">
                      <li>• 감정 거래 금지</li>
                      <li>• 거래 일지 작성</li>
                      <li>• 쿨다운 타임 준수</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 시장 상황별 전략 */}
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">시장 상황별 최적 패턴</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-600/20 rounded-lg p-4 border border-green-500/30">
                <h4 className="text-green-400 font-semibold mb-2">🐂 상승장 (Bull Market)</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• 가틀리 패턴 (조정 후 상승)</li>
                  <li>• 배트 패턴 (깊은 조정 후 반등)</li>
                  <li>• 불리시 사이퍼 (상승 지속)</li>
                </ul>
              </div>
              <div className="bg-red-600/20 rounded-lg p-4 border border-red-500/30">
                <h4 className="text-red-400 font-semibold mb-2">🐻 하락장 (Bear Market)</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• 크랩 패턴 (극단적 반등)</li>
                  <li>• 버터플라이 (확장형 반등)</li>
                  <li>• 베어리시 샤크 (빠른 하락)</li>
                </ul>
              </div>
              <div className="bg-yellow-600/20 rounded-lg p-4 border border-yellow-500/30">
                <h4 className="text-yellow-400 font-semibold mb-2">📊 횡보장 (Range Market)</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• 모든 패턴 유효</li>
                  <li>• 짧은 타임프레임 활용</li>
                  <li>• 타이트한 손절 필수</li>
                </ul>
              </div>
              <div className="bg-purple-600/20 rounded-lg p-4 border border-purple-500/30">
                <h4 className="text-purple-400 font-semibold mb-2">⚡ 변동장 (Volatile Market)</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• 샤크 패턴 (빠른 진입/청산)</li>
                  <li>• 작은 포지션 사이즈</li>
                  <li>• 멀티 타임프레임 확인</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 트레이딩 심리 */}
      {activeSection === 'psychology' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-xl p-6 border border-indigo-500/30">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaBrain className="text-indigo-400" />
              트레이딩 심리학
            </h2>

            <div className="space-y-6">
              {/* 심리적 함정 */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3">🧠 트레이더의 심리적 함정</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="border-l-4 border-red-500 pl-3">
                      <h4 className="text-red-400 font-semibold">FOMO (Fear Of Missing Out)</h4>
                      <p className="text-sm text-gray-300">기회를 놓칠까 두려워 성급한 진입</p>
                      <p className="text-xs text-gray-400 mt-1">해결: 계획된 진입점 엄수</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-3">
                      <h4 className="text-yellow-400 font-semibold">복수 매매 (Revenge Trading)</h4>
                      <p className="text-sm text-gray-300">손실 회복을 위한 무리한 거래</p>
                      <p className="text-xs text-gray-400 mt-1">해결: 쿨다운 타임 적용</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="border-l-4 border-green-500 pl-3">
                      <h4 className="text-green-400 font-semibold">과신 (Overconfidence)</h4>
                      <p className="text-sm text-gray-300">연승 후 리스크 관리 소홀</p>
                      <p className="text-xs text-gray-400 mt-1">해결: 일관된 포지션 사이즈</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-3">
                      <h4 className="text-purple-400 font-semibold">분석 마비 (Analysis Paralysis)</h4>
                      <p className="text-sm text-gray-300">과도한 분석으로 기회 상실</p>
                      <p className="text-xs text-gray-400 mt-1">해결: 체크리스트 활용</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 성공 마인드셋 */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3">💎 성공적인 트레이더의 마인드셋</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <h4 className="text-indigo-400 font-semibold">과정 중심 사고</h4>
                      <p className="text-sm text-gray-300">결과보다 올바른 프로세스 실행에 집중</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📊</div>
                    <div>
                      <h4 className="text-indigo-400 font-semibold">확률적 사고</h4>
                      <p className="text-sm text-gray-300">개별 거래가 아닌 장기적 기댓값에 집중</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔄</div>
                    <div>
                      <h4 className="text-indigo-400 font-semibold">지속적 개선</h4>
                      <p className="text-sm text-gray-300">거래 일지 작성과 정기적 리뷰</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⚖️</div>
                    <div>
                      <h4 className="text-indigo-400 font-semibold">감정적 균형</h4>
                      <p className="text-sm text-gray-300">승리에 교만하지 않고 패배에 좌절하지 않기</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 거래 일지 템플릿 */}
              <div className="bg-indigo-600/20 rounded-lg p-4 border border-indigo-500/30">
                <h4 className="text-white font-semibold mb-3">📝 거래 일지 템플릿</h4>
                <div className="bg-gray-900/50 rounded p-3 text-sm text-gray-300 font-mono">
                  <div>날짜: 2024-01-15</div>
                  <div>패턴: 가틀리 패턴 (완성도 95%)</div>
                  <div>진입: $98,500 / 손절: $97,000 / 목표: $102,000</div>
                  <div>결과: +2.5% (TP2 도달)</div>
                  <div>감정 상태: 침착함 유지 ✓</div>
                  <div>개선점: PRZ 진입 타이밍 더 정확히</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* FAQ */}
      {activeSection === 'faq' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-xl p-6 border border-cyan-500/30">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaQuestionCircle className="text-cyan-400" />
              자주 묻는 질문 (FAQ)
            </h2>

            <div className="space-y-4">
              <details className="bg-gray-900/50 rounded-lg p-4 cursor-pointer">
                <summary className="text-white font-semibold">Q: 하모닉 패턴의 정확도는 얼마나 되나요?</summary>
                <p className="text-gray-300 mt-3">
                  평균적으로 65-75%의 승률을 보입니다. 크랩 패턴이 78%로 가장 높고, 샤크 패턴이 65%로 상대적으로 낮습니다. 
                  하지만 다른 기술적 지표와 함께 사용하면 정확도를 85%까지 높일 수 있습니다.
                </p>
              </details>

              <details className="bg-gray-900/50 rounded-lg p-4 cursor-pointer">
                <summary className="text-white font-semibold">Q: 어떤 타임프레임이 가장 효과적인가요?</summary>
                <p className="text-gray-300 mt-3">
                  4시간과 일봉 차트가 가장 신뢰도가 높습니다. 단기 트레이더는 1시간, 스윙 트레이더는 4시간-일봉, 
                  장기 투자자는 주봉을 권장합니다. 15분 이하는 노이즈가 많아 추천하지 않습니다.
                </p>
              </details>

              <details className="bg-gray-900/50 rounded-lg p-4 cursor-pointer">
                <summary className="text-white font-semibold">Q: 패턴이 실패하면 어떻게 대응해야 하나요?</summary>
                <p className="text-gray-300 mt-3">
                  즉시 손절하고 반대 방향 패턴을 찾아봅니다. 실패한 패턴은 종종 강한 반대 신호가 됩니다. 
                  손절 후에는 최소 30분의 쿨다운 타임을 가지고 감정을 정리한 후 다시 분석합니다.
                </p>
              </details>

              <details className="bg-gray-900/50 rounded-lg p-4 cursor-pointer">
                <summary className="text-white font-semibold">Q: 여러 패턴이 동시에 나타나면?</summary>
                <p className="text-gray-300 mt-3">
                  완성도가 높은 패턴을 우선시합니다. 같은 방향의 패턴이면 신뢰도가 높아지고, 
                  반대 방향이면 관망합니다. 일반적으로 크랩 &gt; 배트 &gt; 가틀리 순으로 우선순위를 둡니다.
                </p>
              </details>

              <details className="bg-gray-900/50 rounded-lg p-4 cursor-pointer">
                <summary className="text-white font-semibold">Q: 초보자가 시작하기 좋은 패턴은?</summary>
                <p className="text-gray-300 mt-3">
                  배트 패턴을 추천합니다. 0.886 XA 되돌림이 명확하고 승률이 72%로 높습니다. 
                  가틀리 패턴도 기본적이어서 좋습니다. 먼저 이 두 패턴을 마스터한 후 다른 패턴으로 확장하세요.
                </p>
              </details>

              <details className="bg-gray-900/50 rounded-lg p-4 cursor-pointer">
                <summary className="text-white font-semibold">Q: 레버리지는 얼마가 적당한가요?</summary>
                <p className="text-gray-300 mt-3">
                  초보자는 레버리지 없이, 중급자는 2-3배, 고급자도 최대 5배를 넘지 않기를 권장합니다. 
                  하모닉 패턴은 정확한 진입점을 제공하지만, 시장 변동성을 고려해 보수적인 레버리지를 사용하세요.
                </p>
              </details>

              <details className="bg-gray-900/50 rounded-lg p-4 cursor-pointer">
                <summary className="text-white font-semibold">Q: AI 도구를 사용하면 더 정확해지나요?</summary>
                <p className="text-gray-300 mt-3">
                  네, AI는 패턴 인식 속도와 정확도를 크게 향상시킵니다. 하지만 최종 판단은 트레이더가 해야 합니다. 
                  AI는 도구일 뿐, 시장 심리와 뉴스 같은 외부 요인은 인간이 더 잘 판단할 수 있습니다.
                </p>
              </details>
            </div>

            {/* 추가 리소스 */}
            <div className="mt-6 p-4 bg-cyan-600/20 rounded-lg border border-cyan-500/30">
              <h4 className="text-white font-semibold mb-2">📚 추천 학습 자료</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• "Harmonic Trading Vol.1-2" - Scott Carney</li>
                <li>• "Fibonacci Ratios with Pattern Recognition" - Larry Pesavento</li>
                <li>• "Profits in the Stock Market" - H.M. Gartley (원조 클래식)</li>
                <li>• TradingView 하모닉 패턴 인디케이터 활용</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}