'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FaBrain, FaChartLine, FaNetworkWired, FaLightbulb,
  FaCheckCircle, FaCogs, FaLayerGroup, FaRobot
} from 'react-icons/fa'
import { AiOutlineCluster } from 'react-icons/ai'
import { MdAutoGraph } from 'react-icons/md'

export default function ModelOverview() {
  const models = [
    {
      name: 'LSTM',
      type: '시계열 예측',
      accuracy: 88.5,
      strength: '장기 패턴 인식',
      color: '#3b82f6',
      icon: '🧠'
    },
    {
      name: 'GRU',
      type: '시계열 예측',
      accuracy: 87.2,
      strength: '빠른 학습',
      color: '#10b981',
      icon: '⚡'
    },
    {
      name: 'CNN',
      type: '패턴 인식',
      accuracy: 85.8,
      strength: '차트 패턴',
      color: '#f59e0b',
      icon: '📊'
    },
    {
      name: 'Transformer',
      type: '어텐션 기반',
      accuracy: 91.3,
      strength: '복잡한 관계',
      color: '#ef4444',
      icon: '🔍'
    },
    {
      name: 'XGBoost',
      type: '부스팅',
      accuracy: 89.7,
      strength: '특성 중요도',
      color: '#8b5cf6',
      icon: '🚀'
    },
    {
      name: 'LightGBM',
      type: '부스팅',
      accuracy: 88.9,
      strength: '빠른 처리',
      color: '#ec4899',
      icon: '💨'
    },
    {
      name: 'Random Forest',
      type: '앙상블',
      accuracy: 86.4,
      strength: '안정성',
      color: '#14b8a6',
      icon: '🌲'
    },
    {
      name: 'Neural Network',
      type: '딥러닝',
      accuracy: 87.8,
      strength: '비선형성',
      color: '#6366f1',
      icon: '🕸️'
    },
    {
      name: 'ARIMA',
      type: '통계 모델',
      accuracy: 82.3,
      strength: '추세 분석',
      color: '#84cc16',
      icon: '📈'
    },
    {
      name: 'Prophet',
      type: '시계열',
      accuracy: 83.7,
      strength: '계절성',
      color: '#f97316',
      icon: '🔮'
    },
    {
      name: 'DeepAR',
      type: '확률적 예측',
      accuracy: 90.2,
      strength: '불확실성',
      color: '#06b6d4',
      icon: '🎯'
    }
  ]

  const ensembleFeatures = [
    {
      icon: <FaLayerGroup className="text-4xl text-purple-400" />,
      title: "다중 모델 통합",
      description: "11개의 다양한 AI 모델을 통합하여 각 모델의 장점을 극대화",
      stats: ["11개 모델", "5개 카테고리", "실시간 통합"]
    },
    {
      icon: <FaChartLine className="text-4xl text-pink-400" />,
      title: "동적 가중치",
      description: "실시간 성능에 따라 각 모델의 가중치를 동적으로 조정",
      stats: ["자동 최적화", "성능 기반", "적응형 학습"]
    },
    {
      icon: <AiOutlineCluster className="text-4xl text-blue-400" />,
      title: "다양성 최적화",
      description: "모델 간 상관관계를 분석하여 예측 다양성 극대화",
      stats: ["상관관계 분석", "독립성 보장", "오버피팅 방지"]
    },
    {
      icon: <FaLightbulb className="text-4xl text-yellow-400" />,
      title: "메타 러닝",
      description: "앙상블 자체를 학습하는 메타 모델로 최종 예측 생성",
      stats: ["2차 학습", "앙상블 최적화", "지속적 개선"]
    }
  ]

  const workflow = [
    { step: "1. 데이터 수집", desc: "실시간 시장 데이터 수집 및 전처리" },
    { step: "2. 개별 예측", desc: "11개 모델이 독립적으로 예측 수행" },
    { step: "3. 성능 평가", desc: "각 모델의 최근 성능 실시간 평가" },
    { step: "4. 가중치 조정", desc: "성능 기반 동적 가중치 계산" },
    { step: "5. 통합 예측", desc: "가중 평균 및 메타 모델로 최종 예측" },
    { step: "6. 신뢰도 계산", desc: "예측 불확실성 및 신뢰 구간 제공" }
  ]

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          AI 앙상블 시스템 개요
        </h2>
        <p className="text-gray-300 max-w-3xl mx-auto">
          11개의 서로 다른 AI 모델을 통합하여 단일 모델보다 훨씬 높은 정확도와 안정성을 달성합니다.
          각 모델의 장점을 살리고 단점을 보완하는 집단 지성 시스템입니다.
        </p>
      </div>

      {/* 주요 특징 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ensembleFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all"
          >
            <div className="flex justify-center mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
            <div className="space-y-1">
              {feature.stats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-400 text-xs" />
                  <span className="text-sm text-gray-300">{stat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 개별 모델 목록 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaBrain className="text-purple-400" />
          앙상블 구성 모델
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{model.icon}</span>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{model.name}</h4>
                    <p className="text-sm text-gray-400">{model.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold" style={{ color: model.color }}>
                    {model.accuracy}%
                  </div>
                  <div className="text-xs text-gray-400">정확도</div>
                </div>
              </div>
              <div className="mt-2 p-2 bg-gray-800/50 rounded text-sm text-gray-300">
                <span className="text-gray-400">강점:</span> {model.strength}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 워크플로우 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaCogs className="text-blue-400" />
          앙상블 예측 프로세스
        </h3>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500"></div>
          {workflow.map((item, index) => (
            <div key={index} className="relative flex items-center gap-4 mb-6 last:mb-0">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold z-10">
                {index + 1}
              </div>
              <div className="flex-1 bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-1">{item.step}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 장점 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30"
      >
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          <MdAutoGraph className="text-purple-400" />
          앙상블 시스템의 장점
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-purple-400 font-semibold mb-3">성능 향상</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-1" />
                <span>단일 모델 대비 15-20% 높은 정확도</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-1" />
                <span>예측 변동성 50% 감소</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-1" />
                <span>극단적 시장 상황에서도 안정적 성능</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-pink-400 font-semibold mb-3">리스크 관리</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-1" />
                <span>개별 모델 실패 시 자동 보정</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-1" />
                <span>예측 불확실성 정량화</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-1" />
                <span>오버피팅 리스크 최소화</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}