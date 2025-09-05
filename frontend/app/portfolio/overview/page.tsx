'use client'

import { motion } from 'framer-motion'
import { FaWallet, FaChartPie, FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa'

export default function PortfolioOverviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FaWallet className="text-green-400" />
              포트폴리오
            </h1>
            <p className="text-gray-400">자산을 한눈에 관리하고 분석하세요</p>
          </div>
          <button className="px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2">
            <FaPlus /> 자산 추가
          </button>
        </motion.div>

        {/* 포트폴리오 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="text-gray-400 mb-2">총 자산 가치</div>
            <div className="text-3xl font-bold">$125,430</div>
            <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
              <FaArrowUp /> +24.5% (30일)
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="text-gray-400 mb-2">일일 손익</div>
            <div className="text-3xl font-bold text-green-400">+$3,250</div>
            <div className="text-sm text-gray-500 mt-2">+2.7%</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="text-gray-400 mb-2">총 수익률</div>
            <div className="text-3xl font-bold text-green-400">+45.2%</div>
            <div className="text-sm text-gray-500 mt-2">전체 기간</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="text-gray-400 mb-2">보유 종목</div>
            <div className="text-3xl font-bold">12</div>
            <div className="text-sm text-gray-500 mt-2">5개 체인</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 자산 배분 차트 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaChartPie className="text-purple-400" />
              자산 배분
            </h2>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FaChartPie className="text-6xl mb-4 mx-auto opacity-50" />
                <p>파이 차트가 여기에 표시됩니다</p>
              </div>
            </div>
          </motion.div>

          {/* 보유 자산 목록 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-4">보유 자산</h2>
            <div className="text-center text-gray-500 py-8">
              <p>자산 목록이 여기에 표시됩니다</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
