'use client'

import { motion } from 'framer-motion'
import { FaUser, FaWallet, FaChartLine, FaMedal } from 'react-icons/fa'

export default function ProfilePage() {
  return (
    <div className="min-h-screen p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">프로필</h1>
          <p className="text-gray-400">내 정보와 트레이딩 통계</p>
        </div>

        {/* 프로필 카드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 사용자 정보 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaUser className="text-4xl text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">Guest User</h2>
              <p className="text-gray-400 text-sm mb-4">guest@monsta.ai</p>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-sm text-gray-400">Free Plan</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
                프로필 편집
              </button>
            </div>
          </motion.div>

          {/* 지갑 정보 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaWallet className="text-2xl text-green-500" />
              <h3 className="text-lg font-bold">내 지갑</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">총 자산</p>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">오늘 수익</p>
                <p className="text-lg font-medium text-gray-300">$0.00</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">전체 수익률</p>
                <p className="text-lg font-medium text-gray-300">0.00%</p>
              </div>
            </div>

            <div className="mt-6">
              <button className="w-full py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-all">
                지갑 연결
              </button>
            </div>
          </motion.div>

          {/* 트레이딩 통계 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaChartLine className="text-2xl text-blue-500" />
              <h3 className="text-lg font-bold">트레이딩 통계</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">총 거래</span>
                <span className="text-sm font-medium">0</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">승률</span>
                <span className="text-sm font-medium">-</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-400">최대 수익</span>
                <span className="text-sm font-medium">$0.00</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-400">거래 기간</span>
                <span className="text-sm font-medium">0일</span>
              </div>
            </div>

            <div className="mt-6">
              <button className="w-full py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-all">
                상세 통계
              </button>
            </div>
          </motion.div>
        </div>

        {/* 업적 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaMedal className="text-2xl text-yellow-500" />
            <h3 className="text-lg font-bold">업적</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center opacity-50">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm font-medium">첫 거래</p>
              <p className="text-xs text-gray-500 mt-1">거래 1회 완료</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 text-center opacity-50">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-sm font-medium">수익 달성</p>
              <p className="text-xs text-gray-500 mt-1">$100 수익</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 text-center opacity-50">
              <div className="text-3xl mb-2">🚀</div>
              <p className="text-sm font-medium">프로 트레이더</p>
              <p className="text-xs text-gray-500 mt-1">100회 거래</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 text-center opacity-50">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-sm font-medium">마스터</p>
              <p className="text-xs text-gray-500 mt-1">$10,000 수익</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}