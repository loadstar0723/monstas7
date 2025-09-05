'use client'

import { motion } from 'framer-motion'
import { FaSignal, FaChartLine, FaBrain, FaRocket } from 'react-icons/fa'

export default function SignalDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
            <FaSignal className="text-purple-400" />
            AI 시그널 대시보드
          </h1>
          <p className="text-gray-400">실시간 AI 트레이딩 시그널과 성과를 확인하세요</p>
        </motion.div>

        {/* 시그널 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">오늘의 시그널</span>
              <FaRocket className="text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400">24</div>
            <div className="text-sm text-gray-500">적중률 85.3%</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">활성 시그널</span>
              <FaChartLine className="text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400">7</div>
            <div className="text-sm text-gray-500">평균 수익 +4.2%</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">AI 신뢰도</span>
              <FaBrain className="text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400">92%</div>
            <div className="text-sm text-gray-500">7개 모델 평균</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">총 수익</span>
              <span className="text-yellow-400">💰</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400">+$12,450</div>
            <div className="text-sm text-gray-500">이번 달 누적</div>
          </motion.div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 실시간 시그널 */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
                실시간 시그널
              </h2>
              <div className="space-y-4">
                {/* 시그널 아이템들이 여기에 들어갑니다 */}
                <div className="p-4 bg-gray-900/50 rounded-lg border border-green-500/20 hover:border-green-500/50 transition-all">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-lg font-semibold">BTC/USDT</span>
                      <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">LONG</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">신뢰도</div>
                      <div className="text-lg font-bold text-green-400">94%</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    진입: $43,250 | 목표: $44,500 | 손절: $42,800
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 성과 통계 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-4">성과 통계</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">승률</span>
                <span className="text-green-400 font-bold">78.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">평균 수익</span>
                <span className="text-green-400 font-bold">+4.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">최대 수익</span>
                <span className="text-green-400 font-bold">+18.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">리스크 점수</span>
                <span className="text-yellow-400 font-bold">3.2/10</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 구독 유도 배너 (무료 사용자용) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">🚀 더 많은 시그널을 원하시나요?</h3>
              <p className="text-gray-400">GOLD 플랜으로 업그레이드하고 실시간 시그널을 무제한으로 받아보세요!</p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:scale-105 transition-transform">
              업그레이드
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}