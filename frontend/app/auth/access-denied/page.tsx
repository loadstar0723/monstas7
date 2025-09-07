'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaLock, FaArrowLeft, FaUpload } from 'react-icons/fa'
import { config } from '@/lib/config'

export default function AccessDeniedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto p-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* 아이콘 */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <FaLock className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          {/* 제목 */}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            접근 권한 없음
          </h1>

          {/* 설명 */}
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            이 페이지에 접근할 수 있는 권한이 없습니다.
            <br />
            더 높은 등급이 필요하거나 관리자 승인이 필요할 수 있습니다.
          </p>

          {/* 등급 업그레이드 안내 */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
              더 많은 기능을 이용하려면?
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-400 mb-3">
              상위 등급으로 업그레이드하여 모든 기능을 이용하세요
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: config.decimals.value98 }}
              onClick={() => router.push('/subscription/upgrade')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <FaUpload className="w-4 h-4" />
              업그레이드하기
            </motion.button>
          </div>

          {/* 액션 버튼들 */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: config.decimals.value98 }}
              onClick={() => router.back()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
              이전 페이지로
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: config.decimals.value98 }}
              onClick={() => router.push('/dashboard')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              대시보드로 이동
            </motion.button>
          </div>

          {/* 도움말 */}
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            문제가 계속되면{' '}
            <a href="/support" className="text-purple-600 dark:text-purple-400 hover:underline">
              고객지원
            </a>
            에 문의하세요
          </p>
        </div>
      </motion.div>
    </div>
  )
}