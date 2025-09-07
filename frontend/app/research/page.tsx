'use client'

import { motion } from 'framer-motion'
import { FaGraduationCap, FaSearch, FaBookOpen, FaLightbulb } from 'react-icons/fa'
import { config } from '@/lib/config'

export default function ResearchPage() {
  return (
    <div className="min-h-screen p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">마켓 리서치</h1>
          <p className="text-gray-400">심층 분석과 투자 인사이트</p>
        </div>

        {/* 준비 중 안내 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: config.decimals.value2 }}
          className="glass-card p-12 text-center"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <FaGraduationCap className="text-6xl text-yellow-500" />
          </motion.div>
          
          <h2 className="text-3xl font-bold mb-4 gradient-text">마켓 리서치 센터 준비 중</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            전문가 수준의 시장 분석과 투자 리포트를 제공할 
            리서치 센터를 준비하고 있습니다.
          </p>

          {/* 예정 기능 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaSearch className="text-3xl text-purple-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">심층 분석</h3>
              <p className="text-sm text-gray-500">
                코인별 펀더멘털 & 기술적 분석
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaBookOpen className="text-3xl text-blue-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">리서치 리포트</h3>
              <p className="text-sm text-gray-500">
                주간/월간 시장 분석 리포트
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <FaLightbulb className="text-3xl text-yellow-500 mb-3 mx-auto" />
              <h3 className="text-lg font-bold mb-2">투자 아이디어</h3>
              <p className="text-sm text-gray-500">
                AI 기반 투자 기회 발굴
              </p>
            </motion.div>
          </div>

          {/* 출시 예정 */}
          <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-yellow-600/20 rounded-full border border-yellow-500/30">
            <span className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full"></span>
            <span className="text-yellow-400 font-medium">개발 진행 중</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}