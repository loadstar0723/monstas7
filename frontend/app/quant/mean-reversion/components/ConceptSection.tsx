'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConceptSectionProps {
  coinName: string
}

export default function ConceptSection({ coinName }: ConceptSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-purple-400">📚</span>
          평균회귀 전략이란?
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
        >
          {isExpanded ? '접기 ▲' : '자세히 보기 ▼'}
        </button>
      </div>

      <div className="space-y-4 text-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/30 rounded-lg p-4">
            <h3 className="text-purple-400 font-semibold mb-2">📊 핵심 원리</h3>
            <p className="text-sm">
              가격은 일시적으로 평균에서 벗어나더라도 결국 평균으로 회귀하는 경향이 있습니다.
            </p>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-2">🎯 적용 시점</h3>
            <p className="text-sm">
              {coinName}이 과매수/과매도 구간에 진입했을 때 역방향 포지션을 취합니다.
            </p>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2">💰 수익 원리</h3>
            <p className="text-sm">
              극단적 가격에서 진입하여 평균 회귀 시 수익을 실현합니다.
            </p>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-white mb-3">상세 전략 설명</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-purple-400 font-medium mb-1">1. 진입 조건</h4>
                      <ul className="text-sm space-y-1 text-gray-400">
                        <li>• 볼린저 밴드 하단 터치 시 매수</li>
                        <li>• Z-Score가 -2 이하일 때 매수</li>
                        <li>• RSI 30 이하 과매도 구간</li>
                        <li>• 200일 이동평균선 이탈률 10% 이상</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-blue-400 font-medium mb-1">2. 청산 조건</h4>
                      <ul className="text-sm space-y-1 text-gray-400">
                        <li>• 20일 이동평균 도달 시</li>
                        <li>• Z-Score 0 복귀 시</li>
                        <li>• RSI 50 도달 시</li>
                        <li>• 목표 수익률 3-5% 달성</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-green-400 font-medium mb-1">3. 리스크 관리</h4>
                      <ul className="text-sm space-y-1 text-gray-400">
                        <li>• 손절선: 진입가 대비 -3%</li>
                        <li>• 포지션 크기: 자본의 5-10%</li>
                        <li>• 최대 동시 포지션: 3개</li>
                        <li>• 레버리지: 최대 2배</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-orange-400 font-medium mb-1">4. 주의사항</h4>
                      <ul className="text-sm space-y-1 text-gray-400">
                        <li>• 트렌드 시장에서는 효과 감소</li>
                        <li>• 변동성 급증 시 손절 확대</li>
                        <li>• 뉴스 이벤트 전후 진입 금지</li>
                        <li>• 백테스팅 결과 확인 필수</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-700/30">
                <h4 className="text-yellow-400 font-medium mb-2">⚡ {coinName} 특별 전략</h4>
                <p className="text-sm text-gray-300">
                  {coinName}의 경우 높은 변동성을 활용하여 단기 평균회귀 전략이 효과적입니다. 
                  특히 4시간 봉 기준 볼린저 밴드 이탈 시 평균 회귀율이 85% 이상으로 높은 성공률을 보입니다.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}