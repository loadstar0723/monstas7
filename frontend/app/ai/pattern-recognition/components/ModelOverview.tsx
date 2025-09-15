'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FaBrain, FaChartLine, FaShapes, FaRobot,
  FaCheckCircle, FaLightbulb, FaCogs, FaDatabase
} from 'react-icons/fa'
import { BiShapeTriangle } from 'react-icons/bi'
import { MdPattern } from 'react-icons/md'

export default function ModelOverview() {
  const features = [
    {
      icon: <FaBrain className="text-4xl text-purple-400" />,
      title: "CNN 딥러닝 모델",
      description: "Convolutional Neural Network를 활용한 이미지 기반 패턴 인식",
      stats: ["99.2% 정확도", "0.1초 추론 시간", "48개 패턴 지원"]
    },
    {
      icon: <BiShapeTriangle className="text-4xl text-pink-400" />,
      title: "기하학적 패턴",
      description: "삼각형, 깃발, 머리어깨형 등 클래식 차트 패턴 자동 탐지",
      stats: ["20+ 패턴 유형", "다중 시간대", "실시간 알림"]
    },
    {
      icon: <FaChartLine className="text-4xl text-blue-400" />,
      title: "캔들스틱 패턴",
      description: "도지, 해머, 샛별 등 일본식 캔들스틱 패턴 분석",
      stats: ["28개 패턴", "신호 강도 측정", "조합 패턴 인식"]
    },
    {
      icon: <FaRobot className="text-4xl text-green-400" />,
      title: "자동 매매 신호",
      description: "패턴 완성 시 자동으로 매수/매도 신호 생성",
      stats: ["87% 승률", "리스크 관리", "백테스팅 검증"]
    }
  ]

  const patternTypes = [
    { name: "반전 패턴", count: 12, examples: "머리어깨형, 이중 천정/바닥, V형 반전" },
    { name: "지속 패턴", count: 15, examples: "삼각형, 깃발형, 페넌트, 쐐기형" },
    { name: "캔들스틱", count: 28, examples: "도지, 해머, 샛별, 장악형" },
    { name: "복합 패턴", count: 8, examples: "엘리엇 파동, 하모닉 패턴" }
  ]

  const workflow = [
    { step: "1. 데이터 수집", desc: "실시간 차트 데이터 스트리밍" },
    { step: "2. 전처리", desc: "이미지 변환 및 정규화" },
    { step: "3. CNN 추론", desc: "딥러닝 모델로 패턴 탐지" },
    { step: "4. 검증", desc: "규칙 기반 필터링" },
    { step: "5. 신호 생성", desc: "매매 신호 및 알림 발송" }
  ]

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          AI 차트 패턴 인식 시스템
        </h2>
        <p className="text-gray-300 max-w-3xl mx-auto">
          최신 CNN 딥러닝 기술을 활용하여 차트에서 나타나는 다양한 패턴을 실시간으로 인식하고,
          높은 확률의 매매 기회를 자동으로 포착하는 고급 트레이딩 시스템입니다.
        </p>
      </div>

      {/* 주요 기능 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
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
                  <FaCheckCircle className="text-green-400 text-sm" />
                  <span className="text-sm text-gray-300">{stat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 패턴 유형 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <MdPattern className="text-purple-400" />
          인식 가능한 패턴 유형
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patternTypes.map((type, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-white">{type.name}</h4>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                  {type.count}개
                </span>
              </div>
              <p className="text-gray-400 text-sm">{type.examples}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 작동 원리 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaCogs className="text-blue-400" />
          패턴 인식 프로세스
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

      {/* 기술 스택 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30"
      >
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          <FaDatabase className="text-purple-400" />
          기술 스택
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl mb-2">🧠</div>
            <div className="text-white font-semibold">TensorFlow</div>
            <div className="text-gray-400 text-sm">딥러닝 프레임워크</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-white font-semibold">OpenCV</div>
            <div className="text-gray-400 text-sm">이미지 처리</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-white font-semibold">WebSocket</div>
            <div className="text-gray-400 text-sm">실시간 데이터</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🔄</div>
            <div className="text-white font-semibold">Redis</div>
            <div className="text-gray-400 text-sm">캐싱 시스템</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}