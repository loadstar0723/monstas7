'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FaTree, FaVoteYea, FaBrain, FaShieldAlt, 
  FaChartBar, FaLayerGroup, FaRandom, FaSeedling,
  FaBalanceScale, FaMountain, FaLeaf, FaLightbulb
} from 'react-icons/fa'

export default function ModelOverview() {
  const features = [
    {
      icon: FaLayerGroup,
      title: '앙상블 학습',
      description: '수백 개의 의사결정 트리를 결합하여 강력하고 안정적인 예측'
    },
    {
      icon: FaRandom,
      title: '랜덤 샘플링',
      description: '부트스트랩과 특성 무작위 선택으로 다양성 확보'
    },
    {
      icon: FaShieldAlt,
      title: '과적합 방지',
      description: '여러 트리의 평균으로 분산을 줄이고 일반화 성능 향상'
    },
    {
      icon: FaChartBar,
      title: '특성 중요도',
      description: '각 특성이 예측에 미치는 영향을 정량적으로 측정'
    }
  ]

  const advantages = [
    {
      icon: FaBrain,
      title: '높은 정확도',
      content: '다양한 데이터셋에서 뛰어난 예측 성능을 보여주는 검증된 알고리즘'
    },
    {
      icon: FaBalanceScale,
      title: '균형잡힌 성능',
      content: '편향-분산 트레이드오프를 효과적으로 관리하여 안정적인 결과 제공'
    },
    {
      icon: FaMountain,
      title: '견고성',
      content: '이상치와 노이즈에 강하며, 데이터 전처리가 최소화됨'
    },
    {
      icon: FaLightbulb,
      title: '해석 가능성',
      content: 'SHAP 분석과 특성 중요도로 모델의 결정 과정을 설명 가능'
    }
  ]

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaTree className="text-green-400" />
          Random Forest 개요
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          수백 개의 의사결정 트리가 모여 만드는 강력한 앙상블 학습 모델
        </p>
      </motion.div>

      {/* 모델 설명 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-8 backdrop-blur-sm border border-green-500/30"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaSeedling className="text-green-400" />
          모델 원리
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-400">1. 부트스트랩 샘플링</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              원본 데이터에서 복원 추출로 여러 개의 서브셋을 생성합니다. 
              각 트리는 서로 다른 데이터 샘플로 학습하여 다양성을 확보합니다.
            </p>
            
            <h4 className="text-lg font-semibold text-blue-400">2. 특성 무작위 선택</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              각 노드 분할 시 전체 특성 중 일부만 무작위로 선택하여 고려합니다. 
              이는 트리 간 상관관계를 줄이고 앙상블의 성능을 향상시킵니다.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-purple-400">3. 의사결정 트리 구축</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              각 부트스트랩 샘플로 깊은 의사결정 트리를 구축합니다. 
              개별 트리는 높은 분산을 가지지만 앙상블로 결합 시 안정화됩니다.
            </p>
            
            <h4 className="text-lg font-semibold text-yellow-400">4. 예측 집계</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              분류: 다수결 투표로 최종 클래스 결정
              회귀: 모든 트리 예측값의 평균으로 최종 예측
            </p>
          </div>
        </div>

        {/* 수식 표현 */}
        <div className="bg-gray-900/50 rounded-lg p-4 mt-6">
          <p className="text-gray-400 text-sm mb-2">예측 공식 (회귀):</p>
          <div className="text-white font-mono text-center text-lg">
            ŷ = (1/B) × Σ<sub>b=1</sub><sup>B</sup> T<sub>b</sub>(x)
          </div>
          <p className="text-gray-500 text-xs mt-2 text-center">
            B: 트리 개수, T<sub>b</sub>: b번째 트리의 예측
          </p>
        </div>
      </motion.div>

      {/* 주요 특징 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all"
          >
            <feature.icon className="text-3xl text-green-400 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* 장점 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {advantages.map((advantage, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <advantage.icon className="text-2xl text-green-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">{advantage.title}</h4>
                <p className="text-gray-300 text-sm">{advantage.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 하이퍼파라미터 정보 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <FaLeaf className="text-green-400" />
          주요 하이퍼파라미터
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-900/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400">n_estimators</div>
            <div className="text-sm text-gray-400 mt-1">트리 개수 (기본: 100)</div>
            <div className="text-xs text-gray-500 mt-2">많을수록 성능↑ 속도↓</div>
          </div>
          
          <div className="text-center p-4 bg-gray-900/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">max_features</div>
            <div className="text-sm text-gray-400 mt-1">특성 샘플링 비율</div>
            <div className="text-xs text-gray-500 mt-2">sqrt(n) 또는 log2(n)</div>
          </div>
          
          <div className="text-center p-4 bg-gray-900/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">max_depth</div>
            <div className="text-sm text-gray-400 mt-1">트리 최대 깊이</div>
            <div className="text-xs text-gray-500 mt-2">None으로 완전 성장</div>
          </div>
        </div>
      </motion.div>

      {/* 활용 분야 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-xl p-6 border border-blue-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <FaVoteYea className="text-blue-400" />
          암호화폐 트레이딩 활용
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>가격 방향 예측 (상승/하락 분류)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>변동성 예측 및 리스크 평가</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>기술적 지표 기반 매매 신호 생성</span>
            </li>
          </ul>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>시장 레짐 분류 (상승장/하락장/횡보장)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>포트폴리오 최적화 및 자산 배분</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>이상 거래 탐지 및 시장 조작 감지</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}