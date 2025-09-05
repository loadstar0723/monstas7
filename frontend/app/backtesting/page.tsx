'use client'

import { motion } from 'framer-motion'
import { FaHistory, FaChartBar, FaCogs, FaRocket } from 'react-icons/fa'

export default function BacktestingPage() {
  return (
    <div className="min-h-screen p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">백테스팅</h1>
          <p className="text-gray-400">과거 데이터로 전략을 검증하고 최적화하세요</p>
        </div>

        {/* 준비 중 안내 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-12 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <FaHistory className="text-6xl text-purple-500" />
          </motion.div>
          
          <h2 className="text-3xl font-bold mb-4 gradient-text">백테스팅 엔진 준비 중</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            고성능 백테스팅 엔진을 개발 중입니다. 
            곧 여러분의 트레이딩 전략을 과거 데이터로 검증하고 최적화할 수 있습니다.
          </p>

          {/* 예정 기능 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaChartBar className="text-3xl text-blue-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">전략 시뮬레이션</h3>
              <p className="text-sm text-gray-500">
                다양한 트레이딩 전략을 과거 데이터로 테스트
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaCogs className="text-3xl text-green-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">파라미터 최적화</h3>
              <p className="text-sm text-gray-500">
                AI 기반 자동 파라미터 최적화
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaRocket className="text-3xl text-purple-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">성과 분석</h3>
              <p className="text-sm text-gray-500">
                상세한 성과 지표 및 리스크 분석
              </p>
            </motion.div>
          </div>

          {/* 출시 예정 */}
          <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 rounded-full border border-purple-500/30">
            <span className="animate-pulse w-2 h-2 bg-purple-400 rounded-full"></span>
            <span className="text-purple-400 font-medium">2025년 1분기 출시 예정</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}