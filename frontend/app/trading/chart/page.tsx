'use client'

import { motion } from 'framer-motion'
import { FaChartLine, FaExpand, FaCog, FaDownload } from 'react-icons/fa'

export default function TradingChartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container-fluid px-4 py-6">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FaChartLine className="text-blue-400" />
              실시간 차트
            </h1>
          </div>
          <div className="flex gap-3">
            <button className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition">
              <FaExpand />
            </button>
            <button className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition">
              <FaCog />
            </button>
            <button className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition">
              <FaDownload />
            </button>
          </div>
        </motion.div>

        {/* 심볼 선택 & 시간대 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex flex-wrap gap-4 items-center bg-gray-800/50 p-4 rounded-lg"
        >
          <select className="bg-gray-900 px-4 py-2 rounded border border-gray-700 focus:border-blue-500 outline-none">
            <option>BTC/USDT</option>
            <option>ETH/USDT</option>
            <option>BNB/USDT</option>
          </select>
          
          <div className="flex gap-2">
            {['1m', '5m', '15m', '1h', '4h', '1D', '1W'].map((tf) => (
              <button
                key={tf}
                className="px-3 py-1 bg-gray-900 rounded hover:bg-blue-600 transition text-sm"
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="ml-auto flex gap-4 text-sm">
            <span>O: <span className="text-green-400">43,250</span></span>
            <span>H: <span className="text-green-400">43,580</span></span>
            <span>L: <span className="text-red-400">42,900</span></span>
            <span>C: <span className="text-green-400">43,420</span></span>
            <span>V: <span className="text-gray-400">1.2B</span></span>
          </div>
        </motion.div>

        {/* 메인 차트 영역 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 rounded-xl border border-gray-700 p-4"
          style={{ height: 'calc(100vh - 250px)' }}
        >
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FaChartLine className="text-6xl mb-4 mx-auto opacity-50" />
              <p className="text-xl mb-2">TradingView 차트가 여기에 표시됩니다</p>
              <p className="text-sm">실시간 차트, 100+ 지표, 드로잉 도구</p>
            </div>
          </div>
        </motion.div>

        {/* 하단 도구 모음 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex justify-between items-center"
        >
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition">
              지표
            </button>
            <button className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition">
              템플릿
            </button>
            <button className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition">
              알림
            </button>
          </div>
          <div className="text-sm text-gray-400">
            FREE 플랜: 1분, 5분 차트만 이용 가능
          </div>
        </motion.div>
      </div>
    </div>
  )
}