'use client'

import { motion } from 'framer-motion'
import { FaRobot, FaCogs, FaChartLine, FaTelegram } from 'react-icons/fa'

export default function AutoBotPage() {
  return (
    <div className="min-h-screen p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">자동매매 봇</h1>
          <p className="text-gray-400">24/7 자동으로 거래하는 AI 트레이딩 봇</p>
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
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <FaRobot className="text-6xl text-green-500" />
          </motion.div>
          
          <h2 className="text-3xl font-bold mb-4 gradient-text">자동매매 봇 개발 중</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            AI 기반 자동매매 봇이 곧 출시됩니다. 
            설정만 하면 24시간 자동으로 수익을 창출합니다.
          </p>

          {/* 예정 기능 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaCogs className="text-3xl text-blue-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">맞춤형 전략</h3>
              <p className="text-sm text-gray-500">
                다양한 트레이딩 전략 템플릿 제공
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaChartLine className="text-3xl text-green-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">실시간 모니터링</h3>
              <p className="text-sm text-gray-500">
                봇 성과 실시간 추적 및 분석
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaTelegram className="text-3xl text-purple-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">텔레그램 연동</h3>
              <p className="text-sm text-gray-500">
                텔레그램으로 실시간 알림 받기
              </p>
            </motion.div>
          </div>

          {/* 출시 예정 */}
          <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 rounded-full border border-green-500/30">
            <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-green-400 font-medium">곧 출시 예정</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}