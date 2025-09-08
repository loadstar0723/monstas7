'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaUserSecret, FaExchangeAlt, FaBuilding, FaBrain, 
  FaChartLine, FaBell
} from 'react-icons/fa'

export default function InsiderFlowSimple() {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // 간단한 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">내부자 거래 추적 시스템 로딩 중...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            내부자 거래 추적 (Simple)
          </h1>
          <p className="text-gray-400 mt-2">
            팀, 기관, 스마트머니의 실시간 움직임을 포착합니다
          </p>
        </motion.div>
        
        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
          >
            <FaExchangeAlt className="text-blue-400 text-3xl mb-3" />
            <h3 className="text-lg font-bold mb-2">거래소 흐름</h3>
            <p className="text-gray-400 text-sm">
              대규모 입출금 모니터링
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
          >
            <FaUserSecret className="text-yellow-400 text-3xl mb-3" />
            <h3 className="text-lg font-bold mb-2">팀/재단</h3>
            <p className="text-gray-400 text-sm">
              팀 지갑 움직임 추적
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
          >
            <FaBuilding className="text-purple-400 text-3xl mb-3" />
            <h3 className="text-lg font-bold mb-2">기관</h3>
            <p className="text-gray-400 text-sm">
              기관 보유량 변화 분석
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
          >
            <FaBrain className="text-green-400 text-3xl mb-3" />
            <h3 className="text-lg font-bold mb-2">스마트 머니</h3>
            <p className="text-gray-400 text-sm">
              고수익 지갑 패턴
            </p>
          </motion.div>
        </div>
        
        {/* 상태 메시지 */}
        <div className="mt-8 p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <FaBell className="text-yellow-400 text-xl" />
            <p className="text-yellow-300">
              실시간 데이터 연결 준비 중... 곧 전체 기능이 활성화됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}