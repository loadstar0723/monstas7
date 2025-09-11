'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBook, FaChartLine, FaWaveSquare, FaGraduationCap, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function WaveTheory() {
  const [activeSection, setActiveSection] = useState('basic')

  // 충격파 데이터 생성
  const impulseWaveData = [
    { x: 0, y: 100, label: '시작' },
    { x: 10, y: 150, label: '1' },
    { x: 20, y: 125, label: '2' },
    { x: 35, y: 200, label: '3' },
    { x: 45, y: 175, label: '4' },
    { x: 60, y: 225, label: '5' },
  ]

  // 조정파 데이터 생성
  const correctiveWaveData = [
    { x: 0, y: 200, label: '시작' },
    { x: 15, y: 150, label: 'A' },
    { x: 30, y: 175, label: 'B' },
    { x: 45, y: 125, label: 'C' },
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaGraduationCap className="text-3xl text-purple-500" />
          <h2 className="text-2xl font-bold text-white">엘리엇 파동 이론 (Elliott Wave Theory)</h2>
        </div>
        
        <p className="text-gray-300 mb-4">
          랄프 넬슨 엘리엇(Ralph Nelson Elliott)이 1930년대에 개발한 기술적 분석 이론으로, 
          시장 가격이 특정한 파동 패턴을 따라 움직인다는 원리입니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-purple-400 font-bold mb-2">핵심 원리</div>
            <p className="text-gray-400 text-sm">
              시장은 5파동 충격파와 3파동 조정파의 8파동 사이클로 움직입니다
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-blue-400 font-bold mb-2">프랙탈 구조</div>
            <p className="text-gray-400 text-sm">
              모든 시간대에서 동일한 패턴이 반복되는 프랙탈 특성을 가집니다
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-green-400 font-bold mb-2">피보나치 관계</div>
            <p className="text-gray-400 text-sm">
              파동 간 길이와 시간이 피보나치 비율을 따릅니다
            </p>
          </div>
        </div>
      </motion.div>

      {/* 탭 메뉴 */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveSection('basic')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSection === 'basic'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          기본 개념
        </button>
        <button
          onClick={() => setActiveSection('impulse')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSection === 'impulse'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          충격파 (1-2-3-4-5)
        </button>
        <button
          onClick={() => setActiveSection('corrective')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSection === 'corrective'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          조정파 (A-B-C)
        </button>
        <button
          onClick={() => setActiveSection('rules')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSection === 'rules'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          3대 규칙
        </button>
      </div>

      {/* 컨텐츠 섹션 */}
      <AnimatePresence mode="wait">
        {activeSection === 'basic' && (
          <motion.div
            key="basic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaBook className="text-purple-500" />
                8파동 사이클
              </h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="font-bold text-white mb-1">충격파 (Impulse Waves)</div>
                  <p className="text-gray-400 text-sm mb-2">
                    주 추세 방향으로 움직이는 5개의 파동 (1-2-3-4-5)
                  </p>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 파동 1, 3, 5: 추세 방향</li>
                    <li>• 파동 2, 4: 조정 (반대 방향)</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="font-bold text-white mb-1">조정파 (Corrective Waves)</div>
                  <p className="text-gray-400 text-sm mb-2">
                    주 추세와 반대로 움직이는 3개의 파동 (A-B-C)
                  </p>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 파동 A, C: 조정 방향</li>
                    <li>• 파동 B: 반등</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-purple-900/20 rounded-lg">
                <p className="text-purple-300 text-sm">
                  💡 <strong>핵심:</strong> 5-3 패턴이 완성되면 더 큰 시간대의 한 파동이 됩니다
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">기본 사이클 차트</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={[
                    { x: 0, y: 100 },
                    { x: 5, y: 120 },
                    { x: 10, y: 110 },
                    { x: 15, y: 150 },
                    { x: 20, y: 140 },
                    { x: 25, y: 170 },
                    { x: 30, y: 150 },
                    { x: 35, y: 160 },
                    { x: 40, y: 140 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="x" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="y" 
                    stroke="#9333ea" 
                    strokeWidth={3}
                    dot={{ fill: '#9333ea', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">5</div>
                  <div className="text-gray-400 text-sm">충격파</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">3</div>
                  <div className="text-gray-400 text-sm">조정파</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'impulse' && (
          <motion.div
            key="impulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaChartLine className="text-purple-500" />
                충격파 패턴 (Impulse Wave Pattern)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="font-bold text-purple-400 mb-2">Wave 1 - 시작파</div>
                    <p className="text-gray-300 text-sm">
                      • 하락 추세 종료 후 첫 상승<br/>
                      • 보통 가장 짧은 파동<br/>
                      • 시장 심리: 회의적
                    </p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="font-bold text-orange-400 mb-2">Wave 2 - 첫 조정</div>
                    <p className="text-gray-300 text-sm">
                      • Wave 1의 38.2~61.8% 되돌림<br/>
                      • Wave 1 저점 아래로 내려갈 수 없음<br/>
                      • 시장 심리: 여전히 약세
                    </p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="font-bold text-green-400 mb-2">Wave 3 - 주 추진파</div>
                    <p className="text-gray-300 text-sm">
                      • 보통 가장 길고 강한 파동<br/>
                      • Wave 1의 161.8% 이상 확장<br/>
                      • 시장 심리: 강세 확신
                    </p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="font-bold text-yellow-400 mb-2">Wave 4 - 복잡한 조정</div>
                    <p className="text-gray-300 text-sm">
                      • Wave 3의 23.6~38.2% 되돌림<br/>
                      • Wave 1 고점과 겹칠 수 없음<br/>
                      • 시장 심리: 차익실현
                    </p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="font-bold text-blue-400 mb-2">Wave 5 - 마지막 추진</div>
                    <p className="text-gray-300 text-sm">
                      • Wave 1과 유사한 길이<br/>
                      • 다이버전스 발생 가능<br/>
                      • 시장 심리: 과도한 낙관
                    </p>
                  </div>
                </div>
                
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart 
                      data={impulseWaveData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="impulseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="x" hide />
                      <YAxis domain={[50, 250]} hide />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="y" 
                        stroke="#9333ea" 
                        strokeWidth={3}
                        fill="url(#impulseGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  <div className="bg-purple-900/20 rounded-lg p-3 mt-4">
                    <p className="text-purple-300 text-sm">
                      <strong>트레이딩 팁:</strong> Wave 3는 절대 가장 짧을 수 없으며, 
                      보통 가장 수익성이 높은 구간입니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'corrective' && (
          <motion.div
            key="corrective"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaWaveSquare className="text-blue-500" />
                조정파 패턴 (Corrective Wave Pattern)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="font-bold text-red-400 mb-2">Wave A - 첫 하락</div>
                    <p className="text-gray-300 text-sm">
                      • 5파동 충격파 또는 3파동 구조<br/>
                      • 추세 전환의 시작<br/>
                      • 시장 심리: 일시적 조정으로 인식
                    </p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="font-bold text-green-400 mb-2">Wave B - 반등</div>
                    <p className="text-gray-300 text-sm">
                      • Wave A의 50~61.8% 되돌림<br/>
                      • 3파동 구조가 일반적<br/>
                      • 시장 심리: 상승 재개 기대
                    </p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="font-bold text-red-400 mb-2">Wave C - 마지막 하락</div>
                    <p className="text-gray-300 text-sm">
                      • 5파동 충격파 구조<br/>
                      • Wave A의 100~161.8% 확장<br/>
                      • 시장 심리: 공포와 항복
                    </p>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-blue-900/20 rounded-lg">
                      <div className="font-bold text-blue-400 mb-1">지그재그 (Zigzag)</div>
                      <p className="text-gray-300 text-xs">5-3-5 구조, 급격한 조정</p>
                    </div>
                    <div className="p-3 bg-green-900/20 rounded-lg">
                      <div className="font-bold text-green-400 mb-1">플랫 (Flat)</div>
                      <p className="text-gray-300 text-xs">3-3-5 구조, 횡보 조정</p>
                    </div>
                    <div className="p-3 bg-purple-900/20 rounded-lg">
                      <div className="font-bold text-purple-400 mb-1">삼각형 (Triangle)</div>
                      <p className="text-gray-300 text-xs">3-3-3-3-3 구조, 수렴 패턴</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart 
                      data={correctiveWaveData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="correctiveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="x" hide />
                      <YAxis domain={[100, 220]} hide />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="y" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        fill="url(#correctiveGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  <div className="bg-red-900/20 rounded-lg p-3 mt-4">
                    <p className="text-red-300 text-sm">
                      <strong>주의:</strong> 조정파는 충격파보다 예측이 어렵고 
                      다양한 변형 패턴이 나타날 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'rules' && (
          <motion.div
            key="rules"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-xl p-6 border border-green-700/30">
              <div className="flex items-center gap-2 mb-4">
                <FaCheckCircle className="text-2xl text-green-500" />
                <h3 className="text-xl font-bold text-white">규칙 1</h3>
              </div>
              <div className="text-lg font-semibold text-green-400 mb-2">
                Wave 2는 Wave 1의 시작점 아래로 내려갈 수 없다
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Wave 2가 Wave 1의 시작점을 하회하면 카운팅이 무효가 됩니다.
              </p>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">
                  <strong>적용:</strong> 상승 추세에서 Wave 2의 저점은 항상 Wave 1의 시작점보다 높아야 함
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-xl p-6 border border-blue-700/30">
              <div className="flex items-center gap-2 mb-4">
                <FaCheckCircle className="text-2xl text-blue-500" />
                <h3 className="text-xl font-bold text-white">규칙 2</h3>
              </div>
              <div className="text-lg font-semibold text-blue-400 mb-2">
                Wave 3는 절대 가장 짧은 파동이 될 수 없다
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Wave 1, 3, 5 중에서 Wave 3가 가장 짧으면 안 되며, 대부분 가장 깁니다.
              </p>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">
                  <strong>특징:</strong> Wave 3는 보통 Wave 1의 1.618배 이상 확장
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-xl p-6 border border-purple-700/30">
              <div className="flex items-center gap-2 mb-4">
                <FaCheckCircle className="text-2xl text-purple-500" />
                <h3 className="text-xl font-bold text-white">규칙 3</h3>
              </div>
              <div className="text-lg font-semibold text-purple-400 mb-2">
                Wave 4는 Wave 1의 가격 영역과 겹칠 수 없다
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Wave 4의 저점이 Wave 1의 고점과 겹치면 충격파가 아닙니다.
              </p>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">
                  <strong>예외:</strong> 레버리지 시장에서는 약간의 중첩 허용
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 주의사항 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-700/30"
      >
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="text-yellow-500 text-xl mt-1" />
          <div>
            <div className="font-bold text-yellow-400 mb-1">중요 주의사항</div>
            <p className="text-gray-300 text-sm">
              엘리엇 파동 이론은 주관적 해석이 많이 개입되므로, 반드시 다른 기술적 지표와 함께 사용하세요. 
              파동 카운팅은 실시간으로 변경될 수 있으며, 항상 리스크 관리를 우선시해야 합니다.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}