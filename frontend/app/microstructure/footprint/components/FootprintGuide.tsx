'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaBook, FaChartLine, FaGraduationCap, FaLightbulb, FaChevronRight, FaChevronDown } from 'react-icons/fa'

interface GuideSection {
  id: string
  title: string
  icon: React.ElementType
  content: React.ReactNode
}

export default function FootprintGuide() {
  const [expandedSection, setExpandedSection] = useState<string | null>('basics')
  
  const sections: GuideSection[] = [
    {
      id: 'basics',
      title: '풋프린트 차트 기초',
      icon: FaBook,
      content: (
        <div className="space-y-4 text-sm text-gray-400">
          <p>
            풋프린트 차트는 시장 미시구조 분석의 핵심 도구로, 각 가격대에서 발생한 매수/매도 거래량을 
            시각적으로 표현합니다. 이를 통해 단순한 가격 차트에서는 볼 수 없는 시장 내부의 역학을 파악할 수 있습니다.
          </p>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h5 className="font-medium text-white mb-2">주요 구성 요소</h5>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-white">X축 (시간)</strong>: 거래가 발생한 시간대</li>
              <li><strong className="text-white">Y축 (가격)</strong>: 거래가 체결된 가격 레벨</li>
              <li><strong className="text-white">셀 색상</strong>: 매수(녹색) vs 매도(빨강) 압력의 강도</li>
              <li><strong className="text-white">셀 내부 숫자</strong>: 델타값 (매수량 - 매도량)</li>
            </ul>
          </div>
          
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <p className="text-purple-400">
              💡 <strong>핵심 개념</strong>: 풋프린트 차트는 "누가 주도권을 가지고 있는가?"를 보여줍니다. 
              큰 매수 델타는 공격적인 매수자를, 큰 매도 델타는 공격적인 매도자를 나타냅니다.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'delta',
      title: '델타 분석 이해하기',
      icon: FaChartLine,
      content: (
        <div className="space-y-4 text-sm text-gray-400">
          <p>
            델타는 매수량과 매도량의 차이를 나타내는 핵심 지표입니다. 양수 델타는 매수 압력이, 
            음수 델타는 매도 압력이 우세함을 의미합니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h5 className="font-medium text-green-400 mb-2">양수 델타 (+)</h5>
              <ul className="space-y-1 text-xs">
                <li>• 공격적인 매수자가 우세</li>
                <li>• 가격 상승 압력 존재</li>
                <li>• 강한 수요 신호</li>
              </ul>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h5 className="font-medium text-red-400 mb-2">음수 델타 (-)</h5>
              <ul className="space-y-1 text-xs">
                <li>• 공격적인 매도자가 우세</li>
                <li>• 가격 하락 압력 존재</li>
                <li>• 강한 공급 신호</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h5 className="font-medium text-white mb-2">델타 다이버전스</h5>
            <p>
              가격과 누적 델타가 서로 다른 방향으로 움직이는 현상으로, 추세 전환의 중요한 신호입니다:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong className="text-yellow-400">강세 다이버전스</strong>: 가격은 하락하지만 델타는 증가</li>
              <li><strong className="text-yellow-400">약세 다이버전스</strong>: 가격은 상승하지만 델타는 감소</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'poc',
      title: 'POC와 밸류 에어리어',
      icon: FaGraduationCap,
      content: (
        <div className="space-y-4 text-sm text-gray-400">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h5 className="font-medium text-yellow-400 mb-2">POC (Point of Control)</h5>
            <p>
              POC는 가장 많은 거래가 발생한 가격대로, 시장이 인정하는 '공정 가치'를 나타냅니다. 
              POC는 강력한 지지/저항 역할을 하며, 가격이 POC로 회귀하려는 경향이 있습니다.
            </p>
          </div>
          
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h5 className="font-medium text-purple-400 mb-2">밸류 에어리어 (Value Area)</h5>
            <p>
              전체 거래량의 70%가 집중된 가격 구간입니다. 이 구간은:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>시장 참여자들이 가장 활발하게 거래한 '균형 구간'</li>
              <li>밸류 상단/하단은 중요한 지지/저항 레벨</li>
              <li>가격이 밸류 에어리어를 벗어나면 새로운 추세 시작 가능성</li>
            </ul>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h5 className="font-medium text-white mb-2">활용 전략</h5>
            <ul className="list-disc list-inside space-y-1">
              <li>가격이 POC 아래: 매수 기회 모색</li>
              <li>가격이 POC 위: 매도 기회 모색</li>
              <li>밸류 에어리어 상단 돌파: 롱 포지션 고려</li>
              <li>밸류 에어리어 하단 이탈: 숏 포지션 고려</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'strategies',
      title: '실전 트레이딩 전략',
      icon: FaLightbulb,
      content: (
        <div className="space-y-4 text-sm text-gray-400">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h5 className="font-medium text-white mb-3">1. 임밸런스 전략</h5>
            <p className="mb-2">
              극단적인 매수/매도 임밸런스를 활용한 진입 전략:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>델타 &gt; +100: 강한 매수 압력, 추가 상승 기대</li>
              <li>델타 &lt; -100: 강한 매도 압력, 추가 하락 기대</li>
              <li>진입: 임밸런스 방향으로 포지션</li>
              <li>손절: 반대 임밸런스 발생 시</li>
            </ul>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h5 className="font-medium text-white mb-3">2. 흡수 패턴 전략</h5>
            <p className="mb-2">
              대량 거래가 가격 변동 없이 흡수되는 패턴:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>매도 흡수: 큰 매도에도 가격 유지 → 상승 신호</li>
              <li>매수 흡수: 큰 매수에도 가격 유지 → 하락 신호</li>
              <li>진입: 흡수 후 반대 방향으로</li>
              <li>목표가: 이전 고점/저점</li>
            </ul>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h5 className="font-medium text-white mb-3">3. 밸류 에어리어 회귀 전략</h5>
            <p className="mb-2">
              가격이 밸류 에어리어로 돌아오는 속성 활용:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>가격이 밸류 에어리어 위: 숏 진입 대기</li>
              <li>가격이 밸류 에어리어 아래: 롱 진입 대기</li>
              <li>목표가: POC (Point of Control)</li>
              <li>손절: 밸류 에어리어 반대편 끝</li>
            </ul>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400">
              ⚠️ <strong>리스크 관리</strong>: 모든 전략에서 포지션 크기는 전체 자본의 2-5%로 제한하고, 
              반드시 손절가를 설정하세요. 풋프린트 차트는 강력한 도구지만, 다른 지표와 함께 사용할 때 
              더욱 효과적입니다.
            </p>
          </div>
        </div>
      )
    }
  ]
  
  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  return (
    <div className="space-y-6">
      {/* 가이드 헤더 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-2xl font-bold mb-4">풋프린트 차트 완벽 가이드</h3>
        <p className="text-gray-400">
          풋프린트 차트를 마스터하여 시장의 숨겨진 패턴을 발견하고, 더 나은 트레이딩 결정을 내리세요.
        </p>
      </div>

      {/* 가이드 섹션들 */}
      <div className="space-y-4">
        {sections.map(section => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <section.icon className="text-purple-400 text-xl" />
                <h4 className="font-medium text-white">{section.title}</h4>
              </div>
              {expandedSection === section.id ? (
                <FaChevronDown className="text-gray-400" />
              ) : (
                <FaChevronRight className="text-gray-400" />
              )}
            </button>
            
            {expandedSection === section.id && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="px-6 pb-6"
              >
                {section.content}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* 실습 권장사항 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30">
        <h4 className="font-medium text-white mb-3">💡 실습 권장사항</h4>
        <div className="space-y-2 text-sm text-gray-400">
          <p>
            1. <strong className="text-white">관찰부터 시작</strong>: 
            먼저 차트를 보면서 패턴을 익히세요
          </p>
          <p>
            2. <strong className="text-white">작은 포지션으로 연습</strong>: 
            이론을 실제로 적용할 때는 최소 금액으로
          </p>
          <p>
            3. <strong className="text-white">기록과 분석</strong>: 
            모든 거래를 기록하고 패턴을 분석하세요
          </p>
          <p>
            4. <strong className="text-white">지속적인 학습</strong>: 
            시장은 계속 변화하므로 꾸준히 공부하세요
          </p>
        </div>
      </div>

      {/* 추가 리소스 */}
      <div className="bg-gray-700/30 rounded-xl p-6">
        <h4 className="font-medium text-white mb-3">📚 추가 학습 리소스</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="text-purple-400 mb-2">기초 개념</h5>
            <ul className="space-y-1 text-gray-400">
              <li>• 오더플로우 기초</li>
              <li>• 마켓 프로파일 이론</li>
              <li>• 볼륨 분석 기법</li>
            </ul>
          </div>
          <div>
            <h5 className="text-purple-400 mb-2">고급 전략</h5>
            <ul className="space-y-1 text-gray-400">
              <li>• 기관 거래 추적</li>
              <li>• 고빈도 거래 패턴</li>
              <li>• 시장 조작 감지</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}