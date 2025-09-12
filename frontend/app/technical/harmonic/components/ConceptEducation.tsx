'use client'

import { motion } from 'framer-motion'
import { FaInfoCircle, FaChartLine, FaGraduationCap, FaLightbulb } from 'react-icons/fa'

export default function ConceptEducation() {
  const patterns = [
    {
      name: '가틀리 패턴 (Gartley Pattern)',
      icon: '🦋',
      description: '가장 일반적인 하모닉 패턴으로 H.M. Gartley가 1935년 발견',
      ratios: {
        XAB: '0.618',
        ABC: '0.382-0.886',
        BCD: '1.13-1.618',
        XAD: '0.786'
      },
      characteristics: [
        'X-A-B-C-D 5개 포인트로 구성',
        'D 포인트가 0.786 XA 되돌림에 위치',
        '높은 승률과 안정적인 리스크/리워드 비율',
        '주요 지지/저항 구간에서 자주 발생'
      ],
      tradingTips: [
        'D 포인트 근처에서 진입 준비',
        '손절은 X 포인트 약간 너머',
        '목표가는 0.382, 0.618 AD 되돌림'
      ]
    },
    {
      name: '배트 패턴 (Bat Pattern)',
      icon: '🦇',
      description: 'Scott Carney가 2001년 발견한 정확도 높은 패턴',
      ratios: {
        XAB: '0.382-0.5',
        ABC: '0.382-0.886',
        BCD: '1.618-2.618',
        XAD: '0.886'
      },
      characteristics: [
        '0.886 XA 되돌림이 핵심',
        '가틀리보다 깊은 되돌림',
        '매우 정확한 PRZ (Potential Reversal Zone)',
        '높은 승률의 보수적 패턴'
      ],
      tradingTips: [
        '0.886 XA 레벨에서 정확한 진입',
        'PRZ 내에서 추가 확인 신호 대기',
        '부분 익절 전략 활용'
      ]
    },
    {
      name: '버터플라이 패턴 (Butterfly Pattern)',
      icon: '🦋',
      description: 'Bryce Gilmore가 발견한 확장 패턴',
      ratios: {
        XAB: '0.786',
        ABC: '0.382-0.886',
        BCD: '1.618-2.618',
        XAD: '1.27-1.618'
      },
      characteristics: [
        'D 포인트가 X를 넘어서는 확장 패턴',
        '강한 반전 신호 제공',
        '큰 수익 잠재력',
        '트렌드 끝에서 자주 발생'
      ],
      tradingTips: [
        '1.27 XA 확장에서 1차 진입',
        '1.618 XA에서 추가 진입 고려',
        '적극적인 포지션 관리 필요'
      ]
    },
    {
      name: '크랩 패턴 (Crab Pattern)',
      icon: '🦀',
      description: 'Scott Carney가 2000년 발견한 가장 정확한 패턴',
      ratios: {
        XAB: '0.382-0.618',
        ABC: '0.382-0.886',
        BCD: '2.618-3.618',
        XAD: '1.618'
      },
      characteristics: [
        '극단적인 확장 패턴',
        '1.618 XA 확장이 특징',
        '가장 높은 정확도',
        '강력한 반전 지점'
      ],
      tradingTips: [
        '1.618 XA 레벨 주목',
        '극단적 과매수/과매도 구간',
        '타이트한 손절 설정'
      ]
    },
    {
      name: '샤크 패턴 (Shark Pattern)',
      icon: '🦈',
      description: 'Scott Carney가 2011년 발견한 신규 패턴',
      ratios: {
        XAB: '0.382-0.618',
        ABC: '1.13-1.618',
        BCD: '1.618-2.24',
        XAD: '0.886-1.13'
      },
      characteristics: [
        '5-0 패턴과 유사',
        'C 포인트가 AB를 넘어서는 특징',
        '빠른 진입과 청산 필요',
        '급격한 가격 움직임'
      ],
      tradingTips: [
        '0.886 XC 레벨 주목',
        '빠른 수익 실현',
        '엄격한 리스크 관리'
      ]
    },
    {
      name: '사이퍼 패턴 (Cypher Pattern)',
      icon: '🔐',
      description: 'Darren Oglesbee가 발견한 고급 패턴',
      ratios: {
        XAB: '0.382-0.618',
        ABC: '1.13-1.414',
        BCD: '1.272-2.0',
        XAD: '0.786'
      },
      characteristics: [
        'C 포인트가 A를 넘어서는 특징',
        '0.786 XC 되돌림이 핵심',
        '높은 승률',
        '명확한 진입 규칙'
      ],
      tradingTips: [
        '0.786 XC 레벨에서 진입',
        'AB=CD 패턴과 결합 분석',
        '단계별 익절 전략'
      ]
    }
  ]

  const fibonacciConcepts = [
    {
      title: '피보나치 수열',
      content: '0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...',
      description: '각 숫자는 앞의 두 숫자의 합'
    },
    {
      title: '황금비율',
      content: '1.618 (φ)',
      description: '자연과 예술에서 발견되는 완벽한 비율'
    },
    {
      title: '주요 되돌림 레벨',
      content: '23.6%, 38.2%, 50%, 61.8%, 78.6%',
      description: '가격 되돌림의 주요 저항/지지 구간'
    },
    {
      title: '확장 레벨',
      content: '127.2%, 161.8%, 261.8%, 423.6%',
      description: '목표가 설정에 사용되는 확장 비율'
    }
  ]

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl p-6 border border-purple-500/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaGraduationCap className="text-3xl text-purple-400" />
          <h2 className="text-2xl font-bold text-white">하모닉 패턴 완벽 가이드</h2>
        </div>
        <p className="text-gray-300 leading-relaxed">
          하모닉 패턴은 피보나치 수열과 기하학적 패턴을 결합한 고급 기술적 분석 도구입니다. 
          각 패턴은 특정 피보나치 비율을 따르며, 높은 확률의 반전 지점을 예측합니다.
        </p>
      </motion.div>

      {/* 피보나치 기초 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          피보나치 기초 개념
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fibonacciConcepts.map((concept, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
            >
              <h4 className="text-sm text-purple-400 mb-2">{concept.title}</h4>
              <div className="text-xl font-bold text-white mb-2">{concept.content}</div>
              <p className="text-xs text-gray-400">{concept.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 패턴별 상세 설명 */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FaChartLine className="text-blue-400" />
          6대 하모닉 패턴 상세 분석
        </h3>
        
        {patterns.map((pattern, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{pattern.icon}</div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white mb-2">{pattern.name}</h4>
                <p className="text-gray-400 mb-4">{pattern.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* 피보나치 비율 */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-purple-400 mb-2">피보나치 비율</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">XAB:</span>
                        <span className="text-white font-mono">{pattern.ratios.XAB}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">ABC:</span>
                        <span className="text-white font-mono">{pattern.ratios.ABC}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">BCD:</span>
                        <span className="text-white font-mono">{pattern.ratios.BCD}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">XAD:</span>
                        <span className="text-white font-mono">{pattern.ratios.XAD}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 특징 */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-blue-400 mb-2">주요 특징</h5>
                    <ul className="space-y-1">
                      {pattern.characteristics.map((char, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start gap-1">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* 트레이딩 팁 */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-green-400 mb-2">트레이딩 전략</h5>
                    <ul className="space-y-1">
                      {pattern.tradingTips.map((tip, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start gap-1">
                          <span className="text-green-400 mt-0.5">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* PRZ 설명 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-6 border border-blue-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaInfoCircle className="text-blue-400" />
          PRZ (Potential Reversal Zone) 이해하기
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-purple-400 font-semibold mb-2">PRZ란?</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              PRZ는 여러 피보나치 레벨이 수렴하는 구간으로, 가격 반전 가능성이 가장 높은 영역입니다. 
              좁은 PRZ일수록 더 강한 반전 신호를 제공합니다.
            </p>
          </div>
          <div>
            <h4 className="text-purple-400 font-semibold mb-2">PRZ 활용법</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• PRZ 내에서 추가 확인 신호 대기</li>
              <li>• 캔들 패턴, 다이버전스 확인</li>
              <li>• 단계적 진입으로 리스크 분산</li>
              <li>• PRZ 벗어나면 즉시 손절</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* 실전 트레이딩 가이드 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">🎯 실전 트레이딩 체크리스트</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-600/10 rounded-lg p-4 border border-green-500/30">
            <h4 className="text-green-400 font-semibold mb-2">진입 전</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>✓ 패턴 완성도 확인 (90% 이상)</li>
              <li>✓ PRZ 도달 확인</li>
              <li>✓ 추가 지표 확인 (RSI, MACD)</li>
              <li>✓ 거래량 증가 여부</li>
            </ul>
          </div>
          <div className="bg-yellow-600/10 rounded-lg p-4 border border-yellow-500/30">
            <h4 className="text-yellow-400 font-semibold mb-2">포지션 관리</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>⚡ 자본금의 2-3% 리스크</li>
              <li>⚡ 3단계 분할 진입</li>
              <li>⚡ 손절: X 포인트 너머</li>
              <li>⚡ Risk/Reward 1:2 이상</li>
            </ul>
          </div>
          <div className="bg-red-600/10 rounded-lg p-4 border border-red-500/30">
            <h4 className="text-red-400 font-semibold mb-2">청산 전략</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>🎯 1차: 0.382 되돌림</li>
              <li>🎯 2차: 0.618 되돌림</li>
              <li>🎯 3차: 1.0 되돌림</li>
              <li>🎯 트레일링 스탑 활용</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}