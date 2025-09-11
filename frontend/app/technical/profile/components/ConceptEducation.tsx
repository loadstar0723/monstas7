'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBook, FaChartBar, FaBrain, FaLightbulb, FaGraduationCap,
  FaChevronRight, FaPlay, FaQuestionCircle, FaCheckCircle 
} from 'react-icons/fa'

interface ConceptSection {
  id: string
  title: string
  icon: any
  content: React.ReactNode
}

export default function ConceptEducation() {
  const [activeSection, setActiveSection] = useState('basics')
  const [completedSections, setCompletedSections] = useState<string[]>([])
  
  const markAsCompleted = (sectionId: string) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections([...completedSections, sectionId])
    }
  }
  
  const sections: ConceptSection[] = [
    {
      id: 'basics',
      title: '볼륨 프로파일 기초',
      icon: FaBook,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-white mb-3">볼륨 프로파일이란?</h4>
            <p className="text-gray-300 leading-relaxed mb-4">
              볼륨 프로파일(Volume Profile)은 특정 가격대에서 거래된 누적 거래량을 시각적으로 표현한 지표입니다. 
              전통적인 거래량 차트가 시간축에 따라 표시되는 반면, 볼륨 프로파일은 가격축에 따라 표시됩니다.
            </p>
            
            <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4 mb-4">
              <p className="text-purple-300 text-sm">
                💡 <strong>핵심 개념:</strong> 가격대별 거래량 분포를 통해 시장 참여자들의 관심 영역을 파악할 수 있습니다.
              </p>
            </div>
          </div>
          
          <div>
            <h5 className="text-lg font-semibold text-white mb-3">주요 구성 요소</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <h6 className="font-medium text-green-400">매수 볼륨 (Buy Volume)</h6>
                </div>
                <p className="text-gray-300 text-sm">
                  해당 가격대에서 매수 주문으로 체결된 거래량
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-red-500 rounded" />
                  <h6 className="font-medium text-red-400">매도 볼륨 (Sell Volume)</h6>
                </div>
                <p className="text-gray-300 text-sm">
                  해당 가격대에서 매도 주문으로 체결된 거래량
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4">
            <h6 className="font-medium text-white mb-2">왜 중요한가?</h6>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>시장의 균형점과 불균형 지점을 명확히 파악 가능</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>기관 투자자들의 포지션 구축 영역 추정</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>강력한 지지/저항 레벨 식별</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'poc-val-vah',
      title: 'POC, VAL, VAH 이해하기',
      icon: FaChartBar,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-white mb-3">핵심 3대 지표</h4>
            
            <div className="space-y-4">
              {/* POC */}
              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <FaChartBar className="text-yellow-400 text-xl" />
                  </div>
                  <div>
                    <h5 className="text-lg font-bold text-yellow-400">POC (Point of Control)</h5>
                    <p className="text-gray-400 text-sm">최대 거래량 발생 지점</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-3">
                  POC는 측정 기간 동안 가장 많은 거래량이 발생한 단일 가격 레벨입니다. 
                  이 지점은 시장의 '공정 가치(Fair Value)'로 간주됩니다.
                </p>
                <div className="bg-gray-800/50 rounded p-3">
                  <p className="text-sm text-gray-300">
                    <strong>트레이딩 활용:</strong> POC는 강력한 지지/저항으로 작용하며, 
                    가격이 POC에서 멀어질수록 다시 돌아올 확률이 높습니다.
                  </p>
                </div>
              </div>
              
              {/* Value Area */}
              <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <FaLightbulb className="text-purple-400 text-xl" />
                  </div>
                  <div>
                    <h5 className="text-lg font-bold text-purple-400">Value Area (VA)</h5>
                    <p className="text-gray-400 text-sm">전체 거래량의 70%가 발생한 구간</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-3">
                  Value Area는 전체 거래량의 약 70%가 거래된 가격 범위입니다. 
                  통계적으로 1 표준편차에 해당하는 구간입니다.
                </p>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-gray-800/50 rounded p-3">
                    <h6 className="font-medium text-purple-300 mb-1">VAH (Value Area High)</h6>
                    <p className="text-sm text-gray-300">
                      Value Area의 상단 경계선. 상향 돌파 시 추가 상승 기대
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded p-3">
                    <h6 className="font-medium text-purple-300 mb-1">VAL (Value Area Low)</h6>
                    <p className="text-sm text-gray-300">
                      Value Area의 하단 경계선. 하향 돌파 시 추가 하락 가능
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <h6 className="font-medium text-blue-400 mb-2">📊 실전 적용 예시</h6>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• 가격이 VA 내부: 균형 상태, 박스권 매매 전략</li>
              <li>• 가격이 VA 위: 상승 트렌드, VAH 재테스트 시 매수</li>
              <li>• 가격이 VA 아래: 하락 트렌드, VAL 재테스트 시 매도</li>
              <li>• POC 접근 시: 평균 회귀 전략 고려</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'hvn-lvn',
      title: 'HVN & LVN 활용법',
      icon: FaBrain,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-white mb-3">볼륨 노드 분석</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* HVN */}
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 font-bold">HVN</span>
                  </div>
                  <h5 className="text-lg font-bold text-blue-400">High Volume Node</h5>
                </div>
                <p className="text-gray-300 mb-3">
                  평균보다 높은 거래량이 발생한 가격대
                </p>
                
                <div className="space-y-2">
                  <div className="bg-gray-800/50 rounded p-3">
                    <h6 className="font-medium text-white mb-1">특징</h6>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• 강력한 지지/저항 역할</li>
                      <li>• 시장 참여자들의 관심 집중 구간</li>
                      <li>• 가격이 머무르기 쉬운 영역</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded p-3">
                    <h6 className="font-medium text-white mb-1">트레이딩 전략</h6>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• HVN 근처에서 포지션 진입 고려</li>
                      <li>• 돌파 실패 시 역방향 매매</li>
                      <li>• Range 트레이딩에 활용</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* LVN */}
              <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-orange-400 font-bold">LVN</span>
                  </div>
                  <h5 className="text-lg font-bold text-orange-400">Low Volume Node</h5>
                </div>
                <p className="text-gray-300 mb-3">
                  평균보다 낮은 거래량이 발생한 가격대
                </p>
                
                <div className="space-y-2">
                  <div className="bg-gray-800/50 rounded p-3">
                    <h6 className="font-medium text-white mb-1">특징</h6>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• 약한 지지/저항</li>
                      <li>• 빠른 가격 통과 구간</li>
                      <li>• 시장 불균형 지점</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded p-3">
                    <h6 className="font-medium text-white mb-1">트레이딩 전략</h6>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• 돌파 매매에 유리</li>
                      <li>• 빠른 가격 이동 예상</li>
                      <li>• 스톱로스 설정 주의</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-900/20 to-orange-900/20 rounded-lg p-4">
            <h6 className="font-medium text-white mb-3">🎯 HVN vs LVN 실전 비교</h6>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <p className="text-gray-400 mb-1">속성</p>
              </div>
              <div className="text-center">
                <p className="text-blue-400 mb-1">HVN</p>
              </div>
              <div className="text-center">
                <p className="text-orange-400 mb-1">LVN</p>
              </div>
              
              <div className="text-gray-300">가격 움직임</div>
              <div className="text-blue-300">느림, 횡보</div>
              <div className="text-orange-300">빠름, 추세</div>
              
              <div className="text-gray-300">지지/저항</div>
              <div className="text-blue-300">강함</div>
              <div className="text-orange-300">약함</div>
              
              <div className="text-gray-300">적합 전략</div>
              <div className="text-blue-300">Range 매매</div>
              <div className="text-orange-300">돌파 매매</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'advanced',
      title: '고급 활용 전략',
      icon: FaGraduationCap,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-white mb-3">전문가를 위한 고급 기법</h4>
            
            <div className="space-y-4">
              {/* TPO */}
              <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-lg p-4">
                <h5 className="text-lg font-bold text-indigo-400 mb-2">TPO (Time Price Opportunity)</h5>
                <p className="text-gray-300 mb-3">
                  시간대별 가격 분포를 알파벳으로 표현한 차트. 각 시간대(보통 30분)마다 
                  다른 문자를 사용하여 가격대별 거래 활동을 시각화합니다.
                </p>
                <div className="bg-gray-800/50 rounded p-3">
                  <p className="text-sm text-gray-300">
                    <strong>활용법:</strong> 초기 균형(IB), 확장 영역, 단일 출력 구조 등을 파악하여 
                    일중 트렌드와 반전 포인트를 예측
                  </p>
                </div>
              </div>
              
              {/* VPVR */}
              <div className="bg-teal-900/20 border border-teal-700/30 rounded-lg p-4">
                <h5 className="text-lg font-bold text-teal-400 mb-2">VPVR (Volume Profile Visible Range)</h5>
                <p className="text-gray-300 mb-3">
                  화면에 보이는 차트 범위의 볼륨 프로파일을 실시간으로 계산하여 표시. 
                  줌인/아웃에 따라 동적으로 업데이트됩니다.
                </p>
                <div className="bg-gray-800/50 rounded p-3">
                  <p className="text-sm text-gray-300">
                    <strong>활용법:</strong> 현재 보고 있는 시간대의 중요 레벨을 빠르게 파악. 
                    멀티 타임프레임 분석에 유용
                  </p>
                </div>
              </div>
              
              {/* 복합 전략 */}
              <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                <h5 className="text-lg font-bold text-green-400 mb-2">복합 지표 활용</h5>
                <div className="space-y-2 text-gray-300 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">1.</span>
                    <span><strong>VP + 델타:</strong> 매수/매도 볼륨 차이로 방향성 예측</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">2.</span>
                    <span><strong>VP + 오더플로우:</strong> 실시간 주문 흐름과 결합</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">3.</span>
                    <span><strong>VP + 풋프린트:</strong> 가격별 체결 내역 상세 분석</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h6 className="font-medium text-white mb-3">📈 시장 상황별 적용 가이드</h6>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-300 font-medium">상승 트렌드</p>
                  <p className="text-gray-400 text-sm">VAH 돌파 → POC를 지지선으로 활용 → 다음 HVN 목표</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-300 font-medium">하락 트렌드</p>
                  <p className="text-gray-400 text-sm">VAL 하향 돌파 → POC를 저항선으로 → LVN에서 가속</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-300 font-medium">횡보장</p>
                  <p className="text-gray-400 text-sm">VA 내부 왕복 → POC 중심 평균 회귀 → HVN에서 반전</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]
  
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">볼륨 프로파일 마스터 클래스</h2>
            <p className="text-gray-300">
              초보자부터 전문가까지, 단계별로 배우는 볼륨 프로파일의 모든 것
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-400">
              {completedSections.length}/{sections.length}
            </div>
            <p className="text-sm text-gray-400">완료된 섹션</p>
          </div>
        </div>
        
        {/* 진행률 바 */}
        <div className="mt-4 bg-gray-800 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completedSections.length / sections.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 섹션 네비게이션 */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 sticky top-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaBook className="text-purple-400" />
              학습 과정
            </h3>
            
            <div className="space-y-2">
              {sections.map((section, index) => {
                const Icon = section.icon
                const isCompleted = completedSections.includes(section.id)
                const isActive = activeSection === section.id
                
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id)
                      markAsCompleted(section.id)
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                    } border`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-purple-500/30' : 'bg-gray-700'
                      }`}>
                        {isCompleted ? (
                          <FaCheckCircle className="text-green-400" />
                        ) : (
                          <Icon className={isActive ? 'text-purple-400' : 'text-gray-400'} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          isActive ? 'text-white' : 'text-gray-300'
                        }`}>
                          {section.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          챕터 {index + 1}
                        </p>
                      </div>
                      {isActive && (
                        <FaChevronRight className="text-purple-400" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            
            {/* 학습 팁 */}
            <div className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-700/30">
              <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                <FaLightbulb />
                학습 팁
              </h4>
              <p className="text-gray-300 text-sm">
                각 섹션을 차례대로 학습하시면 더 효과적입니다. 
                실제 차트와 함께 보면서 연습해보세요!
              </p>
            </div>
          </div>
        </div>
        
        {/* 컨텐츠 영역 */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
            >
              {sections.find(s => s.id === activeSection)?.content}
              
              {/* 하단 네비게이션 */}
              <div className="mt-6 pt-6 border-t border-gray-700 flex items-center justify-between">
                <button
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === activeSection)
                    if (currentIndex > 0) {
                      const prevSection = sections[currentIndex - 1]
                      setActiveSection(prevSection.id)
                      markAsCompleted(prevSection.id)
                    }
                  }}
                  disabled={sections.findIndex(s => s.id === activeSection) === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronRight className="rotate-180" />
                  이전
                </button>
                
                <div className="flex items-center gap-2">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        section.id === activeSection
                          ? 'bg-purple-400 w-8'
                          : completedSections.includes(section.id)
                          ? 'bg-green-400'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === activeSection)
                    if (currentIndex < sections.length - 1) {
                      const nextSection = sections[currentIndex + 1]
                      setActiveSection(nextSection.id)
                      markAsCompleted(nextSection.id)
                    }
                  }}
                  disabled={sections.findIndex(s => s.id === activeSection) === sections.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                  <FaChevronRight />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}