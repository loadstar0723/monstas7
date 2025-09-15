'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaBrain, FaChartLine, FaGraduationCap, FaRocket,
  FaShieldAlt, FaLightbulb, FaCode, FaDatabase,
  FaNetworkWired, FaCogs, FaCheckCircle, FaArrowRight,
  FaBookOpen, FaMedal, FaChartBar, FaInfo, FaExchangeAlt,
  FaMemory, FaBolt, FaClock
} from 'react-icons/fa'
import { BiChip, BiMath, BiTimer } from 'react-icons/bi'
import { 
  LineChart, Line, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip, Legend, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Cell
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

  // GRU 특징 카드
  const features: FeatureCard[] = [
    {
      icon: <BiChip className="text-3xl" />,
      title: "단순화된 구조",
      description: "LSTM의 3개 게이트를 2개로 줄여 더 빠른 학습과 적은 메모리 사용량을 실현합니다.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <FaBolt className="text-3xl" />,
      title: "빠른 처리 속도",
      description: "단순한 구조로 LSTM 대비 2배 빠른 학습 속도와 실시간 예측이 가능합니다.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <FaMemory className="text-3xl" />,
      title: "효율적 메모리",
      description: "Cell State가 없어 메모리 사용량이 33% 감소하면서도 성능은 유지합니다.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FaClock className="text-3xl" />,
      title: "실시간 예측",
      description: "고빈도 트레이딩에 최적화된 빠른 추론 속도로 0.3초 내 예측을 제공합니다.",
      color: "from-purple-500 to-pink-500"
    }
  ]

  // 학습 과정 단계
  const learningSteps = [
    {
      step: 1,
      title: "데이터 입력",
      description: "시계열 금융 데이터와 기술적 지표를 입력받습니다.",
      icon: <FaDatabase />
    },
    {
      step: 2,
      title: "Reset Gate",
      description: "이전 정보 중 불필요한 부분을 리셋하여 새로운 패턴에 집중합니다.",
      icon: <FaExchangeAlt />
    },
    {
      step: 3,
      title: "Update Gate",
      description: "현재와 과거 정보의 비율을 조절하여 최적의 상태를 생성합니다.",
      icon: <FaCogs />
    },
    {
      step: 4,
      title: "예측 출력",
      description: "최종 Hidden State로부터 미래 가격을 예측합니다.",
      icon: <FaChartLine />
    }
  ]

  // GRU vs LSTM 비교 데이터
  const comparisonData = [
    { feature: '학습속도', GRU: 95, LSTM: 50 },
    { feature: '메모리효율', GRU: 90, LSTM: 60 },
    { feature: '파라미터수', GRU: 67, LSTM: 100 },
    { feature: '단기예측', GRU: 88, LSTM: 85 },
    { feature: '장기예측', GRU: 75, LSTM: 82 },
    { feature: '실시간성능', GRU: 92, LSTM: 70 }
  ]

  // 성능 비교 데이터
  const performanceComparison = [
    { model: 'GRU', 단기예측: 90, 중기예측: 83, 장기예측: 75, 안정성: 88, 속도: 95 },
    { model: 'LSTM', 단기예측: 92, 중기예측: 85, 장기예측: 78, 안정성: 90, 속도: 75 },
    { model: 'ARIMA', 단기예측: 85, 중기예측: 80, 장기예측: 82, 안정성: 95, 속도: 90 },
    { model: 'Random Forest', 단기예측: 88, 중기예측: 82, 장기예측: 70, 안정성: 85, 속도: 85 }
  ]

  // 실전 적용 사례
  const useCases = [
    {
      title: "고빈도 스캘핑",
      accuracy: "89.2%",
      profit: "+42.3%",
      period: "2개월",
      description: "1분봉 기반 초단타 전략"
    },
    {
      title: "일중 트레이딩",
      accuracy: "85.7%",
      profit: "+31.5%",
      period: "3개월",
      description: "15분-1시간봉 스윙 전략"
    },
    {
      title: "모멘텀 추종",
      accuracy: "91.3%",
      profit: "+38.9%",
      period: "4개월",
      description: "추세 전환점 포착 전략"
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
          GRU (Gated Recurrent Unit) 딥러닝 모델
        </h2>
        <p className="text-xl text-gray-300 max-w-4xl mx-auto">
          LSTM의 복잡성을 단순화하면서도 뛰어난 성능을 유지하는 차세대 순환신경망. 
          더 빠른 학습, 더 적은 메모리, 실시간 예측에 최적화된 AI 트레이딩 엔진
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
            <FaBookOpen className="text-green-500" />
            기술적 배경
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-green-400 mb-3">아키텍처 혁신</h4>
              <p className="text-gray-300 leading-relaxed mb-4">
                GRU는 2014년 조경현 교수팀이 개발한 LSTM의 개선 버전으로, 
                복잡한 Cell State와 3개의 게이트를 2개의 게이트로 단순화했습니다. 
                이를 통해 학습 속도는 2배 향상되고 메모리 사용량은 33% 감소했습니다.
              </p>
              
              <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="text-red-400 mt-1">•</div>
                  <div>
                    <strong className="text-white">Reset Gate (rt)</strong>
                    <p className="text-gray-400 text-sm">이전 정보를 얼마나 잊을지 결정 (σ(Wr·[ht-1, xt] + br))</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 mt-1">•</div>
                  <div>
                    <strong className="text-white">Update Gate (zt)</strong>
                    <p className="text-gray-400 text-sm">현재와 이전 정보의 비율 조절 (σ(Wz·[ht-1, xt] + bz))</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-green-400 mb-3">수학적 원리</h4>
              <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
                <p className="text-green-400 mb-2">// Update Gate</p>
                <p className="text-gray-300">zt = σ(Wz·[ht-1, xt])</p>
                <p className="text-green-400 mb-2 mt-3">// Reset Gate</p>
                <p className="text-gray-300">rt = σ(Wr·[ht-1, xt])</p>
                <p className="text-green-400 mb-2 mt-3">// Candidate State</p>
                <p className="text-gray-300">h̃t = tanh(W·[rt * ht-1, xt])</p>
                <p className="text-green-400 mb-2 mt-3">// Final Hidden State</p>
                <p className="text-gray-300">ht = (1 - zt) * ht-1 + zt * h̃t</p>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: GRU vs LSTM 비교 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FaExchangeAlt className="text-blue-500" />
            GRU vs LSTM 상세 비교
          </h3>
          
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="feature" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="GRU" fill="#10b981" />
                <Bar dataKey="LSTM" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
              <h4 className="font-semibold text-green-400 mb-2">GRU의 강점</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 2배 빠른 학습 속도로 실시간 적응 가능</li>
                <li>• 33% 적은 파라미터로 과적합 위험 감소</li>
                <li>• 단순한 구조로 하이퍼파라미터 튜닝 용이</li>
                <li>• 모바일/엣지 디바이스에서도 실행 가능</li>
              </ul>
            </div>
            
            <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <h4 className="font-semibold text-purple-400 mb-2">LSTM의 강점</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 더 복잡한 장기 의존성 학습 가능</li>
                <li>• Cell State로 정보 보존력 우수</li>
                <li>• 대규모 데이터셋에서 미세한 성능 우위</li>
                <li>• 더 많은 연구와 검증된 사례</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 학습 프로세스 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaGraduationCap className="text-blue-500" />
          GRU 학습 프로세스
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {learningSteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-6 rounded-lg border transition-all ${
                animationStep === index 
                  ? 'bg-green-900/30 border-green-500' 
                  : 'bg-gray-900/30 border-gray-700'
              }`}
            >
              <div className={`p-3 rounded-lg mb-4 inline-block ${
                animationStep === index ? 'bg-green-600' : 'bg-gray-700'
              }`}>
                {step.icon}
              </div>
              <h4 className="font-semibold text-white mb-2">
                {step.step}. {step.title}
              </h4>
              <p className="text-gray-400 text-sm">{step.description}</p>
              {animationStep === index && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-b-lg"
                />
              )}
            </motion.div>
          ))}
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
            <h4 className="text-lg font-semibold text-gray-300 mb-4">종합 성능 비교</h4>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceComparison}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="model" stroke="#9ca3af" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                <Radar
                  name="GRU"
                  dataKey="속도"
                  stroke="#10b981"
                  fill="#10b981"
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
                  <h5 className="font-semibold text-white">최고의 속도</h5>
                  <p className="text-gray-400 text-sm">
                    모든 RNN 모델 중 가장 빠른 학습과 추론 속도
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-green-400 mt-1" />
                <div>
                  <h5 className="font-semibold text-white">효율적 자원 사용</h5>
                  <p className="text-gray-400 text-sm">
                    적은 메모리와 연산으로 LSTM급 성능 달성
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-green-400 mt-1" />
                <div>
                  <h5 className="font-semibold text-white">실시간 처리</h5>
                  <p className="text-gray-400 text-sm">
                    고빈도 트레이딩에 필수적인 낮은 지연시간
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-green-400 mt-1" />
                <div>
                  <h5 className="font-semibold text-white">안정적 학습</h5>
                  <p className="text-gray-400 text-sm">
                    단순한 구조로 학습 안정성과 수렴 속도 향상
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
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-8 border border-green-500/30">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaRocket className="text-green-500" />
          GRU 모델 활용 가이드
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-green-400 mb-4">추천 사용 시나리오</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <FaArrowRight className="text-green-500" />
                고빈도 스캘핑 (1분~5분봉)
              </li>
              <li className="flex items-center gap-2">
                <FaArrowRight className="text-green-500" />
                일중 모멘텀 트레이딩
              </li>
              <li className="flex items-center gap-2">
                <FaArrowRight className="text-green-500" />
                실시간 시장 진입/탈출
              </li>
              <li className="flex items-center gap-2">
                <FaArrowRight className="text-green-500" />
                리소스 제한 환경
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-blue-400 mb-4">최적화 팁</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <FaInfo className="text-blue-500" />
                시퀀스 길이는 50-100으로 설정
              </li>
              <li className="flex items-center gap-2">
                <FaInfo className="text-blue-500" />
                학습률은 0.001-0.01 범위 권장
              </li>
              <li className="flex items-center gap-2">
                <FaInfo className="text-blue-500" />
                드롭아웃은 0.2-0.3으로 과적합 방지
              </li>
              <li className="flex items-center gap-2">
                <FaInfo className="text-blue-500" />
                배치 크기는 32-64가 최적
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
        <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg">
          GRU 모델 실시간 예측 시작하기
        </button>
      </motion.div>
    </div>
  )
}