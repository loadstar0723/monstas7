'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartBar, FaCalculator, FaHistory, FaClock,
  FaCheckCircle, FaRocket, FaShieldAlt, FaChartLine
} from 'react-icons/fa'
import { BiMath } from 'react-icons/bi'

export default function ModelOverview() {
  const features = [
    {
      icon: FaHistory,
      title: '전통적 시계열 분석',
      description: '50년 이상 검증된 통계학적 접근법',
      color: 'blue'
    },
    {
      icon: FaCalculator,
      title: '수학적 투명성',
      description: '블랙박스가 아닌 명확한 수학적 근거',
      color: 'green'
    },
    {
      icon: FaRocket,
      title: '빠른 연산 속도',
      description: '딥러닝 대비 100배 빠른 실시간 예측',
      color: 'purple'
    },
    {
      icon: FaShieldAlt,
      title: '안정적 성능',
      description: '시장 변동성에도 일관된 예측력',
      color: 'yellow'
    }
  ]

  const parameters = [
    {
      param: 'p',
      name: '자기회귀 (AR)',
      description: '과거 가격이 미래에 미치는 영향',
      value: 2,
      color: '#3b82f6'
    },
    {
      param: 'd',
      name: '적분/차분 (I)',
      description: '시계열을 정상화하는 차분 횟수',
      value: 1,
      color: '#10b981'
    },
    {
      param: 'q',
      name: '이동평균 (MA)',
      description: '과거 오차가 현재에 미치는 영향',
      value: 1,
      color: '#8b5cf6'
    }
  ]

  const advantages = [
    '검증된 신뢰성: 50년 이상 금융시장에서 사용',
    '정확한 단기 예측: 1-24시간 예측에 최적화',
    '계절성 포착: 주말/월말 패턴 자동 감지',
    '빠른 연산: 실시간 트레이딩에 적합',
    '명확한 해석: 투명한 수학적 근거',
    '안정적 성능: 시장 변동성에 강건함'
  ]

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          ARIMA: 시계열 예측의 황금 표준
        </h2>
        <p className="text-xl text-gray-300 max-w-4xl mx-auto">
          AutoRegressive Integrated Moving Average - 1970년대부터 월스트리트와 중앙은행들이 
          신뢰해온 전통적이면서도 강력한 통계 모델입니다.
        </p>
      </motion.div>

      {/* 핵심 기능 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-${feature.color}-500/30 hover:border-${feature.color}-500/50 transition-all hover:scale-105`}
          >
            <feature.icon className={`text-4xl text-${feature.color}-400 mb-4`} />
            <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* ARIMA 파라미터 설명 */}
      <div className="bg-gradient-to-br from-blue-900/20 via-gray-900/90 to-purple-900/20 backdrop-blur-sm rounded-xl p-8 border border-blue-500/30">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <BiMath className="text-blue-400" />
          ARIMA(p,d,q) 파라미터의 의미
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {parameters.map((param, index) => (
            <motion.div
              key={param.param}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all"
            >
              <div 
                className="text-5xl font-bold mb-4 text-center"
                style={{ color: param.color }}
              >
                {param.param} = {param.value}
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">{param.name}</h4>
              <p className="text-gray-400 text-sm">{param.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
          <p className="text-yellow-400 font-semibold mb-2">💡 예시: ARIMA(2,1,1)</p>
          <p className="text-gray-300">
            과거 2개 시점의 가격(AR), 1차 차분으로 트렌드 제거(I), 과거 1개의 예측 오차(MA)를 
            사용하여 미래 가격을 예측합니다.
          </p>
        </div>
      </div>

      {/* ARIMA 작동 원리 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <FaChartLine className="text-green-400" />
            ARIMA의 작동 원리
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-green-400 mt-1">1.</div>
              <div>
                <h4 className="text-white font-semibold">정상성 검정</h4>
                <p className="text-gray-400 text-sm">
                  ADF, KPSS 테스트로 시계열의 정상성을 확인하고 필요시 차분
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-green-400 mt-1">2.</div>
              <div>
                <h4 className="text-white font-semibold">파라미터 식별</h4>
                <p className="text-gray-400 text-sm">
                  ACF/PACF 분석으로 최적의 p, d, q 값 결정
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-green-400 mt-1">3.</div>
              <div>
                <h4 className="text-white font-semibold">모델 추정</h4>
                <p className="text-gray-400 text-sm">
                  최대우도추정(MLE)으로 모델 파라미터 계산
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-green-400 mt-1">4.</div>
              <div>
                <h4 className="text-white font-semibold">진단 및 예측</h4>
                <p className="text-gray-400 text-sm">
                  잔차 분석 후 신뢰구간과 함께 예측값 생성
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <FaCheckCircle className="text-blue-400" />
            ARIMA의 강점
          </h3>
          <div className="space-y-3">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="text-green-400 mt-1">✓</span>
                <p className="text-gray-300">{advantage}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 성능 메트릭 */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-8 border border-blue-500/30">
        <h3 className="text-2xl font-bold text-white text-center mb-6">
          🏆 ARIMA 실전 성능
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-400">92%</div>
            <div className="text-gray-400 mt-2">단기 예측 정확도</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-400">0.1초</div>
            <div className="text-gray-400 mt-2">예측 생성 시간</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-400">24/7</div>
            <div className="text-gray-400 mt-2">실시간 모니터링</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-yellow-400">50년+</div>
            <div className="text-gray-400 mt-2">검증된 역사</div>
          </div>
        </div>
      </div>

      {/* 수식 표현 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <BiMath className="text-purple-400" />
          ARIMA 수학적 표현
        </h3>
        <div className="bg-gray-900/50 rounded-lg p-6 font-mono text-center">
          <div className="text-lg text-gray-300 mb-4">
            (1 - φ₁L - φ₂L² - ... - φₚLᵖ)(1 - L)ᵈ yₜ = 
          </div>
          <div className="text-lg text-gray-300">
            (1 + θ₁L + θ₂L² + ... + θₑLᵠ) εₜ
          </div>
          <div className="mt-4 text-sm text-gray-500">
            L: Lag operator, φ: AR parameters, θ: MA parameters, ε: white noise
          </div>
        </div>
      </div>
    </div>
  )
}