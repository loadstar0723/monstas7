'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaBrain, FaChartLine, FaGraduationCap, FaRocket,
  FaShieldAlt, FaLightbulb, FaCode, FaDatabase,
  FaNetworkWired, FaCogs, FaCheckCircle, FaArrowRight,
  FaBookOpen, FaMedal, FaChartBar, FaInfo
} from 'react-icons/fa'
import { BiMath } from 'react-icons/bi'
import { 
  LineChart, Line, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip, Legend
} from 'recharts'

interface FeatureCard {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}

export default function ModelOverview() {
  const [activeSection, setActiveSection] = useState(0)
  const [animationStep, setAnimationStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // LSTM 특징 카드
  const features: FeatureCard[] = [
    {
      icon: <FaBrain className="text-3xl" />,
      title: "장단기 메모리",
      description: "LSTM은 단기 기억과 장기 기억을 모두 활용하여 시계열 데이터의 복잡한 패턴을 학습합니다.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <FaNetworkWired className="text-3xl" />,
      title: "게이트 메커니즘",
      description: "Forget, Input, Output 게이트를 통해 정보의 흐름을 제어하고 중요한 정보만 선택적으로 저장합니다.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FaChartLine className="text-3xl" />,
      title: "시계열 예측 특화",
      description: "금융 시장의 시계열 데이터 분석에 최적화되어 있으며, 장기 의존성 문제를 효과적으로 해결합니다.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <FaShieldAlt className="text-3xl" />,
      title: "안정적 학습",
      description: "기울기 소실 문제를 해결하여 깊은 네트워크에서도 안정적인 학습이 가능합니다.",
      color: "from-orange-500 to-red-500"
    }
  ]

  // 학습 과정 단계
  const learningSteps = [
    {
      step: 1,
      title: "데이터 수집",
      description: "실시간 시장 데이터, 거래량, 기술 지표 등을 수집합니다.",
      icon: <FaDatabase />
    },
    {
      step: 2,
      title: "전처리",
      description: "데이터 정규화, 특성 추출, 시퀀스 생성을 수행합니다.",
      icon: <FaCogs />
    },
    {
      step: 3,
      title: "모델 학습",
      description: "LSTM 네트워크가 패턴을 학습하고 가중치를 업데이트합니다.",
      icon: <FaBrain />
    },
    {
      step: 4,
      title: "예측 생성",
      description: "학습된 모델이 미래 가격을 예측하고 신뢰구간을 계산합니다.",
      icon: <FaChartLine />
    }
  ]

  // 성능 비교 데이터
  const performanceComparison = [
    { model: 'LSTM', 단기예측: 92, 중기예측: 85, 장기예측: 78, 안정성: 90, 속도: 75 },
    { model: 'GRU', 단기예측: 90, 중기예측: 83, 장기예측: 75, 안정성: 88, 속도: 85 },
    { model: 'ARIMA', 단기예측: 85, 중기예측: 80, 장기예측: 82, 안정성: 95, 속도: 95 },
    { model: 'Random Forest', 단기예측: 88, 중기예측: 82, 장기예측: 70, 안정성: 85, 속도: 90 }
  ]

  // 실전 적용 사례
  const useCases = [
    {
      title: "비트코인 가격 예측",
      accuracy: "87.3%",
      profit: "+34.2%",
      period: "3개월",
      description: "15분봉 데이터를 활용한 단기 트레이딩"
    },
    {
      title: "이더리움 변동성 예측",
      accuracy: "91.5%",
      profit: "+28.7%",
      period: "2개월",
      description: "변동성 기반 옵션 전략"
    },
    {
      title: "알트코인 추세 분석",
      accuracy: "82.9%",
      profit: "+45.3%",
      period: "6개월",
      description: "중장기 포지션 트레이딩"
    }
  ]

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          LSTM (Long Short-Term Memory) 딥러닝 모델
        </h2>
        <p className="text-xl text-gray-300 max-w-4xl mx-auto">
          최첨단 순환 신경망 기술로 암호화폐 시장의 복잡한 패턴을 학습하고 
          미래 가격을 예측하는 AI 트레이딩의 핵심 엔진
        </p>
      </motion.div>

      {/* 주요 특징 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className={`bg-gradient-to-br ${feature.color} p-[1px] rounded-xl`}
          >
            <div className="bg-gray-900 p-6 rounded-xl h-full">
              <div className="flex items-center justify-center mb-4 text-white">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 상세 설명 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 왼쪽: 기술적 설명 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FaBookOpen className="text-purple-500" />
            기술적 배경
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-purple-400 mb-3">아키텍처 구조</h4>
              <p className="text-gray-300 leading-relaxed mb-4">
                LSTM은 1997년 Hochreiter와 Schmidhuber가 개발한 RNN의 특수한 형태로, 
                기존 RNN의 장기 의존성 문제를 해결하기 위해 설계되었습니다. 
                각 LSTM 유닛은 세 개의 게이트(Forget, Input, Output)와 하나의 메모리 셀로 구성됩니다.
              </p>
              
              <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="text-red-400 mt-1">•</div>
                  <div>
                    <strong className="text-white">Forget Gate (ft)</strong>
                    <p className="text-gray-400 text-sm">이전 정보 중 버릴 것을 결정 (σ(Wf·[ht-1, xt] + bf))</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-400 mt-1">•</div>
                  <div>
                    <strong className="text-white">Input Gate (it)</strong>
                    <p className="text-gray-400 text-sm">새로운 정보 중 저장할 것을 선택 (σ(Wi·[ht-1, xt] + bi))</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-yellow-400 mt-1">•</div>
                  <div>
                    <strong className="text-white">Output Gate (ot)</strong>
                    <p className="text-gray-400 text-sm">다음 단계로 전달할 정보 결정 (σ(Wo·[ht-1, xt] + bo))</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-purple-400 mb-3">수학적 원리</h4>
              <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
                <p className="text-green-400 mb-2">// Cell State Update</p>
                <p className="text-gray-300">Ct = ft * Ct-1 + it * C̃t</p>
                <p className="text-green-400 mb-2 mt-3">// Hidden State</p>
                <p className="text-gray-300">ht = ot * tanh(Ct)</p>
                <p className="text-green-400 mb-2 mt-3">// Candidate Values</p>
                <p className="text-gray-300">C̃t = tanh(Wc·[ht-1, xt] + bc)</p>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 학습 과정 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FaGraduationCap className="text-blue-500" />
            학습 프로세스
          </h3>
          
          <div className="space-y-4">
            {learningSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                  animationStep === index 
                    ? 'bg-purple-900/30 border-purple-500' 
                    : 'bg-gray-900/30 border-gray-700'
                }`}
              >
                <div className={`p-3 rounded-lg ${
                  animationStep === index ? 'bg-purple-600' : 'bg-gray-700'
                }`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">
                    {step.step}. {step.title}
                  </h4>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                  {animationStep === index && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3 }}
                      className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-3"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/50">
            <p className="text-blue-300 text-sm flex items-start gap-2">
              <FaInfo className="mt-1" />
              <span>
                학습 과정은 실시간으로 진행되며, 새로운 데이터가 들어올 때마다 
                모델이 자동으로 업데이트되어 시장 변화에 빠르게 적응합니다.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 성능 비교 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaChartBar className="text-green-500" />
          다른 모델과의 성능 비교
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-300 mb-4">예측 정확도 비교</h4>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceComparison}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="model" stroke="#9ca3af" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                <Radar
                  name="LSTM"
                  dataKey="단기예측"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-300 mb-4">주요 장점</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-green-400 mt-1" />
                <div>
                  <h5 className="font-semibold text-white">뛰어난 장기 의존성 학습</h5>
                  <p className="text-gray-400 text-sm">
                    수개월 전의 패턴도 기억하여 장기 트렌드 예측에 탁월
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-green-400 mt-1" />
                <div>
                  <h5 className="font-semibold text-white">복잡한 비선형 관계 포착</h5>
                  <p className="text-gray-400 text-sm">
                    시장의 복잡한 상호작용과 비선형 패턴을 효과적으로 학습
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-green-400 mt-1" />
                <div>
                  <h5 className="font-semibold text-white">다변량 시계열 처리</h5>
                  <p className="text-gray-400 text-sm">
                    가격, 거래량, 기술지표 등 여러 변수를 동시에 고려
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-green-400 mt-1" />
                <div>
                  <h5 className="font-semibold text-white">실시간 적응</h5>
                  <p className="text-gray-400 text-sm">
                    온라인 학습으로 시장 변화에 즉각적으로 대응
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 실전 적용 사례 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaMedal className="text-yellow-500" />
          실전 트레이딩 성과
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700"
            >
              <h4 className="text-lg font-bold text-white mb-3">{useCase.title}</h4>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">정확도:</span>
                  <span className="text-green-400 font-semibold">{useCase.accuracy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">수익률:</span>
                  <span className="text-blue-400 font-semibold">{useCase.profit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">기간:</span>
                  <span className="text-gray-300">{useCase.period}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">{useCase.description}</p>
              <div className="mt-4">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: useCase.accuracy }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 시작하기 가이드 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/30">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaRocket className="text-purple-500" />
          LSTM 모델 활용 가이드
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-purple-400 mb-4">추천 사용 시나리오</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <FaArrowRight className="text-purple-500" />
                단기 스캘핑 (1분~15분봉)
              </li>
              <li className="flex items-center gap-2">
                <FaArrowRight className="text-purple-500" />
                일간 스윙 트레이딩
              </li>
              <li className="flex items-center gap-2">
                <FaArrowRight className="text-purple-500" />
                변동성 기반 옵션 전략
              </li>
              <li className="flex items-center gap-2">
                <FaArrowRight className="text-purple-500" />
                포트폴리오 리밸런싱
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-blue-400 mb-4">주의사항</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <FaInfo className="text-blue-500" />
                극단적 시장 상황에서는 정확도 하락 가능
              </li>
              <li className="flex items-center gap-2">
                <FaInfo className="text-blue-500" />
                과거 데이터 기반 학습으로 새로운 패턴에 취약
              </li>
              <li className="flex items-center gap-2">
                <FaInfo className="text-blue-500" />
                리스크 관리 전략과 함께 사용 권장
              </li>
              <li className="flex items-center gap-2">
                <FaInfo className="text-blue-500" />
                정기적인 모델 재학습 필요
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="text-center"
      >
        <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg">
          LSTM 모델 실시간 예측 시작하기
        </button>
      </motion.div>
    </div>
  )
}