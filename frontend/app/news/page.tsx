'use client'

import { motion } from 'framer-motion'
import { FaNewspaper, FaBell, FaChartLine, FaBolt } from 'react-icons/fa'

export default function NewsPage() {
  return (
    <div className="min-h-screen p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">뉴스 & 시그널</h1>
          <p className="text-gray-400">실시간 시장 뉴스와 트레이딩 시그널</p>
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
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <FaNewspaper className="text-6xl text-orange-500" />
          </motion.div>
          
          <h2 className="text-3xl font-bold mb-4 gradient-text">뉴스 & 시그널 서비스 준비 중</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            실시간 시장 뉴스와 AI 기반 트레이딩 시그널을 
            한 곳에서 확인할 수 있는 서비스를 준비하고 있습니다.
          </p>

          {/* 예정 기능 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaNewspaper className="text-3xl text-orange-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">실시간 뉴스</h3>
              <p className="text-sm text-gray-500">
                주요 암호화폐 뉴스 실시간 업데이트
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaBell className="text-3xl text-red-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">가격 알림</h3>
              <p className="text-sm text-gray-500">
                목표가 도달 시 실시간 알림
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaBolt className="text-3xl text-yellow-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">AI 시그널</h3>
              <p className="text-sm text-gray-500">
                AI가 분석한 매매 시그널
              </p>
            </motion.div>
          </div>

          {/* 출시 예정 */}
          <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-orange-600/20 rounded-full border border-orange-500/30">
            <span className="animate-pulse w-2 h-2 bg-orange-400 rounded-full"></span>
            <span className="text-orange-400 font-medium">개발 진행 중</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}