'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBookOpen, FaChevronDown, FaChevronUp, FaExclamationTriangle, 
  FaShieldAlt, FaLightbulb, FaBalanceScale 
} from 'react-icons/fa'

export default function ConceptGuide() {
  const [expanded, setExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState('what')
  
  const tabs = [
    { id: 'what', label: '스푸핑이란?', icon: <FaBookOpen /> },
    { id: 'how', label: '작동 원리', icon: <FaLightbulb /> },
    { id: 'types', label: '유형 분류', icon: <FaShieldAlt /> },
    { id: 'legal', label: '법적 이슈', icon: <FaBalanceScale /> }
  ]
  
  const renderContent = () => {
    switch (activeTab) {
      case 'what':
        return (
          <div className="space-y-4">
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800">
              <h4 className="text-purple-400 font-semibold mb-2">📌 핵심 정의</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                스푸핑(Spoofing)은 시장 조작의 한 형태로, 거래할 의도 없이 대량의 주문을 넣어 
                다른 트레이더들에게 잘못된 시장 신호를 주는 행위입니다. 주문은 체결 직전에 취소됩니다.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h5 className="text-green-400 font-semibold mb-2">✅ 정상 주문</h5>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 실제 거래 의도 있음</li>
                  <li>• 시장가격에 근접</li>
                  <li>• 체결까지 유지</li>
                  <li>• 합리적인 수량</li>
                </ul>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h5 className="text-red-400 font-semibold mb-2">❌ 스푸핑 주문</h5>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 거래 의도 없음</li>
                  <li>• 시장가격과 거리</li>
                  <li>• 빠른 취소 (1초 이내)</li>
                  <li>• 비정상적 대량</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-yellow-500 mt-1" />
                <div>
                  <h5 className="text-yellow-400 font-semibold mb-1">시장 영향</h5>
                  <p className="text-gray-300 text-sm">
                    스푸핑은 인위적인 수요/공급을 만들어 가격을 조작하고, 
                    진짜 투자자들의 판단을 흐리게 합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'how':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-3">🔄 스푸핑 프로세스</h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <div className="flex-1">
                    <h5 className="text-white font-semibold">대량 주문 배치</h5>
                    <p className="text-gray-400 text-sm">목표 가격 반대편에 큰 주문을 여러 개 배치</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  <div className="flex-1">
                    <h5 className="text-white font-semibold">시장 반응 유도</h5>
                    <p className="text-gray-400 text-sm">다른 트레이더들이 가짜 유동성을 보고 반응</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                  <div className="flex-1">
                    <h5 className="text-white font-semibold">실제 거래 실행</h5>
                    <p className="text-gray-400 text-sm">조작된 가격에서 반대 포지션 진입</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                  <div className="flex-1">
                    <h5 className="text-white font-semibold">가짜 주문 취소</h5>
                    <p className="text-gray-400 text-sm">체결 직전에 모든 가짜 주문 취소</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-900/20 rounded-lg p-4">
                <h5 className="text-green-400 font-semibold mb-2">📈 매수 스푸핑</h5>
                <p className="text-gray-300 text-sm">
                  대량 매수 주문으로 가격 상승 유도 → 높은 가격에 매도
                </p>
              </div>
              
              <div className="bg-red-900/20 rounded-lg p-4">
                <h5 className="text-red-400 font-semibold mb-2">📉 매도 스푸핑</h5>
                <p className="text-gray-300 text-sm">
                  대량 매도 주문으로 가격 하락 유도 → 낮은 가격에 매수
                </p>
              </div>
            </div>
          </div>
        )
        
      case 'types':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h5 className="text-purple-400 font-semibold mb-2">🔸 레이어링 (Layering)</h5>
                <p className="text-gray-300 text-sm mb-2">
                  여러 가격대에 걸쳐 주문을 층층이 배치하는 전략
                </p>
                <div className="bg-black/30 rounded p-2">
                  <code className="text-xs text-green-400">
                    예: $100.10, $100.20, $100.30에 각각 대량 매도 주문
                  </code>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h5 className="text-purple-400 font-semibold mb-2">🔸 플래시 오더 (Flash Orders)</h5>
                <p className="text-gray-300 text-sm mb-2">
                  1초 이내로 나타났다 사라지는 초단기 주문
                </p>
                <div className="bg-black/30 rounded p-2">
                  <code className="text-xs text-green-400">
                    예: 100 BTC 매수 주문 → 0.5초 후 취소
                  </code>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h5 className="text-purple-400 font-semibold mb-2">🔸 모멘텀 이그니션 (Momentum Ignition)</h5>
                <p className="text-gray-300 text-sm mb-2">
                  연속적인 주문으로 가격 움직임을 시작시키는 전략
                </p>
                <div className="bg-black/30 rounded p-2">
                  <code className="text-xs text-green-400">
                    예: 작은 매수 → 큰 매수 주문 → 추가 매수로 상승 유도
                  </code>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h5 className="text-purple-400 font-semibold mb-2">🔸 페인팅 더 테이프 (Painting the Tape)</h5>
                <p className="text-gray-300 text-sm mb-2">
                  자전거래(워시 트레이딩)로 거래량 조작
                </p>
                <div className="bg-black/30 rounded p-2">
                  <code className="text-xs text-green-400">
                    예: 동일 주체가 매수/매도 반복하여 거래량 부풀리기
                  </code>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'legal':
        return (
          <div className="space-y-4">
            <div className="bg-red-900/20 rounded-lg p-4 border border-red-800">
              <h4 className="text-red-400 font-semibold mb-2">⚖️ 법적 제재</h4>
              <p className="text-gray-300 text-sm mb-3">
                스푸핑은 대부분 국가에서 불법 시장 조작 행위로 간주됩니다.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <div>
                    <strong className="text-white">미국:</strong>
                    <span className="text-gray-400 text-sm"> Dodd-Frank Act 하에 금지, 최대 100만 달러 벌금</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <div>
                    <strong className="text-white">EU:</strong>
                    <span className="text-gray-400 text-sm"> MAR 규정 위반, 최대 500만 유로 벌금</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <div>
                    <strong className="text-white">한국:</strong>
                    <span className="text-gray-400 text-sm"> 자본시장법 위반, 10년 이하 징역 또는 5억원 이하 벌금</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800">
              <h4 className="text-yellow-400 font-semibold mb-2">📊 실제 처벌 사례</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 2020년: JP Morgan, 스푸핑으로 9.2억 달러 벌금</li>
                <li>• 2019년: Tower Research, 6,750만 달러 벌금</li>
                <li>• 2018년: UBS/Deutsche Bank/HSBC, 총 4,680만 달러 벌금</li>
                <li>• 2016년: Navinder Sarao, Flash Crash 관련 징역형</li>
              </ul>
            </div>
            
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800">
              <h4 className="text-blue-400 font-semibold mb-2">🛡️ 규제 기관 감시</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-300">• SEC (미국)</div>
                <div className="text-gray-300">• CFTC (미국)</div>
                <div className="text-gray-300">• FCA (영국)</div>
                <div className="text-gray-300">• ESMA (EU)</div>
                <div className="text-gray-300">• FSS (한국)</div>
                <div className="text-gray-300">• JFSA (일본)</div>
              </div>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/70 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <FaBookOpen className="text-purple-400 text-xl" />
          <h3 className="text-lg font-bold text-white">스푸핑 감지 가이드</h3>
        </div>
        {expanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              {/* 탭 네비게이션 */}
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-900/30 text-purple-400 border border-purple-700'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>
              
              {/* 탭 콘텐츠 */}
              <div className="min-h-[300px]">
                {renderContent()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}