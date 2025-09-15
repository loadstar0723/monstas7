'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  FaShieldAlt, FaChartLine, FaCheckCircle, FaUserShield,
  FaCertificate, FaHistory, FaGlobe, FaLock
} from 'react-icons/fa'

// Dynamic imports
const PredictionTracker = dynamic(() => import('./PredictionTracker'), { ssr: false })
const PerformanceVerification = dynamic(() => import('./PerformanceVerification'), { ssr: false })

type TabType = 'overview' | 'predictions' | 'verification'

export default function TrustModule() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const tabs = [
    {
      id: 'overview' as TabType,
      name: '개요',
      icon: FaShieldAlt,
      description: '신뢰성 대시보드'
    },
    {
      id: 'predictions' as TabType,
      name: '예측 추적',
      icon: FaChartLine,
      description: '예측 성과 기록'
    },
    {
      id: 'verification' as TabType,
      name: '검증',
      icon: FaCertificate,
      description: '독립 검증 및 감사'
    }
  ]

  const trustFeatures = [
    {
      icon: FaCheckCircle,
      title: '실시간 성과 추적',
      description: '모든 예측과 거래 신호를 실시간으로 추적하고 기록합니다.',
      stats: { label: '총 예측', value: '1,247개' }
    },
    {
      icon: FaUserShield,
      title: '제3자 검증',
      description: '독립적인 감사 기관이 정기적으로 성과를 검증합니다.',
      stats: { label: '감사 점수', value: '92/100' }
    },
    {
      icon: FaGlobe,
      title: '블록체인 기록',
      description: '모든 거래와 예측은 블록체인에 영구 기록됩니다.',
      stats: { label: '검증된 기록', value: '8,523개' }
    },
    {
      icon: FaLock,
      title: '투명한 알고리즘',
      description: 'AI 모델의 의사결정 과정을 투명하게 공개합니다.',
      stats: { label: '공개 모델', value: '12개' }
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
            신뢰성 & 투명성
          </h1>
          <p className="text-gray-400 mt-1">검증 가능한 성과와 투명한 운영</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 flex items-center gap-3 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-500 bg-gray-900/50'
                    : 'border-transparent hover:bg-gray-900/30'
                }`}
              >
                <tab.icon className={activeTab === tab.id ? 'text-green-400' : 'text-gray-400'} />
                <div className="text-left">
                  <div className={activeTab === tab.id ? 'text-white' : 'text-gray-300'}>
                    {tab.name}
                  </div>
                  <div className="text-xs text-gray-500">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Trust Score Banner */}
            <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-8 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">종합 신뢰도 점수</h2>
                  <p className="text-gray-300">
                    실시간 성과, 제3자 검증, 사용자 평가를 종합한 신뢰도 지표
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    91
                  </div>
                  <p className="text-sm text-gray-400 mt-1">/ 100</p>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500/50 transition-colors"
                >
                  <feature.icon className="text-3xl text-green-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{feature.description}</p>
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500">{feature.stats.label}</p>
                    <p className="text-xl font-bold text-white">{feature.stats.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust Principles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-6">신뢰성 원칙</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-green-400 font-semibold mb-2">1. 완전한 투명성</h4>
                  <p className="text-sm text-gray-400">
                    모든 예측, 거래 신호, 성과 데이터를 실시간으로 공개합니다.
                    숨기거나 조작하는 데이터는 없습니다.
                  </p>
                </div>
                <div>
                  <h4 className="text-blue-400 font-semibold mb-2">2. 독립적 검증</h4>
                  <p className="text-sm text-gray-400">
                    제3자 감사 기관이 정기적으로 시스템과 성과를 검증합니다.
                    블록체인에 모든 기록을 보관합니다.
                  </p>
                </div>
                <div>
                  <h4 className="text-purple-400 font-semibold mb-2">3. 책임감 있는 AI</h4>
                  <p className="text-sm text-gray-400">
                    AI의 의사결정 과정을 설명 가능하게 만들고,
                    위험 관리를 최우선으로 합니다.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h4 className="text-lg font-semibold text-white mb-4">오늘의 성과</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">예측 정확도</span>
                    <span className="text-green-400 font-semibold">73.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">총 신호</span>
                    <span className="text-white font-semibold">24개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">수익률</span>
                    <span className="text-green-400 font-semibold">+3.2%</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h4 className="text-lg font-semibold text-white mb-4">검증 상태</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">블록체인 기록</span>
                    <span className="flex items-center gap-1 text-green-400">
                      <FaCheckCircle /> 활성
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">API 검증</span>
                    <span className="flex items-center gap-1 text-green-400">
                      <FaCheckCircle /> 정상
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">마지막 감사</span>
                    <span className="text-white text-sm">2024.01.15</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h4 className="text-lg font-semibold text-white mb-4">커뮤니티 평가</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">사용자 평점</span>
                    <span className="text-yellow-400 font-semibold">4.7/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">리뷰 수</span>
                    <span className="text-white font-semibold">1,823개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">추천율</span>
                    <span className="text-green-400 font-semibold">89%</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'predictions' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <PredictionTracker />
          </motion.div>
        )}

        {activeTab === 'verification' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <PerformanceVerification />
          </motion.div>
        )}
      </div>
    </div>
  )
}