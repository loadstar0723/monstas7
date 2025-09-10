'use client'

import React, { useState } from 'react'

const ConceptGuide = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('what')

  const sections = [
    {
      id: 'what',
      title: 'What is Sweep',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            스윕(Sweep)은 오더북의 특정 가격 수준에서 모든 유동성을 소진시키는 대량 시장 주문으로, 
            주로 기관이나 고래가 긴급한 포지션 진입 또는 청산을 위해 실행합니다.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-lg font-bold text-purple-400 mb-1">다중 레벨</div>
              <div className="text-sm text-gray-400">유동성 고갈</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-lg font-bold text-blue-400 mb-1">높은 영향</div>
              <div className="text-sm text-gray-400">가격 움직임</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-lg font-bold text-green-400 mb-1">기관</div>
              <div className="text-sm text-gray-400">대규모 플레이어</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-lg font-bold text-red-400 mb-1">긴급</div>
              <div className="text-sm text-gray-400">시간 민감</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'types',
      title: 'Sweep Types',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-red-900/20 p-4 rounded-lg border border-red-800/30">
            <h4 className="text-red-400 font-bold mb-2">공격적 스윕</h4>
            <p className="text-gray-300 text-sm">즉시 시장가 주문으로 높은 가격 충격</p>
          </div>
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/30">
            <h4 className="text-blue-400 font-bold mb-2">스텔스 스윕</h4>
            <p className="text-gray-300 text-sm">시장 충격 최소화를 위한 분할 실행</p>
          </div>
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-800/30">
            <h4 className="text-green-400 font-bold mb-2">래더 스윕</h4>
            <p className="text-gray-300 text-sm">여러 가격 수준에서 체계적 주문</p>
          </div>
          <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-800/30">
            <h4 className="text-purple-400 font-bold mb-2">빙산 스윕</h4>
            <p className="text-gray-300 text-sm">작은 가시적 부분으로 숨겨진 대량 주문</p>
          </div>
        </div>
      )
    },
    {
      id: 'detection',
      title: 'Detection Methods',
      content: (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-purple-900/20 to-transparent p-3 rounded-lg border-l-4 border-purple-500">
            <h5 className="text-purple-400 font-semibold mb-1">거래량 분석</h5>
            <p className="text-gray-300 text-sm">역대 평균을 초과하는 비정상적인 거래량 급증 모니터링</p>
          </div>
          <div className="bg-gradient-to-r from-blue-900/20 to-transparent p-3 rounded-lg border-l-4 border-blue-500">
            <h5 className="text-blue-400 font-semibold mb-1">오더북 깊이</h5>
            <p className="text-gray-300 text-sm">여러 가격 수준에서 유동성 소비 추적</p>
          </div>
          <div className="bg-gradient-to-r from-green-900/20 to-transparent p-3 rounded-lg border-l-4 border-green-500">
            <h5 className="text-green-400 font-semibold mb-1">가격 영향</h5>
            <p className="text-gray-300 text-sm">실행된 거래량 대비 가격 움직임 측정</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-900/20 to-transparent p-3 rounded-lg border-l-4 border-yellow-500">
            <h5 className="text-yellow-400 font-semibold mb-1">시간 분석</h5>
            <p className="text-gray-300 text-sm">짧은 시간 내 빠른 연속 거래 식별</p>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-sm text-purple-400 mb-2">시장 인텔리전스</h3>
        <h2 className="text-2xl font-bold text-white">스윕 감지 가이드</h2>
      </div>
      
      <div className="space-y-2">
        {sections.map((section, index) => (
          <div key={section.id} className="bg-gray-800/50 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700/50 transition-colors"
            >
              <span className="text-white font-medium">{section.title}</span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedSection === section.id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${
              expandedSection === section.id ? 'max-h-[1000px]' : 'max-h-0'
            }`}>
              <div className="px-4 py-4 bg-gray-900/30">
                {section.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConceptGuide