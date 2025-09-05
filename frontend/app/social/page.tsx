'use client'

import { motion } from 'framer-motion'
import { FaUsers, FaUserFriends, FaTrophy, FaChartLine } from 'react-icons/fa'

export default function SocialPage() {
  return (
    <div className="min-h-screen p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">소셜 트레이딩</h1>
          <p className="text-gray-400">전문 트레이더를 따라하고 함께 성장하세요</p>
        </div>

        {/* 준비 중 안내 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-12 text-center"
        >
          <motion.div
            animate={{ 
              y: [0, -10, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <FaUsers className="text-6xl text-blue-500" />
          </motion.div>
          
          <h2 className="text-3xl font-bold mb-4 gradient-text">소셜 트레이딩 플랫폼 준비 중</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            전문 트레이더의 전략을 복사하고, 커뮤니티와 함께 성장하는 
            소셜 트레이딩 플랫폼을 준비하고 있습니다.
          </p>

          {/* 예정 기능 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaUserFriends className="text-3xl text-blue-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">카피 트레이딩</h3>
              <p className="text-sm text-gray-500">
                성공한 트레이더의 거래 자동 복사
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaTrophy className="text-3xl text-yellow-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">리더보드</h3>
              <p className="text-sm text-gray-500">
                수익률 순위 및 트레이더 랭킹
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaChartLine className="text-3xl text-green-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">성과 공유</h3>
              <p className="text-sm text-gray-500">
                트레이딩 성과 및 전략 공유
              </p>
            </motion.div>
          </div>

          {/* 출시 예정 */}
          <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-full border border-blue-500/30">
            <span className="animate-pulse w-2 h-2 bg-blue-400 rounded-full"></span>
            <span className="text-blue-400 font-medium">2025년 2분기 출시 예정</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}